/* 聚光燈（2026-10-09 老師）：畫面變暗，只留手指／滑鼠所在處一個圓形亮區，當雷射筆用。
   - 開關：畫面上浮動的朱紅圓鈕（手電筒圖；老師說像 iPad 小白點會搞混 → 改朱紅金邊）——點一下開／關；按住拖曳可移到任何地方放著（位置記在這台裝置）。
     一般畫面、全螢幕都在；手機不顯示（手機用不到）。鍵盤 L 也可開關。
   - 開著時：手指拖曳／滑鼠移動，亮圈跟著走；手放開亮圈停原處。Esc 只關聚光燈、不關全螢幕。換頁鍵 ←／→ 照常。
     開著時畫面上其他按鈕暫時按不到（同畫筆），小圓點仍在最上層可按。
   - 試做頁另有雷射點、大小、暗度選項，老師 10/9 說雷射不需要 → 只做聚光燈，大小、暗度用試做頁的「中」。
     原本放在工具列的「🔦」按鈕太小難按 → 改成浮動圓點（同日）。
   自帶 <style id="spot-css">，不改任何既有模組。 */
(function () {
  if (window.spotToggle) return;
  var R = 120, DIM = 0.62, SIZE = 52, POS_KEY = 'spot_dot_pos_v1';

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
    /* 浮動圓鈕：朱紅底、泥金邊、手電筒圖（刻意不像 iPad 的灰白小白點） */
    '#spot-dot{position:fixed;left:0;top:0;width:' + SIZE + 'px;height:' + SIZE + 'px;border-radius:50%;z-index:2147483001;touch-action:none;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;box-sizing:border-box;' +
      'background:radial-gradient(circle at 35% 30%,#c8473a,#8e2a22 70%);border:2px solid #d4ad5a;' +
      'box-shadow:0 3px 10px rgba(0,0,0,.35);opacity:.82;transition:opacity .25s,box-shadow .25s,scale .15s;' +
      '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
    '#spot-dot svg{width:28px;height:28px;pointer-events:none}' +
    '#spot-dot:hover,#spot-dot.drag{opacity:1}' +
    '#spot-dot.drag{scale:1.12}' +
    '#spot-dot.on{opacity:1;background:radial-gradient(circle at 35% 30%,#f3d98a,#c99a3c 70%);border-color:#fff3cf;box-shadow:0 0 0 4px rgba(243,217,138,.35),0 0 18px 6px rgba(255,226,140,.55)}' +
    '#spot-dot.on svg .beam{fill:#fffbe8}#spot-dot.on svg .body{fill:#7a2a1e}' +
    '@media (max-width:600px){#spot-dot{display:none !important}}';
  document.head.appendChild(st);

  var L = document.createElement('div'); L.id = 'spot-layer'; L.className = 'idle';
  L.innerHTML = '<div id="spot-ring"></div><div id="spot-hint">手指拖曳／滑鼠移動　·　再點小圓點或 Esc 關閉</div>';
  var ring = L.firstChild, hint = L.lastChild, hintT = 0;
  var dot = document.createElement('div'); dot.id = 'spot-dot'; dot.setAttribute('role', 'button');
  dot.setAttribute('aria-label', '聚光燈開關（按住可拖曳移動）');
  /* 手電筒：左下握柄、右上光束 */
  dot.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true">' +
    '<path class="beam" d="M17 8 L28 2 L30 4 L24 15 Z" fill="#ffe9a8" opacity=".95"/>' +
    '<g transform="rotate(45 16 16)"><rect class="body" x="12" y="11" width="8" height="16" rx="2" fill="#fff6dc"/>' +
    '<rect class="body" x="10.5" y="7" width="11" height="5" rx="1.5" fill="#fff6dc"/>' +
    '<circle cx="16" cy="19" r="1.6" fill="#8e2a22"/></g></svg>'; dot.title = '聚光燈：點一下開關，按住拖曳移動（鍵盤 L）';

  function isOn() { return L.classList.contains('on'); }
  function move(x, y) {
    L.classList.remove('idle');
    L.style.setProperty('--x', x + 'px'); L.style.setProperty('--y', y + 'px');
    ring.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function toggle(on) {
    on = on === undefined ? !isOn() : !!on;
    L.classList.toggle('on', on); L.classList.add('idle'); dot.classList.toggle('on', on);
    if (on) { hint.style.opacity = 1; clearTimeout(hintT); hintT = setTimeout(function () { hint.style.opacity = 0; }, 2500); }
  }
  window.spotToggle = toggle;

  L.addEventListener('pointerdown', function (e) { move(e.clientX, e.clientY); e.preventDefault(); });
  L.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons) move(e.clientX, e.clientY); });
  L.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });

  /* ── 小圓點：點一下開關；拖曳（或按住後拖曳）移動 ── */
  var pos = null;
  try { pos = JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch (e) { }
  function clampPos() {
    var W = document.documentElement.clientWidth, H = innerHeight;
    var p = pos || { rx: 1, y: H - SIZE - 140 };                    /* 預設：右下（側邊分頁下方、換頁列上方） */
    var x = p.rx !== undefined ? p.rx * (W - SIZE) : p.x;              /* 水平存比例，換螢幕寬度還在同一側 */
    x = Math.max(4, Math.min(W - SIZE - 4, x));
    var y = Math.max(4, Math.min(H - SIZE - 4, p.y));
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    dot.dataset.x = x; dot.dataset.y = y;
  }
  var dr = null;
  dot.addEventListener('pointerdown', function (e) {
    e.preventDefault(); e.stopPropagation();
    try { dot.setPointerCapture(e.pointerId); } catch (er) { }
    dr = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: +dot.dataset.x, y0: +dot.dataset.y, moving: false,
           hold: setTimeout(function () { if (dr) { dr.moving = true; dot.classList.add('drag'); } }, 350) };
  });
  dot.addEventListener('pointermove', function (e) {
    if (!dr || e.pointerId !== dr.id) return;
    var dx = e.clientX - dr.sx, dy = e.clientY - dr.sy;
    if (!dr.moving && Math.abs(dx) + Math.abs(dy) > 8) { dr.moving = true; dot.classList.add('drag'); }
    if (dr.moving) {
      var W = document.documentElement.clientWidth, H = innerHeight;
      var x = Math.max(4, Math.min(W - SIZE - 4, dr.x0 + dx)), y = Math.max(4, Math.min(H - SIZE - 4, dr.y0 + dy));
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px)'; dot.dataset.x = x; dot.dataset.y = y;
    }
    e.preventDefault(); e.stopPropagation();
  });
  function endDrag(e, cancel) {
    if (!dr || e.pointerId !== dr.id) return;
    clearTimeout(dr.hold);
    var moved = dr.moving; dr = null; dot.classList.remove('drag');
    if (moved) {
      var W = document.documentElement.clientWidth;
      pos = { rx: +dot.dataset.x / Math.max(1, W - SIZE), y: +dot.dataset.y };
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch (er) { }
    } else if (!cancel) toggle();
    e.preventDefault(); e.stopPropagation();
  }
  dot.addEventListener('pointerup', function (e) { endDrag(e, false); });
  dot.addEventListener('pointercancel', function (e) { endDrag(e, true); });
  dot.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
  addEventListener('resize', clampPos);

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (e.key === 'Escape' && isOn()) { toggle(false); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey && !e.altKey) { toggle(); e.preventDefault(); }
  }, true);

  function boot() { document.body.appendChild(L); document.body.appendChild(dot); clampPos(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
