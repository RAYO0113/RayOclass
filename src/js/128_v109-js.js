
/* v109（2026-10-05）—— 只加不刪，資料都存在 nq-records-v1 每筆紀錄裡（會經雲端同步給學生端 gr-3 stuGet）
   1. 考卷編號：L＋兩位課次＋兩位「該班這一課第幾次」，例 L0301。每班各自算（老師 10/5 決定）。
      - 紀錄存 codes：{ 班: 'L0301' }。新紀錄儲存時給號；舊紀錄依建立時間補號（安全條件同 v108：已從雲端拉過或未登入同步）。
      - 考卷畫面左上角顯示編號；旁邊可點選班級（預設：正在上課的班 → 今天日曆排這課小考的班 → 上次選的班），記錄視窗自動勾同樣的班。
   2. 記錄視窗多一列「訂正規則」（預設上一次），存進紀錄 corr，學生端顯示。
   ＊ 每題 ord＝考卷上的題號（打亂順序時照考卷），學生端照這個順序；換題的新題目沿用空出的題號。v109 之前的舊紀錄沒有 ord（照註號排）。
   ＊ 小考紀錄面板「🔢 照考卷排題號」：依考卷順序逐題點選 → 寫入 ord 並把題目陣列照順序排（舊紀錄補順序用）。
   3. 訂正要抄什麼：每題 x＝考卷上顯示的句子（含刪節號「…」）；整張 copy、每題 cp：'x' 考卷句／'s' 完整原句／'w' 只抄詞。預設 'x'。
      小考紀錄面板每張可設整張，每題可點選改單題（循環：跟整張→考卷句→完整原句→只抄詞）。 */
