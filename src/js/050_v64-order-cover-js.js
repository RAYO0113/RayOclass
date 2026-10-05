
(function () {
  /* ── 側欄三類依課次排序（依據：翰林 115 版技高國文六冊選文表；第 3～6 冊為暫訂）──
     表內沒有的課放在最後，維持原本相對順序。 */
  function reorder(arr, order) {
    var head = order.filter(function (k) { return arr.indexOf(k) >= 0; });
    var rest = arr.filter(function (k) { return order.indexOf(k) < 0; });
    arr.splice.apply(arr, [0, arr.length].concat(head, rest));
  }
  reorder(WK_14, ['師說', '桃花源記', '岳陽樓記', '郁離子選', '種樹郭橐駝傳', '夢溪筆談選', '燭之武退秦師',
    '紅樓夢', '赤壁賦', '天工開物', '蘭亭集序', '臺煤減稅片', '清代臺灣鐵路', '庖丁解牛']);
  reorder(WK_EXTRA, ['世說新語選', '論語選—子路曾皙冉有公西華侍坐', '詩經', '漁父', '晚由六橋待月記',
    '大同與小康', '鴻門宴', '勞山道士']);   /* 醉翁亭記、始得西山宴遊記、出師表：115 版選文表未收，排最後 */
  reorder(WK_PROSE, ['身為魚販', '散戲']); /* 散戲：115 版選文表未收 */

  /* ── 白話文封面 ── */
  var PROSE_NO = { '身為魚販': '第一冊　第 1 課' };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var _v64orig = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'cover' && (WK_PROSE.indexOf(slide.key) >= 0 || (slide.data && slide.data.type === 'prose'))) {
      var a = (slide.data && slide.data.author) || {};
      var name = (a.name || '').split('，')[0];
      var no = PROSE_NO[slide.key] || '';
      return '<div class="wk-slide wks-pcover">' +
        '<div class="pc-deco"><span class="pc-q pc-q1">「</span><span class="pc-q pc-q2">」</span></div>' +
        '<div class="pc-top"><span class="pc-cat">白話文選讀</span>' + (no ? '<span class="pc-no">' + no + '</span>' : '') + '</div>' +
        '<div class="pc-body"><h1 class="pc-title">' + esc(slide.key) + '</h1><div class="pc-rule"></div>' +
        '<div class="pc-author"><span class="pc-by">文／</span>' + esc(name) +
        (a.dynasty ? '<span class="pc-era">' + esc(String(a.dynasty).split('（')[0]) + '</span>' : '') + '</div></div>' +
        '<div class="pc-foot">瑞媛的國文教學</div>' +
        '</div>';
    }
    return _v64orig.apply(this, arguments);
  };
})();
