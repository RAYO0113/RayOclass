
(function () {
  /* ── 115-1 學校行事（老師 10/1 提供；下學期換這份清單即可） ── */
  var EVENTS = [
    { from: '2026-10-09', t: '國慶日放假', c: 'off' },
    { from: '2026-10-14', to: '2026-10-16', t: '第一次段考', c: 'exam' },
    { from: '2026-10-26', t: '光復節放假', c: 'off' },
    { from: '2026-11-24', to: '2026-11-26', t: '第二次段考', c: 'exam' },
    { from: '2026-12-04', t: '校慶', c: 'event' },
    { from: '2026-12-07', t: '校慶補假', c: 'off' },
    { from: '2026-12-25', t: '行憲紀念日放假', c: 'off' },
    { from: '2027-01-01', t: '元旦放假', c: 'off' },
    { from: '2027-01-18', to: '2027-01-19', t: '第三次段考', c: 'exam' },
    { from: '2027-01-20', t: '休業式（補考）', c: 'event' }
  ];
  function evOn(d) { return EVENTS.filter(function (e) { return d >= e.from && d <= (e.to || e.from); }); }
  window.V101 = { events: EVENTS, eventsOn: evOn };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }

  /* ── 日曆：格子顯示行事；編輯區顯示行事＋「補登已完成」勾選 ── */
  var pastDone = true, busy = false;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? (c.getAttribute('data-v98') || '').slice(2) : ''; }
  function deco() {
    if (busy) return; busy = true;
    try {
      document.querySelectorAll('#v98-cal .v98-d').forEach(function (c) {
        if (c.hasAttribute('data-v101')) return; c.setAttribute('data-v101', '1');
        var evs = evOn((c.getAttribute('data-v98') || '').slice(2)); if (!evs.length) return;
        var dn = c.querySelector('.v98-dn'), frag = evs.map(function (e) { return '<div class="v101-ev ' + e.c + '" title="' + esc(e.t) + '">' + esc(e.t) + '</div>'; }).join('');
        if (dn) dn.insertAdjacentHTML('afterend', frag);
        evs.forEach(function (e) { c.classList.add('v101-' + e.c); });
      });
      var ed = document.querySelector('#v98-cal .v98-ed'), sd = selDate();
      if (ed && sd && !ed.hasAttribute('data-v101')) {
        ed.setAttribute('data-v101', '1');
        var h4 = ed.querySelector('h4');
        evOn(sd).forEach(function (e) { if (h4) h4.insertAdjacentHTML('afterend', '<div class="v101-edev ' + e.c + '">📌 ' + esc(e.t) + '</div>'); });
        var add = ed.querySelector('.v98-add');
        if (add && sd < ymd(new Date())) add.insertAdjacentHTML('beforebegin',
          '<label class="v101-past"><input type="checkbox" id="v101-past"' + (pastDone ? ' checked' : '') + '> 已經考完／交了（補登為已完成）</label>');
      }
    } catch (e) {} finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var m = document.getElementById('v98-cal'); if (!m || m.__v101) { deco(); return; }
    m.__v101 = 1; mo.observe(m, { childList: true, subtree: true });
    m.addEventListener('change', function (e) { if (e.target.id === 'v101-past') pastDone = e.target.checked; });
    /* 補登：按「加入」前記下既有項目，加入後把新項目標為完成（日期已過且有勾選時） */
    m.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-v98="add"]'); if (!b || b.disabled) return;
      var sd = selDate(), cb = document.getElementById('v101-past');
      if (!sd || sd >= ymd(new Date()) || !cb || !cb.checked) return;
      var before = {}; (window.V98CAL ? V98CAL.data() : []).forEach(function (x) { before[x.id] = 1; });
      setTimeout(function () {
        V98CAL.data().filter(function (x) { return !before[x.id]; }).forEach(function (x) {
          if (window.V99LINK && !V99LINK.isDone(x)) V99LINK.toggle(x.id);
        });
      }, 0);
    }, true);
    deco();
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }

  /* ── 補登過去上課進度（寫入 V82 正式紀錄 tp_hist_v1，格式同自動紀錄） ── */
  var LESSONS = ['身為魚販', '世說新語選', '師說', '珍珠奶茶', '臺灣最美麗的火車線', '論語選—子路曾皙冉有公西華侍坐'];
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  /* 與 v82 plain()/headOf()/firstOrd() 相同算法，讓「繼續上課」找得回句子 */
  function plain(t) {
    var s = String(t || ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/<[^>]*>/g, '').replace(/[‹›]/g, '').replace(/\s+/g, '');
  }
  function pages(k) { return (typeof TEXTBOOK !== 'undefined' && TEXTBOOK[k] && TEXTBOOK[k].textPages) || []; }
  function firstOrd(k, seg) { var P = pages(k), n = 0; for (var i = 0; i < P.length; i++) { if (P[i].seg === seg) return n + 1; n += (P[i].lines || []).length; } return 0; }

  var F = { open: false, date: '', p: '', k: '', seg: '', li: '' };
  function periodsFor(cls, date) {
    var S = sched(), wd = date ? new Date(date + 'T12:00').getDay() : -1;
    var mine = S.slots.filter(function (x) { return x[0] === wd && x[2] === cls; }).map(function (x) { return x[1]; });
    return { all: S.periods, mine: mine };
  }
  function renderEntry() {
    var panel = document.getElementById('cls-panel'), auto = document.getElementById('v82-cls-auto');
    var el = document.getElementById('v101-entry');
    if (!panel || !auto || typeof clsCur === 'undefined') { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'v101-entry';
      el.addEventListener('click', function (e) {
        if (e.target.closest('.v101-h')) { F.open = !F.open; renderEntry(); }
        else if (e.target.closest('.v101-go')) save();
      });
      el.addEventListener('change', function (e) {
        var id = e.target.id; if (!/^v101-[a-z]+$/.test(id)) return;
        var f = id.slice(5); F[f] = e.target.value;
        if (f === 'date') F.p = '';
        if (f === 'k') { F.seg = ''; F.li = ''; }
        if (f === 'seg') F.li = '';
        renderEntry();
      });
      el.addEventListener('keydown', function (e) { e.stopPropagation(); });
    }
    if (el.previousElementSibling !== auto) auto.parentNode.insertBefore(el, auto.nextSibling);
    var cls = clsCur, h = '<div class="v101-h"><span>＋ 補登過去進度（' + esc(cls) + '）</span><i>' + (F.open ? '收起 ▾' : '展開 ▸') + '</i></div>';
    if (F.open) {
      if (!F.date) F.date = ymd(new Date());
      var pf = periodsFor(cls, F.date);
      if (!F.p) F.p = String(pf.mine[0] || '');
      var ks = LESSONS.filter(function (k) { return pages(k).length; });
      if (!F.k) F.k = (typeof wkKey !== 'undefined' && ks.indexOf(wkKey) >= 0) ? wkKey : ks[0];
      var P = pages(F.k);
      if (!F.seg && P[0]) F.seg = P[0].seg;
      var pg = P.filter(function (x) { return x.seg === F.seg; })[0] || { lines: [] }, r0 = firstOrd(F.k, F.seg);
      if (F.li === '' && pg.lines.length) F.li = '0';
      h += '<div class="v101-g"><span>日期</span><input type="date" id="v101-date" value="' + esc(F.date) + '">' +
        '<span>節次</span><select id="v101-p">' + pf.all.map(function (x) {
          return '<option value="' + x.p + '"' + (String(x.p) === F.p ? ' selected' : '') + '>第' + x.p + '節（' + x.start + '）' + (pf.mine.indexOf(x.p) >= 0 ? '★本班' : '') + '</option>'; }).join('') + '</select>' +
        '<span>課文</span><select id="v101-k">' + ks.map(function (k) { return '<option' + (k === F.k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>' +
        '<span>段落</span><select id="v101-seg">' + P.map(function (x) { return '<option' + (x.seg === F.seg ? ' selected' : '') + '>' + esc(x.seg) + '</option>'; }).join('') + '</select>' +
        '<span>上到</span><select id="v101-li">' + pg.lines.map(function (l, i) {
          return '<option value="' + i + '"' + (String(i) === F.li ? ' selected' : '') + '>第' + (r0 + i) + '句　' + esc(plain(l.text).slice(0, 12)) + '…</option>'; }).join('') + '</select></div>' +
        '<button type="button" class="v101-go">補登這一筆</button>' +
        '<div class="v101-note">★＝課表上本班這天的節次。補登後會出現在上面的進度清單，「繼續上課」可以接著上。</div>';
    }
    el.innerHTML = h;
  }
  function save() {
    var cls = clsCur, P = pages(F.k), pg = P.filter(function (x) { return x.seg === F.seg; })[0];
    var li = +F.li, L = pg && pg.lines[li];
    if (!F.date || !F.p || !L) { alert('請填好日期、節次、課文和句子。'); return; }
    var per = sched().periods.filter(function (x) { return String(x.p) === String(F.p); })[0] || { start: '', end: '' };
    var ord = firstOrd(F.k, F.seg) + li;
    var pos = { k: F.k, sid: 'tp:' + F.seg, idx: 0, lbl: '第' + ord + '句', seg: F.seg, r: ord, li: li, ord: ord, head: plain(L.text).slice(0, 8) };
    var h = get('tp_hist_v1', []); if (!Array.isArray(h)) h = [];
    var same = h.filter(function (r) { return r.date === F.date && String(r.period) === String(F.p) && r.classId === cls; });
    if (same.length && !confirm(cls + ' ' + F.date + ' 第' + F.p + '節已經有紀錄，要用這筆取代嗎？')) return;
    if (!same.length && !confirm('補登：' + cls + '　' + F.date + ' 第' + F.p + '節\n' + F.k + ' 上到 第' + ord + '句？')) return;
    h = h.filter(function (r) { return same.indexOf(r) < 0; });
    var at = new Date(F.date + 'T' + (per.end || '12:00')).toISOString();
    var part = {}; part[F.k] = { start: pos, max: pos, last: pos, firstAt: at, lastAt: at };
    h.push({ v: 1, id: 'entry|' + F.date + '|' + F.p + '|' + cls + '|' + Date.now().toString(36), date: F.date, weekday: new Date(F.date + 'T12:00').getDay(),
      period: +F.p, classId: cls, classSource: 'entry', scheduledClassId: cls, lessonId: F.k, startTime: per.start, endTime: per.end,
      actualStartTime: per.start, actualEndTime: per.end, duration: 0, startProgress: pos, endProgress: pos, maxProgress: pos, lastPosition: pos,
      parts: part, enteredAt: new Date().toISOString() });
    put('tp_hist_v1', h);
    if (window.V82 && V82.tick) V82.tick();
    if (typeof clsRender === 'function') clsRender();
  }
  var _v101render = clsRender;
  clsRender = function () { var r = _v101render.apply(this, arguments); try { renderEntry(); } catch (e) {} return r; };
})();
