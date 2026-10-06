/* 教學進度（老師專用，2026-10-06）
   - 資料：localStorage 'plan_v1'＝{ v:1, cls:{ 班名:{ start, until, items:[{id,t,q}], log:{ '日期|節':{s,n,at} } } } }
     items＝依序要上的項目（一項＝一節；q＝這節課前第幾次小考）；日期不寫死，由課表推算。
     log＝老師標記的例外：ok 照預定上完、part 沒上完（下節繼續）、more 多上完 n 項、skip 這節沒上課。沒標記的過去節次視為照預定上完。
   - 可用節次＝課表（tp_schedule_v1，否則預設課表）＋調課（tp_override_v1）－學校行事的放假／段考日（V101）。
   - 學生看不到：學生端 Apps Script（stuGet）只讀 exam_cal_v1、nq-records-v1；學生筆記版也不含本程式。
   - 雲端同步：v107 KEYS 加 'plan_v1'（舊站不認得這個鍵，下載時會略過，不會覆寫）。
   - 自動判斷（老師 10/6）：課文項目記 les（課名）＋to（預定上到第幾句，ord 同 V82）。節次過了、老師沒手動標記時，
     讀 V82 該節紀錄（tp_hist_v1，或仍在暫存的 tp_live_v1）該課「最後停的位置」：未到 to → 沒上完；超過下一個課文項目的 to → 多上；
     其餘 → 上完。這節沒開這課 → 照預定。手動標記永遠優先。
   - 顯示：日曆格子（淡色虛線）＋日曆右側「教學進度」＋「📘 教學進度表」編輯視窗＋班級進度面板（待確認、接下來、排不下警示）。 */
