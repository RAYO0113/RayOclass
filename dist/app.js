/* ════ src/js/021_v49-first-meaning-fix.js ════ */
try {

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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/024_v51-lunyu-js.js ════ */
try {

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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/026_v51-r2-fixes-js.js ════ */
try {

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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/030_v54-anno-js.js ════ */
try {

(function(){
  var GY="請抄補充講義 P.34", KB="抄在課本上";
  var FGY="本字總整理 ‧ 對應補充講義：<span class=\"ss-ref\">二、字詞義比較　P.34</span>";
  var FKB="";
  var DATA={
    "師":{ zhuyin:"ㄕ", copy:GY, foot:FGY, senses:[
      { num:"①", def:"老師", ex:["古之學者必有「<b>師</b>」","「<b>師</b>」者，所以傳道、受業、解惑也","惑而不從「<b>師</b>」，其為惑也終不解矣","道之所存，「<b>師</b>」之所存也","愛其子，擇「<b>師</b>」而教之"] },
      { given:true, def:"從師問學的", ex:["「<b>師</b>」道之不傳也久矣","「<b>師</b>」道之不復可知矣"] },
      { num:"②", def:"有專門技藝的人", ex:["巫、醫、樂「<b>師</b>」、百工之人","孔子師郯子、萇弘、「<b>師</b>」襄、老聃"] },
      { num:"③", def:"學習", ex:["生乎吾前，其聞道也，固先乎吾，吾從而「<b>師</b>」之","吾「<b>師</b>」道也，夫庸知其年之先後生於吾乎","於其身也則恥「<b>師</b>」焉","巫、醫、樂師、百工之人，不恥相「<b>師</b>」","孔子「<b>師</b>」郯子、萇弘、師襄、老聃"] }
    ]},
    "所以":{ copy:GY, foot:FGY, senses:[
      { given:true, def:"用來（表目的）", ex:["「<b>師</b>」者，「<b>所以</b>」傳道、受業、解惑也"] },
      { given:true, def:"為何（表原因）", ex:["聖人之「<b>所以</b>」為聖，愚人之「<b>所以</b>」為愚"] }
    ]},
    "貽":{ zhuyin:"一ˊ", copy:GY, foot:FGY, senses:[
      { given:true, def:"贈送", ex:["作〈師說〉以「<b>貽</b>」之"] },
      { given:true, def:"遺留", ex:["「<b>貽</b>」笑大方","「<b>貽</b>」害無窮","「<b>貽</b>」人口實"] }
    ]},
    "賤":{ zhuyin:"ㄐㄧㄢˋ", copy:GY, foot:FGY, senses:[
      { given:true, def:"地位低", ex:["是故無貴無「<b>賤</b>」、無長無少","貧「<b>賤</b>」夫妻百事哀"] },
      { given:true, def:"價格低廉", ex:["「<b>賤</b>」價出售"] },
      { given:true, def:"輕視", ex:["貴古「<b>賤</b>」今","貴遠「<b>賤</b>」近"] },
      { given:true, def:"謙稱自己的", ex:["「<b>賤</b>」息"] },
      { given:true, def:"輕佻不自重", ex:["輕「<b>賤</b>」"] }
    ]},
    "不恥不齒":{ title:"不恥／不齒", glyph:"辨", copy:GY, foot:FGY, senses:[
      { term:"不恥", def:"不以……為恥", ex:["「<b>不恥</b>」相師","「<b>不恥</b>」下問"] },
      { term:"不齒", def:"不屑與之並列", ex:["君子「<b>不齒</b>」"] }
    ]},
    "庸":{ zhuyin:"ㄩㄥ", copy:KB, foot:FKB, senses:[
      { given:true, def:"豈、何必", ex:["夫「<b>庸</b>」知其年之先後生於吾乎？"] },
      { given:true, def:"愚笨、拙劣的", ex:["「<b>庸</b>」奴、「<b>庸</b>」醫"] },
      { given:true, def:"平常的、普通的", ex:["平「<b>庸</b>」"] },
      { given:true, def:"需要", ex:["無「<b>庸</b>」置疑"] },
      { given:true, def:"酬謝", ex:["酬「<b>庸</b>」"] }
    ]},
    "之":{ zhuyin:"ㄓ", copy:KB, foot:FKB, senses:[
      { given:true, def:"助詞，的", ex:["古「<b>之</b>」學者","道「<b>之</b>」所存"] },
      { given:true, def:"代詞（指道、業）", ex:["人非生而知「<b>之</b>」者","作〈師說〉以貽「<b>之</b>」"] },
      { given:true, def:"主謂之間，取消句子獨立性", ex:["師道「<b>之</b>」不傳也久矣","句讀「<b>之</b>」不知"] }
    ]},
    "者":{ zhuyin:"ㄓㄜˇ", copy:KB, foot:FKB, senses:[
      { given:true, def:"代詞，……的人", ex:["古之學「<b>者</b>」必有師","人非生而知之「<b>者</b>」"] },
      { given:true, def:"助詞，句中表停頓", ex:["「<b>師者</b>」，所以傳道、受業、解惑也"] }
    ]},
    "於":{ zhuyin:"ㄩˊ", copy:KB, foot:FKB, senses:[
      { given:true, def:"向", ex:["恥學「<b>於</b>」師","請學「<b>於</b>」余"] },
      { given:true, def:"從、由", ex:["其皆出「<b>於</b>」此乎"] },
      { given:true, def:"對於", ex:["「<b>於</b>」其身也，則恥師焉"] },
      { given:true, def:"比（引進比較對象）", ex:["師不必賢「<b>於</b>」弟子"] },
      { given:true, def:"被（表被動）", ex:["不拘「<b>於</b>」時"] }
    ]},
    "其":{ zhuyin:"ㄑㄧˊ", copy:KB, foot:FKB, senses:[
      { given:true, def:"那些（代詞）", ex:["「<b>其</b>」為惑也，終不解矣"] },
      { given:true, def:"大概（推測語氣）", ex:["「<b>其</b>」皆出於此乎"] },
      { given:true, def:"他、他們（代詞）", ex:["余嘉「<b>其</b>」能行古道"] }
    ]},
    "學者":{ glyph:"學者", copy:KB, foot:FKB, senses:[
      { given:true, def:"古義：求學的人", ex:["古之「<b>學者</b>」必有師"] },
      { given:true, def:"今義：學問淵博而有成就的人", ex:["（今用）他是一位「<b>學者</b>」"] }
    ]}
  };
  var CONFIG=[
    { key:"師", anchor:"師不必賢於弟子", beforePhrase:"不必賢" },
    { key:"庸", anchor:"夫庸知其年", ch:"庸" },
    { key:"賤", anchor:"無貴無賤", ch:"賤" },
    { key:"所以", anchor:"愚人之所以為愚", ch:"所以" },
    { key:"者", anchor:"解其惑者也", ch:"者" },
    { key:"不恥不齒", anchor:"君子不齒", ch:"不齒" },
    { key:"於", anchor:"請學於余", ch:"於" },
    { key:"其", anchor:"余嘉其能行古道", ch:"其" },
    { key:"貽", anchor:"以貽", ch:"貽" },
    { key:"之", anchor:"以貽", ch:"之" },
    { key:"學者", anchor:"古之學者", ch:"學者" }
  ];
  var ov=null;
  function build(){
    ov=document.createElement('div'); ov.id='ss-anno-ov';
    ov.innerHTML='<div class="ss-sheet"><div class="ss-head"><svg viewBox="0 0 900 80" preserveAspectRatio="none"><g fill="none" stroke="#C9A227" stroke-width="1"><path d="M-20 60 C 120 26 160 78 300 46 S 520 14 680 52 S 860 34 940 50" opacity=".8"/><path d="M-20 68 C 120 36 160 86 300 54 S 520 24 680 60 S 860 44 940 58" opacity=".5"/></g></svg><div class="ss-hr"><span class="ss-ttl" id="ss-ttl"></span><span class="ss-copy" id="ss-copy"></span><button class="ss-close" id="ss-close">返回課文 ↩</button></div></div><div class="ss-tools"><span style="font-size:12px;color:#8A8368">字級</span><input type="range" id="ss-size" min="15" max="30" step="1" value="19"><span id="ss-sizeout" style="font-size:12px;color:#9A7A12">19px</span></div><div class="ss-body" id="ss-body"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){ if(e.target===ov) hide(); });
    ov.querySelector('#ss-close').addEventListener('click',hide);
    var sz=ov.querySelector('#ss-size'), so=ov.querySelector('#ss-sizeout'), body=ov.querySelector('#ss-body');
    sz.addEventListener('input',function(){ body.style.setProperty('--rt',sz.value+'px'); so.textContent=sz.value+'px'; });
  }
  function exList(arr){ return '<ol class="ss-exs">'+arr.map(function(e){ return '<li>'+e+'</li>'; }).join('')+'</ol>'; }
  function render(key){
    var d=DATA[key]; if(!d) return;
    var glyph=d.glyph||key;
    ov.querySelector('#ss-ttl').textContent='〈師說〉字義總整理：'+(d.title||key);
    ov.querySelector('#ss-copy').textContent=d.copy;
    var n=d.senses.length;
    var gcls='ss-glyph'+((glyph.length>1)?' ss-glyph-sm':'');
    var h='<div class="ss-yi"><div class="ss-big"><span class="ss-tri">▲</span><span class="'+gcls+'">'+glyph+'</span>'+(d.zhuyin?'<span class="ss-rv" data-v="'+d.zhuyin+'" style="min-width:56px">音</span>':'')+'</div><div class="ss-tbl">';
    d.senses.forEach(function(s,i){
      var last=(i===n-1)?' ss-last':'';
      var c1=s.num?'<span class="ss-bnum">'+s.num+'</span>':(s.term?'<span class="ss-term">'+s.term+'</span>':'');
      h+='<div class="ss-c ss-c-num'+last+'">'+c1+'</div>';
      h+='<div class="ss-c ss-c-yi'+last+'">'+(s.given&&!s.term?'<span class="ss-given">'+s.def+'</span>':'<span class="ss-rv" data-v="'+s.def+'">義</span>')+'</div>';
      h+='<div class="ss-c ss-c-ex'+last+'">'+exList(s.ex)+'</div>';
    });
    h+='</div></div>'+(d.foot?'<div class="ss-foot">'+d.foot+'</div>':'');
    var body=ov.querySelector('#ss-body'); body.innerHTML=h; body.scrollTop=0;
    body.querySelectorAll('.ss-rv').forEach(function(el){ el.dataset.label=el.textContent; el.addEventListener('click',function(){
      if(el.classList.contains('open')){ el.classList.remove('open'); el.textContent=el.dataset.label; }
      else{ el.classList.add('open'); el.textContent=el.dataset.v; }
    }); });
  }
  function show(key){ if(!ov) build(); render(key); ov.classList.add('show'); }
  function hide(){ if(ov) ov.classList.remove('show'); }
  window.ssOpenAnno=show;
  function makeBox(key){ var b=document.createElement('span'); b.className='ss-zong'; b.setAttribute('data-k',key); b.textContent='總'; b.title=key+' 字義總整理（點開）'; b.addEventListener('click',function(e){ e.stopPropagation(); show(key); }); return b; }
  function visText(l){ var s='', w=document.createTreeWalker(l, NodeFilter.SHOW_TEXT, null), n; while((n=w.nextNode())){ var pe=n.parentElement; if(pe && pe.offsetParent!==null) s+=n.nodeValue; } return s; }
  function injectOne(cfg, area){
    var lines=area.querySelectorAll('.tp-line'); var target=null;
    lines.forEach(function(l){ if(l.offsetParent!==null && visText(l).indexOf(cfg.anchor)>=0) target=l; });
    if(!target) return;
    var existing=target.querySelector('.ss-zong[data-k="'+cfg.key+'"]');
    if(existing){ if(existing.offsetParent!==null) return; existing.remove(); }
    var box=makeBox(cfg.key), placed=false;
    if(cfg.beforePhrase){
      var w=document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null), n;
      while((n=w.nextNode())){ if(n.nodeValue.indexOf(cfg.beforePhrase)<0) continue; var pe=n.parentElement; if(!pe||pe.offsetParent===null) continue; pe.parentNode.insertBefore(box, pe); placed=true; break; }
    } else {
      var w2=document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null), m, lastNode=null, lastIdx=-1;
      while((m=w2.nextNode())){ var pe2=m.parentElement; if(!pe2||pe2.offsetParent===null) continue; var i=m.nodeValue.lastIndexOf(cfg.ch); if(i>=0){ lastNode=m; lastIdx=i; } }
      if(lastNode){ var after=lastNode.splitText(lastIdx+cfg.ch.length); after.parentNode.insertBefore(box, after); placed=true; }
    }
    if(!placed) target.appendChild(box);
  }
  function injectArea(area){ if(!area) return; try{ area.querySelectorAll('.tp-more').forEach(function(m){ m.remove(); }); }catch(e){} CONFIG.forEach(function(cfg){ try{ injectOne(cfg, area); }catch(e){} }); }
  /* 一般檢視與全螢幕投影都注入「總」框（injectOne 具冪等檢查，重入不會重複） */
  function inject(){ try{ injectArea(document.getElementById('wk-slide-area')); injectArea(document.getElementById('wkfs-body')); }catch(e){} }
  function start(){ inject(); ['wk-slide-area','wkfs-body'].forEach(function(id){ try{ var area=document.getElementById(id); if(area){ new MutationObserver(function(){ inject(); }).observe(area,{childList:true,subtree:true}); } }catch(e){} }); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
  window.addEventListener('load',inject);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/032_v55-popup-connector-js.js ════ */
try {

/* ── 浮框連接（尖角/引線）＋ 多排永不重疊（不改核心；包裝 tpPlacePopup / tpRestorePopup）──
   ‧ 每個開啟的字義/注音/補充浮框，往上下多排找到不重疊的位置（絕不回退成重疊）
   ‧ 貼近字的框畫小尖角、被推遠的框改畫引線，連回它對應的字
   ‧ 換頁/關閉時清乾淨連接層，避免殘影 */
(function(){
  var NS='http://www.w3.org/2000/svg';
  var svg=null, map=new Map(), uid=0;
  var GAP=3, ROWGAP=6, PAD=4, NEAR=26, S=7;

  function ensureSvg(){
    if(svg && svg.isConnected) return svg;
    svg=document.getElementById('tp-conn-svg');
    if(!svg){
      svg=document.createElementNS(NS,'svg');
      svg.id='tp-conn-svg';
      svg.setAttribute('style','position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:11999;overflow:visible');
      document.body.appendChild(svg);
    }
    return svg;
  }
  function keyOf(el){ if(!el._tpConnId) el._tpConnId='c'+(++uid); return el._tpConnId; }
  function getPop(el){ return el._tpPopup || el.querySelector('.tp-gd,.tp-pd,.tp-zd'); }
  function colorOf(el){
    var p=getPop(el);
    if(p){ var c=getComputedStyle(p).borderTopColor; if(c && c!=='rgba(0, 0, 0, 0)' && c!=='transparent') return c; }
    return '#1f6fb2';
  }
  function boundsOf(el){
    try{ if(typeof tpPopupBounds==='function'){ var b=tpPopupBounds(el); if(b && isFinite(b.left)) return b; } }catch(e){}
    return {left:8, right:window.innerWidth-8, top:8, bottom:window.innerHeight-8};
  }
  function openEls(){ return [].slice.call(document.querySelectorAll('.tp-g.show,.tp-p.show,.tp-z.show')); }
  function othersRects(except){
    return openEls().filter(function(x){ return x!==except; })
      .map(function(x){ var p=getPop(x); return p?p.getBoundingClientRect():null; })
      .filter(Boolean);
  }

  /* 多排永不重疊：上0,下0,上1,下1,… 找第一個不撞其他框的位置 */
  function resolve(el){
    var pop=getPop(el); if(!pop) return;
    var a=el.getBoundingClientRect(), pr=pop.getBoundingClientRect();
    var W=pr.width, H=pr.height; if(!W||!H) return;
    var b=boundsOf(el), ax=a.left+a.width/2, others=othersRects(el);
    function clampX(x){ return Math.max(b.left, Math.min(x, b.right - W)); }
    function hit(r){ return others.some(function(o){ return !(r.right<=o.left-PAD||r.left>=o.right+PAD||r.bottom<=o.top-PAD||r.top>=o.bottom+PAD); }); }
    var xs=[ax-W/2, a.left, a.right-W, ax-W/2-22, ax-W/2+22].map(clampX);
    var chosen=null;
    for(var k=0;k<9 && !chosen;k++){
      var bands=[ {y:a.top-GAP-H-k*(H+ROWGAP), below:false}, {y:a.bottom+GAP+k*(H+ROWGAP), below:true} ];
      for(var bi=0; bi<bands.length && !chosen; bi++){
        var Y=bands[bi].y; if(Y<b.top || Y+H>b.bottom) continue;
        for(var xi=0; xi<xs.length; xi++){
          var r={left:xs[xi], right:xs[xi]+W, top:Y, bottom:Y+H};
          if(!hit(r)){ chosen={x:xs[xi], y:Y, below:bands[bi].below}; break; }
        }
      }
    }
    if(!chosen) chosen={x:clampX(ax-W/2), y:Math.min(b.bottom-H, a.bottom+GAP), below:true};
    pop.style.left=Math.round(chosen.x)+'px';
    pop.style.top=Math.round(chosen.y)+'px';
    el.classList.toggle('tp-pop-below', !!chosen.below);
  }

  function draw(el){
    if(!el || !el.isConnected || !el.classList.contains('show')){ remove(el); return; }
    var pop=getPop(el); if(!pop){ remove(el); return; }
    var a=el.getBoundingClientRect(), p=pop.getBoundingClientRect();
    if(!a.width || !p.width){ remove(el); return; }
    var ax=a.left+a.width/2;
    var above=(p.top+p.height/2) < (a.top+a.height/2);
    var edgeY=above ? p.bottom : p.top, tipY=above ? a.top : a.bottom;
    var vgap=above ? (a.top-p.bottom) : (p.top-a.bottom);
    var inSpan=(ax >= p.left+S+2) && (ax <= p.right-S-2);
    var col=(colorOf(el)||'#1f6fb2').trim();
    var g=map.get(keyOf(el));
    if(!g){
      var s=ensureSvg();
      g={el:el};
      g.tri=document.createElementNS(NS,'polygon');
      g.line=document.createElementNS(NS,'line');
      g.dot=document.createElementNS(NS,'circle'); g.dot.setAttribute('r','2.4');
      s.appendChild(g.line); s.appendChild(g.dot); s.appendChild(g.tri);
      map.set(el._tpConnId, g);
    }
    if(inSpan && vgap<=NEAR){
      var apexY=above ? (edgeY+Math.min(9,Math.max(5,tipY-edgeY+4))) : (edgeY-Math.min(9,Math.max(5,edgeY-tipY+4)));
      g.tri.setAttribute('points', (ax-S)+','+edgeY+' '+(ax+S)+','+edgeY+' '+ax+','+apexY);
      g.tri.setAttribute('fill',col); g.tri.setAttribute('stroke','#fff'); g.tri.setAttribute('stroke-width','1');
      g.tri.style.display=''; g.line.style.display='none'; g.dot.style.display='none';
    } else {
      var px=Math.max(p.left+10, Math.min(ax, p.right-10));
      g.line.setAttribute('x1',ax); g.line.setAttribute('y1',tipY); g.line.setAttribute('x2',px); g.line.setAttribute('y2',edgeY);
      g.line.setAttribute('stroke',col); g.line.setAttribute('stroke-width','1.6'); g.line.setAttribute('stroke-opacity','0.75'); g.line.setAttribute('stroke-linecap','round');
      g.dot.setAttribute('cx',ax); g.dot.setAttribute('cy',tipY); g.dot.setAttribute('fill',col);
      g.line.style.display=''; g.dot.style.display=''; g.tri.style.display='none';
    }
  }
  function remove(el){
    if(!el || !el._tpConnId) return;
    var g=map.get(el._tpConnId);
    if(g){ if(g.tri)g.tri.remove(); if(g.line)g.line.remove(); if(g.dot)g.dot.remove(); map.delete(el._tpConnId); }
  }
  /* 清孤兒：字已不在 DOM、或已不再顯示的連接，一律移除（修殘影） */
  function prune(){
    map.forEach(function(g, key){
      var el=g.el;
      if(!el || !el.isConnected || !el.classList.contains('show')){
        if(g.tri)g.tri.remove(); if(g.line)g.line.remove(); if(g.dot)g.dot.remove(); map.delete(key);
      }
    });
  }
  function clearAll(){
    map.forEach(function(g){ if(g.tri)g.tri.remove(); if(g.line)g.line.remove(); if(g.dot)g.dot.remove(); });
    map.clear();
  }
  function relayoutAll(){ prune(); openEls().forEach(function(el){ try{ resolve(el); }catch(e){} }); openEls().forEach(function(el){ try{ draw(el); }catch(e){} }); }
  window.tpConnRelayout=relayoutAll;

  function wrap(){
    if(typeof window.tpPlacePopup==='function' && !window.tpPlacePopup._connWrapped){
      var _p=window.tpPlacePopup;
      window.tpPlacePopup=function(el){ _p(el); try{ resolve(el); draw(el); }catch(e){} };
      window.tpPlacePopup._connWrapped=true;
    }
    if(typeof window.tpRestorePopup==='function' && !window.tpRestorePopup._connWrapped){
      var _r=window.tpRestorePopup;
      window.tpRestorePopup=function(el){ try{ remove(el); }catch(e){} _r(el); setTimeout(prune,0); };
      window.tpRestorePopup._connWrapped=true;
    }
  }
  wrap();
  if(!(window.tpPlacePopup && window.tpPlacePopup._connWrapped)) setTimeout(wrap,300);

  var raf=null;
  function onMove(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=null; prune(); openEls().forEach(draw); }); }
  window.addEventListener('scroll', onMove, true);
  window.addEventListener('resize', onMove);

  /* 清孤兒浮窗：換頁後「字錨」被重建，但先前搬到 body 的浮窗本體（tp-popup-detached，
     display:block!important）會殘留可見。凡是已無「連線中且顯示中的字錨」持有的浮窗，一律收起。 */
  function cleanOrphanPopups(){
    var owned=new Set();
    openEls().forEach(function(el){ if(el._tpPopup) owned.add(el._tpPopup); });
    document.querySelectorAll('body > .tp-popup-detached').forEach(function(pop){
      if(!owned.has(pop)){
        pop.classList.remove('tp-popup-detached');
        pop.style.display='none'; pop.style.visibility='hidden';
      }
    });
  }
  /* 換頁重繪：課文區/全螢幕內容被重建時，對應的字元素被取代 → prune 清孤兒連接、
     cleanOrphanPopups 收孤兒浮窗，避免殘影；切換修辭/句意圖層等不移除字的變動則保留。 */
  var praf=null;
  function onMutate(){ if(praf) return; praf=requestAnimationFrame(function(){ praf=null; cleanOrphanPopups(); prune(); }); }
  function watch(id){ var n=document.getElementById(id); if(n) new MutationObserver(onMutate).observe(n,{childList:true,subtree:true}); }
  function startWatch(){ watch('wk-slide-area'); watch('wkfs-body'); }
  if(document.readyState==='loading') window.addEventListener('load', startWatch); else startWatch();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/033_v56-note-quiz-js.js ════ */
try {

(function(){
  function nqExtractAnnotations(text){
    var out = [];
    var re = /\{n:(\d+)\|/g;
    var m;
    while ((m = re.exec(text)) !== null) {
      var no = parseInt(m[1], 10);
      var i = m.index + m[0].length;
      var depth = 1;
      var raw = '';
      while (i < text.length && depth > 0) {
        var c = text[i];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) break; }
        raw += c;
        i++;
      }
      out.push({ no: no, rawWord: raw });
      re.lastIndex = i + 1;
    }
    return out;
  }
  function nqCleanNested(raw){
    return raw.replace(/\{[gzpy]:([^|}]*)\|[^}]*\}/g, '$1');
  }
  function nqStripMarkupWhole(text){
    var result = '';
    var i = 0;
    while (i < text.length) {
      if (text[i] === '{') {
        var tagMatch = /^\{([nzgpy]):(\d+\|)?/.exec(text.slice(i));
        if (tagMatch) {
          var tagType = tagMatch[1];
          var colonIdx = text.indexOf(':', i);
          var k = colonIdx + 1;
          var numMatch = /^\d+\|/.exec(text.slice(k));
          if (numMatch) k += numMatch[0].length;
          // 逐字掃描找出這個標記對應的巢狀安全結尾 '}'，同時記錄「最外層（depth 1）」第一個 '|' 的位置，
          // 只有 g/z/p/y 這種「字|釋義」型標記才需要用它切掉後面的釋義；n 標記的內容整段都是字面文字。
          var content = '';
          var depth = 1;
          var p = k;
          var topPipeRel = -1;
          while (p < text.length && depth > 0) {
            var c = text[p];
            if (c === '{') depth++;
            else if (c === '}') { depth--; if (depth === 0) break; }
            else if (c === '|' && depth === 1 && topPipeRel < 0) topPipeRel = content.length;
            content += c;
            p++;
          }
          var literal;
          if (tagType !== 'n' && topPipeRel >= 0) {
            literal = content.slice(0, topPipeRel);
          } else {
            literal = content;
          }
          result += nqStripMarkupWhole(literal);
          i = p + 1;
          continue;
        }
      }
      result += text[i];
      i++;
    }
    return result;
  }
  var NQ_PUNCT_RE = /[、，,。！？「」『』：；\s]/g;
  function nqNorm(s){ return String(s).replace(NQ_PUNCT_RE, ''); }
  function nqStripTags(html){ return String(html).replace(/<[^>]+>/g, ''); }

  function nqResolveAnswer(word, segNotes){
    var normWord = nqNorm(word);
    for (var i=0;i<segNotes.length;i++){
      if (nqNorm(segNotes[i][0]) === normWord) return { answer: segNotes[i][1], how:'exact' };
    }
    var PREFIX_LEN = 4;
    var candidates = segNotes.filter(function(nItem){
      var nk = nqNorm(nItem[0]);
      if (nk.indexOf(normWord) >= 0 || normWord.indexOf(nk) >= 0) return true;
      var plen = Math.min(PREFIX_LEN, nk.length, normWord.length);
      if (plen >= PREFIX_LEN && nk.slice(0, plen) === normWord.slice(0, plen)) return true;
      return false;
    });
    candidates = candidates.sort(function(a,b){ return nqNorm(b[0]).length - nqNorm(a[0]).length; });
    if (candidates.length) {
      var best = candidates[0];
      var plain = nqStripTags(best[1]);
      var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var inlineRe = new RegExp(escaped + '[，,：:]([^。]+)。');
      var im = inlineRe.exec(plain);
      if (im) return { answer: word + '，' + im[1] + '。', how:'inline' };
      return { answer: plain, how:'whole' };
    }
    return null;
  }

  var nqBankCache = {};
  function wkBuildNoteBank(lessonKey){
    if (nqBankCache[lessonKey]) return nqBankCache[lessonKey];
    var entry = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK[lessonKey] : null;
    var bank = [];
    if (entry && Array.isArray(entry.textPages)) {
      entry.textPages.forEach(function(seg){
        var segNotes = Array.isArray(seg.notes) ? seg.notes : [];
        var lines = Array.isArray(seg.lines) ? seg.lines : [];
        lines.forEach(function(line){
          var text = line.text || '';
          var anns = nqExtractAnnotations(text);
          if (!anns.length) return;
          var sentence = nqStripMarkupWhole(text);
          anns.forEach(function(a){
            var word = nqCleanNested(a.rawWord);
            var resolved = nqResolveAnswer(word, segNotes);
            if (resolved) {
              bank.push({ no:a.no, word:word, sentence:sentence, answer:resolved.answer });
            }
          });
        });
      });
    }
    bank.sort(function(a,b){ return a.no - b.no; });
    nqBankCache[lessonKey] = bank;
    return bank;
  }

  /* RayOclass 4b：舊版出題面板（nqStart／nqAll／nqClose／nqToggle）已刪，新版在 036_v56-nq2-js；這裡只留題庫 wkBuildNoteBank */
  window.wkBuildNoteBank = wkBuildNoteBank;
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/036_v56-nq2-js.js ════ */
try {

(function(){
  /* ───────── 題庫：即時從 TEXTBOOK 解析（新課只要有 textPages 就自動出現） ─────────
     基本題目沿用 v55 的 wkBuildNoteBank()（[註號, 目標詞, 原句, 答案]）；
     另外算出：①目標詞在原句中的實際位置（同字多次出現時標對那一個）
               ②「整句＋小字詞」型註釋的出題選項（依註釋原文「詞，解釋。」切出，不改寫內容） */
  var PUN = /[、，,。！？「」『』：；\s]/;
  function norm(s){ return String(s).replace(/[、，,。！？「」『』：；\s]/g, ''); }
  var SPAN_RE = /<span class='(bk|zy)-note'>[\s\S]*?<\/span>/g;
  function spansOf(h){ return (String(h).match(SPAN_RE) || []).join(''); }
  function noSpan(h){ return String(h).replace(SPAN_RE, '').replace(/<[^>]+>/g, ''); }
  // 與 v55 nqStripMarkupWhole 相同邏輯：把 {n:}/{g:}/{z:}/{p:}/{y:} 攤平成純文字
  function strip(text){
    var result = '', i = 0;
    while (i < text.length){
      if (text[i] === '{'){
        var tm = /^\{([nzgpy]):(\d+\|)?/.exec(text.slice(i));
        if (tm){
          var tt = tm[1], k = text.indexOf(':', i) + 1;
          var nm = /^\d+\|/.exec(text.slice(k)); if (nm) k += nm[0].length;
          var content = '', depth = 1, p = k, tp = -1;
          while (p < text.length && depth > 0){
            var c = text[p];
            if (c === '{') depth++;
            else if (c === '}'){ depth--; if (depth === 0) break; }
            else if (c === '|' && depth === 1 && tp < 0) tp = content.length;
            content += c; p++;
          }
          result += strip((tt !== 'n' && tp >= 0) ? content.slice(0, tp) : content);
          i = p + 1; continue;
        }
      }
      result += text[i]; i++;
    }
    return result;
  }
  function clean(raw){ return raw.replace(/\{[gzpy]:([^|}]*)\|[^}]*\}/g, '$1'); }
  // 與 v55 nqResolveAnswer 相同的候選規則，但回傳整條 note
  function findNote(word, notes){
    var nw = norm(word);
    for (var i = 0; i < notes.length; i++) if (norm(notes[i][0]) === nw) return notes[i];
    var c = notes.filter(function(n){
      var nk = norm(n[0]);
      if (nk.indexOf(nw) >= 0 || nw.indexOf(nk) >= 0) return true;
      var pl = Math.min(4, nk.length, nw.length);
      return pl >= 4 && nk.slice(0, pl) === nw.slice(0, pl);
    }).sort(function(a, b){ return norm(b[0]).length - norm(a[0]).length; });
    return c[0] || null;
  }
  // 在原句中找「忽略標點」的片語，回傳 [起, 迄)
  function spanOf(s, phrase, from){
    var np = norm(phrase); if (!np) return null;
    for (var st = from || 0; st < s.length; st++){
      if (PUN.test(s[st])) continue;
      var k = 0, j = st;
      while (j < s.length && k < np.length){
        if (PUN.test(s[j])){ j++; continue; }
        if (s[j] !== np[k]) break;
        j++; k++;
      }
      if (k === np.length) return [st, j];
    }
    return null;
  }
  function isZhuyin(t){ return /^[ㄅ-ㄩˊˇˋ˙\s]+$/.test(t) || /^音/.test(t); }

  function buildVariants(row, L){
    if (!row || !row.note) return null;
    var key = row.note[0], html = row.note[1], s = row.sentence;
    if (norm(key).length < 3) return null;
    var whole = spanOf(s, key);
    if (!whole){ var q = /「(.+?)」/.exec(key); if (q && spanOf(s, q[1])) whole = [row.pos, row.pos + row.word.length]; }
    if (!whole) return null;                        // 註釋詞不在這一句 → 不拆
    var segs = noSpan(html).split(/(?<=[。？！])/).map(function(x){ return x.trim(); }).filter(Boolean);
    var main = [], subs = [];
    segs.forEach(function(sg){
      var body = sg.replace(/[。]$/, '');
      // v58：詞中每個字後可帶注音（如「饑（ㄐㄧ）饉（ㄐㄧㄣˇ），荒年」）；註釋標題為簡寫時，詞出現在原句中也可拆
      var mm = /^((?:[^，。（）「」『』？！、](?:（[^）]*）)?){1,6})，(.+)$/.exec(body);
      var mw = mm ? mm[1].replace(/（[^）]*）/g, '') : '';
      if (mm && (norm(key).indexOf(norm(mw)) >= 0 || norm(s).indexOf(norm(mw)) >= 0) && norm(mw) !== norm(key)){
        subs.push({ w: mw, a: mm[2] + '。' });
      } else if (!subs.length) main.push(sg);
      else subs[subs.length - 1].a += sg;
    });
    var good = subs.filter(function(x){ return !isZhuyin(x.a.replace(/。$/, '')); });
    if (!good.length || !main.length) return null;
    var vs = [[s.slice(whole[0], whole[1]), whole[0], whole[1], main.join('') + spansOf(html), 'whole']];
    good.forEach(function(x){
      // v58：同字多次出現時，依 NQ_SUB_POS 手動指定整句範圍內第幾個（見檔尾 v58-nq-subpos-js）
      var nth = (window.NQ_SUB_POS || {})[L + '|' + row.no + '|' + x.w], sp = null;
      if (nth){ var from = whole[0]; for (var ni = 0; ni < nth; ni++){ sp = spanOf(s, x.w, from); if (!sp) break; from = sp[1]; } }
      if (!sp) sp = spanOf(s, x.w, whole[0]) || spanOf(s, x.w, 0);
      if (sp) vs.push([x.w, sp[0], sp[1], x.a, 'sub']);
    });
    return vs.length >= 2 ? vs : null;
  }

  var bankCache = {};
  function buildLesson(L){
    if (bankCache[L]) return bankCache[L];
    var bank = (typeof wkBuildNoteBank === 'function') ? wkBuildNoteBank(L) : [];
    var rows = [];
    ((TEXTBOOK[L] || {}).textPages || []).forEach(function(seg){
      var notes = seg.notes || [];
      (seg.lines || []).forEach(function(line){
        var t = line.text || '', re = /\{n:(\d+)\|/g, m;
        while ((m = re.exec(t))){
          var i = m.index + m[0].length, d = 1, raw = '';
          while (i < t.length && d > 0){ var c = t[i]; if (c === '{') d++; else if (c === '}'){ d--; if (!d) break; } raw += c; i++; }
          var w = clean(raw);
          rows.push({ no: +m[1], word: w, sentence: strip(t), pos: strip(t.slice(0, m.index)).length, note: findNote(w, notes) });
        }
      });
    });
    rows.sort(function(a, b){ return a.no - b.no; });
    var items = [], pos = [], vars = {}, r = 0;
    bank.forEach(function(b, bi){
      while (r < rows.length && !(rows[r].no === b.no && rows[r].sentence === b.sentence && rows[r].word === b.word)) r++;
      var row = rows[r++];
      items.push([b.no, b.word, b.sentence, b.answer]);
      pos.push(row && row.sentence.substr(row.pos, b.word.length) === b.word ? row.pos : b.sentence.indexOf(b.word));
      var vs = buildVariants(row, L);
      if (vs) vars[bi] = vs;
    });
    // v59：收集本課所有 bk-note（補充）純文字，小考答案顯示時去除
    var bk = [];
    ((TEXTBOOK[L] || {}).textPages || []).forEach(function(seg){ (seg.notes || []).forEach(function(n){
      (String(n[1]).match(/<span class='bk-note'>[\s\S]*?<\/span>/g) || []).forEach(function(h){ bk.push(h.replace(/<[^>]+>/g, '')); });
    }); });
    return (bankCache[L] = { lesson: L, items: items, pos: pos, vars: vars, bk: bk });
  }
  function eligibleLessons(){
    var seen = {}, out = [];
    [].concat(typeof WK_14 !== 'undefined' ? WK_14 : [], typeof WK_EXTRA !== 'undefined' ? WK_EXTRA : [], typeof WK_PROSE !== 'undefined' ? WK_PROSE : [])
      .forEach(function(k){
        if (seen[k]) return; seen[k] = true;
        var e = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK[k] : null;
        if (e && Array.isArray(e.textPages) && e.textPages.length) out.push(k);
      });
    return out;
  }

  /* ───────── 小工具 ───────── */
  function $(id){ return document.getElementById('nq2-' + id); }
  var LS = {
    get: function(k, d){ try{ var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
    set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function byIdx(a, b){ return a - b; }

  var LESSONS = [], D = null;   // D = 目前課次 buildLesson() 結果
  var sel = [], excl = new Set(), must = new Set(), mode = 'pick';
  function items(){ return D ? D.items : []; }
  function itemKey(it){ return it[0] + '|' + it[1]; }
  function exKey(){ return 'nq-excl:' + D.lesson; }
  function muKey(){ return 'nq-must:' + D.lesson; }
  function varCount(i){ return (D.vars[i] || []).length; }
  function chipLabel(i){ return varCount(i) ? D.vars[i][0][0] : items()[i][1]; }

  function loadMarks(){
    var ex = new Set(LS.get(exKey(), [])), mu = new Set(LS.get(muKey(), []));
    excl = new Set(); must = new Set();
    items().forEach(function(it, i){
      if (ex.has(itemKey(it))) excl.add(i);
      else if (mu.has(itemKey(it))) must.add(i);
    });
  }
  function saveMarks(){
    LS.set(exKey(), Array.from(excl).map(function(i){ return itemKey(items()[i]); }));
    LS.set(muKey(), Array.from(must).map(function(i){ return itemKey(items()[i]); }));
  }
  function withMust(arr){ return Array.from(new Set(Array.from(must).concat(arr))).sort(byIdx); }

  /* ───────── 選題畫面 ───────── */
  function setLesson(L){
    D = buildLesson(L);
    loadMarks();
    sel = Array.from(must).sort(byIdx);
    var nos = items().map(function(it){ return it[0]; });
    $('ra').value = nos.length ? Math.min.apply(null, nos) : 1;
    $('rb').value = nos.length ? Math.max.apply(null, nos) : 1;
    LS.set('nq-lesson', L);
    render();
  }
  var HINTS = {
    pick: '點題目＝選入／取消；也可以用上方「範圍全選」或「隨機抽」。必考題一定會在裡面，排除題一定不會被抽到。',
    must: '必考模式：點題目＝設為必考／取消。隨機抽題時必考題一定抽到，剩下的名額才隨機補。標記會自動記住。',
    ex:   '排除模式：點題目＝排除／恢復（例如已經考過的）。排除紀錄會自動記住，下次打開還在。'
  };
  function render(){
    if (!items().length){
      $('grid').innerHTML = '<div class="empty">這一課目前沒有可抽題的註釋資料。</div>';
    } else {
      $('grid').innerHTML = items().map(function(it, i){
        var on = sel.indexOf(i) >= 0, ex = excl.has(i), mu = must.has(i);
        return '<button type="button" class="chip' + (on ? ' on' : '') + (ex ? ' ex' : '') + (mu ? ' must' : '') + '" data-i="' + i + '">' +
          '<span class="no">' + it[0] + '</span><span class="w serif">' + esc(chipLabel(i)) + '</span>' +
          (varCount(i) ? '<span class="vc">' + varCount(i) + '選1</span>' : '') + '</button>';
      }).join('');
    }
    var nEx = excl.size, nMu = must.size;
    var tags = [nMu ? '必考 ' + nMu : '', nEx ? '排除 ' + nEx : ''].filter(Boolean).join('・');
    $('cnt').textContent = '已選 ' + sel.length + ' 題' + (tags ? '（' + tags + '）' : '');
    $('bGo').disabled = !sel.length;
    $('bGo').style.opacity = sel.length ? 1 : .4;
    $('bUnex').style.display = (nEx || nMu) ? '' : 'none';
    $('hint').textContent = HINTS[mode];
  }
  function setMode(m){
    mode = m;
    $('mPick').className = m === 'pick' ? 'on' : '';
    $('mMust').className = m === 'must' ? 'on mu' : '';
    $('mEx').className = m === 'ex' ? 'on ex' : '';
    render();
  }
  function rangePool(){
    var a = +$('ra').value || 1, b = +$('rb').value || a;
    var lo = Math.min(a, b), hi = Math.max(a, b);
    return items().map(function(it, i){ return i; }).filter(function(i){ return items()[i][0] >= lo && items()[i][0] <= hi && !excl.has(i); });
  }

  /* ───────── 考卷畫面 ───────── */
  // 句子太長時只顯示目標所在的小句（以。！？；切），前後加「…」；目標跨小句就顯示整句
  function excerpt(s, a, b){
    var full = { pre: s.slice(0, a), w: s.slice(a, b), post: s.slice(b), cutL: false, cutR: false };
    if (a < 0 || s.length <= 30) return full;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return full;
    var acc = 0;
    for (var k = 0; k < parts.length; k++){
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return { pre: p.slice(0, a - acc), w: s.slice(a, b), post: p.slice(b - acc), cutL: k > 0, cutR: k < parts.length - 1 };
      acc = end;
    }
    return full;
  }
  // 決定這一題考什麼：有多個選項就等機率隨機挑一個
  // v59：小考答案不顯示補充（bk-note），只留課本正式註釋（注音 zy-note 照舊）
  function noBk(h){
    h = String(h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, '');
    (D.bk || []).forEach(function(x){ if (x) h = h.split(x).join(''); });
    return h;
  }
  function pickVariant(i){
    var it = items()[i], vs = D.vars[i];
    if (vs){ var v = vs[Math.floor(Math.random() * vs.length)]; return { w: v[0], a: v[1], b: v[2], ans: noBk(v[3]), whole: v[4] === 'whole' }; }
    var at = D.pos[i];
    return { w: it[1], a: at, b: at < 0 ? -1 : at + it[1].length, ans: noBk(it[3]), whole: false };
  }
  function startQuiz(){
    var q = $('shuffle').checked ? shuffle(sel) : sel.slice().sort(byIdx);
    $('qTitle').innerHTML = '〈' + esc(D.lesson.split('—')[0]) + '〉註釋小考<small>共 ' + q.length + ' 題・點題目看答案</small>';
    $('qlist').innerHTML = q.map(function(i, k){
      var it = items()[i], s = it[2], v = pickVariant(i);
      var x = v.a < 0 ? { pre: s, w: '', post: '', cutL: false, cutR: false } : excerpt(s, v.a, v.b);
      return '<article class="qc">' +
        '<div class="qn">' + (k + 1) + '</div>' +
        '<div class="qb">' +
          '<div class="qs serif">' + (x.cutL ? '<span class="el">…</span>' : '') + esc(x.pre) +
            (x.w ? '<mark>' + esc(x.w) + '</mark>' : '') + esc(x.post) + (x.cutR ? '<span class="el">…</span>' : '') +
            '<span class="src">註' + it[0] + '</span></div>' +
          '<div class="qa"><span class="qa-hint">點一下看答案</span>' +
            '<div class="qa-body"><span class="aw">' + (v.whole ? '整句' : esc(v.w)) + '：</span>' + v.ans + '</div></div>' +
        '</div></article>';
    }).join('') + (q.length > 5 ? '<div class="qend">— 共 ' + q.length + ' 題，以上 —</div>' : '');
    syncAllBtn();
    $('quiz').classList.add('show');
    $('qlist').scrollTop = 0;
  }
  function cards(){ return Array.prototype.slice.call(document.querySelectorAll('#nq2 .qc')); }
  function syncAllBtn(){
    var cs = cards();
    $('bAll').textContent = cs.length && cs.every(function(c){ return c.classList.contains('open'); }) ? '全部隱藏答案' : '全部顯示答案';
  }
  var fs = LS.get('nq-fs', 1);
  function applyFs(){ document.getElementById('nq2').style.setProperty('--q-fs', fs); LS.set('nq-fs', fs); }
  function syncDarkBtn(){ $('dark').textContent = document.body.classList.contains('dark-mode') ? '淺色' : '深色'; }

  /* ───────── 開關 ───────── */
  function nq2Open(){
    var old = document.getElementById('note-quiz-panel'); if (old) old.classList.remove('open');
    LESSONS = eligibleLessons();
    $('lesson').innerHTML = LESSONS.map(function(k, i){
      return '<option value="' + i + '">' + esc(k) + '（' + buildLesson(k).items.length + ' 題）</option>';
    }).join('');
    var last = LS.get('nq-lesson', LESSONS[0]);
    var li = Math.max(0, LESSONS.indexOf(last));
    $('lesson').value = li;
    applyFs(); syncDarkBtn();
    $('quiz').classList.remove('show');
    if (LESSONS.length) setLesson(LESSONS[li]);
    document.getElementById('nq2').classList.add('open');
  }
  function nq2Close(){ document.getElementById('nq2').classList.remove('open'); }

  function init(){
    $('grid').addEventListener('click', function(e){
      var b = e.target.closest('.chip'); if (!b) return;
      var i = +b.dataset.i;
      if (mode === 'pick'){
        if (excl.has(i) || must.has(i)) return;   // 必考／排除題要到各自模式才能改
        sel = sel.indexOf(i) >= 0 ? sel.filter(function(x){ return x !== i; }) : sel.concat(i);
      } else if (mode === 'must'){
        if (must.has(i)){ must.delete(i); sel = sel.filter(function(x){ return x !== i; }); }
        else { must.add(i); excl.delete(i); if (sel.indexOf(i) < 0) sel = sel.concat(i); }
        saveMarks();
      } else {
        if (excl.has(i)) excl.delete(i); else { excl.add(i); must.delete(i); sel = sel.filter(function(x){ return x !== i; }); }
        saveMarks();
      }
      render();
    });
    $('mPick').onclick = function(){ setMode('pick'); };
    $('mMust').onclick = function(){ setMode('must'); };
    $('mEx').onclick = function(){ setMode('ex'); };
    $('bRange').onclick = function(){ sel = withMust(rangePool()); render(); };
    $('bRand').onclick = function(){
      var n = Math.max(1, +$('rn').value || 5);
      var rest = Math.max(0, n - must.size);
      sel = withMust(shuffle(rangePool().filter(function(i){ return !must.has(i); })).slice(0, rest));
      render();
      if (must.size > n) alert('必考題有 ' + must.size + ' 題，超過設定的 ' + n + ' 題，已全部放入。');
    };
    $('bClear').onclick = function(){ sel = Array.from(must).sort(byIdx); render(); };
    $('bUnex').onclick = function(){
      if (confirm('清除這一課所有「必考」和「排除」標記？')){ excl.clear(); must.clear(); saveMarks(); render(); }
    };
    $('lesson').onchange = function(e){ setLesson(LESSONS[+e.target.value]); };
    $('bGo').onclick = function(){ if (sel.length) startQuiz(); };
    $('bBack').onclick = function(){ $('quiz').classList.remove('show'); };
    $('qlist').addEventListener('click', function(e){
      var c = e.target.closest('.qc'); if (!c) return;
      c.classList.toggle('open'); syncAllBtn();
    });
    $('bAll').onclick = function(){
      var cs = cards(), openAll = !cs.every(function(c){ return c.classList.contains('open'); });
      cs.forEach(function(c){ c.classList.toggle('open', openAll); });
      syncAllBtn();
    };
    $('bSm').onclick = function(){ fs = Math.max(.7, +(fs - .1).toFixed(2)); applyFs(); };
    $('bLg').onclick = function(){ fs = Math.min(1.6, +(fs + .1).toFixed(2)); applyFs(); };
    $('dark').onclick = function(){ if (typeof toggleDarkMode === 'function') toggleDarkMode(); syncDarkBtn(); };
    $('close').onclick = nq2Close;

    // 右側「註釋小考」邊籤改開新版（舊 onclick="nqToggle()" 抽屜面板不再使用）
    var tab = document.getElementById('note-quiz-tab');
    if (tab){ tab.removeAttribute('onclick'); tab.onclick = nq2Open; }
  }

  /* ───────── 面板打開時隱藏右側邊籤 ───────── */
  function initSideTabHide(){
    var ids = ['cls-panel', 'display-panel', 'note-quiz-panel'];
    var panels = ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);
    function sync(){
      var any = panels.some(function(p){ return p.classList.contains('open'); });
      document.body.classList.toggle('v56-panel-open', any);
    }
    var mo = new MutationObserver(sync);
    panels.forEach(function(p){ mo.observe(p, { attributes: true, attributeFilter: ['class'] }); });
    sync();
    // 投影模式開關 → body.v56-proj-open（投影時「註釋小考」邊籤移到第 5 格，避開「畫筆」）
    var fs = document.getElementById('wk-fullscreen');
    if (fs){
      // wkOpenProj()/wkCloseProj() 直接改 fs.style.display，所以看實際是否顯示，class 與 style 都監聽
      var syncProj = function(){ document.body.classList.toggle('v56-proj-open', getComputedStyle(fs).display !== 'none'); };
      new MutationObserver(syncProj).observe(fs, { attributes: true, attributeFilter: ['class', 'style'] });
      syncProj();
    }
  }

  /* ───────── 投影畫筆：改名「畫筆」、工具列移到下方換頁列、橡皮擦 ───────── */
  function initInk(){
    var tab = document.getElementById('wk-ink-tab');
    if (tab){ tab.textContent = '畫筆'; tab.setAttribute('aria-label', '開啟或關閉畫筆'); }

    // 工具列開關文字由 wkInkToggle()/wkCloseProj() 寫入「✎ 畫記／✎ 關閉畫記」，統一改成「畫筆」
    var toggle = document.getElementById('wk-ink-toggle');
    if (toggle){
      var fixText = function(){ if (toggle.textContent.indexOf('畫記') >= 0) toggle.textContent = toggle.textContent.replace(/畫記/g, '畫筆'); };
      new MutationObserver(fixText).observe(toggle, { childList: true, characterData: true, subtree: true });
      fixText();
    }

    var layer = document.getElementById('wk-ink-layer');
    var tb = document.getElementById('wk-ink-toolbar');
    var extra = document.getElementById('wk-ink-extra');
    var canvas = document.getElementById('wk-ink-canvas');
    var fs = document.getElementById('wk-fullscreen');
    var st = window.wkInkState;
    if (!layer || !tb || !extra || !toggle || !canvas || !fs || !st) return;

    // 左組：關閉畫筆／撤銷／清除本頁／橡皮擦；右組（原 #wk-ink-extra）：顏色、螢光筆、細、中
    var left = document.createElement('div'); left.id = 'wk-ink-grp-l';
    tb.insertBefore(left, tb.firstChild);
    left.appendChild(toggle);
    Array.prototype.slice.call(extra.querySelectorAll('.wk-ink-btn')).forEach(function(b){
      if (/撤銷|清除本頁/.test(b.textContent)) left.appendChild(b);
    });
    var er = document.createElement('button');
    er.type = 'button'; er.id = 'wk-ink-eraser'; er.className = 'wk-ink-btn'; er.textContent = '橡皮擦';
    left.appendChild(er);

    // 畫布只涵蓋投影內容區（標題列下緣 ～ 換頁列上緣），換頁列留給工具列與 ←→
    function fitInk(){
      var on = layer.classList.contains('active') && getComputedStyle(fs).display !== 'none';
      var head = fs.querySelector('.wkfs-header'), foot = fs.querySelector('.wkfs-footer');
      if (on && head && foot){
        var top = head.getBoundingClientRect().bottom, f = foot.getBoundingClientRect().top;
        canvas.style.top = top + 'px'; canvas.style.bottom = 'auto';
        canvas.style.height = Math.max(1, f - top) + 'px';
        layer.style.setProperty('--v56-foot-h', Math.max(44, Math.round(window.innerHeight - f)) + 'px');
      } else {
        canvas.style.top = ''; canvas.style.bottom = ''; canvas.style.height = '';
      }
      if (typeof wkInkSetupCanvas === 'function') wkInkSetupCanvas();
    }
    new MutationObserver(function(){ fitInk(); if (!layer.classList.contains('active')) setEraser(false); })
      .observe(layer, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function(){ if (layer.classList.contains('active')) fitInk(); });

    // 橡皮擦：畫筆色設成透明當「擦除軌跡」，軌跡掃過的筆畫整筆刪除；放開後移除擦除軌跡本身
    var ERASE = 'rgba(0,0,0,0)', saved = null;
    function setEraser(on){
      if (on){
        if (!saved) saved = { color: st.color, size: st.size };
        st.color = ERASE; st.size = 1;
        er.classList.add('on');
        document.querySelectorAll('.wk-ink-color').forEach(function(x){ x.classList.remove('on'); });
      } else if (saved){
        if (st.color === ERASE){           // 從橡皮擦改按「細／中」→ 恢復原本的顏色
          st.color = saved.color;
          document.querySelectorAll('.wk-ink-color').forEach(function(x){ x.classList.toggle('on', x.dataset.color === st.color); });
        }
        if (st.size === 1) st.size = saved.size; // 從橡皮擦改按顏色 → 恢復原本的粗細
        saved = null;
        er.classList.remove('on');
      }
    }
    er.addEventListener('click', function(){ setEraser(!er.classList.contains('on')); });
    ['wkInkColor', 'wkInkHighlighter', 'wkInkSetSize'].forEach(function(name){
      var orig = window[name];
      if (typeof orig === 'function') window[name] = function(){ var r = orig.apply(this, arguments); setEraser(false); return r; };
    });

    function segDist(px, py, ax, ay, bx, by){
      var dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      var t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
      var x = ax + t * dx - px, y = ay + t * dy - py;
      return Math.sqrt(x * x + y * y);
    }
    // 擦除：檢查「上一點 → 這一點」整段路徑（每 6px 取一點），手指／筆快速滑過也不會漏擦
    var lastPt = null;
    function eraseAt(e){
      var r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      var probes = [[px, py]];
      if (lastPt){
        var dx = px - lastPt[0], dy = py - lastPt[1], n = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 6);
        for (var m = 1; m < n; m++) probes.push([lastPt[0] + dx * m / n, lastPt[1] + dy * m / n]);
      }
      lastPt = [px, py];
      var arr = wkInkCurrentStrokes(), hit = false;
      for (var k = arr.length - 1; k >= 0; k--){
        var s0 = arr[k];
        if (!s0 || s0.color === ERASE || !s0.points) continue;
        var R = 16 + (s0.size || 3) / 2, pts = s0.points, gone = false;
        for (var q = 0; q < pts.length && !gone; q++){
          var a = pts[q], b = pts[q + 1] || a;
          for (var z = 0; z < probes.length; z++){
            if (segDist(probes[z][0], probes[z][1], a.x * r.width, a.y * r.height, b.x * r.width, b.y * r.height) <= R){ gone = true; break; }
          }
        }
        if (gone){ arr.splice(k, 1); hit = true; }
      }
      if (hit) wkInkRedraw();
    }
    function erasing(){ return st.active && st.color === ERASE; }
    canvas.addEventListener('pointerdown', function(e){ lastPt = null; if (erasing()) eraseAt(e); });
    canvas.addEventListener('pointermove', function(e){ if (erasing() && (e.buttons || st.drawing)) eraseAt(e); });
    var cleanup = function(){
      lastPt = null;
      setTimeout(function(){
        var arr = wkInkCurrentStrokes();
        for (var k = arr.length - 1; k >= 0; k--) if (arr[k] && arr[k].color === ERASE) arr.splice(k, 1);
        wkInkRedraw();
      }, 0);
    };
    canvas.addEventListener('pointerup', cleanup);
    canvas.addEventListener('pointercancel', cleanup);
  }

  window.nq2Open = nq2Open;
  window.nq2Close = nq2Close;
  window.nqToggle = nq2Open;          // 覆蓋 v55 的 nqToggle（實際生效版本＝本段）
  window.nq2BuildLesson = buildLesson;

  function boot(){ init(); initSideTabHide(); initInk(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/037_v58-nq-subpos-js.js ════ */
try {

/* 註釋小考：小字詞在整句中出現多次時，手動指定要標第幾個（從該註釋整句範圍的開頭數起，1 起算）。
   格式：'課名|註號|字詞': 第幾個。沒列在這裡的，照舊標第一個。新增一課跑 scripts/nq_split_check.js 看到警告時，經老師確認後加在這裡。 */
window.NQ_SUB_POS = {
  '師說|22|不': 3   // 句讀之不知，惑之不解，或師焉，或「不」焉：不，通「否」
};
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/039_v59-popup-fit-js.js ════ */
try {

/* v59：浮框不超出視窗、不蓋住右側邊籤（班級進度／顯示設定／註釋小考／投影時的畫筆等）。
   只包裝既有函式：tpPopupBounds（右界再扣掉邊籤）、tpPlacePopup（定位前先設定最大寬度）。不改原本定位邏輯。 */
(function(){
  function tabsLeft(){
    var lim = window.innerWidth - 8;
    document.querySelectorAll('[id$="-tab"]').forEach(function(t){
      var cs = getComputedStyle(t);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var b = t.getBoundingClientRect();
      if (b.width > 0 && b.width < 80 && b.height > 40 && b.left > window.innerWidth * 0.6) lim = Math.min(lim, b.left - 6);
    });
    return lim;
  }
  function wrap(){
    if (typeof window.tpPopupBounds === 'function' && !window.tpPopupBounds._v59fit){
      var _b = window.tpPopupBounds;
      window.tpPopupBounds = function(el){
        var b = _b(el);
        if (b) { var r = tabsLeft(); if (r > b.left + 120 && r < b.right) b.right = r; }
        return b;
      };
      window.tpPopupBounds._v59fit = true;
    }
    if (typeof window.tpPlacePopup === 'function' && !window.tpPlacePopup._v59fit){
      var _p = window.tpPlacePopup;
      window.tpPlacePopup = function(el){
        try {
          var pop = (typeof tpPopNode === 'function') ? tpPopNode(el) : null;
          var b = window.tpPopupBounds(el);
          if (pop && b) pop.style.setProperty('--v59-pop-maxw', Math.max(120, Math.floor(b.right - b.left)) + 'px');
        } catch(e){}
        return _p.apply(this, arguments);
      };
      window.tpPlacePopup._v59fit = true;
    }
  }
  wrap();
  window.addEventListener('load', wrap);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/041_v60-bkcard-js.js ════ */
try {

/* v60：補充卡。
   ①所有 .tp-note（註釋面板，一般畫面與投影都有）：把 bk-note 移進隱藏容器 .v60-bk-store，註釋下方加「補充」按鈕。
     適用所有課；沒有 bk-note 的註釋不加按鈕。以 MutationObserver 處理換頁／重新渲染。
   ②點「補充」→ 置中卡片＋遮罩；✕、點遮罩、Esc 關閉。換頁、關閉投影時自動關閉。
   ③投影時卡片放在 #wk-fullscreen 內、畫筆圖層下方，沿用現有畫筆（不新增 Canvas）。
     包裝 wkInkKey：卡片開著時筆跡存到「本頁::v60bk:課名#註號」，關卡後回到課文頁原本的筆跡，互不混在一起。
   包裝的既有函式（實際生效版本＝本段包在原版外層）：wkInkKey、wkRenderCurrent、wkCloseProj。 */
(function(){
  var ov = null, xb = null, cur = null;

  function enhance(){
    var ns = document.querySelectorAll('.tp-note:not([data-v60bk])');
    for (var i = 0; i < ns.length; i++){
      var n = ns[i];
      n.setAttribute('data-v60bk', '1');
      var bks = n.querySelectorAll(':scope > .bk-note');
      if (!bks.length) continue;
      var store = document.createElement('div');
      store.className = 'v60-bk-store';
      for (var k = 0; k < bks.length; k++) store.appendChild(bks[k]);
      n.appendChild(store);
      var w = document.createElement('span');
      w.className = 'v60-bk-btn-wrap';
      w.innerHTML = '<button type="button" class="v60-bk-btn">補充</button>';
      n.appendChild(w);
    }
  }
  var pend = false;
  // 用 setTimeout 而非 requestAnimationFrame：分頁在背景時 rAF 會暫停，按鈕就不會出現
  function schedule(){ if (pend) return; pend = true; setTimeout(function(){ pend = false; enhance(); }, 0); }

  function build(){
    if (ov) return;
    ov = document.createElement('div');
    ov.id = 'v60-bk-ov';
    ov.innerHTML = '<div class="v60-bk-card" role="dialog" aria-modal="true" aria-label="補充資料">' +
      '<div class="v60-bk-head"><span class="v60-bk-tag">補充</span><span class="v60-bk-ttl"></span></div>' +
      '<div class="v60-bk-body"></div></div>';
    ov.addEventListener('click', function(e){ if (e.target === ov) close(); });
    xb = document.createElement('button');
    xb.type = 'button'; xb.id = 'v60-bk-x'; xb.textContent = '✕ 關閉'; xb.setAttribute('aria-label', '關閉補充');
    xb.addEventListener('click', function(e){ e.stopPropagation(); close(); });
  }
  function fsShown(){ var fs = document.getElementById('wk-fullscreen'); return fs && getComputedStyle(fs).display !== 'none' ? fs : null; }
  function redrawInk(){ try { if (typeof wkInkRedraw === 'function') wkInkRedraw(); } catch(e){} }

  // 投影時卡片只蓋內容區（標題列下緣～換頁列上緣），標題列與換頁列（畫筆工具列、←→）照常可按
  function layout(){
    if (!ov || !cur) return;
    if (cur.fs){
      var head = cur.fs.querySelector('.wkfs-header'), foot = cur.fs.querySelector('.wkfs-footer');
      var top = head ? head.getBoundingClientRect().bottom : 0;
      var bot = foot ? window.innerHeight - foot.getBoundingClientRect().top : 0;
      ov.style.top = top + 'px'; ov.style.bottom = bot + 'px'; ov.style.left = '0'; ov.style.right = '0';
    } else {
      ov.style.top = ov.style.bottom = ov.style.left = ov.style.right = '';
    }
    var r = ov.querySelector('.v60-bk-card').getBoundingClientRect();
    xb.style.top = (r.top + 10) + 'px';
    xb.style.left = (r.right - xb.offsetWidth - 12) + 'px';
  }

  // 畫筆開啟時 #wk-ink-layer 會變成 position:fixed、z12500（v59 實測），蓋過整個 #wk-fullscreen（z9550）。
  // 因此關閉鈕一律掛在 body、position:fixed，z-index 設成比畫筆圖層高一層，畫筆開著也按得到。
  function fixZ(){
    if (!xb) return;
    var inkZ = 0;
    try { inkZ = parseInt(getComputedStyle(document.getElementById('wk-ink-layer')).zIndex, 10) || 0; } catch(e){}
    xb.style.zIndex = String(Math.max(11001, inkZ + 1));
  }

  function open(btn){
    var note = btn.closest('.tp-note'); if (!note) return;
    var store = note.querySelector('.v60-bk-store'); if (!store) return;
    build();
    var nn = note.querySelector('.tp-nn'), term = note.querySelector(':scope > b');
    var no = nn ? nn.textContent.trim() : '';
    var ttl = (no ? no + ' ' : '') + (term ? term.textContent.trim() : '');
    ov.querySelector('.v60-bk-ttl').textContent = ttl;
    ov.querySelector('.v60-bk-body').innerHTML = Array.prototype.map.call(store.children, function(s){
      return '<div class="v60-bk-item">' + s.innerHTML + '</div>';
    }).join('');
    var fs = note.closest('#wk-fullscreen') ? fsShown() : null;
    var host = fs || document.body;
    ov.classList.toggle('in-fs', !!fs);
    host.appendChild(ov); document.body.appendChild(xb);
    fixZ();
    cur = { id: (typeof wkKey !== 'undefined' ? String(wkKey) : '') + '#' + (note.id || ttl), fs: fs };
    ov.classList.add('show'); xb.classList.add('show');
    ov.querySelector('.v60-bk-body').scrollTop = 0;
    layout();
    redrawInk();
  }
  function close(){
    if (!cur) return;
    cur = null;
    if (ov){ ov.classList.remove('show'); xb.classList.remove('show'); }
    redrawInk();
  }

  // 補充卡開著時，畫筆筆跡另存一組（關卡後課文頁的筆跡不受影響）
  function wrapInk(){
    if (typeof window.wkInkKey === 'function' && !window.wkInkKey._v60){
      var _k = window.wkInkKey;
      window.wkInkKey = function(){ var k = _k.apply(this, arguments); return cur && cur.fs ? k + '::v60bk:' + cur.id : k; };
      window.wkInkKey._v60 = true;
    }
    ['wkRenderCurrent', 'wkCloseProj'].forEach(function(name){
      var f = window[name];
      if (typeof f === 'function' && !f._v60){
        window[name] = function(){ close(); return f.apply(this, arguments); };
        window[name]._v60 = true;
      }
    });
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.v60-bk-btn');
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    open(b);
  }, true);
  document.addEventListener('keydown', function(e){ if (cur && e.key === 'Escape'){ e.stopPropagation(); close(); } }, true);
  window.addEventListener('resize', function(){ if (cur) layout(); });

  function boot(){
    wrapInk();
    enhance();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    var layer = document.getElementById('wk-ink-layer');
    if (layer) new MutationObserver(fixZ).observe(layer, { attributes: true, attributeFilter: ['class', 'style'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', wrapInk);
  window.v60BkClose = close;
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/043_v60-nqrec-js.js ════ */
try {

/* v60：註釋小考紀錄（適用所有課文）。
   - 考卷畫面加「記錄本次小考」→ 勾選班級（可複選）→ 儲存；不按不存。
   - 題目 = 選題畫面上被選取的題（#nq2-grid .chip.on 的 data-i，即 sel），questionKeys 沿用 itemKey(it) = 註號|詞。
   - 一筆紀錄存 localStorage 'nq-records-v1'：{ lesson, rangeStart, rangeEnd, questionKeys, questions, classes, createdAt }
     rangeStart/rangeEnd＝本次題目的最小／最大註號。questions＝考卷上實際標記的字詞（依註號排序）。
   - 同時在「班級進度與考試紀錄」面板（cls_records_v1）每個勾選的班級各加一筆「考試」，逐題列出。
   - 只讀取既有畫面，不包裝、不改動 v56-nq2-js 任何函式。 */
(function(){
  var CLASSES = ['冷一忠', '冷一孝', '建一忠', '建一孝'];
  var KEY = 'nq-records-v1';
  function $(id){ return document.getElementById('nq2-' + id); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }
  function load(){ try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch(e){ return []; } }
  function today(){ var d = new Date(); function p(n){ return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  var rec = null;   // 本次考卷的紀錄內容（開始小考時算好）

  function currentLesson(){
    var s = $('lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function snapshot(){
    var L = currentLesson();
    if (!L || typeof window.nq2BuildLesson !== 'function') return null;
    var items = window.nq2BuildLesson(L).items;
    var idx = Array.prototype.map.call(document.querySelectorAll('#nq2-grid .chip.on'), function(b){ return +b.dataset.i; })
      .filter(function(i){ return items[i]; }).sort(function(a, b){ return a - b; });
    if (!idx.length) return null;
    // 考卷上實際標記的字詞：每張題卡的「註N」＋ <mark>（隨機拆題時可能是整句或小字詞）
    var shown = Array.prototype.map.call(document.querySelectorAll('#nq2-qlist .qc'), function(c){
      var src = c.querySelector('.src'), m = c.querySelector('.qs mark');
      return { no: src ? +String(src.textContent).replace(/\D/g, '') : 0, w: m ? m.textContent : '' };
    });
    var used = shown.map(function(){ return false; });
    var questions = idx.map(function(i){
      var it = items[i], w = it[1];
      for (var k = 0; k < shown.length; k++){ if (!used[k] && shown[k].no === it[0]){ used[k] = true; if (shown[k].w) w = shown[k].w; break; } }
      return { no: it[0], w: w };
    });
    var nos = idx.map(function(i){ return items[i][0]; });
    return {
      lesson: L,
      rangeStart: Math.min.apply(null, nos),
      rangeEnd: Math.max.apply(null, nos),
      questionKeys: idx.map(function(i){ return items[i][0] + '|' + items[i][1]; }),
      questions: questions
    };
  }
  function summary(r){
    return '〈' + r.lesson.split('—')[0] + '〉註釋小考　註' + r.rangeStart + '～註' + r.rangeEnd + '，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function(q){ return '註' + q.no + ' ' + q.w; }).join('、');
  }

  function resetBtn(){
    var b = $('v60rec'); if (!b) return;
    b.classList.remove('done'); b.disabled = false; b.textContent = '記錄本次小考';
  }
  function openDlg(){
    if (!rec) return;
    var d = $('v60dlg');
    d.querySelector('.v60-pv').textContent = summary(rec);
    Array.prototype.forEach.call(d.querySelectorAll('.v60-cls input'), function(x){ x.checked = false; x.parentNode.classList.remove('on'); });
    syncOk();
    d.classList.add('show');
  }
  function closeDlg(){ $('v60dlg').classList.remove('show'); }
  function picked(){ return Array.prototype.filter.call($('v60dlg').querySelectorAll('.v60-cls input'), function(x){ return x.checked; }).map(function(x){ return x.value; }); }
  function syncOk(){ $('v60dlg').querySelector('.v60-ok').disabled = !picked().length; }
  function save(){
    var classes = picked(); if (!classes.length || !rec) return;
    var r = { lesson: rec.lesson, rangeStart: rec.rangeStart, rangeEnd: rec.rangeEnd, questionKeys: rec.questionKeys,
              questions: rec.questions, classes: classes, createdAt: new Date().toISOString() };
    var all = load(); all.push(r);
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch(e){ alert('儲存失敗，可能是瀏覽器限制。'); return; }
    // 班級進度面板：每班各一筆「考試」
    if (typeof clsLoad === 'function' && typeof clsSave === 'function'){
      var cls = clsLoad(), t = esc(summary(r)), d = today();
      classes.forEach(function(c){
        cls[c] = cls[c] || [];
        cls[c].push({ d: d, k: '考試', t: t });
        cls[c].sort(function(a, b){ return b.d.localeCompare(a.d); });
      });
      clsSave(cls);
      if (typeof clsRender === 'function') clsRender();
    }
    closeDlg();
    var b = $('v60rec'); b.classList.add('done'); b.disabled = true; b.textContent = '已記錄 ✓（' + classes.join('、') + '）';
  }

  function init(){
    var all = $('bAll'), quiz = $('quiz');
    if (!all || !quiz) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'nq2-v60rec'; b.textContent = '記錄本次小考';
    all.parentNode.insertBefore(b, all);
    b.onclick = openDlg;

    var d = document.createElement('div');
    d.id = 'nq2-v60dlg';
    d.innerHTML = '<div class="v60-bx" role="dialog" aria-modal="true" aria-label="記錄本次小考">' +
      '<h3>記錄本次小考</h3>' +
      '<div class="v60-lb">班級（可複選）</div>' +
      '<div class="v60-cls">' + CLASSES.map(function(c){ return '<label><input type="checkbox" value="' + c + '">' + c + '</label>'; }).join('') + '</div>' +
      '<div class="v60-lb">紀錄內容</div><div class="v60-pv"></div>' +
      '<div class="v60-ft"><button type="button" class="v60-no">取消</button><button type="button" class="v60-ok">儲存紀錄</button></div></div>';
    document.getElementById('nq2').appendChild(d);
    d.addEventListener('change', function(e){ if (e.target.type === 'checkbox'){ e.target.parentNode.classList.toggle('on', e.target.checked); syncOk(); } });
    d.querySelector('.v60-no').onclick = closeDlg;
    d.querySelector('.v60-ok').onclick = save;
    d.addEventListener('click', function(e){ if (e.target === d) closeDlg(); });

    // 每次開始新的小考（考卷重新產生）→ 記下本次題目、按鈕回到可記錄狀態
    new MutationObserver(function(){
      if (!quiz.classList.contains('show')) { closeDlg(); return; }
      rec = snapshot(); resetBtn();
      b.style.display = rec ? '' : 'none';
    }).observe($('qlist'), { childList: true });
    new MutationObserver(function(){ if (!quiz.classList.contains('show')) closeDlg(); })
      .observe(quiz, { attributes: true, attributeFilter: ['class'] });
  }
  window.nqRecords = load;   // 除錯／匯出用：nqRecords() 取得全部紀錄
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/045_v60-noteclose-js.js ════ */
try {

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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/047_v61-notefs-js.js ════ */
try {

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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/050_v64-order-cover-js.js ════ */
try {

(function () {
  /* ── 側欄三類依課次排序（依據：翰林 115 版技高國文六冊選文表；第 3～6 冊為暫訂）──
     表內沒有的課放在最後，維持原本相對順序。 */
  function reorder(arr, order) {
    var head = order.filter(function (k) { return arr.indexOf(k) >= 0; });
    var rest = arr.filter(function (k) { return order.indexOf(k) < 0; });
    arr.splice.apply(arr, [0, arr.length].concat(head, rest));
  }
  reorder(WK_14, ['師說', '桃花源記', '岳陽樓記', '郁離子選', '種樹郭橐駝傳', '夢溪筆談選', '燭之武退秦師',
    '紅樓夢', '赤壁賦', '天工開物', '蘭亭集序', '臺煤減稅片', '清代臺灣鐵路', '庖丁解牛']);
  reorder(WK_EXTRA, ['世說新語選', '論語選—子路曾皙冉有公西華侍坐', '詩經', '漁父', '晚由六橋待月記',
    '大同與小康', '鴻門宴', '勞山道士']);   /* 醉翁亭記、始得西山宴遊記、出師表：115 版選文表未收，排最後 */
  reorder(WK_PROSE, ['身為魚販', '散戲']); /* 散戲：115 版選文表未收 */

  /* ── 白話文封面 ── */
  var PROSE_NO = { '身為魚販': '第一冊　第 1 課' };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var _v64orig = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'cover' && (WK_PROSE.indexOf(slide.key) >= 0 || (slide.data && slide.data.type === 'prose'))) {
      var a = (slide.data && slide.data.author) || {};
      var name = (a.name || '').split('，')[0];
      var no = PROSE_NO[slide.key] || '';
      return '<div class="wk-slide wks-pcover">' +
        '<div class="pc-deco"><span class="pc-q pc-q1">「</span><span class="pc-q pc-q2">」</span></div>' +
        '<div class="pc-top"><span class="pc-cat">白話文選讀</span>' + (no ? '<span class="pc-no">' + no + '</span>' : '') + '</div>' +
        '<div class="pc-body"><h1 class="pc-title">' + esc(slide.key) + '</h1><div class="pc-rule"></div>' +
        '<div class="pc-author"><span class="pc-by">文／</span>' + esc(name) +
        (a.dynasty ? '<span class="pc-era">' + esc(String(a.dynasty).split('（')[0]) + '</span>' : '') + '</div></div>' +
        '<div class="pc-foot">瑞媛的國文教學</div>' +
        '</div>';
    }
    return _v64orig.apply(this, arguments);
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/051_v65-prose-list-js.js ════ */
try {

(function () {
  /* 加入白話文清單，並依課次重排（第一冊 L01 身為魚販、L04 珍珠奶茶、L05 臺灣最美麗的火車線；散戲 115 版選文表未收，排最後） */
  ['珍珠奶茶', '臺灣最美麗的火車線'].forEach(function (k) { if (WK_PROSE.indexOf(k) < 0) WK_PROSE.push(k); });
  var order = ['身為魚販', '珍珠奶茶', '臺灣最美麗的火車線', '散戲'];
  var head = order.filter(function (k) { return WK_PROSE.indexOf(k) >= 0; });
  var rest = WK_PROSE.filter(function (k) { return order.indexOf(k) < 0; });
  WK_PROSE.splice.apply(WK_PROSE, [0, WK_PROSE.length].concat(head, rest));

  /* 白話文封面補冊次課次：v64 的 PROSE_NO 在閉包內，這裡在其輸出後補上（已有 pc-no 就不動） */
  var NO = { '珍珠奶茶': '第一冊　第 4 課', '臺灣最美麗的火車線': '第一冊　第 5 課' };
  var _v65prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _v65prev.apply(this, arguments);
    if (slide && slide.type === 'cover' && NO[slide.key] && h.indexOf('wks-pcover') >= 0 && h.indexOf('pc-no') < 0) {
      h = h.replace('<span class="pc-cat">白話文選讀</span>', '<span class="pc-cat">白話文選讀</span><span class="pc-no">' + NO[slide.key] + '</span>');
    }
    return h;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/054_v68-wk-js.js ════ */
try {

(function () {
  /* ① （RayOclass 4b：v68 版〈師說〉習作Ａ資料已刪，實際生效的是 056_v69 的 V69_SHISHUO_WB） */

  /* ② 答案總覽：加「全部隱藏／一鍵全開」，預設隱藏 */
  var _v68prev = wkRenderSlideHTML;
  /* 原總覽只認「答案／字音／字形…」表頭；師說習作「還原語句順序」欄也是答案欄，僅在總覽渲染用的複本中改認，不動資料 */
  var AO_COL_ALIAS = { '還原語句順序': '答案' };
  function aoSlideCopy(slide) {
    var W = slide.workbook || {};
    var hit = (W.sections || []).some(function (s) { return (s.cols || []).some(function (c) { return AO_COL_ALIAS[c]; }); });
    if (!hit) return slide;
    var W2 = Object.assign({}, W, { sections: W.sections.map(function (s) {
      return Object.assign({}, s, { cols: (s.cols || []).map(function (c) { return AO_COL_ALIAS[c] || c; }) });
    }) });
    return Object.assign({}, slide, { workbook: W2 });
  }
  wkRenderSlideHTML = function (slide) {
    var h = (slide && slide.type === 'work_answers') ? _v68prev.call(this, aoSlideCopy(slide)) : _v68prev.apply(this, arguments);
    if (slide && slide.type === 'work_answers' && h.indexOf('wk-ao-page') >= 0) {
      h = h.replace('wks-workanswers wk-ao-page', 'wks-workanswers wk-ao-page v68-ao-hidden');
      h = h.replace('填空類直接列答案；選擇題點題號可跳回該題檢討，答案不必再點一次。',
        '答案預設隱藏：點一格顯示該題答案；選擇題顯示答案後再點一次，可跳回該題檢討。');
      h = h.replace(/(<div class="wk-ao-desc">[\s\S]*?<\/div>)/,
        '$1<div class="v68-ao-bar"><button type="button" onclick="v68AoAll(this,false)">全部隱藏</button>' +
        '<button type="button" onclick="v68AoAll(this,true)">一鍵全開</button></div>');
    }
    return h;
  };
  window.v68AoAll = function (btn, show) {
    var sl = btn.closest('.wk-slide');
    if (!sl) return;
    sl.querySelectorAll('.wk-ao-chip, .wk-ao-choice').forEach(function (el) { el.classList.toggle('v68-show', show); });
  };
  /* 捕獲階段攔截：未顯示的格子先顯示答案，不觸發選擇題原本的跳題 */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('.v68-ao-hidden .wk-ao-chip, .v68-ao-hidden .wk-ao-choice') : null;
    if (!t) return;
    if (t.classList.contains('wk-ao-chip')) { t.classList.toggle('v68-show'); return; }
    if (!t.classList.contains('v68-show')) { t.classList.add('v68-show'); e.stopPropagation(); e.preventDefault(); }
  }, true);

  /* ③ 課文頁下方列出本頁出現的「字·X」 */
  function plainText(s) {
    var t = String(s || ''), prev;
    do { prev = t; t = t.replace(/\{[gzpy]:([^|{}]*)\|[^{}]*\}/g, '$1'); } while (t !== prev);
    do { prev = t; t = t.replace(/\{n:\d+\|([^{}]*)\}/g, '$1'); } while (t !== prev);
    return t.replace(/<[^>]+>/g, '');
  }
  function pageCharBian(page) {
    if (!page || !wkSlides) return [];
    var txt = (page.lines || []).map(function (L) { return plainText(L.text); }).join('');
    var out = [];
    wkSlides.forEach(function (s, i) {
      if (s.type !== 'charbian' || !s.first) return;
      var base = wkBaseName(s.name);
      var hit = base.split(/[／\/]/).some(function (v) { return v && txt.indexOf(v) >= 0; });
      if (hit) out.push({ name: s.name, idx: i });
    });
    return out;
  }
  window.v68CbJump = function (ev, idx) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    window.wkReturnTo = { idx: wkIdx, li: null };
    wkGoto(idx);
  };
  function injectCbBar() {
    var s = wkSlides && wkSlides[wkIdx];
    if (!s || s.type !== 'textpage') return;
    var list = pageCharBian(s.page);
    if (!list.length) return;
    var html = '<span class="v68-cbbar-h">本頁字詞辨析</span>' + list.map(function (c) {
      return '<button type="button" onclick="v68CbJump(event,' + c.idx + ')">字·' + c.name + '</button>';
    }).join('');
    document.querySelectorAll('#wk-slide-area .wks-textpage .tp-main, #wkfs-body .wks-textpage .tp-main').forEach(function (m) {
      if (m.querySelector('.v68-cbbar')) return;
      var d = document.createElement('div');
      d.className = 'v68-cbbar';
      d.innerHTML = html;
      m.appendChild(d);
    });
  }

  /* ④ 導覽列（一般＋全螢幕）字·X 收成「字詞辨析 ▾」 */
  function collapseNav(boxId, btnCls) {
    var box = document.getElementById(boxId);
    if (!box || box.querySelector('.v68-cb-toggle')) return;
    var btns = Array.prototype.filter.call(box.querySelectorAll('button.' + btnCls), function (b) {
      return (b.textContent || '').indexOf('字·') === 0;
    });
    if (btns.length < 2) return;
    var tog = document.createElement('button');
    tog.type = 'button';
    tog.className = btnCls + ' v68-cb-toggle';
    tog.textContent = '字詞辨析 ▾';
    var grp = document.createElement('span');
    grp.className = 'v68-cb-group';
    tog.onclick = function (e) {
      e.stopPropagation();
      var open = grp.classList.toggle('open');
      tog.textContent = open ? '字詞辨析 ▴' : '字詞辨析 ▾';
    };
    box.insertBefore(tog, btns[0]);
    box.insertBefore(grp, btns[0]);
    btns.forEach(function (b) { grp.appendChild(b); });
  }
  function markToggle() {
    [['wk-sections', 'wk-sec-active'], ['wkfs-sections', 'active']].forEach(function (p) {
      var box = document.getElementById(p[0]);
      var tog = box && box.querySelector('.v68-cb-toggle');
      if (!tog) return;
      tog.classList.toggle(p[1], !!box.querySelector('.v68-cb-group .' + p[1]));
    });
  }

  var _v68render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v68render.apply(this, arguments);
    try { injectCbBar(); } catch (e) {}
    try { markToggle(); } catch (e) {}
    return r;
  };
  var _v68show = showWenxue;
  showWenxue = function () {
    var r = _v68show.apply(this, arguments);
    collapseNav('wk-sections', 'wk-sec-btn'); markToggle();
    return r;
  };
  var _v68proj = wkOpenProj;
  wkOpenProj = function () {
    var r = _v68proj.apply(this, arguments);
    collapseNav('wkfs-sections', 'wkfs-sec-btn'); markToggle();
    return r;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/056_v69-answer-color-js.js ════ */
try {

(function () {
  /* 〈師說〉：資料行不動（AGENTS §2），執行期覆寫習作（v68 版補原卷圖）與 A卷（依原卷校正，詳見 docs/交接_V69*.md） */
  var V69_SHISHUO_WB = {"title": "習作Ａ　第三課　師說", "sections": [{"kind": "table", "head": "壹 基礎認知站　一、字音探勘隊（每題 1 分，共 8 分）", "cols": ["", "字音", "詞語", "", "字音", "詞語"], "rows": [["1", "ㄉㄢ", "老「聃」", "2", "ㄉㄡˋ", "句「讀」"], ["3", "ㄆㄢˊ", "李「蟠」", "4", "ㄈㄢ", "「幡」然悔悟"], ["5", "ㄩˊ", "阿「諛」諂媚", "6", "ㄩˇ", "「庾」先生"], ["7", "ㄊㄢˊ", "「郯」子", "8", "ㄉㄢˋ", "大「啖」美食"]], "note": "教用補充：幡然悔悟——澈底的悔改、醒悟；諂媚——逢迎巴結；大啖——大吃一頓。"}, {"kind": "table", "head": "二、字形領航員（每題 1 分，共 8 分）", "cols": ["", "字形", "詞語", "", "字形", "詞語"], "rows": [["1", "瀾", "力挽狂「ㄌㄢˊ」", "2", "闌", "夜「ㄌㄢˊ」人靜"], ["3", "恥", "不「ㄔˇ」下問", "4", "齒", "令人不「ㄔˇ」"], ["5", "貽", "「ㄧˊ」笑大方", "6", "飴", "甘之如「ㄧˊ」"], ["7", "駢", "「ㄆㄧㄢˊ」體文", "8", "胼", "「ㄆㄧㄢˊ」手胝足"]], "note": "教用補充：貽笑大方——被識見廣博或精通此道的內行人所譏笑；甘之如飴——比喻樂意承擔艱苦的事情，或處於困境卻能甘心安受；胼手胝足——形容極為辛勞。"}, {"kind": "table", "head": "三、字詞義飛行傘（每題 2 分，共 8 分）", "cols": ["", "文句", "答案", "字詞義"], "rows": [["1", "(1)古之學者必有「師」。<br>(2)巫、醫、樂「師」、百工之人。", "×", "(1)老師<br>(2)有專門技藝的人"], ["2", "(1)聖人之「所以」為聖，愚人之所以為愚。<br>(2)師者，「所以」傳道、受業、解惑也。", "×", "(1)何以、為何（表原因）<br>(2)用來（表目的）"], ["3", "(1)是故無貴無「賤」、無長無少，道之所存，師之所存也。<br>(2)吾少也「賤」，故多能鄙事。（《論語．子罕》）", "○", "(1)地位低<br>(2)地位低（我小時候貧賤，所以能夠做很多粗俗的事。）"], ["4", "(1)「貽」害無窮。<br>(2)作〈師說〉以「貽」之。", "×", "(1)遺留<br>(2)贈送"]], "note": "下列各組「　」內的字詞，意義相同者打「○」，不同者打「×」。"}, {"kind": "table", "head": "四、國學常識解碼（每格 1 分，共 6 分）", "cols": ["韓愈救國誌", "救國計畫", "影響或代價"], "rows": [["社會問題分析", "佛教誤國：出家人不事生產、不服兵役、無納稅義務，造成社會經濟問題。且為外來文化，恐有文化殖民之嫌", ""], ["計畫一", "排斥（1 <b>佛、老</b>）思想，轉而發揚最能代表本土文化且有助於國家強大的儒家學說", "1 反對憲宗迎佛骨，上表勸諫而被貶為（2 <b>潮州</b>）刺史<br>2 蘇軾以「道濟天下之溺」稱讚其宏揚儒道的貢獻"], ["計畫二", "要推動計畫一，就必須要有良好的宣傳媒介。但盛行於六朝的華而不實的（3 <b>駢</b>）文並不適合，故提倡最能載道的先秦、兩漢散文（語言樸實、形式自由）", "1 影響日後唐、宋（4 <b>古文</b>）運動的發展甚大<br>2 蘇軾以「文起八代之衰」稱讚其改革文學的貢獻"], ["計畫三", "找到適合的宣傳媒介了，但由誰來執行呢？能識字作文的只有士大夫，但當代士大夫卻都恥學於師，如此孔孟文化的傳承恐怕中斷。韓愈藉著李蟠問學於他，寫了（5 <b>〈師說〉</b>）一文，以推廣師道", "1 世人群怪聚罵，認為韓愈是好為人師的狂人<br>2 韓愈定義的師者，所傳之道、所受之業、所解之惑，皆為（6 <b>儒</b>）家之道"]], "note": "中唐是唐代由盛轉衰的過渡時期，因此「古文運動」不只是文學運動，它其實也是救國運動。請完成下表（　）中的內容。"}, {"kind": "quiz", "head": "五、綜合理解練習（每題 5 分，共 40 分）", "items": [{"n": 1, "q": "下列各組「　」內的字，何者意義相同？", "ans": "A", "opts": [["A", "士大夫之「族」／郯子之「徒」，其賢不及孔子", "類、輩。"], ["B", "「於」其身也則恥師焉／不拘「於」時，請學於余", "對／置於動詞之後，表示被動。"], ["C", "郯子之徒，其「賢」不及孔子／師不必「賢」於弟子", "名詞，聰明才智／形容詞，高明。"], ["D", "生乎吾前，「其」聞道也，固先乎吾／愚人之所以為愚，「其」皆出於此乎", "代名詞，他／大概，表推測語氣。"]]}, {"n": 2, "q": "文中言「生乎吾前，其聞道也，固先乎吾，吾從而師之；生乎吾後，其聞道也，亦先乎吾，吾從而師之」的原因是什麼？", "ans": "A", "opts": [["A", "道之所存，師之所存", ""], ["B", "愛其子，擇師而教之", ""], ["C", "位卑則足羞，官盛則近諛", ""], ["D", "師者，所以傳道、受業、解惑也", ""]]}, {"n": 3, "q": "下列何者最能說明「句讀之不知，惑之不解，或師焉，或不焉」的行為？", "ans": "B", "opts": [["A", "按部就班", "做事依照一定的層次、條理。"], ["B", "捨本逐末", "不求事物的根本大端而只重視微末小節。"], ["C", "畫蛇添足", "比喻多此一舉而於事無補。"], ["D", "欺師滅祖", "背叛師門，使師門蒙羞。"]]}, {"n": 4, "q": "從〈師說〉一文中可知，韓愈認為「聖益聖，愚益愚」的原因是什麼？", "ans": "D", "opts": [["A", "先天的稟賦不同", ""], ["B", "老師的要求不同", ""], ["C", "交友的態度不同", ""], ["D", "從師問學的態度不同", ""]]}, {"n": 5, "q": "下列關於〈師說〉一文的敘述，何者正確？", "ans": "B", "opts": [["A", "本篇文章的抨擊對象為唐代教師", "唐代教師→士大夫。"], ["B", "極力闡明當時士大夫恥於相師的弊端", ""], ["C", "文中提到師道失傳，連百工之人亦恥於相師", "由「巫、醫、樂師、百工之人，不恥相師」可知為非。"], ["D", "開門見山就揭示擇師的標準是「道之所存，師之所存也」", "老師的責任及強調從師的必要性是「古之學者必有師。師者，所以傳道、受業、解惑也」。"]]}, {"n": 6, "q": "下列各選項中的「師」，何者與「不恥相師」的「師」字詞性相同？", "ans": "D", "opts": [["A", "弟子不必不如「師」", "名詞，老師。"], ["B", "「師」道之不復可知矣", "形容詞，從師問學的。"], ["C", "愛其子，擇「師」而教之", "名詞，老師。"], ["D", "孔子「師」郯子、萇弘、師襄、老聃", "題幹與(D)動詞，學習。"]]}, {"n": 7, "q": "下列〈師說〉一文中所運用的修辭，何者說明正確？", "ans": "D", "opts": [["A", "「是故無貴無賤、無長無少。」—層遞", "類疊。"], ["B", "「弟子不必不如師，師不必賢於弟子。」—誇飾", "回文。"], ["C", "「吾師道也，夫庸知其年之先後生於吾乎？」—懸問", "激問。"], ["D", "「句讀之不知，惑之不解，或師焉，或不焉。」—錯綜", ""]]}, {"n": 8, "q": "下列有關韓愈的敘述，何者正確？", "ans": "B", "opts": [["A", "曾與柳宗元等人共同推動初唐的古文運動", "初唐→中唐。"], ["B", "文學上倡導古文，以先秦、兩漢的散文為圭臬", ""], ["C", "在詩歌的創作上，韓愈則是表現出對偶化的句式", "詩作風格奇崛險怪，為「奇險派」代表。"], ["D", "在思想層面，韓愈認為儒、釋、道三家應該互相結合", "發揚儒家學說，排斥佛、老思想。"]]}]}, {"kind": "read", "head": "貳 進階實力站　一、閱讀測驗（每題 3 分，共 18 分）(一)", "appraise": "說明品德教育的推動宜深化至內在，而非只流於口號。由生活中去感受藝術以培養品味，進而提升品德與品質。", "passage": "　　品德教育可以教化人心為目的，最怕陳義過高<sup>①</sup>變成空談。善有善報雖然是利誘，但是用蜜糖抓到的蒼蠅比較多。人要先有感動才會有行動，蒙古有句話非常的好，「用言語殺死的獵物搬不上馬；用嘴巴殺死的獵物剝不了皮」，不做，什麼都是空的。<br><br>　　但是，推動「有品」並不一定要花很多的錢，品味跟錢並沒有直接的關係。有意境，品味就出來了。曾經有幾個窮秀才賭東道<sup>②</sup>，用十個銅板來做菜，規定每一道菜都得是唐詩的句子。一個秀才花一文錢買豆腐渣，再花一文錢買青菜，剩下的八個銅板買了兩顆雞蛋。他的第一道菜，幾片青菜配上兩個蛋黃，叫做「兩個黃鸝鳴翠柳」；再把蛋白撈出一溜平攤，這叫「一行白鷺上青天」；把豆腐渣堆在青菜中擺在方框裡，這叫「窗含西嶺千秋雪」；最後把兩顆雞蛋殼弄一碗清水漂起來，這叫「門泊東吳萬里船」。這菜的意境令人心曠神怡，只花了十文錢而已。<br><br>　　人民有品味，品德、品質自然帶出，從藝術教育著手是對的，千萬不可再讓各校以申請專案的方式來推行，重蹈早期推動閱讀時只重量而不重質的覆轍。<div class='aq-src'>註：①陳義過高：所要說的道理過於高深。②東道：東行道上負責接待的主人。</div><div class='aq-src'>（節錄自洪蘭〈觸動人心，就會有品〉）</div>", "items": [{"n": 1, "q": "下列敘述，何者最貼近文中「用蜜糖抓到的蒼蠅比較多」的意義？", "ans": "C", "opts": [["A", "以毒攻毒才能快速致勝", ""], ["B", "以逸待勞總是徒勞無功", ""], ["C", "觸動人心才能避免空談", ""], ["D", "甜言蜜語總是包藏禍心", ""]]}, {"n": 2, "q": "文中所舉「窮秀才做菜」的故事，有何意涵？", "ans": "B", "opts": [["A", "民以食為天，簡單食材也能作詩", ""], ["B", "掌握意境，擁有品味不須花大錢", ""], ["C", "培養品味可以讓人擺脫貧窮生活", ""], ["D", "先有好的家境，才能有好的品德", ""]]}, {"n": 3, "q": "關於本文的寫作方式，下列分析何者<u>錯誤</u>？", "ans": "A", "opts": [["A", "強調人民必須先有品德、品質，才有可能具備品味", "人民有品味，品德、品質自然帶出。"], ["B", "作者最後肯定藝術教育的價值，但強調應更重質而非量", ""], ["C", "作者用「意境」對比「金錢」，論證品味跟錢並沒有直接的關係", ""], ["D", "本文環繞「品德教育」的論題開展，目的在強調品德教育應該落實在生活中", ""]]}]}, {"kind": "read", "head": "一、閱讀測驗 (二)", "appraise": "本文由兩個在地的成功創業家為個案，分別是：以「委託種植」創建小農新產銷模式的賴青松，與透過「創新開放的建築設計」傳達社會關懷的建築師黃聲遠，藉二人不同方式與觀點探討師徒關係的傳承與內涵。", "passage": "　　所謂的師徒關係，通常包含正式和非正式的，正式的關係包括學校中的老師和學生、指導教授和指導學生、組織中的老闆和員工的關係。<br><br>　　非正式發展通常是自然形成的，或者兩人因緣際會而成師徒關係，也可能是某一方主動邀請另一方而形成師徒關係。<br><br>　　書中兩個個案―賴青松和黃聲遠，都擁有良師益友的同儕師徒關係與向下學習的反向師徒關係，並且都將自己領受到的師徒關係特性，同樣的傳承給徒弟們。<br><br>　　賴青松和黃聲遠對於「傳承」概念也有不同看法：賴青松認為傳承這件事情是一種「緣分」，只能等待卻不能強求，因此當徒弟進入農村開始實習的傳承緣分出現時，他是欣喜的；相較之下，黃聲遠則因為對自由的追求，以及對未知的開放，更重要的是他相信要讓每個人的潛力被發揮，而不是照著老師的指導前進，直接表達了他對「傳承」概念的質疑。事實上，傳承除了知識與技能的傳遞，更重要的是師者為徒弟帶來的心靈啟發，以及師徒關係所衍生的職涯發展、心理社會及角色楷模的功能，師徒關係可以藉由各種不同形式傳承下去。然而，無論是賴青松或黃聲遠，他們都會在不同的人生階段與機會，輪流或者同時扮演徒弟和師父的角色，學習和傳承重要的知識、經驗與智慧。<br><br>　　由賴青松和黃聲遠指導徒弟的過程中，可看出透過「做中學」方式，能夠達到有效傳承的成果，因此未來培育社會創業家之課程，可設計以做中學為主體的課程，注入更多「實作」元素。<div class='aq-src'>（節錄自朱思年等〈師徒關係與社會創新的在地實踐〉）</div>", "items": [{"n": 4, "q": "師徒關係通常包含正式和非正式的，下列何者屬於「非正式」的師徒關係？", "ans": "C", "opts": [["A", "董事長對業務人員分享行銷經驗", "組織中的老闆和員工。"], ["B", "理化老師帶領學生準備科學展覽", "老師和學生。"], ["C", "比爾蓋茲向巴菲特請教投資心得", "正式的師徒關係為老師和學生、指導教授和指導學生、組織中的老闆和員工的關係，而「非正式」的師徒關係指某一方主動邀請另一方而形成師徒關係。"], ["D", "教授親自指導研究生寫學術論文", "指導教授和指導學生。"]]}, {"n": 5, "q": "依據文中闡述，未來培育社會創業家應該多多設計怎樣的課程，以達到有效傳承的成果？", "ans": "B", "opts": [["A", "強調師徒制度", ""], ["B", "注入實作元素", "由兩人「指導徒弟的過程中，可看出透過『做中學』方式，能夠達到有效傳承的成果」可知。"], ["C", "加強理論鑽研", ""], ["D", "精深外語能力", ""]]}, {"n": 6, "q": "下列何者最符合黃聲遠對於「傳承」的看法？<img src='img/師說/b55303541b68e556.png' style='max-width:100%;display:block;margin:10px auto;width:640px' alt=''>", "ans": "B", "opts": [["A", "（見上圖）", ""], ["B", "（見上圖）", "賴青松認為傳承這件事情是一種「緣分」，只能等待卻不能強求。而黃聲遠對「傳承」的看法則為：對自由的追求、對未知的開放，讓每個人的潛力被發揮，而不是照著老師的指導前進。事實上，傳承除了知識與技能的傳遞，更包含心靈啟發、職涯發展、心理社會及角色楷模的功能，並藉由各種不同形式傳承下去。兩人都會輪流或者同時扮演徒弟（學習者）和師父（教學者）的角色，學習和傳承重要的知識、經驗與智慧，並透過「做中學」方式，達到有效傳承的成果。故選項(B)最符合其看法。"], ["C", "（見上圖）", ""], ["D", "（見上圖）", ""]]}]}, {"kind": "table", "head": "二、趣味文學體驗（每題 4 分，共 12 分）", "cols": ["", "文句（A～D 為標記）", "還原語句順序"], "rows": [["1", "句讀之不知(A)，惑之不解(B)，或師焉(C)，或不焉(D)。", "A C B D"], ["2", "算你運氣好，回來就趕上吃(A)酒(B)喝(C)肉(D)。（哲夫〈長牙齒的土地〉）", "A D C B"], ["3", "山猿(A)谷鳥(B)，哀鳴(C)啾啾(D)。（白居易〈與元微之書〉）", "A C B D<br>（山中的猿猴哀鳴，谷裡的鳥兒啾啾的叫著。）"]], "note": "文章中，為避免語言的單調呆板，將語句故意變換，變為不同的詞面、參差錯落的語句結構或不同的語氣，使語言的表達活潑多樣又引人注意，這種修辭格稱為「錯綜」。下列文句都使用了錯綜修辭法中「交蹉語次」的手法，請依據文意還原為一般的語句順序。<img src='img/師說/2c9141a1f42e46f4.png' style='max-width:100%;display:block;margin:10px auto;width:560px' alt=''>"}, {"kind": "table", "head": "參 挑戰加分站（不計分）", "cols": ["", "文句", "答案", "語譯／解析"], "rows": [["1", "譬如為山，未成一簣，止，吾止也！（《論語．子罕》）", "○", "為學好比堆土成山，還沒有完成，只差一筐土，就停止下來，是我自己要停止的呀！"], ["2", "此人親驚吾馬，吾馬賴柔和，令他馬，固不敗傷我乎？（司馬遷〈張釋之執法〉）", "○", "這個人驚動我的車馬，幸虧我的馬溫馴，假使是其他的馬，豈不就摔傷我了嗎？"], ["3", "入門見嫉，蛾眉不肯讓人；掩袖工讒，狐媚偏能惑主。（駱賓王〈為徐敬業討武曌檄〉）", "×", "一進宮門，就顯露嫉妒的天性，仗著豔麗的姿色，不肯退讓；掩袖佯羞，善於進讒言，極盡媚態，偏偏就能迷惑君主。<br>解析：符合駢文「對仗工整」、「以四字、六字為基本句」的特色。"], ["4", "馮唐易老，李廣難封。屈賈誼於長沙，非無聖主；竄梁鴻於海曲，豈乏明時？（王勃〈滕王閣序〉）", "×", "像馮唐般到老不得志，像李廣般終久難封侯。委屈了賈誼遠去長沙當太傅，並不是當時沒有聖明的君主；讓梁鴻逃匿到東海邊，難道是時代不清明？<br>解析：符合駢文「對仗工整」、「以四字、六字為基本句」、「用典繁多」的特色。"], ["5", "人有亡鈇者，意其鄰之子。視其行步，竊鈇也；顏色，竊鈇也；言語，竊鈇也；動作、態度，無為而不竊鈇也。（《列子．說符》）", "○", "有一個人弄丟了斧頭，他覺得是鄰居小孩偷走的。觀察那小孩的步伐，活像偷了斧頭的樣子；看他的表情，就是偷了斧頭似的；他講的話，好像偷斧頭的人說的話；他的動作、態度，所有的言行舉止沒有不像是偷了斧頭的人。"]], "note": "金榜題名大會考：如果韓愈擔任科舉主考官，那麼依據評分標準，判斷下列五組文句的「形式」（不論內容），會被韓愈錄取者請畫「○」，會被淘汰者請畫「×」。<br>評分標準——錄取：形式自由，不重音韻，不重對仗，亦不重辭藻。淘汰：以駢文形式為尤，凡符合以下兩點以上即淘汰：1.對仗工整　2.以四字、六字為基本句　3.用典繁多　4.辭藻華麗。<img src='img/師說/fa7734f1f9425751.png' style='max-width:100%;display:block;margin:10px auto;width:600px' alt=''>"}]};
  var V69_SHISHUO_AQ = [{"n": 1, "ans": "B", "stem": "下列各組「 」中的注音寫成國字後，何者字形相同", "opts": [["A", "阿「ㄩˊ 」逢迎╱膏「ㄩˊ 」之地"], ["B", "「ㄧˊ」笑大方╱「ㄧˊ」人口實"], ["C", "大肆「ㄆㄥ」擊╱「ㄆㄥ」然心動"], ["D", "語笑喧「ㄏㄨㄚˊ」╱含英咀「ㄏㄨㄚˊ」"]], "exp": "(A)諛。阿諛逢迎：曲意奉承，討好他人╱腴。膏腴之地：肥沃的地方。(B)貽。貽笑大方：被識見廣博或精通此道的內行人所譏笑╱貽人口實：指因行事、說話有差誤而給人留下話柄。(C)抨。大肆抨擊：用語言或文字猛烈攻擊╱怦。怦然心動：對某事產生了興趣。(D)譁。語笑喧譁：言語喧笑的聲音大而雜亂╱華。含英咀華：品味文章的要旨，咀嚼辭藻的華美。", "trans": "", "per": {"A": "諛。阿諛逢迎：曲意奉承，討好他人╱腴。膏腴之地：肥沃的地方。", "B": "貽。貽笑大方：被識見廣博或精通此道的內行人所譏笑╱貽人口實：指因行事、說話有差誤而給人留下話柄。", "C": "抨。大肆抨擊：用語言或文字猛烈攻擊╱怦。怦然心動：對某事產生了興趣。", "D": "譁。語笑喧譁：言語喧笑的聲音大而雜亂╱華。含英咀華：品味文章的要旨，咀嚼辭藻的華美。"}, "psg": "", "need_img": false}, {"n": 2, "ans": "B", "stem": "志偉抄寫了一段韓愈生平記事，請找出用字完全正確的文句：", "opts": [["A", "韓愈思想承繼儒家道統，文學創作反對華糜文風，為文氣勢雄奇、議論透轍，頗具盛名"], ["B", "在他所處的時代，一些士族子弟多憑門第或祖先餘蔭躋身朝廷，不經由科舉為官"], ["C", "這類士族子弟以門閥制度為後遁，輕易走上仕途之路，因此他們鄙視並怦擊從師學習的人"], ["D", "韓愈對此憂心沖沖，因為師道的淪喪，不僅象徵文化傳承的崩裂，更意味著社會綸常的解體"]], "exp": "(A)華「靡」文風、透「澈」。(C)後「盾」、「抨」擊。(D)憂心「忡忡」、「倫」常。", "trans": "", "per": {"A": "華「靡」文風、透「澈」。", "C": "後「盾」、「抨」擊。", "D": "憂心「忡忡」、「倫」常。"}, "psg": "", "need_img": false}, {"n": 3, "ans": "C", "stem": "下列各組「 」內的字，何者意義相同", "opts": [["A", "愚人之所以為愚，其皆出「於」此乎╱不拘「於」時，請學於余"], ["B", "小學而大「遺」，吾未見其明也╱攀條折其榮，將以「遺」所思"], ["C", "吾「師」道也，夫庸知其年之先後生於吾乎╱不恥相「師」"], ["D", "今其智「乃」反不能及／魏武「乃」曰：吾已得"]], "exp": "(A)從、由，表示所從╱置於動詞之後，表示被動。(B)遺漏╱贈送。(C)學習。(D)竟然／才。", "trans": "(A)愚人為什麼會成為愚人，原因大概就出自於此吧╱他不受當下世俗以互相學習為恥的風氣所拘束，來向我請教、學習。(B)學到小知識卻遺漏了大學問，我真看不出這樣的父母有何明智╱我攀著樹枝，折下那盛開的花朵，將用來贈送給所思念的人。〈庭中有奇樹〉。(C)我學習的是道理啊，何必知道他們出生得比我早還是比我晚呢╱不以互相學習為恥。(D)如今這些君子的才智竟然反而比不上那些人╱魏武帝才說：「我已經想到了。」劉義慶《世說新語．絕妙好辭》。", "per": {"A": "從、由，表示所從╱置於動詞之後，表示被動。", "B": "遺漏╱贈送。", "C": "學習。", "D": "竟然／才。"}, "psg": "", "need_img": false}, {"n": 4, "ans": "D", "stem": "下列文句「 」內的詞語，何者運用恰當", "opts": [["A", "你應該要排在這位小姐後面，買東西要留意「聞道有先後」的原則，不能隨便插隊"], ["B", "王經理最討厭同事之間有「三人行必有我師」的行為，因為他們經常抱怨公司或同事"], ["C", "老師告訴我們做人要學著「小學大遺」，凡事不要與人斤斤計較"], ["D", "他雖然是奧運金牌拳擊選手，但「術業有專攻」，因此對於體操運動也了解不深"]], "exp": "(A)聞道有先後：學習道理之先後。宜改為「先來後到」。(B)三人行必有我師：三人同行，一定有我可以效法或引以為戒的人。宜改為「成群結黨」（眾多人物聚集在一起）。(C)小學大遺：學習小知識，卻遺漏大學問。宜改為「寬宏大量」（度量寬大）。", "trans": "", "per": {"A": "聞道有先後：學習道理之先後。宜改為「先來後到」。", "B": "三人行必有我師：三人同行，一定有我可以效法或引以為戒的人。宜改為「成群結黨」（眾多人物聚集在一起）。", "C": "小學大遺：學習小知識，卻遺漏大學問。宜改為「寬宏大量」（度量寬大）。"}, "psg": "", "need_img": false}, {"n": 5, "ans": "D", "stem": "下列短文中的（ㄔˇ），依序應填入的字是：提到忘恩負義的漢高祖劉邦，即使建立漢代功業，依然難逃無（ㄔˇ）之徒的評論。他不顧韓信長年征戰天下，放任呂后與蕭何以謀反之名將韓信誘入長樂宮誅殺，行徑令人（ㄔˇ ）冷。想當初劉邦以不（ㄔˇ）下問的態度贏得眾人的推崇一起建立江山，統一天下後卻誅殺六個異姓諸侯王，這種得魚忘筌的行為，為一般人所不（ㄔˇ）。", "opts": [["A", "齒／恥／齒／恥"], ["B", "恥／齒／恥／恥"], ["C", "恥／恥／齒／恥"], ["D", "恥／齒／恥／齒"]], "exp": "得魚忘筌：比喻人在成功後就忘本背恩。(D)無恥：缺乏羞恥心／令人齒冷：讓人恥笑，多指因齷齪的人品或不道德的行為而讓人鄙視。齒冷，譏笑，開口笑久了，則牙齒變冷／不恥下問：不以向身分較低微、或是學問較自己淺陋的人求教為羞恥／不齒：羞與為伍。齒，並列。", "trans": "", "per": {"D": "無恥：缺乏羞恥心／令人齒冷：讓人恥笑，多指因齷齪的人品或不道德的行為而讓人鄙視。齒冷，譏笑，開口笑久了，則牙齒變冷／不恥下問：不以向身分較低微、或是學問較自己淺陋的人求教為羞恥／不齒：羞與為伍。齒，並列。"}, "psg": "", "need_img": false}, {"n": 6, "ans": "C", "stem": "在文言文句法中，常看到「所以」二字，下列有三種用法，請判斷(甲)(乙)中的「所以」，最適當的歸類是：", "opts": [["A", "(甲)①　(乙)②"], ["B", "(甲)②　(乙)③"], ["C", "(甲)③　(乙)①"], ["D", "(甲)①　(乙)③"]], "exp": "(甲)表達聖人能成為聖人的原因；句中「所以」表示「原因」。 (乙)表達老師的功用在於傳道、受業、解惑；句中「所以」表示「用來」。", "trans": "(甲)聖人為什麼會成為聖人，愚人為什麼會成為愚人，原因大概就出自於此吧？(乙)老師，是用來傳授道理、講授學業、解答疑惑的人。①所以威懾和恩惠，是掌控天下強弱態勢的方法。蘇洵〈審勢〉。", "per": {"C": "(甲)表達聖人能成為聖人的原因；句中「所以」表示「原因」。 (乙)表達老師的功用在於傳道、受業、解惑；句中「所以」表示「用來」。"}, "psg": "<b>【三種用法】</b><br>① 表作用、目的關係，可釋為「用來」。如：故威與惠者，所以裁節天下強弱之勢也。<br>② 常與「因為」連用，釋為「因此」、「因而」。如：因為外面下大雨，所以無法出門。<br>③ 表原因，可釋為「何以」、「為何」。如：事情所以至此，全因她努力不懈的結果。<br><br><b>【判斷】</b><br>(甲) 聖人之「所以」為聖，愚人之「所以」為愚，其皆出於此乎？<br>(乙) 師者，「所以」傳道、受業、解惑也。", "need_img": false}, {"n": 7, "ans": "B", "stem": "下列是宛芩的修辭筆記，何者整理正確", "opts": [["A", "「弟子不必不如師，師不必賢於弟子。」─錯綜（故意變化語句順序）"], ["B", "「小學而大遺」─映襯（相反概念並列）"], ["C", "「句讀之不知，惑之不解，或師焉，或不焉。」─回文（上下兩句，詞彙大多相同，而詞序恰好相反）"], ["D", "「人非生而知之者，孰能無惑？」─懸問（作者心中確有疑問）"]], "exp": "(A)回文。(C)錯綜（交蹉語次），原意為「句讀之不知，或師焉；惑之不解，或不焉」。(D)激問。", "trans": "(A)學生不一定不如老師，老師也不一定比學生高明。(B)學到小知識卻遺漏了大學問。(C)不知如何斷句文章時，有些人會向老師請教學習；有疑惑不了解時，有些人卻不向老師請教學習。(D)人不是生下來就懂得道理的，誰能沒有疑惑？", "per": {"A": "回文。", "C": "錯綜（交蹉語次），原意為「句讀之不知，或師焉；惑之不解，或不焉」。", "D": "激問。"}, "psg": "", "need_img": false}, {"n": 8, "ans": "B", "stem": "〈師說〉中韓愈提到「道之所存，師之所存」的含意，與下列哪一句話相互呼應", "opts": [["A", "聖益聖，愚益愚"], ["B", "聖人無常師"], ["C", "位卑則足羞，官盛則近諛"], ["D", "小學而大遺"]], "exp": "(B)韓愈強調學習的態度，只要是道理存在的地方就是老師存在的地方。", "trans": "「道」所存在的地方，也就是老師存在的地方。(A)聖人就更加聖明，愚人也更加愚笨。(B)聖人沒有固定的老師。(C)向地位低的人學習就感到非常羞恥，向官職高的人學習就覺得近於諂媚。(D)學到小知識卻遺漏了大學問。", "per": {"B": "韓愈強調學習的態度，只要是道理存在的地方就是老師存在的地方。"}, "psg": "", "need_img": false}, {"n": 9, "ans": "D", "stem": "「自己 DIY 費時費力，染髮的事不如就交給專業的髮型師。」下列文句與上述文句意涵最相近的是", "opts": [["A", "學而時習之，不亦說乎"], ["B", "敏而好學，不恥下問"], ["C", "古之學者必有師"], ["D", "聞道有先後，術業有專攻"]], "exp": "染髮技術包含髮質粗細、髮色的調配及染膏比例等專業問題，意涵與(D)相近。", "trans": "(A)學習之後又時時加以溫習，不是很喜悅嗎？《論語．學而》。(B)他天資聰敏而好學不倦，不以下問為恥。《論語．公冶長》。(C)古代學習的人必定有老師。(D)因為每人學習道理有先有後，技能和學業上各有專門的研究。", "per": {"D": "相近。"}, "psg": "", "need_img": false}, {"n": 10, "ans": "C", "stem": "〈師說〉中提到「三人行，則必有我師」，這段話與下列哪些文句意旨相近？(甲)學無常師(乙)學如逆水行舟(丙)見賢思齊(丁)擇善而從(戊)好為人師", "opts": [["A", "(甲)(乙)(丙)"], ["B", "(甲)(丁)(戊)"], ["C", "(甲)(丙)(丁)"], ["D", "(乙)(丙)(戊)"]], "exp": "(甲)指善於學習的人，知道該向不同專長的人請教不同的學問。(乙)比喻為學的艱難。用以告誡人學習應抱著嚴謹、持恆的態度，不可輕忽怠慢。(丙)看到賢能的人，便想效法他。(丁)指選擇好的去跟從、採用。(戊)喜歡做別人的老師。指人不謙虛，喜歡教導別人。", "trans": "三人同行，一定有我可以效法或引以為戒的人。", "per": {"C": "(甲)指善於學習的人，知道該向不同專長的人請教不同的學問。(乙)比喻為學的艱難。用以告誡人學習應抱著嚴謹、持恆的態度，不可輕忽怠慢。(丙)看到賢能的人，便想效法他。(丁)指選擇好的去跟從、採用。(戊)喜歡做別人的老師。指人不謙虛，喜歡教導別人。"}, "psg": "", "need_img": false}, {"n": 11, "ans": "A", "stem": "下列關於〈師說〉文句的說明，何者正確", "opts": [["A", "「巫、醫、樂師、百工之人，不恥相師。」說明從事各種技藝之人不以相互學習感到羞恥"], ["B", "「愛其子，擇師而教之，於其身也則恥師焉。」說明士大夫不肯為其子選擇好老師"], ["C", "「孔子師郯子、萇弘、師襄、老聃。」說明孔子一再更換老師"], ["D", "「李氏子蟠……不拘於時，請學於余。」說明韓愈自己渴望為師的心情"]], "exp": "(B)說明士大夫自身不肯求教於師。(C)說明「學無常師、以能者為師」的觀點。(D)說明李蟠不拘於當時「恥學於師」的風氣，向韓愈請學。", "trans": "(A)巫師、醫生、樂師和從事各種技藝的人，不以互相學習為恥。(B)士大夫愛自己的孩子，會選擇老師來教育他們，但對於他自己而言，卻以從師問學為恥。(C)孔子曾向郯子、萇弘、師襄、老聃等人請教、學習。(D)李蟠先生……他不受當下世俗以互相學習為恥的風氣所拘束，來向我請教、學習。", "per": {"B": "說明士大夫自身不肯求教於師。", "C": "說明「學無常師、以能者為師」的觀點。", "D": "說明李蟠不拘於當時「恥學於師」的風氣，向韓愈請學。"}, "psg": "", "need_img": false}, {"n": 12, "ans": "C", "stem": "〈師說〉一文中韓愈批評當時「師道不傳」的現象，強調從師學習的重要性，並探討士大夫恥於從師的風氣與學習態度。下列敘述，何者與文意不符", "opts": [["A", "「古之學者必有師」是因「人非生而知之者，孰能無惑」"], ["B", "「吾師道也，夫庸知其年之先後生於吾乎」是因「道之所存，師之所存也」"], ["C", "「師道之不傳也久矣」是因「六藝經傳，皆通習之」"], ["D", "「士大夫之族，曰師、曰弟子云者，則群聚而笑之」是因笑者認為「彼與彼年相若也，道相似也」"]], "exp": "(C)是因「今之眾人，其下聖人也亦遠矣，而恥學於師」。", "trans": "(A)古代學習的人必定有老師╱人不是生下來就懂得道理的，誰能沒有疑惑？(B)我學習的是道理啊，何必知道他們出生得比我早還是比我晚呢╱「道」所存在的地方，也就是老師存在的地方。(C)從師問學的傳統已經失傳很久了╱六經的經文、傳文都已通曉熟習。(D)士大夫一類的人，一說到誰是誰的「老師」或「學生」，大家就會聚在一起譏笑他們╱那些被稱作老師的和被稱作學生的，年齡相近，學問也差不多啊！", "per": {"C": "是因「今之眾人，其下聖人也亦遠矣，而恥學於師」。"}, "psg": "", "need_img": false}, {"n": 13, "ans": "D", "stem": "〈師說〉透過大量對比使「恥學於師」的說理更加鮮明有力，下表分類最適當的是：", "opts": [["A", "古今對比"], ["B", "士大夫對比"], ["C", "師生對比"], ["D", "當代對比"]], "exp": "(A)古之聖人從師問學，今之眾人恥學於師。(B)士大夫於其身也則恥師。(C)聞道有先後，術業有專攻，「弟子不必不如師，師不必賢於弟子」都是正確的態度。", "trans": "(C)學生不一定不如老師╱老師也不一定比學生高明。(D)巫師、醫生、樂師和從事各種技藝的人，不以互相學習為恥╱士大夫一類的人，一說到誰是誰的「老師」或「學生」，大家就會聚在一起譏笑他們。", "per": {"A": "古之聖人從師問學，今之眾人恥學於師。", "B": "士大夫於其身也則恥師。", "C": "聞道有先後，術業有專攻，「弟子不必不如師，師不必賢於弟子」都是正確的態度。"}, "psg": "<table class='jy-table'><tr><th class='jy-th'>選項</th><td><b>對比方式</b></td><td><b>正確的態度</b></td><td><b>錯誤的態度</b></td></tr><tr><th class='jy-th'>(A)</th><td>古今對比</td><td>古之聖人恥學於師</td><td>今之眾人從師問學</td></tr><tr><th class='jy-th'>(B)</th><td>士大夫對比</td><td>士大夫愛其子，擇師而教之</td><td>於其身也則不恥相師</td></tr><tr><th class='jy-th'>(C)</th><td>師生對比</td><td>弟子不必不如師</td><td>師不必賢於弟子</td></tr><tr><th class='jy-th'>(D)</th><td>當代對比</td><td>巫、醫、樂師、百工之人，不恥相師</td><td>士大夫之族，曰師、曰弟子云者，則群聚而笑之</td></tr></table>", "need_img": false}, {"n": 14, "ans": "D", "stem": "「句讀之不知，惑之不解，或師焉，或不焉，小學而大遺，吾未見其明也。」上述文句的詮釋分析，下列說明何者最適當", "opts": [["A", "前四句說明不明白句讀時不會向老師請教學習，有疑惑不了解時卻懂得請教老師"], ["B", "前四句的文意語序是：「句讀之不知，或不焉，惑之不解，或師焉」"], ["C", "「小學而大遺」是指求學階段應該先從國小開始奠定基礎，否則追求高深的學問會有所遺漏"], ["D", "此段話從反面論述，批評當時士大夫恥學於師的不良風氣"]], "exp": "(A)此四句應是指對文章斷句不了解會從師問學，但對「道」、「業」有疑惑，卻不懂得從師問學。(B)文意語序應是「句讀之不知，或師焉；惑之不解，或不焉」。(C)學到小知識，卻遺漏「道」、「業」上的大學問。", "trans": "不知如何斷句文章時，有些人會向老師請教學習；有疑惑不了解時，有些人卻不向老師請教學習，學到小知識卻遺漏了大學問，我真看不出這樣的父母有何明智。", "per": {"A": "此四句應是指對文章斷句不了解會從師問學，但對「道」、「業」有疑惑，卻不懂得從師問學。", "B": "文意語序應是「句讀之不知，或師焉；惑之不解，或不焉」。", "C": "學到小知識，卻遺漏「道」、「業」上的大學問。"}, "psg": "", "need_img": false}, {"n": 15, "ans": "C", "stem": "韓愈在〈師說〉文中強調「弟子不必不如師，師不必賢於弟子」，下列事件何者最貼近韓愈的想法", "opts": [["A", "國文老師教導學生「韓愈的生平知識」"], ["B", "棒球國手陳金鋒義務培訓小學生揮棒的技巧"], ["C", "數學老師向曾參加奧林匹亞競賽的學生請教解題思路"], ["D", "服裝科學生以服裝設計師吳季剛為師"]], "exp": "學生不一定不如老師，老師也不一定比學生高明。是故，(A)國文老師教導學生「韓愈的生平知識」，其國學知識本應優於學生。(B)陳金鋒的棒球技能本遠勝過小學生。(C)顯示在同一學科中，學生於某一層面可能勝於老師，最能體現「弟子不必不如師，師不必賢於弟子」的精神。(D)論服裝設計專業，吳季剛本來就足以成為服裝科學生的老師。", "trans": "學生不一定不如老師，老師也不一定比學生高明。", "per": {"A": "國文老師教導學生「韓愈的生平知識」，其國學知識本應優於學生。", "B": "陳金鋒的棒球技能本遠勝過小學生。", "C": "顯示在同一學科中，學生於某一層面可能勝於老師，最能體現「弟子不必不如師，師不必賢於弟子」的精神。", "D": "論服裝設計專業，吳季剛本來就足以成為服裝科學生的老師。"}, "psg": "", "need_img": false}, {"n": 16, "ans": "C", "stem": "（蘇軾〈潮州韓文公廟碑〉）", "opts": [["A", "東漢以來，儒學蓬勃發展，諸子百家並起"], ["B", "布衣之士為韓文公出謀策劃，終平定叛亂"], ["C", "韓文公力挽狂瀾，使天下文風重回正道"], ["D", "韓文公正氣凜然與天地共存，忠勇護國，率兵戰勝三軍將領"]], "exp": "(A)由「自東漢以來，道喪文弊，異端並起」可知儒道淪喪、文風敗壞。(B)「韓文公起布衣」一句意指韓愈是平民出身，出謀策劃重振儒學。(C)由「獨韓文公起布衣，談笑而麾之，天下靡然從公，復歸於正」可知。(D)「忠犯人主之怒」指韓愈反對憲宗迎佛骨上表勸諫，被貶為潮州刺史。「勇奪三軍之帥」指鎮洲兵變，韓愈奉命說服叛軍歸順朝廷。", "trans": "自從東漢以來，儒道淪喪、文風敗壞，佛、老等異端邪說紛紛興起。……只有韓文公從平民之中崛起，在談笑間舉臂一揮，天下人便聞風而動，紛紛追隨韓文公，重新回到正道，至今已經有三百年了。他以古文振起八代以來華靡的文風，以儒道濟助沉溺於佛、老思想的天下；他的忠誠惱怒了皇帝，他的勇氣折服三軍的主帥：這難道不是與天地萬物共存，關係到國家盛衰，浩大至正而獨立存在的正氣嗎？", "per": {"A": "由「自東漢以來，道喪文弊，異端並起」可知儒道淪喪、文風敗壞。", "B": "「韓文公起布衣」一句意指韓愈是平民出身，出謀策劃重振儒學。", "C": "由「獨韓文公起布衣，談笑而麾之，天下靡然從公，復歸於正」可知。", "D": "「忠犯人主之怒」指韓愈反對憲宗迎佛骨上表勸諫，被貶為潮州刺史。「勇奪三軍之帥」指鎮洲兵變，韓愈奉命說服叛軍歸順朝廷。"}, "psg": "小陳在閱讀完下文後，為文章內容寫下紀錄，請選出正確的選項：自東漢以來，道喪文弊，異端並起。……獨韓文公起布衣，談笑而麾之，天下靡然從公，復歸於正，蓋三百年於此矣。文起八代之衰，而道濟天下之溺；忠犯人主之怒，而勇奪三軍之帥：此豈非參天地，關盛衰，浩然而獨存者乎？", "need_img": false}, {"n": 17, "ans": "C", "stem": "（顏擇雅〈韓愈「師說」的語病〉）", "opts": [["A", "體驗學習雖優於閱讀記誦，卻不適合現代社會"], ["B", "閱讀記誦是體驗學習的基礎，有先備知識才不會走冤枉路"], ["C", "閱讀記誦的教育方式不符合生活需求，所以無法引發學生的學習動機"], ["D", "勞動生產者應採取體驗式學習，知識工作者較適合閱讀記誦式學習"]], "exp": "(A)文中沒有提到哪一種學習方式更適合現代社會。(B)文中沒有提到閱讀記誦是體驗學習的基礎。(C)學校中偏向閱讀記誦的學習方式，以學會「必考的題目」為目標，而不是像農夫一樣因為有實際需求而學習，所以無法引起學生的學習動機。(D)文中沒有提到兩者的適用對象為何。", "trans": "", "per": {"A": "文中沒有提到哪一種學習方式更適合現代社會。", "B": "文中沒有提到閱讀記誦是體驗學習的基礎。", "C": "學校中偏向閱讀記誦的學習方式，以學會「必考的題目」為目標，而不是像農夫一樣因為有實際需求而學習，所以無法引起學生的學習動機。", "D": "文中沒有提到兩者的適用對象為何。"}, "psg": "閱讀下文，並判斷選項中何者最貼近作者想表達的意旨？閱讀記誦與體驗學習的一大差別，正是「惑」的生成方式。稻草染病，對農夫來說是實際需要解決的問題，他當然要有惑。在學校，「惑」卻只是老師強調必考的題目而已。", "need_img": false}, {"n": 18, "ans": "D", "stem": "我們往往可從古典詩文中的關鍵字詞來判別和某些歷史人物或文學家有關，下列詩文何者與韓愈無關", "opts": [["A", "佛骨謫來，嶺海因而生色。鱷魚徙去，江河自此澄清"], ["B", "匹夫而為百世師，一言而為天下法，是皆有以參天地之化，關盛衰之運"], ["C", "一封朝奏九重天，夕貶潮陽路八千。本為聖朝除弊事，肯將衰朽惜殘年"], ["D", "五斗徒勞謾折腰，三年兩鬢為誰焦。今朝官滿重歸去，還挈來時舊酒瓢"]], "exp": "(A)「佛骨謫來，嶺海因而生色」寫韓愈被貶之事。韓愈上表反對迎佛骨觸怒憲宗，被貶為潮州刺史。「鱷魚徙去，江湖自此澄清」寫韓愈發現潮州有很多鱷魚危害人類，為了趕走鱷魚，韓愈寫了一篇〈祭鱷魚文〉。(B)為蘇軾讚譽韓愈。(C)「一封朝奏九重天，夕貶潮陽路八千」二句是說韓愈被貶之事。潮陽是唐代潮州州轄縣，屬於潮州行政區域。「本為聖朝除弊事，肯將衰朽惜殘年」寫韓愈上表反對迎佛骨之事，有義無反顧的勇氣。(D)由「五斗」、「歸去」、「酒瓢」表達陶淵明不願為五斗米折腰，解官歸隱的選擇。", "trans": "(A)因為上表反對迎佛骨而被貶謫，卻讓潮州因此蓬勃發展。因為寫了祭文讓鱷魚離去，潮州的水域自此平安無事，再也沒有傷亡傳出。潮州韓文公祠聯。(B)韓愈只是一介文人卻成為歷代師法的對象，所說的言論成為天下的法則，這是因為他的品格可以與天地化育萬物相提並論，也關係到國家氣運的盛衰。蘇軾〈潮州韓文公廟碑〉。(C)早上把一封奏章呈上九重金殿，到了傍晚竟被貶至八千里外的潮州。想為聖明的國君革除有害的弊政，怎敢以自己衰朽之身顧惜來日無多的殘生。韓愈〈左遷至藍關示姪孫湘〉。(D)為了微薄的俸祿，隨意屈辱自己去奉承他人，這三年來究竟是為誰而兩鬢操煩。現在已經受夠官場生活了，就再度解印歸去，手上只拿著初為官時，常用的那只老舊酒瓢。廖凝〈彭澤解印〉。", "per": {"A": "「佛骨謫來，嶺海因而生色」寫韓愈被貶之事。韓愈上表反對迎佛骨觸怒憲宗，被貶為潮州刺史。「鱷魚徙去，江湖自此澄清」寫韓愈發現潮州有很多鱷魚危害人類，為了趕走鱷魚，韓愈寫了一篇〈祭鱷魚文〉。", "B": "為蘇軾讚譽韓愈。", "C": "「一封朝奏九重天，夕貶潮陽路八千」二句是說韓愈被貶之事。潮陽是唐代潮州州轄縣，屬於潮州行政區域。「本為聖朝除弊事，肯將衰朽惜殘年」寫韓愈上表反對迎佛骨之事，有義無反顧的勇氣。", "D": "由「五斗」、「歸去」、「酒瓢」表達陶淵明不願為五斗米折腰，解官歸隱的選擇。"}, "psg": "", "need_img": false}, {"n": 19, "ans": "D", "stem": "有人問李蟠：「尊師韓愈是否仍在本校執教？」下列回答何者最適當", "opts": [["A", "是的，令師今年六十多歲，仍舊堅持在杏林服務"], ["B", "沒有，愚師已於去年榮調翰林高校當校長"], ["C", "是的，但今年先師因身體欠安，留職停薪一年"], ["D", "沒有，業師已功成身退，屆齡退休"]], "exp": "(A)「令」是用於尊稱對方如「令尊」、「令嬡」。「杏林」指醫學界，應改為「杏壇」。(B)「愚」用在自家的晚輩，如「愚弟」、「愚妹」。(C)「先」是死亡後對人自稱「先考」、「先妣」。", "trans": "", "per": {"A": "「令」是用於尊稱對方如「令尊」、「令嬡」。「杏林」指醫學界，應改為「杏壇」。", "B": "「愚」用在自家的晚輩，如「愚弟」、「愚妹」。", "C": "「先」是死亡後對人自稱「先考」、「先妣」。"}, "psg": "", "need_img": false}, {"n": 20, "ans": "A", "stem": "硬頸文豪韓愈，在當時可說是風雲人物。若要替他寫傳記，最適當的是", "opts": [["A", "字退之，世稱韓昌黎，為「唐宋古文八大家」之首"], ["B", "曾因上表反對迎佛骨，觸怒皇帝，被貶至柳州"], ["C", "平生以繼承道統自任，極力弘揚儒家學說，排拒老莊與法家思想"], ["D", "自韓愈提倡「古文運動」後，駢文的勢力從此未能與古文相抗衡"]], "exp": "(B)被貶至潮州。(C)排拒老莊思想和佛教。(D)晚唐駢文再度興盛，北宋初仍崇尚華麗無實之文。", "trans": "", "per": {"B": "被貶至潮州。", "C": "排拒老莊思想和佛教。", "D": "晚唐駢文再度興盛，北宋初仍崇尚華麗無實之文。"}, "psg": "", "need_img": false}, {"n": 21, "ans": "C", "stem": "依據文章內容與專家對 AI 在教育領域的觀察，下列何者最能反映生成式 AI 工具的特性與其在學習環境中的局限性", "opts": [["A", "隨著 AI 發展，大家更能體會「學無常師」的重要性，AI 能解決教育問題，更能取代教師"], ["B", "AI 協助學生解答數學科目，能增加學生學習動力，學習更加專注認真"], ["C", "儘管 AI 學富五車、見多識廣，自動生成的資訊卻非百分百正確，恐怕還會造成誤導"], ["D", "AI 聊天機器人可以陪伴你，為你解憂，且永遠不會嫌棄你"]], "exp": "(A)由「《紐約時報》也指出，AI 聊天機器人可能隨意生成錯誤資訊，提供不可靠的答案。……這使得 AI 目前難以取代真人教師」可知為非。(B)目前沒有證據表明 AI 聊天機器人能提升學生的學習動力。(D)由「學生與 AI 的互動往往冷淡，機器人經常答不上問題，甚至無法給出回應」，可知 AI 聊天機器人並不具備與人類交流所需的情感能力，因此無法真正陪伴或為學生解憂，故為非。", "trans": "", "per": {"A": "由「《紐約時報》也指出，AI 聊天機器人可能隨意生成錯誤資訊，提供不可靠的答案。……這使得 AI 目前難以取代真人教師」可知為非。", "B": "目前沒有證據表明 AI 聊天機器人能提升學生的學習動力。", "D": "由「學生與 AI 的互動往往冷淡，機器人經常答不上問題，甚至無法給出回應」，可知 AI 聊天機器人並不具備與人類交流所需的情感能力，因此無法真正陪伴或為學生解憂，故為非。"}, "psg": "薩蒂亞與美國教育媒體「The 74」分享他的研究結果：「AI 不適合做為有效且長期的一對一輔導工具。」他的團隊成功開發了擁有豐富知識的 AI 教師，但研究發現，AI 教師對學生學習的影響微乎其微。學生與 AI 的互動往往冷淡，機器人經常答不上問題，甚至無法給出回應。<br><br>相比之下，薩蒂亞觀察到，人與人之間的對話充滿情感和溫度。真實的師生交流能讓彼此了解對方的想法和價值觀，而這是機器人無法實現的。他認為，生成式 AI 雖然能在教育中擔任如助教般的角色，例如協助設計課堂作業或批改寫作，但它無法替代教師，因為教師能與學生建立直接的情感連結，如：給予關懷、鼓勵等。<br><br>愛丁堡大學數位教育研究中心的研究員班．威廉森則表示，目前並無證據表明 AI 聊天機器人能提升學生的學習動力。他擔憂現今社會過度吹捧生成式 AI 的效能，恐忽略這些工具可能對學習產生潛在的不良影響。《紐約時報》也指出，AI 聊天機器人可能隨意生成錯誤資訊，提供不可靠的答案。此外，教師和學生通常無法完全驗證這些資料的真實性，這使得 AI 目前難以取代真人教師。<div class='aq-src'>（改寫自游昊耘〈AI 辦不到的事？從 AI 教師計畫，看見真實師生互動的可貴〉）</div><span class='bk-note'>註　薩蒂亞：Satya Nitta，IBM 華生研究中心前電腦研究員，曾為期五年、耗資一億美元，嘗試打造 AI 教師。</span>", "need_img": false}, {"n": 22, "ans": "C", "stem": "依據上文，下列何者最符合「AI 教師辦不到的事」", "opts": [["A", "古之學者必有師。師者，所以傳道、受業、解惑也"], ["B", "生乎吾後，其聞道也，亦先乎吾，吾從而師之"], ["C", "不拘於時，請學於余，余嘉其能行古道，作〈師說〉以貽之"], ["D", "孔子曰：「三人行，則必有我師。」是故弟子不必不如師，師不必賢於弟子"]], "exp": "(A)(B)(D)均可指知識上的學習，而(C)由「不拘於時，請學於余」與「余嘉其能行古道」，不僅反映了學習過程中的真實人際互動，更凸顯了師生之間相互學習與鼓勵的價值。相比之下，AI 雖然能生成知識，但缺乏情感交流，無法擔任這種真實互動的角色。", "trans": "(A)古代學習的人必定有老師。老師，是用來傳授道理、講授學業、解答疑惑的人。(B)出生在我之後的人，懂得道理也可能比我早，我也跟隨他，向他學習。(C)他不受當下世俗以互相學習為恥的風氣所拘束，來向我請教、學習，我嘉許他能實踐古人從師問學的傳統，所以寫了這篇〈師說〉送給他。(D)孔子說：「三人同行，一定有我可以效法或引以為戒的人。」所以學生不一定不如老師，老師也不一定比學生高明。", "per": {"A": "均可指知識上的學習。", "B": "均可指知識上的學習。", "D": "均可指知識上的學習。", "C": "由「不拘於時，請學於余」與「余嘉其能行古道」，不僅反映了學習過程中的真實人際互動，更凸顯了師生之間相互學習與鼓勵的價值。相比之下，AI 雖然能生成知識，但缺乏情感交流，無法擔任這種真實互動的角色。"}, "psg": "薩蒂亞與美國教育媒體「The 74」分享他的研究結果：「AI 不適合做為有效且長期的一對一輔導工具。」他的團隊成功開發了擁有豐富知識的 AI 教師，但研究發現，AI 教師對學生學習的影響微乎其微。學生與 AI 的互動往往冷淡，機器人經常答不上問題，甚至無法給出回應。<br><br>相比之下，薩蒂亞觀察到，人與人之間的對話充滿情感和溫度。真實的師生交流能讓彼此了解對方的想法和價值觀，而這是機器人無法實現的。他認為，生成式 AI 雖然能在教育中擔任如助教般的角色，例如協助設計課堂作業或批改寫作，但它無法替代教師，因為教師能與學生建立直接的情感連結，如：給予關懷、鼓勵等。<br><br>愛丁堡大學數位教育研究中心的研究員班．威廉森則表示，目前並無證據表明 AI 聊天機器人能提升學生的學習動力。他擔憂現今社會過度吹捧生成式 AI 的效能，恐忽略這些工具可能對學習產生潛在的不良影響。《紐約時報》也指出，AI 聊天機器人可能隨意生成錯誤資訊，提供不可靠的答案。此外，教師和學生通常無法完全驗證這些資料的真實性，這使得 AI 目前難以取代真人教師。<div class='aq-src'>（改寫自游昊耘〈AI 辦不到的事？從 AI 教師計畫，看見真實師生互動的可貴〉）</div><span class='bk-note'>註　薩蒂亞：Satya Nitta，IBM 華生研究中心前電腦研究員，曾為期五年、耗資一億美元，嘗試打造 AI 教師。</span>", "need_img": false}, {"n": 23, "ans": "A", "stem": "關於本文的書寫脈絡，下列說明何者正確", "opts": [["A", "說明 AI 有強大知識庫卻缺乏情感的陪伴→批判 AI能解答各種問題，卻無法提升學生學習動力→指出 AI 系統可能會產生錯誤的資訊來回答使用者"], ["B", "批判 AI 能解答各種問題，卻無法提升學生學習動力→說明 AI 有強大知識庫卻缺乏情感的陪伴→指出 AI 系統可能會產生錯誤的資訊來回答使用者"], ["C", "指出 AI 系統可能會產生錯誤的資訊來回答使用者→批判 AI 能解答各種問題，卻無法提升學生學習動力→說明 AI 有強大知識庫卻缺乏情感的陪伴"], ["D", "說明 AI 有強大知識庫卻缺乏情感的陪伴→指出 AI 系統可能會產生錯誤的資訊來回答使用者→批判 AI 能解答各種問題，卻無法提升學生學習動力"]], "exp": "(A)本文先說明 AI 雖具備龐大的知識庫，卻因缺乏情感互動而難以形成有效的學習關係；接著引述研究者觀點，批判 AI 聊天機器人尚無證據能提升學生的學習動力；最後指出 AI 可能產生錯誤或難以驗證的資訊，凸顯其在教育應用上的風險。因此行文脈絡依序為「說明→批判→指出」。", "trans": "", "per": {"A": "本文先說明 AI 雖具備龐大的知識庫，卻因缺乏情感互動而難以形成有效的學習關係；接著引述研究者觀點，批判 AI 聊天機器人尚無證據能提升學生的學習動力；最後指出 AI 可能產生錯誤或難以驗證的資訊，凸顯其在教育應用上的風險。因此行文脈絡依序為「說明→批判→指出」。"}, "psg": "薩蒂亞與美國教育媒體「The 74」分享他的研究結果：「AI 不適合做為有效且長期的一對一輔導工具。」他的團隊成功開發了擁有豐富知識的 AI 教師，但研究發現，AI 教師對學生學習的影響微乎其微。學生與 AI 的互動往往冷淡，機器人經常答不上問題，甚至無法給出回應。<br><br>相比之下，薩蒂亞觀察到，人與人之間的對話充滿情感和溫度。真實的師生交流能讓彼此了解對方的想法和價值觀，而這是機器人無法實現的。他認為，生成式 AI 雖然能在教育中擔任如助教般的角色，例如協助設計課堂作業或批改寫作，但它無法替代教師，因為教師能與學生建立直接的情感連結，如：給予關懷、鼓勵等。<br><br>愛丁堡大學數位教育研究中心的研究員班．威廉森則表示，目前並無證據表明 AI 聊天機器人能提升學生的學習動力。他擔憂現今社會過度吹捧生成式 AI 的效能，恐忽略這些工具可能對學習產生潛在的不良影響。《紐約時報》也指出，AI 聊天機器人可能隨意生成錯誤資訊，提供不可靠的答案。此外，教師和學生通常無法完全驗證這些資料的真實性，這使得 AI 目前難以取代真人教師。<div class='aq-src'>（改寫自游昊耘〈AI 辦不到的事？從 AI 教師計畫，看見真實師生互動的可貴〉）</div><span class='bk-note'>註　薩蒂亞：Satya Nitta，IBM 華生研究中心前電腦研究員，曾為期五年、耗資一億美元，嘗試打造 AI 教師。</span>", "need_img": false, "appraise": "文中說明生成式 AI 雖然能在教育中擔任如助教般的角色，但它並非解決教育問題的萬靈丹，更無法取代教師的角色。薩蒂亞在研究中發現，AI 雖擁有豐富的知識庫，但缺乏情感交流的能力，導致師生互動冷淡，難以有效提升學習成效。相較之下，真實的師生互動與情感交流具有無可取代的價值，而這是機器人無法實現的。本文藉此凸顯了人類教師在教育中的核心作用及情感交流的重要性。"}, {"n": 24, "ans": "A", "stem": "「行成於思，毀於隨。」意在說明做事必須", "opts": [["A", "深思熟慮"], ["B", "不假思索"], ["C", "朝思夕想"], ["D", "勇猛直前"]], "exp": "(B)不費思考，用不著動腦。(C)形容思念極深。(D)奮力向前，毫不退縮。", "trans": "", "per": {"B": "不費思考，用不著動腦。", "C": "形容思念極深。", "D": "奮力向前，毫不退縮。"}, "psg": "{g:國子先生|韓愈自稱，時任國子博士}，晨入太學，召諸生立館下，誨之曰：「{g:業精於勤，荒於嬉|學業因勤奮而精進，因嬉戲而荒廢}；{g:行成於思，毀於隨|德行因思考而養成，因隨便而敗壞}。方今聖賢相逢，{g:治具畢張|治國的法令制度全都完備施行}，拔去凶邪，登崇俊良。{g:占小善者率以錄|具備一點優點的人大都被錄用}，{g:名一藝者無不庸|有一技之長的人沒有不被任用的}。<div class='aq-src'>（韓愈〈進學解〉）</div>", "need_img": false}, {"n": 25, "ans": "B", "stem": "依據上文，本文的主旨為", "opts": [["A", "痛陳有司選才不公"], ["B", "期勉學生應精進德業"], ["C", "陳述時不我與的無奈"], ["D", "說明國子先生進入太學任教的困境"]], "exp": "(B)由「業精於勤，荒於嬉；行成於思，毀於隨」，可知指出太學生應精進德行、學業。", "trans": "", "per": {"B": "由「業精於勤，荒於嬉；行成於思，毀於隨」，可知指出太學生應精進德行、學業。"}, "psg": "{g:國子先生|韓愈自稱，時任國子博士}，晨入太學，召諸生立館下，誨之曰：「{g:業精於勤，荒於嬉|學業因勤奮而精進，因嬉戲而荒廢}；{g:行成於思，毀於隨|德行因思考而養成，因隨便而敗壞}。方今聖賢相逢，{g:治具畢張|治國的法令制度全都完備施行}，拔去凶邪，登崇俊良。{g:占小善者率以錄|具備一點優點的人大都被錄用}，{g:名一藝者無不庸|有一技之長的人沒有不被任用的}。<div class='aq-src'>（韓愈〈進學解〉）</div>", "need_img": false}, {"n": 26, "ans": "D", "stem": "依據上文，下列選項的推論何者無法從文中得知", "opts": [["A", "學業靠勤奮才能精湛，如果貪玩就會荒廢"], ["B", "具有小善、一技者，皆有機會被錄用"], ["C", "當今朝廷，建立規章制度以剷除奸邪，提拔賢俊"], ["D", "有幸而獲選為臣子者，大多不敢張揚"]], "exp": "(A)由「業精於勤，荒於嬉」可推知。(B)由「占小善者率以錄，名一藝者無不庸」可推知。(C)由「方今聖賢相逢，治具畢張，拔去凶邪，登崇俊良」可推知。(D)「蓋有幸而獲選，孰云多而不揚」一句是指「只有才能不夠而僥倖被選拔上來的人，哪裡會有學行優良卻沒有被提舉的人呢」。\n24.～26. 題組", "trans": "國子先生清晨來到太學，把學生們召集到講舍之下，訓導他們說：「一個人學業的精通在於勤奮，學業的荒廢在於貪圖玩樂；德行成就於能深思精求而毀敗於隨便怠惰。當今朝廷，聖明的君主與賢良的大臣相遇，規章制度全都建立起來了，他們能剷除奸邪，提拔賢俊。略微有些優點的人都會被錄用，以一種技藝見稱的人都不會被拋棄。仔細的蒐羅人才，改變他們的缺點、發揚他們的優點。只有才能不夠而僥倖被選拔上來的人，哪裡會有學行優良卻沒有被提舉的人呢？學生們，不要擔心選拔人才的人眼睛不亮，只怕你們的學業不能精湛；不要擔心他們不公平，只怕你們的德行無所成就。」", "per": {"A": "由「業精於勤，荒於嬉」可推知。", "B": "由「占小善者率以錄，名一藝者無不庸」可推知。", "C": "由「方今聖賢相逢，治具畢張，拔去凶邪，登崇俊良」可推知。", "D": "「蓋有幸而獲選，孰云多而不揚」一句是指「只有才能不夠而僥倖被選拔上來的人，哪裡會有學行優良卻沒有被提舉的人呢」。\n24.～26. 題組"}, "psg": "{g:國子先生|韓愈自稱，時任國子博士}，晨入太學，召諸生立館下，誨之曰：「{g:業精於勤，荒於嬉|學業因勤奮而精進，因嬉戲而荒廢}；{g:行成於思，毀於隨|德行因思考而養成，因隨便而敗壞}。方今聖賢相逢，{g:治具畢張|治國的法令制度全都完備施行}，拔去凶邪，登崇俊良。{g:占小善者率以錄|具備一點優點的人大都被錄用}，{g:名一藝者無不庸|有一技之長的人沒有不被任用的}。<div class='aq-src'>（韓愈〈進學解〉）</div>", "need_img": false}];
  if (TEXTBOOK['師說']) {
    if (V69_SHISHUO_WB) TEXTBOOK['師說'].workbook = V69_SHISHUO_WB;
    if (V69_SHISHUO_AQ) TEXTBOOK['師說'].aQuiz = V69_SHISHUO_AQ;
  }

  /* 習作頁：直接顯示答案（綠色）。表格依表頭找答案欄；「（n <b>…</b>）」的 b 也算答案。 */
  var ACOL = /^(答案|字音|字形|詞義|注音|國字|還原語句順序)$/;
  function markWork(sl) {
    if (!sl.querySelector('.wk-top')) return;          // A卷手寫頁（.as-top）不處理
    sl.classList.add('v69-wk');
    sl.querySelectorAll('.wq-item').forEach(function (it) {
      var ans = it.getAttribute('data-ans') || '';
      it.classList.add('ans-on');
      it.querySelectorAll('.wq-opt').forEach(function (o) { if (ans.indexOf(o.getAttribute('data-k')) >= 0) o.classList.add('right'); });
    });
    sl.querySelectorAll('table.wk-table').forEach(function (tb) {
      var rows = tb.querySelectorAll('tr');
      if (!rows.length) return;
      var idx = [];
      Array.prototype.forEach.call(rows[0].children, function (c, i) { if (ACOL.test((c.textContent || '').replace(/\s/g, ''))) idx.push(i); });
      Array.prototype.forEach.call(rows, function (r, ri) {
        if (ri === 0) return;
        idx.forEach(function (i) { var c = r.children[i]; if (c && c.tagName === 'TD') c.classList.add('v69-acol'); });
      });
    });
    sl.querySelectorAll('td b').forEach(function (b) {
      var p = b.previousSibling, t = p && p.nodeType === 3 ? p.nodeValue : '';
      if (/[（(]\s*\d+\s*$/.test(t)) b.classList.add('v69-a');
    });
  }
  var _v69render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v69render.apply(this, arguments);
    try {
      document.querySelectorAll('#wk-slide-area .wks-work, #wkfs-body .wks-work').forEach(markWork);
    } catch (e) {}
    return r;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/058_v70-adv-js.js ════ */
try {

(function () {
  /* 〈師說〉資料行不動（AGENTS §2），進階練習於執行期掛上 */
  var V70_SHISHUO_ADV = [{"kind": "table", "head": "二、進階練習", "cols": ["", "題目", "立場", "加上標點"], "rows": [["1", "報紙上橫列著偌大的棒球賽戰況報導：「這場棒球賽激戰的結果是中華隊戰敗日本隊獲得世界盃總冠軍。」到底誰是冠軍？", "(1)中華隊是冠軍", "<span class='wk-a'>這場棒球賽激戰的結果是：中華隊戰敗日本隊，獲得世界盃總冠軍。</span>"], ["", "", "(2)日本隊是冠軍", "<span class='wk-a'>這場棒球賽激戰的結果是：中華隊戰敗，日本隊獲得世界盃總冠軍。</span>"], ["2", "祝枝山是明代書畫家。一年除夕，一位搜刮鄉里、欺壓百姓的財主請祝枝山寫春聯。", "(1)祝枝山奚落財主的立場", "<span class='wk-a'>明日逢春，好不晦氣。來年倒運，少有餘財。</span>"], ["", "", "(2)財主喜孜孜自以為是的立場", "<span class='wk-a'>明日逢春好，不晦氣。來年倒運少，有餘財。</span>"], ["3", "從前有位財主的兒子借助別人說媒而成婚，待新娘娶進門後，發現與媒人所描述的事實不符，媒人卻堅持自己事先已清楚告知事實。雙方對文句斷句的解讀究竟有何不同？", "(1)財主家的角度", "<span class='wk-a'>此女麻臉無、頭髮烏黑、皮膚白白、痴痴純情、不論聘金，少不了。</span>"], ["", "", "(2)媒介者的角度", "<span class='wk-a'>此女麻臉、無頭髮、烏黑皮膚、白白痴痴、純情不論，聘金少不了。</span>"]], "note": "「句讀」是否正確、恰當，對於文意的理解極為重要。句讀不同，將使文意產生歧異。以下三段，若角色立場不同，將形成如何的句讀方式？請加入適當的標點符號。"}];
  if (V70_SHISHUO_ADV && TEXTBOOK['師說']) TEXTBOOK['師說'].advQ = V70_SHISHUO_ADV;

  /* 投影片：進階練習接在基礎練習之後；沒有基礎練習就放在習作答案總覽之前 */
  var _v70parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v70parse.apply(this, arguments);
    var d = TEXTBOOK[key];
    if (!d || !d.advQ || !d.advQ.length) return slides;
    var at = -1;
    slides.forEach(function (s, i) { if (s.type === 'iquiz') at = i + 1; });
    if (at < 0) { at = slides.findIndex(function (s) { return s.type === 'work_answers'; }); }
    if (at < 0) at = slides.length;
    var add = d.advQ.map(function (sec, i) { return { type: 'iadv', sec: sec, first: i === 0 }; });
    slides.splice.apply(slides, [at, 0].concat(add));
    /* 習作答案總覽記錄的是投影片索引，插入後要跟著位移 */
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += add.length; });
    });
    return slides;
  };

  var _v70render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'iadv') {
      var h = _v70render.call(this, { type: 'work', sec: slide.sec, first: slide.first, title: '' });
      return h.replace('wk-slide wks-work', 'wk-slide wks-work wks-iadv')
              .replace('<span class="wk-tag">習作Ａ</span>', '<span class="wk-tag">應用練習</span>');
    }
    return _v70render.apply(this, arguments);
  };

  var _v70sec = wkBuildSections;
  wkBuildSections = function (slides) {
    var map = _v70sec.apply(this, arguments);
    slides.forEach(function (s, i) { if (s.type === 'iadv' && s.first) map.push({ label: '✐進階練習', idx: i }); });
    map.sort(function (a, b) { return a.idx - b.idx; });
    return map;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/060_v73-rhet-js.js ════ */
try {

(function () {
  /* 動畫內容：原句一律逐字取自〈師說〉課文（textPages）；說明文字取自既有 keyRhetoric 資料，不自行編寫 */
  var V73_ANIMS = {
    '師說': {
      '回文': { cap: '「弟子」與「師」前後位置互換，循環相對。', ex: [
        { k: 'swap', src: '弟子不必不如師，師不必賢於弟子。',
          r1: [['A', '弟子'], ['', '不必不如'], ['B', '師'], ['', '，']],
          r2: [['B', '師'], ['', '不必賢於'], ['A', '弟子'], ['', '。']] } ] },
      '頂針': { cap: '前一句的末字（詞），作為後一句的首字（詞），上遞下接、蟬聯而下，稱為「頂針」。', ex: [
        { k: 'chain', src: '弟子不必不如師，師不必賢於弟子。', a: '弟子不必不如', t: '師', p: '，', b: '不必賢於弟子。' },
        { k: 'chain', src: '請學於余，余嘉其能行古道，作〈師說〉以貽之。', a: '請學於', t: '余', p: '，', b: '嘉其能行古道' } ] },
      '類疊': { cap: '同一個字、詞、語、句，接二連三反覆使用，稱為「類疊」。作用：加強語勢、凸顯對比、使文氣充沛。', ex: [
        { k: 'stack', src: '是故無貴無賤、無長無少，道之所存，師之所存也。', note: '「無……無……」反覆', rows: [['無貴無賤'], ['無長無少']] },
        { k: 'stack', src: '是故聖益聖，愚益愚。', note: '句式相疊', rows: [['聖益聖'], ['愚益愚']] },
        { k: 'stack', src: '生乎吾前，其聞道也，固先乎吾，吾從而師之；生乎吾後，其聞道也，亦先乎吾，吾從而師之。', note: '句型反覆',
          rows: [['生乎吾前', '其聞道也', '固先乎吾', '吾從而師之'], ['生乎吾後', '其聞道也', '亦先乎吾', '吾從而師之']] } ] },
      '映襯': { cap: '把兩種不同的、特別是相反的觀念或事實對列起來兩相比較，使語氣增強、意義更為明顯，稱為「映襯」。', ex: [
        { k: 'vs', src: '古之聖人，其出人也遠矣，猶且從師而問焉；今之眾人，其下聖人也亦遠矣，而恥學於師。',
          pairs: [['古之聖人', '今之眾人'], ['其出人也遠矣', '其下聖人也亦遠矣'], ['猶且從師而問焉', '而恥學於師']] },
        { k: 'vs', src: '巫、醫、樂師、百工之人，不恥相師。士大夫之族，曰師、曰弟子云者，則群聚而笑之。',
          pairs: [['巫、醫、樂師、百工之人', '士大夫之族'], ['不恥相師', '曰師、曰弟子云者，則群聚而笑之']] },
        { k: 'vs', src: '愛其子，擇師而教之，於其身也，則恥師焉，惑矣！',
          pairs: [['愛其子', '於其身也'], ['擇師而教之', '則恥師焉']] } ] }
    }
  };
  window.V73_ANIMS = V73_ANIMS;
  var STEPS = { swap: 3, chain: 2, stack: 2 };
  function nSteps(e) { return e.k === 'vs' ? e.pairs.length : STEPS[e.k]; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function exHTML(e) {
    var h = '';
    if (e.k === 'swap') {
      var row = function (r, c) { return '<div class="row ' + c + '">' + r.map(function (t) {
        return t[0] ? '<span class="k k' + t[0] + '" data-k="' + t[0] + '">' + esc(t[1]) + '</span>' : '<span class="' + (t[1].length > 1 ? 'mid' : '') + '">' + esc(t[1]) + '</span>';
      }).join('') + '</div>'; };
      h = '<div class="v73-hw">' + row(e.r1, 'r1') + row(e.r2, 'r2') + '</div>';
    } else if (e.k === 'chain') {
      h = '<div class="v73-ch">' + esc(e.a) + '<span class="k tail">' + esc(e.t) + '</span>' + esc(e.p) +
          '<span class="k head">' + esc(e.t) + '</span>' + esc(e.b) + '</div>';
    } else if (e.k === 'stack') {
      var cols = e.rows[0].length;
      h = '<div class="v73-st" style="grid-template-columns:repeat(' + cols + ',max-content)">';
      e.rows.forEach(function (r, ri) {
        r.forEach(function (cell, ci) {
          var other = e.rows[1 - ri][ci] || '';
          var chs = Array.from(cell).map(function (c, i) {
            return '<span class="ch ' + (Array.from(other)[i] === c ? 'same' : 'diff') + '">' + esc(c) + '</span>';
          }).join('');
          h += '<span class="cell r' + (ri + 1) + '">' + chs + '</span>';
        });
      });
      h += '</div><div class="v73-note">' + esc(e.note) + '</div>';
    } else if (e.k === 'vs') {
      h = '<div class="v73-vs">' + e.pairs.map(function (p, i) {
        return '<span class="L" data-i="' + i + '">' + esc(p[0]) + '</span><span class="M" data-i="' + i + '">⟷</span><span class="R" data-i="' + i + '">' + esc(p[1]) + '</span>';
      }).join('') + '</div>';
    }
    return '<div class="v73-src">' + esc(e.src) + '</div><div class="v73-stage">' + h + '<svg class="v73-svg"></svg></div>';
  }

  function slideHTML(key, name) {
    var A = V73_ANIMS[key][name];
    var tabs = A.ex.length > 1 ? '<div class="v73-tabs">' + A.ex.map(function (e, i) {
      return '<button class="v73-tab' + (i ? '' : ' on') + '" onclick="v73Show(this,' + i + ')">例' + '一二三四五'[i] + '</button>'; }).join('') + '</div>' : '';
    var exs = A.ex.map(function (e, i) {
      return '<div class="v73-ex' + (i ? '' : ' cur') + '" data-k="' + e.k + '" data-n="' + nSteps(e) + '">' + exHTML(e) + '</div>'; }).join('');
    return '<div class="wk-slide wks-keyrhet v73-kr v73-anim-slide">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">' + esc(name) + '</span><span class="wks-kr-sub">結構動畫〈' + esc(key) + '〉</span></div>' +
      '<div class="v73a" data-ex="0" data-st="0">' + tabs + exs +
      '<div class="v73-cap">' + esc(A.cap) + '</div>' +
      '<div class="v73-ctrl"><button class="v73-btn" onclick="v73Step(this)">▶ 下一步</button>' +
      '<button class="v73-btn rst" onclick="v73Reset(this)">↻ 重來</button><span class="v73-tip"></span></div></div></div>';
  }

  /* ── 動畫控制 ── */
  /* 以版面位置計算（不受移動中的 transform 影響），stage 為 position:relative */
  function rel(el, base) { var x = 0, y = 0, n = el;
    while (n && n !== base) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }; }
  function drawPath(svg, d, color, marker) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color);
    svg.appendChild(p);
    var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    void p.getBoundingClientRect(); p.classList.add('v73-draw');
    if (marker) { var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      var pt = p.getPointAtLength(L); c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', 5); c.setAttribute('fill', color);
      c.style.opacity = 0; c.style.transition = 'opacity .3s .8s'; svg.appendChild(c); requestAnimationFrame(function () { c.style.opacity = 1; }); }
  }
  var TIPS = {
    swap: ['① 找出關鍵詞：「弟子」與「師」', '② 下句把兩個詞的位置對調', '③ 位置互換、循環相對'],
    chain: ['① 前一句的末字', '② 接成後一句的首字'],
    stack: ['① 上下兩句對齊排列', '② 相同的字反覆出現']
  };
  function apply(ex, st) {
    var k = ex.dataset.k, stage = ex.querySelector('.v73-stage'), svg = ex.querySelector('.v73-svg');
    ex.classList.add('s' + st);
    if (k === 'swap') {
      if (st === 1) ex.querySelectorAll('.r1 .k').forEach(function (x) { x.classList.add('lit'); });
      if (st === 2) {
        ex.querySelectorAll('.r2 .k').forEach(function (t) {
          var src = ex.querySelector('.r1 .k[data-k="' + t.dataset.k + '"]');
          var a = src.getBoundingClientRect(), b = t.getBoundingClientRect();
          t.classList.add('lit');
          t.style.transition = 'none'; t.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
          void t.offsetWidth;
          t.style.transition = 'transform 1s cubic-bezier(.5,0,.3,1), background .4s, color .4s'; t.style.transform = '';
        });
      }
      if (st === 3) ['A', 'B'].forEach(function (key) {
        var p = rel(ex.querySelector('.r1 .k[data-k="' + key + '"]'), stage), q = rel(ex.querySelector('.r2 .k[data-k="' + key + '"]'), stage);
        drawPath(svg, 'M' + (p.x + p.w / 2) + ' ' + (p.y + p.h) + ' L' + (q.x + q.w / 2) + ' ' + q.y, key === 'A' ? '#1f5fa8' : '#c0392b', true);
      });
    } else if (k === 'chain') {
      if (st === 1) ex.querySelector('.tail').classList.add('lit');
      if (st === 2) {
        var p = rel(ex.querySelector('.tail'), stage), q = rel(ex.querySelector('.head'), stage);
        var x1 = p.x + p.w / 2, x2 = q.x + q.w / 2, y = p.y + 4, lift = Math.max(30, p.h * .9);
        drawPath(svg, 'M' + x1 + ' ' + y + ' C' + x1 + ' ' + (y - lift) + ' ' + x2 + ' ' + (y - lift) + ' ' + x2 + ' ' + y, '#d4a017', true);
        setTimeout(function () { ex.querySelector('.head').classList.add('lit'); }, 700);
      }
    } else if (k === 'stack') {
      if (st === 2) ex.querySelector('.v73-note').classList.add('show');
    } else if (k === 'vs') {
      ex.querySelectorAll('.v73-vs [data-i="' + (st - 1) + '"]').forEach(function (x) { x.classList.add('on'); });
    }
  }
  function tipFor(ex, st) { var t = TIPS[ex.dataset.k]; return t ? (t[st - 1] || '') : ('第 ' + st + ' 組對照'); }
  function syncBtn(box) {
    var exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, n = +exs[ei].dataset.n;
    var btn = box.querySelector('.v73-btn:not(.rst)');
    btn.disabled = false;
    btn.textContent = st < n ? '▶ 下一步' : (ei + 1 < exs.length ? '▶ 下一例' : '▶ 總結');
    if (box.querySelector('.v73-cap.show')) { btn.disabled = true; btn.textContent = '✓ 完成'; }
  }
  function show(box, i) {
    var exs = box.querySelectorAll('.v73-ex');
    exs.forEach(function (e, j) { e.classList.toggle('cur', j === i); });
    box.querySelectorAll('.v73-tab').forEach(function (t, j) { t.classList.toggle('on', j === i); });
    resetEx(exs[i]);
    box.dataset.ex = i; box.dataset.st = 0;
    box.querySelector('.v73-cap').classList.remove('show');
    box.querySelector('.v73-tip').textContent = '';
    syncBtn(box);
  }
  function resetEx(ex) {
    ex.className = 'v73-ex cur';
    ex.querySelectorAll('.lit,.on,.show').forEach(function (x) { x.classList.remove('lit', 'on', 'show'); });
    ex.querySelectorAll('.k').forEach(function (x) { x.style.transform = ''; x.style.transition = ''; });
    var svg = ex.querySelector('.v73-svg'); if (svg) svg.innerHTML = '';
  }
  window.v73Show = function (el, i) { if (event) event.stopPropagation(); show(el.closest('.v73a'), i); };
  window.v73Step = function (btn) {
    if (window.event) window.event.stopPropagation();
    var box = btn.closest('.v73a'), exs = box.querySelectorAll('.v73-ex');
    var ei = +box.dataset.ex, st = +box.dataset.st, ex = exs[ei], n = +ex.dataset.n;
    if (st >= n) {
      if (ei + 1 < exs.length) { show(box, ei + 1); return; }
      box.querySelector('.v73-cap').classList.add('show');
      box.querySelector('.v73-tip').textContent = '';
      syncBtn(box); return;
    }
    st++; box.dataset.st = st; apply(ex, st);
    box.querySelector('.v73-tip').textContent = tipFor(ex, st);
    syncBtn(box);
  };
  window.v73Reset = function (btn) { if (window.event) window.event.stopPropagation(); show(btn.closest('.v73a'), 0); };

  /* ── 投影片：動畫頁接在該修辭最後一張專頁之後 ── */
  var _v73parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v73parse.apply(this, arguments);
    var A = V73_ANIMS[key]; if (!A) return slides;
    Object.keys(A).forEach(function (name) {
      var at = -1;
      slides.forEach(function (s, i) { if (s.type === 'keyrhet' && s.name === name) at = i + 1; });
      if (at < 0) return;
      slides.splice(at, 0, { type: 'v73anim', key: key, name: name });
      slides.forEach(function (s) {
        if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
      });
    });
    return slides;
  };

  /* ── 修辭專頁／文法修辭總表：定義收合、【本課】改徽章、套卡片版面 ── */
  var _v73render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'v73anim') return slideHTML(slide.key, slide.name);
    var h = _v73render.apply(this, arguments);
    if (slide && (slide.type === 'keyrhet' || slide.type === 'rhet_table') && typeof h === 'string') {
      if (h.indexOf('jy-table') >= 0) {
        h = h.replace(/<div class="rt-def">([\s\S]*?)<\/div>/, function (m, body) {
          return '<div class="v73-def" onclick="this.classList.toggle(\'open\')"><span class="v73-def-tag">定義</span><div class="v73-def-body">' + body + '</div></div>';
        });
      }
      h = h.replace(/【本課】/g, '<span class="v73-own">本課</span>');
      h = h.replace('wk-slide wks-keyrhet', 'wk-slide wks-keyrhet v73-kr').replace('wk-slide wks-rhet-table', 'wk-slide wks-rhet-table v73-rt');
    }
    return h;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/063_v74-fix-js.js ════ */
try {

(function () {
  /* ── ④ 答案總覽：趣味文學／挑戰加分站等只用 <span class='wk-a'> 標答案、表頭又不是「答案」的表格，
        原擷取程式抓不到（〈火車線〉）。只在總覽渲染用的複本中把 wk-a 轉成 wk-tans 標記，資料不改。 ── */
  var AO_HEAD = /^(答案|字音|字形|詞義|詞義\/解釋|注音|國字|還原語句順序)$/;
  function needWkA(s) {
    if (s.kind !== 'table') return false;
    if ((s.cols || []).some(function (c) { return AO_HEAD.test(String(c == null ? '' : c).replace(/<[^>]+>/g, '').trim()); })) return false;
    var raw = JSON.stringify(s.rows || []);
    if (/wk-tans|jy-blank|[（(]\s*\d+\s*<b/.test(raw)) return false;
    return /class=['"]wk-a['"]/.test(raw);
  }
  function wkA2tans(c) {
    return String(c == null ? '' : c).replace(/<span class=['"]wk-a['"]>([\s\S]*?)<\/span>/g,
      '<span class="wk-tans"><span class="wk-tval">$1</span></span>');
  }
  var _v74prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'work_answers' && slide.workbook && (slide.workbook.sections || []).some(needWkA)) {
      var W = slide.workbook;
      var W2 = Object.assign({}, W, { sections: W.sections.map(function (s) {
        return needWkA(s) ? Object.assign({}, s, { rows: s.rows.map(function (r) { return r.map(wkA2tans); }) }) : s;
      }) });
      return _v74prev.call(this, Object.assign({}, slide, { workbook: W2 }));
    }
    if (slide && slide.type === 'work' && slide.sec && typeof wkKey !== 'undefined' && wkKey === '師說' &&
        /^四、國學常識解碼/.test(slide.sec.head || '')) {
      var h = _v74prev.apply(this, arguments);
      return h.replace(/<div class="wk-tblwrap">[\s\S]*<\/table><\/div>/, function () { return gxTable(slide.sec); });
    }
    return _v74prev.apply(this, arguments);
  };

  /* ── ② 〈師說〉國學常識解碼：依原卷版面（標題列、社會問題分析跨欄、①～⑥、1. 2. 條列）。文字全取自既有資料。 ── */
  var CN = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
  function blanks(t) {
    return t.replace(/（\s*(\d)\s*<b>([\s\S]*?)<\/b>\s*）/g, function (m, n, a) {
      return '（<span class="v74-cn">' + CN[+n] + '</span><b class="v69-a">' + a + '</b>　）';
    }).replace(/先秦、兩漢散文（語言樸實、形式自由）/,
      '<span class="v74-box"><span>先秦、兩漢散文</span><small>語言樸實、形式自由</small></span>');
  }
  function list(t) {
    var items = String(t).split(/<br\s*\/?>/).map(function (x) { return x.replace(/^\s*\d+\s+/, ''); }).filter(function (x) { return x.trim(); });
    return '<ol>' + items.map(function (x) { return '<li>' + blanks(x) + '</li>'; }).join('') + '</ol>';
  }
  function gxTable(S) {
    var cap = S.cols[0], rows = S.rows;
    var out = '<tr><th class="jy-th v74-gx-cap" colspan="3">' + cap + '</th></tr>';
    rows.forEach(function (r, i) {
      if (i === 0) {
        out += '<tr><th class="jy-th">' + r[0] + '</th><td colspan="2">' + blanks(r[1]) + '</td></tr>' +
               '<tr><th class="jy-th" colspan="2">' + S.cols[1] + '</th><th class="jy-th">' + S.cols[2] + '</th></tr>';
      } else {
        out += '<tr><th class="jy-th">' + r[0] + '</th><td>' + blanks(r[1]) + '</td><td>' + list(r[2]) + '</td></tr>';
      }
    });
    return '<div class="wk-tblwrap"><table class="jy-table wk-table v74-gx"><colgroup><col class="c1"><col class="c2"><col class="c3"></colgroup>' + out + '</table></div>';
  }

  /* ── ① 字詞義欄：逐行點選顯示；③ 語譯／解析欄：綠色 ── */
  function fixWork(sl) {
    if (!sl.querySelector('.wk-top')) return;
    sl.querySelectorAll('table.wk-table').forEach(function (tb) {
      if (tb.getAttribute('data-v74')) return;
      tb.setAttribute('data-v74', '1');
      var rows = tb.querySelectorAll('tr');
      if (!rows.length) return;
      var mean = -1, trans = -1;
      Array.prototype.forEach.call(rows[0].children, function (c, i) {
        var t = (c.textContent || '').replace(/\s/g, '');
        if (t === '字詞義') mean = i;
        if (t === '語譯／解析') trans = i;
      });
      Array.prototype.forEach.call(rows, function (r, ri) {
        if (ri === 0) return;
        if (trans >= 0 && r.children[trans]) r.children[trans].classList.add('v69-acol');
        var c = mean >= 0 && r.children[mean];
        if (!c || c.tagName !== 'TD') return;
        c.innerHTML = c.innerHTML.split(/<br\s*\/?>/).map(function (x) {
          var m = x.match(/^(\s*[（(]\d[）)])([\s\S]*)$/);
          return m ? m[1] + '<span class="v74-rv" onclick="this.classList.toggle(\'on\')">' + m[2] + '</span>'
                   : '<span class="v74-rv" onclick="this.classList.toggle(\'on\')">' + x + '</span>';
        }).join('<br>');
      });
      if (mean >= 0) {
        var bar = document.createElement('div');
        bar.className = 'v74-rvbar';
        bar.innerHTML = '<button type="button" class="all">全部顯示</button><button type="button">全部隱藏</button>';
        bar.children[0].onclick = function () { tb.querySelectorAll('.v74-rv').forEach(function (e) { e.classList.add('on'); }); };
        bar.children[1].onclick = function () { tb.querySelectorAll('.v74-rv').forEach(function (e) { e.classList.remove('on'); }); };
        var wrap = tb.closest('.wk-tblwrap') || tb;
        wrap.parentNode.insertBefore(bar, wrap);
      }
    });
  }
  var _v74render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v74render.apply(this, arguments);
    try { document.querySelectorAll('#wk-slide-area .wks-work, #wkfs-body .wks-work').forEach(fixWork); } catch (e) {}
    return r;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/065_v75-charbian-js.js ════ */
try {

(function () {
  if (!TEXTBOOK['師說']) return;

  /* ── ① 字詞辨析頁：內容逐字取自 RAY PPT（暫存資料/04.第四課 師說 RAY1.pptx 義辨／形辨頁）；
        「之」依老師指定格式、分類經備課用書語譯與夾注核對；
        與備課用書不同處依備課用書（見 docs/交接_V75*.md）。 ── */
  var CB = [
    { name:'之', pages:[{ sub:'義辨', groups:[{ x:'之', rows:[
      ['（助）的', ['古之學者必有師。','道之所存，師之所存也。','古之聖人／今之眾人。','彼童子之師。','巫、醫、樂師、百工之人。','士大夫之族。']],
      ['（助）無義', ['師道之不傳也久矣。','欲人之無惑也難矣。','夫庸知其年之先後生於吾乎？','聖人之所以為聖，愚人之所以為愚。','師道之不復可知矣。']],
      ['（助）表倒裝', ['句讀之不知，惑之不解。']],
      ['代名詞', ['人非生而知之者。','吾從而師之。','擇師而教之。','授之書。','則群聚而笑之。','問之。','六藝經傳，皆通習之。','作〈師說〉以貽之。']],
      ['往、到', ['吾欲之南海。（彭端淑〈為學一首示子姪〉）']]
    ]}]}]},
    { name:'學者', pages:[{ sub:'義辨', groups:[{ x:'學者', rows:[
      ['學習的人', ['古之學者必有師。']],
      ['學問淵博而有所成就的人', ['生物學者。']]
    ]}]}]},
    { name:'者', pages:[{ sub:'義辨', groups:[{ x:'者', rows:[
      ['代名詞，……的人', ['學者、記者、作者。','人非生而知之者。']],
      ['助詞，用於句中，表示停頓', ['師者，所以傳道、受業、解惑也。','法者，天子所與天下公共也。（司馬遷〈張釋之執法〉）']],
      ['助詞，用於句末，表示語氣結束', ['蓮，花之君子者也。（周敦頤〈愛蓮說〉）']]
    ]}]}]},
    { name:'庸', pages:[{ sub:'義辨', groups:[{ x:'庸', rows:[
      ['豈', ['夫庸知其年之先後生於吾乎？']],
      ['愚笨、拙劣的', ['庸奴、庸醫。']],
      ['平常的、普通的', ['平庸。']],
      ['需要', ['無庸置疑。']],
      ['酬謝', ['酬庸。']]
    ]}]}]},
    { name:'所以', pages:[{ sub:'義辨', groups:[{ x:'所以', rows:[
      ['用來', ['師者，所以傳道、受業、解惑也。','不患無位，患所以立。（《論語．里仁》）']],
      ['為何，表原因', ['聖人之所以為聖，愚人之所以為愚，其皆出於此乎？','親賢臣，遠小人，此先漢所以興隆也。（諸葛亮〈出師表〉）']],
      ['因此、因而。常與「因為」連用，表示因果關係。', ['因為人太多，所以說的什麼話都聽不清楚。（《老殘遊記》第二回）']]
    ]}]}]},
    { name:'其', pages:[
      { sub:'義辨', groups:[{ x:'其', rows:[
        ['那些', ['其為惑也，終不解矣。']],
        ['大概，表示推測語氣', ['愚人之所以為愚，其皆出於此乎？']],
        ['他', ['余嘉其能行古道。']]
      ]}]},
      { sub:'義辨（延伸）', groups:[{ x:'其', rows:[
        ['通「豈」（反詰語氣）', ['則天下其有不亂，國家其有不亡者乎？（顧炎武〈廉恥〉）','不可為常者，其聖人之法乎？（歐陽脩〈縱囚論〉）']],
        ['假如（假設語氣）', ['蘭槐之根是為芷，其漸之滫，君子不近，庶人不服。（荀子〈勸學〉）','彼其能有所忍也，然後可以就大事。（蘇軾〈留侯論〉）']],
        ['希望（期望語氣）', ['聊布往懷，君其詳之。（丘遲〈與陳伯之書〉）']]
      ]}]}
    ]},
    { name:'不齒／不恥', pages:[{ sub:'義辨', groups:[
      { x:'不齒', rows:[['不屑與之並列', ['君子不齒。']]] },
      { x:'不恥', rows:[['不以……為恥', ['不恥相師。']]] }
    ]}]},
    { name:'師', pages:[
      { sub:'義辨', groups:[{ x:'師', rows:[
        ['老師', ['古之學者必有師。','師者，所以傳道、受業、解惑也。','惑而不從師。','道之所存，師之所存也。','從師而問焉。','恥學於師。','擇師而教之。','彼童子之師。','士大夫之族，曰師、曰弟子云者。','聖人無常師。','三人行，則必有我師。','弟子不必不如師，師不必賢於弟子。']],
        ['具有專門技藝的人', ['樂師。','師襄。']],
        ['學習、請教', ['吾從而師之。','吾師道也。','於其身也，則恥師焉。','或師焉，或不焉。','不恥相師。','孔子師郯子。']],
        ['從師問學的', ['師道之不傳也久矣。','師道之不復可知矣。']]
      ]}]},
      { sub:'義辨（延伸）', groups:[{ x:'師', rows:[
        ['對道士或僧尼的尊稱', ['法師、禪師。']],
        ['軍隊', ['出師、會師、興師問罪。']],
        ['都邑、都城', ['京師。']],
        ['榜樣、借鏡', ['前事不忘，後事之師。']]
      ]}]}
    ]},
    { name:'於', pages:[{ sub:'義辨', groups:[{ x:'於', rows:[
      ['向，表示趨向', ['恥學於師。','請學於余。']],
      ['從、由，表示所從', ['愚人之所以為愚，其皆出於此乎？']],
      ['對於，表示動作行為的對象', ['於其身也，則恥師焉。']],
      ['比，引進比較對象', ['師不必賢於弟子。']],
      ['被，置於動詞之後，表示被動', ['不拘於時。']]
    ]}]}]},
    { name:'貽', pages:[{ sub:'形辨', yin:true, groups:[
      { x:'貽', yin:'ㄧˊ', rows:[['贈送', ['作〈師說〉以貽之。']], ['遺留', ['貽笑大方。']]] },
      { x:'怡', yin:'ㄧˊ', rows:[['和悅、愉快', ['怡然自得、心曠神怡。']]] },
      { x:'飴', yin:'ㄧˊ', rows:[['用米或麥製成的糖漿或軟糖', ['甘之如飴、含飴弄孫。']]] }
    ]}]}
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function hi(ex, x) { return esc(ex).split(esc(x)).join('<b>' + esc(x) + '</b>'); }
  function exList(arr, x) {
    if (arr.length === 1) return hi(arr[0], x);
    var items = arr.map(function (e, i) { return (i + 1) + '. ' + hi(e, x); });
    return arr.length > 4 ? '<div class="v75-ex2">' + items.map(function (t) { return '<div>' + t + '</div>'; }).join('') + '</div>' : items.join('<br>');
  }
  function tableHTML(pg) {
    var h = '<table class="v75-yb"><tr><th>形</th>' + (pg.yin ? '<th>音</th>' : '') + '<th>義</th><th>例</th></tr>';
    pg.groups.forEach(function (g) {
      g.rows.forEach(function (r, ri) {
        h += '<tr>';
        if (ri === 0) {
          h += '<td class="v75-x" rowspan="' + g.rows.length + '">' + esc(g.x) + '</td>';
          if (pg.yin) h += '<td class="v75-yin" rowspan="' + g.rows.length + '">' + esc(g.yin) + '</td>';
        }
        h += '<td class="v75-y"><span class="v75-rv" onclick="this.classList.toggle(\'on\')">' + esc(r[0]) + '</span></td>' +
             '<td class="v75-e">' + exList(r[1], g.x) + '</td></tr>';
      });
    });
    return h + '</table>';
  }
  TEXTBOOK['師說'].charBian = CB.map(function (c) {
    return { name: c.name, pages: c.pages.map(function (pg) {
      return { sub: pg.sub, body: '<div class="v75-yb-wrap" data-kind="' + esc(pg.sub) + '">' + tableHTML(pg) + '</div>' };
    }) };
  });

  var _v75prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'charbian' && String(slide.body || '').indexOf('v75-yb-wrap') >= 0) {
      var kind = String(slide.sub || '義辨'), base = kind.replace(/（.*）/, ''), ext = kind.indexOf('延伸') >= 0;
      return '<div class="wk-slide wks-charbian v75-cb"><div class="v75-top">' +
        '<span class="v75-kind">' + base + '：' + slide.name + '</span>' + (ext ? '<span class="v75-tag">延伸</span>' : '') +
        '<span class="v75-bar"><button type="button" class="all" onclick="v75All(this,true)">全部顯示</button>' +
        '<button type="button" onclick="v75All(this,false)">全部隱藏</button></span></div>' +
        '<div class="jy-scroll">' + slide.body + '</div></div>';
    }
    return _v75prev.apply(this, arguments);
  };
  window.v75All = function (btn, on) {
    var sl = btn.closest('.wk-slide');
    if (sl) sl.querySelectorAll('.v75-rv').forEach(function (e) { e.classList.toggle('on', on); });
  };

  /* ── ② 課文浮框：依備課用書（夾注 P3-17～3-22、語譯）修正「之」「者」。逐一精確替換，次數不符就不替換並警告。 ── */
  var FIX = [
    [0, 2, '知{n:3|之}{g:者|表語氣停頓，無義}', '知{n:3|之}{g:者|代名詞，……的人}'],
    [1, 1, '{n:11|庸知其年之先後生於吾乎}', '{n:11|庸知其年{g:之|（助）無義}先後生於吾乎}'],
    [2, 0, '{n:13|師道}{g:之|的}', '{n:13|師道}{g:之|（助）無義}'],
    [2, 0, '欲人{g:之|的}', '欲人{g:之|（助）無義}'],
    [2, 1, '；今之眾人，', '；今{g:之|的}眾人，'],
    [3, 1, '授之{g:書|', '授{g:之|代名詞，他們}{g:書|'],
    [4, 0, '{n:26|百工}之人', '{n:26|百工}{g:之|的}人'],
    [4, 1, '則群聚而笑之。', '則群聚而笑{g:之|代名詞，他們}。'],
    [4, 2, '問之，則曰', '問{g:之|代名詞，他們}，則曰'],
    [4, 3, '百工之人，君子', '百工{g:之|的}人，君子'],
    [5, 1, '郯子{g:之|主謂之間，不譯}', '郯子之']
  ];
  var tp = TEXTBOOK['師說'].textPages;
  FIX.forEach(function (f) {
    try {
      var L = tp[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v75] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v75] 浮框替換失敗：', f[2], e); }
  });

  /* ── ③ 課文「總」字卡「之」（v54-anno-js，DATA 在閉包內）：開卡後改寫本字卡表格，與辨析頁一致 ── */
  var ZHI = [
    ['（助）的', ['古「<b>之</b>」學者', '道「<b>之</b>」所存']],
    ['（助）無義', ['師道「<b>之</b>」不傳也久矣', '欲人「<b>之</b>」無惑也難矣']],
    ['（助）表倒裝', ['句讀「<b>之</b>」不知']],
    ['代名詞', ['人非生而知「<b>之</b>」者（指道、業）', '作〈師說〉以貽「<b>之</b>」（指李蟠）']]
  ];
  function patchZhi() {
    var ov = document.getElementById('ss-anno-ov'), ttl = document.getElementById('ss-ttl');
    if (!ov || !ttl || !/：之$/.test(ttl.textContent)) return;
    var tbl = ov.querySelector('#ss-body .ss-tbl');
    if (!tbl) return;
    tbl.innerHTML = ZHI.map(function (s, i) {
      var last = i === ZHI.length - 1 ? ' ss-last' : '';
      return '<div class="ss-c ss-c-num' + last + '"></div>' +
        '<div class="ss-c ss-c-yi' + last + '"><span class="ss-given">' + s[0] + '</span></div>' +
        '<div class="ss-c ss-c-ex' + last + '"><ol class="ss-exs">' + s[1].map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ol></div>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.ss-zong[data-k="之"]');
    if (z) setTimeout(patchZhi, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function (key) { var r = _open.apply(this, arguments); if (key === '之') patchZhi(); return r; };
  }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/067_v76-fix-js.js ════ */
try {

(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ①② 浮框依備課用書再修；③ 補 RAY PPT 第 110、163 張的課文補充（逐一精確替換，次數不符就略過並警告） ── */
  var FIX = [
    [3, 1, '{g:書|寫字}', '{g:書|書本}'],                                   /* 備課用書疑難辨析：本課採「誦讀書本」 */
    [3, 0, '教{g:之|他，指士大夫之子}', '教{g:之|代名詞，他們}'],           /* 備課用書語譯「教育他們」 */
    [3, 0, '則{p:恥|', '{g:則|卻}{p:恥|'],                                  /* PPT 第 110 張：則＝卻 */
    [6, 1, '{n:45|不拘{g:於|', '{n:45|不{g:拘|限制}{g:於|'],               /* PPT 第 163 張：拘＝限制 */
    [6, 1, '{g:作|寫作}', '{g:作|創作}']                                    /* PPT 第 163 張：作＝創作 */
  ];
  FIX.forEach(function (f) {
    try {
      var L = T.textPages[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v76] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v76] 浮框替換失敗：', f[2], e); }
  });
  /* PPT 第 131 張：第五段「彼與彼年相若也……官盛則近諛」加第二條句意（原文照錄） */
  try {
    var L5 = T.textPages[4].lines[2];
    if (L5.cite2 == null && L5.text.indexOf('彼與彼年相若也，道相似也') >= 0) {
      L5.cite2 = '彼與彼年相若也，道相似也。」位卑則足羞，官盛則近諛';
      L5.mean2 = '從年紀、地位兩方面來說明士大夫的求學心態。可對照第二段「無貴無賤，無長無少」';
    } else console.warn('[v76] 第五段句意未加（已有 cite2 或找不到原句）');
  } catch (e) { console.warn('[v76] 第五段句意失敗', e); }

  /* ── 辨析頁「庸」：依備課用書注⑪「豈、何必」 ── */
  (T.charBian || []).forEach(function (c) {
    if (c.name !== '庸') return;
    c.pages.forEach(function (p) {
      var n = p.body.split('>豈</span>').length - 1;
      if (n === 1) p.body = p.body.replace('>豈</span>', '>豈、何必</span>');
      else console.warn('[v76] 庸 辨析頁替換次數不符', n);
    });
  });

  /* ── ④ 總字卡（v54-anno-js）字義措辭與辨析頁統一：開卡後改寫顯示文字（例句、編號不動） ── */
  var MAP = {
    '師': { '有專門技藝的人':'具有專門技藝的人', '學習':'學習、請教' },
    '所以': { '用來（表目的）':'用來', '為何（表原因）':'為何，表原因' },
    '者': { '代詞，……的人':'代名詞，……的人', '助詞，句中表停頓':'助詞，用於句中，表示停頓' },
    '於': { '向':'向，表示趨向', '從、由':'從、由，表示所從', '對於':'對於，表示動作行為的對象',
            '比（引進比較對象）':'比，引進比較對象', '被（表被動）':'被，置於動詞之後，表示被動' },
    '其': { '那些（代詞）':'那些', '大概（推測語氣）':'大概，表示推測語氣', '他、他們（代詞）':'他' },
    '學者': { '古義：求學的人':'古義：學習的人', '今義：學問淵博而有成就的人':'今義：學問淵博而有所成就的人' }
  };
  var ZY = /[˙ㄅ-ㄯㆠ-ㆿ]+[ˊˇˋ]?/g;
  function wrapZhuyin(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) {
      if (n.parentElement && n.parentElement.closest('.v76-zy, rt, .tp-z, .zy-note')) continue;
      ZY.lastIndex = 0;
      if (ZY.test(n.nodeValue)) list.push(n);
    }
    list.forEach(function (t) {
      var frag = document.createDocumentFragment(), s = t.nodeValue, last = 0, m;
      ZY.lastIndex = 0;
      while ((m = ZY.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var sp = document.createElement('span'); sp.className = 'v76-zy'; sp.textContent = m[0]; frag.appendChild(sp);
        last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  function patchCard() {
    var ttl = document.getElementById('ss-ttl'), body = document.querySelector('#ss-anno-ov #ss-body');
    if (!ttl || !body) return;
    var key = (ttl.textContent.split('：')[1] || '').trim(), mp = MAP[key];
    if (mp) {
      body.querySelectorAll('.ss-given').forEach(function (e) { if (mp[e.textContent]) e.textContent = mp[e.textContent]; });
      body.querySelectorAll('.ss-c-yi .ss-rv').forEach(function (e) {
        var v = e.getAttribute('data-v');
        if (mp[v]) { e.setAttribute('data-v', mp[v]); if (e.classList.contains('open')) e.textContent = mp[v]; }
      });
    }
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.ss-zong')) setTimeout(patchCard, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function () { var r = _open.apply(this, arguments); patchCard(); return r; };
  }

  /* ── ⑤ 形音義內容（辨析頁、形音義互動卡、課文浮框字義）注音包成不換行 ── */
  var _v76render = wkRenderCurrent;
  wkRenderCurrent = function () {
    var r = _v76render.apply(this, arguments);
    try {
      document.querySelectorAll('#wk-slide-area .wks-charbian, #wkfs-body .wks-charbian, #wk-slide-area .wks-charquiz, #wkfs-body .wks-charquiz, #wk-slide-area .tp-gd, #wkfs-body .tp-gd').forEach(wrapZhuyin);
    } catch (e) {}
    return r;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/069_v77-bian-js.js ════ */
try {

(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ① 浮框（老師指示；PPT 第 110 張） ── */
  var FIX = [
    [3, 1, '{g:書|書本}', '{g:書|誦讀書本}'],
    [3, 1, '授{g:之|代名詞，他們}', '授{g:之|代名詞，他們，指童子}'],
    [3, 0, '}師焉，{n:20|', '}師{g:焉|（助）無義}，{n:20|']
  ];
  FIX.forEach(function (f) {
    try {
      var L = T.textPages[f[0]].lines[f[1]];
      var n = L.text.split(f[2]).length - 1;
      if (n !== 1) { console.warn('[v77] 浮框替換次數不符，略過：', f[2], n); return; }
      L.text = L.text.replace(f[2], function () { return f[3]; });
    } catch (e) { console.warn('[v77] 浮框替換失敗：', f[2], e); }
  });

  /* ── ② 「辨」連結：位置逐一對照 RAY PPT 第 66、79、97、136、149、163 張課文頁上的「辨」標記 ── */
  var BIAN = [
    { k:'學者', a:'古之學者必有師', w:'古之學者' },           /* 66 */
    { k:'者', a:'師者，所以', w:'師者' },                     /* 66 */
    { k:'庸', a:'夫庸知其年', w:'夫庸' },                     /* 79 */
    { k:'所以', a:'聖人之所以為聖', w:'聖人之所以' },         /* 97 */
    { k:'其', a:'其皆出於此乎', w:'其' },                     /* 97 */
    { k:'不齒／不恥', a:'君子不齒', w:'君子不齒' },           /* 136 */
    { k:'師', a:'弟子不必不如師，師不必', w:'弟子不必不如師' }, /* 149 */
    { k:'於', a:'請學於余', w:'請學於' },                     /* 163 */
    { k:'其', a:'余嘉其能行', w:'余嘉其' },                   /* 163 */
    { k:'貽', a:'以貽之', w:'以貽' }                          /* 163 */
  ];
  var SKIP = '.tp-gd, .tp-num, sup, .ss-zong, .v77-bian, rt';
  var ZYONLY = /^[\sˊˇˋ˙ㄅ-ㄯ]+$/;
  function textMap(line) {
    var w = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, null), n, s = '', map = [];
    while ((n = w.nextNode())) {
      var pe = n.parentElement;
      if (!pe || pe.offsetParent === null || pe.closest(SKIP) || ZYONLY.test(n.nodeValue)) continue;
      for (var i = 0; i < n.nodeValue.length; i++) map.push([n, i]);
      s += n.nodeValue;
    }
    return { s: s, map: map };
  }
  function jumpIdx(k) {
    for (var i = 0; i < wkSlides.length; i++) if (wkSlides[i].type === 'charbian' && wkSlides[i].first && wkSlides[i].name === k) return i;
    return -1;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var lines = area.querySelectorAll('.wks-textpage .tp-line');
    if (!lines.length) return;
    BIAN.forEach(function (c) {
      var idx = jumpIdx(c.k);
      if (idx < 0) return;
      lines.forEach(function (line) {
        if (line.querySelector('.v77-bian[data-a="' + c.a + '"]')) return;
        var tm = textMap(line), at = tm.s.indexOf(c.a);
        if (at < 0) return;
        var wi = c.a.indexOf(c.w);
        if (wi < 0) return;
        var end = tm.map[at + wi + c.w.length - 1];
        if (!end) return;
        var node = end[0], off = end[1] + 1;
        var b = document.createElement('span');
        b.className = 'v77-bian'; b.setAttribute('data-a', c.a); b.setAttribute('data-k', c.k);
        b.title = '字詞辨析：' + c.k;
        b.addEventListener('click', function (e) { e.stopPropagation(); e.preventDefault(); v68CbJump(e, idx); });
        /* 字在可點的字義／注釋元素末端時，連結放在該元素之後（不塞進浮框元素裡） */
        var host = node.parentElement.closest('.tp-g, .tp-n, .tp-p');
        var hostEnd = false;
        if (host) {
          var rest = off < node.nodeValue.length ? node.nodeValue.slice(off) : '';
          if (!rest.trim()) {
            var hm = textMap(host).map, last = hm[hm.length - 1];
            hostEnd = last && last[0] === node && last[1] === off - 1;
          }
        }
        if (host && hostEnd) host.parentNode.insertBefore(b, host.nextSibling);
        else {
          var after = off < node.nodeValue.length ? node.splitText(off) : node.nextSibling;
          node.parentNode.insertBefore(b, after);
        }
      });
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }
  var _v77render = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v77render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/071_v78-zong-js.js ════ */
try {

(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* 課文「總」框位置：RAY PPT「辨」標記的 10 處（v77 已逐張對照）＋原有「總」框（賤、之、第四段「者」由 v54 照舊放）。
     同一句若 v54 已有同字的「總」框，移到 PPT 位置，避免一句兩個。 */
  var POS = [
    { k:'學者', a:'古之學者必有師', w:'古之學者' },
    { k:'者', a:'師者，所以', w:'師者' },
    { k:'庸', a:'夫庸知其年', w:'夫庸' },
    { k:'所以', a:'聖人之所以為聖', w:'聖人之所以' },
    { k:'其', a:'其皆出於此乎', w:'其' },
    { k:'不恥不齒', a:'君子不齒', w:'君子不齒' },
    { k:'師', a:'弟子不必不如師，師不必', w:'弟子不必不如師' },
    { k:'於', a:'請學於余', w:'請學於' },
    { k:'其', a:'余嘉其能行', w:'余嘉其' },
    { k:'貽', a:'以貽之', w:'以貽' }
  ];
  var CBNAME = { '不恥不齒':'不齒／不恥' };   /* v54 的鍵 → 辨析頁名稱 */

  /* ── 課文注入「總」框 ── */
  var SKIP = '.tp-gd, .tp-num, sup, .ss-zong, .v77-bian, rt';
  var ZYONLY = /^[\sˊˇˋ˙ㄅ-ㄯ]+$/;
  function textMap(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, s = '', map = [];
    while ((n = w.nextNode())) {
      var pe = n.parentElement;
      if (!pe || pe.offsetParent === null || pe.closest(SKIP) || ZYONLY.test(n.nodeValue)) continue;
      for (var i = 0; i < n.nodeValue.length; i++) map.push([n, i]);
      s += n.nodeValue;
    }
    return { s: s, map: map };
  }
  function makeBox(k, a) {
    var b = document.createElement('span');
    b.className = 'ss-zong v78-z'; b.setAttribute('data-k', k); b.setAttribute('data-a', a);
    b.textContent = '總'; b.title = k + ' 字義總整理（點開）';
    return b;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var lines = area.querySelectorAll('.wks-textpage .tp-line');
    POS.forEach(function (c) {
      lines.forEach(function (line) {
        if (line.querySelector('.v78-z[data-a="' + c.a + '"]')) return;
        var tm = textMap(line), at = tm.s.indexOf(c.a);
        if (at < 0) return;
        var end = tm.map[at + c.a.indexOf(c.w) + c.w.length - 1];
        if (!end) return;
        /* 同一句 v54 已放的同字「總」框先拿掉（v54 的冪等檢查看到本框就不會再放） */
        line.querySelectorAll('.ss-zong:not(.v78-z)[data-k="' + c.k + '"]').forEach(function (z) { z.remove(); });
        var node = end[0], off = end[1] + 1, b = makeBox(c.k, c.a);
        var host = node.parentElement.closest('.tp-g, .tp-n, .tp-p'), hostEnd = false;
        if (host && !(off < node.nodeValue.length && node.nodeValue.slice(off).trim())) {
          var hm = textMap(host).map, last = hm[hm.length - 1];
          hostEnd = last && last[0] === node && last[1] === off - 1;
        }
        if (host && hostEnd) host.parentNode.insertBefore(b, host.nextSibling);
        else node.parentNode.insertBefore(b, off < node.nodeValue.length ? node.splitText(off) : node.nextSibling);
      });
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }
  var _v78render = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v78render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });

  /* ── 「總」字卡內容改取字詞辨析頁（v75 產生的表格；含延伸頁）；沒有辨析頁的字（賤）照舊 ── */
  function rowsOf(name) {
    var cb = (T.charBian || []).filter(function (c) { return c.name === name; })[0];
    if (!cb) return null;
    var rows = [];
    cb.pages.forEach(function (pg) {
      var ext = /延伸/.test(pg.sub || '');
      var box = document.createElement('div'); box.innerHTML = pg.body;
      var x = '', yin = '';
      box.querySelectorAll('table.v75-yb tr').forEach(function (tr) {
        var cx = tr.querySelector('.v75-x'), cy = tr.querySelector('.v75-yin'), yi = tr.querySelector('.v75-rv'), ex = tr.querySelector('.v75-e');
        if (!yi || !ex) return;
        if (cx) x = cx.textContent;
        if (cy) yin = cy.textContent;
        var exs = [];
        var parts = ex.querySelector('.v75-ex2') ? Array.prototype.map.call(ex.querySelectorAll('.v75-ex2 > div'), function (d) { return d.innerHTML; })
                                                 : ex.innerHTML.split(/<br\s*\/?>/);
        parts.forEach(function (h) { h = h.replace(/^\s*\d+\.\s*/, '').trim(); if (h) exs.push(h); });
        rows.push({ x: x, yin: pg.sub === '形辨' ? yin : '', def: yi.textContent, ex: exs, ext: ext });
      });
    });
    return rows;
  }
  function openRv(el) {
    if (el.classList.contains('open')) { el.classList.remove('open'); el.textContent = el.dataset.label; }
    else { el.classList.add('open'); el.textContent = el.dataset.v; }
  }
  function render(key) {
    var ov = document.getElementById('ss-anno-ov');
    if (!ov) return;
    var rows = rowsOf(CBNAME[key] || key);
    ov.classList.toggle('v78-card', !!rows);
    var tools = ov.querySelector('.ss-tools'), bar = tools && tools.querySelector('.v78-bar');
    if (tools && !bar) {
      bar = document.createElement('span'); bar.className = 'v78-bar';
      bar.innerHTML = '<button type="button" class="all">全部顯示</button><button type="button">全部隱藏</button>';
      bar.children[0].onclick = function () { ov.querySelectorAll('#ss-body .ss-rv:not(.open)').forEach(openRv); };
      bar.children[1].onclick = function () { ov.querySelectorAll('#ss-body .ss-rv.open').forEach(openRv); };
      tools.appendChild(bar);
    }
    if (!rows) {
      /* 沒有辨析頁的字（賤）：義也改成點選顯示，與其他字卡一致 */
      ov.querySelectorAll('#ss-body .ss-c-yi .ss-given').forEach(function (g) {
        var sp = document.createElement('span'); sp.className = 'ss-rv'; sp.dataset.label = '義'; sp.dataset.v = g.textContent; sp.textContent = '義';
        sp.addEventListener('click', function () { openRv(sp); });
        g.parentNode.replaceChild(sp, g);
      });
      return;
    }
    var tbl = ov.querySelector('#ss-body .ss-tbl');
    if (!tbl) return;
    var multi = rows.some(function (r) { return r.x !== rows[0].x; });
    tbl.innerHTML = rows.map(function (r, i) {
      var last = i === rows.length - 1 ? ' ss-last' : '';
      var first = i === 0 || rows[i - 1].x !== r.x;
      var num = '';
      if (multi && first) num = '<span class="v78-term"><span class="ss-term">' + r.x + '</span>' + (r.yin ? '<span class="ss-term">' + r.yin + '</span>' : '') + '</span>';
      if (r.ext && (i === 0 || !rows[i - 1].ext)) num += '<span class="v78-ext">延伸</span>';
      var exHtml = r.ex.map(function (e) { return '<li>' + e + '</li>'; }).join('');
      return '<div class="ss-c ss-c-num' + last + '">' + num + '</div>' +
        '<div class="ss-c ss-c-yi' + last + '"><span class="ss-rv" data-label="義" data-v="' + r.def.replace(/"/g, '&quot;') + '">義</span></div>' +
        '<div class="ss-c ss-c-ex' + last + '"><ol class="ss-exs' + (r.ex.length > 4 ? ' v78-2col' : '') + '">' + exHtml + '</ol></div>';
    }).join('');
    tbl.querySelectorAll('.ss-rv').forEach(function (el) { el.addEventListener('click', function () { openRv(el); }); });
    ov.querySelectorAll('#ss-body .ss-big .ss-rv').forEach(function (el) {
      if (!el.dataset.label) el.dataset.label = el.textContent;
      /* v54 資料「貽」的注音誤用國字「一」，改為注音符號「ㄧ」 */
      if (el.dataset.v && el.dataset.v.indexOf('一') >= 0) { el.dataset.v = el.dataset.v.replace(/一/g, 'ㄧ'); if (el.classList.contains('open')) el.textContent = el.dataset.v; }
    });
  }
  /* 點任何「總」框（含 v54 原有的）：開卡後在其他補丁之後改寫內容 */
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.ss-zong');
    if (!z) return;
    var key = z.getAttribute('data-k');
    if (z.classList.contains('v78-z')) { e.stopPropagation(); e.preventDefault(); window.ssOpenAnno(key); }
    setTimeout(function () { render(key); }, 0);
  }, true);
  if (typeof window.ssOpenAnno === 'function') {
    var _open = window.ssOpenAnno;
    window.ssOpenAnno = function (key) { var r = _open.apply(this, arguments); setTimeout(function () { render(key); }, 0); return r; };
  }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/073_v79-fix-js.js ════ */
try {

(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;

  /* ── ① 「於」辨析簡化（老師：太複雜）：只留用法 ── */
  var YU = [
    ['向，表示趨向', '向'],
    ['從、由，表示所從', '從、由'],
    ['對於，表示動作行為的對象', '對於'],
    ['比，引進比較對象', '比'],
    ['被，置於動詞之後，表示被動', '被']
  ];
  (T.charBian || []).forEach(function (c) {
    if (c.name !== '於') return;
    c.pages.forEach(function (p) {
      YU.forEach(function (r) {
        var a = '>' + r[0] + '</span>', n = p.body.split(a).length - 1;
        if (n === 1) p.body = p.body.replace(a, '>' + r[1] + '</span>');
        else console.warn('[v79] 於 辨析替換次數不符', r[0], n);
      });
    });
  });

  /* ── ② 「總」字卡：左欄字形跨列合併（同一字形的義列共用一格），底線只畫在字形群組結尾 ── */
  function spanTerms() {
    var tbl = document.querySelector('#ss-anno-ov.v78-card #ss-body .ss-tbl');
    /* 表格會被重畫（v78 開卡時畫兩次），以儲存格本身是否已處理判斷，不在 tbl 上做記號 */
    if (!tbl || !tbl.querySelector('.ss-c-num:not(.v79-span) .v78-term')) return;
    var cells = Array.prototype.slice.call(tbl.children), rows = [];
    for (var i = 0; i + 2 < cells.length; i += 3) rows.push(cells.slice(i, i + 3));
    var g = null;
    rows.forEach(function (r) {
      var num = r[0];
      if (num.querySelector('.v78-term')) { g = { cell: num, n: 1 }; num.classList.add('v79-span'); }
      else if (g && !num.textContent.trim()) { g.n++; num.remove(); }
      else g = null;
      if (g) {
        g.cell.style.gridRow = 'span ' + g.n;
        g.cell.classList.toggle('ss-last', r[1].classList.contains('ss-last'));
      }
    });
  }
  function watch() {
    var ov = document.getElementById('ss-anno-ov');
    if (!ov) return false;
    new MutationObserver(spanTerms).observe(ov, { childList: true, subtree: true });
    return true;
  }
  if (!watch()) {
    var t = new MutationObserver(function () { if (watch()) t.disconnect(); });
    t.observe(document.body, { childList: true });
  }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/075_v80-rhet-js.js ════ */
try {

(function () {
  var T = TEXTBOOK['師說'];
  if (!T) return;
  var K = T.keyRhetoric || [];
  var CUO = K.filter(function (r) { return r.name === '錯綜'; })[0];
  var HUI = K.filter(function (r) { return r.name === '回文'; })[0];
  if (!CUO || !HUI) return;

  /* ── 例句（全部取自既有 keyRhetoric 資料與 RAY PPT 第 115～120、150～151 張；說明句取自各類定義） ── */
  var TYPES = [
    { no:'(一)', name:'抽換詞面', def:'以同義的詞語取代形式整齊句子中的某些詞語。', cls:'v80-sm', ex:[
      { k:'syn', src:'惠王用張儀之計，拔三川之地，西并巴、蜀，北收上郡，南取漢中，包九夷，制鄢、郢，東據成皋之險，割膏腴之壤。（李斯〈諫逐客書〉）',
        toks:['惠王用張儀之計，',['拔'],'三川之地，西',['并'],'巴、蜀，北',['收'],'上郡，南',['取'],'漢中，',['包'],'九夷，',['制'],'鄢、郢，東',['據'],'成皋之險，',['割'],'膏腴之壤。'],
        res:'取得', note:'拔、并、收、取、包、制、據、割皆為「取得」之同義詞。' } ] },
    { no:'(二)', name:'交錯語次', def:'上下兩句語詞的次序，故意弄得參差不齊。', cls:'v80-mid', ex:[
      { k:'ro', src:'句讀之不知，惑之不解，或師焉，或不焉。（韓愈〈師說〉）', ck:[[1,'句讀之不知'],[3,'惑之不解'],[2,'或師焉'],[4,'或不焉']],
        note:'「句讀之不知」配「或師焉」（1‧2）；「惑之不解」配「或不焉」（3‧4）。作者刻意交錯成 1‧3‧2‧4，使語勢參差、避免呆板，這就是交蹉語次。' },
      { k:'ro', src:'惟江上之清風，與山間之明月，耳得之而為聲，目遇之而成色。（蘇軾〈赤壁賦〉）', ck:[[1,'惟江上之清風'],[3,'與山間之明月'],[2,'耳得之而為聲'],[4,'目遇之而成色']],
        note:'「江上之清風」配「耳得之而為聲」（1‧2，聽覺）；「山間之明月」配「目遇之而成色」（3‧4，視覺）。交錯成 1‧3‧2‧4，使句式錯落有致。' } ] },
    { no:'(三)', name:'伸縮文身', def:'把字數相等的句子，故意布置成字數不等，使長句短句交相錯雜。', cls:'v80-mid', ex:[
      { k:'len', src:'野芳發而幽香，佳木秀而繁陰，風霜高潔，水落而石出者，山間之四時也。（歐陽脩〈醉翁亭記〉）',
        rows:['野芳發而幽香','佳木秀而繁陰','風霜高潔','水落而石出者'], hi:[2], tail:'山間之四時也。' },
      { k:'len', src:'春天像一篇巨製的駢儷文，而夏天像一首絕句。（簡媜〈夏之絕句〉）',
        rows:['春天像一篇巨製的駢儷文','而夏天像一首絕句'], hi:[1], tail:'' } ] },
    { no:'(四)', name:'變化句式', def:'將肯定句與否定句、直述句與疑問句，穿插寫入。', cls:'v80-mid', ex:[
      { k:'pn', src:'婚後生活不是磚，不是石，不是泥，不是沙，而是容忍，是體貼，是寬恕，是犧牲。',
        segs:['婚後生活',['n','不是磚'],'，',['n','不是石'],'，',['n','不是泥'],'，',['n','不是沙'],'，',['p','而是容忍'],'，',['p','是體貼'],'，',['p','是寬恕'],'，',['p','是犧牲'],'。'] },
      { k:'pn', src:'那榆蔭下的一潭，不是清泉，是天上虹。（徐志摩〈再別康橋〉）',
        segs:['那榆蔭下的一潭，',['n','不是清泉'],'，',['p','是天上虹'],'。'] } ] }
  ];
  var POEM = '潮隨暗浪雪山傾，遠浦漁舟釣月明。橋對寺門松徑小，檻當泉眼石波清。迢迢綠樹江天曉，靄靄紅霞晚日晴。遙望四邊雲接水，雪峰千點數鷗輕。';
  var HUI_EX = [
    { k:'swap', src:'弟子不必不如師，師不必賢於弟子。（韓愈〈師說〉）', r1:[['A','弟子'],['','不必不如'],['B','師'],['','，']], r2:[['B','師'],['','不必賢於'],['A','弟子'],['','。']] },
    { k:'swap', src:'開車不喝酒，喝酒不開車', r1:[['A','開車'],['','不'],['B','喝酒'],['','，']], r2:[['B','喝酒'],['','不'],['A','開車']] },
    { k:'swap', src:'讀書不忘救國，救國不忘讀書', r1:[['A','讀書'],['','不忘'],['B','救國'],['','，']], r2:[['B','救國'],['','不忘'],['A','讀書']] },
    { k:'swap', src:'文章是案頭之山水，山水是地上之文章', r1:[['A','文章'],['','是案頭之'],['B','山水'],['','，']], r2:[['B','山水'],['','是地上之'],['A','文章']] },
    { k:'poem', src:'蘇軾〈題金山寺迴文本〉', text:POEM, cls:'v80-sm' }
  ];

  /* ── 資料：錯綜只留「定義＋四類名稱」頁；回文只留定義頁；v73 的回文動畫頁改由本版取代 ── */
  var cuoDef = (CUO.pages[0].body.match(/<div class="rt-def">[\s\S]*?<\/div>/) || [''])[0];
  CUO.pages = [{ sub:'定義與四種類型', body: cuoDef + '<div class="v80-types">' + TYPES.map(function (t, i) {
    return '<div class="v80-type" onclick="v80GoType(event,' + i + ')">' + t.no + ' ' + t.name + '</div>'; }).join('') + '</div>' }];
  HUI.pages = [HUI.pages[0]];
  try { if (window.V73_ANIMS && V73_ANIMS['師說']) delete V73_ANIMS['師說']['回文']; } catch (e) {}

  /* ── 投影片：錯綜定義頁後插四類頁；回文定義頁後插動畫頁（位移習作答案總覽的跳題索引） ── */
  function insertAfter(slides, name, add) {
    var at = -1;
    slides.forEach(function (s, i) { if (s.type === 'keyrhet' && s.name === name) at = i + 1; });
    if (at < 0) return;
    Array.prototype.splice.apply(slides, [at, 0].concat(add));
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += add.length; });
    });
  }
  var _v80parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _v80parse.apply(this, arguments);
    if (key !== '師說') return slides;
    insertAfter(slides, '錯綜', TYPES.map(function (t, i) { return { type:'v80rx', name:'錯綜', ti:i }; }));
    insertAfter(slides, '回文', [{ type:'v80rx', name:'回文', ti:-1 }]);
    return slides;
  };
  window.v80GoType = function (ev, i) {
    if (ev) ev.stopPropagation();
    for (var j = 0; j < wkSlides.length; j++) if (wkSlides[j].type === 'v80rx' && wkSlides[j].name === '錯綜' && wkSlides[j].ti === i) { wkGoto(j); return; }
  };

  /* ── 渲染 ── */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var NSTEP = { syn:2, ro:3, len:2, pn:3, swap:3, poem:2 };
  function exHTML(e) {
    var h = '';
    if (e.k === 'syn') {
      h = '<div class="v80-sy">' + e.toks.map(function (t) { return Array.isArray(t) ? '<span class="k kS">' + esc(t[0]) + '</span>' : esc(t); }).join('') + '</div>' +
        '<div class="v80-syn">' + e.toks.filter(Array.isArray).map(function (t) { return '<span class="chip">' + esc(t[0]) + '</span>'; }).join('') +
        '<span class="eq">＝</span><span class="res">' + esc(e.res) + '</span></div>';
    } else if (e.k === 'ro') {
      h = '<div class="v80-ro">' + e.ck.map(function (c) {
        return '<span class="ck g' + (c[0] <= 2 ? 1 : 2) + '" data-n="' + c[0] + '">' + esc(c[1]) + '<i>' + c[0] + '</i></span>'; }).join('') + '</div>';
    } else if (e.k === 'len') {
      h = '<div class="v80-len">' + e.rows.map(function (r, i) {
        return '<div class="ln' + (e.hi.indexOf(i) >= 0 ? ' hi' : '') + '">' + Array.from(r).map(function (c) { return '<span class="c">' + esc(c) + '</span>'; }).join('') +
          '<span class="cnt">' + Array.from(r).length + ' 字</span></div>'; }).join('') +
        (e.tail ? '<div class="ln tail">' + esc(e.tail) + '</div>' : '') + '</div>';
    } else if (e.k === 'pn') {
      h = '<div class="v80-pn">' + e.segs.map(function (s) {
        return Array.isArray(s) ? '<span class="seg ' + (s[0] === 'n' ? 'neg' : 'pos') + '">' + esc(s[1]) + '</span>' : esc(s); }).join('') + '</div>' +
        '<div class="v80-leg"><span class="ln">否定句</span><span class="lp">肯定句</span></div>';
    } else if (e.k === 'swap') {
      var row = function (r, c) { return '<div class="row ' + c + '">' + r.map(function (t) {
        return t[0] ? '<span class="k k' + t[0] + '" data-k="' + t[0] + '">' + esc(t[1]) + '</span>' : '<span class="' + (t[1].length > 1 ? 'mid' : '') + '">' + esc(t[1]) + '</span>';
      }).join('') + '</div>'; };
      h = '<div class="v73-hw">' + row(e.r1, 'r1') + row(e.r2, 'r2') + '</div>';
    } else if (e.k === 'poem') {
      var chars = Array.from(e.text.replace(/[，。]/g, ''));
      var lines = function (arr) { var out = []; for (var i = 0; i < arr.length; i += 7) out.push(arr.slice(i, i + 7).join('') + (i / 7 % 2 ? '。' : '，')); return out; };
      var fwd = lines(chars), rev = lines(chars.slice().reverse());
      var mark = function (L, first) { return L.map(function (l, i) {
        var s = esc(l);
        if (i === 0 && first) s = '<span class="ends">' + s.charAt(0) + '</span>' + s.slice(1);
        if (i === L.length - 1 && !first) s = s.slice(0, -2) + '<span class="ends">' + s.slice(-2, -1) + '</span>' + s.slice(-1);
        return s; }).join('<br>'); };
      h = '<div class="v80-poem"><div class="pc"><div class="h">順讀</div>' + mark(fwd, false) + '</div>' +
        '<div class="pc rev"><div class="h">由末字倒讀</div><div class="pc-t">' + mark(rev, true) + '</div></div></div>';
    }
    return '<div class="v73-src">' + esc(e.src) + '</div><div class="v73-stage">' + h + '<svg class="v73-svg"></svg></div>' +
      (e.note ? '<div class="v73-note">' + esc(e.note) + '</div>' : '');
  }
  function tabName(e, i) { return '例' + '一二三四五六'[i]; }
  function boxHTML(exs, cap, cls) {
    var tabs = exs.length > 1 ? '<div class="v73-tabs">' + exs.map(function (e, i) {
      return '<button class="v73-tab' + (i ? '' : ' on') + '" onclick="v80Show(this,' + i + ')">' + tabName(e, i) + '</button>'; }).join('') + '</div>' : '';
    /* 控制列放在上方（與例句分頁同一列），全螢幕時不會被下方換頁列遮住 */
    return '<div class="v73a ' + (cls || '') + '" data-ex="0" data-st="0"><div class="v80-top">' + tabs +
      '<div class="v73-ctrl"><button class="v73-btn" onclick="v80Step(this)">▶ 下一步</button>' +
      '<button class="v73-btn rst" onclick="v80Reset(this)">↻ 重來</button><span class="v73-tip"></span></div></div>' +
      exs.map(function (e, i) {
      return '<div class="v73-ex' + (i ? '' : ' cur') + ' ' + (e.cls || '') + '" data-k="' + e.k + '" data-n="' + NSTEP[e.k] + '">' + exHTML(e) + '</div>'; }).join('') +
      '<div class="v73-cap">' + esc(cap) + '</div></div>';
  }
  function slideHTML(s) {
    var name, sub, def, box;
    if (s.name === '錯綜') {
      var t = TYPES[s.ti];
      sub = t.no + ' ' + t.name; def = t.def;
      box = boxHTML(t.ex, '錯綜' + t.no + t.name + '：' + t.def, t.cls);
    } else {
      sub = '動畫（' + HUI_EX.length + ' 例）'; def = '上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復）。';
      box = boxHTML(HUI_EX, '回文：上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復），形成往復迴環的趣味。', 'v80-mid');
    }
    return '<div class="wk-slide wks-keyrhet v73-kr v73-anim-slide v80-rx">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">' + esc(s.name) + '</span><span class="wks-kr-sub">' + esc(sub) + '</span></div>' +
      '<div class="v80-tdef">' + esc(def) + '</div>' + box + '</div>';
  }
  var _v80render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'v80rx') return slideHTML(slide);
    return _v80render.apply(this, arguments);
  };

  /* ── 動畫控制 ── */
  function rel(el, base) { var x = 0, y = 0, n = el; while (n && n !== base) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x:x, y:y, w:el.offsetWidth, h:el.offsetHeight }; }
  function drawPath(svg, d, color) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color); svg.appendChild(p);
    var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; void p.getBoundingClientRect(); p.classList.add('v73-draw');
  }
  function words(ex) { return Array.prototype.map.call(ex.querySelectorAll('.r1 .k'), function (k) { return '「' + k.textContent + '」'; }).join('與'); }
  var TIPS = {
    syn: function (ex, st) { return ['① 找出換用的字', '② 意思相同，都是「' + ex.querySelector('.res').textContent + '」'][st - 1]; },
    ro: function (ex, st) { return ['① 標出原本的配對順序', '② 還原成整齊的配對：1‧2／3‧4', '③ 作者刻意交錯成 1‧3‧2‧4'][st - 1]; },
    len: function (ex, st) { return ['① 逐字排列', '② 字數不等，長短交錯'][st - 1]; },
    pn: function (ex, st) { return ['① 否定句', '② 肯定句', '③ 肯定句與否定句穿插寫入'][st - 1]; },
    swap: function (ex, st) { return ['① 找出關鍵詞：' + words(ex), '② 下句把兩個詞的位置對調', '③ 位置互換、循環相對'][st - 1]; },
    poem: function (ex, st) { return ['① 順讀全詩', '② 從最後一字倒著讀，也成一首詩'][st - 1]; }
  };
  function apply(ex, st) {
    var k = ex.dataset.k, stage = ex.querySelector('.v73-stage'), svg = ex.querySelector('.v73-svg');
    ex.classList.add('s' + st);
    if (k === 'syn') {
      if (st === 1) ex.querySelectorAll('.kS').forEach(function (x, i) { setTimeout(function () { x.classList.add('lit'); }, i * 220); });
      if (st === 2) { ex.querySelector('.v80-syn').classList.add('show'); var n = ex.querySelector('.v73-note'); if (n) n.classList.add('show'); }
    } else if (k === 'ro') {
      var ro = ex.querySelector('.v80-ro');
      if (st === 1) ro.classList.add('num');
      if (st === 2) {
        var cks = Array.prototype.slice.call(ro.querySelectorAll('.ck')), first = cks.map(function (c) { return c.getBoundingClientRect(); });
        cks.slice().sort(function (a, b) { return a.dataset.n - b.dataset.n; }).forEach(function (c, i) {
          ro.appendChild(c);
          if (i === 1) { var sp = document.createElement('span'); sp.className = 'sep'; sp.textContent = '／'; ro.appendChild(sp); }
        });
        cks.forEach(function (c, i) {
          var a = first[i], b = c.getBoundingClientRect();
          c.style.transition = 'none'; c.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
          void c.offsetWidth; c.style.transition = 'transform .9s cubic-bezier(.5,0,.3,1)'; c.style.transform = '';
        });
        ro.classList.add('grp');
      }
      if (st === 3) { var nt = ex.querySelector('.v73-note'); if (nt) nt.classList.add('show'); }
    } else if (k === 'len') {
      var ln = ex.querySelector('.v80-len');
      if (st === 1) ln.classList.add('box');
      if (st === 2) ln.classList.add('cnt-on');
    } else if (k === 'pn') {
      var pn = ex.querySelector('.v80-pn');
      if (st === 1) pn.classList.add('s-neg');
      if (st === 2) pn.classList.add('s-pos');
    } else if (k === 'swap') {
      if (st === 1) ex.querySelectorAll('.r1 .k').forEach(function (x) { x.classList.add('lit'); });
      if (st === 2) ex.querySelectorAll('.r2 .k').forEach(function (t) {
        var src = ex.querySelector('.r1 .k[data-k="' + t.dataset.k + '"]'), a = src.getBoundingClientRect(), b = t.getBoundingClientRect();
        t.classList.add('lit'); t.style.transition = 'none'; t.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
        void t.offsetWidth; t.style.transition = 'transform 1s cubic-bezier(.5,0,.3,1), background .4s, color .4s'; t.style.transform = '';
      });
      if (st === 3) ['A', 'B'].forEach(function (key) {
        var p = rel(ex.querySelector('.r1 .k[data-k="' + key + '"]'), stage), q = rel(ex.querySelector('.r2 .k[data-k="' + key + '"]'), stage);
        drawPath(svg, 'M' + (p.x + p.w / 2) + ' ' + (p.y + p.h) + ' L' + (q.x + q.w / 2) + ' ' + q.y, key === 'A' ? '#1f5fa8' : '#c0392b');
      });
    } else if (k === 'poem') {
      if (st === 2) ex.querySelector('.v80-poem').classList.add('show');
    }
  }
  function syncBtn(box) {
    var exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, n = +exs[ei].dataset.n, btn = box.querySelector('.v73-btn:not(.rst)');
    btn.disabled = false;
    btn.textContent = st < n ? '▶ 下一步' : (ei + 1 < exs.length ? '▶ 下一例' : '▶ 總結');
    if (box.querySelector('.v73-cap.show')) { btn.disabled = true; btn.textContent = '✓ 完成'; }
  }
  var SRC = {};
  function resetEx(ex) {
    var id = ex.dataset.rid; if (!id) { id = ex.dataset.rid = 'r' + Math.random().toString(36).slice(2); }
    if (!SRC[id]) SRC[id] = ex.innerHTML; else ex.innerHTML = SRC[id];
    ex.className = ex.className.replace(/\bs\d\b/g, '').replace(/\s+/g, ' ').trim();
    if (!/\bcur\b/.test(ex.className)) ex.className += ' cur';
  }
  function show(box, i) {
    box.querySelectorAll('.v73-ex').forEach(function (e, j) { e.classList.toggle('cur', j === i); });
    box.querySelectorAll('.v73-tab').forEach(function (t, j) { t.classList.toggle('on', j === i); });
    resetEx(box.querySelectorAll('.v73-ex')[i]);
    box.dataset.ex = i; box.dataset.st = 0;
    box.querySelector('.v73-cap').classList.remove('show'); box.querySelector('.v73-tip').textContent = '';
    syncBtn(box);
  }
  window.v80Show = function (el, i) { if (window.event) window.event.stopPropagation(); show(el.closest('.v73a'), i); };
  window.v80Reset = function (btn) { if (window.event) window.event.stopPropagation(); show(btn.closest('.v73a'), +btn.closest('.v73a').dataset.ex); };
  window.v80Step = function (btn) {
    if (window.event) window.event.stopPropagation();
    var box = btn.closest('.v73a'), exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, ex = exs[ei], n = +ex.dataset.n;
    if (!ex.dataset.rid) resetEx(ex);
    if (st >= n) {
      if (ei + 1 < exs.length) { show(box, ei + 1); return; }
      box.querySelector('.v73-cap').classList.add('show'); box.querySelector('.v73-tip').textContent = ''; syncBtn(box); return;
    }
    st++; box.dataset.st = st; apply(ex, st);
    box.querySelector('.v73-tip').textContent = TIPS[ex.dataset.k](ex, st) || '';
    syncBtn(box);
  };

  /* ── 導覽列：映襯、設問、轉品、頂針、類疊、引用 收成「修辭 ▾」（一般＋全螢幕） ── */
  var FOLD = ['映襯', '設問', '轉品', '頂針', '類疊', '引用'];
  function fold(boxId, btnCls, activeCls) {
    var box = document.getElementById(boxId);
    if (!box || typeof wkKey === 'undefined' || wkKey !== '師說' || box.querySelector('.v80-rh-toggle')) return;
    var btns = Array.prototype.filter.call(box.querySelectorAll('button.' + btnCls), function (b) {
      return FOLD.indexOf((b.textContent || '').replace(/^◆/, '').trim()) >= 0; });
    if (btns.length < 2) return;
    var tog = document.createElement('button'); tog.type = 'button'; tog.className = btnCls + ' v80-rh-toggle'; tog.textContent = '◆修辭 ▾';
    var grp = document.createElement('span'); grp.className = 'v80-rh-group';
    tog.onclick = function (e) { e.stopPropagation(); var o = grp.classList.toggle('open'); tog.textContent = o ? '◆修辭 ▴' : '◆修辭 ▾'; };
    box.insertBefore(tog, btns[0]); box.insertBefore(grp, btns[0]);
    btns.forEach(function (b) { grp.appendChild(b); });
  }
  function mark() {
    [['wk-sections', 'wk-sec-active'], ['wkfs-sections', 'active']].forEach(function (p) {
      var box = document.getElementById(p[0]), tog = box && box.querySelector('.v80-rh-toggle');
      if (tog) tog.classList.toggle(p[1], !!box.querySelector('.v80-rh-group .' + p[1]));
    });
  }
  var _v80show = showWenxue;
  showWenxue = function () { var r = _v80show.apply(this, arguments); fold('wk-sections', 'wk-sec-btn'); mark(); return r; };
  var _v80proj = wkOpenProj;
  wkOpenProj = function () { var r = _v80proj.apply(this, arguments); fold('wkfs-sections', 'wkfs-sec-btn'); mark(); return r; };
  var _v80cur = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v80cur.apply(this, arguments); try { mark(); } catch (e) {} return r; };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/076_v81-fold-js.js ════ */
try {

(function () {
  function foldYidong(boxId) {
    var box = document.getElementById(boxId);
    if (!box || typeof wkKey === 'undefined' || wkKey !== '師說') return;
    var grp = box.querySelector('.v80-rh-group');
    if (!grp) return;
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      if ((b.textContent || '').replace(/^◆/, '').trim() === '意動用法' && b.parentNode !== grp) grp.insertBefore(b, grp.firstChild);
    });
  }
  var _v81show = showWenxue;
  showWenxue = function () { var r = _v81show.apply(this, arguments); foldYidong('wk-sections'); return r; };
  var _v81proj = wkOpenProj;
  wkOpenProj = function () { var r = _v81proj.apply(this, arguments); foldYidong('wkfs-sections'); return r; };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/078_v82-progress-js.js ════ */
try {

(function () {
  'use strict';
  /* ── 課表資料（可編輯）：115-1，依老師提供之課表圖片逐格輸入，不自行更動 ──
     使用者在「班級進度 → 課表」改過的版本存於 localStorage 'tp_schedule_v1'，優先使用。 */
  var DEFAULT_SCHEDULE = {
    term: '115-1', termStart: '2026-09-01', termEnd: '2027-01-20',
    periods: [
      { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' },
      { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
      { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' },
      { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }
    ],
    slots: [
      { wd:1, p:1, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:1, p:2, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:1, p:3, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:1, p:5, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:2, p:5, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:2, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:3, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:3, p:4, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:4, p:1, cls:'建一孝', lesson:'', normal:true, note:'' },
      { wd:4, p:3, cls:'冷一孝', lesson:'', normal:true, note:'' },
      { wd:4, p:5, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:1, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:2, cls:'建一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:5, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:6, cls:'冷一忠', lesson:'', normal:true, note:'' },
      { wd:5, p:7, cls:'建一孝', lesson:'', normal:true, note:'' }
    ]
  };
  var K = { live:'tp_live_v1', hist:'tp_hist_v1', ovr:'tp_override_v1', sched:'tp_schedule_v1', prep:'tp_prep_v1', on:'tp_enabled_v1' };
  var PRE = 10, POST = 5;           /* 上課前 10 分鐘算下一節；下課後 5 分鐘內仍算同一節 */
  var WD = ['日','一','二','三','四','五','六'];
  var V = window.V82 = { restoring:false, exporting:false };

  /* ── 基本工具 ── */
  function get(k, def) { try { var s = localStorage.getItem(k); return s ? JSON.parse(s) : def; } catch (e) { return def; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function now() {
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  /* 測試用：V82.fakeNow('2026-09-30T09:15') 模擬時間（只存在此分頁 sessionStorage）；V82.fakeNow(null) 取消 */
  V.fakeNow = function (s) {
    try { if (!s) sessionStorage.removeItem('v82FakeNow'); else sessionStorage.setItem('v82FakeNow', JSON.stringify({ t: new Date(s).getTime(), set: Date.now() })); } catch (e) {}
    tick();
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function toMin(s) { var a = String(s).split(':'); return (+a[0]) * 60 + (+a[1]); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function clsList() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }

  function schedule() { var s = get(K.sched, null); return (s && s.periods && s.slots) ? s : DEFAULT_SCHEDULE; }
  function isPrep() { return get(K.prep, '') === ymd(now()); }
  /* v83：只有在本裝置按過「啟用自動記錄」才運作（localStorage 'tp_enabled_v1'='1'） */
  function isOn() { return get(K.on, '') === '1'; }
  function loadLive() { return get(K.live, null); }
  function saveLive(l) { put(K.live, l); }
  function loadHist() { var h = get(K.hist, []); return Array.isArray(h) ? h : []; }

  /* ── 判斷目前節次／班級 ── */
  function slotsAt(d) {
    var S = schedule(), date = ymd(d), wd = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    var tS = S.termStart || DEFAULT_SCHEDULE.termStart, tE = S.termEnd || DEFAULT_SCHEDULE.termEnd; /* v86：自訂課表沒填起訖時沿用預設 */
    if (tS && date < tS) return [];
    if (tE && date > tE) return [];
    var ovr = get(K.ovr, {});
    return S.periods.filter(function (P) { return m >= toMin(P.start) - PRE && m <= toMin(P.end) + POST; })
      .map(function (P) {
        var key = date + '|' + P.p;
        var sl = S.slots.filter(function (x) { return x.wd === wd && x.p === P.p && x.normal !== false; })[0] || null;
        var o = ovr[key] || null;
        return { key:key, date:date, weekday:wd, period:P.p, start:P.start, end:P.end,
          scheduled: sl ? sl.cls : '', cls: o ? o.cls : (sl ? sl.cls : ''), source: o ? 'manual' : 'schedule',
          lesson: (o && o.lesson) || (sl && sl.lesson) || '', inCore: m >= toMin(P.start) && m <= toMin(P.end) };
      });
  }
  function currentSlot(d) {
    var c = slotsAt(d || now());
    if (!c.length) return null;
    var live = loadLive();
    if (live) { var hit = c.filter(function (x) { return x.key === live.key && x.cls; })[0]; if (hit) return hit; }
    var withCls = c.filter(function (x) { return x.cls; });
    if (withCls.length) return withCls[withCls.length - 1];
    var core = c.filter(function (x) { return x.inCore; });
    return core[0] || c[c.length - 1];
  }
  V.currentSlot = function () { return currentSlot(); };

  /* ── 上課 session：即時暫存（tp_live_v1）＋下課結算（tp_hist_v1） ── */
  function newLive(cur, d) {
    return { v:1, id: cur.key + '|' + d.getTime().toString(36), key: cur.key, date: cur.date, weekday: cur.weekday,
      period: cur.period, startTime: cur.start, endTime: cur.end, classId: cur.cls, classSource: cur.source,
      scheduledClassId: cur.scheduled, actualStartTime: d.toISOString(), lastAt: d.toISOString(), lessonId: '', parts: {} };
  }
  /* v100：下課鐘響後（同一天、已過本節結束時間）不再自動記錄 */
  function afterBell(live) {
    var d = now(); if (!live || !live.endTime || ymd(d) !== live.date) return false;
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 >= toMin(live.endTime);
  }
  /* v100：可手動更新的對象＝已下課的本節 session，或今天下課 30 分鐘內的正式紀錄 */
  function manualTarget() {
    var live = loadLive(), d = now();
    if (live) return afterBell(live) ? { live: true, rec: live } : null;
    var t = ymd(d), m = d.getHours() * 60 + d.getMinutes();
    var h = loadHist().filter(function (r) { return r.date === t && r.endTime && m >= toMin(r.endTime) && m <= toMin(r.endTime) + 30; });
    h.sort(function (a, b) { return toMin(b.endTime) - toMin(a.endTime); });
    return h[0] ? { live: false, rec: h[0] } : null;
  }
  function finalize(live) {
    if (live && live.parts && Object.keys(live.parts).length && live.lessonId) {
      var main = live.parts[live.lessonId];
      var t0 = new Date(live.actualStartTime), t1 = new Date(live.lastAt);
      var rec = { v:1, id: live.id, date: live.date, weekday: live.weekday, period: live.period,
        classId: live.classId, classSource: live.classSource, scheduledClassId: live.scheduledClassId,
        lessonId: live.lessonId, startTime: live.startTime, endTime: live.endTime,
        actualStartTime: hm(t0), actualEndTime: hm(t1), duration: Math.max(0, Math.round((t1 - t0) / 60000)),
        startProgress: main.start, endProgress: main.last || main.max, maxProgress: main.max, lastPosition: main.last, parts: live.parts, manualAt: live.manualAt };
      var h = loadHist();
      if (!h.some(function (r) { return r.id === rec.id; })) { h.push(rec); put(K.hist, h); }
    }
    put(K.live, null);
  }
  function ensureLive() {
    if (!isOn()) return null;
    var d = now(), live = loadLive(), cur = currentSlot(d);
    if (live && (!cur || cur.key !== live.key)) { finalize(live); live = null; }
    if (!cur || !cur.cls || isPrep()) return live && cur && cur.key === live.key ? live : null;
    if (!live) { live = newLive(cur, d); saveLive(live); }
    else if (live.classId !== cur.cls || live.classSource !== cur.source) {
      live.classId = cur.cls; live.classSource = cur.source; saveLive(live);
    }
    return live;
  }
  function tick() { ensureLive(); renderChip(); }
  V.tick = tick;

  /* ── 進度定位：用既有課文結構（段落名＋段內句序），不用捲動或 DOM 順序 ── */
  function plain(t) {
    var s = String(t || ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/<[^>]*>/g, '').replace(/[‹›]/g, '').replace(/\s+/g, '');
  }
  function headOf(t) { return plain(t).slice(0, 8); }
  function firstOrd(k, seg) {
    var P = (TEXTBOOK[k] && TEXTBOOK[k].textPages) || [], n = 0;
    for (var i = 0; i < P.length; i++) { if (P[i].seg === seg) return n + 1; n += (P[i].lines || []).length; }
    return 0;
  }
  function sigBase(s) { return s.type + '|' + (s.kind || '') + '|' + (s.label || s.title || (s.L && s.L.sec) || ''); }
  function slideSig(slides, i) {
    var s = slides[i]; if (!s) return '';
    if (s.type === 'textpage' && s.page) return 'tp:' + s.page.seg;
    var b = sigBase(s), n = 0;
    for (var j = 0; j < i; j++) if (sigBase(slides[j]) === b) n++;
    return b + '#' + n;
  }
  function sectionLabel(i) {
    var sec = null;
    (wkSectionMap || []).forEach(function (s) { if (s.idx <= i) sec = s; });
    if (!sec) return '';
    var lb = String(sec.label || '').replace(/^[▶◉✎◆§▸\s]+/, '');
    return i > sec.idx ? lb + ' 第' + (i - sec.idx + 1) + '頁' : lb;
  }
  function pagePos() {
    if (typeof wkKey === 'undefined' || !wkKey || !wkSlides || !wkSlides[wkIdx]) return null;
    var s = wkSlides[wkIdx];
    if (s.type === 'cover') return null;
    var p = { k: wkKey, sid: slideSig(wkSlides, wkIdx), idx: wkIdx, lbl: sectionLabel(wkIdx) };
    if (s.type === 'textpage' && s.page) { p.seg = s.page.seg; p.lbl = s.page.seg; p.r = firstOrd(wkKey, s.page.seg); }
    return p;
  }
  function linePos(li) {
    var p = pagePos(); if (!p || !p.seg) return null;
    var L = (wkSlides[wkIdx].page.lines || [])[li]; if (!L) return null;
    p.li = li; p.ord = p.r + li; p.r = p.ord; p.head = headOf(L.text); p.lbl = '第' + p.ord + '句';
    return p;
  }
  function posText(p) { if (!p) return ''; return p.ord ? '第' + p.ord + '句' : (p.lbl || ''); }
  function rangeText(part) {
    var a = part.start, b = part.last || part.max;   /* v100：範圍＝起點 → 下課時停的位置 */
    if (a && b && a.ord && b.ord) return a.ord === b.ord ? '第' + a.ord + '句' : '第' + a.ord + '～' + b.ord + '句';
    var ta = posText(a), tb = posText(b);
    return ta === tb ? ta : ta + ' → ' + tb;
  }
  /* v100：下次從「下課時停的位置」繼續（老師 10/1：不小心點到後面段落會被推過去，改用最後位置；另可選最近三筆） */
  function resumePos(part) { return part.last || part.max; }
  V.posText = posText; V.rangeText = rangeText; V.resumePos = resumePos;

  var savedTimer = 0;
  function record(pos) {
    if (pos && !V.restoring) V.lastSeen = pos;   /* v100：記住目前位置，供「手動更新」使用 */
    if (!pos || V.restoring || isPrep()) return;
    var live = ensureLive(); if (!live) return;
    if (afterBell(live)) { renderChip(); return; }   /* v100：下課後不自動記錄 */
    var t = now().toISOString();
    var part = live.parts[pos.k];
    if (!part) part = live.parts[pos.k] = { start: pos, max: pos.r ? pos : null, last: pos, firstAt: t, lastAt: t };
    else {
      /* 剛翻到某段、尚未點句子就點了該段的句子 → 起點精確到這一句 */
      if (pos.li != null && part.start.li == null && part.start.sid === pos.sid && part.last.sid === pos.sid && part.last.li == null) part.start = pos;
      part.last = pos; part.lastAt = t;
      if (pos.r && (!part.max || !part.max.r || pos.r > part.max.r)) part.max = pos;
    }
    live.lessonId = pos.k; live.lastAt = t;
    saveLive(live);
    renderChip();
    var ok = document.getElementById('v82-chip-ok');
    if (ok) { ok.classList.add('on'); clearTimeout(savedTimer); savedTimer = setTimeout(function () { ok.classList.remove('on'); }, 1800); }
  }
  function onPage() {
    if (V.restoring) return;
    var p = pagePos(); if (!p) return;
    var live = loadLive(), part = live && live.parts && live.parts[p.k];
    if (part && part.last && part.last.sid === p.sid && part.last.li != null) return; /* 同頁重繪：保留句子層級進度 */
    record(p);
  }

  /* ── 恢復進度 ── */
  function findIdx(pos) {
    for (var i = 0; i < wkSlides.length; i++) if (slideSig(wkSlides, i) === pos.sid) return i;
    if (pos.seg) for (var j = 0; j < wkSlides.length; j++) if (wkSlides[j].type === 'textpage' && wkSlides[j].page.seg === pos.seg) return j;
    return Math.max(0, Math.min(pos.idx || 0, wkSlides.length - 1));
  }
  function fixLine(pos, idx) {
    var s = wkSlides[idx]; if (!s || s.type !== 'textpage' || pos.li == null) return pos.li;
    var lines = s.page.lines || [];
    if (!pos.head || (lines[pos.li] && headOf(lines[pos.li].text) === pos.head)) return pos.li;
    for (var i = 0; i < lines.length; i++) if (headOf(lines[i].text) === pos.head) return i;
    return Math.min(pos.li, lines.length - 1);
  }
  function restore(pos) {
    if (!pos || !TEXTBOOK[pos.k]) return false;
    V.restoring = true;
    var idx, li;
    try {
      if (wkKey !== pos.k) showWenxue(pos.k);
      idx = findIdx(pos); li = fixLine(pos, idx);
      wkGoto(idx);
    } finally { V.restoring = false; }
    setTimeout(function () {
      if (li == null) return;
      var root = (wkProjMode && document.getElementById('wkfs-body')) || document.getElementById('wk-slide-area');
      var ln = root && root.querySelector('.tp-line[data-li="' + li + '"]');
      if (ln) {
        ln.scrollIntoView({ block:'center' });
        ln.classList.add('v82-flash');
        setTimeout(function () { ln.classList.remove('v82-flash'); }, 1800);
      }
    }, 150);
    return true;
  }

  /* ── 班級進度查詢（正式紀錄＋本節即時 session，依 classId+lessonId 分開） ── */
  function entries(cls) {
    var out = [];
    loadHist().forEach(function (r) {
      if (r.classId !== cls) return;
      Object.keys(r.parts || {}).forEach(function (k) { out.push({ rec: r, k: k, part: r.parts[k], live: false }); });
    });
    var live = loadLive();
    if (live && live.classId === cls) Object.keys(live.parts || {}).forEach(function (k) { out.push({ rec: live, k: k, part: live.parts[k], live: true }); });
    out.sort(function (a, b) { return String(b.part.lastAt).localeCompare(String(a.part.lastAt)); });
    return out;
  }
  function lastFor(cls, lesson) {
    var e = entries(cls).filter(function (x) { return !lesson || x.k === lesson; });
    return e[0] || null;
  }
  V.lastFor = lastFor;
  /* v100：手動更新（晚下課時用）：把目前位置記到剛下課那一節 */
  V.manualUpdate = function () {
    var mt = manualTarget(), pos = V.lastSeen || pagePos();
    if (!mt) { alert('目前沒有剛下課的節次可以更新。'); return; }
    if (!pos) { alert('請先打開課文，點一下要記錄的那一句。'); return; }
    var r = mt.rec, t = now().toISOString();
    if (!confirm('把「' + r.classId + '・第' + r.period + '節」的上課進度更新為：\n' + pos.k + ' ' + posText(pos) + '？')) return;
    var part = r.parts[pos.k];
    if (!part) part = r.parts[pos.k] = { start: pos, max: pos.r ? pos : null, last: pos, firstAt: t, lastAt: t };
    else { part.last = pos; part.lastAt = t; if (pos.r && (!part.max || !part.max.r || pos.r > part.max.r)) part.max = pos; }
    r.manualAt = t;
    if (mt.live) { r.lessonId = pos.k; r.lastAt = t; saveLive(r); }
    else {
      if (r.lessonId !== pos.k) r.startProgress = part.start;
      r.lessonId = pos.k; r.endProgress = part.last; r.lastPosition = part.last; r.maxProgress = part.max; r.actualEndTime = hm(now());
      put(K.hist, loadHist().map(function (x) { return x.id === r.id ? r : x; }));
    }
    renderChip(); if (typeof clsRender === 'function') clsRender();
  };
  /* v100：最近三筆（同班同課）可選擇從哪一筆繼續 */
  function top3(cls, lesson) { return entries(cls).filter(function (x) { return x.k === lesson; }).slice(0, 3); }
  function closeMenu() { var m = document.getElementById('v100-rmenu'); if (m) m.remove(); }
  V.resumeEntry = function (cls, lesson, i) {
    var e = top3(cls, lesson)[i || 0]; if (!e) return;
    closeMenu();
    var panel = document.getElementById('cls-panel');
    if (panel && panel.classList.contains('open')) clsToggle();
    var p = resumePos(e.part);
    restore(p);
    record(p);
  };
  V.pickResume = function (cls, lesson, anchor) {
    var list = top3(cls, lesson);
    if (list.length <= 1) { V.resumeEntry(cls, lesson, 0); return; }
    closeMenu();
    var m = document.createElement('div'); m.id = 'v100-rmenu';
    m.innerHTML = '<div class="v100-rh">' + esc(cls) + '・' + esc(lesson.split('—')[0]) + '：從哪一次繼續？</div>' + list.map(function (e, i) {
      return '<button type="button" data-i="' + i + '">' + fmtDate(e.rec) + ' 第' + e.rec.period + '節 → ' + esc(posText(resumePos(e.part))) +
        (i === 0 ? '<small>最近一次</small>' : '') + (e.rec.manualAt ? '<small>手動更新</small>' : '') + '</button>';
    }).join('');
    m.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var b = ev.target.closest && ev.target.closest('button[data-i]'); if (b) V.resumeEntry(cls, lesson, +b.getAttribute('data-i'));
    });
    document.body.appendChild(m);
    var r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { left: 12, top: innerHeight - 40 };
    m.style.left = Math.max(8, Math.min(r.left, innerWidth - m.offsetWidth - 8)) + 'px';
    m.style.top = Math.max(8, r.top - m.offsetHeight - 6) + 'px';
    setTimeout(function () { document.addEventListener('click', closeMenu, { once: true }); }, 0);
  };
  V.resume = function (cls, lesson) {
    var e = lastFor(cls, lesson); if (!e) return;
    var panel = document.getElementById('cls-panel');
    if (panel && panel.classList.contains('open')) clsToggle();
    var p = resumePos(e.part);
    restore(p);
    record(p);
  };

  /* ── 小狀態列（投影全螢幕時隱藏） ── */
  var chipGo = null;
  function renderChip() {
    var chip = document.getElementById('v82-chip');
    if (!isOn()) { if (chip) chip.remove(); return; }
    if (!chip) {
      chip = document.createElement('div'); chip.id = 'v82-chip';
      chip.innerHTML = '<span class="v82-dot"></span><span id="v82-chip-t"></span><span id="v82-chip-ok">✓ 已自動保存</span>' +
        '<button type="button" class="v82-go" style="display:none">繼續上課 ▸</button>' +
        '<button type="button" class="v82-go v82-upd" style="display:none">手動更新</button>';
      chip.addEventListener('click', function () { V.openPanel(); });
      chip.querySelector('.v82-go').addEventListener('click', function (ev) {
        ev.stopPropagation(); if (chipGo) V.pickResume(chipGo.cls, chipGo.k, ev.currentTarget);
      });
      chip.querySelector('.v82-upd').addEventListener('click', function (ev) { ev.stopPropagation(); V.manualUpdate(); });
      document.body.appendChild(chip);
    }
    var t = document.getElementById('v82-chip-t'), btn = chip.querySelector('.v82-go'), cur = currentSlot(), live = loadLive();
    var cls = '', txt, go = null;
    if (isPrep()) { cls = 'prep'; txt = '備課模式（不記錄進度）'; }
    else if (!cur || !cur.cls) { var mt0 = manualTarget(); txt = mt0 ? mt0.rec.classId + '｜第' + mt0.rec.period + '節已下課' : '目前沒有排定課程'; }
    else {
      cls = 'live';
      var head = cur.cls + (cur.source === 'manual' ? '（調課）' : '') + '｜第' + cur.period + '節';
      if (live && live.key === cur.key && live.lessonId) txt = head + '｜' + live.lessonId + ' ' + posText(live.parts[live.lessonId].last) + (afterBell(live) ? '｜已下課' : '');
      else {
        var e = lastFor(cur.cls, cur.lesson);
        txt = head + (e ? '｜上次：' + e.k + ' ' + posText(resumePos(e.part)) : '');
        if (e) go = { cls: cur.cls, k: e.k };
      }
    }
    /* 內容沒變就不動 DOM，避免老師正要點按鈕時被重畫 */
    if (chip.className !== cls) chip.className = cls;
    if (t.textContent !== txt) t.textContent = txt;
    chipGo = go;
    var disp = go ? '' : 'none';
    if (btn.style.display !== disp) btn.style.display = disp;
    var ub = chip.querySelector('.v82-upd'), ud = (!isPrep() && manualTarget()) ? '' : 'none';
    if (ub && ub.style.display !== ud) ub.style.display = ud;
  }

  /* ── 班級進度面板：今日上課／調課／備課模式／課表／各班自動進度 ── */
  V.openPanel = function () {
    var cur = currentSlot();
    if (cur && cur.cls && typeof clsPick === 'function') clsCur = cur.cls;
    var panel = document.getElementById('cls-panel');
    if (panel && !panel.classList.contains('open')) clsToggle(); else if (typeof clsRender === 'function') clsRender();
  };
  V.enable = function () { put(K.on, '1'); tick(); if (typeof clsRender === 'function') clsRender(); };
  V.disable = function () {
    if (!confirm('停用後這台裝置不再自動記錄上課進度（已有的紀錄會保留，重新啟用即可看到）。確定停用？')) return;
    put(K.on, null); tick(); if (typeof clsRender === 'function') clsRender();
  };
  V.togglePrep = function () { put(K.prep, isPrep() ? null : ymd(now())); tick(); renderBox(); };
  V.setOverride = function (cls) {
    var cur = currentSlot(); if (!cur) return;
    var o = get(K.ovr, {});
    if (!cls) delete o[cur.key]; else o[cur.key] = { cls: cls, at: now().toISOString() };
    put(K.ovr, o);
    if (typeof clsCur !== 'undefined') clsCur = cls || cur.scheduled || clsCur;
    tick(); renderBox(); if (typeof clsRender === 'function') clsRender();
  };
  var schedOpen = false, schedEdit = false;
  V.toggleSched = function () { schedOpen = !schedOpen; renderBox(); };
  V.toggleSchedEdit = function () { schedEdit = !schedEdit; renderBox(); };
  V.setCell = function (wd, p, cls) {
    var S = JSON.parse(JSON.stringify(schedule()));
    S.slots = S.slots.filter(function (x) { return !(x.wd === wd && x.p === p); });
    if (cls) S.slots.push({ wd: wd, p: p, cls: cls, lesson: '', normal: true, note: '' });
    S.slots.sort(function (a, b) { return a.wd - b.wd || a.p - b.p; });
    put(K.sched, S); tick(); renderBox();
  };
  V.resetSched = function () { if (confirm('確定還原成預設課表？（調課紀錄與上課紀錄不受影響）')) { put(K.sched, null); tick(); renderBox(); } };

  function schedHTML(cur) {
    var S = schedule(), d = now();
    var h = '<table><tr><th>節</th>' + [1,2,3,4,5].map(function (w) { return '<th>' + WD[w] + '</th>'; }).join('') + '</tr>';
    S.periods.forEach(function (P) {
      h += '<tr><th>' + P.p + '<br><small>' + P.start + '</small></th>';
      [1,2,3,4,5].forEach(function (w) {
        var sl = S.slots.filter(function (x) { return x.wd === w && x.p === P.p; })[0];
        var isNow = cur && cur.weekday === w && cur.period === P.p && d.getDay() === w;
        var cell = sl ? esc(sl.cls) : '';
        if (schedEdit) cell = '<select onchange="V82.setCell(' + w + ',' + P.p + ',this.value)"><option value=""></option>' +
          clsList().map(function (c) { return '<option' + (sl && sl.cls === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>';
        h += '<td' + (isNow ? ' class="v82-now-cell"' : '') + '>' + cell + '</td>';
      });
      h += '</tr>';
    });
    return h + '</table>';
  }
  function renderBox() {
    var panel = document.getElementById('cls-panel'); if (!panel) return;
    var box = document.getElementById('v82-box');
    if (!box) {
      box = document.createElement('div'); box.id = 'v82-box';
      var head = panel.querySelector('.cls-head');
      panel.insertBefore(box, head ? head.nextSibling : panel.firstChild);
    }
    if (!isOn()) {
      box.innerHTML = '<div class="v82-row"><button type="button" onclick="V82.enable()">啟用自動記錄上課進度（本裝置）</button></div>' +
        '<div class="v82-sub">依課表自動判斷班級並記住教到哪一句。只影響這台裝置的這個瀏覽器；其他老師的裝置不受影響。</div>';
      return;
    }
    var cur = currentSlot(), prep = isPrep(), d = now();
    var st;
    if (!cur) st = '今天週' + WD[d.getDay()] + ' ' + hm(d) + '：目前沒有排定課程';
    else st = '週' + WD[cur.weekday] + ' 第' + cur.period + '節（' + cur.start + '～' + cur.end + '）：' +
      (cur.cls ? cur.cls + (cur.source === 'manual' ? '（調課，原課表：' + (cur.scheduled || '無') + '）' : '') : '課表無課');
    var sel = '';
    if (cur) {
      sel = '<label>本節改為 <select onchange="V82.setOverride(this.value)"><option value="">依課表（' + esc(cur.scheduled || '無課') + '）</option>' +
        clsList().map(function (c) { return '<option' + (cur.source === 'manual' && cur.cls === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>';
    }
    box.innerHTML = '<div class="v82-now">' + esc(st) + '</div>' +
      '<div class="v82-row">' + sel + (manualTarget() ? '<button type="button" onclick="V82.manualUpdate()">手動更新進度</button>' : '') +
      '<button type="button" class="' + (prep ? 'on' : '') + '" onclick="V82.togglePrep()">備課模式：' + (prep ? '開（今天不記錄）' : '關') + '</button>' +
      '<button type="button" onclick="V82.toggleSched()">' + (schedOpen ? '收起課表' : '課表') + '</button>' +
      '<button type="button" onclick="V82.disable()">本裝置停用</button></div>' +
      (cur ? '' : '<div class="v82-sub">非上課時間可正常使用網站，不會產生上課紀錄。</div>') +
      (schedOpen ? '<div id="v82-sched">' + schedHTML(cur) +
        '<div class="v82-row" style="margin-top:6px"><button type="button" onclick="V82.toggleSchedEdit()">' + (schedEdit ? '完成編輯' : '編輯課表') + '</button>' +
        '<button type="button" onclick="V82.resetSched()">還原預設課表</button></div>' +
        '<div class="v82-sub">「本節改為」只影響這一節（調課）；「編輯課表」會改變之後每週的課表。</div></div>' : '');
  }
  function fmtDate(r) { var a = String(r.date).split('-'); return (+a[1]) + '/' + (+a[2]) + '（' + WD[r.weekday] + '）'; }
  V.delRec = function (id) {
    if (!confirm('確定刪除這一筆自動上課紀錄？')) return;
    put(K.hist, loadHist().filter(function (r) { return r.id !== id; }));
    if (typeof clsRender === 'function') clsRender();
  };
  function renderClsAuto() {
    var panel = document.getElementById('cls-panel'); if (!panel || typeof clsCur === 'undefined') return;
    var el = document.getElementById('v82-cls-auto');
    if (!isOn()) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'v82-cls-auto';
      var tabs = document.getElementById('cls-tabs');
      if (tabs) tabs.parentNode.insertBefore(el, tabs.nextSibling); else panel.appendChild(el);
    }
    var ents = entries(clsCur), by = {}, order = [];
    ents.forEach(function (e) { if (!by[e.k]) { by[e.k] = []; order.push(e.k); } by[e.k].push(e); });
    var h = '<div class="v82-h">' + esc(clsCur) + '・自動上課進度</div>';
    if (!order.length) h += '<div class="v82-empty">尚無自動紀錄（上課時間開啟課文後會自動記錄）</div>';
    order.forEach(function (k) {
      var list = by[k], last = list[0];
      h += '<div class="v82-les"><div class="v82-les-h"><span>《' + esc(k) + '》</span>' +
        '<button type="button" onclick="V82.pickResume(' + esc(JSON.stringify(clsCur)) + ',' + esc(JSON.stringify(k)) + ',this)">繼續上課</button></div>' +
        '<div>最近一次：' + fmtDate(last.rec) + ' 第' + last.rec.period + '節　上到：' + esc(posText(resumePos(last.part))) +
        (last.live ? '<span class="v82-live">本節進行中</span>' : '') + '</div><ul>' +
        list.slice(0, 12).map(function (e, i) {
          return (i === 3 ? '</ul><details class="v100-older"><summary>更早的紀錄（' + (Math.min(list.length, 12) - 3) + '）</summary><ul>' : '') +
            '<li>' + fmtDate(e.rec) + ' 第' + e.rec.period + '節 → ' + esc(rangeText(e.part)) +
            (e.rec.manualAt ? '<span class="v82-tag">手動更新</span>' : '') +
            (i < 3 ? '<button type="button" class="v100-from" onclick="V82.resumeEntry(' + esc(JSON.stringify(clsCur)) + ',' + esc(JSON.stringify(k)) + ',' + i + ')">從這繼續</button>' : '') +
            (e.rec.classSource === 'manual' ? '<span class="v82-tag">調課</span>' : '') +
            (e.live ? '<span class="v82-live">進行中</span>' : '<button type="button" class="v82-del" onclick="V82.delRec(' + esc(JSON.stringify(e.rec.id)) + ')">✕</button>') + '</li>';
        }).join('') + '</ul>' + (list.length > 3 ? '</details>' : '') + '</div>';
    });
    el.innerHTML = h;
  }

  /* ── 掛勾（包裝既有函式，不改寫原本內容） ── */
  var _v82cur = wkRenderCurrent;
  wkRenderCurrent = function () { var r = _v82cur.apply(this, arguments); try { onPage(); } catch (e) {} return r; };
  var _v82open = wkOpenProj;
  wkOpenProj = function () { document.body.classList.add('v82-proj'); return _v82open.apply(this, arguments); };
  var _v82close = wkCloseProj;
  wkCloseProj = function () { var r = _v82close.apply(this, arguments); document.body.classList.remove('v82-proj'); return r; };
  var _v82render = clsRender;
  clsRender = function () { var r = _v82render.apply(this, arguments); try { renderBox(); renderClsAuto(); } catch (e) {} return r; };
  /* 備份：匯出時附帶 __v82（上課紀錄／調課／自訂課表）；匯入時合併紀錄，不覆蓋既有歷史 */
  var _v82load = clsLoad;
  clsLoad = function () {
    var d = _v82load.apply(this, arguments);
    if (V.exporting) d.__v82 = { hist: loadHist(), ovr: get(K.ovr, {}), sched: get(K.sched, null) };
    return d;
  };
  var _v82exp = clsExport;
  clsExport = function () { V.exporting = true; try { return _v82exp.apply(this, arguments); } finally { V.exporting = false; } };
  var _v82save = clsSave;
  clsSave = function (d) {
    if (d && d.__v82) {
      var x = d.__v82; delete d.__v82;
      var h = loadHist(), ids = {};
      h.forEach(function (r) { ids[r.id] = 1; });
      (x.hist || []).forEach(function (r) { if (r && r.id && !ids[r.id]) h.push(r); });
      put(K.hist, h);
      var o = get(K.ovr, {}); Object.keys(x.ovr || {}).forEach(function (k) { if (!o[k]) o[k] = x.ovr[k]; }); put(K.ovr, o);
      if (x.sched && !get(K.sched, null)) put(K.sched, x.sched);
    }
    return _v82save.apply(this, arguments);
  };

  /* 點課文句子（含修辭／句意／翻譯／註釋按鈕）＝教到這一句 */
  document.addEventListener('click', function (e) {
    var ln = e.target && e.target.closest ? e.target.closest('.tp-line') : null;
    if (!ln || !ln.closest('#wk-slide-area, #wkfs-body')) return;
    var s = wkSlides && wkSlides[wkIdx]; if (!s || s.type !== 'textpage') return;
    var li = parseInt(ln.getAttribute('data-li'), 10); if (isNaN(li)) return;
    record(linePos(li));
  }, true);

  function boot() {
    tick();
    if (!isOn()) return;
    /* Safari 關閉／重新整理後：本節 session 仍在 → 自動回到最後位置 */
    var live = loadLive(), cur = currentSlot();
    if (live && cur && cur.key === live.key && live.lessonId && !isPrep()) {
      var part = live.parts[live.lessonId];
      if (part && part.last) restore(part.last);
    }
  }
  window.addEventListener('load', function () { setTimeout(boot, 300); });
  setInterval(tick, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  window.addEventListener('pageshow', function () { tick(); });
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/080_v84-hwdone-js.js ════ */
try {

(function () {
  /* 課次依 source/115-1/高職/第一冊 教材檔名的 L01～L06；k＝TEXTBOOK 課名 */
  var LESSONS = [
    { no: 'L1', k: '身為魚販' },
    { no: 'L2', k: '世說新語選' },
    { no: 'L3', k: '師說' },
    { no: 'L4', k: '珍珠奶茶' },
    { no: 'L5', k: '臺灣最美麗的火車線', s: '火車線' },
    { no: 'L6', k: '論語選—子路曾皙冉有公西華侍坐', s: '侍坐' }
  ];
  var ITEMS = ['課後習題', '習作', 'A卷'];
  var STAGES = ['考試', '檢討'];
  /* V123 重要進度檢核：A卷多一格「訂正加分」（鍵 'A卷|訂正'）；課後習題／習作的「考試」格改叫「交作業」（鍵不變，舊紀錄照用） */
  var STG = { '課後習題': ['考試', '檢討'], '習作': ['考試', '檢討'], 'A卷': ['考試', '檢討', '訂正'] };
  function itLabel(it) { return it === '課後習題' ? '課本後習題' : it; }   /* 畫面名稱（基礎練習＋進階練習）；資料鍵仍是「課後習題」 */
  function stLabel(it, st) { return st === '考試' ? (it === 'A卷' ? '考試' : '交作業') : st === '訂正' ? '訂正加分' : st; }
  var K = { data: 'hw_done_v1', les: 'hw_done_lesson_v1', fold: 'hw_done_fold_v1' };
  var exporting = false;

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function les(k) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].k === k) return LESSONS[i]; return null; }
  function short(L) { return L.s || L.k; }
  function curLesson() {
    try { if (typeof wkKey !== 'undefined' && les(wkKey)) return wkKey; } catch (e) {}
    var k = get(K.les, ''); return les(k) ? k : LESSONS[2].k;
  }
  var picked = null;   /* 本次開啟面板時所選的課（未選＝跟著目前所在課文） */

  /* 資料：{ 課名: { 班級: { '習作|考試': 'YYYY-MM-DD' } } } */
  function toggle(lesson, cls, item, stage) {
    var d = get(K.data, {}), key = item + '|' + stage;
    var row = ((d[lesson] = d[lesson] || {})[cls] = d[lesson][cls] || {});
    if (row[key]) {
      if (!confirm('取消「' + cls + '・' + short(les(lesson)) + '・' + itLabel(item) + ' ' + stLabel(item, stage) + '」的完成紀錄（' + md(row[key]) + '）？')) return;
      delete row[key];
    } else row[key] = today();
    put(K.data, d);
    render();
  }

  function render() {
    var panel = document.getElementById('cls-panel'); if (!panel) return;
    var el = document.getElementById('v84-hw');
    if (!el) {
      el = document.createElement('div'); el.id = 'v84-hw';
      var tabs = document.getElementById('cls-tabs');
      panel.insertBefore(el, tabs || null);
      el.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button[data-v84], .v84-h');
        if (!b) return;
        if (b.classList.contains('v84-h')) { put(K.fold, !get(K.fold, false)); render(); return; }
        var a = b.getAttribute('data-v84').split('|');
        if (a[0] === 'L') { picked = a[1]; put(K.les, a[1]); render(); }
        else toggle(a[1], a[2], a[3], a[4]);
      });
    }
    var fold = get(K.fold, false);
    var lk = picked || curLesson(), L = les(lk), d = (get(K.data, {})[lk]) || {};
    var h = '<div class="v84-h"><span>重要進度檢核</span><i>' + (fold ? '展開 ▸' : '收起 ▾') + '</i></div>';
    if (!fold) {
      h += '<div class="v84-les">' + LESSONS.map(function (x) {
        return '<button type="button" data-v84="L|' + esc(x.k) + '"' + (x.k === lk ? ' class="on"' : '') + ' title="' + esc(x.k) + '"><b>' + x.no + '</b>' + esc(short(x)) + '</button>';
      }).join('') + '</div>';
      h += '<table><tr><th rowspan="2" style="width:58px">' + esc(L.no) + '</th>' +
        ITEMS.map(function (it) { return '<th colspan="' + STG[it].length + '" class="v84-g v84-gs">' + itLabel(it) + '</th>'; }).join('') + '</tr><tr>' +
        ITEMS.map(function (it) { return STG[it].map(function (st, j) { return '<th class="v84-sub' + (j ? '' : ' v84-gs') + '">' + stLabel(it, st) + '</th>'; }).join(''); }).join('') + '</tr>';
      classes().forEach(function (c) {
        var row = d[c] || {};
        h += '<tr><td class="v84-cls">' + esc(c) + '</td>' + ITEMS.map(function (it) {
          return STG[it].map(function (st, j) {
            var v = row[it + '|' + st];
            return '<td' + (j ? '' : ' class="v84-gs"') + '><button type="button" class="v84-c' + (j ? (st === '訂正' ? ' v84-fx' : ' v84-rv') : '') + (v ? ' done' : '') + '" data-v84="C|' +
              esc(lk) + '|' + esc(c) + '|' + it + '|' + st + '" title="' + esc(c + '・' + itLabel(it) + ' ' + stLabel(it, st)) + '">' +
              '<span class="v84-mk">' + (v ? '✓' : '○') + '</span>' + (v ? '<span class="v84-dt">' + md(v) + '</span>' : '') + '</button></td>';
          }).join('');
        }).join('') + '</tr>';
      });
      h += '</table><div class="v84-note">點一下＝完成（自動記今天日期）；再點一下可取消。日曆排的考試／檢討日期到了、成績系統登記了繳交／訂正加分，會自動打勾。</div>';
    }
    el.innerHTML = h;
  }

  /* 面板每次開啟時，預設跟著目前所在課文 */
  var _v84tog = clsToggle;
  clsToggle = function () { picked = null; return _v84tog.apply(this, arguments); };
  var _v84render = clsRender;
  clsRender = function () { var r = _v84render.apply(this, arguments); try { render(); } catch (e) {} return r; };

  /* 備份：匯出附帶 __v84hw；匯入時只補本機沒有的格子，不覆蓋既有紀錄 */
  var _v84load = clsLoad;
  clsLoad = function () {
    var d = _v84load.apply(this, arguments);
    if (exporting) d.__v84hw = get(K.data, {});
    return d;
  };
  var _v84exp = clsExport;
  clsExport = function () { exporting = true; try { return _v84exp.apply(this, arguments); } finally { exporting = false; } };
  var _v84save = clsSave;
  clsSave = function (d) {
    if (d && d.__v84hw) {
      var x = d.__v84hw, cur = get(K.data, {}); delete d.__v84hw;
      Object.keys(x || {}).forEach(function (l) {
        Object.keys(x[l] || {}).forEach(function (c) {
          Object.keys(x[l][c] || {}).forEach(function (k) {
            var r = ((cur[l] = cur[l] || {})[c] = cur[l][c] || {});
            if (!r[k]) r[k] = x[l][c][k];
          });
        });
      });
      put(K.data, cur);
    }
    return _v84save.apply(this, arguments);
  };

  window.V84HW = { data: function () { return get(K.data, {}); }, render: render, stages: STG, label: stLabel };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/081_v87-shishuo-tr-js.js ════ */
try {

/* v87：《師說》第四段「擇師而教之」語譯 教他 → 教他們（浮框 v76 已為「代名詞，他們」；老師 9/30 指示）。資料行不動，執行期精確替換，次數不符就略過並警告 */
(function () {
  var T = (typeof TEXTBOOK !== 'undefined') && TEXTBOOK['師說'];
  if (!T) return;
  var OLD = '就選擇老師來教他；', NEW = '就選擇老師來教他們；';
  try {
    var P = T.textPages[3], L = P.lines[0];
    [[L, 'tr'], [P, 'fan']].forEach(function (x) {
      var s = x[0][x[1]], n = s.split(OLD).length - 1;
      if (n !== 1) { console.warn('[v87] 語譯替換次數不符，略過：', x[1], n); return; }
      x[0][x[1]] = s.replace(OLD, NEW);
    });
  } catch (e) { console.warn('[v87] 語譯替換失敗', e); }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/083_v88-js.js ════ */
try {

(function () {
  /* ── ① 版號：之後每一版只改這一行 ── */
  window.APP_VERSION = 'V88';
  function badge() {
    if (document.getElementById('v88-ver')) return;
    var d = document.createElement('div'); d.id = 'v88-ver'; d.textContent = window.APP_VERSION; document.body.appendChild(d);
  }
  if (document.body) badge(); else document.addEventListener('DOMContentLoaded', badge);

  /* ── ② ③ 師說錯綜／回文 ── */
  var T = (typeof TEXTBOOK !== 'undefined') && TEXTBOOK['師說'];
  if (!T || typeof wkRenderSlideHTML !== 'function') return;

  /* 例句與 v80 相同（取自既有 keyRhetoric 資料＝RAY PPT）；交錯語次改依原句順序編號，配對 1‧3／2‧4，說明為老師 9/30 指定措辭 */
  var RO_HEAD = '原句的順序是①②③④，解釋時要改成①③、②④兩兩配對來讀；這種故意把語序錯開的寫法，就是「交錯語次」。';
  var TYPES = [
    { no:'(一)', name:'抽換詞面', def:'以同義的詞語取代形式整齊句子中的某些詞語。', cls:'v80-sm', ex:[
      { k:'syn', src:'惠王用張儀之計，拔三川之地，西并巴、蜀，北收上郡，南取漢中，包九夷，制鄢、郢，東據成皋之險，割膏腴之壤。（李斯〈諫逐客書〉）',
        toks:['惠王用張儀之計，',['拔'],'三川之地，西',['并'],'巴、蜀，北',['收'],'上郡，南',['取'],'漢中，',['包'],'九夷，',['制'],'鄢、郢，東',['據'],'成皋之險，',['割'],'膏腴之壤。'],
        res:'取得', note:['拔、并、收、取、包、制、據、割皆為「取得」之同義詞。'] } ] },
    { no:'(二)', name:'交錯語次', def:'上下兩句語詞的次序，故意弄得參差不齊。', cls:'v80-mid', ex:[
      { k:'ro', src:'句讀之不知，惑之不解，或師焉，或不焉。（韓愈〈師說〉）', ck:[[1,'句讀之不知'],[2,'惑之不解'],[3,'或師焉'],[4,'或不焉']],
        note:[RO_HEAD, '①句讀之不知，③或師焉：不懂句讀，有的人（指士大夫之子）會從師請教；', '②惑之不解，④或不焉：有疑惑解不開，有的人（指士大夫自身）卻不肯從師問學。'] },
      { k:'ro', src:'惟江上之清風，與山間之明月，耳得之而為聲，目遇之而成色。（蘇軾〈赤壁賦〉）', ck:[[1,'惟江上之清風'],[2,'與山間之明月'],[3,'耳得之而為聲'],[4,'目遇之而成色']],
        note:[RO_HEAD, '①惟江上之清風，③耳得之而為聲：耳朵聽到的（聽覺）；', '②與山間之明月，④目遇之而成色：眼睛看到的（視覺）。'] } ] },
    { no:'(三)', name:'伸縮文身', def:'把字數相等的句子，故意布置成字數不等，使長句短句交相錯雜。', cls:'v80-mid', ex:[
      { k:'len', src:'野芳發而幽香，佳木秀而繁陰，風霜高潔，水落而石出者，山間之四時也。（歐陽脩〈醉翁亭記〉）',
        rows:['野芳發而幽香','佳木秀而繁陰','風霜高潔','水落而石出者'], hi:[2], tail:'山間之四時也' },
      { k:'len', src:'春天像一篇巨製的駢儷文，而夏天像一首絕句。（簡媜〈夏之絕句〉）',
        rows:['春天像一篇巨製的駢儷文','而夏天像一首絕句'], hi:[1], tail:'' } ] },
    { no:'(四)', name:'變化句式', def:'將肯定句與否定句、直述句與疑問句，穿插寫入。', cls:'v80-mid', ex:[
      { k:'pn', src:'婚後生活不是磚，不是石，不是泥，不是沙，而是容忍，是體貼，是寬恕，是犧牲。',
        segs:['婚後生活',['n','不是磚'],'，',['n','不是石'],'，',['n','不是泥'],'，',['n','不是沙'],'，',['p','而是容忍'],'，',['p','是體貼'],'，',['p','是寬恕'],'，',['p','是犧牲'],'。'] },
      { k:'pn', src:'那榆蔭下的一潭，不是清泉，是天上虹。（徐志摩〈再別康橋〉）',
        segs:['那榆蔭下的一潭，',['n','不是清泉'],'，',['p','是天上虹'],'。'] } ] }
  ];
  var POEM = '潮隨暗浪雪山傾，遠浦漁舟釣月明。橋對寺門松徑小，檻當泉眼石波清。迢迢綠樹江天曉，靄靄紅霞晚日晴。遙望四邊雲接水，雪峰千點數鷗輕。';
  var HUI_EX = [
    { k:'swap', src:'弟子不必不如師，師不必賢於弟子。（韓愈〈師說〉）', r1:[['A','弟子'],['','不必不如'],['B','師'],['','，']], r2:[['B','師'],['','不必賢於'],['A','弟子'],['','。']] },
    { k:'swap', src:'開車不喝酒，喝酒不開車', r1:[['A','開車'],['','不'],['B','喝酒'],['','，']], r2:[['B','喝酒'],['','不'],['A','開車']] },
    { k:'swap', src:'讀書不忘救國，救國不忘讀書', r1:[['A','讀書'],['','不忘'],['B','救國'],['','，']], r2:[['B','救國'],['','不忘'],['A','讀書']] },
    { k:'swap', src:'文章是案頭之山水，山水是地上之文章', r1:[['A','文章'],['','是案頭之'],['B','山水'],['','，']], r2:[['B','山水'],['','是地上之'],['A','文章']] },
    { k:'poem', src:'蘇軾〈題金山寺迴文本〉', text:POEM, cls:'v80-sm' }
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* 出處：src 末尾「（作者〈篇名〉）」 */
  function by(src) { var m = src.match(/（([^（）]*〈[^〉]*〉)）$/); return m ? m[1] : ''; }
  function body(src) { return src.replace(/（[^（）]*〈[^〉]*〉）$/, ''); }
  /* 依序在句中找出各段，中間的標點另成 .pu；對不上就回傳 null（改用 v80 原版） */
  function cut(text, parts) {
    var out = [], at = 0;
    for (var i = 0; i < parts.length; i++) {
      var j = text.indexOf(parts[i], at); if (j < 0) return null;
      if (j > at) out.push(['pu', text.slice(at, j)]);
      out.push(['pc', parts[i], i]); at = j + parts[i].length;
    }
    if (at < text.length) out.push(['pu', text.slice(at)]);
    return out;
  }
  function chars(s, cls) { return Array.from(s).map(function (c) { return '<span class="' + cls + '">' + esc(c) + '</span>'; }).join(''); }

  var NSTEP = { syn:2, ro:3, len:2, pn:3, swap:3, poem:2 };
  function exHTML(e) {
    var h = '', b = by(e.src), txt = body(e.src), byInline = '';
    var byBlock = b ? '<div class="v88-byline"><span class="v88-by" style="margin-left:0">（' + esc(b) + '）</span></div>' : '';
    var srcRow = '';
    if (e.k === 'syn') {
      h = '<div class="v80-sy">' + e.toks.map(function (t) { return Array.isArray(t) ? '<span class="k kS">' + esc(t[0]) + '</span>' : esc(t); }).join('') + byInline + '</div>' +
        '<div class="v80-syn">' + e.toks.filter(Array.isArray).map(function (t) { return '<span class="chip">' + esc(t[0]) + '</span>'; }).join('') +
        '<span class="eq">＝</span><span class="res">' + esc(e.res) + '</span></div>';
    } else if (e.k === 'ro') {
      var sg = cut(txt, e.ck.map(function (c) { return c[1]; })); if (!sg) return null;
      h = '<div class="v80-ro v88-inl">' + sg.map(function (s) {
        if (s[0] === 'pu') return '<span class="pu">' + esc(s[1]) + '</span>';
        var n = e.ck[s[2]][0];
        return '<span class="ck pc g' + (n % 2 ? 1 : 2) + '" data-n="' + n + '">' + esc(s[1]) + '<i>' + n + '</i></span>';
      }).join('') + '</div>';
    } else if (e.k === 'len') {
      var parts = e.rows.concat(e.tail ? [e.tail] : []), sl = cut(txt, parts); if (!sl) return null;
      h = '<div class="v80-len v88-inl">' + sl.map(function (s) {
        if (s[0] === 'pu') return '<span class="pu">' + esc(s[1]) + '</span>';
        var i = s[2];
        if (i >= e.rows.length) return '<div class="ln tail">' + chars(s[1], 'tc') + '</div>';
        return '<div class="ln' + (e.hi.indexOf(i) >= 0 ? ' hi' : '') + '">' + chars(s[1], 'c') + '<span class="cnt">' + Array.from(s[1]).length + ' 字</span></div>';
      }).join('') + '</div>';
    } else if (e.k === 'pn') {
      h = '<div class="v80-pn">' + e.segs.map(function (s) {
        return Array.isArray(s) ? '<span class="seg ' + (s[0] === 'n' ? 'neg' : 'pos') + '">' + esc(s[1]) + '</span>' : esc(s); }).join('') + byInline + '</div>' +
        '<div class="v80-leg"><span class="ln">否定句</span><span class="lp">肯定句</span></div>';
    } else if (e.k === 'swap') {
      var row = function (r, c) { return '<div class="row ' + c + '">' + r.map(function (t) {
        return t[0] ? '<span class="k k' + t[0] + '" data-k="' + t[0] + '">' + esc(t[1]) + '</span>' : '<span class="' + (t[1].length > 1 ? 'mid' : 'pm') + '">' + esc(t[1]) + '</span>';
      }).join('') + '</div>'; };
      h = '<div class="v73-hw v88-inl">' + row(e.r1, 'r1') + row(e.r2, 'r2') + '</div>';
    } else if (e.k === 'poem') {
      srcRow = '<div class="v73-src">' + esc(e.src) + '</div>';
      var cs = Array.from(e.text.replace(/[，。]/g, ''));
      var lines = function (arr) { var out = []; for (var i = 0; i < arr.length; i += 7) out.push(arr.slice(i, i + 7).join('') + (i / 7 % 2 ? '。' : '，')); return out; };
      var fwd = lines(cs), rev = lines(cs.slice().reverse());
      var mark = function (L, first) { return L.map(function (l, i) {
        var s = esc(l);
        if (i === 0 && first) s = '<span class="ends">' + s.charAt(0) + '</span>' + s.slice(1);
        if (i === L.length - 1 && !first) s = s.slice(0, -2) + '<span class="ends">' + s.slice(-2, -1) + '</span>' + s.slice(-1);
        return s; }).join('<br>'); };
      h = '<div class="v80-poem"><div class="pc"><div class="h">順讀</div>' + mark(fwd, false) + '</div>' +
        '<div class="pc rev"><div class="h">由末字倒讀</div><div class="pc-t">' + mark(rev, true) + '</div></div></div>';
    }
    return srcRow + byBlock + '<div class="v73-stage">' + h + '<svg class="v73-svg"></svg></div>' +
      (e.note ? '<div class="v73-note">' + e.note.map(esc).join('<br>') + '</div>' : '');
  }
  function tabName(e, i) { return '例' + '一二三四五六'[i]; }
  function boxHTML(exs, cap, cls) {
    var parts = exs.map(exHTML);
    if (parts.some(function (p) { return p === null; })) return null;
    var tabs = exs.length > 1 ? '<div class="v73-tabs">' + exs.map(function (e, i) {
      return '<button class="v73-tab' + (i ? '' : ' on') + '" onclick="v88Show(this,' + i + ')">' + tabName(e, i) + '</button>'; }).join('') + '</div>' : '';
    return '<div class="v73a v88 ' + (cls || '') + '" data-ex="0" data-st="0"><div class="v80-top">' + tabs +
      '<div class="v73-ctrl"><button class="v73-btn" onclick="v88Step(this)">▶ 下一步</button>' +
      '<button class="v73-btn rst" onclick="v88Reset(this)">↻ 重來</button><span class="v73-tip"></span></div></div>' +
      exs.map(function (e, i) {
        return '<div class="v73-ex' + (i ? '' : ' cur') + ' ' + (e.cls || '') + '" data-k="' + e.k + '" data-n="' + NSTEP[e.k] + '">' + parts[i] + '</div>'; }).join('') +
      '<div class="v73-cap">' + esc(cap) + '</div></div>';
  }
  function slideHTML(s) {
    var sub, def, box;
    if (s.name === '錯綜') {
      var t = TYPES[s.ti]; if (!t) return null;
      sub = t.no + ' ' + t.name; def = t.def;
      box = boxHTML(t.ex, '錯綜' + t.no + t.name + '：' + t.def, t.cls);
    } else {
      sub = '動畫（' + HUI_EX.length + ' 例）'; def = '上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復）。';
      box = boxHTML(HUI_EX, '回文：上下兩句，詞彙大多相同，而詞序恰好相反（或循環往復），形成往復迴環的趣味。', 'v80-mid');
    }
    if (box === null) return null;
    return '<div class="wk-slide wks-keyrhet v73-kr v73-anim-slide v80-rx v88-rx">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">' + esc(s.name) + '</span><span class="wks-kr-sub">' + esc(sub) + '</span></div>' +
      '<div class="v80-tdef">' + esc(def) + '</div>' + box + '</div>';
  }
  var _v88render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'v80rx') {
      try { var h = slideHTML(slide); if (h) return h; } catch (e) { console.warn('[v88] 錯綜／回文改版失敗，改用 v80', e); }
    }
    return _v88render.apply(this, arguments);
  };

  /* ── 動畫 ── */
  function rel(el, base) { var x = 0, y = 0, n = el; while (n && n !== base) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x:x, y:y, w:el.offsetWidth, h:el.offsetHeight }; }
  function drawPath(svg, d, color) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('stroke', color); svg.appendChild(p);
    var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; void p.getBoundingClientRect(); p.classList.add('v73-draw');
  }
  /* FLIP：els 從舊位置飛到新位置（change() 負責改版面） */
  function fly(els, change, dur) {
    els = Array.prototype.slice.call(els);
    var first = els.map(function (c) { return c.getBoundingClientRect(); });
    change();
    els.forEach(function (c, i) {
      var a = first[i], b = c.getBoundingClientRect();
      c.style.transition = 'none'; c.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
    });
    void document.body.offsetWidth;
    els.forEach(function (c, i) {
      c.style.transition = 'transform ' + (dur || .9) + 's cubic-bezier(.5,0,.3,1) ' + (i * Math.min(0.02, 0.3 / els.length)) + 's'; c.style.transform = '';
    });
  }
  function words(ex) { return Array.prototype.map.call(ex.querySelectorAll('.r1 .k'), function (k) { return '「' + k.textContent + '」'; }).join('與'); }
  var TIPS = {
    syn: function (ex, st) { return ['① 找出換用的字', '② 意思相同，都是「' + ex.querySelector('.res').textContent + '」'][st - 1]; },
    ro: function (ex, st) { return ['① 原句依序標上 ①②③④', '② 依意思兩兩配對：①③／②④', '③ 原句寫成 ①②③④，要照 ①③、②④ 解釋——這就是交錯語次'][st - 1]; },
    len: function (ex, st) { return ['① 把句子拆開，逐字排列', '② 字數不等，長短交錯'][st - 1]; },
    pn: function (ex, st) { return ['① 否定句', '② 肯定句', '③ 肯定句與否定句穿插寫入'][st - 1]; },
    swap: function (ex, st) { return ['① 拆成上下兩句，找出關鍵詞：' + words(ex), '② 下句把兩個詞的位置對調', '③ 位置互換、循環相對'][st - 1]; },
    poem: function (ex, st) { return ['① 順讀全詩', '② 從最後一字倒著讀，也成一首詩'][st - 1]; }
  };
  function apply(ex, st) {
    var k = ex.dataset.k, stage = ex.querySelector('.v73-stage'), svg = ex.querySelector('.v73-svg');
    ex.classList.add('s' + st);
    if (k === 'syn') {
      if (st === 1) ex.querySelectorAll('.kS').forEach(function (x, i) { setTimeout(function () { x.classList.add('lit'); }, i * 220); });
      if (st === 2) { ex.querySelector('.v80-syn').classList.add('show'); var n = ex.querySelector('.v73-note'); if (n) n.classList.add('show'); }
    } else if (k === 'ro') {
      var ro = ex.querySelector('.v80-ro');
      if (st === 1) { fly(ro.querySelectorAll('.ck'), function () { ro.classList.remove('v88-inl'); }); setTimeout(function () { ro.classList.add('num'); }, 500); }
      if (st === 2) {
        var cks = Array.prototype.slice.call(ro.querySelectorAll('.ck'));
        fly(cks, function () {
          var ord = [1, 3, 2, 4];
          ord.forEach(function (n, i) {
            var c = cks.filter(function (x) { return +x.dataset.n === n; })[0]; ro.appendChild(c);
            if (i === 1) { var sp = document.createElement('span'); sp.className = 'sep'; sp.textContent = '／'; ro.appendChild(sp); }
          });
        });
        ro.classList.add('grp');
      }
      if (st === 3) { var nt = ex.querySelector('.v73-note'); if (nt) nt.classList.add('show'); }
    } else if (k === 'len') {
      var ln = ex.querySelector('.v80-len');
      if (st === 1) fly(ln.querySelectorAll('.c, .tc'), function () { ln.classList.remove('v88-inl'); ln.classList.add('box'); }, .8);
      if (st === 2) ln.classList.add('cnt-on');
    } else if (k === 'pn') {
      var pn = ex.querySelector('.v80-pn');
      if (st === 1) pn.classList.add('s-neg');
      if (st === 2) pn.classList.add('s-pos');
    } else if (k === 'swap') {
      var hw = ex.querySelector('.v73-hw');
      if (st === 1) {
        fly(hw.querySelectorAll('.row > span'), function () { hw.classList.remove('v88-inl'); }, .8);
        setTimeout(function () { ex.querySelectorAll('.r1 .k').forEach(function (x) { x.classList.add('lit'); }); }, 700);
      }
      if (st === 2) ex.querySelectorAll('.r2 .k').forEach(function (t) {
        var src = ex.querySelector('.r1 .k[data-k="' + t.dataset.k + '"]'), a = src.getBoundingClientRect(), b = t.getBoundingClientRect();
        t.classList.add('lit'); t.style.transition = 'none'; t.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
        void t.offsetWidth; t.style.transition = 'transform 1s cubic-bezier(.5,0,.3,1), background .4s, color .4s'; t.style.transform = '';
      });
      if (st === 3) ['A', 'B'].forEach(function (key) {
        var p = rel(ex.querySelector('.r1 .k[data-k="' + key + '"]'), stage), q = rel(ex.querySelector('.r2 .k[data-k="' + key + '"]'), stage);
        drawPath(svg, 'M' + (p.x + p.w / 2) + ' ' + (p.y + p.h) + ' L' + (q.x + q.w / 2) + ' ' + q.y, key === 'A' ? '#1f5fa8' : '#c0392b');
      });
    } else if (k === 'poem') {
      if (st === 2) ex.querySelector('.v80-poem').classList.add('show');
    }
  }
  function syncBtn(box) {
    var exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, n = +exs[ei].dataset.n, btn = box.querySelector('.v73-btn:not(.rst)');
    btn.disabled = false;
    btn.textContent = st < n ? '▶ 下一步' : (ei + 1 < exs.length ? '▶ 下一例' : '▶ 總結');
    if (box.querySelector('.v73-cap.show')) { btn.disabled = true; btn.textContent = '✓ 完成'; }
  }
  var SRC = {};
  function resetEx(ex) {
    var id = ex.dataset.rid; if (!id) { id = ex.dataset.rid = 'r' + Math.random().toString(36).slice(2); }
    if (!SRC[id]) SRC[id] = ex.innerHTML; else ex.innerHTML = SRC[id];
    ex.className = ex.className.replace(/\bs\d\b/g, '').replace(/\s+/g, ' ').trim();
    if (!/\bcur\b/.test(ex.className)) ex.className += ' cur';
  }
  function show(box, i) {
    box.querySelectorAll('.v73-ex').forEach(function (e, j) { e.classList.toggle('cur', j === i); });
    box.querySelectorAll('.v73-tab').forEach(function (t, j) { t.classList.toggle('on', j === i); });
    resetEx(box.querySelectorAll('.v73-ex')[i]);
    box.dataset.ex = i; box.dataset.st = 0;
    box.querySelector('.v73-cap').classList.remove('show'); box.querySelector('.v73-tip').textContent = '';
    syncBtn(box);
  }
  window.v88Show = function (el, i) { if (window.event) window.event.stopPropagation(); show(el.closest('.v73a'), i); };
  window.v88Reset = function (btn) { if (window.event) window.event.stopPropagation(); show(btn.closest('.v73a'), +btn.closest('.v73a').dataset.ex); };
  window.v88Step = function (btn) {
    if (window.event) window.event.stopPropagation();
    var box = btn.closest('.v73a'), exs = box.querySelectorAll('.v73-ex'), ei = +box.dataset.ex, st = +box.dataset.st, ex = exs[ei], n = +ex.dataset.n;
    if (!ex.dataset.rid) resetEx(ex);
    if (st >= n) {
      if (ei + 1 < exs.length) { show(box, ei + 1); return; }
      box.querySelector('.v73-cap').classList.add('show'); box.querySelector('.v73-tip').textContent = ''; syncBtn(box); return;
    }
    st++; box.dataset.st = st; apply(ex, st);
    box.querySelector('.v73-tip').textContent = TIPS[ex.dataset.k](ex, st) || '';
    syncBtn(box);
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/086_v90-img-js.js ════ */
try {

/* v90：課文頁補充圖片。只在畫面上插入圖片元素，不動 TEXTBOOK 資料。
   圖片：data/115-1/高職/第一冊/<課>/img/補圖_*.jpg（由 scripts/v90_build.py 以 base64 嵌入 V90_IMG）。
   PLAN[課名][seg] = { banner:{i,c}, after:{ 句序li: [ {i,c,big} ] 或 {t:組名, items:[{i,c}]} } } */
(function () {
  window.APP_VERSION = 'V90';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var IMG = (function () { var B = /整理版_v\d+\.html$/.test(decodeURIComponent(location.pathname)) ? '上傳/' : ''; var P = {"九芎": "img/火車線/九芎.jpg", "光復糖廠": "img/火車線/光復糖廠.jpg", "冬候鳥群": "img/火車線/冬候鳥群.jpg", "吉安壽豐車票": "img/火車線/吉安壽豐車票.jpg", "吉安稻田": "img/火車線/吉安稻田.jpg", "吉安車站": "img/火車線/吉安車站.jpg", "四色牌": "img/火車線/四色牌.jpg", "夜鷹": "img/火車線/夜鷹.jpg", "太陽麻": "img/火車線/太陽麻.jpg", "木瓜溪橋火車": "img/火車線/木瓜溪橋火車.jpg", "棕背伯勞": "img/火車線/棕背伯勞.jpg", "永保安康車票": "img/火車線/永保安康車票.jpg", "泛舟": "img/火車線/泛舟.jpg", "烏頭翁": "img/火車線/烏頭翁.jpg", "環頸雉": "img/火車線/環頸雉.jpg", "甘蔗田": "img/火車線/甘蔗田.jpg", "田菁": "img/火車線/田菁.jpg", "白頭錦鴝": "img/火車線/白頭錦鴝.jpg", "臺灣野兔": "img/火車線/臺灣野兔.jpg", "苦楝": "img/火車線/苦楝.jpg", "虎爪豆": "img/火車線/虎爪豆.jpg", "賞鯨": "img/火車線/賞鯨.jpg", "路線圖_花蓮壽豐": "img/火車線/路線圖_花蓮壽豐.jpg", "軋日機": "img/火車線/軋日機.jpg", "金針花海": "img/火車線/金針花海.jpg"}; for (var k in P) P[k] = B + P[k]; return P; })();
  var PLAN = {
    '臺灣最美麗的火車線': {
      '第1部分': {
        after: {
          2: { natural: true, items: [{ i: '軋日機', c: '軋日機' }, { i: '永保安康車票', c: '永康→保安 硬紙車票' }, { i: '四色牌', c: '四色牌' }] }
        }
      },
      '第2部分': {
        after: {
          2: [{ i: '路線圖_花蓮壽豐', c: '花東線：花蓮—吉安—志學—平和—壽豐' }],
          6: { natural: true, items: [{ i: '吉安壽豐車票', c: '吉安→壽豐（15 元）' }, { i: '永保安康車票', c: '永康→保安' }] }
        }
      },
      '第3部分': {
        after: {
          0: [{ i: '吉安車站', c: '吉安車站' }],
          1: { banner: { i: '吉安稻田', c: '吉安的稻田', pos: 'center 52%' } }
        }
      },
      '第5部分': {
        after: {
          0: { t: '一般遊客的花蓮', items: [{ i: '賞鯨', c: '賞鯨' }, { i: '光復糖廠', c: '光復糖廠' }, { i: '泛舟', c: '秀姑巒溪泛舟' }] },
          1: { t: '作者的花蓮', items: [{ i: '苦楝', c: '苦楝' }, { i: '九芎', c: '九芎' }] }
        }
      },
      '第6部分': {
        after: {
          0: { contain: true, items: [{ i: '環頸雉', c: '環頸雉' }, { i: '白頭錦鴝', c: '白頭錦鴝' }, { i: '棕背伯勞', c: '棕背伯勞' }, { i: '夜鷹', c: '夜鷹' }, { i: '烏頭翁', c: '烏頭翁' }] },
          1: [{ i: '臺灣野兔', c: '臺灣野兔' }],
          2: [{ i: '冬候鳥群', c: '成群的冬候鳥', big: true }]
        }
      },
      '第4部分': {
        banner: { i: '金針花海', c: '金針花海' },
        after: {
          1: [{ i: '甘蔗田', c: '甘蔗田' }],
          2: { t: '肥料植物', items: [{ i: '虎爪豆', c: '虎爪豆' }, { i: '太陽麻', c: '太陽麻' }, { i: '田菁', c: '田菁' }] },
          3: [{ i: '木瓜溪橋火車', c: '火車過木瓜溪', big: true }]
        }
      }
    }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function imgTag(it) { return '<img class="v90-zoom" src="' + IMG[it.i] + '" alt="' + esc(it.c) + '" data-cap="' + esc(it.c) + '">'; }
  function banner(it) {
    var b = document.createElement('div');
    b.className = 'v90-banner v90-zoom';
    b.style.backgroundImage = 'url(' + IMG[it.i] + ')';
    if (it.pos) b.style.backgroundPosition = it.pos;
    b.setAttribute('data-src', IMG[it.i]);
    b.setAttribute('data-cap', it.c);
    b.title = it.c;
    return b;
  }
  function build(spec) {
    var d = document.createElement('div');
    if (spec.banner) {
      d.className = 'v90-block';
      if (IMG[spec.banner.i]) d.appendChild(banner(spec.banner));
    } else if (Array.isArray(spec)) {
      d.className = 'v90-block';
      d.innerHTML = spec.filter(function (it) { return IMG[it.i]; }).map(function (it) {
        return '<div class="v90-fig' + (it.big ? ' v90-big' : '') + '">' + imgTag(it) + '<div class="v90-cap">' + esc(it.c) + '</div></div>';
      }).join('');
    } else {
      d.className = 'v90-block v90-group' + (spec.contain ? ' v90-contain' : '') + (spec.natural ? ' v90-natural' : '');
      d.innerHTML = (spec.t ? '<div class="v90-gtitle">' + esc(spec.t) + '</div>' : '') + '<div class="v90-grow">' +
        spec.items.filter(function (it) { return IMG[it.i]; }).map(function (it) {
          return '<figure>' + imgTag(it) + '<div class="v90-cap">' + esc(it.c) + '</div></figure>';
        }).join('') + '</div>';
    }
    return d;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || !PLAN[wkKey]) return;
    var s = wkSlides && wkSlides[wkIdx];
    if (!s || s.type !== 'textpage' || !s.page) return;
    var plan = PLAN[wkKey][s.page.seg];
    if (!plan) return;
    var body = area.querySelector('.wks-textpage .tp-body');
    if (!body || body.getAttribute('data-v90')) return;
    body.setAttribute('data-v90', s.page.seg);
    if (plan.banner && IMG[plan.banner.i]) body.insertBefore(banner(plan.banner), body.firstChild);
    Object.keys(plan.after || {}).forEach(function (li) {
      var line = body.querySelector('.tp-line[data-li="' + li + '"]');
      if (line) line.insertAdjacentElement('afterend', build(plan.after[li]));
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }

  /* 點圖放大（燈箱掛在 body，z-index 高於全螢幕投影 9550） */
  function closeLb() { var lb = document.getElementById('v90-lb'); if (lb) lb.remove(); }
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.v90-zoom');
    if (!z) return;
    e.stopPropagation();
    closeLb();
    var lb = document.createElement('div');
    lb.id = 'v90-lb';
    var src = z.getAttribute('data-src') || z.getAttribute('src');
    lb.innerHTML = '<img src="' + src + '" alt=""><div>' + esc(z.getAttribute('data-cap') || '') + '</div>';
    lb.addEventListener('click', function (ev) { ev.stopPropagation(); closeLb(); });
    document.body.appendChild(lb);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('v90-lb')) { e.stopPropagation(); closeLb(); }
  }, true);

  var _v90render = wkRenderCurrent;
  wkRenderCurrent = function () { closeLb(); var r = _v90render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });
  run();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/088_v91-rhet-js.js ════ */
try {

/* v91：修辭呈現改版（說明見 v91-rhet-css）
   - 只加不刪：不改課文資料行、不改主程式函式本體；包一層 tpRecolor／tpLayerToggle，
     原函式照常執行後再做 v91 的處理（兩者定義在主程式，檔內無其他覆寫；本 addon 為目前實際生效的外層）。
   - 框線比對仍靠 tp-rq 引句資料，所以 B 只是把引句「藏起來」，資料不動。
   - 先只套用 V91_RHET_KEYS 內的課（老師：先做《師說》），確認後再加其他課。 */
(function () {
  window.APP_VERSION = 'V91';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  window.V91_RHET_KEYS = ['師說'];
  function enabled() {
    return typeof wkKey !== 'undefined' && window.V91_RHET_KEYS.indexOf(wkKey) >= 0;
  }

  /* ── 資料修正（執行期精確搬移，比照 v87；資料行不動）──
     《師說》第五段「轉品：不恥相師」原掛在 lines[1]，但引句在 lines[0]，因此從未框到 → 移到 lines[0] */
  (function fixShishuo() {
    try {
      if (typeof TEXTBOOK === 'undefined' || !TEXTBOOK['師說']) return;
      var P = (TEXTBOOK['師說'].textPages || [])[4];
      if (!P || !P.lines || P.lines.length < 2) { console.warn('v91: 師說第五段結構不符，略過'); return; }
      var from = P.lines[1].rhet || [], to = P.lines[0];
      var hit = [];
      from.forEach(function (r, i) { if (r[0] === '轉品' && /不恥相<b class='rq-hi'>師<\/b>/.test(r[1])) hit.push(i); });
      var already = (to.rhet || []).some(function (r) { return r[0] === '轉品' && /不恥相/.test(r[1]); });
      if (hit.length !== 1 || already || String(to.text || JSON.stringify(to)).indexOf('不恥相') < 0) {
        console.warn('v91: 不恥相師 搬移條件不符（hit=' + hit.length + '），略過'); return;
      }
      to.rhet = (to.rhet || []).concat([from[hit[0]]]);
      from.splice(hit[0], 1);
    } catch (e) { console.warn('v91: fixShishuo', e); }
  })();

  /* B：藏引句與其後的「──」 */
  function stripQuote(item) {
    if (item.getAttribute('data-v91')) return;
    item.setAttribute('data-v91', '1');
    var rq = item.querySelector(':scope > .tp-rq');
    if (!rq) return;
    rq.classList.add('v91-rq-hide');
    var n = rq.nextSibling;
    if (n && n.nodeType === 3 && n.nodeValue.indexOf('──') === 0) n.nodeValue = n.nodeValue.slice(2);
  }

  /* 標籤文字：修辭名稱；轉品另從說明取出詞性變化，如「轉品（名→動）」 */
  function labelText(item) {
    var b = item.querySelector(':scope > b');
    var name = b ? b.textContent.trim() : '';
    if (/^轉品$/.test(name)) {
      var m = item.textContent.match(/[（(]\s*([^（()）→]{1,2})\s*[）)][^→]*→\s*[（(]\s*([^（()）→]{1,2})\s*[）)]/);
      if (m) return name + '（' + m[1] + '→' + m[2] + '）';
    }
    return name;
  }

  function segsOf(text, id) {
    return Array.prototype.filter.call(text.querySelectorAll('.tp-seg[data-layers]'), function (s) {
      return s.getAttribute('data-layers').split(' ').indexOf(id) >= 0;
    });
  }

  /* 同頁相鄰行的「同一條修辭」（如第五段映襯掛在兩行）：記為雙胞胎，開關連動、下方框只列一次 */
  function markTwins(slide) {
    var seen = {};
    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var items = line.querySelectorAll('.tp-box-r .tp-rhet[data-lid]');
      var twins = 0;
      items.forEach(function (it) {
        var key = it.textContent;
        if (seen[key]) { it.classList.add('v91-twin'); it.setAttribute('data-v91-of', seen[key]); twins++; }
        else seen[key] = it.getAttribute('data-lid');
      });
      line.classList.toggle('v91-twin-only', items.length > 0 && twins === items.length);
    });
  }
  function isTwinGroup(slide, id) {
    return !!slide.querySelector('.tp-rhet[data-v91-of="' + id + '"]') ||
           !!slide.querySelector('.tp-rhet.v91-twin[data-lid="' + id + '"]');
  }

  /* 藍色字義：同頁依出現順序深（v91-ga）淺（v91-gb）交錯；浮框可能已移到 body（_tpPopup），
     所以類別直接加在浮框元素上；連接線顏色由主程式讀浮框框線色，會自動跟著 */
  function glossAlt(slide) {
    var k = 0;
    slide.querySelectorAll('.tp-text .tp-g, .tp-text .tp-z:not(.tp-z-inline), .tp-text .tp-p.tp-p-blue').forEach(function (g) {
      var pop = g._tpPopup || g.querySelector(':scope > .tp-gd, :scope > .tp-zd, :scope > .tp-pd');
      if (!pop) return;
      var c = (k++ % 2) ? 'v91-gb' : 'v91-ga';
      [g, pop].forEach(function (e) {
        if (!e.classList.contains(c)) { e.classList.remove('v91-ga', 'v91-gb'); e.classList.add(c); }
      });
    });
  }

  function clearText(text) {
    text.querySelectorAll(':scope > .v91-lab, :scope > .v91-frame').forEach(function (e) { e.remove(); });
    text.classList.remove('v91-lab-on', 'v91-rel');
  }

  function syncSlide(slide) {
    var on = enabled();
    var order = window.tpLayerOrder || [];
    slide.querySelectorAll('.tp-seg.v91-wseg').forEach(function (s) { s.classList.remove('v91-wseg'); });
    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var text = line.querySelector(':scope > .tp-text');
      if (text) clearText(text);
    });
    if (!on) return;
    glossAlt(slide);
    slide.querySelectorAll('.tp-box-r .tp-rhet').forEach(stripQuote);
    markTwins(slide);

    /* 整句型：引句沒有標重點字（錯綜、回文、設問…），或跨行的同一條修辭 */
    var whole = {};
    slide.querySelectorAll('.tp-box-r .tp-rhet[data-lid]').forEach(function (it) {
      var id = it.getAttribute('data-lid');
      var rq = it.querySelector(':scope > .tp-rq');
      if ((rq && !rq.querySelector('.rq-hi')) || isTwinGroup(slide, id)) whole[id] = 1;
    });

    /* 整句型勝出的片段不再各自畫框，改由外框統一畫 */
    slide.querySelectorAll('.tp-seg.tp-seg-rhet[data-layers]').forEach(function (s) {
      var ids = s.getAttribute('data-layers').split(' '), win = null, rank = -1;
      ids.forEach(function (id) { var k = order.indexOf(id); if (k > rank) { rank = k; win = id; } });
      if (win && whole[win]) s.classList.add('v91-wseg');
    });

    slide.querySelectorAll('.tp-line').forEach(function (line) {
      var text = line.querySelector(':scope > .tp-text');
      if (!text) return;
      var labs = [], frames = [], ents = [];
      line.querySelectorAll('.tp-box-r .tp-rhet[data-lid]').forEach(function (it) {
        var id = it.getAttribute('data-lid');
        if (order.indexOf(id) < 0) return;
        var segs = segsOf(text, id);
        if (segs.length) ents.push({ it: it, id: id, segs: segs });
      });
      if (!ents.length) return;
      /* 先把行高設好（有標籤才拉高），再量位置，否則外框會停在拉高前的位置 */
      text.classList.add('v91-rel');
      if (ents.some(function (e) { return !e.it.classList.contains('v91-twin'); })) text.classList.add('v91-lab-on');
      var base = text.getBoundingClientRect();
      ents.forEach(function (e) {
        var it = e.it, id = e.id, segs = e.segs;
        if (!it.classList.contains('v91-twin')) labs.push({ seg: segs[0], txt: labelText(it) });
        if (whole[id]) {
          /* 每一橫列取所有片段的聯集，畫一個外框 */
          var rows = {};
          segs.forEach(function (s) {
            Array.prototype.forEach.call(s.getClientRects(), function (r) {
              if (!r.width) return;
              var k = Math.round(r.top);
              var o = rows[k] || (rows[k] = { l: r.left, r: r.right, t: r.top, b: r.bottom });
              o.l = Math.min(o.l, r.left); o.r = Math.max(o.r, r.right);
              o.t = Math.min(o.t, r.top); o.b = Math.max(o.b, r.bottom);
            });
          });
          Object.keys(rows).forEach(function (k) { frames.push(rows[k]); });
        }
      });
      /* 外框：被其他外框包在裡面的較貼字，外層的往外多撐一些 */
      function inside(g, f) {
        return g !== f && Math.abs(g.t - f.t) < 4 && g.l >= f.l - 1 && g.r <= f.r + 1 && (g.r - g.l) < (f.r - f.l);
      }
      frames.forEach(function (f) {
        var depth = 0, outer = 0;
        frames.forEach(function (g) {
          if (inside(g, f)) depth++;
          if (inside(f, g)) outer++;
        });
        var pad = 3 + 4 * depth;
        var el = document.createElement('div');
        el.className = 'v91-frame' + (outer % 2 ? ' v91-light' : '');
        el.style.left = (f.l - base.left - pad) + 'px';
        el.style.top = (f.t - base.top - pad) + 'px';
        el.style.width = (f.r - f.l + pad * 2) + 'px';
        el.style.height = (f.b - f.t + pad * 2) + 'px';
        text.appendChild(el);
      });
      if (!labs.length) return;
      labs.forEach(function (l) {
        var r = l.seg.getClientRects()[0] || l.seg.getBoundingClientRect();
        var el = document.createElement('span');
        el.className = 'v91-lab';
        el.textContent = l.txt;
        el.style.top = (r.top - base.top - 9) + 'px';
        text.appendChild(el);
        l.el = el; l.x = r.left - base.left; l.row = Math.round(r.top); l.w = el.getBoundingClientRect().width;
      });
      /* 同一行的標籤不重疊：依序往右推；超出右緣則往左收 */
      labs.sort(function (a, b) { return a.row - b.row || a.x - b.x; });
      var prevRow = null, prevRight = -1e9;
      labs.forEach(function (l) {
        if (l.row !== prevRow) { prevRow = l.row; prevRight = -1e9; }
        var x = Math.max(l.x, prevRight + 6);
        if (x + l.w > base.width) x = Math.max(0, base.width - l.w);
        l.el.style.left = x + 'px';
        prevRight = x + l.w;
      });
    });
  }

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      document.querySelectorAll('#wk-slide-area, #wkfs-body').forEach(function (area) {
        if (area.querySelector('.tp-line')) syncSlide(area);
        area.querySelectorAll('.tp-text').forEach(function (t) {
          if (!t.__v91ro && ro) { t.__v91ro = 1; ro.observe(t); }
        });
      });
    }, 30);
  }
  var ro = window.ResizeObserver ? new ResizeObserver(schedule) : null;

  if (typeof tpRecolor === 'function') {
    var _tpRecolor = tpRecolor;
    tpRecolor = function () { var r = _tpRecolor.apply(this, arguments); schedule(); return r; };
  }
  /* 雙胞胎連動：切換其中一條，同頁另一條跟著同步開／關 */
  if (typeof tpLayerToggle === 'function') {
    var _tpLayerToggle = tpLayerToggle, syncing = false;
    tpLayerToggle = function (id, btn) {
      var r = _tpLayerToggle.apply(this, arguments);
      if (syncing || !enabled() || !btn || !btn.closest) return r;
      var slide = btn.closest('#wk-slide-area, #wkfs-body');
      if (!slide) return r;
      var nowOn = (window.tpLayerOrder || []).indexOf(id) >= 0;
      var main = btn.getAttribute('data-v91-of') || id;
      var group = slide.querySelectorAll('.tp-rhet[data-lid="' + main + '"], .tp-rhet[data-v91-of="' + main + '"]');
      syncing = true;
      try {
        group.forEach(function (it) {
          var lid = it.getAttribute('data-lid');
          if (lid === id) return;
          var isOn = (window.tpLayerOrder || []).indexOf(lid) >= 0;
          if (isOn !== nowOn) _tpLayerToggle(lid, it);
        });
      } finally { syncing = false; }
      return r;
    };
  }

  function onlyOurs(list) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (!(n.nodeType === 1 && (n.classList.contains('v91-lab') || n.classList.contains('v91-frame')))) return false;
    }
    return true;
  }
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (m.type === 'childList' && onlyOurs(m.addedNodes) && onlyOurs(m.removedNodes)) continue;
      schedule();
      return;
    }
  }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  schedule();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/090_v92-ver-js.js ════ */
try {

/* v92：版號；〈身為魚販〉套用 v91 修辭呈現；自學流程（引導／原文／提問穿插）。
   ・V91_RHET_KEYS 定義在 v91-rhet-js（本 addon 之前），只 push 不覆寫。
   ・包一層 wkParseSlides（目前第 4 層，實際生效的最外層）：魚販拿掉第 1、2 節獨立教案頁（2-7 移到課文後），
     並依移除位移 work_answers.targets 的 slideIdx。其他課不動。
   ・教案內容用原本的 wkRenderSlideHTML({type:'lesson'}) 產生，保留老師教案原文與格式。 */
(function () {
  window.APP_VERSION = 'V92';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);
  if (window.V91_RHET_KEYS && window.V91_RHET_KEYS.indexOf('身為魚販') < 0) window.V91_RHET_KEYS.push('身為魚販');

  var KEY = '身為魚販', PREFIX = 'v92f|' + KEY + '|';
  /* 流程表：段（0 起）→ before[行]＝該行之前的「讀之前」；after[行]＝該行之後的「想一想」
     L:教案頁號　Q:備課用書教學問題引導題號（1～15）　PA:老師 V50 頁層級提問（舊第 i 部分） */
  var FLOW = [
    { before: { 0: ['L1-2', 'L1-1', 'L1-3'] },
      after:  { 1: ['L1-4', 'Q1', 'Q2'], 3: ['Q3', 'Q4'], 6: ['Q5', 'Q6'] } },
    { before: {},
      after:  { 1: ['Q7'], 7: ['Q8'], 8: ['L1-7'] } },
    { before: { 0: ['L1-5'] },
      after:  { 2: ['Q9'], 4: ['Q10'], 11: ['Q11', 'L1-6'] } },
    { before: { 0: ['L2-1', 'L2-2'] },
      after:  { 1: ['Q12'], 7: ['Q13'] } },
    { before: { 0: ['PA4'] },
      after:  { 2: ['Q14', 'Q15'], 6: ['L2-3', 'L2-4', 'L2-5', 'L2-6'] } },
  ];
  var DROP = /^[12]-\d+$/, KEEP_AFTER = '2-7';

  function lsGet(k) { try { return localStorage.getItem(PREFIX + k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { if (v) localStorage.setItem(PREFIX + k, v); else localStorage.removeItem(PREFIX + k); } catch (e) {} }
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function ta(id) {
    return '<textarea class="v92-ta" data-v92="' + esc(id) + '" placeholder="寫下你的想法……">' + esc(lsGet(id)) + '</textarea>';
  }

  /* ── 投影片：拿掉獨立教案頁 ── */
  if (typeof wkParseSlides === 'function') {
    var _parse = wkParseSlides;
    wkParseSlides = function (key) {
      var slides = _parse.apply(this, arguments);
      if (key !== KEY) return slides;
      var keep = [], map = {}, bridge = null;
      slides.forEach(function (s, i) {
        if (s.type === 'lesson' && s.L && DROP.test(s.L.no)) {
          if (s.L.no === KEEP_AFTER) bridge = s;
          return;
        }
        map[i] = keep.length; keep.push(s);
      });
      if (bridge) {   // 「課文到這裡結束」接在最後一段課文之後
        var last = -1;
        keep.forEach(function (s, i) { if (s.type === 'textpage') last = i; });
        if (last >= 0) {
          keep.splice(last + 1, 0, bridge);
          Object.keys(map).forEach(function (k) { if (map[k] > last) map[k]++; });
        }
      }
      keep.forEach(function (s) {
        (s.targets || []).forEach(function (t) { if (typeof t.slideIdx === 'number' && t.slideIdx in map) t.slideIdx = map[t.slideIdx]; });
      });
      return keep;
    };
  }

  /* ── 題目區塊 ── */
  /* 自學版用語（老師 10/1「改掉」課堂用語）：只在流程顯示時替換，教案資料不動；原文不符就不換並 console.warn */
  var WORDING = {
    '1-2': { title: ['今天的閱讀任務', '閱讀任務'] },
    '1-6': { hint: ['請寫在課本空白處，不用另外抄。', '請寫在下面的表格裡。'] },
    '1-7': { title: ['下課前，口頭回答兩句', '讀到這裡，回答兩句'],
             lines0: ['今天我從課文中看見魚販工作的一個<b>具體細節</b>：＿＿＿＿', '我從課文中看見魚販工作的一個<b>具體細節</b>：＿＿＿＿'] },
    '2-1': { hint: ['翻出上節的註記，找出你寫的其中一個因素。', '回頭看你前面寫的答案，找出其中一個因素。'] },
    '2-4': { title: ['小組整理：作者的情感變化', '整理：作者的情感變化'],
             hint: ['如果組員理解不同，可以先把不同答案都寫下來，再回到文本討論哪一種更有根據。', '如果你有不同的理解，可以都寫下來，再回到課文找哪一種更有根據。'] },
  };
  function reword(L) {
    var w = WORDING[L.no];
    if (!w) return L;
    L = JSON.parse(JSON.stringify(L));
    Object.keys(w).forEach(function (k) {
      var from = w[k][0], to = w[k][1];
      if (k === 'lines0') { if (L.lines && L.lines[0] === from) L.lines[0] = to; else console.warn('v92 wording 不符', L.no, k); }
      else if (L[k] === from) L[k] = to; else console.warn('v92 wording 不符', L.no, k);
    });
    return L;
  }
  function lessonItem(no) {
    var L = (TEXTBOOK[KEY].lesson || []).filter(function (x) { return x.no === no; })[0];
    if (!L) return '';
    L = reword(L);
    var tmp = document.createElement('div');
    tmp.innerHTML = wkRenderSlideHTML({ type: 'lesson', L: L });
    var body = tmp.querySelector('.ls-body');
    if (!body) return '';
    var teach = body.querySelector('.ls-teach');
    // 作答：子題逐一給格；表格空格直接可填／只有提示列則加三列
    var subs = L.points || L.ask || L.task || L.lines || null;
    var tbl = body.querySelector('table.ls-tbl');
    if (tbl && L.cols) {
      var rows = L.rows || [];
      var empty = rows.every(function (r) { return r.slice(1).every(function (c) { return !c; }); });
      if (empty) {
        tbl.querySelectorAll('tr').forEach(function (tr, ri) {
          if (!ri) return;
          tr.querySelectorAll('td').forEach(function (td, ci) { td.className = 'v92-cell'; td.innerHTML = ta(no + '|r' + ri + 'c' + ci); });
        });
      } else {
        for (var r = 1; r <= 3; r++) {
          var tr = document.createElement('tr');
          L.cols.forEach(function (c, ci) { var td = document.createElement('td'); td.className = 'v92-cell'; td.innerHTML = ta(no + '|a' + r + 'c' + ci); tr.appendChild(td); });
          tbl.appendChild(tr);
        }
      }
    } else if (L.kind !== 'key3' && L.kind !== 'board') {
      var box = document.createElement('div');
      var qs = subs && subs.length ? subs : [''];
      box.innerHTML = qs.map(function (q, i) {
        return (qs.length > 1 ? '<div class="v92-sq">' + (i + 1) + '. ' + esc(strip(q)) + '</div>' : '') + ta(no + '|' + i);
      }).join('');
      if (teach) body.insertBefore(box, teach); else body.appendChild(box);
    }
    var tb = teach ? '<button class="v92-tbtn" onclick="v92Teach(this)" title="教師引導">師</button>' : '';
    return '<div class="v92-it">' + tb + body.innerHTML + '</div>';
  }
  function qaItem(n) {
    var tp = TEXTBOOK[KEY].textPages, k = n;
    for (var s = 0; s < tp.length; s++) {
      var qa = tp[s].qa || [];
      if (k <= qa.length) {
        var q = qa[k - 1];
        return '<div class="v92-it"><div class="v92-q"><span class="v92-qn">' + n + '</span>' + q[0] + '</div>' + ta('Q' + n) +
          '<div class="tp-abox" onclick="this.classList.toggle(\'show\')"><div class="tp-acov">寫完後，點此看參考答案</div>' +
          '<div class="tp-a"><span class="tp-ak">答</span><div class="tp-atext">' + q[1] + '</div></div></div></div>';
      }
      k -= qa.length;
    }
    return '';
  }
  function pageAsk(i) {
    var P = (TEXTBOOK[KEY].textPages || [])[i];
    if (!P || !P.ask || !P.ask.length) return '';
    var t = P.askT ? '<button class="v92-tbtn" onclick="v92Teach(this)" title="教師引導">師</button>' : '';
    return '<div class="v92-it">' + t + '<ul class="ls-ask">' + P.ask.map(function (q) { return '<li>' + q + '</li>'; }).join('') + '</ul>' +
      P.ask.map(function (q, j) { return ta('PA' + i + '|' + j); }).join('') +
      (P.askT ? '<div class="ls-teach"><div class="ls-th">教師引導</div>' + P.askT + '</div>' : '') + '</div>';
  }
  window.v92Teach = function (btn) {
    var t = btn.parentNode.querySelector('.ls-teach'); if (!t) return;
    t.classList.toggle('show'); btn.classList.toggle('on');
  };
  function block(items, pre) {
    var html = items.map(function (x) {
      if (x[0] === 'L') return lessonItem(x.slice(1));
      if (x[0] === 'Q') return qaItem(+x.slice(1));
      if (x.slice(0, 2) === 'PA') return pageAsk(+x.slice(2));
      return '';
    }).join('');
    if (!html) return null;
    var d = document.createElement('div');
    d.className = 'v92-blk' + (pre ? ' v92-pre' : '');
    d.innerHTML = '<span class="v92-tag">' + (pre ? '讀之前' : '想一想') + '</span><span class="v92-save">作答自動存在這台裝置</span>' + html;
    return d;
  }

  /* 頁層級提問 PA4 是舊第 5 部分的 ask；v92 資料已隨內容搬到新第五段 → 取新段 4 的 ask */
  function enhance(area) {
    var slide = area.querySelector('.wks-textpage');
    if (!slide || slide.getAttribute('data-v92f')) return;
    var cur = wkSlides[wkIdx];
    if (!cur || cur.type !== 'textpage' || cur.bookKey !== KEY) return;
    var si = (TEXTBOOK[KEY].textPages || []).indexOf(cur.page);
    var F = FLOW[si];
    if (!F) return;
    slide.setAttribute('data-v92f', '1');
    slide.classList.add('v92-flow');
    Object.keys(F.before).forEach(function (li) {
      var line = slide.querySelector('.tp-body > .tp-line[data-li="' + li + '"]');
      var b = line && block(F.before[li], true);
      if (b) line.parentNode.insertBefore(b, line);
    });
    Object.keys(F.after).forEach(function (li) {
      var line = slide.querySelector('.tp-body > .tp-line[data-li="' + li + '"]');
      var b = line && block(F.after[li], false);
      if (b) line.parentNode.insertBefore(b, line.nextSibling);
    });
  }

  var tmr = {};
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('v92-ta')) return;
    var id = t.getAttribute('data-v92');
    document.querySelectorAll('.v92-ta').forEach(function (o) { if (o !== t && o.getAttribute('data-v92') === id) o.value = t.value; });
    clearTimeout(tmr[id]);
    tmr[id] = setTimeout(function () { lsSet(id, t.value); }, 400);
  });

  function scan() {
    if (typeof wkKey === 'undefined' || wkKey !== KEY) return;
    document.querySelectorAll('#wk-slide-area, #wkfs-body').forEach(enhance);
  }
  var p = false;
  new MutationObserver(function () { if (p) return; p = true; setTimeout(function () { p = false; scan(); }, 30); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/091_v93-imgpath-js.js ════ */
try {

/* v93：版號；圖片改為外部檔（img/…，部署時與 index.html 同層）。
   從根目錄工作檔（…整理版_vNN.html）開啟時，圖片實際在 上傳/img/ → 把 <img src="img/…"> 補上前綴。
   v90 補充圖片的 IMG 路徑已在其定義處依同一規則補前綴（見 v93_build.py）。部署版（上傳/index.html、GitHub）不做任何改寫。 */
(function () {
  window.APP_VERSION = 'V93';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var ROOTFILE = /整理版_v\d+\.html$/.test(decodeURIComponent(location.pathname));
  if (!ROOTFILE) return;
  function fix(root) {
    (root.querySelectorAll ? root.querySelectorAll('img[src^="img/"]') : []).forEach(function (im) {
      im.setAttribute('src', '上傳/' + im.getAttribute('src'));
    });
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches('img[src^="img/"]')) fix(n.parentNode); else fix(n); } }); });
  }).observe(document.documentElement, { childList: true, subtree: true });
  fix(document);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/095_v95-credit-js.js ════ */
try {

/* v95：版號；在指定圖片下方（橫幅則右下角）加作者／授權小字。以檔名比對，不改 v90 addon。 */
(function () {
  window.APP_VERSION = 'V95';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var CREDIT = {
    '金針花海.jpg': '攝影：rita2253419／CC BY-SA 4.0／Wikimedia Commons',
    '吉安稻田.jpg': '攝影：Fred Hsu／CC BY-SA 3.0／Wikimedia Commons',
    '木瓜溪橋火車.jpg': '攝影：Irvin Chen／CC BY 2.0／Wikimedia Commons',
    '苦楝.jpg': '攝影：Foxy Who／CC BY-SA 3.0／Wikimedia Commons'
  };
  function nameOf(u) { try { u = decodeURIComponent(u || ''); } catch (e) {} return u.split('/').pop().replace(/["')]+$/, ''); }
  function tag(t) { var d = document.createElement('div'); d.className = 'v95-credit'; d.textContent = t; return d; }
  function scan() {
    document.querySelectorAll('.v90-banner:not([data-v95])').forEach(function (b) {
      b.setAttribute('data-v95', '1');
      var t = CREDIT[nameOf(b.getAttribute('data-src') || b.style.backgroundImage)];
      if (t) b.appendChild(tag(t));
    });
    document.querySelectorAll('img.v90-zoom:not([data-v95])').forEach(function (im) {
      im.setAttribute('data-v95', '1');
      var t = CREDIT[nameOf(im.getAttribute('src'))];
      if (!t) return;
      var cap = im.parentNode.querySelector('.v90-cap');
      if (cap) cap.parentNode.insertBefore(tag(t), cap.nextSibling); else im.parentNode.insertBefore(tag(t), im.nextSibling);
    });
  }
  var p = false;
  new MutationObserver(function () { if (p) return; p = true; setTimeout(function () { p = false; scan(); }, 40); })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/096_v96-imgrev-js.js ════ */
try {

/* v96：圖片快取破除（老師 10/1：換成高解析後自己電腦仍顯示舊的糊圖 → 瀏覽器快取了同檔名的舊圖）。
   同檔名替換過的圖片，在網址後加 ?v=版本，瀏覽器視為新檔重新下載；沒換過的圖照常使用快取。
   以後替換圖片時，在 REV 加一筆（檔名：版本）即可。只改元素上的網址，不改 v90／v93 addon。 */
(function () {
  window.APP_VERSION = 'V96';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var REV = {
    '火車線/金針花海.jpg': 95, '火車線/吉安稻田.jpg': 95, '火車線/木瓜溪橋火車.jpg': 95, '火車線/苦楝.jpg': 95,
    '火車線/九芎.jpg': 95, '火車線/冬候鳥群.jpg': 95, '火車線/路線圖_花蓮壽豐.jpg': 95
  };
  window.V96_IMG_REV = REV;
  function bust(u) {
    if (!u || u.indexOf('?') >= 0) return u;
    var dec; try { dec = decodeURIComponent(u); } catch (e) { dec = u; }
    for (var k in REV) if (dec.slice(-k.length - 1) === '/' + k) return u + '?v=' + REV[k];
    return u;
  }
  function fixEl(el) {
    if (el.tagName === 'IMG') {
      var s = el.getAttribute('src'), s2 = bust(s);
      if (s2 !== s) el.setAttribute('src', s2);
    }
    var ds = el.getAttribute && el.getAttribute('data-src');
    if (ds) { var d2 = bust(ds); if (d2 !== ds) el.setAttribute('data-src', d2); }
    var bg = el.style && el.style.backgroundImage;
    if (bg && bg.indexOf('img/') >= 0 && bg.indexOf('?') < 0) {
      var m = bg.match(/url\(["']?([^"')]+)["']?\)/);
      if (m) { var b2 = bust(m[1]); if (b2 !== m[1]) el.style.backgroundImage = 'url("' + b2 + '")'; }
    }
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    fixEl(root);
    root.querySelectorAll('img[src*="img/"], [data-src*="img/"], [style*="img/"]').forEach(fixEl);
  }
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === 'attributes') fixEl(m.target);
      else m.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'style', 'data-src'] });
  scan(document.documentElement);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/100_v98-cal-js.js ════ */
try {

(function () {
  /* 課次同 v84（L1～L6 依 source/115-1/高職/第一冊 教材檔名）；L7 以後尚未建課，只顯示課次 */
  var LESSONS = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐' };
  var MAXL = 12;
  var KINDS = ['考試', '交作業'];
  function disp(k) { return String(k).replace('課後習題', '課本後習題'); }   /* V123：畫面上叫「課本後習題」（基礎練習＋進階練習）；存的值仍是「課後習題」 */
  var ITEMS = ['A卷', 'A卷檢討', '習作', '習作檢討', '註釋小考', '課後習題', '課後習題檢討', '其他'];   /* V123：加習作檢討、課後習題檢討（重要進度檢核「檢討」格） */   /* v102：加 A卷檢討 */   /* v100：加註釋小考 */
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];   /* 四班顏色，依 CLS_LIST 順序 */
  var K = { data: 'exam_cal_v1', cls: 'exam_cal_cls_v1' };
  var WD = ['日', '一', '二', '三', '四', '五', '六'];   /* v103：星期日開頭 */
  var exporting = false;

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function wdName(s) { return WD[parse(s).getDay()]; }
  function list() { var a = get(K.data, []); return Array.isArray(a) ? a : []; }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* 當天有國文課的班級：讀 V82 課表（老師改過的 tp_schedule_v1 優先，否則 V82 預設課表的同一份資料） */
  var DEF_SLOTS = [[1,'冷一孝'],[1,'冷一忠'],[1,'建一忠'],[1,'建一孝'],[2,'建一孝'],[3,'冷一孝'],[3,'冷一忠'],
    [4,'建一孝'],[4,'冷一孝'],[4,'建一忠'],[5,'建一忠'],[5,'冷一忠'],[5,'建一孝']];
  function meets(dateStr) {
    var wd = parse(dateStr).getDay(), s = get('tp_schedule_v1', null), out = {};
    if (s && s.slots) s.slots.forEach(function (x) { if (x.wd === wd && x.normal !== false && x.cls) out[x.cls] = 1; });
    else DEF_SLOTS.forEach(function (x) { if (x[0] === wd) out[x[1]] = 1; });
    return out;
  }

  function lesText(ls) {
    ls = (ls || []).slice().sort(function (a, b) { return a - b; });
    if (!ls.length) return '';
    /* 連續的課併成區間：L1、L2、L3 → L1–3 */
    var out = [], i = 0;
    while (i < ls.length) { var j = i; while (j + 1 < ls.length && ls[j + 1] === ls[j] + 1) j++; out.push('L' + ls[i] + (j > i ? '–' + ls[j] : '')); i = j + 1; }
    return out.join('、');
  }
  function lesLong(ls) {
    return (ls || []).slice().sort(function (a, b) { return a - b; })
      .map(function (n) { return 'L' + n + (LESSONS[n] ? ' ' + LESSONS[n] : ''); }).join('、');
  }
  function label(e) {
    if (e.item === '註釋小考') {
      var q = e.quiz || {}, np = (q.pick || []).length, nm = (q.must || []).length;
      return '小考 ' + lesText(e.lessons) + (np ? ' 選' + (np + nm) + '題' : (e.quiz ? ' 註' + q.a + '–' + q.b + ' 抽' + q.n : '')) +
        (!np && nm ? '（必考' + nm + '）' : '') + (e.note ? '（' + e.note + '）' : '');
    }
    if (/檢討$/.test(e.item)) return disp(e.item) + ' ' + lesText(e.lessons) + (e.note ? '（' + e.note + '）' : '');
    var it = e.item === '其他' ? (e.note || '其他') : disp(e.item);
    var s = it + (e.lessons && e.lessons.length ? ' ' + lesText(e.lessons) : '') + ' ' + (e.kind === '考試' ? '考' : '交');
    if (e.item !== '其他' && e.note) s += '（' + e.note + '）';
    return s;
  }

  /* 狀態 */
  var view = null;           /* 目前月份第一天 */
  var sel = null;            /* 選取的日期字串 */
  var fCls = get(K.cls, '');  /* 篩選班級，空＝全部 */
  var form = { cls: [], kind: '考試', item: 'A卷', les: [], note: '', qa: '', qb: '', qn: '5', qmode: 'pick', qs: {} };

  function ensure() {
    var m = document.getElementById('v98-cal'); if (m) return m;
    m = document.createElement('div'); m.id = 'v98-cal';
    m.innerHTML = '<div class="v98-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m) { close(); return; }
      var b = e.target.closest && e.target.closest('[data-v98]'); if (!b) return;
      var a = b.getAttribute('data-v98').split('|'), t = a[0];
      if (t === 'x') close();
      else if (t === 'm') { view = new Date(view.getFullYear(), view.getMonth() + (+a[1]), 1); render(); }
      else if (t === 't') { var n = new Date(); view = new Date(n.getFullYear(), n.getMonth(), 1); pick(ymd(n)); }
      else if (t === 'f') { fCls = a[1]; put(K.cls, fCls); render(); }
      else if (t === 'd') pick(a[1]);
      else if (t === 'fc') { tog(form.cls, a[1]); render(); }
      else if (t === 'fca') { form.cls = form.cls.length === classes().length ? [] : classes().slice(); render(); }
      else if (t === 'fk') { form.kind = a[1]; render(); }
      else if (t === 'fi') { form.item = a[1]; if (a[1] === '註釋小考') { form.kind = '考試'; form.les = form.les.slice(0, 1); qDefault(); } render(); }
      else if (t === 'fl') { if (form.item === '註釋小考') { form.les = form.les[0] === +a[1] ? [] : [+a[1]]; form.qa = form.qb = ''; form.qs = {}; form.qmode = 'pick'; qDefault(); } else tog(form.les, +a[1]); render(); }
      else if (t === 'add') add();
      else if (t === 'del') del(a[1]);
      else if (t === 'quiz') startQuiz(a[1]);
      else if (t === 'qm') { form.qmode = a[1]; render(); }
      else if (t === 'qc') { qTog(+a[1]); render(); }
      else if (t === 'qx') { form.qs = {}; render(); }
    });
    m.addEventListener('input', function (e) { if (e.target.id === 'v98-note') { form.note = e.target.value; syncAdd(); }
      else if (/^v98-q[abn]$/.test(e.target.id)) { form[e.target.id.slice(4)] = e.target.value; syncAdd(); } });
    /* 不讓 ←→ 等鍵觸發課文換頁；Esc 關閉 */
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } e.stopPropagation(); });
    return m;
  }
  function tog(arr, v) { var i = arr.indexOf(v); if (i < 0) arr.push(v); else arr.splice(i, 1); }

  function pick(d) {
    sel = d;
    var v = parse(d);
    if (!view || v.getMonth() !== view.getMonth() || v.getFullYear() !== view.getFullYear()) view = new Date(v.getFullYear(), v.getMonth(), 1);
    /* 預設班級：有篩選就用該班；否則用當天有課的班 */
    if (fCls) form.cls = [fCls];
    else { var mt = meets(d); form.cls = classes().filter(function (c) { return mt[c]; }); }
    render();
  }

  function valid() {
    if (form.item === '註釋小考') { var qa = +form.qa, qb = +form.qb, qn = +form.qn;
      return !!(sel && form.cls.length && form.les.length === 1 && (qKeys('pick').length || (qa > 0 && qb >= qa && qn > 0))); }
    return sel && form.cls.length && (form.item !== '其他' ? form.les.length : form.note.trim());
  }
  /* v100：註釋小考 */
  function noteRange(n) {
    var k = QK[n], T = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK : {}, nos = [];
    ((T[k] || {}).textPages || []).forEach(function (p) { (p.lines || []).forEach(function (l) {
      var re = /\{n:(\d+)\|/g, m; while ((m = re.exec(l.text || ''))) nos.push(+m[1]); }); });
    return nos.length ? [Math.min.apply(null, nos), Math.max.apply(null, nos)] : null;
  }
  function qDefault() {
    if (!form.les.length) return;
    var r = noteRange(form.les[0]); if (!r) return;
    if (!form.qa) form.qa = String(r[0]); if (!form.qb) form.qb = String(r[1]);
  }
  function quizRow() {
    var r = form.les.length ? noteRange(form.les[0]) : null;
    return '<div class="v98-row v100-q"><span>註釋範圍與題數' + (r ? '（本課註' + r[0] + '～' + r[1] + '）' : (form.les.length ? '（這一課沒有註釋資料）' : '（先選一課）')) + '</span>' +
      '註 <input type="number" id="v98-qa" min="1" value="' + esc(form.qa) + '"> ～ <input type="number" id="v98-qb" min="1" value="' + esc(form.qb) + '">' +
      '　抽 <input type="number" id="v98-qn" min="1" value="' + esc(form.qn) + '"> 題</div>' + chooser();
  }
  /* v102：在日曆直接點題目（選題／必考／不考），存在這一筆 */
  function quizItems(n) { var k = QK[n]; try { return (k && typeof window.nq2BuildLesson === 'function') ? window.nq2BuildLesson(k).items : []; } catch (e) { return []; } }
  function qKey(it) { return it[0] + '|' + it[1]; }
  function qKeys(m) { return Object.keys(form.qs).filter(function (k) { return form.qs[k] === m; }); }
  function qTog(i) {
    var it = quizItems(form.les[0])[i]; if (!it) return;
    var k = qKey(it);
    if (form.qs[k] === form.qmode) delete form.qs[k]; else form.qs[k] = form.qmode;
  }
  function chooser() {
    if (!form.les.length) return '';
    var its = quizItems(form.les[0]); if (!its.length) return '';
    var a = +form.qa || 0, b = +form.qb || 9999, np = qKeys('pick').length, nm = qKeys('must').length, nx = qKeys('ex').length;
    var h = '<div class="v98-row v102-qm"><span>點題目＝（可不點，直接隨機抽）</span>' + [['pick', '選題'], ['must', '必考'], ['ex', '不考']].map(function (m) {
      return '<button type="button" class="v102-m-' + m[0] + (form.qmode === m[0] ? ' on' : '') + '" data-v98="qm|' + m[0] + '">' + m[1] + '</button>';
    }).join('') + (np + nm + nx ? '<button type="button" data-v98="qx">全部清除</button>' : '') + '</div>';
    h += '<div class="v102-qgrid">' + its.map(function (it, i) {
      var st = form.qs[qKey(it)] || '', out = it[0] < a || it[0] > b;
      return '<button type="button" class="v102-qc' + (st ? ' ' + st : '') + (out && !st ? ' out' : '') + '" data-v98="qc|' + i + '" title="' + esc(it[0] + ' ' + it[1]) + '"><b>' + it[0] + '</b>' + esc(it[1]) + '</button>';
    }).join('') + '</div>';
    h += '<div class="v102-qsum">' + (np
      ? '自己選了 ' + np + ' 題' + (nm ? '＋必考 ' + nm + ' 題' : '') + '：只考這些題，不再隨機抽。'
      : '從註' + (form.qa || '?') + '～' + (form.qb || '?') + ' 隨機抽 ' + (form.qn || '?') + ' 題' + (nm ? '，必考 ' + nm + ' 題一定在內' : '') + (nx ? '，不考 ' + nx + ' 題不會抽到' : '') + '。') + '</div>';
    return h;
  }
  function qBtn(e) { return e.item === '註釋小考' && e.quiz ? '<button type="button" class="v100-qgo" data-v98="quiz|' + e.id + '">開始小考</button>' : ''; }
  /* 開始小考：關日曆 → 開註釋小考 → 帶入課次、範圍、題數並抽題（老師按「開始小考」出題） */
  function startQuiz(id) {
    var e = list().filter(function (x) { return x.id === id; })[0]; if (!e || !e.quiz) return;
    var k = QK[e.lessons[0]];
    if (typeof window.nq2Open !== 'function' || !k) { alert('這一課目前沒有註釋小考資料。'); return; }
    close();
    var p = document.getElementById('cls-panel'); if (p && p.classList.contains('open')) clsToggle();
    window.nq2Open();
    var s = document.getElementById('nq2-lesson'), hit = -1;
    for (var i = 0; i < s.options.length; i++) if (s.options[i].text.replace(/（\d+ 題）$/, '') === k) hit = i;
    if (hit < 0) { alert('註釋小考找不到〈' + k + '〉。'); return; }
    s.selectedIndex = hit; if (typeof s.onchange === 'function') s.onchange({ target: s });
    /* v102：依這筆的選題／必考／不考決定題目，再到小考畫面逐題點選 */
    var its = quizItems(e.lessons[0]), q = e.quiz, pick = q.pick || [], must = q.must || [], ex = q.ex || [], want = {};
    if (pick.length) pick.concat(must).forEach(function (x) { want[x] = 1; });
    else {
      must.forEach(function (x) { want[x] = 1; });
      var pool = its.filter(function (it) { var kk = qKey(it); return it[0] >= q.a && it[0] <= q.b && ex.indexOf(kk) < 0 && !want[kk]; });
      for (var j = pool.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)), tt = pool[j]; pool[j] = pool[r]; pool[r] = tt; }
      pool.slice(0, Math.max(0, q.n - must.length)).forEach(function (it) { want[qKey(it)] = 1; });
    }
    document.getElementById('nq2-ra').value = q.a;
    document.getElementById('nq2-rb').value = q.b;
    document.getElementById('nq2-rn').value = pick.length ? pick.length + must.length : q.n;
    document.getElementById('nq2-mPick').click();
    document.getElementById('nq2-bClear').click();
    its.forEach(function (it, i) {
      var c = document.querySelector('#nq2-grid .chip[data-i="' + i + '"]'); if (!c) return;
      if (!!want[qKey(it)] !== c.classList.contains('on')) c.click();
    });
    pend = [e.cls]; hookDlg();
  }
  /* 從日曆開的小考：「記錄本次小考」視窗自動勾好該班 */
  var pend = null;
  function hookDlg() {
    var d = document.getElementById('nq2-v60dlg'); if (!d || d.__v100) return; d.__v100 = 1;
    new MutationObserver(function () {
      if (!d.classList.contains('show') || !pend) return;
      d.querySelectorAll('.v60-cls input').forEach(function (x) {
        if (pend.indexOf(x.value) >= 0 && !x.checked) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }).observe(d, { attributes: true, attributeFilter: ['class'] });
    var nq = document.getElementById('nq2');
    if (nq) new MutationObserver(function () { if (!nq.classList.contains('open')) pend = null; }).observe(nq, { attributes: true, attributeFilter: ['class'] });
  }
  /* 「記錄本次小考」（v60，nq-records-v1）同一天、同課、有勾該班 → 日曆該筆自動完成 */
  function reconcile() {
    var recs = get('nq-records-v1', []); if (!Array.isArray(recs) || !recs.length) return;
    var a = list(), ch = false;
    a.forEach(function (e) {
      if (e.item !== '註釋小考' || e.done) return;
      var k = QK[(e.lessons || [])[0]]; if (!k) return;
      recs.forEach(function (r) {
        if (e.done || !r || r.lesson !== k || (r.classes || []).indexOf(e.cls) < 0 || !r.createdAt) return;
        if (ymd(new Date(r.createdAt)) === e.date) { e.done = e.date; ch = true; }
      });
    });
    if (ch) put(K.data, a);
  }
  function syncAdd() { var b = document.querySelector('#v98-cal .v98-add'); if (b) b.disabled = !valid(); }

  function add() {
    if (!valid()) return;
    var a = list();
    form.cls.forEach(function (c) {
      var q = form.item === '註釋小考';
      a.push({ id: uid(), date: sel, cls: c, kind: q ? '考試' : (/檢討$/.test(form.item) ? '檢討' : form.kind), item: form.item, lessons: form.les.slice(), note: form.note.trim(),
        quiz: q ? { a: +form.qa, b: +form.qb, n: +form.qn, pick: qKeys('pick'), must: qKeys('must'), ex: qKeys('ex') } : undefined });
    });
    put(K.data, a);
    form.note = ''; form.les = []; form.qs = {}; form.qmode = 'pick';
    render();
  }
  function del(id) {
    var a = list(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    if (!confirm('刪除「' + md(e.date) + ' ' + e.cls + '・' + label(e) + '」？')) return;
    put(K.data, a.filter(function (x) { return x.id !== id; }));
    render();
  }

  function shown(e) { return !fCls || e.cls === fCls; }
  function byDay() {
    var m = {}, order = classes();
    list().forEach(function (e) { if (shown(e)) (m[e.date] = m[e.date] || []).push(e); });
    Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return order.indexOf(a.cls) - order.indexOf(b.cls) || (a.kind < b.kind ? -1 : 1); }); });
    return m;
  }
  function tag(c) { return '<span class="v98-tg" style="background:' + ccol(c) + '">' + esc(c) + '</span>'; }

  function render() {
    try { reconcile(); } catch (e) {}
    var m = ensure(), box = m.querySelector('.v98-box');
    var y = view.getFullYear(), mo = view.getMonth(), today = ymd(new Date()), days = byDay();
    var h = '<div class="v98-top"><button type="button" data-v98="m|-1">◀</button><h3>' + y + ' 年 ' + (mo + 1) + ' 月</h3>' +
      '<button type="button" data-v98="m|1">▶</button><button type="button" data-v98="t">今天</button>' +
      '<span class="v98-sp"></span><span style="font-family:\'Noto Serif TC\',serif;font-weight:700;letter-spacing:2px">考試／作業日曆</span>' +
      '<span class="v98-sp"></span><button type="button" data-v98="x">✕ 關閉</button></div>';
    h += '<div class="v98-cls"><button type="button" data-v98="f|"' + (fCls ? '' : ' class="on"') + '>四班全部</button>' +
      classes().map(function (c) { return '<button type="button" data-v98="f|' + esc(c) + '"' + (fCls === c ? ' class="on"' : '') + '><i style="background:' + ccol(c) + '"></i>' + esc(c) + '</button>'; }).join('') +
      '<span class="v98-lg">● 小圓點＝當天有國文課的班</span></div>';
    h += '<div class="v98-main"><div class="v98-grid">' + WD.map(function (w) { return '<div class="v98-wh">' + w + '</div>'; }).join('');
    var first = new Date(y, mo, 1), start = new Date(y, mo, 1 - first.getDay());
    var weeks = Math.ceil((first.getDay() + new Date(y, mo + 1, 0).getDate()) / 7);
    for (var i = 0; i < weeks * 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), ds = ymd(d), wd = d.getDay();
      var cl = 'v98-d' + (d.getMonth() !== mo ? ' out' : '') + (wd === 0 || wd === 6 ? ' we' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : '');
      var mt = meets(ds), dots = classes().filter(function (c) { return mt[c] && (!fCls || c === fCls); })
        .map(function (c) { return '<i class="v98-dot" title="' + esc(c) + ' 有課" style="background:' + ccol(c) + '"></i>'; }).join('');
      h += '<div class="' + cl + '" data-v98="d|' + ds + '"><div class="v98-dn"><b>' + d.getDate() + '</b><span class="v98-dots">' + dots + '</span></div>' +
        (days[ds] || []).map(function (e) {
          return '<div class="v98-pill ' + (e.kind === '考試' ? 'ex' : 'hw') + (e.item === '註釋小考' ? ' qz' : /檢討$/.test(e.item) ? ' rvw' : '') + '" data-cid="' + e.id + '" style="border-left-color:' + ccol(e.cls) + '" title="' + esc(e.cls + '・' + label(e)) + '">' +
            (fCls ? '' : esc(e.cls.replace('一', '')) + ' ') + esc(label(e)) + '</div>';
        }).join('') + '</div>';
    }
    h += '</div><div class="v98-side">' + editor() + upcoming() + '</div></div>';
    box.innerHTML = h;
    syncAdd();
  }

  function editor() {
    if (!sel) return '<div class="v98-ed"><h4>新增安排</h4><div class="v98-empty">先在左邊點一個日期。</div></div>';
    var mt = meets(sel), cs = classes();
    var h = '<div class="v98-ed"><h4>' + md(sel) + '（' + wdName(sel) + '）新增安排</h4>';
    h += '<div class="v98-row"><span>班級（可複選；● 當天有課）</span>' + cs.map(function (c) {
      return '<button type="button" data-v98="fc|' + esc(c) + '"' + (form.cls.indexOf(c) >= 0 ? ' class="on"' : '') + '>' +
        (mt[c] ? '<i class="v98-dot" style="background:' + ccol(c) + ';margin-right:3px"></i>' : '') + esc(c) + '</button>';
    }).join('') + '<button type="button" data-v98="fca">' + (form.cls.length === cs.length ? '全不選' : '四班') + '</button></div>';
    if (form.item !== '註釋小考' && !/檢討$/.test(form.item)) h += '<div class="v98-row"><span>類型</span>' + KINDS.map(function (k) { return '<button type="button" data-v98="fk|' + k + '"' + (form.kind === k ? ' class="on"' : '') + '>' + k + '</button>'; }).join('') + '</div>';
    h += '<div class="v98-row"><span>項目</span>' + ITEMS.map(function (k) { return '<button type="button" data-v98="fi|' + k + '"' + (form.item === k ? ' class="on"' : '') + '>' + disp(k) + '</button>'; }).join('') + '</div>';
    h += '<div class="v98-row"><span>第幾課' + (form.item === '註釋小考' ? '（單選）' : '（可複選）') + '</span>';
    for (var n = 1; n <= MAXL; n++) h += '<button type="button" class="v98-l' + (form.les.indexOf(n) >= 0 ? ' on' : '') + '" data-v98="fl|' + n + '">L' + n + (LESSONS[n] ? '<small>' + esc(LESSONS[n]) + '</small>' : '') + '</button>';
    h += '</div>';
    if (form.item === '註釋小考') h += quizRow();
    h += '<div class="v98-row"><input type="text" id="v98-note" value="' + esc(form.note) + '" placeholder="' + (form.item === '其他' ? '內容（必填，例：第一次段考）' : '備註（可不填）') + '"></div>';
    h += '<button type="button" class="v98-add" data-v98="add">＋ 加入</button>';
    var items = list().filter(function (e) { return e.date === sel; }).sort(function (a, b) { return cs.indexOf(a.cls) - cs.indexOf(b.cls); });
    h += '<div class="v98-has">' + (items.length ? items.map(function (e) {
      return '<div class="v98-it">' + tag(e.cls) + '<span class="v98-tx" title="' + esc(lesLong(e.lessons)) + '">' + esc(label(e)) + '</span>' + qBtn(e) + '<button type="button" data-v98="del|' + e.id + '" title="刪除">✕</button></div>';
    }).join('') : '<div class="v98-hint">這天還沒有安排。</div>') + '</div></div>';
    return h;
  }

  function upcoming() {
    var t = ymd(new Date()), end = ymd(new Date(Date.now() + 21 * 864e5)), days = byDay();
    var ks = Object.keys(days).filter(function (k) { return k >= t && k <= end; }).sort();
    return '<div class="v98-up"><h4>接下來三週</h4>' + (ks.length ? ks.map(function (k) {
      return '<div class="v98-ud" data-v98="d|' + k + '">' + md(k) + '（' + wdName(k) + '）' + (k === t ? ' 今天' : '') + '</div>' +
        days[k].map(function (e) { return '<div class="v98-it">' + tag(e.cls) + '<span class="v98-tx">' + esc(label(e)) + '</span>' + qBtn(e) + '<button type="button" data-v98="del|' + e.id + '" title="刪除">✕</button></div>'; }).join('');
    }).join('') : '<div class="v98-empty">三週內沒有安排。</div>') + '</div>';
  }

  function open() {
    var n = new Date();
    if (!view) view = new Date(n.getFullYear(), n.getMonth(), 1);
    ensure().classList.add('open');
    render();
  }
  function close() { var m = document.getElementById('v98-cal'); if (m) m.classList.remove('open'); }

  /* 「班級進度」面板頂端加入口按鈕 */
  function addBtn() {
    var p = document.getElementById('cls-panel'); if (!p || document.getElementById('v98-open')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'v98-open'; b.textContent = '📅 考試／作業日曆';
    b.onclick = open;
    var head = p.querySelector('.cls-head');
    p.insertBefore(b, head ? head.nextSibling : p.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn();

  /* 備份：匯出附帶 __v98cal；匯入時只補本機沒有的項目（依 id），不覆蓋 */
  var _v98load = clsLoad;
  clsLoad = function () { var d = _v98load.apply(this, arguments); if (exporting) d.__v98cal = list(); return d; };
  var _v98exp = clsExport;
  clsExport = function () { exporting = true; try { return _v98exp.apply(this, arguments); } finally { exporting = false; } };
  var _v98save = clsSave;
  clsSave = function (d) {
    if (d && d.__v98cal) {
      var cur = list(), have = {}; cur.forEach(function (e) { have[e.id] = 1; });
      (Array.isArray(d.__v98cal) ? d.__v98cal : []).forEach(function (e) { if (e && e.id && !have[e.id]) cur.push(e); });
      put(K.data, cur); delete d.__v98cal;
    }
    return _v98save.apply(this, arguments);
  };

  window.V98CAL = { open: open, close: close, data: list };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/103_v99-link-js.js ════ */
try {

(function () {
  /* 課次 → V84 課名（同 v84 LESSONS）；L7 以後 V84 沒有格子，完成狀態記在日曆項目本身（e.done） */
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  var NO = {}; Object.keys(LK).forEach(function (n) { NO[LK[n]] = +n; });
  var V84ITEMS = ['A卷', '習作', '課後習題'];
  var K = { cal: 'exam_cal_v1', hw: 'hw_done_v1' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function cal() { var a = get(K.cal, []); return Array.isArray(a) ? a : []; }

  /* 考試＋A卷／習作／課後習題＋課次都在 L1～L6 → 與 V84「考試」格連動 */
  /* v102：A卷檢討 → 完成紀錄「A卷｜檢討」格 */
  function hwKey(e) { return RV.test(e.item) ? e.item.replace(/檢討$/, '') + '|檢討' : e.item + '|考試'; }
  var RV = /^(A卷|習作|課後習題)檢討$/;   /* V123：習作檢討、課後習題檢討也連動 */
  function linked(e) {
    return ((e.kind === '考試' && V84ITEMS.indexOf(e.item) >= 0) || RV.test(e.item)) && e.lessons && e.lessons.length &&
      e.lessons.every(function (n) { return LK[n]; });
  }
  function isDone(e, hw) {
    if (!linked(e)) return !!e.done;
    hw = hw || get(K.hw, {});
    return e.lessons.every(function (n) { var r = (hw[LK[n]] || {})[e.cls] || {}; return !!r[hwKey(e)]; });
  }
  function toggle(id) {
    var a = cal(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    var done = isDone(e), when = e.date <= today() ? e.date : today();
    if (done && !confirm('取消「' + e.cls + '・' + e.item + '」的完成紀錄？' + (linked(e) ? '\n（「完成紀錄」表格的對應格也會一起取消）' : ''))) return;
    if (linked(e)) {
      var hw = get(K.hw, {});
      e.lessons.forEach(function (n) {
        var r = ((hw[LK[n]] = hw[LK[n]] || {})[e.cls] = hw[LK[n]][e.cls] || {}), key = hwKey(e);
        if (done) delete r[key]; else if (!r[key]) r[key] = when;
      });
      put(K.hw, hw);
    } else {
      if (done) delete e.done; else e.done = when;
      put(K.cal, a);
    }
    if (window.V98CAL) V98CAL.open();      /* 重新畫日曆（月份、選取日期不變） */
    if (typeof clsRender === 'function' && document.getElementById('cls-panel')) clsRender();
  }

  var busy = false;
  /* 日曆：右側清單加「完成」鈕；格子內已完成的項目淡化＋刪除線 */
  function decoCal() {
    var box = document.querySelector('#v98-cal .v98-box'); if (!box) return;
    var a = cal(), hw = get(K.hw, {}), byId = {}, doneKey = {};
    a.forEach(function (e) { byId[e.id] = e; if (isDone(e, hw)) doneKey[e.date + '|' + e.cls] = (doneKey[e.date + '|' + e.cls] || 0) + 1; });
    box.querySelectorAll('.v98-it').forEach(function (it) {
      if (it.querySelector('.v99-ck')) return;
      var del = it.querySelector('button[data-v98^="del|"]'); if (!del) return;
      var e = byId[del.getAttribute('data-v98').slice(4)]; if (!e) return;
      var d = isDone(e, hw), b = document.createElement('button');
      b.type = 'button'; b.className = 'v99-ck' + (d ? ' on' : ''); b.setAttribute('data-v99', e.id);
      b.textContent = d ? '✓ 完成' : '完成'; b.title = d ? '已完成（點一下可取消）' : '標記完成' + (linked(e) ? '（同步到完成紀錄）' : '');
      it.insertBefore(b, del);
      if (d) it.classList.add('v99-done');
    });
    /* 格子：依「日期｜班｜顯示文字」比對（同日同班同內容視為同一筆） */
    var cells = box.querySelectorAll('.v98-d');
    cells.forEach(function (c) {
      var ds = (c.getAttribute('data-v98') || '').slice(2);
      c.querySelectorAll('.v98-pill').forEach(function (p) {
        if (p.hasAttribute('data-v99d')) return; p.setAttribute('data-v99d', '1');
        var t = p.getAttribute('title') || '', cid = p.getAttribute('data-cid');   /* v100：用 data-cid 精確對應 */
        var match = a.filter(function (e) { return cid ? e.id === cid : (e.date === ds && t === e.cls + '・' + labelOf(p, t)); });
        if (match.length && match.every(function (e) { return isDone(e, hw); })) { p.classList.add('v99-done'); p.title = t + '（已完成）'; }
      });
    });
  }
  function labelOf(p, t) { return t.slice(t.indexOf('・') + 1); }

  /* 完成紀錄表格：尚未完成的「考試」格，若日曆有排，顯示 📅日期（最近一次） */
  function decoHw() {
    var root = document.getElementById('v84-hw'); if (!root) return;
    var a = cal(), plan = {};
    a.forEach(function (e) {
      if (!linked(e)) return;
      e.lessons.forEach(function (n) {
        var k = LK[n] + '|' + e.cls + '|' + hwKey(e);
        (plan[k] = plan[k] || []).push(e.date);
      });
    });
    root.querySelectorAll('button.v84-c:not(.done)').forEach(function (b) {
      var x = (b.getAttribute('data-v84') || '').split('|');   /* C|課|班|項目|階段 */
      if (b.querySelector('.v99-plan')) return;
      var ds = plan[x[1] + '|' + x[2] + '|' + x[3] + '|' + x[4]]; if (!ds) return;
      /* 優先顯示今天以後最近的一次；都已過去就顯示最後一次 */
      ds.sort(); var t = today(), d = ds.filter(function (v) { return v >= t; })[0] || ds[ds.length - 1];
      var s = document.createElement('span'); s.className = 'v99-plan'; s.textContent = '📅' + md(d);
      b.appendChild(s); b.title += '（日曆排定 ' + md(d) + '）';
    });
  }

  function deco() {
    if (busy) return; busy = true;
    try { decoCal(); decoHw(); } catch (e) {} finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var p = document.getElementById('cls-panel'); if (p) mo.observe(p, { childList: true, subtree: true });
    var m = document.getElementById('v98-cal');
    if (m && !m.__v99) { m.__v99 = 1; mo.observe(m, { childList: true, subtree: true });
      m.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-v99]'); if (b) { e.stopPropagation(); toggle(b.getAttribute('data-v99')); } }, true); }
    deco();
  }
  /* 日曆視窗第一次開啟時才建立 → 包 open 接上監看 */
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }
  var btnHook = function () { var b = document.getElementById('v98-open'); if (b) b.onclick = function () { V98CAL.open(); }; watch(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', btnHook); else btnHook();

  window.V99LINK = { isDone: isDone, linked: linked, toggle: toggle };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/108_v101-js.js ════ */
try {

(function () {
  /* ── 115-1 學校行事（老師 10/1 提供；下學期換這份清單即可） ── */
  var EVENTS = [
    { from: '2026-10-09', t: '國慶日放假', c: 'off' },
    { from: '2026-10-14', to: '2026-10-16', t: '第一次段考', c: 'exam' },
    { from: '2026-10-26', t: '光復節放假', c: 'off' },
    { from: '2026-11-24', to: '2026-11-26', t: '第二次段考', c: 'exam' },
    { from: '2026-12-04', t: '校慶', c: 'event' },
    { from: '2026-12-07', t: '校慶補假', c: 'off' },
    { from: '2026-12-25', t: '行憲紀念日放假', c: 'off' },
    { from: '2027-01-01', t: '元旦放假', c: 'off' },
    { from: '2027-01-18', to: '2027-01-19', t: '第三次段考', c: 'exam' },
    { from: '2027-01-20', t: '休業式（補考）', c: 'event' }
  ];
  function evOn(d) { return EVENTS.filter(function (e) { return d >= e.from && d <= (e.to || e.from); }); }
  window.V101 = { events: EVENTS, eventsOn: evOn };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }

  /* ── 日曆：格子顯示行事；編輯區顯示行事＋「補登已完成」勾選 ── */
  var pastDone = true, busy = false;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? (c.getAttribute('data-v98') || '').slice(2) : ''; }
  function deco() {
    if (busy) return; busy = true;
    try {
      document.querySelectorAll('#v98-cal .v98-d').forEach(function (c) {
        if (c.hasAttribute('data-v101')) return; c.setAttribute('data-v101', '1');
        var evs = evOn((c.getAttribute('data-v98') || '').slice(2)); if (!evs.length) return;
        var dn = c.querySelector('.v98-dn'), frag = evs.map(function (e) { return '<div class="v101-ev ' + e.c + '" title="' + esc(e.t) + '">' + esc(e.t) + '</div>'; }).join('');
        if (dn) dn.insertAdjacentHTML('afterend', frag);
        evs.forEach(function (e) { c.classList.add('v101-' + e.c); });
      });
      var ed = document.querySelector('#v98-cal .v98-ed'), sd = selDate();
      if (ed && sd && !ed.hasAttribute('data-v101')) {
        ed.setAttribute('data-v101', '1');
        var h4 = ed.querySelector('h4');
        evOn(sd).forEach(function (e) { if (h4) h4.insertAdjacentHTML('afterend', '<div class="v101-edev ' + e.c + '">📌 ' + esc(e.t) + '</div>'); });
        var add = ed.querySelector('.v98-add');
        if (add && sd < ymd(new Date())) add.insertAdjacentHTML('beforebegin',
          '<label class="v101-past"><input type="checkbox" id="v101-past"' + (pastDone ? ' checked' : '') + '> 已經考完／交了（補登為已完成）</label>');
      }
    } catch (e) {} finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var m = document.getElementById('v98-cal'); if (!m || m.__v101) { deco(); return; }
    m.__v101 = 1; mo.observe(m, { childList: true, subtree: true });
    m.addEventListener('change', function (e) { if (e.target.id === 'v101-past') pastDone = e.target.checked; });
    /* 補登：按「加入」前記下既有項目，加入後把新項目標為完成（日期已過且有勾選時） */
    m.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-v98="add"]'); if (!b || b.disabled) return;
      var sd = selDate(), cb = document.getElementById('v101-past');
      if (!sd || sd >= ymd(new Date()) || !cb || !cb.checked) return;
      var before = {}; (window.V98CAL ? V98CAL.data() : []).forEach(function (x) { before[x.id] = 1; });
      setTimeout(function () {
        V98CAL.data().filter(function (x) { return !before[x.id]; }).forEach(function (x) {
          if (window.V99LINK && !V99LINK.isDone(x)) V99LINK.toggle(x.id);
        });
      }, 0);
    }, true);
    deco();
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }

  /* ── 補登過去上課進度（寫入 V82 正式紀錄 tp_hist_v1，格式同自動紀錄） ── */
  var LESSONS = ['身為魚販', '世說新語選', '師說', '珍珠奶茶', '臺灣最美麗的火車線', '論語選—子路曾皙冉有公西華侍坐'];
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  /* 與 v82 plain()/headOf()/firstOrd() 相同算法，讓「繼續上課」找得回句子 */
  function plain(t) {
    var s = String(t || ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/<[^>]*>/g, '').replace(/[‹›]/g, '').replace(/\s+/g, '');
  }
  function pages(k) { return (typeof TEXTBOOK !== 'undefined' && TEXTBOOK[k] && TEXTBOOK[k].textPages) || []; }
  function firstOrd(k, seg) { var P = pages(k), n = 0; for (var i = 0; i < P.length; i++) { if (P[i].seg === seg) return n + 1; n += (P[i].lines || []).length; } return 0; }

  var F = { open: false, date: '', p: '', k: '', seg: '', li: '' };
  function periodsFor(cls, date) {
    var S = sched(), wd = date ? new Date(date + 'T12:00').getDay() : -1;
    var mine = S.slots.filter(function (x) { return x[0] === wd && x[2] === cls; }).map(function (x) { return x[1]; });
    return { all: S.periods, mine: mine };
  }
  function renderEntry() {
    var panel = document.getElementById('cls-panel'), auto = document.getElementById('v82-cls-auto');
    var el = document.getElementById('v101-entry');
    if (!panel || !auto || typeof clsCur === 'undefined') { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'v101-entry';
      el.addEventListener('click', function (e) {
        if (e.target.closest('.v101-h')) { F.open = !F.open; renderEntry(); }
        else if (e.target.closest('.v101-go')) save();
      });
      el.addEventListener('change', function (e) {
        var id = e.target.id; if (!/^v101-[a-z]+$/.test(id)) return;
        var f = id.slice(5); F[f] = e.target.value;
        if (f === 'date') F.p = '';
        if (f === 'k') { F.seg = ''; F.li = ''; }
        if (f === 'seg') F.li = '';
        renderEntry();
      });
      el.addEventListener('keydown', function (e) { e.stopPropagation(); });
    }
    if (el.previousElementSibling !== auto) auto.parentNode.insertBefore(el, auto.nextSibling);
    var cls = clsCur, h = '<div class="v101-h"><span>＋ 補登過去進度（' + esc(cls) + '）</span><i>' + (F.open ? '收起 ▾' : '展開 ▸') + '</i></div>';
    if (F.open) {
      if (!F.date) F.date = ymd(new Date());
      var pf = periodsFor(cls, F.date);
      if (!F.p) F.p = String(pf.mine[0] || '');
      var ks = LESSONS.filter(function (k) { return pages(k).length; });
      if (!F.k) F.k = (typeof wkKey !== 'undefined' && ks.indexOf(wkKey) >= 0) ? wkKey : ks[0];
      var P = pages(F.k);
      if (!F.seg && P[0]) F.seg = P[0].seg;
      var pg = P.filter(function (x) { return x.seg === F.seg; })[0] || { lines: [] }, r0 = firstOrd(F.k, F.seg);
      if (F.li === '' && pg.lines.length) F.li = '0';
      h += '<div class="v101-g"><span>日期</span><input type="date" id="v101-date" value="' + esc(F.date) + '">' +
        '<span>節次</span><select id="v101-p">' + pf.all.map(function (x) {
          return '<option value="' + x.p + '"' + (String(x.p) === F.p ? ' selected' : '') + '>第' + x.p + '節（' + x.start + '）' + (pf.mine.indexOf(x.p) >= 0 ? '★本班' : '') + '</option>'; }).join('') + '</select>' +
        '<span>課文</span><select id="v101-k">' + ks.map(function (k) { return '<option' + (k === F.k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>' +
        '<span>段落</span><select id="v101-seg">' + P.map(function (x) { return '<option' + (x.seg === F.seg ? ' selected' : '') + '>' + esc(x.seg) + '</option>'; }).join('') + '</select>' +
        '<span>上到</span><select id="v101-li">' + pg.lines.map(function (l, i) {
          return '<option value="' + i + '"' + (String(i) === F.li ? ' selected' : '') + '>第' + (r0 + i) + '句　' + esc(plain(l.text).slice(0, 12)) + '…</option>'; }).join('') + '</select></div>' +
        '<button type="button" class="v101-go">補登這一筆</button>' +
        '<div class="v101-note">★＝課表上本班這天的節次。補登後會出現在上面的進度清單，「繼續上課」可以接著上。</div>';
    }
    el.innerHTML = h;
  }
  function save() {
    var cls = clsCur, P = pages(F.k), pg = P.filter(function (x) { return x.seg === F.seg; })[0];
    var li = +F.li, L = pg && pg.lines[li];
    if (!F.date || !F.p || !L) { alert('請填好日期、節次、課文和句子。'); return; }
    var per = sched().periods.filter(function (x) { return String(x.p) === String(F.p); })[0] || { start: '', end: '' };
    var ord = firstOrd(F.k, F.seg) + li;
    var pos = { k: F.k, sid: 'tp:' + F.seg, idx: 0, lbl: '第' + ord + '句', seg: F.seg, r: ord, li: li, ord: ord, head: plain(L.text).slice(0, 8) };
    var h = get('tp_hist_v1', []); if (!Array.isArray(h)) h = [];
    var same = h.filter(function (r) { return r.date === F.date && String(r.period) === String(F.p) && r.classId === cls; });
    if (same.length && !confirm(cls + ' ' + F.date + ' 第' + F.p + '節已經有紀錄，要用這筆取代嗎？')) return;
    if (!same.length && !confirm('補登：' + cls + '　' + F.date + ' 第' + F.p + '節\n' + F.k + ' 上到 第' + ord + '句？')) return;
    h = h.filter(function (r) { return same.indexOf(r) < 0; });
    var at = new Date(F.date + 'T' + (per.end || '12:00')).toISOString();
    var part = {}; part[F.k] = { start: pos, max: pos, last: pos, firstAt: at, lastAt: at };
    h.push({ v: 1, id: 'entry|' + F.date + '|' + F.p + '|' + cls + '|' + Date.now().toString(36), date: F.date, weekday: new Date(F.date + 'T12:00').getDay(),
      period: +F.p, classId: cls, classSource: 'entry', scheduledClassId: cls, lessonId: F.k, startTime: per.start, endTime: per.end,
      actualStartTime: per.start, actualEndTime: per.end, duration: 0, startProgress: pos, endProgress: pos, maxProgress: pos, lastPosition: pos,
      parts: part, enteredAt: new Date().toISOString() });
    put('tp_hist_v1', h);
    if (window.V82 && V82.tick) V82.tick();
    if (typeof clsRender === 'function') clsRender();
  }
  var _v101render = clsRender;
  clsRender = function () { var r = _v101render.apply(this, arguments); try { renderEntry(); } catch (e) {} return r; };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/115_v104-keepscroll-js.js ════ */
try {

/* v104：日曆點題目／按鈕時不要跳回頂部（老師 10/1）。
   原因：v98 每次點擊都整個重畫 .v98-box，右側面板與題目格的捲動位置被重設。
   做法：記住各捲動區的位置，重畫後（MutationObserver，畫面更新前）放回；換日期時編輯區才回頂部。 */
(function () {
  var SEL = ['.v98-ed', '.v102-qgrid', '.v98-up', '.v98-main', '.v98-grid'];
  var pos = {}, lastDate = null;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? c.getAttribute('data-v98') : ''; }
  function hook() {
    var m = document.getElementById('v98-cal'); if (!m || m.__v104) return; m.__v104 = 1;
    m.addEventListener('scroll', function (e) {
      var t = e.target; if (!t || !t.matches) return;
      SEL.forEach(function (s) { if (t.matches('#v98-cal ' + s)) pos[s] = t.scrollTop; });
    }, true);
    new MutationObserver(function () {
      var d = selDate();
      if (d !== lastDate) { lastDate = d; pos['.v98-ed'] = 0; pos['.v102-qgrid'] = 0; return; }
      SEL.forEach(function (s) { var el = m.querySelector(s); if (el && pos[s] && el.scrollTop !== pos[s]) el.scrollTop = pos[s]; });
    }).observe(m, { childList: true, subtree: true });
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); hook(); return r; }; }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/119_v106-grade-js.js ════ */
try {

(function () {
  'use strict';
  /* ── 綁定 Google 後，把 Apps Script 網頁應用程式網址貼在這裡（或在「設定」貼上，存在本裝置）──
     網址本身不是秘密；寫入一律需要「登記密碼」（Apps Script 端驗證）。HTML 內不放任何學生資料。 */
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';
  var TUTOR_G_URL = 'https://script.google.com/a/macros/mail2.ccvs.kh.edu.tw/s/AKfycbyW9KydiQ5kg8Mo7-JpBEHZVmmVg5Sgcor7nBO12lWU7zSBVQtle8bwEsdIK3VO2KsG/exec';   /* gr-5：小老師「Google 登入」用的第二個部署（存取權＝網域內）網址；老師部署後填入 */
  var K = { url: 'gr_url_v1', pw: 'gr_pw_v1', cls: 'gr_cls_v1', tab: 'gr_tab_v1', demo: 'gr_demo_v1', seat: 'gr_seat_v1' };   /* seat：座位表（只有座號，無姓名；雲端同步） */
  var TYPES = [
    { k: '註釋小考', cat: '考試', late: true }, { k: 'A卷', cat: '考試', late: true },
    { k: '習作', cat: '作業', late: true }, { k: '回家考卷', cat: '作業', late: true },
    { k: '筆記', cat: '筆記', late: false }, { k: '態度', cat: '態度', late: false },
    { k: '一段', cat: '一段', late: false }, { k: '二段', cat: '二段', late: false }, { k: '三段', cat: '三段', late: false }
  ];
  var CATS = ['一段', '二段', '三段', '筆記', '態度', '作業', '考試'];
  /* 配分預設值是「暫定」，老師尚未提供（規格 §8）；請在「設定 → 配分」改 */
  var DEF_W = { 一段: 20, 二段: 20, 三段: 20, 筆記: 10, 態度: 10, 作業: 10, 考試: 10, 習作: 1, 回家考卷: 1, zeroMissing: false, tentative: true };
  var REASONS = ['睡覺', '吵鬧', '遲到', '其他'];
  var PEN = 10;                       /* 遲交每一上課日扣 10 分 */
  var LES = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐' };
  var TABLE_KEY = { students: ['cls', 'seat'], items: ['id'], scores: ['item', 'seat'], weights: ['cls'], points: ['id'], holidays: ['date'] };
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];   /* 同 V82 預設課表 */

  /* ── 工具 ── */
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function sget(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function sput(k, v) { try { if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function addD(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function md(s) { if (!s) return ''; var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function now() {   /* 與 V82 共用測試時間（V82.fakeNow） */
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function today() { return ymd(now()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function uid(p) { return (p || 'g') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function num(v) { if (v === '' || v == null) return null; var n = +v; return isFinite(n) ? n : null; }
  function r1(v) { return v == null ? '' : (Math.round(v * 10) / 10).toString(); }
  function typeOf(k) { return TYPES.filter(function (t) { return t.k === k; })[0] || TYPES[0]; }
  function keyOf(t, o) { return TABLE_KEY[t].map(function (k) { return String(o[k] == null ? '' : o[k]); }).join('|'); }

  /* ── 上課日、課表 ── */
  function offSet() {
    var s = {};
    (D.holidays || []).forEach(function (h) { if (h.date) s[h.date] = h.label || '放假'; });
    try { (window.V101 && V101.events || []).forEach(function (e) { if (e.c !== 'off') return; for (var d = e.from; d <= (e.to || e.from); d = addD(d, 1)) s[d] = e.t; }); } catch (e) {}
    return s;
  }
  function isSchool(s, off) { var w = parse(s).getDay(); return w >= 1 && w <= 5 && !(off || offSet())[s]; }
  function isExamDay(s) { try { return (window.V101 && V101.eventsOn(s) || []).some(function (e) { return e.c === 'exam'; }); } catch (e) { return false; } }
  /* a 之後（不含）到 b（含）有幾個上課日 */
  function schoolDaysBetween(a, b) {
    if (!a || !b || b <= a) return 0;
    var off = offSet(), n = 0, d = addD(a, 1), guard = 0;
    while (d <= b && guard++ < 500) { if (isSchool(d, off)) n++; d = addD(d, 1); }
    return n;
  }
  function nextSchoolDay(s) { var off = offSet(), d = addD(s, 1), g = 0; while (!isSchool(d, off) && g++ < 60) d = addD(d, 1); return d; }
  function meets(cls, s) {
    var w = parse(s).getDay(), sc = get('tp_schedule_v1', null);
    if (sc && sc.slots) return sc.slots.some(function (x) { return x.wd === w && x.normal !== false && x.cls === cls; });
    return DEF_SLOTS.some(function (x) { return x[0] === w && x[2] === cls; });
  }
  /* 該班下一節國文課（跳過放假、段考） */
  function nextLesson(cls, s) {
    var off = offSet(), d = addD(s, 1), g = 0;
    while (g++ < 90) { if (isSchool(d, off) && !isExamDay(d) && meets(cls, d)) return d; d = addD(d, 1); }
    return '';
  }
  function curPeriod(cls) {
    try { var c = window.V82 && V82.currentSlot && V82.currentSlot(); if (c && c.period && (!c.cls || c.cls === cls)) return c.period; } catch (e) {}
    return '';
  }

  /* ── 計分 ── */
  /* v110：請假分兩種，存在 leave 欄前綴——「考:日期」考試請假（不計遲交，顯示未補考）；「交:日期」繳交請假（期限延到該班該日之後下一節國文課）；
     舊格式（只有日期）＝返校日（v106 原規則：期限延到返校隔日） */
  function leaveOf(sc) { var v = sc && sc.leave ? String(sc.leave) : '', m = /^(考|交):(\d{4}-\d{2}-\d{2})$/.exec(v); return m ? { k: m[1], d: m[2] } : { k: v ? '返' : '', d: v }; }
  function lateOf(it, sc, td) {
    if (!it.late || !it.due) return 0;
    var dl = it.due;
    var lo = leaveOf(sc);
    if (lo.k === '考') return 0;   /* v110：考試請假＝等補考，不計遲交 */
    if (lo.k === '交') { var nl = nextLesson(it.cls, lo.d) || nextSchoolDay(lo.d); if (nl > dl) dl = nl; }   /* v110：繳交請假＝延到下一節國文課 */
    else if (lo.d) { var nx = nextSchoolDay(lo.d); if (nx > dl) dl = nx; }   /* 請假：補交期限＝返校隔日 */
    return schoolDaysBetween(dl, (sc && sc.sub) || td);
  }
  function finalOf(it, sc, td) {
    if (!sc || sc.raw == null) return null;
    return Math.max(0, sc.raw - PEN * lateOf(it, sc, td)) + (sc.bonus || 0);
  }
  function weights(cls) {
    var w = D.weights.filter(function (x) { return x.cls === cls; })[0], o = {};
    var j = {}; try { j = w ? JSON.parse(w.json) : {}; } catch (e) {}
    Object.keys(DEF_W).forEach(function (k) { o[k] = (k in j) ? j[k] : DEF_W[k]; });
    if (w) o.tentative = !!j.tentative;
    return o;
  }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function mix(pairs) {   /* [[值, 權重]...] 只算有值的，重新換算比例 */
    var s = 0, w = 0; pairs.forEach(function (p) { if (p[0] != null && p[1] > 0) { s += p[0] * p[1]; w += p[1]; } });
    return w ? s / w : null;
  }
  function summary(cls, seat, td) {
    var w = weights(cls), by = {};
    itemsOf(cls).forEach(function (it) {
      var sc = scoreOf(it.id, seat), f = finalOf(it, sc, td);
      if (f == null && w.zeroMissing && it.late && it.due && !(sc && sc.sub) && lateOf(it, sc, td) > 0) f = 0;
      if (f != null) (by[it.type] = by[it.type] || []).push(f);
    });
    var t = {}; Object.keys(by).forEach(function (k) { t[k] = avg(by[k]); });
    var c = { 一段: t['一段'], 二段: t['二段'], 三段: t['三段'], 筆記: t['筆記'], 態度: t['態度'],
      作業: mix([[t['習作'], w['習作']], [t['回家考卷'], w['回家考卷']]]),
      考試: mix([[t['註釋小考'], 1], [t['A卷'], 2]]) };   /* 考試＝註釋小考 1/3＋A卷 2/3 */
    Object.keys(c).forEach(function (k) { if (c[k] === undefined) c[k] = null; });
    c.total = mix(CATS.map(function (k) { return [c[k], +w[k] || 0]; }));
    c.byType = t;
    return c;
  }

  /* ── 資料 ── */
  var D = { students: [], items: [], scores: [], weights: [], points: [], holidays: [], log: [], tutors: [] };
  var SCI = {};   /* scores 索引 item|seat */
  function norm(r) {
    D.students = (r.students || []).map(function (s) { return { cls: s.cls, seat: +s.seat, sid: s.sid || '', name: s.name || '', active: s.active === '' || s.active == null ? 1 : +s.active }; })
      .filter(function (s) { return s.cls && s.seat > 0; }).sort(function (a, b) { return a.seat - b.seat; });
    D.items = (r.items || []).map(function (i) { return { id: i.id, cls: i.cls, type: i.type, title: i.title || '', lessons: i.lessons || '', issued: i.issued || '',
      due: i.due || '', late: String(i.late) === '1' || i.late === true, calId: i.calId || '', note: i.note || '', created: i.created || '', by: i.by || '' }; });   /* by：gr-5 小老師新增 */
    D.scores = (r.scores || []).map(function (s) { return { item: s.item, cls: s.cls, seat: +s.seat, raw: num(s.raw), sub: s.sub || '', leave: s.leave || '', bonus: num(s.bonus) || 0, upd: s.upd || '', by: s.by || '', chk: s.chk || '' }; });    D.log = (r.log || []).map(function (l) { return { ts: l.ts, who: l.who, item: l.item, cls: l.cls, seat: +l.seat, field: l.field, old: l.old, 'new': l['new'] }; });   /* gr-5：修改紀錄（只有老師登入才有） */
    D.tutors = r.tutors || [];
    D.weights = r.weights || []; D.points = (r.points || []).map(function (p) { return { id: p.id, ts: p.ts, date: p.date, period: p.period, cls: p.cls, seat: +p.seat, delta: +p.delta, reason: p.reason || '' }; });
    D.holidays = r.holidays || [];
    reindex();
  }
  function reindex() { SCI = {}; D.scores.forEach(function (s) { SCI[s.item + '|' + s.seat] = s; }); }
  /* gr-5 修改紀錄：舊值不是空白的變動＝「改過」→ 紅字 */
  function histOf(item, seat) { return D.log.filter(function (l) { return l.item === item && l.seat === seat; }).sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }); }
  function chgOf(item, seat, field) { return D.log.some(function (l) { return l.item === item && l.seat === seat && l.field === field && l.old !== ''; }); }
  var LOG_NAME = { raw: '分數', sub: '繳交日', leave: '請假', bonus: '訂正加分' };
  function logVal(f, v) { if (v === '' || v == null) return '（空白）'; if (f === 'leave') { var lo = leaveOf({ leave: v }); return (lo.k === '考' ? '考試請假 ' : lo.k === '交' ? '繳交請假 ' : '返校 ') + md(lo.d); } if (f === 'sub') return md(v); if (f === 'bonus') return '+' + v; return v; }
  function tsText(ts) { var d = new Date(ts); return isNaN(d) ? esc(ts) : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function scoreOf(item, seat) { return SCI[item + '|' + seat] || null; }
  function roster(cls) { return D.students.filter(function (s) { return s.cls === cls && s.active !== 0; }); }
  function itemsOf(cls) {
    return D.items.filter(function (i) { return i.cls === cls; }).sort(function (a, b) {
      var x = a.issued || a.due || '', y = b.issued || b.due || ''; return x === y ? (a.created < b.created ? 1 : -1) : (x < y ? 1 : -1); });
  }
  function itemById(id) { return D.items.filter(function (i) { return i.id === id; })[0] || null; }
  function wireScore(s) { return { item: s.item, cls: s.cls, seat: s.seat, raw: s.raw == null ? '' : s.raw, sub: s.sub, leave: s.leave, bonus: s.bonus || '', upd: s.upd }; }
  function wireItem(i) { return { id: i.id, cls: i.cls, type: i.type, title: i.title, lessons: i.lessons, issued: i.issued, due: i.due, late: i.late ? '1' : '0', calId: i.calId, note: i.note, created: i.created }; }

  /* ── 後台連線：Apps Script（正式）／本機示範 ── */
  function url() { return get(K.url, '') || GS_URL; }
  function isDemo() { return !url(); }
  function pw() { return sget(K.pw) || get(K.pw, ''); }
  function call(req) {
    if (isDemo()) return new Promise(function (ok) { setTimeout(function () { ok(demoCall(req)); }, 60); });
    if (req.pw === undefined) req.pw = pw();
    return fetch(url(), { method: 'POST', body: JSON.stringify(req), redirect: 'follow' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  /* 示範模式：資料只在這台裝置（localStorage gr_demo_v1），名單是假的「示範學生」 */
  function demoDB() {
    var db = get(K.demo, null);
    if (!db) {
      db = { students: [], items: [], scores: [], weights: [], points: [], holidays: [] };
      classes().forEach(function (c) { for (var i = 1; i <= 35; i++) db.students.push({ cls: c, seat: String(i), sid: '', name: '示範學生' + pad(i), active: '1' }); });
      put(K.demo, db);
    }
    return db;
  }
  function demoCall(req) {
    var db = demoDB();
    if (req.action === 'ping') return { ok: true, api: 'demo', hasPw: true };
    if (req.action === 'check') return { ok: true, admin: true };
    if (req.action === 'load') { var o = JSON.parse(JSON.stringify(db)); o.ok = true; o.admin = true; return o; }
    var t = req.table, list = db[t];
    if (!list) return { ok: false, error: '不明的資料表' };
    if (req.action === 'put') {
      var idx = {}; list.forEach(function (o, i) { idx[keyOf(t, o)] = i; });
      (req.rows || []).forEach(function (r) { var k = keyOf(t, r), c = {}; Object.keys(r).forEach(function (f) { c[f] = r[f] == null ? '' : String(r[f]); });
        if (k in idx) { var o = list[idx[k]]; Object.keys(c).forEach(function (f) { o[f] = c[f]; }); } else { idx[k] = list.length; list.push(c); } });
    } else if (req.action === 'del') {
      var kill = {}; (req.keys || []).forEach(function (k) { kill[k] = 1; });
      db[t] = list.filter(function (o) { return !kill[keyOf(t, o)]; });
      if (t === 'items') db.scores = db.scores.filter(function (s) { return !kill[s.item]; });
    }
    put(K.demo, db);
    return { ok: true };
  }

  /* 成績寫入佇列（輸入分數時批次送出，避免每格一次連線） */
  var pend = {}, flushing = false, ftimer = null;
  function queueScore(s) { pend[s.item + '|' + s.seat] = wireScore(s); setSt('待儲存 ' + Object.keys(pend).length + ' 筆'); clearTimeout(ftimer); ftimer = setTimeout(flush, 600); }
  function flush() {
    if (flushing) { clearTimeout(ftimer); ftimer = setTimeout(flush, 400); return; }
    var keys = Object.keys(pend); if (!keys.length) return;
    var rows = keys.map(function (k) { return pend[k]; }); flushing = true; setSt('儲存中…');
    call({ action: 'put', table: 'scores', rows: rows }).then(function (r) {
      flushing = false;
      if (!r.ok) throw new Error(r.error || '儲存失敗');
      keys.forEach(function (k) { if (pend[k] === rows[keys.indexOf(k)]) delete pend[k]; });
      setSt(Object.keys(pend).length ? '待儲存 ' + Object.keys(pend).length + ' 筆' : '✓ 已儲存');
      if (Object.keys(pend).length) flush();
    }).catch(function (e) { flushing = false; setSt('⚠ 未儲存 ' + Object.keys(pend).length + ' 筆（' + e.message + '）點此重試', true); });
  }
  function save(table, rows, msg) {
    setSt('儲存中…');
    return call({ action: 'put', table: table, rows: rows }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '儲存失敗'); setSt('✓ ' + (msg || '已儲存')); return r;
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert('儲存失敗：' + e.message); throw e; });
  }
  function remove(table, keys) {
    setSt('刪除中…');
    return call({ action: 'del', table: table, keys: keys }).then(function (r) { if (!r.ok) throw new Error(r.error || '刪除失敗'); setSt('✓ 已刪除'); return r; })
      .catch(function (e) { setSt('⚠ ' + e.message, true); alert('刪除失敗：' + e.message); throw e; });
  }

  /* ── 狀態 ── */
  var S = { tab: get(K.tab, 'proj'), cls: get(K.cls, '') || classes()[0] || '', item: '', admin: false, loaded: false, loadedAt: 0, loading: false,
    st: '', stErr: false, subDate: '', edit: null, imp: null, projItem: '', projView: 'item', reveal: {}, revealAll: false,
    ptMode: '+', ptReason: '睡覺', ptView: get('gr_ptview_v1', 'grid'), seatEdit: false, ptRange: 'today', undo: [], setCls: '', paste: '', preview: null, loadErr: '' };

  function load(force) {
    if (S.loading) return; if (S.loaded && !force && Date.now() - S.loadedAt < 60000) { render(); return; }
    S.loading = true; S.loadErr = ''; render();
    call({ action: 'load' }).then(function (r) {
      S.loading = false;
      if (!r.ok) throw new Error(r.error || '讀取失敗');
      norm(r); S.admin = !!r.admin; S.loaded = true; S.loadedAt = Date.now();
      if (!r.admin && pw() && !isDemo()) { sput(K.pw, ''); put(K.pw, null); S.loadErr = '登記密碼已失效，請重新登入'; }
      render();
    }).catch(function (e) { S.loading = false; S.loadErr = '讀取失敗：' + e.message + (isDemo() ? '' : '（請確認網路與 Apps Script 網址）'); render(); });
  }
  function login(p, remember) {
    if (!p) return;
    setSt('驗證中…');
    call({ action: 'check', pw: p }).then(function (r) {
      if (!r.ok || !r.admin) { setSt('⚠ 密碼錯誤', true); alert('密碼錯誤'); return; }
      sput(K.pw, p); if (remember) put(K.pw, p); setSt('✓ 已登入'); S.loaded = false; load(true);
    }).catch(function (e) { setSt('⚠ ' + e.message, true); });
  }
  function logout() { sput(K.pw, ''); put(K.pw, null); S.admin = false; S.loaded = false; load(true); }

  /* ── 畫面 ── */
  function box() {
    var m = document.getElementById('v106-gr'); if (m) return m;
    m = document.createElement('div'); m.id = 'v106-gr'; m.innerHTML = '<div class="gr-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', onClick);
    m.addEventListener('change', onChange);
    m.addEventListener('input', onInput);
    m.addEventListener('keydown', onKey);
    m.addEventListener('pointerdown', seatDown);
    window.addEventListener('pointermove', seatMove, { passive: false });
    window.addEventListener('pointerup', seatUp);
    window.addEventListener('pointercancel', function () { if (drag) { drag.g.remove(); drag = null; render(); } });
    return m;
  }
  function setSt(t, err) { S.st = t; S.stErr = !!err; var e = document.querySelector('#v106-gr .gr-st'); if (e) { e.textContent = t; e.className = 'gr-st' + (err ? ' err' : ''); } }
  function open(tab) {
    box().classList.add('open'); if (tab) S.tab = tab;
    if (!S.subDate) S.subDate = today();
    load(false);
  }
  function close() {
    var m = document.getElementById('v106-gr'); if (m) m.classList.remove('open');
    if (Object.keys(pend).length) flush();
  }

  function render() {
    var m = box(), b = m.querySelector('.gr-box'), sc = m.querySelector('.gr-pane');
    var keep = sc ? sc.scrollTop : 0;
    var tabs = [['reg', '✏️ 登記'], ['proj', '📽 投影'], ['pts', '⭐ 課堂加減分'], ['set', '⚙ 設定']];
    var h = '<div class="gr-top"><h3>📒 成績</h3>' +
      tabs.map(function (t) { return '<button data-g="tab|' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') +
      '<span class="gr-sp"></span><span class="gr-st' + (S.stErr ? ' err' : '') + '" data-g="retry">' + esc(S.st) + '</span>' +
      '<button data-g="reload" title="重新讀取">⟳</button>' +
      (isDemo() ? '' : (S.admin ? '<button data-g="logout">🔓 登出</button>' : '<button data-g="tab|reg">🔒 登入</button>')) +
      '<button data-g="x">✕</button></div>';
    h += '<div class="gr-cls">' + classes().map(function (c) { return '<button class="gr-chip' + (S.cls === c ? ' on' : '') + '" data-g="cls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
      '<span class="gr-muted" style="margin-left:auto">' + (isDemo() ? '示範模式' : (S.admin ? '已登入（可登記）' : '唯讀（投影）')) + '</span></div>';
    if (isDemo()) h += '<div class="gr-banner">⚠ 示範模式：尚未綁定 Google，資料只存在這台裝置，名單是假的「示範學生」。綁定方式見「⚙ 設定」。</div>';
    if (S.loadErr) h += '<div class="gr-banner" style="background:#fde8e6;color:#8a2a20">' + esc(S.loadErr) + '</div>';
    if (S.loading && !S.loaded) h += '<div class="gr-main"><div class="gr-pane">讀取中…</div></div>';
    else if (S.tab === 'reg') h += regHTML();
    else if (S.tab === 'proj') h += projHTML();
    else if (S.tab === 'pts') h += ptsHTML();
    else h += setHTML();
    if (S.hist && S.tab === 'reg' && S.admin) h += histHTML();   /* gr-5 */
    b.innerHTML = h;
    var np = m.querySelector('.gr-pane'); if (np && keep) np.scrollTop = keep;
  }

  function needLogin(msg) {
    return '<div class="gr-main"><div class="gr-pane"><div class="gr-sec" style="max-width:420px"><h5>🔒 ' + esc(msg || '登記需要密碼') + '</h5>' +
      '<div class="gr-row"><input type="password" id="gr-pw" placeholder="登記密碼" autocomplete="current-password" style="flex:1"></div>' +
      '<div class="gr-row"><label><input type="checkbox" id="gr-rem"> 在這台裝置記住（只勾老師自己的平板）</label></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="login">登入</button></div>' +
      '<p class="gr-muted">投影模式不需要密碼，只會顯示座號、繳交狀況與訂正加分（不顯示分數）。</p></div></div></div>';
  }

  /* ── 登記 ── */
  function itemLabel0(it) { return it.title || (it.type + (it.lessons ? ' L' + it.lessons.split(',').join('、L') : '')); }
  var NQK = { '身為魚販': 1, '世說新語選': 2, '師說': 3, '珍珠奶茶': 4, '臺灣最美麗的火車線': 5, '論語選—子路曾皙冉有公西華侍坐': 6 };   /* 同 v98 QK */
  function nqCode(it) {   /* v110 */
    if (it.type !== '註釋小考' || !it.issued) return '';
    var rs; try { rs = JSON.parse(localStorage.getItem('nq-records-v1') || '[]'); } catch (e) { return ''; }
    var ls = String(it.lessons || '').split(',').map(Number), best = null, bd = 99;
    (Array.isArray(rs) ? rs : []).forEach(function (r) {
      if (!r || !r.codes || !r.codes[it.cls] || ls.indexOf(NQK[r.lesson] || 0) < 0) return;
      var d = new Date(r.createdAt); if (isNaN(d)) return;
      var dd = Math.abs((parse(ymd(d)) - parse(it.issued)) / 864e5);
      if (dd < bd) { bd = dd; best = r; }
    });
    return best && bd <= 7 ? best.codes[it.cls] : '';
  }
  function itemLabel(it) {
    var t = itemLabel0(it);
    if (/^0\d{3}/.test(t)) return 'L' + t;   /* v112：老師自己在名稱打「0301（…）」＝考卷編號 L0301 */
    var cd = nqCode(it); return cd && t.indexOf(cd) < 0 ? cd + ' ' + t : t;
  }
  function regHTML() {
    if (!S.admin) return needLogin();
    var its = itemsOf(S.cls), n = roster(S.cls).length, td = today();
    if (S.item && !itemById(S.item)) S.item = '';
    var h = '<div class="gr-main"><div class="gr-side">' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="new">＋ 新增</button><button class="gr-btn" data-g="imp">📅 從日曆匯入</button></div>';
    if (!its.length) h += '<p class="gr-muted">這班還沒有考卷。按「＋ 新增」或「從日曆匯入」。</p>';
    its.forEach(function (it) {
      var got = roster(S.cls).filter(function (s) { var c = scoreOf(it.id, s.seat); return c && (c.raw != null || c.sub); }).length;
      var miss = it.late && it.due && it.due < td && got < n;
      var chg = D.log.some(function (l) { return l.item === it.id && l.old !== ''; });   /* gr-5 */
      h += '<button class="gr-it' + (S.item === it.id && !S.edit && !S.imp ? ' on' : '') + '" data-g="item|' + it.id + '"><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' +
        esc(itemLabel(it)) + (it.by ? ' <span class="gr-tag gr-tut">小老師新增</span>' : '') + (chg ? ' <span class="gr-chgt" title="有成績被改過">改過</span>' : '') + '<small>' + (it.issued ? md(it.issued) + ' 發　' : '') + (it.due ? '期限 ' + md(it.due) : '無期限') +
        '　<span class="' + (miss ? 'late' : '') + '">' + got + '/' + n + '</span></small></button>';
    });
    h += '</div><div class="gr-pane">';
    if (S.imp) h += impHTML();
    else if (S.edit) h += editHTML();
    else if (S.item) h += sheetHTML(itemById(S.item));
    else h += '<p class="gr-muted">← 選一份考卷開始登記。</p>' + (n ? '' : '<p class="late">這班還沒有學生名單，請到「⚙ 設定 → 學生名單」匯入。</p>');
    return h + '</div></div>';
  }
  function sheetHTML(it) {
    var td = today(), st = roster(S.cls), fins = [];
    st.forEach(function (s) { var f = finalOf(it, scoreOf(it.id, s.seat), td); if (f != null) fins.push(f); });
    var h = '<div class="gr-h"><h4><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' + esc(itemLabel(it)) + '</h4>' +
      '<span class="gr-muted">' + (it.due ? '期限 ' + md(it.due) + (it.late ? '（遲交每上課日 −' + PEN + '）' : '（不扣遲交）') : '無期限') +
      '　已登記 ' + fins.length + '/' + st.length + (fins.length ? '　平均 ' + r1(avg(fins)) : '') + '</span>' +
      '<button class="gr-btn" data-g="b10|' + it.id + '" title="這份考卷已交（或有分數）的人，訂正加分一次設成 +10；其他分數再個別手動調整">已交的訂正 +10</button>' +   /* v110 */
      (function () { var n = D.log.filter(function (l) { return l.item === it.id && l.old !== ''; }).length;   /* gr-5 */
        return '<button class="gr-btn' + (n ? ' gr-chgb' : '') + '" data-g="hist|' + it.id + '|0">📜 修改紀錄' + (n ? '（' + n + '）' : '') + '</button>'; })() +
      '<button class="gr-btn" data-g="edit|' + it.id + '">編輯</button></div>' +
      (it.by ? '<p class="gr-muted" style="margin:0 0 6px">這份是小老師 ' + esc(it.by) + ' 新增的' + (it.note && it.note !== '小老師新增' ? '（' + esc(it.note) + '）' : '') + '，請確認類型、期限。</p>' : '') +
      '<div class="gr-row"><label class="k">繳交日期</label><input type="date" id="gr-subdate" value="' + esc(S.subDate) + '">' +
      '<span class="gr-muted">按「已交」或輸入分數時記這天（補登時改這裡）</span></div>';
    if (!st.length) return h + '<p class="late">這班還沒有學生名單。</p>';
    h += '<table class="gr-t"><thead><tr><th>座號</th><th>姓名</th><th>分數</th><th>繳交</th><th>請假</th><th>遲交</th><th>訂正</th><th>最後成績</th></tr></thead><tbody>';
    st.forEach(function (s) { h += rowHTML(it, s, td); });
    return h + '</tbody></table>';
  }
  function rowHTML(it, s, td) {
    var c = scoreOf(it.id, s.seat) || {}, L = lateOf(it, c, td), f = finalOf(it, c.raw != null ? c : null, td), id = it.id + '|' + s.seat;
    var sub = c.sub ? '<input type="date" data-g="sub|' + id + '" value="' + esc(c.sub) + '"><button class="gr-x" data-g="unsub|' + id + '" title="取消已交">✕</button>'
      : '<button class="gr-btn" data-g="done|' + id + '">已交</button>';
    var lo = leaveOf(c);   /* v110 */
    var lv = lo.k ? '<span class="v110-lv' + (lo.k === '考' ? ' x' : '') + '">' + (lo.k === '考' ? '考試請假' : lo.k === '交' ? '繳交請假' : '返校') + '</span><input type="date" data-g="leave|' + id + '" value="' + esc(lo.d) + '"><button class="gr-x" data-g="unleave|' + id + '" title="取消請假">✕</button>'
      : '<button class="gr-btn v110-lb" data-g="lvx|' + id + '">考試請假</button><button class="gr-btn v110-lb" data-g="lvs|' + id + '">繳交請假</button>';
    var late = L ? '<span class="late">' + (c.sub ? '遲' : '逾期') + L + '天 −' + (L * PEN) + '</span>' : '';
    if (!late && lo.k === '考' && c.raw == null) late = '<span class="late">未補考</span>';   /* v110 */
    var bo = '<select data-g="bonus|' + id + '">' + [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return '<option value="' + n + '"' + ((c.bonus || 0) === n ? ' selected' : '') + '>' + (n ? '+' + n : '—') + '</option>'; }).join('') + '</select>';
    /* gr-5：改過的格子紅框紅字；姓名下方小字＝小老師登記者／✓檢查者／📜修改紀錄 */
    var cg = function (f) { return chgOf(it.id, s.seat, f) ? ' gr-chg' : ''; }, hs = histOf(it.id, s.seat), anyChg = hs.some(function (l) { return l.old !== ''; });
    var who = (c.by ? '<span class="gr-muted">' + esc(String(c.by).replace(it.cls, '')) + '</span>' : '') +
      (c.chk ? ' <span class="pos" title="' + esc(c.chk) + '">✓' + esc(String(c.chk).split('@')[0].replace(it.cls, '')) + '</span>' : '') +
      (hs.length ? ' <button class="gr-x' + (anyChg ? ' gr-chgb' : '') + '" data-g="hist|' + id + '" title="修改紀錄">📜</button>' : '');
    return '<tr data-row="' + id + '" class="' + (c.raw != null || c.sub ? 'done' : '') + '"><td>' + s.seat + '</td><td class="nm">' + esc(s.name) + (who ? '<small class="gr-who">' + who + '</small>' : '') + '</td>' +
      '<td class="' + cg('raw') + '"><input class="gr-sc" type="text" inputmode="decimal" data-g="raw|' + id + '" value="' + (c.raw == null ? '' : c.raw) + '"></td>' +
      '<td class="' + cg('sub') + '">' + sub + '</td><td class="' + cg('leave') + '">' + lv + '</td><td>' + late + '</td><td class="' + cg('bonus') + '">' + bo + '</td><td class="fin">' + (f == null ? '' : r1(f)) + '</td></tr>';
  }
  /* gr-5：修改紀錄視窗（單一學生，或 seat 為 0＝整份考卷只列「改過」的） */
  function histHTML() {
    var q = S.hist, it = itemById(q.item); if (!it) return '';
    var ls = q.seat ? histOf(q.item, q.seat) : D.log.filter(function (l) { return l.item === q.item && l.old !== ''; }).sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    var st = q.seat ? roster(it.cls).filter(function (s) { return s.seat === q.seat; })[0] : null;
    var h = '<div class="gr-hist"><div class="gr-hbox"><div class="gr-h"><h4>📜 ' + esc(itemLabel(it)) + (q.seat ? '　' + q.seat + '號 ' + esc(st ? st.name : '') : '　改過的紀錄') + '</h4>' +
      '<span class="gr-sp" style="flex:1"></span><button class="gr-btn" data-g="histx">關閉</button></div>';
    if (!ls.length) return h + '<p class="gr-muted">' + (q.seat ? '沒有紀錄。' : '這份沒有被改過的成績。') + '</p></div></div>';
    h += '<table class="gr-t"><thead><tr><th>時間</th>' + (q.seat ? '' : '<th>座號</th>') + '<th>誰</th><th>欄位</th><th>舊值</th><th></th><th>新值</th></tr></thead><tbody>';
    ls.forEach(function (l) {
      var chg = l.old !== '';
      h += '<tr' + (chg ? ' class="gr-chgr"' : '') + '><td>' + tsText(l.ts) + '</td>' + (q.seat ? '' : '<td><b>' + l.seat + '</b></td>') + '<td>' + esc(l.who) + '</td><td>' + esc(LOG_NAME[l.field] || l.field) + '</td>' +
        '<td>' + esc(logVal(l.field, l.old)) + '</td><td>' + (chg ? '→' : '新登記') + '</td><td>' + esc(logVal(l.field, l['new'])) + '</td></tr>';
    });
    return h + '</tbody></table><p class="gr-muted">紅色＝登記後又被改過。第一次登記（舊值空白）照常顯示。</p></div></div>';
  }
  function refreshRow(item, seat) {
    var it = itemById(item), s = roster(S.cls).filter(function (x) { return x.seat === seat; })[0];
    var tr = document.querySelector('#v106-gr tr[data-row="' + item + '|' + seat + '"]');
    if (!it || !s || !tr) { render(); return; }
    var t = document.createElement('tbody'); t.innerHTML = rowHTML(it, s, today()); tr.parentNode.replaceChild(t.firstChild, tr);
    var side = document.querySelector('#v106-gr .gr-side'); if (side) { var st = side.scrollTop; var tmp = document.createElement('div'); tmp.innerHTML = regHTML(); var ns = tmp.querySelector('.gr-side'); if (ns) { side.innerHTML = ns.innerHTML; side.scrollTop = st; } }
  }
  function patchScore(item, seat, p) {
    var it = itemById(item); if (!it) return;
    var c = scoreOf(item, seat);
    if (!c) { c = { item: item, cls: it.cls, seat: seat, raw: null, sub: '', leave: '', bonus: 0, upd: '', by: '', chk: '' }; D.scores.push(c); SCI[item + '|' + seat] = c; }
    var ts = new Date().toISOString(), sv = function (f, v) { return v == null || (f === 'bonus' && !v) ? '' : String(v); };
    Object.keys(p).forEach(function (k) {   /* gr-5：畫面先記一筆（後台也會記同樣的），紅字馬上出現 */
      if (LOG_NAME[k] && sv(k, c[k]) !== sv(k, p[k])) D.log.push({ ts: ts, who: '老師', item: item, cls: it.cls, seat: seat, field: k, old: sv(k, c[k]), 'new': sv(k, p[k]) });
      c[k] = p[k];
    });
    c.upd = ts;
    queueScore(c); refreshRow(item, seat);
  }

  /* 新增／編輯考卷 */
  function lessonsOf(str) { return String(str || '').split(',').filter(Boolean).map(Number); }
  function editHTML() {
    var e = S.edit, isNew = !e.id, ty = typeOf(e.type);
    var h = '<div class="gr-h"><h4>' + (isNew ? '新增考卷／成績項目' : '編輯：' + esc(itemLabel(e))) + '</h4></div><div class="gr-sec">';
    if (isNew) h += '<div class="gr-row"><label class="k">班級</label>' + classes().map(function (c) { return '<button class="gr-chip' + (e.clsList.indexOf(c) >= 0 ? ' on' : '') + '" data-g="ecls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">類型</label>' + TYPES.map(function (t) { return '<button class="gr-chip' + (e.type === t.k ? ' on' : '') + '" data-g="etype|' + t.k + '">' + t.k + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">課次</label>' + [1,2,3,4,5,6,7,8,9,10,11,12].map(function (n) { return '<button class="gr-chip' + (lessonsOf(e.lessons).indexOf(n) >= 0 ? ' on' : '') + '" data-g="eles|' + n + '" title="' + esc(LES[n] || '') + '">L' + n + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-row"><label class="k">名稱</label><input type="text" id="gr-etitle" value="' + esc(e.title) + '" placeholder="空白＝自動（' + esc(itemLabel({ type: e.type, lessons: e.lessons })) + '）" style="flex:1;min-width:220px"></div>';
    h += '<div class="gr-row"><label class="k">發下／考試日</label><input type="date" id="gr-eissued" value="' + esc(e.issued) + '"></div>';
    var autoDue = e.type === '註釋小考';
    h += '<div class="gr-row"><label class="k">繳交期限</label>';
    if (autoDue && isNew) h += '<span>自動＝各班下一節國文課：' + e.clsList.map(function (c) { return esc(c) + ' ' + (e.issued ? md(nextLesson(c, e.issued)) || '（找不到）' : '—'); }).join('、') + '</span>';
    else h += '<input type="date" id="gr-edue" value="' + esc(e.due) + '">' + (autoDue && e.issued ? '<button class="gr-btn" data-g="eauto">改成下一節課（' + md(nextLesson(e.cls, e.issued)) + '）</button>' : '');
    h += '</div>';
    h += '<div class="gr-row"><label class="k">遲交扣分</label><label><input type="checkbox" id="gr-elate"' + (e.late ? ' checked' : '') + '> 逾期每一上課日 −' + PEN + ' 分（' + esc(ty.k) + ' 預設' + (ty.late ? '扣' : '不扣') + '）</label></div>';
    h += '<div class="gr-row"><label class="k">備註</label><input type="text" id="gr-enote" value="' + esc(e.note) + '" style="flex:1"></div>';
    h += '<div class="gr-row" style="margin-top:10px"><button class="gr-btn pri" data-g="esave">' + (isNew ? '建立' : '儲存') + '</button><button class="gr-btn" data-g="ecancel">取消</button>' +
      (isNew ? '' : '<span class="gr-sp" style="flex:1"></span><button class="gr-btn warn" data-g="edel">刪除這份（含成績）</button>') + '</div></div>';
    return h;
  }
  function readEdit() {
    var e = S.edit, q = function (id) { return document.getElementById(id); };
    if (q('gr-etitle')) e.title = q('gr-etitle').value.trim();
    if (q('gr-eissued')) e.issued = q('gr-eissued').value;
    if (q('gr-edue')) e.due = q('gr-edue').value;
    if (q('gr-elate')) e.late = q('gr-elate').checked;
    if (q('gr-enote')) e.note = q('gr-enote').value.trim();
  }
  function saveEdit() {
    readEdit(); var e = S.edit;
    if (!e.id) {
      if (!e.clsList.length) { alert('請選班級'); return; }
      var rows = e.clsList.map(function (c) {
        return { id: uid('i'), cls: c, type: e.type, title: e.title, lessons: e.lessons, issued: e.issued,
          due: e.type === '註釋小考' && e.issued ? nextLesson(c, e.issued) : e.due, late: e.late, calId: e.calId || '', note: e.note, created: new Date().toISOString() };
      });
      if (rows.some(function (r) { return r.late && !r.due; }) && !confirm('沒有繳交期限，不會計算遲交。確定建立？')) return;
      save('items', rows.map(wireItem), '已建立').then(function () {
        rows.forEach(function (r) { D.items.push(r); });
        var mine = rows.filter(function (r) { return r.cls === S.cls; })[0];
        S.edit = null; S.item = mine ? mine.id : ''; render();
      });
    } else {
      var it = itemById(e.id); if (!it) return;
      var n = { id: it.id, cls: it.cls, type: e.type, title: e.title, lessons: e.lessons, issued: e.issued, due: e.due, late: e.late, calId: it.calId, note: e.note, created: it.created };
      save('items', [wireItem(n)]).then(function () { Object.keys(n).forEach(function (k) { it[k] = n[k]; }); S.edit = null; render(); });
    }
  }
  function delItem(id) {
    var it = itemById(id); if (!it) return;
    var n = D.scores.filter(function (s) { return s.item === id && (s.raw != null || s.sub); }).length;
    if (!confirm('刪除「' + S.cls + '・' + itemLabel(it) + '」' + (n ? '以及已登記的 ' + n + ' 筆成績' : '') + '？此動作無法復原。')) return;
    remove('items', [id]).then(function () {
      D.items = D.items.filter(function (i) { return i.id !== id; }); D.scores = D.scores.filter(function (s) { return s.item !== id; }); reindex();
      S.edit = null; S.item = ''; render();
    });
  }

  /* 從 V98 日曆匯入（A卷、習作、註釋小考、課後習題、其他） */
  var CAL_MAP = { 'A卷': 'A卷', '習作': '習作', '註釋小考': '註釋小考', '課後習題': '回家考卷', '其他': '回家考卷' };
  function calEntries() {
    var a = []; try { a = (window.V98CAL && V98CAL.data()) || []; } catch (e) {}
    var have = {}; D.items.forEach(function (i) { if (i.calId) have[i.calId] = 1; });
    return a.filter(function (e) { return e.cls === S.cls && CAL_MAP[e.item] && e.kind !== '檢討' && !have[e.id]; })
      .sort(function (x, y) { return x.date < y.date ? 1 : -1; });
  }
  function calTitle(e) {
    var L = (e.lessons || []).slice().sort(function (a, b) { return a - b; }).map(function (n) { return 'L' + n; }).join('、');
    if (e.item === '註釋小考') { var q = e.quiz || {}; return '註釋小考 ' + L + (q.a ? '（註' + q.a + '–' + q.b + '）' : ''); }
    var it = e.item === '其他' ? (e.note || '其他') : e.item;
    return it + (L ? ' ' + L : '') + (e.item !== '其他' && e.note ? '（' + e.note + '）' : '');
  }
  function impHTML() {
    var es = calEntries();
    var h = '<div class="gr-h"><h4>📅 從日曆匯入（' + esc(S.cls) + '）</h4><button class="gr-btn" data-g="impx">返回</button></div>';
    if (!es.length) return h + '<p class="gr-muted">日曆上這班沒有尚未匯入的 A卷／習作／註釋小考／課後習題。</p>';
    h += '<p class="gr-muted">考試＝當天考、期限同一天；交作業＝期限是那天；註釋小考＝期限自動排到下一節國文課。</p>';
    h += '<table class="gr-t"><thead><tr><th></th><th>日期</th><th>日曆項目</th><th>匯入成</th><th>期限</th></tr></thead><tbody>';
    es.forEach(function (e) {
      var ty = S.imp.type[e.id] || CAL_MAP[e.item], on = S.imp.pick[e.id] !== false;
      h += '<tr><td><input type="checkbox" data-g="ipick|' + e.id + '"' + (on ? ' checked' : '') + '></td><td>' + md(e.date) + '</td><td class="nm">' + esc(calTitle(e)) + '（' + esc(e.kind) + '）</td>' +
        '<td><select data-g="itype|' + e.id + '">' + TYPES.map(function (t) { return '<option' + (t.k === ty ? ' selected' : '') + '>' + t.k + '</option>'; }).join('') + '</select></td>' +
        '<td>' + md(ty === '註釋小考' ? nextLesson(S.cls, e.date) : e.date) + '</td></tr>';
    });
    return h + '</tbody></table><div class="gr-row" style="margin-top:10px"><button class="gr-btn pri" data-g="impgo">匯入勾選的項目</button></div>';
  }
  function doImport() {
    var rows = calEntries().filter(function (e) { return S.imp.pick[e.id] !== false; }).map(function (e) {
      var ty = S.imp.type[e.id] || CAL_MAP[e.item];
      return { id: uid('i'), cls: e.cls, type: ty, title: calTitle(e), lessons: (e.lessons || []).join(','), issued: e.kind === '考試' ? e.date : '',
        due: ty === '註釋小考' ? nextLesson(e.cls, e.date) : e.date, late: typeOf(ty).late, calId: e.id, note: '', created: new Date().toISOString() };
    });
    if (!rows.length) return;
    save('items', rows.map(wireItem), '已匯入 ' + rows.length + ' 份').then(function () { rows.forEach(function (r) { D.items.push(r); }); S.imp = null; S.item = rows[0].id; render(); });
  }

  /* ── 投影（v110：只顯示座號、已交／未交逾期扣分／請假、訂正加分；不顯示分數） ── */
  function projHTML() {
    var its = itemsOf(S.cls), st = roster(S.cls), td = today();
    if (!st.length) return '<div class="gr-main"><div class="gr-pane"><p class="gr-muted">這班還沒有學生名單。</p></div></div>';
    if (!S.projItem || !itemById(S.projItem) || itemById(S.projItem).cls !== S.cls) S.projItem = its[0] ? its[0].id : '';
    var h = '<div class="gr-main"><div class="gr-pane"><div class="gr-h">' +
      '<button class="gr-chip' + (S.projView === 'item' ? ' on' : '') + '" data-g="pv|item">單份考卷</button>' +
      '';   /* v110：投影不顯示成績，拿掉「各項平均」 */
    S.projView = 'item';
    if (S.projView === 'item') {
      h += '<select id="gr-pitem" style="font-size:16px;max-width:420px">' + its.map(function (it) { return '<option value="' + it.id + '"' + (it.id === S.projItem ? ' selected' : '') + '>' +
        esc(itemLabel(it)) + (it.due ? '（期限 ' + md(it.due) + '）' : '') + '</option>'; }).join('') + '</select></div>';
      var it = itemById(S.projItem);
      if (!it) return h + '<p class="gr-muted">這班還沒有考卷。</p></div></div>';
      var miss = [], cards = '';
      st.forEach(function (s) {
        var c = scoreOf(it.id, s.seat), L = lateOf(it, c, td), f = finalOf(it, c, td), has = c && (c.raw != null || c.sub);
        if (!has) {
          if (L) miss.push(s.seat);
          cards += '<div class="gr-card' + (L ? ' miss' : '') + '"><b>' + s.seat + '</b><div class="v">' + (L ? '未交' : (leaveOf(c).k === '考' ? '未補考' : '—')) + '</div><div class="s">' + (L ? '<span class="late">逾期' + L + '天 −' + L * PEN + '</span>' : (c && c.leave ? (leaveOf(c).k === '考' ? '考試請假' : '請假') : '')) + '</div></div>';
        } else {
          cards += '<div class="gr-card"><b>' + s.seat + '</b><div class="v">✓</div><div class="s">' +   /* v110：投影不顯示分數 */
            (L ? '<span class="late">遲' + L + '天 −' + L * PEN + '</span>' : '') + (c.bonus ? ' <span class="pos">訂正+' + c.bonus + '</span>' : '') + '</div></div>';
        }
      });
      h += '<p style="font-size:17px;margin:4px 0 10px">' + (it.due ? '期限 <b>' + md(it.due) + '</b>　' : '') +
        (miss.length ? '<span class="late">未交（已逾期）：' + miss.join('、') + '</span>' : '<span class="pos">沒有逾期未交</span>') + '</p>';
      return h + '<div class="gr-cards">' + cards + '</div></div></div>';
    }
    h += '<button class="gr-btn" data-g="revall">' + (S.revealAll ? '全部遮起來' : '全部顯示') + '</button><span class="gr-muted">點格子才顯示</span></div>';
    h += '<table class="gr-t"><thead><tr><th>座號</th>' + CATS.map(function (k) { return '<th>' + k + '</th>'; }).join('') + '<th>目前平均</th></tr></thead><tbody>';
    st.forEach(function (s) {
      var sm = summary(S.cls, s.seat, td);
      h += '<tr><td><b>' + s.seat + '</b></td>' + CATS.concat(['total']).map(function (k) {
        var key = s.seat + '|' + k, shown = S.revealAll || S.reveal[key];
        return '<td class="gr-mask' + (shown ? '' : ' m') + '" data-g="rev|' + key + '"><span' + (k === 'total' ? ' class="fin"' : '') + '>' + (sm[k] == null ? '—' : r1(sm[k])) + '</span></td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table>' + (weights(S.cls).tentative ? '<p class="gr-muted">（配分尚未設定，目前用暫定比例）</p>' : '') + '</div></div>';
  }

  /* ── 課堂加減分（記錄用，不自動併入態度） ── */
  function ptsHTML() {
    var st = roster(S.cls), td = today();
    var h = '<div class="gr-main"><div class="gr-pane"><div class="gr-h">' +
      '<button class="gr-chip' + (S.ptView === 'seat' ? ' on' : '') + '" data-g="ptv|seat">座位表</button>' +
      '<button class="gr-chip' + (S.ptView === 'grid' ? ' on' : '') + '" data-g="ptv|grid">座號方格</button>' +
      '<button class="gr-chip' + (S.ptView === 'stat' ? ' on' : '') + '" data-g="ptv|stat">統計</button><span style="width:14px"></span>';
    if (S.ptView === 'stat') {
      h += '<button class="gr-chip' + (S.ptRange === 'today' ? ' on' : '') + '" data-g="ptr|today">今天</button><button class="gr-chip' + (S.ptRange === 'all' ? ' on' : '') + '" data-g="ptr|all">本學期</button></div>';
      var P = D.points.filter(function (p) { return p.cls === S.cls && (S.ptRange === 'all' || p.date === td); });
      h += '<table class="gr-t" style="max-width:640px"><thead><tr><th>座號</th><th>加分</th><th>扣分</th><th>合計</th><th>扣分原因</th></tr></thead><tbody>';
      st.forEach(function (s) {
        var mine = P.filter(function (p) { return p.seat === s.seat; }), plus = 0, minus = 0, why = {};
        mine.forEach(function (p) { if (p.delta > 0) plus += p.delta; else { minus += p.delta; why[p.reason || '其他'] = (why[p.reason || '其他'] || 0) + 1; } });
        h += '<tr><td><b>' + s.seat + '</b></td><td class="pos">' + (plus ? '+' + plus : '') + '</td><td class="neg">' + (minus || '') + '</td><td class="fin ' + (plus + minus > 0 ? 'pos' : plus + minus < 0 ? 'neg' : '') + '">' + (mine.length ? (plus + minus > 0 ? '+' : '') + (plus + minus) : '') + '</td><td class="gr-muted">' +
          Object.keys(why).map(function (k) { return esc(k) + '×' + why[k]; }).join('、') + '</td></tr>';
      });
      return h + '</tbody></table><p class="gr-muted">課堂加減分只做紀錄，不會自動計入態度成績。</p></div></div>';
    }
    if (!S.admin) return h + '</div>' + needLogin('課堂加減分需要登入').replace('<div class="gr-main"><div class="gr-pane">', '').replace(/<\/div><\/div>$/, '') + '</div></div>';
    h += '<button class="gr-chip grn' + (S.ptMode === '+' ? ' on' : '') + '" data-g="ptm|+">＋ 加分</button>' +
      '<button class="gr-chip red' + (S.ptMode === '-' ? ' on' : '') + '" data-g="ptm|-">－ 扣分</button>';
    if (S.ptMode === '-') h += '<span class="gr-muted">原因：</span>' + REASONS.map(function (r) { return '<button class="gr-chip red' + (S.ptReason === r ? ' on' : '') + '" data-g="ptw|' + r + '">' + r + '</button>'; }).join('');
    h += '<span style="flex:1"></span><button class="gr-btn" data-g="ptundo"' + (S.undo.length ? '' : ' disabled') + '>↶ 復原上一筆</button></div>';
    var per = curPeriod(S.cls);
    h += '<p class="gr-muted">' + md(td) + (per ? ' 第' + per + '節' : '（現在不在課表節次內）') + '　點座號＝' + (S.ptMode === '+' ? '加 1 分' : '扣 1 分（' + esc(S.ptReason) + '）') + '　數字＝今天累計</p>';
    if (!st.length) return h + '<p class="late">這班還沒有學生名單。</p></div></div>';
    var tot = {}; D.points.forEach(function (p) { if (p.cls === S.cls && p.date === td) tot[p.seat] = (tot[p.seat] || 0) + p.delta; });
    if (S.ptView === 'seat') return h + seatHTML(st, tot) + '</div></div>';
    h += '<div class="gr-seats ' + (S.ptMode === '+' ? 'plus' : 'minus') + '">' + st.map(function (s) {
      var t = tot[s.seat] || 0;
      return '<button class="gr-seat" data-g="pt|' + s.seat + '">' + s.seat + '<small class="' + (t > 0 ? 'pos' : t < 0 ? 'neg' : '') + '">' + (t ? (t > 0 ? '+' : '') + t : '') + '</small></button>';
    }).join('') + '</div></div></div>';
    return h;
  }
  /* ── 座位表（老師 10/6：照教室座位排，老師視角＝最下排靠講台；預設 6×6；一次段考換一次座位 → 可拖拉調整） ──
     資料：localStorage gr_seat_v1＝{ 班名:{ rows, cols, grid:[[座號或0…]…], at } }，grid[0]＝最上排（最後排），最後一列＝靠講台。 */
  /* 預設座位：只記座號位置（不含姓名、照片）。冷一忠＝老師 10/6 提供的「115 學年度第一學期冷一忠座位表 A（1150831 啟用）」，7 排×每排 6 人 */
  var SEAT_PRESET = {
    '冷一忠': [[0, 0, 0, 0, 0, 34, 11], [16, 29, 31, 32, 33, 35, 15], [17, 30, 24, 4, 18, 27, 25], [1, 10, 26, 7, 21, 2, 6], [3, 9, 8, 12, 19, 20, 13], [0, 14, 28, 5, 22, 23, 0]]
  };
  function seatAll() { var a = get(K.seat, null); return a && typeof a === 'object' ? a : {}; }
  function seatOf(cls, st) {
    var L = seatAll()[cls];
    if (L && L.grid && L.rows && L.cols) return L;
    var P = SEAT_PRESET[cls]; if (P) return { rows: P.length, cols: P[0].length, grid: P.map(function (r) { return r.slice(); }), at: '', auto: true, preset: true };
    var rows = 6, cols = 6, grid = [], seats = st.map(function (s) { return s.seat; }), i = 0;   /* 預設：從靠講台那排、由左到右依座號排 */
    for (var r = 0; r < rows; r++) grid.push(new Array(cols).fill(0));
    for (var rr = rows - 1; rr >= 0; rr--) for (var c = 0; c < cols; c++) grid[rr][c] = i < seats.length ? seats[i++] : 0;
    return { rows: rows, cols: cols, grid: grid, at: '', auto: true };
  }
  function seatSave(cls, L) { var a = seatAll(); L = { rows: L.rows, cols: L.cols, grid: L.grid, at: new Date().toISOString() }; a[cls] = L; put(K.seat, a); }
  function seatHTML(st, tot) {
    var L = seatOf(S.cls, st), act = {}, placed = {};
    st.forEach(function (s) { act[s.seat] = 1; });
    var h = '<div class="gr-seatbar">' + (S.seatEdit
      ? '<b>✎ 調整座位</b><span class="gr-muted">拖拉座號框：拖到別人身上＝兩人對調；拖到空位＝移過去；拖到下面「未安排」＝先拿出來。</span>' +
        '<span style="flex:1"></span><span class="gr-muted">幾排（直）</span><button class="gr-btn" data-g="seatdim|c-">−</button><b>' + L.cols + '</b><button class="gr-btn" data-g="seatdim|c+">＋</button>' +
        '<span class="gr-muted">每排幾人</span><button class="gr-btn" data-g="seatdim|r-">−</button><b>' + L.rows + '</b><button class="gr-btn" data-g="seatdim|r+">＋</button>' +
        '<button class="gr-btn" data-g="seatreset">依座號重排</button><button class="gr-btn pri" data-g="seatedit|0">完成</button>'
      : (L.auto ? '<span class="gr-muted">' + (L.preset ? '這是依老師提供的座位表排的；換座位時按右邊「調整座位」拖拉。' : '還沒設定座位表，先依座號排；按右邊「調整座位」拖拉成教室實際座位。') + '</span>' : '<span class="gr-muted">' + (L.at ? '座位表更新於 ' + md(L.at.slice(0, 10)) : '') + '</span>') +
        '<span style="flex:1"></span><button class="gr-btn" data-g="seatedit|1">✎ 調整座位</button>') + '</div>';
    h += '<div class="gr-room' + (S.seatEdit ? ' edit' : '') + '" style="grid-template-columns:repeat(' + L.cols + ',minmax(0,1fr))">';
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var n = (L.grid[r] || [])[c] || 0;
      if (n && act[n]) {
        placed[n] = 1; var t = tot[n] || 0;
        h += S.seatEdit
          ? '<div class="gr-seat gr-cell" data-cell="' + r + ',' + c + '" data-seat="' + n + '">' + n + '<small></small></div>'
          : '<button class="gr-seat gr-cell" data-g="pt|' + n + '">' + n + '<small class="' + (t > 0 ? 'pos' : t < 0 ? 'neg' : '') + '">' + (t ? (t > 0 ? '+' : '') + t : '') + '</small></button>';
      } else h += '<div class="gr-cell gr-empty" data-cell="' + r + ',' + c + '"></div>';
    }
    h += '</div><div class="gr-cols" style="grid-template-columns:repeat(' + L.cols + ',minmax(0,1fr))">';
    for (var k = 0; k < L.cols; k++) h += '<span>第' + '一二三四五六七八九十'.charAt(k) + '排</span>';
    h += '</div><div class="gr-podium">講　台</div>';
    var un = st.filter(function (s) { return !placed[s.seat]; });
    if (S.seatEdit || un.length) h += '<div class="gr-tray"' + (S.seatEdit ? ' data-tray="1"' : '') + '><span class="gr-muted">未安排：</span>' + (un.length ? un.map(function (s) {
      return S.seatEdit ? '<div class="gr-seat gr-tchip" data-seat="' + s.seat + '">' + s.seat + '</div>' : '<button class="gr-seat gr-tchip" data-g="pt|' + s.seat + '">' + s.seat + '</button>';
    }).join('') : '<span class="gr-muted">（全部都排好了）</span>') + '</div>';
    return h;
  }
  /* 拖拉（滑鼠、觸控都可以；Pointer Events） */
  var drag = null;
  function seatDown(e) {
    if (!S.seatEdit) return;
    var el = e.target.closest && e.target.closest('#v106-gr .gr-room .gr-seat[data-seat], #v106-gr .gr-tray .gr-seat[data-seat]'); if (!el) return;
    e.preventDefault();
    var r = el.getBoundingClientRect(), g = el.cloneNode(true);
    g.className = 'gr-seat gr-ghost'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.getElementById('v106-gr').appendChild(g);
    drag = { seat: +el.getAttribute('data-seat'), from: el.getAttribute('data-cell') || 'tray', el: el, g: g, dx: e.clientX - r.left, dy: e.clientY - r.top };
    el.classList.add('gr-lift'); seatMove(e);
  }
  function seatMove(e) {
    if (!drag) return; e.preventDefault();
    drag.g.style.left = (e.clientX - drag.dx) + 'px'; drag.g.style.top = (e.clientY - drag.dy) + 'px';
    var t = seatTarget(e); document.querySelectorAll('#v106-gr .gr-over').forEach(function (x) { x.classList.remove('gr-over'); });
    if (t) t.classList.add('gr-over');
  }
  function seatTarget(e) {
    drag.g.style.display = 'none'; var x = document.elementFromPoint(e.clientX, e.clientY); drag.g.style.display = '';
    return x && x.closest ? x.closest('#v106-gr .gr-cell, #v106-gr .gr-tray') : null;
  }
  function seatUp(e) {
    if (!drag) return;
    var t = seatTarget(e), d = drag; drag = null; d.g.remove();
    if (!t) { render(); return; }
    var st = roster(S.cls), L = seatOf(S.cls, st), g = L.grid.map(function (row) { return row.slice(); });
    var pos = function (k) { var a = k.split(','); return [+a[0], +a[1]]; };
    if (t.classList.contains('gr-tray')) { if (d.from !== 'tray') { var f = pos(d.from); g[f[0]][f[1]] = 0; } }
    else {
      var to = pos(t.getAttribute('data-cell')), other = g[to[0]][to[1]] || 0;
      if (d.from === 'tray') g[to[0]][to[1]] = d.seat;                        /* 原本坐那裡的人回到「未安排」 */
      else { var fr = pos(d.from); g[fr[0]][fr[1]] = other; g[to[0]][to[1]] = d.seat; }   /* 對調（空位＝移過去） */
    }
    L.grid = g; seatSave(S.cls, L); render();
  }
  function seatDim(v) {
    var st = roster(S.cls), L = seatOf(S.cls, st), g = L.grid.map(function (row) { return row.slice(); });
    var lost = function (arr) { return arr.some(function (n) { return n; }); };
    if (v === 'r+') { g.unshift(new Array(L.cols).fill(0)); L.rows++; }
    else if (v === 'r-') { if (L.rows <= 1) return; if (lost(g[0]) && !confirm('最後面（最上面）那一列還有人，刪掉後他們會回到「未安排」。確定？')) return; g.shift(); L.rows--; }
    else if (v === 'c+') { g.forEach(function (row) { row.push(0); }); L.cols++; }
    else if (v === 'c-') { if (L.cols <= 1) return; if (lost(g.map(function (row) { return row[row.length - 1]; })) && !confirm('最右邊那一排還有人，刪掉後他們會回到「未安排」。確定？')) return; g.forEach(function (row) { row.pop(); }); L.cols--; }
    L.grid = g; seatSave(S.cls, L); render();
  }
  function seatReset() {
    if (!confirm('依座號重新排（從靠講台那一列、由左到右）？目前的座位安排會被取代。')) return;
    var a = seatAll(), keep = a[S.cls]; delete a[S.cls]; put(K.seat, a);
    var L = seatOf(S.cls, roster(S.cls)); if (keep) { L.rows = keep.rows; L.cols = keep.cols; }
    var seats = roster(S.cls).map(function (s) { return s.seat; }), i = 0, grid = [];
    for (var r = 0; r < L.rows; r++) grid.push(new Array(L.cols).fill(0));
    for (var rr = L.rows - 1; rr >= 0; rr--) for (var c = 0; c < L.cols; c++) grid[rr][c] = i < seats.length ? seats[i++] : 0;
    L.grid = grid; seatSave(S.cls, L); render();
  }

  function addPoint(seat, btn) {
    var td = today(), p = { id: uid('p'), ts: new Date().toISOString(), date: td, period: curPeriod(S.cls), cls: S.cls, seat: seat,
      delta: S.ptMode === '+' ? 1 : -1, reason: S.ptMode === '+' ? '' : S.ptReason };
    D.points.push(p); S.undo.push(p.id);
    fly(btn, p.delta);
    var sm = btn.querySelector('small'), t = 0; D.points.forEach(function (x) { if (x.cls === S.cls && x.date === td && x.seat === seat) t += x.delta; });
    if (sm) { sm.textContent = t ? (t > 0 ? '+' : '') + t : ''; sm.className = t > 0 ? 'pos' : t < 0 ? 'neg' : ''; }
    var u = document.querySelector('#v106-gr [data-g="ptundo"]'); if (u) u.disabled = false;
    save('points', [p], (p.delta > 0 ? '+1 ' : '−1 ') + S.cls + ' ' + seat + '號').catch(function () { D.points = D.points.filter(function (x) { return x.id !== p.id; }); S.undo.pop(); render(); });
  }
  function fly(btn, d) {
    btn.classList.remove('flash-p', 'flash-m'); void btn.offsetWidth; btn.classList.add(d > 0 ? 'flash-p' : 'flash-m');
    var r = btn.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'gr-fly ' + (d > 0 ? 'p' : 'm'); f.textContent = d > 0 ? '+1' : '−1';
    f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top) + 'px';
    document.getElementById('v106-gr').appendChild(f); setTimeout(function () { f.remove(); }, 1000);
  }
  function undoPoint() {
    var id = S.undo.pop(); if (!id) return;
    var p = D.points.filter(function (x) { return x.id === id; })[0];
    remove('points', [id]).then(function () { D.points = D.points.filter(function (x) { return x.id !== id; }); setSt('已復原 ' + (p ? p.seat + '號 ' + (p.delta > 0 ? '+1' : '−1') : '')); render(); })
      .catch(function () { S.undo.push(id); });
  }

  /* ── 設定 ── */
  function setHTML() {
    if (!S.setCls) S.setCls = S.cls;
    var h = '<div class="gr-main"><div class="gr-pane">';
    h += '<div class="gr-sec"><h5>① Google 綁定</h5>' +
      '<div class="gr-row"><label class="k">目前</label><b>' + (isDemo() ? '示範模式（未綁定）' : '已綁定 Google 試算表') + '</b>' + (GS_URL && !get(K.url, '') ? '<span class="gr-muted">（網址寫在網頁內）</span>' : '') + '</div>' +
      '<div class="gr-row"><label class="k">網址</label><input type="text" id="gr-url" value="' + esc(get(K.url, '') || GS_URL) + '" placeholder="https://script.google.com/macros/s/……/exec" style="flex:1;min-width:300px"></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="urlsave">儲存並測試</button>' + (get(K.url, '') ? '<button class="gr-btn" data-g="urlclear">清除本裝置網址</button>' : '') +
      '<span class="gr-muted">部署步驟見專案 docs/成績系統_部署步驟.md</span></div></div>';
    if (!S.admin) return h + needLogin('名單、配分、匯出需要登入').replace('<div class="gr-main"><div class="gr-pane">', '').replace(/<\/div><\/div>$/, '') + '</div></div>';
    h += '<div class="gr-row" style="margin:0 0 8px">設定班級：' + classes().map(function (c) { return '<button class="gr-chip' + (S.setCls === c ? ' on' : '') + '" data-g="scls|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    var ros = D.students.filter(function (s) { return s.cls === S.setCls; });
    h += '<div class="gr-sec"><h5>② 學生名單（' + esc(S.setCls) + '：目前 ' + ros.filter(function (s) { return s.active !== 0; }).length + ' 人）</h5>' +
      '<p class="gr-muted">從 Excel 選取「座號、學號、姓名」三欄（含不含標題列都可以）→ 複製 → 貼到下面。也可以直接在 Google 試算表「學生名單」工作表貼。</p>' +
      '<textarea id="gr-paste" rows="6" style="width:100%" placeholder="1\t1150101\t王小明">' + esc(S.paste) + '</textarea>' +
      '<div class="gr-row"><button class="gr-btn" data-g="pprev">預覽</button>' + (S.preview ? '<button class="gr-btn pri" data-g="pgo">匯入 ' + S.preview.rows.length + ' 人到 ' + esc(S.setCls) + '</button>' : '') + '</div>';
    if (S.preview) {
      h += '<p class="gr-muted">' + (S.preview.skip.length ? '略過 ' + S.preview.skip.length + ' 行（看不出座號或姓名）：' + esc(S.preview.skip.slice(0, 3).join('／')) : '') + '</p>' +
        '<table class="gr-t" style="max-width:480px"><thead><tr><th>座號</th><th>學號</th><th>姓名</th><th></th></tr></thead><tbody>' +
        S.preview.rows.map(function (r) { var ex = ros.filter(function (s) { return s.seat === r.seat; })[0]; return '<tr><td>' + r.seat + '</td><td>' + esc(r.sid) + '</td><td class="nm">' + esc(r.name) + '</td><td class="gr-muted">' + (ex ? (ex.name === r.name ? '不變' : '取代「' + esc(ex.name) + '」') : '新增') + '</td></tr>'; }).join('') + '</tbody></table>';
    }
    h += '</div>';
    var w = weights(S.setCls);
    h += '<div class="gr-sec"><h5>③ 配分（' + esc(S.setCls) + '）' + (w.tentative ? '<span class="late" style="font-size:13px">　目前是暫定值，請設定</span>' : '') + '</h5><div class="gr-row">' +
      CATS.map(function (k) { return '<label>' + k + ' <input type="number" min="0" id="gr-w-' + k + '" value="' + esc(w[k]) + '" style="width:62px"></label>'; }).join('') + '</div>' +
      '<div class="gr-row"><span>作業內比例　習作 <input type="number" min="0" id="gr-w-習作" value="' + esc(w['習作']) + '" style="width:56px"> ： 回家考卷 <input type="number" min="0" id="gr-w-回家考卷" value="' + esc(w['回家考卷']) + '" style="width:56px"></span>' +
      '<span class="gr-muted">考試＝註釋小考平均×1/3＋A卷平均×2/3（固定）</span></div>' +
      '<div class="gr-row"><label><input type="checkbox" id="gr-w-zero"' + (w.zeroMissing ? ' checked' : '') + '> 逾期未交的考卷以 0 分計入平均（不勾＝未交不列入）</label></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="wsave">儲存這班</button><button class="gr-btn" data-g="wsaveall">套用到全部班級</button><span class="gr-muted">比例數字不必加到 100，會自動換算；目前平均只算已有分數的項目。</span></div></div>';
    h += '<div class="gr-sec"><h5>④ 匯出 Excel</h5><div class="gr-row">' + classes().map(function (c) { return '<button class="gr-btn" data-g="csv|' + esc(c) + '">' + esc(c) + ' 成績總表</button>'; }).join('') +
      '<button class="gr-btn" data-g="csvpts">課堂加減分紀錄</button></div><p class="gr-muted">下載 CSV（Excel 可直接開，含姓名，請勿外流）。完整原始資料也在 Google 試算表裡。</p></div>';
    h += tutorSecHTML();   /* gr-5 */
    if (isDemo()) h += '<div class="gr-sec"><h5>示範資料</h5><button class="gr-btn warn" data-g="demoreset">清除本機示範資料</button></div>';
    return h + '</div></div>';
  }
  /* ── gr-5：小老師（名單、密碼、網址） ── */
  function tutorSecHTML() {
    var h = '<div class="gr-sec"><h5>⑤ 小老師</h5>';
    if (isDemo()) return h + '<p class="gr-muted">示範模式不支援（要綁定 Google 後台 gr-5）。</p></div>';
    var pwUrl = url() + '?page=tutor';
    h += '<div class="gr-row"><label class="k">帳密登入</label><input type="text" readonly value="' + esc(pwUrl) + '" style="flex:1;min-width:280px" onclick="this.select()"></div>' +
      '<div class="gr-row"><label class="k">Google 登入</label>' + (TUTOR_G_URL ? '<input type="text" readonly value="' + esc(TUTOR_G_URL + '?page=tutor') + '" style="flex:1;min-width:280px" onclick="this.select()">'
        : '<span class="gr-muted">還沒設定（Apps Script 要另外新增一個「網域內」部署，見 docs/成績系統_部署步驟.md §7）</span>') + '</div>';
    var ts = D.tutors.slice().sort(function (a, b) { return a.cls === b.cls ? a.seat - b.seat : (classes().indexOf(a.cls) - classes().indexOf(b.cls)); });
    if (!ts.length) h += '<p class="gr-muted">名單還沒建立（後台升到 gr-5 後，第一次有小老師登入或按「重新整理名單」就會自動建立預設名單）。</p>';
    else {
      h += '<table class="gr-t" style="max-width:640px"><thead><tr><th>班級</th><th>座號</th><th>姓名</th><th>帳號（學號）</th><th>密碼</th><th></th></tr></thead><tbody>';
      ts.forEach(function (t) {
        var s = D.students.filter(function (x) { return x.cls === t.cls && x.seat === +t.seat; })[0] || {}, k = esc(t.cls) + '|' + t.seat;
        var on = String(t.active) !== '0';
        if (t.cls === '全部') s = { name: '🧪 測試帳號（四班）', sid: t.sid || t.note || '' };   /* 老師的試用帳號：帳號打信箱或 @ 前面 */
        h += '<tr' + (on ? '' : ' style="opacity:.5"') + '><td>' + esc(t.cls) + '</td><td><b>' + (+t.seat || '—') + '</b></td><td class="nm">' + esc(s.name || t.name || '（名單沒有）') + '</td><td>' + esc(s.sid || t.sid || '') + '</td>' +
          '<td>' + (+t.hasPw ? '已設定' : '<span class="late">未設定</span>') + '</td><td><button class="gr-btn" data-g="tadm|pw|' + k + '">' + (+t.hasPw ? '重設密碼' : '產生密碼') + '</button>' +
          '<button class="gr-btn" data-g="tadm|' + (on ? 'off' : 'on') + '|' + k + '">' + (on ? '停用' : '啟用') + '</button></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '<div class="gr-row" style="margin-top:8px"><label class="k">新增</label><select id="gr-tcls">' + classes().map(function (c) { return '<option' + (c === S.setCls ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
      '<input type="number" id="gr-tseat" min="1" max="60" placeholder="座號" style="width:70px"><button class="gr-btn" data-g="tadm|add">新增小老師</button>' +
      '<button class="gr-btn" data-g="tadm|list">重新整理名單</button></div>' +
      '<p class="gr-muted">Google 登入＝用 學號@mail2.ccvs.kh.edu.tw 自動認人，不用密碼。密碼只有按下去那一次看得到，忘了就重設。小老師只看得到自己班、誰還沒交、當天自己登的分數；檢查時才看得到那一份的分數。</p></div>';
    return h;
  }
  function tutorAdmin(v) {
    var a = v.split('|'), op = a[0], cls = a[1] || '', seat = +a[2] || 0, nm = cls === '全部' ? '測試帳號' : cls + ' ' + seat + '號';
    if (op === 'add') { cls = (document.getElementById('gr-tcls') || {}).value || ''; seat = +((document.getElementById('gr-tseat') || {}).value || 0); if (!cls || !seat) { alert('請選班級、輸入座號'); return; } }
    if (op === 'pw' && !confirm(nm + '：產生新密碼？（舊密碼立刻失效）')) return;
    if (op === 'off' && !confirm(nm + '：停用？（停用後不能登入）')) return;
    setSt('處理中…');
    call({ action: 'tAdmin', op: op, cls: cls, seat: seat }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '失敗');
      D.tutors = r.tutors || D.tutors; setSt('✓ 完成'); render();
      if (r.pw) { var t = (r.tutors || []).filter(function (x) { return x.cls === cls && +x.seat === seat; })[0] || {};
        alert((cls === '全部' ? '' : cls + ' ' + seat + '號 ') + (t.name || '') + '\n\n帳號：' + (t.sid || '（學號）') + '\n密碼：' + r.pw + '\n\n請抄給小老師。這個密碼之後不會再顯示，忘了就重設。'); }
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert('失敗：' + e.message + (/不明的動作/.test(e.message) ? '\n（Apps Script 還沒更新到 gr-5）' : '')); });
  }
  function parsePaste(txt) {
    var rows = [], skip = [], seen = {};
    String(txt || '').split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) return;
      var cells = line.split(/\t|,|\s{2,}/).map(function (x) { return x.trim(); }).filter(Boolean);
      if (cells.length === 1) cells = line.trim().split(/\s+/);
      var seat = null, sid = '', name = '';
      cells.forEach(function (c) {
        if (seat == null && /^\d{1,2}$/.test(c) && +c > 0) { seat = +c; return; }
        if (!sid && /^[A-Za-z]?\d{5,}$/.test(c)) { sid = c; return; }
        if (!name && /[㐀-鿿]/.test(c) && !/座號|學號|姓名|班級/.test(c)) name = c;
      });
      if (seat == null || !name || seen[seat]) { if (!/座號|姓名/.test(line)) skip.push(line.trim().slice(0, 20)); return; }
      seen[seat] = 1; rows.push({ seat: seat, sid: sid, name: name });
    });
    return { rows: rows.sort(function (a, b) { return a.seat - b.seat; }), skip: skip };
  }
  function importRoster() {
    var c = S.setCls, rows = S.preview.rows, inNew = {}; rows.forEach(function (r) { inNew[r.seat] = 1; });
    var gone = D.students.filter(function (s) { return s.cls === c && s.active !== 0 && !inNew[s.seat]; });
    var msg = '匯入 ' + rows.length + ' 人到 ' + c + '？';
    if (gone.length) msg += '\n名單外的座號 ' + gone.map(function (s) { return s.seat; }).join('、') + ' 會標成「不在籍」（不刪除，成績保留）。';
    if (!confirm(msg)) return;
    var out = rows.map(function (r) { return { cls: c, seat: r.seat, sid: r.sid, name: r.name, active: '1' }; })
      .concat(gone.map(function (s) { return { cls: c, seat: s.seat, sid: s.sid, name: s.name, active: '0' }; }));
    save('students', out, '名單已匯入').then(function () { S.paste = ''; S.preview = null; S.loaded = false; load(true); });
  }
  function saveWeights(all) {
    var w = {}; CATS.concat(['習作', '回家考卷']).forEach(function (k) { var e = document.getElementById('gr-w-' + k); w[k] = e ? Math.max(0, +e.value || 0) : DEF_W[k]; });
    w.zeroMissing = !!(document.getElementById('gr-w-zero') || {}).checked; w.tentative = false;
    var cs = all ? classes() : [S.setCls], rows = cs.map(function (c) { return { cls: c, json: JSON.stringify(w) }; });
    if (all && !confirm('把這組配分套用到全部 ' + cs.length + ' 班？')) return;
    save('weights', rows, '配分已儲存').then(function () {
      rows.forEach(function (r) { var o = D.weights.filter(function (x) { return x.cls === r.cls; })[0]; if (o) o.json = r.json; else D.weights.push(r); }); render(); });
  }
  function download(name, rows) {
    var csv = '﻿' + rows.map(function (r) { return r.map(function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function exportClass(c) {
    var td = today(), its = itemsOf(c).slice().reverse(), w = weights(c);
    var head = ['座號', '學號', '姓名'].concat(its.map(function (i) { return i.type + '｜' + itemLabel(i) + (i.due ? '（' + md(i.due) + '）' : ''); }), CATS.map(function (k) { return k + '平均'; }), ['目前平均']);
    var rows = [head];
    D.students.filter(function (s) { return s.cls === c && s.active !== 0; }).forEach(function (s) {
      var sm = summary(c, s.seat, td);
      rows.push([s.seat, s.sid, s.name].concat(its.map(function (i) { var sc = scoreOf(i.id, s.seat), f = finalOf(i, sc, td), L = lateOf(i, sc, td);
        return f != null ? r1(f) : (sc && sc.sub ? '已交' : (L ? '未交(逾' + L + '天)' : '')); }), CATS.map(function (k) { return r1(sm[k]); }), [r1(sm.total)]));
    });
    rows.push([]); rows.push(['配分', '', ''].concat(its.map(function () { return ''; }), CATS.map(function (k) { return w[k]; }), [w.tentative ? '暫定' : '']));
    download(c + '_成績總表_' + td + '.csv', rows);
  }
  function exportPoints() {
    var rows = [['日期', '節次', '班級', '座號', '加減', '原因', '時間']];
    D.points.slice().sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }).forEach(function (p) { rows.push([p.date, p.period, p.cls, p.seat, p.delta, p.reason, p.ts]); });
    download('課堂加減分_' + today() + '.csv', rows);
  }

  /* ── 事件 ── */
  function onClick(e) {
    var m = document.getElementById('v106-gr');
    if (e.target === m) { close(); return; }
    var b = e.target.closest && e.target.closest('[data-g]'); if (!b) return;
    if (b.tagName === 'SELECT' || b.tagName === 'INPUT' && b.type !== 'checkbox') return;
    var a = b.getAttribute('data-g').split('|'), t = a[0], v = a.slice(1).join('|');
    if (t === 'x') close();
    else if (t === 'tab') { S.tab = v; put(K.tab, v); render(); }
    else if (t === 'cls') { S.cls = v; put(K.cls, v); S.item = ''; S.edit = null; S.imp = null; S.undo = []; render(); }
    else if (t === 'reload') { S.loaded = false; load(true); }
    else if (t === 'retry') { if (Object.keys(pend).length) flush(); }
    else if (t === 'login') { var p = document.getElementById('gr-pw'); login(p && p.value, (document.getElementById('gr-rem') || {}).checked); }
    else if (t === 'logout') { if (confirm('登出？（這台裝置不再記住密碼）')) logout(); }
    else if (t === 'item') { S.item = v; S.edit = null; S.imp = null; render(); }
    else if (t === 'new') { S.imp = null; S.edit = { id: '', clsList: [S.cls], type: '註釋小考', lessons: '', title: '', issued: today(), due: '', late: true, note: '' }; render(); }
    else if (t === 'edit') { var it = itemById(v); S.edit = JSON.parse(JSON.stringify(it)); render(); }
    else if (t === 'ecls') { readEdit(); var L = S.edit.clsList, i = L.indexOf(v); if (i < 0) L.push(v); else L.splice(i, 1); render(); }
    else if (t === 'etype') { readEdit(); S.edit.type = v; S.edit.late = typeOf(v).late; render(); }
    else if (t === 'eles') { readEdit(); var ls = lessonsOf(S.edit.lessons), j = ls.indexOf(+v); if (j < 0) ls.push(+v); else ls.splice(j, 1); S.edit.lessons = ls.sort(function (x, y) { return x - y; }).join(','); render(); }
    else if (t === 'eauto') { readEdit(); S.edit.due = nextLesson(S.edit.cls, S.edit.issued); render(); }
    else if (t === 'esave') saveEdit();
    else if (t === 'ecancel') { S.edit = null; render(); }
    else if (t === 'edel') delItem(S.edit.id);
    else if (t === 'imp') { S.edit = null; S.imp = { pick: {}, type: {} }; render(); }
    else if (t === 'impx') { S.imp = null; render(); }
    else if (t === 'ipick') { S.imp.pick[v] = b.checked; }
    else if (t === 'impgo') doImport();
    else if (t === 'done' || t === 'unsub' || t === 'leaveon' || t === 'unleave' || t === 'lvx' || t === 'lvs') {
      var q = v.split('|'), seat = +q[1], sd = (document.getElementById('gr-subdate') || {}).value || today();
      if (t === 'done') patchScore(q[0], seat, { sub: sd });
      else if (t === 'unsub') { var c0 = scoreOf(q[0], seat); if (c0 && c0.raw != null && !confirm('已有分數，取消「已交」會讓這筆變成未交，確定？')) return; patchScore(q[0], seat, { sub: '' }); }
      else if (t === 'lvx') patchScore(q[0], seat, { leave: '考:' + sd });   /* v110：考試請假 */
      else if (t === 'lvs') patchScore(q[0], seat, { leave: '交:' + sd });   /* v110：繳交請假 */
      else if (t === 'leaveon') patchScore(q[0], seat, { leave: sd });
      else patchScore(q[0], seat, { leave: '' });
    }
    else if (t === 'b10') {   /* v110：已交的訂正 +10 */
      var who = roster(S.cls).filter(function (s) { var c = scoreOf(v, s.seat); return c && (c.raw != null || c.sub) && (c.bonus || 0) !== 10; });
      if (!itemById(v)) return;
      if (!who.length) { alert('沒有需要調整的：已交的人都已經是 +10，或還沒有人交。'); return; }
      if (!confirm('把這份考卷已交的 ' + who.length + ' 人，訂正加分設成 +10？\n（座號 ' + who.map(function (s) { return s.seat; }).join('、') + '）\n之後可以個別手動調整。')) return;
      who.forEach(function (s) { patchScore(v, s.seat, { bonus: 10 }); });
    }
    else if (t === 'hist') { var hq = v.split('|'); S.hist = { item: hq[0], seat: +hq[1] || 0 }; render(); }   /* gr-5 */
    else if (t === 'histx') { S.hist = null; render(); }
    else if (t === 'tadm') tutorAdmin(v);
    else if (t === 'pv') { S.projView = v; render(); }
    else if (t === 'rev') { S.reveal[v] = !S.reveal[v]; b.classList.toggle('m', !(S.revealAll || S.reveal[v])); }
    else if (t === 'revall') { S.revealAll = !S.revealAll; S.reveal = {}; render(); }
    else if (t === 'ptv') { S.ptView = v; put('gr_ptview_v1', v); S.seatEdit = false; render(); }
    else if (t === 'seatedit') { S.seatEdit = v === '1'; render(); }
    else if (t === 'seatdim') seatDim(v);
    else if (t === 'seatreset') seatReset();
    else if (t === 'ptr') { S.ptRange = v; render(); }
    else if (t === 'ptm') { S.ptMode = v; render(); }
    else if (t === 'ptw') { S.ptReason = v; render(); }
    else if (t === 'pt') addPoint(+v, b);
    else if (t === 'ptundo') undoPoint();
    else if (t === 'scls') { S.setCls = v; S.preview = null; render(); }
    else if (t === 'pprev') { S.paste = (document.getElementById('gr-paste') || {}).value || ''; S.preview = parsePaste(S.paste); render(); }
    else if (t === 'pgo') importRoster();
    else if (t === 'wsave') saveWeights(false);
    else if (t === 'wsaveall') saveWeights(true);
    else if (t === 'csv') exportClass(v);
    else if (t === 'csvpts') exportPoints();
    else if (t === 'urlsave') saveUrl();
    else if (t === 'urlclear') { if (confirm('清除本裝置的網址？（回到' + (GS_URL ? '網頁內建網址' : '示範模式') + '）')) { put(K.url, null); S.loaded = false; S.admin = false; load(true); } }
    else if (t === 'demoreset') { if (confirm('清除本機示範資料？')) { put(K.demo, null); S.loaded = false; load(true); } }
  }
  function saveUrl() {
    var u = ((document.getElementById('gr-url') || {}).value || '').trim();
    if (u && !/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) { alert('網址應該是 https://script.google.com/macros/s/……/exec'); return; }
    var old = get(K.url, null); put(K.url, u || null); setSt('測試連線中…');
    call({ action: 'ping' }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '回應錯誤');
      setSt('✓ 連線成功' + (r.hasPw ? '' : '（但後台還沒設密碼，請執行 setup）'), !r.hasPw);
      S.loaded = false; S.admin = false; load(true);
    }).catch(function (e) { put(K.url, old); setSt('⚠ 連不上：' + e.message, true); alert('連不上這個網址：' + e.message + '\n（已還原為原本設定）'); });
  }
  function onChange(e) {
    var g = e.target.getAttribute && e.target.getAttribute('data-g'), id = e.target.id;
    if (id === 'gr-subdate') { S.subDate = e.target.value || today(); return; }
    if (id === 'gr-pitem') { S.projItem = e.target.value; render(); return; }
    if (id === 'gr-eissued' && S.edit) { readEdit(); render(); return; }
    if (!g) return;
    var a = g.split('|'), t = a[0];
    if (t === 'itype') { S.imp.type[a[1]] = e.target.value; render(); return; }
    var item = a[1], seat = +a[2];
    if (t === 'raw') commitRaw(e.target);
    else if (t === 'sub') patchScore(item, seat, { sub: e.target.value });
    else if (t === 'leave') { var lo0 = leaveOf(scoreOf(item, seat)); patchScore(item, seat, { leave: e.target.value ? ((lo0.k === '考' || lo0.k === '交') ? lo0.k + ':' : '') + e.target.value : '' }); }   /* v110：改日期時保留請假種類 */
    else if (t === 'bonus') patchScore(item, seat, { bonus: +e.target.value || 0 });
  }
  function commitRaw(inp) {
    var a = inp.getAttribute('data-g').split('|'), item = a[1], seat = +a[2], v = inp.value.trim();
    var n = v === '' ? null : num(v);
    if (v !== '' && (n == null || n < 0 || n > 200)) { alert('分數請輸入 0～200 的數字'); inp.value = ''; return false; }
    var c = scoreOf(item, seat);
    if ((c ? c.raw : null) === n) return true;
    var p = { raw: n }; if (n != null && !(c && c.sub)) p.sub = (document.getElementById('gr-subdate') || {}).value || today();
    patchScore(item, seat, p);
    return true;
  }
  function onInput(e) { if (e.target.id === 'gr-paste') S.paste = e.target.value; }
  function onKey(e) {
    if (e.key === 'Escape') { if (S.hist) { S.hist = null; render(); } else close(); e.stopPropagation(); return; }
    var g = e.target.getAttribute && e.target.getAttribute('data-g');
    if (e.key === 'Enter' && g && g.indexOf('raw|') === 0) {
      e.preventDefault();
      var a = g.split('|'), st = roster(S.cls), i = st.map(function (s) { return s.seat; }).indexOf(+a[2]);
      if (commitRaw(e.target) && st[i + 1]) { var nx = document.querySelector('#v106-gr [data-g="raw|' + a[1] + '|' + st[i + 1].seat + '"]'); if (nx) { nx.focus(); nx.select(); } }
    }
    if (e.key === 'Enter' && e.target.id === 'gr-pw') { var p = e.target.value; login(p, (document.getElementById('gr-rem') || {}).checked); }
    e.stopPropagation();   /* 不讓 ←→ 觸發課文換頁 */
  }

  /* 「班級進度」面板加入口（放在日曆按鈕下方） */
  function addBtn() {
    var p = document.getElementById('cls-panel'); if (!p || document.getElementById('v106-open')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'v106-open'; b.textContent = '📒 成績登記／課堂加減分';
    b.onclick = function () { open(); };
    var cal = document.getElementById('v98-open'), head = p.querySelector('.cls-head');
    var ref = cal ? cal.nextSibling : (head ? head.nextSibling : p.firstChild);
    p.insertBefore(b, ref);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn();
  window.addEventListener('beforeunload', function (e) { if (Object.keys(pend).length) { flush(); e.preventDefault(); e.returnValue = '還有成績尚未儲存'; return e.returnValue; } });

  /* 測試／除錯用介面（不含任何學生資料） */
  window.V106GR = { open: open, close: close, data: function () { return D; }, summary: summary, lateOf: lateOf, finalOf: finalOf,
    nextLesson: nextLesson, schoolDaysBetween: schoolDaysBetween, parsePaste: parsePaste, isDemo: isDemo };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/122_v107-sync-js.js ════ */
try {

/* v107：雲端同步
   - 同步項目（老師的教學資料）：KEYS 與 PREFIX。只跟這台裝置有關的設定（字級、深色模式、目前選哪班、自動記錄開關、
     正在上課的暫存 tp_live）不同步；學生作答（v92f|…）不同步；成績系統本身原本就在雲端。
   - 存在 v106 同一份 Google 試算表（同一個 Apps Script 網址、同一組登記密碼），工作表「雲端同步」，需要後台 gr-2。
   - 本機修改：包裝 Storage.prototype.setItem／removeItem，只對上述項目記「待上傳」，2.5 秒後上傳。
   - 下載：開網頁、回到分頁、每 2 分鐘檢查一次雲端時間戳，有更新才下載內容。
   - 衝突：兩邊都改過時，以「最後修改時間」較新者為準；被蓋掉的一方存進本機備份（sync_bak_v1），可在同步視窗還原。
   - 從沒同步過的裝置：雲端有的一律以雲端為準（本機舊資料先備份）；雲端沒有、本機有的，列為「這台獨有」，
     要按「以這台資料為正本上傳」才會上傳（避免別台的舊資料搶先上傳）。 */
(function () {
  'use strict';
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';   /* 同 v106 */
  var KEYS = {
    'exam_cal_v1': '考試／作業日曆',
    'cls_records_v1': '班級進度與考試紀錄',
    'nq-records-v1': '註釋小考紀錄',
    'tp_schedule_v1': '課表',
    'tp_override_v1': '調課／停課',
    'tp_hist_v1': '上課自動紀錄',
    'hw_done_v1': '作業完成勾選',
    'plan_v1': '教學進度（老師專用）',
    'gr_seat_v1': '座位表（加減分用，只有座號）',
    'stu_pw_v1': '學生班級網站密碼（老師專用）'   /* V124：學生端 stuGet 不讀這個鍵；舊站不認得，下載時略過 */
  };
  var PREFIX = { 'pian_': '講義補字圖片' };
  var M = 'sync_meta_v1', BAK = 'sync_bak_v1', BAK_MAX = 1.5e6;
  var PUSH_DELAY = 2500, POLL = 120000;

  var LS; try { LS = window.localStorage; LS.getItem('x'); } catch (e) { return; }
  var SP = Storage.prototype, rawGet = SP.getItem, rawSet = SP.setItem, rawRm = SP.removeItem;
  function lget(k) { try { return rawGet.call(LS, k); } catch (e) { return null; } }
  function lset(k, v) { try { rawSet.call(LS, k, v); return true; } catch (e) { return false; } }
  function lrm(k) { try { rawRm.call(LS, k); } catch (e) {} }
  function jget(k, d) { try { var v = lget(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function when(ms) { if (!ms) return ''; var d = new Date(+ms), n = new Date(); var t = pad(d.getHours()) + ':' + pad(d.getMinutes());
    return (d.toDateString() === n.toDateString()) ? '今天 ' + t : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + t; }
  function size(s) { if (s == null) return ''; var n = s.length; return n < 1024 ? n + ' 字' : (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' K'; }
  function hash(s) { if (s == null) return 'null'; var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + ':' + h; }

  function isKey(k) { k = String(k); if (Object.prototype.hasOwnProperty.call(KEYS, k)) return true; for (var p in PREFIX) if (k.indexOf(p) === 0) return true; return false; }
  function label(k) { if (KEYS[k]) return KEYS[k]; for (var p in PREFIX) if (k.indexOf(p) === 0) return PREFIX[p] + '（' + k.slice(p.length) + '）'; return k; }
  function localKeys() { var out = []; try { for (var i = 0; i < LS.length; i++) { var k = LS.key(i); if (k != null && isKey(k)) out.push(k); } } catch (e) {} return out; }
  function devName() {
    var u = navigator.userAgent || '';
    if (/iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return 'iPad';
    if (/iPhone|Android/.test(u)) return '手機';
    if (/Windows/.test(u)) return 'Windows電腦';
    if (/Mac/.test(u)) return 'Mac';
    return '裝置';
  }

  /* meta：dev＝這台裝置名稱；syn[k]＝上次同步到的雲端時間；h[k]＝那時內容的指紋；mod[k]＝本機最後修改時間；dirty[k]＝待上傳 */
  var meta = jget(M, null);
  if (!meta || !meta.dev) meta = { dev: devName() + '-' + Math.random().toString(36).slice(2, 6) };
  ['syn', 'h', 'mod', 'dirty'].forEach(function (f) { if (!meta[f] || typeof meta[f] !== 'object') meta[f] = {}; });
  function saveMeta() { lset(M, JSON.stringify(meta)); }
  saveMeta();

  /* 同步狀態 */
  var S = { busy: false, again: false, pulled: false, last: 0, err: '', need: [], remote: {}, oldApi: false, lastPullAt: 0 };

  /* ── 攔截本機寫入：只記同步項目 ── */
  SP.setItem = function (k, v) {
    var watch = false; try { watch = this === LS && isKey(k); } catch (e) {}
    var old = watch ? rawGet.call(this, k) : null;
    var r = rawSet.apply(this, arguments);
    if (watch && old !== String(v)) markDirty(String(k));
    return r;
  };
  SP.removeItem = function (k) {
    var watch = false; try { watch = this === LS && isKey(k); } catch (e) {}
    var had = watch ? rawGet.call(this, k) !== null : false;
    var r = rawRm.apply(this, arguments);
    if (watch && had) markDirty(String(k));
    return r;
  };
  var pushT = null;
  function markDirty(k) {
    meta.dirty[k] = 1; meta.mod[k] = Date.now(); saveMeta();
    clearTimeout(pushT); pushT = setTimeout(pushDirty, PUSH_DELAY);
    paint();
  }

  /* ── 連線（與 v106 共用網址、密碼）── */
  function url() { return jget('gr_url_v1', '') || GS_URL; }
  function pw() { var p = ''; try { p = sessionStorage.getItem('gr_pw_v1') || ''; } catch (e) {} return p || jget('gr_pw_v1', '') || ''; }
  function call(req) {
    req.pw = req.pw === undefined ? pw() : req.pw;
    return fetch(url(), { method: 'POST', body: JSON.stringify(req), redirect: 'follow' })
      .catch(function () { throw new Error('網路連不上（資料先存在這台，恢復連線後會自動上傳）'); })
      .then(function (r) { if (!r.ok) throw new Error('雲端回應錯誤 HTTP ' + r.status); return r.json(); })
      .then(function (r) {
        if (!r.ok) {
          if (r.auth === false) throw new Error('登記密碼錯誤或已失效，請重新登入');
          if (/不明的動作/.test(r.error || '')) { S.oldApi = true; throw new Error('Google 後台還是舊版，請依說明更新 Apps Script 並重新部署'); }
          throw new Error(r.error || '同步失敗');
        }
        S.oldApi = false; return r;
      });
  }

  /* ── 備份：被雲端（或較新版本）蓋掉之前的本機內容 ── */
  function backup(k, v, why) {
    if (v == null || v.length > 1e6) return;
    var b = jget(BAK, []); if (!Array.isArray(b)) b = [];
    if (b.length && b[b.length - 1].k === k && b[b.length - 1].v === v) return;
    b.push({ t: Date.now(), k: k, why: why, v: v });
    var tot = 0; for (var i = b.length - 1; i >= 0; i--) { tot += b[i].v.length; if (tot > BAK_MAX || b.length - i > 30) { b = b.slice(i + 1); break; } }
    if (!lset(BAK, JSON.stringify(b))) { b = b.slice(-3); lset(BAK, JSON.stringify(b)); }
  }

  /* 把雲端版本寫進本機（不觸發待上傳） */
  function applyRemote(k, R, why) {
    var loc = lget(k), val = (R.del || R.data == null) ? null : String(R.data);
    var changed = loc !== val;
    if (changed) {
      if (loc !== null) backup(k, loc, why || '被雲端版本取代前');
      if (val === null) lrm(k);
      else if (!lset(k, val)) { S.quota = '這台裝置的瀏覽器空間不足，「' + label(k) + '」無法下載'; return false; }
    }
    meta.syn[k] = String(R.ts); meta.h[k] = hash(val); delete meta.dirty[k];
    return changed;
  }

  /* 本機有沒有「沒被攔截到」的修改（例如網頁載入時、本程式啟動前寫入的）：跟上次同步的指紋比 */
  function detectHidden() {
    Object.keys(meta.h).forEach(function (k) {
      if (!meta.dirty[k] && hash(lget(k)) !== meta.h[k]) { meta.dirty[k] = 1; meta.mod[k] = Date.now(); }
    });
  }

  /* ── 下載＋合併 ── */
  function pull(silent) {
    if (!pw()) { S.err = ''; paint(); return Promise.resolve(); }
    if (S.busy) { S.again = true; return Promise.resolve(); }
    S.busy = true; S.lastPullAt = Date.now(); paint();
    var changed = [], toPush = [], lost = [];
    return call({ action: 'syncGet', metaOnly: true }).then(function (r) {
      var items = r.items || {};
      var need = Object.keys(items).filter(function (k) { return String(items[k].ts) !== String(meta.syn[k] || '') && !items[k].del; });
      if (!need.length) return items;
      return call({ action: 'syncGet', keys: need }).then(function (r2) {
        Object.keys(r2.items || {}).forEach(function (k) { items[k] = r2.items[k]; });
        return items;
      });
    }).then(function (items) {
      detectHidden();
      S.remote = {}; Object.keys(items).forEach(function (k) { S.remote[k] = { ts: items[k].ts, dev: items[k].dev, del: items[k].del }; });
      var keys = localKeys(); Object.keys(items).forEach(function (k) { if (keys.indexOf(k) < 0 && isKey(k)) keys.push(k); });
      Object.keys(meta.dirty).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
      var need = [];
      keys.forEach(function (k) {
        var R = items[k], loc = lget(k), syn = meta.syn[k], dirty = !!meta.dirty[k];
        if (R) {
          if (String(R.ts) !== String(syn || '')) {
            if (dirty && syn && (meta.mod[k] || 0) > +R.ts) toPush.push({ k: k, force: true });            /* 兩邊都改，本機較新 */
            else { if (dirty && loc !== (R.del ? null : R.data)) lost.push(k); if (applyRemote(k, R)) changed.push(k); }
          } else if (dirty) toPush.push({ k: k });
        } else if (dirty && loc === null && !syn) { delete meta.dirty[k]; }                              /* 新增又刪掉，雲端從沒有過 */
        else if (dirty) toPush.push({ k: k, force: !!syn });
        else if (loc !== null) need.push(k);                                                            /* 這台獨有，等老師決定 */
      });
      S.need = need; saveMeta();
      S.pulled = true; S.busy = false; S.last = Date.now(); S.err = S.quota || ''; S.quota = '';
      if (changed.length) refreshUI(changed);
      if (lost.length) toast('「' + lost.map(label).join('、') + '」雲端有較新的版本，已改用雲端版本（這台原本的內容已備份）', true);
      else if (changed.length && !silent) toast('☁ 已從雲端更新：' + changed.map(label).join('、'));
      paint();
      if (toPush.length) return push(toPush);
    }).catch(function (e) { S.busy = false; S.err = e.message; paint(); })
      .then(function () { if (S.again) { S.again = false; return pull(true); } });
  }

  /* ── 上傳 ── */
  function push(list) {
    if (!pw() || !list.length) return Promise.resolve();
    if (S.busy) { S.again = true; return Promise.resolve(); }
    S.busy = true; paint();
    var sent = {};
    var items = list.map(function (x) { var v = lget(x.k); sent[x.k] = v; return { k: x.k, data: v, base: meta.syn[x.k] || '', force: !!x.force }; });
    return call({ action: 'syncPut', dev: meta.dev, items: items }).then(function (r) {
      var ts = r.ts || {}, retry = [], changed = [];
      Object.keys(ts).forEach(function (k) {
        meta.syn[k] = String(ts[k]); meta.h[k] = hash(sent[k]);
        if (lget(k) === sent[k]) delete meta.dirty[k];
        if (!S.remote[k]) S.remote[k] = {};
        S.remote[k].ts = ts[k]; S.remote[k].dev = meta.dev; S.remote[k].del = sent[k] == null;
        S.need = S.need.filter(function (x) { return x !== k; });
      });
      (r.conflicts || []).forEach(function (c) {
        if (meta.syn[c.k] && (meta.mod[c.k] || 0) > +c.ts) retry.push({ k: c.k, force: true });
        else { if (applyRemote(c.k, c, '與雲端衝突、雲端較新')) changed.push(c.k); }
      });
      saveMeta(); S.busy = false; S.last = Date.now(); S.err = '';
      if (changed.length) { refreshUI(changed); toast('「' + changed.map(label).join('、') + '」雲端有較新的版本，已改用雲端版本（這台原本的內容已備份）', true); }
      paint();
      var more = Object.keys(meta.dirty).filter(function (k) { return !retry.some(function (x) { return x.k === k; }); });
      if (retry.length) return push(retry);
      if (more.length) { clearTimeout(pushT); pushT = setTimeout(pushDirty, PUSH_DELAY); }
    }).catch(function (e) { S.busy = false; S.err = e.message; paint(); })
      .then(function () { if (S.again) { S.again = false; return pull(true); } });
  }
  function pushDirty() {
    if (!pw()) { paint(); return; }
    if (!S.pulled) return pull(true);              /* 先跟雲端對過一次，才上傳 */
    var list = Object.keys(meta.dirty).map(function (k) { return { k: k }; });
    if (list.length) push(list);
  }
  /* 以這台資料為正本：把這台所有同步項目強制上傳 */
  function uploadAll() {
    var ks = localKeys();
    if (!ks.length) { alert('這台裝置沒有可上傳的資料。'); return; }
    if (!confirm('要把「這台裝置」的資料當成正本上傳，覆蓋雲端的同名項目嗎？\n\n' + ks.map(label).join('、') + '\n\n（其他裝置下次開網頁時會改用這份；被覆蓋的版本會留備份）')) return;
    ks.forEach(function (k) { meta.dirty[k] = 1; meta.mod[k] = Date.now(); });
    saveMeta(); S.need = [];
    var go = function () { if (S.busy) { setTimeout(go, 500); return; } push(ks.map(function (k) { return { k: k, force: true }; })); };
    go();
  }

  /* ── 下載後刷新畫面 ── */
  function refreshUI(keys) {
    try { var p = document.getElementById('cls-panel'); if (p && p.classList.contains('open') && typeof clsRender === 'function') clsRender(); } catch (e) {}
    try { var c = document.getElementById('v98-cal'); if (c && c.classList.contains('open') && window.V98CAL) window.V98CAL.open(); } catch (e) {}
    try { if (keys.some(function (k) { return k.indexOf('pian_') === 0; }) && typeof pianLoad === 'function') pianLoad(); } catch (e) {}
  }
  var toastT = null;
  function toast(msg, bad) {
    var t = document.getElementById('v107-toast');
    if (!t) { t = document.createElement('div'); t.id = 'v107-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'on' + (bad ? ' bad' : '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = bad ? 'bad' : ''; }, bad ? 7000 : 3500);
  }

  /* ── 入口按鈕與同步視窗 ── */
  function stText() {
    if (!pw()) return { t: '未登入', bad: false };
    if (S.err) return { t: '⚠ 同步失敗', bad: true };
    if (S.busy) return { t: '同步中…', bad: false };
    if (Object.keys(meta.dirty).length) return { t: '待上傳', bad: false };
    if (S.need.length) return { t: '有資料未上傳', bad: false };
    if (S.last) return { t: '✓ ' + when(S.last), bad: false };
    return { t: '', bad: false };
  }
  function paint() {
    var b = document.getElementById('v107-open');
    if (b) { var s = stText(); b.classList.toggle('err', s.bad); var e = b.querySelector('.v107-st'); if (e) e.textContent = s.t; }
    var m = document.getElementById('v107-sync'); if (m && m.classList.contains('open')) render();
  }
  function addBtn() {
    var p = document.getElementById('cls-panel'); if (!p || document.getElementById('v107-open')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'v107-open';
    b.innerHTML = '<span>☁ 雲端同步</span><span class="v107-st"></span>';
    b.onclick = open;
    var ref = document.getElementById('v106-open') || document.getElementById('v98-open');
    p.insertBefore(b, ref ? ref.nextSibling : p.firstChild);
    paint();
  }
  function box() {
    var m = document.getElementById('v107-sync'); if (m) return m;
    m = document.createElement('div'); m.id = 'v107-sync';
    m.innerHTML = '<div class="sy-box"><div class="sy-top"><h3>☁ 雲端同步</h3><button class="sy-x" data-s="x" title="關閉">✕</button></div><div class="sy-body"></div></div>';
    m.addEventListener('click', function (e) {
      if (e.target === m) { close(); return; }
      var t = e.target.closest('[data-s]'); if (!t) return;
      var a = t.getAttribute('data-s');
      if (a === 'x') close();
      else if (a === 'now') { S.err = ''; pull(); }
      else if (a === 'all') uploadAll();
      else if (a === 'login') login();
      else if (a === 'bak') restore(+t.getAttribute('data-i'));
    });
    m.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'v107-pw') login(); });
    document.body.appendChild(m); return m;
  }
  function open() { box().classList.add('open'); render(); if (pw() && !S.busy && Date.now() - S.lastPullAt > 5000) pull(); }
  function close() { var m = document.getElementById('v107-sync'); if (m) m.classList.remove('open'); }
  function login() {
    var i = document.getElementById('v107-pw'), p = i ? i.value : '', rem = (document.getElementById('v107-rem') || {}).checked;
    if (!p) return;
    S.err = '驗證中…'; render();
    call({ action: 'check', pw: p }).then(function (r) {
      if (!r.admin) { S.err = '密碼錯誤'; render(); return; }
      try { sessionStorage.setItem('gr_pw_v1', p); } catch (e) {}
      if (rem) lset('gr_pw_v1', JSON.stringify(p));
      S.err = ''; pull();
    }).catch(function (e) { S.err = e.message; render(); });
  }
  function restore(i) {
    var b = jget(BAK, []), x = b[i]; if (!x) return;
    if (!confirm('要把「' + label(x.k) + '」還原成 ' + when(x.t) + ' 的備份嗎？\n（目前的內容會另外備份；還原後會上傳到雲端）')) return;
    backup(x.k, lget(x.k), '還原備份前');
    try { LS.setItem(x.k, x.v); } catch (e) { alert('還原失敗：瀏覽器空間不足'); return; }
    toast('已還原「' + label(x.k) + '」');
    refreshUI([x.k]); render();
  }
  function render() {
    var m = box(), body = m.querySelector('.sy-body'), h = '';
    var logged = !!pw();
    h += '<div class="sy-muted">這台裝置：<b>' + esc(meta.dev) + '</b>　｜　資料存在你的 Google 試算表「雲端同步」工作表，讀寫都需要登記密碼。</div>';
    if (!logged) {
      h += '<div class="sy-msg">這台裝置還沒登入。輸入<b>登記密碼</b>（和成績系統同一組）後就會開始同步。</div>' +
        '<div class="sy-row"><input type="password" id="v107-pw" placeholder="登記密碼" autocomplete="current-password">' +
        '<label><input type="checkbox" id="v107-rem" checked> 在這台裝置記住（只用在老師自己的裝置）</label>' +
        '<button class="sy-btn pri" data-s="login">登入</button></div>';
      if (S.err) h += '<div class="sy-msg bad">' + esc(S.err) + '</div>';
    } else {
      var st = stText();
      h += '<div class="sy-row"><b class="' + (st.bad ? 'bad' : 'ok') + '">' + esc(st.t || '尚未同步') + '</b>' +
        '<button class="sy-btn pri" data-s="now"' + (S.busy ? ' disabled' : '') + '>⟳ 立即同步</button></div>';
      if (S.err) h += '<div class="sy-msg bad">' + esc(S.err) + (S.oldApi ? '<br>（請看 docs/成績系統_部署步驟.md 第 5 節：貼上新版程式 → 部署 → 管理部署作業 → 編輯 → 新版本 → 部署）' : '') + '</div>';
      if (S.need.length) h += '<div class="sy-msg">這台有 <b>' + S.need.length + '</b> 項資料雲端還沒有：' + esc(S.need.map(label).join('、')) +
        '。<br>如果這台是你平常記錄的主要裝置，請按下面「以這台資料為正本上傳」。</div>';
    }
    /* 項目表 */
    var ks = Object.keys(KEYS).slice(); localKeys().concat(Object.keys(S.remote)).forEach(function (k) { if (ks.indexOf(k) < 0 && isKey(k)) ks.push(k); });
    h += '<table><thead><tr><th>項目</th><th>這台</th><th>雲端</th><th>狀態</th></tr></thead><tbody>';
    ks.forEach(function (k) {
      var loc = lget(k), R = S.remote[k], s;
      if (!logged) s = '<span class="sy-muted">—</span>';
      else if (meta.dirty[k]) s = '<span class="wait">待上傳</span>';
      else if (S.need.indexOf(k) >= 0) s = '<span class="wait">這台獨有，未上傳</span>';
      else if (R && String(R.ts) === String(meta.syn[k] || '')) s = '<span class="ok">✓ 已同步</span>';
      else if (!R && loc === null) s = '<span class="sy-muted">兩邊都沒有</span>';
      else s = '<span class="sy-muted">等待同步</span>';
      h += '<tr><td>' + esc(label(k)) + '</td><td>' + (loc === null ? '—' : '有（' + size(loc) + '）') + '</td><td>' +
        (R ? (R.del ? '已刪除' : when(R.ts)) + '<div class="sy-muted">' + esc(R.dev || '') + '</div>' : '—') + '</td><td>' + s + '</td></tr>';
    });
    h += '</tbody></table>';
    if (logged) h += '<div class="sy-row"><button class="sy-btn warn" data-s="all"' + (S.busy ? ' disabled' : '') + '>⬆ 以這台資料為正本上傳</button>' +
      '<span class="sy-muted">第一次使用時，在平常記錄的那台（平板）按一次即可。</span></div>';
    h += '<div class="sy-muted">不同步的：字級、深色模式、各面板目前選哪一班、自動記錄開關（每台各自設定）。成績系統本來就在雲端。<br>' +
      '兩台裝置同時改同一項時，以最後修改的為準；被取代的內容會留在這台的備份，可以還原。</div>';
    /* 備份 */
    var b = jget(BAK, []);
    if (Array.isArray(b) && b.length) {
      h += '<h4>這台裝置的備份（最近 ' + b.length + ' 份）</h4><table><thead><tr><th>時間</th><th>項目</th><th>原因</th><th>大小</th><th></th></tr></thead><tbody>';
      for (var i = b.length - 1; i >= 0; i--) h += '<tr><td>' + esc(when(b[i].t)) + '</td><td>' + esc(label(b[i].k)) + '</td><td>' + esc(b[i].why || '') + '</td><td>' + size(b[i].v) +
        '</td><td><button class="sy-btn" data-s="bak" data-i="' + i + '">還原</button></td></tr>';
      h += '</tbody></table>';
    }
    body.innerHTML = h;
  }

  /* ── 啟動與排程 ── */
  function start() {
    addBtn();
    setTimeout(function () { pull(true); }, 800);
    setInterval(function () { if (document.visibilityState === 'visible' && Date.now() - S.lastPullAt > POLL - 5000) pull(); }, POLL);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { if (Date.now() - S.lastPullAt > 20000) pull(); }
    else if (Object.keys(meta.dirty).length && S.pulled) { clearTimeout(pushT); pushDirty(); }
  });
  window.addEventListener('beforeunload', function (e) {
    if (Object.keys(meta.dirty).length && pw() && S.pulled) { pushDirty(); e.preventDefault(); e.returnValue = '還有資料正在上傳到雲端'; return e.returnValue; }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* 測試／除錯用 */
  window.V107SYNC = { open: open, pull: pull, push: pushDirty, meta: function () { return meta; }, state: function () { return S; }, isKey: isKey };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/125_v108-js.js ════ */
try {

/* v108（2026-10-05）
   1. 日曆改日期：v98 日曆每一筆（右側當日清單、接下來三週）在 ✕ 前多一顆 📅；可勾選同一天同項目的其他班一起改。只改 exam_cal_v1 該筆的 date。
   2. 註釋小考拆題模式（nq-varmode，本機設定）：整句＋小字詞隨機（原本行為）／只考整句／只考小字詞。
      做法：考卷畫面產生後（#nq2-qlist 換內容）依模式改寫有拆題的題卡；沒有拆題的註釋照舊。不改 v56 任何函式。
   3. 小考紀錄面板（班級進度「📝 小考紀錄」、小考畫面「📝 小考紀錄」）：
      - 每筆紀錄可設訂正規則 corr：[{op:'ge'|'le', s:分數, t:次數}]（新紀錄預設帶上一次的規則，本機 nq-corr-last）
      - 換題：換成同課另一題（有拆題可選整句或小字詞），同步更新班級進度那筆文字
      - 給學生看 pub（預設是）。學生端經 Apps Script（gr-3 stuGet）讀 nq-records-v1，只拿得到自己班、pub 不是 false 的紀錄
   4. 小考紀錄補答案：每題存 a（答案純文字）、s（原句）；新紀錄在儲存當下補，舊紀錄在本機已從雲端同步過（或未登入同步）時補。
      理由：學生端沒有全部課文資料；避免舊裝置在還沒拉到雲端最新版前改動、蓋掉別台的新紀錄。 */
(function () {
  'use strict';
  var CAL = 'exam_cal_v1', REC = 'nq-records-v1', VM = 'nq-varmode', CORR_LAST = 'nq-corr-last';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function wdOf(s) { var a = String(s).split('-'); return WD[new Date(+a[0], +a[1] - 1, +a[2]).getDay()]; }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function bank(L) { try { return typeof window.nq2BuildLesson === 'function' ? window.nq2BuildLesson(L) : null; } catch (e) { return null; } }
  function noBk(h, D) {
    h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, '');
    ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); });
    return h;
  }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }

  /* ════════ 1. 日曆改日期 ════════ */
  var calList = function () { var a = jget(CAL, []); return Array.isArray(a) ? a : []; };
  function calLabel(el) { var t = el.closest('.v98-it'); var s = t && t.querySelector('.v98-tx'); return s ? s.textContent : ''; }
  function decorateCal() {
    var m = document.getElementById('v98-cal'); if (!m) return;
    m.querySelectorAll('.v98-it').forEach(function (it) {
      if (it.querySelector('.v108-mv')) return;
      var d = it.querySelector('[data-v98^="del|"]'); if (!d) return;
      var id = d.getAttribute('data-v98').slice(4);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'v108-mv'; b.title = '改日期'; b.textContent = '📅';
      b.addEventListener('click', function (e) { e.stopPropagation(); openMove(id, calLabel(b)); });
      it.insertBefore(b, d);
    });
  }
  function mvDlg() {
    var d = document.getElementById('v108-mvdlg'); if (d) return d;
    d = document.createElement('div'); d.id = 'v108-mvdlg';
    d.innerHTML = '<div class="bx"><h4>改日期</h4><div class="it"></div><div class="lb">新的日期</div>' +
      '<input type="date" class="dt"><span class="wd"></span><div class="sib"></div>' +
      '<div class="ft"><button type="button" class="no">取消</button><button type="button" class="ok">確定改日期</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.classList.contains('no')) d.classList.remove('show'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') d.classList.remove('show'); e.stopPropagation(); });
    d.querySelector('.dt').addEventListener('input', function () { syncMv(); });
    d.querySelector('.ok').addEventListener('click', doMove);
    return d;
  }
  var mvId = null;
  function syncMv() {
    var d = mvDlg(), v = d.querySelector('.dt').value, e = calList().filter(function (x) { return x.id === mvId; })[0];
    d.querySelector('.wd').textContent = v ? '（星期' + wdOf(v) + '）' : '';
    d.querySelector('.ok').disabled = !v || !e || v === e.date;
  }
  function openMove(id, lbl) {
    var a = calList(), e = a.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    mvId = id;
    var d = mvDlg();
    d.querySelector('.it').innerHTML = '<span class="tg" style="display:inline-block;padding:1px 7px;border-radius:9px;color:#fff;font-size:12px;background:' + ccol(e.cls) + '">' + esc(e.cls) + '</span> ' +
      esc(md(e.date) + '（' + wdOf(e.date) + '）' + (lbl ? '　' + lbl : ''));
    d.querySelector('.dt').value = e.date;
    var sk = JSON.stringify([e.date, e.item, e.kind, (e.lessons || []).slice().sort(), e.note || '']);
    var sibs = a.filter(function (x) { return x.id !== id && JSON.stringify([x.date, x.item, x.kind, (x.lessons || []).slice().sort(), x.note || '']) === sk; });
    d.querySelector('.sib').innerHTML = sibs.length ? '<div class="lb">同一天的同一項，其他班也一起改：</div>' + sibs.map(function (x) {
      return '<label><input type="checkbox" value="' + esc(x.id) + '">' + esc(x.cls) + '</label>';
    }).join('') : '';
    syncMv();
    d.classList.add('show');
    setTimeout(function () { try { d.querySelector('.dt').focus(); } catch (er) {} }, 30);
  }
  function doMove() {
    var d = mvDlg(), v = d.querySelector('.dt').value; if (!v || !mvId) return;
    var ids = [mvId].concat(Array.prototype.map.call(d.querySelectorAll('.sib input:checked'), function (x) { return x.value; }));
    var a = calList(), n = 0;
    a.forEach(function (x) { if (ids.indexOf(x.id) >= 0 && x.date !== v) { x.date = v; x.moved = new Date().toISOString(); n++; } });
    if (!n) { d.classList.remove('show'); return; }
    if (!jput(CAL, a)) return;
    d.classList.remove('show');
    if (window.V98CAL && document.getElementById('v98-cal') && document.getElementById('v98-cal').classList.contains('open')) window.V98CAL.open();
  }
  (function watchCal() {
    var m = document.getElementById('v98-cal');
    if (!m) { setTimeout(watchCal, 800); return; }
    new MutationObserver(decorateCal).observe(m, { childList: true, subtree: true });
    decorateCal();
  })();

  /* ════════ 2. 註釋小考拆題模式 ════════ */
  var VMODES = [['mix', '整句＋小字詞隨機'], ['whole', '只考整句'], ['sub', '只考小字詞']];
  function vmode() { var v = jget(VM, 'mix'); return v === 'whole' || v === 'sub' ? v : 'mix'; }
  function curLesson() {
    var s = document.getElementById('nq2-lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function excerpt(s, a, b) {   /* 同 v56 考卷的 excerpt：長句只顯示目標所在小句 */
    var full = { pre: s.slice(0, a), w: s.slice(a, b), post: s.slice(b), cutL: false, cutR: false };
    if (a < 0 || s.length <= 30) return full;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return full;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return { pre: p.slice(0, a - acc), w: s.slice(a, b), post: p.slice(b - acc), cutL: k > 0, cutR: k < parts.length - 1 };
      acc = end;
    }
    return full;
  }
  function applyVmode() {
    var mode = vmode(); if (mode === 'mix') return;
    var D = bank(curLesson()); if (!D) return;
    document.querySelectorAll('#nq2-qlist .qc').forEach(function (c) {
      if (c.getAttribute('data-v108') === mode) return;
      c.setAttribute('data-v108', mode);
      var src = c.querySelector('.qs .src'), mk = c.querySelector('.qs mark'), qs = c.querySelector('.qs'), body = c.querySelector('.qa-body');
      if (!src || !qs || !body) return;
      var no = +String(src.textContent).replace(/\D/g, ''), shown = (qs.textContent || '').replace(src.textContent, '').replace(/…/g, '');
      var cand = [];
      D.items.forEach(function (it, i) { if (it[0] === no && D.vars[i]) cand.push(i); });
      if (cand.length > 1) cand = cand.filter(function (i) { return D.items[i][2].indexOf(shown) >= 0; });
      if (cand.length !== 1) return;
      var i = cand[0], vs = D.vars[i], s = D.items[i][2];
      var whole = vs.filter(function (v) { return v[4] === 'whole'; })[0], subs = vs.filter(function (v) { return v[4] === 'sub'; });
      var cur = mk ? mk.textContent : '', isWhole = whole && cur === whole[0], v = null;
      if (mode === 'whole' && !isWhole && whole) v = whole;
      else if (mode === 'sub' && isWhole && subs.length) v = subs[Math.floor(Math.random() * subs.length)];
      if (!v) return;
      var x = excerpt(s, v[1], v[2]);
      qs.innerHTML = (x.cutL ? '<span class="el">…</span>' : '') + esc(x.pre) + (x.w ? '<mark>' + esc(x.w) + '</mark>' : '') + esc(x.post) +
        (x.cutR ? '<span class="el">…</span>' : '') + '<span class="src">註' + no + '</span>';
      body.innerHTML = '<span class="aw">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '：</span>' + noBk(v[3], D);
    });
  }
  function addVmodeUI() {
    var sh = document.getElementById('nq2-shuffle');
    if (!sh || document.getElementById('nq2-v108vm')) return !!sh;
    var w = document.createElement('span'); w.className = 'v108-vm'; w.id = 'nq2-v108vm';
    w.innerHTML = '拆題：' + VMODES.map(function (m) { return '<button type="button" data-vm="' + m[0] + '">' + m[1] + '</button>'; }).join('');
    w.title = '只影響「整句＋小字詞」有拆題的註釋；其他註釋照常出題';
    var lab = sh.closest('label') || sh;
    lab.parentNode.insertBefore(w, lab.nextSibling);
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-vm]'); if (!b) return;
      jput(VM, b.getAttribute('data-vm')); paintVm();
    });
    paintVm();
    var ql = document.getElementById('nq2-qlist');
    if (ql) new MutationObserver(applyVmode).observe(ql, { childList: true });
    return true;
  }
  function paintVm() { var m = vmode(); document.querySelectorAll('#nq2-v108vm [data-vm]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-vm') === m); }); }
  (function tryVm(n) { if (!addVmodeUI() && n < 40) setTimeout(function () { tryVm(n + 1); }, 500); })(0);

  /* ════════ 3＆4. 小考紀錄：補答案、訂正規則、換題、給學生看 ════════ */
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function rid(r) { return r.id || ('q' + String(r.createdAt || '').replace(/\D/g, '')); }
  function localDate(iso) { var d = new Date(iso); return isNaN(d) ? '' : ymd(d); }
  function findIdx(D, key, no) {
    var i = -1;
    D.items.forEach(function (it, k) { if (i < 0 && it[0] + '|' + it[1] === key) i = k; });
    if (i < 0) D.items.forEach(function (it, k) { if (i < 0 && it[0] === no) i = k; });
    return i;
  }
  function answerOf(D, i, w) {
    var it = D.items[i], vs = D.vars[i];
    if (vs) { var v = vs.filter(function (x) { return x[0] === w; })[0]; if (v) return { a: txt(noBk(v[3], D)), whole: v[4] === 'whole' }; }
    return { a: txt(noBk(it[3], D)), whole: false };
  }
  /* 補 id、每題 a／s；有改動回傳 true */
  function enrich(list) {
    var ch = false;
    list.forEach(function (r) {
      if (!r || !r.lesson || !Array.isArray(r.questions)) return;
      if (!r.id) { r.id = rid(r); ch = true; }
      var D = null;
      r.questions.forEach(function (q, k) {
        if (q.a != null && q.s != null) return;
        D = D || bank(r.lesson); if (!D) return;
        var i = findIdx(D, (r.questionKeys || [])[k], q.no); if (i < 0) return;
        var x = answerOf(D, i, q.w);
        q.a = x.a; q.s = D.items[i][2]; if (x.whole) q.whole = true;
        ch = true;
      });
    });
    return ch;
  }
  /* 新紀錄（v60 儲存）當下就補上答案與預設訂正規則 */
  var SP = Storage.prototype, prevSet = SP.setItem, inSet = false;
  SP.setItem = function (k, v) {
    if (!inSet && this === window.localStorage && k === REC) {
      try {
        var list = JSON.parse(v), before = recs().length;
        if (Array.isArray(list)) {
          var last = jget(CORR_LAST, null);
          if (list.length > before && last) list.slice(before).forEach(function (r) { if (r && !r.corr) r.corr = last; });
          if (enrich(list) || list.length > before) v = JSON.stringify(list);
        }
      } catch (e) {}
    }
    inSet = true;
    try { return prevSet.call(this, k, v); } finally { inSet = false; }
  };
  /* 舊紀錄：本機已從雲端拉過資料（或沒登入同步）才補，避免舊資料蓋掉別台 */
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safeToWrite() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  function enrichStored() {
    if (!safeToWrite() || typeof window.nq2BuildLesson !== 'function') return;
    var a = recs(); if (enrich(a)) jput(REC, a);
  }
  setTimeout(enrichStored, 4000);
  setInterval(enrichStored, 30000);

  /* v60 的摘要格式（班級進度那筆用來比對、換題時一起更新） */
  function summary(r) {
    return '〈' + r.lesson.split('—')[0] + '〉註釋小考　註' + r.rangeStart + '～註' + r.rangeEnd + '，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function (q) { return '註' + q.no + ' ' + q.w; }).join('、');
  }

  var fCls = '', swapAt = null, swapPick = null;   /* swapAt＝{id,k}；swapPick＝選中的題目 index */
  function panel() {
    var p = document.getElementById('v108-nqr'); if (p) return p;
    p = document.createElement('div'); p.id = 'v108-nqr';
    p.innerHTML = '<div class="bx"></div>';
    document.body.appendChild(p);
    p.addEventListener('click', onClick);
    p.addEventListener('change', onChange);
    p.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeP(); e.stopPropagation(); });
    return p;
  }
  function openP() { if (safeToWrite()) enrichStored(); swapAt = null; panel().classList.add('open'); render(); }
  function closeP() { var p = document.getElementById('v108-nqr'); if (p) p.classList.remove('open'); }
  function tag(c) { return '<span class="tg" style="background:' + ccol(c) + '">' + esc(c) + '</span>'; }
  function corrHTML(r) {
    var cs = Array.isArray(r.corr) ? r.corr : null, id = esc(r.id);
    if (!cs || !cs.length) {
      var last = jget(CORR_LAST, null);
      return '<div class="corr"><span class="none">訂正規則：尚未設定</span>' +
        '<button type="button" data-a="cnew|' + id + '">＋ 設定</button>' +
        (last ? '<button type="button" data-a="clast|' + id + '">套用上次（' + esc(corrText(last)) + '）</button>' : '') + '</div>';
    }
    return '<div class="corr">訂正：' + cs.map(function (c, j) {
      return '<span class="rw"><input type="number" min="0" max="100" data-c="' + id + '|' + j + '|s" value="' + esc(c.s == null ? '' : c.s) + '">分' +
        '<button type="button" data-a="cop|' + id + '|' + j + '">' + (c.op === 'le' ? '以下' : '以上') + '</button>' +
        ' 訂正 <input type="number" min="0" max="20" data-c="' + id + '|' + j + '|t" value="' + esc(c.t == null ? '' : c.t) + '"> 次' +
        '<button type="button" data-a="cdel|' + id + '|' + j + '" title="刪除這一級">✕</button></span>';
    }).join('') + '<button type="button" data-a="cadd|' + id + '">＋ 級距</button></div>';
  }
  function corrText(cs) {
    return (cs || []).filter(function (c) { return c && c.s !== '' && c.s != null; }).map(function (c) {
      return c.s + '分' + (c.op === 'le' ? '以下' : '以上') + '訂正' + (c.t == null || c.t === '' ? '?' : c.t) + '次';
    }).join('、');
  }
  function render() {
    var p = panel(), bx = p.querySelector('.bx');
    var all = recs().map(function (r, i) { return { r: r, i: i }; }).filter(function (o) { return o.r && o.r.lesson && (!fCls || (o.r.classes || []).indexOf(fCls) >= 0); });
    all.sort(function (a, b) { return String(b.r.createdAt).localeCompare(String(a.r.createdAt)); });
    var h = '<div class="top"><h3>📝 註釋小考紀錄</h3><span class="sp"></span><button type="button" data-a="x">✕ 關閉</button></div>';
    h += '<div class="flt"><button type="button" data-a="f|"' + (fCls ? '' : ' class="on"') + '>四班全部</button>' +
      classes().map(function (c) { return '<button type="button" data-a="f|' + esc(c) + '"' + (fCls === c ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('') +
      '<span class="hint">改動會經雲端同步給學生端（學生重新打開網頁就會看到）</span></div>';
    h += '<div class="lst">' + (all.length ? all.map(function (o) { return recHTML(o.r); }).join('') : '<div class="empty">還沒有小考紀錄。在註釋小考的考卷畫面按「記錄本次小考」就會出現在這裡。</div>') + '</div>';
    h += '<div class="ft">訂正規則、換題、「給學生看」都會存在小考紀錄（nq-records-v1）。換題時，班級進度裡同一天的那筆考試文字也會一起更新。</div>';
    bx.innerHTML = h;
  }
  function recHTML(r) {
    var id = esc(r.id || rid(r)), d = localDate(r.createdAt), pub = r.pub !== false;
    var h = '<div class="rec' + (pub ? '' : ' hid') + '"><div class="rh"><b>' + (d ? md(d) + '（' + wdOf(d) + '）' : '') + '　〈' + esc(String(r.lesson).split('—')[0]) + '〉</b>' +
      '<span>註' + esc(r.rangeStart) + '～註' + esc(r.rangeEnd) + '・' + r.questions.length + ' 題</span>' + (r.classes || []).map(tag).join(' ') +
      '<label class="pub"><input type="checkbox" data-pub="' + id + '"' + (pub ? ' checked' : '') + '>給學生看</label></div>';
    h += corrHTML(r);
    h += '<ul class="qs">' + r.questions.map(function (q, k) {
      var on = swapAt && swapAt.id === r.id && swapAt.k === k;
      return '<li><span class="n">註' + esc(q.no) + '</span><span class="w">' + esc(q.whole ? '整句' : q.w) + '</span>' +
        '<span class="a">' + esc(q.a == null ? '（答案尚未補上）' : q.a) + '</span>' +
        '<button type="button" class="sw" data-a="sw|' + id + '|' + k + '">' + (on ? '取消換題' : '換題') + '</button></li>' + (on ? pickHTML(r, k) : '');
    }).join('') + '</ul></div>';
    return h;
  }
  function pickHTML(r, k) {
    var D = bank(r.lesson);
    if (!D) return '<li class="pick">這一課目前沒有題庫資料。</li>';
    var used = {}; (r.questionKeys || []).forEach(function (x, j) { if (j !== k) used[x] = 1; });
    var h = '<li class="pick" style="display:block"><div class="ph">把「註' + esc(r.questions[k].no) + ' ' + esc(r.questions[k].w) + '」換成：</div><div class="g">' +
      D.items.map(function (it, i) {
        var lab = D.vars[i] ? D.vars[i][0][0] : it[1];
        return '<button type="button" data-a="sp|' + i + '"' + (used[it[0] + '|' + it[1]] ? ' disabled title="這次已經考了"' : '') +
          (swapPick === i ? ' style="background:#7a2e2e;color:#fff"' : '') + '><small>' + it[0] + '</small>' + esc(lab.length > 12 ? lab.slice(0, 12) + '…' : lab) + '</button>';
      }).join('') + '</div>';
    if (swapPick != null && D.items[swapPick]) {
      var vs = D.vars[swapPick];
      h += '<div class="vs">' + (vs ? '考哪一個：' + vs.map(function (v, j) {
        return '<button type="button" data-a="sv|' + j + '">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '</button>';
      }).join('') : '<button type="button" data-a="sv|-1">確定換成「註' + D.items[swapPick][0] + ' ' + esc(D.items[swapPick][1]) + '」</button>') + '</div>';
    }
    return h + '</li>';
  }
  function update(id, fn) {
    var a = recs(), r = a.filter(function (x) { return x && (x.id || rid(x)) === id; })[0]; if (!r) return null;
    if (!r.id) r.id = id;
    var old = JSON.parse(JSON.stringify(r));
    fn(r);
    jput(REC, a);
    return { old: old, now: r };
  }
  function doSwap(vj) {
    if (!swapAt || swapPick == null) return;
    var res = update(swapAt.id, function (r) {
      var D = bank(r.lesson), it = D.items[swapPick], vs = D.vars[swapPick], v = vs && vs[vj];
      var w = v ? v[0] : it[1], x = answerOf(D, swapPick, w);
      r.questionKeys = r.questionKeys || [];
      r.questionKeys[swapAt.k] = it[0] + '|' + it[1];
      r.questions[swapAt.k] = { no: it[0], w: w, a: x.a, s: it[2] };
      if (x.whole) r.questions[swapAt.k].whole = true;
      /* 題目維持註號順序（同 v60 紀錄） */
      var z = r.questions.map(function (q, j) { return { q: q, k: r.questionKeys[j] }; }).sort(function (a, b) { return a.q.no - b.q.no; });
      r.questions = z.map(function (o) { return o.q; }); r.questionKeys = z.map(function (o) { return o.k; });
      var nos = r.questions.map(function (q) { return q.no; });
      r.rangeStart = Math.min.apply(null, nos); r.rangeEnd = Math.max.apply(null, nos);
      r.edited = new Date().toISOString();
    });
    if (res) syncClsRecord(res.old, res.now);
    swapAt = null; swapPick = null;
    render();
  }
  /* 班級進度（cls_records_v1）：v60 存的是 { d: 當天, k: '考試', t: esc(摘要) }，以同日＋原摘要比對 */
  function syncClsRecord(old, now) {
    if (typeof clsLoad !== 'function' || typeof clsSave !== 'function') return;
    var cls = clsLoad(), d = localDate(old.createdAt), ot = esc(summary(old)), nt = esc(summary(now)), n = 0;
    (old.classes || []).forEach(function (c) {
      (cls[c] || []).forEach(function (e) { if (e && e.d === d && e.k === '考試' && e.t === ot) { e.t = nt; n++; } });
    });
    if (n) { clsSave(cls); if (typeof clsRender === 'function') try { clsRender(); } catch (e) {} }
  }
  function onClick(e) {
    var p = panel();
    if (e.target === p) { closeP(); return; }
    var b = e.target.closest('[data-a]'); if (!b) return;
    var a = b.getAttribute('data-a').split('|'), t = a[0];
    if (t === 'x') closeP();
    else if (t === 'f') { fCls = a[1]; render(); }
    else if (t === 'sw') { var k = +a[2]; swapAt = swapAt && swapAt.id === a[1] && swapAt.k === k ? null : { id: a[1], k: k }; swapPick = null; render(); }
    else if (t === 'sp') { swapPick = +a[1]; var D = null; var r = recs().filter(function (x) { return x && (x.id || rid(x)) === swapAt.id; })[0];
      D = r && bank(r.lesson); if (D && !D.vars[swapPick]) { render(); } else render(); }
    else if (t === 'sv') doSwap(+a[1]);
    else if (t === 'cnew') { update(a[1], function (r) { r.corr = [{ op: 'ge', s: '', t: '' }, { op: 'le', s: '', t: '' }]; }); render(); }
    else if (t === 'clast') { var l = jget(CORR_LAST, null); if (l) update(a[1], function (r) { r.corr = l; }); render(); }
    else if (t === 'cadd') { update(a[1], function (r) { r.corr = (r.corr || []).concat([{ op: 'ge', s: '', t: '' }]); }); render(); }
    else if (t === 'cdel') { update(a[1], function (r) { r.corr.splice(+a[2], 1); if (!r.corr.length) delete r.corr; }); render(); }
    else if (t === 'cop') { var res = update(a[1], function (r) { var c = r.corr[+a[2]]; c.op = c.op === 'le' ? 'ge' : 'le'; }); if (res) jput(CORR_LAST, res.now.corr); render(); }
  }
  function onChange(e) {
    var x = e.target;
    if (x.hasAttribute('data-pub')) { update(x.getAttribute('data-pub'), function (r) { if (x.checked) delete r.pub; else r.pub = false; }); render(); return; }
    if (x.hasAttribute('data-c')) {
      var a = x.getAttribute('data-c').split('|'), v = x.value === '' ? '' : Math.max(0, Math.round(+x.value));
      var res = update(a[0], function (r) { if (r.corr && r.corr[+a[1]]) r.corr[+a[1]][a[2]] = v; });
      if (res && res.now.corr) jput(CORR_LAST, res.now.corr);
    }
  }
  function addEntry() {
    var p = document.getElementById('cls-panel');
    if (p && !document.getElementById('v108-open')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'v108-open'; b.textContent = '📝 小考紀錄（訂正、換題、給學生看）';
      b.onclick = openP;
      var cal = document.getElementById('v98-open');
      if (cal) cal.parentNode.insertBefore(b, cal.nextSibling); else p.insertBefore(b, p.firstChild);
    }
    var r = document.getElementById('nq2-v60rec');
    if (r && !document.getElementById('nq2-v108rec')) {
      var c = document.createElement('button'); c.type = 'button'; c.id = 'nq2-v108rec'; c.className = 'v108-nqr-btn'; c.textContent = '📝 小考紀錄';
      c.onclick = openP;
      r.parentNode.insertBefore(c, r);
    }
    return !!(p && r);
  }
  (function tryEntry(n) { if (!addEntry() && n < 40) setTimeout(function () { tryEntry(n + 1); }, 500); })(0);

  window.V108 = { openRecords: openP, enrich: enrichStored, applyVmode: applyVmode };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/128_v109-js.js ════ */
try {

/* v109（2026-10-05）—— 只加不刪，資料都存在 nq-records-v1 每筆紀錄裡（會經雲端同步給學生端 gr-3 stuGet）
   1. 考卷編號：L＋兩位課次＋兩位「該班這一課第幾次」，例 L0301。每班各自算（老師 10/5 決定）。
      - 紀錄存 codes：{ 班: 'L0301' }。新紀錄儲存時給號；舊紀錄依建立時間補號（安全條件同 v108：已從雲端拉過或未登入同步）。
      - 考卷畫面左上角顯示編號；旁邊可點選班級（預設：正在上課的班 → 今天日曆排這課小考的班 → 上次選的班），記錄視窗自動勾同樣的班。
   2. 記錄視窗多一列「訂正規則」（預設上一次），存進紀錄 corr，學生端顯示。
   ＊ 每題 ord＝考卷上的題號（打亂順序時照考卷），學生端照這個順序；換題的新題目沿用空出的題號。v109 之前的舊紀錄沒有 ord（照註號排）。
   ＊ 小考紀錄面板「🔢 照考卷排題號」：依考卷順序逐題點選 → 寫入 ord 並把題目陣列照順序排（舊紀錄補順序用）。
   3. 訂正要抄什麼：每題 x＝考卷上顯示的句子（含刪節號「…」）；整張 copy、每題 cp：'x' 考卷句／'s' 完整原句／'w' 只抄詞。預設 'x'。
      小考紀錄面板每張可設整張，每題可點選改單題（循環：跟整張→考卷句→完整原句→只抄詞）。 */
(function () {
  'use strict';
  var REC = 'nq-records-v1', CORR_LAST = 'nq-corr-last', CLS_LAST = 'nq-v109-cls';
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };   /* 同 v98 */
  var CP = [['x', '考卷句'], ['s', '完整原句'], ['w', '只抄詞']];
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function lnum(L) { for (var n in QK) if (QK[n] === L) return +n; return 0; }
  function prefix(L) { var n = lnum(L); return 'L' + (n ? pad(n) : '00'); }
  function codeNum(c) { var m = /(\d{2})$/.exec(String(c || '')); return m ? +m[1] : 0; }
  function maxNum(list, L, c, skip) {
    var mx = 0;
    list.forEach(function (r) { if (r && r !== skip && r.lesson === L && r.codes && r.codes[c]) mx = Math.max(mx, codeNum(r.codes[c])); });
    return mx;
  }
  function nextCode(list, L, c) { return prefix(L) + pad(maxNum(list, L, c) + 1); }
  /* 舊紀錄（或別台同步來、沒編號的）依建立時間補號 */
  function assignCodes(list) {
    var ch = false;
    list.slice().sort(function (a, b) { return String(a && a.createdAt).localeCompare(String(b && b.createdAt)); }).forEach(function (r) {
      if (!r || !r.lesson || !Array.isArray(r.classes)) return;
      r.classes.forEach(function (c) {
        if (r.codes && r.codes[c]) return;
        r.codes = r.codes || {};
        r.codes[c] = prefix(r.lesson) + pad(maxNum(list, r.lesson, c, r) + 1);
        ch = true;
      });
    });
    return ch;
  }
  /* 考卷句：依原句與標記字詞位置，用 v56 同樣規則截取（舊紀錄用；新紀錄直接取考卷畫面） */
  function excerpt(s, a, b) {
    if (a < 0 || s.length <= 30) return s;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return s;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) {
      var p = parts[k], end = acc + p.length;
      if (a >= acc && b <= end) return (k > 0 ? '…' : '') + p + (k < parts.length - 1 ? '…' : '');
      acc = end;
    }
    return s;
  }
  /* 換題後新題目沒有 ord：補上空出來的那個題號（其他題已有 ord 時） */
  function fixOrd(list) {
    var ch = false;
    list.forEach(function (r) {
      var qs = r && Array.isArray(r.questions) ? r.questions : [];
      if (!qs.some(function (q) { return q.ord; })) return;
      var used = {}; qs.forEach(function (q) { if (q.ord) used[q.ord] = 1; });
      var free = []; for (var i = 1; i <= qs.length; i++) if (!used[i]) free.push(i);
      qs.forEach(function (q) { if (!q.ord && free.length) { q.ord = free.shift(); ch = true; } });
    });
    return ch;
  }
  /* 題目陣列本身照考卷題號排（questions 與 questionKeys 一起動）：後台 gr-3 只照陣列順序傳給學生，這樣不更新後台也對 */
  function sortByOrd(list) {
    var ch = false;
    list.forEach(function (r) {
      var qs = r && Array.isArray(r.questions) ? r.questions : [];
      if (!qs.length || !qs.every(function (q) { return q.ord; })) return;
      var ks = Array.isArray(r.questionKeys) ? r.questionKeys : [];
      var z = qs.map(function (q, i) { return { q: q, k: ks[i] }; });
      var s = z.slice().sort(function (a, b) { return a.q.ord - b.q.ord; });
      if (s.every(function (o, i) { return o === z[i]; })) return;
      r.questions = s.map(function (o) { return o.q; });
      if (ks.length) r.questionKeys = s.map(function (o) { return o.k; });
      ch = true;
    });
    return ch;
  }
  function fillExcerpt(list) {
    var ch = false;
    list.forEach(function (r) {
      (r && Array.isArray(r.questions) ? r.questions : []).forEach(function (q) {
        if (q.x != null || !q.s) return;
        var w = q.whole ? '' : String(q.w || ''), a = w ? q.s.indexOf(w) : -1;
        q.x = q.whole ? q.s : excerpt(q.s, a, a + w.length); ch = true;
      });
    });
    return ch;
  }

  /* ── 考卷畫面：左上角編號＋班級選擇 ── */
  var pickCls = null;   /* 本次考卷要算編號的班（陣列） */
  function curLesson() {
    var s = document.getElementById('nq2-lesson'); if (!s || s.selectedIndex < 0) return '';
    return s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '');
  }
  function defaultCls(L) {
    var live = jget('tp_live_v1', null), t = ymd(new Date());
    if (live && live.date === t && live.classId && classes().indexOf(live.classId) >= 0) return [live.classId];
    var n = lnum(L), cal = jget('exam_cal_v1', []);
    var today = (Array.isArray(cal) ? cal : []).filter(function (e) { return e && e.date === t && e.item === '註釋小考' && (e.lessons || []).indexOf(n) >= 0; })
      .map(function (e) { return e.cls; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
    if (today.length) return today;
    var last = jget(CLS_LAST, []);
    return Array.isArray(last) ? last.filter(function (c) { return classes().indexOf(c) >= 0; }) : [];
  }
  function paintCode() {
    var t = document.getElementById('nq2-qTitle'); if (!t) return;
    var L = curLesson(); if (!L) return;
    var box = document.getElementById('nq2-v109code');
    if (!box) { box = document.createElement('span'); box.id = 'nq2-v109code'; t.insertBefore(box, t.firstChild); }
    if (!pickCls) pickCls = defaultCls(L);
    var list = recs(), cs = pickCls.filter(function (c) { return classes().indexOf(c) >= 0; });
    var code = cs.length ? cs.map(function (c) { return { c: c, k: nextCode(list, L, c) }; }) : [];
    var same = code.length && code.every(function (x) { return x.k === code[0].k; });
    box.innerHTML = '<span class="v109-code">' + (code.length ? (same ? '<b>' + esc(code[0].k) + '</b>' : code.map(function (x) { return '<b>' + esc(x.k) + '</b><small>' + esc(x.c) + '</small>'; }).join(' ')) :
      '<b>' + esc(prefix(L)) + '--</b><small>點班級</small>') + '</span><span class="v109-cls">' +
      classes().map(function (c) { return '<button type="button" data-c="' + esc(c) + '"' + (cs.indexOf(c) >= 0 ? ' class="on"' : '') + '>' + esc(c.replace('一', '')) + '</button>'; }).join('') + '</span>';
  }
  function hookQuiz() {
    var q = document.getElementById('nq2-quiz'), t = document.getElementById('nq2-qTitle');
    if (!q || !t) return false;
    new MutationObserver(function () { if (q.classList.contains('show')) { pickCls = null; paintCode(); } else pickCls = null; })
      .observe(q, { attributes: true, attributeFilter: ['class'] });
    var ql = document.getElementById('nq2-qlist');
    if (ql) new MutationObserver(function () { if (q.classList.contains('show')) paintCode(); }).observe(ql, { childList: true });
    t.addEventListener('click', function (e) {
      var b = e.target.closest('.v109-cls [data-c]'); if (!b) return;
      e.stopPropagation();
      var c = b.getAttribute('data-c'), i = (pickCls || []).indexOf(c);
      pickCls = (pickCls || []).slice(); if (i >= 0) pickCls.splice(i, 1); else pickCls.push(c);
      jput(CLS_LAST, pickCls);
      paintCode();
    });
    return true;
  }

  /* ── 記錄視窗：自動勾班級＋訂正規則＋整張訂正抄法 ── */
  var dlgCorr = null, dlgCopy = 'x';
  function corrRows() {
    return (dlgCorr || []).map(function (c, j) {
      return '<span class="rw"><input type="number" min="0" max="100" data-j="' + j + '" data-f="s" value="' + esc(c.s) + '">分' +
        '<button type="button" data-op="' + j + '">' + (c.op === 'le' ? '以下' : '以上') + '</button> 訂正 ' +
        '<input type="number" min="0" max="20" data-j="' + j + '" data-f="t" value="' + esc(c.t) + '"> 次</span>';
    }).join('') + '<button type="button" data-add="1">＋級距</button>';
  }
  function paintDlg(d) {
    var box = d.querySelector('.v109-dlg');
    if (!box) {
      box = document.createElement('div'); box.className = 'v109-dlg';
      var ft = d.querySelector('.v60-ft'); ft.parentNode.insertBefore(box, ft);
      box.addEventListener('input', function (e) {
        var x = e.target, j = x.getAttribute('data-j'); if (j == null) return;
        dlgCorr[+j][x.getAttribute('data-f')] = x.value === '' ? '' : Math.max(0, Math.round(+x.value));
      });
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-op')) { var c = dlgCorr[+b.getAttribute('data-op')]; c.op = c.op === 'le' ? 'ge' : 'le'; }
        else if (b.hasAttribute('data-add')) dlgCorr.push({ op: 'ge', s: '', t: '' });
        else if (b.hasAttribute('data-cp')) dlgCopy = b.getAttribute('data-cp');
        paintDlg(d);
      });
    }
    box.innerHTML = '<div>訂正規則：' + corrRows() + '</div><div>訂正要抄：' + CP.map(function (m) {
      return '<button type="button" data-cp="' + m[0] + '"' + (dlgCopy === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>';
    }).join(' ') + '<span style="opacity:.7;font-size:12px">（之後可在「📝 小考紀錄」逐題改）</span></div>';
  }
  function hookDlg() {
    var d = document.getElementById('nq2-v60dlg'); if (!d) return false;
    new MutationObserver(function () {
      if (!d.classList.contains('show')) return;
      var last = jget(CORR_LAST, null);
      dlgCorr = JSON.parse(JSON.stringify(Array.isArray(last) && last.length ? last : [{ op: 'ge', s: '', t: '' }, { op: 'le', s: '', t: '' }]));
      dlgCopy = 'x';
      paintDlg(d);
      /* 班級：若都沒勾，勾考卷畫面選的班（v100 從日曆開考時會先勾好，不覆蓋） */
      setTimeout(function () {
        var ins = Array.prototype.slice.call(d.querySelectorAll('.v60-cls input'));
        if (ins.some(function (x) { return x.checked; }) || !pickCls || !pickCls.length) return;
        ins.forEach(function (x) { if (pickCls.indexOf(x.value) >= 0) { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); } });
      }, 50);
    }).observe(d, { attributes: true, attributeFilter: ['class'] });
    return true;
  }
  /* 考卷畫面上每題實際顯示的句子（含刪節號），依題卡順序對應註號 */
  function shownExcerpts() {
    return Array.prototype.map.call(document.querySelectorAll('#nq2-qlist .qc'), function (c) {
      var qs = c.querySelector('.qs'), src = c.querySelector('.qs .src'), m = c.querySelector('.qs mark');
      var t = qs ? qs.textContent : '';
      if (src) t = t.replace(src.textContent, '');
      return { no: src ? +String(src.textContent).replace(/\D/g, '') : 0, w: m ? m.textContent : '', x: t.trim() };
    });
  }

  /* ── 儲存攔截（包在 v108 外層）：新紀錄給號、存訂正規則／抄法／考卷句；舊紀錄補號 ── */
  var SP = Storage.prototype, prevSet = SP.setItem, inSet = false;
  SP.setItem = function (k, v) {
    if (!inSet && this === window.localStorage && k === REC) {
      try {
        var list = JSON.parse(v), before = recs(), dlg = document.getElementById('nq2-v60dlg');
        if (Array.isArray(list)) {
          if (list.length > before.length && dlg && dlg.classList.contains('show')) {
            var shown = shownExcerpts(), used = shown.map(function () { return false; });
            list.slice(before.length).forEach(function (r) {
              if (!r) return;
              var cs = (dlgCorr || []).filter(function (c) { return c.s !== '' && c.s != null; });
              if (cs.length) { r.corr = cs; jput(CORR_LAST, cs); }
              r.copy = dlgCopy || 'x';
              (r.questions || []).forEach(function (q) {
                for (var i = 0; i < shown.length; i++) if (!used[i] && shown[i].no === q.no && (!shown[i].w || shown[i].w === q.w)) { used[i] = true; q.x = shown[i].x; q.ord = i + 1; break; }   /* ord＝考卷上的題號（亂序時照考卷） */
              });
            });
          }
          assignCodes(list); fixOrd(list); sortByOrd(list);
          v = JSON.stringify(list);
        }
      } catch (e) {}
    }
    inSet = true;
    try { return prevSet.call(this, k, v); } finally { inSet = false; }
  };
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safeToWrite() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  function fixStored() {
    if (!safeToWrite()) return;
    var a = recs(), c1 = assignCodes(a), c2 = fillExcerpt(a), c3 = fixOrd(a), c4 = sortByOrd(a);
    if (c1 || c2 || c3 || c4) jput(REC, a);
  }
  setTimeout(fixStored, 6000);
  setInterval(fixStored, 30000);

  /* ── 小考紀錄面板（v108）：顯示編號、整張／每題訂正抄法 ── */
  function updRec(id, fn) {
    var a = recs(), r = a.filter(function (x) { return x && x.id === id; })[0]; if (!r) return null;
    fn(r); jput(REC, a); return r;
  }
  var ordPick = null;   /* 照考卷排題號：{ id, seq:[題目 index…] } */
  function cpName(k) { for (var i = 0; i < CP.length; i++) if (CP[i][0] === k) return CP[i][1]; return CP[0][1]; }
  function decoratePanel() {
    var p = document.getElementById('v108-nqr'); if (!p) return;
    var all = recs();
    p.querySelectorAll('.rec').forEach(function (el) {
      if (el.querySelector('.v109-cp')) return;
      var pub = el.querySelector('[data-pub]'); if (!pub) return;
      var id = pub.getAttribute('data-pub'), r = all.filter(function (x) { return x && x.id === id; })[0]; if (!r) return;
      var rh = el.querySelector('.rh b');
      if (rh && r.codes) {
        var ks = Object.keys(r.codes).map(function (c) { return '<span class="v109-cd" title="' + esc(c) + '">' + esc(r.codes[c]) + '</span><small>' + esc(c.replace('一', '')) + '</small>'; }).join(' ');
        var s = document.createElement('span'); s.innerHTML = ks; s.style.marginRight = '6px'; rh.parentNode.insertBefore(s, rh);
      }
      var cp = document.createElement('div'); cp.className = 'v109-cp';
      var whole = r.copy || 'x';
      var picking = ordPick && ordPick.id === id, hasOrd = r.questions.every(function (q) { return q.ord; });
      cp.innerHTML = '訂正要抄（整張）：' + CP.map(function (m) { return '<button type="button" data-cpa="' + m[0] + '"' + (whole === m[0] ? ' class="on"' : '') + '>' + m[1] + '</button>'; }).join('') +
        '<span style="opacity:.7">　每題右邊可單獨改</span>' +
        (picking ? '<span class="v109-ordh">👉 依考卷順序點題目（已點 ' + ordPick.seq.length + '／' + r.questions.length + '）</span><button type="button" data-ordx="1">取消</button>'
          : '<button type="button" data-ord="1" class="v109-ordb">🔢 照考卷排題號' + (hasOrd ? '（已排）' : '') + '</button>');
      var corr = el.querySelector('.corr'); (corr || el.querySelector('.qs')).insertAdjacentElement(corr ? 'afterend' : 'beforebegin', cp);
      cp.addEventListener('click', function (e) {
        if (e.target.closest('[data-ord]')) { ordPick = { id: id, seq: [] }; if (window.V108) window.V108.openRecords(); return; }
        if (e.target.closest('[data-ordx]')) { ordPick = null; if (window.V108) window.V108.openRecords(); return; }
        var b = e.target.closest('[data-cpa]'); if (!b) return;
        updRec(id, function (x) { x.copy = b.getAttribute('data-cpa'); });
        if (window.V108) window.V108.openRecords();
      });
      var qLis = Array.prototype.filter.call(el.querySelectorAll('.qs > li'), function (li) { return li.querySelector('.sw'); });
      qLis.forEach(function (li, k) {
        var q0 = r.questions[k]; if (!q0) return;
        var nb = document.createElement('span'); nb.className = 'v109-ordn';
        var pi = picking ? ordPick.seq.indexOf(k) : -1;
        nb.textContent = picking ? (pi >= 0 ? pi + 1 : '?') : (q0.ord || '');
        if (picking || q0.ord) li.insertBefore(nb, li.firstChild);
        if (picking) {
          li.classList.add('v109-pick');
          li.addEventListener('click', function (e) {
            if (e.target.closest('button,input,select')) return;
            if (ordPick.seq.indexOf(k) >= 0) return;
            ordPick.seq.push(k);
            nb.textContent = ordPick.seq.length; li.classList.add('done');
            var h = el.querySelector('.v109-ordh'); if (h) h.textContent = '👉 依考卷順序點題目（已點 ' + ordPick.seq.length + '／' + r.questions.length + '）';
            if (ordPick.seq.length === r.questions.length) {
              var seq = ordPick.seq; ordPick = null;
              updRec(id, function (x) { seq.forEach(function (qi, n) { x.questions[qi].ord = n + 1; }); sortByOrd([x]); x.ordSet = new Date().toISOString(); });
              if (window.V108) window.V108.openRecords();
            }
          });
        }
      });
      qLis.forEach(function (li, k) {
        var sw = li.querySelector('.sw'); if (!sw || li.querySelector('.v109-qcp')) return;
        var q = r.questions[k]; if (!q) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'v109-qcp' + (q.cp ? ' ov' : '');
        b.textContent = q.cp ? cpName(q.cp) : '同整張';
        b.title = '這一題訂正要抄：' + (q.cp ? cpName(q.cp) : '跟整張（' + cpName(whole) + '）') + '｜點一下切換';
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var order = ['', 'x', 's', 'w'], nx = order[(order.indexOf(q.cp || '') + 1) % order.length];
          updRec(id, function (x) { if (nx) x.questions[k].cp = nx; else delete x.questions[k].cp; });
          if (window.V108) window.V108.openRecords();
        });
        li.insertBefore(b, sw);
      });
    });
  }
  (function watchPanel() {
    var p = document.getElementById('v108-nqr');
    if (!p) { setTimeout(watchPanel, 300); return; }
    new MutationObserver(decoratePanel).observe(p, { childList: true, subtree: true });
    decoratePanel();   /* 面板第一次打開時觀察器還沒掛上，先補一次 */
  })();
  /* 各自只掛一次（避免重複掛監聽造成點一下切換兩次） */
  var hookedQ = false, hookedD = false;
  (function tryHook(n) { if (!hookedQ) hookedQ = hookQuiz(); if (!hookedD) hookedD = hookDlg(); if (!(hookedQ && hookedD) && n < 40) setTimeout(function () { tryHook(n + 1); }, 500); })(0);

  window.V109 = { fix: fixStored, nextCode: function (L, c) { return nextCode(recs(), L, c); } };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/132_v111-js.js ════ */
try {

/* v111（2026-10-05）：小考紀錄（nq-records-v1）每筆「✏️ 編輯」——老師要求「自動記錄的小考卷有誤，全部要能手改」
   - 日期（改 createdAt 的日期、保留原時間）、班級（勾選）、各班編號（L＋4 碼，可手改；留空＝自動給號）
   - 題目：改「考卷上的句子」（q.x）、答案（q.a）、刪除；從題庫加題（有拆題可選整句／小字詞）；題號 ord 依畫面順序重編
   - 存檔後範圍（rangeStart／End）重算，加 edited 時間；班級進度那筆不自動改（避免誤刪），面板有提醒
   做法：在 v108 面板每筆紀錄標題加按鈕，編輯時用表單取代那一筆的畫面；不改 v108／v109 程式。 */
(function () {
  'use strict';
  var REC = 'nq-records-v1';
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function recs() { var a = jget(REC, []); return Array.isArray(a) ? a : []; }
  function bank(L) { try { return typeof window.nq2BuildLesson === 'function' ? window.nq2BuildLesson(L) : null; } catch (e) { return null; } }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }
  function noBk(h, D) { h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, ''); ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); }); return h; }
  function excerpt(s, a, b) {   /* 同 v56／v109 */
    if (a < 0 || s.length <= 30) return s;
    var parts = s.match(/[^。！？；]+[。！？；」』]*/g) || [s];
    if (parts.join('') !== s) return s;
    var acc = 0;
    for (var k = 0; k < parts.length; k++) { var p = parts[k], end = acc + p.length; if (a >= acc && b <= end) return (k > 0 ? '…' : '') + p + (k < parts.length - 1 ? '…' : ''); acc = end; }
    return s;
  }

  var ed = null;   /* 編輯中：{ id, d: 日期, cls: [], codes: {}, qs: [{no,w,a,s,x,whole,cp,key}], add: 題庫 index 或 null } */
  function startEdit(id) {
    var r = recs().filter(function (x) { return x && x.id === id; })[0]; if (!r) return;
    var dt = new Date(r.createdAt);
    var qs = (r.questions || []).map(function (q, i) { return { no: q.no, w: q.w, a: q.a == null ? '' : q.a, s: q.s || '', x: q.x == null ? (q.s || '') : q.x, whole: !!q.whole, cp: q.cp || '', key: (r.questionKeys || [])[i] || (q.no + '|' + q.w) }; });
    if (qs.every(function (q, i) { return r.questions[i].ord; })) qs = qs.map(function (q, i) { return { q: q, o: r.questions[i].ord }; }).sort(function (a, b) { return a.o - b.o; }).map(function (z) { return z.q; });
    ed = { id: id, lesson: r.lesson, d: isNaN(dt) ? ymd(new Date()) : ymd(dt), cls: (r.classes || []).slice(), codes: JSON.parse(JSON.stringify(r.codes || {})), qs: qs, add: null };
    if (window.V108) window.V108.openRecords();
  }
  function formHTML() {
    var h = '<div class="v111-ed" data-v111="1"><h4>✏️ 編輯小考紀錄：〈' + esc(String(ed.lesson).split('—')[0]) + '〉</h4>';
    h += '<div class="rw"><span class="k">日期</span><input type="date" data-f="d" value="' + esc(ed.d) + '"></div>';
    h += '<div class="rw"><span class="k">班級</span>' + classes().map(function (c) { return '<button type="button" data-c="' + esc(c) + '"' + (ed.cls.indexOf(c) >= 0 ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('') + '</div>';
    h += '<div class="rw cd"><span class="k">編號</span>' + ed.cls.map(function (c) { return esc(c.replace('一', '')) + ' <input type="text" data-code="' + esc(c) + '" value="' + esc(ed.codes[c] || '') + '" placeholder="自動">'; }).join('　') +
      '<span class="warn">（L＋課次2碼＋第幾次2碼，例 L0304；留空＝自動給號）</span></div>';
    h += '<div class="rw"><span class="k">題目</span><span style="opacity:.75">照考卷順序排（題號＝這裡的順序；要調順序可存檔後用「🔢 照考卷排題號」）</span></div>';
    ed.qs.forEach(function (q, i) {
      h += '<div class="q"><span class="n">' + (i + 1) + '. 註' + esc(q.no) + '<br><small>' + esc(q.whole ? '整句' : q.w) + '</small></span><div>' +
        '<div style="font-size:12px;opacity:.7">考卷上的句子</div><textarea data-q="' + i + '" data-k="x">' + esc(q.x) + '</textarea>' +
        '<div style="font-size:12px;opacity:.7">答案</div><textarea data-q="' + i + '" data-k="a">' + esc(q.a) + '</textarea></div>' +
        '<button type="button" class="del" data-del="' + i + '">刪除</button></div>';
    });
    var D = bank(ed.lesson);
    h += '<div class="add"><button type="button" data-addt="1">＋ 加一題</button>';
    if (ed.add === -1 && D) {
      var used = {}; ed.qs.forEach(function (q) { used[q.key] = 1; });
      h += '<div class="g">' + D.items.map(function (it, i) {
        var lab = D.vars[i] ? D.vars[i][0][0] : it[1];
        return '<button type="button" data-pk="' + i + '"' + (used[it[0] + '|' + it[1]] ? ' disabled' : '') + '><small>' + it[0] + '</small>' + esc(lab.length > 12 ? lab.slice(0, 12) + '…' : lab) + '</button>';
      }).join('') + '</div>';
    } else if (ed.add != null && ed.add >= 0 && D && D.items[ed.add]) {
      var vs = D.vars[ed.add], it0 = D.items[ed.add];
      h += '<div class="rw">加入「註' + it0[0] + '」：' + (vs ? vs.map(function (v, j) { return '<button type="button" data-pv="' + j + '">' + (v[4] === 'whole' ? '整句' : esc(v[0])) + '</button>'; }).join('')
        : '<button type="button" data-pv="-1">' + esc(it0[1]) + '</button>') + '<button type="button" data-addt="1">重選</button></div>';
    } else if (ed.add === -1) h += '<span class="warn">這一課目前沒有題庫資料。</span>';
    h += '</div>';
    h += '<div class="ft"><span class="warn" style="margin-right:auto">班級進度裡那筆考試文字不會自動改，需要的話請到班級進度手動修改。</span>' +
      '<button type="button" class="no" data-x="1">取消</button><button type="button" class="ok" data-ok="1">存檔</button></div></div>';
    return h;
  }
  function addQ(vj) {
    var D = bank(ed.lesson), i = ed.add, it = D && D.items[i]; if (!it) return;
    var vs = D.vars[i], v = vs && vs[vj], w = v ? v[0] : it[1], whole = !!(v && v[4] === 'whole');
    var ans = v ? v[3] : it[3], s = it[2], a0 = whole ? -1 : s.indexOf(w);
    ed.qs.push({ no: it[0], w: w, a: txt(noBk(ans, D)), s: s, x: whole ? s : excerpt(s, a0, a0 + w.length), whole: whole, cp: '', key: it[0] + '|' + it[1] });
    ed.add = null;
  }
  function readForm(el) {
    el.querySelectorAll('textarea[data-q]').forEach(function (t) { var q = ed.qs[+t.getAttribute('data-q')]; if (q) q[t.getAttribute('data-k')] = t.value; });
    el.querySelectorAll('input[data-code]').forEach(function (t) { ed.codes[t.getAttribute('data-code')] = t.value.trim().toUpperCase(); });
    var d = el.querySelector('input[data-f="d"]'); if (d && d.value) ed.d = d.value;
  }
  function saveEdit(el) {
    readForm(el);
    if (!ed.cls.length) { alert('至少要勾一個班。'); return; }
    if (!ed.qs.length) { alert('至少要有一題。'); return; }
    var bad = ed.cls.filter(function (c) { return ed.codes[c] && !/^L\d{4}$/.test(ed.codes[c]); });
    if (bad.length) { alert('編號格式要像 L0304：' + bad.join('、')); return; }
    var a = recs(), r = a.filter(function (x) { return x && x.id === ed.id; })[0]; if (!r) { ed = null; return; }
    var old = new Date(r.createdAt), t = isNaN(old) ? new Date() : old, p = ed.d.split('-');
    var nd = new Date(+p[0], +p[1] - 1, +p[2], t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
    r.createdAt = nd.toISOString();
    r.classes = ed.cls.slice();
    var codes = {}; ed.cls.forEach(function (c) { if (ed.codes[c]) codes[c] = ed.codes[c]; }); r.codes = codes;   /* 留空的班由 v109 自動給號 */
    r.questions = ed.qs.map(function (q, i) {
      var o = { no: q.no, w: q.w, a: q.a, s: q.s, x: q.x, ord: i + 1 };
      if (q.whole) o.whole = true; if (q.cp) o.cp = q.cp;
      return o;
    });
    r.questionKeys = ed.qs.map(function (q) { return q.key; });
    var nos = r.questions.map(function (q) { return q.no; });
    r.rangeStart = Math.min.apply(null, nos); r.rangeEnd = Math.max.apply(null, nos);
    r.edited = new Date().toISOString();
    ed = null;
    jput(REC, a);
    if (window.V108) window.V108.openRecords();
  }
  function decorate() {
    var p = document.getElementById('v108-nqr'); if (!p) return;
    p.querySelectorAll('.rec').forEach(function (el) {
      var pub = el.querySelector('[data-pub]'); if (!pub) return;
      var id = pub.getAttribute('data-pub');
      if (ed && ed.id === id) {
        if (el.getAttribute('data-v111') === 'form') return;
        el.setAttribute('data-v111', 'form'); el.className = 'rec'; el.innerHTML = formHTML(); bind(el); return;
      }
      if (el.querySelector('.v111-eb')) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'v111-eb'; b.textContent = '✏️ 編輯';
      b.addEventListener('click', function (e) { e.stopPropagation(); startEdit(id); });
      var lab = el.querySelector('.rh .pub'); if (lab) lab.parentNode.insertBefore(b, lab); else el.querySelector('.rh').appendChild(b);
    });
  }
  function rerenderForm(el) { el.innerHTML = formHTML(); }
  function bind(el) {
    el.addEventListener('click', function (e) {
      var t = e.target; if (!t.closest('button')) return;
      e.stopPropagation();
      var b = t.closest('button');
      readForm(el);
      if (b.hasAttribute('data-c')) { var c = b.getAttribute('data-c'), i = ed.cls.indexOf(c); if (i >= 0) ed.cls.splice(i, 1); else ed.cls.push(c); }
      else if (b.hasAttribute('data-del')) { var k = +b.getAttribute('data-del'); if (!confirm('刪除第 ' + (k + 1) + ' 題（註' + ed.qs[k].no + '）？')) return; ed.qs.splice(k, 1); }
      else if (b.hasAttribute('data-addt')) ed.add = -1;
      else if (b.hasAttribute('data-pk')) { ed.add = +b.getAttribute('data-pk'); var D = bank(ed.lesson); if (D && !D.vars[ed.add]) addQ(-1); }
      else if (b.hasAttribute('data-pv')) addQ(+b.getAttribute('data-pv'));
      else if (b.hasAttribute('data-x')) { ed = null; if (window.V108) window.V108.openRecords(); return; }
      else if (b.hasAttribute('data-ok')) { saveEdit(el); return; }
      rerenderForm(el);
    });
    el.addEventListener('keydown', function (e) { e.stopPropagation(); });
  }
  (function watch() {
    var p = document.getElementById('v108-nqr');
    if (!p) { setTimeout(watch, 300); return; }
    new MutationObserver(decorate).observe(p, { childList: true, subtree: true });
    decorate();
  })();
  window.V111 = { edit: startEdit };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/134_v112-js.js ════ */
try {

/* v112（2026-10-05）：建一孝註釋小考編號更正（老師在成績登記自建 0301～0303，0301 當時沒有「記錄本次小考」）
   - 新增 0301 紀錄：9/29《師說》註2 整句、註3 之、註4 孰、註7 聞道、註10 師（老師考卷寫「吾『師道』也」，題庫註10 為「師」，待老師確認）
   - 原自動編號 L0301～L0304（9/29、10/1、10/2、10/5）改為 L0302～L0305
   - 只在本機已從雲端拉過（或未登入同步）時執行；只在 9/29 那筆仍是自動給的 L0301、且還沒有 0301 補登紀錄時執行（做過一次就不會再改，老師之後手改也不會被蓋）
   成績登記：考卷名稱以「0301」這種 4 位數開頭時顯示成「L0301」（v112 改 v106 itemLabel，見 v112_build.js） */
(function () {
  'use strict';
  var REC = 'nq-records-v1', CLS = '建一孝', FIX_ID = 'q-fix-jyx-0301';
  function recs() { try { var a = JSON.parse(localStorage.getItem(REC) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hasPw() { try { return !!(sessionStorage.getItem('gr_pw_v1') || localStorage.getItem('gr_pw_v1')); } catch (e) { return false; } }
  function safe() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !hasPw(); }
  var tmp = document.createElement('div');
  function txt(h) { tmp.innerHTML = String(h == null ? '' : h); return (tmp.textContent || '').replace(/\s+/g, ' ').trim(); }
  function noBk(h, D) { h = String(h == null ? '' : h).replace(/<span class='bk-note'>[\s\S]*?<\/span>/g, ''); ((D && D.bk) || []).forEach(function (x) { if (x) h = h.split(x).join(''); }); return h; }
  function q(D, no, word, whole) {
    var i = -1; D.items.forEach(function (it, k) { if (i < 0 && it[0] === no) i = k; });
    if (i < 0) return null;
    var it = D.items[i], vs = D.vars[i], v = whole && vs ? vs.filter(function (x) { return x[4] === 'whole'; })[0] : null;
    var w = v ? v[0] : (word || it[1]);
    var vv = vs ? vs.filter(function (x) { return x[0] === w; })[0] : null;
    var o = { no: no, w: w, a: txt(noBk(vv ? vv[3] : it[3], D)), s: it[2], x: it[2], key: it[0] + '|' + it[1] };
    if (v) o.whole = true;
    return o;
  }
  function run() {
    if (!safe() || typeof window.nq2BuildLesson !== 'function') return false;
    var a = recs();
    if (a.some(function (r) { return r && r.id === FIX_ID; })) return true;
    var mine = a.filter(function (r) { return r && r.lesson === '師說' && (r.classes || []).indexOf(CLS) >= 0; });
    var by = {}; mine.forEach(function (r) { var d = new Date(r.createdAt); if (!isNaN(d)) by[ymd(d)] = r; });
    var r929 = by['2026-09-29'];
    if (!r929 || !r929.codes || r929.codes[CLS] !== 'L0301') return true;   /* 已改過或狀況不同 → 不動 */
    var map = { '2026-09-29': 'L0302', '2026-10-01': 'L0303', '2026-10-02': 'L0304', '2026-10-05': 'L0305' };
    Object.keys(map).forEach(function (d) { if (by[d]) { by[d].codes = by[d].codes || {}; by[d].codes[CLS] = map[d]; by[d].edited = new Date().toISOString(); } });
    var D = window.nq2BuildLesson('師說');
    var qs = [q(D, 2, '', true), q(D, 3), q(D, 4), q(D, 7), q(D, 10)].filter(Boolean);
    qs.forEach(function (x, i) { x.ord = i + 1; });
    var nos = qs.map(function (x) { return x.no; });
    a.push({ id: FIX_ID, lesson: '師說', rangeStart: Math.min.apply(null, nos), rangeEnd: Math.max.apply(null, nos),
      questionKeys: qs.map(function (x) { var k = x.key; delete x.key; return k; }), questions: qs, classes: [CLS],
      createdAt: new Date(2026, 8, 29, 8, 0, 0).toISOString(), codes: { '建一孝': 'L0301' }, copy: 'x',
      note: '老師在成績登記自建「0301」，v112 補登；註10 待老師確認（考卷寫「吾『師道』也」）', edited: new Date().toISOString() });
    localStorage.setItem(REC, JSON.stringify(a));
    try { var p = document.getElementById('v108-nqr'); if (p && p.classList.contains('open') && window.V108) window.V108.openRecords(); } catch (e) {}
    return true;
  }
  (function loop(n) { if (!run() && n < 120) setTimeout(function () { loop(n + 1); }, 5000); })(0);
  window.V112 = { fixJyx: run };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/138_plan-js.js ════ */
try {
/* 教學進度（老師專用，2026-10-06）
   - 資料：localStorage 'plan_v1'＝{ v:1, cls:{ 班名:{ start, until, items:[{id,t,q}], log:{ '日期|節':{s,n,at} } } } }
     items＝依序要上的項目（一項＝一節；q＝這節課前第幾次小考）；日期不寫死，由課表推算。
     log＝老師標記的例外：ok 照預定上完、part 沒上完（下節繼續）、more 多上完 n 項、skip 這節沒上課。沒標記的過去節次視為照預定上完。
   - 可用節次＝課表（tp_schedule_v1，否則預設課表）＋調課（tp_override_v1）－學校行事的放假／段考日（V101）。
   - 學生看不到：學生端 Apps Script（stuGet）只讀 exam_cal_v1、nq-records-v1；學生筆記版也不含本程式。
   - 雲端同步：v107 KEYS 加 'plan_v1'（舊站不認得這個鍵，下載時會略過，不會覆寫）。
   - 自動判斷（老師 10/6）：課文項目記 les（課名）＋to（預定上到第幾句，ord 同 V82）。節次過了、老師沒手動標記時，
     讀 V82 該節紀錄（tp_hist_v1，或仍在暫存的 tp_live_v1）該課「最後停的位置」：未到 to → 沒上完；超過下一個課文項目的 to → 多上；
     其餘 → 上完。這節沒開這課 → 照預定。手動標記永遠優先。
   - 顯示：日曆格子（淡色虛線）＋日曆右側「教學進度」＋「📘 教學進度表」編輯視窗＋班級進度面板（待確認、接下來、排不下警示）。 */
(function () {
  'use strict';
  var K = 'plan_v1', SHOW = 'plan_show_v1';
  var CCOL = ['#1f7a7a', '#c0662a', '#6b4aa0', '#3d8a3d'];   /* 同 v98 四班顏色 */
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];
  /* 範本：115-1 第一次段考後～第二次段考前（老師 10/6 定）；小考在上課前考 */
  var LY = '論語選—子路曾皙冉有公西華侍坐', HC = '臺灣最美麗的火車線';
  var TEMPLATES = [{
    name: '115-1 一段後～二段前（論語・火車線・樂府）', start: '2026-10-19', until: '2026-11-23',
    items: [['作文檢討'], ['論語① 孔子與儒家'], ['論語② 課文', 1, LY], ['論語③ 課文', 2, LY], ['論語④ 課文', 3, LY],
      ['論語 習作（交換改＋檢討）'], ['論語 A卷'], ['論語 A卷檢討'],
      ['火車線① 課文', 0, HC], ['火車線② 課文', 0, HC], ['火車線 習作（交換改＋檢討）'], ['火車線 A卷'], ['火車線 A卷檢討'],
      ['樂府① 詩的流變'], ['樂府② 長干行', 1], ['樂府③ 長干行', 2], ['樂府④ 長干行', 3],   /* 長干行課文資料建好後再補課名 */
      ['樂府 習作（交換改＋檢討）'], ['樂府 A卷'], ['樂府 A卷檢討']]
  }];
  var MARK = { ok: '✓ 照預定', part: '⏸ 沒上完', more: '⏭ 多上', skip: '🚫 沒上課' };

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function toMin(t) { var a = String(t).split(':'); return (+a[0]) * 60 + (+a[1]); }
  function uid() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function ccol(c) { var i = classes().indexOf(c); return CCOL[i < 0 ? 0 : i % CCOL.length]; }
  function short(c) { return String(c).replace('一', ''); }
  function now() {   /* 與 V82 相同：測試時可用 sessionStorage v82FakeNow 模擬時間 */
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function shown() { return get(SHOW, '1') !== '0'; }

  /* ── 資料 ── */
  function load() { var p = get(K, null); if (!p || typeof p !== 'object' || !p.cls) p = { v: 1, cls: {} }; return p; }
  function save(p) { return put(K, p); }
  function plan(p, c) { var x = p.cls[c]; if (!x) return null; if (!Array.isArray(x.items)) x.items = []; if (!x.log || typeof x.log !== 'object') x.log = {}; return x; }

  /* ── 可用節次 ── */
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.filter(function (x) { return x.normal !== false; }).map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  function dayOff(ds) {
    try { return !!(window.V101 && V101.eventsOn(ds).some(function (e) { return e.c === 'off' || e.c === 'exam'; })); } catch (e) { return false; }
  }
  /* 某班 from～to 之間的節次（含調課）：[{key,date,p,manual}] */
  function slots(c, from, to) {
    var S = sched(), ovr = get('tp_override_v1', {}) || {}, out = [];
    for (var d = parse(from), end = parse(to); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      var ds = ymd(d), wd = d.getDay();
      if (dayOff(ds)) continue;
      S.periods.forEach(function (P) {
        var key = ds + '|' + P.p, sl = S.slots.filter(function (x) { return x[0] === wd && x[1] === P.p; })[0];
        var o = ovr[key], who = o ? (o.cls || '') : (sl ? sl[2] : '');   /* V122：調課 cls 空白＝這節不上課（原本會退回課表） */
        if (who === c) out.push({ key: key, date: ds, p: P.p, end: P.end, manual: !!(o && o.cls) });
      });
    }
    return out;
  }
  function slotPast(r) { var n = now(), t = ymd(n); return r.date < t || (r.date === t && n.getHours() * 60 + n.getMinutes() >= toMin(r.end || '23:59')); }

  /* ── 課文句子（ord 算法同 V82 firstOrd：該段第一頁之前的句數＋1＋句序） ── */
  var sentCache = {};
  function plainHead(t) {   /* 去標記同 V82 plain()：{n:號|字} 取字，其他 {x:字|注} 取字；可巢狀 */
    var s = String(t || '').replace(/<[^>]+>/g, ''), prev;
    do { prev = s; s = s.replace(/\{([a-z]):([^{}]*)\}/g, function (_, tag, body) {
      var i = body.indexOf('|'); if (i < 0) return body;
      return tag === 'n' ? body.slice(i + 1) : body.slice(0, i); }); } while (s !== prev);
    return s.replace(/[‹›]/g, '').slice(0, 8);
  }
  function sentences(k) {
    if (sentCache[k]) return sentCache[k];
    var T = (typeof TEXTBOOK !== 'undefined' && TEXTBOOK[k]) || null, P = (T && T.textPages) || [], first = {}, n = 0, out = [], seen = {};
    P.forEach(function (pg) { if (!(pg.seg in first)) first[pg.seg] = n + 1; n += (pg.lines || []).length; });
    P.forEach(function (pg) { (pg.lines || []).forEach(function (L, li) {
      var o = first[pg.seg] + li; if (seen[o]) return; seen[o] = 1;
      out.push({ ord: o, seg: pg.seg, head: plainHead(L.text) });
    }); });
    out.sort(function (a, b) { return a.ord - b.ord; });
    return (sentCache[k] = out);
  }
  function textLessons() { var T = (typeof TEXTBOOK !== 'undefined') ? TEXTBOOK : {}; return Object.keys(T).filter(function (k) { return (T[k].textPages || []).length; }); }
  /* 某課的課文項目依段落平均分句（段落邊界取最接近 總句數×j/項數 的位置） */
  function autoSplit(items, k) {
    var idx = []; items.forEach(function (it, i) { if (it.les === k) idx.push(i); });
    var S = sentences(k); if (!idx.length || !S.length) return;
    var ends = [], tot = S[S.length - 1].ord, prev = 0;
    S.forEach(function (x, i) { if (i === S.length - 1 || S[i + 1].seg !== x.seg) ends.push(x.ord); });
    idx.forEach(function (ii, j) {
      if (j === idx.length - 1) { items[ii].to = tot; return; }
      var want = tot * (j + 1) / idx.length, best = null;
      ends.forEach(function (e) { if (e > prev && e < tot && (best === null || Math.abs(e - want) < Math.abs(best - want))) best = e; });
      items[ii].to = prev = best || Math.max(prev + 1, Math.min(tot, Math.round(want)));
    });
  }
  /* 該節實際上課紀錄中，某課「最後停的位置」（第幾句）；沒有紀錄或沒開這課 → null */
  function stopAt(c, s, k) {
    var parts = null, h = get('tp_hist_v1', []);
    if (Array.isArray(h)) h.forEach(function (x) { if (x && x.date === s.date && x.period === s.p && x.classId === c && x.parts && x.parts[k]) parts = x.parts; });
    if (!parts) { var lv = get('tp_live_v1', null); if (lv && lv.key === s.key && lv.classId === c && lv.parts && lv.parts[k]) parts = lv.parts; }
    if (!parts) return null;
    var pt = parts[k], a = pt.last && (pt.last.ord || pt.last.r), b = pt.max && (pt.max.ord || pt.max.r);
    return a || b || null;
  }
  /* 自動判斷：回傳 {s, n, stop, to} 或 null */
  function judge(x, c, s, i) {
    var it = x.items[i]; if (!it || !it.les || !it.to) return null;
    var st = stopAt(c, s, it.les); if (!st) return null;
    if (st < it.to) return { s: 'part', stop: st, to: it.to };
    var n = 0;
    for (var j = i + 1; j < x.items.length && x.items[j].les === it.les && x.items[j].to && st >= x.items[j].to; j++) n++;
    return { s: n ? 'more' : 'ok', n: n, stop: st, to: it.to };
  }

  /* ── 排進度：依序把項目放進節次；log 的例外改變放法 ──
     回傳 rows:[{key,date,p,manual,its:[項目索引],part,mark}]，left:[排不下的項目索引] */
  function place(x) {
    var rows = [], i = 0, n = x.items.length, seen = {};
    if (!x.start || !x.until) return { rows: rows, left: x.items.map(function (_, k) { return k; }) };
    slots(x.c, x.start, x.until).forEach(function (s) {
      var L = x.log[s.key] || null, r = { key: s.key, date: s.date, p: s.p, end: s.end, manual: s.manual, its: [], part: false, mark: L ? L.s : '' };
      if (!L && i < n && slotPast(s)) { var A = judge(x, x.c, s, i); if (A) { L = A; r.mark = A.s; r.auto = A; } }
      if (L && L.s === 'skip') { rows.push(r); return; }
      if (i >= n) { rows.push(r); return; }
      if (L && L.s === 'part') { r.its = [i]; r.part = true; }
      else if (L && L.s === 'more') { var m = Math.max(1, +L.n || 1); for (var j = 0; j <= m && i < n; j++) r.its.push(i++); }
      else r.its = [i++];
      r.cont = r.its.filter(function (k) { return seen[k]; });   /* 延續上一節的項目：小考已考過，不再標 */
      r.its.forEach(function (k) { seen[k] = 1; });
      rows.push(r);
    });
    var left = []; for (; i < n; i++) left.push(i);
    return { rows: rows, left: left };
  }
  function placed(c) { var p = load(), x = plan(p, c); if (!x) return null; x.c = c; var r = place(x); r.x = x; return r; }
  function itemText(it, cont) { return (it.q && !cont ? '📝小考' + it.q + '＋' : '') + it.t + (cont ? '（續）' : ''); }
  function isCont(r, k) { return !!(r.cont && r.cont.indexOf(k) >= 0); }

  /* ── 標記 ── */
  function mark(c, key, s) {
    var p = load(), x = plan(p, c); if (!x) return;
    var L = x.log[key];
    if (!s) delete x.log[key];
    else if (s === 'more') x.log[key] = { s: 'more', n: L && L.s === 'more' ? Math.min(5, (+L.n || 1) + 1) : 1, at: new Date().toISOString() };
    else x.log[key] = { s: s, at: new Date().toISOString() };
    save(p); refresh();
  }
  function refresh() {
    try { var m = document.getElementById('v98-cal'); if (m && m.classList.contains('open') && window.V98CAL) V98CAL.open(); } catch (e) {}
    try { var cp = document.getElementById('cls-panel'); if (cp && cp.classList.contains('open') && typeof clsRender === 'function') clsRender(); } catch (e) {}
    try { if (ed.open) renderEd(); } catch (e) {}
  }

  /* 某節的實際上課紀錄（V82 tp_hist_v1） */
  function actual(c, r) {
    var h = get('tp_hist_v1', []); if (!Array.isArray(h)) return '';
    return h.filter(function (x) { return x && x.date === r.date && x.period === r.p && x.classId === c; }).map(function (x) {
      return '《' + String(x.lessonId || '').replace(/^論語選—子路曾皙冉有公西華侍坐$/, '侍坐').replace(/^臺灣最美麗的火車線$/, '火車線') + '》';
    }).join('、');
  }
  function btns(c, r) {
    if (!r.its.length && r.mark !== 'skip') return '';
    var a = [['ok', '✓ 上完'], ['part', '⏸ 沒上完'], ['more', '⏭ 多上一項'], ['skip', '🚫 沒上課']];
    return '<span class="v114-bt">' + a.map(function (b) {
      return '<button type="button" class="' + (r.mark === b[0] ? (r.auto ? 'on auto' : 'on') : '') + '" data-v114="mk|' + esc(c) + '|' + r.key + '|' + b[0] + '">' + b[1] + '</button>';
    }).join('') + (r.mark && !r.auto ? '<button type="button" class="v114-undo" data-v114="mk|' + esc(c) + '|' + r.key + '|" title="取消標記">↺</button>' : '') + '</span>';
  }
  function rowText(x, r) {
    if (r.mark === 'skip') return '<s>（這節沒上課）</s>';
    if (!r.its.length) return '<span class="v114-mut">（進度已排完）</span>';
    return r.its.map(function (k) { return esc(itemText(x.items[k], isCont(r, k))); }).join('＋') + (r.part ? '<em>（沒上完，下節繼續）</em>' : '');
  }
  function markTag(r) {
    if (r.auto) return '<span class="v114-mk auto">🤖 停在第' + r.auto.stop + '句（預定第' + r.auto.to + '句）→ ' + (r.auto.s === 'part' ? '沒上完' : r.auto.s === 'more' ? '多上 ' + r.auto.n + ' 項' : '上完') + '</span>';
    return r.mark && r.mark !== 'skip' ? '<span class="v114-mk">' + (r.mark === 'more' ? '⏭ 多上' : MARK[r.mark]) + '</span>' : '';
  }

  /* ── 日曆裝飾 ── */
  var busy = false;
  function selDate() { var c = document.querySelector('#v98-cal .v98-d.sel'); return c ? (c.getAttribute('data-v98') || '').slice(2) : ''; }
  function byDate() {
    var m = {}, f = get('exam_cal_cls_v1', '');
    classes().forEach(function (c) {
      if (f && f !== c) return;
      var P = placed(c); if (!P) return;
      P.rows.forEach(function (r) { (m[r.date] = m[r.date] || []).push({ c: c, r: r, x: P.x }); });
    });
    Object.keys(m).forEach(function (k) { m[k].sort(function (a, b) { return a.r.p - b.r.p; }); });
    return m;
  }
  function deco() {
    if (busy) return; busy = true;
    try {
      var box = document.querySelector('#v98-cal .v98-box'); if (!box) return;
      var top = box.querySelector('.v98-top');
      if (top && !top.querySelector('.v114-tb')) {
        var sp = top.querySelector('.v98-sp');
        var html = '<button type="button" class="v114-tb" data-v114="ed">📘 教學進度表</button>' +
          '<label class="v114-tb v114-sw"><input type="checkbox" data-v114="show"' + (shown() ? ' checked' : '') + '> 顯示進度</label>';
        if (sp) sp.insertAdjacentHTML('beforebegin', html); else top.insertAdjacentHTML('beforeend', html);
      }
      if (!shown()) return;
      var cells = document.querySelectorAll('#v98-cal .v98-d:not([data-v114])');
      var m = cells.length || !document.querySelector('#v98-cal .v114-day') ? byDate() : null;
      cells.forEach(function (cell) {
        cell.setAttribute('data-v114', '1');
        var ds = (cell.getAttribute('data-v98') || '').slice(2), a = m[ds]; if (!a) return;
        var f = get('exam_cal_cls_v1', '');
        cell.insertAdjacentHTML('beforeend', a.map(function (o) {
          var r = o.r, tx = r.mark === 'skip' ? '（沒上課）' : r.its.map(function (k) { var it = o.x.items[k], ct = isCont(r, k); return (it.q && !ct ? '📝' : '') + it.t + (ct ? '（續）' : ''); }).join('＋');
          if (!tx) return '';
          return '<div class="v114-pill' + (r.mark === 'skip' ? ' sk' : '') + (r.part ? ' pt' : '') + '" style="border-color:' + ccol(o.c) + '" title="' + esc(o.c + ' 第' + r.p + '節・' + tx) + '">' +
            (f ? '' : esc(short(o.c)) + ' ') + esc(tx) + '</div>';
        }).join(''));
      });
      var edEl = document.querySelector('#v98-cal .v98-ed'), sd = selDate();
      if (edEl && sd && !edEl.querySelector('.v114-day')) {
        var a = (m || byDate())[sd] || [];
        edEl.insertAdjacentHTML('beforeend', '<div class="v114-day"><h5>📘 教學進度（只有老師看得到）</h5>' + (a.length ? a.map(function (o) {
          var act = actual(o.c, o.r);
          return '<div class="v114-r"><div><span class="v98-tg" style="background:' + ccol(o.c) + '">' + esc(o.c) + '</span> 第' + o.r.p + '節' +
            (o.r.manual ? '<span class="v114-tag">調課</span>' : '') + ' ' + rowText(o.x, o.r) + markTag(o.r) + '</div>' +
            (act ? '<div class="v114-act">實際紀錄：' + esc(act) + '</div>' : '') + btns(o.c, o.r) + '</div>';
        }).join('') : '<div class="v98-hint">這天沒有排教學進度。</div>') + '</div>');
      }
    } catch (e) { setTimeout(function () { throw e; }); } finally { busy = false; }
  }
  var mo = new MutationObserver(function () { if (!busy) deco(); });
  function watch() {
    var m = document.getElementById('v98-cal'); if (!m) return;
    if (!m.__v114) {
      m.__v114 = 1; mo.observe(m, { childList: true, subtree: true });
      m.addEventListener('click', onClick);
      m.addEventListener('change', function (e) { if (e.target.getAttribute && e.target.getAttribute('data-v114') === 'show') { put(SHOW, e.target.checked ? '1' : '0'); V98CAL.open(); } });
    }
    deco();
  }
  if (window.V98CAL) { var _o = V98CAL.open; V98CAL.open = function () { var r = _o.apply(this, arguments); watch(); return r; }; }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-v114]'); if (!b) return;
    var a = b.getAttribute('data-v114').split('|');
    if (a[0] === 'mk') { e.stopPropagation(); mark(a[1], a[2] + '|' + a[3], a[4]); }
    else if (a[0] === 'ed') { e.stopPropagation(); openEd(); }
  }

  /* ── 班級進度面板：待確認、接下來、排不下 ── */
  function renderCls() {
    var panel = document.getElementById('cls-panel'); if (!panel || typeof clsCur === 'undefined') return;
    var el = document.getElementById('v114-cls');
    if (!el) {
      el = document.createElement('div'); el.id = 'v114-cls';
      el.addEventListener('click', onClick);
      var tabs = document.getElementById('cls-tabs');
      if (tabs) tabs.parentNode.insertBefore(el, tabs.nextSibling); else panel.appendChild(el);
    }
    var c = clsCur, P = placed(c);
    var h = '<div class="v114-h">' + esc(c) + '・📘 教學進度<button type="button" data-v114="ed">編輯進度表</button></div>';
    if (!P || !P.x.items.length) { el.innerHTML = h + '<div class="v114-mut">還沒有進度表。按「編輯進度表」可套用範本。</div>'; return; }
    var t = ymd(now()), from = ymd(new Date(now().getTime() - 14 * 864e5));
    var pend = P.rows.filter(function (r) { return r.date >= from && slotPast(r) && (!r.mark || r.auto) && r.its.length; });
    var next = P.rows.filter(function (r) { return !slotPast(r); }).slice(0, 4);
    if (P.left.length) h += '<div class="v114-warn">⚠ 排不下 ' + P.left.length + ' 項（到 ' + md(P.x.until) + ' 為止）：' +
      P.left.map(function (k) { return esc(P.x.items[k].t); }).join('、') + '</div>';
    if (pend.length) h += '<div class="v114-sub">上過的課，確認一下（沒按＝照預定上完；🤖＝依上課紀錄自動判斷，判斷錯了再按）</div>' + pend.map(function (r) {
      var act = actual(c, r);
      return '<div class="v114-r">' + md(r.date) + '（' + WD[parse(r.date).getDay()] + '）第' + r.p + '節　' + rowText(P.x, r) + markTag(r) +
        (act ? '<div class="v114-act">實際紀錄：' + esc(act) + '</div>' : '') + btns(c, r) + '</div>';
    }).join('');
    h += '<div class="v114-sub">接下來</div>' + (next.length ? next.map(function (r) {
      return '<div class="v114-r">' + (r.date === t ? '<b>今天</b> ' : '') + md(r.date) + '（' + WD[parse(r.date).getDay()] + '）第' + r.p + '節' +
        (r.manual ? '<span class="v114-tag">調課</span>' : '') + '　' + rowText(P.x, r) + markTag(r) +
        (r.mark === 'skip' ? btns(c, r) : '<span class="v114-bt"><button type="button" data-v114="mk|' + esc(c) + '|' + r.key + '|skip">🚫 這節不上</button></span>') + '</div>';
    }).join('') : '<div class="v114-mut">（之後沒有排定的節次）</div>');
    el.innerHTML = h;
  }
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { renderCls(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }

  /* ── 進度表編輯視窗 ── */
  var ed = { open: false, c: '' };
  function ensureEd() {
    var m = document.getElementById('v114-ed'); if (m) return m;
    m = document.createElement('div'); m.id = 'v114-ed'; m.innerHTML = '<div class="v114-box"></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m) { closeEd(); return; }
      var b = e.target.closest && e.target.closest('[data-pe]'); if (!b) return;
      var a = b.getAttribute('data-pe').split('|'), p = load(), x = plan(p, ed.c), i = +a[1];
      if (a[0] === 'x') { closeEd(); return; }
      if (a[0] === 'c') { ed.c = a[1]; renderEd(); return; }
      if (a[0] === 'tpl') { applyTpl(+a[1]); return; }
      if (a[0] === 'copy') { copyFrom(a[1]); return; }
      if (!x) return;
      if (a[0] === 'split') lessonsIn(x.items).forEach(function (k) { autoSplit(x.items, k); });
      else if (a[0] === 'up' && i > 0) x.items.splice(i - 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'dn' && i < x.items.length - 1) x.items.splice(i + 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'ins') x.items.splice(i, 0, { id: uid(), t: '（新項目）' });
      else if (a[0] === 'add') x.items.push({ id: uid(), t: '（新項目）' });
      else if (a[0] === 'del') { if (!confirm('刪除「' + x.items[i].t + '」？後面的項目會往前補。')) return; x.items.splice(i, 1); }
      else return;
      save(p); renderEd(); refresh();
    });
    m.addEventListener('change', function (e) {
      var t = e.target, f = t.getAttribute && t.getAttribute('data-pf'); if (!f) return;
      var a = f.split('|'), p = load(), x = plan(p, ed.c);
      if (!x) { if (a[0] !== 'start' && a[0] !== 'until') return; x = p.cls[ed.c] = { start: '', until: '', items: [], log: {} }; }
      if (a[0] === 't') { var v = t.value.trim(); if (!v) { t.value = x.items[+a[1]].t; return; } x.items[+a[1]].t = v; }
      else if (a[0] === 'q') { if (t.value) x.items[+a[1]].q = +t.value; else delete x.items[+a[1]].q; }
      else if (a[0] === 'les') { var it = x.items[+a[1]]; if (t.value) { it.les = t.value; autoSplit(x.items, t.value); } else { delete it.les; delete it.to; } }
      else if (a[0] === 'to') { if (t.value) x.items[+a[1]].to = +t.value; }
      else if (a[0] === 'start' || a[0] === 'until') { if (!t.value) return; x[a[0]] = t.value; }
      save(p); renderEd(); refresh();
    });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeEd(); e.stopPropagation(); });
    return m;
  }
  function applyTpl(k) {
    var T = TEMPLATES[k], p = load(), x = plan(p, ed.c); if (!T) return;
    if (x && x.items.length && !confirm(ed.c + ' 已經有 ' + x.items.length + ' 項進度，套用範本會整份換掉（標記也會清除）。確定？')) return;
    var its = T.items.map(function (a) { var o = { id: uid(), t: a[0] }; if (a[1]) o.q = a[1]; if (a[2] && sentences(a[2]).length) o.les = a[2]; return o; });
    lessonsIn(its).forEach(function (k) { autoSplit(its, k); });
    p.cls[ed.c] = { start: T.start, until: T.until, log: {}, items: its };
    save(p); renderEd(); refresh();
  }
  function copyFrom(src) {
    var p = load(), s = plan(p, src); if (!s || src === ed.c) return;
    var x = plan(p, ed.c);
    if (x && x.items.length && !confirm('用 ' + src + ' 的進度表取代 ' + ed.c + ' 的？（' + ed.c + ' 的標記會清除）')) return;
    p.cls[ed.c] = { start: s.start, until: s.until, log: {}, items: s.items.map(function (it) { var o = { id: uid(), t: it.t }; if (it.q) o.q = it.q; if (it.les) { o.les = it.les; o.to = it.to; } return o; }) };
    save(p); renderEd(); refresh();
  }
  function lessonsIn(items) { var o = []; items.forEach(function (it) { if (it.les && o.indexOf(it.les) < 0) o.push(it.les); }); return o; }
  function shortLes(k) { return String(k).replace(/^論語選—子路曾皙冉有公西華侍坐$/, '侍坐').replace(/^臺灣最美麗的火車線$/, '火車線'); }
  function renderEd() {
    var m = ensureEd(), box = m.querySelector('.v114-box'), cs = classes();
    if (!ed.c || cs.indexOf(ed.c) < 0) ed.c = (typeof clsCur !== 'undefined' && clsCur) || cs[0];
    var P = placed(ed.c), x = P ? P.x : null, dates = {};
    if (P) P.rows.forEach(function (r) { r.its.forEach(function (k) {
      (dates[k] = dates[k] || []).push({ r: r, past: slotPast(r) });
    }); });
    var h = '<div class="v114-top"><h3>📘 教學進度表</h3><span class="v114-note">只有老師看得到（學生網站、學生日曆都不會出現）</span><span class="v98-sp"></span>' +
      '<button type="button" data-pe="x">✕ 關閉</button></div>';
    h += '<div class="v114-cls">' + cs.map(function (c) {
      return '<button type="button" data-pe="c|' + esc(c) + '"' + (c === ed.c ? ' class="on"' : '') + '><i style="background:' + ccol(c) + '"></i>' + esc(c) + '</button>';
    }).join('') + '</div>';
    h += '<div class="v114-bar">期間 <input type="date" data-pf="start" value="' + esc(x ? x.start : '') + '"> ～ <input type="date" data-pf="until" value="' + esc(x ? x.until : '') + '">' +
      '<button type="button" data-pe="split" title="每課的課文項目依段落平均分配句子">⚖ 課文依段落平均分</button>' +
      TEMPLATES.map(function (T, k) { return '<button type="button" data-pe="tpl|' + k + '">套用範本：' + esc(T.name) + '</button>'; }).join('') +
      '<span>從別班複製：</span>' + cs.filter(function (c) { return c !== ed.c; }).map(function (c) { return '<button type="button" data-pe="copy|' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    if (!x || !x.items.length) h += '<div class="v114-list"><div class="v114-mut">' + esc(ed.c) + ' 還沒有進度表。可以套用範本、從別班複製，或按下面「＋ 新增一項」。</div>';
    else {
      if (P.left.length) h += '<div class="v114-warn">⚠ 有 ' + P.left.length + ' 項排不進 ' + md(x.until) + ' 以前的課。</div>';
      h += '<div class="v114-list"><div class="v114-hd"><span>#</span><span>預定</span><span>項目／課文範圍（設了才會自動判斷）</span><span>課前小考</span><span></span></div>';
      x.items.forEach(function (it, i) {
        var ds = dates[i] || [], done = ds.length && ds.every(function (o) { return o.past; }) && !(ds[ds.length - 1].r.part);
        var when = ds.length ? ds.map(function (o) { return md(o.r.date) + '（' + WD[parse(o.r.date).getDay()] + '）' + o.r.p + (o.r.part ? '⏸' : ''); }).join('、') : '<b class="v114-bad">排不下</b>';
        h += '<div class="v114-it' + (done ? ' done' : '') + '"><span>' + (i + 1) + '</span><span class="v114-when">' + when + '</span>' +
          '<span class="v114-tc"><input type="text" data-pf="t|' + i + '" value="' + esc(it.t) + '">' + rangeSel(x.items, i) + '</span>' +
          '<select data-pf="q|' + i + '"><option value="">—</option>' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (it.q === n ? ' selected' : '') + '>小考' + n + '</option>'; }).join('') + '</select>' +
          '<span class="v114-ops"><button type="button" data-pe="up|' + i + '" title="上移">↑</button><button type="button" data-pe="dn|' + i + '" title="下移">↓</button>' +
          '<button type="button" data-pe="ins|' + i + '" title="在這項前面插入">＋插入</button><button type="button" data-pe="del|' + i + '" title="刪除" class="v114-del">✕</button></span></div>';
      });
    }
    h += '<button type="button" class="v114-add" data-pe="add">＋ 新增一項</button>';
    h += '<div class="v114-help">一項＝一節課。日期由課表自動推算：放假、段考、調課、標記「沒上完／多上一項／沒上課」都會讓後面的項目自動順延或提前。灰色＝已經上過。</div></div>';
    box.innerHTML = h;
  }
  function rangeSel(items, i) {
    var it = items[i], h = '<span class="v114-rg"><select data-pf="les|' + i + '"><option value="">（不是課文）</option>' +
      textLessons().map(function (k) { return '<option value="' + esc(k) + '"' + (it.les === k ? ' selected' : '') + '>' + esc(shortLes(k)) + '</option>'; }).join('') + '</select>';
    if (it.les) {
      var prev = 0; for (var j = 0; j < i; j++) if (items[j].les === it.les && items[j].to) prev = items[j].to;
      h += ' 第' + (prev + 1) + '句～<select data-pf="to|' + i + '">' + (it.to ? '' : '<option value="">（選上到哪句）</option>') +
        sentences(it.les).filter(function (x) { return x.ord > prev; }).map(function (x) {
          return '<option value="' + x.ord + '"' + (it.to === x.ord ? ' selected' : '') + '>第' + x.ord + '句 ' + esc(x.seg) + '｜' + esc(x.head) + '</option>';
        }).join('') + '</select>';
    }
    return h + '</span>';
  }
  function openEd() { ed.open = true; ensureEd().classList.add('open'); renderEd(); }
  function closeEd() { ed.open = false; var m = document.getElementById('v114-ed'); if (m) m.classList.remove('open'); }

  /* ── 備份：匯出附帶 __plan；匯入時只補本機沒有的班，不覆蓋 ── */
  var exporting = false;
  if (typeof clsLoad === 'function' && typeof clsExport === 'function' && typeof clsSave === 'function') {
    var _l = clsLoad; clsLoad = function () { var d = _l.apply(this, arguments); if (exporting) d.__plan = load(); return d; };
    var _x = clsExport; clsExport = function () { exporting = true; try { return _x.apply(this, arguments); } finally { exporting = false; } };
    var _s = clsSave;
    clsSave = function (d) {
      if (d && d.__plan) {
        var inc = d.__plan; delete d.__plan;
        if (inc && inc.cls) { var p = load(), ch = false; Object.keys(inc.cls).forEach(function (c) { if (!p.cls[c]) { p.cls[c] = inc.cls[c]; ch = true; } }); if (ch) save(p); }
      }
      return _s.apply(this, arguments);
    };
  }

  window.V114PLAN = { data: load, place: function (c) { return placed(c); }, mark: mark, openEditor: openEd, templates: TEMPLATES };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/140_textmark-js.js ════ */
try {
/* V115 課文修辭／句意新標示（老師 10/6 試作定案，先只用於〈論語選〉；其他課照舊）
   - 修辭：拿掉「修辭」按鈕；每個修辭在第一個字正上方一個〔修〕框，點開說明以浮動框顯示在上方（課文不動）。
     三種標法：句子型（倒裝、省略、回文、激問…）＝括號式底線，巢狀時外層較低；
              跨句單詞型（頂真、映襯）＝關鍵詞底色；單字單詞型（轉品、借代）＝圈字。
     未點開：淡色細線標出範圍；點開：課文字變色（胭脂／緋紅）並加粗（描邊，不改字寬）。
   - 句意：拿掉「句意」按鈕；範圍以淡綠括號（佔位、左右對稱）標出，〔句意〕框在第一個字正下方，點開說明浮在下方、切齊第一個字，課文變綠加粗。
   - 翻譯、注釋（右欄）、字義（藍字，點開上方泡泡）、課本注音：照舊（字義改成只用顏色、注釋虛線變淡）。
   - 範圍直接讀既有渲染結果：.tp-seg[data-layers] 的 r_／m_ 開頭編號＝修辭／句意定位（含跨行），說明讀 .tp-box-r / .tp-box-m。
   - 一般畫面（#wk-slide-area）與全螢幕（#wkfs-body）各自處理；字級／視窗改變時重新排版。 */
(function () {
  'use strict';
  var ENABLED = ['論語選—子路曾皙冉有公西華侍坐'];
  var B_TYPES = ['頂真', '映襯'];                 /* 跨句單詞型 */
  var C_TYPES = ['轉品', '借代'];                 /* 單字單詞型 */
  var GENERIC = ['回文', '頂真'];                 /* 說明只是基本概念 → 只顯示名稱 */
  var SKIP = 'sup,.tp-gd,.tp-pd,.tp-zd,.tp-ruby,.tm-par,.tm-layer,[aria-hidden="true"]';
  var OPEN = {};                                  /* 開關狀態：課名|頁|id */

  function on() { return typeof wkKey !== 'undefined' && ENABLED.indexOf(wkKey) >= 0; }
  function sk(id) { return wkKey + '|' + wkIdx + '|' + id; }
  function isOpen(id) { return !!OPEN[sk(id)]; }

  /* ── 字元模型：.tp-text 內可見文字（不含圈號、注音、浮窗內容） ── */
  function chars(root) {
    var out = [];
    root.querySelectorAll('.tp-text').forEach(function (t) {
      var w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        if (n.parentElement.closest(SKIP)) continue;
        for (var k = 0; k < n.length; k++) out.push({ n: n, k: k, ch: n.data.charAt(k) });
      }
    });
    return out;
  }
  function rectOf(c) { var r = document.createRange(); r.setStart(c.n, c.k); r.setEnd(c.n, c.k + 1); return r.getBoundingClientRect(); }
  function idsOf(seg) { return (seg.getAttribute('data-layers') || '').split(' ').filter(Boolean); }
  function charsById(slide, cs, id) {
    var segs = [].filter.call(slide.querySelectorAll('.tp-seg[data-layers]'), function (s) { return idsOf(s).indexOf(id) >= 0; });
    return cs.filter(function (c) { return segs.some(function (s) { return s.contains(c.n); }); });
  }
  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent; }

  /* ── 讀說明 ── */
  function readRhet(div) {
    var c = div.cloneNode(true);
    c.querySelectorAll('.tp-rt,.tp-more').forEach(function (x) { x.remove(); });
    var b = c.querySelector('b'), name = b ? b.textContent.trim() : '';
    var hi = [].map.call(c.querySelectorAll('.rq-hi'), function (x) { return x.textContent; });
    if (b) b.remove();
    var html = c.innerHTML, cut = html.indexOf('──');
    var exp = cut >= 0 ? html.slice(cut + 2) : '';
    exp = exp.replace(/▸[^<]*$/, '').trim();
    var type = B_TYPES.indexOf(name) >= 0 ? 'B' : (C_TYPES.indexOf(name) >= 0 ? 'C' : 'A');
    return { id: div.getAttribute('data-lid'), name: name, exp: exp, hi: hi, type: type };
  }
  function readMean(div) {
    var c = div.cloneNode(true);
    c.querySelectorAll('.tp-mk,.tp-citetxt').forEach(function (x) { x.remove(); });
    var html = c.innerHTML.replace(/^──/, '').trim();
    return { id: div.getAttribute('data-lid'), exp: html };
  }
  /* 跨句單詞／單字型的關鍵字：資料有 rq-hi 就用；否則從說明裡『』「」引號中，找出現在範圍內的詞 */
  function keywords(it, text) {
    if (it.hi.length) return it.hi;
    var out = [], re = /[『「]([^』」（(]{1,6})[（(』」]/g, m, src = plain(it.exp);
    while ((m = re.exec(src))) if (text.indexOf(m[1]) >= 0 && out.indexOf(m[1]) < 0) out.push(m[1]);
    return out.length ? out : [text];
  }

  /* ── 包字：把一串字元（可能跨多個文字節點）各段包進 span ── */
  function wrapRun(run, mk) {
    var groups = [];
    run.forEach(function (c) { var g = groups[groups.length - 1]; if (g && g.n === c.n && g.e === c.k) g.e++; else groups.push({ n: c.n, s: c.k, e: c.k + 1 }); });
    for (var i = groups.length - 1; i >= 0; i--) {
      var g = groups[i], r = document.createRange(); r.setStart(g.n, g.s); r.setEnd(g.n, g.e);
      var sp = mk(); r.surroundContents(sp);
    }
  }
  /* 插入點往外提（不把別的標記切成兩半） */
  function hoistBefore(c, stop) {
    if (c.k > 0) return { n: c.n, k: c.k };
    var el = c.n;
    while (el.parentNode && el.parentNode !== stop && !el.previousSibling && !el.parentNode.classList.contains('tp-text')) el = el.parentNode;
    return { el: el, before: true };
  }
  function hoistAfter(c) {
    if (c.k < c.n.length - 1) return { n: c.n, k: c.k + 1 };
    var el = c.n;
    for (;;) {
      var nx = el.nextSibling;
      while (nx && nx.nodeType === 1 && nx.tagName === 'SUP') { el = nx; nx = el.nextSibling; }
      if (!nx && el.parentNode && !el.parentNode.classList.contains('tp-text')) { el = el.parentNode; continue; }
      break;
    }
    return { el: el, before: false };
  }
  function insertAt(pt, node) {
    var r = document.createRange();
    if (pt.el) { if (pt.before) r.setStartBefore(pt.el); else r.setStartAfter(pt.el); } else r.setStart(pt.n, pt.k);
    r.collapse(true); r.insertNode(node);
  }

  /* 短版：資料欄位 rhetShort（與 rhet 同順序；編號 r{句}_{序} 的序號不含「開門見山／筆法」類）、meanShort、mean2Short */
  function attachShort(rh, mn) {
    var pg = (typeof wkSlides !== 'undefined' && wkSlides[wkIdx] && wkSlides[wkIdx].page) || null; if (!pg) return;
    var isStyle = function (r) { return /開門見山/.test(String(r[0] || '')) || /文章筆法|寫作手法/.test(String(r[0] || '')); };
    rh.forEach(function (it) {
      var m = /^r(\d+)_(\d+)$/.exec(it.id || ''); if (!m) return;
      var L = (pg.lines || [])[+m[1]]; if (!L || !L.rhetShort) return;
      var k = -1, n = -1; (L.rhet || []).forEach(function (r, i) { if (!isStyle(r)) { n++; if (n === +m[2]) k = i; } });
      if (k >= 0 && L.rhetShort[k]) it.short = L.rhetShort[k];
    });
    mn.forEach(function (it) {
      var m = /^m(\d+)_(\d+)$/.exec(it.id || ''); if (!m) return;
      var L = (pg.lines || [])[+m[1]]; if (!L) return;
      var v = m[2] === '0' ? L.meanShort : L.mean2Short; if (v) it.short = v;
    });
  }

  /* ── 準備：每次換頁（新 DOM）做一次 ── */
  function prepare(slide) {
    if (slide.__tm) return slide.__tm;
    slide.classList.add('tm-on');
    var rh = [].map.call(slide.querySelectorAll('.tp-box-r .tp-rhet[data-lid]'), readRhet);
    var mn = [].map.call(slide.querySelectorAll('.tp-box-m .tp-mean[data-lid]'), readMean);
    var cs = chars(slide);
    rh.forEach(function (it) {
      var rc = charsById(slide, cs, it.id); it.ok = rc.length > 0;
      if (!it.ok || it.type === 'A') return;
      var text = rc.map(function (c) { return c.ch; }).join('');
      keywords(it, text).forEach(function (kw) {
        var from = 0, p;
        while ((p = text.indexOf(kw, from)) >= 0) {
          wrapRun(rc.slice(p, p + kw.length), function () { var s = document.createElement('span'); s.className = 'tm-kw tm-' + it.type.toLowerCase(); s.setAttribute('data-r', it.id); return s; });
          from = p + kw.length;
        }
      });
      cs = chars(slide);
    });
    mn.forEach(function (it) {
      var mc = charsById(slide, cs, it.id); it.ok = mc.length > 0; if (!it.ok) return;
      var l = document.createElement('span'); l.className = 'tm-par tm-pl'; l.setAttribute('data-m', it.id); l.textContent = '(';
      var r = document.createElement('span'); r.className = 'tm-par tm-pr'; r.setAttribute('data-m', it.id); r.textContent = ')';
      insertAt(hoistAfter(mc[mc.length - 1]), r);
      insertAt(hoistBefore(mc[0]), l);
      cs = chars(slide);
    });
    attachShort(rh, mn);
    slide.__tm = { rh: rh, mn: mn };
    return slide.__tm;
  }

  /* ── 排版：狀態上色＋〔修〕〔句意〕框＋括號線＋浮動說明框 ── */
  function layout(container) {
    var slide = container && container.querySelector('.wk-slide');
    if (!slide) return;
    var old = slide.querySelector(':scope > .tm-layer'); if (old) old.remove();
    if (!on() || !slide.querySelector('.tp-line')) { slide.classList.remove('tm-on'); return; }
    var st = prepare(slide);
    if (window.__tmRO && !slide.__tmObs) { slide.__tmObs = 1; window.__tmRO.observe(slide); var t0 = slide.querySelector('.tp-text'); if (t0) window.__tmRO.observe(t0); }
    var cs = chars(slide);
    if (getComputedStyle(slide).position === 'static') slide.style.position = 'relative';
    var base = slide.getBoundingClientRect();
    var layer = document.createElement('div'); layer.className = 'tm-layer'; slide.appendChild(layer);
    var W = slide.clientWidth; layer.style.width = W + 'px';   /* 疊加層要與課文頁同寬，說明框才排得開 */
    var txt0 = slide.querySelector('.tp-text'), fsz = parseFloat(getComputedStyle(txt0).fontSize);
    var sx = slide.scrollLeft - slide.clientLeft, sy = slide.scrollTop - slide.clientTop;
    /* 說明框的左右邊界＝課文文字區（不是整個課文頁），避免伸進右側按鈕底下 */
    var TL = Infinity, TR = 0;
    var kx0 = slide.offsetWidth ? base.width / slide.offsetWidth : 1;
    slide.querySelectorAll('.tp-text').forEach(function (t) { var r = t.getBoundingClientRect(); TL = Math.min(TL, (r.left - base.left) / kx0 + sx); TR = Math.max(TR, (r.right - base.left) / kx0 + sx); });
    /* 課文頁本身會捲動：座標要加上已捲動的距離（疊加層跟著內容一起捲） */
    /* 換頁淡入動畫會縮放課文頁（scale 0.99）：把縮放比例算回去，動畫中量也準 */
    var kx = slide.offsetWidth ? base.width / slide.offsetWidth : 1, ky = slide.offsetHeight ? base.height / slide.offsetHeight : 1;
    var rel = function (r) { return { l: (r.left - base.left) / kx + sx, r: (r.right - base.left) / kx + sx, t: (r.top - base.top) / ky + sy, b: (r.bottom - base.top) / ky + sy }; };

    /* 狀態上色 */
    var openR = st.rh.filter(function (it) { return it.ok && isOpen(it.id); });
    var openM = st.mn.filter(function (it) { return it.ok && isOpen(it.id); });
    slide.querySelectorAll('.tp-seg[data-layers]').forEach(function (s) {
      var ids = idsOf(s);
      var r = openR.filter(function (it) { return it.type === 'A' && ids.indexOf(it.id) >= 0; })[0];
      var m = openM.filter(function (it) { return ids.indexOf(it.id) >= 0; })[0];
      s.classList.toggle('tm-r-on', !!r); s.classList.toggle('tm-m-on', !r && !!m);
      if (r) s.style.setProperty('--tmc', r.col || 'var(--tm-r1)');
    });
    slide.querySelectorAll('.tm-kw').forEach(function (k) { k.classList.toggle('on', isOpen(k.getAttribute('data-r'))); });
    slide.querySelectorAll('.tm-par').forEach(function (p) { p.classList.toggle('on', isOpen(p.getAttribute('data-m'))); });

    /* 句子型：巢狀層級（外層較低）與顏色 */
    var A = st.rh.filter(function (it) { return it.ok && it.type === 'A'; });
    A.forEach(function (it) { it.cs = charsById(slide, cs, it.id); });
    A.forEach(function (it) {
      var inner = A.filter(function (o) { return o !== it && o.cs.length < it.cs.length && o.cs.every(function (c) { return it.cs.indexOf(c) >= 0; }); });
      it.lv = inner.length ? 1 : 0; it.col = it.lv ? 'var(--tm-r2)' : 'var(--tm-r1)';
    });
    slide.querySelectorAll('.tp-seg.tm-r-on').forEach(function (s) {
      var ids = idsOf(s), r = openR.filter(function (it) { return it.type === 'A' && ids.indexOf(it.id) >= 0; }).sort(function (a, b) { return a.lv - b.lv; })[0];
      if (r) s.style.setProperty('--tmc', r.col);
    });
    A.forEach(function (it) {
      var lines = [];
      it.cs.forEach(function (c) { var r = rel(rectOf(c)); var L = lines[lines.length - 1]; if (L && Math.abs(L.t - r.t) < fsz * 0.5) { L.r = Math.max(L.r, r.r); L.b = Math.max(L.b, r.b); } else lines.push({ l: r.l, r: r.r, t: r.t, b: r.b }); });
      var op = isOpen(it.id), th = op ? Math.max(1.5, fsz * 0.07) : Math.max(1, fsz * 0.045), col = op ? it.col : 'var(--tm-faint)';
      var off = fsz * (0.12 + it.lv * 0.36), tick = fsz * 0.28;
      lines.forEach(function (L, i) {
        var y = L.b + off;
        add(layer, 'tm-line', { left: L.l, top: y, width: L.r - L.l, height: th, background: col });
        if (i === 0) add(layer, 'tm-line', { left: L.l, top: y - tick + th, width: th, height: tick, background: col });
        if (i === lines.length - 1) add(layer, 'tm-line', { left: L.r - th, top: y - tick + th, width: th, height: tick, background: col });
      });
    });

    /* 〔修〕〔句意〕框 */
    var chipsUp = {}, chipsDn = {}, placed = [];
    function firstChar(id) { var x = charsById(slide, cs, id); return x[0]; }
    function lineStart(div) { var ln = div.closest('.tp-line'); var t = ln && ln.querySelector('.tp-text'); var c = t && chars(t.parentNode).filter(function (z) { return t.contains(z.n); })[0]; return c; }
    st.rh.forEach(function (it) {
      var c = it.ok ? (it.type === 'A' ? firstChar(it.id) : (slide.querySelector('.tm-kw[data-r="' + it.id + '"]') ? chars(slide).filter(function (z) { return slide.querySelector('.tm-kw[data-r="' + it.id + '"]').contains(z.n); })[0] : firstChar(it.id))) : null;
      if (!c) { var d = slide.querySelector('.tp-box-r .tp-rhet[data-lid="' + it.id + '"]'); c = d && lineStart(d); }
      if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.t);
      var n = (chipsUp[key] = (chipsUp[key] || 0) + 1) - 1;
      it.chip = chip(layer, '修', it.id, 'r', r.l + n * fsz * 0.62, r.t, true, fsz, it.lv ? 'var(--tm-r2)' : 'var(--tm-r1)');
      it.anchor = r;
    });
    st.mn.forEach(function (it) {
      var c = it.ok ? firstChar(it.id) : null; if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.b);
      var n = (chipsDn[key] = (chipsDn[key] || 0) + 1) - 1;
      it.chip = chip(layer, '句意', it.id, 'm', r.l + n * fsz * 1.1, r.b, false, fsz, 'var(--tm-g)');
      it.anchor = r;
    });

    /* 障礙物：打開中的〔修〕〔句意〕框（說明框之間也互相避讓） */
    st.rh.concat(st.mn).forEach(function (it) { if (it.chip && isOpen(it.id)) placed.push(rel(it.chip.getBoundingClientRect())); });
    /* 不避開翻譯／提問按鈕（老師 10/6：避開會把說明框擠得離字太遠；按鈕被蓋住時收起說明即可） */

    /* 浮動說明框 */
    function box(it, up, html, cls) {
      var bx = document.createElement('div'); bx.className = 'tm-box ' + cls; bx.innerHTML = html;
      bx.style.fontSize = fsz + 'px'; bx.style.fontFamily = getComputedStyle(txt0).fontFamily;   /* 說明與課文同字級、同字型 */
      bx.addEventListener('click', function (e) {
        e.stopPropagation();
        var mo = e.target.closest && e.target.closest('.tm-more');
        if (mo) { var k = sk(mo.getAttribute('data-full') + '#full'); OPEN[k] = !OPEN[k]; }   /* 「詳／短」切換長版 */
        else OPEN[sk(it.id)] = false;
        relayoutAll();
      });
      layer.appendChild(bx);
      var x = it.anchor.l, minW = Math.min(10 * fsz, TR - TL); if (TR - x < minW) x = Math.max(TL, TR - minW);
      bx.style.left = x + 'px'; bx.style.maxWidth = (TR - x) + 'px';
      var h = bx.offsetHeight, w = bx.offsetWidth, ch = it.chip.getBoundingClientRect(), cr = rel(ch);
      var t = up ? cr.t - h - fsz * 0.12 : Math.max(cr.b, it.lastB || 0) + fsz * 0.12;   /* 句意：在整句最後一行之下，不蓋住自己的原文 */
      var rc = { l: x, r: x + w, t: t, b: t + h };
      for (var g = 0; g < 14; g++) {
        var q = placed.filter(function (p) { return rc.l < p.r && p.l < rc.r && rc.t < p.b && p.t < rc.b; })[0];
        if (!q) break;
        var nt = up ? q.t - h - 4 : q.b + 4; rc = { l: x, r: x + w, t: nt, b: nt + h };
      }
      bx.style.top = rc.t + 'px'; placed.push(rc);
    }
    function body(it, rhet) {
      var full = isOpen(it.id + '#full'), txt = (it.short && !full) ? it.short : it.exp;
      var h = rhet ? '<b>' + it.name + '</b>' + (txt && (GENERIC.indexOf(it.name) < 0 || full) ? '（' + String(txt).replace(/[。]$/, '') + '）' : '') : txt;
      if (it.short && it.exp) h += '<span class="tm-more" data-full="' + it.id + '">' + (full ? '短' : '詳') + '</span>';
      return h;
    }
    openR.forEach(function (it) { if (it.chip) box(it, true, body(it, true), 'tm-box-r'); });
    openM.forEach(function (it) {
      if (!it.chip) return;
      var mc = charsById(slide, cs, it.id); it.lastB = 0;
      mc.forEach(function (c) { it.lastB = Math.max(it.lastB, rel(rectOf(c)).b); });
      box(it, false, body(it, false), 'tm-box-m');
    });
  }
  function add(layer, cls, s) {
    var d = document.createElement('div'); d.className = cls;
    d.style.left = s.left + 'px'; d.style.top = s.top + 'px'; d.style.width = s.width + 'px'; d.style.height = s.height + 'px'; d.style.background = s.background;
    layer.appendChild(d); return d;
  }
  function chip(layer, label, id, kind, x, y, up, fsz, col) {
    var c = document.createElement('span'); c.className = 'tm-chip tm-chip-' + kind + (isOpen(id) ? ' on' : ''); c.textContent = label;
    c.style.fontSize = (fsz * 0.5) + 'px'; c.style.setProperty('--cc', col);
    c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.transform = up ? 'translateY(calc(-100% - ' + (fsz * 0.1) + 'px))' : 'translateY(' + (fsz * 0.14) + 'px)';
    c.addEventListener('click', function (e) { e.stopPropagation(); OPEN[sk(id)] = !OPEN[sk(id)]; relayoutAll(); });
    layer.appendChild(c); return c;
  }

  function relayoutAll() {
    try { layout(document.getElementById('wk-slide-area')); } catch (e) { setTimeout(function () { throw e; }); }
    try { layout(document.getElementById('wkfs-body')); } catch (e) { setTimeout(function () { throw e; }); }
  }
  var pend = 0;
  /* 換頁有 0.55 秒淡入動畫（縮放 0.99→1）：動畫中量到的位置會偏 → 等動畫結束再排一次 */
  function settle() {
    var anims = [];
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var sl = document.querySelector('#' + id + ' .wk-slide');
      if (sl && sl.getAnimations) sl.getAnimations().forEach(function (a) { if (a.playState === 'running') anims.push(a.finished.catch(function () {})); });
    });
    relayoutAll();
    if (anims.length) Promise.all(anims).then(function () { relayoutAll(); });
  }
  function soon() { clearTimeout(pend); pend = setTimeout(settle, 90); }

  /* 換頁後（等其他外掛跑完）再排；字級／視窗改變時重排 */
  if (typeof wkRenderCurrent === 'function') {
    var _r = wkRenderCurrent;
    wkRenderCurrent = function () { var r = _r.apply(this, arguments); soon(); return r; };
  }
  window.addEventListener('resize', soon);
  /* 保險：課文頁內任何點擊（開關注釋欄等）或版面動畫結束後再排一次（不只靠 ResizeObserver） */
  var late = 0;
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest || t.closest('.tm-chip, .tm-box')) return;
    if (!t.closest('#wk-slide-area, #wkfs-body, #wk-fullscreen')) return;
    clearTimeout(late); late = setTimeout(settle, 350);
  }, true);
  ['transitionend', 'animationend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target && e.target.closest && e.target.closest('#wk-slide-area, #wkfs-body')) soon(); }, true);
  });
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(soon);
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el) ro.observe(el); });
    window.__tmRO = ro;   /* 每次排版時也觀察該頁的 .wk-slide、第一個 .tp-text（注釋欄打開會讓課文區變窄、重新換行） */
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', soon);   /* 第一次用到粗體時字型才下載，下載完重排 */

  window.V115TM = { relayout: relayoutAll, enabled: ENABLED, state: OPEN };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/141_popsize-js.js ════ */
try {
/* V119：字義／字音／字形泡泡字級改為跟著課文字級（課文的 0.8 倍，最小 16px）。
   原因：018 的 tpPlacePopup 本來就把泡泡設成課文字級，但 025（v51 R2）用
   `.tp-popup-detached{font-size:var(--student-read-size) !important}` 固定成 2 倍基本字級（30px），
   一般畫面課文才 21px，泡泡反而比課文大。這裡不改舊規則，只在泡泡元素上覆寫 --student-read-size。 */
(function () {
  var RATIO = 0.8, MIN = 16;
  function wrap() {
    var orig = window.tpPlacePopup;
    if (typeof orig !== 'function' || orig._v119size) return;
    var w = function (el) {
      try {
        var pop = typeof tpPopNode === 'function' ? tpPopNode(el) : null;
        if (pop && el) {
          var fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs) pop.style.setProperty('--student-read-size', Math.max(MIN, Math.round(fs * RATIO * 10) / 10) + 'px');
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    w._v119size = true;
    for (var k in orig) if (Object.prototype.hasOwnProperty.call(orig, k)) w[k] = orig[k];
    window.tpPlacePopup = w;
  }
  wrap();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrap);
  window.addEventListener('load', wrap);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/142_thirteen-js.js ════ */
try {
/* V120：〈論語選〉「十三經的演變」動畫頁（接在「題解·補充｜《論語》詳表」之後）。
   內容依據：教學系統專案 docs/課文盤點/十三經演變_資料整理.md（課本作品地位欄＋中山大學周春健文＋臺北市孔廟＋維基）。
   課本有寫的（唐文宗時十二經、南宋光宗時十三經）照課本；《孟子》入經時間各家不一，採課本說法。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var AFTER = /《論語》詳表/;
  /* 每部經一個方塊；順序固定，方便看出「拆開／加入」 */
  var BOOKS = [
    { id: '易', t: '易' }, { id: '書', t: '書' }, { id: '詩', t: '詩' },
    { id: '禮', t: '禮' }, { id: '周禮', t: '周禮' }, { id: '儀禮', t: '儀禮' }, { id: '禮記', t: '禮記' },
    { id: '樂', t: '樂' },
    { id: '春秋', t: '春秋' }, { id: '左傳', t: '左傳' }, { id: '公羊傳', t: '公羊傳' }, { id: '穀梁傳', t: '穀梁傳' },
    { id: '論語', t: '論語' }, { id: '孝經', t: '孝經' }, { id: '爾雅', t: '爾雅' }, { id: '孟子', t: '孟子' }
  ];
  /* show：該階段出現的書；add：本階段新加入（亮色）；gone：本階段消失（打叉後淡出）；split：拆開的來源 */
  var STEPS = [
    { era: '先秦', name: '六經', show: ['易', '書', '詩', '禮', '樂', '春秋'],
      cap: '《莊子．天運》最早出現「六經」之名：《詩》《書》《禮》《樂》《易》《春秋》。' },
    { era: '西漢', name: '五經', show: ['易', '書', '詩', '禮', '春秋'], gone: ['樂'],
      cap: '《樂經》亡佚，只剩五經。漢武帝立「五經博士」（前 136 年），儒學成為官學；此時《禮》指《儀禮》。',
      note: '東漢另有「七經」的說法：五經＋《論語》《孝經》。' },
    { era: '唐代', name: '九經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳'],
      split: { '禮': ['周禮', '儀禮', '禮記'], '春秋': ['左傳', '公羊傳', '穀梁傳'] },
      cap: '《禮》分成「三禮」：《周禮》《儀禮》《禮記》；《春秋》分成「三傳」：《左傳》《公羊傳》《穀梁傳》。',
      note: '易＋書＋詩＋三禮＋三傳＝1＋1＋1＋3＋3＝9' },
    { era: '唐文宗．開成石經', name: '十二經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅'],
      add: ['論語', '孝經', '爾雅'],
      cap: '開成年間在國子學刻石（開成石經），九經之外加上《論語》《孝經》《爾雅》。',
      note: '課本：《論語》「唐文宗時，列為十二經之一」。' },
    { era: '南宋光宗', name: '十三經', show: ['易', '書', '詩', '周禮', '儀禮', '禮記', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅', '孟子'],
      add: ['孟子'],
      cap: '《孟子》由「子」書升格為「經」，十二經加《孟子》，成為流傳至今的「十三經」。',
      note: '課本：「南宋光宗時，列為十三經之一」。明代欽定《十三經注疏》，十三經之名完全確立。' }
  ];
  var SUMMARY = '六經 →（《樂》亡佚）五經 →（禮分三禮、春秋分三傳）九經 →（＋論語、孝經、爾雅）十二經 →（＋孟子）十三經';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function slideHTML() {
    var tl = STEPS.map(function (s, i) {
      return '<button class="t13-dot" data-i="' + i + '" onclick="t13Go(this,' + i + ')"><b>' + esc(s.name) + '</b><span>' + esc(s.era) + '</span></button>';
    }).join('<span class="t13-arrow">→</span>');
    var books = BOOKS.map(function (b) {
      return '<span class="t13-b" data-id="' + esc(b.id) + '">' + esc(b.t) + '</span>';
    }).join('');
    return '<div class="wk-slide wks-keyrhet v73-kr t13-slide">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">十三經的演變</span><span class="wks-kr-sub">從六經到十三經〈論語選〉</span></div>' +
      '<div class="t13" data-st="0">' +
        '<div class="t13-tl">' + tl + '</div>' +
        '<div class="t13-head"><span class="t13-era"></span><span class="t13-name"></span><span class="t13-count"></span></div>' +
        '<div class="t13-stage">' + books + '</div>' +
        '<div class="t13-cap"></div><div class="t13-note"></div>' +
        '<div class="t13-sum">' + esc(SUMMARY) + '</div>' +
        '<div class="v73-ctrl"><button class="v73-btn t13-next" onclick="t13Step(this)">▶ 下一步</button>' +
        '<button class="v73-btn rst" onclick="t13Reset(this)">↻ 重來</button></div>' +
      '</div></div>';
  }

  /* FLIP：先記下舊位置，改版面後從舊位置滑到新位置 */
  function rects(box) { var m = {}; box.querySelectorAll('.t13-b').forEach(function (b) { if (b.classList.contains('on')) m[b.dataset.id] = b.getBoundingClientRect(); }); return m; }
  function render(box, i, animate) {
    var S = STEPS[i], stage = box.querySelector('.t13-stage');
    var before = animate ? rects(box) : {};
    var prev = i > 0 ? STEPS[i - 1] : null;
    box.dataset.st = i;
    box.querySelectorAll('.t13-dot').forEach(function (d, j) { d.classList.toggle('cur', j === i); d.classList.toggle('done', j < i); });
    box.querySelector('.t13-era').textContent = S.era;
    box.querySelector('.t13-name').textContent = S.name;
    box.querySelector('.t13-count').textContent = '共 ' + S.show.length + ' 部';
    box.querySelector('.t13-cap').textContent = S.cap;
    var note = box.querySelector('.t13-note'); note.textContent = S.note || ''; note.style.display = S.note ? '' : 'none';
    box.querySelector('.t13-sum').classList.toggle('show', i === STEPS.length - 1);
    var nx = box.querySelector('.t13-next'); nx.disabled = i === STEPS.length - 1; nx.textContent = i === STEPS.length - 1 ? '✓ 完成' : '▶ 下一步';
    var splitFrom = {};
    if (animate && S.split) Object.keys(S.split).forEach(function (src) { S.split[src].forEach(function (c) { splitFrom[c] = src; }); });
    stage.querySelectorAll('.t13-b').forEach(function (b) {
      var id = b.dataset.id, on = S.show.indexOf(id) >= 0;
      var gone = animate && S.gone && S.gone.indexOf(id) >= 0;
      b.classList.remove('add', 'split', 'gone');
      b.style.transition = 'none'; b.style.transform = ''; b.style.opacity = '';
      if (gone) { b.classList.add('on', 'gone'); return; }   /* 先留在原位打叉，再淡出 */
      b.classList.toggle('on', on);
      if (on && S.add && S.add.indexOf(id) >= 0) b.classList.add('add');
      if (on && S.split && splitFrom[id] !== undefined) b.classList.add('split');
      if (on && !animate && S.split && Object.keys(S.split).some(function (k) { return S.split[k].indexOf(id) >= 0; })) b.classList.add('split');
    });
    if (!animate) return;
    void stage.offsetWidth;
    stage.querySelectorAll('.t13-b.on').forEach(function (b) {
      var id = b.dataset.id, a = before[id] || (splitFrom[id] && before[splitFrom[id]]), r = b.getBoundingClientRect();
      if (b.classList.contains('gone')) {
        setTimeout(function () { b.style.transition = 'opacity .6s, transform .6s'; b.style.opacity = '0'; b.style.transform = 'scale(.6)'; }, 900);
        setTimeout(function () { b.classList.remove('on', 'gone'); b.style.transition = 'none'; b.style.opacity = ''; b.style.transform = ''; render(box, i, false); }, 1600);
        return;
      }
      if (a) {
        b.style.transform = 'translate(' + (a.left - r.left) + 'px,' + (a.top - r.top) + 'px)';
        void b.offsetWidth;
        b.style.transition = 'transform .9s cubic-bezier(.5,0,.3,1), background .4s, color .4s';
        b.style.transform = '';
      } else {
        b.style.opacity = '0'; b.style.transform = 'translateY(-1.2em) scale(.7)';
        void b.offsetWidth;
        b.style.transition = 'transform .7s cubic-bezier(.3,1.4,.5,1) .5s, opacity .5s .5s';
        b.style.opacity = '1'; b.style.transform = '';
      }
    });
  }
  function boxOf(el) { return el.closest('.t13'); }
  window.t13Step = function (btn) { if (window.event) window.event.stopPropagation(); var box = boxOf(btn), i = +box.dataset.st; if (i < STEPS.length - 1) render(box, i + 1, true); };
  window.t13Go = function (btn, i) { if (window.event) window.event.stopPropagation(); var box = boxOf(btn), cur = +box.dataset.st; render(box, i, i === cur + 1); };
  window.t13Reset = function (btn) { if (window.event) window.event.stopPropagation(); render(boxOf(btn), 0, false); };
  function initAll() { document.querySelectorAll('.t13:not([data-init])').forEach(function (box) { box.dataset.init = '1'; render(box, 0, false); }); }
  new MutationObserver(initAll).observe(document.documentElement, { childList: true, subtree: true });

  /* ── 投影片：插在《論語》詳表之後 ── */
  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _parse.apply(this, arguments);
    if (key !== LESSON) return slides;
    var at = -1;
    slides.forEach(function (s, i) { if (at < 0 && s.type === 'info' && AFTER.test(String(s.label || ''))) at = i + 1; });
    if (at < 0) return slides;
    slides.splice(at, 0, { type: 't13anim' });
    slides.forEach(function (s) {
      if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
    });
    return slides;
  };
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 't13anim') return slideHTML();
    return _render.apply(this, arguments);
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/144_swap-js.js ════ */
try {
/* V122 預先調課（2026-10-07，老師：10/13 第5節建一孝 調到 10/12 第7節）
   - 原本只能在那一節當下用「本節改為」（V82.setOverride）調課；這裡在班級進度面板 #v82-box 下面加「🔁 調課」區塊，可以預先設定。
   - 資料沿用 tp_override_v1（{ '日期|節': { cls, at } }，雲端同步本來就有這個鍵）：
       新的那節  → { cls: 班, at, swap: id, from: '原日期|節' }
       原本那節  → { cls: '', at, swap: id, to: '新日期|節' }   ← cls 空白＝這節不上課（V82 slotsAt 本來就認：cls 取 o.cls）
     舊站 v113 讀到 cls 空白也一樣當成沒課；舊站「本節改為」選「依課表」會刪掉該節設定（恢復課表）。
   - 教學進度（138_plan-js）同步改為認 cls 空白＝沒課（原本會退回課表）。
   - 清單：今天以後的調課；同一次調課的兩節一起刪。 */
(function () {
  'use strict';
  var OV = 'tp_override_v1';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];   /* 同 V82／教學進度 */

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function now() {   /* 與 V82 相同：測試時可用 sessionStorage v82FakeNow 模擬時間 */
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.filter(function (x) { return x.normal !== false; }).map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  function ovr() { var o = get(OV, {}); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; }
  function schedCls(ds, p) {
    var wd = parse(ds).getDay(), sl = sched().slots.filter(function (x) { return x[0] === wd && x[1] === p; })[0];
    return sl ? sl[2] || '' : '';
  }
  /* 這一節實際上誰的課（含調課；cls 空白＝不上課） */
  function whoAt(ds, p) { var o = ovr()[ds + '|' + p]; return o ? (o.cls || '') : schedCls(ds, p); }
  function label(key) { var a = key.split('|'), d = parse(a[0]); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）第' + a[1] + '節'; }

  var F = { fd: '', fp: '', td: '', tp: '', cls: '', open: false };

  function add() {
    var fp = +F.fp, tp = +F.tp;
    if (!F.fd || !fp || !F.td || !tp) { alert('請把「原本」和「改到」的日期、節次都填好。'); return; }
    var fk = F.fd + '|' + fp, tk = F.td + '|' + tp;
    if (fk === tk) { alert('原本和改到是同一節。'); return; }
    var c = F.cls || whoAt(F.fd, fp);
    if (!c) { alert(label(fk) + ' 原本沒有課。請選要調的班級。'); return; }
    var o = ovr(), other = whoAt(F.td, tp);
    if (other && other !== c && !confirm(label(tk) + ' 原本是「' + other + '」的課，確定改成「' + c + '」？')) return;
    if (o[fk] || o[tk]) { if (!confirm('這兩節之中已經有調課設定，要覆蓋嗎？')) return; dropSwap(o, o[fk]); dropSwap(o, o[tk]); }
    var id = 's' + Date.now().toString(36), at = new Date().toISOString();
    o[tk] = { cls: c, at: at, swap: id, from: fk };
    if (whoAt(F.fd, fp) === c) o[fk] = { cls: '', at: at, swap: id, to: tk };   /* 原本那節是這班的才標成不上課 */
    if (!put(OV, o)) return;
    F.fd = F.fp = F.td = F.tp = F.cls = '';
    refresh();
  }
  function dropSwap(o, x) {
    if (!x || !x.swap) return;
    Object.keys(o).forEach(function (k) { if (o[k] && o[k].swap === x.swap) delete o[k]; });
  }
  function del(key) {
    var o = ovr(), x = o[key]; if (!x) return;
    var keys = x.swap ? Object.keys(o).filter(function (k) { return o[k] && o[k].swap === x.swap; }) : [key];
    if (!confirm('刪除這筆調課？\n' + keys.map(function (k) { return label(k) + '：' + (o[k].cls || '不上課'); }).join('\n') + '\n\n（刪除後恢復原本課表）')) return;
    keys.forEach(function (k) { delete o[k]; });
    put(OV, o);
    refresh();
  }
  function refresh() {
    try { if (window.V82 && V82.tick) V82.tick(); } catch (e) {}
    if (typeof clsRender === 'function') clsRender(); else render();
  }

  function periodOpts(v) {
    return '<option value="">節</option>' + sched().periods.map(function (P) {
      return '<option value="' + P.p + '"' + (+v === P.p ? ' selected' : '') + '>第' + P.p + '節 ' + esc(P.start) + '</option>';
    }).join('');
  }
  function listHTML() {
    var o = ovr(), t = ymd(now()), seen = {}, rows = [];
    Object.keys(o).sort().forEach(function (k) {
      var x = o[k]; if (!x || k.split('|')[0] < t) return;
      if (x.swap) {
        if (seen[x.swap]) return; seen[x.swap] = 1;
        var fk = x.from ? x.from : k, tk = x.from ? k : (x.to || k), c = (o[tk] && o[tk].cls) || x.cls;   /* 先遇到哪一節都一樣 */
        rows.push('<li><b>' + esc(c) + '</b>　' + esc(label(fk)) + ' → ' + esc(label(tk)) +
          '<button type="button" data-v122-del="' + esc(k) + '" title="刪除">✕</button></li>');
      } else {
        rows.push('<li>' + esc(label(k)) + '：' + (x.cls ? '改為 <b>' + esc(x.cls) + '</b>' : '不上課') + '<small>（當節「本節改為」）</small>' +
          '<button type="button" data-v122-del="' + esc(k) + '" title="刪除">✕</button></li>');
      }
    });
    return rows.length ? '<ul class="v122-list">' + rows.join('') + '</ul>' : '<div class="v82-sub">目前沒有之後的調課。</div>';
  }
  function render() {
    var panel = document.getElementById('cls-panel'), anchor = document.getElementById('v82-box');
    if (!panel || !anchor) return;
    var box = document.getElementById('v122-swap');
    if (!box) {
      box = document.createElement('div'); box.id = 'v122-swap';
      box.addEventListener('click', onClick); box.addEventListener('change', onChange);
    }
    if (!box.parentNode || (anchor.nextSibling !== box && !box.closest('.v123-sheet'))) anchor.parentNode.insertBefore(box, anchor.nextSibling);   /* V123：已放進「課表／調課」工具頁就不搬 */
    var h = '<div class="v122-head"><button type="button" data-v122="tog">🔁 調課' + (F.open ? ' ▲' : ' ▼') + '</button>' +
      '<span class="v82-sub">預先設定某一節改到另一節上</span></div>';
    if (F.open) {
      var fc = F.fd && F.fp ? whoAt(F.fd, +F.fp) : '';
      h += '<div class="v122-form">' +
        '<div class="v82-row"><span class="v122-lb">原本</span><input type="date" data-v122="fd" value="' + esc(F.fd) + '">' +
        '<select data-v122="fp">' + periodOpts(F.fp) + '</select>' +
        '<span class="v122-who">' + (F.fd && F.fp ? (fc ? esc(fc) + ' 的課' : '這節沒有課') : '') + '</span></div>' +
        '<div class="v82-row"><span class="v122-lb">改到</span><input type="date" data-v122="td" value="' + esc(F.td) + '">' +
        '<select data-v122="tp">' + periodOpts(F.tp) + '</select>' +
        '<span class="v122-who">' + (F.td && F.tp ? (whoAt(F.td, +F.tp) ? '原本是 ' + esc(whoAt(F.td, +F.tp)) : '原本沒課') : '') + '</span></div>' +
        '<div class="v82-row"><span class="v122-lb">班級</span><select data-v122="cls"><option value="">' + (fc ? '跟原本那節（' + esc(fc) + '）' : '請選班級') + '</option>' +
        classes().map(function (c) { return '<option' + (F.cls === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="v122-ok" data-v122="add">加入調課</button></div>' +
        '<div class="v82-sub">原本那節會變成「不上課」，改到的那節算這班的課；教學進度、自動上課紀錄都照新的時間。</div>' +
        '<div class="v122-lb2">之後的調課</div>' + listHTML() + '</div>';
    }
    box.innerHTML = h;
  }
  function onClick(e) {
    var b = e.target.closest('button'); if (!b) return;
    var d = b.getAttribute('data-v122-del');
    if (d) { del(d); return; }
    var a = b.getAttribute('data-v122');
    if (a === 'tog') { F.open = !F.open; render(); }
    else if (a === 'add') add();
  }
  function onChange(e) {
    var a = e.target.getAttribute('data-v122'); if (!a) return;
    F[a] = e.target.value;
    render();
  }

  window.V122SWAP = { whoAt: whoAt, render: render };
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { render(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/146_panel-js.js ════ */
try {
/* V123 班級進度面板改版（2026-10-07，老師：太亂、找不到、風格要統一；山水圖當底）
   只搬位置、改外觀，不改既有模組的資料與存檔程式（例外：下面「自動打勾」會寫 hw_done_v1，見說明）。
   版面（每次 clsRender 之後重新歸位；已在正確位置就不動，避免輸入框失焦）：
     標題列：班級進度 ……［☁ 同步／備份］［✕］
     今天卡（山水底）：#v82-box（本節改為／繼續上課／備課模式；「課表」「本裝置停用」按鈕移到別處）
     常用工具：日曆（#v98-open）、成績（#v106-open）、小考紀錄（#v108-open）、重要進度檢核（#v84-hw）、課表／調課（課表＋#v122-swap）、📘 教學進度（#v114-cls）
     四班分頁（#cls-tabs）→ 課堂自動記錄：#v82-cls-auto＋#v101-entry＋時間線（日曆該班作業考試＋舊的手動紀錄 cls_records_v1）
     本裝置設定（收合）：啟用／停用自動記錄上課進度
   工具頁（.v123-sheet）蓋在面板上，「← 返回」回到面板；原本的入口按鈕藏在 #v123-hide 裡（點工具格＝點原按鈕）。
   自動打勾（重要進度檢核 hw_done_v1，鍵同 v84：{課名:{班:{'項目|階段':'日期'}}}）：
     - 日曆：A卷「考試」、A卷檢討／習作檢討／課後習題檢討，日期到了 → 該格記日曆日期
     - 成績系統：習作（類型＝習作）、課本後習題（名稱含「習題／基礎練習／進階練習」）有人登記繳交日 → 「交作業」格；A卷有人訂正加分 → 「訂正加分」格
     - 每格自動打過一次就記 '_a:項目|階段'＝來源，老師手動取消後不會再自動打回去
     - 只在本機已從雲端拉過資料（或沒登入同步）時寫入，避免舊資料蓋掉別台（同 v108／v109） */
(function () {
  'use strict';
  var HW = 'hw_done_v1', CAL = 'exam_cal_v1';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐' };   /* 同 v99 */
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';   /* 同 grade.js GS_URL */
  var DEF_PERIODS = [
    { p:1, start:'08:10', end:'09:00' }, { p:2, start:'09:10', end:'10:00' }, { p:3, start:'10:10', end:'11:00' }, { p:4, start:'11:10', end:'12:00' },
    { p:5, start:'13:20', end:'14:10' }, { p:6, start:'14:15', end:'15:05' }, { p:7, start:'15:25', end:'16:15' }, { p:8, start:'16:20', end:'17:10' }];
  var DEF_SLOTS = [[1,1,'冷一孝'],[1,2,'冷一忠'],[1,3,'建一忠'],[1,5,'建一孝'],[2,5,'建一孝'],[3,2,'冷一孝'],[3,3,'冷一孝'],[3,4,'冷一忠'],
    [4,1,'建一孝'],[4,3,'冷一孝'],[4,5,'建一忠'],[5,1,'建一忠'],[5,2,'建一忠'],[5,5,'冷一忠'],[5,6,'冷一忠'],[5,7,'建一孝']];   /* 同 V82 預設課表 */

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var a = String(s).split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
  function md(s) { var d = parse(s); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）'; }
  function now() {
    try { var f = sessionStorage.getItem('v82FakeNow'); if (f) { var o = JSON.parse(f); return new Date(o.t + (Date.now() - o.set)); } } catch (e) {}
    return new Date();
  }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function cur() { return typeof clsCur !== 'undefined' ? clsCur : ''; }
  function $(id) { return document.getElementById(id); }

  /* ════════ 自動打勾 ════════ */
  function pwd() { try { return sessionStorage.getItem('gr_pw_v1') || JSON.parse(localStorage.getItem('gr_pw_v1') || 'null') || ''; } catch (e) { return ''; } }
  function safe() { var S = window.V107SYNC && window.V107SYNC.state ? window.V107SYNC.state() : null; return !S || S.pulled || !pwd(); }
  function mark(hw, lesson, c, key, date, src) {
    var r = ((hw[lesson] = hw[lesson] || {})[c] = hw[lesson][c] || {});
    if (r[key] || r['_a:' + key] === src) return false;   /* 已打勾，或這個來源打過一次（老師取消過）就不再打 */
    r[key] = date; r['_a:' + key] = src;
    return true;
  }
  function fromCal(hw) {
    var t = ymd(now()), ch = false, a = get(CAL, []);
    (Array.isArray(a) ? a : []).forEach(function (e) {
      if (!e || !e.date || e.date > t || classes().indexOf(e.cls) < 0 || !e.lessons || !e.lessons.length) return;
      var key = e.kind === '考試' && e.item === 'A卷' ? 'A卷|考試' : /^(A卷|習作|課後習題)檢討$/.test(e.item) ? e.item.replace(/檢討$/, '') + '|檢討' : '';
      if (!key) return;
      e.lessons.forEach(function (n) { if (LK[n] && mark(hw, LK[n], e.cls, key, e.date, 'cal:' + e.id)) ch = true; });
    });
    return ch;
  }
  var GR = null, grAt = 0, grBusy = false;
  function grData() {
    try { var d = window.V106GR && V106GR.data && V106GR.data(); if (d && Array.isArray(d.items) && d.items.length) return d; } catch (e) {}
    return GR;
  }
  /* 成績系統資料：老師開過成績登記就直接用；沒開過、但這台記住了登記密碼，就讀一次（最多 5 分鐘一次，只讀不寫） */
  function fetchGr() {
    if (grBusy || Date.now() - grAt < 300000 || !pwd()) return;
    try { if (window.V106GR && V106GR.isDemo && V106GR.isDemo()) return; } catch (e) {}
    grBusy = true; grAt = Date.now();
    var url = get('gr_url_v1', '') || GS_URL;
    fetch(url, { method: 'POST', body: JSON.stringify({ action: 'load', pw: pwd() }), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok && r.admin) { GR = { items: r.items || [], scores: r.scores || [] }; autoCheck(); } })
      .catch(function () {}).then(function () { grBusy = false; });
  }
  function fromGr(hw) {
    var D = grData(); if (!D) return false;
    var ch = false, by = {};
    (D.scores || []).forEach(function (s) { (by[s.item] = by[s.item] || []).push(s); });
    (D.items || []).forEach(function (it) {
      if (!it || classes().indexOf(it.cls) < 0) return;
      var ls = String(it.lessons || '').split(',').map(Number).filter(function (n) { return LK[n]; }); if (!ls.length) return;
      var ss = by[it.id] || [], key = '', date = '';
      if (it.type === '習作' || /習題|基礎練習|進階練習/.test(it.title || '')) {   /* 課本後習題＝基礎練習＋進階練習 */
        key = (it.type === '習作' ? '習作' : '課後習題') + '|考試';
        ss.forEach(function (s) { var m = /^\d{4}-\d\d-\d\d/.exec(String(s.sub || '')); if (m && (!date || m[0] < date)) date = m[0]; });
      } else if (it.type === 'A卷') {
        key = 'A卷|訂正';
        ss.forEach(function (s) { if (+s.bonus > 0) { var m = /^\d{4}-\d\d-\d\d/.exec(String(s.upd || '')) ; var d = m ? m[0] : ymd(now()); if (!date || d < date) date = d; } });
      }
      if (!key || !date) return;
      ls.forEach(function (n) { if (mark(hw, LK[n], it.cls, key, date, 'gr:' + it.id)) ch = true; });
    });
    return ch;
  }
  function autoCheck() {
    if (!safe()) return;
    var hw = get(HW, {}); if (!hw || typeof hw !== 'object') hw = {};
    var a = fromCal(hw), b = fromGr(hw);
    if ((a || b) && put(HW, hw)) { try { if (window.V84HW) V84HW.render(); } catch (e) {} }
  }

  /* ════════ 版面 ════════ */
  var sheet = '', devOpen = false, schedEdit = false;
  var TOOLS = [
    ['cal', '📅', '日曆', '考試・作業'], ['gr', '📒', '成績', '登記・加減分'], ['nq', '📝', '小考紀錄', '訂正・給學生看'],
    ['hw', '✅', '重要進度檢核', '交作業・檢討'], ['sched', '🔁', '課表／調課', '預先調課'], ['plan', '📘', '教學進度', '老師專用'],
    ['stu', '🎓', '班級網站', '學生版・小老師頁']];
  var SHEETS = { hw: '✅ 重要進度檢核', sched: '🔁 課表／調課', plan: '📘 教學進度', stu: '🎓 班級網站／小老師頁', sync: '☁ 同步／備份' };

  /* 10/7：學生班級網站（stu115）的密碼——老師輸入一次，存在 stu_pw_v1（雲端同步，學生端 stuGet 讀不到），
     每台登入同步的老師裝置自動寫進解鎖頁「記住密碼」用的 stu_pw_<網址代碼>（同網域），點連結就直接打開。 */
  var STU_BASE = 'https://rayo0113.github.io/stu115/';
  var STU_SLUG = { '建一忠': 'c-ywkbbb', '建一孝': 'c-pnn3hs', '冷一忠': 'c-efexia', '冷一孝': 'c-g2jy3u' };   /* 同 scripts/stu_releases.json */
  var TUTOR_URL = 'https://rayo0113.github.io/RayOclass/t';
  function stuPw() { var o = get('stu_pw_v1', {}); return o && typeof o === 'object' ? o : {}; }
  function applyStuPw() {
    var o = stuPw();
    Object.keys(STU_SLUG).forEach(function (c) {
      if (!o[c]) return;
      try { if (localStorage.getItem('stu_pw_' + STU_SLUG[c]) !== o[c]) localStorage.setItem('stu_pw_' + STU_SLUG[c], o[c]); } catch (e) {}
    });
  }
  function renderStu(box) {
    var o = stuPw();
    box.innerHTML = '<div class="v123-card"><b>👩‍🏫 小老師登記頁</b><div class="v123-mut">用您的學校帳號開，會自動以「老師」身分登入，四個班都看得到。</div>' +
      '<a class="v123-pri v123-link" href="' + TUTOR_URL + '" target="_blank" rel="noopener">打開小老師頁</a></div>' +
      '<div class="v123-card"><b>🎓 學生班級網站</b><div class="v123-mut">密碼只要在任何一台輸入一次，雲端同步後每台老師裝置點下面的連結就直接打開（學生看不到這裡）。</div>' +
      Object.keys(STU_SLUG).map(function (c) {
        return '<div class="v123-stu"><span class="v123-stu-c">' + esc(c) + '</span>' +
          '<a href="' + STU_BASE + STU_SLUG[c] + '/" target="_blank" rel="noopener">打開</a>' +
          (o[c] ? '<span class="v123-ok">✓ 已記住</span><button type="button" data-v123p="clr|' + esc(c) + '">改</button>'
            : '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="輸入密碼" data-v123pw="' + esc(c) + '"><button type="button" data-v123p="save|' + esc(c) + '">記住</button>') + '</div>';
      }).join('') + '</div>';
  }

  function el(id, tag, cls) { var x = $(id); if (!x) { x = document.createElement(tag || 'div'); x.id = id; if (cls) x.className = cls; } return x; }
  function place(parent, list) {   /* 依序放進 parent；已在正確位置的不動 */
    var i = 0;
    list.forEach(function (x) { if (!x) return; if (parent.children[i] !== x) parent.insertBefore(x, parent.children[i] || null); i++; });
  }
  function syncState() { var b = $('v107-open'); var t = b ? (b.querySelector('.v107-st') || {}).textContent || '' : ''; return t.trim(); }

  function arrange() {
    var P = $('cls-panel'); if (!P) return;
    P.classList.add('v123');
    var head = P.querySelector('.cls-head'), tabs = $('cls-tabs');
    if (!head || !tabs) return;
    var t = head.querySelector('.cls-title'); if (t && t.textContent !== '班級進度') t.textContent = '班級進度';
    var sb = el('v123-syncbtn', 'button');
    if (!sb.parentNode) { sb.type = 'button'; sb.addEventListener('click', function () { openSheet('sync'); }); head.insertBefore(sb, head.querySelector('.cls-x')); }
    var st = syncState();
    sb.innerHTML = '☁ 同步／備份' + (st ? '<small>' + esc(st) + '</small>' : '');

    var nowCard = el('v123-now');
    var tools = el('v123-tools');
    if (!tools.__v123) { tools.__v123 = 1; tools.addEventListener('click', onTool); }
    tools.innerHTML = '<div class="v123-cap">常用工具</div><div class="v123-grid">' + TOOLS.map(function (x) {
      return '<button type="button" data-v123t="' + x[0] + '"><span class="v123-ic">' + x[1] + '</span><b>' + x[2] + '</b><small>' + x[3] + '</small></button>';
    }).join('') + '</div>';
    var rec = el('v123-rec'), recHead = el('v123-rec-h'), tl = el('v123-tl');
    recHead.innerHTML = esc(cur()) + '・課堂自動記錄';
    renderTl(tl);
    var dev = el('v123-dev');
    if (!dev.__v123) { dev.__v123 = 1; dev.addEventListener('click', onDev); }
    renderDev(dev);
    var hide = el('v123-hide');

    place(P, [head, nowCard, tools, tabs, rec, dev, hide]);
    place(nowCard, [$('v82-box')]);
    place(rec, [recHead, $('v82-cls-auto'), $('v101-entry'), tl]);
    place(hide, [$('v98-open'), $('v106-open'), $('v108-open'), $('v107-open'), P.querySelector('.cls-form'), $('cls-list')]);

    /* 工具頁 */
    Object.keys(SHEETS).forEach(function (k) {
      var s = el('v123-sh-' + k, 'div', 'v123-sheet'), h = el('v123-sh-' + k + '-h', 'div', 'v123-sh-h'), body = el('v123-sh-' + k + '-b', 'div', 'v123-sh-b');
      if (!s.__v123) {
        s.__v123 = 1; s.setAttribute('data-k', k);
        h.innerHTML = '<button type="button" class="v123-back">← 返回</button><span>' + SHEETS[k] + '</span>';
        h.querySelector('.v123-back').addEventListener('click', closeSheet);
        s.addEventListener('click', onSheet); s.addEventListener('change', onSheetChange);
        s.addEventListener('keydown', function (e) { e.stopPropagation(); });   /* 打字時不要觸發投影翻頁快捷鍵 */
      }
      place(s, [h, body]);
      if (s.parentNode !== P) P.appendChild(s);
      s.classList.toggle('show', sheet === k);
    });
    place($('v123-sh-hw-b'), [$('v84-hw')]);
    var pills = el('v123-pills'); pills.innerHTML = classes().map(function (c) { return '<button type="button" data-v123c="' + esc(c) + '"' + (c === cur() ? ' class="on"' : '') + '>' + esc(c) + '</button>'; }).join('');
    place($('v123-sh-plan-b'), [pills, $('v114-cls')]);
    var sch = el('v123-sched'); renderSched(sch);
    place($('v123-sh-sched-b'), [$('v122-swap'), sch]);   /* 調課較常用，放上面 */
    var stb = el('v123-stu'); renderStu(stb); applyStuPw();
    place($('v123-sh-stu-b'), [stb]);
    var sy = el('v123-sync'); renderSync(sy);
    place($('v123-sh-sync-b'), [sy, P.querySelector('.cls-foot')]);
    if (sheet === 'sched' && window.V122SWAP) { var sw = $('v122-swap'); if (sw && sw.querySelector('[data-v122="tog"]') && !sw.querySelector('.v122-form')) sw.querySelector('[data-v122="tog"]').click(); }
  }

  function renderTl(box) {
    var c = cur(), t = ymd(now()), rows = [];
    var cal = get(CAL, []); cal = Array.isArray(cal) ? cal : [];
    cal.forEach(function (e) {
      if (!e || e.cls !== c || !e.date) return;
      var ls = (e.lessons || []).map(function (n) { return 'L' + n; }).join('、');
      rows.push({ d: e.date, tag: e.kind === '考試' ? '考試' : /檢討$/.test(e.item) ? '檢討' : '作業', t: String(e.item).replace('課後習題', '課本後習題') + (ls ? ' ' + ls : '') + (e.note ? '（' + e.note + '）' : ''), cal: 1 });
    });
    var mine = []; try { mine = (clsLoad() || {})[c] || []; } catch (e) {}
    mine.forEach(function (r, i) { if (r && r.d) rows.push({ d: r.d, tag: r.k || '紀錄', h: r.t, i: i }); });
    rows.sort(function (a, b) { return a.d < b.d ? -1 : a.d > b.d ? 1 : 0; });
    var next = rows.filter(function (r) { return r.d >= t; }), past = rows.filter(function (r) { return r.d < t; }).reverse();
    function row(r) {
      return '<li class="v123-tl-' + esc(r.tag) + '"><span class="v123-d">' + md(r.d) + '</span><span class="v123-tag">' + esc(r.tag) + '</span>' +
        '<span class="v123-tx">' + (r.cal ? esc(r.t) : r.h) + '</span>' +
        (r.cal ? '<button type="button" data-v123="cal" title="在日曆裡看">📅</button>' : '<button type="button" data-v123="del|' + r.i + '" title="刪除這筆">✕</button>') + '</li>';
    }
    var h = '<div class="v123-sub">接下來（日曆）</div>' + (next.length ? '<ul>' + next.slice(0, 6).map(row).join('') + '</ul>' : '<div class="v123-mut">日曆上還沒排。按「常用工具 → 日曆」新增作業或考試。</div>');
    if (past.length) h += '<details class="v123-past"><summary>已經過去的（' + past.length + '）</summary><ul>' + past.slice(0, 40).map(row).join('') + '</ul></details>';
    box.innerHTML = h;
    if (!box.__v123) {
      box.__v123 = 1;
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v123]'); if (!b) return;
        var a = b.getAttribute('data-v123');
        if (a === 'cal') { var o = $('v98-open'); if (o) o.click(); }
        else if (a.indexOf('del|') === 0 && typeof clsDel === 'function') clsDel(+a.slice(4));
      });
    }
  }
  function renderDev(box) {
    var on = get('tp_enabled_v1', '') === '1';
    box.innerHTML = '<button type="button" class="v123-devh" data-v123d="tog">⚙ 本裝置設定 ' + (devOpen ? '▲' : '▼') + '</button>' +
      (devOpen ? '<div class="v123-devb"><div>自動記錄上課進度：<b>' + (on ? '開' : '關') + '</b></div>' +
        '<button type="button" data-v123d="' + (on ? 'off' : 'on') + '">' + (on ? '本裝置停用' : '啟用（本裝置）') + '</button>' +
        '<div class="v123-mut">只影響這台裝置的這個瀏覽器。</div></div>' : '');
  }
  function sched() {
    var s = get('tp_schedule_v1', null);
    if (s && s.periods && s.slots) return { periods: s.periods, slots: s.slots.filter(function (x) { return x.normal !== false; }).map(function (x) { return [x.wd, x.p, x.cls]; }) };
    return { periods: DEF_PERIODS, slots: DEF_SLOTS };
  }
  function renderSched(box) {
    var S = sched();
    var h = '<div class="v123-sub">每週課表' + '<button type="button" data-v123s="edit">' + (schedEdit ? '完成編輯' : '編輯課表') + '</button>' +
      (schedEdit ? '<button type="button" data-v123s="reset">還原預設</button>' : '') + '</div><table><tr><th>節</th>' +
      [1, 2, 3, 4, 5].map(function (w) { return '<th>' + WD[w] + '</th>'; }).join('') + '</tr>';
    S.periods.forEach(function (P) {
      h += '<tr><th>' + P.p + '<small>' + esc(P.start) + '</small></th>';
      [1, 2, 3, 4, 5].forEach(function (w) {
        var sl = S.slots.filter(function (x) { return x[0] === w && x[1] === P.p; })[0], c = sl ? sl[2] : '';
        h += '<td>' + (schedEdit ? '<select data-v123w="' + w + '|' + P.p + '"><option value=""></option>' + classes().map(function (k) {
          return '<option' + (k === c ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>' : (c ? esc(c.replace('一', '')) : '')) + '</td>';
      });
      h += '</tr>';
    });
    box.innerHTML = h + '</table><div class="v123-mut">「編輯課表」會改變之後每週的課表；只調某一節請用下面的「調課」。</div>';
  }
  function renderSync(box) {
    var st = syncState();
    box.innerHTML = '<div class="v123-card"><b>☁ 雲端同步</b><span class="v123-st">' + esc(st || '') + '</span>' +
      '<div class="v123-mut">班級進度、日曆、小考紀錄、教學進度、檢核表等，在 iPad 和電腦之間自動同步（存在 Google 試算表）。</div>' +
      '<button type="button" class="v123-pri" data-v123y="cloud">打開雲端同步</button></div>' +
      '<div class="v123-card"><b>💾 本機備份檔</b><div class="v123-mut">把這台的資料下載成一個檔案（班級進度、上課紀錄、檢核表）；換裝置或出錯時可以匯入。</div></div>';
  }

  function openSheet(k) {
    sheet = k;
    if (k === 'hw') { autoCheck(); fetchGr(); }
    arrange();
    var s = $('v123-sh-' + k); if (s) s.scrollTop = 0;
  }
  function closeSheet() { sheet = ''; arrange(); }
  function onTool(e) {
    var b = e.target.closest('button[data-v123t]'); if (!b) return;
    var k = b.getAttribute('data-v123t');
    var map = { cal: 'v98-open', gr: 'v106-open', nq: 'v108-open' };
    if (map[k]) { var o = $(map[k]); if (o) o.click(); return; }
    openSheet(k);
  }
  function onDev(e) {
    var b = e.target.closest('button[data-v123d]'); if (!b) return;
    var a = b.getAttribute('data-v123d');
    if (a === 'tog') { devOpen = !devOpen; arrange(); }
    else if (a === 'off' && window.V82) V82.disable();
    else if (a === 'on' && window.V82) V82.enable();
  }
  function onSheet(e) {
    var b = e.target.closest('button'); if (!b) return;
    var c = b.getAttribute('data-v123c'); if (c && typeof clsPick === 'function') { clsPick(c); return; }
    var s = b.getAttribute('data-v123s');
    if (s === 'edit') { schedEdit = !schedEdit; arrange(); return; }
    if (s === 'reset' && window.V82) { V82.resetSched(); arrange(); return; }
    var y = b.getAttribute('data-v123y');
    if (y === 'cloud') { var o = $('v107-open'); if (o) o.click(); }
    var pp = b.getAttribute('data-v123p');
    if (pp) {
      var a2 = pp.split('|'), m = stuPw();
      if (a2[0] === 'save') {
        var inp = b.parentNode.querySelector('input[data-v123pw]'), v = inp ? inp.value.trim() : '';
        if (v.length < 10) { alert('密碼好像不完整（班級網站密碼是 12 碼，注意大小寫）。'); return; }
        m[a2[1]] = v;
      } else if (a2[0] === 'clr') { if (!confirm('要重新輸入「' + a2[1] + '」的密碼嗎？')) return; delete m[a2[1]]; try { localStorage.removeItem('stu_pw_' + STU_SLUG[a2[1]]); } catch (e) {} }
      put('stu_pw_v1', m); arrange();
    }
  }
  function onSheetChange(e) {
    var w = e.target.getAttribute('data-v123w'); if (!w || !window.V82) return;
    var a = w.split('|'); V82.setCell(+a[0], +a[1], e.target.value); arrange();
  }

  /* 掛勾：所有模組的 clsRender 包裝之後（本檔載入順序在後）→ 每次重繪後歸位 */
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { arrange(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }
  if (typeof clsToggle === 'function') {
    var _ct = clsToggle;
    clsToggle = function () { sheet = ''; var r = _ct.apply(this, arguments); try { var P = $('cls-panel'); if (P && P.classList.contains('open')) { autoCheck(); fetchGr(); } } catch (e) {} return r; };
  }
  /* 雲端同步狀態字變了 → 更新標題列小字 */
  (function watchSync(n) {
    var b = $('v107-open');
    if (!b) { if (n < 40) setTimeout(function () { watchSync(n + 1); }, 500); return; }
    new MutationObserver(function () { var x = $('v123-syncbtn'); if (x) { var st = syncState(); x.innerHTML = '☁ 同步／備份' + (st ? '<small>' + esc(st) + '</small>' : ''); } })
      .observe(b, { childList: true, subtree: true, characterData: true });
  })(0);
  window.V123PANEL = { arrange: arrange, open: openSheet, autoCheck: autoCheck };
  function init() { try { arrange(); autoCheck(); } catch (e) { setTimeout(function () { throw e; }); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/136_v113-ver-js.js ════ */
try {

(function () {
  window.APP_VERSION = 'V124';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);
})();
} catch (e) { setTimeout(function () { throw e; }); }
