/* V194：〈論語選〉補充講義遠看較清楚（老師 11/2：「遠看都糊在一起，沒好好標號分段，原文語譯都混在一起，應該換個顏色或用個底框」）。
   只改顯示，不動資料（data/lessons/01.js handoutV2 不變）：
   1. 表格儲存格裡用 <br> 接在一起的多行 → 分條：小標題行、編號條目（1. 或自動 ①②）、原文「」上色、「語譯：」改成有底框的語譯塊。
   2. 選項一行塞兩個（(A)…　(B)…）→ 一個選項一行。
   3. 閱讀文章的填空空白（連續空格）→ 畫成空格框；文章段落首行縮排。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var CIR = '①②③④⑤⑥⑦⑧⑨⑩';
  function txt(html) { var d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/ /g, ' ').trim(); }
  function quoteColor(html) { return html.replace(/「([^「」<>]{8,})」/g, '<span class="hdx-q">「$1」</span>'); }
  function fixCell(td) {
    var parts = td.innerHTML.split(/<br\s*\/?>/i).filter(function (h) { return txt(h); });
    if (parts.length < 2) return;
    var L = parts.map(function (h) {
      var t = txt(h), o = { h: h, t: t, k: 'p' };
      if (/^語譯[:：]/.test(t)) { o.k = 'tr'; o.h = h.replace(/語譯[:：]\s*/, ''); }
      else if (/^\(?\d{1,2}[\.．、)]/.test(t)) { o.k = 'n'; o.n = t.match(/\d{1,2}/)[0]; o.h = h.replace(/^(\s*(<[^>]+>)*\s*)\(?\d{1,2}[\.．、)]\s*/, '$1'); }
      return o;
    });
    /* 小標題：短、不以句號結尾、下一行是較長的內文 */
    L.forEach(function (o, i) {
      var nx = L[i + 1];
      if (o.k === 'p' && o.t.length <= 14 && !/[。！？」）]$/.test(o.t) && nx && nx.k === 'p' && nx.t.length > 20) o.k = 'hd';
    });
    var hasTr = L.some(function (o) { return o.k === 'tr'; }), hasN = L.some(function (o) { return o.k === 'n'; });
    var pCount = L.filter(function (o) { return o.k === 'p'; }).length;
    var autoNum = hasTr && !hasN && pCount >= 2, c = 0;   /* 原文＋語譯成對、沒有原編號 → 自動加 ①② */
    var out = L.map(function (o) {
      if (o.k === 'tr') return '<div class="hdx-tr"><span class="hdx-trk">語譯</span>' + o.h + '</div>';
      if (o.k === 'hd') return '<div class="hdx-hd">' + o.h + '</div>';
      if (o.k === 'n') return '<div class="hdx-it"><b class="hdx-n">' + o.n + '</b><div class="hdx-c">' + quoteColor(o.h) + '</div></div>';
      if (autoNum) return '<div class="hdx-it"><b class="hdx-n">' + CIR.charAt(c++ % 10) + '</b><div class="hdx-c">' + quoteColor(o.h) + '</div></div>';
      return '<div class="hdx-p">' + quoteColor(o.h) + '</div>';
    }).join('');
    td.innerHTML = out;
    td.classList.add('hdx-cell');
  }
  function fixOpt(el) {
    var h = el.innerHTML;
    if (!/[　 ]{2,}\([A-E]\)/.test(h)) return;
    el.innerHTML = h.split(/[　 ]{2,}(?=\([A-E]\))/).map(function (x) { return '<span class="hdx-opt">' + x + '</span>'; }).join('');
    el.classList.add('hdx-opts');
  }
  function fixPara(el) {
    if (/[　 ]{6,}|(&nbsp;){4,}/.test(el.innerHTML)) el.innerHTML = el.innerHTML.replace(/(?:[　 ]|&nbsp;){6,}/g, '<span class="hdx-gap"></span>');
  }
  function run() {
    if (document.body.getAttribute('data-wk') !== LESSON && (typeof wkKey === 'undefined' || wkKey !== LESSON)) return;
    document.querySelectorAll('.wks-hd2:not([data-hdx])').forEach(function (s) {
      s.setAttribute('data-hdx', '1');
      s.querySelectorAll('.hd-body td').forEach(function (td) { if (/<br/i.test(td.innerHTML)) fixCell(td); });
      s.querySelectorAll('.hd-opt').forEach(fixOpt);
      s.querySelectorAll('.hd-para').forEach(fixPara);
    });
  }
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
})();
