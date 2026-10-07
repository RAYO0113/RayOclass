
(function () {
  /* 課次同 v84（L1～L6 依 source/115-1/高職/第一冊 教材檔名）；L7 以後尚未建課，只顯示課次 */
  var LESSONS = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐' };
  var MAXL = 12;
  var KINDS = ['考試', '交作業'];
  function disp(k) { return String(k).replace('課後習題', '課本後習題'); }   /* V123：畫面上叫「課本後習題」（基礎練習＋進階練習）；存的值仍是「課後習題」 */
  var ITEMS = ['A卷', 'A卷檢討', '習作', '習作檢討', '註釋小考', '課後習題', '課後習題檢討', '其他'];   /* V123：加習作檢討、課後習題檢討（重要進度檢核「檢討」格） */   /* v102：加 A卷檢討 */   /* v100：加註釋小考 */
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];   /* 四班顏色，依 CLS_LIST 順序 */
  var K = { data: 'exam_cal_v1', cls: 'exam_cal_cls_v1' };
  var WD = ['日', '一', '二', '三', '四', '五', '六'];   /* v103：星期日開頭 */
  var exporting = false;

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function wdName(s) { return WD[parse(s).getDay()]; }
  function list() { var a = get(K.data, []); return Array.isArray(a) ? a : []; }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* 當天有國文課的班級：讀 V82 課表（老師改過的 tp_schedule_v1 優先，否則 V82 預設課表的同一份資料） */
  var DEF_SLOTS = [[1,'冷一孝'],[1,'冷一忠'],[1,'建一忠'],[1,'建一孝'],[2,'建一孝'],[3,'冷一孝'],[3,'冷一忠'],
    [4,'建一孝'],[4,'冷一孝'],[4,'建一忠'],[5,'建一忠'],[5,'冷一忠'],[5,'建一孝']];
  function meets(dateStr) {
    var wd = parse(dateStr).getDay(), s = get('tp_schedule_v1', null), out = {};
    if (s && s.slots) s.slots.forEach(function (x) { if (x.wd === wd && x.normal !== false && x.cls) out[x.cls] = 1; });
    else DEF_SLOTS.forEach(function (x) { if (x[0] === wd) out[x[1]] = 1; });
    return out;
  }

  function lesText(ls) {
    ls = (ls || []).slice().sort(function (a, b) { return a - b; });
    if (!ls.length) return '';
    /* 連續的課併成區間：L1、L2、L3 → L1–3 */
    var out = [], i = 0;
    while (i < ls.length) { var j = i; while (j + 1 < ls.length && ls[j + 1] === ls[j] + 1) j++; out.push('L' + ls[i] + (j > i ? '–' + ls[j] : '')); i = j + 1; }
    return out.join('、');
  }
  function lesLong(ls) {
    return (ls || []).slice().sort(function (a, b) { return a - b; })
      .map(function (n) { return 'L' + n + (LESSONS[n] ? ' ' + LESSONS[n] : ''); }).join('、');
  }
  function label(e) {
    if (e.item === '註釋小考') {
      var q = e.quiz || {}, np = (q.pick || []).length, nm = (q.must || []).length;
      return '小考 ' + lesText(e.lessons) + (np ? ' 選' + (np + nm) + '題' : (e.quiz ? ' 註' + q.a + '–' + q.b + ' 抽' + q.n : '')) +
        (!np && nm ? '（必考' + nm + '）' : '') + (e.note ? '（' + e.note + '）' : '');
    }
    if (/檢討$/.test(e.item)) return disp(e.item) + ' ' + lesText(e.lessons) + (e.note ? '（' + e.note + '）' : '');
    var it = e.item === '其他' ? (e.note || '其他') : disp(e.item);
    var s = it + (e.lessons && e.lessons.length ? ' ' + lesText(e.lessons) : '') + ' ' + (e.kind === '考試' ? '考' : '交');
    if (e.item !== '其他' && e.note) s += '（' + e.note + '）';
    return s;
  }

  /* 狀態 */
  var view = null;           /* 目前月份第一天 */
  var sel = null;            /* 選取的日期字串 */
  var fCls = get(K.cls, '');  /* 篩選班級，空＝全部 */
  var form = { cls: [], kind: '考試', item: 'A卷', les: [], note: '', qa: '', qb: '', qn: '5', qmode: 'pick', qs: {} };

  function ensure() {
    var m = document.getElementById('v98-cal'); if (m) return m;
    m = document.createElement('div'); m.id = 'v98-cal';
    m.innerHTML = '<div class="v98-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m) { close(); return; }
      var b = e.target.closest && e.target.closest('[data-v98]'); if (!b) return;
      var a = b.getAttribute('data-v98').split('|'), t = a[0];
      if (t === 'x') close();
      else if (t === 'm') { view = new Date(view.getFullYear(), view.getMonth() + (+a[1]), 1); render(); }
      else if (t === 't') { var n = new Date(); view = new Date(n.getFullYear(), n.getMonth(), 1); pick(ymd(n)); }
      else if (t === 'f') { fCls = a[1]; put(K.cls, fCls); render(); }
      else if (t === 'd') pick(a[1]);
      else if (t === 'fc') { tog(form.cls, a[1]); render(); }
      else if (t === 'fca') { form.cls = form.cls.length === classes().length ? [] : classes().slice(); render(); }
      else if (t === 'fk') { form.kind = a[1]; render(); }
      else if (t === 'fi') { form.item = a[1]; if (a[1] === '註釋小考') { form.kind = '考試'; form.les = form.les.slice(0, 1); qDefault(); } render(); }
      else if (t === 'fl') { if (form.item === '註釋小考') { form.les = form.les[0] === +a[1] ? [] : [+a[1]]; form.qa = form.qb = ''; form.qs = {}; form.qmode = 'pick'; qDefault(); } else tog(form.les, +a[1]); render(); }
      else if (t === 'add') add();
      else if (t === 'del') del(a[1]);
      else if (t === 'quiz') startQuiz(a[1]);
      else if (t === 'qm') { form.qmode = a[1]; render(); }
      else if (t === 'qc') { qTog(+a[1]); render(); }
      else if (t === 'qx') { form.qs = {}; render(); }
    });
    m.addEventListener('input', function (e) { if (e.target.id === 'v98-note') { form.note = e.target.value; syncAdd(); }
      else if (/^v98-q[abn]$/.test(e.target.id)) { form[e.target.id.slice(4)] = e.target.value; syncAdd(); } });
    /* 不讓 ←→ 等鍵觸發課文換頁；Esc 關閉 */
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } e.stopPropagation(); });
    return m;
  }
  function tog(arr, v) { var i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }

  function pick(d) {
    sel = d;
    var v = parse(d);
    if (!view || v.getMonth() !== view.getMonth() || v.getFullYear() !== view.getFullYear()) view = new Date(v.getFullYear(), v.getMonth(), 1);
    /* 預設班級：有篩選就用該班；否則用當天有課的班 */
    if (fCls) form.cls = [fCls];
    else { var mt = meets(d); form.cls = classes().filter(function (c) { return mt[c]; }); }
    render();
  }

  function valid() {
    if (form.item === '註釋小考') { var qa = +form.qa, qb = +form.qb, qn = +form.qn;
      return !!(sel && form.cls.length && form.les.length === 1 && (qKeys('pick').length || (qa > 0 && qb >= qa && qn > 0))); }
    return sel && form.cls.length && (form.item !== '其他' ? form.les.length : form.note.trim());
  }
  /* v100：註釋小考 */
  function noteRange(n) {
    var k = QK[n], T = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK : {}, nos = [];
    ((T[k] || {}).textPages || []).forEach(function (p) { (p.lines || []).forEach(function (l) {
      var re = /\{n:(\d+)\|/g, m; while ((m = re.exec(l.text || ''))) nos.push(+m[1]); }); });
    return nos.length ? [Math.min.apply(null, nos), Math.max.apply(null, nos)] : null;
  }
  function qDefault() {
    if (!form.les.length) return;
    var r = noteRange(form.les[0]); if (!r) return;
    if (!form.qa) form.qa = String(r[0]); if (!form.qb) form.qb = String(r[1]);
  }
  function quizRow() {
    var r = form.les.length ? noteRange(form.les[0]) : null;
    return '<div class="v98-row v100-q"><span>註釋範圍與題數' + (r ? '（本課註' + r[0] + '～' + r[1] + '）' : (form.les.length ? '（這一課沒有註釋資料）' : '（先選一課）')) + '</span>' +
      '註 <input type="number" id="v98-qa" min="1" value="' + esc(form.qa) + '"> ～ <input type="number" id="v98-qb" min="1" value="' + esc(form.qb) + '">' +
      '　抽 <input type="number" id="v98-qn" min="1" value="' + esc(form.qn) + '"> 題</div>' + chooser();
  }
  /* v102：在日曆直接點題目（選題／必考／不考），存在這一筆 */
  function quizItems(n) { var k = QK[n]; try { return (k && typeof window.nq2BuildLesson === 'function') ? window.nq2BuildLesson(k).items : []; } catch (e) { return []; } }
  function qKey(it) { return it[0] + '|' + it[1]; }
  function qKeys(m) { return Object.keys(form.qs).filter(function (k) { return form.qs[k] === m; }); }
  function qTog(i) {
    var it = quizItems(form.les[0])[i]; if (!it) return;
    var k = qKey(it);
    if (form.qs[k] === form.qmode) delete form.qs[k]; else form.qs[k] = form.qmode;
  }
  function chooser() {
    if (!form.les.length) return '';
    var its = quizItems(form.les[0]); if (!its.length) return '';
    var a = +form.qa || 0, b = +form.qb || 9999, np = qKeys('pick').length, nm = qKeys('must').length, nx = qKeys('ex').length;
    var h = '<div class="v98-row v102-qm"><span>點題目＝（可不點，直接隨機抽）</span>' + [['pick', '選題'], ['must', '必考'], ['ex', '不考']].map(function (m) {
      return '<button type="button" class="v102-m-' + m[0] + (form.qmode === m[0] ? ' on' : '') + '" data-v98="qm|' + m[0] + '">' + m[1] + '</button>';
    }).join('') + (np + nm + nx ? '<button type="button" data-v98="qx">全部清除</button>' : '') + '</div>';
    h += '<div class="v102-qgrid">' + its.map(function (it, i) {
      var st = form.qs[qKey(it)] || '', out = it[0] < a || it[0] > b;
      return '<button type="button" class="v102-qc' + (st ? ' ' + st : '') + (out && !st ? ' out' : '') + '" data-v98="qc|' + i + '" title="' + esc(it[0] + ' ' + it[1]) + '"><b>' + it[0] + '</b>' + esc(it[1]) + '</button>';
    }).join('') + '</div>';
    h += '<div class="v102-qsum">' + (np
      ? '自己選了 ' + np + ' 題' + (nm ? '＋必考 ' + nm + ' 題' : '') + '：只考這些題，不再隨機抽。'
      : '從註' + (form.qa || '?') + '～' + (form.qb || '?') + ' 隨機抽 ' + (form.qn || '?') + ' 題' + (nm ? '，必考 ' + nm + ' 題一定在內' : '') + (nx ? '，不考 ' + nx + ' 題不會抽到' : '') + '。') + '</div>';
    return h;
  }
  function qBtn(e) { return e.item === '註釋小考' && e.quiz ? '<button type="button" class="v100-qgo" data-v98="quiz|' + e.id + '">開始小考</button>' : ''; }
  /* 開始小考：關日曆 → 開註釋小考 → 帶入課次、範圍、題數並抽題（老師按「開始小考」出題） */
  function startQuiz(id) {
    var e = list().filter(function (x) { return x.id === id; })[0]; if (!e || !e.quiz) return;
    var k = QK[e.lessons[0]];
    if (typeof window.nq2Open !== 'function' || !k) { alert('這一課目前沒有註釋小考資料。'); return; }
    close();
    var p = document.getElementById('cls-panel'); if (p && p.classList.contains('open')) clsToggle();
    window.nq2Open();
    var s = document.getElementById('nq2-lesson'), hit = -1;
    for (var i = 0; i < s.options.length; i++) if (s.options[i].text.replace(/（\d+ 題）$/, '') === k) hit = i;
    if (hit < 0) { alert('註釋小考找不到〈' + k + '〉。'); return; }
    s.selectedIndex = hit; if (typeof s.onchange === 'function') s.onchange({ target: s });
    /* v102：依這筆的選題／必考／不考決定題目，再到小考畫面逐題點選 */
    var its = quizItems(e.lessons[0]), q = e.quiz, pick = q.pick || [], must = q.must || [], ex = q.ex || [], want = {};
    if (pick.length) pick.concat(must).forEach(function (x) { want[x] = 1; });
    else {
      must.forEach(function (x) { want[x] = 1; });
      var pool = its.filter(function (it) { var kk = qKey(it); return it[0] >= q.a && it[0] <= q.b && ex.indexOf(kk) < 0 && !want[kk]; });
      for (var j = pool.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)), tt = pool[j]; pool[j] = pool[r]; pool[r] = tt; }
      pool.slice(0, Math.max(0, q.n - must.length)).forEach(function (it) { want[qKey(it)] = 1; });
    }
    document.getElementById('nq2-ra').value = q.a;
    document.getElementById('nq2-rb').value = q.b;
    document.getElementById('nq2-rn').value = pick.length ? pick.length + must.length : q.n;
    document.getElementById('nq2-mPick').click();
    document.getElementById('nq2-bClear').click();
    its.forEach(function (it, i) {
      var c = document.querySelector('#nq2-grid .chip[data-i="' + i + '"]'); if (!c) return;
      if (!!want[qKey(it)] !== c.classList.contains('on')) c.click();
    });
    pend = [e.cls]; hookDlg();
  }
  /* 從日曆開的小考：「記錄本次小考」視窗自動勾好該班 */
  var pend = null;
  function hookDlg() {
    var d = document.getElementById('nq2-v60dlg'); if (!d || d.__v100) return; d.__v100 = 1;
    new MutationObserver(function () {
      if (!d.classList.contains('show') || !pend) return;
      d.querySelectorAll('.v60-cls input').forEach(function (x) {
        if (pend.indexOf(x.value) >= 0 && !x.checked) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }).observe(d, { attributes: true, attributeFilter: ['class'] });
    var nq = document.getElementById('nq2');
    if (nq) new MutationObserver(function () { if (!nq.classList.contains('open')) pend = null; }).observe(nq, { attributes: true, attributeFilter: ['class'] });
  }
  /* 「記錄本次小考」（v60，nq-records-v1）同一天、同課、有勾該班 → 日曆該筆自動完成 */
  function reconcile() {
    var recs = get('nq-records-v1', []); if (!Array.isArray(recs) || !recs.length) return;
    var a = list(), ch = false;
    a.forEach(function (e) {
      if (e.item !== '註釋小考' || e.done) return;
      var k = QK[(e.lessons || [])[0]]; if (!k) return;
      recs.forEach(function (r) {
        if (e.done || !r || r.lesson !== k || (r.classes || []).indexOf(e.cls) < 0 || !r.createdAt) return;
        if (ymd(new Date(r.createdAt)) === e.date) { e.done = e.date; ch = true; }
      });
    });
    if (ch) put(K.data, a);
  }
  function syncAdd() { var b = document.querySelector('#v98-cal .v98-add'); if (b) b.disabled = !valid(); }

  function add() {
    if (!valid()) return;
    var a = list();
    form.cls.forEach(function (c) {
      var q = form.item === '註釋小考';
      a.push({ id: uid(), date: sel, cls: c, kind: q ? '考試' : (/檢討$/.test(form.item) ? '檢討' : form.kind), item: form.item, lessons: form.les.slice(), note: form.note.trim(),
        quiz: q ? { a: +form.qa, b: +form.qb, n: +form.qn, pick: qKeys('pick'), must: qKeys('must'), ex: qKeys('ex') } : undefined });
    });
    put(K.data, a);
    form.note = ''; form.les = []; form.qs = {}; form.qmode = 'pick';
    render();
  }
  function del(id) {
    var a = list(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    if (!confirm('刪除「' + md(e.date) + ' ' + e.cls + '・' + label(e) + '」？')) return;
    put(K.data, a.filter(function (x) { return x.id !== id; }));
    render();
  }

  function shown(e) { return !fCls || e.cls === fCls; }
  function byDay() {
    var m = {}, order = classes();
    list().forEach(function (e) { if (shown(e)) (m[e.date] = m[e.date] || []).push(e); });
    Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return order.indexOf(a.cls) - order.indexOf(b.cls) || (a.kind < b.kind ? -1 : 1); }); });
    return m;
  }
  function tag(c) { return '<span class="v98-tg" style="background:' + ccol(c) + '">' + esc(c) + '</span>'; }

  function render() {
    try { reconcile(); } catch (e) {}
    var m = ensure(), box = m.querySelector('.v98-box');
    var y = view.getFullYear(), mo = view.getMonth(), today = ymd(new Date()), days = byDay();
    var h = '<div class="v98-top"><button type="button" data-v98="m|-1">◀</button><h3>' + y + ' 年 ' + (mo + 1) + ' 月</h3>' +
      '<button type="button" data-v98="m|1">▶</button><button type="button" data-v98="t">今天</button>' +
      '<span class="v98-sp"></span><span style="font-family:\'Noto Serif TC\',serif;font-weight:700;letter-spacing:2px">考試／作業日曆</span>' +
      '<span class="v98-sp"></span><button type="button" data-v98="x">✕ 關閉</button></div>';
    h += '<div class="v98-cls"><button type="button" data-v98="f|"' + (fCls ? '' : ' class="on"') + '>四班全部</button>' +
      classes().map(function (c) { return '<button type="button" data-v98="f|' + esc(c) + '"' + (fCls === c ? ' class="on"' : '') + '><i style="background:' + ccol(c) + '"></i>' + esc(c) + '</button>'; }).join('') +
      '<span class="v98-lg">● 小圓點＝當天有國文課的班</span></div>';
    h += '<div class="v98-main"><div class="v98-grid">' + WD.map(function (w) { return '<div class="v98-wh">' + w + '</div>'; }).join('');
    var first = new Date(y, mo, 1), start = new Date(y, mo, 1 - first.getDay());
    var weeks = Math.ceil((first.getDay() + new Date(y, mo + 1, 0).getDate()) / 7);
    for (var i = 0; i < weeks * 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), ds = ymd(d), wd = d.getDay();
      var cl = 'v98-d' + (d.getMonth() !== mo ? ' out' : '') + (wd === 0 || wd === 6 ? ' we' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : '');
      var mt = meets(ds), dots = classes().filter(function (c) { return mt[c] && (!fCls || c === fCls); })
        .map(function (c) { return '<i class="v98-dot" title="' + esc(c) + ' 有課" style="background:' + ccol(c) + '"></i>'; }).join('');
      h += '<div class="' + cl + '" data-v98="d|' + ds + '"><div class="v98-dn"><b>' + d.getDate() + '</b><span class="v98-dots">' + dots + '</span></div>' +
        (days[ds] || []).map(function (e) {
          return '<div class="v98-pill ' + (e.kind === '考試' ? 'ex' : 'hw') + (e.item === '註釋小考' ? ' qz' : /檢討$/.test(e.item) ? ' rvw' : '') + '" data-cid="' + e.id + '" style="border-left-color:' + ccol(e.cls) + '" title="' + esc(e.cls + '・' + label(e)) + '">' +
            (fCls ? '' : esc(e.cls.replace('一', '')) + ' ') + esc(label(e)) + '</div>';
        }).join('') + '</div>';
    }
    h += '</div><div class="v98-side">' + editor() + upcoming() + '</div></div>';
    box.innerHTML = h;
    syncAdd();
  }

  function editor() {
    if (!sel) return '<div class="v98-ed"><h4>新增安排</h4><div class="v98-empty">先在左邊點一個日期。</div></div>';
    var mt = meets(sel), cs = classes();
    var h = '<div class="v98-ed"><h4>' + md(sel) + '（' + wdName(sel) + '）新增安排</h4>';
    h += '<div class="v98-row"><span>班級（可複選；● 當天有課）</span>' + cs.map(function (c) {
      return '<button type="button" data-v98="fc|' + esc(c) + '"' + (form.cls.indexOf(c) >= 0 ? ' class="on"' : '') + '>' +
        (mt[c] ? '<i class="v98-dot" style="background:' + ccol(c) + ';margin-right:3px"></i>' : '') + esc(c) + '</button>';
    }).join('') + '<button type="button" data-v98="fca">' + (form.cls.length === cs.length ? '全不選' : '四班') + '</button></div>';
    if (form.item !== '註釋小考' && !/檢討$/.test(form.item)) h += '<div class="v98-row"><span>類型</span>' + KINDS.map(function (k) { return '<button type="button" data-v98="fk|' + k + '"' + (form.kind === k ? ' class="on"' : '') + '>' + k + '</button>'; }).join('') + '</div>';
    h += '<div class="v98-row"><span>項目</span>' + ITEMS.map(function (k) { return '<button type="button" data-v98="fi|' + k + '"' + (form.item === k ? ' class="on"' : '') + '>' + disp(k) + '</button>'; }).join('') + '</div>';
    h += '<div class="v98-row"><span>第幾課' + (form.item === '註釋小考' ? '（單選）' : '（可複選）') + '</span>';
    for (var n = 1; n <= MAXL; n++) h += '<button type="button" class="v98-l' + (form.les.indexOf(n) >= 0 ? ' on' : '') + '" data-v98="fl|' + n + '">L' + n + (LESSONS[n] ? '<small>' + esc(LESSONS[n]) + '</small>' : '') + '</button>';
    h += '</div>';
    if (form.item === '註釋小考') h += quizRow();
    h += '<div class="v98-row"><input type="text" id="v98-note" value="' + esc(form.note) + '" placeholder="' + (form.item === '其他' ? '內容（必填，例：第一次段考）' : '備註（可不填）') + '"></div>';
    h += '<button type="button" class="v98-add" data-v98="add">＋ 加入</button>';
    var items = list().filter(function (e) { return e.date === sel; }).sort(function (a, b) { return cs.indexOf(a.cls) - cs.indexOf(b.cls); });
    h += '<div class="v98-has">' + (items.length ? items.map(function (e) {
      return '<div class="v98-it">' + tag(e.cls) + '<span class="v98-tx" title="' + esc(lesLong(e.lessons)) + '">' + esc(label(e)) + '</span>' + qBtn(e) + '<button type="button" data-v98="del|' + e.id + '" title="刪除">✕</button></div>';
    }).join('') : '<div class="v98-hint">這天還沒有安排。</div>') + '</div></div>';
    return h;
  }

  function upcoming() {
    var t = ymd(new Date()), end = ymd(new Date(Date.now() + 21 * 864e5)), days = byDay();
    var ks = Object.keys(days).filter(function (k) { return k >= t && k <= end; }).sort();
    return '<div class="v98-up"><h4>接下來三週</h4>' + (ks.length ? ks.map(function (k) {
      return '<div class="v98-ud" data-v98="d|' + k + '">' + md(k) + '（' + wdName(k) + '）' + (k === t ? ' 今天' : '') + '</div>' +
        days[k].map(function (e) { return '<div class="v98-it">' + tag(e.cls) + '<span class="v98-tx">' + esc(label(e)) + '</span>' + qBtn(e) + '<button type="button" data-v98="del|' + e.id + '" title="刪除">✕</button></div>'; }).join('');
    }).join('') : '<div class="v98-empty">三週內沒有安排。</div>') + '</div>';
  }

  function open() {
    var n = new Date();
    if (!view) view = new Date(n.getFullYear(), n.getMonth(), 1);
    ensure().classList.add('open');
    render();
  }
  function close() { var m = document.getElementById('v98-cal'); if (m) m.classList.remove('open'); }

  /* 「班級進度」面板頂端加入口按鈕 */
  function addBtn() {
    var p = document.getElementById('cls-panel'); if (!p || document.getElementById('v98-open')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'v98-open'; b.textContent = '📅 考試／作業日曆';
    b.onclick = open;
    var head = p.querySelector('.cls-head');
    p.insertBefore(b, head ? head.nextSibling : p.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn();

  /* 備份：匯出附帶 __v98cal；匯入時只補本機沒有的項目（依 id），不覆蓋 */
  var _v98load = clsLoad;
  clsLoad = function () { var d = _v98load.apply(this, arguments); if (exporting) d.__v98cal = list(); return d; };
  var _v98exp = clsExport;
  clsExport = function () { exporting = true; try { return _v98exp.apply(this, arguments); } finally { exporting = false; } };
  var _v98save = clsSave;
  clsSave = function (d) {
    if (d && d.__v98cal) {
      var cur = list(), have = {}; cur.forEach(function (e) { have[e.id] = 1; });
      (Array.isArray(d.__v98cal) ? d.__v98cal : []).forEach(function (e) { if (e && e.id && !have[e.id]) cur.push(e); });
      put(K.data, cur); delete d.__v98cal;
    }
    return _v98save.apply(this, arguments);
  };

  window.V98CAL = { open: open, close: close, data: list };
})();
