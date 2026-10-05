
(function () {
  /* ── ④ 答案總覽：趣味文學／挑戰加分站等只用 <span class='wk-a'> 標答案、表頭又不是「答案」的表格，
        原擷取程式抓不到（〈火車線〉）。只在總覽渲染用的複本中把 wk-a 轉成 wk-tans 標記，資料不改。 ── */
  var AO_HEAD = /^(答案|字音|字形|詞義|詞義\/解釋|注音|國字|還原語句順序)$/;
  function needWkA(s) {
    if (s.kind !== 'table') return false;
    if ((s.cols || []).some(function (c) { return AO_HEAD.test(String(c == null ? '' : c).replace(/<[^>]+>/g, '').trim()); })) return false;
    var raw = JSON.stringify(s.rows || []);
    if (/wk-tans|jy-blank|[（(]\s*\d+\s*<b/.test(raw)) return false;
    return /class=['"]wk-a['"]/.test(raw);
  }
  function wkA2tans(c) {
    return String(c == null ? '' : c).replace(/<span class=['"]wk-a['"]>([\s\S]*?)<\/span>/g,
      '<span class="wk-tans"><span class="wk-tval">$1</span></span>');
  }
  var _v74prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'work_answers' && slide.workbook && (slide.workbook.sections || []).some(needWkA)) {
      var W = slide.workbook;
      var W2 = Object.assign({}, W, { sections: W.sections.map(function (s) {
        return needWkA(s) ? Object.assign({}, s, { rows: s.rows.map(function (r) { return r.map(wkA2tans); }) }) : s;
      }) });
      return _v74prev.call(this, Object.assign({}, slide, { workbook: W2 }));
    }
    if (slide && slide.type === 'work' && slide.sec && typeof wkKey !== 'undefined' && wkKey === '師說' &&
        /^四、國學常識解碼/.test(slide.sec.head || '')) {
      var h = _v74prev.apply(this, arguments);
      return h.replace(/<div class="wk-tblwrap">[\s\S]*<\/table><\/div>/, function () { return gxTable(slide.sec); });
    }
    return _v74prev.apply(this, arguments);
  };

  /* ── ② 〈師說〉國學常識解碼：依原卷版面（標題列、社會問題分析跨欄、①～⑥、1. 2. 條列）。文字全取自既有資料。 ── */
  var CN = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
  function blanks(t) {
    return t.replace(/（\s*(\d)\s*<b>([\s\S]*?)<\/b>\s*）/g, function (m, n, a) {
      return '（<span class="v74-cn">' + CN[+n] + '</span><b class="v69-a">' + a + '</b>　）';
    }).replace(/先秦、兩漢散文（語言樸實、形式自由）/,
      '<span class="v74-box"><span>先秦、兩漢散文</span><small>語言樸實、形式自由</small></span>');
  }
  function list(t) {
    var items = String(t).split(/<br\s*\/?>/).map(function (x) { return x.replace(/^\s*\d+\s+/, ''); }).filter(function (x) { return x.trim(); });
    return '<ol>' + items.map(function (x) { return '<li>' + blanks(x) + '</li>'; }).join('') + '</ol>';
  }
  function gxTable(S) {
    var cap = S.cols[0], rows = S.rows;
    var out = '<tr><th class="jy-th v74-gx-cap" colspan="3">' + cap + '</th></tr>';
    rows.forEach(function (r, i) {
      if (i === 0) {
        out += '<tr><th class="jy-th">' + r[0] + '</th><td colspan="2">' + blanks(r[1]) + '</td></tr>' +
               '<tr><th class="jy-th" colspan="2">' + S.cols[1] + '</th><th class="jy-th">' + S.cols[2] + '</th></tr>';
      } else {
        out += '<tr><th class="jy-th">' + r[0] + '</th><td>' + blanks(r[1]) + '</td><td>' + list(r[2]) + '</td></tr>';
      }
    });
    return '<div class="wk-tblwrap"><table class="jy-table wk-table v74-gx"><colgroup><col class="c1"><col class="c2"><col class="c3"></colgroup>' + out + '</table></div>';
  }

  /* ── ① 字詞義欄：逐行點選顯示；③ 語譯／解析欄：綠色 ── */
  function fixWork(sl) {
    if (!sl.querySelector('.wk-top')) return;
    sl.querySelectorAll('table.wk-table').forEach(function (tb) {
      if (tb.getAttribute('data-v74')) return;
      tb.setAttribute('data-v74', '1');
      var rows = tb.querySelectorAll('tr');
      if (!rows.length) return;
      var mean = -1, trans = -1;
      Array.prototype.forEach.call(rows[0].children, function (c, i) {
        var t = (c.textContent || '').replace(/\s/g, '');
        if (t === '字詞義') mean = i;
        if (t === '語譯／解析') trans = i;
      });
      Array.prototype.forEach.call(rows, function (r, ri) {
        if (ri === 0) return;
        if (trans >= 0 && r.children[trans]) r.children[trans].classList.add('v69-acol');
        var c = mean >= 0 && r.children[mean];
        if (!c || c.tagName !== 'TD') return;
        c.innerHTML = c.innerHTML.split(/<br\s*\/?>/).map(function (x) {
          var m = x.match(/^(\s*[（(]\d[）)])([\s\S]*)$/);
          return m ? m[1] + '<span class="v74-rv" onclick="this.classList.toggle(\'on\')">' + m[2] + '</span>'
                   : '<span class="v74-rv" onclick="this.classList.toggle(\'on\')">' + x + '</span>';
        }).join('<br>');
      });
      if (mean >= 0) {
        var bar = document.createElement('div');
        bar.className = 'v74-rvbar';
        bar.innerHTML = '<button type="button" class="all">全部顯示</button><button type="button">全部隱藏</button>';
        bar.children[0].onclick = function () { tb.querySelectorAll('.v74-rv').forEach(function (e) { e.classList.add('on'); }); };
        bar.children[1].onclick = function () { tb.querySelectorAll('.v74-rv').forEach(function (e) { e.classList.remove('on'); }); };
        var wrap = tb.closest('.wk-tblwrap') || tb;
        wrap.parentNode.insertBefore(bar, wrap);
      }
    });
  }
  var _v74render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v74render.apply(this, arguments);
    try { document.querySelectorAll('#wk-slide-area .wks-work, #wkfs-body .wks-work').forEach(fixWork); } catch (e) {}
    return r;
  };
})();
