/* 投影畫筆只留細筆（2026-10-09 老師）：紅藍綠紫只要「細」，拿掉「中」（「粗」v56 已藏）；螢光筆只留黃色一支（本來就只有一支）。
   - 細／中按鈕都藏起來（不刪 DOM），從螢光筆換回顏色時粗細一律回到細（3）。
   - 包裝 wkInkColor（實際生效版本＝本段包在 v56 036_v56-nq2-js.js 包裝版的外層）。 */
(function () {
  var st = document.createElement('style'); st.id = 'inkthin-css';
  st.textContent = '#wk-ink-toolbar .wk-ink-size{display:none !important}';
  document.head.appendChild(st);
  function wrap() {
    var orig = window.wkInkColor;
    if (typeof orig !== 'function' || orig._thin) return;
    window.wkInkColor = function () {
      var r = orig.apply(this, arguments);
      if (window.wkInkState && wkInkState.color !== 'rgba(0,0,0,0)') wkInkState.size = 3;
      return r;
    };
    window.wkInkColor._thin = true;
  }
  /* v56 的包裝在 DOMContentLoaded 才做，要包在它外層 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(wrap, 0); });
  else wrap();
  if (window.wkInkState) wkInkState.size = 3;
})();
