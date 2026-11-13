(function () {
  'use strict';
  /* ── V245 甲乙丙丁題（老師 11/13：L6 習作第 2 題甲乙丙丁擠在一起、詳解全塞在 D 選項）──
     題幹裡 (甲)(乙)(丙)… 一項一行；詳解裡「(甲)…(乙)…」拆到各項底下，點那一項才打開；選項裡只留沒拆到的部分。
     資料不動，只在畫面上重排。平板（src/js/190）與手機（tn/index.html）各放一份同樣的程式。 */
  var JY_LET = '甲乙丙丁戊己庚辛';
  /* 標記：(甲)／（甲）；資料裡少數寫成「( ) 戊」也算。前面要是開頭、空白、標點或另一個標記（避免抓到詳解句中「應接<b>(乙)</b>」） */
  var JY_RE = /[（(][\s　]*([甲乙丙丁戊己庚辛])[\s　]*[）)]|[（(][\s　]*[）)][\s　]*([甲乙丙丁戊己庚辛])(?=[\s　])/g;
  function jyMarks(s, strict) {
    var o = [], m; JY_RE.lastIndex = 0;
    while ((m = JY_RE.exec(s))) {
      var pv = s.slice(0, m.index).replace(/<br\s*\/?>\s*$/i, '\n');
      var c = pv.slice(-1);
      if (strict && pv && !/[\s　。；;，,：:？?！!）)\n]/.test(c)) continue;
      o.push({ L: m[1] || m[2], at: m.index, end: m.index + m[0].length });
    }
    return o;
  }
  function jyEmpty(t) { return !String(t).replace(/<[^>]+>/g, '').replace(/[\s　、，,；;：:]/g, ''); }
  function jyTrim(t) { return String(t).replace(/^(?:[\s　、，：:]|<br\s*\/?>)+|(?:[\s　，、；;]|<br\s*\/?>)+$/gi, ''); }
  var JY_ASK = /(以上|上述|上列|前述|這些|請問|依此|依據|根據|由此|關於|下列|何者|哪|選項)/;
  function jyList(stem) {
    stem = String(stem || '');
    var cm = /<(div|img|table|figure)\b/i.exec(stem), cut = cm ? cm.index : stem.length;
    var head = stem.slice(0, cut), after = stem.slice(cut);
    var ms = jyMarks(head); if (ms.length < 2) return null;
    for (var i = 0; i < ms.length; i++) if (ms[i].L !== JY_LET[i]) return null;
    var items = ms.map(function (m, i) { return { L: m.L, t: head.slice(m.end, i + 1 < ms.length ? ms[i + 1].at : head.length) }; });
    if (items.some(function (it) { return jyEmpty(it.t); })) return null;
    /* 最後一項後面接的問句（「以上各組…」「依此規劃…應是：」）拆出來另起一行 */
    var last = items[items.length - 1], tail = '', re = /[。？！?!]/g, mm, at = -1;
    while ((mm = re.exec(last.t))) {
      var rest = jyTrim(last.t.slice(mm.index + 1)).replace(/<[^>]+>/g, '');
      if (!rest) break;
      if (JY_ASK.test(rest.slice(0, 4)) && rest.search(JY_ASK) === 0 && /[？?：:]\s*$/.test(rest)) { at = mm.index + 1; break; }
    }
    if (at > 0) { tail = last.t.slice(at); last.t = last.t.slice(0, at); }
    items.forEach(function (it) { it.t = jyTrim(it.t); });
    return { pre: jyTrim(head.slice(0, ms[0].at)), items: items, tail: jyTrim(tail) + after };
  }
  /* 詳解「(甲)…(乙)(丙)…」→ 各項；連在一起的空標記（(乙)(丙)由…）共用後面那段。沒拆到回傳 null */
  function jySplit(text, letters) {
    if (!text) return null;
    var blocks = String(text).split(/<br\s*\/?>/i), rest = [], per = {}, hit = false;
    blocks.forEach(function (b) {
      var ms = jyMarks(b, true).filter(function (m) { return letters.indexOf(m.L) >= 0; });
      if (!ms.length || (ms.length < 2 && letters.length > 1 && !jyEmpty(b.slice(0, ms[0].at)))) { rest.push(b); return; }
      var pieces = [], grp = [];
      for (var i = 0; i < ms.length; i++) {
        var t = b.slice(ms[i].end, i + 1 < ms.length ? ms[i + 1].at : b.length);
        grp.push(ms[i].L);
        if (jyEmpty(t) && i + 1 < ms.length) continue;
        if (jyEmpty(t)) { pieces = null; break; }
        pieces.push({ Ls: grp, t: jyTrim(t).replace(/^[：:]\s*/, '') }); grp = [];
      }
      if (!pieces || !pieces.length) { rest.push(b); return; }
      var pre = jyTrim(b.slice(0, ms[0].at)), lab = '';
      if (/^(語譯|翻譯|解析|說明|釋義|字義|注釋)[：:]?$/.test(pre)) lab = pre.replace(/[：:]$/, '');
      else if (pre && !/^[（(]?[A-E][）)]?$/.test(pre)) rest.push(pre);
      pieces.forEach(function (p) { p.Ls.forEach(function (L) { (per[L] = per[L] || []).push((lab ? '<span class="jy4-lab">' + lab + '</span>' : '') + p.t); }); });
      hit = true;
    });
    if (!hit) return null;
    return { rest: rest.join('<br>').replace(/^(\s*<br>)+|(<br>\s*)+$/g, '').trim(), per: per };
  }
  /* 題目 → 複本（題幹換成逐項 HTML、詳解拆走）；不是甲乙丙丁列項題回傳 null。fmt＝各片段輸出前的處理（手機用 clean） */
  function jyTransform(q, stemKey, fmt) {
    fmt = fmt || function (x) { return x; };
    var J = jyList(q[stemKey]); if (!J) return null;
    var letters = J.items.map(function (it) { return it.L; }), X = {}, seen = {};
    function eat(t) {
      var r = jySplit(t, letters); if (!r) return t;
      for (var L in r.per) r.per[L].forEach(function (p) { var k = L + '|' + p.replace(/<[^>]+>/g, '').replace(/\s/g, ''); if (!seen[k]) { seen[k] = 1; (X[L] = X[L] || []).push(p); } });
      return r.rest;
    }
    var q2 = {}; for (var kk in q) q2[kk] = q[kk];
    q2.opts = (q.opts || []).map(function (o) { var o2 = o.slice(); if (o2[2]) o2[2] = eat(o2[2]); return o2; });
    if (q.per) { q2.per = {}; for (var k in q.per) q2.per[k] = eat(q.per[k]); }
    if (q.exp) q2.exp = eat(q.exp);
    var any = letters.some(function (L) { return X[L]; });
    q2[stemKey] = '<div class="jy4' + (any ? ' jy4-has' : '') + '">' + (J.pre ? '<div class="jy4-pre">' + fmt(J.pre) + '</div>' : '') +
      J.items.map(function (it) {
        var x = X[it.L];
        return '<div class="jy4-l' + (x ? ' has' : '') + '"' + (x ? ' onclick="this.classList.toggle(\'jy4-on\');event.stopPropagation()"' : '') + '>' +
          '<span class="jy4-m">(' + it.L + ')</span><span class="jy4-t">' + fmt(it.t) + '</span>' +
          (x ? '<div class="jy4-x">' + fmt(x.join('<br>')) + '</div>' : '') + '</div>';
      }).join('') + (J.tail ? '<div class="jy4-tail">' + fmt(J.tail) + '</div>' : '') + '</div>';
    q2._jy = 1;
    return q2;
  }

  /* 平板：基礎練習（iquiz，題幹 q）、A卷（aq，題幹 stem）、習作（work，題幹 q；含 189 一題一頁）渲染前換成重排後的複本 */
  function tx(q, key) { return (q && !q._jy && jyTransform(q, key)) || q; }
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && (slide.type === 'iquiz' || slide.type === 'aq') && slide.q) {
      var s2 = Object.assign({}, slide, { q: tx(slide.q, slide.type === 'aq' ? 'stem' : 'q') });
      return _render.call(this, s2);
    }
    if (slide && slide.type === 'work' && slide.sec && (slide.sec.items || []).length) {
      var map = new Map();
      var items = slide.sec.items.map(function (it) { var t = tx(it, 'q'); map.set(it, t); return t; });
      var s3 = Object.assign({}, slide, { sec: Object.assign({}, slide.sec, { items: items }) });
      if (slide.item) s3.item = map.get(slide.item) || slide.item;
      return _render.call(this, s3);
    }
    return _render.apply(this, arguments);
  };
  /* 「全部顯示」「直接顯示答案」也一起打開各項詳解 */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.iq-all,.as-all,.wq-reveal-btn'); if (!b) return;
    var root = b.classList.contains('wq-reveal-btn') ? b.closest('.wq-item') : b.closest('.wk-slide');
    if (root) root.querySelectorAll('.jy4-l.has').forEach(function (x) { x.classList.add('jy4-on'); });
  }, true);
})();
