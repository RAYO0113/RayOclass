
(function () {
  'use strict';
  /* ── 課表資料（可編輯）：115-1，依老師提供之課表圖片逐格輸入，不自行更動 ──
     使用者在「班級進度 → 課表」改過的版本存於 localStorage 'tp_schedule_v1'，優先使用。 */
  var DEFAULT_SCHEDULE = {
    term: '115-1', termStart: '2026-09-01', termEnd: '2027-01-20',
    periods: [
      { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' },
      { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
      { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' },
      { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }
    ],
    slots: [
      { wd:1, p:1, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:1, p:2, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:1, p:3, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:1, p:5, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:2, p:5, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:2, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:3, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:4, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:4, p:1, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:4, p:3, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:4, p:5, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:1, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:2, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:5, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:6, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:7, cls:'建一孝', lesson:'', normal:true, note:'' }
    ]
  };
  var K = { live:'tp_live_v1', hist:'tp_hist_v1', ovr:'tp_override_v1', sched:'tp_schedule_v1', prep:'tp_prep_v1', on:'tp_enabled_v1' };
  var PRE = 10, POST = 5;           /* 上課前 10 分鐘算下一節；下課後 5 分鐘內仍算同一節 */
  var WD = ['日','一','二','三','四','五','六'];
  var V = window.V82 = { restoring:false, exporting:false };

  /* ── 基本工具 ── */
  function get(k, def) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : def; } catch (e) { return def; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function now() {
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  /* 測試用：V82.fakeNow('2026-09-30T09:15') 模擬時間（只存在此分頁 sessionStorage）；V82.fakeNow(null) 取消 */
  V.fakeNow = function (s) {
    try { if (!s) sessionStorage.removeItem('v82FakeNow'); else sessionStorage.setItem('v82FakeNow', JSON.stringify({ t: new Date(s).getTime(), set: Date.now() })); } catch (e) {}
    tick();
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toMin(s) { var a = String(s).split(':'); return (+a[0]) * 60 + (+a[1]); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function clsList() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }

  function schedule() { var s = get(K.sched, null); return (s && s.periods && s.slots) ? s : DEFAULT_SCHEDULE; }
  function isPrep() { return get(K.prep, '') === ymd(now()); }
  /* v83：只有在本裝置按過「啟用自動記錄」才運作（localStorage 'tp_enabled_v1'='1'） */
  function isOn() { return get(K.on, '') === '1'; }
  function loadLive() { return get(K.live, null); }
  function saveLive(l) { put(K.live, l); }
  function loadHist() { var h = get(K.hist, []); return Array.isArray(h) ? h : []; }

  /* ── 判斷目前節次／班級 ── */
  function slotsAt(d) {
    var S = schedule(), date = ymd(d), wd = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    var tS = S.termStart || DEFAULT_SCHEDULE.termStart, tE = S.termEnd || DEFAULT_SCHEDULE.termEnd; /* v86：自訂課表沒填起訖時沿用預設 */
    if (tS && date < tS) return [];
    if (tE && date > tE) return [];
    var ovr = get(K.ovr, {});
    return S.periods.filter(function (P) { return m >= toMin(P.start) - PRE && m <= toMin(P.end) + POST; })
      .map(function (P) {
        var key = date + '|' + P.p;
        var sl = S.slots.filter(function (x) { return x.wd === wd && x.p === P.p && x.normal !== false; })[0] || null;
        var o = ovr[key] || null;
        return { key:key, date:date, weekday:wd, period:P.p, start:P.start, end:P.end,
          scheduled: sl ? sl.cls : '', cls: o ? o.cls : (sl ? sl.cls : ''), source: o ? 'manual' : 'schedule',
          lesson: (o && o.lesson) || (sl && sl.lesson) || '', inCore: m >= toMin(P.start) && m <= toMin(P.end) };
      });
  }
  function currentSlot(d) {
    var c = slotsAt(d || now());
    if (!c.length) return null;
    var live = loadLive();
    if (live) { var hit = c.filter(function (x) { return x.key === live.key && x.cls; })[0]; if (hit) return hit; }
    var withCls = c.filter(function (x) { return x.cls; });
    if (withCls.length) return withCls[withCls.length - 1];
    var core = c.filter(function (x) { return x.inCore; });
    return core[0] || c[c.length - 1];
  }
  V.currentSlot = function () { return currentSlot(); };

  /* ── 上課 session：即時暫存（tp_live_v1）＋下課結算（tp_hist_v1） ── */
  function newLive(cur, d) {
    return { v:1, id: cur.key + '|' + d.getTime().toString(36), key: cur.key, date: cur.date, weekday: cur.weekday,
      period: cur.period, startTime: cur.start, endTime: cur.end, classId: cur.cls, classSource: cur.source,
      scheduledClassId: cur.scheduled, actualStartTime: d.toISOString(), lastAt: d.toISOString(), lessonId: '', parts: {} };
  }
  /* v100：下課鐘響後（同一天、已過本節結束時間）不再自動記錄 */
  function afterBell(live) {
    var d = now(); if (!live || !live.endTime || ymd(d) !== live.date) return false;
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 >= toMin(live.endTime);
  }
  /* v100：可手動更新的對象＝已下課的本節 session，或今天下課 30 分鐘內的正式紀錄 */
  function manualTarget() {
    var live = loadLive(), d = now();
    if (live) return afterBell(live) ? { live: true, rec: live } : null;
    var t = ymd(d), m = d.getHours() * 60 + d.getMinutes();
    var h = loadHist().filter(function (r) { return r.date === t && r.endTime && m >= toMin(r.endTime) && m <= toMin(r.endTime) + 30; });
    h.sort(function (a, b) { return toMin(b.endTime) - toMin(a.endTime); });
    return h[0] ? { live: false, rec: h[0] } : null;
  }
  function finalize(live) {
    if (live && live.parts && Object.keys(live.parts).length && live.lessonId) {
      var main = live.parts[live.lessonId];
      var t0 = new Date(live.actualStartTime), t1 = new Date(live.lastAt);
      var rec = { v:1, id: live.id, date: live.date, weekday: live.weekday, period: live.period,
        classId: live.classId, classSource: live.classSource, scheduledClassId: live.scheduledClassId,
        lessonId: live.lessonId, startTime: live.startTime, endTime: live.endTime,
        actualStartTime: hm(t0), actualEndTime: hm(t1), duration: Math.max(0, Math.round((t1 - t0) / 60000)),
        startProgress: main.start, endProgress: main.last || main.max, maxProgress: main.max, lastPosition: main.last, parts: live.parts, manualAt: live.manualAt };
      var h = loadHist();
      if (!h.some(function (r) { return r.id === rec.id; })) { h.push(rec); put(K.hist, h); }
    }
    put(K.live, null);
  }
  function ensureLive() {
    if (!isOn()) return null;
    var d = now(), live = loadLive(), cur = currentSlot(d);
    if (live && (!cur || cur.key !== live.key)) { finalize(live); live = null; }
    if (!cur || !cur.cls || isPrep()) return live && cur && cur.key === live.key ? live : null;
    if (!live) { live = newLive(cur, d); saveLive(live); }
    else if (live.classId !== cur.cls || live.classSource !== cur.source) {
      live.classId = cur.cls; live.classSource = cur.source; saveLive(live);
    }
    return live;
  }
  function tick() { ensureLive(); renderChip(); }
  V.tick = tick;

  /* ── 進度定位：用既有課文結構（段落名＋段內句序），不用捲動或 DOM 順序 ── */
  function plain(t) {
    var s = String(t || ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/<[^>]*>/g, '').replace(/[‹›]/g, '').replace(/\s+/g, '');
  }
  function headOf(t) { return plain(t).slice(0, 8); }
  function firstOrd(k, seg) {
    var P = (TEXTBOOK[k] && TEXTBOOK[k].textPages) || [], n = 0;
    for (var i = 0; i < P.length; i++) { if (P[i].seg === seg) return n + 1; n += (P[i].lines || []).length; }
    return 0;
  }
  function sigBase(s) { return s.type + '|' + (s.kind || '') + '|' + (s.label || s.title || (s.L && s.L.sec) || ''); }
  function slideSig(slides, i) {
    var s = slides[i]; if (!s) return '';
    if (s.type === 'textpage' && s.page) return 'tp:' + s.page.seg;
    var b = sigBase(s), n = 0;
    for (var j = 0; j < i; j++) if (sigBase(slides[j]) === b) n++;
    return b + '#' + n;
  }
  function sectionLabel(i) {
    var sec = null;
    (wkSectionMap || []).forEach(function (s) { if (s.idx <= i) sec = s; });
    if (!sec) return '';
    var lb = String(sec.label || '').replace(/^[▶◉✎◆§▸\s]+/, '');
    return i > sec.idx ? lb + ' 第' + (i - sec.idx + 1) + '頁' : lb;
  }
  function pagePos() {
    if (typeof wkKey === 'undefined' || !wkKey || !wkSlides || !wkSlides[wkIdx]) return null;
    var s = wkSlides[wkIdx];
    if (s.type === 'cover') return null;
    var p = { k: wkKey, sid: slideSig(wkSlides, wkIdx), idx: wkIdx, lbl: sectionLabel(wkIdx) };
    if (s.type === 'textpage' && s.page) { p.seg = s.page.seg; p.lbl = s.page.seg; p.r = firstOrd(wkKey, s.page.seg); }
    return p;
  }
  function linePos(li) {
    var p = pagePos(); if (!p || !p.seg) return null;
    var L = (wkSlides[wkIdx].page.lines || [])[li]; if (!L) return null;
    p.li = li; p.ord = p.r + li; p.r = p.ord; p.head = headOf(L.text); p.lbl = '第' + p.ord + '句';
    return p;
  }
  function posText(p) { if (!p) return ''; return p.ord ? '第' + p.ord + '句' : (p.lbl || ''); }
  function rangeText(part) {
    var a = part.start, b = part.last || part.max;   /* v100：範圍＝起點 → 下課時停的位置 */
    if (a && b && a.ord && b.ord) return a.ord === b.ord ? '第' + a.ord + '句' : '第' + a.ord + '～' + b.ord + '句';
    var ta = posText(a), tb = posText(b);
    return ta === tb ? ta : ta + ' → ' + tb;
  }
  /* v100：下次從「下課時停的位置」繼續（老師 10/1：不小心點到後面段落會被推過去，改用最後位置；另可選最近三筆） */
  function resumePos(part) { return part.last || part.max; }
  V.posText = posText; V.rangeText = rangeText; V.resumePos = resumePos;

  var savedTimer = 0;
  function record(pos) {
    if (pos && !V.restoring) V.lastSeen = pos;   /* v100：記住目前位置，供「手動更新」使用 */
    if (!pos || V.restoring || isPrep()) return;
    var live = ensureLive(); if (!live) return;
    if (afterBell(live)) { renderChip(); return; }   /* v100：下課後不自動記錄 */
    var t = now().toISOString();
    var part = live.parts[pos.k];
    if (!part) part = live.parts[pos.k] = { start: pos, max: pos.r ? pos : null, last: pos, firstAt: t, lastAt: t };
    else {
      /* 剛翻到某段、尚未點句子就點了該段的句子 → 起點精確到這一句 */
      if (pos.li != null && part.start.li == null && part.start.sid === pos.sid && part.last.sid === pos.sid && part.last.li == null) part.start = pos;
      part.last = pos; part.lastAt = t;
      if (pos.r && (!part.max || !part.max.r || pos.r > part.max.r)) part.max = pos;
    }
    live.lessonId = pos.k; live.lastAt = t;
    saveLive(live);
    renderChip();
    var ok = document.getElementById('v82-chip-ok');
    if (ok) { ok.classList.add('on'); clearTimeout(savedTimer); savedTimer = setTimeout(function () { ok.classList.remove('on'); }, 1800); }
  }
  function onPage() {
    if (V.restoring) return;
    var p = pagePos(); if (!p) return;
    var live = loadLive(), part = live && live.parts && live.parts[p.k];
    if (part && part.last && part.last.sid === p.sid && part.last.li != null) return; /* 同頁重繪：保留句子層級進度 */
    record(p);
  }

  /* ── 恢復進度 ── */
  function findIdx(pos) {
    for (var i = 0; i < wkSlides.length; i++) if (slideSig(wkSlides, i) === pos.sid) return i;
    if (pos.seg) for (var j = 0; j < wkSlides.length; j++) if (wkSlides[j].type === 'textpage' && wkSlides[j].page.seg === pos.seg) return j;
    return Math.max(0, Math.min(pos.idx || 0, wkSlides.length - 1));
  }
  function fixLine(pos, idx) {
    var s = wkSlides[idx]; if (!s || s.type !== 'textpage' || pos.li == null) return pos.li;
    var lines = s.page.lines || [];
    if (!pos.head || (lines[pos.li] && headOf(lines[pos.li].text) === pos.head)) return pos.li;
    for (var i = 0; i < lines.length; i++) if (headOf(lines[i].text) === pos.head) return i;
    return Math.min(pos.li, lines.length - 1);
  }
  function restore(pos) {
    if (!pos || !TEXTBOOK[pos.k]) return false;
    V.restoring = true;
    var idx, li;
    try {
      if (wkKey !== pos.k) showWenxue(pos.k);
      idx = findIdx(pos); li = fixLine(pos, idx);
      wkGoto(idx);
    } finally { V.restoring = false; }
    setTimeout(function () {
      if (li == null) return;
      var root = (wkProjMode && document.getElementById('wkfs-body')) || document.getElementById('wk-slide-area');
      var ln = root && root.querySelector('.tp-line[data-li="' + li + '"]');
      if (ln) {
        ln.scrollIntoView({ block:'center' });
        ln.classList.add('v82-flash');
        setTimeout(function () { ln.classList.remove('v82-flash'); }, 1800);
      }
    }, 150);
    return true;
  }

  /* ── 班級進度查詢（正式紀錄＋本節即時 session，依 classId+lessonId 分開） ── */
  function entries(cls) {
    var out = [];
    loadHist().forEach(function (r) {
      if (r.classId !== cls) return;
      Object.keys(r.parts || {}).forEach(function (k) { out.push({ rec: r, k: k, part: r.parts[k], live: false }); });
    });
    var live = loadLive();
    if (live && live.classId === cls) Object.keys(live.parts || {}).forEach(function (k) { out.push({ rec: live, k: k, part: live.parts[k], live: true }); });
    out.sort(function (a, b) { return String(b.part.lastAt).localeCompare(String(a.part.lastAt)); });
    return out;
  }
  function lastFor(cls, lesson) {
    var e = entries(cls).filter(function (x) { return !lesson || x.k === lesson; });
    return e[0] || null;
  }
  V.lastFor = lastFor;
  /* v100：手動更新（晚下課時用）：把目前位置記到剛下課那一節 */
  V.manualUpdate = function () {
    var mt = manualTarget(), pos = V.lastSeen || pagePos();
    if (!mt) { alert('目前沒有剛下課的節次可以更新。'); return; }
    if (!pos) { alert('請先打開課文，點一下要記錄的那一句。'); return; }
    var r = mt.rec, t = now().toISOString();
    if (!confirm('把「' + r.classId + '・第' + r.period + '節」的上課進度更新為：\n' + pos.k + ' ' + posText(pos) + '？')) return;
    var part = r.parts[pos.k];
    if (!part) part = r.parts[pos.k] = { start: pos, max: pos.r ? pos : null, last: pos, firstAt: t, lastAt: t };
    else { part.last = pos; part.lastAt = t; if (pos.r && (!part.max || !part.max.r || pos.r > part.max.r)) part.max = pos; }
    r.manualAt = t;
    if (mt.live) { r.lessonId = pos.k; r.lastAt = t; saveLive(r); }
    else {
      if (r.lessonId !== pos.k) r.startProgress = part.start;
      r.lessonId = pos.k; r.endProgress = part.last; r.lastPosition = part.last; r.maxProgress = part.max; r.actualEndTime = hm(now());
      put(K.hist, loadHist().map(function (x) { return x.id === r.id ? r : x; }));
    }
    renderChip(); if (typeof clsRender === 'function') clsRender();
  };
  /* v100：最近三筆（同班同課）可選擇從哪一筆繼續 */
  function top3(cls, lesson) { return entries(cls).filter(function (x) { return x.k === lesson; }).slice(0, 3); }
  function closeMenu() { var m = document.getElementById('v100-rmenu'); if (m) m.remove(); }
  V.resumeEntry = function (cls, lesson, i) {
    var e = top3(cls, lesson)[i || 0]; if (!e) return;
    closeMenu();
    var panel = document.getElementById('cls-panel');
    if (panel && panel.classList.contains('open')) clsToggle();
    var p = resumePos(e.part);
    restore(p);
    record(p);
  };
  V.pickResume = function (cls, lesson, anchor) {
    var list = top3(cls, lesson);
    if (list.length <= 1) { V.resumeEntry(cls, lesson, 0); return; }
    closeMenu();
    var m = document.createElement('div'); m.id = 'v100-rmenu';
    m.innerHTML = '<div class="v100-rh">' + esc(cls) + '・' + esc(lesson.split('—')[0]) + '：從哪一次繼續？</div>' + list.map(function (e, i) {
      return '<button type="button" data-i="' + i + '">' + fmtDate(e.rec) + ' 第' + e.rec.period + '節 → ' + esc(posText(resumePos(e.part))) +
        (i === 0 ? '<small>最近一次</small>' : '') + (e.rec.manualAt ? '<small>手動更新</small>' : '') + '</button>';
    }).join('');
    m.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var b = ev.target.closest && ev.target.closest('button[data-i]'); if (b) V.resumeEntry(cls, lesson, +b.getAttribute('data-i'));
    });
    document.body.appendChild(m);
    var r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: 12, top: innerHeight - 40 };
    m.style.left = Math.max(8, Math.min(r.left, innerWidth - m.offsetWidth - 8)) + 'px';
    m.style.top = Math.max(8, r.top - m.offsetHeight - 6) + 'px';
    setTimeout(function () { document.addEventListener('click', closeMenu, { once: true }); }, 0);
  };
  V.resume = function (cls, lesson) {
    var e = lastFor(cls, lesson); if (!e) return;
    var panel = document.getElementById('cls-panel');
    if (panel && panel.classList.contains('open')) clsToggle();
    var p = resumePos(e.part);
    restore(p);
    record(p);
  };

  /* ── 小狀態列（投影全螢幕時隱藏） ── */
  var chipGo = null;
  function renderChip() {
    var chip = document.getElementById('v82-chip');
    if (!isOn()) { if (chip) chip.remove(); return; }
    if (!chip) {
      chip = document.createElement('div'); chip.id = 'v82-chip';
      chip.innerHTML = '<span class="v82-dot"></span><span id="v82-chip-t"></span><span id="v82-chip-ok">✓ 已自動保存</span>' +
        '<button type="button" class="v82-go" style="display:none">繼續上課 ▸</button>' +
        '<button type="button" class="v82-go v82-upd" style="display:none">手動更新</button>';
      chip.addEventListener('click', function () { V.openPanel(); });
      chip.querySelector('.v82-go').addEventListener('click', function (ev) {
        ev.stopPropagation(); if (chipGo) V.pickResume(chipGo.cls, chipGo.k, ev.currentTarget);
      });
      chip.querySelector('.v82-upd').addEventListener('click', function (ev) { ev.stopPropagation(); V.manualUpdate(); });
      document.body.appendChild(chip);
    }
    var t = document.getElementById('v82-chip-t'), btn = chip.querySelector('.v82-go'), cur = currentSlot(), live = loadLive();
    var cls = '', txt, go = null;
    if (isPrep()) { cls = 'prep'; txt = '備課模式（不記錄進度）'; }
    else if (!cur || !cur.cls) { var mt0 = manualTarget(); txt = mt0 ? mt0.rec.classId + '｜第' + mt0.rec.period + '節已下課' : '目前沒有排定課程'; }
    else {
      cls = 'live';
      var head = cur.cls + (cur.source === 'manual' ? '（調課）' : '') + '｜第' + cur.period + '節';
      if (live && live.key === cur.key && live.lessonId) txt = head + '｜' + live.lessonId + ' ' + posText(live.parts[live.lessonId].last) + (afterBell(live) ? '｜已下課' : '');
      else {
        var e = lastFor(cur.cls, cur.lesson);
        txt = head + (e ? '｜上次：' + e.k + ' ' + posText(resumePos(e.part)) : '');
        if (e) go = { cls: cur.cls, k: e.k };
      }
    }
    /* 內容沒變就不動 DOM，避免老師正要點按鈕時被重畫 */
    if (chip.className !== cls) chip.className = cls;
    if (t.textContent !== txt) t.textContent = txt;
    chipGo = go;
    var disp = go ? '' : 'none';
    if (btn.style.display !== disp) btn.style.display = disp;
    var ub = chip.querySelector('.v82-upd'), ud = (!isPrep() && manualTarget()) ? '' : 'none';
    if (ub && ub.style.display !== ud) ub.style.display = ud;
  }

  /* ── 班級進度面板：今日上課／調課／備課模式／課表／各班自動進度 ── */
  V.openPanel = function () {
    var cur = currentSlot();
    if (cur && cur.cls && typeof clsPick === 'function') clsCur = cur.cls;
    var panel = document.getElementById('cls-panel');
    if (panel && !panel.classList.contains('open')) clsToggle(); else if (typeof clsRender === 'function') clsRender();
  };
  V.enable = function () { put(K.on, '1'); tick(); if (typeof clsRender === 'function') clsRender(); };
  V.disable = function () {
    if (!confirm('停用後這台裝置不再自動記錄上課進度（已有的紀錄會保留，重新啟用即可看到）。確定停用？')) return;
    put(K.on, null); tick(); if (typeof clsRender === 'function') clsRender();
  };
  V.togglePrep = function () { put(K.prep, isPrep() ? null : ymd(now())); tick(); renderBox(); };
  V.setOverride = function (cls) {
    var cur = currentSlot(); if (!cur) return;
    var o = get(K.ovr, {});
    if (!cls) delete o[cur.key]; else o[cur.key] = { cls: cls, at: now().toISOString() };
    put(K.ovr, o);
    if (typeof clsCur !== 'undefined') clsCur = cls || cur.scheduled || clsCur;
    tick(); renderBox(); if (typeof clsRender === 'function') clsRender();
  };
  var schedOpen = false, schedEdit = false;
  V.toggleSched = function () { schedOpen = !schedOpen; renderBox(); };
  V.toggleSchedEdit = function () { schedEdit = !schedEdit; renderBox(); };
  V.setCell = function (wd, p, cls) {
    var S = JSON.parse(JSON.stringify(schedule()));
    S.slots = S.slots.filter(function (x) { return !(x.wd === wd && x.p === p); });
    if (cls) S.slots.push({ wd: wd, p: p, cls: cls, lesson: '', normal: true, note: '' });
    S.slots.sort(function (a, b) { return a.wd - b.wd || a.p - b.p; });
    put(K.sched, S); tick(); renderBox();
  };
  V.resetSched = function () { if (confirm('確定還原成預設課表？（調課紀錄與上課紀錄不受影響）')) { put(K.sched, null); tick(); renderBox(); } };

  function schedHTML(cur) {
    var S = schedule(), d = now();
    var h = '<table><tr><th>節</th>' + [1,2,3,4,5].map(function (w) { return '<th>' + WD[w] + '</th>'; }).join('') + '</tr>';
    S.periods.forEach(function (P) {
      h += '<tr><th>' + P.p + '<br><small>' + P.start + '</small></th>';
      [1,2,3,4,5].forEach(function (w) {
        var sl = S.slots.filter(function (x) { return x.wd === w && x.p === P.p; })[0];
        var isNow = cur && cur.weekday === w && cur.period === P.p && d.getDay() === w;
        var cell = sl ? esc(sl.cls) : '';
        if (schedEdit) cell = '<select onchange="V82.setCell(' + w + ',' + P.p + ',this.value)"><option value=""></option>' +
          clsList().map(function (c) { return '<option' + (sl && sl.cls === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>';
        h += '<td' + (isNow ? ' class="v82-now-cell"' : '') + '>' + cell + '</td>';
      });
      h += '</tr>';
    });
    return h + '</table>';
  }
  function renderBox() {
    var panel = document.getElementById('cls-panel'); if (!panel) return;
    var box = document.getElementById('v82-box');
    if (!box) {
      box = document.createElement('div'); box.id = 'v82-box';
      var head = panel.querySelector('.cls-head');
      panel.insertBefore(box, head ? head.nextSibling : panel.firstChild);
    }
    if (!isOn()) {
      box.innerHTML = '<div class="v82-row"><button type="button" onclick="V82.enable()">啟用自動記錄上課進度（本裝置）</button></div>' +
        '<div class="v82-sub">依課表自動判斷班級並記住教到哪一句。只影響這台裝置的這個瀏覽器；其他老師的裝置不受影響。</div>';
      return;
    }
    var cur = currentSlot(), prep = isPrep(), d = now();
    var st;
    if (!cur) st = '今天週' + WD[d.getDay()] + ' ' + hm(d) + '：目前沒有排定課程';
    else st = '週' + WD[cur.weekday] + ' 第' + cur.period + '節（' + cur.start + '～' + cur.end + '）：' +
      (cur.cls ? cur.cls + (cur.source === 'manual' ? '（調課，原課表：' + (cur.scheduled || '無') + '）' : '') : '課表無課');
    var sel = '';
    if (cur) {
      sel = '<label>本節改為 <select onchange="V82.setOverride(this.value)"><option value="">依課表（' + esc(cur.scheduled || '無課') + '）</option>' +
        clsList().map(function (c) { return '<option' + (cur.source === 'manual' && cur.cls === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>';
    }
    box.innerHTML = '<div class="v82-now">' + esc(st) + '</div>' +
      '<div class="v82-row">' + sel + (manualTarget() ? '<button type="button" onclick="V82.manualUpdate()">手動更新進度</button>' : '') +
      '<button type="button" class="' + (prep ? 'on' : '') + '" onclick="V82.togglePrep()">備課模式：' + (prep ? '開（今天不記錄）' : '關') + '</button>' +
      '<button type="button" onclick="V82.toggleSched()">' + (schedOpen ? '收起課表' : '課表') + '</button>' +
      '<button type="button" onclick="V82.disable()">本裝置停用</button></div>' +
      (cur ? '' : '<div class="v82-sub">非上課時間可正常使用網站，不會產生上課紀錄。</div>') +
      (schedOpen ? '<div id="v82-sched">' + schedHTML(cur) +
        '<div class="v82-row" style="margin-top:6px"><button type="button" onclick="V82.toggleSchedEdit()">' + (schedEdit ? '完成編輯' : '編輯課表') + '</button>' +
        '<button type="button" onclick="V82.resetSched()">還原預設課表</button></div>' +
        '<div class="v82-sub">「本節改為」只影響這一節（調課）；「編輯課表」會改變之後每週的課表。</div></div>' : '');
  }
  function fmtDate(r) { var a = String(r.date).split('-'); return (+a[1]) + '/' + (+a[2]) + '（' + WD[r.weekday] + '）'; }
  V.delRec = function (id) {
    if (!confirm('確定刪除這一筆自動上課紀錄？')) return;
    put(K.hist, loadHist().filter(function (r) { return r.id !== id; }));
    if (typeof clsRender === 'function') clsRender();
  };
  function renderClsAuto() {
    var panel = document.getElementById('cls-panel'); if (!panel || typeof clsCur === 'undefined') return;
    var el = document.getElementById('v82-cls-auto');
    if (!isOn()) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'v82-cls-auto';
      var tabs = document.getElementById('cls-tabs');
      if (tabs) tabs.parentNode.insertBefore(el, tabs.nextSibling); else panel.appendChild(el);
    }
    var ents = entries(clsCur), by = {}, order = [];
    ents.forEach(function (e) { if (!by[e.k]) { by[e.k] = []; order.push(e.k); } by[e.k].push(e); });
    var h = '<div class="v82-h">' + esc(clsCur) + '・自動上課進度</div>';
    if (!order.length) h += '<div class="v82-empty">尚無自動紀錄（上課時間開啟課文後會自動記錄）</div>';
    order.forEach(function (k) {
      var list = by[k], last = list[0];
      h += '<div class="v82-les"><div class="v82-les-h"><span>《' + esc(k) + '》</span>' +
        '<button type="button" onclick="V82.pickResume(' + esc(JSON.stringify(clsCur)) + ',' + esc(JSON.stringify(k)) + ',this)">繼續上課</button></div>' +
        '<div>最近一次：' + fmtDate(last.rec) + ' 第' + last.rec.period + '節　上到：' + esc(posText(resumePos(last.part))) +
        (last.live ? '<span class="v82-live">本節進行中</span>' : '') + '</div><ul>' +
        list.slice(0, 12).map(function (e, i) {
          return (i === 3 ? '</ul><details class="v100-older"><summary>更早的紀錄（' + (Math.min(list.length, 12) - 3) + '）</summary><ul>' : '') +
            '<li>' + fmtDate(e.rec) + ' 第' + e.rec.period + '節 → ' + esc(rangeText(e.part)) +
            (e.rec.manualAt ? '<span class="v82-tag">手動更新</span>' : '') +
            (i < 3 ? '<button type="button" class="v100-from" onclick="V82.resumeEntry(' + esc(JSON.stringify(clsCur)) + ',' + esc(JSON.stringify(k)) + ',' + i + ')">從這繼續</button>' : '') +
            (e.rec.classSource === 'manual' ? '<span class="v82-tag">調課</span>' : '') +
            (e.live ? '<span class="v82-live">進行中</span>' : '<button type="button" class="v82-del" onclick="V82.delRec(' + esc(JSON.stringify(e.rec.id)) + ')">✕</button>') + '</li>';
        }).join('') + '</ul>' + (list.length > 3 ? '</details>' : '') + '</div>';
    });
    el.innerHTML = h;
  }

  /* ── 掛勾（包裝既有函式，不改寫原本內容） ── */
  var _v82cur = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v82cur.apply(this, arguments); try { onPage(); } catch (e) {} return r; };
  var _v82open = wkOpenProj;
  wkOpenProj = function () { document.body.classList.add('v82-proj'); return _v82open.apply(this, arguments); };
  var _v82close = wkCloseProj;
  wkCloseProj = function () { var r = _v82close.apply(this, arguments); document.body.classList.remove('v82-proj'); return r; };
  var _v82render = clsRender;
  clsRender = function () { var r = _v82render.apply(this, arguments); try { renderBox(); renderClsAuto(); } catch (e) {} return r; };
  /* 備份：匯出時附帶 __v82（上課紀錄／調課／自訂課表）；匯入時合併紀錄，不覆蓋既有歷史 */
  var _v82load = clsLoad;
  clsLoad = function () {
    var d = _v82load.apply(this, arguments);
    if (V.exporting) d.__v82 = { hist: loadHist(), ovr: get(K.ovr, {}), sched: get(K.sched, null) };
    return d;
  };
  var _v82exp = clsExport;
  clsExport = function () { V.exporting = true; try { return _v82exp.apply(this, arguments); } finally { V.exporting = false; } };
  var _v82save = clsSave;
  clsSave = function (d) {
    if (d && d.__v82) {
      var x = d.__v82; delete d.__v82;
      var h = loadHist(), ids = {};
      h.forEach(function (r) { ids[r.id] = 1; });
      (x.hist || []).forEach(function (r) { if (r && r.id && !ids[r.id]) h.push(r); });
      put(K.hist, h);
      var o = get(K.ovr, {}); Object.keys(x.ovr || {}).forEach(function (k) { if (!o[k]) o[k] = x.ovr[k]; }); put(K.ovr, o);
      if (x.sched && !get(K.sched, null)) put(K.sched, x.sched);
    }
    return _v82save.apply(this, arguments);
  };

  /* 點課文句子（含修辭／句意／翻譯／註釋按鈕）＝教到這一句 */
  document.addEventListener('click', function (e) {
    var ln = e.target && e.target.closest ? e.target.closest('.tp-line') : null;
    if (!ln || !ln.closest('#wk-slide-area, #wkfs-body')) return;
    var s = wkSlides && wkSlides[wkIdx]; if (!s || s.type !== 'textpage') return;
    var li = parseInt(ln.getAttribute('data-li'), 10); if (isNaN(li)) return;
    record(linePos(li));
  }, true);

  function boot() {
    tick();
    if (!isOn()) return;
    /* Safari 關閉／重新整理後：本節 session 仍在 → 自動回到最後位置 */
    var live = loadLive(), cur = currentSlot();
    if (live && cur && cur.key === live.key && live.lessonId && !isPrep()) {
      var part = live.parts[live.lessonId];
      if (part && part.last) restore(part.last);
    }
  }
  window.addEventListener('load', function () { setTimeout(boot, 300); });
  setInterval(tick, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  window.addEventListener('pageshow', function () { tick(); });
})();
