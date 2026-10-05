
(function(){
  function apply(w){
    var track=w.querySelector('.zy-track'), vp=w.querySelector('.zy-viewport'), img=w.querySelector('.zy-img');
    if(!track||!vp||!img) return;
    var max=parseInt(w.dataset.max||'0',10), st=parseInt(w.dataset.step||'0',10);
    var tw=img.getBoundingClientRect().width;             /* 長圖實際寬（不受 translate 影響） */
    var over=Math.max(0, tw - vp.clientWidth);
    var x = max>0 ? -(over*st/max) : 0;
    track.style.transform='translateX('+x+'px)';
    w.querySelectorAll('.zy-cap-item').forEach(function(el){ el.classList.toggle('on', parseInt(el.dataset.stop,10)===st); });
    w.querySelectorAll('.zy-lbl').forEach(function(el){ el.classList.toggle('on', parseInt(el.dataset.stop,10)===st); });
    var ind=w.querySelector('.zy-ind'); if(ind) ind.textContent='第 '+(st+1)+' / '+(max+1)+' 段';
    var pv=w.querySelector('.zy-prev'), nx=w.querySelector('.zy-next');
    if(pv) pv.disabled=(st<=0); if(nx) nx.disabled=(st>=max);
  }
  window.zyStep=function(btn,dir){
    var w=btn.closest ? btn.closest('.zy-wrap') : null; if(!w) return;
    var max=parseInt(w.dataset.max||'0',10), st=parseInt(w.dataset.step||'0',10);
    st=Math.max(0,Math.min(max,st+dir)); w.dataset.step=st; apply(w);
  };
  window.zyReset=function(btn){ var w=btn.closest ? btn.closest('.zy-wrap') : null; if(w){ w.dataset.step=0; apply(w); } };
  function initAll(){
    document.querySelectorAll('.zy-wrap').forEach(function(w){
      var img=w.querySelector('.zy-img');
      if(img && !img.dataset.bound){
        img.dataset.bound='1';
        if(img.complete) apply(w); else img.addEventListener('load',function(){ apply(w); });
        /* iPad：viewport 內左右拖曳切換停點（僅影響此圖，不動整頁） */
        var vp=w.querySelector('.zy-viewport'), sx=0, sstep=0, drag=false;
        vp.addEventListener('pointerdown',function(e){ drag=true; sx=e.clientX; sstep=parseInt(w.dataset.step||'0',10); });
        window.addEventListener('pointermove',function(e){
          if(!drag) return; var dx=e.clientX-sx;
          if(Math.abs(dx)>50){ var dir=dx<0?1:-1; var max=parseInt(w.dataset.max||'0',10);
            var st=Math.max(0,Math.min(max,sstep+dir)); w.dataset.step=st; apply(w); drag=false; }
        });
        window.addEventListener('pointerup',function(){ drag=false; });
      }
    });
  }
  var mo=new MutationObserver(function(){ initAll(); });
  window.addEventListener('load',function(){
    initAll();
    var a=document.getElementById('wk-slide-area'); if(a) mo.observe(a,{childList:true,subtree:true});
    var b=document.getElementById('wkfs-body'); if(b) mo.observe(b,{childList:true,subtree:true});
  });
})();
