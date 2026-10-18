/* V136 閱讀測驗「原文全螢幕」（老師 10/18：文言文閱讀測驗要有只顯示題目原文的全螢幕頁，專心講解文章）。
   ・對象：習作／A卷題組的 .aq-psg（內文 .aq-psgb）、補充講義左右版的 .hd-split-psg。
   ・只在「文言文」題幹加按鈕：文言虛詞比例高、白話常用字（的、了、們…）比例低。判斷時語譯（補充講義 .hd-note、習作／A卷的「語譯」展開區 details）不算。
   ・按鈕不改投影片順序（不新增頁），點了蓋一層全螢幕只顯示原文；✕ 或 Esc 關閉，A−／A+ 調字級。 */
(function () {
  'use strict';
  var WY = /[之乎者也矣焉哉曰其而於以則乃亦豈蓋夫兮爾吾汝矣邪耶]/g;
  var BH = /[的了們這那嗎呢很都沒]/g;
  /* 自動判斷不準的個別題幹（比對去標點後的開頭文字）：10/18 全課 80 頁題組逐一核對後指定 */
  var FORCE_ON = ['龍焙今年絕品'];                  /* 〈珍奶〉補充講義：蘇軾、黃庭堅茶詞（詞裡有「減了」） */
  var FORCE_OFF = ['統測試題精選作者', '主旨修正連鎖飲料'];   /* 〈論語選〉統測表格、〈珍奶〉習作公文 */
  function plain(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('.hd-note,details,.rd-fsbtn,.aq-psgh,.tp-gd,figcaption,.aq-imgtip').forEach(function (x) { x.remove(); });
    return (c.textContent || '').replace(/[\s　，。、；：「」『』！？（）()…—─,.\d]/g, '');
  }
  function isClassical(t) {
    if (t.length < 20) return false;
    var wy = (t.match(WY) || []).length, bh = (t.match(BH) || []).length;
    return bh / t.length < 0.012 && (wy / t.length >= 0.03 || bh === 0);   /* 詩詞虛詞少：完全沒有白話常用字也算 */
  }
  var scale = 1;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* V136 二改（老師 10/18）：
     ① 標題＝題號＋頁碼：A卷「A卷 第 N 題」（同一篇題組「第 a～b 題」）、習作「習作 ＋小標」、補充講義「補充講義 ＋標題＋頁碼」。
     ② 一句一句排：原文一句、下面接該句語譯（不同顏色），語譯預設收起，點句子才顯示；上方「全部語譯」一次開關。
        語譯只用教材原有的：習作／A卷題幹內的「語譯」展開區、A卷的語譯欄（aQuiz.trans）、補充講義的「語譯：」說明。沒有語譯就只逐句列原文。
        原文與語譯句數不同時，依字數比例自動把相鄰句子合併對齊（1:1、2:1、1:2）。 */
  function curSlide() { return (typeof wkSlides !== 'undefined' && typeof wkIdx !== 'undefined') ? wkSlides[wkIdx] : null; }
  function label(src) {
    var sl = src.closest('.wk-slide'), sd = curSlide();
    if (sl && sl.classList.contains('wks-aq')) {
      if (sd && sd.type === 'aq' && sd.q) {
        var ns = [], i = wkIdx;
        while (i > 0 && wkSlides[i - 1].type === 'aq' && wkSlides[i - 1].q.psg === sd.q.psg) i--;
        for (; i < wkSlides.length && wkSlides[i].type === 'aq' && wkSlides[i].q.psg === sd.q.psg; i++) ns.push(wkSlides[i].q.n);
        return 'A卷　第 ' + (ns.length > 1 ? ns[0] + '～' + ns[ns.length - 1] : ns[0]) + ' 題';
      }
      var no = sl.querySelector('.aq-no'); return 'A卷　' + (no ? no.textContent.replace(/\s*\/.*$/, '') : '');
    }
    if (sl && sl.classList.contains('wks-work')) {
      var h = sl.querySelector('.wk-head'), ht = h ? h.textContent.replace(/[（(]每[題格][^）)]*[）)]/g, '').replace(/\s+/g, ' ').trim() : '';
      var m = /閱讀測驗.*$/.exec(ht); return '習作　' + (m ? m[0].replace(/\s+/g, '') : ht);
    }
    if (sl && sl.classList.contains('wks-hd2')) {
      var t = sl.querySelector('.hd-title'), pg = sl.querySelector('.hd-page');
      return '補充講義　' + (t ? t.textContent.replace(/[\s　]+/g, ' ').trim() : '') + (pg ? '　' + pg.textContent.replace(/^補充講義\s*/, '') : '');
    }
    return '原　文';
  }
  function transOf(src) {
    var d = src.querySelector('details');
    if (d) { var c = d.cloneNode(true); var s = c.querySelector('summary'); if (s) s.remove(); return c.textContent; }
    var sd = curSlide();
    if (sd && sd.type === 'aq' && sd.q && sd.q.trans && src.closest('.wks-aq')) return String(sd.q.trans).replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
    var sl = src.closest('.wk-slide'), hn = sl ? [].filter.call(sl.querySelectorAll('.hd-note'), function (x) { return /^\s*語譯/.test(x.textContent); }) : [];
    if (hn.length) return hn.map(function (x) { return x.textContent.replace(/^\s*語譯：?/, ''); }).join('');
    return '';
  }
  function sentences(t) {
    var out = [], buf = '', q = 0;
    t = String(t).replace(/[ \t\r\n　]+/g, '');
    for (var i = 0; i < t.length; i++) {
      var ch = t[i]; buf += ch;
      if (ch === '「' || ch === '『') q++; else if ((ch === '」' || ch === '』') && q > 0) q--;
      var end = /[。！？?!]/.test(ch) && !/[。！？?!」』）)]/.test(t[i + 1] || '');   /* 半形 ?! 也算句尾（〈世說〉A卷有半形問號） */
      if (/[」』）)]/.test(ch) && /[。！？?!]/.test(t[i - 1] || '') && !/[」』）)]/.test(t[i + 1] || '')) end = true;
      if (end) { out.push(buf); buf = ''; }
    }
    if (buf.replace(/[「」『』（）()…—]/g, '').length) out.push(buf);
    return out;
  }
  /* 依字數比例對齊（Gale–Church 簡化版）：回傳 [[原文句…], [語譯句…]] 的配對 */
  function align(A, B) {
    var la = A.map(function (s) { return s.length; }), lb = B.map(function (s) { return s.length; });
    var r = (lb.reduce(function (a, b) { return a + b; }, 0) || 1) / (la.reduce(function (a, b) { return a + b; }, 0) || 1);
    var n = A.length, m = B.length, INF = 1e9, D = [], P = [], i, j;
    for (i = 0; i <= n; i++) { D.push([]); P.push([]); for (j = 0; j <= m; j++) { D[i].push(INF); P[i].push(null); } }
    D[0][0] = 0;
    var moves = [[1, 1, 0], [2, 1, 0.35], [1, 2, 0.35], [1, 0, 1.2], [0, 1, 1.2]];   /* 1:0／0:1＝題幹後附的說明、選項等對不到語譯的句子，單獨列出不硬配 */
    for (i = 0; i <= n; i++) for (j = 0; j <= m; j++) {
      if (D[i][j] >= INF) continue;
      moves.forEach(function (mv) {
        var a = i + mv[0], b = j + mv[1]; if (a > n || b > m) return;
        var x = 0, y = 0, k; for (k = i; k < a; k++) x += la[k]; for (k = j; k < b; k++) y += lb[k];
        var c = D[i][j] + Math.abs(y - r * x) / (y + r * x + 1) + mv[2];
        if (c < D[a][b]) { D[a][b] = c; P[a][b] = [i, j]; }
      });
    }
    if (D[n][m] >= INF) return null;
    var pairs = []; i = n; j = m;
    while (i > 0 || j > 0) { var p = P[i][j]; pairs.unshift([A.slice(p[0], i), B.slice(p[1], j)]); i = p[0]; j = p[1]; }
    return pairs;
  }
  function open(src) {
    close();
    var box = document.createElement('div'); box.id = 'rd-fs';
    box.innerHTML = '<div class="rd-bar"><span class="rd-tt"></span><span class="rd-sp"></span>' +
      '<button type="button" data-a="t" class="rd-tall">全部語譯</button>' +
      '<button type="button" data-a="-">A−</button><button type="button" data-a="+">A+</button>' +
      '<button type="button" data-a="x">✕ 關閉</button></div><div class="rd-body"><div class="rd-txt"></div></div>';
    box.querySelector('.rd-tt').textContent = label(src);
    var txt = box.querySelector('.rd-txt');
    var c = src.cloneNode(true);
    c.querySelectorAll('.hd-note,details,.rd-fsbtn,.aq-psgh,.aq-imgtip,.tp-gd').forEach(function (x) { x.remove(); });
    var notes = [].map.call(c.querySelectorAll('.aq-src'), function (x) { x.remove(); return x.outerHTML; }).join('');
    c.querySelectorAll('br').forEach(function (x) { x.replaceWith('\n'); });
    /* 出處「（〈篇名〉）」「（《書名》）」之後的文字（選項說明、補充）不是原文：移到最下面附註，不拿去配語譯 */
    var raw = c.textContent, cut = raw.search(/[（(][〈《][^）)]{1,30}[〉》][^）)]{0,20}[）)]/), tail = '';
    if (cut > 20) {   /* 只有出處後面已經沒有文字、或接的是①②說明時才切；(甲)(乙)兩篇中間的出處不切 */
      var after = raw.slice(cut).replace(/^[（(][^）)]*[）)]/, '').replace(/^[\s　]+/, '');
      if (!after || /^[①-⑳]/.test(after)) { tail = raw.slice(cut); raw = raw.slice(0, cut); }
    }
    if (tail) notes = '<div class="aq-src">' + esc(tail.replace(/[ \t\r\n　]+/g, '')) + '</div>' + notes;
    raw = raw.replace(/^[\s　]*[^。！？]{0,40}下文[^。！？：]{0,30}：/, '');   /* 開頭的題目說明（如「小陳在閱讀完下文後……請選出正確的選項：」）不算原文 */
    var A = sentences(raw), tr = transOf(src), B = tr ? sentences(tr) : [];
    var pairs = (A.length && B.length) ? align(A, B) : null;
    if (!pairs) pairs = A.map(function (s) { return [[s], []]; });
    txt.innerHTML = pairs.map(function (p) {
      var t = p[1].join('');
      return '<div class="rd-pair' + (t ? ' has-t' : '') + '"><div class="rd-o">' + esc(p[0].join('')) + '</div>' +
        (t ? '<div class="rd-t">' + esc(t) + '</div>' : '') + '</div>';
    }).join('') + (notes ? '<div class="rd-notes">' + notes + '</div>' : '') +
      (B.length ? '' : '<div class="rd-none">（本篇教材沒有語譯）</div>');
    if (!B.length) box.querySelector('.rd-tall').style.display = 'none';
    box.style.setProperty('--rd-scale', scale);
    box.addEventListener('click', function (e) {
      var pr = e.target.closest && e.target.closest('.rd-pair.has-t');
      if (pr) { pr.classList.toggle('show'); return; }
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'x') return close();
      if (a === 't') {
        var all = box.querySelectorAll('.rd-pair.has-t'), on = [].some.call(all, function (x) { return !x.classList.contains('show'); });
        all.forEach(function (x) { x.classList.toggle('show', on); }); e.target.textContent = on ? '收起語譯' : '全部語譯'; return;
      }
      scale = Math.max(0.6, Math.min(1.8, scale + (a === '+' ? 0.1 : -0.1)));
      box.style.setProperty('--rd-scale', scale);
    });
    document.body.appendChild(box);
  }
  function close() { var b = document.getElementById('rd-fs'); if (b) b.remove(); }
  /* Esc 只關原文（捕獲階段先攔，不讓投影全螢幕跟著關）；方向鍵在原文頁不換投影片 */
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('rd-fs')) return;
    if (e.key === 'Escape') { close(); e.stopImmediatePropagation(); e.preventDefault(); }
    else if (/^Arrow(Left|Right)$|^PageUp$|^PageDown$/.test(e.key)) { e.stopImmediatePropagation(); }
  }, true);

  function mark(root) {
    if (!root) return;
    root.querySelectorAll('.aq-psg, .hd-split-psg').forEach(function (p) {
      if (p.getAttribute('data-rd') != null) return;
      var body = p.classList.contains('aq-psg') ? p.querySelector('.aq-psgb') : p;
      var t = body ? plain(body) : '', head = t.slice(0, 30);
      var ok = !!body && (FORCE_ON.some(function (k) { return head.indexOf(k) >= 0; }) ||
        (isClassical(t) && !FORCE_OFF.some(function (k) { return head.indexOf(k) >= 0; })));
      p.setAttribute('data-rd', ok ? '1' : '0');
      if (!ok) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rd-fsbtn'; b.textContent = '⛶ 原文全螢幕';
      b.addEventListener('click', function (e) { e.stopPropagation(); open(body); });
      var h = p.querySelector('.aq-psgh');
      if (h) h.insertAdjacentElement('afterend', b); else p.insertBefore(b, p.firstChild);
    });
    /* V136（老師 10/18）：A卷題號像頁碼一樣浮在左上角，往下捲也看得到第幾題 */
    root.querySelectorAll('.wks-aq').forEach(function (sl) {
      if (sl.querySelector(':scope > .aq-float')) return;
      var no = sl.querySelector('.aq-no'); if (!no) return;
      var f = document.createElement('div'); f.className = 'aq-float';
      f.textContent = 'A卷　' + no.textContent.replace(/\s*\/.*$/, '').trim();
      sl.insertBefore(f, sl.firstChild);
      dragable(f);
    });
    placeFloat(); updFloat();
  }
  /* 老師 10/18：題號浮框可以拖到任何位置；一般畫面、全螢幕各記一個位置（只存在這台瀏覽器，鍵名 v136_aqf_pos） */
  function posKey(f) { return f.closest('#wkfs-body') ? 'fs' : 'n'; }
  function loadPos() { try { return JSON.parse(localStorage.getItem('v136_aqf_pos') || '{}') || {}; } catch (e) { return {}; } }
  function savePos(o) { try { localStorage.setItem('v136_aqf_pos', JSON.stringify(o)); } catch (e) {} }
  function applyPos(f) {
    var p = loadPos()[posKey(f)]; if (!p) return;
    f.style.left = Math.max(0, Math.min(innerWidth - 60, p.x)) + 'px'; f.style.top = Math.max(0, Math.min(innerHeight - 30, p.y)) + 'px';
  }
  function dragable(f) {
    applyPos(f);
    var sx, sy, ox, oy, on = false;
    f.addEventListener('pointerdown', function (e) {
      on = true; f.classList.add('drag'); f.setPointerCapture(e.pointerId);
      var r = f.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; e.preventDefault(); e.stopPropagation();
    });
    f.addEventListener('pointermove', function (e) {
      if (!on) return;
      f.style.left = Math.max(0, Math.min(innerWidth - f.offsetWidth, ox + e.clientX - sx)) + 'px';
      f.style.top = Math.max(0, Math.min(innerHeight - f.offsetHeight, oy + e.clientY - sy)) + 'px';
    });
    function end(e) {
      if (!on) return; on = false; f.classList.remove('drag');
      var o = loadPos(); o[posKey(f)] = { x: parseFloat(f.style.left) || 0, y: parseFloat(f.style.top) || 0 }; savePos(o);
      document.querySelectorAll('.aq-float').forEach(function (g) { if (g !== f) applyPos(g); });
    }
    f.addEventListener('pointerup', end); f.addEventListener('pointercancel', end);
    f.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  /* 一般畫面：浮框對齊投影框左緣（側欄寬度會變）；全螢幕固定左上 */
  function placeFloat() {
    var a = document.getElementById('wk-slide-area'); if (!a) return;
    var r = a.getBoundingClientRect(); document.documentElement.style.setProperty('--aqf-left', Math.max(8, Math.round(r.left) + 8) + 'px');
  }
  window.addEventListener('resize', placeFloat);
  /* 題目本身的標題列（「A卷 第 N 題 / 共 M 題」）還看得到時不顯示浮框，捲出畫面後才出現（避免重複、也不壓到網站標題列） */
  function updFloat() {
    document.querySelectorAll('.aq-float').forEach(function (f) {
      var sl = f.parentElement, top = sl && sl.querySelector('.as-top'); if (!top) return;
      var fs = sl.closest('#wkfs-body'), lim = fs ? fs.getBoundingClientRect().top : 0;
      f.classList.toggle('on', top.getBoundingClientRect().bottom < lim + 4);
    });
  }
  document.addEventListener('scroll', function () { requestAnimationFrame(updFloat); }, true);
  function scan() { mark(document.getElementById('wk-slide-area')); mark(document.getElementById('wkfs-body')); }
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { clearTimeout(mo.t); mo.t = setTimeout(scan, 60); });
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el) mo.observe(el, { childList: true, subtree: true }); });
  }
  scan();
  window.V136READ = { isClassical: function (el) { return isClassical(plain(el)); }, open: open, close: close };
})();
