
(function () {
  function foldYidong(boxId) {
    var box = document.getElementById(boxId);
    if (!box || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var grp = box.querySelector('.v80-rh-group');
    if (!grp) return;
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      if ((b.textContent || '').replace(/^◆/, '').trim() === '意動用法' && b.parentNode !== grp) grp.insertBefore(b, grp.firstChild);
    });
  }
  var _v81show = showWenxue;
  showWenxue = function () { var r = _v81show.apply(this, arguments); foldYidong('wk-sections'); return r; };
  var _v81proj = wkOpenProj;
  wkOpenProj = function () { var r = _v81proj.apply(this, arguments); foldYidong('wkfs-sections'); return r; };
})();
