(function () {
  /* V178：作者、題解、賞析、基礎練習、進階練習顯示課本頁碼（老師 10/28「怎麼都沒頁碼」）
     頁碼依翰林 115 技高國文(1) 課本 PDF 每頁印的頁碼逐頁看過；只放「·課本」內容（網站上不是課本文字的不放，如〈侍坐〉賞析、〈桃花源記〉普高版作者題解）。
     魚販、世說、師說的作者／題解頁碼在 015_main.js 的 TEXTBOOK_INFO_PAGES，這裡不重複。 */
  var P = {
    '珍珠奶茶': { '作者·課本': 'P.61', '題解·課本': 'P.60', '賞析·課本': 'P.70', basic: 'P.72~P.75', adv: 'P.76' },
    '臺灣最美麗的火車線': { '作者·課本': 'P.81', '題解·課本': 'P.80', '賞析·課本': 'P.89', basic: 'P.91~P.93', adv: 'P.94~P.95' },
    '論語選—子路曾皙冉有公西華侍坐': { '作者·課本': 'P.99', '題解·課本': 'P.98', basic: 'P.107~P.109', adv: 'P.110' },
    '樂府詩選—長干行': { '樂府詩·課本': 'P.114', '題解·課本': 'P.114', '作者·課本': 'P.115', '賞析·課本': 'P.119', basic: 'P.121~P.123', adv: 'P.124' },
    '茫茫人海中的一名女孩': { '題解·課本': 'P.128', '作者·課本': 'P.129', '賞析·課本': 'P.138', basic: 'P.140~P.142', adv: 'P.143~P.144' },
    '桃花源記': { basic: 'P.157~P.160', adv: 'P.160~P.161' },
    '極短篇小說選': { '極短篇·課本': 'P.164', '題解·騷擾': 'P.164', '作者·衣若芬': 'P.165', '賞析·騷擾': 'P.169', '題解·青春': 'P.170', '作者·愛亞': 'P.171', '賞析·青春': 'P.174', basic: 'P.176~P.178', adv: 'P.179' }
  };
  function badge(p) { return '<div class="wks-book-page">課本 ' + p + '</div>'; }
  var _r = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _r.apply(this, arguments);
    var m = (typeof wkKey !== 'undefined') && P[wkKey]; if (!m || !slide) return h;
    if (slide.type === 'info' && m[slide.label] && h.indexOf('<div class="wks-book-page"></div>') >= 0)
      return h.replace('<div class="wks-book-page"></div>', '<div class="wks-book-page">課本 ' + m[slide.label] + '</div>');
    var k = slide.type === 'iquiz' ? 'basic' : (slide.type === 'iadv' ? 'adv' : '');
    if (k && m[k] && h.indexOf('wks-book-page') < 0) return h.replace(/^(<div class="wk-slide[^>]*>)/, '$1' + badge(m[k]));
    return h;
  };
})();
