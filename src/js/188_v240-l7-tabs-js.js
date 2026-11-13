(function () {
  /* V240：〈長干行〉（L7）題解區（老師 11/12）
     - 小標題：封面／作者／題解／詩的流變／樂府詩／樂府代表作／◉第一段…（原本題解區的頁都歸「題解·課本／題解·補充」交錯出現）
     - 題解頁＝課本「樂府詩簡介＋題解」，按鈕跳到樂府詩、詩的流變；各頁有「目錄／回題解」，照 RAY PPT「切過去講完再切回來」
     - 內容一項一項收合（details.l7d），小封面的目錄點了直接跳到那一項並展開
     - 代表作頁「翻譯」按鈕：顯示／收起每段原文下的翻譯（教師版）
     - 課文頁加 body.l7-wide：詩句行與行之間加寬，方便手寫（CSS 在 182_v240-l7-wide-css）
     只動這一課；其他課的小標題不變。 */
  var KEY = '樂府詩選—長干行';
  function tabOf(s) {
    if (s.type === 'info' && s.kind === 'author') return '作者';
    if (s.type === 'info' && s.kind === 'intro') {
      var p = String(s.label || '').split('·')[0];
      return p === '詩的流變' ? '詩的流變' : p === '樂府詩' ? '樂府詩' : p === '代表作' ? '樂府代表作' : '題解';
    }
    return null;
  }
  var _build = wkBuildSections;
  wkBuildSections = function (slides) {
    var map = _build.apply(this, arguments);
    if (!slides || !slides.some(function (s) { return s.bookKey === KEY; })) return map;
    /* 題解區（作者～課文前）整段依頁名重新分籤，其餘照原本 */
    var out = [], first = -1, last = -1;
    slides.forEach(function (s, i) { if (tabOf(s)) { if (first < 0) first = i; last = i; } });
    map.forEach(function (m) { if (m.idx < first || m.idx > last) out.push(m); });
    var prev = null;
    for (var i = first; i >= 0 && i <= last; i++) {
      var lb = tabOf(slides[i]);
      if (lb && lb !== prev) out.push({ label: lb, idx: i });
      prev = lb;
    }
    out.sort(function (a, b) { return a.idx - b.idx; });
    return out;
  };

  function curBox() {
    var fs = document.getElementById('wkfs-body');
    return (wkProjMode && fs) ? fs : document.getElementById('wk-slide-area');
  }
  window.l7Go = function (label, k) {
    var i = wkSlides.findIndex(function (s) { return s.label === label; });
    if (i < 0) return;
    wkGoto(i);
    setTimeout(function () {
      var box = curBox(); if (!box) return;
      var el = k ? box.querySelector('details.l7d[data-k="' + String(k).replace(/"/g, '') + '"]') : null;
      if (el) { el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      else { var t = box.querySelector('.wk-slide'); if (t) t.scrollIntoView({ block: 'start' }); }
    }, 60);
  };
  window.l7All = function (btn) {
    var slide = btn.closest('.wk-slide') || document;
    var ds = slide.querySelectorAll('details.l7d'), allOpen = true;
    ds.forEach(function (d) { if (!d.open) allOpen = false; });
    ds.forEach(function (d) { d.open = !allOpen; });
    btn.textContent = allOpen ? '全部展開' : '全部收起';
  };
  /* V241（11/13）：代表作頁底「回最上方」 */
  window.l7Top = function (btn) {
    var t = btn.closest('.wk-slide') || curBox(); if (!t) return;
    /* 投影模式：頁面本身在捲（.wk-slide overflow:auto）；一般畫面：整個視窗在捲 */
    if (t.scrollTop > 0) t.scrollTo({ top: 0, behavior: 'smooth' });
    else t.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };
  window.l7Tr = function (btn) {
    var slide = btn.closest('.wk-slide') || document;
    var on = !btn.classList.contains('on');
    btn.classList.toggle('on', on);
    slide.querySelectorAll('.l7-y').forEach(function (y) { y.classList.toggle('show', on); });
  };

  /* 〈詩的變形記〉流變動畫（lb/index.html）：蓋在畫面最上層開，頁內「✕ 回課文」或 Esc 關掉，回到原本那一頁 */
  window.l7Anim = function () {
    if (document.getElementById('l7-anim')) return;
    var box = document.createElement('div');
    box.id = 'l7-anim';
    box.innerHTML = '<iframe src="lb/index.html" title="詩的變形記" allow="fullscreen"></iframe>';
    document.body.appendChild(box);
    setTimeout(function () { var f = box.querySelector('iframe'); if (f) f.focus(); }, 300);
  };
  function closeAnim() { var b = document.getElementById('l7-anim'); if (b) b.remove(); }
  window.addEventListener('message', function (e) { if (e.data && e.data.lbClose) closeAnim(); });

  var _render = wkRenderCurrent;
  wkRenderCurrent = function () {
    document.body.classList.toggle('l7-wide', wkKey === KEY);
    return _render.apply(this, arguments);
  };
})();
