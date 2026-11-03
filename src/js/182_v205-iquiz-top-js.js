/* V205：基礎練習標題列（老師 11/3「這一排就不需要了，應該改成頁碼以及展開收起鍵」）：
   拿掉「基礎練習」標籤和「第 N 題 / 共 M 題」（題號已在題目前，V203），改放課本頁碼＋一鍵展開／收起（V204）。
   頁碼原本是 173_v178 放在投影片開頭的浮動標籤（.wks-book-page，fixed 在右上角），基礎練習改成放進標題列的 .iq-pg。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var pg = '';
    html = html.replace(/<div class="wks-book-page">([^<]*)<\/div>/, function (m, t) { pg = t; return ''; });
    return html.replace(/<span class="iq-tag">基礎練習<\/span><span class="iq-no">[^<]*<\/span>/, '<span class="iq-pg">' + pg + '</span>');
  };
})();
