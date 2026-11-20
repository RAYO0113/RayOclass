
(function () {
  window.APP_VERSION = 'V265';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);
})();
