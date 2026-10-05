
/* v111（2026-10-05）：小考紀錄（nq-records-v1）每筆「✏️ 編輯」——老師要求「自動記錄的小考卷有誤，全部要能手改」
   - 日期（改 createdAt 的日期、保留原時間）、班級（勾選）、各班編號（L＋4 碼，可手改；留空＝自動給號）
   - 題目：改「考卷上的句子」（q.x）、答案（q.a）、刪除；從題庫加題（有拆題可選整句／小字詞）；題號 ord 依畫面順序重編
   - 存檔後範圍（rangeStart／End）重算，加 edited 時間；班級進度那筆不自動改（避免誤刪），面板有提醒
   做法：在 v108 面板每筆紀錄標題加按鈕，編輯時用表單取代那一筆的畫面；不改 v108／v109 程式。 */
(function () {
  'use strict';
  var REC = 'nq-records-v1';
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function bank(L) { try { return typeof window.nq2BuildLesson === 'function' ? window.nq2BuildLesson(L) : null; } catch (e) { return null; } }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }
  function noBk(h, D) { h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, ''); ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); }); return h; }
  function excerpt(s, a, b) {   /* 同 v56／v109 */
    if (a < 0 || s.length <= 30) return s;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return s;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) { var p = parts[k], end = acc + p.length; if (a >= acc && b <= end) return (k > 0 ? '…' : '') + p + (k < parts.length - 1 ? '…' : ''); acc = end; }
    return s;
  }

  var ed = null;   /* 編輯中：{ id, d: 日期, cls: [], codes: {}, qs: [{no,w,a,s,x,whole,cp,key}], add: 題庫 index 或 null } */
  function startEdit(id) {
    var r = recs().filter(function (x) { return x && x.id === id; })[0]; if (!r) return;
    var dt = new Date(r.createdAt);
    var qs = (r.questions || []).map(function (q, i) { return { no: q.no, w: q.w, a: q.a == null ? '' : q.a, s: q.s || '', x: q.x == null ? (q.s || '') : q.x, whole: !!q.whole, cp: q.cp || '', key: (r.questionKeys || [])[i] || (q.no + '|' + q.w) }; });
    if (qs.every(function (q, i) { return r.questions[i].ord; })) qs = qs.map(function (q, i) { return { q: q, o: r.questions[i].ord }; }).sort(function (a, b) { return a.o - b.o; }).map(function (z) { return z.q; });
    ed = { id: id, lesson: r.lesson, d: isNaN(dt) ? ymd(new Date()) : ymd(dt), cls: (r.classes || []).slice(), codes: JSON.parse(JSON.stringify(r.codes || {})), qs: qs, add: null };
    if (window.V108) window.V108.openRecords();
  }
  function formHTML() {
    var h = '<div class="v111-ed" data-v111="1"><h4>✏️ 編輯小考紀錄：〈' + esc(String(ed.lesson).split('—')[0]) + '〉</h4>';
    h += '<div class="rw"><span class="k">日期</span><input type="date" data-f="d" value="' + esc(ed.d) + '"></div>';
    h += '<div class="rw"><span class="k">班級</span>' + classes().map(function (c) { return '<button type="button" data-c="' + esc(c) + '"' + (ed.cls.indexOf(c) >= 0 ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('') + '</div>';
    h += '<div class="rw cd"><span class="k">編號</span>' + ed.cls.map(function (c) { return esc(c.replace('一', '')) + ' <input type="text" data-code="' + esc(c) + '" value="' + esc(ed.codes[c] || '') + '" placeholder="自動">'; }).join('　') +
      '<span class="warn">（L＋課次2碼＋第幾次2碼，例 L0304；留空＝自動給號）</span></div>';
    h += '<div class="rw"><span class="k">題目</span><span style="opacity:.75">照考卷順序排（題號＝這裡的順序；要調順序可存檔後用「🔢 照考卷排題號」）</span></div>';
    ed.qs.forEach(function (q, i) {
      h += '<div class="q"><span class="n">' + (i + 1) + '. 註' + esc(q.no) + '<br><small>' + esc(q.whole ? '整句' : q.w) + '</small></span><div>' +
        '<div style="font-size:12px;opacity:.7">考卷上的句子</div><textarea data-q="' + i + '" data-k="x">' + esc(q.x) + '</textarea>' +
        '<div style="font-size:12px;opacity:.7">答案</div><textarea data-q="' + i + '" data-k="a">' + esc(q.a) + '</textarea></div>' +
        '<button type="button" class="del" data-del="' + i + '">刪除</button></div>';
    });
    var D = bank(ed.lesson);
    h += '<div class="add"><button type="button" data-addt="1">＋ 加一題</button>';
    if (ed.add === -1 && D) {
      var used = {}; ed.qs.forEach(function (q) { used[q.key] = 1; });
      h += '<div class="g">' + D.items.map(function (it, i) {
        var lab = D.vars[i] ? D.vars[i][0][0] : it[1];
        return '<button type="button" data-pk="' + i + '"' + (used[it[0] + '|' + it[1]] ? ' disabled' : '') + '><small>' + it[0] + '</small>' + esc(lab.length > 12 ? lab.slice(0, 12) + '…' : lab) + '</button>';
      }).join('') + '</div>';
    } else if (ed.add != null && ed.add >= 0 && D && D.items[ed.add]) {
      var vs = D.vars[ed.add], it0 = D.items[ed.add];
      h += '<div class="rw">加入「註' + it0[0] + '」：' + (vs ? vs.map(function (v, j) { return '<button type="button" data-pv="' + j + '">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '</button>'; }).join('')
        : '<button type="button" data-pv="-1">' + esc(it0[1]) + '</button>') + '<button type="button" data-addt="1">重選</button></div>';
    } else if (ed.add === -1) h += '<span class="warn">這一課目前沒有題庫資料。</span>';
    h += '</div>';
    h += '<div class="ft"><span class="warn" style="margin-right:auto">班級進度裡那筆考試文字不會自動改，需要的話請到班級進度手動修改。</span>' +
      '<button type="button" class="no" data-x="1">取消</button><button type="button" class="ok" data-ok="1">存檔</button></div></div>';
    return h;
  }
  function addQ(vj) {
    var D = bank(ed.lesson), i = ed.add, it = D && D.items[i]; if (!it) return;
    var vs = D.vars[i], v = vs && vs[vj], w = v ? v[0] : it[1], whole = !!(v && v[4] === 'whole');
    var ans = v ? v[3] : it[3], s = it[2], a0 = whole ? -1 : s.indexOf(w);
    ed.qs.push({ no: it[0], w: w, a: txt(noBk(ans, D)), s: s, x: whole ? s : excerpt(s, a0, a0 + w.length), whole: whole, cp: '', key: it[0] + '|' + it[1] });
    ed.add = null;
  }
  function readForm(el) {
    el.querySelectorAll('textarea[data-q]').forEach(function (t) { var q = ed.qs[+t.getAttribute('data-q')]; if (q) q[t.getAttribute('data-k')] = t.value; });
    el.querySelectorAll('input[data-code]').forEach(function (t) { ed.codes[t.getAttribute('data-code')] = t.value.trim().toUpperCase(); });
    var d = el.querySelector('input[data-f="d"]'); if (d && d.value) ed.d = d.value;
  }
  function saveEdit(el) {
    readForm(el);
    if (!ed.cls.length) { alert('至少要勾一個班。'); return; }
    if (!ed.qs.length) { alert('至少要有一題。'); return; }
    var bad = ed.cls.filter(function (c) { return ed.codes[c] && !/^L\d{4}$/.test(ed.codes[c]); });
    if (bad.length) { alert('編號格式要像 L0304：' + bad.join('、')); return; }
    var a = recs(), r = a.filter(function (x) { return x && x.id === ed.id; })[0]; if (!r) { ed = null; return; }
    var old = new Date(r.createdAt), t = isNaN(old) ? new Date() : old, p = ed.d.split('-');
    var nd = new Date(+p[0], +p[1] - 1, +p[2], t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
    r.createdAt = nd.toISOString();
    r.classes = ed.cls.slice();
    var codes = {}; ed.cls.forEach(function (c) { if (ed.codes[c]) codes[c] = ed.codes[c]; }); r.codes = codes;   /* 留空的班由 v109 自動給號 */
    r.questions = ed.qs.map(function (q, i) {
      var o = { no: q.no, w: q.w, a: q.a, s: q.s, x: q.x, ord: i + 1 };
      if (q.whole) o.whole = true; if (q.cp) o.cp = q.cp;
      return o;
    });
    r.questionKeys = ed.qs.map(function (q) { return q.key; });
    var nos = r.questions.map(function (q) { return q.no; });
    r.rangeStart = Math.min.apply(null, nos); r.rangeEnd = Math.max.apply(null, nos);
    r.edited = new Date().toISOString();
    ed = null;
    jput(REC, a);
    if (window.V108) window.V108.openRecords();
  }
  function decorate() {
    var p = document.getElementById('v108-nqr'); if (!p) return;
    p.querySelectorAll('.rec').forEach(function (el) {
      var pub = el.querySelector('[data-pub]'); if (!pub) return;
      var id = pub.getAttribute('data-pub');
      if (ed && ed.id === id) {
        if (el.getAttribute('data-v111') === 'form') return;
        el.setAttribute('data-v111', 'form'); el.className = 'rec'; el.innerHTML = formHTML(); bind(el); return;
      }
      if (el.querySelector('.v111-eb')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'v111-eb'; b.textContent = '✏️ 編輯';
      b.addEventListener('click', function (e) { e.stopPropagation(); startEdit(id); });
      var lab = el.querySelector('.rh .pub'); if (lab) lab.parentNode.insertBefore(b, lab); else el.querySelector('.rh').appendChild(b);
    });
  }
  function rerenderForm(el) { el.innerHTML = formHTML(); }
  function bind(el) {
    el.addEventListener('click', function (e) {
      var t = e.target; if (!t.closest('button')) return;
      e.stopPropagation();
      var b = t.closest('button');
      readForm(el);
      if (b.hasAttribute('data-c')) { var c = b.getAttribute('data-c'), i = ed.cls.indexOf(c); if (i >= 0) ed.cls.splice(i, 1); else ed.cls.push(c); }
      else if (b.hasAttribute('data-del')) { var k = +b.getAttribute('data-del'); if (!confirm('刪除第 ' + (k + 1) + ' 題（註' + ed.qs[k].no + '）？')) return; ed.qs.splice(k, 1); }
      else if (b.hasAttribute('data-addt')) ed.add = -1;
      else if (b.hasAttribute('data-pk')) { ed.add = +b.getAttribute('data-pk'); var D = bank(ed.lesson); if (D && !D.vars[ed.add]) addQ(-1); }
      else if (b.hasAttribute('data-pv')) addQ(+b.getAttribute('data-pv'));
      else if (b.hasAttribute('data-x')) { ed = null; if (window.V108) window.V108.openRecords(); return; }
      else if (b.hasAttribute('data-ok')) { saveEdit(el); return; }
      rerenderForm(el);
    });
    el.addEventListener('keydown', function (e) { e.stopPropagation(); });
  }
  (function watch() {
    var p = document.getElementById('v108-nqr');
    if (!p) { setTimeout(watch, 300); return; }
    new MutationObserver(decorate).observe(p, { childList: true, subtree: true });
    decorate();
  })();
  window.V111 = { edit: startEdit };
})();
