
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

  /* RayOclass 4b：舊版出題面板（nqStart／nqAll／nqClose／nqToggle）已刪，新版在 036_v56-nq2-js；這裡只留題庫 wkBuildNoteBank */
  window.wkBuildNoteBank = wkBuildNoteBank;
})();
