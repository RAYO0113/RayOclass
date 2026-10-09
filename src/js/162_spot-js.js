/* 聚光燈（2026-10-09 老師）：畫面變暗，只留手指／滑鼠所在處一個圓形亮區，當雷射筆用。
   - 開關：一般畫面「🖥 投影全螢幕」旁的「🔦 聚光燈」；全螢幕上方 A−／A+／🌙 那排的「🔦」；鍵盤 L。
   - 開著時再點同一顆按鈕（變暗了也點得到）、或按 Esc（只關聚光燈、不關全螢幕）就關。
   - 手放開後亮圈停在原處；換頁鍵 ←／→ 照常可用。開著時畫面上其他按鈕暫時按不到（同畫筆）。
   - 試做頁另有雷射點、大小、暗度選項，老師 10/9 說雷射不需要 → 只做聚光燈，大小、暗度用試做頁的「中」。
   自帶 <style id="spot-css">，不改任何既有模組。 */
(function () {
  if (window.spotToggle) return;
  var R = 120, DIM = 0.62;

  var st = document.createElement('style'); st.id = 'spot-css';
  st.textContent =
    '#spot-layer{position:fixed;inset:0;z-index:2147483000;display:none;cursor:none;touch-action:none;' +
      '--x:50vw;--y:50vh;--r:' + R + 'px;' +
      'background:radial-gradient(circle at var(--x) var(--y),transparent 0,transparent var(--r),rgba(0,0,0,' + DIM + ') calc(var(--r) + 18px))}' +
    '#spot-layer.on{display:block}' +
    '#spot-layer.idle{background:rgba(0,0,0,.18)}' +
    '#spot-ring{position:fixed;left:0;top:0;width:' + 2 * R + 'px;height:' + 2 * R + 'px;margin:' + -R + 'px 0 0 ' + -R + 'px;border-radius:50%;pointer-events:none;' +
      'box-shadow:0 0 0 2px rgba(255,236,170,.55),0 0 24px 6px rgba(255,236,170,.25)}' +
    '#spot-layer.idle #spot-ring{display:none}' +
    '#spot-hint{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:rgba(0,0,0,.65);color:#fff;font-size:14px;' +
      'padding:6px 14px;border-radius:20px;pointer-events:none;white-space:nowrap;transition:opacity .6s}' +
    '.spot-btn.on{background:#c0392b !important;color:#fff !important;border-color:#c0392b !important}';
  document.head.appendChild(st);

  var L = document.createElement('div'); L.id = 'spot-layer'; L.className = 'idle';
  L.innerHTML = '<div id="spot-ring"></div><div id="spot-hint">手指拖曳／滑鼠移動　·　再按「🔦」或 Esc 關閉</div>';
  document.body.appendChild(L);
  var ring = L.firstChild, hint = L.lastChild, hintT = 0;

  function isOn() { return L.classList.contains('on'); }
  function move(x, y) {
    L.classList.remove('idle');
    L.style.setProperty('--x', x + 'px'); L.style.setProperty('--y', y + 'px');
    ring.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function toggle(on) {
    on = on === undefined ? !isOn() : !!on;
    L.classList.toggle('on', on); L.classList.add('idle');
    document.querySelectorAll('.spot-btn').forEach(function (b) { b.classList.toggle('on', on); });
    if (on) { hint.style.opacity = 1; clearTimeout(hintT); hintT = setTimeout(function () { hint.style.opacity = 0; }, 2500); }
  }
  window.spotToggle = toggle;

  /* 變暗後還要能點到開關按鈕：看底下是不是 .spot-btn */
  function btnUnder(x, y) {
    L.style.pointerEvents = 'none';
    var el = document.elementFromPoint(x, y);
    L.style.pointerEvents = '';
    return el && el.closest ? el.closest('.spot-btn') : null;
  }
  L.addEventListener('pointerdown', function (e) {
    if (btnUnder(e.clientX, e.clientY)) { e.preventDefault(); toggle(false); return; }
    move(e.clientX, e.clientY); e.preventDefault();
  });
  L.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'mouse' || e.buttons) move(e.clientX, e.clientY);
  });
  L.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (e.key === 'Escape' && isOn()) { toggle(false); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) { toggle(); e.preventDefault(); }
  }, true);

  function addBtns() {
    var pj = document.querySelector('.wk-proj-btn');
    if (pj && !document.getElementById('spot-btn-n')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'spot-btn-n';
      b.className = 'wk-proj-btn spot-btn'; b.textContent = '🔦 聚光燈'; b.title = '聚光燈（鍵盤 L）';
      b.onclick = function () { toggle(); };
      pj.parentNode.insertBefore(b, pj.nextSibling);
    }
    var cb = document.querySelector('#wk-fullscreen .wkfs-ctrl-btns');
    if (cb && !document.getElementById('spot-btn-f')) {
      var f = document.createElement('button'); f.type = 'button'; f.id = 'spot-btn-f';
      f.className = 'wkfs-ctrl-btn spot-btn'; f.textContent = '🔦'; f.title = '聚光燈（鍵盤 L）';
      f.onclick = function () { toggle(); };
      cb.appendChild(f);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtns); else addBtns();
})();
