/* V204：基礎練習「一鍵展開」（老師 11/3）：原「全部顯示」改名、放大；再按一次收起（回到題目＋選項都沒點開）。
   iqAll（015_main）只會展開，這裡包一層：已展開就收起。樣式在 172_v204-iquiz-all-css。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    return html.replace('onclick="iqAll(this)">全部顯示</button>', 'onclick="iqAll(this)">一鍵展開</button>');
  };
  var _all = iqAll;
  iqAll = function (btn) {
    var slide = btn.closest('.wk-slide');
    if (slide && slide.classList.contains('ans-on') && !slide.querySelector('.iq-opt:not(.on)')) {
      slide.classList.remove('ans-on');
      slide.querySelectorAll('.iq-opt').forEach(function (o) { o.classList.remove('on', 'right'); });
      btn.textContent = '一鍵展開';
      return;
    }
    _all.apply(this, arguments);
    btn.textContent = '收起';
  };
})();
