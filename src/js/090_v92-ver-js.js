
/* v92：版號；〈身為魚販〉套用 v91 修辭呈現；自學流程（引導／原文／提問穿插）。
   ・V91_RHET_KEYS 定義在 v91-rhet-js（本 addon 之前），只 push 不覆寫。
   ・包一層 wkParseSlides（目前第 4 層，實際生效的最外層）：魚販拿掉第 1、2 節獨立教案頁（2-7 移到課文後），
     並依移除位移 work_answers.targets 的 slideIdx。其他課不動。
   ・教案內容用原本的 wkRenderSlideHTML({type:'lesson'}) 產生，保留老師教案原文與格式。 */
(function () {
  window.APP_VERSION = 'V92';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);
  if (window.V91_RHET_KEYS && window.V91_RHET_KEYS.indexOf('身為魚販') < 0) window.V91_RHET_KEYS.push('身為魚販');

  var KEY = '身為魚販', PREFIX = 'v92f|' + KEY + '|';
  /* 流程表：段（0 起）→ before[行]＝該行之前的「讀之前」；after[行]＝該行之後的「想一想」
     L:教案頁號　Q:備課用書教學問題引導題號（1～15）　PA:老師 V50 頁層級提問（舊第 i 部分） */
  var FLOW = [
    { before: { 0: ['L1-2', 'L1-1', 'L1-3'] },
      after:  { 1: ['L1-4', 'Q1', 'Q2'], 3: ['Q3', 'Q4'], 6: ['Q5', 'Q6'] } },
    { before: {},
      after:  { 1: ['Q7'], 7: ['Q8'], 8: ['L1-7'] } },
    { before: { 0: ['L1-5'] },
      after:  { 2: ['Q9'], 4: ['Q10'], 11: ['Q11', 'L1-6'] } },
    { before: { 0: ['L2-1', 'L2-2'] },
      after:  { 1: ['Q12'], 7: ['Q13'] } },
    { before: { 0: ['PA4'] },
      after:  { 2: ['Q14', 'Q15'], 6: ['L2-3', 'L2-4', 'L2-5', 'L2-6'] } },
  ];
  var DROP = /^[12]-\d+$/, KEEP_AFTER = '2-7';

  function lsGet(k) { try { return localStorage.getItem(PREFIX + k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { if (v) localStorage.setItem(PREFIX + k, v); else localStorage.removeItem(PREFIX + k); } catch (e) {} }
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ta(id) {
    return '<textarea class="v92-ta" data-v92="' + esc(id) + '" placeholder="寫下你的想法……">' + esc(lsGet(id)) + '</textarea>';
  }

  /* ── 投影片：拿掉獨立教案頁 ── */
  if (typeof wkParseSlides === 'function') {
    var _parse = wkParseSlides;
    wkParseSlides = function (key) {
      var slides = _parse.apply(this, arguments);
      if (key !== KEY) return slides;
      var keep = [], map = {}, bridge = null;
      slides.forEach(function (s, i) {
        if (s.type === 'lesson' && s.L && DROP.test(s.L.no)) {
          if (s.L.no === KEEP_AFTER) bridge = s;
          return;
        }
        map[i] = keep.length; keep.push(s);
      });
      if (bridge) {   // 「課文到這裡結束」接在最後一段課文之後
        var last = -1;
        keep.forEach(function (s, i) { if (s.type === 'textpage') last = i; });
        if (last >= 0) {
          keep.splice(last + 1, 0, bridge);
          Object.keys(map).forEach(function (k) { if (map[k] > last) map[k]++; });
        }
      }
      keep.forEach(function (s) {
        (s.targets || []).forEach(function (t) { if (typeof t.slideIdx === 'number' && t.slideIdx in map) t.slideIdx = map[t.slideIdx]; });
      });
      return keep;
    };
  }

  /* ── 題目區塊 ── */
  /* 自學版用語（老師 10/1「改掉」課堂用語）：只在流程顯示時替換，教案資料不動；原文不符就不換並 console.warn */
  var WORDING = {
    '1-2': { title: ['今天的閱讀任務', '閱讀任務'] },
    '1-6': { hint: ['請寫在課本空白處，不用另外抄。', '請寫在下面的表格裡。'] },
    '1-7': { title: ['下課前，口頭回答兩句', '讀到這裡，回答兩句'],
             lines0: ['今天我從課文中看見魚販工作的一個<b>具體細節</b>：＿＿＿＿', '我從課文中看見魚販工作的一個<b>具體細節</b>：＿＿＿＿'] },
    '2-1': { hint: ['翻出上節的註記，找出你寫的其中一個因素。', '回頭看你前面寫的答案，找出其中一個因素。'] },
    '2-4': { title: ['小組整理：作者的情感變化', '整理：作者的情感變化'],
             hint: ['如果組員理解不同，可以先把不同答案都寫下來，再回到文本討論哪一種更有根據。', '如果你有不同的理解，可以都寫下來，再回到課文找哪一種更有根據。'] },
  };
  function reword(L) {
    var w = WORDING[L.no];
    if (!w) return L;
    L = JSON.parse(JSON.stringify(L));
    Object.keys(w).forEach(function (k) {
      var from = w[k][0], to = w[k][1];
      if (k === 'lines0') { if (L.lines && L.lines[0] === from) L.lines[0] = to; else console.warn('v92 wording 不符', L.no, k); }
      else if (L[k] === from) L[k] = to; else console.warn('v92 wording 不符', L.no, k);
    });
    return L;
  }
  function lessonItem(no) {
    var L = (TEXTBOOK[KEY].lesson || []).filter(function (x) { return x.no === no; })[0];
    if (!L) return '';
    L = reword(L);
    var tmp = document.createElement('div');
    tmp.innerHTML = wkRenderSlideHTML({ type: 'lesson', L: L });
    var body = tmp.querySelector('.ls-body');
    if (!body) return '';
    var teach = body.querySelector('.ls-teach');
    // 作答：子題逐一給格；表格空格直接可填／只有提示列則加三列
    var subs = L.points || L.ask || L.task || L.lines || null;
    var tbl = body.querySelector('table.ls-tbl');
    if (tbl && L.cols) {
      var rows = L.rows || [];
      var empty = rows.every(function (r) { return r.slice(1).every(function (c) { return !c; }); });
      if (empty) {
        tbl.querySelectorAll('tr').forEach(function (tr, ri) {
          if (!ri) return;
          tr.querySelectorAll('td').forEach(function (td, ci) { td.className = 'v92-cell'; td.innerHTML = ta(no + '|r' + ri + 'c' + ci); });
        });
      } else {
        for (var r = 1; r <= 3; r++) {
          var tr = document.createElement('tr');
          L.cols.forEach(function (c, ci) { var td = document.createElement('td'); td.className = 'v92-cell'; td.innerHTML = ta(no + '|a' + r + 'c' + ci); tr.appendChild(td); });
          tbl.appendChild(tr);
        }
      }
    } else if (L.kind !== 'key3' && L.kind !== 'board') {
      var box = document.createElement('div');
      var qs = subs && subs.length ? subs : [''];
      box.innerHTML = qs.map(function (q, i) {
        return (qs.length > 1 ? '<div class="v92-sq">' + (i + 1) + '. ' + esc(strip(q)) + '</div>' : '') + ta(no + '|' + i);
      }).join('');
      if (teach) body.insertBefore(box, teach); else body.appendChild(box);
    }
    var tb = teach ? '<button class="v92-tbtn" onclick="v92Teach(this)" title="教師引導">師</button>' : '';
    return '<div class="v92-it">' + tb + body.innerHTML + '</div>';
  }
  function qaItem(n) {
    var tp = TEXTBOOK[KEY].textPages, k = n;
    for (var s = 0; s < tp.length; s++) {
      var qa = tp[s].qa || [];
      if (k <= qa.length) {
        var q = qa[k - 1];
        return '<div class="v92-it"><div class="v92-q"><span class="v92-qn">' + n + '</span>' + q[0] + '</div>' + ta('Q' + n) +
          '<div class="tp-abox" onclick="this.classList.toggle(\'show\')"><div class="tp-acov">寫完後，點此看參考答案</div>' +
          '<div class="tp-a"><span class="tp-ak">答</span><div class="tp-atext">' + q[1] + '</div></div></div></div>';
      }
      k -= qa.length;
    }
    return '';
  }
  function pageAsk(i) {
    var P = (TEXTBOOK[KEY].textPages || [])[i];
    if (!P || !P.ask || !P.ask.length) return '';
    var t = P.askT ? '<button class="v92-tbtn" onclick="v92Teach(this)" title="教師引導">師</button>' : '';
    return '<div class="v92-it">' + t + '<ul class="ls-ask">' + P.ask.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ul>' +
      P.ask.map(function (q, j) { return ta('PA' + i + '|' + j); }).join('') +
      (P.askT ? '<div class="ls-teach"><div class="ls-th">教師引導</div>' + P.askT + '</div>' : '') + '</div>';
  }
  window.v92Teach = function (btn) {
    var t = btn.parentNode.querySelector('.ls-teach'); if (!t) return;
    t.classList.toggle('show'); btn.classList.toggle('on');
  };
  function block(items, pre) {
    var html = items.map(function (x) {
      if (x[0] === 'L') return lessonItem(x.slice(1));
      if (x[0] === 'Q') return qaItem(+x.slice(1));
      if (x.slice(0, 2) === 'PA') return pageAsk(+x.slice(2));
      return '';
    }).join('');
    if (!html) return null;
    var d = document.createElement('div');
    d.className = 'v92-blk' + (pre ? ' v92-pre' : '');
    d.innerHTML = '<span class="v92-tag">' + (pre ? '讀之前' : '想一想') + '</span><span class="v92-save">作答自動存在這台裝置</span>' + html;
    return d;
  }

  /* 頁層級提問 PA4 是舊第 5 部分的 ask；v92 資料已隨內容搬到新第五段 → 取新段 4 的 ask */
  function enhance(area) {
    var slide = area.querySelector('.wks-textpage');
    if (!slide || slide.getAttribute('data-v92f')) return;
    var cur = wkSlides[wkIdx];
    if (!cur || cur.type !== 'textpage' || cur.bookKey !== KEY) return;
    var si = (TEXTBOOK[KEY].textPages || []).indexOf(cur.page);
    var F = FLOW[si];
    if (!F) return;
    slide.setAttribute('data-v92f', '1');
    slide.classList.add('v92-flow');
    Object.keys(F.before).forEach(function (li) {
      var line = slide.querySelector('.tp-body > .tp-line[data-li="' + li + '"]');
      var b = line && block(F.before[li], true);
      if (b) line.parentNode.insertBefore(b, line);
    });
    Object.keys(F.after).forEach(function (li) {
      var line = slide.querySelector('.tp-body > .tp-line[data-li="' + li + '"]');
      var b = line && block(F.after[li], false);
      if (b) line.parentNode.insertBefore(b, line.nextSibling);
    });
  }

  var tmr = {};
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('v92-ta')) return;
    var id = t.getAttribute('data-v92');
    document.querySelectorAll('.v92-ta').forEach(function (o) { if (o !== t && o.getAttribute('data-v92') === id) o.value = t.value; });
    clearTimeout(tmr[id]);
    tmr[id] = setTimeout(function () { lsSet(id, t.value); }, 400);
  });

  function scan() {
    if (typeof wkKey === 'undefined' || wkKey !== KEY) return;
    document.querySelectorAll('#wk-slide-area, #wkfs-body').forEach(enhance);
  }
  var p = false;
  new MutationObserver(function () { if (p) return; p = true; setTimeout(function () { p = false; scan(); }, 30); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();
