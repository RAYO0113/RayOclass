/* V129：注釋側欄字級跟著課文等比例縮放。
   原因：047（v61）的注釋字級滑桿是固定 px（預設 30px），當初為全螢幕投影設計（全螢幕課文也是 30px）；
   一般畫面課文只有約 21px，打開注釋欄字反而比課文大很多（老師 10/15 回報）。
   做法：不改 047／046，滑桿數字仍代表「課文 30px 時的注釋字級」；
   一般畫面（#wk-slide-area）與全螢幕（#wkfs-body）各自量課文字級，寫入 --v129-nfs（＝滑桿值 × 課文字級 ÷ 30）。
   補充卡、「總」字卡不在這兩個容器內，照舊用滑桿原值。 */
(function () {
  var REF = 30, MIN = 14;
  function slider() {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--v61-nfs'));
    return v || REF;
  }
  function textSize(box) {
    var t = box.querySelector('.tp-text');
    return t ? parseFloat(getComputedStyle(t).fontSize) : 0;
  }
  function apply() {
    var s = slider();
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var box = document.getElementById(id); if (!box) return;
      var ts = textSize(box); if (!ts) return;
      var v = Math.max(MIN, Math.round(s * ts / REF * 10) / 10) + 'px';
      if (box.style.getPropertyValue('--v129-nfs') !== v) box.style.setProperty('--v129-nfs', v);
    });
  }
  var pend = 0;
  function soon() { clearTimeout(pend); pend = setTimeout(apply, 60); }
  /* 換頁、開關全螢幕、A−／A+、拖滑桿、視窗大小改變都重算 */
  document.addEventListener('input', soon, true);
  document.addEventListener('click', soon, true);
  window.addEventListener('resize', soon);
  if (window.MutationObserver) {
    var mo = new MutationObserver(soon);
    var watch = function () {
      ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el && !el.__v129) { el.__v129 = 1; mo.observe(el, { childList: true }); } });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { watch(); soon(); }); else { watch(); soon(); }
  }
})();
