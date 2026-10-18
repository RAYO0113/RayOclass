/* V126 追問引導：配合 149_guide-css。資料（課文 ask 陣列的 HTML）裡的 onclick 呼叫這兩個函式。
   gdTap：點追問 → 顯示答案、出現下一個追問（最後一個問完 → 出現小結論）；點小結論 → 顯示內容並出現板書；點板書 → 顯示板書。再點一次收起答案。
   gdAll：全部展開（老師備課用）；再按一次全部收回到只剩第一問。 */
(function () {
  'use strict';
  window.gdTap = function (el) {
    if (!el.classList.contains('show')) {
      el.classList.add('show');
      var n = el.nextElementSibling;
      if (n && (n.classList.contains('gd-s') || n.classList.contains('gd-end') || n.classList.contains('gd-board'))) n.classList.add('vis');
    } else {
      el.classList.remove('show');
    }
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
