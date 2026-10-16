/* V130：介面零件動畫的觸發（樣式見 155_galaxy-ui-css.css）。只加 class／插裝飾用的點點，不讀寫任何資料。
   ④ 作業完成格：080 點一下會整張表重畫，所以先記下點的是哪一格（data-v84），重畫後替那格加 .v130-just 播一次動畫。
   ⑤ 同步中：122 只改「同步中…」的文字，這裡看到這幾個字就在旁邊插墨點，不是同步中就拿掉。 */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#v84-hw button.v84-c[data-v84]');
    if (!b) return;
    var key = b.getAttribute('data-v84');
    setTimeout(function () {
      var nb = document.querySelector('#v84-hw button.v84-c[data-v84="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
      if (!nb || nb === b) return;   /* 沒重畫（例如取消時按了「取消」）就不播 */
      nb.classList.add('v130-just');
      setTimeout(function () { nb.classList.remove('v130-just'); }, 600);
    }, 0);
  }, true);

  var SEL = '.v107-st, .sy-row > b', queued = false;
  function ink() {
    queued = false;
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i], busy = /^同步中/.test(el.textContent || ''), nx = el.nextElementSibling;
      var has = nx && nx.classList.contains('v130-ink');
      if (busy && !has) {
        var s = document.createElement('span');
        s.className = 'v130-ink'; s.setAttribute('aria-hidden', 'true');
        s.innerHTML = '<i></i><i></i><i></i><i></i>';
        el.parentNode.insertBefore(s, el.nextSibling);
      } else if (!busy && has) nx.parentNode.removeChild(nx);
    }
  }
  function soon() { if (!queued) { queued = true; setTimeout(ink, 30); } }
  function start() {
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, characterData: true });
    soon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
