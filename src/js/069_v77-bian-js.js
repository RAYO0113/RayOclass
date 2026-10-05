
(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ① 浮框（老師指示；PPT 第 110 張） ── */
  var FIX = [
    [3, 1, '{g:書|書本}', '{g:書|誦讀書本}'],
    [3, 1, '授{g:之|代名詞，他們}', '授{g:之|代名詞，他們，指童子}'],
    [3, 0, '}師焉，{n:20|', '}師{g:焉|（助）無義}，{n:20|']
  ];
  FIX.forEach(function (f) {
    try {
      var L = T.textPages[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v77] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v77] 浮框替換失敗：', f[2], e); }
  });

  /* ── ② 「辨」連結：位置逐一對照 RAY PPT 第 66、79、97、136、149、163 張課文頁上的「辨」標記 ── */
  var BIAN = [
    { k:'學者', a:'古之學者必有師', w:'古之學者' },           /* 66 */
    { k:'者', a:'師者，所以', w:'師者' },                     /* 66 */
    { k:'庸', a:'夫庸知其年', w:'夫庸' },                     /* 79 */
    { k:'所以', a:'聖人之所以為聖', w:'聖人之所以' },         /* 97 */
    { k:'其', a:'其皆出於此乎', w:'其' },                     /* 97 */
    { k:'不齒／不恥', a:'君子不齒', w:'君子不齒' },           /* 136 */
    { k:'師', a:'弟子不必不如師，師不必', w:'弟子不必不如師' }, /* 149 */
    { k:'於', a:'請學於余', w:'請學於' },                     /* 163 */
    { k:'其', a:'余嘉其能行', w:'余嘉其' },                   /* 163 */
    { k:'貽', a:'以貽之', w:'以貽' }                          /* 163 */
  ];
  var SKIP = '.tp-gd, .tp-num, sup, .ss-zong, .v77-bian, rt';
  var ZYONLY = /^[\sˊˇˋ˙ㄅ-ㄯ]+$/;
  function textMap(line) {
    var w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, null), n, s = '', map = [];
    while ((n = w.nextNode())) {
      var pe = n.parentElement;
      if (!pe || pe.offsetParent === null || pe.closest(SKIP) || ZYONLY.test(n.nodeValue)) continue;
      for (var i = 0; i < n.nodeValue.length; i++) map.push([n, i]);
      s += n.nodeValue;
    }
    return { s: s, map: map };
  }
  function jumpIdx(k) {
    for (var i = 0; i < wkSlides.length; i++) if (wkSlides[i].type === 'charbian' && wkSlides[i].first && wkSlides[i].name === k) return i;
    return -1;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var lines = area.querySelectorAll('.wks-textpage .tp-line');
    if (!lines.length) return;
    BIAN.forEach(function (c) {
      var idx = jumpIdx(c.k);
      if (idx < 0) return;
      lines.forEach(function (line) {
        if (line.querySelector('.v77-bian[data-a="' + c.a + '"]')) return;
        var tm = textMap(line), at = tm.s.indexOf(c.a);
        if (at < 0) return;
        var wi = c.a.indexOf(c.w);
        if (wi < 0) return;
        var end = tm.map[at + wi + c.w.length - 1];
        if (!end) return;
        var node = end[0], off = end[1] + 1;
        var b = document.createElement('span');
        b.className = 'v77-bian'; b.setAttribute('data-a', c.a); b.setAttribute('data-k', c.k);
        b.title = '字詞辨析：' + c.k;
        b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); v68CbJump(e, idx); });
        /* 字在可點的字義／注釋元素末端時，連結放在該元素之後（不塞進浮框元素裡） */
        var host = node.parentElement.closest('.tp-g, .tp-n, .tp-p');
        var hostEnd = false;
        if (host) {
          var rest = off < node.nodeValue.length ? node.nodeValue.slice(off) : '';
          if (!rest.trim()) {
            var hm = textMap(host).map, last = hm[hm.length - 1];
            hostEnd = last && last[0] === node && last[1] === off - 1;
          }
        }
        if (host && hostEnd) host.parentNode.insertBefore(b, host.nextSibling);
        else {
          var after = off < node.nodeValue.length ? node.splitText(off) : node.nextSibling;
          node.parentNode.insertBefore(b, after);
        }
      });
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }
  var _v77render = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v77render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });
})();
