/* V193：〈論語選〉課前加「小標頁」分段落（老師 11/2：加幾頁小標頁，分個段落）。
   插在指定頁之前；只是分段標題頁，沒有教材內容。work_answers 的頁碼同 142 一樣要往後推。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var SECS = [
    { before: /^作者·課本$/, no: '一', title: '孔子介紹', items: ['孔子（課本）', '孔子的一生', '政治與教育主張', '弟子小檔案'] },
    { before: /｜儒家$/, no: '二', title: '什麼是儒家？', items: ['儒家是什麼', '和道家、墨家、法家比一比', '孔子→孟子→荀子', '漢代：從黃老到獨尊儒術'] },
    { before: /^題解·課本$/, no: '三', title: '認識《論語》', items: ['題解', '《論語》詳表', '十三經的演變', '寫作背景'] }
  ];
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function slideHTML(s) {
    return '<div class="wk-slide wks-info kz-sec">' +
      '<div class="kz-sec-head"><span class="kz-sec-head-no">' + esc(s.no) + '</span><span class="kz-sec-title">' + esc(s.title) + '</span></div>' +
      '<div class="kz-sec-hint">' + s.items.map(function (t, i) { return '<span class="kz-sec-hint-i"><b>' + (i + 1) + '</b>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</div>';
  }
  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _parse.apply(this, arguments);
    if (key !== LESSON) return slides;
    SECS.forEach(function (sec) {
      var at = -1;
      slides.forEach(function (s, i) { if (at < 0 && s.type === 'info' && sec.before.test(String(s.label || ''))) at = i; });
      if (at < 0) return;
      slides.splice(at, 0, { type: 'kzsec', sec: sec });
      slides.forEach(function (s) {
        if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
      });
    });
    return slides;
  };
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'kzsec') return slideHTML(slide.sec);
    return _render.apply(this, arguments);
  };
})();
