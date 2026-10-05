
/* v89：版號（v88 起的左下角版號；之後每版在新 addon 改這裡） */
(function () {
  window.APP_VERSION = 'V89';
  function set() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  set(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', set);
})();
