(function () {
  /* V250（老師 11/13 晚）：樂府詩各頁改成全部展開（div.l7b，不再是 details）。
     重新定義 window.l7Go（188_v240-l7-tabs-js 的舊版會被這個蓋掉，實際生效＝本檔）：
     跳到某頁某一項時，details 或 div.l7b 都找得到；details 才需要打開。 */
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
      var el = k ? box.querySelector('[data-k="' + String(k).replace(/"/g, '') + '"]') : null;
      if (el) { if (el.tagName === 'DETAILS') el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      else { var t = box.querySelector('.wk-slide'); if (t) t.scrollIntoView({ block: 'start' }); }
    }, 60);
  };
})();
