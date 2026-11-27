(function () {
  /* V271（老師 11/27「預覽部分為何沒有出現下一頁的畫面」）長卷／變形記的「下一步」也送給手機講稿預覽。
     ・長卷（yf）每次送 yfStep 時多附 nx {key, step, h}（變形記的頁 key＝「變形記·<頁代號>」）。這裡記下來。
     ・186 送位置時，長卷頁的代號與頁名由 V217TN_EXT 提供；本檔包住它，在頁名後面接「⟫下一步代號⟪下一步頁名」
       （同 186 課文頁的 ⟫ 寫法；Apps Script 只存 h、上限 80 字，不用改後台）。太長就只接代號，再太長只接 ~頁名（手機只顯示名稱、不預覽）。
     ・手機（tn/）拆 ⟫、⟪ 後顯示「下一頁 ▸ 頁名」，預覽時另開一個小鏡像顯示下一步的畫面。
     ⚠ 同名陷阱（AGENTS §10.3）：window.V217TN_EXT 依序被 196（長卷）→ 197（畫卷）→ 本檔包住；實際生效的是本檔這一支，
       它先叫 197（197 再叫 196），只在結果是長卷頁（yf:）時加上下一步。 */
  var nx = null;
  function shownYf(src) {
    var fs = document.querySelectorAll('iframe.wk-yf-frame');
    for (var i = 0; i < fs.length; i++) if (fs[i].contentWindow === src && fs[i].style.display !== 'none') return true;
    return false;
  }
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object' || !d.yfStep || !shownYf(e.source)) return;
    var x = d.yfStep.nx;
    nx = x && x.key ? { key: String(x.key).slice(0, 60), step: isNaN(+x.step) ? -1 : +x.step, h: String(x.h || x.key).slice(0, 40) } : null;
  }, true);
  /* 196 收到同一則訊息就立刻呼叫 V217TN.now() 送出，比本檔的接收還早（實測 capture 也排不到前面）→ 每一步先送一筆舊的下一步、再補一筆。
     改：now() 延到這一輪訊息都處理完（setTimeout 0）才送，本檔一定先記好 nx；一步只送一筆。now() 只有 196、197 用。 */
  var V = window.V217TN;
  if (V && V.now) { var now0 = V.now; V.now = function () { setTimeout(function () { try { now0(); } catch (er) {} }, 0); }; }
  var prev = window.V217TN_EXT;
  window.V217TN_EXT = function (s) {
    var r = prev ? prev(s) : null;
    if (!r || !/^yf:/.test(r.id || '') || !nx) return r;
    var hh = String(r.h || '').slice(0, 24), nid = 'yf:' + nx.key + (nx.step >= 0 ? '#' + nx.step : ''), t = nx.h.replace(/^長卷　/, '');
    var tail = nid + '⟪' + t;
    if (hh.length + 1 + tail.length > 79) tail = nid;
    if (hh.length + 1 + tail.length > 79) tail = '~' + t;
    return { id: r.id, h: (hh + '⟫' + tail).slice(0, 79) };
  };
})();
