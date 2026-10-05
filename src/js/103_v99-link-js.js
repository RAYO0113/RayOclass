
(function () {
  /* 課次 → V84 課名（同 v84 LESSONS）；L7 以後 V84 沒有格子，完成狀態記在日曆項目本身（e.done） */
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  var NO = {}; Object.keys(LK).forEach(function (n) { NO[LK[n]] = +n; });
  var V84ITEMS = ['A卷', '習作', '課後習題'];
  var K = { cal: 'exam_cal_v1', hw: 'hw_done_v1' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function cal() { var a = get(K.cal, []); return Array.isArray(a) ? a : []; }

  /* 考試＋A卷／習作／課後習題＋課次都在 L1～L6 → 與 V84「考試」格連動 */
  /* v102：A卷檢討 → 完成紀錄「A卷｜檢討」格 */
  function hwKey(e) { return e.item === 'A卷檢討' ? 'A卷|檢討' : e.item + '|考試'; }
  function linked(e) {
    return ((e.kind === '考試' && V84ITEMS.indexOf(e.item) >= 0) || e.item === 'A卷檢討') && e.lessons && e.lessons.length &&
      e.lessons.every(function (n) { return LK[n]; });
  }
  function isDone(e, hw) {
    if (!linked(e)) return !!e.done;
    hw = hw || get(K.hw, {});
    return e.lessons.every(function (n) { var r = (hw[LK[n]] || {})[e.cls] || {}; return !!r[hwKey(e)]; });
  }
  function toggle(id) {
    var a = cal(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    var done = isDone(e), when = e.date <= today() ? e.date : today();
    if (done && !confirm('取消「' + e.cls + '・' + e.item + '」的完成紀錄？' + (linked(e) ? '\n（「完成紀錄」表格的對應格也會一起取消）' : ''))) return;
    if (linked(e)) {
      var hw = get(K.hw, {});
      e.lessons.forEach(function (n) {
        var r = ((hw[LK[n]] = hw[LK[n]] || {})[e.cls] = hw[LK[n]][e.cls] || {}), key = hwKey(e);
        if (done) delete r[key]; else if (!r[key]) r[key] = when;
      });
      put(K.hw, hw);
    } else {
      if (done) delete e.done; else e.done = when;
      put(K.cal, a);
    }
    if (window.V98CAL) V98CAL.open();      /* 重新畫日曆（月份、選取日期不變） */
    if (typeof clsRender === 'function' && document.getElementById('cls-panel')) clsRender();
  }

  var busy = false;
  /* 日曆：右側清單加「完成」鈕；格子內已完成的項目淡化＋刪除線 */
  function decoCal() {
    var box = document.querySelector('#v98-cal .v98-box'); if (!box) return;
    var a = cal(), hw = get(K.hw, {}), byId = {}, doneKey = {};
    a.forEach(function (e) { byId[e.id] = e; if (isDone(e, hw)) doneKey[e.date + '|' + e.cls] = (doneKey[e.date + '|' + e.cls] || 0) + 1; });
    box.querySelectorAll('.v98-it').forEach(function (it) {
      if (it.querySelector('.v99-ck')) return;
      var del = it.querySelector('button[data-v98^="del|"]'); if (!del) return;
      var e = byId[del.getAttribute('data-v98').slice(4)]; if (!e) return;
      var d = isDone(e, hw), b = document.createElement('button');
      b.type = 'button'; b.className = 'v99-ck' + (d ? ' on' : ''); b.setAttribute('data-v99', e.id);
      b.textContent = d ? '✓ 完成' : '完成'; b.title = d ? '已完成（點一下可取消）' : '標記完成' + (linked(e) ? '（同步到完成紀錄）' : '');
      it.insertBefore(b, del);
      if (d) it.classList.add('v99-done');
    });
    /* 格子：依「日期｜班｜顯示文字」比對（同日同班同內容視為同一筆） */
    var cells = box.querySelectorAll('.v98-d');
    cells.forEach(function (c) {
      var ds = (c.getAttribute('data-v98') || '').slice(2);
      c.querySelectorAll('.v98-pill').forEach(function (p) {
        if (p.hasAttribute('data-v99d')) return; p.setAttribute('data-v99d', '1');
        var t = p.getAttribute('title') || '', cid = p.getAttribute('data-cid');   /* v100：用 data-cid 精確對應 */
        var match = a.filter(function (e) { return cid ? e.id === cid : (e.date === ds && t === e.cls + '・' + labelOf(p, t)); });
        if (match.length && match.every(function (e) { return isDone(e, hw); })) { p.classList.add('v99-done'); p.title = t + '（已完成）'; }
      });
    });
  }
  function labelOf(p, t) { return t.slice(t.indexOf('・') + 1); }

  /* 完成紀錄表格：尚未完成的「考試」格，若日曆有排，顯示 📅日期（最近一次） */
  function decoHw() {
    var root = document.getElementById('v84-hw'); if (!root) return;
    var a = cal(), plan = {};
    a.forEach(function (e) {
      if (!linked(e)) return;
      e.lessons.forEach(function (n) {
        var k = LK[n] + '|' + e.cls + '|' + hwKey(e);
        (plan[k] = plan[k] || []).push(e.date);
      });
    });
    root.querySelectorAll('button.v84-c:not(.done)').forEach(function (b) {
      var x = (b.getAttribute('data-v84') || '').split('|');   /* C|課|班|項目|階段 */
      if (b.querySelector('.v99-plan')) return;
      var ds = plan[x[1] + '|' + x[2] + '|' + x[3] + '|' + x[4]]; if (!ds) return;
      /* 優先顯示今天以後最近的一次；都已過去就顯示最後一次 */
      ds.sort(); var t = today(), d = ds.filter(function (v) { return v >= t; })[0] || ds[ds.length - 1];
      var s = document.createElement('span'); s.className = 'v99-plan'; s.textContent = '📅' + md(d);
      b.appendChild(s); b.title += '（日曆排定 ' + md(d) + '）';
    });
  }

  function deco() {
    if (busy) return; busy = true;
    try { decoCal(); decoHw(); } catch (e) {} finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var p = document.getElementById('cls-panel'); if (p) mo.observe(p, { childList: true, subtree: true });
    var m = document.getElementById('v98-cal');
    if (m && !m.__v99) { m.__v99 = 1; mo.observe(m, { childList: true, subtree: true });
      m.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-v99]'); if (b) { e.stopPropagation(); toggle(b.getAttribute('data-v99')); } }, true); }
    deco();
  }
  /* 日曆視窗第一次開啟時才建立 → 包 open 接上監看 */
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }
  var btnHook = function () { var b = document.getElementById('v98-open'); if (b) b.onclick = function () { V98CAL.open(); }; watch(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', btnHook); else btnHook();

  window.V99LINK = { isDone: isDone, linked: linked, toggle: toggle };
})();
