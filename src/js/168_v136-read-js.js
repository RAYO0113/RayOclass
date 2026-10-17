/* V136 閱讀測驗「原文全螢幕」（老師 10/18：文言文閱讀測驗要有只顯示題目原文的全螢幕頁，專心講解文章）。
   ・對象：習作／A卷題組的 .aq-psg（內文 .aq-psgb）、補充講義左右版的 .hd-split-psg。
   ・只在「文言文」題幹加按鈕：文言虛詞比例高、白話常用字（的、了、們…）比例低。語譯（補充講義 .hd-note、習作／A卷的「語譯」展開區 details）不算，原文全螢幕也不顯示語譯。
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
  function open(src) {
    close();
    var box = document.createElement('div'); box.id = 'rd-fs';
    box.innerHTML = '<div class="rd-bar"><span class="rd-tt">原　文</span><span class="rd-sp"></span>' +
      '<button type="button" data-a="-">A−</button><button type="button" data-a="+">A+</button>' +
      '<button type="button" data-a="x">✕ 關閉</button></div><div class="rd-body"><div class="rd-txt"></div></div>';
    var txt = box.querySelector('.rd-txt');
    var c = src.cloneNode(true);
    c.querySelectorAll('.hd-note,details,.rd-fsbtn,.aq-psgh,.aq-imgtip').forEach(function (x) { x.remove(); });
    txt.innerHTML = c.innerHTML;
    box.style.setProperty('--rd-scale', scale);
    box.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'x') return close();
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
  }
  function scan() { mark(document.getElementById('wk-slide-area')); mark(document.getElementById('wkfs-body')); }
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { clearTimeout(mo.t); mo.t = setTimeout(scan, 60); });
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el) mo.observe(el, { childList: true, subtree: true }); });
  }
  scan();
  window.V136READ = { isClassical: function (el) { return isClassical(plain(el)); }, open: open, close: close };
})();
