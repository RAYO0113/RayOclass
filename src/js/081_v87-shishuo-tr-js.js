
/* v87：《師說》第四段「擇師而教之」語譯 教他 → 教他們（浮框 v76 已為「代名詞，他們」；老師 9/30 指示）。資料行不動，執行期精確替換，次數不符就略過並警告 */
(function () {
  var T = (typeof TEXTBOOK !== 'undefined') && TEXTBOOK['師說'];
  if (!T) return;
  var OLD = '就選擇老師來教他；', NEW = '就選擇老師來教他們；';
  try {
    var P = T.textPages[3], L = P.lines[0];
    [[L, 'tr'], [P, 'fan']].forEach(function (x) {
      var s = x[0][x[1]], n = s.split(OLD).length - 1;
      if (n !== 1) { console.warn('[v87] 語譯替換次數不符，略過：', x[1], n); return; }
      x[0][x[1]] = s.replace(OLD, NEW);
    });
  } catch (e) { console.warn('[v87] 語譯替換失敗', e); }
})();
