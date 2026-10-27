/* V162 作文教學（老師 10/27）：側欄第四類「作文教學」，放作文四步驟投影片（完整版／一節課）。
   投影片資料在 data/zuowen/decks.js（教學系統 scripts/RayOclass/zuowen_build_20261027.py 產生），第一次點才載入。
   自己管翻頁與全螢幕，不經過 wkRenderCurrent：不寫班級進度、不碰任何老師資料。
   作文模式時把 wkKey、wkSlides 清空，其他外掛（進度、修辭、畫記…）看到的是「沒有開課文」。
   投影片裡有 data-build-in 的元素：按 ▶／→ 先逐條出現，全部出現後才換下一頁。 */
(function () {
  var VER = '20261028a';
  /* V164（老師 10/27）：分科——冷凍空調科、建築科各一套，例子都換成該科的 */
  var LIST = [['cold-full', '冷凍空調科（完整版）'], ['cold-short', '冷凍空調科（一節課）'],
              ['arch-full', '建築科（完整版）'], ['arch-short', '建築科（一節課）']];
  var st = { on: false, deck: null, idx: 0, step: 0 };

  function load(cb) {
    if (window.ZW_DECKS) return cb();
    var s = document.createElement('script');
    s.src = 'data/zuowen/decks.js?v=' + VER;
    s.onload = cb;
    s.onerror = function () { alert('作文教學資料載入失敗，請重新整理再試一次。'); };
    document.head.appendChild(s);
  }
  function deck() { return window.ZW_DECKS[st.deck]; }

  function orders(root) {
    var seen = {};
    root.querySelectorAll('.zw-stage [data-build-in]').forEach(function (el) {
      var n = parseInt((el.getAttribute('data-build-in') || '').split(/\s+/)[1], 10) || 1;
      el.setAttribute('data-zw-o', n); seen[n] = 1;
    });
    return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
  }
  function applyBuild(root) {
    if (!root) return 0;
    var os = orders(root);
    if (st.step > os.length) st.step = os.length;
    var shown = os.slice(0, st.step);
    root.querySelectorAll('.zw-stage [data-zw-o]').forEach(function (el) {
      el.classList.toggle('zw-hidden', shown.indexOf(+el.getAttribute('data-zw-o')) < 0);
    });
    return os.length;
  }

  function fit(root, full) {
    var stage = root && root.querySelector('.zw-stage');
    var sec = stage && stage.querySelector('section');
    if (!sec) return;
    var w = root.clientWidth, s;
    if (full) {
      s = Math.min(w / 1920, (root.clientHeight || window.innerHeight) / 1080);
      stage.style.width = Math.floor(1920 * s) + 'px';
    } else {
      stage.style.width = '';
      s = stage.clientWidth / 1920;
    }
    stage.style.height = Math.floor(1080 * s) + 'px';
    sec.style.transform = 'scale(' + s + ')';
  }

  function counterText() { return (st.idx + 1) + ' / ' + deck().slides.length; }
  function activeSec() {
    var a = null;
    deck().sections.forEach(function (s) { if (s.idx <= st.idx) a = s; });
    return a;
  }
  function markSecs(sel) {
    var a = activeSec();
    document.querySelectorAll(sel).forEach(function (b) {
      var on = a && +b.dataset.idx === a.idx;
      b.classList.toggle(sel === '.wk-sec-btn' ? 'wk-sec-active' : 'active', !!on);
    });
  }
  function secButtons(cls) {
    return deck().sections.map(function (s) {
      return '<button class="' + cls + '" data-idx="' + s.idx + '" onclick="zwGoto(' + s.idx + ')">' + s.label + '</button>';
    }).join('');
  }

  function render() {
    var html = '<div class="wk-slide zw-slide"><div class="zw-stage">' + deck().slides[st.idx] + '</div></div>';
    var area = document.getElementById('wk-slide-area');
    if (area) { area.innerHTML = html; fit(area, false); applyBuild(area); }
    var cnt = document.getElementById('wk-counter');
    if (cnt) cnt.textContent = counterText();
    markSecs('.wk-sec-btn');
    if (wkProjMode) {
      var fsBody = document.getElementById('wkfs-body');
      if (fsBody) { fsBody.innerHTML = html; fit(fsBody, true); applyBuild(fsBody); }
      var fc = document.getElementById('wkfs-counter');
      if (fc) fc.textContent = counterText();
      var ft = document.getElementById('wkfs-title');
      if (ft) ft.textContent = deck().name + ' ' + counterText();
      markSecs('.wkfs-sec-btn');
    }
  }
  function rebuildOnly() {
    applyBuild(document.getElementById('wk-slide-area'));
    if (wkProjMode) applyBuild(document.getElementById('wkfs-body'));
  }

  function next() {
    var total = orders(document.getElementById(wkProjMode ? 'wkfs-body' : 'wk-slide-area'));
    if (st.step < total.length) { st.step++; rebuildOnly(); return; }
    if (st.idx < deck().slides.length - 1) { st.idx++; st.step = 0; render(); }
  }
  function prev() {
    if (st.idx > 0) { st.idx--; st.step = 999; render(); }
  }

  function enter(id) {
    load(function () {
      if (!window.ZW_DECKS || !window.ZW_DECKS[id]) return;
      st.on = true; st.deck = id; st.idx = 0; st.step = 0;
      wkKey = null; wkSlides = []; wkSectionMap = [];
      document.querySelectorAll('.wenxue-nav-item').forEach(function (b) { b.classList.remove('active'); });
      var btn = document.getElementById('zw-nav-' + id);
      if (btn) btn.classList.add('active');
      var secEl = document.getElementById('wk-sections');
      if (secEl) secEl.innerHTML = secButtons('wk-sec-btn');
      var sel = document.getElementById('wk-text-select');
      if (sel) sel.value = '__zw_' + id;
      render();
    });
  }

  window.zwGoto = function (i) {
    if (!st.on) return;
    st.idx = Math.max(0, Math.min(i, deck().slides.length - 1)); st.step = 0;
    var menu = document.getElementById('wkfs-sections'), b = document.getElementById('wkfs-section-toggle');
    if (menu) menu.classList.remove('open');
    if (b) b.classList.remove('on');
    render();
  };
  window.zwOpen = enter;

  var _show = showWenxue, _next = wkNext, _prev = wkPrev, _open = wkOpenProj;
  showWenxue = function (key) {
    if (typeof key === 'string' && key.indexOf('__zw_') === 0) { enter(key.slice(5)); return; }
    st.on = false;
    return _show.apply(this, arguments);
  };
  wkNext = function () { if (st.on) return next(); return _next.apply(this, arguments); };
  wkPrev = function () { if (st.on) return prev(); return _prev.apply(this, arguments); };
  wkOpenProj = function () {
    if (!st.on) return _open.apply(this, arguments);
    if (window.wkInkState) { window.wkInkState.active = false; window.wkInkState.drawing = false; }
    document.body.classList.add('v82-proj');
    wkProjMode = true;
    var fs = document.getElementById('wk-fullscreen');
    fs.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    var fsSec = document.getElementById('wkfs-sections');
    if (fsSec) fsSec.innerHTML = secButtons('wkfs-sec-btn');
    render();
  };

  window.addEventListener('resize', function () {
    if (!st.on) return;
    fit(document.getElementById('wk-slide-area'), false);
    if (wkProjMode) fit(document.getElementById('wkfs-body'), true);
  });

  window.addEventListener('load', function () {
    var list = document.getElementById('wenxue-zuowen-list');
    if (list) list.innerHTML = LIST.map(function (d) {
      return '<button class="wenxue-nav-item" id="zw-nav-' + d[0] + '" onclick="zwOpen(\'' + d[0] + '\')">' + d[1] + '</button>';
    }).join('');
    var sel = document.getElementById('wk-text-select');
    if (sel) sel.insertAdjacentHTML('beforeend', LIST.map(function (d) {
      return '<option value="__zw_' + d[0] + '">✎ ' + d[1] + '</option>';
    }).join(''));
  });
})();
