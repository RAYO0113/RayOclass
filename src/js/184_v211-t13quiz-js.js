/* V211（老師 11/4）：〈論語選〉十三經小考——放在「註釋小考」裡，選〈論語選〉時上方出現「十三經小考」。
   - 選題：13 格照十三經順序（同「十三經的演變」最後一步的今名）；點格子＝設「不抽」（記在本機 nq-t13-ex），按「抽！」從其餘隨機抽 N 格（預設 5）。
   - 考卷：13 格順序打亂；沒抽到的直接顯示書名，抽到的變空格並標題號，點空格（或「全部顯示答案」）看答案。格子一樣寬，不讓字數洩漏答案。
   - 答案不分順序（打亂後看不出哪一格該放哪一部），考卷下方註明。
   - 記錄：沿用 v60「記錄本次小考」（043 的 nqRecOverride 掛勾）、v109 編號（與〈論語選〉註釋小考同一套 L06xx）與訂正規則。
     紀錄 kind:'t13'；每題 { no: 十三經順序 1–13, w/a: 書名, s/x: 十三經全名單, ord: 考卷題號 }。
     學生端（stu115）靠「每題 s ＝ 十三經全名單」認出這種小考（後台 stuGet 只傳固定欄位，kind 傳不過去），顯示「訂正：十三經全抄」。 */
