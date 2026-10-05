
(function(){
  function nqExtractAnnotations(text){
    var out = [];
    var re = /\{n:(\d+)\|/g;
    var m;
    while ((m = re.exec(text)) !== null) {
      var no = parseInt(m[1], 10);
      var i = m.index + m[0].length;
      var depth = 1;
      var raw = '';
      while (i < text.length && depth > 0) {
        var c = text[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) break; }
        raw += c;
        i++;
      }
      out.push({ no: no, rawWord: raw });
      re.lastIndex = i + 1;
    }
    return out;
  }
  function nqCleanNested(raw){
    return raw.replace(/\{[gzpy]:([^|}]*)\|[^}]*\}/g, '$1');
  }
  function nqStripMarkupWhole(text){
    var result = '';
    var i = 0;
    while (i < text.length) {
      if (text[i] === '{') {
        var tagMatch = /^\{([nzgpy]):(\d+\|)?/.exec(text.slice(i));
        if (tagMatch) {
          var tagType = tagMatch[1];
          var colonIdx = text.indexOf(':', i);
          var k = colonIdx + 1;
          var numMatch = /^\d+\|/.exec(text.slice(k));
          if (numMatch) k += numMatch[0].length;
          // 逐字掃描找出這個標記對應的巢狀安全結尾 '}'，同時記錄「最外層（depth 1）」第一個 '|' 的位置，
          // 只有 g/z/p/y 這種「字|釋義」型標記才需要用它切掉後面的釋義；n 標記的內容整段都是字面文字。
          var content = '';
          var depth = 1;
          var p = k;
          var topPipeRel = -1;
          while (p < text.length && depth > 0) {
            var c = text[p];
            if (c === '{') depth++;
            else if (c === '}') { depth--; if (depth === 0) break; }
            else if (c === '|' && depth === 1 && topPipeRel < 0) topPipeRel = content.length;
            content += c;
            p++;
          }
          var literal;
          if (tagType !== 'n' && topPipeRel >= 0) {
            literal = content.slice(0, topPipeRel);
          } else {
            literal = content;
          }
          result += nqStripMarkupWhole(literal);
          i = p + 1;
          continue;
        }
      }
      result += text[i];
      i++;
    }
    return result;
  }
  var NQ_PUNCT_RE = /[、，,。！？「」『』：；\s]/g;
  function nqNorm(s){ return String(s).replace(NQ_PUNCT_RE, ''); }
  function nqStripTags(html){ return String(html).replace(/<[^>]+>/g, ''); }

  function nqResolveAnswer(word, segNotes){
    var normWord = nqNorm(word);
    for (var i=0;i<segNotes.length;i++){
      if (nqNorm(segNotes[i][0]) === normWord) return { answer: segNotes[i][1], how:'exact' };
    }
    var PREFIX_LEN = 4;
    var candidates = segNotes.filter(function(nItem){
      var nk = nqNorm(nItem[0]);
      if (nk.indexOf(normWord) >= 0 || normWord.indexOf(nk) >= 0) return true;
      var plen = Math.min(PREFIX_LEN, nk.length, normWord.length);
      if (plen >= PREFIX_LEN && nk.slice(0, plen) === normWord.slice(0, plen)) return true;
      return false;
    });
    candidates = candidates.sort(function(a,b){ return nqNorm(b[0]).length - nqNorm(a[0]).length; });
    if (candidates.length) {
      var best = candidates[0];
      var plain = nqStripTags(best[1]);
      var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var inlineRe = new RegExp(escaped + '[，,：:]([^。]+)。');
      var im = inlineRe.exec(plain);
      if (im) return { answer: word + '，' + im[1] + '。', how:'inline' };
      return { answer: plain, how:'whole' };
    }
    return null;
  }

  var nqBankCache = {};
  function wkBuildNoteBank(lessonKey){
    if (nqBankCache[lessonKey]) return nqBankCache[lessonKey];
    var entry = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK[lessonKey] : null;
    var bank = [];
    if (entry && Array.isArray(entry.textPages)) {
      entry.textPages.forEach(function(seg){
        var segNotes = Array.isArray(seg.notes) ? seg.notes : [];
        var lines = Array.isArray(seg.lines) ? seg.lines : [];
        lines.forEach(function(line){
          var text = line.text || '';
          var anns = nqExtractAnnotations(text);
          if (!anns.length) return;
          var sentence = nqStripMarkupWhole(text);
          anns.forEach(function(a){
            var word = nqCleanNested(a.rawWord);
            var resolved = nqResolveAnswer(word, segNotes);
            if (resolved) {
              bank.push({ no:a.no, word:word, sentence:sentence, answer:resolved.answer });
            }
          });
        });
      });
    }
    bank.sort(function(a,b){ return a.no - b.no; });
    nqBankCache[lessonKey] = bank;
    return bank;
  }

  function nqEligibleLessons(){
    var keys = [];
    var seen = {};
    var all = [].concat(
      (typeof WK_14 !== 'undefined' ? WK_14 : []),
      (typeof WK_EXTRA !== 'undefined' ? WK_EXTRA : []),
      (typeof WK_PROSE !== 'undefined' ? WK_PROSE : [])
    );
    all.forEach(function(k){
      if (seen[k]) return;
      seen[k] = true;
      var entry = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK[k] : null;
      if (entry && Array.isArray(entry.textPages) && entry.textPages.length) keys.push(k);
    });
    return keys;
  }

  function nqInitPanel(){
    var sel = document.getElementById('nq-lesson');
    if (!sel) return;
    var keys = nqEligibleLessons();
    sel.innerHTML = keys.map(function(k){ return '<option value="'+k.replace(/"/g,'&quot;')+'">'+k+'</option>'; }).join('');
  }

  function nqToggle(){
    nqInitPanel();
    var panel = document.getElementById('note-quiz-panel');
    if (panel) panel.classList.toggle('open');
  }

  var nqCurrentItems = [];
  function nqEsc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function nqMark(sentence, word){
    var i = sentence.indexOf(word);
    if (i < 0) return nqEsc(sentence);
    return nqEsc(sentence.slice(0,i)) + '<span class="nq-target">' + nqEsc(word) + '</span>' + nqEsc(sentence.slice(i+word.length));
  }

  function nqStart(){
    var lessonSel = document.getElementById('nq-lesson');
    var lessonKey = lessonSel ? lessonSel.value : '';
    if (!lessonKey) return;
    var bank = wkBuildNoteBank(lessonKey);
    var a = Math.max(1, parseInt(document.getElementById('nq-start').value,10) || 1);
    var b = Math.max(a, parseInt(document.getElementById('nq-end').value,10) || a);
    var count = Math.max(1, parseInt(document.getElementById('nq-count').value,10) || 1);
    var mode = document.getElementById('nq-mode').value;
    var pool = bank.filter(function(it){ return it.no >= a && it.no <= b; });
    if (mode === 'random') {
      pool = pool.slice().sort(function(){ return Math.random() - 0.5; });
    }
    var items = pool.slice(0, count);
    nqCurrentItems = items;

    var overlay = document.getElementById('note-quiz-overlay');
    overlay.classList.remove('show-all');
    document.getElementById('nq-paper-title').textContent = '《' + lessonKey.split('—')[0] + '》註釋小考';
    document.getElementById('nq-paper-sub').textContent = '第 ' + a + '～' + b + ' 號註釋，共 ' + items.length + ' 題' + (items.length < count ? '（範圍內題目不足）' : '');
    var qEl = document.getElementById('nq-questions');
    if (!items.length) {
      qEl.innerHTML = '<div class="nq-empty">這個範圍內沒有可用的註釋題目，請調整起訖號。</div>';
    } else {
      qEl.innerHTML = items.map(function(it, idx){
        return '<article class="nq-card">' +
          '<div class="nq-qnum">第 ' + (idx+1) + ' 題　｜　註釋 ' + it.no + ' 號</div>' +
          '<div class="nq-sentence">' + nqMark(it.sentence, it.word) + '</div>' +
          '<div class="nq-ask">請寫出「' + nqEsc(it.word) + '」的意思：</div>' +
          '<div class="nq-answer"><b>答</b>　' + it.answer + '</div>' +
          '</article>';
      }).join('');
    }
    overlay.classList.add('open');
  }

  function nqAll(btn){
    var overlay = document.getElementById('note-quiz-overlay');
    overlay.classList.toggle('show-all');
    btn.textContent = overlay.classList.contains('show-all') ? '隱藏答案' : '公布／隱藏答案';
  }

  function nqClose(){
    var overlay = document.getElementById('note-quiz-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  window.nqToggle = nqToggle;
  window.nqStart = nqStart;
  window.nqAll = nqAll;
  window.nqClose = nqClose;
  window.wkBuildNoteBank = wkBuildNoteBank;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', nqInitPanel);
  } else {
    nqInitPanel();
  }
})();
