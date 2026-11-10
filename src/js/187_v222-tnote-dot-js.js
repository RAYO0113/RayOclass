(function () {
  'use strict';
  /* ── V222（老師 11/10）平板課文每句開頭一個很淡的小點：點了 → 手機講稿捲到這一句 ──
     ・只在講稿同步開著（有登記密碼、沒設 tn_sync_off_v1）時出現；學生網站、沒登入的平板都不會有。
     ・放在 .tp-text 左邊留白（absolute，不推動課文、不加任何文字，修辭框線／標記不受影響）。
     ・點了閃綠＝手機已收到；閃紅＝沒送出（網路或密碼）。手機目前停在哪句，那顆點會稍深一點。
     ・實際送出走 186 的 V217TN.sendLine（同一個 liveSet 通道）。 */
  var AREAS = '#wk-slide-area, #wkfs-body';
  var cur = -1;
  function on() { return !!(window.V217TN && window.V217TN.on && window.V217TN.on()); }
  function isText() { try { var s = wkSlides[wkIdx]; return !!(s && s.type === 'textpage'); } catch (e) { return false; } }

  function paint() {
    var areas = document.querySelectorAll(AREAS);
    for (var a = 0; a < areas.length; a++) {
      var lines = areas[a].querySelectorAll('.tp-line[data-li]');
      for (var i = 0; i < lines.length; i++) {
        var ln = lines[i], t = ln.querySelector(':scope > .tp-text'), d = t && t.querySelector(':scope > .tn-dot');
        if (!t) continue;
        if (!on() || !isText()) { if (d) d.remove(); continue; }
        if (!d) {
          d = document.createElement('span'); d.className = 'tn-dot'; d.setAttribute('aria-hidden', 'true');
          var lh = parseFloat(getComputedStyle(t).lineHeight); if (lh) d.style.setProperty('--tn-lh', lh + 'px');
          t.insertBefore(d, t.firstChild);
        }
        d.classList.toggle('cur', +ln.getAttribute('data-li') === cur);
      }
    }
  }
  function later() { setTimeout(paint, 0); setTimeout(paint, 120); setTimeout(paint, 600); }

  function hook(name) {
    var f = window[name]; if (typeof f !== 'function' || f._v222) return;
    window[name] = function () { var v = f.apply(this, arguments); try { if (name === 'wkRenderCurrent') cur = -1; later(); } catch (e) {} return v; };
    window[name]._v222 = true;
  }
  function hookAll() { hook('wkRenderCurrent'); hook('wkOpenProj'); }
  hookAll();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookAll);
  window.addEventListener('load', function () { hookAll(); later(); });

  /* 點小點：只送同步，不觸發句子的其他點擊（修辭框、註釋…） */
  function tap(e) {
    var d = e.target && e.target.closest ? e.target.closest('.tn-dot') : null;
    if (!d || !d.closest(AREAS)) return;
    e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e.type !== 'click') return;
    var ln = d.closest('.tp-line'), li = parseInt(ln && ln.getAttribute('data-li'), 10); if (isNaN(li)) return;
    cur = li; paint();
    var all = document.querySelectorAll(AREAS.replace(/,/g, ' .tp-line[data-li="' + li + '"] .tn-dot,') + ' .tp-line[data-li="' + li + '"] .tn-dot');
    window.V217TN.sendLine(li, function (ok) {
      for (var i = 0; i < all.length; i++) { (function (el) { el.classList.add(ok ? 'ok' : 'bad'); setTimeout(function () { el.classList.remove('ok', 'bad'); }, 900); })(all[i]); }
    });
  }
  ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(function (t) { document.addEventListener(t, tap, { capture: true, passive: false }); });

  /* 平板直接點句子（186 的舊行為）時，也把那顆點標成目前句 */
  document.addEventListener('click', function (e) {
    var ln = e.target && e.target.closest ? e.target.closest('.tp-line') : null;
    if (!ln || !ln.closest(AREAS)) return;
    var li = parseInt(ln.getAttribute('data-li'), 10); if (!isNaN(li) && li !== cur) { cur = li; setTimeout(paint, 0); }
  });
  /* 登入／登出登記密碼後，小點跟著出現／消失 */
  window.addEventListener('storage', later);
  setInterval(function () { if (document.hidden) return; var want = on() && isText(), has = !!document.querySelector('.tn-dot'); if (want !== has) paint(); }, 3000);
})();
