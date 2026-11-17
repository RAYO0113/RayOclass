(function () {
  /* V260（老師 11/17「講稿放到手機版就好」「如何對照到手機的講稿，一併設計」；規範：教學系統 docs/規格_課文畫卷製作規範.md §12）
     課文畫卷（hj/index.html?l=<課代號>）嵌在網站裡時，每走一步送 hjStep {l:課代號, id:步驟代號, i:第幾步, n:總步數}；
     這裡記下來，交給 186 的講稿同步送出去（位置代號 hj:<課代號>:<步驟代號>，例 hj:changgan:3-1/mean）。只送位置，不送內容。
     只認「正在顯示的那個畫卷 iframe」：class 要有 wk-hj-frame（之後接進課文頁的入口要用這個 class），而且看得到。
     ⚠ 同名陷阱（AGENTS.md §10.3）：window.V217TN_EXT 原本是 196（樂府長卷）定義的。本檔先存下原本的，
       畫卷沒有位置（不在畫卷、畫卷藏起來）時呼叫原本的 → 長卷照常同步。實際生效的 V217TN_EXT＝本檔這一支（它再叫 196 的）。 */
  var prev = window.V217TN_EXT;
  var cur = null, src = null;   /* cur＝{ l, id, i, n }；src＝送來的那個 iframe */
  function shown(f) { return !!f && f.isConnected && f.style.display !== 'none' && f.getClientRects().length > 0; }
  window.V217TN_EXT = function (s) {
    if (cur && shown(src)) return { id: ('hj:' + cur.l + ':' + cur.id).slice(0, 80), h: ('畫卷　' + cur.id + '（' + (cur.i + 1) + '/' + cur.n + '）').slice(0, 60) };
    return prev ? prev(s) : null;
  };
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object' || !d.hjStep) return;
    var fs = document.querySelectorAll('iframe.wk-hj-frame'), f = null;
    for (var i = 0; i < fs.length; i++) if (fs[i].contentWindow === e.source && shown(fs[i])) f = fs[i];
    if (!f) return;   /* 只認正在顯示的那個畫卷（一般畫面、投影可能各一個） */
    var l = String(d.hjStep.l || '').replace(/[^\w-]/g, ''), id = String(d.hjStep.id || '').replace(/[^\w\/-]/g, '');
    if (!l || !id) return;
    cur = { l: l, id: id, i: +d.hjStep.i || 0, n: +d.hjStep.n || 0 }; src = f;
    if (window.V217TN && window.V217TN.now) window.V217TN.now();
  });
})();
