/* V123 班級進度面板改版（2026-10-07，老師：太亂、找不到、風格要統一；山水圖當底）
   只搬位置、改外觀，不改既有模組的資料與存檔程式（例外：下面「自動打勾」會寫 hw_done_v1，見說明）。
   版面（每次 clsRender 之後重新歸位；已在正確位置就不動，避免輸入框失焦）：
     標題列：班級進度 ……［☁ 同步／備份］［✕］
     今天卡（山水底）：#v82-box（本節改為／繼續上課／備課模式；「課表」「本裝置停用」按鈕移到別處）
     常用工具：日曆（#v98-open）、成績（#v106-open）、小考紀錄（#v108-open）、重要進度檢核（#v84-hw）、課表／調課（課表＋#v122-swap）、📘 教學進度（#v114-cls）
     四班分頁（#cls-tabs）→ 課堂自動記錄：#v82-cls-auto＋#v101-entry＋時間線（日曆該班作業考試＋舊的手動紀錄 cls_records_v1）
     本裝置設定（收合）：啟用／停用自動記錄上課進度
   工具頁（.v123-sheet）蓋在面板上，「← 返回」回到面板；原本的入口按鈕藏在 #v123-hide 裡（點工具格＝點原按鈕）。
   自動打勾（重要進度檢核 hw_done_v1，鍵同 v84：{課名:{班:{'項目|階段':'日期'}}}）：
     - 日曆：A卷「考試」、A卷檢討／習作檢討／課後習題檢討，日期到了 → 該格記日曆日期
     - 成績系統：習作（類型＝習作）、課本後習題（名稱含「習題／基礎練習／進階練習」）有人登記繳交日 → 「交作業」格；A卷有人訂正加分 → 「訂正加分」格
     - 每格自動打過一次就記 '_a:項目|階段'＝來源，老師手動取消後不會再自動打回去
     - 只在本機已從雲端拉過資料（或沒登入同步）時寫入，避免舊資料蓋掉別台（同 v108／v109） */
