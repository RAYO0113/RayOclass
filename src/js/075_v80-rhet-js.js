
(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;
  var K = T.keyRhetoric || [];
  var CUO = K.filter(function (r) { return r.name === '錯綜'; })[0];
  var HUI = K.filter(function (r) { return r.name === '回文'; })[0];
  if (!CUO || !HUI) return;

  /* ── 例句（全部取自既有 keyRhetoric 資料與 RAY PPT 第 115～120、150～151 張；說明句取自各類定義） ── */
  var TYPES = [
    { no:'(一)', name:'抽換詞面', def:'以同義的詞語取代形式整齊句子中的某些詞語。', cls:'v80-sm', ex:[
      { k:'syn', src:'惠王用張儀之計，拔三川之地，西并巴、蜀，北收上郡，南取漢中，包九夷，制鄢、郢，東據成皋之險，割膏腴之壤。（李斯〈諫逐客書〉）',
        toks:['惠王用張儀之計，',['拔'],'三川之地，西',['并'],'巴、蜀，北',['收'],'上郡，南',['取'],'漢中，',['包'],'九夷，',['制'],'鄢、郢，東',['據'],'成皋之險，',['割'],'膏腴之壤。'],
        res:'取得', note:'拔、并、收、取、包、制、據、割皆為「取得」之同義詞。' } ] },
    { no:'(二)', name:'交錯語次', def:'上下兩句語詞的次序，故意弄得參差不齊。', cls:'v80-mid', ex:[
      { k:'ro', src:'句讀之不知，惑之不解，或師焉，或不焉。（韓愈〈師說〉）', ck:[[1,'句讀之不知'],[3,'惑之不解'],[2,'或師焉'],[4,'或不焉']],
        note:'「句讀之不知」配「或師焉」（1‧2）；「惑之不解」配「或不焉」（3‧4）。作者刻意交錯成 1‧3‧2‧4，使語勢參差、避免呆板，這就是交蹉語次。' },
      { k:'ro', src:'惟江上之清風，與山間之明月，耳得之而為聲，目遇之而成色。（蘇軾〈赤壁賦〉）', ck:[[1,'惟江上之清風'],[3,'與山間之明月'],[2,'耳得之而為聲'],[4,'目遇之而成色']],
        note:'「江上之清風」配「耳得之而為聲」（1‧2，聽覺）；「山間之明月」配「目遇之而成色」（3‧4，視覺）。交錯成 1‧3‧2‧4，使句式錯落有致。' } ] },
    { no:'(三)', name:'伸縮文身', def:'把字數相等的句子，故意布置成字數不等，使長句短句交相錯雜。', cls:'v80-mid', ex:[
      { k:'len', src:'野芳發而幽香，佳木秀而繁陰，風霜高潔，水落而石出者，山間之四時也。（歐陽脩〈醉翁亭記〉）',
        rows:['野芳發而幽香','佳木秀而繁陰','風霜高潔','水落而石出者'], hi:[2], tail:'山間之四時也。' },
      { k:'len', src:'春天像一篇巨製的駢儷文，而夏天像一首絕句。（簡媜〈夏之絕句〉）',
        rows:['春天像一篇巨製的駢儷文','而夏天像一首絕句'], hi:[1], tail:'' } ] },
    { no:'(四)', name:'變化句式', def:'將肯定句與否定句、直述句與疑問句，穿插寫入。', cls:'v80-mid', ex:[
      { k:'pn', src:'婚後生活不是磚，不是石，不是泥，不是沙，而是容忍，是體貼，是寬恕，是犧牲。',
        segs:['婚後生活',['n','不是磚'],'，',['n','不是石'],'，',['n','不是泥'],'，',['n','不是沙'],'，',['p','而是容忍'],'，',['p','是體貼'],'，',['p','是寬恕'],'，',['p','是犧牲'],'。'] },
      { k:'pn', src:'那榆蔭下的一潭，不是清泉，是天上虹。（徐志摩〈再別康橋〉）',
        segs:['那榆蔭下的一潭，',['n','不是清泉'],'，',['p','是天上虹'],'。'] } ] }
  ];
  var POEM = '潮隨暗浪雪山傾，遠浦漁舟釣月明。橋對寺門松徑小，檻當泉眼石波清。迢迢綠樹江天曉，靄靄紅霞晚日晴。遙望四邊雲接水，雪峰千點數鷗輕。';
  var HUI_EX = [
    { k:'swap', src:'弟子不必不如師，師不必賢於弟子。（韓愈〈師說〉）', r1:[['A','弟子'],['','不必不如'],['B','師'],['','，']], r2:[['B','師'],['','不必賢於'],['A','弟子'],['','。']] },
    { k:'swap', src:'開車不喝酒，喝酒不開車', r1:[['A','開車'],['','不'],['B','喝酒'],['','，']], r2:[['B','喝酒'],['','不'],['A','開車']] },
    { k:'swap', src:'讀書不忘救國，救國不忘讀書', r1:[['A','讀書'],['','不忘'],['B','救國'],['','，']], r2:[['B','救國'],['','不忘'],['A','讀書']] },
    { k:'swap', src:'文章是案頭之山水，山水是地上之文章', r1:[['A','文章'],['','是案頭之'],['B','山水'],['','，']], r2:[['B','山水'],['','是地上之'],['A','文章']] },
    { k:'poem', src:'蘇軾〈題金山寺迴文本〉', text:POEM, cls:'v80-sm' }
  ];

  /* ── 資料：錯綜只留「定義＋四類名稱」頁；回文只留定義頁；v73 的回文動畫頁改由本版取代 ── */
  var cuoDef = (CUO.pages[0].body.match(/<div class="rt-def">[\s\S]*?<\/div>/) || [''])[0];
  CUO.pages = [{ sub:'定義與四種類型', body: cuoDef + '<div class="v80-types">' + TYPES.map(function (t, i) {
    return '<div class="v80-type" onclick="v80GoType(event,' + i + ')">' + t.no + ' ' + t.name + '</div>'; }).join('') + '</div>' }];
  HUI.pages = [HUI.pages[0]];
  try { if (window.V73_ANIMS && V73_ANIMS['師說']) delete V73_ANIMS['師說']['回文']; } catch (e) {}

  /* ── 投影片：錯綜定義頁後插四類頁；回文定義頁後插動畫頁（位移習作答案總覽的跳題索引） ── */
  function insertAfter(slides, name, add) {
    var at = -1;
    slides.forEach(function (s, i) { if (s.type === 'keyrhet' && s.name === name) at = i + 1; });
    if (at < 0) return;
    Array.prototype.splice.apply(slides, [at, 0].concat(add));
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += add.length; });
    });
  }
  var _v80parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v80parse.apply(this, arguments);
    if (key !== '師說') return slides;
    insertAfter(slides, '錯綜', TYPES.map(function (t, i) { return { type:'v80rx', name:'錯綜', ti:i }; }));
    insertAfter(slides, '回文', [{ type:'v80rx', name:'回文', ti:-1 }]);
    return slides;
  };
  window.v80GoType = function (ev, i) {
    if (ev) ev.stopPropagation();
    for (var j = 0; j < wkSlides.length; j++) if (wkSlides[j].type === 'v80rx' && wkSlides[j].name === '錯綜' && wkSlides[j].ti === i) { wkGoto(j); return; }
  };

  /* ── 渲染 ── */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var NSTEP = { syn:2, ro:3, len:2, pn:3, swap:3, poem:2 };
  function exHTML(e) {
    var h = '';
    if (e.k === 'syn') {
      h = '<div class="v80-sy">' + e.toks.map(function (t) { return Array.isArray(t) ? '<span class="k kS">' + esc(t[0]) + '</span>' : esc(t); }).join('') + '</div>' +
        '<div class="v80-syn">' + e.toks.filter(Array.isArray).map(function (t) { return '<span class="chip">' + esc(t[0]) + '</span>'; }).join('') +
        '<span class="eq">＝</span><span class="res">' + esc(e.res) + '</span></div>';
    } else if (e.k === 'ro') {
      h = '<div class="v80-ro">' + e.ck.map(function (c) {
        return '<span class="ck g' + (c[0] <= 2 ? 1 : 2) + '" data-n="' + c[0] + '">' + esc(c[1]) + '<i>' + c[0] + '</i></span>'; }).join('') + '</div>';
    } else if (e.k === 'len') {
      h = '<div class="v80-len">' + e.rows.map(function (r, i) {
        return '<div class="ln' + (e.hi.indexOf(i) >= 0 ? ' hi' : '') + '">' + Array.from(r).map(function (c) { return '<span class="c">' + esc(c) + '</span>'; }).join('') +
          '<span class="cnt">' + Array.from(r).length + ' 字</span></div>'; }).join('') +
        (e.tail ? '<div class="ln tail">' + esc(e.tail) + '</div>' : '') + '</div>';
    } else if (e.k === 'pn') {
      h = '<div class="v80-pn">' + e.segs.map(function (s) {
        return Array.isArray(s) ? '<span class="seg ' + (s[0] === 'n' ? 'neg' : 'pos') + '">' + esc(s[1]) + '</span>' : esc(s); }).join('') + '</div>' +
        '<div class="v80-leg"><span class="ln">否定句</span><span class="lp">肯定句</span></div>';
    } else if (e.k === 'swap') {
      var row = function (r, c) { return '<div class="row ' + c + '">' + r.map(function (t) {
        return t[0] ? '<span class="k k' + t[0] + '" data-k="' + t[0] + '">' + esc(t[1]) + '</span>' : '<span class="' + (t[1].length > 1 ? 'mid' : '') + '">' + esc(t[1]) + '</span>';
      }).join('') + '</div>'; };
      h = '<div class="v73-hw">' + row(e.r1, 'r1') + row(e.r2, 'r2') + '</div>';
    } else if (e.k === 'poem') {
      var chars = Array.from(e.text.replace(/[，。]/g, ''));
      var lines = function (arr) { var out = []; for (var i = 0; i < arr.length; i += 7) out.push(arr.slice(i, i + 7).join('') + (i / 7 % 2 ? '。' : '，')); return out; };
      var fwd = lines(chars), rev = lines(chars.slice().reverse());
      var mark = function (L, first) { return L.map(function (l, i) {
        var s = esc(l);
        if (i === 0 && first) s = '<span class="ends">' + s.charAt(0) + '</span>' + s.slice(1);
        if (i === L.length - 1 && !first) s = s.slice(0, -2) + '<span class="ends">' + s.slice(-2, -1) + '</span>' + s.slice(-1);
        return s; }).join('<br>'); };
      h = '<div class="v80-poem"><div class="pc"><div class="h">順讀</div>' + mark(fwd, false) + '</div>' +
        '<div class="pc rev"><div class="h">由末字倒讀</div><div class="pc-t">' + mark(rev, true) + '</div></div></div>';
    }
    return '<div class="v73-src">' + esc(e.src) + '</div><div class="v73-stage">' + h + '<svg class="v73-svg"></svg></div>' +
      (e.note ? '<div class="v73-note">' + esc(e.note) + '</div>' : '');
  }
  function tabName(e, i) { return '例' + '一二三四五六'[i]; }
  function boxHTML(exs, cap, cls) {
    var tabs = exs.length > 1 ? '<div class="v73-tabs">' + exs.map(function (e, i) {
      return '<button class="v73-tab' + (i ? '' : ' on') + '" onclick="v80Show(this,' + i + ')">' + tabName(e, i) + '</button>'; }).join('') + '</div>' : '';
    /* 控制列放在上方（與例句分頁同一列），全螢幕時不會被下方換頁列遮住 */
    return '<div class="v73a ' + (cls || '') + '" data-ex="0" data-st="0"><div class="v80-top">' + tabs +
      '<div class="v73-ctrl"><button class="v73-btn" onclick="v80Step(this)">▶ 下一步</button>' +
      '<button class="v73-btn rst" onclick="v80Reset(this)">↻ 重來</button><span class="v73-tip"></span></div></div>' +
      exs.map(function (e, i) {
      return '<div class="v73-ex' + (i ? '' : ' cur') + ' ' + (e.cls || '') + '" data-k="' + e.k + '" data-n="' + NSTEP[e.k] + '">' + exHTML(e) + '</div>'; }).join('') +
      '<div class="v73-cap">' + esc(cap) + '</div></div>';
  }
  function slideHTML(s) {
    var name, sub, def, box;
    if (s.name === '錯綜') {
      var t = TYPES[s.ti];
      sub = t.no + ' ' + t.name; def = t.def;
      box = boxHTML(t.ex, '錯綜' + t.no + t.name + '：' + t.def, t.cls);
    } else {
      sub = '動畫（' + HUI_EX.length + ' 例）'; def = '上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復）。';
      box = boxHTML(HUI_EX, '回文：上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復），形成往復迴環的趣味。', 'v80-mid');
    }
    return '<div class="wk-slide wks-keyrhet v73-kr v73-anim-slide v80-rx">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">' + esc(s.name) + '</span><span class="wks-kr-sub">' + esc(sub) + '</span></div>' +
      '<div class="v80-tdef">' + esc(def) + '</div>' + box + '</div>';
  }
  var _v80render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'v80rx') return slideHTML(slide);
    return _v80render.apply(this, arguments);
  };

  /* ── 動畫控制 ── */
  function rel(el, base) { var x = 0, y = 0, n = el; while (n && n !== base) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x:x, y:y, w:el.offsetWidth, h:el.offsetHeight }; }
  function drawPath(svg, d, color) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color); svg.appendChild(p);
    var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; void p.getBoundingClientRect(); p.classList.add('v73-draw');
  }
  function words(ex) { return Array.prototype.map.call(ex.querySelectorAll('.r1 .k'), function (k) { return '「' + k.textContent + '」'; }).join('與'); }
  var TIPS = {
    syn: function (ex, st) { return ['① 找出換用的字', '② 意思相同，都是「' + ex.querySelector('.res').textContent + '」'][st - 1]; },
    ro: function (ex, st) { return ['① 標出原本的配對順序', '② 還原成整齊的配對：1‧2／3‧4', '③ 作者刻意交錯成 1‧3‧2‧4'][st - 1]; },
    len: function (ex, st) { return ['① 逐字排列', '② 字數不等，長短交錯'][st - 1]; },
    pn: function (ex, st) { return ['① 否定句', '② 肯定句', '③ 肯定句與否定句穿插寫入'][st - 1]; },
    swap: function (ex, st) { return ['① 找出關鍵詞：' + words(ex), '② 下句把兩個詞的位置對調', '③ 位置互換、循環相對'][st - 1]; },
    poem: function (ex, st) { return ['① 順讀全詩', '② 從最後一字倒著讀，也成一首詩'][st - 1]; }
  };
  function apply(ex, st) {
    var k = ex.dataset.k, stage = ex.querySelector('.v73-stage'), svg = ex.querySelector('.v73-svg');
    ex.classList.add('s' + st);
    if (k === 'syn') {
      if (st === 1) ex.querySelectorAll('.kS').forEach(function (x, i) { setTimeout(function () { x.classList.add('lit'); }, i * 220); });
      if (st === 2) { ex.querySelector('.v80-syn').classList.add('show'); var n = ex.querySelector('.v73-note'); if (n) n.classList.add('show'); }
    } else if (k === 'ro') {
      var ro = ex.querySelector('.v80-ro');
      if (st === 1) ro.classList.add('num');
      if (st === 2) {
        var cks = Array.prototype.slice.call(ro.querySelectorAll('.ck')), first = cks.map(function (c) { return c.getBoundingClientRect(); });
        cks.slice().sort(function (a, b) { return a.dataset.n - b.dataset.n; }).forEach(function (c, i) {
          ro.appendChild(c);
          if (i === 1) { var sp = document.createElement('span'); sp.className = 'sep'; sp.textContent = '／'; ro.appendChild(sp); }
        });
        cks.forEach(function (c, i) {
          var a = first[i], b = c.getBoundingClientRect();
          c.style.transition = 'none'; c.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
          void c.offsetWidth; c.style.transition = 'transform .9s cubic-bezier(.5,0,.3,1)'; c.style.transform = '';
        });
        ro.classList.add('grp');
      }
      if (st === 3) { var nt = ex.querySelector('.v73-note'); if (nt) nt.classList.add('show'); }
    } else if (k === 'len') {
      var ln = ex.querySelector('.v80-len');
      if (st === 1) ln.classList.add('box');
      if (st === 2) ln.classList.add('cnt-on');
    } else if (k === 'pn') {
      var pn = ex.querySelector('.v80-pn');
      if (st === 1) pn.classList.add('s-neg');
      if (st === 2) pn.classList.add('s-pos');
    } else if (k === 'swap') {
      if (st === 1) ex.querySelectorAll('.r1 .k').forEach(function (x) { x.classList.add('lit'); });
      if (st === 2) ex.querySelectorAll('.r2 .k').forEach(function (t) {
        var src = ex.querySelector('.r1 .k[data-k="' + t.dataset.k + '"]'), a = src.getBoundingClientRect(), b = t.getBoundingClientRect();
        t.classList.add('lit'); t.style.transition = 'none'; t.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
        void t.offsetWidth; t.style.transition = 'transform 1s cubic-bezier(.5,0,.3,1), background .4s, color .4s'; t.style.transform = '';
      });
      if (st === 3) ['A', 'B'].forEach(function (key) {
        var p = rel(ex.querySelector('.r1 .k[data-k="' + key + '"]'), stage), q = rel(ex.querySelector('.r2 .k[data-k="' + key + '"]'), stage);
        drawPath(svg, 'M' + (p.x + p.w / 2) + ' ' + (p.y + p.h) + ' L' + (q.x + q.w / 2) + ' ' + q.y, key === 'A' ? '#1f5fa8' : '#c0392b');
      });
    } else if (k === 'poem') {
      if (st === 2) ex.querySelector('.v80-poem').classList.add('show');
    }
  }
  function syncBtn(box) {
    var exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, n = +exs[ei].dataset.n, btn = box.querySelector('.v73-btn:not(.rst)');
    btn.disabled = false;
    btn.textContent = st < n ? '▶ 下一步' : (ei + 1 < exs.length ? '▶ 下一例' : '▶ 總結');
    if (box.querySelector('.v73-cap.show')) { btn.disabled = true; btn.textContent = '✓ 完成'; }
  }
  var SRC = {};
  function resetEx(ex) {
    var id = ex.dataset.rid; if (!id) { id = ex.dataset.rid = 'r' + Math.random().toString(36).slice(2); }
    if (!SRC[id]) SRC[id] = ex.innerHTML; else ex.innerHTML = SRC[id];
    ex.className = ex.className.replace(/\bs\d\b/g, '').replace(/\s+/g, ' ').trim();
    if (!/\bcur\b/.test(ex.className)) ex.className += ' cur';
  }
  function show(box, i) {
    box.querySelectorAll('.v73-ex').forEach(function (e, j) { e.classList.toggle('cur', j === i); });
    box.querySelectorAll('.v73-tab').forEach(function (t, j) { t.classList.toggle('on', j === i); });
    resetEx(box.querySelectorAll('.v73-ex')[i]);
    box.dataset.ex = i; box.dataset.st = 0;
    box.querySelector('.v73-cap').classList.remove('show'); box.querySelector('.v73-tip').textContent = '';
    syncBtn(box);
  }
  window.v80Show = function (el, i) { if (window.event) window.event.stopPropagation(); show(el.closest('.v73a'), i); };
  window.v80Reset = function (btn) { if (window.event) window.event.stopPropagation(); show(btn.closest('.v73a'), +btn.closest('.v73a').dataset.ex); };
  window.v80Step = function (btn) {
    if (window.event) window.event.stopPropagation();
    var box = btn.closest('.v73a'), exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, ex = exs[ei], n = +ex.dataset.n;
    if (!ex.dataset.rid) resetEx(ex);
    if (st >= n) {
      if (ei + 1 < exs.length) { show(box, ei + 1); return; }
      box.querySelector('.v73-cap').classList.add('show'); box.querySelector('.v73-tip').textContent = ''; syncBtn(box); return;
    }
    st++; box.dataset.st = st; apply(ex, st);
    box.querySelector('.v73-tip').textContent = TIPS[ex.dataset.k](ex, st) || '';
    syncBtn(box);
  };

  /* ── 導覽列：映襯、設問、轉品、頂針、類疊、引用 收成「修辭 ▾」（一般＋全螢幕） ── */
  var FOLD = ['映襯', '設問', '轉品', '頂針', '類疊', '引用'];
  function fold(boxId, btnCls, activeCls) {
    var box = document.getElementById(boxId);
    if (!box || typeof wkKey === 'undefined' || wkKey !== '師說' || box.querySelector('.v80-rh-toggle')) return;
    var btns = Array.prototype.filter.call(box.querySelectorAll('button.' + btnCls), function (b) {
      return FOLD.indexOf((b.textContent || '').replace(/^◆/, '').trim()) >= 0; });
    if (btns.length < 2) return;
    var tog = document.createElement('button'); tog.type = 'button'; tog.className = btnCls + ' v80-rh-toggle'; tog.textContent = '◆修辭 ▾';
    var grp = document.createElement('span'); grp.className = 'v80-rh-group';
    tog.onclick = function (e) { e.stopPropagation(); var o = grp.classList.toggle('open'); tog.textContent = o ? '◆修辭 ▴' : '◆修辭 ▾'; };
    box.insertBefore(tog, btns[0]); box.insertBefore(grp, btns[0]);
    btns.forEach(function (b) { grp.appendChild(b); });
  }
  function mark() {
    [['wk-sections', 'wk-sec-active'], ['wkfs-sections', 'active']].forEach(function (p) {
      var box = document.getElementById(p[0]), tog = box && box.querySelector('.v80-rh-toggle');
      if (tog) tog.classList.toggle(p[1], !!box.querySelector('.v80-rh-group .' + p[1]));
    });
  }
  var _v80show = showWenxue;
  showWenxue = function () { var r = _v80show.apply(this, arguments); fold('wk-sections', 'wk-sec-btn'); mark(); return r; };
  var _v80proj = wkOpenProj;
  wkOpenProj = function () { var r = _v80proj.apply(this, arguments); fold('wkfs-sections', 'wkfs-sec-btn'); mark(); return r; };
  var _v80cur = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v80cur.apply(this, arguments); try { mark(); } catch (e) {} return r; };
})();
