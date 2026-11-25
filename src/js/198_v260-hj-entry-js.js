(function () {
  /* V260（老師 11/18：「課文頁加按鈕」）課文畫卷的入口。
     有畫卷的課（HJ_LESSONS），課文頁上方的按鈕列（.tp-btns，注釋／段旨／段析／翻譯那一排）多一顆「畫卷 ▸」；
     點了蓋滿整個畫面開 hj/index.html?l=<課代號>，直接跳到這一段的「看畫」那一步。畫卷裡「✕ 回課文」（送 lbClose）關掉，回到原本那一頁。
     iframe 的 class 是 wk-hj-frame：197 認這個 class 把畫卷位置送給手機講稿；關掉就移除，197 自動退回長卷／課文的同步。
     一般畫面、投影都能開：投影時蓋在投影層上面（z-index 最高），網站的畫筆、換頁列在畫卷底下，畫卷自己有上一步／下一步。 */
  var HJ_LESSONS = { '樂府詩選—長干行': 'changgan', '桃花源記': 'taohua' };   /* 桃花源記：老師 11/19 說上線 */
  var BOX = 'hj-anim';

  function segOf() {   /* 現在是這一課的第幾段課文（0 起算）；不是課文頁回 -1 */
    if (!wkSlides || !wkSlides[wkIdx] || wkSlides[wkIdx].type !== 'textpage') return -1;
    var n = 0;
    for (var i = 0; i < wkIdx; i++) if (wkSlides[i].type === 'textpage') n++;
    return n;
  }
  function close() { var b = document.getElementById(BOX); if (b) b.remove(); window.focus(); }

  window.hjOpen = function () {
    var key = HJ_LESSONS[wkKey]; if (!key || document.getElementById(BOX)) return;
    var seg = segOf(), want = seg >= 0 ? 'pan-' + seg : null;
    var box = document.createElement('div');
    box.id = BOX;
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#F4F0E7';
    var f = document.createElement('iframe');
    f.className = 'wk-hj-frame'; f.title = '課文畫卷'; f.setAttribute('allow', 'fullscreen');
    f.style.cssText = 'width:100%;height:100%;border:0;display:block';
    f.src = 'hj/index.html?l=' + key;
    box.appendChild(f);
    (document.fullscreenElement || document.body).appendChild(box);
    /* 畫卷第一次回報位置（剛載入＝卷首）時，跳到這一段的看畫 */
    function first(e) {
      if (e.source !== f.contentWindow || !e.data || !e.data.hjStep) return;
      window.removeEventListener('message', first);
      if (want && e.data.hjStep.id !== want) f.contentWindow.postMessage({ hjCmd: 'go', id: want }, '*');
    }
    window.addEventListener('message', first);
    setTimeout(function () { try { f.focus(); } catch (er) {} }, 400);
  };
  window.addEventListener('message', function (e) {
    /* 11/25 老師：「畫卷的回課文失效」→ 不再要求訊息一定來自畫卷 iframe 本身（巢狀、iPad 上可能對不上）；畫卷開著、同網站送來的 lbClose 就關 */
    var b = document.getElementById(BOX);
    if (b && e.data && e.data.lbClose && (e.origin === location.origin || e.origin === 'null')) close();
  });

  /* 課文頁的按鈕列加「畫卷 ▸」（一般畫面、投影各自重畫，所以每次換頁都補） */
  var _render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _render.apply(this, arguments);
    try {
      if (HJ_LESSONS[wkKey] && segOf() >= 0) {
        document.querySelectorAll('#wk-slide-area .tp-btns, #wkfs-body .tp-btns').forEach(function (row) {
          if (row.querySelector('.tp-b-hj')) return;
          var b = document.createElement('button');
          b.className = 'tp-b tp-b-hj'; b.type = 'button'; b.textContent = '畫卷 ▸';
          b.onclick = function (ev) { ev.stopPropagation(); window.hjOpen(); };
          row.appendChild(b);
        });
      }
    } catch (er) { setTimeout(function () { throw er; }); }
    return r;
  };
})();
