
(function(){
  /* ───────── 題庫：即時從 TEXTBOOK 解析（新課只要有 textPages 就自動出現） ─────────
     基本題目沿用 v55 的 wkBuildNoteBank()（[註號, 目標詞, 原句, 答案]）；
     另外算出：①目標詞在原句中的實際位置（同字多次出現時標對那一個）
               ②「整句＋小字詞」型註釋的出題選項（依註釋原文「詞，解釋。」切出，不改寫內容） */
  var PUN = /[、，,。！？「」『』：；\s]/;
  function norm(s){ return String(s).replace(/[、，,。！？「」『』：；\s]/g, ''); }
  var SPAN_RE = /<span class='(bk|zy)-note'>[\s\S]*?<\/span>/g;
  function spansOf(h){ return (String(h).match(SPAN_RE) || []).join(''); }
  function noSpan(h){ return String(h).replace(SPAN_RE, '').replace(/<[^>]+>/g, ''); }
  // 與 v55 nqStripMarkupWhole 相同邏輯：把 {n:}/{g:}/{z:}/{p:}/{y:} 攤平成純文字
  function strip(text){
    var result = '', i = 0;
    while (i < text.length){
      if (text[i] === '{'){
        var tm = /^\{([nzgpy]):(\d+\|)?/.exec(text.slice(i));
        if (tm){
          var tt = tm[1], k = text.indexOf(':', i) + 1;
          var nm = /^\d+\|/.exec(text.slice(k)); if (nm) k += nm[0].length;
          var content = '', depth = 1, p = k, tp = -1;
          while (p < text.length && depth > 0){
            var c = text[p];
            if (c === '{') depth++;
            else if (c === '}'){ depth--; if (depth === 0) break; }
            else if (c === '|' && depth === 1 && tp < 0) tp = content.length;
            content += c; p++;
          }
          result += strip((tt !== 'n' && tp >= 0) ? content.slice(0, tp) : content);
          i = p + 1; continue;
        }
      }
      result += text[i]; i++;
    }
    return result;
  }
  function clean(raw){ return raw.replace(/\{[gzpy]:([^|}]*)\|[^}]*\}/g, '$1'); }
  // 與 v55 nqResolveAnswer 相同的候選規則，但回傳整條 note
  function findNote(word, notes){
    var nw = norm(word);
    for (var i = 0; i < notes.length; i++) if (norm(notes[i][0]) === nw) return notes[i];
    var c = notes.filter(function(n){
      var nk = norm(n[0]);
      if (nk.indexOf(nw) >= 0 || nw.indexOf(nk) >= 0) return true;
      var pl = Math.min(4, nk.length, nw.length);
      return pl >= 4 && nk.slice(0, pl) === nw.slice(0, pl);
    }).sort(function(a, b){ return norm(b[0]).length - norm(a[0]).length; });
    return c[0] || null;
  }
  // 在原句中找「忽略標點」的片語，回傳 [起, 迄)
  function spanOf(s, phrase, from){
    var np = norm(phrase); if (!np) return null;
    for (var st = from || 0; st < s.length; st++){
      if (PUN.test(s[st])) continue;
      var k = 0, j = st;
      while (j < s.length && k < np.length){
        if (PUN.test(s[j])){ j++; continue; }
        if (s[j] !== np[k]) break;
        j++; k++;
      }
      if (k === np.length) return [st, j];
    }
    return null;
  }
  function isZhuyin(t){ return /^[ㄅ-ㄩˊˇˋ˙\s]+$/.test(t) || /^音/.test(t); }

  function buildVariants(row, L){
    if (!row || !row.note) return null;
    var key = row.note[0], html = row.note[1], s = row.sentence;
    if (norm(key).length < 3) return null;
    var whole = spanOf(s, key);
    if (!whole){ var q = /「(.+?)」/.exec(key); if (q && spanOf(s, q[1])) whole = [row.pos, row.pos + row.word.length]; }
    if (!whole) return null;                        // 註釋詞不在這一句 → 不拆
    var segs = noSpan(html).split(/(?<=[。？！])/).map(function(x){ return x.trim(); }).filter(Boolean);
    var main = [], subs = [];
    segs.forEach(function(sg){
      var body = sg.replace(/[。]$/, '');
      // v58：詞中每個字後可帶注音（如「饑（ㄐㄧ）饉（ㄐㄧㄣˇ），荒年」）；註釋標題為簡寫時，詞出現在原句中也可拆
      var mm = /^((?:[^，。（）「」『』？！、](?:（[^）]*）)?){1,6})，(.+)$/.exec(body);
      var mw = mm ? mm[1].replace(/（[^）]*）/g, '') : '';
      if (mm && (norm(key).indexOf(norm(mw)) >= 0 || norm(s).indexOf(norm(mw)) >= 0) && norm(mw) !== norm(key)){
        subs.push({ w: mw, a: mm[2] + '。' });
      } else if (!subs.length) main.push(sg);
      else subs[subs.length - 1].a += sg;
    });
    var good = subs.filter(function(x){ return !isZhuyin(x.a.replace(/。$/, '')); });
    if (!good.length || !main.length) return null;
    var vs = [[s.slice(whole[0], whole[1]), whole[0], whole[1], main.join('') + spansOf(html), 'whole']];
    good.forEach(function(x){
      // v58：同字多次出現時，依 NQ_SUB_POS 手動指定整句範圍內第幾個（見檔尾 v58-nq-subpos-js）
      var nth = (window.NQ_SUB_POS || {})[L + '|' + row.no + '|' + x.w], sp = null;
      if (nth){ var from = whole[0]; for (var ni = 0; ni < nth; ni++){ sp = spanOf(s, x.w, from); if (!sp) break; from = sp[1]; } }
      if (!sp) sp = spanOf(s, x.w, whole[0]) || spanOf(s, x.w, 0);
      if (sp) vs.push([x.w, sp[0], sp[1], x.a, 'sub']);
    });
    return vs.length >= 2 ? vs : null;
  }

  var bankCache = {};
  function buildLesson(L){
    if (bankCache[L]) return bankCache[L];
    var bank = (typeof wkBuildNoteBank === 'function') ? wkBuildNoteBank(L) : [];
    var rows = [];
    ((TEXTBOOK[L] || {}).textPages || []).forEach(function(seg){
      var notes = seg.notes || [];
      (seg.lines || []).forEach(function(line){
        var t = line.text || '', re = /\{n:(\d+)\|/g, m;
        while ((m = re.exec(t))){
          var i = m.index + m[0].length, d = 1, raw = '';
          while (i < t.length && d > 0){ var c = t[i]; if (c === '{') d++; else if (c === '}'){ d--; if (!d) break; } raw += c; i++; }
          var w = clean(raw);
          rows.push({ no: +m[1], word: w, sentence: strip(t), pos: strip(t.slice(0, m.index)).length, note: findNote(w, notes) });
        }
      });
    });
    rows.sort(function(a, b){ return a.no - b.no; });
    var items = [], pos = [], vars = {}, r = 0;
    bank.forEach(function(b, bi){
      while (r < rows.length && !(rows[r].no === b.no && rows[r].sentence === b.sentence && rows[r].word === b.word)) r++;
      var row = rows[r++];
      items.push([b.no, b.word, b.sentence, b.answer]);
      pos.push(row && row.sentence.substr(row.pos, b.word.length) === b.word ? row.pos : b.sentence.indexOf(b.word));
      var vs = buildVariants(row, L);
      if (vs) vars[bi] = vs;
    });
    // v59：收集本課所有 bk-note（補充）純文字，小考答案顯示時去除
    var bk = [];
    ((TEXTBOOK[L] || {}).textPages || []).forEach(function(seg){ (seg.notes || []).forEach(function(n){
      (String(n[1]).match(/<span class='bk-note'>[\s\S]*?<\/span>/g) || []).forEach(function(h){ bk.push(h.replace(/<[^>]+>/g, '')); });
    }); });
    return (bankCache[L] = { lesson: L, items: items, pos: pos, vars: vars, bk: bk });
  }
  function eligibleLessons(){
    var seen = {}, out = [];
    [].concat(typeof WK_14 !== 'undefined' ? WK_14 : [], typeof WK_EXTRA !== 'undefined' ? WK_EXTRA : [], typeof WK_PROSE !== 'undefined' ? WK_PROSE : [])
      .forEach(function(k){
        if (seen[k]) return; seen[k] = true;
        var e = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK[k] : null;
        if (e && Array.isArray(e.textPages) && e.textPages.length) out.push(k);
      });
    return out;
  }

  /* ───────── 小工具 ───────── */
  function $(id){ return document.getElementById('nq2-' + id); }
  var LS = {
    get: function(k, d){ try{ var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
    set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function byIdx(a, b){ return a - b; }

  var LESSONS = [], D = null;   // D = 目前課次 buildLesson() 結果
  var sel = [], excl = new Set(), must = new Set(), mode = 'pick';
  function items(){ return D ? D.items : []; }
  function itemKey(it){ return it[0] + '|' + it[1]; }
  function exKey(){ return 'nq-excl:' + D.lesson; }
  function muKey(){ return 'nq-must:' + D.lesson; }
  function varCount(i){ return (D.vars[i] || []).length; }
  function chipLabel(i){ return varCount(i) ? D.vars[i][0][0] : items()[i][1]; }

  function loadMarks(){
    var ex = new Set(LS.get(exKey(), [])), mu = new Set(LS.get(muKey(), []));
    excl = new Set(); must = new Set();
    items().forEach(function(it, i){
      if (ex.has(itemKey(it))) excl.add(i);
      else if (mu.has(itemKey(it))) must.add(i);
    });
  }
  function saveMarks(){
    LS.set(exKey(), Array.from(excl).map(function(i){ return itemKey(items()[i]); }));
    LS.set(muKey(), Array.from(must).map(function(i){ return itemKey(items()[i]); }));
  }
  function withMust(arr){ return Array.from(new Set(Array.from(must).concat(arr))).sort(byIdx); }

  /* ───────── 選題畫面 ───────── */
  function setLesson(L){
    D = buildLesson(L);
    loadMarks();
    sel = Array.from(must).sort(byIdx);
    var nos = items().map(function(it){ return it[0]; });
    $('ra').value = nos.length ? Math.min.apply(null, nos) : 1;
    $('rb').value = nos.length ? Math.max.apply(null, nos) : 1;
    LS.set('nq-lesson', L);
    render();
  }
  var HINTS = {
    pick: '點題目＝選入／取消；也可以用上方「範圍全選」或「隨機抽」。必考題一定會在裡面，排除題一定不會被抽到。',
    must: '必考模式：點題目＝設為必考／取消。隨機抽題時必考題一定抽到，剩下的名額才隨機補。標記會自動記住。',
    ex:   '排除模式：點題目＝排除／恢復（例如已經考過的）。排除紀錄會自動記住，下次打開還在。'
  };
  function render(){
    if (!items().length){
      $('grid').innerHTML = '<div class="empty">這一課目前沒有可抽題的註釋資料。</div>';
    } else {
      $('grid').innerHTML = items().map(function(it, i){
        var on = sel.indexOf(i) >= 0, ex = excl.has(i), mu = must.has(i);
        return '<button type="button" class="chip' + (on ? ' on' : '') + (ex ? ' ex' : '') + (mu ? ' must' : '') + '" data-i="' + i + '">' +
          '<span class="no">' + it[0] + '</span><span class="w serif">' + esc(chipLabel(i)) + '</span>' +
          (varCount(i) ? '<span class="vc">' + varCount(i) + '選1</span>' : '') + '</button>';
      }).join('');
    }
    var nEx = excl.size, nMu = must.size;
    var tags = [nMu ? '必考 ' + nMu : '', nEx ? '排除 ' + nEx : ''].filter(Boolean).join('・');
    $('cnt').textContent = '已選 ' + sel.length + ' 題' + (tags ? '（' + tags + '）' : '');
    $('bGo').disabled = !sel.length;
    $('bGo').style.opacity = sel.length ? 1 : .4;
    $('bUnex').style.display = (nEx || nMu) ? '' : 'none';
    $('hint').textContent = HINTS[mode];
  }
  function setMode(m){
    mode = m;
    $('mPick').className = m === 'pick' ? 'on' : '';
    $('mMust').className = m === 'must' ? 'on mu' : '';
    $('mEx').className = m === 'ex' ? 'on ex' : '';
    render();
  }
  function rangePool(){
    var a = +$('ra').value || 1, b = +$('rb').value || a;
    var lo = Math.min(a, b), hi = Math.max(a, b);
    return items().map(function(it, i){ return i; }).filter(function(i){ return items()[i][0] >= lo && items()[i][0] <= hi && !excl.has(i); });
  }

  /* ───────── 考卷畫面 ───────── */
  // 句子太長時只顯示目標所在的小句（以。！？；切），前後加「…」；目標跨小句就顯示整句
  function excerpt(s, a, b){
    var full = { pre: s.slice(0, a), w: s.slice(a, b), post: s.slice(b), cutL: false, cutR: false };
    if (a < 0 || s.length <= 30) return full;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return full;
    var acc = 0;
    for (var k = 0; k < parts.length; k++){
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return { pre: p.slice(0, a - acc), w: s.slice(a, b), post: p.slice(b - acc), cutL: k > 0, cutR: k < parts.length - 1 };
      acc = end;
    }
    return full;
  }
  // 決定這一題考什麼：有多個選項就等機率隨機挑一個
  // v59：小考答案不顯示補充（bk-note），只留課本正式註釋（注音 zy-note 照舊）
  function noBk(h){
    h = String(h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, '');
    (D.bk || []).forEach(function(x){ if (x) h = h.split(x).join(''); });
    return h;
  }
  function pickVariant(i){
    var it = items()[i], vs = D.vars[i];
    if (vs){ var v = vs[Math.floor(Math.random() * vs.length)]; return { w: v[0], a: v[1], b: v[2], ans: noBk(v[3]), whole: v[4] === 'whole' }; }
    var at = D.pos[i];
    return { w: it[1], a: at, b: at < 0 ? -1 : at + it[1].length, ans: noBk(it[3]), whole: false };
  }
  function startQuiz(){
    var q = $('shuffle').checked ? shuffle(sel) : sel.slice().sort(byIdx);
    $('qTitle').innerHTML = '〈' + esc(D.lesson.split('—')[0]) + '〉註釋小考<small>共 ' + q.length + ' 題・點題目看答案</small>';
    $('qlist').innerHTML = q.map(function(i, k){
      var it = items()[i], s = it[2], v = pickVariant(i);
      var x = v.a < 0 ? { pre: s, w: '', post: '', cutL: false, cutR: false } : excerpt(s, v.a, v.b);
      return '<article class="qc">' +
        '<div class="qn">' + (k + 1) + '</div>' +
        '<div class="qb">' +
          '<div class="qs serif">' + (x.cutL ? '<span class="el">…</span>' : '') + esc(x.pre) +
            (x.w ? '<mark>' + esc(x.w) + '</mark>' : '') + esc(x.post) + (x.cutR ? '<span class="el">…</span>' : '') +
            '<span class="src">註' + it[0] + '</span></div>' +
          '<div class="qa"><span class="qa-hint">點一下看答案</span>' +
            '<div class="qa-body"><span class="aw">' + (v.whole ? '整句' : esc(v.w)) + '：</span>' + v.ans + '</div></div>' +
        '</div></article>';
    }).join('') + (q.length > 5 ? '<div class="qend">— 共 ' + q.length + ' 題，以上 —</div>' : '');
    syncAllBtn();
    $('quiz').classList.add('show');
    $('qlist').scrollTop = 0;
  }
  function cards(){ return Array.prototype.slice.call(document.querySelectorAll('#nq2 .qc')); }
  function syncAllBtn(){
    var cs = cards();
    $('bAll').textContent = cs.length && cs.every(function(c){ return c.classList.contains('open'); }) ? '全部隱藏答案' : '全部顯示答案';
  }
  var fs = LS.get('nq-fs', 1);
  function applyFs(){ document.getElementById('nq2').style.setProperty('--q-fs', fs); LS.set('nq-fs', fs); }
  function syncDarkBtn(){ $('dark').textContent = document.body.classList.contains('dark-mode') ? '淺色' : '深色'; }

  /* ───────── 開關 ───────── */
  function nq2Open(){
    var old = document.getElementById('note-quiz-panel'); if (old) old.classList.remove('open');
    LESSONS = eligibleLessons();
    $('lesson').innerHTML = LESSONS.map(function(k, i){
      return '<option value="' + i + '">' + esc(k) + '（' + buildLesson(k).items.length + ' 題）</option>';
    }).join('');
    var last = LS.get('nq-lesson', LESSONS[0]);
    var li = Math.max(0, LESSONS.indexOf(last));
    $('lesson').value = li;
    applyFs(); syncDarkBtn();
    $('quiz').classList.remove('show');
    if (LESSONS.length) setLesson(LESSONS[li]);
    document.getElementById('nq2').classList.add('open');
  }
  function nq2Close(){ document.getElementById('nq2').classList.remove('open'); }

  function init(){
    $('grid').addEventListener('click', function(e){
      var b = e.target.closest('.chip'); if (!b) return;
      var i = +b.dataset.i;
      if (mode === 'pick'){
        if (excl.has(i) || must.has(i)) return;   // 必考／排除題要到各自模式才能改
        sel = sel.indexOf(i) >= 0 ? sel.filter(function(x){ return x !== i; }) : sel.concat(i);
      } else if (mode === 'must'){
        if (must.has(i)){ must.delete(i); sel = sel.filter(function(x){ return x !== i; }); }
        else { must.add(i); excl.delete(i); if (sel.indexOf(i) < 0) sel = sel.concat(i); }
        saveMarks();
      } else {
        if (excl.has(i)) excl.delete(i); else { excl.add(i); must.delete(i); sel = sel.filter(function(x){ return x !== i; }); }
        saveMarks();
      }
      render();
    });
    $('mPick').onclick = function(){ setMode('pick'); };
    $('mMust').onclick = function(){ setMode('must'); };
    $('mEx').onclick = function(){ setMode('ex'); };
    $('bRange').onclick = function(){ sel = withMust(rangePool()); render(); };
    $('bRand').onclick = function(){
      var n = Math.max(1, +$('rn').value || 5);
      var rest = Math.max(0, n - must.size);
      sel = withMust(shuffle(rangePool().filter(function(i){ return !must.has(i); })).slice(0, rest));
      render();
      if (must.size > n) alert('必考題有 ' + must.size + ' 題，超過設定的 ' + n + ' 題，已全部放入。');
    };
    $('bClear').onclick = function(){ sel = Array.from(must).sort(byIdx); render(); };
    $('bUnex').onclick = function(){
      if (confirm('清除這一課所有「必考」和「排除」標記？')){ excl.clear(); must.clear(); saveMarks(); render(); }
    };
    $('lesson').onchange = function(e){ setLesson(LESSONS[+e.target.value]); };
    $('bGo').onclick = function(){ if (sel.length) startQuiz(); };
    $('bBack').onclick = function(){ $('quiz').classList.remove('show'); };
    $('qlist').addEventListener('click', function(e){
      var c = e.target.closest('.qc'); if (!c) return;
      c.classList.toggle('open'); syncAllBtn();
    });
    $('bAll').onclick = function(){
      var cs = cards(), openAll = !cs.every(function(c){ return c.classList.contains('open'); });
      cs.forEach(function(c){ c.classList.toggle('open', openAll); });
      syncAllBtn();
    };
    $('bSm').onclick = function(){ fs = Math.max(.7, +(fs - .1).toFixed(2)); applyFs(); };
    $('bLg').onclick = function(){ fs = Math.min(1.6, +(fs + .1).toFixed(2)); applyFs(); };
    $('dark').onclick = function(){ if (typeof toggleDarkMode === 'function') toggleDarkMode(); syncDarkBtn(); };
    $('close').onclick = nq2Close;

    // 右側「註釋小考」邊籤改開新版（舊 onclick="nqToggle()" 抽屜面板不再使用）
    var tab = document.getElementById('note-quiz-tab');
    if (tab){ tab.removeAttribute('onclick'); tab.onclick = nq2Open; }
  }

  /* ───────── 面板打開時隱藏右側邊籤 ───────── */
  function initSideTabHide(){
    var ids = ['cls-panel', 'display-panel', 'note-quiz-panel'];
    var panels = ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);
    function sync(){
      var any = panels.some(function(p){ return p.classList.contains('open'); });
      document.body.classList.toggle('v56-panel-open', any);
    }
    var mo = new MutationObserver(sync);
    panels.forEach(function(p){ mo.observe(p, { attributes: true, attributeFilter: ['class'] }); });
    sync();
    // 投影模式開關 → body.v56-proj-open（投影時「註釋小考」邊籤移到第 5 格，避開「畫筆」）
    var fs = document.getElementById('wk-fullscreen');
    if (fs){
      // wkOpenProj()/wkCloseProj() 直接改 fs.style.display，所以看實際是否顯示，class 與 style 都監聽
      var syncProj = function(){ document.body.classList.toggle('v56-proj-open', getComputedStyle(fs).display !== 'none'); };
      new MutationObserver(syncProj).observe(fs, { attributes: true, attributeFilter: ['class', 'style'] });
      syncProj();
    }
  }

  /* ───────── 投影畫筆：改名「畫筆」、工具列移到下方換頁列、橡皮擦 ───────── */
  function initInk(){
    var tab = document.getElementById('wk-ink-tab');
    if (tab){ tab.textContent = '畫筆'; tab.setAttribute('aria-label', '開啟或關閉畫筆'); }

    // 工具列開關文字由 wkInkToggle()/wkCloseProj() 寫入「✎ 畫記／✎ 關閉畫記」，統一改成「畫筆」
    var toggle = document.getElementById('wk-ink-toggle');
    if (toggle){
      var fixText = function(){ if (toggle.textContent.indexOf('畫記') >= 0) toggle.textContent = toggle.textContent.replace(/畫記/g, '畫筆'); };
      new MutationObserver(fixText).observe(toggle, { childList: true, characterData: true, subtree: true });
      fixText();
    }

    var layer = document.getElementById('wk-ink-layer');
    var tb = document.getElementById('wk-ink-toolbar');
    var extra = document.getElementById('wk-ink-extra');
    var canvas = document.getElementById('wk-ink-canvas');
    var fs = document.getElementById('wk-fullscreen');
    var st = window.wkInkState;
    if (!layer || !tb || !extra || !toggle || !canvas || !fs || !st) return;

    // 左組：關閉畫筆／撤銷／清除本頁／橡皮擦；右組（原 #wk-ink-extra）：顏色、螢光筆、細、中
    var left = document.createElement('div'); left.id = 'wk-ink-grp-l';
    tb.insertBefore(left, tb.firstChild);
    left.appendChild(toggle);
    Array.prototype.slice.call(extra.querySelectorAll('.wk-ink-btn')).forEach(function(b){
      if (/撤銷|清除本頁/.test(b.textContent)) left.appendChild(b);
    });
    var er = document.createElement('button');
    er.type = 'button'; er.id = 'wk-ink-eraser'; er.className = 'wk-ink-btn'; er.textContent = '橡皮擦';
    left.appendChild(er);

    // 畫布只涵蓋投影內容區（標題列下緣 ～ 換頁列上緣），換頁列留給工具列與 ←→
    function fitInk(){
      var on = layer.classList.contains('active') && getComputedStyle(fs).display !== 'none';
      var head = fs.querySelector('.wkfs-header'), foot = fs.querySelector('.wkfs-footer');
      if (on && head && foot){
        var top = head.getBoundingClientRect().bottom, f = foot.getBoundingClientRect().top;
        canvas.style.top = top + 'px'; canvas.style.bottom = 'auto';
        canvas.style.height = Math.max(1, f - top) + 'px';
        layer.style.setProperty('--v56-foot-h', Math.max(44, Math.round(window.innerHeight - f)) + 'px');
      } else {
        canvas.style.top = ''; canvas.style.bottom = ''; canvas.style.height = '';
      }
      if (typeof wkInkSetupCanvas === 'function') wkInkSetupCanvas();
    }
    new MutationObserver(function(){ fitInk(); if (!layer.classList.contains('active')) setEraser(false); })
      .observe(layer, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function(){ if (layer.classList.contains('active')) fitInk(); });

    // 橡皮擦：畫筆色設成透明當「擦除軌跡」，軌跡掃過的筆畫整筆刪除；放開後移除擦除軌跡本身
    var ERASE = 'rgba(0,0,0,0)', saved = null;
    function setEraser(on){
      if (on){
        if (!saved) saved = { color: st.color, size: st.size };
        st.color = ERASE; st.size = 1;
        er.classList.add('on');
        document.querySelectorAll('.wk-ink-color').forEach(function(x){ x.classList.remove('on'); });
      } else if (saved){
        if (st.color === ERASE){           // 從橡皮擦改按「細／中」→ 恢復原本的顏色
          st.color = saved.color;
          document.querySelectorAll('.wk-ink-color').forEach(function(x){ x.classList.toggle('on', x.dataset.color === st.color); });
        }
        if (st.size === 1) st.size = saved.size; // 從橡皮擦改按顏色 → 恢復原本的粗細
        saved = null;
        er.classList.remove('on');
      }
    }
    er.addEventListener('click', function(){ setEraser(!er.classList.contains('on')); });
    ['wkInkColor', 'wkInkHighlighter', 'wkInkSetSize'].forEach(function(name){
      var orig = window[name];
      if (typeof orig === 'function') window[name] = function(){ var r = orig.apply(this, arguments); setEraser(false); return r; };
    });

    function segDist(px, py, ax, ay, bx, by){
      var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
      var x = ax + t * dx - px, y = ay + t * dy - py;
      return Math.sqrt(x * x + y * y);
    }
    // 擦除：檢查「上一點 → 這一點」整段路徑（每 6px 取一點），手指／筆快速滑過也不會漏擦
    var lastPt = null;
    function eraseAt(e){
      var r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      var probes = [[px, py]];
      if (lastPt){
        var dx = px - lastPt[0], dy = py - lastPt[1], n = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 6);
        for (var m = 1; m < n; m++) probes.push([lastPt[0] + dx * m / n, lastPt[1] + dy * m / n]);
      }
      lastPt = [px, py];
      var arr = wkInkCurrentStrokes(), hit = false;
      for (var k = arr.length - 1; k >= 0; k--){
        var s0 = arr[k];
        if (!s0 || s0.color === ERASE || !s0.points) continue;
        var R = 16 + (s0.size || 3) / 2, pts = s0.points, gone = false;
        for (var q = 0; q < pts.length && !gone; q++){
          var a = pts[q], b = pts[q + 1] || a;
          for (var z = 0; z < probes.length; z++){
            if (segDist(probes[z][0], probes[z][1], a.x * r.width, a.y * r.height, b.x * r.width, b.y * r.height) <= R){ gone = true; break; }
          }
        }
        if (gone){ arr.splice(k, 1); hit = true; }
      }
      if (hit) wkInkRedraw();
    }
    function erasing(){ return st.active && st.color === ERASE; }
    canvas.addEventListener('pointerdown', function(e){ lastPt = null; if (erasing()) eraseAt(e); });
    canvas.addEventListener('pointermove', function(e){ if (erasing() && (e.buttons || st.drawing)) eraseAt(e); });
    var cleanup = function(){
      lastPt = null;
      setTimeout(function(){
        var arr = wkInkCurrentStrokes();
        for (var k = arr.length - 1; k >= 0; k--) if (arr[k] && arr[k].color === ERASE) arr.splice(k, 1);
        wkInkRedraw();
      }, 0);
    };
    canvas.addEventListener('pointerup', cleanup);
    canvas.addEventListener('pointercancel', cleanup);
  }

  window.nq2Open = nq2Open;
  window.nq2Close = nq2Close;
  window.nqToggle = nq2Open;          // 覆蓋 v55 的 nqToggle（實際生效版本＝本段）
  window.nq2BuildLesson = buildLesson;

  function boot(){ init(); initSideTabHide(); initInk(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
