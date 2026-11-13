(function () {
  /* V251（老師 11/13：不要只是加點圖，要大破大立，做成更優秀的互動網頁）
     〈樂府長卷〉互動版（yf/index.html）：一個時代一幅畫、重點字按了才揭曉、讀詩模式、樂府／古詩分類挑戰。
     內容由 yf 頁自己讀 data/lessons/30.js，這裡只負責把它蓋在畫面最上層開起來：
     - window.l7Scroll(k)：開長卷；有 k（作品名）就直接進那首的讀詩模式
     - 重新定義 window.l7Pop（191_v250-l7-flat-js 的浮框會被這個蓋掉，實際生效＝本檔）：發展頁點代表作 → 讀詩模式，關掉就回原本那一頁
     - 樂府詩封面頁插入「樂府長卷　互動版」按鈕（不改課檔）
     蓋版用 188_v240-l7-tabs-js 的 #l7-anim（樣式在 182），頁內「✕ 回課文」送出 lbClose 訊息由 188 關掉。 */
  var KEY = '樂府詩選—長干行';
  window.l7Scroll = function (k) {
    if (document.getElementById('l7-anim')) return;
    var box = document.createElement('div');
    box.id = 'l7-anim';
    box.innerHTML = '<iframe src="yf/index.html' + (k ? '#' + encodeURIComponent(k) : '') + '" title="樂府長卷" allow="fullscreen"></iframe>';
    (document.fullscreenElement || document.body).appendChild(box);
    setTimeout(function () { var f = box.querySelector('iframe'); if (f) f.focus(); }, 300);
  };
  window.l7Pop = function (k) { window.l7Scroll(k); };

  var _render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _render.apply(this, arguments);
    try {
      if (wkKey === KEY && wkSlides[wkIdx] && wkSlides[wkIdx].label === '樂府詩·封面') {
        document.querySelectorAll('#wkfs-body .l7-cover, #wk-slide-area .l7-cover').forEach(function (cv) {
          if (cv.querySelector('.l7-yf-row')) return;
          var row = document.createElement('div');
          row.className = 'l7-yf-row';
          row.innerHTML = '<a onclick="l7Scroll()">樂府長卷　互動版 ▸</a>';
          var sub = cv.querySelector('.l7-cv-s');
          if (sub) sub.insertAdjacentElement('afterend', row); else cv.insertBefore(row, cv.firstChild);
        });
      }
    } catch (e) { setTimeout(function () { throw e; }); }
    return r;
  };
})();
