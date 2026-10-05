
(function () {
  if (!TEXTBOOK['師說']) return;

  /* ── ① 字詞辨析頁：內容逐字取自 RAY PPT（暫存資料/04.第四課 師說 RAY1.pptx 義辨／形辨頁）；
        「之」依老師指定格式、分類經備課用書語譯與夾注核對；
        與備課用書不同處依備課用書（見 docs/交接_V75*.md）。 ── */
  var CB = [
    { name:'之', pages:[{ sub:'義辨', groups:[{ x:'之', rows:[
      ['（助）的', ['古之學者必有師。','道之所存，師之所存也。','古之聖人／今之眾人。','彼童子之師。','巫、醫、樂師、百工之人。','士大夫之族。']],
      ['（助）無義', ['師道之不傳也久矣。','欲人之無惑也難矣。','夫庸知其年之先後生於吾乎？','聖人之所以為聖，愚人之所以為愚。','師道之不復可知矣。']],
      ['（助）表倒裝', ['句讀之不知，惑之不解。']],
      ['代名詞', ['人非生而知之者。','吾從而師之。','擇師而教之。','授之書。','則群聚而笑之。','問之。','六藝經傳，皆通習之。','作〈師說〉以貽之。']],
      ['往、到', ['吾欲之南海。（彭端淑〈為學一首示子姪〉）']]
    ]}]}]},
    { name:'學者', pages:[{ sub:'義辨', groups:[{ x:'學者', rows:[
      ['學習的人', ['古之學者必有師。']],
      ['學問淵博而有所成就的人', ['生物學者。']]
    ]}]}]},
    { name:'者', pages:[{ sub:'義辨', groups:[{ x:'者', rows:[
      ['代名詞，……的人', ['學者、記者、作者。','人非生而知之者。']],
      ['助詞，用於句中，表示停頓', ['師者，所以傳道、受業、解惑也。','法者，天子所與天下公共也。（司馬遷〈張釋之執法〉）']],
      ['助詞，用於句末，表示語氣結束', ['蓮，花之君子者也。（周敦頤〈愛蓮說〉）']]
    ]}]}]},
    { name:'庸', pages:[{ sub:'義辨', groups:[{ x:'庸', rows:[
      ['豈', ['夫庸知其年之先後生於吾乎？']],
      ['愚笨、拙劣的', ['庸奴、庸醫。']],
      ['平常的、普通的', ['平庸。']],
      ['需要', ['無庸置疑。']],
      ['酬謝', ['酬庸。']]
    ]}]}]},
    { name:'所以', pages:[{ sub:'義辨', groups:[{ x:'所以', rows:[
      ['用來', ['師者，所以傳道、受業、解惑也。','不患無位，患所以立。（《論語．里仁》）']],
      ['為何，表原因', ['聖人之所以為聖，愚人之所以為愚，其皆出於此乎？','親賢臣，遠小人，此先漢所以興隆也。（諸葛亮〈出師表〉）']],
      ['因此、因而。常與「因為」連用，表示因果關係。', ['因為人太多，所以說的什麼話都聽不清楚。（《老殘遊記》第二回）']]
    ]}]}]},
    { name:'其', pages:[
      { sub:'義辨', groups:[{ x:'其', rows:[
        ['那些', ['其為惑也，終不解矣。']],
        ['大概，表示推測語氣', ['愚人之所以為愚，其皆出於此乎？']],
        ['他', ['余嘉其能行古道。']]
      ]}]},
      { sub:'義辨（延伸）', groups:[{ x:'其', rows:[
        ['通「豈」（反詰語氣）', ['則天下其有不亂，國家其有不亡者乎？（顧炎武〈廉恥〉）','不可為常者，其聖人之法乎？（歐陽脩〈縱囚論〉）']],
        ['假如（假設語氣）', ['蘭槐之根是為芷，其漸之滫，君子不近，庶人不服。（荀子〈勸學〉）','彼其能有所忍也，然後可以就大事。（蘇軾〈留侯論〉）']],
        ['希望（期望語氣）', ['聊布往懷，君其詳之。（丘遲〈與陳伯之書〉）']]
      ]}]}
    ]},
    { name:'不齒／不恥', pages:[{ sub:'義辨', groups:[
      { x:'不齒', rows:[['不屑與之並列', ['君子不齒。']]] },
      { x:'不恥', rows:[['不以……為恥', ['不恥相師。']]] }
    ]}]},
    { name:'師', pages:[
      { sub:'義辨', groups:[{ x:'師', rows:[
        ['老師', ['古之學者必有師。','師者，所以傳道、受業、解惑也。','惑而不從師。','道之所存，師之所存也。','從師而問焉。','恥學於師。','擇師而教之。','彼童子之師。','士大夫之族，曰師、曰弟子云者。','聖人無常師。','三人行，則必有我師。','弟子不必不如師，師不必賢於弟子。']],
        ['具有專門技藝的人', ['樂師。','師襄。']],
        ['學習、請教', ['吾從而師之。','吾師道也。','於其身也，則恥師焉。','或師焉，或不焉。','不恥相師。','孔子師郯子。']],
        ['從師問學的', ['師道之不傳也久矣。','師道之不復可知矣。']]
      ]}]},
      { sub:'義辨（延伸）', groups:[{ x:'師', rows:[
        ['對道士或僧尼的尊稱', ['法師、禪師。']],
        ['軍隊', ['出師、會師、興師問罪。']],
        ['都邑、都城', ['京師。']],
        ['榜樣、借鏡', ['前事不忘，後事之師。']]
      ]}]}
    ]},
    { name:'於', pages:[{ sub:'義辨', groups:[{ x:'於', rows:[
      ['向，表示趨向', ['恥學於師。','請學於余。']],
      ['從、由，表示所從', ['愚人之所以為愚，其皆出於此乎？']],
      ['對於，表示動作行為的對象', ['於其身也，則恥師焉。']],
      ['比，引進比較對象', ['師不必賢於弟子。']],
      ['被，置於動詞之後，表示被動', ['不拘於時。']]
    ]}]}]},
    { name:'貽', pages:[{ sub:'形辨', yin:true, groups:[
      { x:'貽', yin:'ㄧˊ', rows:[['贈送', ['作〈師說〉以貽之。']], ['遺留', ['貽笑大方。']]] },
      { x:'怡', yin:'ㄧˊ', rows:[['和悅、愉快', ['怡然自得、心曠神怡。']]] },
      { x:'飴', yin:'ㄧˊ', rows:[['用米或麥製成的糖漿或軟糖', ['甘之如飴、含飴弄孫。']]] }
    ]}]}
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hi(ex, x) { return esc(ex).split(esc(x)).join('<b>' + esc(x) + '</b>'); }
  function exList(arr, x) {
    if (arr.length === 1) return hi(arr[0], x);
    var items = arr.map(function (e, i) { return (i + 1) + '. ' + hi(e, x); });
    return arr.length > 4 ? '<div class="v75-ex2">' + items.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' : items.join('<br>');
  }
  function tableHTML(pg) {
    var h = '<table class="v75-yb"><tr><th>形</th>' + (pg.yin ? '<th>音</th>' : '') + '<th>義</th><th>例</th></tr>';
    pg.groups.forEach(function (g) {
      g.rows.forEach(function (r, ri) {
        h += '<tr>';
        if (ri === 0) {
          h += '<td class="v75-x" rowspan="' + g.rows.length + '">' + esc(g.x) + '</td>';
          if (pg.yin) h += '<td class="v75-yin" rowspan="' + g.rows.length + '">' + esc(g.yin) + '</td>';
        }
        h += '<td class="v75-y"><span class="v75-rv" onclick="this.classList.toggle(\'on\')">' + esc(r[0]) + '</span></td>' +
             '<td class="v75-e">' + exList(r[1], g.x) + '</td></tr>';
      });
    });
    return h + '</table>';
  }
  TEXTBOOK['師說'].charBian = CB.map(function (c) {
    return { name: c.name, pages: c.pages.map(function (pg) {
      return { sub: pg.sub, body: '<div class="v75-yb-wrap" data-kind="' + esc(pg.sub) + '">' + tableHTML(pg) + '</div>' };
    }) };
  });

  var _v75prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'charbian' && String(slide.body || '').indexOf('v75-yb-wrap') >= 0) {
      var kind = String(slide.sub || '義辨'), base = kind.replace(/（.*）/, ''), ext = kind.indexOf('延伸') >= 0;
      return '<div class="wk-slide wks-charbian v75-cb"><div class="v75-top">' +
        '<span class="v75-kind">' + base + '：' + slide.name + '</span>' + (ext ? '<span class="v75-tag">延伸</span>' : '') +
        '<span class="v75-bar"><button type="button" class="all" onclick="v75All(this,true)">全部顯示</button>' +
        '<button type="button" onclick="v75All(this,false)">全部隱藏</button></span></div>' +
        '<div class="jy-scroll">' + slide.body + '</div></div>';
    }
    return _v75prev.apply(this, arguments);
  };
  window.v75All = function (btn, on) {
    var sl = btn.closest('.wk-slide');
    if (sl) sl.querySelectorAll('.v75-rv').forEach(function (e) { e.classList.toggle('on', on); });
  };

  /* ── ② 課文浮框：依備課用書（夾注 P3-17～3-22、語譯）修正「之」「者」。逐一精確替換，次數不符就不替換並警告。 ── */
  var FIX = [
    [0, 2, '知{n:3|之}{g:者|表語氣停頓，無義}', '知{n:3|之}{g:者|代名詞，……的人}'],
    [1, 1, '{n:11|庸知其年之先後生於吾乎}', '{n:11|庸知其年{g:之|（助）無義}先後生於吾乎}'],
    [2, 0, '{n:13|師道}{g:之|的}', '{n:13|師道}{g:之|（助）無義}'],
    [2, 0, '欲人{g:之|的}', '欲人{g:之|（助）無義}'],
    [2, 1, '；今之眾人，', '；今{g:之|的}眾人，'],
    [3, 1, '授之{g:書|', '授{g:之|代名詞，他們}{g:書|'],
    [4, 0, '{n:26|百工}之人', '{n:26|百工}{g:之|的}人'],
    [4, 1, '則群聚而笑之。', '則群聚而笑{g:之|代名詞，他們}。'],
    [4, 2, '問之，則曰', '問{g:之|代名詞，他們}，則曰'],
    [4, 3, '百工之人，君子', '百工{g:之|的}人，君子'],
    [5, 1, '郯子{g:之|主謂之間，不譯}', '郯子之']
  ];
  var tp = TEXTBOOK['師說'].textPages;
  FIX.forEach(function (f) {
    try {
      var L = tp[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v75] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v75] 浮框替換失敗：', f[2], e); }
  });

  /* ── ③ 課文「總」字卡「之」（v54-anno-js，DATA 在閉包內）：開卡後改寫本字卡表格，與辨析頁一致 ── */
  var ZHI = [
    ['（助）的', ['古「<b>之</b>」學者', '道「<b>之</b>」所存']],
    ['（助）無義', ['師道「<b>之</b>」不傳也久矣', '欲人「<b>之</b>」無惑也難矣']],
    ['（助）表倒裝', ['句讀「<b>之</b>」不知']],
    ['代名詞', ['人非生而知「<b>之</b>」者（指道、業）', '作〈師說〉以貽「<b>之</b>」（指李蟠）']]
  ];
  function patchZhi() {
    var ov = document.getElementById('ss-anno-ov'), ttl = document.getElementById('ss-ttl');
    if (!ov || !ttl || !/：之$/.test(ttl.textContent)) return;
    var tbl = ov.querySelector('#ss-body .ss-tbl');
    if (!tbl) return;
    tbl.innerHTML = ZHI.map(function (s, i) {
      var last = i === ZHI.length - 1 ? ' ss-last' : '';
      return '<div class="ss-c ss-c-num' + last + '"></div>' +
        '<div class="ss-c ss-c-yi' + last + '"><span class="ss-given">' + s[0] + '</span></div>' +
        '<div class="ss-c ss-c-ex' + last + '"><ol class="ss-exs">' + s[1].map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ol></div>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.ss-zong[data-k="之"]');
    if (z) setTimeout(patchZhi, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function (key) { var r = _open.apply(this, arguments); if (key === '之') patchZhi(); return r; };
  }
})();
