(function () {
  /* 答案總覽：答案寫在圖上的大題（〈火車線〉趣味文學體驗的車票），總覽只列得出文字，看不到車票。
     （老師 10/28）把該大題 note 裡的圖放進總覽該區，跟答案格一樣預設蓋住：點一下或「一鍵全開」才顯示。
     只認下表列出的課與大題；資料不改。 */
  var AO_IMG = [{ book: /火車線/, head: /趣味文學體驗/ }];
  var _prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _prev.apply(this, arguments);
    if (!slide || slide.type !== 'work_answers' || h.indexOf('wk-ao-page') < 0) return h;
    var W = slide.workbook || {};
    var hits = (W.sections || []).filter(function (s) {
      return s.kind === 'table' && /<img\b/.test(s.note || '') &&
        AO_IMG.some(function (r) { return r.book.test(W.title || '') && r.head.test(s.head || ''); });
    });
    if (!hits.length) return h;
    var box = document.createElement('div');
    box.innerHTML = h;
    hits.forEach(function (s) {
      var imgs = (s.note.match(/<img\b[^>]*>/g) || []).join('');
      var head = String(s.head).replace(/^\s*[壹貳參肆伍陸柒捌拾]\s+/, '').trim();
      box.querySelectorAll('.wk-ao-subhead').forEach(function (sh) {
        if (sh.textContent.trim() !== head) return;
        var d = document.createElement('div');
        d.className = 'wk-ao-chip ao-img';
        d.innerHTML = '<span>' + imgs + '</span>';
        sh.parentNode.appendChild(d);
      });
    });
    return box.innerHTML;
  };
})();
