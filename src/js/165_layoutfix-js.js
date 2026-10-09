/* 版面小修（2026-10-09 老師）
   ① 頁碼浮框（.tp-page「課本 P.44」）一般畫面捲到最上面時壓到右上「高職／高中」切換鍵：
      標題列還看得到、而且跟頁碼同高時 → 寬畫面移到切換鍵左邊；窄畫面（≤820）移到標題列下方。全螢幕不動。
   ② 左下角版本號（#v88-ver，fixed）在手機壓到投影框 → 改放標題列副標後面的小字（不再浮動）。
   ③ 側欄課次（部定14篇／選讀古文／白話文）字級固定小字，不跟著 A−／A+ 變（不用給學生看）。
   ④ 手機（寬 ≤600）：投影框內的寬表格把整頁撐寬（例：〈師說〉辨字頁 429px）→ 手機瀏覽器整頁縮小、
      固定位置的面板跟著變大、關閉鍵跑到螢幕外拉不到 → 讓課文欄與投影框不超過畫面寬；還是比畫面寬的內容改成可左右滑動；
      面板高度不超過螢幕、可捲動。
   ⑤ 手機不提供字級調整（A−／A+、顯示設定的字體大小、全螢幕 A−／A+ 都藏），字級固定 15px；平板、電腦照舊。
   自帶 <style id="layoutfix-css">，不改任何既有模組。 */
(function () {
  var PHONE = '(max-width:600px)';
  var st = document.createElement('style'); st.id = 'layoutfix-css';
  st.textContent =
    /* ① */
    '#tab-wenxue .tp-page,#tab-wenxue .wks-book-page{top:var(--lf-tp-top,58px) !important;right:var(--lf-tp-right,24px) !important}' +
    '@media (max-width:820px){#tab-wenxue .tp-page,#tab-wenxue .wks-book-page{top:var(--lf-tp-top,52px) !important;right:var(--lf-tp-right,12px) !important}}' +
    /* ② */
    '#v88-ver.lf-inline{position:static !important;display:inline-block !important;margin-left:10px;font-size:11px !important;opacity:.6;' +
      'left:auto !important;bottom:auto !important;background:none !important;border:0 !important;padding:0 !important;box-shadow:none !important;color:inherit !important}' +
    /* ③ */
    '.wenxue-sidebar .wenxue-nav-item{font-size:13px !important}' +
    '.wenxue-sidebar .wenxue-sidebar-title{font-size:10px !important}' +
    /* ④ */
    '@media ' + PHONE + '{' +
      '.wenxue-layout>*,#wk-slide-area,#wk-slide-area>.wk-slide{min-width:0 !important;max-width:100% !important;box-sizing:border-box}' +
      '#wk-slide-area>.wk-slide{flex:1 1 auto}' +
      /* 還是比畫面寬的內容（義辨表、結構表、動畫頁、答案頁…）→ 可左右滑動看完，不再被切掉 */
      '#wk-slide-area>.wk-slide,#wk-slide-area .jy-scroll,#wk-slide-area .v75-rv,#wk-slide-area .v74-rv{overflow-x:auto !important;-webkit-overflow-scrolling:touch}' +
      '#cls-panel,#display-panel,#nq2{max-width:100vw !important;max-height:100dvh !important;overflow-y:auto !important;box-sizing:border-box}' +
    '}' +
    /* ⑤ */
    '@media ' + PHONE + '{' +
      ':root{--base-size:15px !important;--slider-base-size:15px !important}' +
      '.site-font-ctrl,#wk-fullscreen .wkfs-ctrl-btn[onclick^="wkFont"],#display-panel .lf-font-row{display:none !important}' +
    '}';
  document.head.appendChild(st);

  /* ① 頁碼避開標題列 */
  var raf = 0;
  function placePage() {
    raf = 0;
    var root = document.documentElement, ctl = document.querySelector('.site-controls'), hd = document.querySelector('.site-header');
    var top = '', right = '';
    if (ctl && hd) {
      var narrow = innerWidth <= 820, pTop = narrow ? 52 : 58, pH = 30;
      var c = ctl.getBoundingClientRect(), h = hd.getBoundingClientRect();
      if (c.bottom > pTop - 4 && c.top < pTop + pH) {                 /* 標題列的按鈕還在頁碼那一帶 */
        if (narrow) top = Math.round(h.bottom + 6) + 'px';
        else right = Math.round(innerWidth - c.left + 10) + 'px';
      }
    }
    root.style.setProperty('--lf-tp-top', top || (innerWidth <= 820 ? '52px' : '58px'));
    root.style.setProperty('--lf-tp-right', right || (innerWidth <= 820 ? '12px' : '24px'));
  }
  function sched() { if (!raf) raf = requestAnimationFrame(placePage); }
  addEventListener('scroll', sched, { passive: true });
  addEventListener('resize', sched);

  /* ② 版本號移到標題列 */
  function moveVer() {
    var v = document.getElementById('v88-ver'), sub = document.querySelector('.site-header .site-sub');
    if (v && sub && v.parentNode !== sub) { sub.appendChild(v); v.classList.add('lf-inline'); }
  }
  /* ⑤ 顯示設定裡「字體大小」那一列加記號（手機藏起來） */
  function markFontRow() {
    document.querySelectorAll('#display-panel .display-setting').forEach(function (d) {
      if (/字體大小/.test(d.textContent)) d.classList.add('lf-font-row');
    });
  }
  function boot() {
    moveVer(); markFontRow(); placePage();
    setTimeout(moveVer, 500); setTimeout(moveVer, 2000);   /* 版本號是別的外掛晚一點才建的 */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
