
(function(){
function fix(){
document.querySelectorAll('#tab-wenxue,#wk-fullscreen').forEach(function(root){
if(root.dataset.v49fixed)return;
var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),n;
while(n=w.nextNode()){
var i=n.nodeValue.indexOf('古之學者必有師');
if(i<0)continue;
var f=document.createDocumentFragment();
f.appendChild(document.createTextNode(n.nodeValue.slice(0,i+4)));
var s=document.createElement('span');s.className='v49-first-bi-meaning';s.textContent='必';f.appendChild(s);
f.appendChild(document.createTextNode(n.nodeValue.slice(i+5)));
n.parentNode.replaceChild(f,n);root.dataset.v49fixed='1';break
}
})
}
document.addEventListener('DOMContentLoaded',function(){fix();var o=new MutationObserver(fix);o.observe(document.body,{childList:true,subtree:true});setTimeout(function(){o.disconnect()},5000)})
})();
