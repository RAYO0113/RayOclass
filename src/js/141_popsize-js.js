/* V119：字義／字音／字形泡泡字級改為跟著課文字級（課文的 0.8 倍，最小 16px）。
   原因：018 的 tpPlacePopup 本來就把泡泡設成課文字級，但 025（v51 R2）用
   `.tp-popup-detached{font-size:var(--student-read-size) !important}` 固定成 2 倍基本字級（30px），
   一般畫面課文才 21px，泡泡反而比課文大。這裡不改舊規則，只在泡泡元素上覆寫 --student-read-size。 */
(function () {
  var RATIO = 0.8, MIN = 16;
  function wrap() {
    var orig = window.tpPlacePopup;
    if (typeof orig !== 'function' || orig._v119size) return;
    var w = function (el) {
      try {
        var pop = typeof tpPopNode === 'function' ? tpPopNode(el) : null;
        if (pop && el) {
          var fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs) pop.style.setProperty('--student-read-size', Math.max(MIN, Math.round(fs * RATIO * 10) / 10) + 'px');
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    w._v119size = true;
    for (var k in orig) if (Object.prototype.hasOwnProperty.call(orig, k)) w[k] = orig[k];
    window.tpPlacePopup = w;
  }
  wrap();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrap);
  window.addEventListener('load', wrap);
})();
