(function () {
  /* V258（老師 11/16「講稿部分，長卷尚未同步；不只是換頁，換段落就要」）
     長卷（yf/index.html?embed=1）每換一頁、每按一步、讀詩每換一段，會送 yfStep 給這一層；
     這裡記下來，交給 186 的講稿同步送出去（位置代號 yf:<長卷頁代號>#<第幾步>，讀詩是 yf:讀詩·<作品名>#<第幾段>）。
     只送位置，不送內容。186 的 send() 透過 window.V217TN_EXT 取得長卷頁的代號。 */
  var cur = null;   /* { key, step, h } */
  function isYf(s) { return !!s && s.type === 'yf'; }
  window.V217TN_EXT = function (s) {
    if (!isYf(s) || !cur) return null;
    return { id: ('yf:' + cur.key + (cur.step >= 0 ? '#' + cur.step : '')).slice(0, 80), h: ('長卷　' + (cur.h || cur.key)).slice(0, 60) };
  };
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object' || !d.yfStep) return;
    var fs = document.querySelectorAll('iframe.wk-yf-frame'), mine = false;
    for (var i = 0; i < fs.length; i++) if (fs[i].contentWindow === e.source && fs[i].style.display !== 'none') mine = true;
    if (!mine) return;   /* 只認正在顯示的那個長卷（一般畫面、投影各一個） */
    cur = { key: String(d.yfStep.key || ''), step: +d.yfStep.step, h: String(d.yfStep.h || '') };
    if (isNaN(cur.step)) cur.step = -1;
    if (window.V217TN && window.V217TN.now) window.V217TN.now();
  });
})();
