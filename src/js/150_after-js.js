/* V126 課後引導（151_after-css）：資料是補充頁 body 的 HTML，onclick 呼叫下面幾個函式。
   ahNext：同一頁裡「下一步」——依序顯示下一個 .ah-step（追問、小結）；全部顯示後按鈕隱藏。
   wcPlay：文字雲動畫——讀 .wc 的 data-w（「詞:權重|詞:權重」，權重 1～3＝字的大小），打亂順序後一個一個跳出來。
   wcAdd：在文字雲加上同學的回答（輸入框按 Enter）；不存檔，換頁就消失。
   mmTap：心智圖節點——點開／收起它的下一層。 */
(function () {
  'use strict';
  var COLORS = ['#7c4da0', '#2c5f73', '#8a3a1c', '#4f8a78', '#b07a12', '#6b5a42', '#a0522d'];
  function word(t, w, i) {
    var s = document.createElement('span');
    s.className = 'wc-w wc-' + (w || 1);
    s.textContent = t;
    s.style.color = COLORS[i % COLORS.length];
    s.style.setProperty('--rot', ((i * 37) % 3 === 0 ? (i % 2 ? -6 : 6) : 0) + 'deg');
    return s;
  }
  window.wcPlay = function (btn) {
    var box = btn.closest('.ah-step') || btn.parentNode, wc = box.querySelector('.wc'); if (!wc) return;
    var items = String(wc.getAttribute('data-w') || '').split('|').filter(Boolean).map(function (x) {
      var p = x.split(':'); return { t: p[0], w: +p[1] || 1 }; });
    for (var i = items.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), k = items[i]; items[i] = items[j]; items[j] = k; }
    wc.innerHTML = ''; wc.classList.add('on');
    items.forEach(function (it, i) {
      var s = word(it.t, it.w, i); s.style.animationDelay = (i * 0.22) + 's'; wc.appendChild(s);
    });
    btn.style.display = 'none';
    var add = box.querySelector('.wc-add'); if (add) add.style.display = '';
  };
  window.wcAdd = function (inp, ev) {
    if (ev && (ev.key !== 'Enter' || ev.isComposing)) return;   /* 注音選字時的 Enter 不算 */
    var t = inp.value.trim(); if (!t) return;
    var wc = inp.closest('.ah-step').querySelector('.wc');
    var s = word(t, 2, wc.children.length + 3); s.classList.add('wc-mine'); wc.appendChild(s);
    inp.value = '';
  };
  window.ahNext = function (btn) {
    var box = btn.closest('.ah'); if (!box) return;
    var next = box.querySelector('.ah-step:not(.on)');
    if (next) { next.classList.add('on'); next.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    if (!box.querySelector('.ah-step:not(.on)')) btn.style.display = 'none';
  };
  window.mmTap = function (node, ev) {
    if (ev) ev.stopPropagation();
    var li = node.closest('.mm-n'); if (li) li.classList.toggle('open');
  };
})();
/* V126 跳到補充講義某一頁（依標題關鍵字找 hd2 頁），並在那頁加「⤺ 回原頁」；回去沿用 015_main 的 wkReturnToText。 */
(function () {
  'use strict';
  function addBack() {
    if (!window.wkReturnTo) return;
    document.querySelectorAll('#wk-slide-area .wk-slide, #wkfs-body .wk-slide').forEach(function (sl) {
      if (sl.querySelector('.ah-back')) return;
      var b = document.createElement('button'); b.className = 'ah-back'; b.textContent = '⤺ 回原頁';
      b.onclick = function (e) { e.stopPropagation(); if (typeof wkReturnToText === 'function') wkReturnToText(); };
      sl.insertBefore(b, sl.firstChild);
    });
  }
  window.wkGoHandout = function (ev, key) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    if (typeof wkSlides === 'undefined') return;
    var idx = -1;
    wkSlides.forEach(function (s, i) { if (idx < 0 && s.type === 'hd2' && s.page && String(s.page.title || '').indexOf(key) >= 0) idx = i; });
    if (idx < 0) return;
    window.wkReturnTo = { idx: wkIdx, li: null };
    wkGoto(idx);
    setTimeout(addBack, 60);
  };
})();
