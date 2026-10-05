
(function () {
  /* ① （RayOclass 4b：v68 版〈師說〉習作Ａ資料已刪，實際生效的是 056_v69 的 V69_SHISHUO_WB） */

  /* ② 答案總覽：加「全部隱藏／一鍵全開」，預設隱藏 */
  var _v68prev = wkRenderSlideHTML;
  /* 原總覽只認「答案／字音／字形…」表頭；師說習作「還原語句順序」欄也是答案欄，僅在總覽渲染用的複本中改認，不動資料 */
  var AO_COL_ALIAS = { '還原語句順序': '答案' };
  function aoSlideCopy(slide) {
    var W = slide.workbook || {};
    var hit = (W.sections || []).some(function (s) { return (s.cols || []).some(function (c) { return AO_COL_ALIAS[c]; }); });
    if (!hit) return slide;
    var W2 = Object.assign({}, W, { sections: W.sections.map(function (s) {
      return Object.assign({}, s, { cols: (s.cols || []).map(function (c) { return AO_COL_ALIAS[c] || c; }) });
    }) });
    return Object.assign({}, slide, { workbook: W2 });
  }
  wkRenderSlideHTML = function (slide) {
    var h = (slide && slide.type === 'work_answers') ? _v68prev.call(this, aoSlideCopy(slide)) : _v68prev.apply(this, arguments);
    if (slide && slide.type === 'work_answers' && h.indexOf('wk-ao-page') >= 0) {
      h = h.replace('wks-workanswers wk-ao-page', 'wks-workanswers wk-ao-page v68-ao-hidden');
      h = h.replace('填空類直接列答案；選擇題點題號可跳回該題檢討，答案不必再點一次。',
        '答案預設隱藏：點一格顯示該題答案；選擇題顯示答案後再點一次，可跳回該題檢討。');
      h = h.replace(/(<div class="wk-ao-desc">[\s\S]*?<\/div>)/,
        '$1<div class="v68-ao-bar"><button type="button" onclick="v68AoAll(this,false)">全部隱藏</button>' +
        '<button type="button" onclick="v68AoAll(this,true)">一鍵全開</button></div>');
    }
    return h;
  };
  window.v68AoAll = function (btn, show) {
    var sl = btn.closest('.wk-slide');
    if (!sl) return;
    sl.querySelectorAll('.wk-ao-chip, .wk-ao-choice').forEach(function (el) { el.classList.toggle('v68-show', show); });
  };
  /* 捕獲階段攔截：未顯示的格子先顯示答案，不觸發選擇題原本的跳題 */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.v68-ao-hidden .wk-ao-chip, .v68-ao-hidden .wk-ao-choice') : null;
    if (!t) return;
    if (t.classList.contains('wk-ao-chip')) { t.classList.toggle('v68-show'); return; }
    if (!t.classList.contains('v68-show')) { t.classList.add('v68-show'); e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* ③ 課文頁下方列出本頁出現的「字·X」 */
  function plainText(s) {
    var t = String(s || ''), prev;
    do { prev = t; t = t.replace(/\{[gzpy]:([^|{}]*)\|[^{}]*\}/g, '$1'); } while (t !== prev);
    do { prev = t; t = t.replace(/\{n:\d+\|([^{}]*)\}/g, '$1'); } while (t !== prev);
    return t.replace(/<[^>]+>/g, '');
  }
  function pageCharBian(page) {
    if (!page || !wkSlides) return [];
    var txt = (page.lines || []).map(function (L) { return plainText(L.text); }).join('');
    var out = [];
    wkSlides.forEach(function (s, i) {
      if (s.type !== 'charbian' || !s.first) return;
      var base = wkBaseName(s.name);
      var hit = base.split(/[／\/]/).some(function (v) { return v && txt.indexOf(v) >= 0; });
      if (hit) out.push({ name: s.name, idx: i });
    });
    return out;
  }
  window.v68CbJump = function (ev, idx) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    window.wkReturnTo = { idx: wkIdx, li: null };
    wkGoto(idx);
  };
  function injectCbBar() {
    var s = wkSlides && wkSlides[wkIdx];
    if (!s || s.type !== 'textpage') return;
    var list = pageCharBian(s.page);
    if (!list.length) return;
    var html = '<span class="v68-cbbar-h">本頁字詞辨析</span>' + list.map(function (c) {
      return '<button type="button" onclick="v68CbJump(event,' + c.idx + ')">字·' + c.name + '</button>';
    }).join('');
    document.querySelectorAll('#wk-slide-area .wks-textpage .tp-main, #wkfs-body .wks-textpage .tp-main').forEach(function (m) {
      if (m.querySelector('.v68-cbbar')) return;
      var d = document.createElement('div');
      d.className = 'v68-cbbar';
      d.innerHTML = html;
      m.appendChild(d);
    });
  }

  /* ④ 導覽列（一般＋全螢幕）字·X 收成「字詞辨析 ▾」 */
  function collapseNav(boxId, btnCls) {
    var box = document.getElementById(boxId);
    if (!box || box.querySelector('.v68-cb-toggle')) return;
    var btns = Array.prototype.filter.call(box.querySelectorAll('button.' + btnCls), function (b) {
      return (b.textContent || '').indexOf('字·') === 0;
    });
    if (btns.length < 2) return;
    var tog = document.createElement('button');
    tog.type = 'button';
    tog.className = btnCls + ' v68-cb-toggle';
    tog.textContent = '字詞辨析 ▾';
    var grp = document.createElement('span');
    grp.className = 'v68-cb-group';
    tog.onclick = function (e) {
      e.stopPropagation();
      var open = grp.classList.toggle('open');
      tog.textContent = open ? '字詞辨析 ▴' : '字詞辨析 ▾';
    };
    box.insertBefore(tog, btns[0]);
    box.insertBefore(grp, btns[0]);
    btns.forEach(function (b) { grp.appendChild(b); });
  }
  function markToggle() {
    [['wk-sections', 'wk-sec-active'], ['wkfs-sections', 'active']].forEach(function (p) {
      var box = document.getElementById(p[0]);
      var tog = box && box.querySelector('.v68-cb-toggle');
      if (!tog) return;
      tog.classList.toggle(p[1], !!box.querySelector('.v68-cb-group .' + p[1]));
    });
  }

  var _v68render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v68render.apply(this, arguments);
    try { injectCbBar(); } catch (e) {}
    try { markToggle(); } catch (e) {}
    return r;
  };
  var _v68show = showWenxue;
  showWenxue = function () {
    var r = _v68show.apply(this, arguments);
    collapseNav('wk-sections', 'wk-sec-btn'); markToggle();
    return r;
  };
  var _v68proj = wkOpenProj;
  wkOpenProj = function () {
    var r = _v68proj.apply(this, arguments);
    collapseNav('wkfs-sections', 'wkfs-sec-btn'); markToggle();
    return r;
  };
})();
