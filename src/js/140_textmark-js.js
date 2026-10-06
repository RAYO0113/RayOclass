/* V115 課文修辭／句意新標示（老師 10/6 試作定案，先只用於〈論語選〉；其他課照舊）
   - 修辭：拿掉「修辭」按鈕；每個修辭在第一個字正上方一個〔修〕框，點開說明以浮動框顯示在上方（課文不動）。
     三種標法：句子型（倒裝、省略、回文、激問…）＝括號式底線，巢狀時外層較低；
              跨句單詞型（頂真、映襯）＝關鍵詞底色；單字單詞型（轉品、借代）＝圈字。
     未點開：淡色細線標出範圍；點開：課文字變色（胭脂／緋紅）並加粗（描邊，不改字寬）。
   - 句意：拿掉「句意」按鈕；範圍以淡綠括號（佔位、左右對稱）標出，〔句意〕框在第一個字正下方，點開說明浮在下方、切齊第一個字，課文變綠加粗。
   - 翻譯、注釋（右欄）、字義（藍字，點開上方泡泡）、課本注音：照舊（字義改成只用顏色、注釋虛線變淡）。
   - 範圍直接讀既有渲染結果：.tp-seg[data-layers] 的 r_／m_ 開頭編號＝修辭／句意定位（含跨行），說明讀 .tp-box-r / .tp-box-m。
   - 一般畫面（#wk-slide-area）與全螢幕（#wkfs-body）各自處理；字級／視窗改變時重新排版。 */