(function () {
  'use strict';
  var K = 'plan_v1', SHOW = 'plan_show_v1';
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];   /* 同 v98 四班顏色 */
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];
  /* 範本：115-1 第一次段考後～第二次段考前（老師 10/6 定）；小考在上課前考 */
  var LY = '論語選—子路曾皙冉有公西華侍坐', HC = '臺灣最美麗的火車線';
  var TEMPLATES = [{
    name: '115-1 一段後～二段前（論語・火車線・樂府）', start: '2026-10-19', until: '2026-11-23',
    items: [['作文檢討'], ['論語① 孔子與儒家'], ['論語② 課文', 1, LY], ['論語③ 課文', 2, LY], ['論語④ 課文', 3, LY],
      ['論語 習作（交換改＋檢討）'], ['論語 A卷'], ['論語 A卷檢討'],
      ['火車線① 課文', 0, HC], ['火車線② 課文', 0, HC], ['火車線 習作（交換改＋檢討）'], ['火車線 A卷'], ['火車線 A卷檢討'],
      ['樂府① 詩的流變'], ['樂府② 長干行', 1], ['樂府③ 長干行', 2], ['樂府④ 長干行', 3],   /* 長干行課文資料建好後再補課名 */
      ['樂府 習作（交換改＋檢討）'], ['樂府 A卷'], ['樂府 A卷檢討']]
  }];
  var MARK = { ok: '✓ 照預定', part: '⏸ 沒上完', more: '⏭ 多上', skip: '🚫 沒上課' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function toMin(t) { var a = String(t).split(':'); return (+a[0]) * 60 + (+a[1]); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function short(c) { return String(c).replace('一', ''); }
  function now() {   /* 與 V82 相同：測試時可用 sessionStorage v82FakeNow 模擬時間 */
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function shown() { return get(SHOW, '1') !== '0'; }

  /* ── 資料 ── */
  function load() { var p = get(K, null); if (!p || typeof p !== 'object' || !p.cls) p = { v: 1, cls: {} }; return p; }
  function save(p) { return put(K, p); }
  function plan(p, c) { var x = p.cls[c]; if (!x) return null; if (!Array.isArray(x.items)) x.items = []; if (!x.log || typeof x.log !== 'object') x.log = {}; return x; }

  /* ── 可用節次 ── */
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.filter(function (x) { return x.normal !== false; }).map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  function dayOff(ds) {
    try { return !!(window.V101 && V101.eventsOn(ds).some(function (e) { return e.c === 'off' || e.c === 'exam'; })); } catch (e) { return false; }
  }
  /* 某班 from～to 之間的節次（含調課）：[{key,date,p,manual}] */
  function slots(c, from, to) {
    var S = sched(), ovr = get('tp_override_v1', {}) || {}, out = [];
    for (var d = parse(from), end = parse(to); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      var ds = ymd(d), wd = d.getDay();
      if (dayOff(ds)) continue;
      S.periods.forEach(function (P) {
        var key = ds + '|' + P.p, sl = S.slots.filter(function (x) { return x[0] === wd && x[1] === P.p; })[0];
        var o = ovr[key], who = o && o.cls ? o.cls : (sl ? sl[2] : '');
        if (who === c) out.push({ key: key, date: ds, p: P.p, end: P.end, manual: !!(o && o.cls) });
      });
    }
    return out;
  }
  function slotPast(r) { var n = now(), t = ymd(n); return r.date < t || (r.date === t && n.getHours() * 60 + n.getMinutes() >= toMin(r.end || '23:59')); }

  /* ── 課文句子（ord 算法同 V82 firstOrd：該段第一頁之前的句數＋1＋句序） ── */
  var sentCache = {};
  function plainHead(t) {   /* 去標記同 V82 plain()：{n:號|字} 取字，其他 {x:字|注} 取字；可巢狀 */
    var s = String(t || '').replace(/<[^>]+>/g, ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/[‹›]/g, '').slice(0, 8);
  }
  function sentences(k) {
    if (sentCache[k]) return sentCache[k];
    var T = (typeof TEXTBOOK !== 'undefined' && TEXTBOOK[k]) || null, P = (T && T.textPages) || [], first = {}, n = 0, out = [], seen = {};
    P.forEach(function (pg) { if (!(pg.seg in first)) first[pg.seg] = n + 1; n += (pg.lines || []).length; });
    P.forEach(function (pg) { (pg.lines || []).forEach(function (L, li) {
      var o = first[pg.seg] + li; if (seen[o]) return; seen[o] = 1;
      out.push({ ord: o, seg: pg.seg, head: plainHead(L.text) });
    }); });
    out.sort(function (a, b) { return a.ord - b.ord; });
    return (sentCache[k] = out);
  }
  function textLessons() { var T = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK : {}; return Object.keys(T).filter(function (k) { return (T[k].textPages || []).length; }); }
  /* 某課的課文項目依段落平均分句（段落邊界取最接近 總句數×j/項數 的位置） */
  function autoSplit(items, k) {
    var idx = []; items.forEach(function (it, i) { if (it.les === k) idx.push(i); });
    var S = sentences(k); if (!idx.length || !S.length) return;
    var ends = [], tot = S[S.length - 1].ord, prev = 0;
    S.forEach(function (x, i) { if (i === S.length - 1 || S[i + 1].seg !== x.seg) ends.push(x.ord); });
    idx.forEach(function (ii, j) {
      if (j === idx.length - 1) { items[ii].to = tot; return; }
      var want = tot * (j + 1) / idx.length, best = null;
      ends.forEach(function (e) { if (e > prev && e < tot && (best === null || Math.abs(e - want) < Math.abs(best - want))) best = e; });
      items[ii].to = prev = best || Math.max(prev + 1, Math.min(tot, Math.round(want)));
    });
  }
  /* 該節實際上課紀錄中，某課「最後停的位置」（第幾句）；沒有紀錄或沒開這課 → null */
  function stopAt(c, s, k) {
    var parts = null, h = get('tp_hist_v1', []);
    if (Array.isArray(h)) h.forEach(function (x) { if (x && x.date === s.date && x.period === s.p && x.classId === c && x.parts && x.parts[k]) parts = x.parts; });
    if (!parts) { var lv = get('tp_live_v1', null); if (lv && lv.key === s.key && lv.classId === c && lv.parts && lv.parts[k]) parts = lv.parts; }
    if (!parts) return null;
    var pt = parts[k], a = pt.last && (pt.last.ord || pt.last.r), b = pt.max && (pt.max.ord || pt.max.r);
    return a || b || null;
  }
  /* 自動判斷：回傳 {s, n, stop, to} 或 null */
  function judge(x, c, s, i) {
    var it = x.items[i]; if (!it || !it.les || !it.to) return null;
    var st = stopAt(c, s, it.les); if (!st) return null;
    if (st < it.to) return { s: 'part', stop: st, to: it.to };
    var n = 0;
    for (var j = i + 1; j < x.items.length && x.items[j].les === it.les && x.items[j].to && st >= x.items[j].to; j++) n++;
    return { s: n ? 'more' : 'ok', n: n, stop: st, to: it.to };
  }

  /* ── 排進度：依序把項目放進節次；log 的例外改變放法 ──
     回傳 rows:[{key,date,p,manual,its:[項目索引],part,mark}]，left:[排不下的項目索引] */
  function place(x) {
    var rows = [], i = 0, n = x.items.length, seen = {};
    if (!x.start || !x.until) return { rows: rows, left: x.items.map(function (_, k) { return k; }) };
    slots(x.c, x.start, x.until).forEach(function (s) {
      var L = x.log[s.key] || null, r = { key: s.key, date: s.date, p: s.p, end: s.end, manual: s.manual, its: [], part: false, mark: L ? L.s : '' };
      if (!L && i < n && slotPast(s)) { var A = judge(x, x.c, s, i); if (A) { L = A; r.mark = A.s; r.auto = A; } }
      if (L && L.s === 'skip') { rows.push(r); return; }
      if (i >= n) { rows.push(r); return; }
      if (L && L.s === 'part') { r.its = [i]; r.part = true; }
      else if (L && L.s === 'more') { var m = Math.max(1, +L.n || 1); for (var j = 0; j <= m && i < n; j++) r.its.push(i++); }
      else r.its = [i++];
      r.cont = r.its.filter(function (k) { return seen[k]; });   /* 延續上一節的項目：小考已考過，不再標 */
      r.its.forEach(function (k) { seen[k] = 1; });
      rows.push(r);
    });
    var left = []; for (; i < n; i++) left.push(i);
    return { rows: rows, left: left };
  }
  function placed(c) { var p = load(), x = plan(p, c); if (!x) return null; x.c = c; var r = place(x); r.x = x; return r; }
  function itemText(it, cont) { return (it.q && !cont ? '📝小考' + it.q + '＋' : '') + it.t + (cont ? '（續）' : ''); }
  function isCont(r, k) { return !!(r.cont && r.cont.indexOf(k) >= 0); }

  /* ── 標記 ── */
  function mark(c, key, s) {
    var p = load(), x = plan(p, c); if (!x) return;
    var L = x.log[key];
    if (!s) delete x.log[key];
    else if (s === 'more') x.log[key] = { s: 'more', n: L && L.s === 'more' ? Math.min(5, (+L.n || 1) + 1) : 1, at: new Date().toISOString() };
    else x.log[key] = { s: s, at: new Date().toISOString() };
    save(p); refresh();
  }
  function refresh() {
    try { var m = document.getElementById('v98-cal'); if (m && m.classList.contains('open') && window.V98CAL) V98CAL.open(); } catch (e) {}
    try { var cp = document.getElementById('cls-panel'); if (cp && cp.classList.contains('open') && typeof clsRender === 'function') clsRender(); } catch (e) {}
    try { if (ed.open) renderEd(); } catch (e) {}
  }

  /* 某節的實際上課紀錄（V82 tp_hist_v1） */
  function actual(c, r) {
    var h = get('tp_hist_v1', []); if (!Array.isArray(h)) return '';
    return h.filter(function (x) { return x && x.date === r.date && x.period === r.p && x.classId === c; }).map(function (x) {
      return '《' + String(x.lessonId || '').replace(/^論語選—子路曾皙冉有公西華侍坐$/, '侍坐').replace(/^臺灣最美麗的火車線$/, '火車線') + '》';
    }).join('、');
  }
  function btns(c, r) {
    if (!r.its.length && r.mark !== 'skip') return '';
    var a = [['ok', '✓ 上完'], ['part', '⏸ 沒上完'], ['more', '⏭ 多上一項'], ['skip', '🚫 沒上課']];
    return '<span class="v114-bt">' + a.map(function (b) {
      return '<button type="button" class="' + (r.mark === b[0] ? (r.auto ? 'on auto' : 'on') : '') + '" data-v114="mk|' + esc(c) + '|' + r.key + '|' + b[0] + '">' + b[1] + '</button>';
    }).join('') + (r.mark && !r.auto ? '<button type="button" class="v114-undo" data-v114="mk|' + esc(c) + '|' + r.key + '|" title="取消標記">↺</button>' : '') + '</span>';
  }
  function rowText(x, r) {
    if (r.mark === 'skip') return '<s>（這節沒上課）</s>';
    if (!r.its.length) return '<span class="v114-mut">（進度已排完）</span>';
    return r.its.map(function (k) { return esc(itemText(x.items[k], isCont(r, k))); }).join('＋') + (r.part ? '<em>（沒上完，下節繼續）</em>' : '');
  }
  function markTag(r) {
    if (r.auto) return '<span class="v114-mk auto">🤖 停在第' + r.auto.stop + '句（預定第' + r.auto.to + '句）→ ' + (r.auto.s === 'part' ? '沒上完' : r.auto.s === 'more' ? '多上 ' + r.auto.n + ' 項' : '上完') + '</span>';
    return r.mark && r.mark !== 'skip' ? '<span class="v114-mk">' + (r.mark === 'more' ? '⏭ 多上' : MARK[r.mark]) + '</span>' : '';
  }

  /* ── 日曆裝飾 ── */
  var busy = false;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? (c.getAttribute('data-v98') || '').slice(2) : ''; }
  function byDate() {
    var m = {}, f = get('exam_cal_cls_v1', '');
    classes().forEach(function (c) {
      if (f && f !== c) return;
      var P = placed(c); if (!P) return;
      P.rows.forEach(function (r) { (m[r.date] = m[r.date] || []).push({ c: c, r: r, x: P.x }); });
    });
    Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return a.r.p - b.r.p; }); });
    return m;
  }
  function deco() {
    if (busy) return; busy = true;
    try {
      var box = document.querySelector('#v98-cal .v98-box'); if (!box) return;
      var top = box.querySelector('.v98-top');
      if (top && !top.querySelector('.v114-tb')) {
        var sp = top.querySelector('.v98-sp');
        var html = '<button type="button" class="v114-tb" data-v114="ed">📘 教學進度表</button>' +
          '<label class="v114-tb v114-sw"><input type="checkbox" data-v114="show"' + (shown() ? ' checked' : '') + '> 顯示進度</label>';
        if (sp) sp.insertAdjacentHTML('beforebegin', html); else top.insertAdjacentHTML('beforeend', html);
      }
      if (!shown()) return;
      var cells = document.querySelectorAll('#v98-cal .v98-d:not([data-v114])');
      var m = cells.length || !document.querySelector('#v98-cal .v114-day') ? byDate() : null;
      cells.forEach(function (cell) {
        cell.setAttribute('data-v114', '1');
        var ds = (cell.getAttribute('data-v98') || '').slice(2), a = m[ds]; if (!a) return;
        var f = get('exam_cal_cls_v1', '');
        cell.insertAdjacentHTML('beforeend', a.map(function (o) {
          var r = o.r, tx = r.mark === 'skip' ? '（沒上課）' : r.its.map(function (k) { var it = o.x.items[k], ct = isCont(r, k); return (it.q && !ct ? '📝' : '') + it.t + (ct ? '（續）' : ''); }).join('＋');
          if (!tx) return '';
          return '<div class="v114-pill' + (r.mark === 'skip' ? ' sk' : '') + (r.part ? ' pt' : '') + '" style="border-color:' + ccol(o.c) + '" title="' + esc(o.c + ' 第' + r.p + '節・' + tx) + '">' +
            (f ? '' : esc(short(o.c)) + ' ') + esc(tx) + '</div>';
        }).join(''));
      });
      var edEl = document.querySelector('#v98-cal .v98-ed'), sd = selDate();
      if (edEl && sd && !edEl.querySelector('.v114-day')) {
        var a = (m || byDate())[sd] || [];
        edEl.insertAdjacentHTML('beforeend', '<div class="v114-day"><h5>📘 教學進度（只有老師看得到）</h5>' + (a.length ? a.map(function (o) {
          var act = actual(o.c, o.r);
          return '<div class="v114-r"><div><span class="v98-tg" style="background:' + ccol(o.c) + '">' + esc(o.c) + '</span> 第' + o.r.p + '節' +
            (o.r.manual ? '<span class="v114-tag">調課</span>' : '') + ' ' + rowText(o.x, o.r) + markTag(o.r) + '</div>' +
            (act ? '<div class="v114-act">實際紀錄：' + esc(act) + '</div>' : '') + btns(o.c, o.r) + '</div>';
        }).join('') : '<div class="v98-hint">這天沒有排教學進度。</div>') + '</div>');
      }
    } catch (e) { setTimeout(function () { throw e; }); } finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var m = document.getElementById('v98-cal'); if (!m) return;
    if (!m.__v114) {
      m.__v114 = 1; mo.observe(m, { childList: true, subtree: true });
      m.addEventListener('click', onClick);
      m.addEventListener('change', function (e) { if (e.target.getAttribute && e.target.getAttribute('data-v114') === 'show') { put(SHOW, e.target.checked ? '1' : '0'); V98CAL.open(); } });
    }
    deco();
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-v114]'); if (!b) return;
    var a = b.getAttribute('data-v114').split('|');
    if (a[0] === 'mk') { e.stopPropagation(); mark(a[1], a[2] + '|' + a[3], a[4]); }
    else if (a[0] === 'ed') { e.stopPropagation(); openEd(); }
  }

  /* ── 班級進度面板：待確認、接下來、排不下 ── */
  function renderCls() {
    var panel = document.getElementById('cls-panel'); if (!panel || typeof clsCur === 'undefined') return;
    var el = document.getElementById('v114-cls');
    if (!el) {
      el = document.createElement('div'); el.id = 'v114-cls';
      el.addEventListener('click', onClick);
      var tabs = document.getElementById('cls-tabs');
      if (tabs) tabs.parentNode.insertBefore(el, tabs.nextSibling); else panel.appendChild(el);
    }
    var c = clsCur, P = placed(c);
    var h = '<div class="v114-h">' + esc(c) + '・📘 教學進度<button type="button" data-v114="ed">編輯進度表</button></div>';
    if (!P || !P.x.items.length) { el.innerHTML = h + '<div class="v114-mut">還沒有進度表。按「編輯進度表」可套用範本。</div>'; return; }
    var t = ymd(now()), from = ymd(new Date(now().getTime() - 14 * 864e5));
    var pend = P.rows.filter(function (r) { return r.date >= from && slotPast(r) && (!r.mark || r.auto) && r.its.length; });
    var next = P.rows.filter(function (r) { return !slotPast(r); }).slice(0, 4);
    if (P.left.length) h += '<div class="v114-warn">⚠ 排不下 ' + P.left.length + ' 項（到 ' + md(P.x.until) + ' 為止）：' +
      P.left.map(function (k) { return esc(P.x.items[k].t); }).join('、') + '</div>';
    if (pend.length) h += '<div class="v114-sub">上過的課，確認一下（沒按＝照預定上完；🤖＝依上課紀錄自動判斷，判斷錯了再按）</div>' + pend.map(function (r) {
      var act = actual(c, r);
      return '<div class="v114-r">' + md(r.date) + '（' + WD[parse(r.date).getDay()] + '）第' + r.p + '節　' + rowText(P.x, r) + markTag(r) +
        (act ? '<div class="v114-act">實際紀錄：' + esc(act) + '</div>' : '') + btns(c, r) + '</div>';
    }).join('');
    h += '<div class="v114-sub">接下來</div>' + (next.length ? next.map(function (r) {
      return '<div class="v114-r">' + (r.date === t ? '<b>今天</b> ' : '') + md(r.date) + '（' + WD[parse(r.date).getDay()] + '）第' + r.p + '節' +
        (r.manual ? '<span class="v114-tag">調課</span>' : '') + '　' + rowText(P.x, r) + markTag(r) +
        (r.mark === 'skip' ? btns(c, r) : '<span class="v114-bt"><button type="button" data-v114="mk|' + esc(c) + '|' + r.key + '|skip">🚫 這節不上</button></span>') + '</div>';
    }).join('') : '<div class="v114-mut">（之後沒有排定的節次）</div>');
    el.innerHTML = h;
  }
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { renderCls(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }

  /* ── 進度表編輯視窗 ── */
  var ed = { open: false, c: '' };
  function ensureEd() {
    var m = document.getElementById('v114-ed'); if (m) return m;
    m = document.createElement('div'); m.id = 'v114-ed'; m.innerHTML = '<div class="v114-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m) { closeEd(); return; }
      var b = e.target.closest && e.target.closest('[data-pe]'); if (!b) return;
      var a = b.getAttribute('data-pe').split('|'), p = load(), x = plan(p, ed.c), i = +a[1];
      if (a[0] === 'x') { closeEd(); return; }
      if (a[0] === 'c') { ed.c = a[1]; renderEd(); return; }
      if (a[0] === 'tpl') { applyTpl(+a[1]); return; }
      if (a[0] === 'copy') { copyFrom(a[1]); return; }
      if (!x) return;
      if (a[0] === 'split') lessonsIn(x.items).forEach(function (k) { autoSplit(x.items, k); });
      else if (a[0] === 'up' && i > 0) x.items.splice(i - 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'dn' && i < x.items.length - 1) x.items.splice(i + 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'ins') x.items.splice(i, 0, { id: uid(), t: '（新項目）' });
      else if (a[0] === 'add') x.items.push({ id: uid(), t: '（新項目）' });
      else if (a[0] === 'del') { if (!confirm('刪除「' + x.items[i].t + '」？後面的項目會往前補。')) return; x.items.splice(i, 1); }
      else return;
      save(p); renderEd(); refresh();
    });
    m.addEventListener('change', function (e) {
      var t = e.target, f = t.getAttribute && t.getAttribute('data-pf'); if (!f) return;
      var a = f.split('|'), p = load(), x = plan(p, ed.c);
      if (!x) { if (a[0] !== 'start' && a[0] !== 'until') return; x = p.cls[ed.c] = { start: '', until: '', items: [], log: {} }; }
      if (a[0] === 't') { var v = t.value.trim(); if (!v) { t.value = x.items[+a[1]].t; return; } x.items[+a[1]].t = v; }
      else if (a[0] === 'q') { if (t.value) x.items[+a[1]].q = +t.value; else delete x.items[+a[1]].q; }
      else if (a[0] === 'les') { var it = x.items[+a[1]]; if (t.value) { it.les = t.value; autoSplit(x.items, t.value); } else { delete it.les; delete it.to; } }
      else if (a[0] === 'to') { if (t.value) x.items[+a[1]].to = +t.value; }
      else if (a[0] === 'start' || a[0] === 'until') { if (!t.value) return; x[a[0]] = t.value; }
      save(p); renderEd(); refresh();
    });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeEd(); e.stopPropagation(); });
    return m;
  }
  function applyTpl(k) {
    var T = TEMPLATES[k], p = load(), x = plan(p, ed.c); if (!T) return;
    if (x && x.items.length && !confirm(ed.c + ' 已經有 ' + x.items.length + ' 項進度，套用範本會整份換掉（標記也會清除）。確定？')) return;
    var its = T.items.map(function (a) { var o = { id: uid(), t: a[0] }; if (a[1]) o.q = a[1]; if (a[2] && sentences(a[2]).length) o.les = a[2]; return o; });
    lessonsIn(its).forEach(function (k) { autoSplit(its, k); });
    p.cls[ed.c] = { start: T.start, until: T.until, log: {}, items: its };
    save(p); renderEd(); refresh();
  }
  function copyFrom(src) {
    var p = load(), s = plan(p, src); if (!s || src === ed.c) return;
    var x = plan(p, ed.c);
    if (x && x.items.length && !confirm('用 ' + src + ' 的進度表取代 ' + ed.c + ' 的？（' + ed.c + ' 的標記會清除）')) return;
    p.cls[ed.c] = { start: s.start, until: s.until, log: {}, items: s.items.map(function (it) { var o = { id: uid(), t: it.t }; if (it.q) o.q = it.q; if (it.les) { o.les = it.les; o.to = it.to; } return o; }) };
    save(p); renderEd(); refresh();
  }
  function lessonsIn(items) { var o = []; items.forEach(function (it) { if (it.les && o.indexOf(it.les) < 0) o.push(it.les); }); return o; }
  function shortLes(k) { return String(k).replace(/^論語選—子路曾皙冉有公西華侍坐$/, '侍坐').replace(/^臺灣最美麗的火車線$/, '火車線'); }
  function renderEd() {
    var m = ensureEd(), box = m.querySelector('.v114-box'), cs = classes();
    if (!ed.c || cs.indexOf(ed.c) < 0) ed.c = (typeof clsCur !== 'undefined' && clsCur) || cs[0];
    var P = placed(ed.c), x = P ? P.x : null, dates = {};
    if (P) P.rows.forEach(function (r) { r.its.forEach(function (k) {
      (dates[k] = dates[k] || []).push({ r: r, past: slotPast(r) });
    }); });
    var h = '<div class="v114-top"><h3>📘 教學進度表</h3><span class="v114-note">只有老師看得到（學生網站、學生日曆都不會出現）</span><span class="v98-sp"></span>' +
      '<button type="button" data-pe="x">✕ 關閉</button></div>';
    h += '<div class="v114-cls">' + cs.map(function (c) {
      return '<button type="button" data-pe="c|' + esc(c) + '"' + (c === ed.c ? ' class="on"' : '') + '><i style="background:' + ccol(c) + '"></i>' + esc(c) + '</button>';
    }).join('') + '</div>';
    h += '<div class="v114-bar">期間 <input type="date" data-pf="start" value="' + esc(x ? x.start : '') + '"> ～ <input type="date" data-pf="until" value="' + esc(x ? x.until : '') + '">' +
      '<button type="button" data-pe="split" title="每課的課文項目依段落平均分配句子">⚖ 課文依段落平均分</button>' +
      TEMPLATES.map(function (T, k) { return '<button type="button" data-pe="tpl|' + k + '">套用範本：' + esc(T.name) + '</button>'; }).join('') +
      '<span>從別班複製：</span>' + cs.filter(function (c) { return c !== ed.c; }).map(function (c) { return '<button type="button" data-pe="copy|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    if (!x || !x.items.length) h += '<div class="v114-list"><div class="v114-mut">' + esc(ed.c) + ' 還沒有進度表。可以套用範本、從別班複製，或按下面「＋ 新增一項」。</div>';
    else {
      if (P.left.length) h += '<div class="v114-warn">⚠ 有 ' + P.left.length + ' 項排不進 ' + md(x.until) + ' 以前的課。</div>';
      h += '<div class="v114-list"><div class="v114-hd"><span>#</span><span>預定</span><span>項目／課文範圍（設了才會自動判斷）</span><span>課前小考</span><span></span></div>';
      x.items.forEach(function (it, i) {
        var ds = dates[i] || [], done = ds.length && ds.every(function (o) { return o.past; }) && !(ds[ds.length - 1].r.part);
        var when = ds.length ? ds.map(function (o) { return md(o.r.date) + '（' + WD[parse(o.r.date).getDay()] + '）' + o.r.p + (o.r.part ? '⏸' : ''); }).join('、') : '<b class="v114-bad">排不下</b>';
        h += '<div class="v114-it' + (done ? ' done' : '') + '"><span>' + (i + 1) + '</span><span class="v114-when">' + when + '</span>' +
          '<span class="v114-tc"><input type="text" data-pf="t|' + i + '" value="' + esc(it.t) + '">' + rangeSel(x.items, i) + '</span>' +
          '<select data-pf="q|' + i + '"><option value="">—</option>' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (it.q === n ? ' selected' : '') + '>小考' + n + '</option>'; }).join('') + '</select>' +
          '<span class="v114-ops"><button type="button" data-pe="up|' + i + '" title="上移">↑</button><button type="button" data-pe="dn|' + i + '" title="下移">↓</button>' +
          '<button type="button" data-pe="ins|' + i + '" title="在這項前面插入">＋插入</button><button type="button" data-pe="del|' + i + '" title="刪除" class="v114-del">✕</button></span></div>';
      });
    }
    h += '<button type="button" class="v114-add" data-pe="add">＋ 新增一項</button>';
    h += '<div class="v114-help">一項＝一節課。日期由課表自動推算：放假、段考、調課、標記「沒上完／多上一項／沒上課」都會讓後面的項目自動順延或提前。灰色＝已經上過。</div></div>';
    box.innerHTML = h;
  }
  function rangeSel(items, i) {
    var it = items[i], h = '<span class="v114-rg"><select data-pf="les|' + i + '"><option value="">（不是課文）</option>' +
      textLessons().map(function (k) { return '<option value="' + esc(k) + '"' + (it.les === k ? ' selected' : '') + '>' + esc(shortLes(k)) + '</option>'; }).join('') + '</select>';
    if (it.les) {
      var prev = 0; for (var j = 0; j < i; j++) if (items[j].les === it.les && items[j].to) prev = items[j].to;
      h += ' 第' + (prev + 1) + '句～<select data-pf="to|' + i + '">' + (it.to ? '' : '<option value="">（選上到哪句）</option>') +
        sentences(it.les).filter(function (x) { return x.ord > prev; }).map(function (x) {
          return '<option value="' + x.ord + '"' + (it.to === x.ord ? ' selected' : '') + '>第' + x.ord + '句 ' + esc(x.seg) + '｜' + esc(x.head) + '</option>';
        }).join('') + '</select>';
    }
    return h + '</span>';
  }
  function openEd() { ed.open = true; ensureEd().classList.add('open'); renderEd(); }
  function closeEd() { ed.open = false; var m = document.getElementById('v114-ed'); if (m) m.classList.remove('open'); }

  /* ── 備份：匯出附帶 __plan；匯入時只補本機沒有的班，不覆蓋 ── */
  var exporting = false;
  if (typeof clsLoad === 'function' && typeof clsExport === 'function' && typeof clsSave === 'function') {
    var _l = clsLoad; clsLoad = function () { var d = _l.apply(this, arguments); if (exporting) d.__plan = load(); return d; };
    var _x = clsExport; clsExport = function () { exporting = true; try { return _x.apply(this, arguments); } finally { exporting = false; } };
    var _s = clsSave;
    clsSave = function (d) {
      if (d && d.__plan) {
        var inc = d.__plan; delete d.__plan;
        if (inc && inc.cls) { var p = load(), ch = false; Object.keys(inc.cls).forEach(function (c) { if (!p.cls[c]) { p.cls[c] = inc.cls[c]; ch = true; } }); if (ch) save(p); }
      }
      return _s.apply(this, arguments);
    };
  }

  window.V114PLAN = { data: load, place: function (c) { return placed(c); }, mark: mark, openEditor: openEd, templates: TEMPLATES };
})();
