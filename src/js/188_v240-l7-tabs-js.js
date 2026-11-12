(function () {
  /* V240：〈長干行〉（L7）小標題改成「封面／作者／題解／詩的流變／樂府詩／◉第一段…」（老師 11/12）
     - 原本題解區的頁都歸「題解·課本／題解·補充」，交錯出現四次；改依頁名前綴（詩的流變·、樂府詩·）分籤。
     - 只動這一課；其他課的小標題不變。
     - 課文頁加 body.l7-wide：詩句行與行之間加寬，方便老師手寫（CSS 在 182_v240-l7-wide-css）。 */
  var KEY = '樂府詩選—長干行';
  var _build = wkBuildSections;
  wkBuildSections = function (slides) {
    var map = _build.apply(this, arguments);
    if (!slides || !slides.some(function (s) { return s.bookKey === KEY; })) return map;
    var out = [];
    map.forEach(function (m) {
      var s = slides[m.idx] || {}, lb = m.label;
      if (s.type === 'info' && s.kind === 'author') lb = '作者';
      else if (s.type === 'info' && s.kind === 'intro') {
        var p = String(s.label || '').split('·')[0];
        lb = p === '詩的流變' ? '詩的流變' : p === '樂府詩' ? '樂府詩' : '題解';
      }
      if (out.length && out[out.length - 1].label === lb) return;
      out.push({ label: lb, idx: m.idx });
    });
    return out;
  };

  var _render = wkRenderCurrent;
  wkRenderCurrent = function () {
    document.body.classList.toggle('l7-wide', wkKey === KEY);
    return _render.apply(this, arguments);
  };
})();
