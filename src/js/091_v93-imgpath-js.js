
/* v93：版號；圖片改為外部檔（img/…，部署時與 index.html 同層）。
   從根目錄工作檔（…整理版_vNN.html）開啟時，圖片實際在 上傳/img/ → 把 <img src="img/…"> 補上前綴。
   v90 補充圖片的 IMG 路徑已在其定義處依同一規則補前綴（見 v93_build.py）。部署版（上傳/index.html、GitHub）不做任何改寫。 */
(function () {
  window.APP_VERSION = 'V93';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var ROOTFILE = /整理版_v\d+\.html$/.test(decodeURIComponent(location.pathname));
  if (!ROOTFILE) return;
  function fix(root) {
    (root.querySelectorAll ? root.querySelectorAll('img[src^="img/"]') : []).forEach(function (im) {
      im.setAttribute('src', '上傳/' + im.getAttribute('src'));
    });
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches('img[src^="img/"]')) fix(n.parentNode); else fix(n); } }); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  fix(document);
})();