(function () {
  'use strict';
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var BOOKS = ['詩經', '尚書', '周禮', '儀禮', '禮記', '周易', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅', '孟子'];
  var LIST = BOOKS.join('、');
  var EXK = 'nq-t13-ex', NK = 'nq-t13-n';
  var on = false, picked = [], curRec = null;

  function $(id) { return document.getElementById('nq2-' + id); }
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function excl() { var a = jget(EXK, []); return Array.isArray(a) ? a.filter(function (b) { return BOOKS.indexOf(b) >= 0; }) : []; }
  function curLessonText() { var s = $('lesson'); return s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '') : ''; }
  function isLunyu() { return curLessonText() === LESSON; }

  /* ── 選題畫面 ── */
  function paint() {
    var box = $('t13'); if (!box) return;
    var ex = excl();
    box.querySelector('.t13s-grid').innerHTML = BOOKS.map(function (b) {
      var x = ex.indexOf(b) >= 0, p = picked.indexOf(b) >= 0;
      return '<button type="button" class="t13s-c' + (x ? ' ex' : '') + (p ? ' on' : '') + '" data-b="' + esc(b) + '"><span class="nm">' + esc(b) + '</span></button>';
    }).join('');
    var cnt = $('cnt'); if (cnt) cnt.textContent = '已抽 ' + picked.length + ' 格' + (ex.length ? '（不抽 ' + ex.length + ' 格）' : '');
    var go = $('bGo'); if (go) { go.disabled = !picked.length; go.style.opacity = picked.length ? 1 : .4; }
  }
  function draw() {
    var n = Math.max(1, Math.min(13, Math.round(+box().querySelector('#nq2-t13n').value) || 5));
    jput(NK, n);
    var ex = excl(), pool = BOOKS.filter(function (b) { return ex.indexOf(b) < 0; });
    picked = shuffle(pool).slice(0, n);
    paint();
    if (!picked.length) { alert('13 部都設成「不抽」了，沒有可以抽的。'); return; }
    if (pool.length < n) alert('可以抽的只有 ' + pool.length + ' 格（其他設成不抽），已全部抽入。');
    start();   /* V212（老師 11/4）：按「抽！」直接開考，不用再按「開始小考」 */
  }
  function box() { return $('t13'); }
  function setOn(v) {
    on = !!v && isLunyu();
    var root = document.getElementById('nq2'); if (!root) return;
    root.classList.toggle('t13q', on);
    var b = $('t13btn'); if (b) { b.classList.toggle('on', on); b.textContent = on ? '◀ 回註釋小考' : '十三經小考'; }
    if (on) { picked = []; paint(); }
    else { var cnt = $('cnt'); if (cnt) cnt.textContent = ''; var l = $('lesson'); if (l) l.dispatchEvent(new Event('change')); }   /* 回註釋小考：讓原本的選題畫面重畫（已選題數、開始鈕） */
  }
  function syncBtn() { var b = $('t13btn'); if (b) b.style.display = isLunyu() ? '' : 'none'; if (on && !isLunyu()) setOn(false); }

  /* ── 考卷 ── */
  function start() {
    var order = shuffle(BOOKS), k = 0, qs = [];
    var cells = order.map(function (b) {
      if (picked.indexOf(b) < 0) return '<div class="t13q-c"><span class="nm">' + esc(b) + '</span></div>';
      k++;
      qs.push({ no: BOOKS.indexOf(b) + 1, w: b, a: b, s: LIST, x: LIST, ord: k });
      return '<div class="t13q-c blank" data-k="' + k + '"><span class="qn">' + k + '</span><span class="nm">' + esc(b) + '</span></div>';
    }).join('');
    var nos = qs.map(function (q) { return q.no; });
    curRec = { kind: 't13', lesson: LESSON, rangeStart: Math.min.apply(null, nos), rangeEnd: Math.max.apply(null, nos),
      questionKeys: qs.map(function (q) { return 't13|' + q.w; }), questions: qs };
    $('qTitle').innerHTML = '〈論語選〉十三經小考<small>共 ' + k + ' 題・點空格看答案</small>';
    $('qlist').innerHTML = '<div class="t13q-board">' + cells + '</div>' +
      '<div class="t13q-foot">空格裡缺的是哪 ' + k + ' 部？寫出書名就對，<b>不分順序</b></div>';
    syncAll();
    $('quiz').classList.add('show');
    $('qlist').scrollTop = 0;
  }
  function blanks() { return Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist > .t13q-board .t13q-c.blank')); }
  function syncAll() { var bs = blanks(), b = $('bAll'); if (b && bs.length) b.textContent = bs.every(function (c) { return c.classList.contains('open'); }) ? '全部隱藏答案' : '全部顯示答案'; }
  function isT13Quiz() { return !!document.querySelector('#nq2-qlist > .t13q-board'); }   /* V214：加分段（.t13b 裡的 board）不算 */

  /* ── V214（老師 11/5）聯合小考：〈論語選〉註釋小考＋十三經加分 ──
     下方工具列「＋十三經加分 N 格・共 P 分」（N＝0 不加；每次打開註釋小考都回到 0，日曆那筆有設才帶入）。
     註釋考卷出來後，在最後接一段十三經：13 格「照順序」排（詩經→孟子），抽 N 格變空格，題號接在註釋後面；點空格看答案。
     「不抽」設定沿用十三經小考的。註釋題每題 100÷題數 分，加分題共 P 分，標題寫滿分（100＋P）。
     記錄：仍是一筆註釋小考紀錄（編號、訂正、成績都照註釋小考），另外帶 bonus＝{ kind:'t13', pts, questions:[{no,w,a,ord}] }。 */
  var bonusRec = null;
  function bn() { var i = $('t13bn'); return i ? Math.max(0, Math.min(13, Math.round(+i.value) || 0)) : 0; }
  function bp() { var i = $('t13bp'); return i ? Math.max(0, Math.round(+i.value) || 0) : 0; }
  function syncBonusUi() { var w = $('t13bw'); if (w) w.style.display = isLunyu() ? '' : 'none'; }
  function addBonus() {
    var ql = $('qlist'); if (!ql) return;
    var cards = ql.querySelectorAll('.qc');
    if (!cards.length || ql.querySelector('.t13b') || !isLunyu() || on) { if (!ql.querySelector('.t13b')) bonusRec = null; return; }
    var n = bn(); if (!n) { bonusRec = null; return; }
    var ex = excl(), pool = BOOKS.filter(function (b) { return ex.indexOf(b) < 0; });
    var pk = shuffle(pool).slice(0, n), base = cards.length, k = 0, qs = [], pts = bp();
    var cells = BOOKS.map(function (b) {
      if (pk.indexOf(b) < 0) return '<div class="t13q-c"><span class="nm">' + esc(b) + '</span></div>';
      k++;
      qs.push({ no: BOOKS.indexOf(b) + 1, w: b, a: b, ord: base + k });
      return '<div class="t13q-c blank" data-k="' + (base + k) + '"><span class="qn">' + (base + k) + '</span><span class="nm">' + esc(b) + '</span></div>';
    }).join('');
    if (!k) { bonusRec = null; return; }
    bonusRec = { kind: 't13', pts: pts, questions: qs };
    var per = 100 / base, perT = per === Math.round(per) ? '每題 ' + per + ' 分，' : '';
    var sec = document.createElement('div'); sec.className = 't13b';   /* 不用 <section>：全域 section{display:none} */
    sec.innerHTML = '<div class="t13b-h">加分題・十三經' + (pts ? '（共 ' + pts + ' 分）' : '') + '<small>依順序排列，空格寫出書名' +
      '（註釋 ' + base + ' 題' + (perT ? '・' + perT.replace(/，$/, '') : '') + '・共 100 分＋加分 ' + pts + '＝滿分 ' + (100 + pts) + '）</small></div>' +
      '<div class="t13q-board">' + cells + '</div>';
    var end = ql.querySelector('.qend'); if (end) ql.insertBefore(sec, end); else ql.appendChild(sec);
    var t = $('qTitle'), sm = t && t.querySelector(':scope > small');
    if (sm) sm.textContent = base + ' 題＋加分 ' + k + ' 格・滿分 ' + (100 + pts);
  }
  function bonusBlanks() { return Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist .t13b .t13q-c.blank')); }

  /* 日曆「開始小考」用：設好加分格數與分數（之後再出考卷） */
  window.nq2T13Bonus = function (n, pts) {
    var i = $('t13bn'), p = $('t13bp');
    if (i) i.value = Math.max(0, Math.min(13, +n || 0));
    if (p && pts != null) p.value = Math.max(0, +pts || 0);
    syncBonusUi();
  };

  /* 043「記錄本次小考」掛勾：註釋小考紀錄另外帶上十三經加分題 */
  window.nqRecExtra = function () { return bonusRec && document.querySelector('#nq2-qlist .t13b') ? { bonus: JSON.parse(JSON.stringify(bonusRec)) } : null; };

  /* 043「記錄本次小考」掛勾：考卷是十三經時回傳本次紀錄；否則 undefined（走原本註釋小考） */
  window.nqRecOverride = function () { return isT13Quiz() ? JSON.parse(JSON.stringify(curRec)) : undefined; };

  function init() {
    var root = document.getElementById('nq2'), sel = $('lesson'), grid = $('grid');
    if (!root || !sel || !grid || $('t13btn')) return !!$('t13btn');
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'nq2-t13btn'; b.className = 'btn'; b.textContent = '十三經小考';
    sel.parentNode.insertBefore(b, sel.nextSibling);
    b.onclick = function () { setOn(!on); };

    var d = document.createElement('div');
    d.id = 'nq2-t13';
    d.innerHTML = '<div class="t13s-bar"><b class="serif">十三經小考</b><span style="flex:1"></span>' +
      '<span>隨機抽</span><input type="number" id="nq2-t13n" min="1" max="13" value="' + esc(jget(NK, 5)) + '"><span>格</span>' +
      '<button type="button" class="btn dk" data-t="draw">抽！開始小考 ▶</button><button type="button" class="btn" data-t="clr">清除「不抽」</button></div>' +
      '<div class="hint">點書名＝設成「不抽」（考卷上一定直接顯示）；再點一次恢復。按「抽！開始小考」從其餘的書隨機抽，直接出考卷：抽到的變成空格，13 格打亂順序。</div>' +
      '<div class="t13s-grid"></div>';
    grid.parentNode.insertBefore(d, grid.nextSibling);
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]');
      if (t) {
        if (t.getAttribute('data-t') === 'draw') draw();
        else if (confirm('清除所有「不抽」標記？')) { jput(EXK, []); paint(); }
        return;
      }
      var c = e.target.closest('.t13s-c'); if (!c) return;
      var bk = c.getAttribute('data-b'), ex = excl(), i = ex.indexOf(bk);
      if (i >= 0) ex.splice(i, 1); else { ex.push(bk); picked = picked.filter(function (x) { return x !== bk; }); }
      jput(EXK, ex); paint();
    });

    /* 開始小考／全部顯示答案／點空格：十三經時攔下來自己處理（捕獲階段，原本的 onclick 不會執行） */
    root.addEventListener('click', function (e) {
      if (on && e.target.closest('#nq2-bGo')) { e.stopPropagation(); e.preventDefault(); if (picked.length) start(); return; }
      if (!isT13Quiz()) return;
      if (e.target.closest('#nq2-bAll')) {
        e.stopPropagation();
        var bs = blanks(), all = !bs.every(function (c) { return c.classList.contains('open'); });
        bs.forEach(function (c) { c.classList.toggle('open', all); }); syncAll(); return;
      }
      var c = e.target.closest('#nq2-qlist .t13q-c.blank');
      if (c) { c.classList.toggle('open'); syncAll(); }
    }, true);

    /* V214：聯合小考（註釋＋十三經加分）控制項放在下方工具列 */
    var dock = root.querySelector('.dock'), go0 = $('bGo');
    if (dock && go0) {
      var w = document.createElement('span'); w.id = 'nq2-t13bw';
      w.innerHTML = '＋十三經加分<input type="number" id="nq2-t13bn" min="0" max="13" value="0">格・共<input type="number" id="nq2-t13bp" min="0" value="' + esc(jget('nq-t13-bp', 20)) + '">分';
      dock.insertBefore(w, go0);
      w.addEventListener('change', function (e) { if (e.target.id === 'nq2-t13bp') jput('nq-t13-bp', bp()); });
    }
    new MutationObserver(addBonus).observe($('qlist'), { childList: true });
    $('qlist').addEventListener('click', function (e) {
      var c = e.target.closest('.t13b .t13q-c.blank'); if (c) c.classList.toggle('open');
    });
    $('bAll').addEventListener('click', function () {   /* 等 036 切好註釋題卡，加分格跟著一樣 */
      if (isT13Quiz()) return;
      setTimeout(function () {
        var cs = Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist .qc'));
        var o = cs.length && cs.every(function (c) { return c.classList.contains('open'); });
        bonusBlanks().forEach(function (c) { c.classList.toggle('open', !!o); });
      }, 0);
    });

    sel.addEventListener('change', function () { if (on) setOn(false); syncBtn(); syncBonusUi(); });
    var wasOpen = root.classList.contains('open');   /* 只在面板「剛打開」時回到註釋小考（自己切 t13q class 也會觸發） */
    new MutationObserver(function () {
      var o = root.classList.contains('open');
      if (o && !wasOpen) { if (on) setOn(false); syncBtn(); var bi = $('t13bn'); if (bi) bi.value = 0; syncBonusUi(); }   /* V214：每次打開都不加考 */
      wasOpen = o;
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    syncBtn(); syncBonusUi();
    return true;
  }
  (function tryInit(n) { if (!init() && n < 40) setTimeout(function () { tryInit(n + 1); }, 500); })(0);
})();
