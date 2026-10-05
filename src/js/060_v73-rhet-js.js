
(function () {
  /* 動畫內容：原句一律逐字取自〈師說〉課文（textPages）；說明文字取自既有 keyRhetoric 資料，不自行編寫 */
  var V73_ANIMS = {
    '師說': {
      '回文': { cap: '「弟子」與「師」前後位置互換，循環相對。', ex: [
        { k: 'swap', src: '弟子不必不如師，師不必賢於弟子。',
          r1: [['A', '弟子'], ['', '不必不如'], ['B', '師'], ['', '，']],
          r2: [['B', '師'], ['', '不必賢於'], ['A', '弟子'], ['', '。']] } ] },
      '頂針': { cap: '前一句的末字（詞），作為後一句的首字（詞），上遞下接、蟬聯而下，稱為「頂針」。', ex: [
        { k: 'chain', src: '弟子不必不如師，師不必賢於弟子。', a: '弟子不必不如', t: '師', p: '，', b: '不必賢於弟子。' },
        { k: 'chain', src: '請學於余，余嘉其能行古道，作〈師說〉以貽之。', a: '請學於', t: '余', p: '，', b: '嘉其能行古道' } ] },
      '類疊': { cap: '同一個字、詞、語、句，接二連三反覆使用，稱為「類疊」。作用：加強語勢、凸顯對比、使文氣充沛。', ex: [
        { k: 'stack', src: '是故無貴無賤、無長無少，道之所存，師之所存也。', note: '「無……無……」反覆', rows: [['無貴無賤'], ['無長無少']] },
        { k: 'stack', src: '是故聖益聖，愚益愚。', note: '句式相疊', rows: [['聖益聖'], ['愚益愚']] },
        { k: 'stack', src: '生乎吾前，其聞道也，固先乎吾，吾從而師之；生乎吾後，其聞道也，亦先乎吾，吾從而師之。', note: '句型反覆',
          rows: [['生乎吾前', '其聞道也', '固先乎吾', '吾從而師之'], ['生乎吾後', '其聞道也', '亦先乎吾', '吾從而師之']] } ] },
      '映襯': { cap: '把兩種不同的、特別是相反的觀念或事實對列起來兩相比較，使語氣增強、意義更為明顯，稱為「映襯」。', ex: [
        { k: 'vs', src: '古之聖人，其出人也遠矣，猶且從師而問焉；今之眾人，其下聖人也亦遠矣，而恥學於師。',
          pairs: [['古之聖人', '今之眾人'], ['其出人也遠矣', '其下聖人也亦遠矣'], ['猶且從師而問焉', '而恥學於師']] },
        { k: 'vs', src: '巫、醫、樂師、百工之人，不恥相師。士大夫之族，曰師、曰弟子云者，則群聚而笑之。',
          pairs: [['巫、醫、樂師、百工之人', '士大夫之族'], ['不恥相師', '曰師、曰弟子云者，則群聚而笑之']] },
        { k: 'vs', src: '愛其子，擇師而教之，於其身也，則恥師焉，惑矣！',
          pairs: [['愛其子', '於其身也'], ['擇師而教之', '則恥師焉']] } ] }
    }
  };
  window.V73_ANIMS = V73_ANIMS;
  var STEPS = { swap: 3, chain: 2, stack: 2 };
  function nSteps(e) { return e.k === 'vs' ? e.pairs.length : STEPS[e.k]; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function exHTML(e) {
    var h = '';
    if (e.k === 'swap') {
      var row = function (r, c) { return '<div class="row ' + c + '">' + r.map(function (t) {
        return t[0] ? '<span class="k k' + t[0] + '" data-k="' + t[0] + '">' + esc(t[1]) + '</span>' : '<span class="' + (t[1].length > 1 ? 'mid' : '') + '">' + esc(t[1]) + '</span>';
      }).join('') + '</div>'; };
      h = '<div class="v73-hw">' + row(e.r1, 'r1') + row(e.r2, 'r2') + '</div>';
    } else if (e.k === 'chain') {
      h = '<div class="v73-ch">' + esc(e.a) + '<span class="k tail">' + esc(e.t) + '</span>' + esc(e.p) +
          '<span class="k head">' + esc(e.t) + '</span>' + esc(e.b) + '</div>';
    } else if (e.k === 'stack') {
      var cols = e.rows[0].length;
      h = '<div class="v73-st" style="grid-template-columns:repeat(' + cols + ',max-content)">';
      e.rows.forEach(function (r, ri) {
        r.forEach(function (cell, ci) {
          var other = e.rows[1 - ri][ci] || '';
          var chs = Array.from(cell).map(function (c, i) {
            return '<span class="ch ' + (Array.from(other)[i] === c ? 'same' : 'diff') + '">' + esc(c) + '</span>';
          }).join('');
          h += '<span class="cell r' + (ri + 1) + '">' + chs + '</span>';
        });
      });
      h += '</div><div class="v73-note">' + esc(e.note) + '</div>';
    } else if (e.k === 'vs') {
      h = '<div class="v73-vs">' + e.pairs.map(function (p, i) {
        return '<span class="L" data-i="' + i + '">' + esc(p[0]) + '</span><span class="M" data-i="' + i + '">⟷</span><span class="R" data-i="' + i + '">' + esc(p[1]) + '</span>';
      }).join('') + '</div>';
    }
    return '<div class="v73-src">' + esc(e.src) + '</div><div class="v73-stage">' + h + '<svg class="v73-svg"></svg></div>';
  }

  function slideHTML(key, name) {
    var A = V73_ANIMS[key][name];
    var tabs = A.ex.length > 1 ? '<div class="v73-tabs">' + A.ex.map(function (e, i) {
      return '<button class="v73-tab' + (i ? '' : ' on') + '" onclick="v73Show(this,' + i + ')">例' + '一二三四五'[i] + '</button>'; }).join('') + '</div>' : '';
    var exs = A.ex.map(function (e, i) {
      return '<div class="v73-ex' + (i ? '' : ' cur') + '" data-k="' + e.k + '" data-n="' + nSteps(e) + '">' + exHTML(e) + '</div>'; }).join('');
    return '<div class="wk-slide wks-keyrhet v73-kr v73-anim-slide">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">' + esc(name) + '</span><span class="wks-kr-sub">結構動畫〈' + esc(key) + '〉</span></div>' +
      '<div class="v73a" data-ex="0" data-st="0">' + tabs + exs +
      '<div class="v73-cap">' + esc(A.cap) + '</div>' +
      '<div class="v73-ctrl"><button class="v73-btn" onclick="v73Step(this)">▶ 下一步</button>' +
      '<button class="v73-btn rst" onclick="v73Reset(this)">↻ 重來</button><span class="v73-tip"></span></div></div></div>';
  }

  /* ── 動畫控制 ── */
  /* 以版面位置計算（不受移動中的 transform 影響），stage 為 position:relative */
  function rel(el, base) { var x = 0, y = 0, n = el;
    while (n && n !== base) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }; }
  function drawPath(svg, d, color, marker) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color);
    svg.appendChild(p);
    var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    void p.getBoundingClientRect(); p.classList.add('v73-draw');
    if (marker) { var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      var pt = p.getPointAtLength(L); c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', 5); c.setAttribute('fill', color);
      c.style.opacity = 0; c.style.transition = 'opacity .3s .8s'; svg.appendChild(c); requestAnimationFrame(function () { c.style.opacity = 1; }); }
  }
  var TIPS = {
    swap: ['① 找出關鍵詞：「弟子」與「師」', '② 下句把兩個詞的位置對調', '③ 位置互換、循環相對'],
    chain: ['① 前一句的末字', '② 接成後一句的首字'],
    stack: ['① 上下兩句對齊排列', '② 相同的字反覆出現']
  };
  function apply(ex, st) {
    var k = ex.dataset.k, stage = ex.querySelector('.v73-stage'), svg = ex.querySelector('.v73-svg');
    ex.classList.add('s' + st);
    if (k === 'swap') {
      if (st === 1) ex.querySelectorAll('.r1 .k').forEach(function (x) { x.classList.add('lit'); });
      if (st === 2) {
        ex.querySelectorAll('.r2 .k').forEach(function (t) {
          var src = ex.querySelector('.r1 .k[data-k="' + t.dataset.k + '"]');
          var a = src.getBoundingClientRect(), b = t.getBoundingClientRect();
          t.classList.add('lit');
          t.style.transition = 'none'; t.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
          void t.offsetWidth;
          t.style.transition = 'transform 1s cubic-bezier(.5,0,.3,1), background .4s, color .4s'; t.style.transform = '';
        });
      }
      if (st === 3) ['A', 'B'].forEach(function (key) {
        var p = rel(ex.querySelector('.r1 .k[data-k="' + key + '"]'), stage), q = rel(ex.querySelector('.r2 .k[data-k="' + key + '"]'), stage);
        drawPath(svg, 'M' + (p.x + p.w / 2) + ' ' + (p.y + p.h) + ' L' + (q.x + q.w / 2) + ' ' + q.y, key === 'A' ? '#1f5fa8' : '#c0392b', true);
      });
    } else if (k === 'chain') {
      if (st === 1) ex.querySelector('.tail').classList.add('lit');
      if (st === 2) {
        var p = rel(ex.querySelector('.tail'), stage), q = rel(ex.querySelector('.head'), stage);
        var x1 = p.x + p.w / 2, x2 = q.x + q.w / 2, y = p.y + 4, lift = Math.max(30, p.h * .9);
        drawPath(svg, 'M' + x1 + ' ' + y + ' C' + x1 + ' ' + (y - lift) + ' ' + x2 + ' ' + (y - lift) + ' ' + x2 + ' ' + y, '#d4a017', true);
        setTimeout(function () { ex.querySelector('.head').classList.add('lit'); }, 700);
      }
    } else if (k === 'stack') {
      if (st === 2) ex.querySelector('.v73-note').classList.add('show');
    } else if (k === 'vs') {
      ex.querySelectorAll('.v73-vs [data-i="' + (st - 1) + '"]').forEach(function (x) { x.classList.add('on'); });
    }
  }
  function tipFor(ex, st) { var t = TIPS[ex.dataset.k]; return t ? (t[st - 1] || '') : ('第 ' + st + ' 組對照'); }
  function syncBtn(box) {
    var exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, n = +exs[ei].dataset.n;
    var btn = box.querySelector('.v73-btn:not(.rst)');
    btn.disabled = false;
    btn.textContent = st < n ? '▶ 下一步' : (ei + 1 < exs.length ? '▶ 下一例' : '▶ 總結');
    if (box.querySelector('.v73-cap.show')) { btn.disabled = true; btn.textContent = '✓ 完成'; }
  }
  function show(box, i) {
    var exs = box.querySelectorAll('.v73-ex');
    exs.forEach(function (e, j) { e.classList.toggle('cur', j === i); });
    box.querySelectorAll('.v73-tab').forEach(function (t, j) { t.classList.toggle('on', j === i); });
    resetEx(exs[i]);
    box.dataset.ex = i; box.dataset.st = 0;
    box.querySelector('.v73-cap').classList.remove('show');
    box.querySelector('.v73-tip').textContent = '';
    syncBtn(box);
  }
  function resetEx(ex) {
    ex.className = 'v73-ex cur';
    ex.querySelectorAll('.lit,.on,.show').forEach(function (x) { x.classList.remove('lit', 'on', 'show'); });
    ex.querySelectorAll('.k').forEach(function (x) { x.style.transform = ''; x.style.transition = ''; });
    var svg = ex.querySelector('.v73-svg'); if (svg) svg.innerHTML = '';
  }
  window.v73Show = function (el, i) { if (event) event.stopPropagation(); show(el.closest('.v73a'), i); };
  window.v73Step = function (btn) {
    if (window.event) window.event.stopPropagation();
    var box = btn.closest('.v73a'), exs = box.querySelectorAll('.v73-ex');
    var ei = +box.dataset.ex, st = +box.dataset.st, ex = exs[ei], n = +ex.dataset.n;
    if (st >= n) {
      if (ei + 1 < exs.length) { show(box, ei + 1); return; }
      box.querySelector('.v73-cap').classList.add('show');
      box.querySelector('.v73-tip').textContent = '';
      syncBtn(box); return;
    }
    st++; box.dataset.st = st; apply(ex, st);
    box.querySelector('.v73-tip').textContent = tipFor(ex, st);
    syncBtn(box);
  };
  window.v73Reset = function (btn) { if (window.event) window.event.stopPropagation(); show(btn.closest('.v73a'), 0); };

  /* ── 投影片：動畫頁接在該修辭最後一張專頁之後 ── */
  var _v73parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v73parse.apply(this, arguments);
    var A = V73_ANIMS[key]; if (!A) return slides;
    Object.keys(A).forEach(function (name) {
      var at = -1;
      slides.forEach(function (s, i) { if (s.type === 'keyrhet' && s.name === name) at = i + 1; });
      if (at < 0) return;
      slides.splice(at, 0, { type: 'v73anim', key: key, name: name });
      slides.forEach(function (s) {
        if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
      });
    });
    return slides;
  };

  /* ── 修辭專頁／文法修辭總表：定義收合、【本課】改徽章、套卡片版面 ── */
  var _v73render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'v73anim') return slideHTML(slide.key, slide.name);
    var h = _v73render.apply(this, arguments);
    if (slide && (slide.type === 'keyrhet' || slide.type === 'rhet_table') && typeof h === 'string') {
      if (h.indexOf('jy-table') >= 0) {
        h = h.replace(/<div class="rt-def">([\s\S]*?)<\/div>/, function (m, body) {
          return '<div class="v73-def" onclick="this.classList.toggle(\'open\')"><span class="v73-def-tag">定義</span><div class="v73-def-body">' + body + '</div></div>';
        });
      }
      h = h.replace(/【本課】/g, '<span class="v73-own">本課</span>');
      h = h.replace('wk-slide wks-keyrhet', 'wk-slide wks-keyrhet v73-kr').replace('wk-slide wks-rhet-table', 'wk-slide wks-rhet-table v73-rt');
    }
    return h;
  };
})();
