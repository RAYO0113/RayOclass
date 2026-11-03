/* V203：基礎練習題目改成考卷格式（老師 11/3）：題目前加答案格＋題號「(　) 1. 題目」，選項 (A)～(D) 縮排在題目下。
   答案格平常空白，答案出現時（.ans-on，iqOpt／iqAll 設定）填入答案。樣式在 171_v203-iquiz-num-css。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var Q = slide.q, old = '<div class="iq-q">' + Q.q + '</div>';
    if (html.split(old).length !== 2) return html;   /* 結構不符就維持原樣 */
    return html.replace(old, function () {
      return '<div class="iq-q iq-num"><span class="iq-ab">(<span class="iq-abv">' + Q.ans + '</span>)</span>' +
        '<span class="iq-qn">' + Q.n + '.</span><span class="iq-qt">' + Q.q + '</span></div>';
    });
  };
})();
