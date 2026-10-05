
(function () {
  /* 加入白話文清單，並依課次重排（第一冊 L01 身為魚販、L04 珍珠奶茶、L05 臺灣最美麗的火車線；散戲 115 版選文表未收，排最後） */
  ['珍珠奶茶', '臺灣最美麗的火車線'].forEach(function (k) { if (WK_PROSE.indexOf(k) < 0) WK_PROSE.push(k); });
  var order = ['身為魚販', '珍珠奶茶', '臺灣最美麗的火車線', '散戲'];
  var head = order.filter(function (k) { return WK_PROSE.indexOf(k) >= 0; });
  var rest = WK_PROSE.filter(function (k) { return order.indexOf(k) < 0; });
  WK_PROSE.splice.apply(WK_PROSE, [0, WK_PROSE.length].concat(head, rest));

  /* 白話文封面補冊次課次：v64 的 PROSE_NO 在閉包內，這裡在其輸出後補上（已有 pc-no 就不動） */
  var NO = { '珍珠奶茶': '第一冊　第 4 課', '臺灣最美麗的火車線': '第一冊　第 5 課' };
  var _v65prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _v65prev.apply(this, arguments);
    if (slide && slide.type === 'cover' && NO[slide.key] && h.indexOf('wks-pcover') >= 0 && h.indexOf('pc-no') < 0) {
      h = h.replace('<span class="pc-cat">白話文選讀</span>', '<span class="pc-cat">白話文選讀</span><span class="pc-no">' + NO[slide.key] + '</span>');
    }
    return h;
  };
})();
