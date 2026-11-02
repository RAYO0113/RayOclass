/* V190：〈論語選〉「孔子的一生」地圖動畫（取代舊「周遊列國」長圖頁；老師 11/2）。
   頁面本身是 extras.authorPages「作者·補充｜孔子的一生」，body 只放 <div class="kzl"></div>，本檔負責畫出內容。
   左：示意地圖（只標國名位置，不畫河流）＋小紅點逐站移動、留下軌跡；右：該階段文字說明；上：階段時間軸可點。
   內容依據（不寫在頁面上）：翰林備課用書「作者生平傳略」為主；周遊列國 8 段路線與文字照翰林 PPT（原「周遊列國」頁文字）；
   三民閱讀文選備課用書「孔子生平事略」補翰林沒有的（夾谷、墮三都、北返經陳、弟子守喪）；原「生平軼事」浮框文字（西狩獲麟）。
   出處與差異整理見教學系統專案 docs/交接_20261102_論語選_孔子一生與儒家_待做.md 與 docs/課文盤點/孔子一生與儒家_資料整理.md。 */
(function () {
  /* 地點：經緯度（今地）→ SVG 座標 */
  var PL = {
    '周': { ll: [112.45, 34.62], n: '周（雒邑）' }, '鄭': { ll: [113.74, 34.40], n: '鄭' },
    '衛': { ll: [115.03, 35.76], n: '衛' }, '匡': { ll: [114.67, 35.20], n: '匡', s: 1 },
    '曹': { ll: [115.57, 35.07], n: '曹' }, '宋': { ll: [115.65, 34.41], n: '宋' },
    '魯': { ll: [116.99, 35.58], n: '魯（曲阜）' }, '陬': { ll: [117.17, 35.47], n: '陬邑', s: 1 },
    '齊': { ll: [118.31, 36.81], n: '齊' }, '陳': { ll: [114.88, 33.73], n: '陳' },
    '蔡': { ll: [114.27, 33.26], n: '蔡' }, '楚': { ll: [113.36, 33.62], n: '楚（葉）' }
  };
  /* 標籤位置微調（避免與點、其他字重疊）：[dx, dy, 對齊] */
  var LBL = { '周': [0, -16, 'middle'], '鄭': [0, 30, 'middle'], '衛': [-14, -10, 'end'], '匡': [-12, 6, 'end'], '曹': [14, 6, 'start'],
    '宋': [14, 8, 'start'], '魯': [-14, -12, 'end'], '陬': [12, 18, 'start'], '齊': [0, -16, 'middle'], '陳': [14, 8, 'start'],
    '蔡': [-14, 9, 'end'], '楚': [0, -16, 'middle'] };
  function xy(k) { var ll = PL[k].ll; return [Math.round((ll[0] - 112) * 100 + 40), Math.round((37.2 - ll[1]) * 100 + 20)]; }

  /* g：時間軸分組；tl：時間軸按鈕字；age：右上大字；yr：年代；path：本階段走過的地點（第一個是出發點） */
  var ST = [
    { g: '早年', tl: '出生', age: '出生', yr: '西元前 551 年（魯襄公二十二年）', path: ['陬'], h: '生於魯國陬邑',
      t: '祖先是<b>宋國</b>貴族，因避難來到魯國，家境逐漸衰落。父親<b>叔梁紇</b>晚年與<b>顏徵在</b>生下孔子。孔子名<b>丘</b>，字<b>仲尼</b>。' },
    { g: '早年', tl: '3歲', age: '3 歲', path: ['陬', '魯'], h: '父親去世，遷居曲阜',
      t: '母親帶著孔子遷居魯國國都<b>曲阜</b>的闕里，貧賤度日。魯國是周公的封地，保留許多周禮；孔子小時候玩遊戲，常擺設俎豆等祭器，模仿祭禮。<span class="kzl-q">「為兒嬉戲，常陳俎豆，設禮容。」（《史記．孔子世家》）</span>' },
    { g: '早年', tl: '15歲', age: '15～19 歲', path: ['魯'], h: '志於學、少也賤',
      t: '<span class="kzl-q">「吾十有五而志于學。」（〈為政〉）</span>十六、七歲母親去世；十九歲結婚，生子<b>孔鯉</b>。為了謀生，做過管理倉庫的<b>委吏</b>、牧養牛羊的<b>乘田</b>。<span class="kzl-q">「吾少也賤，故多能鄙事。」（〈子罕〉）</span>' },
    { g: '求學授徒', tl: '問禮', age: '青年', path: ['魯', '周', '魯'], h: '好學善問',
      t: '到周的都城雒邑考察宗廟制度，<b>向老子問禮</b>，向周大夫<b>萇弘</b>問樂；也向郯子學官制、向師襄學琴，連隱士、狂人都虛心求教。' },
    { g: '求學授徒', tl: '30歲', age: '30 歲左右', path: ['魯'], h: '開始講學',
      t: '成為中國歷史上<b>第一位私人興學</b>的教育家。主張<b>有教無類</b>：只要備「束脩」（十條乾肉）之禮就收。弟子有貴族子弟孟懿子、南宮敬叔，也有貧家子弟顏回、子路等。' },
    { g: '求學授徒', tl: '35歲', age: '35 歲', path: ['魯', '齊', '魯'], h: '去魯至齊，接淅而行',
      t: '魯國三桓專權、禮壞樂崩，孔子到齊國。齊景公兩度問政，孔子答<span class="kzl-q">「君君、臣臣、父父、子子」</span>、<span class="kzl-q">「政在節財」</span>。景公想封他尼谿之地，<b>晏嬰</b>反對；孔子<span class="kzl-q">「接淅而行」</span>，匆匆返回魯國。' },
    { g: '從政', tl: '52歲', age: '52 歲', yr: '西元前 501 年（魯定公九年）', path: ['魯'], h: '治魯有方',
      t: '任<b>中都宰</b>，<span class="kzl-q">「一年，四方皆則之」</span>；再升<b>司空</b>、<b>大司寇</b>。夾谷之會讓齊國歸還侵占的土地；推動「墮三都」削弱三桓，功敗垂成。齊國送來女樂，魯君沉溺其中，一連三日不上朝。' },
    { g: '周遊列國', tl: '①', zy: 1, age: '55 歲', path: ['魯', '衛'], h: '由魯到衛',
      t: '魯國辦郊祭，孔子未收到祭肉，知抱負無法實現，離魯去衛，周遊列國自此開始。' },
    { g: '周遊列國', tl: '②', zy: 2, path: ['衛', '匡', '衛'], h: '離衛去陳再返衛',
      t: '離衛去陳途中，因相貌近似殘害匡地的宰相陽貨，而被匡人圍攻，受困於匡邑，解圍後再度返衛。' },
    { g: '周遊列國', tl: '③', zy: 3, path: ['衛', '魯'], h: '離衛返魯',
      t: '因不齒衛靈公耽溺美色，再度離開衛國，回到魯國。' },
    { g: '周遊列國', tl: '④', zy: 4, path: ['魯', '衛'], h: '再返衛國',
      t: '返魯不久，再到衛國，衛靈公雖以禮相待，但未能重用。晉內亂，衛靈公請教孔子作戰之法，孔子僅說自己只聽過祭祀禮儀之事，便離開衛國。' },
    { g: '周遊列國', tl: '⑤', zy: 5, path: ['衛', '曹', '宋', '鄭'], h: '離衛，經曹到宋，再到鄭國',
      t: '離開衛國後，孔子經曹到宋，再到鄭國。期間因批評宋國司馬而險被殺害，逃亡途中與弟子走散，落魄模樣被鄭人稱為「喪家犬」。' },
    { g: '周遊列國', tl: '⑥', zy: 6, path: ['鄭', '陳', '蔡'], h: '陳蔡遊歷',
      t: '由鄭國到陳國後，孔子於陳、蔡間遊歷。' },
    { g: '周遊列國', tl: '⑦', zy: 7, path: ['蔡', '楚', '陳', '衛'], h: '前往楚國',
      t: '應楚昭王之聘，取道陳、蔡前往楚國，卻受困於此，<b>絕糧七日</b>。後楚昭王派軍隊來迎接，始得解除危機。楚昭王過世後，孔子返衛國。' },
    { g: '周遊列國', tl: '⑧', zy: 8, age: '68 歲', yr: '魯哀公十一年', path: ['衛', '魯'], h: '結束周遊列國',
      t: '季康子派人帶著禮物到衛國迎接，孔子自衛返魯，結束長達<b>十四年</b>的周遊列國，從此致力於教育職志。並整理《詩》、《書》，作《春秋》。' },
    { g: '晚年', tl: '71歲', age: '71 歲', path: ['魯'], h: '西狩獲麟',
      t: '晚年整理六經：刪《詩》、《書》，定《禮》、《樂》，作《春秋》。聽聞「西狩獲麟」，嘆<span class="kzl-q">「吾道窮矣」</span>，這年停止修訂《春秋》。妻子、兒子孔鯉、得意門生<b>顏回</b>、跟隨最久的<b>子路</b>相繼去世。' },
    { g: '晚年', tl: '73歲', age: '73 歲', yr: '西元前 479 年（魯哀公十六年）', path: ['魯'], h: '病逝',
      t: '孔子病逝，享年七十三歲。弟子感念師恩，在墓旁建屋守喪<b>三年</b>；三年後各奔東西，只有<b>子貢</b>又多住了三年。後世尊為「至聖先師」、「萬世師表」。' }
  ];

  /* V193：底圖＝今省界（177_v193-kzlmap-data-js.js）＋右下角全中國小地圖（紅框＝本圖範圍）；只作示意，古今疆界不同 */
  var PROV_LBL = [['今山西', 70, 92], ['今河北', 300, 44], ['今河南', 150, 222], ['今山東', 610, 232], ['今江蘇', 640, 392], ['今安徽', 500, 425]];
  function baseMap() {
    var M = window.KZL_MAP; if (!M) return '';
    var s = '<g clip-path="url(#kzl-clip)"><g class="kzl-prov">' + M.prov.map(function (p) { return p.d ? '<path d="' + p.d + '"/>' : ''; }).join('') + '</g>' +
      PROV_LBL.map(function (l) { return '<text class="kzl-prov-n" x="' + l[1] + '" y="' + l[2] + '" text-anchor="middle">' + l[0] + '</text>'; }).join('') + '</g>';
    var ox = 712 - M.iw - 8, oy = 432 - M.ih - 8, b = M.ibox;
    s += '<g class="kzl-inset" transform="translate(' + ox + ',' + oy + ')"><rect class="kzl-inset-bg" x="-6" y="-6" width="' + (M.iw + 12) + '" height="' + (M.ih + 12) + '" rx="6"/>' +
      '<path class="kzl-inset-land" d="' + M.inset + '"/><rect class="kzl-inset-box" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"/></g>';
    return s;
  }
  function svgHTML() {
    var s = '<svg class="kzl-map" viewBox="0 0 720 440" role="img" aria-label="孔子一生行跡示意地圖">' +
      '<defs><clipPath id="kzl-clip"><rect x="2" y="2" width="716" height="436" rx="14"/></clipPath></defs>' +
      '<rect class="kzl-bg" x="2" y="2" width="716" height="436" rx="14"/>' + baseMap() +
      '<text class="kzl-compass" x="40" y="44" text-anchor="middle">北</text><path class="kzl-compass-a" d="M40 50 l-7 16 l7 -5 l7 5 z"/>' +
      '<g class="kzl-trail"></g><polyline class="kzl-cur" points=""/>';
    Object.keys(PL).forEach(function (k) {
      var p = xy(k), L = LBL[k];
      s += '<g class="kzl-pl' + (PL[k].s ? ' sm' : '') + '" data-k="' + k + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (PL[k].s ? 4 : 6) + '"/>' +
        '<text x="' + (p[0] + L[0]) + '" y="' + (p[1] + L[1]) + '" text-anchor="' + L[2] + '">' + PL[k].n + '</text></g>';
    });
    var o = xy('陬');
    s += '<g class="kzl-dot" transform="translate(' + o[0] + ',' + o[1] + ')"><circle class="kzl-halo" r="16"/><circle r="9"/></g></svg>';
    return s;
  }
  function slideHTML() {
    var lastG = '', tl = '';
    ST.forEach(function (s, i) {
      if (s.g !== lastG) { tl += (lastG ? '</span>' : '') + '<span class="kzl-grp"><i class="kzl-grp-head">' + s.g + '</i>'; lastG = s.g; }
      tl += '<button class="kzl-tb' + (s.zy ? ' zy' : '') + '" onclick="kzlGo(this,' + i + ')">' + s.tl + '</button>';
    });
    tl += '</span>';
    return '<div class="kzl-tl">' + tl + '</div>' +
      '<div class="kzl-main"><div class="kzl-mapbox">' + svgHTML() + '</div>' +
      '<div class="kzl-side"><div class="kzl-head"><b class="kzl-age"></b><span class="kzl-yr"></span></div>' +
      '<div class="kzl-title"></div><div class="kzl-txt"></div></div></div>' +
      '<div class="kzl-ctrl"><button class="kzl-btn kzl-prev" onclick="kzlStep(this,-1)">◀ 上一步</button>' +
      '<button class="kzl-btn kzl-next" onclick="kzlStep(this,1)">下一步 ▶</button>' +
      '<button class="kzl-btn" onclick="kzlGo(this,0)">⟳ 從頭</button><span class="kzl-hint-ind"></span></div>';
  }

  function pts(path) { return path.map(xy); }
  function lastAge(i) { for (var j = i; j >= 0; j--) if (ST[j].age) return ST[j].age; return ''; }
  function render(box, i, animate) {
    var S = ST[i], svg = box.querySelector('.kzl-map');
    box.dataset.st = i;
    if (box._raf) cancelAnimationFrame(box._raf);
    box.querySelectorAll('.kzl-tb').forEach(function (b, j) { b.classList.toggle('cur', j === i); b.classList.toggle('done', j < i); });
    /* 右側文字 */
    var age = S.age || lastAge(i);
    box.querySelector('.kzl-age').textContent = S.zy ? '周遊列國 ' + S.tl + (S.age ? '　' + S.age : '') : age;
    var yr = box.querySelector('.kzl-yr'); yr.textContent = S.yr || ''; yr.style.display = S.yr ? '' : 'none';
    box.querySelector('.kzl-title').textContent = S.h;
    box.querySelector('.kzl-txt').innerHTML = S.t;
    box.querySelector('.kzl-prev').disabled = i === 0;
    box.querySelector('.kzl-next').disabled = i === ST.length - 1;
    box.querySelector('.kzl-hint-ind').textContent = (i + 1) + ' / ' + ST.length;
    /* 軌跡：之前各階段（淡）＋本階段（深） */
    var trail = '';
    for (var j = 0; j < i; j++) if (ST[j].path.length > 1) trail += '<polyline points="' + pts(ST[j].path).join(' ') + '"/>';
    svg.querySelector('.kzl-trail').innerHTML = trail;
    var visited = {};
    for (j = 0; j <= i; j++) ST[j].path.forEach(function (k) { visited[k] = 1; });
    svg.querySelectorAll('.kzl-pl').forEach(function (g) {
      g.classList.toggle('on', !!visited[g.dataset.k]);
      g.classList.toggle('here', S.path.indexOf(g.dataset.k) >= 0);
    });
    var P = pts(S.path), cur = svg.querySelector('.kzl-cur'), dot = svg.querySelector('.kzl-dot');
    function place(p) { dot.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')'); }
    if (!animate || P.length < 2) {
      cur.setAttribute('points', P.length > 1 ? P.join(' ') : '');
      place(P[P.length - 1]);
      return;
    }
    /* 動畫：沿路線逐段移動，速度固定（每 100 單位約 0.55 秒） */
    var seg = [], total = 0;
    for (j = 1; j < P.length; j++) { var d = Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]); seg.push(d); total += d; }
    var dur = Math.max(900, total * 5.5) + (P.length - 2) * 250, t0 = null;
    cur.setAttribute('points', P[0].join(','));
    place(P[0]);
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var f = Math.min(1, (ts - t0) / dur), ease = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2, dist = ease * total, done = [P[0]];
      for (var k = 0; k < seg.length; k++) {
        if (dist >= seg[k]) { dist -= seg[k]; done.push(P[k + 1]); continue; }
        var r = seg[k] ? dist / seg[k] : 1, q = [P[k][0] + (P[k + 1][0] - P[k][0]) * r, P[k][1] + (P[k + 1][1] - P[k][1]) * r];
        done.push(q); break;
      }
      cur.setAttribute('points', done.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
      place(done[done.length - 1]);
      if (f < 1) box._raf = requestAnimationFrame(frame);
    }
    box._raf = requestAnimationFrame(frame);
  }
  function boxOf(el) { return el.closest('.kzl'); }
  function stop() { if (window.event) window.event.stopPropagation(); }
  window.kzlStep = function (btn, dir) { stop(); var box = boxOf(btn), i = +box.dataset.st + dir; if (i >= 0 && i < ST.length) render(box, i, dir > 0); };
  window.kzlGo = function (btn, i) { stop(); var box = boxOf(btn); render(box, i, i === +box.dataset.st + 1); };
  function initAll() {
    document.querySelectorAll('.kzl:not([data-init])').forEach(function (box) {
      box.dataset.init = '1';
      box.innerHTML = slideHTML();
      render(box, 0, false);
    });
  }
  new MutationObserver(initAll).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') initAll();
})();
