
(function () {
  /* 〈師說〉資料行不動（AGENTS §2），進階練習於執行期掛上 */
  var V70_SHISHUO_ADV = [{"kind": "table", "head": "二、進階練習", "cols": ["", "題目", "立場", "加上標點"], "rows": [["1", "報紙上橫列著偌大的棒球賽戰況報導：「這場棒球賽激戰的結果是中華隊戰敗日本隊獲得世界盃總冠軍。」到底誰是冠軍？", "(1)中華隊是冠軍", "<span class='wk-a'>這場棒球賽激戰的結果是：中華隊戰敗日本隊，獲得世界盃總冠軍。</span>"], ["", "", "(2)日本隊是冠軍", "<span class='wk-a'>這場棒球賽激戰的結果是：中華隊戰敗，日本隊獲得世界盃總冠軍。</span>"], ["2", "祝枝山是明代書畫家。一年除夕，一位搜刮鄉里、欺壓百姓的財主請祝枝山寫春聯。", "(1)祝枝山奚落財主的立場", "<span class='wk-a'>明日逢春，好不晦氣。來年倒運，少有餘財。</span>"], ["", "", "(2)財主喜孜孜自以為是的立場", "<span class='wk-a'>明日逢春好，不晦氣。來年倒運少，有餘財。</span>"], ["3", "從前有位財主的兒子借助別人說媒而成婚，待新娘娶進門後，發現與媒人所描述的事實不符，媒人卻堅持自己事先已清楚告知事實。雙方對文句斷句的解讀究竟有何不同？", "(1)財主家的角度", "<span class='wk-a'>此女麻臉無、頭髮烏黑、皮膚白白、痴痴純情、不論聘金，少不了。</span>"], ["", "", "(2)媒介者的角度", "<span class='wk-a'>此女麻臉、無頭髮、烏黑皮膚、白白痴痴、純情不論，聘金少不了。</span>"]], "note": "「句讀」是否正確、恰當，對於文意的理解極為重要。句讀不同，將使文意產生歧異。以下三段，若角色立場不同，將形成如何的句讀方式？請加入適當的標點符號。"}];
  if (V70_SHISHUO_ADV && TEXTBOOK['師說']) TEXTBOOK['師說'].advQ = V70_SHISHUO_ADV;

  /* 投影片：進階練習接在基礎練習之後；沒有基礎練習就放在習作答案總覽之前 */
  var _v70parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v70parse.apply(this, arguments);
    var d = TEXTBOOK[key];
    if (!d || !d.advQ || !d.advQ.length) return slides;
    var at = -1;
    slides.forEach(function (s, i) { if (s.type === 'iquiz') at = i + 1; });
    if (at < 0) { at = slides.findIndex(function (s) { return s.type === 'work_answers'; }); }
    if (at < 0) at = slides.length;
    var add = d.advQ.map(function (sec, i) { return { type: 'iadv', sec: sec, first: i === 0 }; });
    slides.splice.apply(slides, [at, 0].concat(add));
    /* 習作答案總覽記錄的是投影片索引，插入後要跟著位移 */
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += add.length; });
    });
    return slides;
  };

  var _v70render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'iadv') {
      var h = _v70render.call(this, { type: 'work', sec: slide.sec, first: slide.first, title: '' });
      return h.replace('wk-slide wks-work', 'wk-slide wks-work wks-iadv')
              .replace('<span class="wk-tag">習作Ａ</span>', '<span class="wk-tag">應用練習</span>');
    }
    return _v70render.apply(this, arguments);
  };

  var _v70sec = wkBuildSections;
  wkBuildSections = function (slides) {
    var map = _v70sec.apply(this, arguments);
    slides.forEach(function (s, i) { if (s.type === 'iadv' && s.first) map.push({ label: '✐進階練習', idx: i }); });
    map.sort(function (a, b) { return a.idx - b.idx; });
    return map;
  };
})();
