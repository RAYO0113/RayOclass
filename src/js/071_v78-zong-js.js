
(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* 課文「總」框位置：RAY PPT「辨」標記的 10 處（v77 已逐張對照）＋原有「總」框（賤、之、第四段「者」由 v54 照舊放）。
     同一句若 v54 已有同字的「總」框，移到 PPT 位置，避免一句兩個。 */
  var POS = [
    { k:'學者', a:'古之學者必有師', w:'古之學者' },
    { k:'者', a:'師者，所以', w:'師者' },
    { k:'庸', a:'夫庸知其年', w:'夫庸' },
    { k:'所以', a:'聖人之所以為聖', w:'聖人之所以' },
    { k:'其', a:'其皆出於此乎', w:'其' },
    { k:'不恥不齒', a:'君子不齒', w:'君子不齒' },
    { k:'師', a:'弟子不必不如師，師不必', w:'弟子不必不如師' },
    { k:'於', a:'請學於余', w:'請學於' },
    { k:'其', a:'余嘉其能行', w:'余嘉其' },
    { k:'貽', a:'以貽之', w:'以貽' }
  ];
  var CBNAME = { '不恥不齒':'不齒／不恥' };   /* v54 的鍵 → 辨析頁名稱 */

  /* ── 課文注入「總」框 ── */
  var SKIP = '.tp-gd, .tp-num, sup, .ss-zong, .v77-bian, rt';
  var ZYONLY = /^[\sˊˇˋ˙ㄅ-ㄯ]+$/;
  function textMap(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, s = '', map = [];
    while ((n = w.nextNode())) {
      var pe = n.parentElement;
      if (!pe || pe.offsetParent === null || pe.closest(SKIP) || ZYONLY.test(n.nodeValue)) continue;
      for (var i = 0; i < n.nodeValue.length; i++) map.push([n, i]);
      s += n.nodeValue;
    }
    return { s: s, map: map };
  }
  function makeBox(k, a) {
    var b = document.createElement('span');
    b.className = 'ss-zong v78-z'; b.setAttribute('data-k', k); b.setAttribute('data-a', a);
    b.textContent = '總'; b.title = k + ' 字義總整理（點開）';
    return b;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var lines = area.querySelectorAll('.wks-textpage .tp-line');
    POS.forEach(function (c) {
      lines.forEach(function (line) {
        if (line.querySelector('.v78-z[data-a="' + c.a + '"]')) return;
        var tm = textMap(line), at = tm.s.indexOf(c.a);
        if (at < 0) return;
        var end = tm.map[at + c.a.indexOf(c.w) + c.w.length - 1];
        if (!end) return;
        /* 同一句 v54 已放的同字「總」框先拿掉（v54 的冪等檢查看到本框就不會再放） */
        line.querySelectorAll('.ss-zong:not(.v78-z)[data-k="' + c.k + '"]').forEach(function (z) { z.remove(); });
        var node = end[0], off = end[1] + 1, b = makeBox(c.k, c.a);
        var host = node.parentElement.closest('.tp-g, .tp-n, .tp-p'), hostEnd = false;
        if (host && !(off < node.nodeValue.length && node.nodeValue.slice(off).trim())) {
          var hm = textMap(host).map, last = hm[hm.length - 1];
          hostEnd = last && last[0] === node && last[1] === off - 1;
        }
        if (host && hostEnd) host.parentNode.insertBefore(b, host.nextSibling);
        else node.parentNode.insertBefore(b, off < node.nodeValue.length ? node.splitText(off) : node.nextSibling);
      });
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }
  var _v78render = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v78render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });

  /* ── 「總」字卡內容改取字詞辨析頁（v75 產生的表格；含延伸頁）；沒有辨析頁的字（賤）照舊 ── */
  function rowsOf(name) {
    var cb = (T.charBian || []).filter(function (c) { return c.name === name; })[0];
    if (!cb) return null;
    var rows = [];
    cb.pages.forEach(function (pg) {
      var ext = /延伸/.test(pg.sub || '');
      var box = document.createElement('div'); box.innerHTML = pg.body;
      var x = '', yin = '';
      box.querySelectorAll('table.v75-yb tr').forEach(function (tr) {
        var cx = tr.querySelector('.v75-x'), cy = tr.querySelector('.v75-yin'), yi = tr.querySelector('.v75-rv'), ex = tr.querySelector('.v75-e');
        if (!yi || !ex) return;
        if (cx) x = cx.textContent;
        if (cy) yin = cy.textContent;
        var exs = [];
        var parts = ex.querySelector('.v75-ex2') ? Array.prototype.map.call(ex.querySelectorAll('.v75-ex2 > div'), function (d) { return d.innerHTML; })
                                                 : ex.innerHTML.split(/<br\s*\/?>/);
        parts.forEach(function (h) { h = h.replace(/^\s*\d+\.\s*/, '').trim(); if (h) exs.push(h); });
        rows.push({ x: x, yin: pg.sub === '形辨' ? yin : '', def: yi.textContent, ex: exs, ext: ext });
      });
    });
    return rows;
  }
  function openRv(el) {
    if (el.classList.contains('open')) { el.classList.remove('open'); el.textContent = el.dataset.label; }
    else { el.classList.add('open'); el.textContent = el.dataset.v; }
  }
  function render(key) {
    var ov = document.getElementById('ss-anno-ov');
    if (!ov) return;
    var rows = rowsOf(CBNAME[key] || key);
    ov.classList.toggle('v78-card', !!rows);
    var tools = ov.querySelector('.ss-tools'), bar = tools && tools.querySelector('.v78-bar');
    if (tools && !bar) {
      bar = document.createElement('span'); bar.className = 'v78-bar';
      bar.innerHTML = '<button type="button" class="all">全部顯示</button><button type="button">全部隱藏</button>';
      bar.children[0].onclick = function () { ov.querySelectorAll('#ss-body .ss-rv:not(.open)').forEach(openRv); };
      bar.children[1].onclick = function () { ov.querySelectorAll('#ss-body .ss-rv.open').forEach(openRv); };
      tools.appendChild(bar);
    }
    if (!rows) {
      /* 沒有辨析頁的字（賤）：義也改成點選顯示，與其他字卡一致 */
      ov.querySelectorAll('#ss-body .ss-c-yi .ss-given').forEach(function (g) {
        var sp = document.createElement('span'); sp.className = 'ss-rv'; sp.dataset.label = '義'; sp.dataset.v = g.textContent; sp.textContent = '義';
        sp.addEventListener('click', function () { openRv(sp); });
        g.parentNode.replaceChild(sp, g);
      });
      return;
    }
    var tbl = ov.querySelector('#ss-body .ss-tbl');
    if (!tbl) return;
    var multi = rows.some(function (r) { return r.x !== rows[0].x; });
    tbl.innerHTML = rows.map(function (r, i) {
      var last = i === rows.length - 1 ? ' ss-last' : '';
      var first = i === 0 || rows[i - 1].x !== r.x;
      var num = '';
      if (multi && first) num = '<span class="v78-term"><span class="ss-term">' + r.x + '</span>' + (r.yin ? '<span class="ss-term">' + r.yin + '</span>' : '') + '</span>';
      if (r.ext && (i === 0 || !rows[i - 1].ext)) num += '<span class="v78-ext">延伸</span>';
      var exHtml = r.ex.map(function (e) { return '<li>' + e + '</li>'; }).join('');
      return '<div class="ss-c ss-c-num' + last + '">' + num + '</div>' +
        '<div class="ss-c ss-c-yi' + last + '"><span class="ss-rv" data-label="義" data-v="' + r.def.replace(/"/g, '&quot;') + '">義</span></div>' +
        '<div class="ss-c ss-c-ex' + last + '"><ol class="ss-exs' + (r.ex.length > 4 ? ' v78-2col' : '') + '">' + exHtml + '</ol></div>';
    }).join('');
    tbl.querySelectorAll('.ss-rv').forEach(function (el) { el.addEventListener('click', function () { openRv(el); }); });
    ov.querySelectorAll('#ss-body .ss-big .ss-rv').forEach(function (el) {
      if (!el.dataset.label) el.dataset.label = el.textContent;
      /* v54 資料「貽」的注音誤用國字「一」，改為注音符號「ㄧ」 */
      if (el.dataset.v && el.dataset.v.indexOf('一') >= 0) { el.dataset.v = el.dataset.v.replace(/一/g, 'ㄧ'); if (el.classList.contains('open')) el.textContent = el.dataset.v; }
    });
  }
  /* 點任何「總」框（含 v54 原有的）：開卡後在其他補丁之後改寫內容 */
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.ss-zong');
    if (!z) return;
    var key = z.getAttribute('data-k');
    if (z.classList.contains('v78-z')) { e.stopPropagation(); e.preventDefault(); window.ssOpenAnno(key); }
    setTimeout(function () { render(key); }, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function (key) { var r = _open.apply(this, arguments); setTimeout(function () { render(key); }, 0); return r; };
  }
})();
