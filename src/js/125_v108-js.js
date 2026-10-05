
/* v108（2026-10-05）
   1. 日曆改日期：v98 日曆每一筆（右側當日清單、接下來三週）在 ✕ 前多一顆 📅；可勾選同一天同項目的其他班一起改。只改 exam_cal_v1 該筆的 date。
   2. 註釋小考拆題模式（nq-varmode，本機設定）：整句＋小字詞隨機（原本行為）／只考整句／只考小字詞。
      做法：考卷畫面產生後（#nq2-qlist 換內容）依模式改寫有拆題的題卡；沒有拆題的註釋照舊。不改 v56 任何函式。
   3. 小考紀錄面板（班級進度「📝 小考紀錄」、小考畫面「📝 小考紀錄」）：
      - 每筆紀錄可設訂正規則 corr：[{op:'ge'|'le', s:分數, t:次數}]（新紀錄預設帶上一次的規則，本機 nq-corr-last）
      - 換題：換成同課另一題（有拆題可選整句或小字詞），同步更新班級進度那筆文字
      - 給學生看 pub（預設是）。學生端經 Apps Script（gr-3 stuGet）讀 nq-records-v1，只拿得到自己班、pub 不是 false 的紀錄
   4. 小考紀錄補答案：每題存 a（答案純文字）、s（原句）；新紀錄在儲存當下補，舊紀錄在本機已從雲端同步過（或未登入同步）時補。
      理由：學生端沒有全部課文資料；避免舊裝置在還沒拉到雲端最新版前改動、蓋掉別台的新紀錄。 */
