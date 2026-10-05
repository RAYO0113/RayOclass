
/* v112（2026-10-05）：建一孝註釋小考編號更正（老師在成績登記自建 0301～0303，0301 當時沒有「記錄本次小考」）
   - 新增 0301 紀錄：9/29《師說》註2 整句、註3 之、註4 孰、註7 聞道、註10 師（老師考卷寫「吾『師道』也」，題庫註10 為「師」，待老師確認）
   - 原自動編號 L0301～L0304（9/29、10/1、10/2、10/5）改為 L0302～L0305
   - 只在本機已從雲端拉過（或未登入同步）時執行；只在 9/29 那筆仍是自動給的 L0301、且還沒有 0301 補登紀錄時執行（做過一次就不會再改，老師之後手改也不會被蓋）
   成績登記：考卷名稱以「0301」這種 4 位數開頭時顯示成「L0301」（v112 改 v106 itemLabel，見 v112_build.js） */
(function () {
  'use strict';
  var REC = 'nq-records-v1', CLS = '建一孝', FIX_ID = 'q-fix-jyx-0301';
  function recs() { try { var a = JSON.parse(localStorage.getItem(REC) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safe() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }
  function noBk(h, D) { h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, ''); ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); }); return h; }
  function q(D, no, word, whole) {
    var i = -1; D.items.forEach(function (it, k) { if (i < 0 && it[0] === no) i = k; });
    if (i < 0) return null;
    var it = D.items[i], vs = D.vars[i], v = whole && vs ? vs.filter(function (x) { return x[4] === 'whole'; })[0] : null;
    var w = v ? v[0] : (word || it[1]);
    var vv = vs ? vs.filter(function (x) { return x[0] === w; })[0] : null;
    var o = { no: no, w: w, a: txt(noBk(vv ? vv[3] : it[3], D)), s: it[2], x: it[2], key: it[0] + '|' + it[1] };
    if (v) o.whole = true;
    return o;
  }
  function run() {
    if (!safe() || typeof window.nq2BuildLesson !== 'function') return false;
    var a = recs();
    if (a.some(function (r) { return r && r.id === FIX_ID; })) return true;
    var mine = a.filter(function (r) { return r && r.lesson === '師說' && (r.classes || []).indexOf(CLS) >= 0; });
    var by = {}; mine.forEach(function (r) { var d = new Date(r.createdAt); if (!isNaN(d)) by[ymd(d)] = r; });
    var r929 = by['2026-09-29'];
    if (!r929 || !r929.codes || r929.codes[CLS] !== 'L0301') return true;   /* 已改過或狀況不同 → 不動 */
    var map = { '2026-09-29': 'L0302', '2026-10-01': 'L0303', '2026-10-02': 'L0304', '2026-10-05': 'L0305' };
    Object.keys(map).forEach(function (d) { if (by[d]) { by[d].codes = by[d].codes || {}; by[d].codes[CLS] = map[d]; by[d].edited = new Date().toISOString(); } });
    var D = window.nq2BuildLesson('師說');
    var qs = [q(D, 2, '', true), q(D, 3), q(D, 4), q(D, 7), q(D, 10)].filter(Boolean);
    qs.forEach(function (x, i) { x.ord = i + 1; });
    var nos = qs.map(function (x) { return x.no; });
    a.push({ id: FIX_ID, lesson: '師說', rangeStart: Math.min.apply(null, nos), rangeEnd: Math.max.apply(null, nos),
      questionKeys: qs.map(function (x) { var k = x.key; delete x.key; return k; }), questions: qs, classes: [CLS],
      createdAt: new Date(2026, 8, 29, 8, 0, 0).toISOString(), codes: { '建一孝': 'L0301' }, copy: 'x',
      note: '老師在成績登記自建「0301」，v112 補登；註10 待老師確認（考卷寫「吾『師道』也」）', edited: new Date().toISOString() });
    localStorage.setItem(REC, JSON.stringify(a));
    try { var p = document.getElementById('v108-nqr'); if (p && p.classList.contains('open') && window.V108) window.V108.openRecords(); } catch (e) {}
    return true;
  }
  (function loop(n) { if (!run() && n < 120) setTimeout(function () { loop(n + 1); }, 5000); })(0);
  window.V112 = { fixJyx: run };
})();
