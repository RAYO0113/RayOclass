/* V206：基礎練習（老師 11/3）
   1. 頁碼要「那一題」的課本頁碼，用浮框（.wks-book-page，右上角）顯示，不要整個練習的 P.107~P.109。
      逐題頁碼由 scripts/RayOclass/basic_q_pages_20261103.py 從翰林技高國文(1)課本 PDF 文字層算出（每題答案格「︵　　︶」所在頁；
      跨頁寫 P.xx~P.yy；「▲」題組文章算進它指定的題目），跨頁與題組逐頁看過原頁確認。沒有資料的課照舊用整個練習的頁碼。
   2. 拿掉 V205 的標題列（頁碼＋一鍵展開），按鈕縮成「開／關」，放在題目那一行最右邊。 */
(function () {
  'use strict';
  var PAGES = {"論語選—子路曾皙冉有公西華侍坐": {"1": "P.107", "2": "P.107", "3": "P.107", "4": "P.107", "5": "P.108", "6": "P.108", "7": "P.108", "8": "P.108~P.109", "9": "P.109", "10": "P.109"}, "身為魚販": {"1": "P.20", "2": "P.20", "3": "P.20", "4": "P.21", "5": "P.21", "6": "P.21", "7": "P.22", "8": "P.23"}, "珍珠奶茶": {"1": "P.72", "2": "P.72", "3": "P.72~P.73", "4": "P.73", "5": "P.73~P.74", "6": "P.74", "7": "P.74~P.75", "8": "P.75"}, "臺灣最美麗的火車線": {"1": "P.91", "2": "P.91", "3": "P.91", "4": "P.91", "5": "P.92", "6": "P.92", "7": "P.92", "8": "P.92~P.93", "9": "P.93"}, "世說新語選": {"1": "P.36", "2": "P.36", "3": "P.36", "4": "P.36", "5": "P.37", "6": "P.37", "7": "P.37", "8": "P.37", "9": "P.38", "10": "P.38"}, "師說": {"1": "P.52", "2": "P.52", "3": "P.52", "4": "P.53", "5": "P.53", "6": "P.53", "7": "P.54", "8": "P.54~P.55"}, "桃花源記": {"1": "P.157", "2": "P.157", "3": "P.157", "4": "P.157", "5": "P.158", "6": "P.158", "7": "P.158", "8": "P.159", "9": "P.159", "10": "P.160"}, "樂府詩選—長干行": {"1": "P.121", "2": "P.121", "3": "P.121", "4": "P.122", "5": "P.122", "6": "P.122", "7": "P.122~P.123", "8": "P.123~P.124"}, "茫茫人海中的一名女孩": {"1": "P.140", "2": "P.140", "3": "P.140", "4": "P.141", "5": "P.141", "6": "P.141", "7": "P.142", "8": "P.142"}, "極短篇小說選": {"1": "P.176", "2": "P.176", "3": "P.176", "4": "P.176", "5": "P.177", "6": "P.177", "7": "P.177", "8": "P.178", "9": "P.178"}};
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var Q = slide.q, m = (typeof wkKey !== 'undefined') && PAGES[wkKey];
    var pg = m && m[Q.n] ? m[Q.n] : '';
    html = html.replace(/<div class="iq-top"><span class="iq-pg">([^<]*)<\/span>[\s\S]*?<\/button><\/div>/, function (all, t) {
      if (!pg) pg = t.replace(/^課本\s*/, '');
      return '';
    });
    var qt = '<span class="iq-qt">' + Q.q + '</span></div>';
    if (html.split(qt).length === 2) html = html.replace(qt, function () { return '<span class="iq-qt">' + Q.q + '</span><button class="iq-all iq-onoff" onclick="iqAll(this)">開</button></div>'; });
    if (pg) html = html.replace(/^(<div class="wk-slide[^>]*>)/, '$1<div class="wks-book-page">課本 ' + pg + '</div>');
    return html;
  };
  var _all = iqAll;
  iqAll = function (btn) {
    _all.apply(this, arguments);
    if (btn.classList.contains('iq-onoff')) btn.textContent = btn.closest('.wk-slide').classList.contains('ans-on') ? '關' : '開';
  };
})();
