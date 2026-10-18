/* V137 投影畫筆改版（老師 10/18）
   ① 全螢幕時畫筆工具列一直固定在下方換頁列（不用先點右側「畫筆」邊籤）。
   ② 新增「觸控筆」模式＝可以點頁面上的互動按鈕（畫布不攔觸控）；一進全螢幕預設就是觸控筆。
   ③ 直接點下方顏色（或螢光筆、橡皮擦）就進入畫筆模式，顏色預設「細」（163 已把顏色筆固定細＝3）。
      切回觸控筆時筆跡保留（舊版關閉畫筆會清除本頁，改由「清除」鈕清除）。
   ④ 筆跡跟著頁面捲動：點的座標改記「頁面內容座標」（加上投影片目前的捲動量），重畫時扣回捲動量；
      往下滑時筆跡貼著原本的文字往上移，移出畫面就看不到（畫布本身只蓋投影內容區）。
      舊格式的點（只有 x、y 比例）照舊畫在固定位置。字級改變後版面重排，筆跡位置不會跟著重排。
   實作：以 window.* 重新指定 015_main 的 wkInkPoint／wkInkRedraw（實際生效版本＝本檔），
        包 wkInkColor／wkInkHighlighter（在 036、163 的包裝外層），不改舊檔。 */
(function () {
  'use strict';
  var st = window.wkInkState; if (!st) return;
  function $(id) { return document.getElementById(id); }
  function fsOpen() { var f = $('wk-fullscreen'); return !!f && getComputedStyle(f).display !== 'none'; }
  function scrollers() { return [document.querySelector('#wkfs-body .wk-slide'), $('wkfs-body')].filter(Boolean); }
  function scrollXY() { var x = 0, y = 0; scrollers().forEach(function (s) { x += s.scrollLeft || 0; y += s.scrollTop || 0; }); return { x: x, y: y }; }

  /* ④ 座標：內容座標 cx、cy（像素）；同時給 x、y 比例（相容 015 去重與 036 橡皮擦，重畫時會更新成目前位置） */
  window.wkInkPoint = function (e) {
    var r = st.canvas.getBoundingClientRect(), s = scrollXY();
    var px = e.clientX - r.left, py = e.clientY - r.top;
    return { cx: px + s.x, cy: py + s.y, x: px / Math.max(1, r.width), y: py / Math.max(1, r.height) };
  };
  window.wkInkRedraw = function () {
    var c = st.canvas, ctx = st.ctx; if (!c || !ctx) return;
    var r = c.getBoundingClientRect(), s = scrollXY();
    ctx.clearRect(0, 0, r.width, r.height);
    (wkInkCurrentStrokes() || []).forEach(function (k) {
      var P = k.points; if (!P || P.length < 2) return;
      ctx.beginPath(); ctx.strokeStyle = k.color || '#c0392b'; ctx.lineWidth = k.size || 3;
      P.forEach(function (p, i) {
        var X, Y;
        if (p.cx != null) { X = p.cx - s.x; Y = p.cy - s.y; p.x = X / Math.max(1, r.width); p.y = Y / Math.max(1, r.height); }
        else { X = p.x * r.width; Y = p.y * r.height; }
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.stroke();
    });
  };
  document.addEventListener('scroll', function (e) {
    if (!fsOpen() || !e.target || !e.target.closest || !e.target.closest('#wkfs-body')) return;
    window.wkInkRedraw();   /* 直接重畫（捲動事件本來就跟畫面更新同步；requestAnimationFrame 在背景分頁不會跑） */
  }, true);

  /* ②③ 模式：pen＝畫（畫布攔觸控）；不是 pen＝觸控筆（可點按鈕）。不呼叫 wkInkToggle（它關閉時會清除本頁） */
  function setPen(on) {
    var layer = $('wk-ink-layer'); if (!layer) return;
    st.active = !!on; if (!on) st.drawing = false;
    layer.classList.toggle('active', !!on);
    var tb = $('v137-touch'); if (tb) tb.classList.toggle('on', !on);
    if (!on) document.querySelectorAll('.wk-ink-color').forEach(function (x) { x.classList.remove('on'); });
    if (!on) { var er = $('wk-ink-eraser'); if (er && er.classList.contains('on')) er.click(); }
    fit();
  }
  /* 全螢幕時畫記層放到 body 最上層（蓋過浮框，觸控筆模式畫布不攔觸控），畫布只蓋標題列～換頁列之間 */
  function place(open) {
    var layer = $('wk-ink-layer'); if (!layer) return;
    if (open) {
      if (layer.parentNode !== document.body) { layer._v137p = layer.parentNode; layer._v137n = layer.nextSibling; document.body.appendChild(layer); }
      layer.style.position = 'fixed'; layer.style.inset = '0'; layer.style.zIndex = '12500';
      document.body.classList.add('v137-fs');
    } else {
      if (layer._v137p) { try { layer._v137p.insertBefore(layer, layer._v137n); } catch (e) { layer._v137p.appendChild(layer); } layer._v137p = null; }
      layer.style.position = ''; layer.style.inset = ''; layer.style.zIndex = '';
      document.body.classList.remove('v137-fs');
    }
  }
  function fit() {
    var fs = $('wk-fullscreen'), canvas = $('wk-ink-canvas'), layer = $('wk-ink-layer'); if (!fs || !canvas || !layer) return;
    if (fsOpen()) {
      var head = fs.querySelector('.wkfs-header'), foot = fs.querySelector('.wkfs-footer');
      var top = head ? head.getBoundingClientRect().bottom : 0, f = foot ? foot.getBoundingClientRect().top : innerHeight;
      canvas.style.top = top + 'px'; canvas.style.bottom = 'auto'; canvas.style.height = Math.max(1, f - top) + 'px';
      layer.style.setProperty('--v56-foot-h', Math.max(32, Math.round(innerHeight - f)) + 'px');
    }
    if (typeof wkInkSetupCanvas === 'function') wkInkSetupCanvas();
  }

  function initBar() {
    var left = $('wk-ink-grp-l'); if (!left || $('v137-touch')) return;
    var t = document.createElement('button'); t.type = 'button'; t.id = 'v137-touch'; t.className = 'wk-ink-btn on'; t.textContent = '👆 觸控筆';
    t.title = '觸控筆：可以點頁面上的按鈕；點右邊顏色就能畫';
    t.addEventListener('click', function () { setPen(false); });
    left.insertBefore(t, left.firstChild);
    var c = document.createElement('button'); c.type = 'button'; c.id = 'v137-clear'; c.className = 'wk-ink-btn'; c.textContent = '清除';
    c.title = '清除本頁筆跡'; c.addEventListener('click', function () { if (typeof wkInkClear === 'function') wkInkClear(); });
    left.appendChild(c);
    var er = $('wk-ink-eraser'); if (er) er.addEventListener('click', function () { if (er.classList.contains('on') && !st.active) setPen(true); });
  }
  function wrapColors() {
    ['wkInkColor', 'wkInkHighlighter'].forEach(function (n) {
      var f = window[n]; if (typeof f !== 'function' || f._v137) return;
      window[n] = function () { if (!st.active) setPen(true); return f.apply(this, arguments); };
      window[n]._v137 = true;
    });
  }

  /* 進出全螢幕：用 #wk-fullscreen 的 style 變化偵測（wkOpenProj／wkCloseProj 都改 display） */
  var wasOpen = false;
  function sync() {
    var open = fsOpen();
    if (open === wasOpen) return; wasOpen = open;
    place(open);
    setPen(false);              /* 進全螢幕預設觸控筆；離開時也回觸控筆 */
    setTimeout(fit, 60);
  }
  function boot() {
    initBar(); wrapColors();
    var f = $('wk-fullscreen');
    if (f && window.MutationObserver) new MutationObserver(sync).observe(f, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', function () { if (fsOpen()) fit(); });
    /* 換頁後重畫（筆跡依頁分開存，捲動量歸零） */
    if (typeof wkRenderCurrent === 'function' && !wkRenderCurrent._v137) {
      var r0 = wkRenderCurrent;
      wkRenderCurrent = function () { var v = r0.apply(this, arguments); setTimeout(function () { if (fsOpen()) window.wkInkRedraw(); }, 80); return v; };
      wkRenderCurrent._v137 = true;
    }
    sync();
  }
  /* 036 的工具列重組、163 的包裝都在 DOMContentLoaded 之後，要排在它們後面 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 30); });
  else setTimeout(boot, 30);
})();
