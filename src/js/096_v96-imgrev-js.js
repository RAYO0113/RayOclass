
/* v96：圖片快取破除（老師 10/1：換成高解析後自己電腦仍顯示舊的糊圖 → 瀏覽器快取了同檔名的舊圖）。
   同檔名替換過的圖片，在網址後加 ?v=版本，瀏覽器視為新檔重新下載；沒換過的圖照常使用快取。
   以後替換圖片時，在 REV 加一筆（檔名：版本）即可。只改元素上的網址，不改 v90／v93 addon。 */
(function () {
  window.APP_VERSION = 'V96';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var REV = {
    '火車線/金針花海.jpg': 95, '火車線/吉安稻田.jpg': 95, '火車線/木瓜溪橋火車.jpg': 95, '火車線/苦楝.jpg': 95,
    '火車線/九芎.jpg': 95, '火車線/冬候鳥群.jpg': 95, '火車線/路線圖_花蓮壽豐.jpg': 95
  };
  window.V96_IMG_REV = REV;
  function bust(u) {
    if (!u || u.indexOf('?') >= 0) return u;
    var dec; try { dec = decodeURIComponent(u); } catch (e) { dec = u; }
    for (var k in REV) if (dec.slice(-k.length - 1) === '/' + k) return u + '?v=' + REV[k];
    return u;
  }
  function fixEl(el) {
    if (el.tagName === 'IMG') {
      var s = el.getAttribute('src'), s2 = bust(s);
      if (s2 !== s) el.setAttribute('src', s2);
    }
    var ds = el.getAttribute && el.getAttribute('data-src');
    if (ds) { var d2 = bust(ds); if (d2 !== ds) el.setAttribute('data-src', d2); }
    var bg = el.style && el.style.backgroundImage;
    if (bg && bg.indexOf('img/') >= 0 && bg.indexOf('?') < 0) {
      var m = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (m) { var b2 = bust(m[1]); if (b2 !== m[1]) el.style.backgroundImage = 'url("' + b2 + '")'; }
    }
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    fixEl(root);
    root.querySelectorAll('img[src*="img/"], [data-src*="img/"], [style*="img/"]').forEach(fixEl);
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === 'attributes') fixEl(m.target);
      else m.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style', 'data-src'] });
  scan(document.documentElement);
})();
