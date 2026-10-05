
/* v95：版號；在指定圖片下方（橫幅則右下角）加作者／授權小字。以檔名比對，不改 v90 addon。 */
(function () {
  window.APP_VERSION = 'V95';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var CREDIT = {
    '金針花海.jpg': '攝影：rita2253419／CC BY-SA 4.0／Wikimedia Commons',
    '吉安稻田.jpg': '攝影：Fred Hsu／CC BY-SA 3.0／Wikimedia Commons',
    '木瓜溪橋火車.jpg': '攝影：Irvin Chen／CC BY 2.0／Wikimedia Commons',
    '苦楝.jpg': '攝影：Foxy Who／CC BY-SA 3.0／Wikimedia Commons'
  };
  function nameOf(u) { try { u = decodeURIComponent(u || ''); } catch (e) {} return u.split('/').pop().replace(/["')]+$/, ''); }
  function tag(t) { var d = document.createElement('div'); d.className = 'v95-credit'; d.textContent = t; return d; }
  function scan() {
    document.querySelectorAll('.v90-banner:not([data-v95])').forEach(function (b) {
      b.setAttribute('data-v95', '1');
      var t = CREDIT[nameOf(b.getAttribute('data-src') || b.style.backgroundImage)];
      if (t) b.appendChild(tag(t));
    });
    document.querySelectorAll('img.v90-zoom:not([data-v95])').forEach(function (im) {
      im.setAttribute('data-v95', '1');
      var t = CREDIT[nameOf(im.getAttribute('src'))];
      if (!t) return;
      var cap = im.parentNode.querySelector('.v90-cap');
      if (cap) cap.parentNode.insertBefore(tag(t), cap.nextSibling); else im.parentNode.insertBefore(tag(t), im.nextSibling);
    });
  }
  var p = false;
  new MutationObserver(function () { if (p) return; p = true; setTimeout(function () { p = false; scan(); }, 40); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();
