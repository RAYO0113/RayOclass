(function () {
  'use strict';
  /* ── V215（老師 11/6）浮動加分盤：邊投影邊快速 ±1，不開成績大視窗、不蓋住課文 ──
     ・畫面角落一顆 ⭐（可拖到任何位置，記在本裝置）；點一下展開小盤，再點 ⭐／✕ 收起；15 秒沒動作自動收起
     ・小盤＝依「座位表」排的迷你座位（講台在下）；也可切成座號方格
     ・點座號＝目前模式（＋1 或 −1）；長按座號＝反過來（加分模式下長按＝扣 1 分，原因用目前選的）
     ・鍵盤（小盤打開時）：打座號再按 ＋／− 或 Enter（Enter＝目前模式）；Backspace 改號碼；Esc 收起
     ・班級：上課節次內自動用課表那班；不在節次內用成績系統目前選的班，可在小盤切換
     ・資料、復原都和成績系統「⭐ 課堂加減分」共用（V106GR.qp，119 提供）；沒登入時點 🔒 打開登入 */
  var POS_K = 'qp_pos_v1', VIEW_K = 'qp_view_v1', HIDE_MS = 15000;
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function Q() { return window.V106GR && V106GR.qp; }

  var st = { open: false, mode: '+', reason: '', cls: '', pickCls: false, typed: '', last: '', lastErr: false, view: get(VIEW_K, 'seat') };
  var fab, pad, hideT = 0;

  function build() {
    if (fab || !Q()) return;
    fab = document.createElement('button'); fab.type = 'button'; fab.id = 'qp-fab'; fab.title = '課堂加減分（可拖曳）'; fab.innerHTML = '⭐';
    pad = document.createElement('div'); pad.id = 'qp-pad';
    document.body.appendChild(pad); document.body.appendChild(fab);
    place();
    fabDrag();
    pad.addEventListener('click', onClick);
    pad.addEventListener('pointerdown', onDown);
    pad.addEventListener('pointerup', onUp);
    pad.addEventListener('pointercancel', cancelPress);
    pad.addEventListener('pointerleave', cancelPress);
    pad.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    pad.addEventListener('change', function (e) { if (e.target.id === 'qp-cls') { st.cls = e.target.value; st.pickCls = true; render(); poke(); } });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('v106gr-data', function () { if (st.open) render(); });
    window.addEventListener('resize', place);
  }

  /* ── ⭐ 位置：存成畫面比例，換解析度（投影機／iPad）也不會跑出畫面 ── */
  function place() {
    var p = get(POS_K, { x: 0.01, y: 0.62 }), w = innerWidth, h = innerHeight, s = 52;
    var x = Math.max(4, Math.min(w - s - 4, p.x * w)), y = Math.max(4, Math.min(h - s - 4, p.y * h));
    fab.style.left = x + 'px'; fab.style.top = y + 'px';
    if (st.open) placePad();
  }
  function placePad() {
    var r = fab.getBoundingClientRect(), pw = pad.offsetWidth, ph = pad.offsetHeight, w = innerWidth, h = innerHeight;
    var x = r.left + r.width / 2 < w / 2 ? r.right + 6 : r.left - pw - 6;   /* 往畫面中間那一側展開 */
    if (x < 4 || x + pw > w - 4) x = Math.max(4, Math.min(w - pw - 4, r.left));
    var y = Math.max(4, Math.min(h - ph - 4, r.top + r.height / 2 - ph / 2));
    pad.style.left = x + 'px'; pad.style.top = y + 'px';
  }
  function fabDrag() {
    var d = null;
    fab.addEventListener('pointerdown', function (e) { d = { x: e.clientX, y: e.clientY, l: fab.offsetLeft, t: fab.offsetTop, moved: false }; fab.setPointerCapture(e.pointerId); });
    fab.addEventListener('pointermove', function (e) {
      if (!d) return; var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      d.moved = true; e.preventDefault();
      fab.style.left = Math.max(4, Math.min(innerWidth - 56, d.l + dx)) + 'px'; fab.style.top = Math.max(4, Math.min(innerHeight - 56, d.t + dy)) + 'px';
      if (st.open) placePad();
    });
    fab.addEventListener('pointerup', function () {
      if (!d) return; var m = d.moved; d = null;
      if (m) { put(POS_K, { x: fab.offsetLeft / innerWidth, y: fab.offsetTop / innerHeight }); return; }
      toggle();
    });
    fab.addEventListener('pointercancel', function () { d = null; });
  }

  function toggle(v) {
    st.open = v == null ? !st.open : v;
    pad.classList.toggle('open', st.open); fab.classList.toggle('on', st.open);
    st.typed = '';
    if (st.open) {
      if (!st.pickCls) st.cls = '';
      var q = Q(); if (!q.ready() && !q.loading()) q.load(false);
      render(); poke();
    } else clearTimeout(hideT);
  }
  function poke() { clearTimeout(hideT); hideT = setTimeout(function () { if (st.open && !pressT) toggle(false); }, HIDE_MS); }   /* 沒動作 15 秒自動收起 */

  function curCls() {
    var q = Q(), list = q.classes();
    if (st.cls && list.indexOf(st.cls) >= 0) return st.cls;
    st.pickCls = false;
    return q.curCls() || q.cls() || list[0] || '';
  }

  function render() {
    var q = Q(); if (!q || !pad) return;
    var cls = curCls(), auto = !st.pickCls && q.curCls() === cls && cls;
    if (!st.reason) st.reason = q.reasons[0];
    var h = '<div class="qp-top">' +
      '<select id="qp-cls" title="班級">' + q.classes().map(function (c) { return '<option' + (c === cls ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
      (auto ? '<span class="qp-auto" title="依課表自動選這節的班">本節</span>' : '') +
      '<span class="qp-sp"></span>' +
      '<button data-q="undo" title="復原上一筆"' + (q.canUndo() ? '' : ' disabled') + '>↶</button>' +
      '<button data-q="view" title="切換座位表／座號方格">' + (st.view === 'seat' ? '#' : '▦') + '</button>' +
      '<button data-q="full" title="打開完整的課堂加減分">⤢</button>' +
      '<button data-q="x" title="收起">✕</button></div>';
    h += '<div class="qp-mode"><button data-q="m+" class="p' + (st.mode === '+' ? ' on' : '') + '">＋1</button><button data-q="m-" class="m' + (st.mode === '-' ? ' on' : '') + '">−1</button></div>';
    if (st.mode === '-') h += '<div class="qp-rs">' + q.reasons.map(function (r) { return '<button data-q="r|' + esc(r) + '"' + (st.reason === r ? ' class="on"' : '') + '>' + esc(r) + '</button>'; }).join('') + '</div>';
    if (!q.ready()) h += '<div class="qp-msg">' + (q.err() ? esc(q.err()) + '<br><button data-q="reload">重試</button>' : '讀取中…') + '</div>';
    else if (!q.canWrite()) h += '<div class="qp-msg">加減分要先登入<br><button data-q="login">🔒 登入</button></div>';
    else {
      var seats = q.roster(cls), tot = q.totals(cls);
      if (!seats.length) h += '<div class="qp-msg">這班還沒有學生名單</div>';
      else h += st.view === 'seat' ? seatGrid(q, cls, seats, tot) : numGrid(seats, tot);
    }
    h += '<div class="qp-st' + (st.lastErr ? ' err' : '') + '">' + (st.typed ? '⌨ <b>' + esc(st.typed) + '</b> 號 → 按 ＋／− 或 Enter' : esc(st.last) || '長按＝' + (st.mode === '+' ? '扣' : '加') + '分') + '</div>';
    pad.innerHTML = h;
    pad.classList.toggle('minus', st.mode === '-');
    placePad();
  }
  function cell(n, t) {
    return '<button class="qp-c" data-seat="' + n + '">' + n + (t ? '<i class="' + (t > 0 ? 'p' : 'm') + '">' + (t > 0 ? '+' : '') + t + '</i>' : '') + '</button>';
  }
  function seatGrid(q, cls, seats, tot) {
    var L = q.layout(cls), on = {}, placed = {}, h = '';
    seats.forEach(function (s) { on[s] = 1; });
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var n = (L.grid[r] || [])[c] || 0;
      if (n && on[n]) { placed[n] = 1; h += cell(n, tot[n]); } else h += '<span class="qp-e"></span>';
    }
    var rest = seats.filter(function (s) { return !placed[s]; });
    return '<div class="qp-g" style="grid-template-columns:repeat(' + L.cols + ',1fr)">' + h + '</div><div class="qp-pod">講台</div>' +
      (rest.length ? '<div class="qp-g qp-rest">' + rest.map(function (s) { return cell(s, tot[s]); }).join('') + '</div>' : '');
  }
  function numGrid(seats, tot) {
    return '<div class="qp-g" style="grid-template-columns:repeat(7,1fr)">' + seats.map(function (s) { return cell(s, tot[s]); }).join('') + '</div>';
  }

  /* ── 點／長按 ── */
  var pressT = 0, pressEl = null, longDone = false;
  function onDown(e) {
    poke();
    var b = e.target.closest && e.target.closest('.qp-c'); if (!b) return;
    pressEl = b; longDone = false;
    clearTimeout(pressT);
    pressT = setTimeout(function () { pressT = 0; longDone = true; give(+b.getAttribute('data-seat'), st.mode === '+' ? -1 : 1, b); }, 550);
  }
  function onUp(e) {
    var b = e.target.closest && e.target.closest('.qp-c');
    if (pressT) { clearTimeout(pressT); pressT = 0; if (b && b === pressEl && !longDone) give(+b.getAttribute('data-seat'), st.mode === '+' ? 1 : -1, b); }
    pressEl = null;
  }
  function cancelPress() { if (pressT) { clearTimeout(pressT); pressT = 0; } pressEl = null; }

  function give(seat, d, btn) {
    var q = Q(), cls = curCls(); if (!q || !q.canWrite() || !seat) return;
    if (q.roster(cls).indexOf(seat) < 0) { st.last = cls + ' 沒有 ' + seat + ' 號'; st.lastErr = true; render(); return; }
    fly(btn || pad.querySelector('.qp-c[data-seat="' + seat + '"]'), d);
    st.last = seat + '號 ' + (d > 0 ? '+1' : '−1' + '（' + st.reason + '）') + ' 儲存中…'; st.lastErr = false;
    q.add(cls, seat, d, st.reason).then(function () {
      if (st.last.indexOf(seat + '號') === 0) st.last = '✓ ' + seat + '號 ' + (d > 0 ? '+1' : '−1（' + st.reason + '）');
      render();
    }, function () { st.last = '⚠ ' + seat + '號沒存到，請再按一次'; st.lastErr = true; render(); });
    render(); poke();
  }
  function fly(btn, d) {
    if (!btn) return;
    var r = btn.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'qp-fly ' + (d > 0 ? 'p' : 'm'); f.textContent = d > 0 ? '+1' : '−1';
    f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = r.top + 'px';
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 900);
  }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-q]'); poke(); if (!b) return;
    var a = b.getAttribute('data-q'), q = Q();
    if (a === 'x') toggle(false);
    else if (a === 'm+' || a === 'm-') { st.mode = a.charAt(1); render(); }
    else if (a.indexOf('r|') === 0) { st.reason = a.slice(2); render(); }
    else if (a === 'view') { st.view = st.view === 'seat' ? 'num' : 'seat'; put(VIEW_K, st.view); render(); }
    else if (a === 'undo') { st.last = '復原中…'; render(); q.undo().then(function (p) { st.last = p ? '↶ 已復原 ' + p.seat + '號 ' + (p.delta > 0 ? '+1' : '−1') : ''; st.lastErr = false; render(); }); }
    else if (a === 'full' || a === 'login') { toggle(false); q.open('pts'); }
    else if (a === 'reload') { q.load(true); render(); }
  }

  /* ── 鍵盤：小盤打開時才接；打字框裡不攔 ── */
  function onKey(e) {
    if (!st.open || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    var gr = document.getElementById('v106-gr'); if (gr && gr.classList.contains('open')) return;
    var k = e.key, hit = true;
    if (/^[0-9]$/.test(k)) st.typed = (st.typed + k).slice(-2);
    else if (k === 'Backspace') st.typed = st.typed.slice(0, -1);
    else if (k === '+' || k === '=' || k === '-' || k === '_' || k === 'Enter') {
      if (!st.typed) { if (k !== 'Enter') { st.mode = (k === '-' || k === '_') ? '-' : '+'; } else hit = false; }
      else { var n = +st.typed; st.typed = ''; give(n, k === 'Enter' ? (st.mode === '+' ? 1 : -1) : (k === '-' || k === '_') ? -1 : 1); }
    } else if (k === 'Escape') { toggle(false); }
    else hit = false;
    if (!hit) return;
    e.preventDefault(); e.stopPropagation();
    if (st.open) { render(); poke(); }
  }

  function start() { if (Q()) build(); else setTimeout(start, 500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.V215QP = { toggle: function (v) { if (fab) toggle(v); }, state: function () { return st; } };   /* 測試用 */
})();
