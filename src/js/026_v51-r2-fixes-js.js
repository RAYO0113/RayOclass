
(function(){
  function restore(el){ try{ if(typeof tpRestorePopup==='function') tpRestorePopup(el); }catch(e){} }
  /* 修正：關閉時同時移除 .show 並「還原」detach 到 body 的浮窗（含紫色 .tp-p） */
  window.closeAllBlueFloatingNotes = function(){
    document.querySelectorAll('.tp-g.show, .tp-z.show, .tp-p.show').forEach(function(el){
      el.classList.remove('show'); restore(el);
    });
    document.querySelectorAll('body > .tp-popup-detached').forEach(function(p){
      p.classList.remove('tp-popup-detached'); p.style.display='none'; p.style.visibility='hidden';
    });
  };
  window.tpCloseAllPopups = window.closeAllBlueFloatingNotes;
  /* 浮窗右上角 ✕ 注入已移除：藍色浮窗（字義{g}/通假{z}/補充{p}）改由再次點擊同一入口關閉（tpTogglePop）。 */
  /* ink 啟用時：畫記層移到 body、z 蓋過浮窗(12000)，使 Apple Pencil 可畫在浮窗上；停用時還原 */
  function inkSync(){
    var st=window.wkInkState, layer=document.getElementById('wk-ink-layer');
    if(!layer||!st) return;
    if(st.active){
      if(layer.parentNode!==document.body){ layer._op=layer.parentNode; layer._on=layer.nextSibling; document.body.appendChild(layer); }
      layer.style.position='fixed'; layer.style.inset='0'; layer.style.zIndex='12500';
      document.body.classList.add('ink-on');
      if(typeof wkInkSetupCanvas==='function') wkInkSetupCanvas();
    }else{
      if(layer._op){ try{ layer._op.insertBefore(layer, layer._on); }catch(e){ layer._op.appendChild(layer);} layer._op=null; }
      layer.style.position=''; layer.style.inset=''; layer.style.zIndex='';
      document.body.classList.remove('ink-on');
      if(typeof wkInkSetupCanvas==='function') wkInkSetupCanvas();
    }
  }
  var _t=window.wkInkToggle;
  if(typeof _t==='function'){ window.wkInkToggle=function(){ _t.apply(this,arguments); inkSync(); }; }
  /* ink 工具列加「✕浮框」（ink 模式下也能關閉浮窗；此鈕在畫記層內、位於 canvas 之上） */
  function addInkCloseBtn(){
    var extra=document.getElementById('wk-ink-extra');
    if(extra && !document.getElementById('wk-ink-closepop')){
      var b=document.createElement('button'); b.type='button'; b.id='wk-ink-closepop'; b.className='wk-ink-btn';
      b.textContent='✕浮框'; b.title='關閉所有浮框';
      b.addEventListener('click', function(){ window.closeAllBlueFloatingNotes(); });
      extra.appendChild(b);
    }
  }
  window.addEventListener('load', function(){
    addInkCloseBtn();
  });
})();
