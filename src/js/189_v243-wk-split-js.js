(function () {
  'use strict';
  /* ── V243（老師 11/13「習作跟課後習題能不能拆成跟A卷一樣一頁一題，不然手機稿不好追」）──
     習作的選擇題區（綜合理解練習 quiz、閱讀測驗 read）原本一區一頁（8 題擠一頁），平板換題手機分不出在哪一題。
     → 執行期把這兩種區拆成「一題一頁」，跟 A卷一樣；閱讀測驗每頁左邊都留題幹文章，賞析放在該區最後一題。
     ・資料不動（TEXTBOOK 原樣），只改投影片清單 wkParseSlides 與該頁的渲染。
     ・表格區（字音、字形、字詞義、國學常識、趣味文學、挑戰加分站）照舊一區一頁。
     ・課後習題的基礎練習本來就一題一頁；進階練習只有一張答案表，不拆。
     ・手機講稿代號：work:<區標題>|<題號>（186 sid）。
     ・習作答案總覽點題號：跳到那一題的頁。
     ・螢光筆（164，記頁碼）：這課第一次拆頁時，把習作之後各頁的舊頁碼往後移，畫過的 A卷等不會跑到別題。 */
  function splittable(s) {
    return s && s.type === 'work' && !s.item && s.sec && (s.sec.kind === 'quiz' || s.sec.kind === 'read') && (s.sec.items || []).length > 1;
  }

  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var old = _parse.apply(this, arguments);
    if (!old || !old.some(splittable)) return old;
    var out = [], map = [];   /* map[舊頁碼] = 新頁碼（拆開的區對到它的第 1 題） */
    old.forEach(function (s, i) {
      map[i] = out.length;
      if (!splittable(s)) { out.push(s); return; }
      var items = s.sec.items, N = items.length;
      items.forEach(function (it, ii) {
        out.push({ type: 'work', sec: s.sec, item: it, ii: ii, itot: N, first: s.first && ii === 0, title: s.title });
      });
    });
    /* 習作答案總覽的跳題目標：改指向那一題的頁 */
    out.forEach(function (s) {
      if (s.type !== 'work_answers') return;
      (s.targets || []).forEach(function (t) {
        var os = old[t.slideIdx]; if (!os) return;
        var ni = map[t.slideIdx];
        for (var j = ni; j < out.length && out[j].sec === os.sec; j++) {
          if (out[j].item && String(out[j].item.n) === String(t.qn)) { ni = j; break; }
        }
        t.slideIdx = ni;
      });
    });
    migrateMarks(key, map);
    return out;
  };

  /* 螢光筆舊頁碼 → 新頁碼（每課只做一次） */
  function migrateMarks(key, map) {
    try {
      var DONE = 'v243_wksplit_mig', done = JSON.parse(localStorage.getItem(DONE) || '{}') || {};
      if (done[key]) return;
      var raw = localStorage.getItem('hlmark_trial_v1');
      if (raw) {
        var a = JSON.parse(raw) || [], ch = false;
        a.forEach(function (m) {
          if (m && m.lesson === String(key) && typeof m.idx === 'number' && map[m.idx] != null && map[m.idx] !== m.idx) { m.idx = map[m.idx]; ch = true; }
        });
        if (ch) localStorage.setItem('hlmark_trial_v1', JSON.stringify(a));
      }
      done[key] = 1; localStorage.setItem(DONE, JSON.stringify(done));
    } catch (e) {}
  }

  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    /* 答案總覽：原程式依題號找目標，閱讀測驗 1～3 題會跳到綜合理解的 1～3 題（題號重複）。
       按鈕與 targets 都是照區、照題的順序 → 數量相同時，第 k 顆按鈕改用第 k 個目標。 */
    if (slide && slide.type === 'work_answers' && slide.targets && slide.targets.length) {
      var ho = _render.apply(this, arguments), T = slide.targets, re = /wkWorkAnswerGo\(\d+,'((?:[^'\\]|\\.)*)'\)/g;
      var cnt = (ho.match(re) || []).length;
      if (cnt !== T.length) return ho;
      var k = 0;
      return ho.replace(re, function (m, qn) { var t = T[k++]; return String(t.qn).replace(/'/g, "\\'") === qn ? "wkWorkAnswerGo(" + t.slideIdx + ",'" + qn + "')" : m; });
    }
    if (!(slide && slide.type === 'work' && slide.item)) return _render.apply(this, arguments);
    var S = slide.sec, last = slide.ii === slide.itot - 1;
    var one = Object.assign({}, S, { items: [slide.item], appraise: last ? S.appraise : '' });
    var h = _render.call(this, Object.assign({}, slide, { sec: one }));
    var tag = '<span class="wk-qpos">第 ' + slide.item.n + ' 題　' + (slide.ii + 1) + '/' + slide.itot + '</span>';
    return h.replace('wk-slide wks-work', 'wk-slide wks-work wks-wq1').replace(/(<span class="wk-head">[\s\S]*?<\/span>)/, '$1' + tag);
  };
})();