(function () {
  'use strict';
  var ENABLED = ['論語選—子路曾皙冉有公西華侍坐'];
  var B_TYPES = ['頂真', '映襯'];                 /* 跨句單詞型 */
  var C_TYPES = ['轉品', '借代'];                 /* 單字單詞型 */
  var GENERIC = ['回文', '頂真'];                 /* 說明只是基本概念 → 只顯示名稱 */
  var SKIP = 'sup,.tp-gd,.tp-pd,.tp-zd,.tp-ruby,.tm-par,.tm-layer,[aria-hidden="true"]';
  var OPEN = {};                                  /* 開關狀態：課名|頁|id */

  function on() { return typeof wkKey !== 'undefined' && ENABLED.indexOf(wkKey) >= 0; }
  function sk(id) { return wkKey + '|' + wkIdx + '|' + id; }
  function isOpen(id) { return !!OPEN[sk(id)]; }

  /* ── 字元模型：.tp-text 內可見文字（不含圈號、注音、浮窗內容） ── */
  function chars(root) {
    var out = [];
    root.querySelectorAll('.tp-text').forEach(function (t) {
      var w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        if (n.parentElement.closest(SKIP)) continue;
        for (var k = 0; k < n.length; k++) out.push({ n: n, k: k, ch: n.data.charAt(k) });
      }
    });
    return out;
  }
  function rectOf(c) { var r = document.createRange(); r.setStart(c.n, c.k); r.setEnd(c.n, c.k + 1); return r.getBoundingClientRect(); }
  function idsOf(seg) { return (seg.getAttribute('data-layers') || '').split(' ').filter(Boolean); }
  function charsById(slide, cs, id) {
    var segs = [].filter.call(slide.querySelectorAll('.tp-seg[data-layers]'), function (s) { return idsOf(s).indexOf(id) >= 0; });
    return cs.filter(function (c) { return segs.some(function (s) { return s.contains(c.n); }); });
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* ── 讀說明 ── */
  function readRhet(div) {
    var c = div.cloneNode(true);
    c.querySelectorAll('.tp-rt,.tp-more').forEach(function (x) { x.remove(); });
    var b = c.querySelector('b'), name = b ? b.textContent.trim() : '';
    var hi = [].map.call(c.querySelectorAll('.rq-hi'), function (x) { return x.textContent; });
    if (b) b.remove();
    var html = c.innerHTML, cut = html.indexOf('──');
    var exp = cut >= 0 ? html.slice(cut + 2) : '';
    exp = exp.replace(/▸[^<]*$/, '').trim();
    var type = B_TYPES.indexOf(name) >= 0 ? 'B' : (C_TYPES.indexOf(name) >= 0 ? 'C' : 'A');
    return { id: div.getAttribute('data-lid'), name: name, exp: exp, hi: hi, type: type };
  }
  function readMean(div) {
    var c = div.cloneNode(true);
    c.querySelectorAll('.tp-mk,.tp-citetxt').forEach(function (x) { x.remove(); });
    var html = c.innerHTML.replace(/^──/, '').trim();
    return { id: div.getAttribute('data-lid'), exp: html };
  }
  /* 跨句單詞／單字型的關鍵字：資料有 rq-hi 就用；否則從說明裡『』「」引號中，找出現在範圍內的詞 */
  function keywords(it, text) {
    if (it.hi.length) return it.hi;
    var out = [], re = /[『「]([^』」（(]{1,6})[（(』」]/g, m, src = plain(it.exp);
    while ((m = re.exec(src))) if (text.indexOf(m[1]) >= 0 && out.indexOf(m[1]) < 0) out.push(m[1]);
    return out.length ? out : [text];
  }

  /* ── 包字：把一串字元（可能跨多個文字節點）各段包進 span ── */
  function wrapRun(run, mk) {
    var groups = [];
    run.forEach(function (c) { var g = groups[groups.length - 1]; if (g && g.n === c.n && g.e === c.k) g.e++; else groups.push({ n: c.n, s: c.k, e: c.k + 1 }); });
    for (var i = groups.length - 1; i >= 0; i--) {
      var g = groups[i], r = document.createRange(); r.setStart(g.n, g.s); r.setEnd(g.n, g.e);
      var sp = mk(); r.surroundContents(sp);
    }
  }
  /* 插入點往外提（不把別的標記切成兩半） */
  function hoistBefore(c, stop) {
    if (c.k > 0) return { n: c.n, k: c.k };
    var el = c.n;
    while (el.parentNode && el.parentNode !== stop && !el.previousSibling && !el.parentNode.classList.contains('tp-text')) el = el.parentNode;
    return { el: el, before: true };
  }
  function hoistAfter(c) {
    if (c.k < c.n.length - 1) return { n: c.n, k: c.k + 1 };
    var el = c.n;
    for (;;) {
      var nx = el.nextSibling;
      while (nx && nx.nodeType === 1 && nx.tagName === 'SUP') { el = nx; nx = el.nextSibling; }
      if (!nx && el.parentNode && !el.parentNode.classList.contains('tp-text')) { el = el.parentNode; continue; }
      break;
    }
    return { el: el, before: false };
  }
  function insertAt(pt, node) {
    var r = document.createRange();
    if (pt.el) { if (pt.before) r.setStartBefore(pt.el); else r.setStartAfter(pt.el); } else r.setStart(pt.n, pt.k);
    r.collapse(true); r.insertNode(node);
  }

  /* 短版：資料欄位 rhetShort（與 rhet 同順序；編號 r{句}_{序} 的序號不含「開門見山／筆法」類）、meanShort、mean2Short */
  function attachShort(rh, mn) {
    var pg = (typeof wkSlides !== 'undefined' && wkSlides[wkIdx] && wkSlides[wkIdx].page) || null; if (!pg) return;
    var isStyle = function (r) { return /開門見山/.test(String(r[0] || '')) || /文章筆法|寫作手法/.test(String(r[0] || '')); };
    rh.forEach(function (it) {
      var m = /^r(\d+)_(\d+)$/.exec(it.id || ''); if (!m) return;
      var L = (pg.lines || [])[+m[1]]; if (!L || !L.rhetShort) return;
      var k = -1, n = -1; (L.rhet || []).forEach(function (r, i) { if (!isStyle(r)) { n++; if (n === +m[2]) k = i; } });
      if (k >= 0 && L.rhetShort[k]) it.short = L.rhetShort[k];
    });
    mn.forEach(function (it) {
      var m = /^m(\d+)_(\d+)$/.exec(it.id || ''); if (!m) return;
      var L = (pg.lines || [])[+m[1]]; if (!L) return;
      var v = m[2] === '0' ? L.meanShort : L.mean2Short; if (v) it.short = v;
    });
  }

  /* ── 準備：每次換頁（新 DOM）做一次 ── */
  function prepare(slide) {
    if (slide.__tm) return slide.__tm;
    slide.classList.add('tm-on');
    var rh = [].map.call(slide.querySelectorAll('.tp-box-r .tp-rhet[data-lid]'), readRhet);
    var mn = [].map.call(slide.querySelectorAll('.tp-box-m .tp-mean[data-lid]'), readMean);
    var cs = chars(slide);
    rh.forEach(function (it) {
      var rc = charsById(slide, cs, it.id); it.ok = rc.length > 0;
      if (!it.ok || it.type === 'A') return;
      var text = rc.map(function (c) { return c.ch; }).join('');
      keywords(it, text).forEach(function (kw) {
        var from = 0, p;
        while ((p = text.indexOf(kw, from)) >= 0) {
          wrapRun(rc.slice(p, p + kw.length), function () { var s = document.createElement('span'); s.className = 'tm-kw tm-' + it.type.toLowerCase(); s.setAttribute('data-r', it.id); return s; });
          from = p + kw.length;
        }
      });
      cs = chars(slide);
    });
    mn.forEach(function (it) {
      var mc = charsById(slide, cs, it.id); it.ok = mc.length > 0; if (!it.ok) return;
      var l = document.createElement('span'); l.className = 'tm-par tm-pl'; l.setAttribute('data-m', it.id); l.textContent = '(';
      var r = document.createElement('span'); r.className = 'tm-par tm-pr'; r.setAttribute('data-m', it.id); r.textContent = ')';
      insertAt(hoistAfter(mc[mc.length - 1]), r);
      insertAt(hoistBefore(mc[0]), l);
      cs = chars(slide);
    });
    attachShort(rh, mn);
    slide.__tm = { rh: rh, mn: mn };
    return slide.__tm;
  }

  /* ── 排版：狀態上色＋〔修〕〔句意〕框＋括號線＋浮動說明框 ── */
  function layout(container) {
    var slide = container && container.querySelector('.wk-slide');
    if (!slide) return;
    var old = slide.querySelector(':scope > .tm-layer'); if (old) old.remove();
    if (!on() || !slide.querySelector('.tp-line')) { slide.classList.remove('tm-on'); return; }
    var st = prepare(slide);
    if (window.__tmRO && !slide.__tmObs) { slide.__tmObs = 1; window.__tmRO.observe(slide); var t0 = slide.querySelector('.tp-text'); if (t0) window.__tmRO.observe(t0); }
    var cs = chars(slide);
    if (getComputedStyle(slide).position === 'static') slide.style.position = 'relative';
    var base = slide.getBoundingClientRect();
    var layer = document.createElement('div'); layer.className = 'tm-layer'; slide.appendChild(layer);
    var W = slide.clientWidth; layer.style.width = W + 'px';   /* 疊加層要與課文頁同寬，說明框才排得開 */
    var txt0 = slide.querySelector('.tp-text'), fsz = parseFloat(getComputedStyle(txt0).fontSize);
    var sx = slide.scrollLeft - slide.clientLeft, sy = slide.scrollTop - slide.clientTop;
    /* 說明框的左右邊界＝課文文字區（不是整個課文頁），避免伸進右側按鈕底下 */
    var TL = Infinity, TR = 0;
    var kx0 = slide.offsetWidth ? base.width / slide.offsetWidth : 1;
    slide.querySelectorAll('.tp-text').forEach(function (t) { var r = t.getBoundingClientRect(); TL = Math.min(TL, (r.left - base.left) / kx0 + sx); TR = Math.max(TR, (r.right - base.left) / kx0 + sx); });
    /* 課文頁本身會捲動：座標要加上已捲動的距離（疊加層跟著內容一起捲） */
    /* 換頁淡入動畫會縮放課文頁（scale 0.99）：把縮放比例算回去，動畫中量也準 */
    var kx = slide.offsetWidth ? base.width / slide.offsetWidth : 1, ky = slide.offsetHeight ? base.height / slide.offsetHeight : 1;
    var rel = function (r) { return { l: (r.left - base.left) / kx + sx, r: (r.right - base.left) / kx + sx, t: (r.top - base.top) / ky + sy, b: (r.bottom - base.top) / ky + sy }; };

    /* 狀態上色 */
    var openR = st.rh.filter(function (it) { return it.ok && isOpen(it.id); });
    var openM = st.mn.filter(function (it) { return it.ok && isOpen(it.id); });
    slide.querySelectorAll('.tp-seg[data-layers]').forEach(function (s) {
      var ids = idsOf(s);
      var r = openR.filter(function (it) { return it.type === 'A' && ids.indexOf(it.id) >= 0; })[0];
      var m = openM.filter(function (it) { return ids.indexOf(it.id) >= 0; })[0];
      s.classList.toggle('tm-r-on', !!r); s.classList.toggle('tm-m-on', !r && !!m);
      if (r) s.style.setProperty('--tmc', r.col || 'var(--tm-r1)');
    });
    slide.querySelectorAll('.tm-kw').forEach(function (k) { k.classList.toggle('on', isOpen(k.getAttribute('data-r'))); });
    slide.querySelectorAll('.tm-par').forEach(function (p) { p.classList.toggle('on', isOpen(p.getAttribute('data-m'))); });

    /* 句子型：巢狀層級（外層較低）與顏色 */
    var A = st.rh.filter(function (it) { return it.ok && it.type === 'A'; });
    A.forEach(function (it) { it.cs = charsById(slide, cs, it.id); });
    A.forEach(function (it) {
      var inner = A.filter(function (o) { return o !== it && o.cs.length < it.cs.length && o.cs.every(function (c) { return it.cs.indexOf(c) >= 0; }); });
      it.lv = inner.length ? 1 : 0; it.col = it.lv ? 'var(--tm-r2)' : 'var(--tm-r1)';
    });
    slide.querySelectorAll('.tp-seg.tm-r-on').forEach(function (s) {
      var ids = idsOf(s), r = openR.filter(function (it) { return it.type === 'A' && ids.indexOf(it.id) >= 0; }).sort(function (a, b) { return a.lv - b.lv; })[0];
      if (r) s.style.setProperty('--tmc', r.col);
    });
    A.forEach(function (it) {
      var lines = [];
      it.cs.forEach(function (c) { var r = rel(rectOf(c)); var L = lines[lines.length - 1]; if (L && Math.abs(L.t - r.t) < fsz * 0.5) { L.r = Math.max(L.r, r.r); L.b = Math.max(L.b, r.b); } else lines.push({ l: r.l, r: r.r, t: r.t, b: r.b }); });
      var op = isOpen(it.id), th = op ? Math.max(1.5, fsz * 0.07) : Math.max(1, fsz * 0.045), col = op ? it.col : 'var(--tm-faint)';
      var off = fsz * (0.12 + it.lv * 0.36), tick = fsz * 0.28;
      lines.forEach(function (L, i) {
        var y = L.b + off;
        add(layer, 'tm-line', { left: L.l, top: y, width: L.r - L.l, height: th, background: col });
        if (i === 0) add(layer, 'tm-line', { left: L.l, top: y - tick + th, width: th, height: tick, background: col });
        if (i === lines.length - 1) add(layer, 'tm-line', { left: L.r - th, top: y - tick + th, width: th, height: tick, background: col });
      });
    });

    /* 〔修〕〔句意〕框 */
    var chipsUp = {}, chipsDn = {}, placed = [];
    function firstChar(id) { var x = charsById(slide, cs, id); return x[0]; }
    function lineStart(div) { var ln = div.closest('.tp-line'); var t = ln && ln.querySelector('.tp-text'); var c = t && chars(t.parentNode).filter(function (z) { return t.contains(z.n); })[0]; return c; }
    st.rh.forEach(function (it) {
      var c = it.ok ? (it.type === 'A' ? firstChar(it.id) : (slide.querySelector('.tm-kw[data-r="' + it.id + '"]') ? chars(slide).filter(function (z) { return slide.querySelector('.tm-kw[data-r="' + it.id + '"]').contains(z.n); })[0] : firstChar(it.id))) : null;
      if (!c) { var d = slide.querySelector('.tp-box-r .tp-rhet[data-lid="' + it.id + '"]'); c = d && lineStart(d); }
      if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.t);
      var n = (chipsUp[key] = (chipsUp[key] || 0) + 1) - 1;
      it.chip = chip(layer, '修', it.id, 'r', r.l + n * fsz * 0.62, r.t, true, fsz, it.lv ? 'var(--tm-r2)' : 'var(--tm-r1)');
      it.anchor = r;
    });
    st.mn.forEach(function (it) {
      var c = it.ok ? firstChar(it.id) : null; if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.b);
      var n = (chipsDn[key] = (chipsDn[key] || 0) + 1) - 1;
      it.chip = chip(layer, '句意', it.id, 'm', r.l + n * fsz * 1.1, r.b, false, fsz, 'var(--tm-g)');
      it.anchor = r;
    });

    /* 障礙物：打開中的〔修〕〔句意〕框（說明框之間也互相避讓） */
    st.rh.concat(st.mn).forEach(function (it) { if (it.chip && isOpen(it.id)) placed.push(rel(it.chip.getBoundingClientRect())); });
    /* 不避開翻譯／提問按鈕（老師 10/6：避開會把說明框擠得離字太遠；按鈕被蓋住時收起說明即可） */

    /* 浮動說明框 */
    function box(it, up, html, cls) {
      var bx = document.createElement('div'); bx.className = 'tm-box ' + cls; bx.innerHTML = html;
      bx.style.fontSize = fsz + 'px'; bx.style.fontFamily = getComputedStyle(txt0).fontFamily;   /* 說明與課文同字級、同字型 */
      bx.addEventListener('click', function (e) {
        e.stopPropagation();
        var mo = e.target.closest && e.target.closest('.tm-more');
        if (mo) { var k = sk(mo.getAttribute('data-full') + '#full'); OPEN[k] = !OPEN[k]; }   /* 「詳／短」切換長版 */
        else OPEN[sk(it.id)] = false;
        relayoutAll();
      });
      layer.appendChild(bx);
      var x = it.anchor.l, minW = Math.min(10 * fsz, TR - TL); if (TR - x < minW) x = Math.max(TL, TR - minW);
      bx.style.left = x + 'px'; bx.style.maxWidth = (TR - x) + 'px';
      var h = bx.offsetHeight, w = bx.offsetWidth, ch = it.chip.getBoundingClientRect(), cr = rel(ch);
      var t = up ? cr.t - h - fsz * 0.12 : Math.max(cr.b, it.lastB || 0) + fsz * 0.12;   /* 句意：在整句最後一行之下，不蓋住自己的原文 */
      var rc = { l: x, r: x + w, t: t, b: t + h };
      for (var g = 0; g < 14; g++) {
        var q = placed.filter(function (p) { return rc.l < p.r && p.l < rc.r && rc.t < p.b && p.t < rc.b; })[0];
        if (!q) break;
        var nt = up ? q.t - h - 4 : q.b + 4; rc = { l: x, r: x + w, t: nt, b: nt + h };
      }
      bx.style.top = rc.t + 'px'; placed.push(rc);
    }
    function body(it, rhet) {
      var full = isOpen(it.id + '#full'), txt = (it.short && !full) ? it.short : it.exp;
      var h = rhet ? '<b>' + it.name + '</b>' + (txt && (GENERIC.indexOf(it.name) < 0 || full) ? '（' + String(txt).replace(/[。]$/, '') + '）' : '') : txt;
      if (it.short && it.exp) h += '<span class="tm-more" data-full="' + it.id + '">' + (full ? '短' : '詳') + '</span>';
      return h;
    }
    openR.forEach(function (it) { if (it.chip) box(it, true, body(it, true), 'tm-box-r'); });
    openM.forEach(function (it) {
      if (!it.chip) return;
      var mc = charsById(slide, cs, it.id); it.lastB = 0;
      mc.forEach(function (c) { it.lastB = Math.max(it.lastB, rel(rectOf(c)).b); });
      box(it, false, body(it, false), 'tm-box-m');
    });
  }
  function add(layer, cls, s) {
    var d = document.createElement('div'); d.className = cls;
    d.style.left = s.left + 'px'; d.style.top = s.top + 'px'; d.style.width = s.width + 'px'; d.style.height = s.height + 'px'; d.style.background = s.background;
    layer.appendChild(d); return d;
  }
  function chip(layer, label, id, kind, x, y, up, fsz, col) {
    var c = document.createElement('span'); c.className = 'tm-chip tm-chip-' + kind + (isOpen(id) ? ' on' : ''); c.textContent = label;
    c.style.fontSize = (fsz * 0.5) + 'px'; c.style.setProperty('--cc', col);
    c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.transform = up ? 'translateY(calc(-100% - ' + (fsz * 0.1) + 'px))' : 'translateY(' + (fsz * 0.14) + 'px)';
    c.addEventListener('click', function (e) { e.stopPropagation(); OPEN[sk(id)] = !OPEN[sk(id)]; relayoutAll(); });
    layer.appendChild(c); return c;
  }

  function relayoutAll() {
    try { layout(document.getElementById('wk-slide-area')); } catch (e) { setTimeout(function () { throw e; }); }
    try { layout(document.getElementById('wkfs-body')); } catch (e) { setTimeout(function () { throw e; }); }
  }
  var pend = 0;
  /* 換頁有 0.55 秒淡入動畫（縮放 0.99→1）：動畫中量到的位置會偏 → 等動畫結束再排一次 */
  function settle() {
    var anims = [];
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var sl = document.querySelector('#' + id + ' .wk-slide');
      if (sl && sl.getAnimations) sl.getAnimations().forEach(function (a) { if (a.playState === 'running') anims.push(a.finished.catch(function () {})); });
    });
    relayoutAll();
    if (anims.length) Promise.all(anims).then(function () { relayoutAll(); });
  }
  function soon() { clearTimeout(pend); pend = setTimeout(settle, 90); }

  /* 換頁後（等其他外掛跑完）再排；字級／視窗改變時重排 */
  if (typeof wkRenderCurrent === 'function') {
    var _r = wkRenderCurrent;
    wkRenderCurrent = function () { var r = _r.apply(this, arguments); soon(); return r; };
  }
  window.addEventListener('resize', soon);
  /* 保險：課文頁內任何點擊（開關注釋欄等）或版面動畫結束後再排一次（不只靠 ResizeObserver） */
  var late = 0;
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest || t.closest('.tm-chip, .tm-box')) return;
    if (!t.closest('#wk-slide-area, #wkfs-body, #wk-fullscreen')) return;
    clearTimeout(late); late = setTimeout(settle, 350);
  }, true);
  ['transitionend', 'animationend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target && e.target.closest && e.target.closest('#wk-slide-area, #wkfs-body')) soon(); }, true);
  });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(soon);
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el) ro.observe(el); });
    window.__tmRO = ro;   /* 每次排版時也觀察該頁的 .wk-slide、第一個 .tp-text（注釋欄打開會讓課文區變窄、重新換行） */
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', soon);   /* 第一次用到粗體時字型才下載，下載完重排 */

  window.V115TM = { relayout: relayoutAll, enabled: ENABLED, state: OPEN };
})();
