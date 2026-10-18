/* V136 介面調整（老師 10/18）
   ① 基礎練習、進階練習移到「賞析」後面（包一層 wkParseSlides，本檔載入最晚＝實際生效的最外層）。
      只搬 iquiz／iadv 這一段，搬完把「習作答案總覽」的 slideIdx 依新位置重新對應（不然點答案會跳錯頁）。
   ② 右側「註釋小考」邊籤收進「班級進度」面板（面板標題列多一個「📝 註釋小考」鈕，功能同原邊籤）。
   ③ 全螢幕「關閉浮框」從右側邊籤移到下方左右換頁列；換頁列變矮（樣式在 159_v136-ui-css）。
   ④ 〈論語選〉課名的破折號只顯示成「——」（佔兩格）。課名本身是資料的鑰匙（班級進度、日曆、小考紀錄都用它存），一個字都不改，只改畫面上的字。 */
(function () {
  'use strict';
  /* ① */
  if (typeof wkParseSlides === 'function') {
    var _parse = wkParseSlides;
    wkParseSlides = function (key) {
      var slides = _parse.apply(this, arguments);
      var ex = slides.map(function (s, i) { return (s.type === 'iquiz' || s.type === 'iadv') ? i : -1; }).filter(function (i) { return i >= 0; });
      var app = -1; slides.forEach(function (s, i) { if (s.type === 'info' && s.kind === 'appreciation') app = i; });
      if (!ex.length || app < 0 || ex[0] < app) return slides;
      for (var k = 1; k < ex.length; k++) if (ex[k] !== ex[k - 1] + 1) return slides;   /* 不連續就不動（保險） */
      var order = slides.map(function (s, i) { return i; }).filter(function (i) { return ex.indexOf(i) < 0; });
      var at = order.indexOf(app) + 1;
      order = order.slice(0, at).concat(ex, order.slice(at));
      var pos = {}; order.forEach(function (oldI, newI) { pos[oldI] = newI; });
      var out = order.map(function (i) { return slides[i]; });
      out.forEach(function (s) { if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx != null && pos[t.slideIdx] != null) t.slideIdx = pos[t.slideIdx]; }); });
      return out;
    };
  }

  /* ② */
  function nqInPanel() {
    var head = document.querySelector('#cls-panel .cls-head'), x = head && head.querySelector('.cls-x');
    if (!head || head.querySelector('.v136-nq')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'v136-nq'; b.textContent = '📝 註釋小考';
    b.onclick = function () {
      if (typeof clsToggle === 'function' && document.getElementById('cls-panel').classList.contains('open')) clsToggle();
      var t = document.getElementById('note-quiz-tab');
      if (t && typeof t.onclick === 'function') t.onclick(); else if (typeof nqToggle === 'function') nqToggle();
    };
    head.insertBefore(b, x);
  }

  /* ③ */
  function blueToFooter() {
    var b = document.getElementById('tp-close-blue-tab'), f = document.querySelector('#wk-fullscreen .wkfs-footer');
    if (!b || !f || b.parentNode === f) return;
    b.textContent = '✕ 浮框';
    f.appendChild(b);
  }

  /* ④ */
  var KEY_DASH = /(論語選)—(子路)/g;
  function fixDash(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, hit = [];
    while ((n = w.nextNode())) if (n.data.indexOf('選—子') >= 0 && !(n.parentElement && n.parentElement.closest('textarea,script,style,[contenteditable]'))) hit.push(n);
    hit.forEach(function (t) { t.data = t.data.replace(KEY_DASH, '$1——$2'); });
    root.querySelectorAll && root.querySelectorAll('option').forEach(function (o) { if (o.text.indexOf('選—子') >= 0) o.text = o.text.replace(KEY_DASH, '$1——$2'); });
  }
  function fixAll() { fixDash(document.body); }

  function init() { nqInPanel(); blueToFooter(); fixAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  if (window.MutationObserver) {
    var t = 0, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(fixAll, 80); });
    mo.observe(document.body, { childList: true, subtree: true, characterData: false });
  }
})();
