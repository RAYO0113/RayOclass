(function () {
  /* V250（老師 11/13 晚）：樂府詩各頁改成全部展開（div.l7b，不再是 details）。
     重新定義 window.l7Go（188_v240-l7-tabs-js 的舊版會被這個蓋掉，實際生效＝本檔）：
     跳到某頁某一項時，details 或 div.l7b 都找得到；details 才需要打開。 */
  function curBox() {
    var fs = document.getElementById('wkfs-body');
    return (wkProjMode && fs) ? fs : document.getElementById('wk-slide-area');
  }
  window.l7Go = function (label, k) {
    var i = wkSlides.findIndex(function (s) { return s.label === label; });
    if (i < 0) return;
    wkGoto(i);
    setTimeout(function () {
      var box = curBox(); if (!box) return;
      var el = k ? box.querySelector('[data-k="' + String(k).replace(/"/g, '') + '"]') : null;
      if (el) { if (el.tagName === 'DETAILS') el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      else { var t = box.querySelector('.wk-slide'); if (t) t.scrollIntoView({ block: 'start' }); }
    }, 60);
  };
  /* 11/13 晚 老師：發展頁點代表作 → 統一大小的浮框顯示原文（不跳頁）；有「翻譯」；✕／Esc／點外面關閉。
     內容取自 wkSlides 的「代表作·○○」頁（拿掉頁頂／頁底導覽）。投影模式也蓋得到（z-index 高於 #wk-fullscreen）。 */
  function closePop() { var p = document.getElementById('l7-pop'); if (p) p.remove(); document.removeEventListener('keydown', onKey, true); }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); closePop(); } }
  window.l7Pop = function (k) {
    closePop();
    var s = (typeof wkSlides !== 'undefined' ? wkSlides : []).find(function (x) { return x.label === '代表作·' + k; });
    if (!s) return;
    var box = document.createElement('div');
    box.id = 'l7-pop';
    box.innerHTML = '<div class="l7p-box" role="dialog" aria-label="〈' + k + '〉"><div class="l7p-top"><b class="l7p-title">' + s.head + '</b><span class="l7p-sp"></span>' +
      '<button type="button" class="l7p-tr">翻譯</button><button type="button" class="l7p-x" aria-label="關閉">✕</button></div><div class="l7p-body"></div></div>';
    var body = box.querySelector('.l7p-body');
    body.innerHTML = s.body;
    body.querySelectorAll('.l7-nav').forEach(function (n) { n.remove(); });
    box.addEventListener('click', function (e) { if (e.target === box) closePop(); });
    box.querySelector('.l7p-x').onclick = closePop;
    var tr = box.querySelector('.l7p-tr');
    tr.onclick = function () { var on = !tr.classList.contains('on'); tr.classList.toggle('on', on); body.querySelectorAll('.l7-y').forEach(function (y) { y.classList.toggle('show', on); }); };
    (document.fullscreenElement || document.body).appendChild(box);
    document.addEventListener('keydown', onKey, true);
  };
})();
