
/* v104：日曆點題目／按鈕時不要跳回頂部（老師 10/1）。
   原因：v98 每次點擊都整個重畫 .v98-box，右側面板與題目格的捲動位置被重設。
   做法：記住各捲動區的位置，重畫後（MutationObserver，畫面更新前）放回；換日期時編輯區才回頂部。 */
(function () {
  var SEL = ['.v98-ed', '.v102-qgrid', '.v98-up', '.v98-main', '.v98-grid'];
  var pos = {}, lastDate = null;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? c.getAttribute('data-v98') : ''; }
  function hook() {
    var m = document.getElementById('v98-cal'); if (!m || m.__v104) return; m.__v104 = 1;
    m.addEventListener('scroll', function (e) {
      var t = e.target; if (!t || !t.matches) return;
      SEL.forEach(function (s) { if (t.matches('#v98-cal ' + s)) pos[s] = t.scrollTop; });
    }, true);
    new MutationObserver(function () {
      var d = selDate();
      if (d !== lastDate) { lastDate = d; pos['.v98-ed'] = 0; pos['.v102-qgrid'] = 0; return; }
      SEL.forEach(function (s) { var el = m.querySelector(s); if (el && pos[s] && el.scrollTop !== pos[s]) el.scrollTop = pos[s]; });
    }).observe(m, { childList: true, subtree: true });
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); hook(); return r; }; }
})();
