(function () {
  /* V155：第一冊 L07～L10 上架（資料在 data/lessons/30～32.js；〈桃花源記〉07.js 補技高版課文）
     - 選讀古文：〈樂府詩選—長干行〉排在〈論語選〉後面（第一冊 L07）。
     - 白話文：〈茫茫人海中的一名女孩〉（L08）、〈極短篇小說選〉（L10）排在〈火車線〉後面；封面補「第一冊 第 N 課」。 */
  function after(arr, prev, keys) {
    keys.forEach(function (k) { var i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); });
    var at = arr.indexOf(prev);
    arr.splice.apply(arr, [at < 0 ? arr.length : at + 1, 0].concat(keys));
  }
  after(WK_EXTRA, '論語選—子路曾皙冉有公西華侍坐', ['樂府詩選—長干行']);
  after(WK_PROSE, '臺灣最美麗的火車線', ['茫茫人海中的一名女孩', '極短篇小說選']);

  var NO = { '茫茫人海中的一名女孩': '第一冊　第 8 課', '極短篇小說選': '第一冊　第 10 課' };
  var _prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _prev.apply(this, arguments);
    if (slide && slide.type === 'cover' && NO[slide.key] && h.indexOf('wks-pcover') >= 0 && h.indexOf('pc-no') < 0) {
      h = h.replace('<span class="pc-cat">白話文選讀</span>', '<span class="pc-cat">白話文選讀</span><span class="pc-no">' + NO[slide.key] + '</span>');
    }
    return h;
  };
})();
