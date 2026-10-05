
(function(){
function install(){
var c=document.getElementById('wk-ink-canvas');if(!c||c.dataset.v49fix)return;c.dataset.v49fix='1';
['touchstart','touchmove','touchend','touchcancel','pointerdown','pointermove','pointerup','pointercancel','contextmenu'].forEach(function(ev){c.addEventListener(ev,function(e){var l=document.getElementById('wk-ink-layer');if(l&&l.classList.contains('active')){if(e.cancelable)e.preventDefault();e.stopPropagation()}},{passive:false})});
document.addEventListener('selectstart',function(e){var l=document.getElementById('wk-ink-layer');if(l&&l.classList.contains('active'))e.preventDefault()},true)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install()
})();
