
(function(){
  function setup(){
    var fs=document.getElementById('wk-fullscreen');
    var layer=document.getElementById('wk-ink-layer');
    var canvas=document.getElementById('wk-ink-canvas');
    if(!fs||!layer||!canvas||canvas.dataset.v50)return;
    canvas.dataset.v50='1';

    function active(){
      return layer.classList.contains('active');
    }

    function sync(){
      fs.classList.toggle('ink-mode',active());
      canvas.style.touchAction=active()?'none':'auto';
      canvas.style.webkitTouchAction=active()?'none':'auto';
    }

    /* 先攔截瀏覽器手勢，再讓原本的畫筆程式處理 pointer。 */
    ['pointerdown','pointermove','pointerup','pointercancel',
     'touchstart','touchmove','touchend','touchcancel',
     'contextmenu','dragstart','selectstart'].forEach(function(type){
      canvas.addEventListener(type,function(e){
        if(!active())return;
        if(type==='pointerdown' || type==='pointermove' ||
           type==='pointerup' || type==='pointercancel' ||
           type.indexOf('touch')===0 || type==='contextmenu' ||
           type==='dragstart' || type==='selectstart'){
          if(e.cancelable)e.preventDefault();
        }
        if(type!=='pointerup' && type!=='pointercancel')e.stopPropagation();
      },{passive:false});
    });

    /* 畫記開啟期間，阻止課文長按選取/拖曳；點擊事件不攔截，
       所以原本的句意、字義、補充等按鈕仍可使用。 */
    fs.addEventListener('selectstart',function(e){
      if(active() && e.target!==canvas)e.preventDefault();
    },true);
    fs.addEventListener('contextmenu',function(e){
      if(active() && e.target!==canvas)e.preventDefault();
    },true);
    fs.addEventListener('dragstart',function(e){
      if(active())e.preventDefault();
    },true);

    /* 監看既有 wkInkToggle() 對 active class 的切換。 */
    new MutationObserver(sync).observe(layer,{attributes:true,attributeFilter:['class']});
    sync();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',setup);
  }else{
    setup();
  }
})();
