
/* v59：浮框不超出視窗、不蓋住右側邊籤（班級進度／顯示設定／註釋小考／投影時的畫筆等）。
   只包裝既有函式：tpPopupBounds（右界再扣掉邊籤）、tpPlacePopup（定位前先設定最大寬度）。不改原本定位邏輯。 */
(function(){
  function tabsLeft(){
    var lim = window.innerWidth - 8;
    document.querySelectorAll('[id$="-tab"]').forEach(function(t){
      var cs = getComputedStyle(t);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var b = t.getBoundingClientRect();
      if (b.width > 0 && b.width < 80 && b.height > 40 && b.left > window.innerWidth * 0.6) lim = Math.min(lim, b.left - 6);
    });
    return lim;
  }
  function wrap(){
    if (typeof window.tpPopupBounds === 'function' && !window.tpPopupBounds._v59fit){
      var _b = window.tpPopupBounds;
      window.tpPopupBounds = function(el){
        var b = _b(el);
        if (b) { var r = tabsLeft(); if (r > b.left + 120 && r < b.right) b.right = r; }
        return b;
      };
      window.tpPopupBounds._v59fit = true;
    }
    if (typeof window.tpPlacePopup === 'function' && !window.tpPlacePopup._v59fit){
      var _p = window.tpPlacePopup;
      window.tpPlacePopup = function(el){
        try {
          var pop = (typeof tpPopNode === 'function') ? tpPopNode(el) : null;
          var b = window.tpPopupBounds(el);
          if (pop && b) pop.style.setProperty('--v59-pop-maxw', Math.max(120, Math.floor(b.right - b.left)) + 'px');
        } catch(e){}
        return _p.apply(this, arguments);
      };
      window.tpPlacePopup._v59fit = true;
    }
  }
  wrap();
  window.addEventListener('load', wrap);
})();