(function () {
  'use strict';
  var CAL = 'exam_cal_v1', REC = 'nq-records-v1', VM = 'nq-varmode', CORR_LAST = 'nq-corr-last';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function wdOf(s) { var a = String(s).split('-'); return WD[new Date(+a[0], +a[1] - 1, +a[2]).getDay()]; }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function bank(L) { try { return typeof window.nq2BuildLesson === 'function' ? window.nq2BuildLesson(L) : null; } catch (e) { return null; } }
  function noBk(h, D) {
    h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, '');
    ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); });
    return h;
  }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }

  /* ════════ 1. 日曆改日期 ════════ */
  var calList = function () { var a = jget(CAL, []); return Array.isArray(a) ? a : []; };
  function calLabel(el) { var t = el.closest('.v98-it'); var s = t && t.querySelector('.v98-tx'); return s ? s.textContent : ''; }
  function decorateCal() {
    var m = document.getElementById('v98-cal'); if (!m) return;
    m.querySelectorAll('.v98-it').forEach(function (it) {
      if (it.querySelector('.v108-mv')) return;
      var d = it.querySelector('[data-v98^="del|"]'); if (!d) return;
      var id = d.getAttribute('data-v98').slice(4);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'v108-mv'; b.title = '改日期'; b.textContent = '📅';
      b.addEventListener('click', function (e) { e.stopPropagation(); openMove(id, calLabel(b)); });
      it.insertBefore(b, d);
    });
  }
  function mvDlg() {
    var d = document.getElementById('v108-mvdlg'); if (d) return d;
    d = document.createElement('div'); d.id = 'v108-mvdlg';
    d.innerHTML = '<div class="bx"><h4>改日期</h4><div class="it"></div><div class="lb">新的日期</div>' +
      '<input type="date" class="dt"><span class="wd"></span><div class="sib"></div>' +
      '<div class="ft"><button type="button" class="no">取消</button><button type="button" class="ok">確定改日期</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.classList.contains('no')) d.classList.remove('show'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') d.classList.remove('show'); e.stopPropagation(); });
    d.querySelector('.dt').addEventListener('input', function () { syncMv(); });
    d.querySelector('.ok').addEventListener('click', doMove);
    return d;
  }
  var mvId = null;
  function syncMv() {
    var d = mvDlg(), v = d.querySelector('.dt').value, e = calList().filter(function (x) { return x.id === mvId; })[0];
    d.querySelector('.wd').textContent = v ? '（星期' + wdOf(v) + '）' : '';
    d.querySelector('.ok').disabled = !v || !e || v === e.date;
  }
  function openMove(id, lbl) {
    var a = calList(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    mvId = id;
    var d = mvDlg();
    d.querySelector('.it').innerHTML = '<span class="tg" style="display:inline-block;padding:1px 7px;border-radius:9px;color:#fff;font-size:12px;background:' + ccol(e.cls) + '">' + esc(e.cls) + '</span> ' +
      esc(md(e.date) + '（' + wdOf(e.date) + '）' + (lbl ? '　' + lbl : ''));
    d.querySelector('.dt').value = e.date;
    var sk = JSON.stringify([e.date, e.item, e.kind, (e.lessons || []).slice().sort(), e.note || '']);
    var sibs = a.filter(function (x) { return x.id !== id && JSON.stringify([x.date, x.item, x.kind, (x.lessons || []).slice().sort(), x.note || '']) === sk; });
    d.querySelector('.sib').innerHTML = sibs.length ? '<div class="lb">同一天的同一項，其他班也一起改：</div>' + sibs.map(function (x) {
      return '<label><input type="checkbox" value="' + esc(x.id) + '">' + esc(x.cls) + '</label>';
    }).join('') : '';
    syncMv();
    d.classList.add('show');
    setTimeout(function () { try { d.querySelector('.dt').focus(); } catch (er) {} }, 30);
  }
  function doMove() {
    var d = mvDlg(), v = d.querySelector('.dt').value; if (!v || !mvId) return;
    var ids = [mvId].concat(Array.prototype.map.call(d.querySelectorAll('.sib input:checked'), function (x) { return x.value; }));
    var a = calList(), n = 0;
    a.forEach(function (x) { if (ids.indexOf(x.id) >= 0 && x.date !== v) { x.date = v; x.moved = new Date().toISOString(); n++; } });
    if (!n) { d.classList.remove('show'); return; }
    if (!jput(CAL, a)) return;
    d.classList.remove('show');
    if (window.V98CAL && document.getElementById('v98-cal') && document.getElementById('v98-cal').classList.contains('open')) window.V98CAL.open();
  }
  (function watchCal() {
    var m = document.getElementById('v98-cal');
    if (!m) { setTimeout(watchCal, 800); return; }
    new MutationObserver(decorateCal).observe(m, { childList: true, subtree: true });
    decorateCal();
  })();

  /* ════════ 2. 註釋小考拆題模式 ════════ */
  var VMODES = [['mix', '整句＋小字詞隨機'], ['whole', '只考整句'], ['sub', '只考小字詞']];
  function vmode() { var v = jget(VM, 'mix'); return v === 'whole' || v === 'sub' ? v : 'mix'; }
  function curLesson() {
    var s = document.getElementById('nq2-lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function excerpt(s, a, b) {   /* 同 v56 考卷的 excerpt：長句只顯示目標所在小句 */
    var full = { pre: s.slice(0, a), w: s.slice(a, b), post: s.slice(b), cutL: false, cutR: false };
    if (a < 0 || s.length <= 30) return full;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return full;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return { pre: p.slice(0, a - acc), w: s.slice(a, b), post: p.slice(b - acc), cutL: k > 0, cutR: k < parts.length - 1 };
      acc = end;
    }
    return full;
  }
  function applyVmode() {
    var mode = vmode(); if (mode === 'mix') return;
    var D = bank(curLesson()); if (!D) return;
    document.querySelectorAll('#nq2-qlist .qc').forEach(function (c) {
      if (c.getAttribute('data-v108') === mode) return;
      c.setAttribute('data-v108', mode);
      var src = c.querySelector('.qs .src'), mk = c.querySelector('.qs mark'), qs = c.querySelector('.qs'), body = c.querySelector('.qa-body');
      if (!src || !qs || !body) return;
      var no = +String(src.textContent).replace(/\D/g, ''), shown = (qs.textContent || '').replace(src.textContent, '').replace(/…/g, '');
      var cand = [];
      D.items.forEach(function (it, i) { if (it[0] === no && D.vars[i]) cand.push(i); });
      if (cand.length > 1) cand = cand.filter(function (i) { return D.items[i][2].indexOf(shown) >= 0; });
      if (cand.length !== 1) return;
      var i = cand[0], vs = D.vars[i], s = D.items[i][2];
      var whole = vs.filter(function (v) { return v[4] === 'whole'; })[0], subs = vs.filter(function (v) { return v[4] === 'sub'; });
      var cur = mk ? mk.textContent : '', isWhole = whole && cur === whole[0], v = null;
      if (mode === 'whole' && !isWhole && whole) v = whole;
      else if (mode === 'sub' && isWhole && subs.length) v = subs[Math.floor(Math.random() * subs.length)];
      if (!v) return;
      var x = excerpt(s, v[1], v[2]);
      qs.innerHTML = (x.cutL ? '<span class="el">…</span>' : '') + esc(x.pre) + (x.w ? '<mark>' + esc(x.w) + '</mark>' : '') + esc(x.post) +
        (x.cutR ? '<span class="el">…</span>' : '') + '<span class="src">註' + no + '</span>';
      body.innerHTML = '<span class="aw">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '：</span>' + noBk(v[3], D);
    });
  }
  function addVmodeUI() {
    var sh = document.getElementById('nq2-shuffle');
    if (!sh || document.getElementById('nq2-v108vm')) return !!sh;
    var w = document.createElement('span'); w.className = 'v108-vm'; w.id = 'nq2-v108vm';
    w.innerHTML = '拆題：' + VMODES.map(function (m) { return '<button type="button" data-vm="' + m[0] + '">' + m[1] + '</button>'; }).join('');
    w.title = '只影響「整句＋小字詞」有拆題的註釋；其他註釋照常出題';
    var lab = sh.closest('label') || sh;
    lab.parentNode.insertBefore(w, lab.nextSibling);
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-vm]'); if (!b) return;
      jput(VM, b.getAttribute('data-vm')); paintVm();
    });
    paintVm();
    var ql = document.getElementById('nq2-qlist');
    if (ql) new MutationObserver(applyVmode).observe(ql, { childList: true });
    return true;
  }
  function paintVm() { var m = vmode(); document.querySelectorAll('#nq2-v108vm [data-vm]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-vm') === m); }); }
  (function tryVm(n) { if (!addVmodeUI() && n < 40) setTimeout(function () { tryVm(n + 1); }, 500); })(0);

  /* ════════ 3＆4. 小考紀錄：補答案、訂正規則、換題、給學生看 ════════ */
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function rid(r) { return r.id || ('q' + String(r.createdAt || '').replace(/\D/g, '')); }
  function localDate(iso) { var d = new Date(iso); return isNaN(d) ? '' : ymd(d); }
  function findIdx(D, key, no) {
    var i = -1;
    D.items.forEach(function (it, k) { if (i < 0 && it[0] + '|' + it[1] === key) i = k; });
    if (i < 0) D.items.forEach(function (it, k) { if (i < 0 && it[0] === no) i = k; });
    return i;
  }
  function answerOf(D, i, w) {
    var it = D.items[i], vs = D.vars[i];
    if (vs) { var v = vs.filter(function (x) { return x[0] === w; })[0]; if (v) return { a: txt(noBk(v[3], D)), whole: v[4] === 'whole' }; }
    return { a: txt(noBk(it[3], D)), whole: false };
  }
  /* 補 id、每題 a／s；有改動回傳 true */
  function enrich(list) {
    var ch = false;
    list.forEach(function (r) {
      if (!r || !r.lesson || !Array.isArray(r.questions)) return;
      if (!r.id) { r.id = rid(r); ch = true; }
      var D = null;
      r.questions.forEach(function (q, k) {
        if (q.a != null && q.s != null) return;
        D = D || bank(r.lesson); if (!D) return;
        var i = findIdx(D, (r.questionKeys || [])[k], q.no); if (i < 0) return;
        var x = answerOf(D, i, q.w);
        q.a = x.a; q.s = D.items[i][2]; if (x.whole) q.whole = true;
        ch = true;
      });
    });
    return ch;
  }
  /* 新紀錄（v60 儲存）當下就補上答案與預設訂正規則 */
  var SP = Storage.prototype, prevSet = SP.setItem, inSet = false;
  SP.setItem = function (k, v) {
    if (!inSet && this === window.localStorage && k === REC) {
      try {
        var list = JSON.parse(v), before = recs().length;
        if (Array.isArray(list)) {
          var last = jget(CORR_LAST, null);
          if (list.length > before && last) list.slice(before).forEach(function (r) { if (r && !r.corr) r.corr = last; });
          if (enrich(list) || list.length > before) v = JSON.stringify(list);
        }
      } catch (e) {}
    }
    inSet = true;
    try { return prevSet.call(this, k, v); } finally { inSet = false; }
  };
  /* 舊紀錄：本機已從雲端拉過資料（或沒登入同步）才補，避免舊資料蓋掉別台 */
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safeToWrite() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  function enrichStored() {
    if (!safeToWrite() || typeof window.nq2BuildLesson !== 'function') return;
    var a = recs(); if (enrich(a)) jput(REC, a);
  }
  setTimeout(enrichStored, 4000);
  setInterval(enrichStored, 30000);

  /* v60 的摘要格式（班級進度那筆用來比對、換題時一起更新） */
  function summary(r) {
    return '〈' + r.lesson.split('—')[0] + '〉註釋小考　註' + r.rangeStart + '～註' + r.rangeEnd + '，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function (q) { return '註' + q.no + ' ' + q.w; }).join('、');
  }

  var fCls = '', swapAt = null, swapPick = null;   /* swapAt＝{id,k}；swapPick＝選中的題目 index */
  function panel() {
    var p = document.getElementById('v108-nqr'); if (p) return p;
    p = document.createElement('div'); p.id = 'v108-nqr';
    p.innerHTML = '<div class="bx"></div>';
    document.body.appendChild(p);
    p.addEventListener('click', onClick);
    p.addEventListener('change', onChange);
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeP(); e.stopPropagation(); });
    return p;
  }
  function openP() { if (safeToWrite()) enrichStored(); swapAt = null; panel().classList.add('open'); render(); }
  function closeP() { var p = document.getElementById('v108-nqr'); if (p) p.classList.remove('open'); }
  function tag(c) { return '<span class="tg" style="background:' + ccol(c) + '">' + esc(c) + '</span>'; }
  function corrHTML(r) {
    var cs = Array.isArray(r.corr) ? r.corr : null, id = esc(r.id);
    if (!cs || !cs.length) {
      var last = jget(CORR_LAST, null);
      return '<div class="corr"><span class="none">訂正規則：尚未設定</span>' +
        '<button type="button" data-a="cnew|' + id + '">＋ 設定</button>' +
        (last ? '<button type="button" data-a="clast|' + id + '">套用上次（' + esc(corrText(last)) + '）</button>' : '') + '</div>';
    }
    return '<div class="corr">訂正：' + cs.map(function (c, j) {
      return '<span class="rw"><input type="number" min="0" max="100" data-c="' + id + '|' + j + '|s" value="' + esc(c.s == null ? '' : c.s) + '">分' +
        '<button type="button" data-a="cop|' + id + '|' + j + '">' + (c.op === 'le' ? '以下' : '以上') + '</button>' +
        ' 訂正 <input type="number" min="0" max="20" data-c="' + id + '|' + j + '|t" value="' + esc(c.t == null ? '' : c.t) + '"> 次' +
        '<button type="button" data-a="cdel|' + id + '|' + j + '" title="刪除這一級">✕</button></span>';
    }).join('') + '<button type="button" data-a="cadd|' + id + '">＋ 級距</button></div>';
  }
  function corrText(cs) {
    return (cs || []).filter(function (c) { return c && c.s !== '' && c.s != null; }).map(function (c) {
      return c.s + '分' + (c.op === 'le' ? '以下' : '以上') + '訂正' + (c.t == null || c.t === '' ? '?' : c.t) + '次';
    }).join('、');
  }
  function render() {
    var p = panel(), bx = p.querySelector('.bx');
    var all = recs().map(function (r, i) { return { r: r, i: i }; }).filter(function (o) { return o.r && o.r.lesson && (!fCls || (o.r.classes || []).indexOf(fCls) >= 0); });
    all.sort(function (a, b) { return String(b.r.createdAt).localeCompare(String(a.r.createdAt)); });
    var h = '<div class="top"><h3>📝 註釋小考紀錄</h3><span class="sp"></span><button type="button" data-a="x">✕ 關閉</button></div>';
    h += '<div class="flt"><button type="button" data-a="f|"' + (fCls ? '' : ' class="on"') + '>四班全部</button>' +
      classes().map(function (c) { return '<button type="button" data-a="f|' + esc(c) + '"' + (fCls === c ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('') +
      '<span class="hint">改動會經雲端同步給學生端（學生重新打開網頁就會看到）</span></div>';
    h += '<div class="lst">' + (all.length ? all.map(function (o) { return recHTML(o.r); }).join('') : '<div class="empty">還沒有小考紀錄。在註釋小考的考卷畫面按「記錄本次小考」就會出現在這裡。</div>') + '</div>';
    h += '<div class="ft">訂正規則、換題、「給學生看」都會存在小考紀錄（nq-records-v1）。換題時，班級進度裡同一天的那筆考試文字也會一起更新。</div>';
    bx.innerHTML = h;
  }
  function recHTML(r) {
    var id = esc(r.id || rid(r)), d = localDate(r.createdAt), pub = r.pub !== false;
    var h = '<div class="rec' + (pub ? '' : ' hid') + '"><div class="rh"><b>' + (d ? md(d) + '（' + wdOf(d) + '）' : '') + '　〈' + esc(String(r.lesson).split('—')[0]) + '〉</b>' +
      '<span>註' + esc(r.rangeStart) + '～註' + esc(r.rangeEnd) + '・' + r.questions.length + ' 題</span>' + (r.classes || []).map(tag).join(' ') +
      '<label class="pub"><input type="checkbox" data-pub="' + id + '"' + (pub ? ' checked' : '') + '>給學生看</label></div>';
    h += corrHTML(r);
    h += '<ul class="qs">' + r.questions.map(function (q, k) {
      var on = swapAt && swapAt.id === r.id && swapAt.k === k;
      return '<li><span class="n">註' + esc(q.no) + '</span><span class="w">' + esc(q.whole ? '整句' : q.w) + '</span>' +
        '<span class="a">' + esc(q.a == null ? '（答案尚未補上）' : q.a) + '</span>' +
        '<button type="button" class="sw" data-a="sw|' + id + '|' + k + '">' + (on ? '取消換題' : '換題') + '</button></li>' + (on ? pickHTML(r, k) : '');
    }).join('') + '</ul></div>';
    return h;
  }
  function pickHTML(r, k) {
    var D = bank(r.lesson);
    if (!D) return '<li class="pick">這一課目前沒有題庫資料。</li>';
    var used = {}; (r.questionKeys || []).forEach(function (x, j) { if (j !== k) used[x] = 1; });
    var h = '<li class="pick" style="display:block"><div class="ph">把「註' + esc(r.questions[k].no) + ' ' + esc(r.questions[k].w) + '」換成：</div><div class="g">' +
      D.items.map(function (it, i) {
        var lab = D.vars[i] ? D.vars[i][0][0] : it[1];
        return '<button type="button" data-a="sp|' + i + '"' + (used[it[0] + '|' + it[1]] ? ' disabled title="這次已經考了"' : '') +
          (swapPick === i ? ' style="background:#7a2e2e;color:#fff"' : '') + '><small>' + it[0] + '</small>' + esc(lab.length > 12 ? lab.slice(0, 12) + '…' : lab) + '</button>';
      }).join('') + '</div>';
    if (swapPick != null && D.items[swapPick]) {
      var vs = D.vars[swapPick];
      h += '<div class="vs">' + (vs ? '考哪一個：' + vs.map(function (v, j) {
        return '<button type="button" data-a="sv|' + j + '">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '</button>';
      }).join('') : '<button type="button" data-a="sv|-1">確定換成「註' + D.items[swapPick][0] + ' ' + esc(D.items[swapPick][1]) + '」</button>') + '</div>';
    }
    return h + '</li>';
  }
  function update(id, fn) {
    var a = recs(), r = a.filter(function (x) { return x && (x.id || rid(x)) === id; })[0]; if (!r) return null;
    if (!r.id) r.id = id;
    var old = JSON.parse(JSON.stringify(r));
    fn(r);
    jput(REC, a);
    return { old: old, now: r };
  }
  function doSwap(vj) {
    if (!swapAt || swapPick == null) return;
    var res = update(swapAt.id, function (r) {
      var D = bank(r.lesson), it = D.items[swapPick], vs = D.vars[swapPick], v = vs && vs[vj];
      var w = v ? v[0] : it[1], x = answerOf(D, swapPick, w);
      r.questionKeys = r.questionKeys || [];
      r.questionKeys[swapAt.k] = it[0] + '|' + it[1];
      r.questions[swapAt.k] = { no: it[0], w: w, a: x.a, s: it[2] };
      if (x.whole) r.questions[swapAt.k].whole = true;
      /* 題目維持註號順序（同 v60 紀錄） */
      var z = r.questions.map(function (q, j) { return { q: q, k: r.questionKeys[j] }; }).sort(function (a, b) { return a.q.no - b.q.no; });
      r.questions = z.map(function (o) { return o.q; }); r.questionKeys = z.map(function (o) { return o.k; });
      var nos = r.questions.map(function (q) { return q.no; });
      r.rangeStart = Math.min.apply(null, nos); r.rangeEnd = Math.max.apply(null, nos);
      r.edited = new Date().toISOString();
    });
    if (res) syncClsRecord(res.old, res.now);
    swapAt = null; swapPick = null;
    render();
  }
  /* 班級進度（cls_records_v1）：v60 存的是 { d: 當天, k: '考試', t: esc(摘要) }，以同日＋原摘要比對 */
  function syncClsRecord(old, now) {
    if (typeof clsLoad !== 'function' || typeof clsSave !== 'function') return;
    var cls = clsLoad(), d = localDate(old.createdAt), ot = esc(summary(old)), nt = esc(summary(now)), n = 0;
    (old.classes || []).forEach(function (c) {
      (cls[c] || []).forEach(function (e) { if (e && e.d === d && e.k === '考試' && e.t === ot) { e.t = nt; n++; } });
    });
    if (n) { clsSave(cls); if (typeof clsRender === 'function') try { clsRender(); } catch (e) {} }
  }
  function onClick(e) {
    var p = panel();
    if (e.target === p) { closeP(); return; }
    var b = e.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a').split('|'), t = a[0];
    if (t === 'x') closeP();
    else if (t === 'f') { fCls = a[1]; render(); }
    else if (t === 'sw') { var k = +a[2]; swapAt = swapAt && swapAt.id === a[1] && swapAt.k === k ? null : { id: a[1], k: k }; swapPick = null; render(); }
    else if (t === 'sp') { swapPick = +a[1]; var D = null; var r = recs().filter(function (x) { return x && (x.id || rid(x)) === swapAt.id; })[0];
      D = r && bank(r.lesson); if (D && !D.vars[swapPick]) { render(); } else render(); }
    else if (t === 'sv') doSwap(+a[1]);
    else if (t === 'cnew') { update(a[1], function (r) { r.corr = [{ op: 'ge', s: '', t: '' }, { op: 'le', s: '', t: '' }]; }); render(); }
    else if (t === 'clast') { var l = jget(CORR_LAST, null); if (l) update(a[1], function (r) { r.corr = l; }); render(); }
    else if (t === 'cadd') { update(a[1], function (r) { r.corr = (r.corr || []).concat([{ op: 'ge', s: '', t: '' }]); }); render(); }
    else if (t === 'cdel') { update(a[1], function (r) { r.corr.splice(+a[2], 1); if (!r.corr.length) delete r.corr; }); render(); }
    else if (t === 'cop') { var res = update(a[1], function (r) { var c = r.corr[+a[2]]; c.op = c.op === 'le' ? 'ge' : 'le'; }); if (res) jput(CORR_LAST, res.now.corr); render(); }
  }
  function onChange(e) {
    var x = e.target;
    if (x.hasAttribute('data-pub')) { update(x.getAttribute('data-pub'), function (r) { if (x.checked) delete r.pub; else r.pub = false; }); render(); return; }
    if (x.hasAttribute('data-c')) {
      var a = x.getAttribute('data-c').split('|'), v = x.value === '' ? '' : Math.max(0, Math.round(+x.value));
      var res = update(a[0], function (r) { if (r.corr && r.corr[+a[1]]) r.corr[+a[1]][a[2]] = v; });
      if (res && res.now.corr) jput(CORR_LAST, res.now.corr);
    }
  }
  function addEntry() {
    var p = document.getElementById('cls-panel');
    if (p && !document.getElementById('v108-open')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'v108-open'; b.textContent = '📝 小考紀錄（訂正、換題、給學生看）';
      b.onclick = openP;
      var cal = document.getElementById('v98-open');
      if (cal) cal.parentNode.insertBefore(b, cal.nextSibling); else p.insertBefore(b, p.firstChild);
    }
    var r = document.getElementById('nq2-v60rec');
    if (r && !document.getElementById('nq2-v108rec')) {
      var c = document.createElement('button'); c.type = 'button'; c.id = 'nq2-v108rec'; c.className = 'v108-nqr-btn'; c.textContent = '📝 小考紀錄';
      c.onclick = openP;
      r.parentNode.insertBefore(c, r);
    }
    return !!(p && r);
  }
  (function tryEntry(n) { if (!addEntry() && n < 40) setTimeout(function () { tryEntry(n + 1); }, 500); })(0);

  window.V108 = { openRecords: openP, enrich: enrichStored, applyVmode: applyVmode };
})();
