
(function () {
  'use strict';
  /* ── 綁定 Google 後，把 Apps Script 網頁應用程式網址貼在這裡（或在「設定」貼上，存在本裝置）──
     網址本身不是秘密；寫入一律需要「登記密碼」（Apps Script 端驗證）。HTML 內不放任何學生資料。 */
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';
  var TUTOR_G_URL = '';   /* gr-5：小老師「Google 登入」用的第二個部署（存取權＝網域內）網址；老師部署後填入 */
  var K = { url: 'gr_url_v1', pw: 'gr_pw_v1', cls: 'gr_cls_v1', tab: 'gr_tab_v1', demo: 'gr_demo_v1', seat: 'gr_seat_v1' };   /* seat：座位表（只有座號，無姓名；雲端同步） */
  var TYPES = [
    { k: '註釋小考', cat: '考試', late: true }, { k: 'A卷', cat: '考試', late: true },
    { k: '習作', cat: '作業', late: true }, { k: '回家考卷', cat: '作業', late: true },
    { k: '筆記', cat: '筆記', late: false }, { k: '態度', cat: '態度', late: false },
    { k: '一段', cat: '一段', late: false }, { k: '二段', cat: '二段', late: false }, { k: '三段', cat: '三段', late: false }
  ];
  var CATS = ['一段', '二段', '三段', '筆記', '態度', '作業', '考試'];
  /* 配分預設值是「暫定」，老師尚未提供（規格 §8）；請在「設定 → 配分」改 */
  var DEF_W = { 一段: 20, 二段: 20, 三段: 20, 筆記: 10, 態度: 10, 作業: 10, 考試: 10, 習作: 1, 回家考卷: 1, zeroMissing: false, tentative: true };
  var REASONS = ['睡覺', '吵鬧', '遲到', '其他'];
  var PEN = 10;                       /* 遲交每一上課日扣 10 分 */
  var LES = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐' };
  var TABLE_KEY = { students: ['cls', 'seat'], items: ['id'], scores: ['item', 'seat'], weights: ['cls'], points: ['id'], holidays: ['date'] };
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];   /* 同 V82 預設課表 */

  /* ── 工具 ── */
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function sget(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function sput(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function addD(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function md(s) { if (!s) return ''; var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function now() {   /* 與 V82 共用測試時間（V82.fakeNow） */
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function today() { return ymd(now()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function uid(p) { return (p || 'g') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function num(v) { if (v === '' || v == null) return null; var n = +v; return isFinite(n) ? n : null; }
  function r1(v) { return v == null ? '' : (Math.round(v * 10) / 10).toString(); }
  function typeOf(k) { return TYPES.filter(function (t) { return t.k === k; })[0] || TYPES[0]; }
  function keyOf(t, o) { return TABLE_KEY[t].map(function (k) { return String(o[k] == null ? '' : o[k]); }).join('|'); }

  /* ── 上課日、課表 ── */
  function offSet() {
    var s = {};
    (D.holidays || []).forEach(function (h) { if (h.date) s[h.date] = h.label || '放假'; });
    try { (window.V101 && V101.events || []).forEach(function (e) { if (e.c !== 'off') return; for (var d = e.from; d <= (e.to || e.from); d = addD(d, 1)) s[d] = e.t; }); } catch (e) {}
    return s;
  }
  function isSchool(s, off) { var w = parse(s).getDay(); return w >= 1 && w <= 5 && !(off || offSet())[s]; }
  function isExamDay(s) { try { return (window.V101 && V101.eventsOn(s) || []).some(function (e) { return e.c === 'exam'; }); } catch (e) { return false; } }
  /* a 之後（不含）到 b（含）有幾個上課日 */
  function schoolDaysBetween(a, b) {
    if (!a || !b || b <= a) return 0;
    var off = offSet(), n = 0, d = addD(a, 1), guard = 0;
    while (d <= b && guard++ < 500) { if (isSchool(d, off)) n++; d = addD(d, 1); }
    return n;
  }
  function nextSchoolDay(s) { var off = offSet(), d = addD(s, 1), g = 0; while (!isSchool(d, off) && g++ < 60) d = addD(d, 1); return d; }
  function meets(cls, s) {
    var w = parse(s).getDay(), sc = get('tp_schedule_v1', null);
    if (sc && sc.slots) return sc.slots.some(function (x) { return x.wd === w && x.normal !== false && x.cls === cls; });
    return DEF_SLOTS.some(function (x) { return x[0] === w && x[2] === cls; });
  }
  /* 該班下一節國文課（跳過放假、段考） */
  function nextLesson(cls, s) {
    var off = offSet(), d = addD(s, 1), g = 0;
    while (g++ < 90) { if (isSchool(d, off) && !isExamDay(d) && meets(cls, d)) return d; d = addD(d, 1); }
    return '';
  }
  function curPeriod(cls) {
    try { var c = window.V82 && V82.currentSlot && V82.currentSlot(); if (c && c.period && (!c.cls || c.cls === cls)) return c.period; } catch (e) {}
    return '';
  }

  /* ── 計分 ── */
  /* v110：請假分兩種，存在 leave 欄前綴——「考:日期」考試請假（不計遲交，顯示未補考）；「交:日期」繳交請假（期限延到該班該日之後下一節國文課）；
     舊格式（只有日期）＝返校日（v106 原規則：期限延到返校隔日） */
  function leaveOf(sc) { var v = sc && sc.leave ? String(sc.leave) : '', m = /^(考|交):(\d{4}-\d{2}-\d{2})$/.exec(v); return m ? { k: m[1], d: m[2] } : { k: v ? '返' : '', d: v }; }
  function lateOf(it, sc, td) {
    if (!it.late || !it.due) return 0;
    var dl = it.due;
    var lo = leaveOf(sc);
    if (lo.k === '考') return 0;   /* v110：考試請假＝等補考，不計遲交 */
    if (lo.k === '交') { var nl = nextLesson(it.cls, lo.d) || nextSchoolDay(lo.d); if (nl > dl) dl = nl; }   /* v110：繳交請假＝延到下一節國文課 */
    else if (lo.d) { var nx = nextSchoolDay(lo.d); if (nx > dl) dl = nx; }   /* 請假：補交期限＝返校隔日 */
    return schoolDaysBetween(dl, (sc && sc.sub) || td);
  }
  function finalOf(it, sc, td) {
    if (!sc || sc.raw == null) return null;
    return Math.max(0, sc.raw - PEN * lateOf(it, sc, td)) + (sc.bonus || 0);
  }
  function weights(cls) {
    var w = D.weights.filter(function (x) { return x.cls === cls; })[0], o = {};
    var j = {}; try { j = w ? JSON.parse(w.json) : {}; } catch (e) {}
    Object.keys(DEF_W).forEach(function (k) { o[k] = (k in j) ? j[k] : DEF_W[k]; });
    if (w) o.tentative = !!j.tentative;
    return o;
  }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function mix(pairs) {   /* [[值, 權重]...] 只算有值的，重新換算比例 */
    var s = 0, w = 0; pairs.forEach(function (p) { if (p[0] != null && p[1] > 0) { s += p[0] * p[1]; w += p[1]; } });
    return w ? s / w : null;
  }
  function summary(cls, seat, td) {
    var w = weights(cls), by = {};
    itemsOf(cls).forEach(function (it) {
      var sc = scoreOf(it.id, seat), f = finalOf(it, sc, td);
      if (f == null && w.zeroMissing && it.late && it.due && !(sc && sc.sub) && lateOf(it, sc, td) > 0) f = 0;
      if (f != null) (by[it.type] = by[it.type] || []).push(f);
    });
    var t = {}; Object.keys(by).forEach(function (k) { t[k] = avg(by[k]); });
    var c = { 一段: t['一段'], 二段: t['二段'], 三段: t['三段'], 筆記: t['筆記'], 態度: t['態度'],
      作業: mix([[t['習作'], w['習作']], [t['回家考卷'], w['回家考卷']]]),
      考試: mix([[t['註釋小考'], 1], [t['A卷'], 2]]) };   /* 考試＝註釋小考 1/3＋A卷 2/3 */
    Object.keys(c).forEach(function (k) { if (c[k] === undefined) c[k] = null; });
    c.total = mix(CATS.map(function (k) { return [c[k], +w[k] || 0]; }));
    c.byType = t;
    return c;
  }

  /* ── 資料 ── */
  var D = { students: [], items: [], scores: [], weights: [], points: [], holidays: [], log: [], tutors: [] };
  var SCI = {};   /* scores 索引 item|seat */
  function norm(r) {
    D.students = (r.students || []).map(function (s) { return { cls: s.cls, seat: +s.seat, sid: s.sid || '', name: s.name || '', active: s.active === '' || s.active == null ? 1 : +s.active }; })
      .filter(function (s) { return s.cls && s.seat > 0; }).sort(function (a, b) { return a.seat - b.seat; });
    D.items = (r.items || []).map(function (i) { return { id: i.id, cls: i.cls, type: i.type, title: i.title || '', lessons: i.lessons || '', issued: i.issued || '',
      due: i.due || '', late: String(i.late) === '1' || i.late === true, calId: i.calId || '', note: i.note || '', created: i.created || '', by: i.by || '' }; });   /* by：gr-5 小老師新增 */
    D.scores = (r.scores || []).map(function (s) { return { item: s.item, cls: s.cls, seat: +s.seat, raw: num(s.raw), sub: s.sub || '', leave: s.leave || '', bonus: num(s.bonus) || 0, upd: s.upd || '', by: s.by || '', chk: s.chk || '' }; });    D.log = (r.log || []).map(function (l) { return { ts: l.ts, who: l.who, item: l.item, cls: l.cls, seat: +l.seat, field: l.field, old: l.old, 'new': l['new'] }; });   /* gr-5：修改紀錄（只有老師登入才有） */
    D.tutors = r.tutors || [];
    D.weights = r.weights || []; D.points = (r.points || []).map(function (p) { return { id: p.id, ts: p.ts, date: p.date, period: p.period, cls: p.cls, seat: +p.seat, delta: +p.delta, reason: p.reason || '' }; });
    D.holidays = r.holidays || [];
    reindex();
  }
  function reindex() { SCI = {}; D.scores.forEach(function (s) { SCI[s.item + '|' + s.seat] = s; }); }
  /* gr-5 修改紀錄：舊值不是空白的變動＝「改過」→ 紅字 */
  function histOf(item, seat) { return D.log.filter(function (l) { return l.item === item && l.seat === seat; }).sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }); }
  function chgOf(item, seat, field) { return D.log.some(function (l) { return l.item === item && l.seat === seat && l.field === field && l.old !== ''; }); }
  var LOG_NAME = { raw: '分數', sub: '繳交日', leave: '請假', bonus: '訂正加分' };
  function logVal(f, v) { if (v === '' || v == null) return '（空白）'; if (f === 'leave') { var lo = leaveOf({ leave: v }); return (lo.k === '考' ? '考試請假 ' : lo.k === '交' ? '繳交請假 ' : '返校 ') + md(lo.d); } if (f === 'sub') return md(v); if (f === 'bonus') return '+' + v; return v; }
  function tsText(ts) { var d = new Date(ts); return isNaN(d) ? esc(ts) : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function scoreOf(item, seat) { return SCI[item + '|' + seat] || null; }
  function roster(cls) { return D.students.filter(function (s) { return s.cls === cls && s.active !== 0; }); }
  function itemsOf(cls) {
    return D.items.filter(function (i) { return i.cls === cls; }).sort(function (a, b) {
      var x = a.issued || a.due || '', y = b.issued || b.due || ''; return x === y ? (a.created < b.created ? 1 : -1) : (x < y ? 1 : -1); });
  }
  function itemById(id) { return D.items.filter(function (i) { return i.id === id; })[0] || null; }
  function wireScore(s) { return { item: s.item, cls: s.cls, seat: s.seat, raw: s.raw == null ? '' : s.raw, sub: s.sub, leave: s.leave, bonus: s.bonus || '', upd: s.upd }; }
  function wireItem(i) { return { id: i.id, cls: i.cls, type: i.type, title: i.title, lessons: i.lessons, issued: i.issued, due: i.due, late: i.late ? '1' : '0', calId: i.calId, note: i.note, created: i.created }; }

  /* ── 後台連線：Apps Script（正式）／本機示範 ── */
  function url() { return get(K.url, '') || GS_URL; }
  function isDemo() { return !url(); }
  function pw() { return sget(K.pw) || get(K.pw, ''); }
  function call(req) {
    if (isDemo()) return new Promise(function (ok) { setTimeout(function () { ok(demoCall(req)); }, 60); });
    if (req.pw === undefined) req.pw = pw();
    return fetch(url(), { method: 'POST', body: JSON.stringify(req), redirect: 'follow' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  /* 示範模式：資料只在這台裝置（localStorage gr_demo_v1），名單是假的「示範學生」 */
  function demoDB() {
    var db = get(K.demo, null);
    if (!db) {
      db = { students: [], items: [], scores: [], weights: [], points: [], holidays: [] };
      classes().forEach(function (c) { for (var i = 1; i <= 35; i++) db.students.push({ cls: c, seat: String(i), sid: '', name: '示範學生' + pad(i), active: '1' }); });
      put(K.demo, db);
    }
    return db;
  }
  function demoCall(req) {
    var db = demoDB();
    if (req.action === 'ping') return { ok: true, api: 'demo', hasPw: true };
    if (req.action === 'check') return { ok: true, admin: true };
    if (req.action === 'load') { var o = JSON.parse(JSON.stringify(db)); o.ok = true; o.admin = true; return o; }
    var t = req.table, list = db[t];
    if (!list) return { ok: false, error: '不明的資料表' };
    if (req.action === 'put') {
      var idx = {}; list.forEach(function (o, i) { idx[keyOf(t, o)] = i; });
      (req.rows || []).forEach(function (r) { var k = keyOf(t, r), c = {}; Object.keys(r).forEach(function (f) { c[f] = r[f] == null ? '' : String(r[f]); });
        if (k in idx) { var o = list[idx[k]]; Object.keys(c).forEach(function (f) { o[f] = c[f]; }); } else { idx[k] = list.length; list.push(c); } });
    } else if (req.action === 'del') {
      var kill = {}; (req.keys || []).forEach(function (k) { kill[k] = 1; });
      db[t] = list.filter(function (o) { return !kill[keyOf(t, o)]; });
      if (t === 'items') db.scores = db.scores.filter(function (s) { return !kill[s.item]; });
    }
    put(K.demo, db);
    return { ok: true };
  }

  /* 成績寫入佇列（輸入分數時批次送出，避免每格一次連線） */
  var pend = {}, flushing = false, ftimer = null;
  function queueScore(s) { pend[s.item + '|' + s.seat] = wireScore(s); setSt('待儲存 ' + Object.keys(pend).length + ' 筆'); clearTimeout(ftimer); ftimer = setTimeout(flush, 600); }
  function flush() {
    if (flushing) { clearTimeout(ftimer); ftimer = setTimeout(flush, 400); return; }
    var keys = Object.keys(pend); if (!keys.length) return;
    var rows = keys.map(function (k) { return pend[k]; }); flushing = true; setSt('儲存中…');
    call({ action: 'put', table: 'scores', rows: rows }).then(function (r) {
      flushing = false;
      if (!r.ok) throw new Error(r.error || '儲存失敗');
      keys.forEach(function (k) { if (pend[k] === rows[keys.indexOf(k)]) delete pend[k]; });
      setSt(Object.keys(pend).length ? '待儲存 ' + Object.keys(pend).length + ' 筆' : '✓ 已儲存');
      if (Object.keys(pend).length) flush();
    }).catch(function (e) { flushing = false; setSt('⚠ 未儲存 ' + Object.keys(pend).length + ' 筆（' + e.message + '）點此重試', true); });
  }
  function save(table, rows, msg) {
    setSt('儲存中…');
    return call({ action: 'put', table: table, rows: rows }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '儲存失敗'); setSt('✓ ' + (msg || '已儲存')); return r;
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert('儲存失敗：' + e.message); throw e; });
  }
  function remove(table, keys) {
    setSt('刪除中…');
    return call({ action: 'del', table: table, keys: keys }).then(function (r) { if (!r.ok) throw new Error(r.error || '刪除失敗'); setSt('✓ 已刪除'); return r; })
      .catch(function (e) { setSt('⚠ ' + e.message, true); alert('刪除失敗：' + e.message); throw e; });
  }

  /* ── 狀態 ── */
  var S = { tab: get(K.tab, 'proj'), cls: get(K.cls, '') || classes()[0] || '', item: '', admin: false, loaded: false, loadedAt: 0, loading: false,
    st: '', stErr: false, subDate: '', edit: null, imp: null, projItem: '', projView: 'item', reveal: {}, revealAll: false,
    ptMode: '+', ptReason: '睡覺', ptView: get('gr_ptview_v1', 'grid'), seatEdit: false, ptRange: 'today', undo: [], setCls: '', paste: '', preview: null, loadErr: '' };

  function load(force) {
    if (S.loading) return; if (S.loaded && !force && Date.now() - S.loadedAt < 60000) { render(); return; }
    S.loading = true; S.loadErr = ''; render();
    call({ action: 'load' }).then(function (r) {
      S.loading = false;
      if (!r.ok) throw new Error(r.error || '讀取失敗');
      norm(r); S.admin = !!r.admin; S.loaded = true; S.loadedAt = Date.now();
      if (!r.admin && pw() && !isDemo()) { sput(K.pw, ''); put(K.pw, null); S.loadErr = '登記密碼已失效，請重新登入'; }
      render();
    }).catch(function (e) { S.loading = false; S.loadErr = '讀取失敗：' + e.message + (isDemo() ? '' : '（請確認網路與 Apps Script 網址）'); render(); });
  }
  function login(p, remember) {
    if (!p) return;
    setSt('驗證中…');
    call({ action: 'check', pw: p }).then(function (r) {
      if (!r.ok || !r.admin) { setSt('⚠ 密碼錯誤', true); alert('密碼錯誤'); return; }
      sput(K.pw, p); if (remember) put(K.pw, p); setSt('✓ 已登入'); S.loaded = false; load(true);
    }).catch(function (e) { setSt('⚠ ' + e.message, true); });
  }
  function logout() { sput(K.pw, ''); put(K.pw, null); S.admin = false; S.loaded = false; load(true); }

  /* ── 畫面 ── */
  function box() {
    var m = document.getElementById('v106-gr'); if (m) return m;
    m = document.createElement('div'); m.id = 'v106-gr'; m.innerHTML = '<div class="gr-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', onClick);
    m.addEventListener('change', onChange);
    m.addEventListener('input', onInput);
    m.addEventListener('keydown', onKey);
    m.addEventListener('pointerdown', seatDown);
    window.addEventListener('pointermove', seatMove, { passive: false });
    window.addEventListener('pointerup', seatUp);
    window.addEventListener('pointercancel', function () { if (drag) { drag.g.remove(); drag = null; render(); } });
    return m;
  }
  function setSt(t, err) { S.st = t; S.stErr = !!err; var e = document.querySelector('#v106-gr .gr-st'); if (e) { e.textContent = t; e.className = 'gr-st' + (err ? ' err' : ''); } }
  function open(tab) {
    box().classList.add('open'); if (tab) S.tab = tab;
    if (!S.subDate) S.subDate = today();
    load(false);
  }
  function close() {
    var m = document.getElementById('v106-gr'); if (m) m.classList.remove('open');
    if (Object.keys(pend).length) flush();
  }

  function render() {
    var m = box(), b = m.querySelector('.gr-box'), sc = m.querySelector('.gr-pane');
    var keep = sc ? sc.scrollTop : 0;
    var tabs = [['reg', '✏️ 登記'], ['proj', '📽 投影'], ['pts', '⭐ 課堂加減分'], ['set', '⚙ 設定']];
    var h = '<div class="gr-top"><h3>📒 成績</h3>' +
      tabs.map(function (t) { return '<button data-g="tab|' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') +
      '<span class="gr-sp"></span><span class="gr-st' + (S.stErr ? ' err' : '') + '" data-g="retry">' + esc(S.st) + '</span>' +
      '<button data-g="reload" title="重新讀取">⟳</button>' +
      (isDemo() ? '' : (S.admin ? '<button data-g="logout">🔓 登出</button>' : '<button data-g="tab|reg">🔒 登入</button>')) +
      '<button data-g="x">✕</button></div>';
    h += '<div class="gr-cls">' + classes().map(function (c) { return '<button class="gr-chip' + (S.cls === c ? ' on' : '') + '" data-g="cls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
      '<span class="gr-muted" style="margin-left:auto">' + (isDemo() ? '示範模式' : (S.admin ? '已登入（可登記）' : '唯讀（投影）')) + '</span></div>';
    if (isDemo()) h += '<div class="gr-banner">⚠ 示範模式：尚未綁定 Google，資料只存在這台裝置，名單是假的「示範學生」。綁定方式見「⚙ 設定」。</div>';
    if (S.loadErr) h += '<div class="gr-banner" style="background:#fde8e6;color:#8a2a20">' + esc(S.loadErr) + '</div>';
    if (S.loading && !S.loaded) h += '<div class="gr-main"><div class="gr-pane">讀取中…</div></div>';
    else if (S.tab === 'reg') h += regHTML();
    else if (S.tab === 'proj') h += projHTML();
    else if (S.tab === 'pts') h += ptsHTML();
    else h += setHTML();
    if (S.hist && S.tab === 'reg' && S.admin) h += histHTML();   /* gr-5 */
    b.innerHTML = h;
    var np = m.querySelector('.gr-pane'); if (np && keep) np.scrollTop = keep;
  }

  function needLogin(msg) {
    return '<div class="gr-main"><div class="gr-pane"><div class="gr-sec" style="max-width:420px"><h5>🔒 ' + esc(msg || '登記需要密碼') + '</h5>' +
      '<div class="gr-row"><input type="password" id="gr-pw" placeholder="登記密碼" autocomplete="current-password" style="flex:1"></div>' +
      '<div class="gr-row"><label><input type="checkbox" id="gr-rem"> 在這台裝置記住（只勾老師自己的平板）</label></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="login">登入</button></div>' +
      '<p class="gr-muted">投影模式不需要密碼，只會顯示座號、繳交狀況與訂正加分（不顯示分數）。</p></div></div></div>';
  }

  /* ── 登記 ── */
  function itemLabel0(it) { return it.title || (it.type + (it.lessons ? ' L' + it.lessons.split(',').join('、L') : '')); }
  var NQK = { '身為魚販': 1, '世說新語選': 2, '師說': 3, '珍珠奶茶': 4, '臺灣最美麗的火車線': 5, '論語選—子路曾皙冉有公西華侍坐': 6 };   /* 同 v98 QK */
  function nqCode(it) {   /* v110 */
    if (it.type !== '註釋小考' || !it.issued) return '';
    var rs; try { rs = JSON.parse(localStorage.getItem('nq-records-v1') || '[]'); } catch (e) { return ''; }
    var ls = String(it.lessons || '').split(',').map(Number), best = null, bd = 99;
    (Array.isArray(rs) ? rs : []).forEach(function (r) {
      if (!r || !r.codes || !r.codes[it.cls] || ls.indexOf(NQK[r.lesson] || 0) < 0) return;
      var d = new Date(r.createdAt); if (isNaN(d)) return;
      var dd = Math.abs((parse(ymd(d)) - parse(it.issued)) / 864e5);
      if (dd < bd) { bd = dd; best = r; }
    });
    return best && bd <= 7 ? best.codes[it.cls] : '';
  }
  function itemLabel(it) {
    var t = itemLabel0(it);
    if (/^0\d{3}/.test(t)) return 'L' + t;   /* v112：老師自己在名稱打「0301（…）」＝考卷編號 L0301 */
    var cd = nqCode(it); return cd && t.indexOf(cd) < 0 ? cd + ' ' + t : t;
  }
  function regHTML() {
    if (!S.admin) return needLogin();
    var its = itemsOf(S.cls), n = roster(S.cls).length, td = today();
    if (S.item && !itemById(S.item)) S.item = '';
    var h = '<div class="gr-main"><div class="gr-side">' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="new">＋ 新增</button><button class="gr-btn" data-g="imp">📅 從日曆匯入</button></div>';
    if (!its.length) h += '<p class="gr-muted">這班還沒有考卷。按「＋ 新增」或「從日曆匯入」。</p>';
    its.forEach(function (it) {
      var got = roster(S.cls).filter(function (s) { var c = scoreOf(it.id, s.seat); return c && (c.raw != null || c.sub); }).length;
      var miss = it.late && it.due && it.due < td && got < n;
      var chg = D.log.some(function (l) { return l.item === it.id && l.old !== ''; });   /* gr-5 */
      h += '<button class="gr-it' + (S.item === it.id && !S.edit && !S.imp ? ' on' : '') + '" data-g="item|' + it.id + '"><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' +
        esc(itemLabel(it)) + (it.by ? ' <span class="gr-tag gr-tut">小老師新增</span>' : '') + (chg ? ' <span class="gr-chgt" title="有成績被改過">改過</span>' : '') + '<small>' + (it.issued ? md(it.issued) + ' 發　' : '') + (it.due ? '期限 ' + md(it.due) : '無期限') +
        '　<span class="' + (miss ? 'late' : '') + '">' + got + '/' + n + '</span></small></button>';
    });
    h += '</div><div class="gr-pane">';
    if (S.imp) h += impHTML();
    else if (S.edit) h += editHTML();
    else if (S.item) h += sheetHTML(itemById(S.item));
    else h += '<p class="gr-muted">← 選一份考卷開始登記。</p>' + (n ? '' : '<p class="late">這班還沒有學生名單，請到「⚙ 設定 → 學生名單」匯入。</p>');
    return h + '</div></div>';
  }
  function sheetHTML(it) {
    var td = today(), st = roster(S.cls), fins = [];
    st.forEach(function (s) { var f = finalOf(it, scoreOf(it.id, s.seat), td); if (f != null) fins.push(f); });
    var h = '<div class="gr-h"><h4><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' + esc(itemLabel(it)) + '</h4>' +
      '<span class="gr-muted">' + (it.due ? '期限 ' + md(it.due) + (it.late ? '（遲交每上課日 −' + PEN + '）' : '（不扣遲交）') : '無期限') +
      '　已登記 ' + fins.length + '/' + st.length + (fins.length ? '　平均 ' + r1(avg(fins)) : '') + '</span>' +
      '<button class="gr-btn" data-g="b10|' + it.id + '" title="這份考卷已交（或有分數）的人，訂正加分一次設成 +10；其他分數再個別手動調整">已交的訂正 +10</button>' +   /* v110 */
      (function () { var n = D.log.filter(function (l) { return l.item === it.id && l.old !== ''; }).length;   /* gr-5 */
        return '<button class="gr-btn' + (n ? ' gr-chgb' : '') + '" data-g="hist|' + it.id + '|0">📜 修改紀錄' + (n ? '（' + n + '）' : '') + '</button>'; })() +
      '<button class="gr-btn" data-g="edit|' + it.id + '">編輯</button></div>' +
      (it.by ? '<p class="gr-muted" style="margin:0 0 6px">這份是小老師 ' + esc(it.by) + ' 新增的' + (it.note && it.note !== '小老師新增' ? '（' + esc(it.note) + '）' : '') + '，請確認類型、期限。</p>' : '') +
      '<div class="gr-row"><label class="k">繳交日期</label><input type="date" id="gr-subdate" value="' + esc(S.subDate) + '">' +
      '<span class="gr-muted">按「已交」或輸入分數時記這天（補登時改這裡）</span></div>';
    if (!st.length) return h + '<p class="late">這班還沒有學生名單。</p>';
    h += '<table class="gr-t"><thead><tr><th>座號</th><th>姓名</th><th>分數</th><th>繳交</th><th>請假</th><th>遲交</th><th>訂正</th><th>最後成績</th></tr></thead><tbody>';
    st.forEach(function (s) { h += rowHTML(it, s, td); });
    return h + '</tbody></table>';
  }
  function rowHTML(it, s, td) {
    var c = scoreOf(it.id, s.seat) || {}, L = lateOf(it, c, td), f = finalOf(it, c.raw != null ? c : null, td), id = it.id + '|' + s.seat;
    var sub = c.sub ? '<input type="date" data-g="sub|' + id + '" value="' + esc(c.sub) + '"><button class="gr-x" data-g="unsub|' + id + '" title="取消已交">✕</button>'
      : '<button class="gr-btn" data-g="done|' + id + '">已交</button>';
    var lo = leaveOf(c);   /* v110 */
    var lv = lo.k ? '<span class="v110-lv' + (lo.k === '考' ? ' x' : '') + '">' + (lo.k === '考' ? '考試請假' : lo.k === '交' ? '繳交請假' : '返校') + '</span><input type="date" data-g="leave|' + id + '" value="' + esc(lo.d) + '"><button class="gr-x" data-g="unleave|' + id + '" title="取消請假">✕</button>'
      : '<button class="gr-btn v110-lb" data-g="lvx|' + id + '">考試請假</button><button class="gr-btn v110-lb" data-g="lvs|' + id + '">繳交請假</button>';
    var late = L ? '<span class="late">' + (c.sub ? '遲' : '逾期') + L + '天 −' + (L * PEN) + '</span>' : '';
    if (!late && lo.k === '考' && c.raw == null) late = '<span class="late">未補考</span>';   /* v110 */
    var bo = '<select data-g="bonus|' + id + '">' + [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return '<option value="' + n + '"' + ((c.bonus || 0) === n ? ' selected' : '') + '>' + (n ? '+' + n : '—') + '</option>'; }).join('') + '</select>';
    /* gr-5：改過的格子紅框紅字；姓名下方小字＝小老師登記者／✓檢查者／📜修改紀錄 */
    var cg = function (f) { return chgOf(it.id, s.seat, f) ? ' gr-chg' : ''; }, hs = histOf(it.id, s.seat), anyChg = hs.some(function (l) { return l.old !== ''; });
    var who = (c.by ? '<span class="gr-muted">' + esc(String(c.by).replace(it.cls, '')) + '</span>' : '') +
      (c.chk ? ' <span class="pos" title="' + esc(c.chk) + '">✓' + esc(String(c.chk).split('@')[0].replace(it.cls, '')) + '</span>' : '') +
      (hs.length ? ' <button class="gr-x' + (anyChg ? ' gr-chgb' : '') + '" data-g="hist|' + id + '" title="修改紀錄">📜</button>' : '');
    return '<tr data-row="' + id + '" class="' + (c.raw != null || c.sub ? 'done' : '') + '"><td>' + s.seat + '</td><td class="nm">' + esc(s.name) + (who ? '<small class="gr-who">' + who + '</small>' : '') + '</td>' +
      '<td class="' + cg('raw') + '"><input class="gr-sc" type="text" inputmode="decimal" data-g="raw|' + id + '" value="' + (c.raw == null ? '' : c.raw) + '"></td>' +
      '<td class="' + cg('sub') + '">' + sub + '</td><td class="' + cg('leave') + '">' + lv + '</td><td>' + late + '</td><td class="' + cg('bonus') + '">' + bo + '</td><td class="fin">' + (f == null ? '' : r1(f)) + '</td></tr>';
  }
  /* gr-5：修改紀錄視窗（單一學生，或 seat 為 0＝整份考卷只列「改過」的） */
  function histHTML() {
    var q = S.hist, it = itemById(q.item); if (!it) return '';
    var ls = q.seat ? histOf(q.item, q.seat) : D.log.filter(function (l) { return l.item === q.item && l.old !== ''; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    var st = q.seat ? roster(it.cls).filter(function (s) { return s.seat === q.seat; })[0] : null;
    var h = '<div class="gr-hist"><div class="gr-hbox"><div class="gr-h"><h4>📜 ' + esc(itemLabel(it)) + (q.seat ? '　' + q.seat + '號 ' + esc(st ? st.name : '') : '　改過的紀錄') + '</h4>' +
      '<span class="gr-sp" style="flex:1"></span><button class="gr-btn" data-g="histx">關閉</button></div>';
    if (!ls.length) return h + '<p class="gr-muted">' + (q.seat ? '沒有紀錄。' : '這份沒有被改過的成績。') + '</p></div></div>';
    h += '<table class="gr-t"><thead><tr><th>時間</th>' + (q.seat ? '' : '<th>座號</th>') + '<th>誰</th><th>欄位</th><th>舊值</th><th></th><th>新值</th></tr></thead><tbody>';
    ls.forEach(function (l) {
      var chg = l.old !== '';
      h += '<tr' + (chg ? ' class="gr-chgr"' : '') + '><td>' + tsText(l.ts) + '</td>' + (q.seat ? '' : '<td><b>' + l.seat + '</b></td>') + '<td>' + esc(l.who) + '</td><td>' + esc(LOG_NAME[l.field] || l.field) + '</td>' +
        '<td>' + esc(logVal(l.field, l.old)) + '</td><td>' + (chg ? '→' : '新登記') + '</td><td>' + esc(logVal(l.field, l['new'])) + '</td></tr>';
    });
    return h + '</tbody></table><p class="gr-muted">紅色＝登記後又被改過。第一次登記（舊值空白）照常顯示。</p></div></div>';
  }
  function refreshRow(item, seat) {
    var it = itemById(item), s = roster(S.cls).filter(function (x) { return x.seat === seat; })[0];
    var tr = document.querySelector('#v106-gr tr[data-row="' + item + '|' + seat + '"]');
    if (!it || !s || !tr) { render(); return; }
    var t = document.createElement('tbody'); t.innerHTML = rowHTML(it, s, today()); tr.parentNode.replaceChild(t.firstChild, tr);
    var side = document.querySelector('#v106-gr .gr-side'); if (side) { var st = side.scrollTop; var tmp = document.createElement('div'); tmp.innerHTML = regHTML(); var ns = tmp.querySelector('.gr-side'); if (ns) { side.innerHTML = ns.innerHTML; side.scrollTop = st; } }
  }
  function patchScore(item, seat, p) {
    var it = itemById(item); if (!it) return;
    var c = scoreOf(item, seat);
    if (!c) { c = { item: item, cls: it.cls, seat: seat, raw: null, sub: '', leave: '', bonus: 0, upd: '', by: '', chk: '' }; D.scores.push(c); SCI[item + '|' + seat] = c; }
    var ts = new Date().toISOString(), sv = function (f, v) { return v == null || (f === 'bonus' && !v) ? '' : String(v); };
    Object.keys(p).forEach(function (k) {   /* gr-5：畫面先記一筆（後台也會記同樣的），紅字馬上出現 */
      if (LOG_NAME[k] && sv(k, c[k]) !== sv(k, p[k])) D.log.push({ ts: ts, who: '老師', item: item, cls: it.cls, seat: seat, field: k, old: sv(k, c[k]), 'new': sv(k, p[k]) });
      c[k] = p[k];
    });
    c.upd = ts;
    queueScore(c); refreshRow(item, seat);
  }

  /* 新增／編輯考卷 */
  function lessonsOf(str) { return String(str || '').split(',').filter(Boolean).map(Number); }
  function editHTML() {
    var e = S.edit, isNew = !e.id, ty = typeOf(e.type);
    var h = '<div class="gr-h"><h4>' + (isNew ? '新增考卷／成績項目' : '編輯：' + esc(itemLabel(e))) + '</h4></div><div class="gr-sec">';
    if (isNew) h += '<div class="gr-row"><label class="k">班級</label>' + classes().map(function (c) { return '<button class="gr-chip' + (e.clsList.indexOf(c) >= 0 ? ' on' : '') + '" data-g="ecls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">類型</label>' + TYPES.map(function (t) { return '<button class="gr-chip' + (e.type === t.k ? ' on' : '') + '" data-g="etype|' + t.k + '">' + t.k + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">課次</label>' + [1,2,3,4,5,6,7,8,9,10,11,12].map(function (n) { return '<button class="gr-chip' + (lessonsOf(e.lessons).indexOf(n) >= 0 ? ' on' : '') + '" data-g="eles|' + n + '" title="' + esc(LES[n] || '') + '">L' + n + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">名稱</label><input type="text" id="gr-etitle" value="' + esc(e.title) + '" placeholder="空白＝自動（' + esc(itemLabel({ type: e.type, lessons: e.lessons })) + '）" style="flex:1;min-width:220px"></div>';
    h += '<div class="gr-row"><label class="k">發下／考試日</label><input type="date" id="gr-eissued" value="' + esc(e.issued) + '"></div>';
    var autoDue = e.type === '註釋小考';
    h += '<div class="gr-row"><label class="k">繳交期限</label>';
    if (autoDue && isNew) h += '<span>自動＝各班下一節國文課：' + e.clsList.map(function (c) { return esc(c) + ' ' + (e.issued ? md(nextLesson(c, e.issued)) || '（找不到）' : '—'); }).join('、') + '</span>';
    else h += '<input type="date" id="gr-edue" value="' + esc(e.due) + '">' + (autoDue && e.issued ? '<button class="gr-btn" data-g="eauto">改成下一節課（' + md(nextLesson(e.cls, e.issued)) + '）</button>' : '');
    h += '</div>';
    h += '<div class="gr-row"><label class="k">遲交扣分</label><label><input type="checkbox" id="gr-elate"' + (e.late ? ' checked' : '') + '> 逾期每一上課日 −' + PEN + ' 分（' + esc(ty.k) + ' 預設' + (ty.late ? '扣' : '不扣') + '）</label></div>';
    h += '<div class="gr-row"><label class="k">備註</label><input type="text" id="gr-enote" value="' + esc(e.note) + '" style="flex:1"></div>';
    h += '<div class="gr-row" style="margin-top:10px"><button class="gr-btn pri" data-g="esave">' + (isNew ? '建立' : '儲存') + '</button><button class="gr-btn" data-g="ecancel">取消</button>' +
      (isNew ? '' : '<span class="gr-sp" style="flex:1"></span><button class="gr-btn warn" data-g="edel">刪除這份（含成績）</button>') + '</div></div>';
    return h;
  }
  function readEdit() {
    var e = S.edit, q = function (id) { return document.getElementById(id); };
    if (q('gr-etitle')) e.title = q('gr-etitle').value.trim();
    if (q('gr-eissued')) e.issued = q('gr-eissued').value;
    if (q('gr-edue')) e.due = q('gr-edue').value;
    if (q('gr-elate')) e.late = q('gr-elate').checked;
    if (q('gr-enote')) e.note = q('gr-enote').value.trim();
  }
  function saveEdit() {
    readEdit(); var e = S.edit;
    if (!e.id) {
      if (!e.clsList.length) { alert('請選班級'); return; }
      var rows = e.clsList.map(function (c) {
        return { id: uid('i'), cls: c, type: e.type, title: e.title, lessons: e.lessons, issued: e.issued,
          due: e.type === '註釋小考' && e.issued ? nextLesson(c, e.issued) : e.due, late: e.late, calId: e.calId || '', note: e.note, created: new Date().toISOString() };
      });
      if (rows.some(function (r) { return r.late && !r.due; }) && !confirm('沒有繳交期限，不會計算遲交。確定建立？')) return;
      save('items', rows.map(wireItem), '已建立').then(function () {
        rows.forEach(function (r) { D.items.push(r); });
        var mine = rows.filter(function (r) { return r.cls === S.cls; })[0];
        S.edit = null; S.item = mine ? mine.id : ''; render();
      });
    } else {
      var it = itemById(e.id); if (!it) return;
      var n = { id: it.id, cls: it.cls, type: e.type, title: e.title, lessons: e.lessons, issued: e.issued, due: e.due, late: e.late, calId: it.calId, note: e.note, created: it.created };
      save('items', [wireItem(n)]).then(function () { Object.keys(n).forEach(function (k) { it[k] = n[k]; }); S.edit = null; render(); });
    }
  }
  function delItem(id) {
    var it = itemById(id); if (!it) return;
    var n = D.scores.filter(function (s) { return s.item === id && (s.raw != null || s.sub); }).length;
    if (!confirm('刪除「' + S.cls + '・' + itemLabel(it) + '」' + (n ? '以及已登記的 ' + n + ' 筆成績' : '') + '？此動作無法復原。')) return;
    remove('items', [id]).then(function () {
      D.items = D.items.filter(function (i) { return i.id !== id; }); D.scores = D.scores.filter(function (s) { return s.item !== id; }); reindex();
      S.edit = null; S.item = ''; render();
    });
  }

  /* 從 V98 日曆匯入（A卷、習作、註釋小考、課後習題、其他） */
  var CAL_MAP = { 'A卷': 'A卷', '習作': '習作', '註釋小考': '註釋小考', '課後習題': '回家考卷', '其他': '回家考卷' };
  function calEntries() {
    var a = []; try { a = (window.V98CAL && V98CAL.data()) || []; } catch (e) {}
    var have = {}; D.items.forEach(function (i) { if (i.calId) have[i.calId] = 1; });
    return a.filter(function (e) { return e.cls === S.cls && CAL_MAP[e.item] && e.kind !== '檢討' && !have[e.id]; })
      .sort(function (x, y) { return x.date < y.date ? 1 : -1; });
  }
  function calTitle(e) {
    var L = (e.lessons || []).slice().sort(function (a, b) { return a - b; }).map(function (n) { return 'L' + n; }).join('、');
    if (e.item === '註釋小考') { var q = e.quiz || {}; return '註釋小考 ' + L + (q.a ? '（註' + q.a + '–' + q.b + '）' : ''); }
    var it = e.item === '其他' ? (e.note || '其他') : e.item;
    return it + (L ? ' ' + L : '') + (e.item !== '其他' && e.note ? '（' + e.note + '）' : '');
  }
  function impHTML() {
    var es = calEntries();
    var h = '<div class="gr-h"><h4>📅 從日曆匯入（' + esc(S.cls) + '）</h4><button class="gr-btn" data-g="impx">返回</button></div>';
    if (!es.length) return h + '<p class="gr-muted">日曆上這班沒有尚未匯入的 A卷／習作／註釋小考／課後習題。</p>';
    h += '<p class="gr-muted">考試＝當天考、期限同一天；交作業＝期限是那天；註釋小考＝期限自動排到下一節國文課。</p>';
    h += '<table class="gr-t"><thead><tr><th></th><th>日期</th><th>日曆項目</th><th>匯入成</th><th>期限</th></tr></thead><tbody>';
    es.forEach(function (e) {
      var ty = S.imp.type[e.id] || CAL_MAP[e.item], on = S.imp.pick[e.id] !== false;
      h += '<tr><td><input type="checkbox" data-g="ipick|' + e.id + '"' + (on ? ' checked' : '') + '></td><td>' + md(e.date) + '</td><td class="nm">' + esc(calTitle(e)) + '（' + esc(e.kind) + '）</td>' +
        '<td><select data-g="itype|' + e.id + '">' + TYPES.map(function (t) { return '<option' + (t.k === ty ? ' selected' : '') + '>' + t.k + '</option>'; }).join('') + '</select></td>' +
        '<td>' + md(ty === '註釋小考' ? nextLesson(S.cls, e.date) : e.date) + '</td></tr>';
    });
    return h + '</tbody></table><div class="gr-row" style="margin-top:10px"><button class="gr-btn pri" data-g="impgo">匯入勾選的項目</button></div>';
  }
  function doImport() {
    var rows = calEntries().filter(function (e) { return S.imp.pick[e.id] !== false; }).map(function (e) {
      var ty = S.imp.type[e.id] || CAL_MAP[e.item];
      return { id: uid('i'), cls: e.cls, type: ty, title: calTitle(e), lessons: (e.lessons || []).join(','), issued: e.kind === '考試' ? e.date : '',
        due: ty === '註釋小考' ? nextLesson(e.cls, e.date) : e.date, late: typeOf(ty).late, calId: e.id, note: '', created: new Date().toISOString() };
    });
    if (!rows.length) return;
    save('items', rows.map(wireItem), '已匯入 ' + rows.length + ' 份').then(function () { rows.forEach(function (r) { D.items.push(r); }); S.imp = null; S.item = rows[0].id; render(); });
  }

  /* ── 投影（v110：只顯示座號、已交／未交逾期扣分／請假、訂正加分；不顯示分數） ── */
  function projHTML() {
    var its = itemsOf(S.cls), st = roster(S.cls), td = today();
    if (!st.length) return '<div class="gr-main"><div class="gr-pane"><p class="gr-muted">這班還沒有學生名單。</p></div></div>';
    if (!S.projItem || !itemById(S.projItem) || itemById(S.projItem).cls !== S.cls) S.projItem = its[0] ? its[0].id : '';
    var h = '<div class="gr-main"><div class="gr-pane"><div class="gr-h">' +
      '<button class="gr-chip' + (S.projView === 'item' ? ' on' : '') + '" data-g="pv|item">單份考卷</button>' +
      '';   /* v110：投影不顯示成績，拿掉「各項平均」 */
    S.projView = 'item';
    if (S.projView === 'item') {
      h += '<select id="gr-pitem" style="font-size:16px;max-width:420px">' + its.map(function (it) { return '<option value="' + it.id + '"' + (it.id === S.projItem ? ' selected' : '') + '>' +
        esc(itemLabel(it)) + (it.due ? '（期限 ' + md(it.due) + '）' : '') + '</option>'; }).join('') + '</select></div>';
      var it = itemById(S.projItem);
      if (!it) return h + '<p class="gr-muted">這班還沒有考卷。</p></div></div>';
      var miss = [], cards = '';
      st.forEach(function (s) {
        var c = scoreOf(it.id, s.seat), L = lateOf(it, c, td), f = finalOf(it, c, td), has = c && (c.raw != null || c.sub);
        if (!has) {
          if (L) miss.push(s.seat);
          cards += '<div class="gr-card' + (L ? ' miss' : '') + '"><b>' + s.seat + '</b><div class="v">' + (L ? '未交' : (leaveOf(c).k === '考' ? '未補考' : '—')) + '</div><div class="s">' + (L ? '<span class="late">逾期' + L + '天 −' + L * PEN + '</span>' : (c && c.leave ? (leaveOf(c).k === '考' ? '考試請假' : '請假') : '')) + '</div></div>';
        } else {
          cards += '<div class="gr-card"><b>' + s.seat + '</b><div class="v">✓</div><div class="s">' +   /* v110：投影不顯示分數 */
            (L ? '<span class="late">遲' + L + '天 −' + L * PEN + '</span>' : '') + (c.bonus ? ' <span class="pos">訂正+' + c.bonus + '</span>' : '') + '</div></div>';
        }
      });
      h += '<p style="font-size:17px;margin:4px 0 10px">' + (it.due ? '期限 <b>' + md(it.due) + '</b>　' : '') +
        (miss.length ? '<span class="late">未交（已逾期）：' + miss.join('、') + '</span>' : '<span class="pos">沒有逾期未交</span>') + '</p>';
      return h + '<div class="gr-cards">' + cards + '</div></div></div>';
    }
    h += '<button class="gr-btn" data-g="revall">' + (S.revealAll ? '全部遮起來' : '全部顯示') + '</button><span class="gr-muted">點格子才顯示</span></div>';
    h += '<table class="gr-t"><thead><tr><th>座號</th>' + CATS.map(function (k) { return '<th>' + k + '</th>'; }).join('') + '<th>目前平均</th></tr></thead><tbody>';
    st.forEach(function (s) {
      var sm = summary(S.cls, s.seat, td);
      h += '<tr><td><b>' + s.seat + '</b></td>' + CATS.concat(['total']).map(function (k) {
        var key = s.seat + '|' + k, shown = S.revealAll || S.reveal[key];
        return '<td class="gr-mask' + (shown ? '' : ' m') + '" data-g="rev|' + key + '"><span' + (k === 'total' ? ' class="fin"' : '') + '>' + (sm[k] == null ? '—' : r1(sm[k])) + '</span></td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table>' + (weights(S.cls).tentative ? '<p class="gr-muted">（配分尚未設定，目前用暫定比例）</p>' : '') + '</div></div>';
  }

  /* ── 課堂加減分（記錄用，不自動併入態度） ── */
  function ptsHTML() {
    var st = roster(S.cls), td = today();
    var h = '<div class="gr-main"><div class="gr-pane"><div class="gr-h">' +
      '<button class="gr-chip' + (S.ptView === 'seat' ? ' on' : '') + '" data-g="ptv|seat">座位表</button>' +
      '<button class="gr-chip' + (S.ptView === 'grid' ? ' on' : '') + '" data-g="ptv|grid">座號方格</button>' +
      '<button class="gr-chip' + (S.ptView === 'stat' ? ' on' : '') + '" data-g="ptv|stat">統計</button><span style="width:14px"></span>';
    if (S.ptView === 'stat') {
      h += '<button class="gr-chip' + (S.ptRange === 'today' ? ' on' : '') + '" data-g="ptr|today">今天</button><button class="gr-chip' + (S.ptRange === 'all' ? ' on' : '') + '" data-g="ptr|all">本學期</button></div>';
      var P = D.points.filter(function (p) { return p.cls === S.cls && (S.ptRange === 'all' || p.date === td); });
      h += '<table class="gr-t" style="max-width:640px"><thead><tr><th>座號</th><th>加分</th><th>扣分</th><th>合計</th><th>扣分原因</th></tr></thead><tbody>';
      st.forEach(function (s) {
        var mine = P.filter(function (p) { return p.seat === s.seat; }), plus = 0, minus = 0, why = {};
        mine.forEach(function (p) { if (p.delta > 0) plus += p.delta; else { minus += p.delta; why[p.reason || '其他'] = (why[p.reason || '其他'] || 0) + 1; } });
        h += '<tr><td><b>' + s.seat + '</b></td><td class="pos">' + (plus ? '+' + plus : '') + '</td><td class="neg">' + (minus || '') + '</td><td class="fin ' + (plus + minus > 0 ? 'pos' : plus + minus < 0 ? 'neg' : '') + '">' + (mine.length ? (plus + minus > 0 ? '+' : '') + (plus + minus) : '') + '</td><td class="gr-muted">' +
          Object.keys(why).map(function (k) { return esc(k) + '×' + why[k]; }).join('、') + '</td></tr>';
      });
      return h + '</tbody></table><p class="gr-muted">課堂加減分只做紀錄，不會自動計入態度成績。</p></div></div>';
    }
    if (!S.admin) return h + '</div>' + needLogin('課堂加減分需要登入').replace('<div class="gr-main"><div class="gr-pane">', '').replace(/<\/div><\/div>$/, '') + '</div></div>';
    h += '<button class="gr-chip grn' + (S.ptMode === '+' ? ' on' : '') + '" data-g="ptm|+">＋ 加分</button>' +
      '<button class="gr-chip red' + (S.ptMode === '-' ? ' on' : '') + '" data-g="ptm|-">－ 扣分</button>';
    if (S.ptMode === '-') h += '<span class="gr-muted">原因：</span>' + REASONS.map(function (r) { return '<button class="gr-chip red' + (S.ptReason === r ? ' on' : '') + '" data-g="ptw|' + r + '">' + r + '</button>'; }).join('');
    h += '<span style="flex:1"></span><button class="gr-btn" data-g="ptundo"' + (S.undo.length ? '' : ' disabled') + '>↶ 復原上一筆</button></div>';
    var per = curPeriod(S.cls);
    h += '<p class="gr-muted">' + md(td) + (per ? ' 第' + per + '節' : '（現在不在課表節次內）') + '　點座號＝' + (S.ptMode === '+' ? '加 1 分' : '扣 1 分（' + esc(S.ptReason) + '）') + '　數字＝今天累計</p>';
    if (!st.length) return h + '<p class="late">這班還沒有學生名單。</p></div></div>';
    var tot = {}; D.points.forEach(function (p) { if (p.cls === S.cls && p.date === td) tot[p.seat] = (tot[p.seat] || 0) + p.delta; });
    if (S.ptView === 'seat') return h + seatHTML(st, tot) + '</div></div>';
    h += '<div class="gr-seats ' + (S.ptMode === '+' ? 'plus' : 'minus') + '">' + st.map(function (s) {
      var t = tot[s.seat] || 0;
      return '<button class="gr-seat" data-g="pt|' + s.seat + '">' + s.seat + '<small class="' + (t > 0 ? 'pos' : t < 0 ? 'neg' : '') + '">' + (t ? (t > 0 ? '+' : '') + t : '') + '</small></button>';
    }).join('') + '</div></div></div>';
    return h;
  }
  /* ── 座位表（老師 10/6：照教室座位排，老師視角＝最下排靠講台；預設 6×6；一次段考換一次座位 → 可拖拉調整） ──
     資料：localStorage gr_seat_v1＝{ 班名:{ rows, cols, grid:[[座號或0…]…], at } }，grid[0]＝最上排（最後排），最後一列＝靠講台。 */
  /* 預設座位：只記座號位置（不含姓名、照片）。冷一忠＝老師 10/6 提供的「115 學年度第一學期冷一忠座位表 A（1150831 啟用）」，7 排×每排 6 人 */
  var SEAT_PRESET = {
    '冷一忠': [[0, 0, 0, 0, 0, 34, 11], [16, 29, 31, 32, 33, 35, 15], [17, 30, 24, 4, 18, 27, 25], [1, 10, 26, 7, 21, 2, 6], [3, 9, 8, 12, 19, 20, 13], [0, 14, 28, 5, 22, 23, 0]]
  };
  function seatAll() { var a = get(K.seat, null); return a && typeof a === 'object' ? a : {}; }
  function seatOf(cls, st) {
    var L = seatAll()[cls];
    if (L && L.grid && L.rows && L.cols) return L;
    var P = SEAT_PRESET[cls]; if (P) return { rows: P.length, cols: P[0].length, grid: P.map(function (r) { return r.slice(); }), at: '', auto: true, preset: true };
    var rows = 6, cols = 6, grid = [], seats = st.map(function (s) { return s.seat; }), i = 0;   /* 預設：從靠講台那排、由左到右依座號排 */
    for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(0));
    for (var rr = rows - 1; rr >= 0; rr--) for (var c = 0; c < cols; c++) grid[rr][c] = i < seats.length ? seats[i++] : 0;
    return { rows: rows, cols: cols, grid: grid, at: '', auto: true };
  }
  function seatSave(cls, L) { var a = seatAll(); L = { rows: L.rows, cols: L.cols, grid: L.grid, at: new Date().toISOString() }; a[cls] = L; put(K.seat, a); }
  function seatHTML(st, tot) {
    var L = seatOf(S.cls, st), act = {}, placed = {};
    st.forEach(function (s) { act[s.seat] = 1; });
    var h = '<div class="gr-seatbar">' + (S.seatEdit
      ? '<b>✎ 調整座位</b><span class="gr-muted">拖拉座號框：拖到別人身上＝兩人對調；拖到空位＝移過去；拖到下面「未安排」＝先拿出來。</span>' +
        '<span style="flex:1"></span><span class="gr-muted">幾排（直）</span><button class="gr-btn" data-g="seatdim|c-">−</button><b>' + L.cols + '</b><button class="gr-btn" data-g="seatdim|c+">＋</button>' +
        '<span class="gr-muted">每排幾人</span><button class="gr-btn" data-g="seatdim|r-">−</button><b>' + L.rows + '</b><button class="gr-btn" data-g="seatdim|r+">＋</button>' +
        '<button class="gr-btn" data-g="seatreset">依座號重排</button><button class="gr-btn pri" data-g="seatedit|0">完成</button>'
      : (L.auto ? '<span class="gr-muted">' + (L.preset ? '這是依老師提供的座位表排的；換座位時按右邊「調整座位」拖拉。' : '還沒設定座位表，先依座號排；按右邊「調整座位」拖拉成教室實際座位。') + '</span>' : '<span class="gr-muted">' + (L.at ? '座位表更新於 ' + md(L.at.slice(0, 10)) : '') + '</span>') +
        '<span style="flex:1"></span><button class="gr-btn" data-g="seatedit|1">✎ 調整座位</button>') + '</div>';
    h += '<div class="gr-room' + (S.seatEdit ? ' edit' : '') + '" style="grid-template-columns:repeat(' + L.cols + ',minmax(0,1fr))">';
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var n = (L.grid[r] || [])[c] || 0;
      if (n && act[n]) {
        placed[n] = 1; var t = tot[n] || 0;
        h += S.seatEdit
          ? '<div class="gr-seat gr-cell" data-cell="' + r + ',' + c + '" data-seat="' + n + '">' + n + '<small></small></div>'
          : '<button class="gr-seat gr-cell" data-g="pt|' + n + '">' + n + '<small class="' + (t > 0 ? 'pos' : t < 0 ? 'neg' : '') + '">' + (t ? (t > 0 ? '+' : '') + t : '') + '</small></button>';
      } else h += '<div class="gr-cell gr-empty" data-cell="' + r + ',' + c + '"></div>';
    }
    h += '</div><div class="gr-cols" style="grid-template-columns:repeat(' + L.cols + ',minmax(0,1fr))">';
    for (var k = 0; k < L.cols; k++) h += '<span>第' + '一二三四五六七八九十'.charAt(k) + '排</span>';
    h += '</div><div class="gr-podium">講　台</div>';
    var un = st.filter(function (s) { return !placed[s.seat]; });
    if (S.seatEdit || un.length) h += '<div class="gr-tray"' + (S.seatEdit ? ' data-tray="1"' : '') + '><span class="gr-muted">未安排：</span>' + (un.length ? un.map(function (s) {
      return S.seatEdit ? '<div class="gr-seat gr-tchip" data-seat="' + s.seat + '">' + s.seat + '</div>' : '<button class="gr-seat gr-tchip" data-g="pt|' + s.seat + '">' + s.seat + '</button>';
    }).join('') : '<span class="gr-muted">（全部都排好了）</span>') + '</div>';
    return h;
  }
  /* 拖拉（滑鼠、觸控都可以；Pointer Events） */
  var drag = null;
  function seatDown(e) {
    if (!S.seatEdit) return;
    var el = e.target.closest && e.target.closest('#v106-gr .gr-room .gr-seat[data-seat], #v106-gr .gr-tray .gr-seat[data-seat]'); if (!el) return;
    e.preventDefault();
    var r = el.getBoundingClientRect(), g = el.cloneNode(true);
    g.className = 'gr-seat gr-ghost'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.getElementById('v106-gr').appendChild(g);
    drag = { seat: +el.getAttribute('data-seat'), from: el.getAttribute('data-cell') || 'tray', el: el, g: g, dx: e.clientX - r.left, dy: e.clientY - r.top };
    el.classList.add('gr-lift'); seatMove(e);
  }
  function seatMove(e) {
    if (!drag) return; e.preventDefault();
    drag.g.style.left = (e.clientX - drag.dx) + 'px'; drag.g.style.top = (e.clientY - drag.dy) + 'px';
    var t = seatTarget(e); document.querySelectorAll('#v106-gr .gr-over').forEach(function (x) { x.classList.remove('gr-over'); });
    if (t) t.classList.add('gr-over');
  }
  function seatTarget(e) {
    drag.g.style.display = 'none'; var x = document.elementFromPoint(e.clientX, e.clientY); drag.g.style.display = '';
    return x && x.closest ? x.closest('#v106-gr .gr-cell, #v106-gr .gr-tray') : null;
  }
  function seatUp(e) {
    if (!drag) return;
    var t = seatTarget(e), d = drag; drag = null; d.g.remove();
    if (!t) { render(); return; }
    var st = roster(S.cls), L = seatOf(S.cls, st), g = L.grid.map(function (row) { return row.slice(); });
    var pos = function (k) { var a = k.split(','); return [+a[0], +a[1]]; };
    if (t.classList.contains('gr-tray')) { if (d.from !== 'tray') { var f = pos(d.from); g[f[0]][f[1]] = 0; } }
    else {
      var to = pos(t.getAttribute('data-cell')), other = g[to[0]][to[1]] || 0;
      if (d.from === 'tray') g[to[0]][to[1]] = d.seat;                        /* 原本坐那裡的人回到「未安排」 */
      else { var fr = pos(d.from); g[fr[0]][fr[1]] = other; g[to[0]][to[1]] = d.seat; }   /* 對調（空位＝移過去） */
    }
    L.grid = g; seatSave(S.cls, L); render();
  }
  function seatDim(v) {
    var st = roster(S.cls), L = seatOf(S.cls, st), g = L.grid.map(function (row) { return row.slice(); });
    var lost = function (arr) { return arr.some(function (n) { return n; }); };
    if (v === 'r+') { g.unshift(new Array(L.cols).fill(0)); L.rows++; }
    else if (v === 'r-') { if (L.rows <= 1) return; if (lost(g[0]) && !confirm('最後面（最上面）那一列還有人，刪掉後他們會回到「未安排」。確定？')) return; g.shift(); L.rows--; }
    else if (v === 'c+') { g.forEach(function (row) { row.push(0); }); L.cols++; }
    else if (v === 'c-') { if (L.cols <= 1) return; if (lost(g.map(function (row) { return row[row.length - 1]; })) && !confirm('最右邊那一排還有人，刪掉後他們會回到「未安排」。確定？')) return; g.forEach(function (row) { row.pop(); }); L.cols--; }
    L.grid = g; seatSave(S.cls, L); render();
  }
  function seatReset() {
    if (!confirm('依座號重新排（從靠講台那一列、由左到右）？目前的座位安排會被取代。')) return;
    var a = seatAll(), keep = a[S.cls]; delete a[S.cls]; put(K.seat, a);
    var L = seatOf(S.cls, roster(S.cls)); if (keep) { L.rows = keep.rows; L.cols = keep.cols; }
    var seats = roster(S.cls).map(function (s) { return s.seat; }), i = 0, grid = [];
    for (var r = 0; r < L.rows; r++) grid.push(new Array(L.cols).fill(0));
    for (var rr = L.rows - 1; rr >= 0; rr--) for (var c = 0; c < L.cols; c++) grid[rr][c] = i < seats.length ? seats[i++] : 0;
    L.grid = grid; seatSave(S.cls, L); render();
  }

  function addPoint(seat, btn) {
    var td = today(), p = { id: uid('p'), ts: new Date().toISOString(), date: td, period: curPeriod(S.cls), cls: S.cls, seat: seat,
      delta: S.ptMode === '+' ? 1 : -1, reason: S.ptMode === '+' ? '' : S.ptReason };
    D.points.push(p); S.undo.push(p.id);
    fly(btn, p.delta);
    var sm = btn.querySelector('small'), t = 0; D.points.forEach(function (x) { if (x.cls === S.cls && x.date === td && x.seat === seat) t += x.delta; });
    if (sm) { sm.textContent = t ? (t > 0 ? '+' : '') + t : ''; sm.className = t > 0 ? 'pos' : t < 0 ? 'neg' : ''; }
    var u = document.querySelector('#v106-gr [data-g="ptundo"]'); if (u) u.disabled = false;
    save('points', [p], (p.delta > 0 ? '+1 ' : '−1 ') + S.cls + ' ' + seat + '號').catch(function () { D.points = D.points.filter(function (x) { return x.id !== p.id; }); S.undo.pop(); render(); });
  }
  function fly(btn, d) {
    btn.classList.remove('flash-p', 'flash-m'); void btn.offsetWidth; btn.classList.add(d > 0 ? 'flash-p' : 'flash-m');
    var r = btn.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'gr-fly ' + (d > 0 ? 'p' : 'm'); f.textContent = d > 0 ? '+1' : '−1';
    f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top) + 'px';
    document.getElementById('v106-gr').appendChild(f); setTimeout(function () { f.remove(); }, 1000);
  }
  function undoPoint() {
    var id = S.undo.pop(); if (!id) return;
    var p = D.points.filter(function (x) { return x.id === id; })[0];
    remove('points', [id]).then(function () { D.points = D.points.filter(function (x) { return x.id !== id; }); setSt('已復原 ' + (p ? p.seat + '號 ' + (p.delta > 0 ? '+1' : '−1') : '')); render(); })
      .catch(function () { S.undo.push(id); });
  }

  /* ── 設定 ── */
  function setHTML() {
    if (!S.setCls) S.setCls = S.cls;
    var h = '<div class="gr-main"><div class="gr-pane">';
    h += '<div class="gr-sec"><h5>① Google 綁定</h5>' +
      '<div class="gr-row"><label class="k">目前</label><b>' + (isDemo() ? '示範模式（未綁定）' : '已綁定 Google 試算表') + '</b>' + (GS_URL && !get(K.url, '') ? '<span class="gr-muted">（網址寫在網頁內）</span>' : '') + '</div>' +
      '<div class="gr-row"><label class="k">網址</label><input type="text" id="gr-url" value="' + esc(get(K.url, '') || GS_URL) + '" placeholder="https://script.google.com/macros/s/……/exec" style="flex:1;min-width:300px"></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="urlsave">儲存並測試</button>' + (get(K.url, '') ? '<button class="gr-btn" data-g="urlclear">清除本裝置網址</button>' : '') +
      '<span class="gr-muted">部署步驟見專案 docs/成績系統_部署步驟.md</span></div></div>';
    if (!S.admin) return h + needLogin('名單、配分、匯出需要登入').replace('<div class="gr-main"><div class="gr-pane">', '').replace(/<\/div><\/div>$/, '') + '</div></div>';
    h += '<div class="gr-row" style="margin:0 0 8px">設定班級：' + classes().map(function (c) { return '<button class="gr-chip' + (S.setCls === c ? ' on' : '') + '" data-g="scls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    var ros = D.students.filter(function (s) { return s.cls === S.setCls; });
    h += '<div class="gr-sec"><h5>② 學生名單（' + esc(S.setCls) + '：目前 ' + ros.filter(function (s) { return s.active !== 0; }).length + ' 人）</h5>' +
      '<p class="gr-muted">從 Excel 選取「座號、學號、姓名」三欄（含不含標題列都可以）→ 複製 → 貼到下面。也可以直接在 Google 試算表「學生名單」工作表貼。</p>' +
      '<textarea id="gr-paste" rows="6" style="width:100%" placeholder="1\t1150101\t王小明">' + esc(S.paste) + '</textarea>' +
      '<div class="gr-row"><button class="gr-btn" data-g="pprev">預覽</button>' + (S.preview ? '<button class="gr-btn pri" data-g="pgo">匯入 ' + S.preview.rows.length + ' 人到 ' + esc(S.setCls) + '</button>' : '') + '</div>';
    if (S.preview) {
      h += '<p class="gr-muted">' + (S.preview.skip.length ? '略過 ' + S.preview.skip.length + ' 行（看不出座號或姓名）：' + esc(S.preview.skip.slice(0, 3).join('／')) : '') + '</p>' +
        '<table class="gr-t" style="max-width:480px"><thead><tr><th>座號</th><th>學號</th><th>姓名</th><th></th></tr></thead><tbody>' +
        S.preview.rows.map(function (r) { var ex = ros.filter(function (s) { return s.seat === r.seat; })[0]; return '<tr><td>' + r.seat + '</td><td>' + esc(r.sid) + '</td><td class="nm">' + esc(r.name) + '</td><td class="gr-muted">' + (ex ? (ex.name === r.name ? '不變' : '取代「' + esc(ex.name) + '」') : '新增') + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    h += '</div>';
    var w = weights(S.setCls);
    h += '<div class="gr-sec"><h5>③ 配分（' + esc(S.setCls) + '）' + (w.tentative ? '<span class="late" style="font-size:13px">　目前是暫定值，請設定</span>' : '') + '</h5><div class="gr-row">' +
      CATS.map(function (k) { return '<label>' + k + ' <input type="number" min="0" id="gr-w-' + k + '" value="' + esc(w[k]) + '" style="width:62px"></label>'; }).join('') + '</div>' +
      '<div class="gr-row"><span>作業內比例　習作 <input type="number" min="0" id="gr-w-習作" value="' + esc(w['習作']) + '" style="width:56px"> ： 回家考卷 <input type="number" min="0" id="gr-w-回家考卷" value="' + esc(w['回家考卷']) + '" style="width:56px"></span>' +
      '<span class="gr-muted">考試＝註釋小考平均×1/3＋A卷平均×2/3（固定）</span></div>' +
      '<div class="gr-row"><label><input type="checkbox" id="gr-w-zero"' + (w.zeroMissing ? ' checked' : '') + '> 逾期未交的考卷以 0 分計入平均（不勾＝未交不列入）</label></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="wsave">儲存這班</button><button class="gr-btn" data-g="wsaveall">套用到全部班級</button><span class="gr-muted">比例數字不必加到 100，會自動換算；目前平均只算已有分數的項目。</span></div></div>';
    h += '<div class="gr-sec"><h5>④ 匯出 Excel</h5><div class="gr-row">' + classes().map(function (c) { return '<button class="gr-btn" data-g="csv|' + esc(c) + '">' + esc(c) + ' 成績總表</button>'; }).join('') +
      '<button class="gr-btn" data-g="csvpts">課堂加減分紀錄</button></div><p class="gr-muted">下載 CSV（Excel 可直接開，含姓名，請勿外流）。完整原始資料也在 Google 試算表裡。</p></div>';
    h += tutorSecHTML();   /* gr-5 */
    if (isDemo()) h += '<div class="gr-sec"><h5>示範資料</h5><button class="gr-btn warn" data-g="demoreset">清除本機示範資料</button></div>';
    return h + '</div></div>';
  }
  /* ── gr-5：小老師（名單、密碼、網址） ── */
  function tutorSecHTML() {
    var h = '<div class="gr-sec"><h5>⑤ 小老師</h5>';
    if (isDemo()) return h + '<p class="gr-muted">示範模式不支援（要綁定 Google 後台 gr-5）。</p></div>';
    var pwUrl = url() + '?page=tutor';
    h += '<div class="gr-row"><label class="k">帳密登入</label><input type="text" readonly value="' + esc(pwUrl) + '" style="flex:1;min-width:280px" onclick="this.select()"></div>' +
      '<div class="gr-row"><label class="k">Google 登入</label>' + (TUTOR_G_URL ? '<input type="text" readonly value="' + esc(TUTOR_G_URL + '?page=tutor') + '" style="flex:1;min-width:280px" onclick="this.select()">'
        : '<span class="gr-muted">還沒設定（Apps Script 要另外新增一個「網域內」部署，見 docs/成績系統_部署步驟.md §7）</span>') + '</div>';
    var ts = D.tutors.slice().sort(function (a, b) { return a.cls === b.cls ? a.seat - b.seat : (classes().indexOf(a.cls) - classes().indexOf(b.cls)); });
    if (!ts.length) h += '<p class="gr-muted">名單還沒建立（後台升到 gr-5 後，第一次有小老師登入或按「重新整理名單」就會自動建立預設名單）。</p>';
    else {
      h += '<table class="gr-t" style="max-width:640px"><thead><tr><th>班級</th><th>座號</th><th>姓名</th><th>帳號（學號）</th><th>密碼</th><th></th></tr></thead><tbody>';
      ts.forEach(function (t) {
        var s = D.students.filter(function (x) { return x.cls === t.cls && x.seat === +t.seat; })[0] || {}, k = esc(t.cls) + '|' + t.seat;
        var on = String(t.active) !== '0';
        if (t.cls === '全部') s = { name: '🧪 測試帳號（四班）', sid: t.sid || t.note || '' };   /* 老師的試用帳號：帳號打信箱或 @ 前面 */
        h += '<tr' + (on ? '' : ' style="opacity:.5"') + '><td>' + esc(t.cls) + '</td><td><b>' + (+t.seat || '—') + '</b></td><td class="nm">' + esc(s.name || t.name || '（名單沒有）') + '</td><td>' + esc(s.sid || t.sid || '') + '</td>' +
          '<td>' + (+t.hasPw ? '已設定' : '<span class="late">未設定</span>') + '</td><td><button class="gr-btn" data-g="tadm|pw|' + k + '">' + (+t.hasPw ? '重設密碼' : '產生密碼') + '</button>' +
          '<button class="gr-btn" data-g="tadm|' + (on ? 'off' : 'on') + '|' + k + '">' + (on ? '停用' : '啟用') + '</button></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '<div class="gr-row" style="margin-top:8px"><label class="k">新增</label><select id="gr-tcls">' + classes().map(function (c) { return '<option' + (c === S.setCls ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
      '<input type="number" id="gr-tseat" min="1" max="60" placeholder="座號" style="width:70px"><button class="gr-btn" data-g="tadm|add">新增小老師</button>' +
      '<button class="gr-btn" data-g="tadm|list">重新整理名單</button></div>' +
      '<p class="gr-muted">Google 登入＝用 學號@mail2.ccvs.kh.edu.tw 自動認人，不用密碼。密碼只有按下去那一次看得到，忘了就重設。小老師只看得到自己班、誰還沒交、當天自己登的分數；檢查時才看得到那一份的分數。</p></div>';
    return h;
  }
  function tutorAdmin(v) {
    var a = v.split('|'), op = a[0], cls = a[1] || '', seat = +a[2] || 0, nm = cls === '全部' ? '測試帳號' : cls + ' ' + seat + '號';
    if (op === 'add') { cls = (document.getElementById('gr-tcls') || {}).value || ''; seat = +((document.getElementById('gr-tseat') || {}).value || 0); if (!cls || !seat) { alert('請選班級、輸入座號'); return; } }
    if (op === 'pw' && !confirm(nm + '：產生新密碼？（舊密碼立刻失效）')) return;
    if (op === 'off' && !confirm(nm + '：停用？（停用後不能登入）')) return;
    setSt('處理中…');
    call({ action: 'tAdmin', op: op, cls: cls, seat: seat }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '失敗');
      D.tutors = r.tutors || D.tutors; setSt('✓ 完成'); render();
      if (r.pw) { var t = (r.tutors || []).filter(function (x) { return x.cls === cls && +x.seat === seat; })[0] || {};
        alert((cls === '全部' ? '' : cls + ' ' + seat + '號 ') + (t.name || '') + '\n\n帳號：' + (t.sid || '（學號）') + '\n密碼：' + r.pw + '\n\n請抄給小老師。這個密碼之後不會再顯示，忘了就重設。'); }
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert('失敗：' + e.message + (/不明的動作/.test(e.message) ? '\n（Apps Script 還沒更新到 gr-5）' : '')); });
  }
  function parsePaste(txt) {
    var rows = [], skip = [], seen = {};
    String(txt || '').split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) return;
      var cells = line.split(/\t|,|\s{2,}/).map(function (x) { return x.trim(); }).filter(Boolean);
      if (cells.length === 1) cells = line.trim().split(/\s+/);
      var seat = null, sid = '', name = '';
      cells.forEach(function (c) {
        if (seat == null && /^\d{1,2}$/.test(c) && +c > 0) { seat = +c; return; }
        if (!sid && /^[A-Za-z]?\d{5,}$/.test(c)) { sid = c; return; }
        if (!name && /[㐀-鿿]/.test(c) && !/座號|學號|姓名|班級/.test(c)) name = c;
      });
      if (seat == null || !name || seen[seat]) { if (!/座號|姓名/.test(line)) skip.push(line.trim().slice(0, 20)); return; }
      seen[seat] = 1; rows.push({ seat: seat, sid: sid, name: name });
    });
    return { rows: rows.sort(function (a, b) { return a.seat - b.seat; }), skip: skip };
  }
  function importRoster() {
    var c = S.setCls, rows = S.preview.rows, inNew = {}; rows.forEach(function (r) { inNew[r.seat] = 1; });
    var gone = D.students.filter(function (s) { return s.cls === c && s.active !== 0 && !inNew[s.seat]; });
    var msg = '匯入 ' + rows.length + ' 人到 ' + c + '？';
    if (gone.length) msg += '\n名單外的座號 ' + gone.map(function (s) { return s.seat; }).join('、') + ' 會標成「不在籍」（不刪除，成績保留）。';
    if (!confirm(msg)) return;
    var out = rows.map(function (r) { return { cls: c, seat: r.seat, sid: r.sid, name: r.name, active: '1' }; })
      .concat(gone.map(function (s) { return { cls: c, seat: s.seat, sid: s.sid, name: s.name, active: '0' }; }));
    save('students', out, '名單已匯入').then(function () { S.paste = ''; S.preview = null; S.loaded = false; load(true); });
  }
  function saveWeights(all) {
    var w = {}; CATS.concat(['習作', '回家考卷']).forEach(function (k) { var e = document.getElementById('gr-w-' + k); w[k] = e ? Math.max(0, +e.value || 0) : DEF_W[k]; });
    w.zeroMissing = !!(document.getElementById('gr-w-zero') || {}).checked; w.tentative = false;
    var cs = all ? classes() : [S.setCls], rows = cs.map(function (c) { return { cls: c, json: JSON.stringify(w) }; });
    if (all && !confirm('把這組配分套用到全部 ' + cs.length + ' 班？')) return;
    save('weights', rows, '配分已儲存').then(function () {
      rows.forEach(function (r) { var o = D.weights.filter(function (x) { return x.cls === r.cls; })[0]; if (o) o.json = r.json; else D.weights.push(r); }); render(); });
  }
  function download(name, rows) {
    var csv = '﻿' + rows.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function exportClass(c) {
    var td = today(), its = itemsOf(c).slice().reverse(), w = weights(c);
    var head = ['座號', '學號', '姓名'].concat(its.map(function (i) { return i.type + '｜' + itemLabel(i) + (i.due ? '（' + md(i.due) + '）' : ''); }), CATS.map(function (k) { return k + '平均'; }), ['目前平均']);
    var rows = [head];
    D.students.filter(function (s) { return s.cls === c && s.active !== 0; }).forEach(function (s) {
      var sm = summary(c, s.seat, td);
      rows.push([s.seat, s.sid, s.name].concat(its.map(function (i) { var sc = scoreOf(i.id, s.seat), f = finalOf(i, sc, td), L = lateOf(i, sc, td);
        return f != null ? r1(f) : (sc && sc.sub ? '已交' : (L ? '未交(逾' + L + '天)' : '')); }), CATS.map(function (k) { return r1(sm[k]); }), [r1(sm.total)]));
    });
    rows.push([]); rows.push(['配分', '', ''].concat(its.map(function () { return ''; }), CATS.map(function (k) { return w[k]; }), [w.tentative ? '暫定' : '']));
    download(c + '_成績總表_' + td + '.csv', rows);
  }
  function exportPoints() {
    var rows = [['日期', '節次', '班級', '座號', '加減', '原因', '時間']];
    D.points.slice().sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }).forEach(function (p) { rows.push([p.date, p.period, p.cls, p.seat, p.delta, p.reason, p.ts]); });
    download('課堂加減分_' + today() + '.csv', rows);
  }

  /* ── 事件 ── */
  function onClick(e) {
    var m = document.getElementById('v106-gr');
    if (e.target === m) { close(); return; }
    var b = e.target.closest && e.target.closest('[data-g]'); if (!b) return;
    if (b.tagName === 'SELECT' || b.tagName === 'INPUT' && b.type !== 'checkbox') return;
    var a = b.getAttribute('data-g').split('|'), t = a[0], v = a.slice(1).join('|');
    if (t === 'x') close();
    else if (t === 'tab') { S.tab = v; put(K.tab, v); render(); }
    else if (t === 'cls') { S.cls = v; put(K.cls, v); S.item = ''; S.edit = null; S.imp = null; S.undo = []; render(); }
    else if (t === 'reload') { S.loaded = false; load(true); }
    else if (t === 'retry') { if (Object.keys(pend).length) flush(); }
    else if (t === 'login') { var p = document.getElementById('gr-pw'); login(p && p.value, (document.getElementById('gr-rem') || {}).checked); }
    else if (t === 'logout') { if (confirm('登出？（這台裝置不再記住密碼）')) logout(); }
    else if (t === 'item') { S.item = v; S.edit = null; S.imp = null; render(); }
    else if (t === 'new') { S.imp = null; S.edit = { id: '', clsList: [S.cls], type: '註釋小考', lessons: '', title: '', issued: today(), due: '', late: true, note: '' }; render(); }
    else if (t === 'edit') { var it = itemById(v); S.edit = JSON.parse(JSON.stringify(it)); render(); }
    else if (t === 'ecls') { readEdit(); var L = S.edit.clsList, i = L.indexOf(v); if (i < 0) L.push(v); else L.splice(i, 1); render(); }
    else if (t === 'etype') { readEdit(); S.edit.type = v; S.edit.late = typeOf(v).late; render(); }
    else if (t === 'eles') { readEdit(); var ls = lessonsOf(S.edit.lessons), j = ls.indexOf(+v); if (j < 0) ls.push(+v); else ls.splice(j, 1); S.edit.lessons = ls.sort(function (x, y) { return x - y; }).join(','); render(); }
    else if (t === 'eauto') { readEdit(); S.edit.due = nextLesson(S.edit.cls, S.edit.issued); render(); }
    else if (t === 'esave') saveEdit();
    else if (t === 'ecancel') { S.edit = null; render(); }
    else if (t === 'edel') delItem(S.edit.id);
    else if (t === 'imp') { S.edit = null; S.imp = { pick: {}, type: {} }; render(); }
    else if (t === 'impx') { S.imp = null; render(); }
    else if (t === 'ipick') { S.imp.pick[v] = b.checked; }
    else if (t === 'impgo') doImport();
    else if (t === 'done' || t === 'unsub' || t === 'leaveon' || t === 'unleave' || t === 'lvx' || t === 'lvs') {
      var q = v.split('|'), seat = +q[1], sd = (document.getElementById('gr-subdate') || {}).value || today();
      if (t === 'done') patchScore(q[0], seat, { sub: sd });
      else if (t === 'unsub') { var c0 = scoreOf(q[0], seat); if (c0 && c0.raw != null && !confirm('已有分數，取消「已交」會讓這筆變成未交，確定？')) return; patchScore(q[0], seat, { sub: '' }); }
      else if (t === 'lvx') patchScore(q[0], seat, { leave: '考:' + sd });   /* v110：考試請假 */
      else if (t === 'lvs') patchScore(q[0], seat, { leave: '交:' + sd });   /* v110：繳交請假 */
      else if (t === 'leaveon') patchScore(q[0], seat, { leave: sd });
      else patchScore(q[0], seat, { leave: '' });
    }
    else if (t === 'b10') {   /* v110：已交的訂正 +10 */
      var who = roster(S.cls).filter(function (s) { var c = scoreOf(v, s.seat); return c && (c.raw != null || c.sub) && (c.bonus || 0) !== 10; });
      if (!itemById(v)) return;
      if (!who.length) { alert('沒有需要調整的：已交的人都已經是 +10，或還沒有人交。'); return; }
      if (!confirm('把這份考卷已交的 ' + who.length + ' 人，訂正加分設成 +10？\n（座號 ' + who.map(function (s) { return s.seat; }).join('、') + '）\n之後可以個別手動調整。')) return;
      who.forEach(function (s) { patchScore(v, s.seat, { bonus: 10 }); });
    }
    else if (t === 'hist') { var hq = v.split('|'); S.hist = { item: hq[0], seat: +hq[1] || 0 }; render(); }   /* gr-5 */
    else if (t === 'histx') { S.hist = null; render(); }
    else if (t === 'tadm') tutorAdmin(v);
    else if (t === 'pv') { S.projView = v; render(); }
    else if (t === 'rev') { S.reveal[v] = !S.reveal[v]; b.classList.toggle('m', !(S.revealAll || S.reveal[v])); }
    else if (t === 'revall') { S.revealAll = !S.revealAll; S.reveal = {}; render(); }
    else if (t === 'ptv') { S.ptView = v; put('gr_ptview_v1', v); S.seatEdit = false; render(); }
    else if (t === 'seatedit') { S.seatEdit = v === '1'; render(); }
    else if (t === 'seatdim') seatDim(v);
    else if (t === 'seatreset') seatReset();
    else if (t === 'ptr') { S.ptRange = v; render(); }
    else if (t === 'ptm') { S.ptMode = v; render(); }
    else if (t === 'ptw') { S.ptReason = v; render(); }
    else if (t === 'pt') addPoint(+v, b);
    else if (t === 'ptundo') undoPoint();
    else if (t === 'scls') { S.setCls = v; S.preview = null; render(); }
    else if (t === 'pprev') { S.paste = (document.getElementById('gr-paste') || {}).value || ''; S.preview = parsePaste(S.paste); render(); }
    else if (t === 'pgo') importRoster();
    else if (t === 'wsave') saveWeights(false);
    else if (t === 'wsaveall') saveWeights(true);
    else if (t === 'csv') exportClass(v);
    else if (t === 'csvpts') exportPoints();
    else if (t === 'urlsave') saveUrl();
    else if (t === 'urlclear') { if (confirm('清除本裝置的網址？（回到' + (GS_URL ? '網頁內建網址' : '示範模式') + '）')) { put(K.url, null); S.loaded = false; S.admin = false; load(true); } }
    else if (t === 'demoreset') { if (confirm('清除本機示範資料？')) { put(K.demo, null); S.loaded = false; load(true); } }
  }
  function saveUrl() {
    var u = ((document.getElementById('gr-url') || {}).value || '').trim();
    if (u && !/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) { alert('網址應該是 https://script.google.com/macros/s/……/exec'); return; }
    var old = get(K.url, null); put(K.url, u || null); setSt('測試連線中…');
    call({ action: 'ping' }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '回應錯誤');
      setSt('✓ 連線成功' + (r.hasPw ? '' : '（但後台還沒設密碼，請執行 setup）'), !r.hasPw);
      S.loaded = false; S.admin = false; load(true);
    }).catch(function (e) { put(K.url, old); setSt('⚠ 連不上：' + e.message, true); alert('連不上這個網址：' + e.message + '\n（已還原為原本設定）'); });
  }
  function onChange(e) {
    var g = e.target.getAttribute && e.target.getAttribute('data-g'), id = e.target.id;
    if (id === 'gr-subdate') { S.subDate = e.target.value || today(); return; }
    if (id === 'gr-pitem') { S.projItem = e.target.value; render(); return; }
    if (id === 'gr-eissued' && S.edit) { readEdit(); render(); return; }
    if (!g) return;
    var a = g.split('|'), t = a[0];
    if (t === 'itype') { S.imp.type[a[1]] = e.target.value; render(); return; }
    var item = a[1], seat = +a[2];
    if (t === 'raw') commitRaw(e.target);
    else if (t === 'sub') patchScore(item, seat, { sub: e.target.value });
    else if (t === 'leave') { var lo0 = leaveOf(scoreOf(item, seat)); patchScore(item, seat, { leave: e.target.value ? ((lo0.k === '考' || lo0.k === '交') ? lo0.k + ':' : '') + e.target.value : '' }); }   /* v110：改日期時保留請假種類 */
    else if (t === 'bonus') patchScore(item, seat, { bonus: +e.target.value || 0 });
  }
  function commitRaw(inp) {
    var a = inp.getAttribute('data-g').split('|'), item = a[1], seat = +a[2], v = inp.value.trim();
    var n = v === '' ? null : num(v);
    if (v !== '' && (n == null || n < 0 || n > 200)) { alert('分數請輸入 0～200 的數字'); inp.value = ''; return false; }
    var c = scoreOf(item, seat);
    if ((c ? c.raw : null) === n) return true;
    var p = { raw: n }; if (n != null && !(c && c.sub)) p.sub = (document.getElementById('gr-subdate') || {}).value || today();
    patchScore(item, seat, p);
    return true;
  }
  function onInput(e) { if (e.target.id === 'gr-paste') S.paste = e.target.value; }
  function onKey(e) {
    if (e.key === 'Escape') { if (S.hist) { S.hist = null; render(); } else close(); e.stopPropagation(); return; }
    var g = e.target.getAttribute && e.target.getAttribute('data-g');
    if (e.key === 'Enter' && g && g.indexOf('raw|') === 0) {
      e.preventDefault();
      var a = g.split('|'), st = roster(S.cls), i = st.map(function (s) { return s.seat; }).indexOf(+a[2]);
      if (commitRaw(e.target) && st[i + 1]) { var nx = document.querySelector('#v106-gr [data-g="raw|' + a[1] + '|' + st[i + 1].seat + '"]'); if (nx) { nx.focus(); nx.select(); } }
    }
    if (e.key === 'Enter' && e.target.id === 'gr-pw') { var p = e.target.value; login(p, (document.getElementById('gr-rem') || {}).checked); }
    e.stopPropagation();   /* 不讓 ←→ 觸發課文換頁 */
  }

  /* 「班級進度」面板加入口（放在日曆按鈕下方） */
  function addBtn() {
    var p = document.getElementById('cls-panel'); if (!p || document.getElementById('v106-open')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'v106-open'; b.textContent = '📒 成績登記／課堂加減分';
    b.onclick = function () { open(); };
    var cal = document.getElementById('v98-open'), head = p.querySelector('.cls-head');
    var ref = cal ? cal.nextSibling : (head ? head.nextSibling : p.firstChild);
    p.insertBefore(b, ref);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn();
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pend).length) { flush(); e.preventDefault(); e.returnValue = '還有成績尚未儲存'; return e.returnValue; } });

  /* 測試／除錯用介面（不含任何學生資料） */
  window.V106GR = { open: open, close: close, data: function () { return D; }, summary: summary, lateOf: lateOf, finalOf: finalOf,
    nextLesson: nextLesson, schoolDaysBetween: schoolDaysBetween, parsePaste: parsePaste, isDemo: isDemo };
})();
