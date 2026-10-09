/* 標記筆（2026-10-09 試做；需求見教學系統專案 docs/待辦/待辦_RayOclass新功能_20261005.md 第 3 項）
   - 跟投影「畫筆」分開：畫筆是隨手畫、不存；標記筆劃過文字會自動對齊到字，永久保留。
   - 開關：一般畫面「🖥 投影全螢幕」旁的「🖍 標記筆」；全螢幕上方那排的「🖍」。開著時下方出現色盤：紅、黃、藍、綠、本頁清除、完成。
   - 用法：開著時在課文上劃過去就標起來；點一下已標的字 → 跳出小框可換色或刪除。開著時畫面上的點字泡泡等暫時不會被觸發。
   - 存法：不存筆跡，存「課名＋第幾頁＋這頁的識別＋被標的文字＋前後各 8 字＋在本頁文字中的位置」；
     換字級、換螢幕、一般畫面／全螢幕都重新對齊。找不到原文的標記不亂標（之後可列成「失效標記」）。
   - 四班共用一套。【試做】暫存在本機 localStorage「hlmark_trial_v1」，還沒加入雲端同步（正式鍵名定案前先問老師）。
   - 畫面上用 <span class="hm-m"> 包住被標的字（只加背景、不改字寬與位置，不影響修辭框線等定位）。
   自帶 <style id="hlmark-css">，不改任何既有模組。 */