(function () {
  'use strict';
  var REC = 'nq-records-v1', CORR_LAST = 'nq-corr-last', CLS_LAST = 'nq-v109-cls';
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };   /* 同 v98 */
  var CP = [['x', '考卷句'], ['s', '完整原句'], ['w', '只抄詞']];
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function lnum(L) { for (var n in QK) if (QK[n] === L) return +n; return 0; }
  function prefix(L) { var n = lnum(L); return 'L' + (n ? pad(n) : '00'); }
  function codeNum(c) { var m = /(\d{2})$/.exec(String(c || '')); return m ? +m[1] : 0; }
  function maxNum(list, L, c, skip) {
    var mx = 0;
    list.forEach(function (r) { if (r && r !== skip && r.lesson === L && r.codes && r.codes[c]) mx = Math.max(mx, codeNum(r.codes[c])); });
    return mx;
  }
  function nextCode(list, L, c) { return prefix(L) + pad(maxNum(list, L, c) + 1); }
  /* 舊紀錄（或別台同步來、沒編號的）依建立時間補號 */
  function assignCodes(list) {
    var ch = false;
    list.slice().sort(function (a, b) { return String(a && a.createdAt).localeCompare(String(b && b.createdAt)); }).forEach(function (r) {
      if (!r || !r.lesson || !Array.isArray(r.classes)) return;
      r.classes.forEach(function (c) {
        if (r.codes && r.codes[c]) return;
        r.codes = r.codes || {};
        r.codes[c] = prefix(r.lesson) + pad(maxNum(list, r.lesson, c, r) + 1);
        ch = true;
      });
    });
    return ch;
  }
  /* 考卷句：依原句與標記字詞位置，用 v56 同樣規則截取（舊紀錄用；新紀錄直接取考卷畫面） */
  function excerpt(s, a, b) {
    if (a < 0 || s.length <= 30) return s;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return s;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return (k > 0 ? '…' : '') + p + (k < parts.length - 1 ? '…' : '');
      acc = end;
    }
    return s;
  }
  /* 換題後新題目沒有 ord：補上空出來的那個題號（其他題已有 ord 時） */
  function fixOrd(list) {
    var ch = false;
    list.forEach(function (r) {
      var qs = r && Array.isArray(r.questions) ? r.questions : [];
      if (!qs.some(function (q) { return q.ord; })) return;
      var used = {}; qs.forEach(function (q) { if (q.ord) used[q.ord] = 1; });
      var free = []; for (var i = 1; i <= qs.length; i++) if (!used[i]) free.push(i);
      qs.forEach(function (q) { if (!q.ord && free.length) { q.ord = free.shift(); ch = true; } });
    });
    return ch;
  }
  /* 題目陣列本身照考卷題號排（questions 與 questionKeys 一起動）：後台 gr-3 只照陣列順序傳給學生，這樣不更新後台也對 */
  function sortByOrd(list) {
    var ch = false;
    list.forEach(function (r) {
      var qs = r && Array.isArray(r.questions) ? r.questions : [];
      if (!qs.length || !qs.every(function (q) { return q.ord; })) return;
      var ks = Array.isArray(r.questionKeys) ? r.questionKeys : [];
      var z = qs.map(function (q, i) { return { q: q, k: ks[i] }; });
      var s = z.slice().sort(function (a, b) { return a.q.ord - b.q.ord; });
      if (s.every(function (o, i) { return o === z[i]; })) return;
      r.questions = s.map(function (o) { return o.q; });
      if (ks.length) r.questionKeys = s.map(function (o) { return o.k; });
      ch = true;
    });
    return ch;
  }
  function fillExcerpt(list) {
    var ch = false;
    list.forEach(function (r) {
      (r && Array.isArray(r.questions) ? r.questions : []).forEach(function (q) {
        if (q.x != null || !q.s) return;
        var w = q.whole ? '' : String(q.w || ''), a = w ? q.s.indexOf(w) : -1;
        q.x = q.whole ? q.s : excerpt(q.s, a, a + w.length); ch = true;
      });
    });
    return ch;
  }

  /* ── 考卷畫面：左上角編號＋班級選擇 ── */
  var pickCls = null;   /* 本次考卷要算編號的班（陣列） */
  function curLesson() {
    var s = document.getElementById('nq2-lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function defaultCls(L) {
    var live = jget('tp_live_v1', null), t = ymd(new Date());
    if (live && live.date === t && live.classId && classes().indexOf(live.classId) >= 0) return [live.classId];
    var n = lnum(L), cal = jget('exam_cal_v1', []);
    var today = (Array.isArray(cal) ? cal : []).filter(function (e) { return e && e.date === t && e.item === '註釋小考' && (e.lessons || []).indexOf(n) >= 0; })
      .map(function (e) { return e.cls; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
    if (today.length) return today;
    var last = jget(CLS_LAST, []);
    return Array.isArray(last) ? last.filter(function (c) { return classes().indexOf(c) >= 0; }) : [];
  }
  function paintCode() {
    var t = document.getElementById('nq2-qTitle'); if (!t) return;
    var L = curLesson(); if (!L) return;
    var box = document.getElementById('nq2-v109code');
    if (!box) { box = document.createElement('span'); box.id = 'nq2-v109code'; t.insertBefore(box, t.firstChild); }
    if (!pickCls) pickCls = defaultCls(L);
    var list = recs(), cs = pickCls.filter(function (c) { return classes().indexOf(c) >= 0; });
    var code = cs.length ? cs.map(function (c) { return { c: c, k: nextCode(list, L, c) }; }) : [];
    var same = code.length && code.every(function (x) { return x.k === code[0].k; });
    box.innerHTML = '<span class="v109-code">' + (code.length ? (same ? '<b>' + esc(code[0].k) + '</b>' : code.map(function (x) { return '<b>' + esc(x.k) + '</b><small>' + esc(x.c) + '</small>'; }).join(' ')) :
      '<b>' + esc(prefix(L)) + '--</b><small>點班級</small>') + '</span><span class="v109-cls">' +
      classes().map(function (c) { return '<button type="button" data-c="' + esc(c) + '"' + (cs.indexOf(c) >= 0 ? ' class="on"' : '') + '>' + esc(c.replace('一', '')) + '</button>'; }).join('') + '</span>';
  }
  function hookQuiz() {
    var q = document.getElementById('nq2-quiz'), t = document.getElementById('nq2-qTitle');
    if (!q || !t) return false;
    new MutationObserver(function () { if (q.classList.contains('show')) { pickCls = null; paintCode(); } else pickCls = null; })
      .observe(q, { attributes: true, attributeFilter: ['class'] });
    var ql = document.getElementById('nq2-qlist');
    if (ql) new MutationObserver(function () { if (q.classList.contains('show')) paintCode(); }).observe(ql, { childList: true });
    t.addEventListener('click', function (e) {
      var b = e.target.closest('.v109-cls [data-c]'); if (!b) return;
      e.stopPropagation();
      var c = b.getAttribute('data-c'), i = (pickCls || []).indexOf(c);
      pickCls = (pickCls || []).slice(); if (i >= 0) pickCls.splice(i, 1); else pickCls.push(c);
      jput(CLS_LAST, pickCls);
      paintCode();
    });
    return true;
  }

  /* ── 記錄視窗：自動勾班級＋訂正規則＋整張訂正抄法 ── */
  var dlgCorr = null, dlgCopy = 'x';
  function corrRows() {
    return (dlgCorr || []).map(function (c, j) {
      return '<span class="rw"><input type="number" min="0" max="100" data-j="' + j + '" data-f="s" value="' + esc(c.s) + '">分' +
        '<button type="button" data-op="' + j + '">' + (c.op === 'le' ? '以下' : '以上') + '</button> 訂正 ' +
        '<input type="number" min="0" max="20" data-j="' + j + '" data-f="t" value="' + esc(c.t) + '"> 次</span>';
    }).join('') + '<button type="button" data-add="1">＋級距</button>';
  }
  function paintDlg(d) {
    var box = d.querySelector('.v109-dlg');
    if (!box) {
      box = document.createElement('div'); box.className = 'v109-dlg';
      var ft = d.querySelector('.v60-ft'); ft.parentNode.insertBefore(box, ft);
      box.addEventListener('input', function (e) {
        var x = e.target, j = x.getAttribute('data-j'); if (j == null) return;
        dlgCorr[+j][x.getAttribute('data-f')] = x.value === '' ? '' : Math.max(0, Math.round(+x.value));
      });
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-op')) { var c = dlgCorr[+b.getAttribute('data-op')]; c.op = c.op === 'le' ? 'ge' : 'le'; }
        else if (b.hasAttribute('data-add')) dlgCorr.push({ op: 'ge', s: '', t: '' });
        else if (b.hasAttribute('data-cp')) dlgCopy = b.getAttribute('data-cp');
        paintDlg(d);
      });
    }
    box.innerHTML = '<div>訂正規則：' + corrRows() + '</div><div>訂正要抄：' + CP.map(function (m) {
      return '<button type="button" data-cp="' + m[0] + '"' + (dlgCopy === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>';
    }).join(' ') + '<span style="opacity:.7;font-size:12px">（之後可在「📝 小考紀錄」逐題改）</span></div>';
  }
  function hookDlg() {
    var d = document.getElementById('nq2-v60dlg'); if (!d) return false;
    new MutationObserver(function () {
      if (!d.classList.contains('show')) return;
      var last = jget(CORR_LAST, null);
      dlgCorr = JSON.parse(JSON.stringify(Array.isArray(last) && last.length ? last : [{ op: 'ge', s: '', t: '' }, { op: 'le', s: '', t: '' }]));
      dlgCopy = 'x';
      paintDlg(d);
      /* 班級：若都沒勾，勾考卷畫面選的班（v100 從日曆開考時會先勾好，不覆蓋） */
      setTimeout(function () {
        var ins = Array.prototype.slice.call(d.querySelectorAll('.v60-cls input'));
        if (ins.some(function (x) { return x.checked; }) || !pickCls || !pickCls.length) return;
        ins.forEach(function (x) { if (pickCls.indexOf(x.value) >= 0) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); } });
      }, 50);
    }).observe(d, { attributes: true, attributeFilter: ['class'] });
    return true;
  }
  /* 考卷畫面上每題實際顯示的句子（含刪節號），依題卡順序對應註號 */
  function shownExcerpts() {
    return Array.prototype.map.call(document.querySelectorAll('#nq2-qlist .qc'), function (c) {
      var qs = c.querySelector('.qs'), src = c.querySelector('.qs .src'), m = c.querySelector('.qs mark');
      var t = qs ? qs.textContent : '';
      if (src) t = t.replace(src.textContent, '');
      return { no: src ? +String(src.textContent).replace(/\D/g, '') : 0, w: m ? m.textContent : '', x: t.trim() };
    });
  }

  /* ── 儲存攔截（包在 v108 外層）：新紀錄給號、存訂正規則／抄法／考卷句；舊紀錄補號 ── */
  var SP = Storage.prototype, prevSet = SP.setItem, inSet = false;
  SP.setItem = function (k, v) {
    if (!inSet && this === window.localStorage && k === REC) {
      try {
        var list = JSON.parse(v), before = recs(), dlg = document.getElementById('nq2-v60dlg');
        if (Array.isArray(list)) {
          if (list.length > before.length && dlg && dlg.classList.contains('show')) {
            var shown = shownExcerpts(), used = shown.map(function () { return false; });
            list.slice(before.length).forEach(function (r) {
              if (!r) return;
              var cs = (dlgCorr || []).filter(function (c) { return c.s !== '' && c.s != null; });
              if (cs.length) { r.corr = cs; jput(CORR_LAST, cs); }
              r.copy = dlgCopy || 'x';
              (r.questions || []).forEach(function (q) {
                for (var i = 0; i < shown.length; i++) if (!used[i] && shown[i].no === q.no && (!shown[i].w || shown[i].w === q.w)) { used[i] = true; q.x = shown[i].x; q.ord = i + 1; break; }   /* ord＝考卷上的題號（亂序時照考卷） */
              });
            });
          }
          assignCodes(list); fixOrd(list); sortByOrd(list);
          v = JSON.stringify(list);
        }
      } catch (e) {}
    }
    inSet = true;
    try { return prevSet.call(this, k, v); } finally { inSet = false; }
  };
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safeToWrite() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  function fixStored() {
    if (!safeToWrite()) return;
    var a = recs(), c1 = assignCodes(a), c2 = fillExcerpt(a), c3 = fixOrd(a), c4 = sortByOrd(a);
    if (c1 || c2 || c3 || c4) jput(REC, a);
  }
  setTimeout(fixStored, 6000);
  setInterval(fixStored, 30000);

  /* ── 小考紀錄面板（v108）：顯示編號、整張／每題訂正抄法 ── */
  function updRec(id, fn) {
    var a = recs(), r = a.filter(function (x) { return x && x.id === id; })[0]; if (!r) return null;
    fn(r); jput(REC, a); return r;
  }
  var ordPick = null;   /* 照考卷排題號：{ id, seq:[題目 index…] } */
  function cpName(k) { for (var i = 0; i < CP.length; i++) if (CP[i][0] === k) return CP[i][1]; return CP[0][1]; }
  function decoratePanel() {
    var p = document.getElementById('v108-nqr'); if (!p) return;
    var all = recs();
    p.querySelectorAll('.rec').forEach(function (el) {
      if (el.querySelector('.v109-cp')) return;
      var pub = el.querySelector('[data-pub]'); if (!pub) return;
      var id = pub.getAttribute('data-pub'), r = all.filter(function (x) { return x && x.id === id; })[0]; if (!r) return;
      var rh = el.querySelector('.rh b');
      if (rh && r.codes) {
        var ks = Object.keys(r.codes).map(function (c) { return '<span class="v109-cd" title="' + esc(c) + '">' + esc(r.codes[c]) + '</span><small>' + esc(c.replace('一', '')) + '</small>'; }).join(' ');
        var s = document.createElement('span'); s.innerHTML = ks; s.style.marginRight = '6px'; rh.parentNode.insertBefore(s, rh);
      }
      var cp = document.createElement('div'); cp.className = 'v109-cp';
      var whole = r.copy || 'x';
      var picking = ordPick && ordPick.id === id, hasOrd = r.questions.every(function (q) { return q.ord; });
      cp.innerHTML = '訂正要抄（整張）：' + CP.map(function (m) { return '<button type="button" data-cpa="' + m[0] + '"' + (whole === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>'; }).join('') +
        '<span style="opacity:.7">　每題右邊可單獨改</span>' +
        (picking ? '<span class="v109-ordh">👉 依考卷順序點題目（已點 ' + ordPick.seq.length + '／' + r.questions.length + '）</span><button type="button" data-ordx="1">取消</button>'
          : '<button type="button" data-ord="1" class="v109-ordb">🔢 照考卷排題號' + (hasOrd ? '（已排）' : '') + '</button>');
      var corr = el.querySelector('.corr'); (corr || el.querySelector('.qs')).insertAdjacentElement(corr ? 'afterend' : 'beforebegin', cp);
      cp.addEventListener('click', function (e) {
        if (e.target.closest('[data-ord]')) { ordPick = { id: id, seq: [] }; if (window.V108) window.V108.openRecords(); return; }
        if (e.target.closest('[data-ordx]')) { ordPick = null; if (window.V108) window.V108.openRecords(); return; }
        var b = e.target.closest('[data-cpa]'); if (!b) return;
        updRec(id, function (x) { x.copy = b.getAttribute('data-cpa'); });
        if (window.V108) window.V108.openRecords();
      });
      var qLis = Array.prototype.filter.call(el.querySelectorAll('.qs > li'), function (li) { return li.querySelector('.sw'); });
      qLis.forEach(function (li, k) {
        var q0 = r.questions[k]; if (!q0) return;
        var nb = document.createElement('span'); nb.className = 'v109-ordn';
        var pi = picking ? ordPick.seq.indexOf(k) : -1;
        nb.textContent = picking ? (pi >= 0 ? pi + 1 : '?') : (q0.ord || '');
        if (picking || q0.ord) li.insertBefore(nb, li.firstChild);
        if (picking) {
          li.classList.add('v109-pick');
          li.addEventListener('click', function (e) {
            if (e.target.closest('button,input,select')) return;
            if (ordPick.seq.indexOf(k) >= 0) return;
            ordPick.seq.push(k);
            nb.textContent = ordPick.seq.length; li.classList.add('done');
            var h = el.querySelector('.v109-ordh'); if (h) h.textContent = '👉 依考卷順序點題目（已點 ' + ordPick.seq.length + '／' + r.questions.length + '）';
            if (ordPick.seq.length === r.questions.length) {
              var seq = ordPick.seq; ordPick = null;
              updRec(id, function (x) { seq.forEach(function (qi, n) { x.questions[qi].ord = n + 1; }); sortByOrd([x]); x.ordSet = new Date().toISOString(); });
              if (window.V108) window.V108.openRecords();
            }
          });
        }
      });
      qLis.forEach(function (li, k) {
        var sw = li.querySelector('.sw'); if (!sw || li.querySelector('.v109-qcp')) return;
        var q = r.questions[k]; if (!q) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'v109-qcp' + (q.cp ? ' ov' : '');
        b.textContent = q.cp ? cpName(q.cp) : '同整張';
        b.title = '這一題訂正要抄：' + (q.cp ? cpName(q.cp) : '跟整張（' + cpName(whole) + '）') + '｜點一下切換';
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var order = ['', 'x', 's', 'w'], nx = order[(order.indexOf(q.cp || '') + 1) % order.length];
          updRec(id, function (x) { if (nx) x.questions[k].cp = nx; else delete x.questions[k].cp; });
          if (window.V108) window.V108.openRecords();
        });
        li.insertBefore(b, sw);
      });
    });
  }
  (function watchPanel() {
    var p = document.getElementById('v108-nqr');
    if (!p) { setTimeout(watchPanel, 300); return; }
    new MutationObserver(decoratePanel).observe(p, { childList: true, subtree: true });
    decoratePanel();   /* 面板第一次打開時觀察器還沒掛上，先補一次 */
  })();
  /* 各自只掛一次（避免重複掛監聽造成點一下切換兩次） */
  var hookedQ = false, hookedD = false;
  (function tryHook(n) { if (!hookedQ) hookedQ = hookQuiz(); if (!hookedD) hookedD = hookDlg(); if (!(hookedQ && hookedD) && n < 40) setTimeout(function () { tryHook(n + 1); }, 500); })(0);

  window.V109 = { fix: fixStored, nextCode: function (L, c) { return nextCode(recs(), L, c); } };
})();
