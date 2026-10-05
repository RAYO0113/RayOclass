
/* v61：共用字級滑桿。
   - 註釋欄標題列（.tp-side-h）、補充卡標題列（#v60-bk-ov .v60-bk-head）各加一個滑桿；以 MutationObserver 處理換頁／卡片建立。
   - 「總」字卡（v54，#ss-anno-ov）原有滑桿 #ss-size 改為 26～46 並接到共用字級（不改 v54 程式；其 inline --rt 由 CSS !important 蓋過）。
   - 字級存 localStorage['v61-note-fs']，所有滑桿同步。 */
(function(){
  var KEY = 'v61-note-fs', MIN = 26, MAX = 46, DEF = 30;
  var cur = DEF;
  try { var s = parseInt(localStorage.getItem(KEY), 10); if (s >= MIN && s <= MAX) cur = s; } catch(e){}

  function apply(v, save){
    v = Math.max(MIN, Math.min(MAX, parseInt(v, 10) || DEF));
    cur = v;
    document.documentElement.style.setProperty('--v61-nfs', v + 'px');
    var rs = document.querySelectorAll('input.v61-fs-r, #ss-size');
    for (var i = 0; i < rs.length; i++) if (String(rs[i].value) !== String(v)) rs[i].value = v;
    var os = document.querySelectorAll('.v61-fs-v, #ss-sizeout');
    for (var j = 0; j < os.length; j++) os[j].textContent = v + 'px';
    if (save){ try { localStorage.setItem(KEY, String(v)); } catch(e){} }
  }

  function makeSlider(){
    var w = document.createElement('span');
    w.className = 'v61-fs';
    w.innerHTML = '<span>字級</span><input type="range" class="v61-fs-r" min="' + MIN + '" max="' + MAX + '" step="1" value="' + cur + '" aria-label="註釋字級"><span class="v61-fs-v">' + cur + 'px</span>';
    // 不讓點擊／拖曳冒泡到註釋欄或卡片（避免觸發其他點擊行為）
    ['click', 'pointerdown', 'mousedown', 'touchstart'].forEach(function(t){
      w.addEventListener(t, function(e){ e.stopPropagation(); }, { passive: true });
    });
    guardKeys(w);
    return w;
  }
  // 滑桿上按方向鍵是調字級；不要讓它冒泡到 document 的「←→ 換頁」（Esc 照常往上傳，可關卡片／投影）
  function guardKeys(el){
    el.addEventListener('keydown', function(e){ if (e.key !== 'Escape') e.stopPropagation(); });
  }

  function enhance(){
    var hs = document.querySelectorAll('.tp-side-h:not([data-v61fs])');
    for (var i = 0; i < hs.length; i++){
      hs[i].setAttribute('data-v61fs', '1');
      hs[i].appendChild(makeSlider());
    }
    var bh = document.querySelector('#v60-bk-ov .v60-bk-head:not([data-v61fs])');
    if (bh){ bh.setAttribute('data-v61fs', '1'); bh.appendChild(makeSlider()); }
    var ss = document.getElementById('ss-size');
    if (ss && !ss.hasAttribute('data-v61fs')){
      ss.setAttribute('data-v61fs', '1');
      ss.min = MIN; ss.max = MAX; ss.value = cur;
      guardKeys(ss);
      var so = document.getElementById('ss-sizeout'); if (so) so.textContent = cur + 'px';
    }
  }

  document.addEventListener('input', function(e){
    var t = e.target;
    if (t && (t.classList && t.classList.contains('v61-fs-r') || t.id === 'ss-size')) apply(t.value, true);
  }, true);

  var pend = false;
  function schedule(){ if (pend) return; pend = true; setTimeout(function(){ pend = false; enhance(); }, 0); }
  function boot(){
    apply(cur, false);
    enhance();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.v61NoteFs = function(v){ if (v != null) apply(v, true); return cur; };
})();
