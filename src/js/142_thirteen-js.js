/* V120：〈論語選〉「十三經的演變」動畫頁（接在「題解·補充｜《論語》詳表」之後）。
   內容依據：教學系統專案 docs/課文盤點/十三經演變_資料整理.md（課本作品地位欄＋中山大學周春健文＋臺北市孔廟＋維基）。
   課本有寫的（唐文宗時十二經、南宋光宗時十三經）照課本；《孟子》入經時間各家不一，採課本說法。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var AFTER = /《論語》詳表/;
  /* 每部經一個方塊；順序固定，方便看出「拆開／加入」 */
  var BOOKS = [
    { id: '易', t: '易' }, { id: '書', t: '書' }, { id: '詩', t: '詩' },
    { id: '禮', t: '禮' }, { id: '周禮', t: '周禮' }, { id: '儀禮', t: '儀禮' }, { id: '禮記', t: '禮記' },
    { id: '樂', t: '樂' },
    { id: '春秋', t: '春秋' }, { id: '左傳', t: '左傳' }, { id: '公羊傳', t: '公羊傳' }, { id: '穀梁傳', t: '穀梁傳' },
    { id: '論語', t: '論語' }, { id: '孝經', t: '孝經' }, { id: '爾雅', t: '爾雅' }, { id: '孟子', t: '孟子' }
  ];
  /* show：該階段出現的書；add：本階段新加入（亮色）；gone：本階段消失（打叉後淡出）；split：拆開的來源 */
  var STEPS = [
    { era: '先秦', name: '六經', show: ['易', '書', '詩', '禮', '樂', '春秋'],
      cap: '《莊子．天運》最早出現「六經」之名：《詩》《書》《禮》《樂》《易》《春秋》。' },
    { era: '西漢', name: '五經', show: ['易', '書', '詩', '禮', '春秋'], gone: ['樂'],
      cap: '《樂經》亡佚，只剩五經。漢武帝立「五經博士」（前 136 年），儒學成為官學；此時《禮》指《儀禮》。',
      note: '東漢另有「七經」的說法：五經＋《論語》《孝經》。' },
    { era: '唐代', name: '九經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳'],
      split: { '禮': ['周禮', '儀禮', '禮記'], '春秋': ['左傳', '公羊傳', '穀梁傳'] },
      cap: '《禮》分成「三禮」：《周禮》《儀禮》《禮記》；《春秋》分成「三傳」：《左傳》《公羊傳》《穀梁傳》。',
      note: '易＋書＋詩＋三禮＋三傳＝1＋1＋1＋3＋3＝9' },
    { era: '唐文宗．開成石經', name: '十二經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅'],
      add: ['論語', '孝經', '爾雅'],
      cap: '開成年間在國子學刻石（開成石經），九經之外加上《論語》《孝經》《爾雅》。',
      note: '課本：《論語》「唐文宗時，列為十二經之一」。' },
    { era: '南宋光宗', name: '十三經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅', '孟子'],
      add: ['孟子'],
      cap: '《孟子》由「子」書升格為「經」，十二經加《孟子》，成為流傳至今的「十三經」。',
      note: '課本：「南宋光宗時，列為十三經之一」。明代欽定《十三經注疏》，十三經之名完全確立。' }
  ];
  var SUMMARY = '六經 →（《樂》亡佚）五經 →（禮分三禮、春秋分三傳）九經 →（＋論語、孝經、爾雅）十二經 →（＋孟子）十三經';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function slideHTML() {
    var tl = STEPS.map(function (s, i) {
      return '<button class="t13-dot" data-i="' + i + '" onclick="t13Go(this,' + i + ')"><b>' + esc(s.name) + '</b><span>' + esc(s.era) + '</span></button>';
    }).join('<span class="t13-arrow">→</span>');
    var books = BOOKS.map(function (b) {
      return '<span class="t13-b" data-id="' + esc(b.id) + '">' + esc(b.t) + '</span>';
    }).join('');
    return '<div class="wk-slide wks-keyrhet v73-kr t13-slide">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">十三經的演變</span><span class="wks-kr-sub">從六經到十三經〈論語選〉</span></div>' +
      '<div class="t13" data-st="0">' +
        '<div class="t13-tl">' + tl + '</div>' +
        '<div class="t13-head"><span class="t13-era"></span><span class="t13-name"></span><span class="t13-count"></span></div>' +
        '<div class="t13-stage">' + books + '</div>' +
        '<div class="t13-cap"></div><div class="t13-note"></div>' +
        '<div class="t13-sum">' + esc(SUMMARY) + '</div>' +
        '<div class="v73-ctrl"><button class="v73-btn t13-next" onclick="t13Step(this)">▶ 下一步</button>' +
        '<button class="v73-btn rst" onclick="t13Reset(this)">↻ 重來</button></div>' +
      '</div></div>';
  }

  /* FLIP：先記下舊位置，改版面後從舊位置滑到新位置 */
  function rects(box) { var m = {}; box.querySelectorAll('.t13-b').forEach(function (b) { if (b.classList.contains('on')) m[b.dataset.id] = b.getBoundingClientRect(); }); return m; }
  function render(box, i, animate) {
    var S = STEPS[i], stage = box.querySelector('.t13-stage');
    var before = animate ? rects(box) : {};
    var prev = i > 0 ? STEPS[i - 1] : null;
    box.dataset.st = i;
    box.querySelectorAll('.t13-dot').forEach(function (d, j) { d.classList.toggle('cur', j === i); d.classList.toggle('done', j < i); });
    box.querySelector('.t13-era').textContent = S.era;
    box.querySelector('.t13-name').textContent = S.name;
    box.querySelector('.t13-count').textContent = '共 ' + S.show.length + ' 部';
    box.querySelector('.t13-cap').textContent = S.cap;
    var note = box.querySelector('.t13-note'); note.textContent = S.note || ''; note.style.display = S.note ? '' : 'none';
    box.querySelector('.t13-sum').classList.toggle('show', i === STEPS.length - 1);
    var nx = box.querySelector('.t13-next'); nx.disabled = i === STEPS.length - 1; nx.textContent = i === STEPS.length - 1 ? '✓ 完成' : '▶ 下一步';
    var splitFrom = {};
    if (animate && S.split) Object.keys(S.split).forEach(function (src) { S.split[src].forEach(function (c) { splitFrom[c] = src; }); });
    stage.querySelectorAll('.t13-b').forEach(function (b) {
      var id = b.dataset.id, on = S.show.indexOf(id) >= 0;
      var gone = animate && S.gone && S.gone.indexOf(id) >= 0;
      b.classList.remove('add', 'split', 'gone');
      b.style.transition = 'none'; b.style.transform = ''; b.style.opacity = '';
      if (gone) { b.classList.add('on', 'gone'); return; }   /* 先留在原位打叉，再淡出 */
      b.classList.toggle('on', on);
      if (on && S.add && S.add.indexOf(id) >= 0) b.classList.add('add');
      if (on && S.split && splitFrom[id] !== undefined) b.classList.add('split');
      if (on && !animate && S.split && Object.keys(S.split).some(function (k) { return S.split[k].indexOf(id) >= 0; })) b.classList.add('split');
    });
    if (!animate) return;
    void stage.offsetWidth;
    stage.querySelectorAll('.t13-b.on').forEach(function (b) {
      var id = b.dataset.id, a = before[id] || (splitFrom[id] && before[splitFrom[id]]), r = b.getBoundingClientRect();
      if (b.classList.contains('gone')) {
        setTimeout(function () { b.style.transition = 'opacity .6s, transform .6s'; b.style.opacity = '0'; b.style.transform = 'scale(.6)'; }, 900);
        setTimeout(function () { b.classList.remove('on', 'gone'); b.style.transition = 'none'; b.style.opacity = ''; b.style.transform = ''; render(box, i, false); }, 1600);
        return;
      }
      if (a) {
        b.style.transform = 'translate(' + (a.left - r.left) + 'px,' + (a.top - r.top) + 'px)';
        void b.offsetWidth;
        b.style.transition = 'transform .9s cubic-bezier(.5,0,.3,1), background .4s, color .4s';
        b.style.transform = '';
      } else {
        b.style.opacity = '0'; b.style.transform = 'translateY(-1.2em) scale(.7)';
        void b.offsetWidth;
        b.style.transition = 'transform .7s cubic-bezier(.3,1.4,.5,1) .5s, opacity .5s .5s';
        b.style.opacity = '1'; b.style.transform = '';
      }
    });
  }
  function boxOf(el) { return el.closest('.t13'); }
  window.t13Step = function (btn) { if (window.event) window.event.stopPropagation(); var box = boxOf(btn), i = +box.dataset.st; if (i < STEPS.length - 1) render(box, i + 1, true); };
  window.t13Go = function (btn, i) { if (window.event) window.event.stopPropagation(); var box = boxOf(btn), cur = +box.dataset.st; render(box, i, i === cur + 1); };
  window.t13Reset = function (btn) { if (window.event) window.event.stopPropagation(); render(boxOf(btn), 0, false); };
  function initAll() { document.querySelectorAll('.t13:not([data-init])').forEach(function (box) { box.dataset.init = '1'; render(box, 0, false); }); }
  new MutationObserver(initAll).observe(document.documentElement, { childList: true, subtree: true });

  /* ── 投影片：插在《論語》詳表之後 ── */
  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _parse.apply(this, arguments);
    if (key !== LESSON) return slides;
    var at = -1;
    slides.forEach(function (s, i) { if (at < 0 && s.type === 'info' && AFTER.test(String(s.label || ''))) at = i + 1; });
    if (at < 0) return slides;
    slides.splice(at, 0, { type: 't13anim' });
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
    });
    return slides;
  };
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 't13anim') return slideHTML();
    return _render.apply(this, arguments);
  };
})();
