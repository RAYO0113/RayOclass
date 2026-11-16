(function () {
  /* V255（老師 11/16：樂府長卷融合後，無法調字體大小、無法使用標記筆）
     原因：長卷在 iframe（yf/index.html?embed=1）裡，網站的字級（--base-size）與標記筆（164，只認 #wk-slide-area／#wkfs-body 裡的字）都碰不到 iframe 裡面。
     做法（只加不刪，不改 194／164）：
     - 字級：包 setBaseSize，把「目前字級 ÷ 15」當倍率送進長卷（yfZoom），長卷的 --fs 乘上倍率；一般畫面、投影全螢幕的 A−／A＋、顯示設定滑桿都會連動。
     - 標記筆：網站「🖍 標記筆」開關（body.hm-on）與色盤顏色同步給長卷（yfHm）；長卷自己在字上劃線、存 localStorage「yf_hlmark_v1」（依長卷頁的 key）。
       長卷頁按「本頁清除」→ 清長卷這一頁的標記；長卷裡按 Esc → 關標記筆。 */
  var FR = 'iframe.wk-yf-frame';
  function frames() { return [].slice.call(document.querySelectorAll(FR)); }
  function send(f, m) { try { if (f.contentWindow) f.contentWindow.postMessage(m, '*'); } catch (e) {} }
  function base() {
    return parseFloat(document.documentElement.style.getPropertyValue('--base-size')) ||
           parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 15;
  }
  function zoom() { return Math.max(0.6, Math.min(3, base() / 15)); }
  function pushZoom(f) { var z = zoom(); (f ? [f] : frames()).forEach(function (x) { send(x, { yfZoom: z }); }); }
  function hmColor() { var b = document.querySelector('#hm-bar .hm-sw.on'); return b ? b.dataset.k : 'y'; }
  function pushHm(f) { var m = { yfHm: { on: document.body.classList.contains('hm-on'), c: hmColor() } }; (f ? [f] : frames()).forEach(function (x) { send(x, m); }); }

  var _sbs = window.setBaseSize;
  if (typeof _sbs === 'function') {
    window.setBaseSize = setBaseSize = function () { var r = _sbs.apply(this, arguments); try { pushZoom(); } catch (e) {} return r; };
  }

  new MutationObserver(function () { pushHm(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#hm-bar .hm-sw'); if (b) setTimeout(pushHm, 0);
  }, true);
  /* 「本頁清除」：長卷這一頁由長卷自己清（網站 164 只看得到網站上的標記） */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#hm-bar [data-a="clear"]'); if (!b) return;
    var s = window.wkSlides && wkSlides[wkIdx];
    if (!s || s.type !== 'yf') return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (!confirm('清除長卷這一頁的標記？（清掉就沒有了）')) return;
    frames().filter(function (f) { return f.style.display !== 'none'; }).forEach(function (f) { send(f, { yfHmClear: 1 }); });
  }, true);

  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object') return;
    var f = frames().filter(function (x) { return x.contentWindow === e.source; })[0]; if (!f) return;
    if (d.yfReady) { pushZoom(f); pushHm(f); }
    else if (d.yfKey === 'HMOFF' && typeof window.hmToggle === 'function') window.hmToggle(false);
  });
})();
