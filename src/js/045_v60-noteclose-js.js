
/* v60：「✕ 收合」＝與再按一次「注釋 ▸」相同的結果：
   收起 .tp-wrap.side-on、取消「注釋 ▸」按鈕的 on、取消課文中已點開的註號（.tp-n.on）與註釋高亮（.tp-note.hi）。
   一般畫面與投影都適用；以 MutationObserver 處理換頁。不改 tpNotes()/tpTog()。 */
(function(){
  var fb = null, fbSide = null;

  function enhance(){
    var hs = document.querySelectorAll('.tp-side-h:not([data-v60x])');
    for (var i = 0; i < hs.length; i++){
      hs[i].setAttribute('data-v60x', '1');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'v60-side-x'; b.textContent = '✕ 收合'; b.setAttribute('aria-label', '收合注釋欄');
      hs[i].appendChild(b);
    }
  }
  function closeSide(slide){
    if (!slide) return;
    var wrap = slide.querySelector('.tp-wrap'); if (wrap) wrap.classList.remove('side-on');
    slide.querySelectorAll('.tp-b-note.on, .tp-n.on').forEach(function(x){ x.classList.remove('on'); });
    slide.querySelectorAll('.tp-note.hi').forEach(function(x){ x.classList.remove('hi'); });
    sync();
  }

  // 目前畫面上開著的注釋欄（投影開著時看投影，否則看一般畫面）
  function openSide(){
    var fs = document.getElementById('wk-fullscreen');
    var root = (fs && getComputedStyle(fs).display !== 'none') ? fs : document.getElementById('wk-slide-area');
    return root ? root.querySelector('.tp-wrap.side-on .tp-side') : null;
  }
  function sync(){
    if (!fb) return;
    var side = openSide(), show = false;
    if (side){
      var h = side.querySelector('.tp-side-h');
      var sr = side.getBoundingClientRect(), hr = h ? h.getBoundingClientRect() : sr;
      var fs = side.closest('#wk-fullscreen'), topLim = 0;
      if (fs){ var head = fs.querySelector('.wkfs-header'); if (head) topLim = head.getBoundingClientRect().bottom; }
      // 標題列被捲出畫面（或被投影標題列蓋住），但注釋欄本身還在畫面上 → 浮出按鈕
      if (hr.top < topLim && sr.bottom > topLim + 80 && sr.width > 40) show = true;
    }
    fbSide = show ? side : null;
    fb.classList.toggle('show', show);
    if (show){
      var top = (topLim + 10) + 'px', left = Math.round(Math.max(8, sr.left + (sr.width - fb.offsetWidth) / 2)) + 'px';
      if (fb.style.top !== top) fb.style.top = top;
      if (fb.style.left !== left) fb.style.left = left;
    }
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.v60-side-x');
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    closeSide(b.closest('.wk-slide'));
  }, true);

  var pend = false;
  function schedule(){ if (pend) return; pend = true; setTimeout(function(){ pend = false; enhance(); sync(); }, 0); }
  function boot(){
    fb = document.createElement('button');
    fb.type = 'button'; fb.id = 'v60-side-float'; fb.textContent = '✕ 收合註釋'; fb.setAttribute('aria-label', '收合注釋欄');
    fb.addEventListener('click', function(e){ e.stopPropagation(); if (fbSide) closeSide(fbSide.closest('.wk-slide')); });
    document.body.appendChild(fb);
    enhance();
    // 浮動按鈕自己的 class/style 變動不觸發，避免自我循環
    new MutationObserver(function(recs){
      for (var i = 0; i < recs.length; i++) if (recs[i].target !== fb){ schedule(); return; }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