(function () {
  if (window.hmToggle) return;
  var KEY = 'hlmark_trial_v1';
  var COLORS = { r: '#e8746a', y: '#f5d533', b: '#6fa8e8', g: '#6cc48a' };
  var NAMES = { r: '紅', y: '黃', b: '藍', g: '綠' };
  var SKIP = 'rt,rp,sup,script,style,button,[role="button"],.hm-ui,[aria-hidden="true"],.tm-layer,.tm-par';   /* 按鈕文字（句意、翻譯…）不算 */
  var CTX = 8;
  var on = false, color = 'y', applying = false;

  /* ── 樣式 ── */
  var css = '.hm-m{border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}';
  Object.keys(COLORS).forEach(function (k) {
    var c = COLORS[k];
    css += '.hm-m[data-c="' + k + '"]{background:linear-gradient(transparent 38%,' + hexA(c, .55) + ' 38%,' + hexA(c, .55) + ' 92%,transparent 92%)}' +
      'body.dark-mode .hm-m[data-c="' + k + '"]{background:linear-gradient(transparent 38%,' + hexA(c, .38) + ' 38%,' + hexA(c, .38) + ' 92%,transparent 92%)}';
  });
  css +=
    'body.hm-on #wk-slide-area .wk-slide,body.hm-on #wkfs-body .wk-slide{touch-action:none;-webkit-user-select:none;user-select:none;cursor:text}' +
    '#hm-bar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9800;display:none;align-items:center;gap:8px;' +
      'padding:8px 12px;border-radius:28px;background:rgba(32,24,18,.88);box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
    'body.hm-on #hm-bar{display:flex}' +
    'body.hm-on.v56-proj-open #hm-bar{bottom:96px}' +
    '#hm-bar .hm-sw,#hm-pop .hm-sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0}' +
    '#hm-bar .hm-sw.on{border-color:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.4)}' +
    '#hm-bar .hm-tx,#hm-pop .hm-tx{font:inherit;font-size:14px;color:#fff;background:rgba(255,255,255,.14);border:0;border-radius:18px;padding:8px 12px;cursor:pointer;min-height:36px}' +
    '#hm-pv{position:fixed;inset:0;pointer-events:none;z-index:9790}' +
    '#hm-pv div{position:fixed;border-radius:2px;mix-blend-mode:multiply}' +
    'body.dark-mode #hm-pv div{mix-blend-mode:screen}' +
    '#hm-pop{position:fixed;z-index:9810;display:none;align-items:center;gap:6px;padding:6px 8px;border-radius:22px;background:rgba(32,24,18,.92);box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '#hm-pop .hm-sw{width:28px;height:28px}' +
    '.hm-btn.on{background:#c0392b !important;color:#fff !important;border-color:#c0392b !important}';
  var stEl = document.createElement('style'); stEl.id = 'hlmark-css'; stEl.textContent = css;
  document.head.appendChild(stEl);
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  /* ── 資料 ── */
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
  function curLesson() { return typeof wkKey !== 'undefined' ? String(wkKey || '') : ''; }
  function curIdx() { return typeof wkIdx !== 'undefined' ? wkIdx : -1; }
  function curSig() {
    try { var s = wkSlides[wkIdx] || {}; return String(s.type || '') + '|' + String(s.title || s.label || '').slice(0, 30); } catch (e) { return ''; }
  }
  function marksHere() {
    var L = curLesson(), i = curIdx(), sg = curSig();
    return load().filter(function (m) { return m.lesson === L && m.idx === i && m.sig === sg; });
  }

  /* ── 本頁文字模型：.wk-slide 內可見文字節點（不含注音、圈號、本模組介面） ── */
  function model(slide) {
    var nodes = [], s = '', w = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentElement;
      if (!p || p.closest(SKIP)) continue;
      if (!vis(p)) continue;                 /* 藏起來的翻譯、未展開的說明等不算 */
      nodes.push({ n: n, a: s.length }); s += n.data;
    }
    return { nodes: nodes, s: s };
  }
  function vis(el) {
    if (el.checkVisibility) return el.checkVisibility({ visibilityProperty: true, opacityProperty: false });
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function locate(md, m) {
    var s = md.s, best = -1, bs = -1, bd = 1e9, i = s.indexOf(m.text);
    while (i >= 0) {
      var sc = 0, pre = s.slice(Math.max(0, i - CTX), i), post = s.slice(i + m.text.length, i + m.text.length + CTX);
      for (var k = 1; k <= pre.length && k <= m.pre.length && pre.charAt(pre.length - k) === m.pre.charAt(m.pre.length - k); k++) sc++;
      for (k = 0; k < post.length && k < m.post.length && post.charAt(k) === m.post.charAt(k); k++) sc++;
      var d = Math.abs(i - m.off);
      if (sc > bs || (sc === bs && d < bd)) { best = i; bs = sc; bd = d; }
      i = s.indexOf(m.text, i + 1);
    }
    /* 前後文都對不上、而且很短（一兩個字）→ 寧可不標 */
    if (best >= 0 && bs === 0 && m.text.length <= 2 && (m.pre || m.post)) return -1;
    return best;
  }
  function wrapRange(md, a, b, m) {
    md.nodes.forEach(function (x) {
      var s0 = Math.max(a, x.a), e0 = Math.min(b, x.a + x.n.data.length);
      if (s0 >= e0) return;
      var node = x.n;
      if (e0 - x.a < node.data.length) node.splitText(e0 - x.a);
      if (s0 - x.a > 0) node = node.splitText(s0 - x.a);
      var sp = document.createElement('span'); sp.className = 'hm-m'; sp.dataset.id = m.id; sp.dataset.c = m.c;
      node.parentNode.insertBefore(sp, node); sp.appendChild(node);
    });
  }
  function slides() {
    return ['wk-slide-area', 'wkfs-body'].map(function (id) {
      var c = document.getElementById(id); return c && c.querySelector('.wk-slide');
    }).filter(Boolean);
  }
  function unwrapAll(slide, id) {
    slide.querySelectorAll(id ? '.hm-m[data-id="' + id + '"]' : '.hm-m').forEach(function (sp) {
      var p = sp.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, sp); p.removeChild(sp); p.normalize();
    });
  }
  function applySlide(slide) {
    applying = true;
    try {
      unwrapAll(slide);
      marksHere().forEach(function (m) {
        var md = model(slide), a = locate(md, m);
        if (a >= 0) wrapRange(md, a, a + m.text.length, m);
      });
      slide.dataset.hmDone = '1';
    } finally { setTimeout(function () { applying = false; }, 0); }
  }
  function applyAll() { slides().forEach(applySlide); }

  /* 換頁、全螢幕重畫（很多外掛會晚一點再改內容）→ 等安靜下來再套 */
  var tmr = 0;
  function schedule() { clearTimeout(tmr); tmr = setTimeout(function () { slides().forEach(function (sl) { if (!sl.dataset.hmDone || !sl.querySelector('.hm-m') && marksHere().length) applySlide(sl); }); }, 120); }
  function watch() {
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var c = document.getElementById(id); if (!c) return;
      new MutationObserver(function (list) {
        if (applying) return;
        for (var i = 0; i < list.length; i++) {
          var t = list[i].target;
          if (list[i].type === 'childList' && !(t.closest && t.closest('.hm-m'))) { schedule(); return; }
        }
      }).observe(c, { childList: true, subtree: true });
    });
  }

  /* ── 劃過去標記 ── */
  function activeSlideAt(el) {
    var sl = el && el.closest && el.closest('#wk-slide-area .wk-slide,#wkfs-body .wk-slide');
    return sl || null;
  }
  var drag = null, pv = null;
  function pvLayer() { if (!pv || !pv.isConnected) { pv = document.createElement('div'); pv.id = 'hm-pv'; pv.className = 'hm-ui'; document.body.appendChild(pv); } return pv; }
  function clearPv() { if (pv) pv.innerHTML = ''; }
  /* 逐字量位置（按下時量一次；劃線中版面不動）。不用瀏覽器的游標落點：有些課圈號、說明框會疊在字上，會抓錯字 */
  function measure(md) {
    var out = [], r = document.createRange();
    md.nodes.forEach(function (x) {
      for (var k = 0; k < x.n.data.length; k++) {
        if (/\s/.test(x.n.data.charAt(k))) continue;
        r.setStart(x.n, k); r.setEnd(x.n, k + 1);
        var q = r.getBoundingClientRect();
        if (q.width > 0 && q.height > 0) out.push({ i: x.a + k, l: q.left, r: q.right, t: q.top, b: q.bottom });
      }
    });
    return out;
  }
  /* 手指底下的字；沒有正好壓到字 → 同一行最近的字；都沒有 → -1 */
  function hit(cs, x, y) {
    var best = -1, bd = 1e9;
    for (var k = 0; k < cs.length; k++) {
      var c = cs[k];
      if (y < c.t || y > c.b) continue;
      var d = x < c.l ? c.l - x : x > c.r ? x - c.r : 0;
      if (d === 0) d = -1 / (1 + Math.abs(y - (c.t + c.b) / 2));     /* 疊在一起時取垂直中心最近的 */
      if (d < bd) { bd = d; best = c.i; }
    }
    return bd <= 40 ? best : -1;
  }
  function spanOf(md, i0, i1) {
    if (i0 < 0 || i1 < 0) return null;
    var a = Math.min(i0, i1), b = Math.max(i0, i1) + 1;
    while (a < b && /\s/.test(md.s.charAt(a))) a++;
    while (b > a && /\s/.test(md.s.charAt(b - 1))) b--;
    return b > a ? { md: md, a: a, b: b } : null;
  }
  function rangeOf(md, a, b) {
    var r = document.createRange(), sN = null, eN = null;
    md.nodes.forEach(function (x) {
      var L = x.n.data.length;
      if (!sN && a < x.a + L) { r.setStart(x.n, a - x.a); sN = 1; }
      if (!eN && b <= x.a + L) { r.setEnd(x.n, b - x.a); eN = 1; }
    });
    return sN && eN ? r : null;
  }
  function showPv(sp) {
    var L = pvLayer(); L.innerHTML = '';
    var r = sp && rangeOf(sp.md, sp.a, sp.b); if (!r) return;
    [].forEach.call(r.getClientRects(), function (q) {
      if (q.width < 1) return;
      var d = document.createElement('div');
      d.style.cssText = 'left:' + q.left + 'px;top:' + (q.top + q.height * .38) + 'px;width:' + q.width + 'px;height:' + (q.height * .54) + 'px;background:' + hexA(COLORS[color], .55);
      L.appendChild(d);
    });
  }

  function onDown(e) {
    if (!on || e.button > 0) return;
    if (e.target.closest && e.target.closest('.hm-ui,#hm-bar,#hm-pop')) return;
    var sl = activeSlideAt(e.target); if (!sl) return;
    hidePop();
    var md = model(sl), cs = measure(md);
    drag = { sl: sl, md: md, cs: cs, x: e.clientX, y: e.clientY, i0: hit(cs, e.clientX, e.clientY), moved: false, sp: null, tgt: e.target };
    e.preventDefault(); e.stopPropagation();
  }
  function onMove(e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) drag.moved = true;
    if (drag.moved) {
      if (drag.i0 < 0) drag.i0 = hit(drag.cs, e.clientX, e.clientY);    /* 從空白處開始劃 → 碰到第一個字當起點 */
      var i1 = hit(drag.cs, e.clientX, e.clientY);
      if (i1 >= 0) { drag.sp = spanOf(drag.md, drag.i0, i1); showPv(drag.sp); }
    }
    e.preventDefault(); e.stopPropagation();
  }
  function onUp(e) {
    if (!drag) return;
    var d = drag; drag = null; clearPv();
    e.preventDefault(); e.stopPropagation();
    if (!d.moved) {
      var hm = d.tgt.closest && d.tgt.closest('.hm-m');
      if (!hm && d.i0 >= 0) {                          /* 字上疊了別的東西 → 用量到的字找標記 */
        var at = d.md.nodes.filter(function (x) { return d.i0 >= x.a && d.i0 < x.a + x.n.data.length; })[0];
        hm = at && at.n.parentElement && at.n.parentElement.closest('.hm-m');
      }
      if (hm) showPop(hm.dataset.id, e.clientX, e.clientY);
      return;
    }
    var sp = d.sp; if (!sp) return;
    var m = {
      id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      lesson: curLesson(), idx: curIdx(), sig: curSig(), c: color,
      text: sp.md.s.slice(sp.a, sp.b), pre: sp.md.s.slice(Math.max(0, sp.a - CTX), sp.a), post: sp.md.s.slice(sp.b, sp.b + CTX),
      off: sp.a, t: new Date().toISOString()
    };
    var all = load(); all.push(m); save(all);
    applyAll();
  }
  function swallow(e) {
    if (!on) return;
    if (e.target.closest && e.target.closest('.hm-ui,#hm-bar,#hm-pop')) return;
    if (activeSlideAt(e.target)) { e.preventDefault(); e.stopPropagation(); }
  }

  /* ── 點已標的字：換色／刪除 ── */
  var pop = null, popId = null;
  function hidePop() { if (pop) pop.style.display = 'none'; popId = null; }
  function showPop(id, x, y) {
    if (!pop) {
      pop = document.createElement('div'); pop.id = 'hm-pop'; pop.className = 'hm-ui';
      pop.innerHTML = Object.keys(COLORS).map(function (k) {
        return '<button type="button" class="hm-sw" data-k="' + k + '" style="background:' + COLORS[k] + '" aria-label="改成' + NAMES[k] + '色"></button>';
      }).join('') + '<button type="button" class="hm-tx" data-del="1">🗑 刪除</button>';
      pop.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !popId) return;
        var all = load(), m = all.filter(function (x) { return x.id === popId; })[0];
        if (b.dataset.del) all = all.filter(function (x) { return x.id !== popId; });
        else if (m) m.c = b.dataset.k;
        save(all); hidePop(); applyAll();
      });
      document.body.appendChild(pop);
    }
    popId = id; pop.style.display = 'flex';
    var w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + 'px';
    pop.style.top = (y - h - 16 < 8 ? y + 20 : y - h - 16) + 'px';
  }

  /* ── 色盤列 ── */
  var bar = document.createElement('div'); bar.id = 'hm-bar'; bar.className = 'hm-ui'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', '標記筆');
  bar.innerHTML = Object.keys(COLORS).map(function (k) {
    return '<button type="button" class="hm-sw' + (k === color ? ' on' : '') + '" data-k="' + k + '" style="background:' + COLORS[k] + '" aria-label="' + NAMES[k] + '色"></button>';
  }).join('') + '<button type="button" class="hm-tx" data-a="clear">本頁清除</button><button type="button" class="hm-tx" data-a="done">✓ 完成</button>';
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { color = b.dataset.k; bar.querySelectorAll('.hm-sw').forEach(function (x) { x.classList.toggle('on', x === b); }); }
    else if (b.dataset.a === 'done') toggle(false);
    else if (b.dataset.a === 'clear') {
      var here = marksHere(); if (!here.length) return;
      if (!confirm('清除這一頁的 ' + here.length + ' 個標記？（四班共用，清掉就沒有了）')) return;
      var ids = here.map(function (m) { return m.id; });
      save(load().filter(function (m) { return ids.indexOf(m.id) < 0; })); applyAll();
    }
  });

  function toggle(v) {
    on = v === undefined ? !on : !!v;
    document.body.classList.toggle('hm-on', on);
    document.querySelectorAll('.hm-btn').forEach(function (b) { b.classList.toggle('on', on); });
    if (!on) { drag = null; clearPv(); hidePop(); }
  }
  window.hmToggle = toggle;
  window.hmReapply = applyAll;

  function addBtns() {
    var pj = document.querySelector('.wk-proj-btn:not(.spot-btn)');
    if (pj && !document.getElementById('hm-btn-n')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'hm-btn-n';
      b.className = 'wk-proj-btn hm-btn'; b.textContent = '🖍 標記筆'; b.title = '標記筆（劃過文字永久保留）';
      b.onclick = function () { toggle(); };
      var after = document.getElementById('spot-btn-n') || pj;
      after.parentNode.insertBefore(b, after.nextSibling);
    }
    var cb = document.querySelector('#wk-fullscreen .wkfs-ctrl-btns');
    if (cb && !document.getElementById('hm-btn-f')) {
      var f = document.createElement('button'); f.type = 'button'; f.id = 'hm-btn-f';
      f.className = 'wkfs-ctrl-btn hm-btn'; f.textContent = '🖍'; f.title = '標記筆';
      f.onclick = function () { toggle(); };
      cb.appendChild(f);
    }
  }
  function boot() {
    document.body.appendChild(bar);
    addBtns(); watch(); schedule();
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', function () { drag = null; clearPv(); }, true);
    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu'].forEach(function (t) { document.addEventListener(t, swallow, { capture: true, passive: false }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on) { toggle(false); e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    document.addEventListener('pointerdown', function (e) { if (pop && popId && !(e.target.closest && e.target.closest('#hm-pop'))) { if (!on || !activeSlideAt(e.target)) hidePop(); } }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
