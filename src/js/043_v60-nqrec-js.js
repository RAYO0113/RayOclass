
/* v60：註釋小考紀錄（適用所有課文）。
   - 考卷畫面加「記錄本次小考」→ 勾選班級（可複選）→ 儲存；不按不存。
   - 題目 = 選題畫面上被選取的題（#nq2-grid .chip.on 的 data-i，即 sel），questionKeys 沿用 itemKey(it) = 註號|詞。
   - 一筆紀錄存 localStorage 'nq-records-v1'：{ lesson, rangeStart, rangeEnd, questionKeys, questions, classes, createdAt }
     rangeStart/rangeEnd＝本次題目的最小／最大註號。questions＝考卷上實際標記的字詞（依註號排序）。
   - 同時在「班級進度與考試紀錄」面板（cls_records_v1）每個勾選的班級各加一筆「考試」，逐題列出。
   - 只讀取既有畫面，不包裝、不改動 v56-nq2-js 任何函式。 */
(function(){
  var CLASSES = ['冷一忠', '冷一孝', '建一忠', '建一孝'];
  var KEY = 'nq-records-v1';
  function $(id){ return document.getElementById('nq2-' + id); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function load(){ try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch(e){ return []; } }
  function today(){ var d = new Date(); function p(n){ return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  var rec = null;   // 本次考卷的紀錄內容（開始小考時算好）

  function currentLesson(){
    var s = $('lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function snapshot(){
    var L = currentLesson();
    if (!L || typeof window.nq2BuildLesson !== 'function') return null;
    var items = window.nq2BuildLesson(L).items;
    var idx = Array.prototype.map.call(document.querySelectorAll('#nq2-grid .chip.on'), function(b){ return +b.dataset.i; })
      .filter(function(i){ return items[i]; }).sort(function(a, b){ return a - b; });
    if (!idx.length) return null;
    // 考卷上實際標記的字詞：每張題卡的「註N」＋ <mark>（隨機拆題時可能是整句或小字詞）
    var shown = Array.prototype.map.call(document.querySelectorAll('#nq2-qlist .qc'), function(c){
      var src = c.querySelector('.src'), m = c.querySelector('.qs mark');
      return { no: src ? +String(src.textContent).replace(/\D/g, '') : 0, w: m ? m.textContent : '' };
    });
    var used = shown.map(function(){ return false; });
    var questions = idx.map(function(i){
      var it = items[i], w = it[1];
      for (var k = 0; k < shown.length; k++){ if (!used[k] && shown[k].no === it[0]){ used[k] = true; if (shown[k].w) w = shown[k].w; break; } }
      return { no: it[0], w: w };
    });
    var nos = idx.map(function(i){ return items[i][0]; });
    return {
      lesson: L,
      rangeStart: Math.min.apply(null, nos),
      rangeEnd: Math.max.apply(null, nos),
      questionKeys: idx.map(function(i){ return items[i][0] + '|' + items[i][1]; }),
      questions: questions
    };
  }
  function summary(r){
    return '〈' + r.lesson.split('—')[0] + '〉註釋小考　註' + r.rangeStart + '～註' + r.rangeEnd + '，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function(q){ return '註' + q.no + ' ' + q.w; }).join('、');
  }

  function resetBtn(){
    var b = $('v60rec'); if (!b) return;
    b.classList.remove('done'); b.disabled = false; b.textContent = '記錄本次小考';
  }
  function openDlg(){
    if (!rec) return;
    var d = $('v60dlg');
    d.querySelector('.v60-pv').textContent = summary(rec);
    Array.prototype.forEach.call(d.querySelectorAll('.v60-cls input'), function(x){ x.checked = false; x.parentNode.classList.remove('on'); });
    syncOk();
    d.classList.add('show');
  }
  function closeDlg(){ $('v60dlg').classList.remove('show'); }
  function picked(){ return Array.prototype.filter.call($('v60dlg').querySelectorAll('.v60-cls input'), function(x){ return x.checked; }).map(function(x){ return x.value; }); }
  function syncOk(){ $('v60dlg').querySelector('.v60-ok').disabled = !picked().length; }
  function save(){
    var classes = picked(); if (!classes.length || !rec) return;
    var r = { lesson: rec.lesson, rangeStart: rec.rangeStart, rangeEnd: rec.rangeEnd, questionKeys: rec.questionKeys,
              questions: rec.questions, classes: classes, createdAt: new Date().toISOString() };
    var all = load(); all.push(r);
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch(e){ alert('儲存失敗，可能是瀏覽器限制。'); return; }
    // 班級進度面板：每班各一筆「考試」
    if (typeof clsLoad === 'function' && typeof clsSave === 'function'){
      var cls = clsLoad(), t = esc(summary(r)), d = today();
      classes.forEach(function(c){
        cls[c] = cls[c] || [];
        cls[c].push({ d: d, k: '考試', t: t });
        cls[c].sort(function(a, b){ return b.d.localeCompare(a.d); });
      });
      clsSave(cls);
      if (typeof clsRender === 'function') clsRender();
    }
    closeDlg();
    var b = $('v60rec'); b.classList.add('done'); b.disabled = true; b.textContent = '已記錄 ✓（' + classes.join('、') + '）';
  }

  function init(){
    var all = $('bAll'), quiz = $('quiz');
    if (!all || !quiz) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'nq2-v60rec'; b.textContent = '記錄本次小考';
    all.parentNode.insertBefore(b, all);
    b.onclick = openDlg;

    var d = document.createElement('div');
    d.id = 'nq2-v60dlg';
    d.innerHTML = '<div class="v60-bx" role="dialog" aria-modal="true" aria-label="記錄本次小考">' +
      '<h3>記錄本次小考</h3>' +
      '<div class="v60-lb">班級（可複選）</div>' +
      '<div class="v60-cls">' + CLASSES.map(function(c){ return '<label><input type="checkbox" value="' + c + '">' + c + '</label>'; }).join('') + '</div>' +
      '<div class="v60-lb">紀錄內容</div><div class="v60-pv"></div>' +
      '<div class="v60-ft"><button type="button" class="v60-no">取消</button><button type="button" class="v60-ok">儲存紀錄</button></div></div>';
    document.getElementById('nq2').appendChild(d);
    d.addEventListener('change', function(e){ if (e.target.type === 'checkbox'){ e.target.parentNode.classList.toggle('on', e.target.checked); syncOk(); } });
    d.querySelector('.v60-no').onclick = closeDlg;
    d.querySelector('.v60-ok').onclick = save;
    d.addEventListener('click', function(e){ if (e.target === d) closeDlg(); });

    // 每次開始新的小考（考卷重新產生）→ 記下本次題目、按鈕回到可記錄狀態
    new MutationObserver(function(){
      if (!quiz.classList.contains('show')) { closeDlg(); return; }
      rec = snapshot(); resetBtn();
      b.style.display = rec ? '' : 'none';
    }).observe($('qlist'), { childList: true });
    new MutationObserver(function(){ if (!quiz.classList.contains('show')) closeDlg(); })
      .observe(quiz, { attributes: true, attributeFilter: ['class'] });
  }
  window.nqRecords = load;   // 除錯／匯出用：nqRecords() 取得全部紀錄
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
