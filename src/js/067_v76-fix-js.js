
(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ①② 浮框依備課用書再修；③ 補 RAY PPT 第 110、163 張的課文補充（逐一精確替換，次數不符就略過並警告） ── */
  var FIX = [
    [3, 1, '{g:書|寫字}', '{g:書|書本}'],                                   /* 備課用書疑難辨析：本課採「誦讀書本」 */
    [3, 0, '教{g:之|他，指士大夫之子}', '教{g:之|代名詞，他們}'],           /* 備課用書語譯「教育他們」 */
    [3, 0, '則{p:恥|', '{g:則|卻}{p:恥|'],                                  /* PPT 第 110 張：則＝卻 */
    [6, 1, '{n:45|不拘{g:於|', '{n:45|不{g:拘|限制}{g:於|'],               /* PPT 第 163 張：拘＝限制 */
    [6, 1, '{g:作|寫作}', '{g:作|創作}']                                    /* PPT 第 163 張：作＝創作 */
  ];
  FIX.forEach(function (f) {
    try {
      var L = T.textPages[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v76] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v76] 浮框替換失敗：', f[2], e); }
  });
  /* PPT 第 131 張：第五段「彼與彼年相若也……官盛則近諛」加第二條句意（原文照錄） */
  try {
    var L5 = T.textPages[4].lines[2];
    if (L5.cite2 == null && L5.text.indexOf('彼與彼年相若也，道相似也') >= 0) {
      L5.cite2 = '彼與彼年相若也，道相似也。」位卑則足羞，官盛則近諛';
      L5.mean2 = '從年紀、地位兩方面來說明士大夫的求學心態。可對照第二段「無貴無賤，無長無少」';
    } else console.warn('[v76] 第五段句意未加（已有 cite2 或找不到原句）');
  } catch (e) { console.warn('[v76] 第五段句意失敗', e); }

  /* ── 辨析頁「庸」：依備課用書注⑪「豈、何必」 ── */
  (T.charBian || []).forEach(function (c) {
    if (c.name !== '庸') return;
    c.pages.forEach(function (p) {
      var n = p.body.split('>豈</span>').length - 1;
      if (n === 1) p.body = p.body.replace('>豈</span>', '>豈、何必</span>');
      else console.warn('[v76] 庸 辨析頁替換次數不符', n);
    });
  });

  /* ── ④ 總字卡（v54-anno-js）字義措辭與辨析頁統一：開卡後改寫顯示文字（例句、編號不動） ── */
  var MAP = {
    '師': { '有專門技藝的人':'具有專門技藝的人', '學習':'學習、請教' },
    '所以': { '用來（表目的）':'用來', '為何（表原因）':'為何，表原因' },
    '者': { '代詞，……的人':'代名詞，……的人', '助詞，句中表停頓':'助詞，用於句中，表示停頓' },
    '於': { '向':'向，表示趨向', '從、由':'從、由，表示所從', '對於':'對於，表示動作行為的對象',
            '比（引進比較對象）':'比，引進比較對象', '被（表被動）':'被，置於動詞之後，表示被動' },
    '其': { '那些（代詞）':'那些', '大概（推測語氣）':'大概，表示推測語氣', '他、他們（代詞）':'他' },
    '學者': { '古義：求學的人':'古義：學習的人', '今義：學問淵博而有成就的人':'今義：學問淵博而有所成就的人' }
  };
  var ZY = /[˙ㄅ-ㄯㆠ-ㆿ]+[ˊˇˋ]?/g;
  function wrapZhuyin(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) {
      if (n.parentElement && n.parentElement.closest('.v76-zy, rt, .tp-z, .zy-note')) continue;
      ZY.lastIndex = 0;
      if (ZY.test(n.nodeValue)) list.push(n);
    }
    list.forEach(function (t) {
      var frag = document.createDocumentFragment(), s = t.nodeValue, last = 0, m;
      ZY.lastIndex = 0;
      while ((m = ZY.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var sp = document.createElement('span'); sp.className = 'v76-zy'; sp.textContent = m[0]; frag.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  function patchCard() {
    var ttl = document.getElementById('ss-ttl'), body = document.querySelector('#ss-anno-ov #ss-body');
    if (!ttl || !body) return;
    var key = (ttl.textContent.split('：')[1] || '').trim(), mp = MAP[key];
    if (mp) {
      body.querySelectorAll('.ss-given').forEach(function (e) { if (mp[e.textContent]) e.textContent = mp[e.textContent]; });
      body.querySelectorAll('.ss-c-yi .ss-rv').forEach(function (e) {
        var v = e.getAttribute('data-v');
        if (mp[v]) { e.setAttribute('data-v', mp[v]); if (e.classList.contains('open')) e.textContent = mp[v]; }
      });
    }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ss-zong')) setTimeout(patchCard, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function () { var r = _open.apply(this, arguments); patchCard(); return r; };
  }

  /* ── ⑤ 形音義內容（辨析頁、形音義互動卡、課文浮框字義）注音包成不換行 ── */
  var _v76render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v76render.apply(this, arguments);
    try {
      document.querySelectorAll('#wk-slide-area .wks-charbian, #wkfs-body .wks-charbian, #wk-slide-area .wks-charquiz, #wkfs-body .wks-charquiz, #wk-slide-area .tp-gd, #wkfs-body .tp-gd').forEach(wrapZhuyin);
    } catch (e) {}
    return r;
  };
})();
