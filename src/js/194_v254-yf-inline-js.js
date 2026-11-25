(function () {
  /* V254（老師 11/16：「把樂府長卷抽出來外面這一層，對應頁面套上籤頁，把筆、聚光燈等都套上去」）
     〈長干行〉題解區改成直接放樂府長卷（yf/index.html?embed=1），不再蓋版開：
     - 籤頁：作者／題解／詩的流變／樂府詩／樂府代表作（考點、挑戰併在樂府代表作），點了跳到長卷那一段；
       長卷自己換頁時，籤頁、頁碼跟著亮到對應那一籤。
     - 原本的作者～代表作分頁（課檔 info 頁）沒有刪，整段搬到最後，收在「舊版」籤（老師選「長卷取代、舊頁收起來」）。
     - 網站的 ◀ ▶、鍵盤 ←／→ 在長卷裡＝長卷的「下一步／上一頁」（重點字照樣一個一個揭曉）；
       長卷最後一頁再按下一步 → 網站下一頁（課文）；第一頁再按上一頁 → 網站封面。
     - 畫筆：投影全螢幕時長卷在畫記層下面，畫筆、螢光筆、觸控筆都能用；筆跡依「長卷第幾頁」分開存
       （重新指定 015 的 wkInkKey，實際生效＝本檔）。
     - 聚光燈：網站的聚光燈蓋在最上層，長卷裡按 L 也會開關網站的聚光燈。
     做法：長卷 iframe 不放在 #wk-slide-area／#wkfs-body 裡（那兩個每次換頁都被 innerHTML 重寫，iframe 會重載），
     而是一般畫面掛在 body、投影掛在 #wk-fullscreen，位置對齊頁面上的空位（.wk-yf-slot）；不在長卷頁時藏起來但不關，
     回來時停在原本那一頁。網站的 wkRenderCurrent 每次照常整套跑（上課紀錄等外掛不受影響）。
     包 wkParseSlides／wkBuildSections／wkRenderSlideHTML／wkRenderCurrent／wkGoto／wkNext／wkPrev（都在最外層）。 */
  var KEY = '樂府詩選—長干行';
  /* 長卷章節（yf 的 CH）→ 網站籤頁；每籤點了跳到的章節 */
  var TAB_OF = { 封面: '作者', 作者: '作者', 題解: '題解', 流變: '詩的流變', 名稱: '樂府詩', 特色: '樂府詩', 發展: '樂府詩', 新樂府: '樂府詩', 影響: '樂府詩', 比較: '樂府詩', 代表作: '樂府代表作', 考點: '樂府代表作', 挑戰: '樂府代表作' };
  var TABS = [['作者', '作者'], ['題解', '題解'], ['詩的流變', '流變'], ['樂府詩', '名稱'], ['樂府代表作', '代表作']];
  function isOld(s) { return s && s.type === 'info' && (s.kind === 'author' || s.kind === 'intro'); }
  function isYf(s) { return !!s && s.type === 'yf'; }

  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var a = _parse.apply(this, arguments);
    if (key !== KEY || !a) return a;
    var first = -1, last = -1;
    a.forEach(function (s, i) { if (isOld(s)) { if (first < 0) first = i; last = i; } });
    if (first < 0) return a;
    var old = a.slice(first, last + 1);
    old.forEach(function (s) { s.yfOld = true; });
    var v = TABS.map(function (t) { return { type: 'yf', bookKey: KEY, key: KEY, label: '樂府長卷·' + t[0], yfTab: t[0], yfCh: t[1] }; });
    return a.slice(0, first).concat(v, a.slice(last + 1), old);
  };

  var _build = wkBuildSections;
  wkBuildSections = function (slides) {
    var m = _build.apply(this, arguments);
    if (!slides || !slides.some(isYf)) return m;
    var oldStart = slides.findIndex(function (s) { return s.yfOld; });
    m = m.filter(function (x) { return !(oldStart >= 0 && x.idx >= oldStart) && !isYf(slides[x.idx]); });
    slides.forEach(function (s, i) { if (isYf(s)) m.push({ label: s.yfTab, idx: i }); });
    if (oldStart >= 0) m.push({ label: '舊版', idx: oldStart });
    m.sort(function (a, b) { return a.idx - b.idx; });
    return m;
  };

  var _html = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (isYf(slide)) return '<div class="wk-slide wk-yf-slide"><div class="wk-yf-slot"></div></div>';
    return _html.apply(this, arguments);
  };

  /* ── 兩個 iframe：一般畫面 n、投影 f；各自建一次，之後只藏不關 ── */
  var Y = { n: null, f: null, page: 0, count: 0, spec: null, ready: { n: false, f: false } };
  function mode() { return wkProjMode ? 'f' : 'n'; }
  function cur() { return wkSlides && wkSlides[wkIdx]; }
  function block() { var a = -1, b = -1; (wkSlides || []).forEach(function (s, i) { if (isYf(s)) { if (a < 0) a = i; b = i; } }); return [a, b]; }
  function post(m, msg) { var f = Y[m]; if (f && f.contentWindow) f.contentWindow.postMessage(msg, '*'); }
  function ensure(m, spec) {
    if (Y[m]) return false;
    var f = document.createElement('iframe');
    f.className = 'wk-yf-frame'; f.title = '樂府長卷'; f.setAttribute('allow', 'fullscreen; autoplay');
    f.src = 'yf/index.html?embed=1#' + encodeURIComponent(spec);
    (m === 'f' ? document.getElementById('wk-fullscreen') : document.body).appendChild(f);
    Y[m] = f; Y.ready[m] = false;
    f.addEventListener('load', function () { Y.ready[m] = true; });
    return true;
  }
  function place() {
    var s = cur(), on = isYf(s) && wkKey === KEY, m = mode();
    ['n', 'f'].forEach(function (k) { if (Y[k] && (k !== m || !on)) Y[k].style.display = 'none'; });
    if (!on || !Y[m]) return;
    var f = Y[m];
    if (m === 'f') {
      var body = document.getElementById('wkfs-body'), fs = document.getElementById('wk-fullscreen');
      if (!body || !fs) return;
      var r = body.getBoundingClientRect(), q = fs.getBoundingClientRect();
      f.style.left = (r.left - q.left) + 'px'; f.style.top = (r.top - q.top) + 'px';
      f.style.width = r.width + 'px'; f.style.height = r.height + 'px';
      f.style.display = r.width > 0 ? 'block' : 'none';
    } else {
      var slot = document.querySelector('#wk-slide-area .wk-yf-slot');
      var rr = slot ? slot.getBoundingClientRect() : null;
      if (!rr || rr.width < 2) { f.style.display = 'none'; return; }
      f.style.left = (rr.left + window.scrollX) + 'px'; f.style.top = (rr.top + window.scrollY) + 'px';
      f.style.width = rr.width + 'px'; f.style.height = rr.height + 'px';
      f.style.display = 'block';
    }
  }
  setInterval(function () { if (Y.n || Y.f) place(); }, 400);
  window.addEventListener('resize', place);

  /* 換到長卷某一籤：沒開過就照 spec 開；開過就送指令 */
  function show() {
    var s = cur(), m = mode();
    if (!isYf(s) || wkKey !== KEY) { place(); return; }
    var spec = Y.spec || 'ch=' + s.yfCh; Y.spec = null;
    if (!ensure(m, spec)) {
      if (/^ch=/.test(spec)) post(m, { yfCmd: 'ch', v: spec.slice(3) });
      else post(m, { yfCmd: 'go', v: spec });
    }
    place();
    setTimeout(place, 60);
  }

  var _render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _render.apply(this, arguments);
    try {
      var s = cur();
      if (isYf(s) && wkKey === KEY) {
        var t = Y.count ? '長卷 ' + (Y.page + 1) + ' / ' + Y.count : '長卷';
        var c1 = document.getElementById('wk-counter'); if (c1) c1.textContent = t;
        var c2 = document.getElementById('wkfs-counter'); if (c2) c2.textContent = t;
        var c3 = document.getElementById('wkfs-title'); if (c3) c3.textContent = '〈' + wkKey + '〉 ' + t;
        if (Y.sync) Y.sync = false; else show();
      } else place();
    } catch (e) { setTimeout(function () { throw e; }); }
    return r;
  };

  var _goto = wkGoto;
  wkGoto = function (idx) {
    var s = wkSlides && wkSlides[idx];
    if (isYf(s)) Y.spec = 'ch=' + s.yfCh;
    return _goto.apply(this, arguments);
  };
  var _next = wkNext, _prev = wkPrev;
  wkNext = function () {
    var s = cur(), m = mode();
    if (isYf(s) && Y[m] && Y.ready[m]) { post(m, { yfCmd: 'next' }); return; }
    if (isYf(wkSlides[wkIdx + 1]) && !isYf(s)) Y.spec = '0';
    return _next.apply(this, arguments);
  };
  wkPrev = function () {
    var s = cur(), m = mode();
    if (isYf(s) && Y[m] && Y.ready[m]) { post(m, { yfCmd: 'prev' }); return; }
    if (isYf(wkSlides[wkIdx - 1]) && !isYf(s)) Y.spec = 'last';
    return _prev.apply(this, arguments);
  };

  /* 投影開／關：換到另一個 iframe，停在同一頁 */
  var _open = wkOpenProj, _close = wkCloseProj;
  wkOpenProj = function () { if (isYf(cur())) Y.spec = String(Y.page); return _open.apply(this, arguments); };
  wkCloseProj = function () {
    var r = _close.apply(this, arguments);
    if (isYf(cur()) && wkKey === KEY) { Y.spec = String(Y.page); show(); } else place();
    return r;
  };

  /* 畫筆：長卷每一頁各自一份筆跡 */
  var _inkKey = window.wkInkKey;
  window.wkInkKey = function () {
    if (isYf(cur()) && wkKey === KEY) return String(wkKey) + '::yf' + Y.page;
    return _inkKey.apply(this, arguments);
  };

  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object') return;
    var m = mode();
    if (!Y[m] || e.source !== Y[m].contentWindow) return;
    /* V269（老師 11/25「樂府長卷回課文壞了」）：長卷嵌在投影裡（11/16 起）時，頁內「✕ 回課文」送的 lbClose 沒有人接（188 只關蓋版的 #l7-anim）→ 按了沒反應。
       改成跳到這一課第一頁課文（第一段）；嵌入模式的長卷不會因為讀詩送 lbClose（rd.direct 只在蓋版直接讀詩時成立） */
    if (d.lbClose) {
      var t = wkSlides.findIndex(function (s) { return s && s.type === 'textpage'; });
      if (t >= 0) { wkIdx = t; wkRenderCurrent(); if (wkProjMode && typeof wkInkSync === 'function') wkInkSync(); window.focus(); }
      return;
    }
    if (d.yfAt) {
      Y.page = d.yfAt.i; Y.count = d.yfAt.n;
      var tab = TAB_OF[d.yfAt.ch] || '作者';
      var i = wkSlides.findIndex(function (s) { return isYf(s) && s.yfTab === tab; });
      if (i < 0 || !isYf(cur())) return;
      wkIdx = i; Y.sync = true; wkRenderCurrent();
      if (wkProjMode && typeof wkInkSync === 'function') wkInkSync();
    } else if (d.yfEdge) {
      var b = block(), j = d.yfEdge > 0 ? b[1] + 1 : b[0] - 1;
      if (j >= 0 && j < wkSlides.length) { wkIdx = j; wkRenderCurrent(); window.focus(); }
    } else if (d.yfKey === 'L') {
      if (typeof window.spotToggle === 'function') window.spotToggle();
    }
  });

  /* 舊版頁上的「樂府長卷　互動版」入口：沒指定作品就跳到這一層的長卷（193 的 l7Scroll 被包住，有作品名照舊蓋版直接讀詩） */
  var _scroll = window.l7Scroll;
  window.l7Scroll = function (k) {
    if (!k && wkKey === KEY) { var b = block(); if (b[0] >= 0) { Y.spec = '0'; wkIdx = b[0]; wkRenderCurrent(); return; } }
    return _scroll.apply(this, arguments);
  };

  /* 換課：另一課不需要長卷 */
  var _show = showWenxue;
  showWenxue = function () { var r = _show.apply(this, arguments); place(); return r; };
})();
