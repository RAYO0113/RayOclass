/* V126 追問引導：配合 149_guide-css。資料（課文 ask 陣列的 HTML）裡的 onclick 呼叫這兩個函式。
   gdTap：點追問 → 顯示答案、出現下一個追問（最後一個問完 → 出現小結論）；點小結論 → 顯示內容並出現板書；點板書 → 顯示板書。再點一次收起答案。
   gdAll：全部展開（老師備課用）；再按一次全部收回到只剩第一問。
   V151：主問題可點的（〈火車線〉）改成一步一步：點題目 → 出現答案；再點 → 出現下一個追問（老師 10/20）。
         主問題的答案在 .gd-q 裡的 .gd-qa；沒有 .gd-qa 的主問題，點一下直接出現第一個追問。〈論語選〉不變。 */
(function () {
  'use strict';
  function isNext(n) { return n && (n.classList.contains('gd-s') || n.classList.contains('gd-end') || n.classList.contains('gd-board')); }
  window.gdTap = function (el) {
    var n = el.nextElementSibling, box = el.closest('.gd'), q = box && box.querySelector('.gd-q');
    var step = q && q.hasAttribute('onclick');   /* V151：主問題可點 → 一步一步 */
    if (!step) {
      if (!el.classList.contains('show')) {
        el.classList.add('show');
        if (isNext(n)) n.classList.add('vis');
      } else {
        el.classList.remove('show');
      }
      return;
    }
    var hasAns = !el.classList.contains('gd-q') || !!el.querySelector('.gd-qa');
    if (hasAns && !el.classList.contains('show')) { el.classList.add('show'); return; }   /* 第一下：出現答案 */
    if (isNext(n) && !n.classList.contains('vis')) { n.classList.add('vis'); if (!hasAns) el.classList.add('show'); return; }   /* 第二下：出現下一題 */
    if (hasAns) el.classList.remove('show');   /* 都出現了再點：收起答案 */
  };
  window.gdAll = function (btn) {
    var box = btn.closest('.gd'); if (!box) return;
    var open = !box.classList.contains('gd-open');
    box.classList.toggle('gd-open', open);
    var q = box.querySelector('.gd-q'), qTap = q && q.hasAttribute('onclick');   /* V136：主問題可點的（〈火車線〉），收起時連第一問也收 */
    if (qTap) q.classList.toggle('show', open);
    box.querySelectorAll('.gd-s, .gd-end, .gd-board').forEach(function (x, i) {
      x.classList.toggle('vis', open || (i === 0 && !qTap));
      x.classList.toggle('show', open);
    });
    btn.textContent = open ? '收起' : '全部展開';
  };
})();