(function () {
  'use strict';
  var HW = 'hw_done_v1', CAL = 'exam_cal_v1';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };   /* 同 v99 */
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';   /* 同 grade.js GS_URL */
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];   /* 同 V82 預設課表 */

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var d = parse(s); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）'; }
  function now() {
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function cur() { return typeof clsCur !== 'undefined' ? clsCur : ''; }
  function $(id) { return document.getElementById(id); }

  /* ════════ 自動打勾 ════════ */
  function pwd() { try { return sessionStorage.getItem('gr_pw_v1') || JSON.parse(localStorage.getItem('gr_pw_v1') || 'null') || ''; } catch (e) { return ''; } }
  function safe() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !pwd(); }
  function mark(hw, lesson, c, key, date, src) {
    var r = ((hw[lesson] = hw[lesson] || {})[c] = hw[lesson][c] || {});
    if (r[key] || r['_a:' + key] === src) return false;   /* 已打勾，或這個來源打過一次（老師取消過）就不再打 */
    r[key] = date; r['_a:' + key] = src;
    return true;
  }
  function fromCal(hw) {
    var t = ymd(now()), ch = false, a = get(CAL, []);
    (Array.isArray(a) ? a : []).forEach(function (e) {
      if (!e || !e.date || e.date > t || classes().indexOf(e.cls) < 0 || !e.lessons || !e.lessons.length) return;
      var key = e.kind === '考試' && e.item === 'A卷' ? 'A卷|考試' : /^(A卷|習作|課後習題)檢討$/.test(e.item) ? e.item.replace(/檢討$/, '') + '|檢討' : '';
      if (!key) return;
      e.lessons.forEach(function (n) { if (LK[n] && mark(hw, LK[n], e.cls, key, e.date, 'cal:' + e.id)) ch = true; });
    });
    return ch;
  }
  var GR = null, grAt = 0, grBusy = false;
  function grData() {
    try { var d = window.V106GR && V106GR.data && V106GR.data(); if (d && Array.isArray(d.items) && d.items.length) return d; } catch (e) {}
    return GR;
  }
  /* 成績系統資料：老師開過成績登記就直接用；沒開過、但這台記住了登記密碼，就讀一次（最多 5 分鐘一次，只讀不寫） */
  function fetchGr() {
    if (grBusy || Date.now() - grAt < 300000 || !pwd()) return;
    try { if (window.V106GR && V106GR.isDemo && V106GR.isDemo()) return; } catch (e) {}
    grBusy = true; grAt = Date.now();
    var url = get('gr_url_v1', '') || GS_URL;
    fetch(url, { method: 'POST', body: JSON.stringify({ action: 'load', pw: pwd() }), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok && r.admin) { GR = { items: r.items || [], scores: r.scores || [] }; autoCheck(); } })
      .catch(function () {}).then(function () { grBusy = false; });
  }
  function fromGr(hw) {
    var D = grData(); if (!D) return false;
    var ch = false, by = {};
    (D.scores || []).forEach(function (s) { (by[s.item] = by[s.item] || []).push(s); });
    (D.items || []).forEach(function (it) {
      if (!it || classes().indexOf(it.cls) < 0) return;
      var ls = String(it.lessons || '').split(',').map(Number).filter(function (n) { return LK[n]; }); if (!ls.length) return;
      var ss = by[it.id] || [], key = '', date = '';
      if (it.type === '習作' || /習題|基礎練習|進階練習/.test(it.title || '')) {   /* 課本後習題＝基礎練習＋進階練習 */
        key = (it.type === '習作' ? '習作' : '課後習題') + '|考試';
        ss.forEach(function (s) { var m = /^\d{4}-\d\d-\d\d/.exec(String(s.sub || '')); if (m && (!date || m[0] < date)) date = m[0]; });
      } else if (it.type === 'A卷') {
        key = 'A卷|訂正';
        ss.forEach(function (s) { if (+s.bonus > 0) { var m = /^\d{4}-\d\d-\d\d/.exec(String(s.upd || '')) ; var d = m ? m[0] : ymd(now()); if (!date || d < date) date = d; } });
      }
      if (!key || !date) return;
      ls.forEach(function (n) { if (mark(hw, LK[n], it.cls, key, date, 'gr:' + it.id)) ch = true; });
    });
    return ch;
  }
  function autoCheck() {
    if (!safe()) return;
    var hw = get(HW, {}); if (!hw || typeof hw !== 'object') hw = {};
    var a = fromCal(hw), b = fromGr(hw);
    if ((a || b) && put(HW, hw)) { try { if (window.V84HW) V84HW.render(); } catch (e) {} }
  }

  /* ════════ 版面 ════════ */
  var sheet = '', devOpen = false, schedEdit = false;
  var TOOLS = [
    ['cal', '📅', '日曆', '考試・作業'], ['gr', '📒', '成績', '登記・加減分'], ['nq', '📝', '小考紀錄', '訂正・給學生看'],
    ['hw', '✅', '重要進度檢核', '交作業・檢討'], ['sched', '🔁', '課表／調課', '預先調課'], ['plan', '📘', '教學進度', '老師專用'],
    ['stu', '🎓', '班級網站', '學生版・小老師頁']];
  var SHEETS = { hw: '✅ 重要進度檢核', sched: '🔁 課表／調課', plan: '📘 教學進度', stu: '🎓 班級網站／小老師頁', sync: '☁ 同步／備份' };

  /* 10/7：學生班級網站（stu115）的密碼——老師輸入一次，存在 stu_pw_v1（雲端同步，學生端 stuGet 讀不到），
     每台登入同步的老師裝置自動寫進解鎖頁「記住密碼」用的 stu_pw_<網址代碼>（同網域），點連結就直接打開。 */
  var STU_BASE = 'https://rayo0113.github.io/stu115/';
  var STU_SLUG = { '建一忠': 'c-ywkbbb', '建一孝': 'c-pnn3hs', '冷一忠': 'c-efexia', '冷一孝': 'c-g2jy3u' };   /* 同 scripts/stu_releases.json */
  var TUTOR_URL = 'https://rayo0113.github.io/RayOclass/t';
  function stuPw() { var o = get('stu_pw_v1', {}); return o && typeof o === 'object' ? o : {}; }
  function applyStuPw() {
    var o = stuPw();
    Object.keys(STU_SLUG).forEach(function (c) {
      if (!o[c]) return;
      try { if (localStorage.getItem('stu_pw_' + STU_SLUG[c]) !== o[c]) localStorage.setItem('stu_pw_' + STU_SLUG[c], o[c]); } catch (e) {}
    });
  }
  function renderStu(box) {
    var o = stuPw();
    box.innerHTML = '<div class="v123-card"><b>👩‍🏫 小老師登記頁</b><div class="v123-mut">用您的學校帳號開，會自動以「老師」身分登入，四個班都看得到。</div>' +
      '<a class="v123-pri v123-link" href="' + TUTOR_URL + '" target="_blank" rel="noopener">打開小老師頁</a></div>' +
      '<div class="v123-card"><b>🎓 學生班級網站</b><div class="v123-mut">密碼只要在任何一台輸入一次，雲端同步後每台老師裝置點下面的連結就直接打開（學生看不到這裡）。</div>' +
      Object.keys(STU_SLUG).map(function (c) {
        return '<div class="v123-stu"><span class="v123-stu-c">' + esc(c) + '</span>' +
          '<a href="' + STU_BASE + STU_SLUG[c] + '/" target="_blank" rel="noopener">打開</a>' +
          (o[c] ? '<span class="v123-ok">✓ 已記住</span><button type="button" data-v123p="clr|' + esc(c) + '">改</button>'
            : '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="輸入密碼" data-v123pw="' + esc(c) + '"><button type="button" data-v123p="save|' + esc(c) + '">記住</button>') + '</div>';
      }).join('') + '</div>';
  }

  function el(id, tag, cls) { var x = $(id); if (!x) { x = document.createElement(tag || 'div'); x.id = id; if (cls) x.className = cls; } return x; }
  function place(parent, list) {   /* 依序放進 parent；已在正確位置的不動 */
    var i = 0;
    list.forEach(function (x) { if (!x) return; if (parent.children[i] !== x) parent.insertBefore(x, parent.children[i] || null); i++; });
  }
  function syncState() { var b = $('v107-open'); var t = b ? (b.querySelector('.v107-st') || {}).textContent || '' : ''; return t.trim(); }

  function arrange() {
    var P = $('cls-panel'); if (!P) return;
    P.classList.add('v123');
    var head = P.querySelector('.cls-head'), tabs = $('cls-tabs');
    if (!head || !tabs) return;
    var t = head.querySelector('.cls-title'); if (t && t.textContent !== '班級進度') t.textContent = '班級進度';
    var sb = el('v123-syncbtn', 'button');
    if (!sb.parentNode) { sb.type = 'button'; sb.addEventListener('click', function () { openSheet('sync'); }); head.insertBefore(sb, head.querySelector('.cls-x')); }
    var st = syncState();
    sb.innerHTML = '☁ 同步／備份' + (st ? '<small>' + esc(st) + '</small>' : '');

    var nowCard = el('v123-now');
    var tools = el('v123-tools');
    if (!tools.__v123) { tools.__v123 = 1; tools.addEventListener('click', onTool); }
    tools.innerHTML = '<div class="v123-cap">常用工具</div><div class="v123-grid">' + TOOLS.map(function (x) {
      return '<button type="button" data-v123t="' + x[0] + '"><span class="v123-ic">' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small></button>';
    }).join('') + '</div>';
    var rec = el('v123-rec'), recHead = el('v123-rec-h'), tl = el('v123-tl');
    recHead.innerHTML = esc(cur()) + '・課堂自動記錄';
    renderTl(tl);
    var dev = el('v123-dev');
    if (!dev.__v123) { dev.__v123 = 1; dev.addEventListener('click', onDev); }
    renderDev(dev);
    var hide = el('v123-hide');

    place(P, [head, nowCard, tools, tabs, rec, dev, hide]);
    place(nowCard, [$('v82-box')]);
    place(rec, [recHead, $('v82-cls-auto'), $('v101-entry'), tl]);
    place(hide, [$('v98-open'), $('v106-open'), $('v108-open'), $('v107-open'), P.querySelector('.cls-form'), $('cls-list')]);

    /* 工具頁 */
    Object.keys(SHEETS).forEach(function (k) {
      var s = el('v123-sh-' + k, 'div', 'v123-sheet'), h = el('v123-sh-' + k + '-h', 'div', 'v123-sh-h'), body = el('v123-sh-' + k + '-b', 'div', 'v123-sh-b');
      if (!s.__v123) {
        s.__v123 = 1; s.setAttribute('data-k', k);
        h.innerHTML = '<button type="button" class="v123-back">← 返回</button><span>' + SHEETS[k] + '</span>';
        h.querySelector('.v123-back').addEventListener('click', closeSheet);
        s.addEventListener('click', onSheet); s.addEventListener('change', onSheetChange);
        s.addEventListener('keydown', function (e) { e.stopPropagation(); });   /* 打字時不要觸發投影翻頁快捷鍵 */
      }
      place(s, [h, body]);
      if (s.parentNode !== P) P.appendChild(s);
      s.classList.toggle('show', sheet === k);
    });
    place($('v123-sh-hw-b'), [$('v84-hw')]);
    var pills = el('v123-pills'); pills.innerHTML = classes().map(function (c) { return '<button type="button" data-v123c="' + esc(c) + '"' + (c === cur() ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('');
    place($('v123-sh-plan-b'), [pills, $('v114-cls')]);
    var sch = el('v123-sched'); renderSched(sch);
    place($('v123-sh-sched-b'), [$('v122-swap'), sch]);   /* 調課較常用，放上面 */
    var stb = el('v123-stu'); renderStu(stb); applyStuPw();
    place($('v123-sh-stu-b'), [stb]);
    var sy = el('v123-sync'); renderSync(sy);
    place($('v123-sh-sync-b'), [sy, P.querySelector('.cls-foot')]);
    if (sheet === 'sched' && window.V122SWAP) { var sw = $('v122-swap'); if (sw && sw.querySelector('[data-v122="tog"]') && !sw.querySelector('.v122-form')) sw.querySelector('[data-v122="tog"]').click(); }
  }

  function renderTl(box) {
    var c = cur(), t = ymd(now()), rows = [];
    var cal = get(CAL, []); cal = Array.isArray(cal) ? cal : [];
    cal.forEach(function (e) {
      if (!e || e.cls !== c || !e.date) return;
      var ls = (e.lessons || []).map(function (n) { return 'L' + n; }).join('、');
      rows.push({ d: e.date, tag: e.kind === '考試' ? '考試' : /檢討$/.test(e.item) ? '檢討' : '作業', t: String(e.item).replace('課後習題', '課本後習題') + (ls ? ' ' + ls : '') + (e.note ? '（' + e.note + '）' : ''), cal: 1 });
    });
    var mine = []; try { mine = (clsLoad() || {})[c] || []; } catch (e) {}
    mine.forEach(function (r, i) { if (r && r.d) rows.push({ d: r.d, tag: r.k || '紀錄', h: r.t, i: i }); });
    rows.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
    var next = rows.filter(function (r) { return r.d >= t; }), past = rows.filter(function (r) { return r.d < t; }).reverse();
    function row(r) {
      return '<li class="v123-tl-' + esc(r.tag) + '"><span class="v123-d">' + md(r.d) + '</span><span class="v123-tag">' + esc(r.tag) + '</span>' +
        '<span class="v123-tx">' + (r.cal ? esc(r.t) : r.h) + '</span>' +
        (r.cal ? '<button type="button" data-v123="cal" title="在日曆裡看">📅</button>' : '<button type="button" data-v123="del|' + r.i + '" title="刪除這筆">✕</button>') + '</li>';
    }
    var h = '<div class="v123-sub">接下來（日曆）</div>' + (next.length ? '<ul>' + next.slice(0, 6).map(row).join('') + '</ul>' : '<div class="v123-mut">日曆上還沒排。按「常用工具 → 日曆」新增作業或考試。</div>');
    if (past.length) h += '<details class="v123-past"><summary>已經過去的（' + past.length + '）</summary><ul>' + past.slice(0, 40).map(row).join('') + '</ul></details>';
    box.innerHTML = h;
    if (!box.__v123) {
      box.__v123 = 1;
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v123]'); if (!b) return;
        var a = b.getAttribute('data-v123');
        if (a === 'cal') { var o = $('v98-open'); if (o) o.click(); }
        else if (a.indexOf('del|') === 0 && typeof clsDel === 'function') clsDel(+a.slice(4));
      });
    }
  }
  function renderDev(box) {
    var on = get('tp_enabled_v1', '') === '1';
    box.innerHTML = '<button type="button" class="v123-devh" data-v123d="tog">⚙ 本裝置設定 ' + (devOpen ? '▲' : '▼') + '</button>' +
      (devOpen ? '<div class="v123-devb"><div>自動記錄上課進度：<b>' + (on ? '開' : '關') + '</b></div>' +
        '<button type="button" data-v123d="' + (on ? 'off' : 'on') + '">' + (on ? '本裝置停用' : '啟用（本裝置）') + '</button>' +
        '<div class="v123-mut">只影響這台裝置的這個瀏覽器。</div></div>' : '');
  }
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.filter(function (x) { return x.normal !== false; }).map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  function renderSched(box) {
    var S = sched();
    var h = '<div class="v123-sub">每週課表' + '<button type="button" data-v123s="edit">' + (schedEdit ? '完成編輯' : '編輯課表') + '</button>' +
      (schedEdit ? '<button type="button" data-v123s="reset">還原預設</button>' : '') + '</div><table><tr><th>節</th>' +
      [1, 2, 3, 4, 5].map(function (w) { return '<th>' + WD[w] + '</th>'; }).join('') + '</tr>';
    S.periods.forEach(function (P) {
      h += '<tr><th>' + P.p + '<small>' + esc(P.start) + '</small></th>';
      [1, 2, 3, 4, 5].forEach(function (w) {
        var sl = S.slots.filter(function (x) { return x[0] === w && x[1] === P.p; })[0], c = sl ? sl[2] : '';
        h += '<td>' + (schedEdit ? '<select data-v123w="' + w + '|' + P.p + '"><option value=""></option>' + classes().map(function (k) {
          return '<option' + (k === c ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>' : (c ? esc(c.replace('一', '')) : '')) + '</td>';
      });
      h += '</tr>';
    });
    box.innerHTML = h + '</table><div class="v123-mut">「編輯課表」會改變之後每週的課表；只調某一節請用下面的「調課」。</div>';
  }
  function renderSync(box) {
    var st = syncState();
    box.innerHTML = '<div class="v123-card"><b>☁ 雲端同步</b><span class="v123-st">' + esc(st || '') + '</span>' +
      '<div class="v123-mut">班級進度、日曆、小考紀錄、教學進度、檢核表等，在 iPad 和電腦之間自動同步（存在 Google 試算表）。</div>' +
      '<button type="button" class="v123-pri" data-v123y="cloud">打開雲端同步</button></div>' +
      '<div class="v123-card"><b>💾 本機備份檔</b><div class="v123-mut">把這台的資料下載成一個檔案（班級進度、上課紀錄、檢核表）；換裝置或出錯時可以匯入。</div></div>';
  }

  function openSheet(k) {
    sheet = k;
    if (k === 'hw') { autoCheck(); fetchGr(); }
    arrange();
    var s = $('v123-sh-' + k); if (s) s.scrollTop = 0;
  }
  function closeSheet() { sheet = ''; arrange(); }
  function onTool(e) {
    var b = e.target.closest('button[data-v123t]'); if (!b) return;
    var k = b.getAttribute('data-v123t');
    var map = { cal: 'v98-open', gr: 'v106-open', nq: 'v108-open' };
    if (map[k]) { var o = $(map[k]); if (o) o.click(); return; }
    openSheet(k);
  }
  function onDev(e) {
    var b = e.target.closest('button[data-v123d]'); if (!b) return;
    var a = b.getAttribute('data-v123d');
    if (a === 'tog') { devOpen = !devOpen; arrange(); }
    else if (a === 'off' && window.V82) V82.disable();
    else if (a === 'on' && window.V82) V82.enable();
  }
  function onSheet(e) {
    var b = e.target.closest('button'); if (!b) return;
    var c = b.getAttribute('data-v123c'); if (c && typeof clsPick === 'function') { clsPick(c); return; }
    var s = b.getAttribute('data-v123s');
    if (s === 'edit') { schedEdit = !schedEdit; arrange(); return; }
    if (s === 'reset' && window.V82) { V82.resetSched(); arrange(); return; }
    var y = b.getAttribute('data-v123y');
    if (y === 'cloud') { var o = $('v107-open'); if (o) o.click(); }
    var pp = b.getAttribute('data-v123p');
    if (pp) {
      var a2 = pp.split('|'), m = stuPw();
      if (a2[0] === 'save') {
        var inp = b.parentNode.querySelector('input[data-v123pw]'), v = inp ? inp.value.trim() : '';
        if (v.length < 10) { alert('密碼好像不完整（班級網站密碼是 12 碼，注意大小寫）。'); return; }
        m[a2[1]] = v;
      } else if (a2[0] === 'clr') { if (!confirm('要重新輸入「' + a2[1] + '」的密碼嗎？')) return; delete m[a2[1]]; try { localStorage.removeItem('stu_pw_' + STU_SLUG[a2[1]]); } catch (e) {} }
      put('stu_pw_v1', m); arrange();
    }
  }
  function onSheetChange(e) {
    var w = e.target.getAttribute('data-v123w'); if (!w || !window.V82) return;
    var a = w.split('|'); V82.setCell(+a[0], +a[1], e.target.value); arrange();
  }

  /* 掛勾：所有模組的 clsRender 包裝之後（本檔載入順序在後）→ 每次重繪後歸位 */
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { arrange(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }
  if (typeof clsToggle === 'function') {
    var _ct = clsToggle;
    clsToggle = function () { sheet = ''; var r = _ct.apply(this, arguments); try { var P = $('cls-panel'); if (P && P.classList.contains('open')) { autoCheck(); fetchGr(); } } catch (e) {} return r; };
  }
  /* 雲端同步狀態字變了 → 更新標題列小字 */
  (function watchSync(n) {
    var b = $('v107-open');
    if (!b) { if (n < 40) setTimeout(function () { watchSync(n + 1); }, 500); return; }
    new MutationObserver(function () { var x = $('v123-syncbtn'); if (x) { var st = syncState(); x.innerHTML = '☁ 同步／備份' + (st ? '<small>' + esc(st) + '</small>' : ''); } })
      .observe(b, { childList: true, subtree: true, characterData: true });
  })(0);
  window.V123PANEL = { arrange: arrange, open: openSheet, autoCheck: autoCheck };
  function init() { try { arrange(); autoCheck(); } catch (e) { setTimeout(function () { throw e; }); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
