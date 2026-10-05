
(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ① 「於」辨析簡化（老師：太複雜）：只留用法 ── */
  var YU = [
    ['向，表示趨向', '向'],
    ['從、由，表示所從', '從、由'],
    ['對於，表示動作行為的對象', '對於'],
    ['比，引進比較對象', '比'],
    ['被，置於動詞之後，表示被動', '被']
  ];
  (T.charBian || []).forEach(function (c) {
    if (c.name !== '於') return;
    c.pages.forEach(function (p) {
      YU.forEach(function (r) {
        var a = '>' + r[0] + '</span>', n = p.body.split(a).length - 1;
        if (n === 1) p.body = p.body.replace(a, '>' + r[1] + '</span>');
        else console.warn('[v79] 於 辨析替換次數不符', r[0], n);
      });
    });
  });

  /* ── ② 「總」字卡：左欄字形跨列合併（同一字形的義列共用一格），底線只畫在字形群組結尾 ── */
  function spanTerms() {
    var tbl = document.querySelector('#ss-anno-ov.v78-card #ss-body .ss-tbl');
    /* 表格會被重畫（v78 開卡時畫兩次），以儲存格本身是否已處理判斷，不在 tbl 上做記號 */
    if (!tbl || !tbl.querySelector('.ss-c-num:not(.v79-span) .v78-term')) return;
    var cells = Array.prototype.slice.call(tbl.children), rows = [];
    for (var i = 0; i + 2 < cells.length; i += 3) rows.push(cells.slice(i, i + 3));
    var g = null;
    rows.forEach(function (r) {
      var num = r[0];
      if (num.querySelector('.v78-term')) { g = { cell: num, n: 1 }; num.classList.add('v79-span'); }
      else if (g && !num.textContent.trim()) { g.n++; num.remove(); }
      else g = null;
      if (g) {
        g.cell.style.gridRow = 'span ' + g.n;
        g.cell.classList.toggle('ss-last', r[1].classList.contains('ss-last'));
      }
    });
  }
  function watch() {
    var ov = document.getElementById('ss-anno-ov');
    if (!ov) return false;
    new MutationObserver(spanTerms).observe(ov, { childList: true, subtree: true });
    return true;
  }
  if (!watch()) {
    var t = new MutationObserver(function () { if (watch()) t.disconnect(); });
    t.observe(document.body, { childList: true });
  }
})();
