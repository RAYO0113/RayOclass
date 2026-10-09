/* 聚光燈（2026-10-09 老師）：畫面變暗，只留手指／滑鼠所在處一個圓形亮區，當雷射筆用。
   - 開關：畫面上浮動的朱紅圓鈕（手電筒圖；老師說像 iPad 小白點會搞混 → 改半透明火炬圓鈕）——點一下開／關；按住拖曳可移到任何地方放著（位置記在這台裝置）。
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
    /* 浮動圓鈕：半透明暗朱紅底、泥金細邊、火炬圖（刻意不像 iPad 的灰白小白點） */
    '#spot-dot{position:fixed;left:0;top:0;width:' + SIZE + 'px;height:' + SIZE + 'px;border-radius:50%;z-index:2147483001;touch-action:none;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;box-sizing:border-box;' +
      'background:rgba(120,32,24,.42);border:1.5px solid rgba(212,173,90,.6);' +
      'box-shadow:0 2px 8px rgba(0,0,0,.18);opacity:.6;transition:opacity .25s,box-shadow .25s,background .25s,scale .15s;' +
      '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}' +
    '#spot-dot svg{width:32px;height:32px;pointer-events:none}' +
    '#spot-dot:hover,#spot-dot.drag{opacity:.95}' +
    '#spot-dot.drag{scale:1.12}' +
    '#spot-dot.on{opacity:.9;background:rgba(150,40,28,.55);border-color:rgba(255,226,140,.85);box-shadow:0 0 16px 6px rgba(255,170,60,.45)}' +
    '#spot-dot.on .fl{animation:spot-flk .5s ease-in-out infinite alternate;transform-origin:16px 14px}' +
    '@keyframes spot-flk{from{transform:scale(1,1)}to{transform:scale(.92,1.08)}}' +
    '@media (max-width:600px){#spot-dot{display:none !important}}';
  document.head.appendChild(st);

  var L = document.createElement('div'); L.id = 'spot-layer'; L.className = 'idle';
  L.innerHTML = '<div id="spot-ring"></div><div id="spot-hint">手指拖曳／滑鼠移動　·　再點小圓點或 Esc 關閉</div>';
  var ring = L.firstChild, hint = L.lastChild, hintT = 0;
  var dot = document.createElement('div'); dot.id = 'spot-dot'; dot.setAttribute('role', 'button');
  dot.setAttribute('aria-label', '聚光燈開關（按住可拖曳移動）');
  /* 火炬：上面火焰、中間金色火炬碗、下面木柄 */
  dot.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true">' +
    '<g class="fl"><path d="M16 2 C19 6 22 8 21 12.5 C20.5 15 18.5 16 16 16 C13.5 16 11.5 15 11 12.5 C10.5 9.5 13 8 13.5 5.5 C14.5 7.5 15.5 8 15.5 8 C16.5 6 16.5 4 16 2 Z" fill="#f08a24"/>' +
    '<path d="M16 7.5 C17.8 10 19 11.5 18.4 13.4 C18 14.7 17 15.2 16 15.2 C15 15.2 14 14.7 13.6 13.4 C13.2 12 14.6 11 15 9.5 C15.6 10.6 16.2 10.6 16 7.5 Z" fill="#ffe27a"/></g>' +
    '<path d="M10 16 H22 L20.5 19.5 H11.5 Z" fill="#d4ad5a"/>' +
    '<path d="M12.5 19.5 H19.5 L17.6 30 H14.4 Z" fill="#8a5a32"/>' +
    '<path d="M13.2 22.5 H18.8" stroke="#d4ad5a" stroke-width="1"/></svg>'; dot.title = '聚光燈：點一下開關，按住拖曳移動（鍵盤 L）';

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
