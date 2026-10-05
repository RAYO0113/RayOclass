
/* v91：修辭呈現改版（說明見 v91-rhet-css）
   - 只加不刪：不改課文資料行、不改主程式函式本體；包一層 tpRecolor／tpLayerToggle，
     原函式照常執行後再做 v91 的處理（兩者定義在主程式，檔內無其他覆寫；本 addon 為目前實際生效的外層）。
   - 框線比對仍靠 tp-rq 引句資料，所以 B 只是把引句「藏起來」，資料不動。
   - 先只套用 V91_RHET_KEYS 內的課（老師：先做《師說》），確認後再加其他課。 */
(function () {
  window.APP_VERSION = 'V91';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  window.V91_RHET_KEYS = ['師說'];
  function enabled() {
    return typeof wkKey !== 'undefined' && window.V91_RHET_KEYS.indexOf(wkKey) >= 0;
  }

  /* ── 資料修正（執行期精確搬移，比照 v87；資料行不動）──
     《師說》第五段「轉品：不恥相師」原掛在 lines[1]，但引句在 lines[0]，因此從未框到 → 移到 lines[0] */
  (function fixShishuo() {
    try {
      if (typeof TEXTBOOK === 'undefined' || !TEXTBOOK['師說']) return;
      var P = (TEXTBOOK['師說'].textPages || [])[4];
      if (!P || !P.lines || P.lines.length < 2) { console.warn('v91: 師說第五段結構不符，略過'); return; }
      var from = P.lines[1].rhet || [], to = P.lines[0];
      var hit = [];
      from.forEach(function (r, i) { if (r[0] === '轉品' && /不恥相<b class='rq-hi'>師<\/b>/.test(r[1])) hit.push(i); });
      var already = (to.rhet || []).some(function (r) { return r[0] === '轉品' && /不恥相/.test(r[1]); });
      if (hit.length !== 1 || already || String(to.text || JSON.stringify(to)).indexOf('不恥相') < 0) {
        console.warn('v91: 不恥相師 搬移條件不符（hit=' + hit.length + '），略過'); return;
      }
      to.rhet = (to.rhet || []).concat([from[hit[0]]]);
      from.splice(hit[0], 1);
    } catch (e) { console.warn('v91: fixShishuo', e); }
  })();

  /* B：藏引句與其後的「──」 */
  function stripQuote(item) {
    if (item.getAttribute('data-v91')) return;
    item.setAttribute('data-v91', '1');
    var rq = item.querySelector(':scope > .tp-rq');
    if (!rq) return;
    rq.classList.add('v91-rq-hide');
    var n = rq.nextSibling;
    if (n && n.nodeType === 3 && n.nodeValue.indexOf('──') === 0) n.nodeValue = n.nodeValue.slice(2);
  }

  /* 標籤文字：修辭名稱；轉品另從說明取出詞性變化，如「轉品（名→動）」 */
  function labelText(item) {
    var b = item.querySelector(':scope > b');
    var name = b ? b.textContent.trim() : '';
    if (/^轉品$/.test(name)) {
      var m = item.textContent.match(/[（(]\s*([^（()）→]{1,2})\s*[）)][^→]*→\s*[（(]\s*([^（()）→]{1,2})\s*[）)]/);
      if (m) return name + '（' + m[1] + '→' + m[2] + '）';
    }
    return name;
  }

  function segsOf(text, id) {
    return Array.prototype.filter.call(text.querySelectorAll('.tp-seg[data-layers]'), function (s) {
      return s.getAttribute('data-layers').split(' ').indexOf(id) >= 0;
    });
  }

  /* 同頁相鄰行的「同一條修辭」（如第五段映襯掛在兩行）：記為雙胞胎，開關連動、下方框只列一次 */
  function markTwins(slide) {
    var seen = {};
    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var items = line.querySelectorAll('.tp-box-r .tp-rhet[data-lid]');
      var twins = 0;
      items.forEach(function (it) {
        var key = it.textContent;
        if (seen[key]) { it.classList.add('v91-twin'); it.setAttribute('data-v91-of', seen[key]); twins++; }
        else seen[key] = it.getAttribute('data-lid');
      });
      line.classList.toggle('v91-twin-only', items.length > 0 && twins === items.length);
    });
  }
  function isTwinGroup(slide, id) {
    return !!slide.querySelector('.tp-rhet[data-v91-of="' + id + '"]') ||
           !!slide.querySelector('.tp-rhet.v91-twin[data-lid="' + id + '"]');
  }

  /* 藍色字義：同頁依出現順序深（v91-ga）淺（v91-gb）交錯；浮框可能已移到 body（_tpPopup），
     所以類別直接加在浮框元素上；連接線顏色由主程式讀浮框框線色，會自動跟著 */
  function glossAlt(slide) {
    var k = 0;
    slide.querySelectorAll('.tp-text .tp-g, .tp-text .tp-z:not(.tp-z-inline), .tp-text .tp-p.tp-p-blue').forEach(function (g) {
      var pop = g._tpPopup || g.querySelector(':scope > .tp-gd, :scope > .tp-zd, :scope > .tp-pd');
      if (!pop) return;
      var c = (k++ % 2) ? 'v91-gb' : 'v91-ga';
      [g, pop].forEach(function (e) {
        if (!e.classList.contains(c)) { e.classList.remove('v91-ga', 'v91-gb'); e.classList.add(c); }
      });
    });
  }

  function clearText(text) {
    text.querySelectorAll(':scope > .v91-lab, :scope > .v91-frame').forEach(function (e) { e.remove(); });
    text.classList.remove('v91-lab-on', 'v91-rel');
  }

  function syncSlide(slide) {
    var on = enabled();
    var order = window.tpLayerOrder || [];
    slide.querySelectorAll('.tp-seg.v91-wseg').forEach(function (s) { s.classList.remove('v91-wseg'); });
    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var text = line.querySelector(':scope > .tp-text');
      if (text) clearText(text);
    });
    if (!on) return;
    glossAlt(slide);
    slide.querySelectorAll('.tp-box-r .tp-rhet').forEach(stripQuote);
    markTwins(slide);

    /* 整句型：引句沒有標重點字（錯綜、回文、設問…），或跨行的同一條修辭 */
    var whole = {};
    slide.querySelectorAll('.tp-box-r .tp-rhet[data-lid]').forEach(function (it) {
      var id = it.getAttribute('data-lid');
      var rq = it.querySelector(':scope > .tp-rq');
      if ((rq && !rq.querySelector('.rq-hi')) || isTwinGroup(slide, id)) whole[id] = 1;
    });

    /* 整句型勝出的片段不再各自畫框，改由外框統一畫 */
    slide.querySelectorAll('.tp-seg.tp-seg-rhet[data-layers]').forEach(function (s) {
      var ids = s.getAttribute('data-layers').split(' '), win = null, rank = -1;
      ids.forEach(function (id) { var k = order.indexOf(id); if (k > rank) { rank = k; win = id; } });
      if (win && whole[win]) s.classList.add('v91-wseg');
    });

    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var text = line.querySelector(':scope > .tp-text');
      if (!text) return;
      var labs = [], frames = [], ents = [];
      line.querySelectorAll('.tp-box-r .tp-rhet[data-lid]').forEach(function (it) {
        var id = it.getAttribute('data-lid');
        if (order.indexOf(id) < 0) return;
        var segs = segsOf(text, id);
        if (segs.length) ents.push({ it: it, id: id, segs: segs });
      });
      if (!ents.length) return;
      /* 先把行高設好（有標籤才拉高），再量位置，否則外框會停在拉高前的位置 */
      text.classList.add('v91-rel');
      if (ents.some(function (e) { return !e.it.classList.contains('v91-twin'); })) text.classList.add('v91-lab-on');
      var base = text.getBoundingClientRect();
      ents.forEach(function (e) {
        var it = e.it, id = e.id, segs = e.segs;
        if (!it.classList.contains('v91-twin')) labs.push({ seg: segs[0], txt: labelText(it) });
        if (whole[id]) {
          /* 每一橫列取所有片段的聯集，畫一個外框 */
          var rows = {};
          segs.forEach(function (s) {
            Array.prototype.forEach.call(s.getClientRects(), function (r) {
              if (!r.width) return;
              var k = Math.round(r.top);
              var o = rows[k] || (rows[k] = { l: r.left, r: r.right, t: r.top, b: r.bottom });
              o.l = Math.min(o.l, r.left); o.r = Math.max(o.r, r.right);
              o.t = Math.min(o.t, r.top); o.b = Math.max(o.b, r.bottom);
            });
          });
          Object.keys(rows).forEach(function (k) { frames.push(rows[k]); });
        }
      });
      /* 外框：被其他外框包在裡面的較貼字，外層的往外多撐一些 */
      function inside(g, f) {
        return g !== f && Math.abs(g.t - f.t) < 4 && g.l >= f.l - 1 && g.r <= f.r + 1 && (g.r - g.l) < (f.r - f.l);
      }
      frames.forEach(function (f) {
        var depth = 0, outer = 0;
        frames.forEach(function (g) {
          if (inside(g, f)) depth++;
          if (inside(f, g)) outer++;
        });
        var pad = 3 + 4 * depth;
        var el = document.createElement('div');
        el.className = 'v91-frame' + (outer % 2 ? ' v91-light' : '');
        el.style.left = (f.l - base.left - pad) + 'px';
        el.style.top = (f.t - base.top - pad) + 'px';
        el.style.width = (f.r - f.l + pad * 2) + 'px';
        el.style.height = (f.b - f.t + pad * 2) + 'px';
        text.appendChild(el);
      });
      if (!labs.length) return;
      labs.forEach(function (l) {
        var r = l.seg.getClientRects()[0] || l.seg.getBoundingClientRect();
        var el = document.createElement('span');
        el.className = 'v91-lab';
        el.textContent = l.txt;
        el.style.top = (r.top - base.top - 9) + 'px';
        text.appendChild(el);
        l.el = el; l.x = r.left - base.left; l.row = Math.round(r.top); l.w = el.getBoundingClientRect().width;
      });
      /* 同一行的標籤不重疊：依序往右推；超出右緣則往左收 */
      labs.sort(function (a, b) { return a.row - b.row || a.x - b.x; });
      var prevRow = null, prevRight = -1e9;
      labs.forEach(function (l) {
        if (l.row !== prevRow) { prevRow = l.row; prevRight = -1e9; }
        var x = Math.max(l.x, prevRight + 6);
        if (x + l.w > base.width) x = Math.max(0, base.width - l.w);
        l.el.style.left = x + 'px';
        prevRight = x + l.w;
      });
    });
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      document.querySelectorAll('#wk-slide-area, #wkfs-body').forEach(function (area) {
        if (area.querySelector('.tp-line')) syncSlide(area);
        area.querySelectorAll('.tp-text').forEach(function (t) {
          if (!t.__v91ro && ro) { t.__v91ro = 1; ro.observe(t); }
        });
      });
    }, 30);
  }
  var ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;

  if (typeof tpRecolor === 'function') {
    var _tpRecolor = tpRecolor;
    tpRecolor = function () { var r = _tpRecolor.apply(this, arguments); schedule(); return r; };
  }
  /* 雙胞胎連動：切換其中一條，同頁另一條跟著同步開／關 */
  if (typeof tpLayerToggle === 'function') {
    var _tpLayerToggle = tpLayerToggle, syncing = false;
    tpLayerToggle = function (id, btn) {
      var r = _tpLayerToggle.apply(this, arguments);
      if (syncing || !enabled() || !btn || !btn.closest) return r;
      var slide = btn.closest('#wk-slide-area, #wkfs-body');
      if (!slide) return r;
      var nowOn = (window.tpLayerOrder || []).indexOf(id) >= 0;
      var main = btn.getAttribute('data-v91-of') || id;
      var group = slide.querySelectorAll('.tp-rhet[data-lid="' + main + '"], .tp-rhet[data-v91-of="' + main + '"]');
      syncing = true;
      try {
        group.forEach(function (it) {
          var lid = it.getAttribute('data-lid');
          if (lid === id) return;
          var isOn = (window.tpLayerOrder || []).indexOf(lid) >= 0;
          if (isOn !== nowOn) _tpLayerToggle(lid, it);
        });
      } finally { syncing = false; }
      return r;
    };
  }

  function onlyOurs(list) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (!(n.nodeType === 1 && (n.classList.contains('v91-lab') || n.classList.contains('v91-frame')))) return false;
    }
    return true;
  }
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === 'childList' && onlyOurs(m.addedNodes) && onlyOurs(m.removedNodes)) continue;
      schedule();
      return;
    }
  }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  schedule();
})();
