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
  // V142：拆題註釋的小字詞標記 vmark[i] = { 選項字詞: 'must'|'ex' }（一條註釋最多一個必考小字詞；至少留一個可考）
  var vmark = {};
  // V143：日曆預排小考帶入的小字詞標記（只用在這一次，不存；同一條註釋以日曆為準）
  var vOver = {};
  function vmOf(i){ return vOver[i] || vmark[i] || {}; }
  function items(){ return D ? D.items : []; }
  function itemKey(it){ return it[0] + '|' + it[1]; }
  function exKey(){ return 'nq-excl:' + D.lesson; }
  function muKey(){ return 'nq-must:' + D.lesson; }
  function vmKey(){ return 'nq-vmark:' + D.lesson; }
  function varCount(i){ return (D.vars[i] || []).length; }
  function chipLabel(i){ return varCount(i) ? D.vars[i][0][0] : items()[i][1]; }
  function vName(v){ return v[4] === 'whole' ? '整句' : v[0]; }
  function vMust(i){ var m = vmOf(i); return (D.vars[i] || []).filter(function(v){ return m[v[0]] === 'must'; })[0] || null; }
  function vOk(i){ var m = vmOf(i); return (D.vars[i] || []).filter(function(v){ return m[v[0]] !== 'ex'; }); }
  function vBadge(i){
    var n = varCount(i); if (!n) return '';
    var mu = vMust(i); if (mu) return '<span class="vc vmu">考「' + esc(vName(mu)) + '」</span>';
    var ok = vOk(i).length;
    return '<span class="vc' + (ok < n ? ' vex' : '') + '">' + ok + '選1' + (ok < n ? '・' + (n - ok) + '不考' : '') + '</span>';
  }

  function loadMarks(){
    var ex = new Set(LS.get(exKey(), [])), mu = new Set(LS.get(muKey(), []));
    excl = new Set(); must = new Set();
    items().forEach(function(it, i){
      if (ex.has(itemKey(it))) excl.add(i);
      else if (mu.has(itemKey(it))) must.add(i);
    });
    var vm = LS.get(vmKey(), {}); vmark = {};
    items().forEach(function(it, i){
      var m = vm[itemKey(it)]; if (!m || !D.vars[i]) return;
      var o = {}, n = 0;
      D.vars[i].forEach(function(v){ if (m[v[0]] === 'must' || m[v[0]] === 'ex'){ o[v[0]] = m[v[0]]; n++; } });
      if (n) vmark[i] = o;
    });
  }
  function saveMarks(){
    LS.set(exKey(), Array.from(excl).map(function(i){ return itemKey(items()[i]); }));
    LS.set(muKey(), Array.from(must).map(function(i){ return itemKey(items()[i]); }));
    var vm = {};
    Object.keys(vmark).forEach(function(i){ if (Object.keys(vmark[i]).length) vm[itemKey(items()[i])] = vmark[i]; });
    LS.set(vmKey(), vm);
  }
  function withMust(arr){ return Array.from(new Set(Array.from(must).concat(arr))).sort(byIdx); }

  /* ───────── 選題畫面 ───────── */
  function setLesson(L){
    D = buildLesson(L);
    loadMarks(); vOver = {};
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
    ex:   '排除模式：點題目＝排除／恢復（例如已經考過的）。排除紀錄會自動記住，下次打開還在。',
    vr:   '指定小字詞：點有「N選1」的題目，可以把其中一個小字詞（或整句）設為必考，或把幾個設為不考。設必考的那條註釋會一起變成必考題。標記會自動記住。'
  };
  function render(){
    if (!items().length){
      $('grid').innerHTML = '<div class="empty">這一課目前沒有可抽題的註釋資料。</div>';
    } else {
      $('grid').innerHTML = items().map(function(it, i){
        var on = sel.indexOf(i) >= 0, ex = excl.has(i), mu = must.has(i);
        return '<button type="button" class="chip' + (on ? ' on' : '') + (ex ? ' ex' : '') + (mu ? ' must' : '') + '" data-i="' + i + '">' +
          '<span class="no">' + it[0] + '</span><span class="w serif">' + esc(chipLabel(i)) + '</span>' +
          vBadge(i) + '</button>';
      }).join('');
    }
    var nEx = excl.size, nMu = must.size, nV = Object.keys(Object.assign({}, vmark, vOver)).length;
    var tags = [nMu ? '必考 ' + nMu : '', nEx ? '排除 ' + nEx : '', nV ? '指定小字詞 ' + nV : ''].filter(Boolean).join('・');
    $('cnt').textContent = '已選 ' + sel.length + ' 題' + (tags ? '（' + tags + '）' : '');
    $('bGo').disabled = !sel.length;
    $('bGo').style.opacity = sel.length ? 1 : .4;
    $('bUnex').style.display = (nEx || nMu || nV) ? '' : 'none';
    $('hint').textContent = HINTS[mode];
  }
  function setMode(m){
    mode = m;
    $('mPick').className = m === 'pick' ? 'on' : '';
    $('mMust').className = m === 'must' ? 'on mu' : '';
    $('mEx').className = m === 'ex' ? 'on ex' : '';
    $('mVar').className = m === 'vr' ? 'on vr' : '';
    $('grid').classList.toggle('vr-mode', m === 'vr');
    render();
  }
  function rangePool(){
    var a = +$('ra').value || 1, b = +$('rb').value || a;
    var lo = Math.min(a, b), hi = Math.max(a, b);
    return items().map(function(it, i){ return i; }).filter(function(i){ return items()[i][0] >= lo && items()[i][0] <= hi && !excl.has(i); });
  }

  /* ───────── V142：指定小字詞（必考／不考）小視窗 ───────── */
  var vpI = -1;
  function clearVMust(i){
    var m = vmark[i]; if (!m) return;
    Object.keys(m).forEach(function(w){ if (m[w] === 'must') delete m[w]; });
    if (!Object.keys(m).length) delete vmark[i];
  }
  function setV(i, w, st){
    if (vOver[i]){ vmark[i] = Object.assign({}, vOver[i]); delete vOver[i]; }
    var vs = D.vars[i] || [], m = vmark[i] || {};
    if (st === 'ex' && vs.filter(function(v){ return v[0] !== w && m[v[0]] !== 'ex'; }).length === 0){
      alert('至少要留一個可以考的。整條註釋都不考的話，請用「點＝排除」。'); return;
    }
    if (st === 'must'){
      Object.keys(m).forEach(function(k){ if (m[k] === 'must') delete m[k]; });
      m[w] = 'must';
      must.add(i); excl.delete(i); if (sel.indexOf(i) < 0) sel = sel.concat(i);
    } else if (st === 'ex') m[w] = 'ex';
    else delete m[w];
    if (Object.keys(m).length) vmark[i] = m; else delete vmark[i];
    saveMarks(); render(); paintVp();
  }
  function paintVp(){
    var i = vpI, it = items()[i], vs = D.vars[i]; if (!it || !vs) return;
    var m = vmOf(i), s = it[2];
    $('vp').querySelector('.vp-h').innerHTML = '註' + it[0] + (must.has(i) ? '<span class="vp-tag mu">必考題</span>' : '') + (excl.has(i) ? '<span class="vp-tag ex">整條排除中</span>' : '');
    $('vp').querySelector('.vp-rows').innerHTML = vs.map(function(v, j){
      var st = m[v[0]] || 'rnd', x = excerpt(s, v[1], v[2]);
      return '<div class="vp-row ' + st + '"><div class="vp-q serif">' + (x.cutL ? '…' : '') + esc(x.pre) + '<mark>' + esc(x.w) + '</mark>' + esc(x.post) + (x.cutR ? '…' : '') + '</div>' +
        '<div class="vp-a"><b>' + esc(vName(v)) + '：</b>' + noBk(v[3]) + '</div>' +
        '<div class="vp-seg">' + [['rnd', '隨機'], ['must', '必考'], ['ex', '不考']].map(function(o){
          return '<button type="button" data-j="' + j + '" data-st="' + o[0] + '"' + (st === o[0] ? ' class="on ' + o[0] + '"' : '') + '>' + o[1] + '</button>';
        }).join('') + '</div></div>';
    }).join('');
  }
  function openVp(i){
    if (!D.vars[i]){ $('hint').textContent = '註' + items()[i][0] + ' 沒有拆成小字詞，只能整條設必考或排除（用「點＝必考」「點＝排除」）。'; return; }
    vpI = i; paintVp(); $('vp').classList.add('show');
  }
  function closeVp(){ $('vp').classList.remove('show'); vpI = -1; }
  function initVp(){
    var d = document.createElement('div');
    d.id = 'nq2-vp';
    d.innerHTML = '<div class="vp-bx" role="dialog" aria-modal="true" aria-label="指定小字詞"><div class="vp-top"><h3 class="vp-h"></h3>' +
      '<button type="button" class="vp-x">完成</button></div>' +
      '<div class="vp-note">隨機＝可能抽到；必考＝這條註釋一定考這一個（只能指定一個）；不考＝不會抽到。</div><div class="vp-rows"></div></div>';
    document.getElementById('nq2').appendChild(d);
    d.addEventListener('click', function(e){
      if (e.target === d || e.target.closest('.vp-x')){ closeVp(); return; }
      var b = e.target.closest('[data-st]'); if (!b || vpI < 0) return;
      setV(vpI, D.vars[vpI][+b.dataset.j][0], b.dataset.st);
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && d.classList.contains('show')){ closeVp(); e.stopPropagation(); } }, true);
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
    if (vs){
      // V142：必考小字詞優先；不考的不抽；其餘依「拆題」設定（v108 nq-varmode）挑，挑不到就從可考的隨機
      var v = vMust(i);
      if (!v){
        var ok = vOk(i), vm = LS.get('nq-varmode', 'mix'), pref = ok;
        if (vm === 'whole') pref = ok.filter(function(x){ return x[4] === 'whole'; });
        else if (vm === 'sub') pref = ok.filter(function(x){ return x[4] === 'sub'; });
        if (!pref.length) pref = ok.length ? ok : vs;
        v = pref[Math.floor(Math.random() * pref.length)];
      }
      return { w: v[0], a: v[1], b: v[2], ans: noBk(v[3]), whole: v[4] === 'whole' };
    }
    var at = D.pos[i];
    return { w: it[1], a: at, b: at < 0 ? -1 : at + it[1].length, ans: noBk(it[3]), whole: false };
  }
  function startQuiz(){
    var q = $('shuffle').checked ? shuffle(sel) : sel.slice().sort(byIdx);
    $('qTitle').innerHTML = '〈' + esc(D.lesson.split('—')[0]) + '〉註釋小考<small>共 ' + q.length + ' 題・點題目看答案</small>';
    $('qlist').innerHTML = q.map(function(i, k){
      var it = items()[i], s = it[2], v = pickVariant(i);
      var x = v.a < 0 ? { pre: s, w: '', post: '', cutL: false, cutR: false } : excerpt(s, v.a, v.b);
      // V142：拆題註釋已在這裡依標記與拆題設定挑好，標上 data-v108 讓 v108 applyVmode 不再改寫
      return '<article class="qc"' + (D.vars[i] ? ' data-v108="' + esc(LS.get('nq-varmode', 'mix')) + '"' : '') + '>' +
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
      if (mode === 'vr'){ openVp(i); return; }
      if (mode === 'pick'){
        if (excl.has(i) || must.has(i)) return;   // 必考／排除題要到各自模式才能改
        sel = sel.indexOf(i) >= 0 ? sel.filter(function(x){ return x !== i; }) : sel.concat(i);
      } else if (mode === 'must'){
        if (must.has(i)){ must.delete(i); clearVMust(i); sel = sel.filter(function(x){ return x !== i; }); }
        else { must.add(i); excl.delete(i); if (sel.indexOf(i) < 0) sel = sel.concat(i); }
        saveMarks();
      } else {
        if (excl.has(i)) excl.delete(i); else { excl.add(i); must.delete(i); clearVMust(i); sel = sel.filter(function(x){ return x !== i; }); }
        saveMarks();
      }
      render();
    });
    $('mPick').onclick = function(){ setMode('pick'); };
    $('mMust').onclick = function(){ setMode('must'); };
    $('mEx').onclick = function(){ setMode('ex'); };
    $('mVar').onclick = function(){ setMode('vr'); };
    initVp();
    $('bRange').onclick = function(){ sel = withMust(rangePool()); render(); };
    $('bRand').onclick = function(){
      var n = Math.max(1, +$('rn').value || 5);
      var rest = Math.max(0, n - must.size);
      sel = withMust(shuffle(rangePool().filter(function(i){ return !must.has(i); })).slice(0, rest));
      render();
      if (must.size > n) alert('必考題有 ' + must.size + ' 題，超過設定的 ' + n + ' 題，已全部放入。');
      if (sel.length) startQuiz();   /* V213（老師 11/5）：抽完直接出考卷，不先在選題格顯示抽到哪幾題 */
    };
    $('bClear').onclick = function(){ sel = Array.from(must).sort(byIdx); render(); };
    $('bUnex').onclick = function(){
      if (confirm('清除這一課所有「必考」和「排除」標記（含指定的小字詞）？')){ excl.clear(); must.clear(); vmark = {}; vOver = {}; saveMarks(); render(); }
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
  // V143：日曆「開始小考」用。map = { "註號|詞": { 選項字詞: "must"|"ex" } }，套在目前課次，直到換課或重開
  window.nq2SetVOverlay = function(map){
    vOver = {};
    if (D && map) items().forEach(function(it, i){
      var m = map[itemKey(it)]; if (!m || !D.vars[i]) return;
      var o = {}, n = 0;
      D.vars[i].forEach(function(v){ if (m[v[0]] === 'must' || m[v[0]] === 'ex'){ o[v[0]] = m[v[0]]; n++; } });
      if (n) vOver[i] = o;
    });
    if (D) render();
  };

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
    /* V211：十三經小考等特殊考卷由 window.nqRecOverride 提供本次紀錄（回傳 undefined＝照原本註釋小考） */
    if (typeof window.nqRecOverride === 'function'){ var ov = window.nqRecOverride(); if (ov !== undefined) return ov; }
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
    var out = {
      lesson: L,
      rangeStart: Math.min.apply(null, nos),
      rangeEnd: Math.max.apply(null, nos),
      questionKeys: idx.map(function(i){ return items[i][0] + '|' + items[i][1]; }),
      questions: questions
    };
    /* V214：聯合小考（註釋＋十三經加分）——184 提供 bonus，照樣是一筆註釋小考紀錄 */
    if (typeof window.nqRecExtra === 'function'){ var ex = window.nqRecExtra(); if (ex && ex.bonus) out.bonus = ex.bonus; }
    return out;
  }
  function summary(r){
    if (r.kind === 't13') return '〈論語選〉十三經小考，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function(q){ return '《' + q.w + '》'; }).join('、') + '（訂正：十三經全抄）';
    return '〈' + r.lesson.split('—')[0] + '〉註釋小考　註' + r.rangeStart + '～註' + r.rangeEnd + '，共 ' + r.questions.length + ' 題：' +
      r.questions.map(function(q){ return '註' + q.no + ' ' + q.w; }).join('、') +
      (r.bonus && r.bonus.questions && r.bonus.questions.length ? '；加分題十三經 ' + r.bonus.questions.length + ' 格' + (r.bonus.pts ? '（' + r.bonus.pts + ' 分，滿分 ' + (100 + r.bonus.pts) + '）' : '') + '：' +
        r.bonus.questions.map(function(q){ return '《' + q.w + '》'; }).join('、') : '');   /* V214 */
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
    if (rec.kind) r.kind = rec.kind;   /* V211 */
    if (rec.bonus) r.bonus = rec.bonus;   /* V214：十三經加分題 */
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
    /* V157：段落改名（珍奶、火車線「第N部分」→「第N段」）後，舊進度用記住的句子開頭找回所在頁 */
    if (pos.head) for (var h = 0; h < wkSlides.length; h++) if (wkSlides[h].type === 'textpage' &&
      (wkSlides[h].page.lines || []).some(function (L) { return headOf(L.text) === pos.head; })) return h;
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
  /* 課次依 source/115-1/高職/第一冊 教材檔名的 L01～L10（V176 補 L7～L10）；k＝TEXTBOOK 課名 */
  var LESSONS = [
    { no: 'L1', k: '身為魚販' },
    { no: 'L2', k: '世說新語選' },
    { no: 'L3', k: '師說' },
    { no: 'L4', k: '珍珠奶茶' },
    { no: 'L5', k: '臺灣最美麗的火車線', s: '火車線' },
    { no: 'L6', k: '論語選—子路曾皙冉有公西華侍坐', s: '侍坐' },
    { no: 'L7', k: '樂府詩選—長干行', s: '長干行' },
    { no: 'L8', k: '茫茫人海中的一名女孩', s: '茫茫人海' },
    { no: 'L9', k: '桃花源記' },
    { no: 'L10', k: '極短篇小說選', s: '極短篇' }
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
      /* V157：課文改成照課本一段一頁，鍵改成新段名、句序改成段內句序（舊：第1部分=一＋二段、第2部分=三＋四段、第6部分=八＋九段） */
      '第二段': {
        after: {
          1: { natural: true, items: [{ i: '軋日機', c: '軋日機' }, { i: '永保安康車票', c: '永康→保安 硬紙車票' }, { i: '四色牌', c: '四色牌' }] }
        }
      },
      '第三段': {
        after: {
          2: [{ i: '路線圖_花蓮壽豐', c: '花東線：花蓮—吉安—志學—平和—壽豐' }]
        }
      },
      '第四段': {
        after: {
          1: { natural: true, items: [{ i: '吉安壽豐車票', c: '吉安→壽豐（15 元）' }, { i: '永保安康車票', c: '永康→保安' }] }
        }
      },
      '第五段': {
        after: {
          0: [{ i: '吉安車站', c: '吉安車站' }],
          1: { banner: { i: '吉安稻田', c: '吉安的稻田', pos: 'center 52%' } }
        }
      },
      '第七段': {
        after: {
          0: { t: '一般遊客的花蓮', items: [{ i: '賞鯨', c: '賞鯨' }, { i: '光復糖廠', c: '光復糖廠' }, { i: '泛舟', c: '秀姑巒溪泛舟' }] },
          1: { t: '作者的花蓮', items: [{ i: '苦楝', c: '苦楝' }, { i: '九芎', c: '九芎' }] }
        }
      },
      '第八段': {
        after: {
          0: { contain: true, items: [{ i: '環頸雉', c: '環頸雉' }, { i: '白頭錦鴝', c: '白頭錦鴝' }, { i: '棕背伯勞', c: '棕背伯勞' }, { i: '夜鷹', c: '夜鷹' }, { i: '烏頭翁', c: '烏頭翁' }] },
          1: [{ i: '臺灣野兔', c: '臺灣野兔' }],
          2: [{ i: '冬候鳥群', c: '成群的冬候鳥', big: true }]
        }
      },
      '第六段': {
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
  /* 課次同 v84（L1～L10 依 source/115-1/高職/第一冊 教材檔名；V176 補 L7～L10）；L11 以後尚未建課，只顯示課次 */
  var LESSONS = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐', 7: '長干行', 8: '茫茫人海', 9: '桃花源記', 10: '極短篇' };
  var MAXL = 12;
  var KINDS = ['考試', '交作業'];
  function disp(k) { return String(k).replace('課後習題', '課本後習題'); }   /* V123：畫面上叫「課本後習題」（基礎練習＋進階練習）；存的值仍是「課後習題」 */
  var ITEMS = ['A卷', 'A卷檢討', '習作', '習作檢討', '註釋小考', '十三經小考', '課後習題', '課後習題檢討', '其他'];   /* V123：加習作檢討、課後習題檢討（重要進度檢核「檢討」格） */   /* v102：加 A卷檢討 */   /* v100：加註釋小考 */
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐', 7: '樂府詩選—長干行', 8: '茫茫人海中的一名女孩', 9: '桃花源記', 10: '極短篇小說選' };
  var T13L = 6;   /* V213：十三經小考固定 L6〈論語選〉 */
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
    if (e.item === '十三經小考') return '十三經小考' + (e.quiz && e.quiz.n ? ' 抽' + e.quiz.n + '格' : '') + (e.note ? '（' + e.note + '）' : '');   /* V213 */
    if (e.item === '註釋小考') {
      var q = e.quiz || {}, np = (q.pick || []).length, nm = (q.must || []).length;
      return '小考 ' + lesText(e.lessons) + (np ? ' 選' + (np + nm) + '題' : (e.quiz ? ' 註' + q.a + '–' + q.b + ' 抽' + q.n : '')) + (q.t13b ? '＋十三經' + q.t13b.n + '格（滿分' + (100 + (q.t13b.pts || 0)) + '）' : '') +
        (!np && nm ? '（必考' + nm + '）' : '') + (q.vm && Object.keys(q.vm).length ? '（指定小字詞' + Object.keys(q.vm).length + '）' : '') + (e.note ? '（' + e.note + '）' : '');
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
  var form = { cls: [], kind: '考試', item: 'A卷', les: [], note: '', qa: '', qb: '', qn: '5', qmode: 'pick', qs: {}, qvm: {}, qv: -1, qt: '0', qtp: '20' };   /* V214：qt/qtp＝L6 註釋小考加考十三經的格數／分數 */   /* V143：qvm＝小字詞標記 { "註號|詞": { 字詞: must|ex } }，qv＝正在設定的題 */

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
      else if (t === 'fi') { if (form.item === '十三經小考' && a[1] !== '十三經小考') form.qn = '5'; form.item = a[1]; if (a[1] === '十三經小考') { form.kind = '考試'; form.les = [T13L]; form.qn = String(get('nq-t13-n', 5) || 5); }   /* V213 */
        if (a[1] === '註釋小考') { form.kind = '考試'; form.les = form.les.slice(0, 1); qDefault(); } render(); }
      else if (t === 'fl') { if (form.item === '十三經小考') return; if (form.item === '註釋小考') { form.les = form.les[0] === +a[1] ? [] : [+a[1]]; form.qa = form.qb = ''; form.qs = {}; form.qvm = {}; form.qv = -1; form.qmode = 'pick'; qDefault(); } else tog(form.les, +a[1]); render(); }
      else if (t === 'add') add();
      else if (t === 'del') del(a[1]);
      else if (t === 'quiz') startQuiz(a[1]);
      else if (t === 'qm') { form.qmode = a[1]; form.qv = -1; render(); }
      else if (t === 'qc') { qTog(+a[1]); render(); }
      else if (t === 'qx') { form.qs = {}; form.qvm = {}; form.qv = -1; render(); }
      else if (t === 'qvs') { qvSet(+a[1], a[2]); render(); }
      else if (t === 'qvx') { form.qv = -1; render(); }
    });
    m.addEventListener('input', function (e) { if (e.target.id === 'v98-note') { form.note = e.target.value; syncAdd(); }
      else if (/^v98-q(a|b|n|t|tp)$/.test(e.target.id)) { form[e.target.id.slice(4)] = e.target.value; syncAdd(); } });
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
    if (form.item === '十三經小考') { var tn = +form.qn; return !!(sel && form.cls.length && tn >= 1 && tn <= 13); }   /* V213 */
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
      '　抽 <input type="number" id="v98-qn" min="1" value="' + esc(form.qn) + '"> 題</div>' +
      (form.les[0] === T13L ? '<div class="v98-row v100-q"><span>聯合小考：加考十三經當加分（13 部照順序排，抽到的變空格；0＝不加考）</span>' +
        '十三經 <input type="number" id="v98-qt" min="0" max="13" value="' + esc(form.qt) + '"> 格・共 <input type="number" id="v98-qtp" min="0" value="' + esc(form.qtp) + '"> 分' +
        (+form.qt > 0 ? '　→ 滿分 ' + (100 + (+form.qtp || 0)) : '') + '</div>' : '') + chooser();   /* V214 */
  }
  /* v102：在日曆直接點題目（選題／必考／不考），存在這一筆 */
  function quizItems(n) { var k = QK[n]; try { return (k && typeof window.nq2BuildLesson === 'function') ? window.nq2BuildLesson(k).items : []; } catch (e) { return []; } }
  function qKey(it) { return it[0] + '|' + it[1]; }
  function qKeys(m) { return Object.keys(form.qs).filter(function (k) { return form.qs[k] === m; }); }
  function qTog(i) {
    var it = quizItems(form.les[0])[i]; if (!it) return;
    var k = qKey(it);
    if (form.qmode === 'vr') { form.qv = (quizVars(form.les[0])[i] && form.qv !== i) ? i : -1; return; }
    if (form.qs[k] === form.qmode) delete form.qs[k]; else form.qs[k] = form.qmode;
    if (form.qs[k] !== 'must') qvClearMust(k);
  }
  /* V143：小字詞（同註釋小考「點＝指定小字詞」）：必考＝這條一定考這一個（自動設為必考題）；不考＝不會抽到；至少留一個 */
  function quizVars(n) { var k = QK[n]; try { return (k && typeof window.nq2BuildLesson === 'function') ? window.nq2BuildLesson(k).vars : {}; } catch (e) { return {}; } }
  function vName(v) { return v[4] === 'whole' ? '整句' : v[0]; }
  function qvClearMust(k) {
    var m = form.qvm[k]; if (!m) return;
    Object.keys(m).forEach(function (w) { if (m[w] === 'must') delete m[w]; });
    if (!Object.keys(m).length) delete form.qvm[k];
  }
  function qvSet(j, st) {
    var i = form.qv, it = quizItems(form.les[0])[i], vs = quizVars(form.les[0])[i]; if (!it || !vs || !vs[j]) return;
    var k = qKey(it), w = vs[j][0], m = form.qvm[k] || {};
    if (st === 'ex' && vs.filter(function (v) { return v[0] !== w && m[v[0]] !== 'ex'; }).length === 0) { alert('至少要留一個可以考的。整條都不考請用「不考」模式點題目。'); return; }
    if (st === 'must') { Object.keys(m).forEach(function (x) { if (m[x] === 'must') delete m[x]; }); m[w] = 'must'; form.qs[k] = 'must'; }
    else if (st === 'ex') m[w] = 'ex';
    else delete m[w];
    if (Object.keys(m).length) form.qvm[k] = m; else delete form.qvm[k];
  }
  function qvBadge(it, vs) {
    if (!vs) return '';
    var m = form.qvm[qKey(it)] || {}, mu = vs.filter(function (v) { return m[v[0]] === 'must'; })[0];
    if (mu) return '<i class="v143-vb mu">考「' + esc(vName(mu)) + '」</i>';
    var nx = vs.filter(function (v) { return m[v[0]] === 'ex'; }).length;
    return '<i class="v143-vb' + (nx ? ' ex' : '') + '">' + (vs.length - nx) + '選1' + (nx ? '・' + nx + '不考' : '') + '</i>';
  }
  function qvPanel(its, vars) {
    var i = form.qv, it = its[i], vs = vars[i]; if (!it || !vs) return '';
    var m = form.qvm[qKey(it)] || {};
    return '<div class="v143-vp"><div class="v143-vh"><b>註' + it[0] + ' 指定小字詞</b>' +
      '<button type="button" data-v98="qvx">完成</button></div><div class="v143-vn">隨機＝可能抽到；必考＝一定考這一個（只能一個）；不考＝不會抽到</div>' + vs.map(function (v, j) {
        var st = m[v[0]] || 'rnd';
        return '<div class="v143-vr ' + st + '"><span class="w">' + esc(vName(v)) + '</span>' + [['rnd', '隨機'], ['must', '必考'], ['ex', '不考']].map(function (o) {
          return '<button type="button" data-v98="qvs|' + j + '|' + o[0] + '"' + (st === o[0] ? ' class="on ' + o[0] + '"' : '') + '>' + o[1] + '</button>';
        }).join('') + '</div>';
      }).join('') + '</div>';
  }
  function chooser() {
    if (!form.les.length) return '';
    var its = quizItems(form.les[0]); if (!its.length) return '';
    var a = +form.qa || 0, b = +form.qb || 9999, np = qKeys('pick').length, nm = qKeys('must').length, nx = qKeys('ex').length;
    var vars = quizVars(form.les[0]), nv = Object.keys(form.qvm).length;
    var h = '<div class="v98-row v102-qm"><span>點題目＝（可不點，直接隨機抽）</span>' + [['pick', '選題'], ['must', '必考'], ['ex', '不考'], ['vr', '小字詞']].map(function (m) {
      return '<button type="button" class="v102-m-' + m[0] + (form.qmode === m[0] ? ' on' : '') + '" data-v98="qm|' + m[0] + '">' + m[1] + '</button>';
    }).join('') + (np + nm + nx + nv ? '<button type="button" data-v98="qx">全部清除</button>' : '') + '</div>';
    if (form.qmode === 'vr') h += '<div class="v143-hint">點有「N選1」的題目，指定其中一個小字詞必考，或幾個不考。</div>';
    h += '<div class="v102-qgrid' + (form.qmode === 'vr' ? ' v143-vrm' : '') + '">' + its.map(function (it, i) {
      var st = form.qs[qKey(it)] || '', out = it[0] < a || it[0] > b;
      return '<button type="button" class="v102-qc' + (st ? ' ' + st : '') + (out && !st ? ' out' : '') + (vars[i] ? ' hv' : '') + (form.qv === i ? ' cur' : '') + '" data-v98="qc|' + i + '" title="' + esc(it[0] + ' ' + it[1]) + '"><b>' + it[0] + '</b><span class="t">' + esc(it[1]) + '</span>' + qvBadge(it, vars[i]) + '</button>';
    }).join('') + '</div>';
    h += qvPanel(its, vars);
    h += '<div class="v102-qsum">' + (np
      ? '自己選了 ' + np + ' 題' + (nm ? '＋必考 ' + nm + ' 題' : '') + '：只考這些題，不再隨機抽。'
      : '從註' + (form.qa || '?') + '～' + (form.qb || '?') + ' 隨機抽 ' + (form.qn || '?') + ' 題' + (nm ? '，必考 ' + nm + ' 題一定在內' : '') + (nx ? '，不考 ' + nx + ' 題不會抽到' : '') + '。') + (nv ? '指定小字詞 ' + nv + ' 題。' : '') + '</div>';
    return h;
  }
  function qBtn(e) { return (e.item === '註釋小考' || e.item === '十三經小考') && e.quiz ? '<button type="button" class="v100-qgo" data-v98="quiz|' + e.id + '">開始小考</button>' : ''; }
  /* 開始小考：關日曆 → 開註釋小考 → 帶入課次、範圍、題數並抽題（老師按「開始小考」出題） */
  function startQuiz(id) {
    var e = list().filter(function (x) { return x.id === id; })[0]; if (!e || !e.quiz) return;
    if (e.item === '十三經小考') { t13Quiz(e); return; }   /* V213 */
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
    if (typeof window.nq2SetVOverlay === 'function') window.nq2SetVOverlay(q.vm || null);   /* V143：這一筆指定的小字詞 */
    pend = [e.cls]; hookDlg();
    if (typeof window.nq2T13Bonus === 'function') window.nq2T13Bonus(q.t13b ? q.t13b.n : 0, q.t13b ? q.t13b.pts : null);   /* V214：聯合小考 */
    document.getElementById('nq2-bGo').click();   /* V213（老師 11/5）：抽完直接出考卷，不先讓學生看到抽到哪幾題 */
  }
  /* V213：十三經小考——開註釋小考 → 選〈論語選〉→ 切到十三經小考 → 帶入格數 → 抽（184 的「抽！」會直接出考卷） */
  function t13Quiz(e) {
    var k = QK[T13L];
    if (typeof window.nq2Open !== 'function') { alert('找不到註釋小考。'); return; }
    close();
    var p = document.getElementById('cls-panel'); if (p && p.classList.contains('open')) clsToggle();
    window.nq2Open();
    var s = document.getElementById('nq2-lesson'), hit = -1;
    for (var i = 0; i < s.options.length; i++) if (s.options[i].text.replace(/（\d+ 題）$/, '') === k) hit = i;
    if (hit < 0) { alert('註釋小考找不到〈' + k + '〉。'); return; }
    s.selectedIndex = hit; s.dispatchEvent(new Event('change'));
    var tb = document.getElementById('nq2-t13btn'); if (!tb) { alert('找不到「十三經小考」按鈕。'); return; }
    if (!tb.classList.contains('on')) tb.click();
    var ni = document.getElementById('nq2-t13n'); if (ni && e.quiz.n) ni.value = e.quiz.n;
    pend = [e.cls]; hookDlg();
    var go = document.querySelector('#nq2-t13 [data-t="draw"]'); if (go) go.click();
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
      if ((e.item !== '註釋小考' && e.item !== '十三經小考') || e.done) return;
      var k = QK[(e.lessons || [])[0]]; if (!k) return;
      recs.forEach(function (r) {
        if (e.done || !r || r.lesson !== k || (r.classes || []).indexOf(e.cls) < 0 || !r.createdAt) return;
        if ((r.kind === 't13') !== (e.item === '十三經小考')) return;   /* V213：十三經小考與註釋小考各算各的 */
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
      var q = form.item === '註釋小考', t13 = form.item === '十三經小考';
      if (t13) { a.push({ id: uid(), date: sel, cls: c, kind: '考試', item: form.item, lessons: [T13L], note: form.note.trim(), quiz: { t13: 1, n: +form.qn } }); return; }   /* V213 */
      a.push({ id: uid(), date: sel, cls: c, kind: q ? '考試' : (/檢討$/.test(form.item) ? '檢討' : form.kind), item: form.item, lessons: form.les.slice(), note: form.note.trim(),
        quiz: q ? { a: +form.qa, b: +form.qb, n: +form.qn, pick: qKeys('pick'), must: qKeys('must'), ex: qKeys('ex'), vm: Object.keys(form.qvm).length ? JSON.parse(JSON.stringify(form.qvm)) : undefined,
          t13b: form.les[0] === T13L && +form.qt > 0 ? { n: Math.min(13, +form.qt), pts: Math.max(0, +form.qtp || 0) } : undefined } : undefined });   /* V214：聯合小考加考十三經 */
    });
    put(K.data, a);
    form.note = ''; form.les = []; form.qs = {}; form.qvm = {}; form.qv = -1; form.qmode = 'pick';   /* V216：十三經格數（qt）不清掉，一班一班加時每筆都帶得到 */
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
          return '<div class="v98-pill ' + (e.kind === '考試' ? 'ex' : 'hw') + (e.item === '註釋小考' || e.item === '十三經小考' ? ' qz' : /檢討$/.test(e.item) ? ' rvw' : '') + '" data-cid="' + e.id + '" style="border-left-color:' + ccol(e.cls) + '" title="' + esc(e.cls + '・' + label(e)) + '">' +
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
    if (form.item !== '註釋小考' && form.item !== '十三經小考' && !/檢討$/.test(form.item)) h += '<div class="v98-row"><span>類型</span>' + KINDS.map(function (k) { return '<button type="button" data-v98="fk|' + k + '"' + (form.kind === k ? ' class="on"' : '') + '>' + k + '</button>'; }).join('') + '</div>';
    h += '<div class="v98-row"><span>項目</span>' + ITEMS.map(function (k) { return '<button type="button" data-v98="fi|' + k + '"' + (form.item === k ? ' class="on"' : '') + '>' + disp(k) + '</button>'; }).join('') + '</div>';
    if (form.item === '十三經小考') h += '<div class="v98-row v100-q"><span>L' + T13L + ' 論語選・十三經小考（13 部隨機抽，「不抽」設定沿用註釋小考裡的）</span>' +
      '抽 <input type="number" id="v98-qn" min="1" max="13" value="' + esc(form.qn) + '"> 格</div>';   /* V213 */
    else {
    h += '<div class="v98-row"><span>第幾課' + (form.item === '註釋小考' ? '（單選）' : '（可複選）') + '</span>';
    for (var n = 1; n <= MAXL; n++) h += '<button type="button" class="v98-l' + (form.les.indexOf(n) >= 0 ? ' on' : '') + '" data-v98="fl|' + n + '">L' + n + (LESSONS[n] ? '<small>' + esc(LESSONS[n]) + '</small>' : '') + '</button>';
    h += '</div>';
    }
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

  /* V135：教學進度表「轉考試／作業」用：加入整理好的日曆項目（{date,cls,kind,item,lessons,note}），回傳加入後的項目；remove 依 id 刪（不問） */
  function addEntries(es) {
    var a = list(), out = (es || []).map(function (e) {
      var o = { id: uid(), date: e.date, cls: e.cls, kind: e.kind, item: e.item, lessons: (e.lessons || []).slice(), note: e.note || '' };
      a.push(o); return o;
    });
    if (out.length) put(K.data, a);
    return out;
  }
  function removeEntries(ids) {
    var kill = {}; (ids || []).forEach(function (i) { kill[i] = 1; });
    var a = list(), b = a.filter(function (x) { return !kill[x.id]; });
    if (b.length !== a.length) put(K.data, b);
    return a.length - b.length;
  }
  window.V98CAL = { open: open, close: close, data: list, addEntries: addEntries, removeEntries: removeEntries };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/103_v99-link-js.js ════ */
try {

(function () {
  /* 課次 → V84 課名（同 v84 LESSONS）；L11 以後 V84 沒有格子，完成狀態記在日曆項目本身（e.done）
     V176：補 L7～L10。之前 L7～L10 的完成記在 e.done，連動後仍算完成（isDone 也看 e.done），取消時一併清掉 */
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐', 7: '樂府詩選—長干行', 8: '茫茫人海中的一名女孩', 9: '桃花源記', 10: '極短篇小說選' };
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
    return !!e.done || e.lessons.every(function (n) { var r = (hw[LK[n]] || {})[e.cls] || {}; return !!r[hwKey(e)]; });
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
      if (done && e.done) { delete e.done; put(K.cal, a); }
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
  /* V175：日曆另外顯示老師自己設的停課／颱風假（144_swap-js）；不放進 eventsOn，免得教學進度把「只停下午」當整天放假 */
  function evCal(d) { var s = []; try { s = window.V122SWAP && V122SWAP.offOn ? V122SWAP.offOn(d) : []; } catch (e) {} return evOn(d).concat(s); }
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
        var evs = evCal((c.getAttribute('data-v98') || '').slice(2)); if (!evs.length) return;
        var dn = c.querySelector('.v98-dn'), frag = evs.map(function (e) { return '<div class="v101-ev ' + e.c + '" title="' + esc(e.t) + '">' + esc(e.t) + '</div>'; }).join('');
        if (dn) dn.insertAdjacentHTML('afterend', frag);
        evs.forEach(function (e) { e.c.split(' ').forEach(function (x) { c.classList.add('v101-' + x); }); });   /* V175：停課 c 可能是 'stop all' */
      });
      var ed = document.querySelector('#v98-cal .v98-ed'), sd = selDate();
      if (ed && sd && !ed.hasAttribute('data-v101')) {
        ed.setAttribute('data-v101', '1');
        var h4 = ed.querySelector('h4');
        evCal(sd).forEach(function (e) { if (h4) h4.insertAdjacentHTML('afterend', '<div class="v101-edev ' + e.c + '">📌 ' + esc(e.t) + '</div>'); });
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
  var LESSONS = ['身為魚販', '世說新語選', '師說', '珍珠奶茶', '臺灣最美麗的火車線', '論語選—子路曾皙冉有公西華侍坐', '樂府詩選—長干行', '茫茫人海中的一名女孩', '桃花源記', '極短篇小說選'];
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
  var PEN = 0;                        /* 遲交每一上課日扣幾分；10/16 老師：暫時全部不扣（原 10）。恢復扣分改回 10，並同步 Code.gs ME_PEN */
  function penTxt(L) { return PEN ? ' −' + L * PEN : '（暫不扣）'; }
  var LES = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '火車線', 6: '侍坐', 7: '長干行', 8: '茫茫人海', 9: '桃花源記', 10: '極短篇' };
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
  /* v110：請假分兩種，存在 leave 欄前綴——「考:日期」考試請假（顯示未補考）；「交:日期」繳交請假；日期＝請假那天，期限都延到該班該日之後下一節國文課（10/7 起考試請假也算）；
     舊格式（只有日期）＝返校日（v106 原規則：期限延到返校隔日） */
  function leaveOf(sc) { var v = sc && sc.leave ? String(sc.leave) : '', m = /^(考|交):(\d{4}-\d{2}-\d{2})$/.exec(v); return m ? { k: m[1], d: m[2] } : { k: v ? '返' : '', d: v }; }
  function lateOf(it, sc, td) {
    if (!it.late || !it.due) return 0;
    var dl = it.due;
    var lo = leaveOf(sc);
    /* 10/7 老師：考試請假也一樣——請假那天之後的下一節國文課沒補考就開始扣（原 v110：考試請假不計遲交） */
    if (lo.k === '考' || lo.k === '交') { var nl = nextLesson(it.cls, lo.d) || nextSchoolDay(lo.d); if (nl > dl) dl = nl; }   /* v110：請假＝延到請假日之後下一節國文課 */
    else if (lo.d) { var nx = nextSchoolDay(lo.d); if (nx > dl) dl = nx; }   /* 請假：補交期限＝返校隔日 */
    return schoolDaysBetween(dl, (sc && sc.sub) || td);
  }
  /* 10/16 老師：段考＝選擇（raw，滿分 76）＋作文（ess，滿分 24）；作文還沒登＝段考還沒完成，不算最後成績 */
  var EXAM_MAX = { raw: 76, ess: 24 };
  function isExam(it) { return /^[一二三]段$/.test(it && it.type); }
  function finalOf(it, sc, td) {
    if (!sc || sc.raw == null) return null;
    if (/^[一二三]段$/.test(it.type)) return sc.ess == null ? null : sc.raw + sc.ess + (sc.bonus || 0);
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
  /* 10/22 老師：L1～L3 是過渡期（小老師登記制剛上路），要有 10 人以上有分數才算「已登完」、缺交才算 0；
     不到 10 人＝老師只先登了補考的、小老師還沒登全班 → 先不算 0（學生頁也不列未交；Code.gs gr-17 同規則） */
  var TRANS_LES_MAX = 3, TRANS_MIN = 10;
  function lesNums(it) {
    var L = String(it.lessons || '').split(',').filter(Boolean).map(Number), m = /L(\d+)/.exec(it.title || '');
    return L.length ? L : (m ? [m[1].length >= 3 ? +m[1].slice(0, 2) : +m[1]] : []);   /* 「L0501」＝第 5 課 */
  }
  function isTrans(it) { var L = lesNums(it); return L.length > 0 && L.every(function (n) { return n >= 1 && n <= TRANS_LES_MAX; }); }
  function zeroReady(it, n) { return isTrans(it) ? n >= TRANS_MIN : n > 0; }   /* n＝這份考卷有分數的人數 */
  function summary(cls, seat, td) {
    var w = weights(cls), by = {}, has = {};
    if (w.zeroMissing) D.scores.forEach(function (s) { if (s.raw != null) has[s.item] = (has[s.item] || 0) + 1; });   /* 10/22 老師：全班都沒有分數的考卷（還沒登、重複建的）不算 0；同學生頁不顯示（Code.gs mSummary_ 同規則） */
    itemsOf(cls).forEach(function (it) {
      var sc = scoreOf(it.id, seat), f = finalOf(it, sc, td);
      if (f == null && w.zeroMissing && zeroReady(it, has[it.id] || 0) && it.late && it.due && !(sc && sc.sub) && lateOf(it, sc, td) > 0) f = 0;
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
    D.students = (r.students || []).map(function (s) { return { cls: s.cls, seat: +s.seat, sid: s.sid || '', name: s.name || '', active: s.active === '' || s.active == null ? 1 : +s.active, idt: /^[AFTK]$/.test(s.idt || '') ? s.idt : '' }; })
      .filter(function (s) { return s.cls && s.seat > 0; }).sort(function (a, b) { return a.seat - b.seat; });
    D.items = (r.items || []).map(function (i) { return { id: i.id, cls: i.cls, type: i.type, title: i.title || '', lessons: i.lessons || '', issued: i.issued || '',
      due: i.due || '', late: String(i.late) === '1' || i.late === true, calId: i.calId || '', note: i.note || '', created: i.created || '', by: i.by || '' }; });   /* by：gr-5 小老師新增 */
    D.scores = (r.scores || []).map(function (s) { return { item: s.item, cls: s.cls, seat: +s.seat, raw: num(s.raw), ess: num(s.ess), sub: s.sub || '', leave: s.leave || '', bonus: num(s.bonus) || 0, upd: s.upd || '', by: s.by || '', chk: s.chk || '' }; });    D.log = (r.log || []).map(function (l) { return { ts: l.ts, who: l.who, item: l.item, cls: l.cls, seat: +l.seat, field: l.field, old: l.old, 'new': l['new'] }; });   /* gr-5：修改紀錄（只有老師登入才有） */
    D.tutors = r.tutors || [];
    D.weights = r.weights || []; D.points = (r.points || []).map(function (p) { return { id: p.id, ts: p.ts, date: p.date, period: p.period, cls: p.cls, seat: +p.seat, delta: +p.delta, reason: p.reason || '' }; });
    D.holidays = r.holidays || [];
    reindex();
  }
  function reindex() { SCI = {}; D.scores.forEach(function (s) { SCI[s.item + '|' + s.seat] = s; }); }
  /* gr-5 修改紀錄：舊值不是空白的變動＝「改過」→ 紅字 */
  function histOf(item, seat) { return D.log.filter(function (l) { return l.item === item && l.seat === seat; }).sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }); }
  function chgOf(item, seat, field) { return D.log.some(function (l) { return l.item === item && l.seat === seat && l.field === field && l.old !== ''; }); }
  var LOG_NAME = { raw: '分數', ess: '段考作文', sub: '繳交日', leave: '請假', bonus: '訂正加分' };
  function logVal(f, v) { if (v === '' || v == null) return '（空白）'; if (f === 'leave') { var lo = leaveOf({ leave: v }); return (lo.k === '考' ? '考試請假 ' : lo.k === '交' ? '繳交請假 ' : '返校 ') + md(lo.d); } if (f === 'sub') return md(v); if (f === 'bonus') return '+' + v; return v; }
  function tsText(ts) { var d = new Date(ts); return isNaN(d) ? esc(ts) : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function scoreOf(item, seat) { return SCI[item + '|' + seat] || null; }
  function roster(cls) { return D.students.filter(function (s) { return s.cls === cls && s.active !== 0; }); }
  function itemsOf(cls) {
    return D.items.filter(function (i) { return i.cls === cls; }).sort(function (a, b) {
      var x = a.issued || a.due || '', y = b.issued || b.due || ''; return x === y ? (a.created < b.created ? 1 : -1) : (x < y ? 1 : -1); });
  }
  function itemById(id) { return D.items.filter(function (i) { return i.id === id; })[0] || null; }
  function wireScore(s) { return { item: s.item, cls: s.cls, seat: s.seat, raw: s.raw == null ? '' : s.raw, ess: s.ess == null ? '' : s.ess, sub: s.sub, leave: s.leave, bonus: s.bonus || '', upd: s.upd }; }
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
  function qpPing() { try { window.dispatchEvent(new Event('v106gr-data')); } catch (e) {} }   /* V215：資料變了 → 浮動加分盤重畫 */
  function save(table, rows, msg) {
    setSt('儲存中…');
    return call({ action: 'put', table: table, rows: rows }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '儲存失敗'); setSt('✓ ' + (msg || '已儲存')); if (table === 'points') qpPing(); return r;
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert('儲存失敗：' + e.message); throw e; });
  }
  function remove(table, keys) {
    setSt('刪除中…');
    return call({ action: 'del', table: table, keys: keys }).then(function (r) { if (!r.ok) throw new Error(r.error || '刪除失敗'); setSt('✓ 已刪除'); return r; })
      .catch(function (e) { setSt('⚠ ' + e.message, true); alert('刪除失敗：' + e.message); throw e; });
  }

  /* ── 狀態 ── */
  var S = { tab: get(K.tab, 'proj'), cls: get(K.cls, '') || classes()[0] || '', item: '', admin: false, loaded: false, loadedAt: 0, loading: false,
    st: '', stErr: false, subDate: '', edit: null, imp: null, projItem: '', projView: 'item', reveal: {}, revealAll: false, dRev: {}, dRevAll: false, dAs: {},
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
      qpPing();   /* V215：通知浮動加分盤 */
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
    voStop();   /* 語音登分：關視窗就停止聽（暫存清單留著，再開還在） */
    if (Object.keys(pend).length) flush();
  }

  function render() {
    var m = box(), b = m.querySelector('.gr-box'), sc = m.querySelector('.gr-pane');
    var keep = sc ? sc.scrollTop : 0;
    var tabs = [['reg', '✏️ 登記'], ['proj', '📽 投影'], ['pts', '⭐ 課堂加減分'], ['set', '⚙ 設定']];
    if (S.admin || isDemo()) tabs.splice(3, 0, ['dash', '📊 後台']);   /* 10/20：含身份別、姓名，登入才出現 */
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
    else if (S.tab === 'dash') h += (S.admin || isDemo()) ? dashHTML() : needLogin('後台有成績與身份別，需要登入');
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
  var NQK = { '身為魚販': 1, '世說新語選': 2, '師說': 3, '珍珠奶茶': 4, '臺灣最美麗的火車線': 5, '論語選—子路曾皙冉有公西華侍坐': 6, '樂府詩選—長干行': 7, '茫茫人海中的一名女孩': 8, '桃花源記': 9, '極短篇小說選': 10 };   /* 同 v98 QK */
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
    var dz = calDeleted(); if (dz.length) h += '<div class="gr-row"><button class="gr-btn warn" data-g="calclean">🧹 清掉日曆已刪除的考卷（' + dz.length + ' 份）</button></div>';
    var mp = mgPairs(); if (mp.length || S.mg) h += '<div class="gr-row"><button class="gr-btn' + (S.mg ? ' pri' : '') + '" data-g="mg">🔗 合併重複考卷（' + mp.length + ' 組）</button></div>';   /* V154 */
    if (!its.length) h += '<p class="gr-muted">這班還沒有考卷。按「＋ 新增」或「從日曆匯入」。</p>';
    its.forEach(function (it) {
      var got = roster(S.cls).filter(function (s) { var c = scoreOf(it.id, s.seat); return c && (c.raw != null || c.sub); }).length;
      var miss = it.late && it.due && it.due < td && got < n;
      var chg = D.log.some(function (l) { return l.item === it.id && l.old !== ''; });   /* gr-5 */
      h += '<button class="gr-it' + (S.item === it.id && !S.edit && !S.imp && !S.mg ? ' on' : '') + '" data-g="item|' + it.id + '"><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' +
        esc(itemLabel(it)) + (it.by ? ' <span class="gr-tag gr-tut">小老師新增</span>' : '') + (chg ? ' <span class="gr-chgt" title="有成績被改過">改過</span>' : '') + '<small>' + (it.issued ? md(it.issued) + ' 發　' : '') + (it.due ? '期限 ' + md(it.due) : '無期限') +
        '　<span class="' + (miss ? 'late' : '') + '">' + got + '/' + n + '</span></small></button>';
    });
    h += '</div><div class="gr-pane">';
    if (S.mg) h += mgHTML();   /* V154 */
    else if (S.imp) h += impHTML();
    else if (S.edit) h += editHTML();
    else if (S.item) h += sheetHTML(itemById(S.item));
    else h += '<p class="gr-muted">← 選一份考卷開始登記。</p>' + (n ? '' : '<p class="late">這班還沒有學生名單，請到「⚙ 設定 → 學生名單」匯入。</p>');
    return h + '</div></div>';
  }
  function sheetHTML(it) {
    var td = today(), st = roster(S.cls), fins = [];
    st.forEach(function (s) { var f = finalOf(it, scoreOf(it.id, s.seat), td); if (f != null) fins.push(f); });
    var h = '<div class="gr-h"><h4><span class="gr-tag t-' + esc(it.type) + '">' + esc(it.type) + '</span>' + esc(itemLabel(it)) + '</h4>' +
      '<span class="gr-muted">' + (it.due ? '期限 ' + md(it.due) + (it.late ? (PEN ? '（遲交每上課日 −' + PEN + '）' : '（遲交暫不扣分）') : '（不扣遲交）') : '無期限') +
      '　已登記 ' + fins.length + '/' + st.length + (fins.length ? '　平均 ' + r1(avg(fins)) : '') + '</span>' +
      '<button class="gr-btn" data-g="b10|' + it.id + '" title="這份考卷已交（或有分數）的人，訂正加分一次設成 +10；其他分數再個別手動調整">已交的訂正 +10</button>' +   /* v110 */
      (function () { var n = D.log.filter(function (l) { return l.item === it.id && l.old !== ''; }).length;   /* gr-5 */
        return '<button class="gr-btn' + (n ? ' gr-chgb' : '') + '" data-g="hist|' + it.id + '|0">📜 修改紀錄' + (n ? '（' + n + '）' : '') + '</button>'; })() +
      '<button class="gr-btn' + (S.vo && S.vo.item === it.id ? ' pri' : '') + '" data-g="vo|' + it.id + '" title="說「5號14分」登分，念完核對再一起寫入">🎤 語音登分</button>' +
      '<button class="gr-btn" data-g="edit|' + it.id + '">編輯</button></div>' +
      (S.vo && S.vo.item === it.id ? voHTML(it) : '') +
      (it.by ? '<p class="gr-muted" style="margin:0 0 6px">這份是小老師 ' + esc(it.by) + ' 新增的' + (it.note && it.note !== '小老師新增' ? '（' + esc(it.note) + '）' : '') + '，請確認類型、期限。</p>' : '') +
      '<div class="gr-row"><label class="k">繳交日期</label><input type="date" id="gr-subdate" value="' + esc(S.subDate) + '">' +
      '<span class="gr-muted">按「已交」或輸入分數時記這天（補登時改這裡）</span></div>';
    if (!st.length) return h + '<p class="late">這班還沒有學生名單。</p>';
    h += '<table class="gr-t"><thead><tr><th>座號</th><th>姓名</th>' + (isExam(it) ? '<th>選擇（' + EXAM_MAX.raw + '）</th><th>作文（' + EXAM_MAX.ess + '）</th>' : '<th>分數</th>') + '<th>繳交</th><th>請假</th><th>遲交</th><th>訂正</th><th>最後成績</th></tr></thead><tbody>';
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
    var late = L ? '<span class="late">' + (c.sub ? '遲' : '逾期') + L + '天' + penTxt(L) + '</span>' : '';
    if (!late && lo.k === '考' && c.raw == null) late = '<span class="late">未補考</span>';   /* v110 */
    var bo = '<select data-g="bonus|' + id + '">' + [0,1,2,3,4,5,6,7,8,9,10].map(function (n) { return '<option value="' + n + '"' + ((c.bonus || 0) === n ? ' selected' : '') + '>' + (n ? '+' + n : '—') + '</option>'; }).join('') + '</select>';
    /* gr-5：改過的格子紅框紅字；姓名下方小字＝小老師登記者／✓檢查者／📜修改紀錄 */
    var cg = function (f) { return chgOf(it.id, s.seat, f) ? ' gr-chg' : ''; }, hs = histOf(it.id, s.seat), anyChg = hs.some(function (l) { return l.old !== ''; });
    var who = (c.by ? '<span class="gr-muted">' + esc(String(c.by).replace(it.cls, '')) + '</span>' : '') +
      (c.chk ? ' <span class="pos" title="' + esc(c.chk) + '">✓' + esc(String(c.chk).split('@')[0].replace(it.cls, '')) + '</span>' : '') +
      (hs.length ? ' <button class="gr-x' + (anyChg ? ' gr-chgb' : '') + '" data-g="hist|' + id + '" title="修改紀錄">📜</button>' : '');
    return '<tr data-row="' + id + '" class="' + (c.raw != null || c.sub ? 'done' : '') + '"><td>' + s.seat + '</td><td class="nm">' + esc(s.name) + (who ? '<small class="gr-who">' + who + '</small>' : '') + '</td>' +
      '<td class="' + cg('raw') + '"><input class="gr-sc" type="text" inputmode="decimal" data-g="raw|' + id + '" value="' + (c.raw == null ? '' : c.raw) + '"></td>' +
      (isExam(it) ? '<td class="' + cg('ess') + '"><input class="gr-sc" type="text" inputmode="decimal" data-g="ess|' + id + '" value="' + (c.ess == null ? '' : c.ess) + '"></td>' : '') +
      '<td class="' + cg('sub') + '">' + sub + '</td><td class="' + cg('leave') + '">' + lv + '</td><td>' + late + '</td><td class="' + cg('bonus') + '">' + bo + '</td><td class="fin">' + (f == null ? (isExam(it) && c.raw != null ? '<span class="gr-muted">作文待登</span>' : '') : r1(f)) + '</td></tr>';
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
    if (!c) { c = { item: item, cls: it.cls, seat: seat, raw: null, ess: null, sub: '', leave: '', bonus: 0, upd: '', by: '', chk: '' }; D.scores.push(c); SCI[item + '|' + seat] = c; }
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
  /* 10/20：日曆刪掉、名稱被標「（日曆已刪除）」而且沒有任何分數的考卷（四班一起），老師按一下清掉 */
  function calDeleted() { return D.items.filter(function (it) { return String(it.title).indexOf('（日曆已刪除）') === 0 && !D.scores.some(function (s) { return s.item === it.id && (s.raw != null || s.sub); }); }); }
  function calClean() {
    var dz = calDeleted(); if (!dz.length) return;
    if (!confirm('刪除這 ' + dz.length + ' 份（日曆已刪除、都沒有分數）？\n' + dz.map(function (i) { return i.cls + '・' + i.title; }).join('\n'))) return;
    var ids = dz.map(function (i) { return i.id; });
    remove('items', ids).then(function () { D.items = D.items.filter(function (i) { return ids.indexOf(i.id) < 0; }); if (ids.indexOf(S.item) >= 0) S.item = ''; setSt('✓ 已清掉 ' + ids.length + ' 份'); render(); });
  }
  /* V154：合併 10/19 以前「老師建」和「小老師建」的同一次考試（老師 10/20）
     配對：同班同類型、都在 10/20 以前、課次相同；小老師那張有「第一題：X」→ 老師那張名稱要有「X」（X＝「：」前的關鍵詞）；
     沒有第一題（A卷等）→ 同課次 ±14 天內只有一張才配。老師逐組勾選才合併。
     合併：保留老師那張，名稱改「編號｜第一題：X」（老師那張沒編號就不改名）；小老師那張的分數搬過來（兩張分數不同 → 老師逐人選），再刪小老師那張（後台刪考卷會連分數一起刪）。 */
  var MG_BEFORE = '2026-10-20';
  function mgDay(it) { return it.issued || it.due || String(it.created || '').slice(0, 10); }
  function mgOld(it) { var d = String(it.created || '').slice(0, 10) || mgDay(it); return !!d && d < MG_BEFORE; }
  function mgLes(it) { var L = lessonsOf(it.lessons), m = /L(\d+)/.exec(it.title || ''); return L.length ? L : (m ? [+m[1]] : []); }
  function mgQ1(it) { var m = /第一題：(.*)$/.exec(String(it.note || '')) || /第一題：(.*)$/.exec(String(it.title || '')); return m ? m[1].trim() : ''; }
  function mgNorm(t) { return String(t || '').replace(/[\s「」『』（）()、，。：:？?！!…．.｜|]/g, ''); }
  function mgGap(a, b) { return a && b ? Math.abs((parse(a) - parse(b)) / 864e5) : 99; }
  function mgHas(c) { return !!c && (c.raw != null || c.ess != null || !!c.sub || !!c.leave || !!c.bonus); }
  function mgCnt(id) { return D.scores.filter(function (c) { return c.item === id && mgHas(c); }).length; }
  function mgPairs() {
    var used = {}, out = [];
    D.items.filter(function (t) { return t.by && mgOld(t); }).sort(function (a, b) { return mgDay(a) < mgDay(b) ? -1 : 1; }).forEach(function (t) {
      var q = mgQ1(t), key = q.split(/[：:]/)[0].trim(), tl = mgLes(t);
      var c = D.items.filter(function (k) {
        if (k.by || used[k.id] || k.cls !== t.cls || k.type !== t.type || !mgOld(k)) return false;
        var kl = mgLes(k);
        if (tl.length && kl.length && !tl.some(function (n) { return kl.indexOf(n) >= 0; })) return false;
        if (key) return String(k.title).indexOf('「' + key + '」') >= 0 || (mgNorm(key).length >= 2 && mgNorm(k.title).indexOf(mgNorm(key)) >= 0);
        return tl.length > 0 && kl.length > 0 && mgGap(mgDay(k), mgDay(t)) <= 14;
      }).sort(function (a, b) { return mgGap(mgDay(a), mgDay(t)) - mgGap(mgDay(b), mgDay(t)); });
      if (!c.length || (!key && c.length !== 1)) return;
      used[c[0].id] = 1; out.push({ k: c[0].id, t: t.id, q1: q });
    });
    return out;
  }
  function mgTitle(k, q1) { var m = /^(L?\d{3,4})(?=[（(｜\s]|$)/.exec(k.title || ''); return m && q1 ? m[1] + '｜第一題：' + q1 : k.title; }
  function mgSame(a, b) { return a.raw === b.raw && a.ess === b.ess && (a.bonus || 0) === (b.bonus || 0); }
  function mgSeats(p) {   /* 這組每個有分數的座號：{seat, a(老師那張), b(小老師那張), conflict} */
    var seats = {};
    D.scores.forEach(function (c) { if ((c.item === p.k || c.item === p.t) && mgHas(c)) seats[c.seat] = 1; });
    return Object.keys(seats).map(Number).sort(function (x, y) { return x - y; }).map(function (n) {
      var a = scoreOf(p.k, n), b = scoreOf(p.t, n), ha = mgHas(a), hb = mgHas(b);
      return { seat: n, a: ha ? a : null, b: hb ? b : null, conflict: ha && hb && !mgSame(a, b) };
    });
  }
  function mgFmt(c) {
    if (!c) return '—';
    var t = c.raw == null ? (c.sub ? '已交' : '') : String(c.raw);
    if (c.ess != null) t += '＋作文' + c.ess;
    if (c.bonus) t += '（訂正+' + c.bonus + '）';
    if (c.leave) t += (t ? '・' : '') + '請假';
    return t || '—';
  }
  function mgOpen() {
    S.item = ''; S.edit = null; S.imp = null;
    S.mg = { pairs: mgPairs(), on: {}, du: {}, ch: {} };
    S.mg.pairs.forEach(function (p, i) { S.mg.du[i] = mgCnt(p.t) > mgCnt(p.k) ? 't' : 'k'; });
    render();
  }
  function mgMissing(i) { var M = S.mg, p = M.pairs[i]; return mgSeats(p).filter(function (r) { return r.conflict && !M.ch[i + '|' + r.seat]; }).length; }
  function mgHTML() {
    var M = S.mg, h = '<div class="gr-h"><h4>🔗 合併重複考卷（四班）</h4><button class="gr-btn" data-g="mgx">返回</button></div>' +
      '<p class="gr-muted" style="margin:0 0 8px">10/19 以前，老師建一張、小老師又建一張的同一次考試。勾選確定是同一次的，按最下面「合併」。合併後保留老師那張（改名），小老師那張的分數搬過來後刪掉。</p>';
    if (!M.pairs.length) return h + '<p class="gr-muted">沒有找到可能重複的考卷。</p>';
    M.pairs.forEach(function (p, i) {
      var k = itemById(p.k), t = itemById(p.t); if (!k || !t) return;
      var rows = mgSeats(p), cf = rows.filter(function (r) { return r.conflict; }), nm = {};
      roster(k.cls).forEach(function (s) { nm[s.seat] = s.name; });
      var dd = function (it) { return (it.issued ? md(it.issued) + ' 發　' : '') + (it.due ? '期限 ' + md(it.due) : '無期限'); };
      h += '<div class="gr-mg' + (M.on[i] ? ' on' : '') + '"><label class="gr-mg-h"><input type="checkbox" data-g="mgon|' + i + '"' + (M.on[i] ? ' checked' : '') + '> <b>' + esc(k.cls) + '</b>　<span class="gr-tag t-' + esc(k.type) + '">' + esc(k.type) + '</span> 是同一次考試，合併</label>' +
        '<table class="gr-t gr-mg-t"><tr><th></th><th>名稱</th><th>日期</th><th>有分數</th></tr>' +
        '<tr><td>老師建</td><td class="nm">' + esc(itemLabel(k)) + '</td><td>' + dd(k) + '</td><td>' + mgCnt(k.id) + ' 人</td></tr>' +
        '<tr><td>小老師 ' + esc(t.by) + ' 建</td><td class="nm">' + esc(t.title) + '</td><td>' + dd(t) + '</td><td>' + mgCnt(t.id) + ' 人</td></tr></table>' +
        '<div class="gr-row">合併後名稱：<b>' + esc(mgTitle(k, p.q1) || itemLabel(k)) + '</b></div>';
      if ((k.issued || '') !== (t.issued || '') || (k.due || '') !== (t.due || '')) {
        h += '<div class="gr-row">日期用：<button class="gr-chip' + (M.du[i] === 'k' ? ' on' : '') + '" data-g="mgdu|' + i + '|k">老師那張（' + dd(k) + '）</button>' +
          '<button class="gr-chip' + (M.du[i] === 't' ? ' on' : '') + '" data-g="mgdu|' + i + '|t">小老師那張（' + dd(t) + '）</button></div>';
      }
      if (cf.length) {
        h += '<div class="gr-row late">兩張分數不一樣的 ' + cf.length + ' 人，請點要留的分數：</div><table class="gr-t gr-mg-t"><tr><th>座號</th><th>姓名</th><th>老師那張</th><th>小老師那張</th></tr>';
        cf.forEach(function (r) {
          var c = M.ch[i + '|' + r.seat];
          h += '<tr class="gr-mg-cf"><td>' + r.seat + '</td><td class="nm">' + esc(nm[r.seat] || '') + '</td>' +
            '<td><button class="gr-chip' + (c === 'k' ? ' on' : '') + '" data-g="mgch|' + i + '|' + r.seat + '|k">' + esc(mgFmt(r.a)) + '</button></td>' +
            '<td><button class="gr-chip' + (c === 't' ? ' on' : '') + '" data-g="mgch|' + i + '|' + r.seat + '|t">' + esc(mgFmt(r.b)) + '</button></td></tr>';
        });
        h += '</table>';
      }
      var mv = rows.filter(function (r) { return r.b && !r.a; }).length, rest = rows.length - mv - cf.length;
      h += '<div class="gr-muted">只有小老師那張有分數、會搬過去的：' + mv + ' 人' + (rest ? '；兩張一樣或只有老師那張有的：' + rest + ' 人' : '') + '</div></div>';
    });
    var picked = Object.keys(M.on).filter(function (i) { return M.on[i]; }), miss = picked.reduce(function (s, i) { return s + mgMissing(+i); }, 0);
    h += '<div class="gr-row" style="margin-top:10px"><button class="gr-btn pri" data-g="mggo"' + (picked.length && !miss ? '' : ' disabled') + '>合併勾選的 ' + picked.length + ' 組</button>' +
      (miss ? '<span class="late">還有 ' + miss + ' 人的分數沒選</span>' : '') + '</div>';
    return h;
  }
  function mgRun() {
    var M = S.mg, idx = Object.keys(M.on).filter(function (i) { return M.on[i] && !mgMissing(+i); }).map(Number);
    if (!idx.length) return;
    if (!confirm('合併這 ' + idx.length + ' 組？\n' + idx.map(function (i) { var k = itemById(M.pairs[i].k), t = itemById(M.pairs[i].t); return k.cls + '：' + itemLabel(k) + ' ← ' + t.title; }).join('\n') + '\n\n小老師那張合併後會刪掉，無法復原。')) return;
    var ts = new Date().toISOString(), done = 0;
    var step = function (n) {
      if (n >= idx.length) { S.mg = null; setSt('✓ 已合併 ' + done + ' 組'); render(); return; }
      var i = idx[n], p = M.pairs[i], k = itemById(p.k), t = itemById(p.t);
      if (!k || !t) { step(n + 1); return; }
      var rows = [];
      mgSeats(p).forEach(function (r) {
        if (!r.b) return;
        if (r.conflict && M.ch[i + '|' + r.seat] === 'k') return;
        var base = r.a && !r.conflict ? r.a : null, o = base || r.b;   /* 分數一樣：留老師那張，空的欄位用小老師那張補 */
        var sub = base ? ([r.a.sub, r.b.sub].filter(Boolean).sort()[0] || '') : (r.b.sub || '');
        rows.push({ item: k.id, cls: k.cls, seat: r.seat, raw: o.raw == null ? '' : o.raw, ess: o.ess == null ? '' : o.ess,
          sub: sub, leave: o.leave || (base ? r.b.leave : '') || '', bonus: o.bonus || '', upd: ts, by: o.by || '', chk: o.chk || '' });
      });
      var nk = JSON.parse(JSON.stringify(k));
      nk.title = mgTitle(k, p.q1);
      if (M.du[i] === 't') { nk.issued = t.issued; nk.due = t.due; }
      (rows.length ? save('scores', rows, '分數已搬過去') : Promise.resolve()).then(function () {
        rows.forEach(function (w) {
          var c = scoreOf(k.id, w.seat), v = { item: w.item, cls: w.cls, seat: w.seat, raw: num(w.raw), ess: num(w.ess), sub: w.sub, leave: w.leave, bonus: num(w.bonus) || 0, upd: w.upd, by: w.by, chk: w.chk };
          if (c) Object.keys(v).forEach(function (f) { c[f] = v[f]; }); else D.scores.push(v);
        });
        reindex();
        return save('items', [wireItem(nk)], '考卷已改名');
      }).then(function () {
        Object.keys(nk).forEach(function (f) { k[f] = nk[f]; });
        return remove('items', [t.id]);
      }).then(function () {
        D.items = D.items.filter(function (x) { return x.id !== t.id; }); D.scores = D.scores.filter(function (x) { return x.item !== t.id; }); reindex();
        done++; step(n + 1);
      }).catch(function () { S.mg = null; render(); });
    };
    step(0);
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
  /* 10/20 老師：日曆的註釋小考預先給編號（L＋課次2碼＋該班第幾次2碼，同 v109 小考紀錄的規則）：
     已考過的取小考紀錄（nq-records）該班該課最大號，之後的依日曆日期排下去。日曆上還沒考的若刪了／改了日期，號碼會重排。 */
  function quizCode(e) {
    var n = (e.lessons || [])[0]; if (!n) return '';
    var pre = 'L' + pad(n), base = 0, lastD = '', rs = [], all = [];
    try { rs = JSON.parse(localStorage.getItem('nq-records-v1') || '[]') || []; } catch (x) {}
    (Array.isArray(rs) ? rs : []).forEach(function (r) {
      var c = r && r.codes && r.codes[e.cls]; if (!c || String(c).indexOf(pre) !== 0) return;
      base = Math.max(base, +String(c).slice(pre.length) || 0);
      var d = new Date(r.createdAt); if (!isNaN(d) && ymd(d) > lastD) lastD = ymd(d);
    });
    try { all = (window.V98CAL && V98CAL.data()) || []; } catch (x) {}
    var pend = all.filter(function (x) { return x && x.item === '註釋小考' && x.kind !== '檢討' && x.cls === e.cls && (x.lessons || [])[0] === n && x.date > lastD; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.id < b.id ? -1 : 1); });
    var i = pend.map(function (x) { return x.id; }).indexOf(e.id);
    return i < 0 ? '' : pre + pad(base + i + 1);
  }
  function calTitle(e) {
    var L = (e.lessons || []).slice().sort(function (a, b) { return a - b; }).map(function (n) { return 'L' + n; }).join('、');
    if (e.item === '註釋小考') { var q = e.quiz || {}, cd = quizCode(e); return (cd ? cd + ' 註釋小考' : '註釋小考 ' + L) + (q.a ? '（註' + q.a + '–' + q.b + '）' : ''); }
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
  /* V135：教學進度表按「轉考試／作業」時，日曆加一筆後直接建成績項目（同「從日曆匯入」的規則，已建過的 calId 不重建）。
     回傳 Promise：{ok:true,n} 建好 n 份；{ok:false,why:'login'} 沒登入成績系統（日曆那筆仍在，之後可用「從日曆匯入」）。 */
  function addFromCal(es, quiet) {   /* quiet：背景自動建（10/20），失敗不跳視窗 */
    if (!isDemo() && !pw()) return Promise.resolve({ ok: false, why: 'login' });
    var ready = S.loaded ? Promise.resolve() : call({ action: 'load' }).then(function (r) {
      if (!r.ok) throw new Error(r.error || '讀取失敗');
      norm(r); S.admin = !!r.admin; S.loaded = true; S.loadedAt = Date.now();
    });
    return ready.then(function () {
      if (!S.admin) return { ok: false, why: 'login' };
      var have = {}; D.items.forEach(function (i) { if (i.calId) have[i.calId] = 1; });
      var rows = (es || []).filter(function (e) { return e && CAL_MAP[e.item] && e.kind !== '檢討' && !have[e.id]; }).map(function (e) {
        var ty = CAL_MAP[e.item];
        return { id: uid('i'), cls: e.cls, type: ty, title: calTitle(e), lessons: (e.lessons || []).join(','), issued: e.kind === '考試' ? e.date : '',
          due: ty === '註釋小考' ? nextLesson(e.cls, e.date) : e.date, late: typeOf(ty).late, calId: e.id, note: '', created: new Date().toISOString() };
      });
      if (!rows.length) return { ok: true, n: 0 };
      return (quiet ? putQuiet('items', rows.map(wireItem)) : save('items', rows.map(wireItem), '已建立 ' + rows.length + ' 份')).then(function () { rows.forEach(function (r) { D.items.push(r); }); return { ok: true, n: rows.length }; });
    });
  }
  /* 10/20 老師：今天起日曆上的註釋小考／A卷／習作／課後習題／其他，自動建成成績考卷（日期照日曆），小老師頁就看得到（後台 gr-14）。
     這台有記住登記密碼才會做；開網頁 4 秒後一次，之後每分鐘看日曆有沒有新項目（只比對本機，有新的才連後台）。
     建之前一定重新讀一次後台（另一台可能已經建了），後台也擋同一個日曆項目建兩份。日曆改日期不會跟著改（之後再做）。 */
  var CAL_AUTO_FROM = '2026-10-20', autoBusy = false, autoSeen = '';
  function autoCal() {
    if (autoBusy || isDemo() || !pw()) return;
    var a = []; try { a = (window.V98CAL && V98CAL.data()) || []; } catch (e) {}
    var es = a.filter(function (e) { return e && e.date >= CAL_AUTO_FROM && CAL_MAP[e.item] && e.kind !== '檢討'; });
    var rs = nqRecs(), sig = es.map(function (e) { return e.id + '@' + e.date + (e.quiz ? '#' + e.quiz.a + '-' + e.quiz.b : ''); }).sort().join(',') +
      '|nq' + rs.length + ':' + rs.map(function (r) { return r && r.createdAt || ''; }).sort().pop();   /* 小考紀錄多了也要跑（補第一題） */
    if (!es.length || sig === autoSeen) return;
    if (S.loaded && !renames().length) { var have = {}; D.items.forEach(function (i) { if (i.calId) have[i.calId] = 1; }); if (es.every(function (e) { return have[e.id]; })) { autoSeen = sig; return; } }
    autoBusy = true;
    var made = 0;
    call({ action: 'load' }).then(function (r) {
      if (!r.ok || !r.admin) throw new Error(r.error || '沒有登入');
      norm(r); S.admin = true; S.loaded = true; S.loadedAt = Date.now();
      return addFromCal(es, true);
    }).then(function (res) {
      made = res && res.n || 0;
      var rn = renames();   /* 還沒考的日曆考卷：編號／範圍／日期跟日曆對不上就更新（日曆刪了的只標名稱、不刪） */
      if (!rn.length) return 0;
      return putQuiet('items', rn).then(function () { rn.forEach(function (x) { var it = itemById(x.id); if (it) Object.keys(x).forEach(function (k) { it[k] = x[k]; }); }); return rn.length; });
    }).then(function (nr) {
      autoBusy = false; autoSeen = sig;
      if (made || nr) { setSt('📅 日曆自動' + (made ? '建了 ' + made + ' 份' : '') + (made && nr ? '、' : '') + (nr ? '更新 ' + nr + ' 份（編號／日期）' : '')); var m = document.getElementById('v106-gr'); if (m && m.classList.contains('open')) render(); }
    }).catch(function () { autoBusy = false; });   /* 連不上就下一分鐘再試 */
  }
  function putQuiet(table, rows) { return call({ action: 'put', table: table, rows: rows }).then(function (r) { if (!r.ok) throw new Error(r.error || '儲存失敗'); return r; }); }
  /* 10/20 老師：小考考完存了紀錄（nq-records：編號＋每一題），對應的日曆考卷（同班、同課、考試日＝紀錄那天；或名稱編號相同）
     名稱改成「紀錄的編號 註釋小考（範圍）｜第一題：○○」、備註記「第一題：○○」（小老師頁靠這個認考卷） */
  function nqRecs() { var rs = []; try { rs = JSON.parse(localStorage.getItem('nq-records-v1') || '[]') || []; } catch (x) {} return Array.isArray(rs) ? rs : []; }
  function recFor(it) {
    if (it.type !== '註釋小考') return null;
    var n = +String(it.lessons).split(',')[0], byDay = null, byCode = null;
    nqRecs().forEach(function (r) {
      var c = r && r.codes && r.codes[it.cls]; if (!c || NQK[r.lesson] !== n) return;
      var d = new Date(r.createdAt);
      if (it.issued && !isNaN(d) && ymd(d) === it.issued) byDay = r;
      if (String(it.title).replace('（日曆已刪除）', '').indexOf(c + ' ') === 0) byCode = r;
    });
    return byDay || byCode;
  }
  function recQ1(r) {
    var qs = (r.questions || []).slice().sort(function (a, b) { return (+a.ord || 0) - (+b.ord || 0); });
    var w = qs.length ? String(qs[0].w || '') : ''; return w.length > 14 ? w.slice(0, 14) + '…' : w;
  }
  function renames() {
    var cal = {}, td = today(); try { ((window.V98CAL && V98CAL.data()) || []).forEach(function (e) { if (e && e.id) cal[e.id] = e; }); } catch (x) {}
    var out = [], DEL = '（日曆已刪除）', synced = false;
    try { synced = !!(window.V107SYNC && V107SYNC.state().pulled); } catch (x) {}   /* 這次開網頁已經從雲端拿過日曆，才判斷「已刪除」 */
    D.items.forEach(function (it) {
      if (!it.calId || (it.issued || it.due || '') < CAL_AUTO_FROM) return;
      var r = String(it.title).indexOf(DEL) === 0 || (synced && !cal[it.calId]) ? null : recFor(it);   /* 日曆已刪除的不配對紀錄 */
      if (r) {   /* 已經考了：照小考紀錄 */
        var q1 = recQ1(r), e0 = cal[it.calId], qa = e0 && e0.quiz && e0.quiz.a ? e0.quiz : (r.rangeStart ? { a: r.rangeStart, b: r.rangeEnd } : null);
        var rt = r.codes[it.cls] + ' 註釋小考' + (qa ? '（註' + qa.a + '–' + qa.b + '）' : '') + (q1 ? '｜第一題：' + q1 : ''), rn = q1 ? '第一題：' + q1 : it.note, pr = { id: it.id };
        if (rt !== it.title) pr.title = rt; if (rn !== it.note) pr.note = rn;
        if (pr.title || pr.note) out.push(pr);
        return;
      }
      if ((it.issued || it.due || '') < td) return;
      var e = cal[it.calId], t;
      if (!e) { if (synced && String(it.title).indexOf(DEL) !== 0) out.push({ id: it.id, title: DEL + it.title }); return; }   /* 只改名、不刪（可能另一台還沒同步） */
      t = it.type === '註釋小考' && e.item === '註釋小考' ? calTitle(e) : String(it.title).replace(DEL, '');
      var p = { id: it.id }, ch = false;
      if (t && t !== it.title) { p.title = t; ch = true; }
      /* 日曆用 📅 改了日期：還沒有人登分的考卷，考試日／期限跟著改（規則同 addFromCal）；已有分數的不動 */
      var iss = e.kind === '考試' ? e.date : '', due = it.type === '註釋小考' ? (nextLesson(it.cls, e.date) || e.date) : e.date;
      var scored = D.scores.some(function (s) { return s.item === it.id && (s.raw != null || s.sub); });
      if (!scored && (iss !== (it.issued || '') || due !== (it.due || ''))) { p.issued = iss; p.due = due; ch = true; }
      if (ch) out.push(p);
    });
    return out;
  }
  setTimeout(autoCal, 4000); setInterval(autoCal, 60000);

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
          cards += '<div class="gr-card' + (L ? ' miss' : '') + '"><b>' + s.seat + '</b><div class="v">' + (L ? '未交' : (leaveOf(c).k === '考' ? '未補考' : '—')) + '</div><div class="s">' + (L ? '<span class="late">逾期' + L + '天' + penTxt(L) + '</span>' : (c && c.leave ? (leaveOf(c).k === '考' ? '考試請假' : '請假') : '')) + '</div></div>';
        } else {
          cards += '<div class="gr-card"><b>' + s.seat + '</b><div class="v">✓</div><div class="s">' +   /* v110：投影不顯示分數 */
            (L ? '<span class="late">遲' + L + '天' + penTxt(L) + '</span>' : '') + (c.bonus ? ' <span class="pos">訂正+' + c.bonus + '</span>' : '') + '</div></div>';
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
    return remove('points', [id]).then(function () { D.points = D.points.filter(function (x) { return x.id !== id; }); setSt('已復原 ' + (p ? p.seat + '號 ' + (p.delta > 0 ? '+1' : '−1') : '')); render(); return p; })   /* V215：回傳 promise＋那一筆，給浮動加分盤用 */
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
      '<div class="gr-row"><label><input type="checkbox" id="gr-w-zero"' + (w.zeroMissing ? ' checked' : '') + '> 逾期未交的考卷以 0 分計入平均（不勾＝未交不列入；全班都沒分數的考卷不算）</label></div>' +
      '<div class="gr-row"><button class="gr-btn pri" data-g="wsave">儲存這班</button><button class="gr-btn" data-g="wsaveall">套用到全部班級</button><span class="gr-muted">比例數字不必加到 100，會自動換算；目前平均只算已有分數的項目。</span></div></div>';
    h += '<div class="gr-sec"><h5>④ 匯出 Excel</h5><div class="gr-row">' + classes().map(function (c) { return '<button class="gr-btn" data-g="csv|' + esc(c) + '">' + esc(c) + ' 成績總表</button>'; }).join('') +
      '<button class="gr-btn" data-g="csvpts">課堂加減分紀錄</button></div><p class="gr-muted">下載 CSV（Excel 可直接開，含姓名，請勿外流）。完整原始資料也在 Google 試算表裡。</p></div>';
    h += tutorSecHTML();   /* gr-5 */
    h += idtSecHTML();     /* 10/20 */
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
        return f != null ? r1(f) : (isExam(i) && sc && sc.raw != null ? '選擇' + sc.raw + '(作文待登)' : sc && sc.sub ? '已交' : (L ? '未交(逾' + L + '天)' : '')); }), CATS.map(function (k) { return r1(sm[k]); }), [r1(sm.total)]));
    });
    rows.push([]); rows.push(['配分', '', ''].concat(its.map(function () { return ''; }), CATS.map(function (k) { return w[k]; }), [w.tentative ? '暫定' : '']));
    download(c + '_成績總表_' + td + '.csv', rows);
  }
  function exportPoints() {
    var rows = [['日期', '節次', '班級', '座號', '加減', '原因', '時間']];
    D.points.slice().sort(function (a, b) { return a.ts < b.ts ? -1 : 1; }).forEach(function (p) { rows.push([p.date, p.period, p.cls, p.seat, p.delta, p.reason, p.ts]); });
    download('課堂加減分_' + today() + '.csv', rows);
  }

  /* ── 10/20 成績身份別（學校 xls「成績身份別」欄）：只存在試算表學生名單 idt 欄、只在老師登入後顯示 ──
     及格線：A 一般 60、F 原住民 40、T 技優 50、K 身障 60（身障生不及格時提醒老師可放過關）。
     學校系統四捨五入：總分先四捨五入成整數再比（59.5→60 及格、39.5→40 可補考）；39 以下死當；補考＝40～及格線−1（原住民沒有補考區間）。 */
  var IDT = { A: { n: '一般生', s: '一般', line: 60 }, F: { n: '原住民', s: '原民', line: 40 }, T: { n: '技優生', s: '技優', line: 50 }, K: { n: '身心障礙生', s: '身障', line: 60 } };
  var FAIL_BELOW = 40;
  function lineOf(idt) { return (IDT[idt] || IDT.A).line; }
  function judge(total, idt) {
    if (total == null) return null;
    var n = Math.round(total), L = lineOf(idt);
    return n >= L ? 'pass' : n >= FAIL_BELOW ? 'makeup' : 'fail';
  }
  var JUDGE = { pass: ['及格', '#2f7d43'], makeup: ['補考', '#c08a1e'], fail: ['死當', '#b03a2e'], none: ['還沒有成績', '#9a8f80'] };
  /* 還沒考（或作文待登）的段考全部考 x 分，學期總分會到 target；回傳 x（不需要＝≤0；不可能＝>100） */
  function needFor(cls, sm, target) {
    var w = weights(cls), s = 0, W = 0, Wr = 0;
    CATS.forEach(function (k) { var wk = +w[k] || 0; if (wk <= 0) return; if (sm[k] != null) { s += sm[k] * wk; W += wk; } else if (/^[一二三]段$/.test(k)) Wr += wk; });
    if (!Wr) return null;
    return (target * (W + Wr) - s) / Wr;
  }
  function needTxt(x) { return x == null ? '' : x <= 0 ? '<span class="pos">已穩</span>' : x > 100 ? '<span class="late">滿分也不夠</span>' : Math.ceil(x) + ' 分'; }

  function loadXLSX() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = function () { window.XLSX ? ok(window.XLSX) : no(new Error('Excel 工具載入失敗')); };
      s.onerror = function () { no(new Error('Excel 工具載入失敗（要連網）')); };
      document.head.appendChild(s);
    });
  }
  /* 讀老師選的學校 xls：每張工作表找「學號」「成績身份別」兩欄。檔案只在這台瀏覽器讀，送到試算表的只有 班級／座號／身份別代碼 */
  function readIdFile(f) {
    if (!f) return;
    setSt('讀取 ' + f.name + '…');
    loadXLSX().then(function (X) {
      return new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(X.read(new Uint8Array(r.result), { type: 'array' })); }; r.onerror = function () { no(new Error('讀不到檔案')); }; r.readAsArrayBuffer(f); });
    }).then(function (wb) {
      var map = {}, clash = 0, sheets = 0;
      wb.SheetNames.forEach(function (n) {
        var rows = window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' }), hi = -1, cs = -1, ci = -1;
        for (var i = 0; i < Math.min(rows.length, 10) && hi < 0; i++) { var r = rows[i].map(function (v) { return String(v).trim(); }); cs = r.indexOf('學號'); ci = r.indexOf('成績身份別'); if (cs >= 0 && ci >= 0) hi = i; }
        if (hi < 0) return;
        sheets++;
        rows.slice(hi + 1).forEach(function (r) {
          var sid = String(r[cs] || '').trim().toLowerCase(), m = /^\s*([AFTK])/i.exec(String(r[ci] || ''));
          if (!sid || !m) return;
          var c = m[1].toUpperCase();
          if (map[sid] && map[sid] !== c) clash++;
          map[sid] = c;
        });
      });
      if (!sheets) throw new Error('檔案裡找不到「學號」和「成績身份別」兩欄');
      var rows = [], by = {}, hit = {};
      D.students.filter(function (s) { return s.active !== 0; }).forEach(function (s) {
        var b = by[s.cls] = by[s.cls] || { A: 0, F: 0, T: 0, K: 0, miss: 0, chg: 0 }, c = map[String(s.sid).toLowerCase()];
        if (!c) { b.miss++; return; }
        hit[String(s.sid).toLowerCase()] = 1; b[c]++; if (s.idt && s.idt !== c) b.chg++;
        rows.push({ cls: s.cls, seat: s.seat, idt: c });
      });
      S.idPrev = { name: f.name, rows: rows, by: by, extra: Object.keys(map).filter(function (k) { return !hit[k]; }).length, clash: clash };
      setSt(''); render();
    }).catch(function (e) { setSt('⚠ ' + e.message, true); alert(e.message); });
  }
  function importIdt() {
    var p = S.idPrev; if (!p || !p.rows.length) return;
    if (!confirm('把 ' + p.rows.length + ' 人的成績身份別存到試算表？\n（只存身份別代碼，學生看不到）')) return;
    save('students', p.rows, '身份別已匯入').then(function () { S.idPrev = null; S.loaded = false; load(true); });
  }
  function idtSecHTML() {
    var h = '<div class="gr-sec"><h5>⑥ 成績身份別（及格線）</h5>' +
      '<p class="gr-muted">選學校的成績 xls（例如「1151_t0018_…全部分項.xls」）。用學號對名單，只存身份別代碼；姓名、成績不會上傳。學生、小老師、投影都看不到。</p>';
    var cnt = { A: 0, F: 0, T: 0, K: 0, '': 0 };
    D.students.filter(function (s) { return s.active !== 0; }).forEach(function (s) { cnt[s.idt || '']++; });
    h += '<div class="gr-row"><span>目前：' + ['A', 'F', 'T', 'K'].map(function (k) { return IDT[k].n + ' ' + cnt[k]; }).join('、') + (cnt[''] ? '　<span class="late">未設定 ' + cnt[''] + ' 人（先當一般生算）</span>' : '') + '</span></div>' +
      '<div class="gr-row"><input type="file" id="gr-idfile" accept=".xls,.xlsx"></div>';
    var p = S.idPrev;
    if (p) {
      h += '<table class="gr-t" style="max-width:640px"><thead><tr><th>班級</th><th>一般</th><th>原住民</th><th>技優</th><th>身障</th><th>名單對不到</th><th>和目前不同</th></tr></thead><tbody>' +
        Object.keys(p.by).map(function (c) { var b = p.by[c]; return '<tr><td>' + esc(c) + '</td><td>' + b.A + '</td><td>' + b.F + '</td><td>' + b.T + '</td><td>' + b.K + '</td><td' + (b.miss ? ' class="late"' : '') + '>' + b.miss + '</td><td>' + b.chg + '</td></tr>'; }).join('') + '</tbody></table>' +
        '<p class="gr-muted">' + esc(p.name) + (p.extra ? '｜檔案裡有 ' + p.extra + ' 個學號不在名單' : '') + (p.clash ? '｜<span class="late">' + p.clash + ' 個學號在不同工作表身份別不一致（以最後一張為準）</span>' : '') + '</p>' +
        '<div class="gr-row"><button class="gr-btn pri" data-g="idgo">存入 ' + p.rows.length + ' 人</button><button class="gr-btn" data-g="idx">取消</button></div>';
    }
    return h + '</div>';
  }

  /* ── 10/20 後台（老師專用）：學期總成績試算、及格／補考／死當、還沒考的段考要考幾分、個別學生走勢 ── */
  function svgPie(parts, size) {
    var tot = parts.reduce(function (s, p) { return s + p[1]; }, 0), r = size / 2, ri = r * 0.58, a0 = -Math.PI / 2, h = '';
    if (!tot) return '';
    parts.forEach(function (p) {
      if (!p[1]) return;
      var a1 = a0 + p[1] / tot * Math.PI * 2;
      if (p[1] === tot) { h += '<circle cx="' + r + '" cy="' + r + '" r="' + ((r + ri) / 2) + '" fill="none" stroke="' + p[2] + '" stroke-width="' + (r - ri) + '"/>'; a0 = a1; return; }
      var L = a1 - a0 > Math.PI ? 1 : 0, f = function (rr, a) { return (r + rr * Math.cos(a)).toFixed(2) + ' ' + (r + rr * Math.sin(a)).toFixed(2); };
      h += '<path d="M' + f(r, a0) + ' A' + r + ' ' + r + ' 0 ' + L + ' 1 ' + f(r, a1) + ' L' + f(ri, a1) + ' A' + ri + ' ' + ri + ' 0 ' + L + ' 0 ' + f(ri, a0) + 'Z" fill="' + p[2] + '"><title>' + esc(p[0]) + ' ' + p[1] + ' 人</title></path>';
      a0 = a1;
    });
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img">' + h +
      '<text x="' + r + '" y="' + (r + 6) + '" text-anchor="middle" font-size="18" font-weight="700" fill="currentColor">' + tot + ' 人</text></svg>';
  }
  /* 個別學生走勢：每份有分數的考卷（依期限／發下日排），本人分數 vs 全班平均 */
  function svgTrend(pts) {
    var W = 860, H = 260, l = 38, r = 64, t = 14, b = 58, n = pts.length;   /* 右邊留給斜放的最後一個標籤 */
    if (!n) return '<p class="gr-muted">這位同學還沒有分數。</p>';
    var mx = Math.max(100, Math.max.apply(null, pts.map(function (p) { return Math.max(p.me == null ? 0 : p.me, p.avg == null ? 0 : p.avg); })));
    var X = function (i) { return l + (n === 1 ? (W - l - r) / 2 : i * (W - l - r) / (n - 1)); }, Y = function (v) { return t + (1 - v / mx) * (H - t - b); };
    var h = '';
    [0, 20, 40, 60, 80, 100].forEach(function (v) { h += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="currentColor" stroke-opacity="' + (v === 60 ? .35 : .12) + '"' + (v === 60 ? ' stroke-dasharray="4 4"' : '') + '/>' +
      '<text x="' + (l - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end" font-size="11" fill="currentColor" fill-opacity=".6">' + v + '</text>'; });
    function line(key, col, dash) {
      var d = '', on = false;
      pts.forEach(function (p, i) { if (p[key] == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[key]).toFixed(1); on = true; });
      return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.4"' + (dash ? ' stroke-dasharray="6 4"' : '') + '/>';
    }
    h += line('avg', '#9a8f80', true) + line('me', '#2e5a7a');
    pts.forEach(function (p, i) {
      if (p.avg != null) h += '<circle cx="' + X(i) + '" cy="' + Y(p.avg) + '" r="3" fill="#9a8f80"><title>' + esc(p.lab) + '　全班平均 ' + r1(p.avg) + '</title></circle>';
      if (p.me != null) h += '<circle cx="' + X(i) + '" cy="' + Y(p.me) + '" r="4.5" fill="#2e5a7a"><title>' + esc(p.lab) + '　本人 ' + r1(p.me) + '</title></circle>';
      h += '<text transform="translate(' + X(i) + ',' + (H - b + 14) + ') rotate(35)" font-size="11" fill="currentColor" fill-opacity=".75">' + esc(p.lab.length > 9 ? p.lab.slice(0, 9) + '…' : p.lab) + '</text>';
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px;height:auto" role="img">' + h + '</svg>' +
      '<div class="gr-muted"><span style="color:#2e5a7a">●━ 本人</span>　<span>●┅ 全班平均</span>　虛線橫線＝60 分</div>';
  }
  /* 10/20 老師：假設鍵——打開後，該類還沒有分數的人先用假設分數算（已有分數的照實際）；只影響後台畫面，不存檔 */
  var ASSUME = { 態度: 80, 筆記: 95 };
  function assumeSm(cls, sm) {
    var on = Object.keys(ASSUME).filter(function (k) { return S.dAs[k] && sm[k] == null; });
    if (!on.length) return sm;
    var w = weights(cls), o = {}; Object.keys(sm).forEach(function (k) { o[k] = sm[k]; });
    o.assumed = {}; on.forEach(function (k) { o[k] = ASSUME[k]; o.assumed[k] = 1; });
    o.total = mix(CATS.map(function (k) { return [o[k], +w[k] || 0]; }));
    return o;
  }
  function dashRows(cls, td) {
    return roster(cls).map(function (s) {
      var sm = assumeSm(cls, summary(cls, s.seat, td)), j = judge(sm.total, s.idt), L = lineOf(s.idt);
      return { s: s, sm: sm, j: j || 'none', line: L, nPass: needFor(cls, sm, L - 0.5), nMk: L > FAIL_BELOW ? needFor(cls, sm, FAIL_BELOW - 0.5) : null };
    });
  }
  function dashHTML() {
    var cls = S.cls, td = today(), rows = dashRows(cls, td), w = weights(cls);
    if (!rows.length) return '<div class="gr-main"><div class="gr-pane"><p class="gr-muted">這班還沒有學生名單。</p></div></div>';
    var cnt = { pass: 0, makeup: 0, fail: 0, none: 0 }; rows.forEach(function (x) { cnt[x.j]++; });
    var noIdt = rows.filter(function (x) { return !x.s.idt; }).length;
    var asOn = Object.keys(ASSUME).filter(function (k) { return S.dAs[k]; });
    var h = '<div class="gr-main"><div class="gr-pane">';   /* 10/20 老師：拿掉「不要投影」提示列 */
    h += '<div class="gr-row" style="margin:0 0 10px"><span class="gr-muted">假設（還沒有分數的人先用這個分數算）：</span>' +
      Object.keys(ASSUME).map(function (k) { return '<button class="gr-chip' + (S.dAs[k] ? ' on' : '') + '" data-g="das|' + k + '">' + k + ' ' + ASSUME[k] + '</button>'; }).join('') + '</div>';
    h += '<div class="gr-dash-top"><div class="gr-sec gr-dash-pie"><h5>' + esc(cls) + '　目前學期成績' + (asOn.length ? '<span class="late" style="font-size:13px;font-weight:400">　（含假設：' + asOn.map(function (k) { return k + ASSUME[k]; }).join('、') + '）</span>' : '') + '</h5><div class="gr-row" style="align-items:center;gap:16px">' +
      svgPie(['pass', 'makeup', 'fail', 'none'].map(function (k) { return [JUDGE[k][0], cnt[k], JUDGE[k][1]]; }), 150) +
      '<div>' + ['pass', 'makeup', 'fail', 'none'].map(function (k) { return '<button class="gr-chip' + (S.dashFil === k ? ' on' : '') + '" data-g="dfil|' + (S.dashFil === k ? '' : k) + '" style="display:block;margin:4px 0"><span style="color:' + JUDGE[k][1] + '">■</span> ' + JUDGE[k][0] + ' ' + cnt[k] + ' 人</button>'; }).join('') + '</div></div>' +
      '<p class="gr-muted">依目前已有的成績與配分換算（還沒考的段考、沒有分數的項目先不算）。總分四捨五入後比及格線。</p></div>' +
      '<div class="gr-sec" style="flex:1;min-width:260px"><h5>配分（' + esc(cls) + '）</h5><div class="gr-row">' + CATS.map(function (k) { return '<span>' + k + ' <b>' + esc(w[k]) + '</b></span>'; }).join('　') + '</div>' +
      (w.tentative ? '<p class="late">這班配分還沒設定，現在用暫定值，請到「⚙ 設定 → ③ 配分」設定。</p>' : '') +
      (noIdt ? '<p class="late">' + noIdt + ' 人還沒有身份別，先當一般生（60 分）算。到「⚙ 設定 → ⑥」匯入學校 xls。</p>' : '') +
      '<p class="gr-muted">及格線：一般 60、技優 50、原住民 40、身障 60。39 以下死當；補考＝40～及格線−1。</p></div></div>';
    var list = rows.filter(function (x) { return !S.dashFil || x.j === S.dashFil; });
    /* 10/20 老師：身份、成績欄（各類平均、總分、要考幾分）預設遮住，點格子才顯示；狀態（及格／補考／死當）直接顯示；可一鍵全部顯示／隱藏（與投影頁的遮罩各自獨立） */
    var M = function (k, seat, html) { var key = seat + '|' + k, shown = dShown(key);
      return '<td class="gr-mask' + (shown ? '' : ' m') + '" data-g="drev|' + key + '">' + html + '</td>'; };
    h += '<div class="gr-sec"><h5>學生一覽' + (S.dashFil ? '（只看' + JUDGE[S.dashFil][0] + '）' : '') + '<span class="gr-muted" style="font-weight:400">　點座號／姓名看成績走勢，點成績格子才顯示</span>' +
      '<button class="gr-btn" data-g="drevall" style="margin-left:10px;font-weight:400">' + (S.dRevAll ? '🙈 全部隱藏' : '👁 全部顯示') + '</button></h5>' +
      '<div style="overflow:auto"><table class="gr-t gr-dash-t"><thead><tr><th>座號</th><th>姓名</th><th>身份</th>' + CATS.map(function (k) { return '<th>' + k + '</th>'; }).join('') +
      '<th>目前總分</th><th>狀態</th><th>剩下段考要考<br>才及格</th><th>才能補考</th></tr></thead><tbody>';
    list.forEach(function (x) {
      var s = x.s, on = S.dashSeat === s.seat, J = JUDGE[x.j];
      var kNote = s.idt === 'K' && (x.j === 'makeup' || x.j === 'fail') ? ' <span title="身障生：可考慮放過關">💬</span>' : '';
      h += '<tr class="gr-dash-r' + (on ? ' on' : '') + '" data-g="dseat|' + (on ? 0 : s.seat) + '"><td><b>' + s.seat + '</b></td><td class="nm">' + esc(s.name) + '</td>' +
        M('idt', s.seat, s.idt ? '<span>' + IDT[s.idt].s + '</span>' + kNote : '<span class="gr-muted">—</span>') +   /* 💬 會透露身障，放身份格一起遮 */
        CATS.map(function (k) { var pe = x.sm[k] == null && /^[一二三]段$/.test(k) ? essPending(cls, k, s.seat) : null;   /* 10/20 老師：作文還沒登先看選擇題大概（不算進總分） */
          return M(k, s.seat, x.sm.assumed && x.sm.assumed[k] ? '<span class="gr-muted" title="假設分數，還沒登">（假設）<br>' + r1(x.sm[k]) + '</span>' : x.sm[k] != null ? '<span>' + r1(x.sm[k]) + '</span>' : pe != null ? '<span class="gr-muted" title="作文還沒登，不算進總分">選擇 ' + r1(pe) + '／' + EXAM_MAX.raw + '<br>作文待登</span>' : '<span class="gr-muted">—</span>'); }).join('') +
        M('total', s.seat, '<b>' + (x.sm.total == null ? '—' : r1(x.sm.total)) + '</b>') + '<td><span class="gr-tag" style="background:' + J[1] + '">' + J[0] + '</span></td>' +
        M('np', s.seat, '<span>' + needTxt(x.nPass) + '</span>') + M('nm', s.seat, '<span>' + (x.line > FAIL_BELOW ? needTxt(x.nMk) : '<span class="gr-muted">無補考</span>') + '</span>') + '</tr>';
      if (on) h += '<tr class="gr-dash-x"><td colspan="' + (CATS.length + 7) + '">' + trendHTML(cls, s, td) + '</td></tr>';
    });
    h += '</tbody></table></div><p class="gr-muted">段考格「選擇 xx／76 作文待登」＝作文還沒登，這次段考先不算進總分。「剩下段考要考」＝還沒考（或作文還沒登）的段考每一次都考這個分數，其他項目維持現在的平均。💬＝身障生不及格，可考慮放過關。</p></div>';
    return h + '</div></div>';
  }
  /* 10/20 老師：「全部顯示」不含身份別；身份只能一格一格點開（要確認） */
  function dShown(key) { return key in S.dRev ? !!S.dRev[key] : (S.dRevAll && !/\|idt$/.test(key)); }   /* 單格點過＝照單格；沒點過＝跟全部顯示 */
  /* 段考已登選擇、作文還沒登：回傳選擇分數（同類有好幾份取最後一份），沒有就 null */
  function essPending(cls, type, seat) {
    var v = null;
    itemsOf(cls).filter(function (it) { return it.type === type; }).forEach(function (it) { var c = scoreOf(it.id, seat); if (c && c.raw != null && c.ess == null && v == null) v = c.raw; });
    return v;
  }
  function trendHTML(cls, s, td) {
    var its = itemsOf(cls).filter(function (it) { return it.type !== '態度'; }).slice().sort(function (a, b) { var x = a.due || a.issued || '', y = b.due || b.issued || ''; return x < y ? -1 : x > y ? 1 : 0; });
    var pts = [];
    its.forEach(function (it) {
      var fins = []; roster(cls).forEach(function (o) { var f = finalOf(it, scoreOf(it.id, o.seat), td); if (f != null) fins.push(f); });
      if (!fins.length) return;
      pts.push({ lab: itemLabel0(it), me: finalOf(it, scoreOf(it.id, s.seat), td), avg: avg(fins) });
    });
    return '<div style="padding:6px 4px"><b>' + s.seat + ' 號 ' + esc(s.name) + '</b>　各次成績（' + pts.length + ' 份）' + svgTrend(pts) + '</div>';
  }

  /* ── 語音登分（10/24 老師）：說「5號14分」→ 先列進暫存清單、大字顯示給老師核對；按「全部寫入」才走 patchScore 存（修改紀錄、更新時間照記）。
     用瀏覽器的 SpeechRecognition（Chrome／Edge／iPad Safari，zh-TW，要連網路）。「四／十」「一／七」可能聽錯，所以聽到的不直接存。 */
  var VO = { rec: null, on: false, want: false };
  var CN_D = { '零': 0, '〇': 0, '一': 1, '壹': 1, '二': 2, '兩': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  function cnNum(s) {   /* 「二十三」→23、「十四」→14、「一百」→100、沒有十百的逐字念：「三五」→35 */
    var i, n = 0, cur = 0, seen = false;
    if (!/[十百]/.test(s)) { var t = ''; for (i = 0; i < s.length; i++) { if (!(s[i] in CN_D)) return null; t += CN_D[s[i]]; } return t ? +t : null; }
    for (i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch in CN_D) { cur = CN_D[ch]; seen = true; }
      else if (ch === '十' || ch === '百') { n += (seen ? cur : 1) * (ch === '十' ? 10 : 100); cur = 0; seen = false; }
      else return null;
    }
    return n + cur;
  }
  function voNorm(txt) {
    var s = String(txt || '').replace(/[０-９]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 0xFEE0); }).replace(/\s+/g, '').replace(/号/g, '號');
    s = s.replace(/[零〇一壹二兩两三四五六七八九十百]+/g, function (m) { var n = cnNum(m); return n == null ? m : String(n); });
    return s.replace(/(\d)[點点．](\d)/g, '$1.$2');
  }
  /* 回傳 [{seat, v}]；一定要有「號」才算（只聽到兩個數字不猜） */
  function voParse(txt) {
    var s = voNorm(txt), out = [], re = /(\d+)號(\d+(?:\.\d+)?)分?/g, m;
    while ((m = re.exec(s))) out.push({ seat: +m[1], v: +m[2] });
    return out;
  }
  function voFdName(it, fd) { return isExam(it) ? (fd === 'ess' ? '作文' : '選擇') : '分數'; }
  function voMax(it, fd) { return isExam(it) ? EXAM_MAX[fd] : 100; }   /* 手打可到 200（commitRaw）；語音只收 100 以內，「5號14 6號8」連成 146 這種會被擋下 */
  function voOpen(id) {
    if (S.vo && S.vo.item === id) return;
    S.vo = { item: id, fd: 'raw', list: [], last: null, heard: '' };
    render();
  }
  function voClose() { voStop(); S.vo = null; }
  function voAdd(seat, v) {
    var it = itemById(S.vo.item), fd = S.vo.fd, mx = voMax(it, fd);
    var s = roster(it.cls).filter(function (x) { return x.seat === seat; })[0];
    if (!s) { S.vo.last = { ok: false, msg: seat + ' 號不在 ' + it.cls + ' 名單裡，沒有記' }; return; }
    if (!(v >= 0 && v <= mx)) { S.vo.last = { ok: false, msg: seat + ' 號 ' + esc(s.name) + '：' + v + ' 分超過' + voFdName(it, fd) + '滿分 ' + mx + '，沒有記' }; return; }
    var c = scoreOf(it.id, seat), old = c ? c[fd] : null;
    var dup = S.vo.list.filter(function (x) { return x.seat === seat; })[0];
    S.vo.list = S.vo.list.filter(function (x) { return x.seat !== seat; });
    S.vo.list.push({ seat: seat, name: s.name, v: v, old: old });
    S.vo.last = { ok: true, seat: seat, name: s.name, v: v, old: old, dup: dup ? dup.v : null };
  }
  function voHeard(txt) {
    if (!S.vo) return;
    S.vo.heard = txt;
    var ps = voParse(txt);
    if (ps.length) ps.forEach(function (p) { voAdd(p.seat, p.v); });
    else if (/更正|取消|上一筆|刪掉|刪除/.test(txt)) voUndo();
    else S.vo.last = { ok: false, msg: '沒有聽出「幾號幾分」' };
    voPaint();
  }
  function voUndo() {
    if (!S.vo) return;
    var x = S.vo.list.pop();
    S.vo.last = x ? { ok: false, undo: 1, msg: '已取消：' + x.seat + ' 號 ' + esc(x.name) + ' ' + x.v + ' 分' } : { ok: false, msg: '清單是空的，沒有可以取消的' };
    voPaint();
  }
  function voSave() {
    var it = itemById(S.vo.item), fd = S.vo.fd, L = S.vo.list.slice();
    if (!it || !L.length) return;
    var ow = L.filter(function (x) { return x.old != null && x.old !== x.v; });
    if (ow.length && !confirm('有 ' + ow.length + ' 位原本已經有' + voFdName(it, fd) + '分數，會被覆蓋：\n' +
      ow.map(function (x) { return x.seat + ' 號 ' + x.name + '：' + x.old + ' → ' + x.v; }).join('\n') + '\n\n確定全部寫入？')) return;
    var sd = (document.getElementById('gr-subdate') || {}).value || today();
    voStop();
    L.forEach(function (x) {   /* 同 commitRaw：有分數沒繳交日就補繳交日 */
      var c = scoreOf(it.id, x.seat); if (c && c[fd] === x.v) return;
      var p = {}; p[fd] = x.v; if (!(c && c.sub)) p.sub = sd;
      patchScore(it.id, x.seat, p);
    });
    S.vo.list = []; S.vo.last = { ok: true, saved: L.length };
    voPaint();
  }
  function voStart() {
    var R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { alert('這個瀏覽器不支援語音辨識，請改用 Chrome、Edge 或 iPad 的 Safari。'); return; }
    if (!VO.rec) {
      var r = VO.rec = new R();
      r.lang = 'zh-TW'; r.continuous = true; r.interimResults = true;
      r.onresult = function (e) {
        var fin = '', mid = '';
        for (var i = e.resultIndex; i < e.results.length; i++) { var t = e.results[i][0].transcript; if (e.results[i].isFinal) fin += t; else mid += t; }
        var mel = document.getElementById('gr-vo-mid'); if (mel) mel.textContent = mid ? '聽到：' + mid : '';
        if (fin) voHeard(fin);
      };
      r.onerror = function (e) {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { VO.want = false; alert('沒有麥克風權限：請在網址列左邊允許這個網頁使用麥克風。'); }
        else if (e.error === 'network') { VO.want = false; alert('語音辨識要連網路，目前連不上。'); }
        voPaint();
      };
      r.onend = function () { VO.on = false; if (VO.want && S.vo) { try { r.start(); VO.on = true; } catch (x) {} } voPaint(); };   /* 停頓太久瀏覽器會自己停，還在聽就重開 */
    }
    VO.want = true;
    try { VO.rec.start(); VO.on = true; } catch (x) {}
    voPaint();
  }
  function voStop() { VO.want = false; if (VO.rec && VO.on) { try { VO.rec.stop(); } catch (x) {} } VO.on = false; }
  function voHTML(it) {
    var q = S.vo, fds = isExam(it) ? ['raw', 'ess'] : ['raw'], L = q.list, x = q.last;
    var h = '<div class="gr-vo" id="gr-vo"><div class="gr-row">' +
      fds.map(function (f) { return '<button class="gr-chip' + (q.fd === f ? ' on' : '') + '" data-g="vofd|' + f + '">' + voFdName(it, f) + '（' + voMax(it, f) + '）</button>'; }).join('') +
      '<button class="gr-btn ' + (VO.on ? 'warn' : 'pri') + '" data-g="vogo">' + (VO.on ? '⏹ 停止聽' : '🎤 開始聽') + '</button>' +
      '<span class="gr-muted">說「5號14分」，可以連著說；說「更正」取消上一筆</span>' +
      '<span class="gr-sp" style="flex:1"></span><button class="gr-btn" data-g="vox">關閉語音</button></div>';
    var big = '';
    if (!x) big = '<span class="gr-muted">' + (VO.on ? '請開始說…' : '按「🎤 開始聽」') + '</span>';
    else if (x.saved) big = '<span class="pos">✓ 已寫入 ' + x.saved + ' 筆</span>';
    else if (x.ok) big = '<b>' + x.seat + '</b> 號 ' + esc(x.name) + '　<b>' + x.v + '</b> 分' +
      (x.dup != null ? '<small>（剛才念 ' + x.dup + '，改成這個）</small>' : '') + (x.old != null && x.old !== x.v ? '<small class="late">（原本 ' + x.old + '，寫入時會覆蓋）</small>' : '');
    else big = '<span class="' + (x.undo ? 'gr-muted' : 'late') + '">' + x.msg + '</span>';
    h += '<div class="gr-vo-big' + (x && !x.ok && !x.undo ? ' err' : '') + '">' + big + '</div>' +
      '<div class="gr-vo-mid" id="gr-vo-mid"></div>' + (q.heard ? '<div class="gr-muted">最後聽到的原文：' + esc(q.heard) + '</div>' : '');
    if (L.length) {
      h += '<table class="gr-t gr-vo-t"><thead><tr><th>座號</th><th>姓名</th><th>' + voFdName(it, q.fd) + '</th><th>原本</th><th></th></tr></thead><tbody>' +
        L.slice().reverse().map(function (y, i) { return '<tr' + (i === 0 ? ' class="gr-vo-new"' : '') + '><td>' + y.seat + '</td><td>' + esc(y.name) + '</td><td><b>' + y.v + '</b></td><td>' +
          (y.old == null ? '' : (y.old !== y.v ? '<span class="late">' + y.old + '</span>' : y.old)) + '</td><td><button class="gr-x" data-g="vodel|' + y.seat + '" title="刪掉這筆">✕</button></td></tr>'; }).join('') +
        '</tbody></table>';
    }
    h += '<div class="gr-row"><button class="gr-btn" data-g="voundo"' + (L.length ? '' : ' disabled') + '>↶ 上一筆取消</button>' +
      '<button class="gr-btn" data-g="voclr"' + (L.length ? '' : ' disabled') + '>清空</button><span class="gr-sp" style="flex:1"></span>' +
      '<button class="gr-btn pri" data-g="vosave"' + (L.length ? '' : ' disabled') + '>全部寫入（' + L.length + ' 筆）</button></div>';
    return h + '</div>';
  }
  function voPaint() {
    var el = document.getElementById('gr-vo'), it = S.vo && itemById(S.vo.item);
    if (!el || !it) return;
    var t = document.createElement('div'); t.innerHTML = voHTML(it); el.parentNode.replaceChild(t.firstChild, el);
  }

  /* ── 事件 ── */
  function onClick(e) {
    var m = document.getElementById('v106-gr');
    if (e.target === m) { close(); return; }
    var b = e.target.closest && e.target.closest('[data-g]'); if (!b) return;
    if (b.tagName === 'SELECT' || b.tagName === 'INPUT' && b.type !== 'checkbox') return;
    var a = b.getAttribute('data-g').split('|'), t = a[0], v = a.slice(1).join('|');
    if (S.vo && /^(item|new|imp|cls|tab|edit|mg|calclean|scls)$/.test(t) && !(t === 'item' && v === S.vo.item)) {   /* 語音登分：離開這份考卷 */
      if (S.vo.list.length && !confirm('語音登分還有 ' + S.vo.list.length + ' 筆沒寫入，離開就會丟掉，確定？')) return;
      voClose();
    }
    if (/^(item|new|imp|cls|tab|edit)$/.test(t)) S.mg = null;   /* V154：離開合併畫面 */
    if (t === 'x') close();
    else if (t === 'tab') { S.tab = v; put(K.tab, v); render(); }
    else if (t === 'cls') { S.cls = v; put(K.cls, v); S.setCls = v; S.preview = null; S.item = ''; S.edit = null; S.imp = null; S.undo = []; render(); }   /* V158：上方班級也帶動「設定班級」（老師 10/22：配分只設得到冷一忠） */
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
    else if (t === 'vo') { if (S.vo && S.vo.item === v) { if (S.vo.list.length && !confirm('語音登分還有 ' + S.vo.list.length + ' 筆沒寫入，關掉就會丟掉，確定？')) return; voClose(); render(); } else voOpen(v); }
    else if (t === 'vox') { if (S.vo.list.length && !confirm('語音登分還有 ' + S.vo.list.length + ' 筆沒寫入，關掉就會丟掉，確定？')) return; voClose(); render(); }
    else if (t === 'vogo') { if (VO.on) { voStop(); voPaint(); } else voStart(); }
    else if (t === 'vofd') { if (S.vo.fd === v) return; if (S.vo.list.length) { alert('暫存清單裡是「' + voFdName(itemById(S.vo.item), S.vo.fd) + '」的分數，請先寫入或清空，再換欄位。'); return; } S.vo.fd = v; S.vo.last = null; voPaint(); }
    else if (t === 'voundo') voUndo();
    else if (t === 'vodel') { S.vo.list = S.vo.list.filter(function (x) { return x.seat !== +v; }); voPaint(); }
    else if (t === 'voclr') { if (confirm('清空暫存的 ' + S.vo.list.length + ' 筆？')) { S.vo.list = []; S.vo.last = null; voPaint(); } }
    else if (t === 'vosave') voSave();
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
    else if (t === 'scls') { S.setCls = v; S.preview = null; S.cls = v; put(K.cls, v); S.item = ''; S.edit = null; S.imp = null; S.undo = []; render(); }   /* V158：兩排班級按鈕同步 */
    else if (t === 'pprev') { S.paste = (document.getElementById('gr-paste') || {}).value || ''; S.preview = parsePaste(S.paste); render(); }
    else if (t === 'pgo') importRoster();
    else if (t === 'wsave') saveWeights(false);
    else if (t === 'wsaveall') saveWeights(true);
    else if (t === 'csv') exportClass(v);
    else if (t === 'csvpts') exportPoints();
    else if (t === 'urlsave') saveUrl();
    else if (t === 'urlclear') { if (confirm('清除本裝置的網址？（回到' + (GS_URL ? '網頁內建網址' : '示範模式') + '）')) { put(K.url, null); S.loaded = false; S.admin = false; load(true); } }
    else if (t === 'idgo') importIdt();
    else if (t === 'idx') { S.idPrev = null; render(); }
    else if (t === 'dseat') { S.dashSeat = +v || 0; render(); }
    else if (t === 'drev') {   /* 10/20 老師：要打開身份格先跳窗確認（個資） */
      if (/\|idt$/.test(v) && !dShown(v) && !confirm('身份別是個資（含身心障礙、原住民等）。\n確定要顯示 ' + v.split('|')[0] + ' 號的身份？\n（請確認畫面沒有在投影）')) return;
      S.dRev[v] = !dShown(v); b.classList.toggle('m', !dShown(v));
    }
    else if (t === 'calclean') calClean();
    else if (t === 'mg') mgOpen();
    else if (t === 'mgx') { S.mg = null; render(); }
    else if (t === 'mgon') { S.mg.on[v] = b.checked; render(); }
    else if (t === 'mgdu') { S.mg.du[a[1]] = a[2]; render(); }
    else if (t === 'mgch') { S.mg.ch[a[1] + '|' + a[2]] = a[3]; render(); }
    else if (t === 'mggo') mgRun();
    else if (t === 'das') { S.dAs[v] = !S.dAs[v]; render(); }
    else if (t === 'drevall') { S.dRevAll = !S.dRevAll; S.dRev = {}; render(); }   /* 10/20：不含身份別，不必確認 */
    else if (t === 'dfil') { S.dashFil = v; render(); }
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
    if (id === 'gr-idfile') { readIdFile(e.target.files && e.target.files[0]); return; }
    if (!g) return;
    var a = g.split('|'), t = a[0];
    if (t === 'itype') { S.imp.type[a[1]] = e.target.value; render(); return; }
    var item = a[1], seat = +a[2];
    if (t === 'raw' || t === 'ess') commitRaw(e.target);
    else if (t === 'sub') patchScore(item, seat, { sub: e.target.value });
    else if (t === 'leave') { var lo0 = leaveOf(scoreOf(item, seat)); patchScore(item, seat, { leave: e.target.value ? ((lo0.k === '考' || lo0.k === '交') ? lo0.k + ':' : '') + e.target.value : '' }); }   /* v110：改日期時保留請假種類 */
    else if (t === 'bonus') patchScore(item, seat, { bonus: +e.target.value || 0 });
  }
  function commitRaw(inp) {
    var a = inp.getAttribute('data-g').split('|'), fd = a[0], item = a[1], seat = +a[2], v = inp.value.trim();
    var n = v === '' ? null : num(v), mx = isExam(itemById(item)) ? EXAM_MAX[fd] : 200;
    if (v !== '' && (n == null || n < 0 || n > mx)) { alert((fd === 'ess' ? '作文' : isExam(itemById(item)) ? '選擇' : '分數') + '請輸入 0～' + mx + ' 的數字'); inp.value = ''; return false; }
    var c = scoreOf(item, seat);
    if ((c ? c[fd] : null) === n) return true;
    var p = {}; p[fd] = n; if (n != null && !(c && c.sub)) p.sub = (document.getElementById('gr-subdate') || {}).value || today();
    patchScore(item, seat, p);
    return true;
  }
  function onInput(e) { if (e.target.id === 'gr-paste') S.paste = e.target.value; }
  function onKey(e) {
    if (e.key === 'Escape') { if (S.hist) { S.hist = null; render(); } else close(); e.stopPropagation(); return; }
    var g = e.target.getAttribute && e.target.getAttribute('data-g');
    if (e.key === 'Enter' && g && (g.indexOf('raw|') === 0 || g.indexOf('ess|') === 0)) {
      e.preventDefault();
      var a = g.split('|'), st = roster(S.cls), i = st.map(function (s) { return s.seat; }).indexOf(+a[2]);
      if (commitRaw(e.target) && st[i + 1]) { var nx = document.querySelector('#v106-gr [data-g="' + a[0] + '|' + a[1] + '|' + st[i + 1].seat + '"]'); if (nx) { nx.focus(); nx.select(); } }
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
    nextLesson: nextLesson, schoolDaysBetween: schoolDaysBetween, parsePaste: parsePaste, isDemo: isDemo, addFromCal: addFromCal,
    voParse: voParse, voHeard: voHeard };   /* voHeard：測試時模擬「聽到」一句話 */

  /* V215（老師 11/6）浮動加分盤（185）用：不開成績大視窗，邊投影邊加減分。紀錄格式、復原堆疊與「⭐ 課堂加減分」頁共用 */
  function qpAdd(cls, seat, delta, reason) {
    var p = { id: uid('p'), ts: new Date().toISOString(), date: today(), period: curPeriod(cls), cls: cls, seat: seat,
      delta: delta > 0 ? 1 : -1, reason: delta > 0 ? '' : (reason || '其他') };
    D.points.push(p); S.undo.push(p.id); qpPing();
    return save('points', [p], (p.delta > 0 ? '+1 ' : '−1 ') + cls + ' ' + seat + '號').then(function () { return p; }, function (e) {
      D.points = D.points.filter(function (x) { return x.id !== p.id; }); S.undo = S.undo.filter(function (x) { return x !== p.id; }); qpPing(); throw e; });
  }
  window.V106GR.qp = {
    ready: function () { return S.loaded; }, loading: function () { return S.loading; }, err: function () { return S.loadErr; },
    canWrite: function () { return S.admin || isDemo(); },
    load: function (force) { load(!!force); }, open: open, today: today, classes: classes, reasons: REASONS.slice(),
    cls: function () { return S.cls; }, curCls: function () { try { var c = window.V82 && V82.currentSlot && V82.currentSlot(); return c && c.cls || ''; } catch (e) { return ''; } },
    roster: function (cls) { return roster(cls).map(function (s) { return s.seat; }); },
    layout: function (cls) { var L = seatOf(cls, roster(cls)); return { rows: L.rows, cols: L.cols, grid: L.grid.map(function (r) { return r.slice(); }) }; },
    totals: function (cls) { var td = today(), t = {}; D.points.forEach(function (p) { if (p.cls === cls && p.date === td) t[p.seat] = (t[p.seat] || 0) + p.delta; }); return t; },
    add: qpAdd, undo: function () { var r = undoPoint(); return r && r.then ? r.then(function (p) { qpPing(); return p; }) : Promise.resolve(null); },
    canUndo: function () { return S.undo.length > 0; }
  };
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
    var id = esc(r.id || rid(r)), d = localDate(r.createdAt), pub = r.pub !== false, t13 = r.kind === 't13';   /* V211：十三經小考 */
    var h = '<div class="rec' + (pub ? '' : ' hid') + (t13 ? ' t13' : '') + '"><div class="rh"><b>' + (d ? md(d) + '（' + wdOf(d) + '）' : '') + '　〈' + esc(String(r.lesson).split('—')[0]) + '〉</b>' +
      '<span>' + (t13 ? '十三經小考' : '註' + esc(r.rangeStart) + '～註' + esc(r.rangeEnd)) + '・' + r.questions.length + ' 題</span>' + (r.classes || []).map(tag).join(' ') +
      '<label class="pub"><input type="checkbox" data-pub="' + id + '"' + (pub ? ' checked' : '') + '>給學生看</label></div>';
    h += corrHTML(r);
    if (t13) return h + '<ul class="qs">' + r.questions.slice().sort(function (a, b) { return (+a.ord || 0) - (+b.ord || 0); }).map(function (q) {
      return '<li><span class="n">第 ' + esc(q.ord || '') + ' 格</span><span class="w">《' + esc(q.w) + '》</span><span class="a">答案不分順序</span></li>';
    }).join('') + '<li><span class="a">訂正：十三經全抄</span></li></ul></div>';
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
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐', 7: '樂府詩選—長干行', 8: '茫茫人海中的一名女孩', 9: '桃花源記', 10: '極短篇小說選' };   /* 同 v98 */
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
    var today = (Array.isArray(cal) ? cal : []).filter(function (e) { return e && e.date === t && (e.item === '註釋小考' || e.item === '十三經小考') && (e.lessons || []).indexOf(n) >= 0; })
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
  var QK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐', 7: '樂府詩選—長干行', 8: '茫茫人海中的一名女孩', 9: '桃花源記', 10: '極短篇小說選' };
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
  /* 老師 10/16 改：火車線 → 作文說明 → 論語 → 珍奶。四班順序相同（日期由課表推算，已對過老師的表）；
     冷一忠多一節（10/21 三 7 調課，要在調課裡設定），最後一項是彈性節。q＝第幾次小考 */
  var ZN = '珍珠奶茶';
  var ITEMS_1016 = [['公佈成績＋劃卡＋劉克襄＋自然書寫＋題解'],
    ['火車線課文 1', 0, HC], ['火車線課文 2（注釋小考）', 1, HC], ['火車線習題＋習作檢討'], ['火車線 A卷'], ['火車線 A卷檢討'],
    ['作文說明'], ['儒家＆孔子'], ['論語補充講義＋題解（小考）', 2],
    ['論語課文 1', 0, LY], ['論語課文 2', 0, LY], ['論語課文 3', 0, LY], ['論語課文 4（注釋小考）', 3, LY],
    ['論語習題＋習作檢討'], ['論語 A卷'], ['論語 A卷檢討'],
    ['珍珠奶茶', 0, ZN], ['珍奶習作檢討＋A卷'], ['珍奶 A卷檢討']];
  TEMPLATES.unshift(
    { name: '10/16 版（建一忠、建一孝、冷一孝）', start: '2026-10-19', until: '2026-11-23', items: ITEMS_1016 },
    { name: '10/16 版（冷一忠，多一節彈性）', start: '2026-10-19', until: '2026-11-23', items: ITEMS_1016.concat([['彈性節／段考總複習']]) });
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
      if (a[0] === 'c') { ed.c = a[1]; ed.msg = ''; renderEd(); return; }
      if (a[0] === 'tpl') { applyTpl(+a[1]); return; }
      if (a[0] === 'copy') { copyFrom(a[1]); return; }
      if (a[0] === 'pal' && !x) x = p.cls[ed.c] = { start: '', until: '', items: [], log: {} };
      if (!x) return;
      if (a[0] === 'split') lessonsIn(x.items).forEach(function (k) { autoSplit(x.items, k); });
      else if (a[0] === 'up' && i > 0) x.items.splice(i - 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'dn' && i < x.items.length - 1) x.items.splice(i + 1, 0, x.items.splice(i, 1)[0]);
      else if (a[0] === 'ins') x.items.splice(i, 0, { id: uid(), t: '（新項目）' });
      else if (a[0] === 'add') x.items.push({ id: uid(), t: '（新項目）' });
      else if (a[0] === 'del') { if (!confirm('刪除「' + x.items[i].t + '」？後面的項目會往前補。')) return; x.items.splice(i, 1); }
      else if (a[0] === 'pl') { ed.pl = a[1]; renderEd(); return; }
      else if (a[0] === 'pal') { palAdd(x, a[1]); }
      else if (a[0] === 'cv') { convert(p, x, i, a[2]); return; }
      else if (a[0] === 'uncv') { unconvert(p, x, i, a[2]); return; }
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
    /* V135：按住「⠿」上下拖曳排順序（滑鼠、觸控筆、手指都可以） */
    var dr = null;
    function rowAt(ev) { var el = document.elementFromPoint(ev.clientX, ev.clientY); return el && el.closest ? el.closest('#v114-ed .v114-it') : null; }
    m.addEventListener('pointerdown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.v114-grip'); if (!g) return;
      var row = g.closest('.v114-it'); if (!row) return;
      ev.preventDefault(); dr = { from: +row.getAttribute('data-i'), to: +row.getAttribute('data-i'), row: row };
      row.classList.add('drag');
    });
    window.addEventListener('pointermove', function (ev) {
      if (!dr) return; ev.preventDefault();
      var r = rowAt(ev); m.querySelectorAll('.v114-it.drop').forEach(function (x) { x.classList.remove('drop'); });
      if (r && r !== dr.row) { r.classList.add('drop'); dr.to = +r.getAttribute('data-i'); } else if (r === dr.row) dr.to = dr.from;
    }, { passive: false });
    function endDrag() {
      if (!dr) return; var d = dr; dr = null;
      if (d.to === d.from || isNaN(d.to)) { renderEd(); return; }
      var p = load(), x = plan(p, ed.c); if (!x) return;
      x.items.splice(d.to, 0, x.items.splice(d.from, 1)[0]);
      save(p); renderEd(); refresh();
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', function () { dr = null; renderEd(); });
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
        h += '<div class="v114-it' + (done ? ' done' : '') + '" data-i="' + i + '"><span class="v114-grip" title="按住拖曳排順序">⠿' + (i + 1) + '</span><span class="v114-when">' + when + '</span>' +
          '<span class="v114-tc"><input type="text" data-pf="t|' + i + '" value="' + esc(it.t) + '">' + rangeSel(x.items, i) + cvChips(it, i, ds) + '</span>' +
          '<select data-pf="q|' + i + '"><option value="">—</option>' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (it.q === n ? ' selected' : '') + '>小考' + n + '</option>'; }).join('') + '</select>' +
          '<span class="v114-ops"><button type="button" data-pe="up|' + i + '" title="上移">↑</button><button type="button" data-pe="dn|' + i + '" title="下移">↓</button>' +
          '<button type="button" data-pe="ins|' + i + '" title="在這項前面插入">＋插入</button><button type="button" data-pe="del|' + i + '" title="刪除" class="v114-del">✕</button></span></div>';
      });
    }
    h += palHTML();
    h += '<button type="button" class="v114-add" data-pe="add">＋ 新增一項（自己打字）</button>';
    h += '<div class="v114-help">一項＝一節課。日期由課表自動推算：放假、段考、調課、標記「沒上完／多上一項／沒上課」都會讓後面的項目自動順延或提前。灰色＝已經上過。<br>' +
      '按住「⠿」可以上下拖曳排順序。「→ A卷」這類按鈕＝在那天那班的考試日曆加一筆，並直接建好成績項目；轉過之後如果進度順延，日曆日期不會跟著動，要自己改。</div></div>';
    box.innerHTML = h;
    if (ed.msg) { var mb = box.querySelector('.v114-msg'); if (mb) mb.textContent = ed.msg; }
  }

  /* ── V135：常用項目按鈕（先選課，再點項目，加到最後面；之後用「⠿」拖到想要的位置） ── */
  var PL = [['極短篇', '極短篇小說選'], ['桃花源', '桃花源記'], ['茫茫人海', '茫茫人海中的一名女孩'], ['長干行', '樂府詩選—長干行'], ['火車線', HC], ['論語', LY], ['珍奶', '珍珠奶茶'], ['師說', '師說'], ['世說', '世說新語選'], ['魚販', '身為魚販'], ['不指定', '']];
  var PAL = [['txt', '課文'], ['sup', '補充講義＋題解'], ['hw', '習題＋習作檢討'], ['a', 'A卷'], ['ar', 'A卷檢討'],
    ['g|作文說明', '作文說明'], ['g|作文檢討', '作文檢討'], ['g|公佈成績＋劃卡', '公佈成績＋劃卡'], ['g|段考總複習', '段考總複習'], ['g|彈性節', '彈性節']];
  function plName(k) { var r = PL.filter(function (x) { return x[1] === k; })[0]; return r ? r[0] : ''; }
  function palHTML() {
    if (ed.pl == null) ed.pl = HC;
    return '<div class="v114-pal"><div class="v114-msg"></div><div><b>快速加一項</b>　課：' + PL.map(function (x) {
      return '<button type="button" data-pe="pl|' + esc(x[1]) + '"' + (ed.pl === x[1] ? ' class="on"' : '') + '>' + esc(x[0]) + '</button>';
    }).join('') + '</div><div>' + PAL.map(function (x) {
      var les = x[0].indexOf('g|') === 0 ? '' : plName(ed.pl);
      if (!les && x[0].indexOf('g|') !== 0) return '';
      return '<button type="button" class="v114-pi" data-pe="pal|' + esc(x[0]) + '">＋ ' + esc(les ? les + (x[0] === 'a' || x[0] === 'ar' ? ' ' : '') + x[1] : x[1]) + '</button>';
    }).join('') + '<label class="v114-q"><input type="checkbox" id="v114-palq"' + (window.__v114palq ? ' checked' : '') + ' onchange="window.__v114palq = this.checked"> 加的這節課前有小考</label></div></div>';
  }
  function palAdd(x, k) {
    var nm = plName(ed.pl), it = { id: uid() }, q = !!window.__v114palq;
    if (k.indexOf('g|') === 0) it.t = k.slice(2);
    else if (!nm) return;
    else if (k === 'txt') {
      var n = x.items.filter(function (o) { return o.t.indexOf(nm + '課文') === 0; }).length + 1;
      it.t = nm + '課文 ' + n; if (ed.pl && sentences(ed.pl).length) it.les = ed.pl;
    }
    else it.t = nm + { sup: '補充講義＋題解', hw: '習題＋習作檢討', a: ' A卷', ar: ' A卷檢討' }[k];
    if (q) { it.t += /小考/.test(it.t) ? '' : '（小考）'; it.q = x.items.filter(function (o) { return o.q; }).length + 1; }
    x.items.push(it);
    if (it.les) autoSplit(x.items, it.les);
    ed.msg = '已加到第 ' + x.items.length + ' 項：' + it.t + '（按住 ⠿ 可以拖到別的位置）';
  }

  /* ── V135：轉考試／作業（日曆＋成績項目） ── */
  var CV = { 'A卷': ['考試', '📝 A卷'], '註釋小考': ['考試', '✎ 注釋小考'], '習作': ['交作業', '📒 習作'], '課後習題': ['交作業', '📄 課本習題'], '其他': ['交作業', '其他作業'] };
  var LESNO = [[/魚販/, 1], [/世說/, 2], [/師說/, 3], [/珍奶|珍珠奶茶/, 4], [/火車線/, 5], [/論語|侍坐/, 6]];
  function lesNo(it) { var s = (it.les || '') + ' ' + it.t, r = LESNO.filter(function (x) { return x[0].test(s); })[0]; return r ? r[1] : 0; }
  function guess(it) {
    var t = it.t, o = [];
    if (/A卷/.test(t) && !/檢討/.test(t)) o.push('A卷');
    if (it.q || /小考/.test(t)) o.push('註釋小考');
    if (/習作/.test(t)) o.push('習作');
    if (/習題/.test(t)) o.push('課後習題');
    Object.keys(it.cal || {}).forEach(function (k) { if (o.indexOf(k) < 0) o.push(k); });
    return o;
  }
  function cvChips(it, i, ds) {
    var d = ds && ds.length ? ds[0].r.date : '', g = guess(it), cal = it.cal || {};
    var h = g.map(function (k) {
      return cal[k] ? '<button type="button" class="v114-cv ok" data-pe="uncv|' + i + '|' + k + '" title="已在 ' + md(d || '') + ' 的日曆；按一下可以撤銷日曆那筆">✓ ' + CV[k][1] + '</button>'
        : '<button type="button" class="v114-cv" data-pe="cv|' + i + '|' + k + '"' + (d ? '' : ' disabled') + ' title="' + (d ? md(d) + ' 加到日曆＋建成績項目' : '排不下，沒有日期') + '">→ ' + CV[k][1] + '</button>';
    }).join('');
    var more = Object.keys(CV).filter(function (k) { return g.indexOf(k) < 0; });
    if (d) h += '<select class="v114-cvs" onchange="if(this.value){var b=document.createElement(\'button\');b.setAttribute(\'data-pe\',\'cv|' + i + '|\'+this.value);this.parentNode.appendChild(b);b.click();}">' +
      '<option value="">→ 其他…</option>' + more.map(function (k) { return '<option value="' + k + '">' + CV[k][1] + '</option>'; }).join('') + '</select>';
    return '<span class="v114-cvw">' + h + '</span>';
  }
  function convert(p, x, i, k) {
    var it = x.items[i], P = placed(ed.c), r = P && P.rows.filter(function (r) { return r.its.indexOf(i) >= 0; })[0];
    if (!it || !CV[k] || !r || !window.V98CAL || !V98CAL.addEntries) return;
    if (it.cal && it.cal[k]) return;
    var n = lesNo(it), e = V98CAL.addEntries([{ date: r.date, cls: ed.c, kind: CV[k][0], item: k, lessons: n ? [n] : [], note: k === '其他' ? it.t : '' }])[0];
    it.cal = it.cal || {}; it.cal[k] = e.id;
    save(p);
    var head = md(r.date) + ' ' + ed.c + '・' + CV[k][1] + ' 已加到日曆';
    ed.msg = head + '；建立成績項目中…'; renderEd(); refresh();
    if (!window.V106GR || !V106GR.addFromCal) { ed.msg = head + '（成績系統沒有載入，之後到成績「從日曆匯入」）'; renderEd(); return; }
    V106GR.addFromCal([e]).then(function (res) {
      ed.msg = head + (res.ok ? (res.n ? '，成績項目也建好了 ✓' : '（這類不建成績項目）') : '。成績系統還沒登入，登入後到成績「📅 從日曆匯入」就會出現。');
      if (ed.open) renderEd();
    }).catch(function (err) { ed.msg = head + '。成績項目沒建成功（' + err.message + '），之後可到成績「從日曆匯入」。'; if (ed.open) renderEd(); });
  }
  function unconvert(p, x, i, k) {
    var it = x.items[i]; if (!it || !it.cal || !it.cal[k]) return;
    if (!confirm('撤銷「' + it.t + '」的' + CV[k][1] + '？\n會刪掉日曆上那一筆。成績項目如果已經建了，要到成績系統自己刪（裡面可能已經有分數）。')) return;
    if (window.V98CAL && V98CAL.removeEntries) V98CAL.removeEntries([it.cal[k]]);
    delete it.cal[k]; if (!Object.keys(it.cal).length) delete it.cal;
    save(p); ed.msg = '已撤銷日曆那一筆'; renderEd(); refresh();
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
  var ENABLED = ['論語選—子路曾皙冉有公西華侍坐', '珍珠奶茶', '臺灣最美麗的火車線', '樂府詩選—長干行', '茫茫人海中的一名女孩', '極短篇小說選'];  /* V128 加〈珍珠奶茶〉；V136 加〈火車線〉；V178 加第一冊 L7、L8、L10 */
  var B_TYPES = ['頂真', '映襯'];                 /* 跨句單詞型 */
  var C_TYPES = ['轉品', '借代'];                 /* 單字單詞型 */
  var GENERIC = ['回文', '頂真'];                 /* 說明只是基本概念 → 只顯示名稱 */
  var SKIP = 'sup,.tp-gd,.tp-pd,.tp-zd,.tp-ruby,.tm-par,.tm-layer,[aria-hidden="true"]';
  var OPEN = {};                                  /* 開關狀態：課名|頁|id */

  function on() { return typeof wkKey !== 'undefined' && ENABLED.indexOf(wkKey) >= 0; }
  function sk(id) { return wkKey + '|' + wkIdx + '|' + id; }
  var ALIAS_NOW = {};                             /* V178：合併組的跟隨項 id → 帶頭項 id（目前頁） */
  function isOpen(id) { return !!OPEN[sk(ALIAS_NOW[id] || id)]; }

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
          rc = charsById(slide, chars(slide), it.id);   /* V126：包過一段後文字節點已被切開，要重新取字元位置（同一修辭有兩個以上關鍵詞時原本會出錯） */
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
    /* V178：相鄰兩行同一修辭／句意（名稱、長版、短版都相同）→ 合併成一組：只留第一行的標籤、開關一起，句意括號從第一行括到最後一行（老師 10/28） */
    var alias = {}, lineOf = function (id) { var m = /^[rm](\d+)_/.exec(id || ''); return m ? +m[1] : -1; };
    [rh, mn].forEach(function (list) {
      list.forEach(function (it) {
        if (!it.ok) return;
        var prev = list.filter(function (o) { return o !== it && o.ok && lineOf(o.id) === lineOf(it.id) - 1 && o.name === it.name && o.exp === it.exp && o.short === it.short; })[0];
        if (!prev) return;
        it.lead = prev.lead || prev.id; alias[it.id] = it.lead; it.prevId = prev.id;
        if (list === mn) {
          var pr = slide.querySelector('.tm-pr[data-m="' + prev.id + '"]'), pl = slide.querySelector('.tm-pl[data-m="' + it.id + '"]');
          if (pr) pr.style.display = 'none'; if (pl) pl.style.display = 'none';
        }
      });
    });
    slide.__tm = { rh: rh, mn: mn, alias: alias };
    return slide.__tm;
  }

  /* ── 排版：狀態上色＋〔修〕〔句意〕框＋括號線＋浮動說明框 ── */
  function layout(container) {
    var slide = container && container.querySelector('.wk-slide');
    if (!slide) return;
    var old = slide.querySelector(':scope > .tm-layer'); if (old) old.remove();
    if (!on() || !slide.querySelector('.tp-line')) { slide.classList.remove('tm-on'); return; }
    var st = prepare(slide);
    ALIAS_NOW = st.alias || {};
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
    var topLim = Math.max(sy, rel(container.getBoundingClientRect()).t) + 2;   /* 說明框最高只能到這裡（課文頁／全螢幕區的上緣） */

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
      /* 引句只標重點字（rq-hi，如類疊的「一個」「女孩」）時，字元不連續：每一段連續的字各畫一個括號，
         不能從第一個重點字一路畫到最後一個（原本會把中間不相干的字也畫上紅線） */
      var runs = [];
      it.cs.forEach(function (c) { var k = cs.indexOf(c), R = runs[runs.length - 1]; if (R && k === R.k + 1) { R.cs.push(c); R.k = k; } else runs.push({ cs: [c], k: k }); });
      var op = isOpen(it.id), th = op ? Math.max(1.5, fsz * 0.07) : Math.max(1, fsz * 0.045), col = op ? it.col : 'var(--tm-faint)';
      var off = fsz * (0.12 + it.lv * 0.36), tick = fsz * 0.28;
      runs.forEach(function (R) {
        var lines = [];
        R.cs.forEach(function (c) { var r = rel(rectOf(c)); var L = lines[lines.length - 1]; if (L && Math.abs(L.t - r.t) < fsz * 0.5) { L.r = Math.max(L.r, r.r); L.b = Math.max(L.b, r.b); } else lines.push({ l: r.l, r: r.r, t: r.t, b: r.b }); });
        lines.forEach(function (L, i) {
          var y = L.b + off;
          add(layer, 'tm-line', { left: L.l, top: y, width: L.r - L.l, height: th, background: col });
          if (i === 0) add(layer, 'tm-line', { left: L.l, top: y - tick + th, width: th, height: tick, background: col });
          if (i === lines.length - 1) add(layer, 'tm-line', { left: L.r - th, top: y - tick + th, width: th, height: tick, background: col });
        });
      });
    });

    /* 〔修〕〔句意〕框 */
    var chipsUp = {}, chipsDn = {}, placed = [];
    function firstChar(id) { var x = charsById(slide, cs, id); return x[0]; }
    function lineStart(div) { var ln = div.closest('.tp-line'); var t = ln && ln.querySelector('.tp-text'); var c = t && chars(t.parentNode).filter(function (z) { return t.contains(z.n); })[0]; return c; }
    st.rh.forEach(function (it) {
      if (it.lead) return;   /* V178：合併組只在第一行放標籤 */
      var c = it.ok ? (it.type === 'A' ? firstChar(it.id) : (slide.querySelector('.tm-kw[data-r="' + it.id + '"]') ? chars(slide).filter(function (z) { return slide.querySelector('.tm-kw[data-r="' + it.id + '"]').contains(z.n); })[0] : firstChar(it.id))) : null;
      if (!c) { var d = slide.querySelector('.tp-box-r .tp-rhet[data-lid="' + it.id + '"]'); c = d && lineStart(d); }
      if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.t);
      var n = (chipsUp[key] = (chipsUp[key] || 0) + 1) - 1;
      it.chip = chip(layer, '修', it.id, 'r', r.l + n * fsz * 0.82, r.t, true, fsz, it.lv ? 'var(--tm-r2)' : 'var(--tm-r1)');
      it.anchor = r;
    });
    st.mn.forEach(function (it) {
      if (it.lead) return;   /* V178：合併組只在第一行放標籤 */
      var c = it.ok ? firstChar(it.id) : null; if (!c) return;
      var r = rel(rectOf(c)), key = Math.round(r.l) + ',' + Math.round(r.b);
      var n = (chipsDn[key] = (chipsDn[key] || 0) + 1) - 1;
      it.chip = chip(layer, '句意', it.id, 'm', r.l + n * fsz * 1.3, r.b, false, fsz, 'var(--tm-g)');
      /* V178：行距縮小後，上一行的〔句意〕可能壓到下一行的〔修〕→ 往右移到不重疊 */
      var cr = it.chip.getBoundingClientRect();
      st.rh.forEach(function (o) {
        if (!o.chip) return; var orc = o.chip.getBoundingClientRect();
        if (cr.right <= orc.left || orc.right <= cr.left || cr.bottom <= orc.top || orc.bottom <= cr.top) return;
        it.chip.style.left = (parseFloat(it.chip.style.left) + (orc.right - cr.left) / kx + 2) + 'px'; cr = it.chip.getBoundingClientRect();
      });
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
      /* V152：撞到別的說明框時，先試同一排往左右挪（貼著對方），放得下就不往上疊（老師 10/20：稻浪、稻香同時開，稻香跑到稻浪上面） */
      var hitOf = function (z) { return placed.filter(function (p) { return z.l < p.r && p.l < z.r && z.t < p.b && p.t < z.b; })[0]; };
      var q0 = hitOf(rc);
      if (q0) {
        var ok = [q0.r + 4, q0.l - 4 - w, TR - w].some(function (nx) {
          if (nx < TL - 0.5 || nx + w > TR + 0.5) return false;
          var z = { l: nx, r: nx + w, t: t, b: t + h };
          if (hitOf(z)) return false;
          rc = z; bx.style.left = nx + 'px'; bx.style.maxWidth = (w + 1) + 'px'; return true;   /* 寬度不變（放寬會重新排版變寬，又撞到別人） */
        });
        /* 挪不開（框太寬）→ 縮窄放進對方左邊或右邊的空位（至少 7 個字寬） */
        if (!ok) ok = [[TL, q0.l - 4], [q0.r + 4, TR]].some(function (R) {
          var rw = R[1] - R[0]; if (rw < 7 * fsz) return false;
          bx.style.maxWidth = rw + 'px'; bx.style.left = R[0] + 'px';
          var w2 = bx.offsetWidth, h2 = bx.offsetHeight;
          var nx = Math.max(R[0], Math.min(it.anchor.l, R[1] - w2));
          var t2 = up ? cr.t - h2 - fsz * 0.12 : t;
          var z = { l: nx, r: nx + w2, t: t2, b: t2 + h2 };
          if (hitOf(z)) return false;
          rc = z; h = h2; w = w2; bx.style.left = nx + 'px'; return true;
        });
        if (!ok) { bx.style.left = x + 'px'; bx.style.maxWidth = (TR - x) + 'px'; }   /* 都不行：恢復原寬，照舊往上疊 */
      }
      for (var g = 0; g < 14; g++) {
        var q = placed.filter(function (p) { return rc.l < p.r && p.l < rc.r && rc.t < p.b && p.t < rc.b; })[0];
        if (!q) break;
        var nt = up ? q.t - h - 4 : q.b + 4; rc = { l: x, r: x + w, t: nt, b: nt + h };
      }
      /* 第一行的修辭說明框往上放會超出課文頁上緣（全螢幕字放大時最明顯，如〈火車線〉末段「轉化（形象化）」）：
         先往左挪、放寬成一行試試；還是放不下就改放到該行底線下方 */
      if (up && rc.t < topLim) {
        bx.style.left = TL + 'px'; bx.style.maxWidth = (TR - TL) + 'px';
        var w3 = bx.offsetWidth, h3 = bx.offsetHeight, x3 = Math.max(TL, Math.min(it.anchor.l, TR - w3));
        var t3 = cr.t - h3 - fsz * 0.12, z3 = { l: x3, r: x3 + w3, t: t3, b: t3 + h3 };
        var hit3 = placed.some(function (p) { return z3.l < p.r && p.l < z3.r && z3.t < p.b && p.t < z3.b; });
        if (t3 < topLim || hit3) { t3 = it.anchor.b + fsz * (0.3 + (it.lv || 0) * 0.36); z3 = { l: x3, r: x3 + w3, t: t3, b: t3 + h3 }; }
        bx.style.left = x3 + 'px'; bx.style.maxWidth = (w3 + 1) + 'px'; rc = z3;
      }
      bx.style.top = rc.t + 'px'; placed.push(rc);
    }
    function body(it, rhet) {
      var full = isOpen(it.id + '#full'), txt = (it.short && !full) ? it.short : it.exp;
      var h = rhet ? '<b>' + it.name + '</b>' + (txt && (GENERIC.indexOf(it.name) < 0 || full) ? '（' + String(txt).replace(/[。]$/, '') + '）' : '') : txt;
      if (it.short && it.exp) h += '<span class="tm-more" data-full="' + it.id + '">' + (full ? '短' : '詳') + '</span>';
      return h;
    }
    /* V152：修辭說明框都往上放 → 從下面的句子先擺（同一行從右邊先擺），上面的句子讓位時才是往自己的上方讓，不會跳過別人的框 */
    openR.filter(function (it) { return it.chip; }).sort(function (a, b) {
      return Math.abs(a.anchor.t - b.anchor.t) > fsz * 0.5 ? b.anchor.t - a.anchor.t : b.anchor.l - a.anchor.l;
    }).forEach(function (it) { box(it, true, body(it, true), 'tm-box-r'); });
    openM.forEach(function (it) {
      if (!it.chip) return;
      var mc = charsById(slide, cs, it.id); it.lastB = 0;
      st.mn.forEach(function (o) { if (o.lead === it.id) mc = mc.concat(charsById(slide, cs, o.id)); });   /* V178：合併組的說明框放在整組最後一行下面 */
      mc.forEach(function (c) { it.lastB = Math.max(it.lastB, rel(rectOf(c)).b); });
      box(it, false, body(it, false), 'tm-box-m');
    });
    /* V178：段落下方的統整／說明框（.tp-sumbox）被說明框蓋到時，往下推到不重疊 */
    slide.querySelectorAll('.tp-body > .tp-sumbox').forEach(function (sb) {
      sb.style.removeProperty('margin-top');
      for (var g = 0; g < 6; g++) {   /* 推一次後再量，直到沒有重疊（說明框可能很長） */
        var r = sb.getBoundingClientRect(), need = 0;
        layer.querySelectorAll('.tm-box').forEach(function (b) {
          var q = b.getBoundingClientRect();
          if (q.bottom > r.top && q.top < r.bottom && q.right > r.left && q.left < r.right) need = Math.max(need, q.bottom - r.top + 8);
        });
        if (!need) break;
        sb.style.setProperty('margin-top', (parseFloat(getComputedStyle(sb).marginTop) + need) + 'px', 'important');   /* CSS 163 用了 !important，這裡也要 */
      }
    });
  }
  function add(layer, cls, s) {
    var d = document.createElement('div'); d.className = cls;
    d.style.left = s.left + 'px'; d.style.top = s.top + 'px'; d.style.width = s.width + 'px'; d.style.height = s.height + 'px'; d.style.background = s.background;
    layer.appendChild(d); return d;
  }
  function chip(layer, label, id, kind, x, y, up, fsz, col) {
    var c = document.createElement('span'); c.className = 'tm-chip tm-chip-' + kind + (isOpen(id) ? ' on' : ''); c.textContent = label;
    /* V178：標籤縮小（0.5→0.42）、〔修〕貼近文字（0.1→0.04）；〔句意〕仍留在底線下方 0.14 */
    c.style.fontSize = (fsz * 0.42) + 'px'; c.style.setProperty('--cc', col);
    c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.transform = up ? 'translateY(calc(-100% - ' + (fsz * 0.04) + 'px))' : 'translateY(' + (fsz * 0.14) + 'px)';
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
  /* V136：換到別頁（上一頁／下一頁／跳頁）時，句意、修辭全部收起恢復原樣（老師 10/18）；同一頁重畫（字級、視窗）不收 */
  var lastPage = null;
  function resetOnPageChange() {
    var cur = (typeof wkKey !== 'undefined' ? wkKey : '') + '|' + (typeof wkIdx !== 'undefined' ? wkIdx : '');
    if (lastPage !== null && cur !== lastPage) Object.keys(OPEN).forEach(function (k) { delete OPEN[k]; });
    lastPage = cur;
  }
  if (typeof wkRenderCurrent === 'function') {
    var _r = wkRenderCurrent;
    wkRenderCurrent = function () { resetOnPageChange(); var r = _r.apply(this, arguments); soon(); return r; };
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
   課本有寫的（唐文宗時十二經、南宋光宗時十三經）照課本；《孟子》入經時間各家不一，採課本說法。
   V192（老師 11/2）：六經順序照《莊子．天運》「詩、書、禮、樂、易、春秋」；書名依時代顯示（V184 一律寫《周易》《尚書》《詩經》是時代錯置），
   改名的那一步會先劃掉舊名、再換成新名並標「改名」。名稱出處整理在同一份資料整理 md 的「書名的演變」。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var AFTER = /《論語》詳表/;
  /* 每部經一個方塊；順序固定，方便看出「拆開／加入」。nm：[從第幾步起, 顯示名稱]（依時代改名） */
  var BOOKS = [
    { id: '詩', nm: [[0, '詩'], [2, '毛詩'], [5, '詩經']] },
    { id: '書', nm: [[0, '書'], [1, '尚書']] },
    { id: '禮' }, { id: '周禮' }, { id: '儀禮' }, { id: '禮記' },
    { id: '樂' },
    { id: '易', nm: [[0, '易'], [2, '周易']] },
    { id: '春秋' }, { id: '左傳' }, { id: '公羊傳' }, { id: '穀梁傳' },
    { id: '論語' }, { id: '孝經' }, { id: '爾雅' }, { id: '孟子' }
  ];
  function nameAt(b, i) { var n = b.id; (b.nm || []).forEach(function (x) { if (x[0] <= i) n = x[1]; }); return n; }
  /* show：該階段出現的書；add：本階段新加入（亮色）；gone：本階段消失（打叉後淡出）；split：拆開的來源；ren：本階段改名的書（說明） */
  var ALL13 = ['詩', '書', '周禮', '儀禮', '禮記', '易', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅', '孟子'];
  var STEPS = [
    { era: '先秦', name: '六經', show: ['詩', '書', '禮', '樂', '易', '春秋'],
      cap: '《莊子．天運》最早出現「六經」之名：「丘治《詩》、《書》、《禮》、《樂》、《易》、《春秋》六經。」',
      note: '先秦只稱《詩》（又稱「詩三百」）、《書》、《易》，還沒有「詩經」「尚書」這些名稱。' },
    { era: '西漢', name: '五經', show: ['詩', '書', '禮', '易', '春秋'], gone: ['樂'],
      ren: { '書': '《史記．儒林列傳》已稱《尚書》：「言尚書自濟南伏生。」' },
      cap: '《樂經》亡佚，只剩五經。漢武帝立「五經博士」（前 136 年），儒學成為官學；此時《禮》指《儀禮》。',
      note: '東漢另有「七經」的說法：五經＋《論語》《孝經》。' },
    { era: '唐代', name: '九經', show: ['詩', '書', '周禮', '儀禮', '禮記', '易', '左傳', '公羊傳', '穀梁傳'],
      split: { '禮': ['周禮', '儀禮', '禮記'], '春秋': ['左傳', '公羊傳', '穀梁傳'] },
      ren: { '詩': '唐代官定的《五經正義》書名是《毛詩》（漢代毛公所傳的《詩》）。', '易': '《五經正義》書名是《周易》。「周易」之名其實先秦就有（《左傳》《周禮》）。' },
      cap: '《禮》分成「三禮」：《周禮》《儀禮》《禮記》；《春秋》分成「三傳」：《左傳》《公羊傳》《穀梁傳》。',
      note: '詩＋書＋三禮＋易＋三傳＝1＋1＋3＋1＋3＝9' },
    { era: '唐文宗．開成石經', name: '十二經', show: ['詩', '書', '周禮', '儀禮', '禮記', '易', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅'],
      add: ['論語', '孝經', '爾雅'],
      cap: '開成年間在國子學刻石（開成石經），九經之外加上《論語》《孝經》《爾雅》。',
      note: '課本：《論語》「唐文宗時，列為十二經之一」。',
      info: ['爾雅', '中國最早解釋詞義的書（訓詁書），可以說是最早的「字典」。「爾」是近、「雅」是正，意思是接近雅正的語言。現存 19 篇，把字詞按類別解釋：釋詁、釋言、釋訓、釋親、釋宮、釋器、釋樂、釋天、釋地、釋丘、釋山、釋水、釋草、釋木、釋蟲、釋魚、釋鳥、釋獸、釋畜。本來只是字書，和儒家無關，後來才被列入經書。'] },
    { era: '南宋光宗', name: '十三經', show: ALL13,
      add: ['孟子'],
      cap: '《孟子》由「子」書升格為「經」，十二經加《孟子》，成為流傳至今的「十三經」。',
      note: '課本：「南宋光宗時，列為十三經之一」。明代欽定《十三經注疏》，十三經之名完全確立。' },
    { era: '宋以後至今', name: '今天的名稱', show: ALL13,
      ren: { '詩': '屈萬里認為《詩經》正式當書名，要到宋代（廖剛《詩經講義》）；也有學者依《史記》「申公獨以詩經為訓」，認為漢代就有。' },
      cap: '《詩》到宋代以後才通稱《詩經》，今天三部的通稱是《詩經》《尚書》《周易》。',
      note: '《尚書》宋代以後又稱《書經》；《周易》又稱《易經》。' }
  ];
  var SUMMARY = '六經 →（《樂》亡佚）五經 →（禮分三禮、春秋分三傳）九經 →（＋論語、孝經、爾雅）十二經 →（＋孟子）十三經';
  var RENAMES = '書名：《書》→《尚書》（漢）；《易》→《周易》、《詩》→《毛詩》（唐代官定書名）→《詩經》（宋以後）';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function slideHTML() {
    var tl = STEPS.map(function (s, i) {
      return '<button class="t13-dot" data-i="' + i + '" onclick="t13Go(this,' + i + ')"><b>' + esc(s.name) + '</b><span>' + esc(s.era) + '</span></button>';
    }).join('<span class="t13-arrow">→</span>');
    var books = BOOKS.map(function (b) {
      return '<span class="t13-b" data-id="' + esc(b.id) + '"><span class="t13-bn">' + esc(nameAt(b, 0)) + '</span></span>';
    }).join('');
    return '<div class="wk-slide wks-keyrhet v73-kr t13-slide">' +
      '<div class="wks-kr-head"><span class="wks-kr-name">十三經的演變</span><span class="wks-kr-sub">從六經到十三經〈論語選〉</span></div>' +
      '<div class="t13" data-st="0">' +
        '<div class="t13-tl">' + tl + '</div>' +
        '<div class="t13-head"><span class="t13-era"></span><span class="t13-name"></span><span class="t13-count"></span></div>' +
        '<div class="t13-stage">' + books + '</div>' +
        '<div class="t13-ren"></div><div class="t13-info"></div>' +
        '<div class="t13-cap"></div><div class="t13-note"></div>' +
        '<div class="t13-sum">' + esc(SUMMARY) + '<br>' + esc(RENAMES) + '</div>' +
        '<div class="v73-ctrl"><button class="v73-btn t13-next" onclick="t13Step(this)">▶ 下一步</button>' +
        '<button class="v73-btn rst" onclick="t13Reset(this)">↻ 重來</button></div>' +
      '</div></div>';
  }

  /* FLIP：先記下舊位置，改版面後從舊位置滑到新位置 */
  function rects(box) { var m = {}; box.querySelectorAll('.t13-b').forEach(function (b) { if (b.classList.contains('on')) m[b.dataset.id] = b.getBoundingClientRect(); }); return m; }
  function render(box, i, animate) {
    var S = STEPS[i], stage = box.querySelector('.t13-stage');
    var before = animate ? rects(box) : {};
    box.dataset.st = i;
    clearTimeout(box._renT);
    box.querySelectorAll('.t13-dot').forEach(function (d, j) { d.classList.toggle('cur', j === i); d.classList.toggle('done', j < i); });
    box.querySelector('.t13-era').textContent = S.era;
    box.querySelector('.t13-name').textContent = S.name;
    box.querySelector('.t13-count').textContent = '共 ' + S.show.length + ' 部';
    box.querySelector('.t13-cap').textContent = S.cap;
    var note = box.querySelector('.t13-note'); note.textContent = S.note || ''; note.style.display = S.note ? '' : 'none';
    /* 改名說明：《舊》→《新》＋出處 */
    var ren = box.querySelector('.t13-ren'), rk = S.ren ? Object.keys(S.ren) : [];
    ren.innerHTML = rk.map(function (id) {
      var b = BOOKS.filter(function (x) { return x.id === id; })[0];
      return '<div class="t13-ren-i"><b class="t13-ren-tag">改名</b><b>《' + esc(nameAt(b, i - 1)) + '》→《' + esc(nameAt(b, i)) + '》</b>' + esc(S.ren[id]) + '</div>';
    }).join('');
    ren.style.display = rk.length ? '' : 'none';
    var inf = box.querySelector('.t13-info');
    inf.innerHTML = S.info ? '<b class="t13-info-tag">《' + esc(S.info[0]) + '》是什麼書？</b>' + esc(S.info[1]) : '';
    inf.style.display = S.info ? '' : 'none';
    box.querySelector('.t13-sum').classList.toggle('show', i === STEPS.length - 1);
    var nx = box.querySelector('.t13-next'); nx.disabled = i === STEPS.length - 1; nx.textContent = i === STEPS.length - 1 ? '✓ 完成' : '▶ 下一步';
    var splitFrom = {};
    if (animate && S.split) Object.keys(S.split).forEach(function (src) { S.split[src].forEach(function (c) { splitFrom[c] = src; }); });
    stage.querySelectorAll('.t13-b').forEach(function (b) {
      var id = b.dataset.id, on = S.show.indexOf(id) >= 0, bk = BOOKS.filter(function (x) { return x.id === id; })[0];
      var gone = animate && S.gone && S.gone.indexOf(id) >= 0, isRen = rk.indexOf(id) >= 0;
      b.classList.remove('add', 'split', 'gone', 'ren', 'ren-old');
      b.style.transition = 'none'; b.style.transform = ''; b.style.opacity = '';
      var bn = b.querySelector('.t13-bn');
      if (isRen && animate) { bn.textContent = nameAt(bk, i - 1); b.classList.add('ren-old'); }   /* 先顯示舊名劃掉，稍後換新名 */
      else { bn.textContent = nameAt(bk, i); if (isRen) b.classList.add('ren'); }
      if (gone) { b.classList.add('on', 'gone'); return; }   /* 先留在原位打叉，再淡出 */
      b.classList.toggle('on', on);
      if (on && S.add && S.add.indexOf(id) >= 0) b.classList.add('add');
      if (on && S.split && splitFrom[id] !== undefined) b.classList.add('split');
      if (on && !animate && S.split && Object.keys(S.split).some(function (k) { return S.split[k].indexOf(id) >= 0; })) b.classList.add('split');
    });
    if (animate && rk.length) box._renT = setTimeout(function () {
      rk.forEach(function (id) {
        var b = stage.querySelector('.t13-b[data-id="' + id + '"]'), bk = BOOKS.filter(function (x) { return x.id === id; })[0];
        b.classList.remove('ren-old'); b.querySelector('.t13-bn').textContent = nameAt(bk, i); b.classList.add('ren');
      });
    }, 1300);
    if (!animate) return;
    void stage.offsetWidth;
    stage.querySelectorAll('.t13-b.on').forEach(function (b) {
      var id = b.dataset.id, a = before[id] || (splitFrom[id] && before[splitFrom[id]]), r = b.getBoundingClientRect();
      if (b.classList.contains('gone')) {
        setTimeout(function () { b.style.transition = 'opacity .6s, transform .6s'; b.style.opacity = '0'; b.style.transform = 'scale(.6)'; }, 900);
        setTimeout(function () { if (+box.dataset.st !== i) return; b.classList.remove('on', 'gone'); b.style.transition = 'none'; b.style.opacity = ''; b.style.transform = ''; }, 1600);
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
   - 清單：今天以後的調課；同一次調課的兩節一起刪。
   V175（10/28 老師：停課要顯示在日曆，像光復節那樣整天劃掉）：offOn(日期) 給日曆（108_v101-js）。
   V174 停課／颱風假（2026-10-28，老師）：
   - 「調課」區塊裡加「⛔ 停課／颱風假」：選日期（可到某天，連放多天）、整天或第幾節到第幾節、原因。
   - 這段時間裡有課的每一節寫成 { cls: '', at, off: id, reason }（同樣 cls 空白＝不上課），教學進度自動順延；同一次停課一起刪。
   - 碰到已有調課的節次：先問，再把那筆調課整筆取消（兩節都恢復課表）後停課。 */
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
  function whoAt(ds, p, all) { var o = (all || ovr())[ds + '|' + p]; return o ? (o.cls || '') : schedCls(ds, p); }   /* all：V174 用還沒存的調課資料算 */
  function label(key) { var a = key.split('|'), d = parse(a[0]); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）第' + a[1] + '節'; }

  var F = { fd: '', fp: '', td: '', tp: '', cls: '', open: false,
    od: '', od2: '', op1: '', op2: '', why: '颱風假', note: '' };   /* V174 停課 */

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
  /* V174 停課：日期範圍 × 節次範圍內「有課」的節 */
  function offKeys(all) {
    var d1 = F.od, d2 = F.od2 || F.od, ps = sched().periods.map(function (P) { return P.p; });
    var p1 = +F.op1 || ps[0], p2 = +F.op2 || ps[ps.length - 1], out = [];
    if (d2 < d1) return null;
    for (var d = parse(d1), n = 0; ymd(d) <= d2 && n < 31; d.setDate(d.getDate() + 1), n++) {
      var ds = ymd(d);
      ps.forEach(function (p) { if (p >= p1 && p <= p2 && whoAt(ds, p, all)) out.push(ds + '|' + p); });
    }
    return out;
  }
  function addOff() {
    if (!F.od) { alert('請選停課的日期。'); return; }
    if (F.op1 && F.op2 && +F.op2 < +F.op1) { alert('節次範圍前後顛倒了。'); return; }
    var keys = offKeys();
    if (!keys) { alert('「到」的日期比開始日期早。'); return; }
    if (!keys.length) { alert('這段時間本來就沒有課，不用停課。'); return; }
    var why = F.why === '其他' ? (F.note.trim() || '停課') : F.why;
    var o = ovr(), hit = keys.filter(function (k) { return o[k]; });
    var msg = why + '：以下 ' + keys.length + ' 節改成不上課\n' + keys.map(function (k) { return label(k) + '　' + whoAt(k.split('|')[0], +k.split('|')[1]); }).join('\n');
    if (hit.length) msg += '\n\n其中 ' + hit.length + ' 節原本有調課設定，會整筆取消（調課的兩節都恢復課表）再停課。';
    if (!confirm(msg + '\n\n確定？')) return;
    hit.forEach(function (k) { if (o[k] && o[k].swap) dropSwap(o, o[k]); else delete o[k]; });
    var id = 'o' + Date.now().toString(36), at = new Date().toISOString();
    keys = offKeys(o);   /* 取消調課後重算（被調走的課回到原節，若也在範圍內一起停） */
    keys.forEach(function (k) { o[k] = { cls: '', at: at, off: id, reason: why }; });
    if (!put(OV, o)) return;
    F.od = F.od2 = F.op1 = F.op2 = F.note = ''; F.why = '颱風假';
    refresh();
  }
  function del(key) {
    var o = ovr(), x = o[key]; if (!x) return;
    var keys = x.swap ? Object.keys(o).filter(function (k) { return o[k] && o[k].swap === x.swap; })
      : x.off ? Object.keys(o).filter(function (k) { return o[k] && o[k].off === x.off; }).sort() : [key];
    if (!confirm((x.off ? '刪除這筆' + (x.reason || '停課') + '？' : '刪除這筆調課？') + '\n' + keys.map(function (k) { return label(k) + '：' + (o[k].cls || '不上課'); }).join('\n') + '\n\n（刪除後恢復原本課表）')) return;
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
      } else if (x.off) {   /* V174：同一次停課合成一列 */
        if (seen[x.off]) return; seen[x.off] = 1;
        var ks = Object.keys(o).filter(function (q) { return o[q] && o[q].off === x.off; }).sort(), days = {};
        ks.forEach(function (q) { var a = q.split('|'); (days[a[0]] = days[a[0]] || []).push(+a[1]); });
        var txt = Object.keys(days).sort().map(function (ds) {
          var d = parse(ds), ps = days[ds].sort(function (a, b) { return a - b; });
          return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）第' + ps.join('、') + '節';
        }).join('；');
        rows.push('<li class="v174-off"><b>⛔ ' + esc(x.reason || '停課') + '</b>　' + esc(txt) + '<small>（' + ks.length + ' 節不上課）</small>' +
          '<button type="button" data-v122-del="' + esc(k) + '" title="刪除">✕</button></li>');
      } else {
        rows.push('<li>' + esc(label(k)) + '：' + (x.cls ? '改為 <b>' + esc(x.cls) + '</b>' : '不上課') + '<small>（當節「本節改為」）</small>' +
          '<button type="button" data-v122-del="' + esc(k) + '" title="刪除">✕</button></li>');
      }
    });
    return rows.length ? '<ul class="v122-list">' + rows.join('') + '</ul>' : '<div class="v82-sub">目前沒有之後的調課或停課。</div>';
  }
  function offHTML() {   /* V174 停課／颱風假表單 */
    var keys = F.od ? offKeys() : null, hint = '';
    if (F.od) hint = keys == null ? '日期前後顛倒' : keys.length ? '共 ' + keys.length + ' 節有課會停' : '這段時間沒有課';
    return '<div class="v174-off-form"><div class="v122-lb2">⛔ 停課／颱風假</div>' +
      '<div class="v82-row"><span class="v122-lb">日期</span><input type="date" data-v122="od" value="' + esc(F.od) + '">' +
      '<span class="v122-who">到</span><input type="date" data-v122="od2" value="' + esc(F.od2) + '" title="只停一天就不用填">' +
      '<span class="v122-who">（停一天不用填）</span></div>' +
      '<div class="v82-row"><span class="v122-lb">節次</span><select data-v122="op1">' + periodOpts(F.op1).replace('>節<', '>從第一節<') + '</select>' +
      '<span class="v122-who">到</span><select data-v122="op2">' + periodOpts(F.op2).replace('>節<', '>到最後一節<') + '</select>' +
      '<span class="v122-who">（都不選＝整天）</span></div>' +
      '<div class="v82-row"><span class="v122-lb">原因</span><select data-v122="why">' +
      ['颱風假', '停課', '其他'].map(function (w) { return '<option' + (F.why === w ? ' selected' : '') + '>' + w + '</option>'; }).join('') + '</select>' +
      (F.why === '其他' ? '<input type="text" data-v122="note" value="' + esc(F.note) + '" placeholder="例：校慶補假" style="width:9em">' : '') +
      '<button type="button" class="v122-ok v174-ok" data-v122="addoff">加入停課</button>' +
      '<span class="v122-who">' + esc(hint) + '</span></div>' +
      '<div class="v82-sub">這段時間有課的每一節都改成「不上課」，教學進度會自動往後順延。下午才宣布停課：節次選「第5節」到「最後一節」。</div></div>';
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
        offHTML() +
        '<div class="v122-lb2">之後的調課／停課</div>' + listHTML() + '</div>';
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
    else if (a === 'addoff') addOff();
  }
  function onChange(e) {
    var a = e.target.getAttribute('data-v122'); if (!a) return;
    F[a] = e.target.value;
    if (a !== 'note') render();   /* 打字中不重畫，免得游標跑掉 */
  }

  /* V175 日曆用：這天有停課就像國定假日一樣整天劃掉、只寫原因（老師 10/28：不用寫節次，像光復節那樣）。
     c 用 'off' 只影響日曆外觀；教學進度看的是 V101.eventsOn，不含這裡，所以只停下午仍只扣那幾節。 */
  function offOn(ds) {
    var o = ovr(), seen = {};
    return sched().periods.map(function (P) { var x = o[ds + '|' + P.p]; return x && x.off ? (x.reason || '停課') : ''; })
      .filter(function (r) { return r && !seen[r] && (seen[r] = 1); })
      .map(function (r) { return { t: r, c: 'off' }; });
  }
  window.V122SWAP = { whoAt: whoAt, render: render, offOn: offOn };
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
     - 只在本機已從雲端拉過資料（或沒登入同步）時寫入，避免舊資料蓋掉別台（同 v108／v109）
   V126（2026-10-08，老師：日曆 0:00 就打勾是錯的，要看課表；下課時跳出今日待辦讓老師勾）：
     - 日曆自動打勾只剩「A卷考試」，而且要等該班當天最後一節下課（課表＋調課 tp_override_v1；當天沒課的班＝當天最後一節有課的下課）；
       「檢討」不再自動打勾，改由下課詢問；日曆項目標了「還沒」（e.miss）的不打。
     - 下課詢問：每 30 秒＋回到分頁時檢查；某班下課後跳出「今天日曆上這班的待辦」→ ✅完成（e.done＋重要進度檢核格，來源 '_a:…'＝'ask:'+id）
       ／還沒（e.miss＝今天，不再問）／稍後再問（10 分鐘）；一次問一班。問過記 v126_ask_v1、本裝置關閉記 v126_ask_off（兩個都不在同步清單）。
     - 🎓 班級網站加「📤 推送檢核」：依重要進度檢核「檢討」格，有勾的習作／課本後習題／A卷才推；⚠＝舊版 0:00 自動勾的（'_a:' 來源 cal:）。 */
(function () {
  'use strict';
  var HW = 'hw_done_v1', CAL = 'exam_cal_v1';
  var WD = ['日', '一', '二', '三', '四', '五', '六'];
  var LK = { 1: '身為魚販', 2: '世說新語選', 3: '師說', 4: '珍珠奶茶', 5: '臺灣最美麗的火車線', 6: '論語選—子路曾皙冉有公西華侍坐', 7: '樂府詩選—長干行', 8: '茫茫人海中的一名女孩', 9: '桃花源記', 10: '極短篇小說選' };   /* 同 v99 */
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
  /* V126：當天實際上課節次（課表＋調課；調課 cls 空白＝不上課，同 138_plan／144_swap） */
  function toMin(t) { var a = String(t).split(':'); return (+a[0]) * 60 + (+a[1]); }
  function ovr() { var o = get('tp_override_v1', {}); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; }
  function periodsOf(ds) {
    var S = sched(), O = ovr(), wd = parse(ds).getDay();
    return S.periods.map(function (P) {
      var o = O[ds + '|' + P.p], sl = S.slots.filter(function (x) { return x[0] === wd && x[1] === P.p; })[0];
      return { p: P.p, end: P.end, cls: o ? (o.cls || '') : (sl ? sl[2] || '' : '') };
    }).filter(function (x) { return x.cls; });
  }
  /* 該班當天最後一節的下課時間（分鐘）；當天沒這班的課 → 當天最後一節有課的下課；整天沒課 → 最後一節 */
  function classEnd(ds, c) {
    var ps = periodsOf(ds), mine = ps.filter(function (x) { return x.cls === c; }), use = mine.length ? mine : ps;
    if (!use.length) { var P = sched().periods; return P.length ? toMin(P[P.length - 1].end) : 24 * 60; }
    return Math.max.apply(null, use.map(function (x) { return toMin(x.end); }));
  }
  function ended(ds, c) { var n = now(), t = ymd(n); return ds < t || (ds === t && n.getHours() * 60 + n.getMinutes() >= classEnd(ds, c)); }
  function fromCal(hw) {
    var ch = false, a = get(CAL, []);
    (Array.isArray(a) ? a : []).forEach(function (e) {
      if (!e || !e.date || e.miss || classes().indexOf(e.cls) < 0 || !e.lessons || !e.lessons.length) return;
      if (!(e.kind === '考試' && e.item === 'A卷')) return;   /* V126：檢討不再自動打勾（下課詢問老師） */
      if (!ended(e.date, e.cls)) return;                      /* V126：等該班當天最後一節下課 */
      e.lessons.forEach(function (n) { if (LK[n] && mark(hw, LK[n], e.cls, 'A卷|考試', e.date, 'cal:' + e.id)) ch = true; });
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

  /* ════════ V126 下課詢問 ════════ */
  var ASK = 'v126_ask_v1', ASK_OFF = 'v126_ask_off', snooze = {}, askCls = '';
  function askOff() { return get(ASK_OFF, '') === '1'; }
  function asked() { var o = get(ASK, {}); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; }
  function calList() { var a = get(CAL, []); return Array.isArray(a) ? a : []; }
  function isDoneE(e, hw) { try { if (window.V99LINK) return V99LINK.isDone(e, hw); } catch (x) {} return !!e.done; }
  function pending(c) {
    var t = ymd(now()), A = asked(), hw = get(HW, {});
    return calList().filter(function (e) { return e && e.id && e.cls === c && e.date === t && !e.miss && !A[e.id] && !isDoneE(e, hw); });
  }
  function eLabel(e) {
    var ls = (e.lessons || []).map(function (n) { return 'L' + n; }).join('、');
    return String(e.item).replace('課後習題', '課本後習題') + (e.kind === '考試' && !/檢討$/.test(e.item) && e.item !== '註釋小考' && e.item !== '十三經小考' ? '（考試）' : e.kind === '交作業' ? '（交作業）' : '') + (ls ? ' ' + ls : '') + (e.note ? '・' + e.note : '');
  }
  function markAsked(id) { var A = asked(); A[id] = ymd(now()); var keep = {}, lim = ymd(new Date(now().getTime() - 30 * 864e5)); Object.keys(A).forEach(function (k) { if (A[k] >= lim) keep[k] = A[k]; }); put(ASK, keep); }
  function answer(id, ok) {
    if (!safe()) { alert('雲端同步還沒拉完資料，請稍等幾秒再按（避免舊資料蓋掉別台）。'); return; }
    var a = calList(), e = a.filter(function (x) { return x && x.id === id; })[0];
    if (e) {
      if (ok) {
        e.done = e.date; delete e.miss;
        var linked = false; try { linked = !!(window.V99LINK && V99LINK.linked(e)); } catch (x) {}
        if (linked) {
          var hw = get(HW, {}); if (!hw || typeof hw !== 'object') hw = {};
          var key = /^(A卷|習作|課後習題)檢討$/.test(e.item) ? e.item.replace(/檢討$/, '') + '|檢討' : e.item + '|考試';   /* 同 V99 hwKey */
          e.lessons.forEach(function (n) { if (!LK[n]) return; var r = ((hw[LK[n]] = hw[LK[n]] || {})[e.cls] = hw[LK[n]][e.cls] || {}); if (!r[key]) r[key] = e.date; r['_a:' + key] = 'ask:' + e.id; });
          put(HW, hw);
        }
      } else e.miss = ymd(now());
      put(CAL, a);
    }
    markAsked(id);
    try { if (window.V84HW) V84HW.render(); } catch (x) {}
    try { var P = $('cls-panel'); if (P && P.classList.contains('open') && typeof clsRender === 'function') clsRender(); } catch (x) {}
    renderAsk();
  }
  function closeAsk() { askCls = ''; var b = $('v126-ask'); if (b) b.remove(); }
  function renderAsk() {
    var list = askCls ? pending(askCls) : [];
    if (!list.length) { closeAsk(); setTimeout(checkAsk, 300); return; }   /* 這班問完 → 看下一班 */
    var box = $('v126-ask');
    if (!box) {
      box = document.createElement('div'); box.id = 'v126-ask';
      box.addEventListener('click', function (ev) {
        var b = ev.target.closest('button[data-v126]'); if (!b) return;
        var x = b.getAttribute('data-v126').split('|');
        if (x[0] === 'ok' || x[0] === 'no') answer(x[1], x[0] === 'ok');
        else if (x[0] === 'later') { snooze[askCls] = Date.now() + 600000; closeAsk(); setTimeout(checkAsk, 300); }
      });
      box.addEventListener('keydown', function (ev) { ev.stopPropagation(); });
      document.body.appendChild(box);
    }
    box.innerHTML = '<div class="v126-card"><div class="v126-h">🔔 ' + esc(askCls) + ' 下課了</div>' +
      '<div class="v126-sub">今天日曆上這班的待辦，做完了嗎？</div><ul>' + list.map(function (e) {
        return '<li><span class="v126-t">' + esc(eLabel(e)) + '</span><span class="v126-b"><button type="button" class="v126-ok" data-v126="ok|' + esc(e.id) + '">✅ 完成</button>' +
          '<button type="button" data-v126="no|' + esc(e.id) + '">還沒</button></span></li>';
      }).join('') + '</ul><div class="v126-f"><button type="button" data-v126="later">稍後再問（10 分鐘）</button>' +
      '<span class="v126-mut">「還沒」的不會再問；本裝置不想被問可到 班級進度 → ⚙ 本裝置設定 關閉</span></div></div>';
  }
  function checkAsk() {
    if (askCls || askOff() || !safe() || document.hidden) return;
    var t = ymd(now()), cs = classes();
    for (var i = 0; i < cs.length; i++) {
      var c = cs[i];
      if (snooze[c] && Date.now() < snooze[c]) continue;
      if (!ended(t, c)) continue;
      if (pending(c).length) { askCls = c; renderAsk(); return; }
    }
  }

  /* ════════ 版面 ════════ */
  var sheet = '', devOpen = false, schedEdit = false;
  var TOOLS = [
    ['cal', '📅', '日曆', '考試・作業'], ['gr', '📒', '成績', '登記・加減分'], ['nq', '📝', '小考紀錄', '訂正・給學生看'],
    ['hw', '✅', '重要進度檢核', '交作業・檢討'], ['sched', '🔁', '課表／調課', '預先調課'], ['plan', '📘', '教學進度', '老師專用'],
    ['stu', '🎓', '班級網站', '新版・學生版・小老師頁']];
  var SHEETS = { hw: '✅ 重要進度檢核', sched: '🔁 課表／調課', plan: '📘 教學進度', stu: '🎓 班級網站／小老師頁', sync: '☁ 同步／備份' };

  /* 10/7：學生班級網站（stu115）的密碼——老師輸入一次，存在 stu_pw_v1（雲端同步，學生端 stuGet 讀不到），
     每台登入同步的老師裝置自動寫進解鎖頁「記住密碼」用的 stu_pw_<網址代碼>（同網域），點連結就直接打開。 */
  var STU_BASE = 'https://rayo0113.github.io/stu115/';
  var STU_SLUG = { '建一忠': 'c-ywkbbb', '建一孝': 'c-pnn3hs', '冷一忠': 'c-efexia', '冷一孝': 'c-g2jy3u' };   /* 同 scripts/stu_releases.json */
  var TUTOR_URL = 'https://rayo0113.github.io/RayOclass/t';
  var NEW_STU_URL = 'https://rayo0113.github.io/stu115/app/';   /* V153：新版班級網頁「我要當學霸」（四班同一網址，學校帳號登入；老師帳號可選學生預覽） */
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
    box.innerHTML = '<div class="v123-card"><b>📱 新版班級網頁（我要當學霸）</b><div class="v123-mut">四個班同一個網址，學生用學校帳號登入；您用學校帳號開，可以選一位學生預覽他看到的畫面。</div>' +
      '<a class="v123-pri v123-link" href="' + NEW_STU_URL + '" target="_blank" rel="noopener">打開新版班級網頁</a></div>' +
      '<div class="v123-card"><b>👩‍🏫 小老師登記頁</b><div class="v123-mut">用您的學校帳號開，會自動以「老師」身分登入，四個班都看得到。</div>' +
      '<a class="v123-pri v123-link" href="' + TUTOR_URL + '" target="_blank" rel="noopener">打開小老師頁</a></div>' +
      '<div class="v123-card"><b>🎓 學生班級網站</b><div class="v123-mut">密碼只要在任何一台輸入一次，雲端同步後每台老師裝置點下面的連結就直接打開（學生看不到這裡）。</div>' +
      Object.keys(STU_SLUG).map(function (c) {
        return '<div class="v123-stu"><span class="v123-stu-c">' + esc(c) + '</span>' +
          '<a href="' + STU_BASE + STU_SLUG[c] + '/" target="_blank" rel="noopener">打開</a>' +
          (o[c] ? '<span class="v123-ok">✓ 已記住</span><button type="button" data-v123p="clr|' + esc(c) + '">改</button>'
            : '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="輸入密碼" data-v123pw="' + esc(c) + '"><button type="button" data-v123p="save|' + esc(c) + '">記住</button>') + '</div>';
      }).join('') + '</div>' + pushHTML();
  }
  /* V126 📤 推送檢核：重要進度檢核「檢討」格有勾的才推（老師 10/8：沒勾檢討 → 整份不放） */
  var PUSH = [['習作', '習作'], ['課後習題', '課本後習題'], ['A卷', 'A卷']];
  function pushData() {
    var hw = get(HW, {}), out = {}, les = {};
    classes().forEach(function (c) {
      out[c] = [];
      Object.keys(LK).forEach(function (n) {
        var r = ((hw || {})[LK[n]] || {})[c] || {}, its = [];
        PUSH.forEach(function (p) { var k = p[0] + '|檢討'; if (r[k]) its.push({ t: p[1], warn: String(r['_a:' + k] || '').indexOf('cal:') === 0 }); });
        if (its.length) { out[c].push({ n: +n, its: its }); les[n] = 1; }
      });
    });
    return { by: out, les: Object.keys(les).map(Number).sort(function (a, b) { return a - b; }) };
  }
  function pushText() {
    var D = pushData(), warn = false;
    var s = classes().map(function (c) {
      return c + '：' + (D.by[c].length ? D.by[c].map(function (x) { return 'L' + x.n + ' ' + x.its.map(function (i) { if (i.warn) warn = true; return i.t + (i.warn ? '⚠' : ''); }).join('、'); }).join('；') : '（沒有）');
    }).join('\n');
    return s + (warn ? '\n⚠＝舊版在日曆那天 0:00 自動打勾的，請確認真的檢討過' : '');
  }
  function pushHTML() {
    var D = pushData(), warn = false;
    var h = '<div class="v123-card v126-push"><b>📤 推送檢核</b><div class="v123-mut">學生班級網站只放「重要進度檢核」裡<b>檢討格有勾</b>的習作、課本後習題、A卷（沒勾檢討＝整份不放）。推送前先看這張表。</div>';
    if (!D.les.length) return h + '<div class="v123-mut">目前沒有任何一班勾了檢討。</div></div>';
    h += '<table><tr><th></th>' + D.les.map(function (n) { return '<th>L' + n + '</th>'; }).join('') + '</tr>';
    classes().forEach(function (c) {
      h += '<tr><th>' + esc(c) + '</th>' + D.les.map(function (n) {
        var x = D.by[c].filter(function (y) { return y.n === n; })[0];
        return '<td>' + (x ? x.its.map(function (i) { if (i.warn) warn = true; return (i.warn ? '<span class="v126-warn" title="舊版 0:00 自動勾的，請確認">⚠</span>' : '') + esc(i.t); }).join('<br>') : '<span class="v123-mut">—</span>') + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</table>' + (warn ? '<div class="v123-mut">⚠＝舊版在日曆那天 0:00 自動打勾的，不一定真的檢討過，請確認；確認沒問題可在檢核表取消再重勾。</div>' : '') +
      '<button type="button" class="v123-pri" data-v123p="copy|">複製文字</button></div>';
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
        '<div style="margin-top:8px">下課詢問今日待辦：<b>' + (askOff() ? '關' : '開') + '</b></div>' +
        '<button type="button" data-v123d="' + (askOff() ? 'askon' : 'askoff') + '">' + (askOff() ? '開啟（本裝置）' : '本裝置不要問') + '</button>' +
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
    else if (a === 'askoff' || a === 'askon') { put(ASK_OFF, a === 'askoff' ? '1' : '0'); if (a === 'askoff') closeAsk(); arrange(); }
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
      if (a2[0] === 'copy') {   /* V126 推送檢核 → 複製文字 */
        var txt = pushText(), done = function () { b.textContent = '已複製 ✓'; setTimeout(function () { b.textContent = '複製文字'; }, 1500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { prompt('請手動複製：', txt); });
        else prompt('請手動複製：', txt);
        return;
      }
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
  window.V123PANEL = { arrange: arrange, open: openSheet, autoCheck: autoCheck, checkAsk: checkAsk, classEnd: classEnd };
  /* V126：每 30 秒＋回到分頁時：自動打勾（A卷考試要等下課）＋下課詢問 */
  function tick() { try { autoCheck(); checkAsk(); } catch (e) { setTimeout(function () { throw e; }); } }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });
  function init() { try { arrange(); autoCheck(); setTimeout(checkAsk, 3000); } catch (e) { setTimeout(function () { throw e; }); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/148_guide-js.js ════ */
try {
/* V126 追問引導：配合 149_guide-css。資料（課文 ask 陣列的 HTML）裡的 onclick 呼叫這兩個函式。
   gdTap：點追問 → 顯示答案、出現下一個追問（最後一個問完 → 出現小結論）；點小結論 → 顯示內容並出現板書；點板書 → 顯示板書。再點一次收起答案。
   gdAll：全部展開（老師備課用）；再按一次全部收回到只剩第一問。
   V151：主問題可點的（〈火車線〉）改成一步一步：點題目 → 出現答案；再點 → 出現下一個追問（老師 10/20）。
         主問題的答案在 .gd-q 裡的 .gd-qa；沒有 .gd-qa 的主問題，點一下直接出現第一個追問。〈論語選〉不變。 */
(function () {
  'use strict';
  function isNext(n) { return n && (n.classList.contains('gd-s') || n.classList.contains('gd-end') || n.classList.contains('gd-board')); }
  window.gdTap = function (el) {
    var n = el.nextElementSibling, box = el.closest('.gd'), q = box && box.querySelector('.gd-q');
    var step = q && q.hasAttribute('onclick');   /* V151：主問題可點 → 一步一步 */
    if (!step) {
      if (!el.classList.contains('show')) {
        el.classList.add('show');
        if (isNext(n)) n.classList.add('vis');
      } else {
        el.classList.remove('show');
      }
      return;
    }
    var hasAns = !el.classList.contains('gd-q') || !!el.querySelector('.gd-qa');
    if (hasAns && !el.classList.contains('show')) { el.classList.add('show'); return; }   /* 第一下：出現答案 */
    if (isNext(n) && !n.classList.contains('vis')) { n.classList.add('vis'); if (!hasAns) el.classList.add('show'); return; }   /* 第二下：出現下一題 */
    if (hasAns) el.classList.remove('show');   /* 都出現了再點：收起答案 */
  };
  window.gdAll = function (btn) {
    var box = btn.closest('.gd'); if (!box) return;
    var open = !box.classList.contains('gd-open');
    box.classList.toggle('gd-open', open);
    var q = box.querySelector('.gd-q'), qTap = q && q.hasAttribute('onclick');   /* V136：主問題可點的（〈火車線〉），收起時連第一問也收 */
    if (qTap) q.classList.toggle('show', open);
    box.querySelectorAll('.gd-s, .gd-end, .gd-board').forEach(function (x, i) {
      x.classList.toggle('vis', open || (i === 0 && !qTap));
      x.classList.toggle('show', open);
    });
    btn.textContent = open ? '收起' : '全部展開';
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/150_after-js.js ════ */
try {
/* V126 課後引導（151_after-css）：資料是補充頁 body 的 HTML，onclick 呼叫下面幾個函式。
   ahNext：同一頁裡「下一步」——依序顯示下一個 .ah-step（追問、小結）；全部顯示後按鈕隱藏。
   wcPlay：文字雲動畫——讀 .wc 的 data-w（「詞:權重|詞:權重」，權重 1～3＝字的大小），打亂順序後一個一個跳出來。
   wcAdd：在文字雲加上同學的回答（輸入框按 Enter）；不存檔，換頁就消失。
   mmTap：心智圖節點——點開／收起它的下一層。 */
(function () {
  'use strict';
  var COLORS = ['#7c4da0', '#2c5f73', '#8a3a1c', '#4f8a78', '#b07a12', '#6b5a42', '#a0522d'];
  function word(t, w, i) {
    var s = document.createElement('span');
    s.className = 'wc-w wc-' + (w || 1);
    s.textContent = t;
    s.style.color = COLORS[i % COLORS.length];
    s.style.setProperty('--rot', ((i * 37) % 3 === 0 ? (i % 2 ? -6 : 6) : 0) + 'deg');
    return s;
  }
  window.wcPlay = function (btn) {
    var box = btn.closest('.ah-step') || btn.parentNode, wc = box.querySelector('.wc'); if (!wc) return;
    var items = String(wc.getAttribute('data-w') || '').split('|').filter(Boolean).map(function (x) {
      var p = x.split(':'); return { t: p[0], w: +p[1] || 1 }; });
    for (var i = items.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), k = items[i]; items[i] = items[j]; items[j] = k; }
    wc.innerHTML = ''; wc.classList.add('on');
    items.forEach(function (it, i) {
      var s = word(it.t, it.w, i); s.style.animationDelay = (i * 0.22) + 's'; wc.appendChild(s);
    });
    btn.style.display = 'none';
    var add = box.querySelector('.wc-add'); if (add) add.style.display = '';
  };
  window.wcAdd = function (inp, ev) {
    if (ev && (ev.key !== 'Enter' || ev.isComposing)) return;   /* 注音選字時的 Enter 不算 */
    var t = inp.value.trim(); if (!t) return;
    var wc = inp.closest('.ah-step').querySelector('.wc');
    var s = word(t, 2, wc.children.length + 3); s.classList.add('wc-mine'); wc.appendChild(s);
    inp.value = '';
  };
  window.ahNext = function (btn) {
    var box = btn.closest('.ah'); if (!box) return;
    var next = box.querySelector('.ah-step:not(.on)');
    if (next) { next.classList.add('on'); next.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    if (!box.querySelector('.ah-step:not(.on)')) btn.style.display = 'none';
  };
  window.mmTap = function (node, ev) {
    if (ev) ev.stopPropagation();
    var li = node.closest('.mm-n'); if (li) li.classList.toggle('open');
  };
})();
/* V126 跳到補充講義某一頁（依標題關鍵字找 hd2 頁），並在那頁加「⤺ 回原頁」；回去沿用 015_main 的 wkReturnToText。 */
(function () {
  'use strict';
  function addBack() {
    if (!window.wkReturnTo) return;
    document.querySelectorAll('#wk-slide-area .wk-slide, #wkfs-body .wk-slide').forEach(function (sl) {
      if (sl.querySelector('.ah-back')) return;
      var b = document.createElement('button'); b.className = 'ah-back'; b.textContent = '⤺ 回原頁';
      b.onclick = function (e) { e.stopPropagation(); if (typeof wkReturnToText === 'function') wkReturnToText(); };
      sl.insertBefore(b, sl.firstChild);
    });
  }
  window.wkGoHandout = function (ev, key) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    if (typeof wkSlides === 'undefined') return;
    var idx = -1;
    wkSlides.forEach(function (s, i) { if (idx < 0 && s.type === 'hd2' && s.page && String(s.page.title || '').indexOf(key) >= 0) idx = i; });
    if (idx < 0) return;
    window.wkReturnTo = { idx: wkIdx, li: null };
    wkGoto(idx);
    setTimeout(addBack, 60);
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/160_popfx-js.js ════ */
try {
/* 按鈕爆粒子（2026-10-08 老師）：點下去按鈕 1→0.8→1.2→1 回彈（帶回彈曲線），中心炸出 8 顆古典色小圓點向外飛散淡出，共 600ms。
   套用範圍（老師同意的建議）：
     ① 看答案類按鈕（全部顯示答案、直接顯示答案、一鍵全開…）→ 回彈＋粒子；只在「顯示」時爆，按「隱藏」不爆
     ② 成績、同步的主要按鈕（.gr-btn.pri、.sy-btn.pri：登入、儲存、匯入、立即同步…）→ 回彈＋粒子
     ③ 點遮罩看答案（點此顯示答案與解析、點一下揭曉、點一下看答案、表格裡的點此顯示答案）→ 遮罩消失時只炸粒子（遮罩會不見，不做回彈）
   翻頁、畫筆、關閉、字級、深色模式這些常按的不爆。系統設定「減少動態效果」就不播。
   做法：document 捕獲階段先記下按下前的狀態（按鈕文字、遮罩是否可見、位置），等原本的 onclick 跑完（setTimeout 0）再判斷要不要爆；
   不改任何既有模組。同一份程式也放在班級網站（教學系統專案 scripts/stu_class_addon.html），兩邊改要一起改。 */
(function () {
  if (window.popFx) return;
  var COLORS = ['#c23a2b', '#d9a420', '#3f8f6b', '#2b6c9e', '#9d2933', '#c8a046', '#6aa3b8', '#9b5b2b'];   // 朱砂、藤黃、石綠、石青、胭脂、泥金、天青、赭石
  var DUR = 600, BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var st = document.createElement('style'); st.id = 'popfx-css';
  st.textContent = '.pop-fx-layer{position:fixed;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:2147483647}' +
    '.pop-fx-dot{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;will-change:transform,opacity}';
  document.head.appendChild(st);

  var layer = null;
  function getLayer() {
    if (!layer || !layer.isConnected) { layer = document.createElement('div'); layer.className = 'pop-fx-layer'; document.body.appendChild(layer); }
    return layer;
  }
  /* btn：要回彈的元素（可為 null）；r：炸粒子的位置（視窗座標，沒給就用 btn 現在的位置） */
  function popFx(btn, r) {
    if (reduce || !document.body.animate) return;
    if (btn) {
      var base = getComputedStyle(btn).transform; base = base && base !== 'none' ? base + ' ' : '';   // 原本有 transform 的按鈕（置中定位等）不能被蓋掉
      var rb = btn.getBoundingClientRect(), room = Math.min(rb.left, document.documentElement.clientWidth - rb.right);
      var hi = rb.width ? Math.min(1.2, Math.max(1.03, 1 + 2 * room / rb.width)) : 1.2;   // 滿版寬的按鈕放大幅度自動縮小，不會超出螢幕（手機才不會左右晃）
      btn.animate([
        { transform: base + 'scale(1)', easing: 'cubic-bezier(.3,0,.6,1)' },
        { transform: base + 'scale(0.8)', offset: 0.22, easing: BOUNCE },
        { transform: base + 'scale(' + hi + ')', offset: 0.6, easing: BOUNCE },
        { transform: base + 'scale(1)' }
      ], { duration: DUR });
      r = btn.getBoundingClientRect();
    }
    if (!r || !r.width) return;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, L = getLayer();
    var s0 = Math.min(Math.max(r.width, r.height) / 2 * 0.6, 60), a0 = Math.random() * Math.PI * 2;   // 大遮罩起點最多離中心 60px
    for (var i = 0; i < 8; i++) {
      var a = a0 + i * Math.PI / 4 + (Math.random() - 0.5) * 0.35, dist = s0 + 16 + Math.random() * 10, sz = 3 + Math.random() * 1.5;
      var sx = cx + Math.cos(a) * s0, sy = cy + Math.sin(a) * s0, ex = cx + Math.cos(a) * dist, ey = cy + Math.sin(a) * dist;
      var dot = document.createElement('div'); dot.className = 'pop-fx-dot';
      dot.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;margin:' + (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px;background:' + COLORS[i];
      L.appendChild(dot);
      var P = (function (sx, sy, ex, ey) { return function (k) { return 'translate(' + (sx + (ex - sx) * k) + 'px,' + (sy + (ey - sy) * k) + 'px)'; }; })(sx, sy, ex, ey);
      dot.animate([
        { transform: P(0) + ' scale(.4)', opacity: 0, easing: 'ease-out' },
        { transform: P(0.3) + ' scale(1.2)', opacity: 1, offset: 0.15, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { transform: P(0.9) + ' scale(1)', opacity: 1, offset: 0.7, easing: 'ease-in' },
        { transform: P(1) + ' scale(.4)', opacity: 0 }
      ], { duration: DUR }).onfinish = (function (el) { return function () { el.remove(); }; })(dot);
    }
  }
  window.popFx = popFx;

  var REVEAL_BTN = '.wq-reveal-btn,.jy-toggle-all,.iq-all,.as-all,button.all,#bAll,button[onclick^="v68AoAll"],#stu-sp-all';   // #stu-sp-all：班級網站衝刺區「👀 本頁答案全開」
  var CONFIRM_BTN = '.gr-btn.pri,.sy-btn.pri';
  var BOX = '.wks-q-ansbox,.wks-exam-ansbox,.wks-selfq-box,.wks-cq-card,.ah-a,#nq2 .qc';
  var COVER = '.wks-q-cover,.wks-cq-cover,.ah-cov,.qa-hint';
  function shown(el) { return !!(el && el.isConnected && el.getClientRects().length); }
  function keyOf(b) { return b.getAttribute('data-g') || b.getAttribute('data-s') || b.id || ''; }

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest(CONFIRM_BTN + ',' + REVEAL_BTN);
    if (b) {
      if (b.disabled) return;
      var txt = b.textContent || '';
      if (!b.matches(CONFIRM_BTN) && (/隱藏|遮|藏起來/.test(txt) || !/顯示|全開|揭曉|答案/.test(txt))) return;   // 看答案類：只在「顯示」時爆
      var r = b.getBoundingClientRect(), k = keyOf(b), par = b.parentNode;
      setTimeout(function () {
        if (b.isConnected) { popFx(b); return; }
        var nb = k && document.querySelector('[data-g="' + k + '"],[data-s="' + k + '"]');   // 按完整塊重畫：找新的同一顆
        if (nb && shown(nb)) popFx(nb); else popFx(null, r);
      }, 0);
      return;
    }
    var wa = document.body.classList.contains('stu-sprint-on') && t.closest('.wk-a');   // 班級網站衝刺區的「點我」（遮罩是 ::before，點一下切換 stu-show）
    if (wa) { var r1 = wa.getBoundingClientRect(); setTimeout(function () { if (wa.classList.contains('stu-show')) popFx(null, r1); }, 0); return; }
    var box = t.closest(BOX), cov = box && box.querySelector(COVER);
    if (!shown(cov)) return;   // 已經打開了（這下是要收起來）→ 不爆
    var r2 = cov.getBoundingClientRect();
    setTimeout(function () { if (!shown(cov)) popFx(null, r2); }, 0);
  }, true);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/162_spot-js.js ════ */
try {
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
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/163_inkthin-js.js ════ */
try {
/* 投影畫筆只留細筆（2026-10-09 老師；同日再拿掉「清除本頁」——關掉畫筆本來就會全部清除）：紅藍綠紫只要「細」，拿掉「中」（「粗」v56 已藏）；螢光筆只留黃色一支（本來就只有一支）。
   - 細／中按鈕都藏起來（不刪 DOM），從螢光筆換回顏色時粗細一律回到細（3）。
   - 包裝 wkInkColor（實際生效版本＝本段包在 v56 036_v56-nq2-js.js 包裝版的外層）。 */
(function () {
  var st = document.createElement('style'); st.id = 'inkthin-css';
  st.textContent = '#wk-ink-toolbar .wk-ink-size,#wk-ink-toolbar button[onclick="wkInkClear()"]{display:none !important}';   /* 「清除本頁」也藏：關掉畫筆就會清除 */
  document.head.appendChild(st);
  function wrap() {
    var orig = window.wkInkColor;
    if (typeof orig !== 'function' || orig._thin) return;
    window.wkInkColor = function () {
      var r = orig.apply(this, arguments);
      if (window.wkInkState && wkInkState.color !== 'rgba(0,0,0,0)') wkInkState.size = 3;
      return r;
    };
    window.wkInkColor._thin = true;
  }
  /* v56 的包裝在 DOMContentLoaded 才做，要包在它外層 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(wrap, 0); });
  else wrap();
  if (window.wkInkState) wkInkState.size = 3;
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/164_hlmark-js.js ════ */
try {
/* 標記筆（2026-10-09 試做；需求見教學系統專案 docs/待辦/待辦_RayOclass新功能_20261005.md 第 3 項）
   - 跟投影「畫筆」分開：畫筆是隨手畫、不存；標記筆劃過文字會自動對齊到字，永久保留。
   - 開關：一般畫面「🖥 投影全螢幕」旁的「🖍 標記筆」；全螢幕上方那排的「🖍」。開著時下方出現色盤：紅、黃、藍、綠、本頁清除、完成。
   - 用法：開著時在課文上劃過去就標起來；點一下已標的字 → 跳出小框可換色或刪除。開著時畫面上的點字泡泡等暫時不會被觸發。
   - 存法：不存筆跡，存「課名＋第幾頁＋這頁的識別＋被標的文字＋前後各 8 字＋在本頁文字中的位置」；
     換字級、換螢幕、一般畫面／全螢幕都重新對齊。找不到原文的標記不亂標（之後可列成「失效標記」）。
   - 四班共用一套。【試做】暫存在本機 localStorage「hlmark_trial_v1」，還沒加入雲端同步（正式鍵名定案前先問老師）。
   - 畫面上用 <span class="hm-m"> 包住被標的字（只加背景、不改字寬與位置，不影響修辭框線等定位）。
   自帶 <style id="hlmark-css">，不改任何既有模組。 */
(function () {
  if (window.hmToggle) return;
  var KEY = 'hlmark_trial_v1';
  var COLORS = { r: '#e8746a', y: '#f5d533', b: '#6fa8e8', g: '#6cc48a' };
  var NAMES = { r: '紅', y: '黃', b: '藍', g: '綠' };
  var SKIP = 'rt,rp,sup,script,style,button,[role="button"],.hm-ui,[aria-hidden="true"],.tm-layer,.tm-par';   /* 按鈕文字（句意、翻譯…）不算 */
  var CTX = 8;
  var on = false, color = 'y', applying = false;

  /* ── 樣式 ── */
  var css = '.hm-m{border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}';
  Object.keys(COLORS).forEach(function (k) {
    var c = COLORS[k];
    css += '.hm-m[data-c="' + k + '"]{background:linear-gradient(transparent 38%,' + hexA(c, .55) + ' 38%,' + hexA(c, .55) + ' 92%,transparent 92%)}' +
      'body.dark-mode .hm-m[data-c="' + k + '"]{background:linear-gradient(transparent 38%,' + hexA(c, .38) + ' 38%,' + hexA(c, .38) + ' 92%,transparent 92%)}';
  });
  css +=
    'body.hm-on #wk-slide-area .wk-slide,body.hm-on #wkfs-body .wk-slide{touch-action:none;-webkit-user-select:none;user-select:none;cursor:text}' +
    '#hm-bar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9800;display:none;align-items:center;gap:8px;' +
      'padding:8px 12px;border-radius:28px;background:rgba(32,24,18,.88);box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
    'body.hm-on #hm-bar{display:flex}' +
    'body.hm-on.v56-proj-open #hm-bar{bottom:96px}' +
    '#hm-bar .hm-sw,#hm-pop .hm-sw{width:34px;height:34px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0}' +
    '#hm-bar .hm-sw.on{border-color:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.4)}' +
    '#hm-bar .hm-tx,#hm-pop .hm-tx{font:inherit;font-size:14px;color:#fff;background:rgba(255,255,255,.14);border:0;border-radius:18px;padding:8px 12px;cursor:pointer;min-height:36px}' +
    '#hm-pv{position:fixed;inset:0;pointer-events:none;z-index:9790}' +
    '#hm-pv div{position:fixed;border-radius:2px;mix-blend-mode:multiply}' +
    'body.dark-mode #hm-pv div{mix-blend-mode:screen}' +
    '#hm-pop{position:fixed;z-index:9810;display:none;align-items:center;gap:6px;padding:6px 8px;border-radius:22px;background:rgba(32,24,18,.92);box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '#hm-pop .hm-sw{width:28px;height:28px}' +
    '.hm-btn.on{background:#c0392b !important;color:#fff !important;border-color:#c0392b !important}';
  var stEl = document.createElement('style'); stEl.id = 'hlmark-css'; stEl.textContent = css;
  document.head.appendChild(stEl);
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }

  /* ── 資料 ── */
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { } }
  function curLesson() { return typeof wkKey !== 'undefined' ? String(wkKey || '') : ''; }
  function curIdx() { return typeof wkIdx !== 'undefined' ? wkIdx : -1; }
  function curSig() {
    try { var s = wkSlides[wkIdx] || {}; return String(s.type || '') + '|' + String(s.title || s.label || '').slice(0, 30); } catch (e) { return ''; }
  }
  function marksHere() {
    var L = curLesson(), i = curIdx(), sg = curSig();
    return load().filter(function (m) { return m.lesson === L && m.idx === i && m.sig === sg; });
  }

  /* ── 本頁文字模型：.wk-slide 內可見文字節點（不含注音、圈號、本模組介面） ── */
  function model(slide) {
    var nodes = [], s = '', w = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentElement;
      if (!p || p.closest(SKIP)) continue;
      if (!vis(p)) continue;                 /* 藏起來的翻譯、未展開的說明等不算 */
      nodes.push({ n: n, a: s.length }); s += n.data;
    }
    return { nodes: nodes, s: s };
  }
  function vis(el) {
    if (el.checkVisibility) return el.checkVisibility({ visibilityProperty: true, opacityProperty: false });
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function locate(md, m) {
    var s = md.s, best = -1, bs = -1, bd = 1e9, i = s.indexOf(m.text);
    while (i >= 0) {
      var sc = 0, pre = s.slice(Math.max(0, i - CTX), i), post = s.slice(i + m.text.length, i + m.text.length + CTX);
      for (var k = 1; k <= pre.length && k <= m.pre.length && pre.charAt(pre.length - k) === m.pre.charAt(m.pre.length - k); k++) sc++;
      for (k = 0; k < post.length && k < m.post.length && post.charAt(k) === m.post.charAt(k); k++) sc++;
      var d = Math.abs(i - m.off);
      if (sc > bs || (sc === bs && d < bd)) { best = i; bs = sc; bd = d; }
      i = s.indexOf(m.text, i + 1);
    }
    /* 前後文都對不上、而且很短（一兩個字）→ 寧可不標 */
    if (best >= 0 && bs === 0 && m.text.length <= 2 && (m.pre || m.post)) return -1;
    return best;
  }
  function wrapRange(md, a, b, m) {
    md.nodes.forEach(function (x) {
      var s0 = Math.max(a, x.a), e0 = Math.min(b, x.a + x.n.data.length);
      if (s0 >= e0) return;
      var node = x.n;
      if (e0 - x.a < node.data.length) node.splitText(e0 - x.a);
      if (s0 - x.a > 0) node = node.splitText(s0 - x.a);
      var sp = document.createElement('span'); sp.className = 'hm-m'; sp.dataset.id = m.id; sp.dataset.c = m.c;
      node.parentNode.insertBefore(sp, node); sp.appendChild(node);
    });
  }
  function slides() {
    return ['wk-slide-area', 'wkfs-body'].map(function (id) {
      var c = document.getElementById(id); return c && c.querySelector('.wk-slide');
    }).filter(Boolean);
  }
  function unwrapAll(slide, id) {
    slide.querySelectorAll(id ? '.hm-m[data-id="' + id + '"]' : '.hm-m').forEach(function (sp) {
      var p = sp.parentNode; while (sp.firstChild) p.insertBefore(sp.firstChild, sp); p.removeChild(sp); p.normalize();
    });
  }
  function applySlide(slide) {
    applying = true;
    try {
      unwrapAll(slide);
      marksHere().forEach(function (m) {
        var md = model(slide), a = locate(md, m);
        if (a >= 0) wrapRange(md, a, a + m.text.length, m);
      });
      slide.dataset.hmDone = '1';
    } finally { setTimeout(function () { applying = false; }, 0); }
  }
  function applyAll() { slides().forEach(applySlide); }

  /* 換頁、全螢幕重畫（很多外掛會晚一點再改內容）→ 等安靜下來再套 */
  var tmr = 0;
  function schedule() { clearTimeout(tmr); tmr = setTimeout(function () { slides().forEach(function (sl) { if (!sl.dataset.hmDone || !sl.querySelector('.hm-m') && marksHere().length) applySlide(sl); }); }, 120); }
  function watch() {
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var c = document.getElementById(id); if (!c) return;
      new MutationObserver(function (list) {
        if (applying) return;
        for (var i = 0; i < list.length; i++) {
          var t = list[i].target;
          if (list[i].type === 'childList' && !(t.closest && t.closest('.hm-m'))) { schedule(); return; }
        }
      }).observe(c, { childList: true, subtree: true });
    });
  }

  /* ── 劃過去標記 ── */
  function activeSlideAt(el) {
    var sl = el && el.closest && el.closest('#wk-slide-area .wk-slide,#wkfs-body .wk-slide');
    return sl || null;
  }
  var drag = null, pv = null;
  function pvLayer() { if (!pv || !pv.isConnected) { pv = document.createElement('div'); pv.id = 'hm-pv'; pv.className = 'hm-ui'; document.body.appendChild(pv); } return pv; }
  function clearPv() { if (pv) pv.innerHTML = ''; }
  /* 逐字量位置（按下時量一次；劃線中版面不動）。不用瀏覽器的游標落點：有些課圈號、說明框會疊在字上，會抓錯字 */
  function measure(md) {
    var out = [], r = document.createRange();
    md.nodes.forEach(function (x) {
      for (var k = 0; k < x.n.data.length; k++) {
        if (/\s/.test(x.n.data.charAt(k))) continue;
        r.setStart(x.n, k); r.setEnd(x.n, k + 1);
        var q = r.getBoundingClientRect();
        if (q.width > 0 && q.height > 0) out.push({ i: x.a + k, l: q.left, r: q.right, t: q.top, b: q.bottom });
      }
    });
    return out;
  }
  /* 手指底下的字；沒有正好壓到字 → 同一行最近的字；都沒有 → -1 */
  function hit(cs, x, y) {
    var best = -1, bd = 1e9;
    for (var k = 0; k < cs.length; k++) {
      var c = cs[k];
      if (y < c.t || y > c.b) continue;
      var d = x < c.l ? c.l - x : x > c.r ? x - c.r : 0;
      if (d === 0) d = -1 / (1 + Math.abs(y - (c.t + c.b) / 2));     /* 疊在一起時取垂直中心最近的 */
      if (d < bd) { bd = d; best = c.i; }
    }
    return bd <= 40 ? best : -1;
  }
  function spanOf(md, i0, i1) {
    if (i0 < 0 || i1 < 0) return null;
    var a = Math.min(i0, i1), b = Math.max(i0, i1) + 1;
    while (a < b && /\s/.test(md.s.charAt(a))) a++;
    while (b > a && /\s/.test(md.s.charAt(b - 1))) b--;
    return b > a ? { md: md, a: a, b: b } : null;
  }
  function rangeOf(md, a, b) {
    var r = document.createRange(), sN = null, eN = null;
    md.nodes.forEach(function (x) {
      var L = x.n.data.length;
      if (!sN && a < x.a + L) { r.setStart(x.n, a - x.a); sN = 1; }
      if (!eN && b <= x.a + L) { r.setEnd(x.n, b - x.a); eN = 1; }
    });
    return sN && eN ? r : null;
  }
  function showPv(sp) {
    var L = pvLayer(); L.innerHTML = '';
    var r = sp && rangeOf(sp.md, sp.a, sp.b); if (!r) return;
    [].forEach.call(r.getClientRects(), function (q) {
      if (q.width < 1) return;
      var d = document.createElement('div');
      d.style.cssText = 'left:' + q.left + 'px;top:' + (q.top + q.height * .38) + 'px;width:' + q.width + 'px;height:' + (q.height * .54) + 'px;background:' + hexA(COLORS[color], .55);
      L.appendChild(d);
    });
  }

  function onDown(e) {
    if (!on || e.button > 0) return;
    if (e.target.closest && e.target.closest('.hm-ui,#hm-bar,#hm-pop')) return;
    var sl = activeSlideAt(e.target); if (!sl) return;
    hidePop();
    var md = model(sl), cs = measure(md);
    drag = { sl: sl, md: md, cs: cs, x: e.clientX, y: e.clientY, i0: hit(cs, e.clientX, e.clientY), moved: false, sp: null, tgt: e.target };
    e.preventDefault(); e.stopPropagation();
  }
  function onMove(e) {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) drag.moved = true;
    if (drag.moved) {
      if (drag.i0 < 0) drag.i0 = hit(drag.cs, e.clientX, e.clientY);    /* 從空白處開始劃 → 碰到第一個字當起點 */
      var i1 = hit(drag.cs, e.clientX, e.clientY);
      if (i1 >= 0) { drag.sp = spanOf(drag.md, drag.i0, i1); showPv(drag.sp); }
    }
    e.preventDefault(); e.stopPropagation();
  }
  function onUp(e) {
    if (!drag) return;
    var d = drag; drag = null; clearPv();
    e.preventDefault(); e.stopPropagation();
    if (!d.moved) {
      var hm = d.tgt.closest && d.tgt.closest('.hm-m');
      if (!hm && d.i0 >= 0) {                          /* 字上疊了別的東西 → 用量到的字找標記 */
        var at = d.md.nodes.filter(function (x) { return d.i0 >= x.a && d.i0 < x.a + x.n.data.length; })[0];
        hm = at && at.n.parentElement && at.n.parentElement.closest('.hm-m');
      }
      if (hm) showPop(hm.dataset.id, e.clientX, e.clientY);
      return;
    }
    var sp = d.sp; if (!sp) return;
    var m = {
      id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      lesson: curLesson(), idx: curIdx(), sig: curSig(), c: color,
      text: sp.md.s.slice(sp.a, sp.b), pre: sp.md.s.slice(Math.max(0, sp.a - CTX), sp.a), post: sp.md.s.slice(sp.b, sp.b + CTX),
      off: sp.a, t: new Date().toISOString()
    };
    var all = load(); all.push(m); save(all);
    applyAll();
  }
  function swallow(e) {
    if (!on) return;
    if (e.target.closest && e.target.closest('.hm-ui,#hm-bar,#hm-pop')) return;
    if (activeSlideAt(e.target)) { e.preventDefault(); e.stopPropagation(); }
  }

  /* ── 點已標的字：換色／刪除 ── */
  var pop = null, popId = null;
  function hidePop() { if (pop) pop.style.display = 'none'; popId = null; }
  function showPop(id, x, y) {
    if (!pop) {
      pop = document.createElement('div'); pop.id = 'hm-pop'; pop.className = 'hm-ui';
      pop.innerHTML = Object.keys(COLORS).map(function (k) {
        return '<button type="button" class="hm-sw" data-k="' + k + '" style="background:' + COLORS[k] + '" aria-label="改成' + NAMES[k] + '色"></button>';
      }).join('') + '<button type="button" class="hm-tx" data-del="1">🗑 刪除</button>';
      pop.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !popId) return;
        var all = load(), m = all.filter(function (x) { return x.id === popId; })[0];
        if (b.dataset.del) all = all.filter(function (x) { return x.id !== popId; });
        else if (m) m.c = b.dataset.k;
        save(all); hidePop(); applyAll();
      });
      document.body.appendChild(pop);
    }
    popId = id; pop.style.display = 'flex';
    var w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + 'px';
    pop.style.top = (y - h - 16 < 8 ? y + 20 : y - h - 16) + 'px';
  }

  /* ── 色盤列 ── */
  var bar = document.createElement('div'); bar.id = 'hm-bar'; bar.className = 'hm-ui'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', '標記筆');
  bar.innerHTML = Object.keys(COLORS).map(function (k) {
    return '<button type="button" class="hm-sw' + (k === color ? ' on' : '') + '" data-k="' + k + '" style="background:' + COLORS[k] + '" aria-label="' + NAMES[k] + '色"></button>';
  }).join('') + '<button type="button" class="hm-tx" data-a="clear">本頁清除</button><button type="button" class="hm-tx" data-a="done">✓ 完成</button>';
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { color = b.dataset.k; bar.querySelectorAll('.hm-sw').forEach(function (x) { x.classList.toggle('on', x === b); }); }
    else if (b.dataset.a === 'done') toggle(false);
    else if (b.dataset.a === 'clear') {
      var here = marksHere(); if (!here.length) return;
      if (!confirm('清除這一頁的 ' + here.length + ' 個標記？（四班共用，清掉就沒有了）')) return;
      var ids = here.map(function (m) { return m.id; });
      save(load().filter(function (m) { return ids.indexOf(m.id) < 0; })); applyAll();
    }
  });

  function toggle(v) {
    on = v === undefined ? !on : !!v;
    document.body.classList.toggle('hm-on', on);
    document.querySelectorAll('.hm-btn').forEach(function (b) { b.classList.toggle('on', on); });
    if (!on) { drag = null; clearPv(); hidePop(); }
  }
  window.hmToggle = toggle;
  window.hmReapply = applyAll;

  function addBtns() {
    var pj = document.querySelector('.wk-proj-btn:not(.spot-btn)');
    if (pj && !document.getElementById('hm-btn-n')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'hm-btn-n';
      b.className = 'wk-proj-btn hm-btn'; b.textContent = '🖍 標記筆'; b.title = '標記筆（劃過文字永久保留）';
      b.onclick = function () { toggle(); };
      var after = document.getElementById('spot-btn-n') || pj;
      after.parentNode.insertBefore(b, after.nextSibling);
    }
    var cb = document.querySelector('#wk-fullscreen .wkfs-ctrl-btns');
    if (cb && !document.getElementById('hm-btn-f')) {
      var f = document.createElement('button'); f.type = 'button'; f.id = 'hm-btn-f';
      f.className = 'wkfs-ctrl-btn hm-btn'; f.textContent = '🖍'; f.title = '標記筆';
      f.onclick = function () { toggle(); };
      cb.appendChild(f);
    }
  }
  function boot() {
    document.body.appendChild(bar);
    addBtns(); watch(); schedule();
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onUp, true);
    document.addEventListener('pointercancel', function () { drag = null; clearPv(); }, true);
    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu'].forEach(function (t) { document.addEventListener(t, swallow, { capture: true, passive: false }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on) { toggle(false); e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    document.addEventListener('pointerdown', function (e) { if (pop && popId && !(e.target.closest && e.target.closest('#hm-pop'))) { if (!on || !activeSlideAt(e.target)) hidePop(); } }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/165_layoutfix-js.js ════ */
try {
/* 版面小修（2026-10-09 老師）
   ① 頁碼浮框（.tp-page「課本 P.44」）一般畫面捲到最上面時壓到右上「高職／高中」切換鍵：
      標題列還看得到、而且跟頁碼同高時 → 寬畫面移到切換鍵左邊；窄畫面（≤820）移到標題列下方。全螢幕不動。
   ② 左下角版本號（#v88-ver，fixed）在手機壓到投影框 → 改放標題列副標後面的小字（不再浮動）。
   ③ 側欄課次（部定14篇／選讀古文／白話文）字級固定小字，不跟著 A−／A+ 變（不用給學生看）。
   ④ 手機（寬 ≤600）：投影框內的寬表格把整頁撐寬（例：〈師說〉辨字頁 429px）→ 手機瀏覽器整頁縮小、
      固定位置的面板跟著變大、關閉鍵跑到螢幕外拉不到 → 讓課文欄與投影框不超過畫面寬；還是比畫面寬的內容改成可左右滑動；
      面板高度不超過螢幕、可捲動。
   ⑤ 手機不提供字級調整（A−／A+、顯示設定的字體大小、全螢幕 A−／A+ 都藏），字級固定 15px；平板、電腦照舊。
   自帶 <style id="layoutfix-css">，不改任何既有模組。 */
(function () {
  var PHONE = '(max-width:600px)';
  var st = document.createElement('style'); st.id = 'layoutfix-css';
  st.textContent =
    /* ① */
    '#tab-wenxue .tp-page,#tab-wenxue .wks-book-page{top:var(--lf-tp-top,58px) !important;right:var(--lf-tp-right,24px) !important}' +
    '@media (max-width:820px){#tab-wenxue .tp-page,#tab-wenxue .wks-book-page{top:var(--lf-tp-top,52px) !important;right:var(--lf-tp-right,12px) !important}}' +
    /* ② */
    '#v88-ver.lf-inline{position:static !important;display:inline-block !important;margin-left:10px;font-size:11px !important;opacity:.6;' +
      'left:auto !important;bottom:auto !important;background:none !important;border:0 !important;padding:0 !important;box-shadow:none !important;color:inherit !important}' +
    /* ③ */
    '.wenxue-sidebar .wenxue-nav-item{font-size:13px !important}' +
    '.wenxue-sidebar .wenxue-sidebar-title{font-size:10px !important}' +
    /* ④ */
    '@media ' + PHONE + '{' +
      '.wenxue-layout>*,#wk-slide-area,#wk-slide-area>.wk-slide{min-width:0 !important;max-width:100% !important;box-sizing:border-box}' +
      '#wk-slide-area>.wk-slide{flex:1 1 auto}' +
      /* 還是比畫面寬的內容（義辨表、結構表、動畫頁、答案頁…）→ 可左右滑動看完，不再被切掉 */
      '#wk-slide-area>.wk-slide,#wk-slide-area .jy-scroll,#wk-slide-area .v75-rv,#wk-slide-area .v74-rv{overflow-x:auto !important;-webkit-overflow-scrolling:touch}' +
      '#cls-panel,#display-panel,#nq2{max-width:100vw !important;max-height:100dvh !important;overflow-y:auto !important;box-sizing:border-box}' +
    '}' +
    /* ⑤ */
    '@media ' + PHONE + '{' +
      ':root{--base-size:15px !important;--slider-base-size:15px !important}' +
      '.site-font-ctrl,#wk-fullscreen .wkfs-ctrl-btn[onclick^="wkFont"],#display-panel .lf-font-row{display:none !important}' +
    '}';
  document.head.appendChild(st);

  /* ① 頁碼避開標題列 */
  var raf = 0;
  function placePage() {
    raf = 0;
    var root = document.documentElement, ctl = document.querySelector('.site-controls'), hd = document.querySelector('.site-header');
    var top = '', right = '';
    if (ctl && hd) {
      var narrow = innerWidth <= 820, pTop = narrow ? 52 : 58, pH = 30;
      var c = ctl.getBoundingClientRect(), h = hd.getBoundingClientRect();
      if (c.bottom > pTop - 4 && c.top < pTop + pH) {                 /* 標題列的按鈕還在頁碼那一帶 */
        if (narrow) top = Math.round(h.bottom + 6) + 'px';
        else right = Math.round(innerWidth - c.left + 10) + 'px';
      }
    }
    root.style.setProperty('--lf-tp-top', top || (innerWidth <= 820 ? '52px' : '58px'));
    root.style.setProperty('--lf-tp-right', right || (innerWidth <= 820 ? '12px' : '24px'));
  }
  function sched() { if (!raf) raf = requestAnimationFrame(placePage); }
  addEventListener('scroll', sched, { passive: true });
  addEventListener('resize', sched);

  /* ② 版本號移到標題列 */
  function moveVer() {
    var v = document.getElementById('v88-ver'), sub = document.querySelector('.site-header .site-sub');
    if (v && sub && v.parentNode !== sub) { sub.appendChild(v); v.classList.add('lf-inline'); }
  }
  /* ⑤ 顯示設定裡「字體大小」那一列加記號（手機藏起來） */
  function markFontRow() {
    document.querySelectorAll('#display-panel .display-setting').forEach(function (d) {
      if (/字體大小/.test(d.textContent)) d.classList.add('lf-font-row');
    });
  }
  function boot() {
    moveVer(); markFontRow(); placePage();
    setTimeout(moveVer, 500); setTimeout(moveVer, 2000);   /* 版本號是別的外掛晚一點才建的 */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/166_notefs-scale-js.js ════ */
try {
/* V129：注釋側欄字級跟著課文等比例縮放。
   原因：047（v61）的注釋字級滑桿是固定 px（預設 30px），當初為全螢幕投影設計（全螢幕課文也是 30px）；
   一般畫面課文只有約 21px，打開注釋欄字反而比課文大很多（老師 10/15 回報）。
   做法：不改 047／046，滑桿數字仍代表「課文 30px 時的注釋字級」；
   一般畫面（#wk-slide-area）與全螢幕（#wkfs-body）各自量課文字級，寫入 --v129-nfs（＝滑桿值 × 課文字級 ÷ 30）。
   補充卡、「總」字卡不在這兩個容器內，照舊用滑桿原值。 */
(function () {
  var REF = 30, MIN = 14;
  function slider() {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--v61-nfs'));
    return v || REF;
  }
  function textSize(box) {
    var t = box.querySelector('.tp-text');
    return t ? parseFloat(getComputedStyle(t).fontSize) : 0;
  }
  function apply() {
    var s = slider();
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
      var box = document.getElementById(id); if (!box) return;
      var ts = textSize(box); if (!ts) return;
      var v = Math.max(MIN, Math.round(s * ts / REF * 10) / 10) + 'px';
      if (box.style.getPropertyValue('--v129-nfs') !== v) box.style.setProperty('--v129-nfs', v);
    });
  }
  var pend = 0;
  function soon() { clearTimeout(pend); pend = setTimeout(apply, 60); }
  /* 換頁、開關全螢幕、A−／A+、拖滑桿、視窗大小改變都重算 */
  document.addEventListener('input', soon, true);
  document.addEventListener('click', soon, true);
  window.addEventListener('resize', soon);
  if (window.MutationObserver) {
    var mo = new MutationObserver(soon);
    var watch = function () {
      ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el && !el.__v129) { el.__v129 = 1; mo.observe(el, { childList: true }); } });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { watch(); soon(); }); else { watch(); soon(); }
  }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/167_galaxy-ui-js.js ════ */
try {
/* V130：介面零件動畫的觸發（樣式見 155_galaxy-ui-css.css）。只加 class／插裝飾用的點點，不讀寫任何資料。
   ④ 作業完成格：080 點一下會整張表重畫，所以先記下點的是哪一格（data-v84），重畫後替那格加 .v130-just 播一次動畫。
   ⑤ 同步中：122 只改「同步中…」的文字，這裡看到這幾個字就在旁邊插墨點，不是同步中就拿掉。 */
(function () {
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#v84-hw button.v84-c[data-v84]');
    if (!b) return;
    var key = b.getAttribute('data-v84');
    setTimeout(function () {
      var nb = document.querySelector('#v84-hw button.v84-c[data-v84="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
      if (!nb || nb === b) return;   /* 沒重畫（例如取消時按了「取消」）就不播 */
      nb.classList.add('v130-just');
      setTimeout(function () { nb.classList.remove('v130-just'); }, 600);
    }, 0);
  }, true);

  /* ② 段落頁籤水波＋③ 大按鈕下陷：pointerdown 加 .v130-press，放開／取消／滑出就拿掉。手指、滑鼠、Apple Pencil 都會觸發。 */
  var PRESS = '.wk-sec-btn, .wk-control-bar .wk-proj-btn';
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest(PRESS);
    if (!b) return;
    b.classList.add('v130-press');
    if (b.classList.contains('wk-sec-btn')) {
      var r = b.getBoundingClientRect(), w = document.createElement('span');
      w.className = 'v130-wave'; w.style.left = (e.clientX - r.left) + 'px'; w.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(w); setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 600);
    }
    var up = function () {
      setTimeout(function () { b.classList.remove('v130-press'); }, 60);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { b.removeEventListener(t, up); });
    };
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { b.addEventListener(t, up); });
  }, true);

  var SEL = '.v107-st, .sy-row > b', queued = false;
  function ink() {
    queued = false;
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i], busy = /^同步中/.test(el.textContent || ''), nx = el.nextElementSibling;
      var has = nx && nx.classList.contains('v130-ink');
      if (busy && !has) {
        var s = document.createElement('span');
        s.className = 'v130-ink'; s.setAttribute('aria-hidden', 'true');
        s.innerHTML = '<i></i><i></i><i></i><i></i>';
        el.parentNode.insertBefore(s, el.nextSibling);
      } else if (!busy && has) nx.parentNode.removeChild(nx);
    }
  }
  function soon() { if (!queued) { queued = true; setTimeout(ink, 30); } }
  function start() {
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, characterData: true });
    soon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/168_v136-read-js.js ════ */
try {
/* V136 閱讀測驗「原文全螢幕」（老師 10/18：文言文閱讀測驗要有只顯示題目原文的全螢幕頁，專心講解文章）。
   ・對象：習作／A卷題組的 .aq-psg（內文 .aq-psgb）、補充講義左右版的 .hd-split-psg。
   ・只在「文言文」題幹加按鈕：文言虛詞比例高、白話常用字（的、了、們…）比例低。判斷時語譯（補充講義 .hd-note、習作／A卷的「語譯」展開區 details）不算。
   ・按鈕不改投影片順序（不新增頁），點了蓋一層全螢幕只顯示原文；✕ 或 Esc 關閉，A−／A+ 調字級。 */
(function () {
  'use strict';
  var WY = /[之乎者也矣焉哉曰其而於以則乃亦豈蓋夫兮爾吾汝矣邪耶]/g;
  var BH = /[的了們這那嗎呢很都沒]/g;
  /* 自動判斷不準的個別題幹（比對去標點後的開頭文字）：10/18 全課 80 頁題組逐一核對後指定 */
  var FORCE_ON = ['龍焙今年絕品'];                  /* 〈珍奶〉補充講義：蘇軾、黃庭堅茶詞（詞裡有「減了」） */
  var FORCE_OFF = ['統測試題精選作者', '主旨修正連鎖飲料'];   /* 〈論語選〉統測表格、〈珍奶〉習作公文 */
  function plain(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('.hd-note,details,.rd-fsbtn,.aq-psgh,.tp-gd,figcaption,.aq-imgtip').forEach(function (x) { x.remove(); });
    return (c.textContent || '').replace(/[\s　，。、；：「」『』！？（）()…—─,.\d]/g, '');
  }
  function isClassical(t) {
    if (t.length < 20) return false;
    var wy = (t.match(WY) || []).length, bh = (t.match(BH) || []).length;
    return bh / t.length < 0.012 && (wy / t.length >= 0.03 || bh === 0);   /* 詩詞虛詞少：完全沒有白話常用字也算 */
  }
  var scale = 1;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* V136 二改（老師 10/18）：
     ① 標題＝題號＋頁碼：A卷「A卷 第 N 題」（同一篇題組「第 a～b 題」）、習作「習作 ＋小標」、補充講義「補充講義 ＋標題＋頁碼」。
     ② 一句一句排：原文一句、下面接該句語譯（不同顏色），語譯預設收起，點句子才顯示；上方「全部語譯」一次開關。
        語譯只用教材原有的：習作／A卷題幹內的「語譯」展開區、A卷的語譯欄（aQuiz.trans）、補充講義的「語譯：」說明。沒有語譯就只逐句列原文。
        原文與語譯句數不同時，依字數比例自動把相鄰句子合併對齊（1:1、2:1、1:2）。 */
  function curSlide() { return (typeof wkSlides !== 'undefined' && typeof wkIdx !== 'undefined') ? wkSlides[wkIdx] : null; }
  function label(src) {
    var sl = src.closest('.wk-slide'), sd = curSlide();
    if (sl && sl.classList.contains('wks-aq')) {
      if (sd && sd.type === 'aq' && sd.q) {
        var ns = [], i = wkIdx;
        while (i > 0 && wkSlides[i - 1].type === 'aq' && wkSlides[i - 1].q.psg === sd.q.psg) i--;
        for (; i < wkSlides.length && wkSlides[i].type === 'aq' && wkSlides[i].q.psg === sd.q.psg; i++) ns.push(wkSlides[i].q.n);
        return 'A卷　第 ' + (ns.length > 1 ? ns[0] + '～' + ns[ns.length - 1] : ns[0]) + ' 題';
      }
      var no = sl.querySelector('.aq-no'); return 'A卷　' + (no ? no.textContent.replace(/\s*\/.*$/, '') : '');
    }
    if (sl && sl.classList.contains('wks-work')) {
      var h = sl.querySelector('.wk-head'), ht = h ? h.textContent.replace(/[（(]每[題格][^）)]*[）)]/g, '').replace(/\s+/g, ' ').trim() : '';
      var m = /閱讀測驗.*$/.exec(ht); return '習作　' + (m ? m[0].replace(/\s+/g, '') : ht);
    }
    if (sl && sl.classList.contains('wks-hd2')) {
      var t = sl.querySelector('.hd-title'), pg = sl.querySelector('.hd-page');
      return '補充講義　' + (t ? t.textContent.replace(/[\s　]+/g, ' ').trim() : '') + (pg ? '　' + pg.textContent.replace(/^補充講義\s*/, '') : '');
    }
    return '原　文';
  }
  function transOf(src) {
    var d = src.querySelector('details');
    if (d) { var c = d.cloneNode(true); var s = c.querySelector('summary'); if (s) s.remove(); return c.textContent; }
    var sd = curSlide();
    if (sd && sd.type === 'aq' && sd.q && sd.q.trans && src.closest('.wks-aq')) return String(sd.q.trans).replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
    var sl = src.closest('.wk-slide'), hn = sl ? [].filter.call(sl.querySelectorAll('.hd-note'), function (x) { return /^\s*語譯/.test(x.textContent); }) : [];
    if (hn.length) return hn.map(function (x) { return x.textContent.replace(/^\s*語譯：?/, ''); }).join('');
    return '';
  }
  function sentences(t) {
    var out = [], buf = '', q = 0;
    t = String(t).replace(/[ \t\r\n　]+/g, '');
    for (var i = 0; i < t.length; i++) {
      var ch = t[i]; buf += ch;
      if (ch === '「' || ch === '『') q++; else if ((ch === '」' || ch === '』') && q > 0) q--;
      var end = /[。！？?!]/.test(ch) && !/[。！？?!」』）)]/.test(t[i + 1] || '');   /* 半形 ?! 也算句尾（〈世說〉A卷有半形問號） */
      if (/[」』）)]/.test(ch) && /[。！？?!]/.test(t[i - 1] || '') && !/[」』）)]/.test(t[i + 1] || '')) end = true;
      if (end) { out.push(buf); buf = ''; }
    }
    if (buf.replace(/[「」『』（）()…—]/g, '').length) out.push(buf);
    return out;
  }
  /* 依字數比例對齊（Gale–Church 簡化版）：回傳 [[原文句…], [語譯句…]] 的配對 */
  function align(A, B) {
    var la = A.map(function (s) { return s.length; }), lb = B.map(function (s) { return s.length; });
    var r = (lb.reduce(function (a, b) { return a + b; }, 0) || 1) / (la.reduce(function (a, b) { return a + b; }, 0) || 1);
    var n = A.length, m = B.length, INF = 1e9, D = [], P = [], i, j;
    for (i = 0; i <= n; i++) { D.push([]); P.push([]); for (j = 0; j <= m; j++) { D[i].push(INF); P[i].push(null); } }
    D[0][0] = 0;
    var moves = [[1, 1, 0], [2, 1, 0.35], [1, 2, 0.35], [1, 0, 1.2], [0, 1, 1.2]];   /* 1:0／0:1＝題幹後附的說明、選項等對不到語譯的句子，單獨列出不硬配 */
    for (i = 0; i <= n; i++) for (j = 0; j <= m; j++) {
      if (D[i][j] >= INF) continue;
      moves.forEach(function (mv) {
        var a = i + mv[0], b = j + mv[1]; if (a > n || b > m) return;
        var x = 0, y = 0, k; for (k = i; k < a; k++) x += la[k]; for (k = j; k < b; k++) y += lb[k];
        var c = D[i][j] + Math.abs(y - r * x) / (y + r * x + 1) + mv[2];
        if (c < D[a][b]) { D[a][b] = c; P[a][b] = [i, j]; }
      });
    }
    if (D[n][m] >= INF) return null;
    var pairs = []; i = n; j = m;
    while (i > 0 || j > 0) { var p = P[i][j]; pairs.unshift([A.slice(p[0], i), B.slice(p[1], j)]); i = p[0]; j = p[1]; }
    return pairs;
  }
  function open(src) {
    close();
    var box = document.createElement('div'); box.id = 'rd-fs';
    box.innerHTML = '<div class="rd-bar"><span class="rd-tt"></span><span class="rd-sp"></span>' +
      '<button type="button" data-a="t" class="rd-tall">全部語譯</button>' +
      '<button type="button" data-a="-">A−</button><button type="button" data-a="+">A+</button>' +
      '<button type="button" data-a="x">✕ 關閉</button></div><div class="rd-body"><div class="rd-txt"></div></div>';
    box.querySelector('.rd-tt').textContent = label(src);
    var txt = box.querySelector('.rd-txt');
    var c = src.cloneNode(true);
    c.querySelectorAll('.hd-note,details,.rd-fsbtn,.aq-psgh,.aq-imgtip,.tp-gd').forEach(function (x) { x.remove(); });
    var notes = [].map.call(c.querySelectorAll('.aq-src'), function (x) { x.remove(); return x.outerHTML; }).join('');
    c.querySelectorAll('br').forEach(function (x) { x.replaceWith('\n'); });
    /* 出處「（〈篇名〉）」「（《書名》）」之後的文字（選項說明、補充）不是原文：移到最下面附註，不拿去配語譯 */
    var raw = c.textContent, cut = raw.search(/[（(][〈《][^）)]{1,30}[〉》][^）)]{0,20}[）)]/), tail = '';
    if (cut > 20) {   /* 只有出處後面已經沒有文字、或接的是①②說明時才切；(甲)(乙)兩篇中間的出處不切 */
      var after = raw.slice(cut).replace(/^[（(][^）)]*[）)]/, '').replace(/^[\s　]+/, '');
      if (!after || /^[①-⑳]/.test(after)) { tail = raw.slice(cut); raw = raw.slice(0, cut); }
    }
    if (tail) notes = '<div class="aq-src">' + esc(tail.replace(/[ \t\r\n　]+/g, '')) + '</div>' + notes;
    raw = raw.replace(/^[\s　]*[^。！？]{0,40}下文[^。！？：]{0,30}：/, '');   /* 開頭的題目說明（如「小陳在閱讀完下文後……請選出正確的選項：」）不算原文 */
    var A = sentences(raw), tr = transOf(src), B = tr ? sentences(tr) : [];
    var pairs = (A.length && B.length) ? align(A, B) : null;
    if (!pairs) pairs = A.map(function (s) { return [[s], []]; });
    txt.innerHTML = pairs.map(function (p) {
      var t = p[1].join('');
      return '<div class="rd-pair' + (t ? ' has-t' : '') + '"><div class="rd-o">' + esc(p[0].join('')) + '</div>' +
        (t ? '<div class="rd-t">' + esc(t) + '</div>' : '') + '</div>';
    }).join('') + (notes ? '<div class="rd-notes">' + notes + '</div>' : '') +
      (B.length ? '' : '<div class="rd-none">（本篇教材沒有語譯）</div>');
    if (!B.length) box.querySelector('.rd-tall').style.display = 'none';
    box.style.setProperty('--rd-scale', scale);
    box.addEventListener('click', function (e) {
      var pr = e.target.closest && e.target.closest('.rd-pair.has-t');
      if (pr) { pr.classList.toggle('show'); return; }
      var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
      if (a === 'x') return close();
      if (a === 't') {
        var all = box.querySelectorAll('.rd-pair.has-t'), on = [].some.call(all, function (x) { return !x.classList.contains('show'); });
        all.forEach(function (x) { x.classList.toggle('show', on); }); e.target.textContent = on ? '收起語譯' : '全部語譯'; return;
      }
      scale = Math.max(0.6, Math.min(1.8, scale + (a === '+' ? 0.1 : -0.1)));
      box.style.setProperty('--rd-scale', scale);
    });
    document.body.appendChild(box);
  }
  function close() { var b = document.getElementById('rd-fs'); if (b) b.remove(); }
  /* Esc 只關原文（捕獲階段先攔，不讓投影全螢幕跟著關）；方向鍵在原文頁不換投影片 */
  document.addEventListener('keydown', function (e) {
    if (!document.getElementById('rd-fs')) return;
    if (e.key === 'Escape') { close(); e.stopImmediatePropagation(); e.preventDefault(); }
    else if (/^Arrow(Left|Right)$|^PageUp$|^PageDown$/.test(e.key)) { e.stopImmediatePropagation(); }
  }, true);

  function mark(root) {
    if (!root) return;
    root.querySelectorAll('.aq-psg, .hd-split-psg').forEach(function (p) {
      if (p.getAttribute('data-rd') != null) return;
      var body = p.classList.contains('aq-psg') ? p.querySelector('.aq-psgb') : p;
      var t = body ? plain(body) : '', head = t.slice(0, 30);
      var ok = !!body && (FORCE_ON.some(function (k) { return head.indexOf(k) >= 0; }) ||
        (isClassical(t) && !FORCE_OFF.some(function (k) { return head.indexOf(k) >= 0; })));
      p.setAttribute('data-rd', ok ? '1' : '0');
      if (!ok) return;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rd-fsbtn'; b.textContent = '⛶ 原文全螢幕';
      b.addEventListener('click', function (e) { e.stopPropagation(); open(body); });
      var h = p.querySelector('.aq-psgh');
      if (h) h.insertAdjacentElement('afterend', b); else p.insertBefore(b, p.firstChild);
    });
    /* V136（老師 10/18）：A卷題號像頁碼一樣浮在左上角，往下捲也看得到第幾題 */
    root.querySelectorAll('.wks-aq').forEach(function (sl) {
      if (sl.querySelector(':scope > .aq-float')) return;
      var no = sl.querySelector('.aq-no'); if (!no) return;
      var f = document.createElement('div'); f.className = 'aq-float';
      f.textContent = 'A卷　' + no.textContent.replace(/\s*\/.*$/, '').trim();
      sl.insertBefore(f, sl.firstChild);
      dragable(f);
    });
    placeFloat(); updFloat();
  }
  /* 老師 10/18：題號浮框可以拖到任何位置；一般畫面、全螢幕各記一個位置（只存在這台瀏覽器，鍵名 v136_aqf_pos） */
  function posKey(f) { return f.closest('#wkfs-body') ? 'fs' : 'n'; }
  function loadPos() { try { return JSON.parse(localStorage.getItem('v136_aqf_pos') || '{}') || {}; } catch (e) { return {}; } }
  function savePos(o) { try { localStorage.setItem('v136_aqf_pos', JSON.stringify(o)); } catch (e) {} }
  function applyPos(f) {
    var p = loadPos()[posKey(f)]; if (!p) return;
    f.style.left = Math.max(0, Math.min(innerWidth - 60, p.x)) + 'px'; f.style.top = Math.max(0, Math.min(innerHeight - 30, p.y)) + 'px';
  }
  function dragable(f) {
    applyPos(f);
    var sx, sy, ox, oy, on = false;
    f.addEventListener('pointerdown', function (e) {
      on = true; f.classList.add('drag'); f.setPointerCapture(e.pointerId);
      var r = f.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; e.preventDefault(); e.stopPropagation();
    });
    f.addEventListener('pointermove', function (e) {
      if (!on) return;
      f.style.left = Math.max(0, Math.min(innerWidth - f.offsetWidth, ox + e.clientX - sx)) + 'px';
      f.style.top = Math.max(0, Math.min(innerHeight - f.offsetHeight, oy + e.clientY - sy)) + 'px';
    });
    function end(e) {
      if (!on) return; on = false; f.classList.remove('drag');
      var o = loadPos(); o[posKey(f)] = { x: parseFloat(f.style.left) || 0, y: parseFloat(f.style.top) || 0 }; savePos(o);
      document.querySelectorAll('.aq-float').forEach(function (g) { if (g !== f) applyPos(g); });
    }
    f.addEventListener('pointerup', end); f.addEventListener('pointercancel', end);
    f.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  /* 一般畫面：浮框對齊投影框左緣（側欄寬度會變）；全螢幕固定左上 */
  function placeFloat() {
    var a = document.getElementById('wk-slide-area'); if (!a) return;
    var r = a.getBoundingClientRect(); document.documentElement.style.setProperty('--aqf-left', Math.max(8, Math.round(r.left) + 8) + 'px');
  }
  window.addEventListener('resize', placeFloat);
  /* 題目本身的標題列（「A卷 第 N 題 / 共 M 題」）還看得到時不顯示浮框，捲出畫面後才出現（避免重複、也不壓到網站標題列） */
  function updFloat() {
    document.querySelectorAll('.aq-float').forEach(function (f) {
      var sl = f.parentElement, top = sl && sl.querySelector('.as-top'); if (!top) return;
      var fs = sl.closest('#wkfs-body'), lim = fs ? fs.getBoundingClientRect().top : 0;
      f.classList.toggle('on', top.getBoundingClientRect().bottom < lim + 4);
    });
  }
  document.addEventListener('scroll', function () { requestAnimationFrame(updFloat); }, true);
  function scan() { mark(document.getElementById('wk-slide-area')); mark(document.getElementById('wkfs-body')); }
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { clearTimeout(mo.t); mo.t = setTimeout(scan, 60); });
    ['wk-slide-area', 'wkfs-body'].forEach(function (id) { var el = document.getElementById(id); if (el) mo.observe(el, { childList: true, subtree: true }); });
  }
  scan();
  window.V136READ = { isClassical: function (el) { return isClassical(plain(el)); }, open: open, close: close };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/169_v136-ui-js.js ════ */
try {
/* V136 介面調整（老師 10/18）
   ① 基礎練習、進階練習移到「賞析」後面（包一層 wkParseSlides，本檔載入最晚＝實際生效的最外層）。
      只搬 iquiz／iadv 這一段，搬完把「習作答案總覽」的 slideIdx 依新位置重新對應（不然點答案會跳錯頁）。
   ② 右側「註釋小考」邊籤收進「班級進度」面板（面板標題列多一個「📝 註釋小考」鈕，功能同原邊籤）。
   ③ 全螢幕「關閉浮框」從右側邊籤移到下方左右換頁列；換頁列變矮（樣式在 159_v136-ui-css）。
   ④ 〈論語選〉課名的破折號只顯示成「——」（佔兩格）。課名本身是資料的鑰匙（班級進度、日曆、小考紀錄都用它存），一個字都不改，只改畫面上的字。 */
(function () {
  'use strict';
  /* ① */
  if (typeof wkParseSlides === 'function') {
    var _parse = wkParseSlides;
    wkParseSlides = function (key) {
      var slides = _parse.apply(this, arguments);
      var ex = slides.map(function (s, i) { return (s.type === 'iquiz' || s.type === 'iadv') ? i : -1; }).filter(function (i) { return i >= 0; });
      var app = -1; slides.forEach(function (s, i) { if (s.type === 'info' && s.kind === 'appreciation') app = i; });
      if (!ex.length || app < 0 || ex[0] < app) return slides;
      for (var k = 1; k < ex.length; k++) if (ex[k] !== ex[k - 1] + 1) return slides;   /* 不連續就不動（保險） */
      var order = slides.map(function (s, i) { return i; }).filter(function (i) { return ex.indexOf(i) < 0; });
      var at = order.indexOf(app) + 1;
      order = order.slice(0, at).concat(ex, order.slice(at));
      var pos = {}; order.forEach(function (oldI, newI) { pos[oldI] = newI; });
      var out = order.map(function (i) { return slides[i]; });
      out.forEach(function (s) { if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx != null && pos[t.slideIdx] != null) t.slideIdx = pos[t.slideIdx]; }); });
      return out;
    };
  }

  /* ② */
  function nqInPanel() {
    var head = document.querySelector('#cls-panel .cls-head'), x = head && head.querySelector('.cls-x');
    if (!head || head.querySelector('.v136-nq')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'v136-nq'; b.textContent = '📝 註釋小考';
    b.onclick = function () {
      if (typeof clsToggle === 'function' && document.getElementById('cls-panel').classList.contains('open')) clsToggle();
      var t = document.getElementById('note-quiz-tab');
      if (t && typeof t.onclick === 'function') t.onclick(); else if (typeof nqToggle === 'function') nqToggle();
    };
    head.insertBefore(b, x);
  }

  /* ③ */
  function blueToFooter() {
    var b = document.getElementById('tp-close-blue-tab'), f = document.querySelector('#wk-fullscreen .wkfs-footer');
    if (!b || !f || b.parentNode === f) return;
    b.textContent = '✕ 浮框';
    f.appendChild(b);
  }

  /* ④ */
  var KEY_DASH = /(論語選)—(子路)/g;
  function fixDash(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n, hit = [];
    while ((n = w.nextNode())) if (n.data.indexOf('選—子') >= 0 && !(n.parentElement && n.parentElement.closest('textarea,script,style,option,[contenteditable]'))) hit.push(n);
    hit.forEach(function (t) { t.data = t.data.replace(KEY_DASH, '$1——$2'); });
    /* V210：下拉選單只改「顯示」（label），不改 option.text——註釋小考的記錄、編號、日曆開考都用 option.text 找課名，改了會找不到〈論語選〉 */
    root.querySelectorAll && root.querySelectorAll('option').forEach(function (o) { if (o.text.indexOf('選—子') >= 0) o.label = o.text.replace(KEY_DASH, '$1——$2'); });
  }
  function fixAll() { fixDash(document.body); }

  function init() { nqInPanel(); blueToFooter(); fixAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  if (window.MutationObserver) {
    var t = 0, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(fixAll, 80); });
    mo.observe(document.body, { childList: true, subtree: true, characterData: false });
  }
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/170_v137-ink-js.js ════ */
try {
/* V137 投影畫筆改版（老師 10/18）
   ① 全螢幕時畫筆工具列一直固定在下方換頁列（不用先點右側「畫筆」邊籤）。
   ② 新增「觸控筆」模式＝可以點頁面上的互動按鈕（畫布不攔觸控）；一進全螢幕預設就是觸控筆。
   ③ 直接點下方顏色（或螢光筆、橡皮擦）就進入畫筆模式，顏色預設「細」（163 已把顏色筆固定細＝3）。
      切回觸控筆時筆跡保留（舊版關閉畫筆會清除本頁，改由「清除」鈕清除）。
   ④ 筆跡跟著頁面捲動：點的座標改記「頁面內容座標」（加上投影片目前的捲動量），重畫時扣回捲動量；
      往下滑時筆跡貼著原本的文字往上移，移出畫面就看不到（畫布本身只蓋投影內容區）。
      舊格式的點（只有 x、y 比例）照舊畫在固定位置。字級改變後版面重排，筆跡位置不會跟著重排。
   實作：以 window.* 重新指定 015_main 的 wkInkPoint／wkInkRedraw（實際生效版本＝本檔），
        包 wkInkColor／wkInkHighlighter（在 036、163 的包裝外層），不改舊檔。 */
(function () {
  'use strict';
  var st = window.wkInkState; if (!st) return;
  function $(id) { return document.getElementById(id); }
  function fsOpen() { var f = $('wk-fullscreen'); return !!f && getComputedStyle(f).display !== 'none'; }
  function scrollers() { return [document.querySelector('#wkfs-body .wk-slide'), $('wkfs-body')].filter(Boolean); }
  function scrollXY() { var x = 0, y = 0; scrollers().forEach(function (s) { x += s.scrollLeft || 0; y += s.scrollTop || 0; }); return { x: x, y: y }; }

  /* ④ 座標：內容座標 cx、cy（像素）；同時給 x、y 比例（相容 015 去重與 036 橡皮擦，重畫時會更新成目前位置） */
  window.wkInkPoint = function (e) {
    var r = st.canvas.getBoundingClientRect(), s = scrollXY();
    var px = e.clientX - r.left, py = e.clientY - r.top;
    return { cx: px + s.x, cy: py + s.y, x: px / Math.max(1, r.width), y: py / Math.max(1, r.height) };
  };
  window.wkInkRedraw = function () {
    var c = st.canvas, ctx = st.ctx; if (!c || !ctx) return;
    var r = c.getBoundingClientRect(), s = scrollXY();
    ctx.clearRect(0, 0, r.width, r.height);
    (wkInkCurrentStrokes() || []).forEach(function (k) {
      var P = k.points; if (!P || P.length < 2) return;
      ctx.beginPath(); ctx.strokeStyle = k.color || '#c0392b'; ctx.lineWidth = k.size || 3;
      P.forEach(function (p, i) {
        var X, Y;
        if (p.cx != null) { X = p.cx - s.x; Y = p.cy - s.y; p.x = X / Math.max(1, r.width); p.y = Y / Math.max(1, r.height); }
        else { X = p.x * r.width; Y = p.y * r.height; }
        if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y);
      });
      ctx.stroke();
    });
  };
  document.addEventListener('scroll', function (e) {
    if (!fsOpen() || !e.target || !e.target.closest || !e.target.closest('#wkfs-body')) return;
    window.wkInkRedraw();   /* 直接重畫（捲動事件本來就跟畫面更新同步；requestAnimationFrame 在背景分頁不會跑） */
  }, true);

  /* ②③ 模式：pen＝畫（畫布攔觸控）；不是 pen＝觸控筆（可點按鈕）。不呼叫 wkInkToggle（它關閉時會清除本頁） */
  function setPen(on) {
    var layer = $('wk-ink-layer'); if (!layer) return;
    st.active = !!on; if (!on) st.drawing = false;
    layer.classList.toggle('active', !!on);
    var tb = $('v137-touch'); if (tb) tb.classList.toggle('on', !on);
    if (!on) document.querySelectorAll('.wk-ink-color').forEach(function (x) { x.classList.remove('on'); });
    if (!on) { var er = $('wk-ink-eraser'); if (er && er.classList.contains('on')) er.click(); }
    fit();
  }
  /* 全螢幕時畫記層放到 body 最上層（蓋過浮框，觸控筆模式畫布不攔觸控），畫布只蓋標題列～換頁列之間 */
  function place(open) {
    var layer = $('wk-ink-layer'); if (!layer) return;
    if (open) {
      if (layer.parentNode !== document.body) { layer._v137p = layer.parentNode; layer._v137n = layer.nextSibling; document.body.appendChild(layer); }
      layer.style.position = 'fixed'; layer.style.inset = '0'; layer.style.zIndex = '12500';
      document.body.classList.add('v137-fs');
    } else {
      if (layer._v137p) { try { layer._v137p.insertBefore(layer, layer._v137n); } catch (e) { layer._v137p.appendChild(layer); } layer._v137p = null; }
      layer.style.position = ''; layer.style.inset = ''; layer.style.zIndex = '';
      document.body.classList.remove('v137-fs');
    }
  }
  function fit() {
    var fs = $('wk-fullscreen'), canvas = $('wk-ink-canvas'), layer = $('wk-ink-layer'); if (!fs || !canvas || !layer) return;
    if (fsOpen()) {
      var head = fs.querySelector('.wkfs-header'), foot = fs.querySelector('.wkfs-footer');
      var top = head ? head.getBoundingClientRect().bottom : 0, f = foot ? foot.getBoundingClientRect().top : innerHeight;
      canvas.style.top = top + 'px'; canvas.style.bottom = 'auto'; canvas.style.height = Math.max(1, f - top) + 'px';
      layer.style.setProperty('--v56-foot-h', Math.max(32, Math.round(innerHeight - f)) + 'px');
    }
    if (typeof wkInkSetupCanvas === 'function') wkInkSetupCanvas();
  }

  function initBar() {
    var left = $('wk-ink-grp-l'); if (!left || $('v137-touch')) return;
    var t = document.createElement('button'); t.type = 'button'; t.id = 'v137-touch'; t.className = 'wk-ink-btn on'; t.textContent = '👆 觸控筆';
    t.title = '觸控筆：可以點頁面上的按鈕；點右邊顏色就能畫';
    t.addEventListener('click', function () { setPen(false); });
    left.insertBefore(t, left.firstChild);
    var c = document.createElement('button'); c.type = 'button'; c.id = 'v137-clear'; c.className = 'wk-ink-btn'; c.textContent = '清除';
    c.title = '清除本頁筆跡'; c.addEventListener('click', function () { if (typeof wkInkClear === 'function') wkInkClear(); });
    left.appendChild(c);
    var er = $('wk-ink-eraser'); if (er) er.addEventListener('click', function () { if (er.classList.contains('on') && !st.active) setPen(true); });
  }
  function wrapColors() {
    ['wkInkColor', 'wkInkHighlighter'].forEach(function (n) {
      var f = window[n]; if (typeof f !== 'function' || f._v137) return;
      window[n] = function () { if (!st.active) setPen(true); return f.apply(this, arguments); };
      window[n]._v137 = true;
    });
  }

  /* 進出全螢幕：用 #wk-fullscreen 的 style 變化偵測（wkOpenProj／wkCloseProj 都改 display） */
  var wasOpen = false;
  function sync() {
    var open = fsOpen();
    if (open === wasOpen) return; wasOpen = open;
    place(open);
    setPen(false);              /* 進全螢幕預設觸控筆；離開時也回觸控筆 */
    setTimeout(fit, 60);
  }
  function boot() {
    initBar(); wrapColors();
    var f = $('wk-fullscreen');
    if (f && window.MutationObserver) new MutationObserver(sync).observe(f, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('resize', function () { if (fsOpen()) fit(); });
    /* 換頁後重畫（筆跡依頁分開存，捲動量歸零） */
    if (typeof wkRenderCurrent === 'function' && !wkRenderCurrent._v137) {
      var r0 = wkRenderCurrent;
      wkRenderCurrent = function () { var v = r0.apply(this, arguments); setTimeout(function () { if (fsOpen()) window.wkInkRedraw(); }, 80); return v; };
      wkRenderCurrent._v137 = true;
    }
    sync();
  }
  /* 036 的工具列重組、163 的包裝都在 DOMContentLoaded 之後，要排在它們後面 */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 30); });
  else setTimeout(boot, 30);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/171_v155-b1l7-10-js.js ════ */
try {
(function () {
  /* V155：第一冊 L07～L10 上架（資料在 data/lessons/30～32.js；〈桃花源記〉07.js 補技高版課文）
     - 選讀古文：〈樂府詩選—長干行〉排在〈論語選〉後面（第一冊 L07）。
     - 白話文：〈茫茫人海中的一名女孩〉（L08）、〈極短篇小說選〉（L10）排在〈火車線〉後面；封面補「第一冊 第 N 課」。 */
  function after(arr, prev, keys) {
    keys.forEach(function (k) { var i = arr.indexOf(k); if (i >= 0) arr.splice(i, 1); });
    var at = arr.indexOf(prev);
    arr.splice.apply(arr, [at < 0 ? arr.length : at + 1, 0].concat(keys));
  }
  after(WK_EXTRA, '論語選—子路曾皙冉有公西華侍坐', ['樂府詩選—長干行']);
  after(WK_PROSE, '臺灣最美麗的火車線', ['茫茫人海中的一名女孩', '極短篇小說選']);

  var NO = { '茫茫人海中的一名女孩': '第一冊　第 8 課', '極短篇小說選': '第一冊　第 10 課' };
  var _prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _prev.apply(this, arguments);
    if (slide && slide.type === 'cover' && NO[slide.key] && h.indexOf('wks-pcover') >= 0 && h.indexOf('pc-no') < 0) {
      h = h.replace('<span class="pc-cat">白話文選讀</span>', '<span class="pc-cat">白話文選讀</span><span class="pc-no">' + NO[slide.key] + '</span>');
    }
    return h;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/172_zuowen-js.js ════ */
try {
/* V162 作文教學（老師 10/27）：側欄第四類「作文教學」，放作文四步驟投影片（完整版／一節課）。
   投影片資料在 data/zuowen/decks.js（教學系統 scripts/RayOclass/zuowen_build_20261027.py 產生），第一次點才載入。
   自己管翻頁與全螢幕，不經過 wkRenderCurrent：不寫班級進度、不碰任何老師資料。
   作文模式時把 wkKey、wkSlides 清空，其他外掛（進度、修辭、畫記…）看到的是「沒有開課文」。
   投影片裡有 data-build-in 的元素：按 ▶／→ 先逐條出現，全部出現後才換下一頁。 */
(function () {
  var VER = '20261028c';
  /* V164（老師 10/27）：分科——冷凍空調科、建築科各一套，例子都換成該科的 */
  var LIST = [['cold-full', '冷凍空調科（完整版）'], ['cold-short', '冷凍空調科（一節課）'],
              ['arch-full', '建築科（完整版）'], ['arch-short', '建築科（一節課）']];
  var st = { on: false, deck: null, idx: 0, step: 0 };

  function load(cb) {
    if (window.ZW_DECKS) return cb();
    var s = document.createElement('script');
    s.src = 'data/zuowen/decks.js?v=' + VER;
    s.onload = cb;
    s.onerror = function () { alert('作文教學資料載入失敗，請重新整理再試一次。'); };
    document.head.appendChild(s);
  }
  function deck() { return window.ZW_DECKS[st.deck]; }

  function orders(root) {
    var seen = {};
    root.querySelectorAll('.zw-stage [data-build-in]').forEach(function (el) {
      var n = parseInt((el.getAttribute('data-build-in') || '').split(/\s+/)[1], 10) || 1;
      el.setAttribute('data-zw-o', n); seen[n] = 1;
    });
    return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; });
  }
  function applyBuild(root) {
    if (!root) return 0;
    var os = orders(root);
    if (st.step > os.length) st.step = os.length;
    var shown = os.slice(0, st.step);
    root.querySelectorAll('.zw-stage [data-zw-o]').forEach(function (el) {
      el.classList.toggle('zw-hidden', shown.indexOf(+el.getAttribute('data-zw-o')) < 0);
    });
    return os.length;
  }

  function fit(root, full) {
    var stage = root && root.querySelector('.zw-stage');
    var sec = stage && stage.querySelector('section');
    if (!sec) return;
    var w = root.clientWidth, s;
    if (full) {
      s = Math.min(w / 1920, (root.clientHeight || window.innerHeight) / 1080);
      stage.style.width = Math.floor(1920 * s) + 'px';
    } else {
      stage.style.width = '';
      s = stage.clientWidth / 1920;
    }
    stage.style.height = Math.floor(1080 * s) + 'px';
    sec.style.transform = 'scale(' + s + ')';
  }

  function counterText() { return (st.idx + 1) + ' / ' + deck().slides.length; }
  function activeSec() {
    var a = null;
    deck().sections.forEach(function (s) { if (s.idx <= st.idx) a = s; });
    return a;
  }
  function markSecs(sel) {
    var a = activeSec();
    document.querySelectorAll(sel).forEach(function (b) {
      var on = a && +b.dataset.idx === a.idx;
      b.classList.toggle(sel === '.wk-sec-btn' ? 'wk-sec-active' : 'active', !!on);
    });
  }
  function secButtons(cls) {
    return deck().sections.map(function (s) {
      return '<button class="' + cls + '" data-idx="' + s.idx + '" onclick="zwGoto(' + s.idx + ')">' + s.label + '</button>';
    }).join('');
  }

  function render() {
    var html = '<div class="wk-slide zw-slide"><div class="zw-stage">' + deck().slides[st.idx] + '</div></div>';
    var area = document.getElementById('wk-slide-area');
    if (area) { area.innerHTML = html; fit(area, false); applyBuild(area); }
    var cnt = document.getElementById('wk-counter');
    if (cnt) cnt.textContent = counterText();
    markSecs('.wk-sec-btn');
    if (wkProjMode) {
      var fsBody = document.getElementById('wkfs-body');
      if (fsBody) { fsBody.innerHTML = html; fit(fsBody, true); applyBuild(fsBody); }
      var fc = document.getElementById('wkfs-counter');
      if (fc) fc.textContent = counterText();
      var ft = document.getElementById('wkfs-title');
      if (ft) ft.textContent = deck().name + ' ' + counterText();
      markSecs('.wkfs-sec-btn');
    }
  }
  function rebuildOnly() {
    applyBuild(document.getElementById('wk-slide-area'));
    if (wkProjMode) applyBuild(document.getElementById('wkfs-body'));
  }

  function next() {
    var total = orders(document.getElementById(wkProjMode ? 'wkfs-body' : 'wk-slide-area'));
    if (st.step < total.length) { st.step++; rebuildOnly(); return; }
    if (st.idx < deck().slides.length - 1) { st.idx++; st.step = 0; render(); }
  }
  function prev() {
    if (st.idx > 0) { st.idx--; st.step = 999; render(); }
  }

  function enter(id) {
    load(function () {
      if (!window.ZW_DECKS || !window.ZW_DECKS[id]) return;
      st.on = true; st.deck = id; st.idx = 0; st.step = 0;
      wkKey = null; wkSlides = []; wkSectionMap = [];
      document.querySelectorAll('.wenxue-nav-item').forEach(function (b) { b.classList.remove('active'); });
      var btn = document.getElementById('zw-nav-' + id);
      if (btn) btn.classList.add('active');
      var secEl = document.getElementById('wk-sections');
      if (secEl) secEl.innerHTML = secButtons('wk-sec-btn');
      var sel = document.getElementById('wk-text-select');
      if (sel) sel.value = '__zw_' + id;
      render();
    });
  }

  window.zwGoto = function (i) {
    if (!st.on) return;
    st.idx = Math.max(0, Math.min(i, deck().slides.length - 1)); st.step = 0;
    var menu = document.getElementById('wkfs-sections'), b = document.getElementById('wkfs-section-toggle');
    if (menu) menu.classList.remove('open');
    if (b) b.classList.remove('on');
    render();
  };
  window.zwOpen = enter;

  var _show = showWenxue, _next = wkNext, _prev = wkPrev, _open = wkOpenProj;
  showWenxue = function (key) {
    if (typeof key === 'string' && key.indexOf('__zw_') === 0) { enter(key.slice(5)); return; }
    st.on = false;
    return _show.apply(this, arguments);
  };
  wkNext = function () { if (st.on) return next(); return _next.apply(this, arguments); };
  wkPrev = function () { if (st.on) return prev(); return _prev.apply(this, arguments); };
  wkOpenProj = function () {
    if (!st.on) return _open.apply(this, arguments);
    if (window.wkInkState) { window.wkInkState.active = false; window.wkInkState.drawing = false; }
    document.body.classList.add('v82-proj');
    wkProjMode = true;
    var fs = document.getElementById('wk-fullscreen');
    fs.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    var fsSec = document.getElementById('wkfs-sections');
    if (fsSec) fsSec.innerHTML = secButtons('wkfs-sec-btn');
    render();
  };

  window.addEventListener('resize', function () {
    if (!st.on) return;
    fit(document.getElementById('wk-slide-area'), false);
    if (wkProjMode) fit(document.getElementById('wkfs-body'), true);
  });

  window.addEventListener('load', function () {
    var list = document.getElementById('wenxue-zuowen-list');
    if (list) list.innerHTML = LIST.map(function (d) {
      return '<button class="wenxue-nav-item" id="zw-nav-' + d[0] + '" onclick="zwOpen(\'' + d[0] + '\')">' + d[1] + '</button>';
    }).join('');
    var sel = document.getElementById('wk-text-select');
    if (sel) sel.insertAdjacentHTML('beforeend', LIST.map(function (d) {
      return '<option value="__zw_' + d[0] + '">✎ ' + d[1] + '</option>';
    }).join(''));
  });
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/173_v178-bookpage-js.js ════ */
try {
(function () {
  /* V178：作者、題解、賞析、基礎練習、進階練習顯示課本頁碼（老師 10/28「怎麼都沒頁碼」）
     頁碼依翰林 115 技高國文(1) 課本 PDF 每頁印的頁碼逐頁看過；只放「·課本」內容（網站上不是課本文字的不放，如〈侍坐〉賞析、〈桃花源記〉普高版作者題解）。
     魚販、世說、師說的作者／題解頁碼在 015_main.js 的 TEXTBOOK_INFO_PAGES，這裡不重複。 */
  var P = {
    '珍珠奶茶': { '作者·課本': 'P.61', '題解·課本': 'P.60', '賞析·課本': 'P.70', basic: 'P.72~P.75', adv: 'P.76' },
    '臺灣最美麗的火車線': { '作者·課本': 'P.81', '題解·課本': 'P.80', '賞析·課本': 'P.89', basic: 'P.91~P.93', adv: 'P.94~P.95' },
    '論語選—子路曾皙冉有公西華侍坐': { '作者·課本': 'P.99', '題解·課本': 'P.98', basic: 'P.107~P.109', adv: 'P.110' },
    '樂府詩選—長干行': { '樂府詩·課本': 'P.114', '題解·課本': 'P.114', '作者·課本': 'P.115', '賞析·課本': 'P.119', basic: 'P.121~P.123', adv: 'P.124' },
    '茫茫人海中的一名女孩': { '題解·課本': 'P.128', '作者·課本': 'P.129', '賞析·課本': 'P.138', basic: 'P.140~P.142', adv: 'P.143~P.144' },
    '桃花源記': { basic: 'P.157~P.160', adv: 'P.160~P.161' },
    '極短篇小說選': { '極短篇·課本': 'P.164', '題解·騷擾': 'P.164', '作者·衣若芬': 'P.165', '賞析·騷擾': 'P.169', '題解·青春': 'P.170', '作者·愛亞': 'P.171', '賞析·青春': 'P.174', basic: 'P.176~P.178', adv: 'P.179' }
  };
  function badge(p) { return '<div class="wks-book-page">課本 ' + p + '</div>'; }
  var _r = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _r.apply(this, arguments);
    var m = (typeof wkKey !== 'undefined') && P[wkKey]; if (!m || !slide) return h;
    if (slide.type === 'info' && m[slide.label] && h.indexOf('<div class="wks-book-page"></div>') >= 0)
      return h.replace('<div class="wks-book-page"></div>', '<div class="wks-book-page">課本 ' + m[slide.label] + '</div>');
    var k = slide.type === 'iquiz' ? 'basic' : (slide.type === 'iadv' ? 'adv' : '');
    if (k && m[k] && h.indexOf('wks-book-page') < 0) return h.replace(/^(<div class="wk-slide[^>]*>)/, '$1' + badge(m[k]));
    return h;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/174_ao-img-js.js ════ */
try {
(function () {
  /* 答案總覽：答案寫在圖上的大題（〈火車線〉趣味文學體驗的車票），總覽只列得出文字，看不到車票。
     （老師 10/28）把該大題 note 裡的圖放進總覽該區，跟答案格一樣預設蓋住：點一下或「一鍵全開」才顯示。
     只認下表列出的課與大題；資料不改。 */
  var AO_IMG = [{ book: /火車線/, head: /趣味文學體驗/ }];
  var _prev = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var h = _prev.apply(this, arguments);
    if (!slide || slide.type !== 'work_answers' || h.indexOf('wk-ao-page') < 0) return h;
    var W = slide.workbook || {};
    var hits = (W.sections || []).filter(function (s) {
      return s.kind === 'table' && /<img\b/.test(s.note || '') &&
        AO_IMG.some(function (r) { return r.book.test(W.title || '') && r.head.test(s.head || ''); });
    });
    if (!hits.length) return h;
    var box = document.createElement('div');
    box.innerHTML = h;
    hits.forEach(function (s) {
      var imgs = (s.note.match(/<img\b[^>]*>/g) || []).join('');
      var head = String(s.head).replace(/^\s*[壹貳參肆伍陸柒捌拾]\s+/, '').trim();
      box.querySelectorAll('.wk-ao-subhead').forEach(function (sh) {
        if (sh.textContent.trim() !== head) return;
        var d = document.createElement('div');
        d.className = 'wk-ao-chip ao-img';
        d.innerHTML = '<span>' + imgs + '</span>';
        sh.parentNode.appendChild(d);
      });
    });
    return box.innerHTML;
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/175_v187-lesson-attr-js.js ════ */
try {
/* V187：把目前打開的課名寫到 <body data-wk="課名">，讓 CSS 可以只對某一課生效（〈論語選〉整課字級統一，166 css）。 */
(function () {
  function sync() {
    var k = (typeof wkKey !== 'undefined' && wkKey) ? wkKey : '';
    if (document.body && document.body.getAttribute('data-wk') !== k) document.body.setAttribute('data-wk', k);
  }
  setInterval(sync, 300);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/177_v193-kzlmap-data-js.js ════ */
try {
/* V193：「孔子的一生」地圖底圖資料（由 make_map.py 產生，勿手改）：今省界與海岸（阿里雲 DataV 中國行政區 GeoJSON，簡化）、全中國小地圖。
   座標換算同 176_v190-kzlife-js.js：x=(經度-112)*100+40、y=(37.2-緯度)*100+20。只作示意，古今海岸與國界不同。 */
window.KZL_MAP = {"prov": [{"n": "", "d": ""}, {"n": "", "d": ""}, {"n": "今河北", "d": "M586.7,-325.0L581.3,-320.5L583.0,-317.6L579.0,-316.2L574.9,-318.1L567.0,-316.1L564.8,-314.0L566.3,-311.3L560.9,-310.2L566.4,-304.2L563.4,-301.7L562.6,-296.9L564.3,-296.9L569.5,-287.8L573.1,-289.0L575.1,-283.0L579.0,-282.8L581.6,-284.9L585.0,-285.3L590.5,-282.7L594.9,-283.3L597.2,-281.9L597.7,-277.9L605.2,-272.3L607.5,-268.2L615.3,-268.2L617.6,-266.0L614.8,-264.7L614.4,-261.8L616.9,-262.2L619.3,-260.6L618.2,-256.7L609.1,-258.5L601.5,-257.3L599.5,-259.5L594.6,-259.9L593.5,-255.5L591.5,-254.7L590.8,-250.2L596.2,-240.0L594.6,-237.6L596.1,-235.5L599.6,-234.6L597.8,-232.7L606.9,-226.7L603.7,-220.3L605.4,-217.5L608.5,-218.9L610.7,-217.6L611.6,-213.0L614.5,-214.8L616.7,-219.9L626.8,-219.7L633.4,-217.4L630.5,-213.4L630.0,-207.4L627.0,-205.5L627.2,-201.2L624.7,-200.8L625.2,-198.1L620.5,-197.3L621.1,-195.5L625.1,-196.4L625.4,-192.8L636.6,-191.5L642.4,-188.9L643.7,-186.5L646.5,-185.6L646.5,-183.1L642.6,-180.2L647.0,-181.4L652.5,-178.3L662.5,-163.5L671.9,-161.0L676.6,-161.6L677.8,-157.2L689.1,-150.9L694.0,-151.0L700.5,-157.1L697.1,-159.9L693.3,-169.1L698.8,-170.8L697.9,-173.1L703.7,-175.7L716.1,-173.4L721.5,-173.9L725.8,-176.3L729.7,-175.1L735.1,-177.9L729.6,-174.0L729.0,-171.9L732.6,-172.3L749.6,-184.2L758.5,-194.2L767.3,-196.4L771.7,-201.1L771.7,-203.7L767.0,-209.8L776.6,-233.5L787.4,-241.3L793.6,-240.9L792.0,-244.0L794.1,-248.8L798.8,-251.1L802.0,-250.5L804.2,-252.5L808.2,-252.3L818.7,-255.1L822.0,-257.9L824.3,-255.6L827.2,-256.1L824.6,-260.1L825.4,-263.3L821.7,-265.0L818.7,-264.2L817.2,-268.1L813.7,-270.5L816.1,-273.6L814.6,-280.8L811.7,-279.6L807.2,-283.9L803.9,-283.2L805.2,-287.2L799.8,-293.4L798.7,-297.5L800.5,-305.5L795.4,-310.2L797.2,-312.4L795.9,-314.8L790.4,-315.4L787.8,-313.3L770.2,-313.0L765.6,-314.3L762.0,-316.9L763.1,-320.4L756.3,-320.0L754.5,-323.2L758.5,-328.0L756.6,-329.3L751.5,-326.7L745.5,-326.5L742.8,-329.2L741.1,-328.7L736.1,-332.0L735.0,-334.8L729.5,-335.4L730.8,-337.5L727.9,-338.3L724.6,-342.2L727.3,-344.8L730.2,-356.1L740.1,-356.7L741.3,-360.7L735.2,-361.8L733.7,-365.3L736.5,-367.9L743.8,-366.8L748.1,-369.6L748.1,-373.2L752.6,-373.9L758.9,-379.8L757.0,-382.3L760.4,-382.3L760.9,-384.5L764.9,-388.0L764.0,-391.4L761.2,-390.8L759.8,-388.3L734.9,-391.8L729.1,-390.1L724.5,-394.3L724.3,-397.5L717.0,-395.3L714.2,-392.4L707.7,-395.0L692.8,-395.5L681.2,-393.2L678.0,-391.2L674.9,-394.3L676.1,-398.5L674.9,-402.8L672.7,-405.1L667.2,-407.1L671.6,-411.3L670.3,-415.3L661.5,-419.6L660.7,-425.1L655.9,-427.6L655.5,-431.3L653.3,-433.3L654.0,-438.4L657.8,-441.5L663.6,-440.8L664.7,-437.4L669.2,-437.3L673.5,-444.5L674.0,-447.2L666.9,-453.0L670.6,-454.0L671.4,-458.8L664.0,-462.5L668.7,-463.4L669.7,-465.8L667.3,-468.3L663.9,-469.3L661.3,-468.1L662.0,-465.8L659.4,-463.1L651.7,-463.7L655.5,-468.1L649.8,-470.5L649.0,-472.3L650.6,-477.2L637.7,-483.0L637.4,-485.1L644.8,-488.1L646.0,-489.8L640.9,-494.7L642.4,-498.5L619.8,-518.5L620.1,-521.3L618.0,-521.8L606.7,-518.2L600.1,-520.3L593.7,-520.3L593.0,-519.0L587.5,-520.3L583.5,-518.5L583.4,-515.7L578.7,-511.8L581.0,-512.0L581.3,-507.2L579.0,-506.2L573.3,-506.1L567.5,-508.2L553.5,-506.9L549.5,-508.4L548.0,-506.4L541.7,-505.6L540.6,-503.4L532.2,-500.4L528.7,-496.6L531.9,-483.0L530.3,-479.1L518.9,-480.0L522.5,-475.6L525.0,-475.7L529.0,-469.3L528.0,-461.8L519.6,-457.8L514.9,-458.4L512.8,-455.1L506.9,-454.8L503.9,-453.0L495.3,-452.9L491.1,-457.4L488.3,-457.6L485.4,-454.6L479.3,-454.3L481.4,-458.2L477.4,-461.0L471.0,-459.7L469.8,-456.8L462.4,-453.3L459.4,-446.2L452.3,-446.2L450.7,-443.1L452.9,-440.6L449.9,-437.7L440.7,-439.8L431.7,-454.5L425.3,-452.8L423.5,-453.8L421.1,-451.3L412.6,-447.0L408.8,-446.8L405.4,-442.9L397.4,-440.6L383.0,-432.9L374.7,-431.2L371.9,-429.2L376.1,-426.1L374.6,-423.6L377.8,-420.3L371.0,-419.3L369.0,-422.3L366.6,-421.6L365.7,-418.1L360.4,-417.1L359.5,-420.2L349.9,-422.4L345.6,-420.2L341.6,-421.5L326.1,-420.1L329.5,-423.6L330.3,-429.6L329.6,-436.8L326.9,-441.4L332.2,-442.5L333.9,-444.6L332.4,-447.1L330.2,-461.6L326.1,-465.5L326.3,-469.8L322.6,-474.0L319.4,-474.9L318.9,-473.1L315.5,-471.6L307.5,-472.1L304.8,-471.0L296.0,-473.3L291.1,-471.1L290.2,-466.7L288.0,-466.5L286.8,-462.6L291.2,-458.2L287.8,-455.2L281.9,-454.2L275.2,-455.3L274.3,-452.7L260.1,-439.0L261.5,-435.6L260.7,-433.9L263.8,-429.9L261.5,-428.5L265.9,-422.3L262.6,-421.7L263.1,-411.4L250.1,-413.8L243.2,-413.0L235.4,-408.4L233.3,-408.7L232.0,-405.4L227.8,-403.1L227.1,-401.3L234.5,-399.2L232.5,-392.6L229.9,-391.6L231.5,-389.5L235.1,-388.3L237.1,-384.0L239.2,-387.0L241.6,-383.2L239.7,-379.2L236.1,-377.1L232.0,-377.2L227.8,-371.6L221.9,-369.8L237.3,-358.3L239.5,-353.9L245.8,-352.5L244.2,-351.8L245.5,-346.8L247.4,-345.7L244.5,-343.1L248.0,-339.0L250.4,-339.8L250.3,-337.1L256.2,-331.4L263.6,-320.7L268.3,-319.1L267.4,-315.3L269.4,-315.2L266.7,-307.4L270.0,-304.0L268.6,-302.5L271.2,-297.3L279.0,-295.1L283.9,-297.2L288.1,-294.8L293.1,-294.5L291.1,-290.3L287.0,-286.8L280.6,-284.6L265.5,-283.6L263.6,-279.8L253.6,-277.5L249.8,-279.4L247.3,-276.9L250.2,-270.0L248.7,-267.2L244.6,-265.7L241.8,-270.4L238.9,-271.2L235.9,-263.3L231.0,-261.6L242.9,-258.6L244.7,-251.6L246.8,-252.3L257.4,-249.8L261.2,-251.9L262.9,-250.0L260.4,-248.5L261.6,-246.2L279.5,-246.7L280.7,-243.3L279.0,-241.9L281.7,-237.6L280.8,-225.2L283.2,-221.4L289.6,-220.8L291.5,-216.5L296.9,-217.4L293.3,-208.6L290.2,-207.7L289.7,-203.8L286.9,-200.1L286.7,-193.0L283.1,-190.8L283.7,-185.9L281.6,-184.3L287.6,-181.6L284.4,-177.4L278.8,-177.7L276.1,-173.4L277.0,-170.8L274.6,-167.5L265.2,-167.4L258.1,-164.9L255.7,-166.1L250.9,-165.2L248.3,-169.3L246.4,-169.4L245.1,-173.6L240.7,-172.3L239.5,-169.6L236.2,-170.1L233.0,-166.4L229.8,-166.8L220.7,-159.0L217.7,-158.7L216.8,-156.0L217.6,-148.6L219.5,-146.1L225.6,-142.9L223.7,-139.6L224.0,-135.8L220.3,-136.3L217.6,-131.0L212.1,-131.3L210.2,-125.2L201.3,-124.6L200.3,-118.7L196.2,-115.8L194.6,-109.3L198.3,-106.0L193.8,-101.8L192.5,-98.3L195.8,-94.3L194.5,-87.1L197.0,-83.7L199.9,-82.7L204.3,-83.2L207.9,-80.5L211.1,-81.4L212.1,-77.5L223.2,-76.9L221.1,-71.8L227.7,-65.5L227.2,-59.0L230.1,-58.5L235.9,-50.6L237.7,-41.7L240.7,-41.3L244.5,-36.2L239.7,-33.0L239.4,-30.7L246.8,-32.2L252.8,-29.8L254.0,-27.6L251.6,-22.0L251.9,-19.1L243.7,-9.4L241.5,-2.5L237.4,-0.3L236.3,4.4L230.2,9.0L228.6,16.1L225.3,18.5L223.2,23.2L217.3,24.8L217.4,29.3L215.8,32.5L218.8,34.0L217.2,38.3L219.2,41.2L216.1,44.4L219.3,50.5L217.3,54.5L213.2,54.1L213.2,52.1L209.7,51.8L207.6,54.4L208.1,61.0L200.0,64.7L194.9,64.7L193.6,66.8L190.0,65.9L186.5,69.2L190.7,69.5L187.7,74.5L188.7,76.5L194.5,77.7L194.0,80.6L197.0,81.4L198.9,85.2L196.0,87.1L195.4,90.5L198.7,93.9L203.6,94.9L207.0,97.5L210.8,97.7L213.1,103.7L215.5,103.4L221.3,106.8L225.7,107.1L224.9,105.2L228.2,104.6L231.1,108.5L236.3,104.6L238.2,108.2L240.3,106.6L245.6,107.1L244.3,109.7L248.0,113.0L252.9,112.0L257.6,113.5L257.0,115.4L260.3,115.5L261.0,112.7L264.1,114.9L265.8,113.6L269.9,115.4L274.5,114.4L275.6,117.0L280.8,117.5L281.7,119.4L286.6,120.2L288.0,122.2L293.3,122.8L298.7,125.9L298.9,128.2L304.0,126.3L312.0,126.0L313.5,124.4L317.2,127.5L325.8,127.2L325.8,125.5L331.3,125.9L332.7,131.1L331.4,134.8L339.8,133.0L344.6,128.7L344.9,123.8L346.3,122.2L350.5,122.8L352.5,119.0L358.4,120.7L360.1,119.0L364.2,120.9L367.9,126.2L370.2,127.2L371.3,131.2L376.6,130.1L377.7,127.2L385.1,124.8L386.5,123.0L388.4,125.1L387.5,115.2L386.3,112.4L381.7,110.7L382.3,107.8L376.7,109.1L376.9,105.8L374.0,100.2L369.8,98.7L371.7,94.6L369.1,94.0L367.3,90.3L373.1,85.0L375.5,77.3L376.6,77.8L382.0,71.3L385.2,69.8L388.0,64.0L408.4,59.2L411.2,51.7L415.8,49.8L419.7,43.1L417.7,40.7L425.6,33.9L428.8,28.8L428.0,24.9L431.2,22.3L431.0,19.3L437.0,16.0L437.6,6.3L442.4,4.0L456.9,1.6L459.3,3.4L463.6,3.9L468.5,-0.4L462.6,-2.8L464.3,-4.8L462.5,-8.0L464.1,-9.0L467.6,-6.7L469.0,-8.4L467.9,-12.5L469.5,-15.4L473.6,-18.1L476.7,-16.6L478.0,-12.2L483.4,-7.3L484.8,-10.3L500.5,-22.5L506.3,-28.6L507.9,-32.9L515.4,-37.0L515.4,-39.3L520.5,-44.9L523.8,-43.5L531.9,-44.6L542.7,-43.2L547.5,-44.9L567.2,-44.0L572.0,-46.2L580.1,-44.5L583.9,-45.4L591.3,-54.3L592.4,-59.0L598.7,-67.2L610.5,-67.6L614.7,-72.5L617.1,-73.5L616.7,-75.9L620.9,-82.8L634.9,-94.7L635.8,-97.6L633.7,-98.8L624.6,-96.8L618.1,-97.4L613.0,-102.5L612.5,-105.7L607.9,-107.7L604.5,-112.8L608.6,-113.9L603.8,-114.5L603.9,-122.7L587.9,-121.6L576.9,-116.5L565.3,-115.6L563.8,-118.1L565.9,-120.8L561.3,-124.0L558.4,-121.8L555.1,-121.8L551.0,-118.5L547.1,-120.8L545.5,-123.9L546.8,-128.1L527.7,-128.1L525.9,-134.1L514.6,-135.4L513.8,-138.5L515.1,-143.1L512.3,-145.3L510.8,-153.2L515.5,-160.3L515.4,-163.5L518.3,-165.1L527.2,-165.5L531.3,-171.1L530.9,-175.1L527.0,-175.4L525.6,-181.6L528.2,-182.6L527.2,-189.1L529.0,-193.8L527.1,-195.8L522.9,-193.9L521.8,-197.4L524.0,-197.8L524.0,-201.3L527.6,-203.5L523.2,-203.6L518.5,-206.6L522.1,-208.2L522.0,-212.9L518.7,-215.4L520.8,-217.6L521.2,-221.6L519.1,-219.6L514.9,-222.0L510.9,-221.8L512.3,-219.3L502.1,-220.2L499.2,-222.1L492.4,-219.6L490.8,-215.1L487.3,-215.3L487.8,-213.5L483.8,-212.7L484.4,-211.0L480.2,-212.8L481.2,-208.3L484.4,-208.2L485.5,-205.3L483.5,-204.3L473.8,-205.6L470.7,-208.8L465.8,-210.0L464.1,-216.4L459.9,-218.9L453.0,-216.8L443.6,-217.2L442.6,-218.8L439.5,-217.7L437.8,-219.6L435.7,-216.1L431.0,-220.0L431.5,-218.3L426.8,-214.7L422.8,-214.1L420.6,-211.0L415.3,-211.6L406.8,-221.5L398.7,-219.0L394.6,-221.9L391.8,-219.7L392.2,-224.0L387.9,-225.1L389.2,-227.0L388.7,-234.2L384.0,-235.2L384.4,-238.6L388.4,-239.8L390.6,-238.4L395.3,-239.5L396.7,-241.6L391.4,-243.8L392.3,-249.9L388.1,-253.6L382.6,-255.1L382.9,-258.4L385.0,-259.3L385.5,-263.0L392.7,-267.6L399.1,-269.6L400.0,-272.0L415.5,-274.6L417.4,-277.6L420.6,-275.3L424.8,-274.7L425.6,-278.9L427.0,-278.6L429.9,-283.4L436.9,-286.4L431.8,-295.4L426.4,-295.9L417.2,-304.4L418.1,-309.3L413.6,-310.3L415.5,-314.0L418.5,-315.8L422.0,-315.9L422.8,-318.8L428.5,-319.5L430.8,-321.7L437.2,-320.2L438.2,-317.9L449.9,-323.1L453.4,-326.7L456.3,-326.2L457.2,-329.6L464.7,-339.2L467.3,-336.3L471.1,-335.5L471.7,-337.2L485.4,-336.6L486.6,-337.4L483.8,-341.9L473.4,-350.4L474.0,-352.9L477.0,-354.4L479.8,-350.6L487.7,-350.0L484.7,-355.4L485.5,-358.1L496.8,-359.3L499.8,-357.5L502.3,-362.1L501.6,-365.3L504.8,-365.9L508.8,-364.5L509.9,-362.1L507.8,-357.1L512.2,-352.7L511.4,-351.0L524.8,-343.9L532.4,-337.4L532.7,-334.5L536.5,-331.0L541.2,-329.4L551.2,-330.7L560.8,-329.5L572.0,-325.8L580.9,-328.7L589.4,-327.5L591.5,-326.0L590.1,-323.7L586.7,-325.0Z"}, {"n": "今山西", "d": "M-122.1,279.9L-117.5,281.2L-111.2,278.9L-106.7,281.7L-98.9,279.2L-89.0,279.5L-85.1,274.8L-80.8,275.0L-77.5,278.4L-71.6,275.6L-68.0,267.0L-62.4,269.4L-56.5,265.9L-48.2,264.3L-45.1,259.2L-36.7,261.0L-34.5,258.0L-30.8,259.3L-25.4,256.8L-21.1,258.5L-16.1,256.2L-9.7,257.0L-5.6,254.7L-3.0,255.7L4.7,246.1L8.2,244.9L6.4,241.6L20.7,236.7L21.0,233.8L33.3,231.7L41.9,233.1L43.9,235.4L46.2,234.4L46.6,224.7L44.0,220.6L47.9,218.1L45.9,212.0L61.7,214.7L64.2,216.5L70.5,214.8L68.8,218.0L76.8,218.0L79.1,216.1L91.3,218.2L103.7,217.4L102.8,213.7L112.0,219.4L117.3,219.2L122.2,214.2L128.4,215.6L133.4,213.7L133.6,211.6L139.2,210.4L139.6,203.8L152.6,206.8L154.9,204.9L156.5,198.7L158.5,199.1L159.0,195.1L164.3,195.1L170.4,197.3L171.2,191.9L174.8,193.2L179.2,189.3L183.9,189.3L189.9,186.8L191.4,182.6L195.8,177.8L194.8,174.3L197.8,176.7L202.5,176.7L202.3,172.5L199.3,170.8L198.8,166.3L200.5,160.2L198.3,158.2L206.1,156.3L203.8,153.0L205.4,146.8L204.9,140.6L207.9,141.4L209.5,137.3L206.0,136.5L208.6,134.4L207.1,128.4L205.5,127.5L211.3,127.0L210.6,125.1L205.1,122.6L209.8,121.8L208.2,118.4L211.6,113.8L211.2,109.7L213.6,107.5L213.1,103.7L210.8,97.7L207.0,97.5L203.6,94.9L198.7,93.9L195.4,90.5L196.0,87.1L198.9,85.2L197.0,81.4L194.0,80.6L194.5,77.7L188.7,76.5L187.7,74.5L190.7,69.5L186.5,69.2L190.0,65.9L193.6,66.8L194.9,64.7L200.0,64.7L208.1,61.0L207.6,54.4L209.7,51.8L213.2,52.1L213.2,54.1L217.3,54.5L219.3,50.5L216.1,44.4L219.2,41.2L217.2,38.3L218.8,34.0L215.8,32.5L217.4,29.3L217.3,24.8L223.2,23.2L225.3,18.5L228.6,16.1L230.2,9.0L236.3,4.4L237.4,-0.3L241.5,-2.5L243.7,-9.4L251.9,-19.1L251.6,-22.0L254.0,-27.6L252.8,-29.8L246.8,-32.2L239.4,-30.7L239.7,-33.0L244.5,-36.2L240.7,-41.3L237.7,-41.7L235.9,-50.6L230.1,-58.5L227.2,-59.0L227.7,-65.5L221.1,-71.8L223.2,-76.9L212.1,-77.5L211.1,-81.4L207.9,-80.5L204.3,-83.2L199.9,-82.7L197.0,-83.7L194.5,-87.1L195.8,-94.3L192.5,-98.3L193.8,-101.8L198.3,-106.0L194.6,-109.3L196.2,-115.8L200.3,-118.7L201.3,-124.6L210.2,-125.2L212.1,-131.3L217.6,-131.0L220.3,-136.3L224.0,-135.8L223.7,-139.6L225.6,-142.9L219.5,-146.1L217.6,-148.6L216.8,-156.0L217.7,-158.7L220.7,-159.0L229.8,-166.8L233.0,-166.4L236.2,-170.1L239.5,-169.6L240.7,-172.3L245.1,-173.6L246.4,-169.4L248.3,-169.3L250.9,-165.2L255.7,-166.1L258.1,-164.9L265.2,-167.4L274.6,-167.5L277.0,-170.8L276.1,-173.4L278.8,-177.7L284.4,-177.4L287.6,-181.6L281.6,-184.3L283.7,-185.9L283.1,-190.8L286.7,-193.0L286.9,-200.1L289.7,-203.8L290.2,-207.7L293.3,-208.6L296.9,-217.4L291.5,-216.5L289.6,-220.8L283.2,-221.4L280.8,-225.2L281.7,-237.6L279.0,-241.9L280.7,-243.3L279.5,-246.7L261.6,-246.2L260.4,-248.5L262.9,-250.0L261.2,-251.9L257.4,-249.8L246.8,-252.3L244.7,-251.6L242.9,-258.6L231.0,-261.6L235.9,-263.3L238.9,-271.2L241.8,-270.4L244.6,-265.7L248.7,-267.2L250.2,-270.0L247.3,-276.9L249.8,-279.4L253.6,-277.5L263.6,-279.8L265.5,-283.6L280.6,-284.6L287.0,-286.8L291.1,-290.3L293.1,-294.5L288.1,-294.8L283.9,-297.2L279.0,-295.1L271.2,-297.3L268.6,-302.5L270.0,-304.0L266.7,-307.4L269.4,-315.2L267.4,-315.3L268.3,-319.1L263.6,-320.7L253.5,-333.7L248.5,-333.0L246.4,-330.7L247.2,-327.9L244.2,-320.9L247.7,-317.6L248.0,-314.8L246.2,-312.9L234.9,-311.5L229.0,-306.7L225.1,-306.1L219.5,-311.8L216.3,-307.4L208.9,-304.8L196.0,-294.8L171.7,-292.0L165.1,-301.3L143.3,-296.9L129.8,-292.9L124.9,-280.7L114.4,-276.7L103.0,-283.6L91.2,-286.9L85.6,-290.0L81.8,-289.5L74.9,-285.7L71.0,-285.6L70.0,-281.1L63.3,-277.0L63.2,-273.3L58.3,-268.4L58.2,-266.1L54.2,-262.7L41.3,-242.7L37.0,-239.7L36.0,-229.3L32.5,-226.7L33.8,-222.3L27.9,-220.6L24.3,-222.0L18.4,-218.9L5.9,-224.2L2.5,-223.4L-10.3,-226.2L-15.5,-224.0L-13.9,-220.7L-15.9,-219.7L-17.8,-213.9L-16.9,-210.9L-22.8,-207.9L-24.1,-203.2L-26.3,-202.1L-42.8,-202.3L-45.7,-200.8L-47.4,-196.6L-44.1,-196.3L-44.5,-193.9L-41.4,-195.1L-42.1,-192.7L-39.8,-190.5L-35.2,-190.2L-43.7,-175.3L-42.6,-173.5L-46.2,-166.4L-50.6,-163.0L-60.2,-159.8L-62.0,-157.0L-59.0,-153.3L-58.3,-149.0L-60.4,-146.8L-59.1,-144.8L-63.5,-135.6L-68.5,-130.4L-68.4,-127.4L-71.9,-122.7L-70.2,-118.7L-68.0,-118.2L-69.2,-112.1L-72.9,-111.0L-72.6,-105.4L-75.9,-104.0L-80.3,-105.4L-82.2,-104.1L-85.3,-96.6L-89.9,-95.3L-93.9,-90.9L-102.2,-89.7L-103.4,-81.5L-107.2,-81.2L-109.1,-79.2L-108.0,-73.1L-109.8,-69.8L-109.2,-61.3L-107.2,-59.0L-107.7,-55.5L-100.6,-52.2L-92.0,-39.0L-86.4,-37.0L-84.9,-33.6L-88.3,-32.9L-89.4,-30.6L-82.5,-28.1L-80.7,-25.1L-83.6,-24.0L-80.5,-15.9L-82.9,-13.8L-84.1,-7.5L-86.0,-4.9L-95.6,-3.5L-96.9,2.7L-90.5,5.0L-92.1,8.2L-91.0,11.3L-93.8,11.8L-100.9,21.3L-106.5,26.2L-106.4,28.5L-113.9,35.5L-118.3,37.3L-117.3,39.1L-121.7,37.8L-121.8,39.8L-117.6,43.6L-119.1,50.8L-122.4,51.8L-117.6,54.4L-119.3,57.5L-117.6,58.2L-119.2,62.4L-115.3,66.2L-116.2,71.4L-119.7,70.3L-120.5,72.3L-110.3,81.8L-111.1,84.3L-109.6,91.2L-112.7,94.7L-111.0,97.0L-114.0,107.2L-112.6,109.3L-112.6,115.2L-114.4,117.3L-115.3,123.6L-113.2,132.5L-110.8,136.5L-110.7,140.6L-108.3,142.8L-109.8,145.2L-108.3,148.1L-108.8,152.0L-105.1,152.2L-105.0,156.2L-102.9,159.9L-102.2,169.8L-99.0,176.8L-103.2,186.0L-106.9,188.9L-112.2,198.6L-115.0,207.2L-122.5,214.8L-122.1,218.9L-123.6,220.2L-122.6,226.6L-127.9,239.5L-133.8,245.6L-136.9,251.9L-135.3,261.1L-137.0,270.7L-130.5,278.9L-122.1,279.9Z"}, {"n": "今江蘇", "d": "M571.2,283.8L567.3,284.3L570.4,285.8L566.8,286.7L567.3,290.0L565.3,291.3L564.8,294.9L556.6,296.6L553.9,287.3L555.2,284.1L550.4,275.1L547.3,276.1L546.2,272.4L547.0,268.6L542.2,264.1L536.9,262.8L535.1,258.9L537.9,258.5L536.6,255.5L532.9,255.7L532.2,250.5L525.8,247.1L522.2,247.0L521.6,243.5L518.9,242.5L518.1,248.3L502.2,246.0L501.4,247.7L484.5,250.4L480.8,254.9L480.3,264.4L476.9,265.1L476.4,268.5L479.2,269.0L477.4,276.0L483.0,274.9L483.3,277.0L487.7,278.5L489.1,282.6L499.4,288.8L499.2,290.6L517.4,294.6L522.8,301.1L530.9,299.2L536.9,301.1L536.1,303.6L538.3,305.2L536.9,311.6L545.1,317.9L542.5,323.3L552.4,327.2L553.1,329.8L559.2,333.1L565.7,333.4L567.7,332.1L571.2,333.2L575.7,331.2L580.4,336.8L583.5,337.2L591.5,333.9L594.3,336.1L596.9,341.5L601.3,340.0L602.9,337.1L607.1,340.8L607.3,346.5L611.5,352.1L615.4,350.9L614.0,364.2L612.5,365.0L615.0,368.9L619.1,366.6L630.2,368.0L637.3,365.0L642.0,366.1L646.6,363.4L651.8,363.4L656.1,366.4L656.8,373.7L651.2,378.3L650.7,392.5L645.1,390.8L641.7,399.7L642.9,402.5L639.3,406.7L637.4,412.1L633.9,413.8L634.2,417.5L637.7,417.4L638.9,421.9L643.7,424.8L643.8,426.5L654.9,423.1L657.8,418.2L661.7,420.8L664.5,440.2L666.9,443.1L670.4,443.1L669.2,445.4L665.2,446.3L663.3,448.6L665.0,455.2L670.1,455.4L670.0,461.7L673.4,463.8L676.3,462.9L677.5,468.1L681.1,468.4L685.1,465.6L688.4,467.9L696.0,467.0L697.2,468.0L704.3,465.5L710.7,468.0L715.7,466.3L713.8,462.7L714.3,454.7L721.0,454.6L722.1,447.9L724.7,447.8L724.9,444.3L729.6,444.2L729.3,445.9L733.4,446.1L742.1,444.4L745.5,452.5L751.3,457.7L758.5,457.4L761.2,469.2L760.9,475.9L763.1,479.3L762.0,482.3L755.3,484.2L756.8,486.4L748.5,494.7L744.1,488.5L737.6,489.5L732.2,484.3L729.1,484.7L730.8,480.8L724.3,483.2L722.1,479.6L718.5,481.8L715.7,479.6L713.5,481.1L711.9,478.6L708.9,481.2L705.9,480.6L703.3,482.2L699.7,479.9L696.9,481.4L696.4,483.8L700.9,486.3L699.2,491.9L702.9,493.2L709.1,492.8L708.5,499.6L710.3,507.1L705.7,509.9L707.5,515.0L704.4,519.0L691.1,520.6L689.5,523.5L690.1,527.8L679.4,532.4L679.0,541.5L676.4,547.0L687.2,552.0L686.7,554.2L690.5,555.8L688.2,562.2L693.4,563.3L692.2,565.7L695.8,567.0L697.2,565.4L704.1,564.1L705.4,567.0L709.8,569.0L704.3,572.8L704.3,575.0L713.6,576.7L714.8,572.4L717.4,571.7L720.3,578.1L725.9,577.6L728.6,588.1L725.2,600.6L716.8,603.6L714.6,602.7L712.1,607.7L712.6,611.8L715.7,612.0L719.5,617.1L727.1,615.8L750.5,616.5L750.7,614.9L755.8,610.5L759.8,610.5L759.8,613.0L766.7,615.0L769.4,613.7L773.8,614.1L775.0,609.9L777.4,614.1L776.0,618.7L779.2,622.6L783.9,622.3L786.1,624.4L793.3,624.1L800.0,629.1L807.8,623.2L810.6,624.7L811.6,623.0L818.0,622.1L821.0,625.1L822.7,622.6L827.8,623.9L832.1,623.0L834.6,629.4L840.1,637.3L845.3,639.4L851.1,644.4L862.4,647.3L877.1,645.1L875.8,651.3L882.3,649.7L883.5,647.9L884.2,653.9L888.9,663.6L890.5,664.2L899.0,654.6L905.5,655.3L908.3,651.8L911.3,651.5L910.9,646.7L908.5,644.5L909.8,642.9L914.6,643.8L917.0,640.3L922.1,639.3L926.6,641.0L930.1,638.3L929.1,630.6L925.9,630.0L928.1,626.5L941.8,626.6L947.7,624.2L946.0,615.5L949.0,610.8L954.3,612.5L951.4,602.5L954.3,600.8L957.5,595.1L964.2,590.7L964.8,592.3L974.4,588.8L977.2,584.7L954.5,564.6L951.9,564.1L960.0,556.5L966.5,553.6L972.3,553.2L978.5,556.7L983.2,563.1L989.9,564.7L1000.0,569.7L1037.5,578.3L1037.0,568.1L1025.6,544.5L1015.9,534.1L992.5,526.4L994.3,524.8L985.9,522.3L989.9,518.9L989.4,513.6L985.0,511.8L982.6,496.9L979.0,493.9L967.0,491.7L955.3,487.1L952.2,483.1L936.2,478.8L938.0,476.4L936.4,471.7L931.6,469.9L935.3,468.6L937.2,463.9L938.1,454.0L935.7,450.7L933.3,439.4L927.2,435.3L927.4,430.6L924.3,419.0L921.9,416.2L923.4,412.5L921.4,409.7L917.0,409.3L914.1,406.2L908.0,388.0L898.4,373.2L876.7,330.8L871.4,314.4L871.2,309.3L836.3,294.1L821.2,291.4L818.2,288.4L804.1,283.1L786.6,272.7L792.6,266.6L778.2,264.8L789.7,264.6L784.0,261.5L784.1,263.1L777.9,263.6L763.8,260.1L761.7,257.2L760.3,251.0L761.1,241.8L763.8,235.1L768.5,233.2L769.2,237.1L770.7,236.7L769.3,233.1L770.6,232.3L768.7,228.5L765.0,227.5L761.7,229.3L753.8,230.4L751.5,234.5L734.3,235.9L732.8,234.9L726.3,237.4L726.1,245.6L720.5,252.7L717.2,260.6L713.9,260.7L711.9,265.5L716.4,266.0L718.4,267.7L709.0,272.2L706.4,270.6L700.8,270.6L700.1,268.6L694.6,269.4L686.1,274.4L687.4,277.7L683.9,277.4L682.5,280.5L683.9,289.2L680.5,297.2L678.0,298.5L669.0,297.5L667.7,299.5L662.0,299.4L661.8,302.1L658.0,302.0L657.8,294.7L653.3,291.7L656.5,289.5L658.5,285.6L647.9,283.0L651.5,278.6L648.4,274.4L645.4,274.9L635.2,272.2L631.0,272.9L630.3,275.6L619.4,274.8L620.2,288.1L608.4,285.3L605.9,289.9L601.0,290.9L599.3,293.7L586.5,291.5L580.3,284.9L580.3,283.0L577.1,281.5L571.2,283.8Z"}, {"n": "今安徽", "d": "M500.0,338.6L504.2,342.2L504.3,350.3L503.1,351.2L496.7,349.2L495.8,351.9L483.8,355.4L483.7,359.9L480.8,359.4L479.4,361.7L471.7,362.9L466.3,367.0L463.0,366.5L455.6,369.0L450.0,361.7L447.4,361.9L445.6,359.5L445.9,353.9L438.2,348.3L440.0,343.5L435.8,339.2L430.4,339.0L427.7,337.1L427.7,339.7L425.0,339.5L424.6,337.1L420.9,333.8L413.6,332.3L410.6,334.0L405.8,333.9L404.2,336.8L400.7,337.0L394.8,352.5L403.2,353.0L401.4,362.4L397.7,361.2L396.3,362.7L400.2,368.1L400.1,374.1L404.0,381.5L396.5,382.4L391.1,384.7L386.4,383.3L382.3,384.3L379.5,389.4L376.7,387.7L374.6,389.7L374.6,395.0L372.5,394.3L371.5,396.9L372.9,399.7L371.4,402.3L374.2,402.9L376.5,406.4L376.2,410.2L373.5,410.2L374.0,413.9L370.1,419.6L370.4,425.0L369.0,426.8L364.5,426.4L359.5,427.9L356.8,431.1L344.1,431.3L339.1,429.8L336.6,425.3L333.3,424.6L330.3,427.0L329.7,431.3L331.3,431.7L332.6,438.3L329.2,438.0L328.3,441.0L334.3,446.5L343.5,446.7L343.0,449.3L353.9,450.2L355.6,453.5L359.7,454.4L359.0,458.8L361.1,461.4L359.0,462.9L357.9,467.4L360.1,480.8L370.6,481.7L370.5,484.7L381.1,482.5L380.9,485.1L389.8,490.8L392.3,495.8L397.1,498.1L400.4,497.4L402.6,499.5L405.8,497.1L406.8,499.0L410.5,490.5L414.2,492.4L417.2,489.5L418.9,493.1L429.1,482.4L431.0,483.3L424.6,489.8L428.3,491.2L426.5,494.1L429.9,500.9L431.3,517.2L434.2,523.4L432.2,535.0L432.9,539.7L430.9,545.7L432.0,548.0L429.5,553.5L429.4,556.8L431.5,558.5L428.6,562.4L425.2,561.3L420.8,563.0L416.7,561.2L413.1,563.3L407.6,562.2L395.4,570.5L393.4,570.1L389.5,572.7L387.7,575.7L388.5,579.1L384.0,581.2L381.6,587.4L377.1,590.4L379.0,595.0L377.4,599.4L379.3,601.0L377.2,605.1L384.4,605.6L387.3,613.5L390.8,613.2L394.0,616.8L394.0,620.5L398.6,625.6L405.5,618.9L410.1,619.9L417.9,628.8L426.7,625.2L428.8,629.1L434.0,632.8L433.9,635.3L440.6,636.5L441.5,638.8L445.9,638.7L447.2,644.3L444.0,644.2L437.6,646.8L433.3,651.0L426.5,653.6L424.9,657.2L426.4,658.4L425.1,664.3L418.3,664.8L416.3,671.5L421.4,676.3L421.9,680.2L424.9,679.8L427.7,681.8L431.0,688.1L429.5,694.7L432.1,698.4L428.5,702.0L431.5,706.2L430.3,708.6L438.6,710.9L439.8,714.7L446.6,719.5L445.6,721.9L448.8,729.0L447.9,733.8L449.1,736.4L447.4,743.0L452.8,750.2L453.5,758.0L457.3,757.2L462.8,758.3L465.0,761.4L468.1,761.1L474.3,756.4L486.8,750.4L495.2,749.0L498.5,735.4L502.1,732.7L506.7,732.3L512.0,734.6L514.7,734.3L520.3,740.4L523.1,739.5L523.3,744.2L526.9,742.0L530.0,745.1L528.3,750.6L518.1,760.7L516.2,759.8L507.4,769.0L509.9,769.2L510.5,771.1L508.0,771.9L505.2,776.3L511.7,780.9L512.2,783.5L516.0,780.1L518.1,783.0L524.9,782.4L527.4,779.0L537.5,774.3L539.6,771.7L544.2,771.9L551.3,768.8L550.8,764.8L553.7,762.5L547.3,756.8L552.7,753.8L553.0,750.1L561.7,747.3L564.6,748.5L566.2,751.9L565.3,756.5L569.3,757.7L573.9,755.2L575.9,758.7L578.2,755.9L581.5,754.9L580.9,759.8L585.5,765.1L585.4,771.2L589.0,774.0L593.0,774.6L592.4,777.0L594.3,781.1L600.9,780.9L604.8,778.5L607.9,780.5L609.0,784.4L613.0,785.0L619.5,782.9L627.3,785.2L633.4,785.1L640.4,782.2L644.3,783.4L645.1,785.7L649.5,786.6L654.4,791.0L652.8,792.8L653.6,798.1L659.3,800.5L664.8,796.9L671.6,797.7L670.6,792.1L673.0,790.5L674.8,792.6L678.2,789.5L689.6,788.1L690.0,782.4L693.2,781.1L697.4,776.2L702.0,774.6L704.7,775.7L714.5,766.1L714.1,758.5L724.1,750.9L723.9,746.5L729.5,746.2L730.3,737.1L727.9,733.5L727.4,728.5L729.5,725.1L725.2,725.0L725.3,723.3L733.0,719.8L730.5,718.4L727.8,711.7L728.0,708.5L735.4,704.0L738.9,706.8L746.3,709.5L749.2,707.6L760.1,710.9L763.6,710.3L764.7,705.9L767.7,705.9L772.6,702.8L774.9,705.1L780.3,702.5L776.8,701.5L773.5,695.2L772.6,686.7L767.2,689.0L763.7,685.3L766.5,682.5L763.9,679.1L772.3,677.0L774.3,673.6L779.0,671.4L780.8,675.5L784.5,675.0L788.3,669.6L788.0,662.8L792.7,662.1L795.4,657.4L797.6,657.0L795.7,652.6L796.4,648.1L798.2,646.8L798.0,643.3L803.4,638.1L802.9,631.4L804.9,629.5L802.4,627.0L800.0,629.1L793.3,624.1L786.1,624.4L783.9,622.3L779.2,622.6L776.0,618.7L777.4,614.1L775.0,609.9L773.8,614.1L769.4,613.7L766.7,615.0L759.8,613.0L759.8,610.5L755.8,610.5L750.7,614.9L750.5,616.5L727.1,615.8L719.5,617.1L715.7,612.0L712.6,611.8L712.1,607.7L714.6,602.7L716.8,603.6L725.2,600.6L728.4,590.0L725.7,589.4L728.6,588.1L725.9,577.6L720.3,578.1L717.4,571.7L714.8,572.4L713.6,576.7L704.3,575.0L704.3,572.8L709.8,569.0L705.4,567.0L704.1,564.1L697.2,565.4L695.8,567.0L692.2,565.7L693.4,563.3L688.2,562.2L690.5,555.8L686.7,554.2L687.2,552.0L676.4,547.0L679.0,541.5L679.4,532.4L690.1,527.8L689.5,523.5L691.1,520.6L704.4,519.0L707.5,515.0L705.7,509.9L710.3,507.1L708.5,499.6L709.1,492.8L702.9,493.2L699.2,491.9L700.9,486.3L696.4,483.8L696.9,481.4L699.7,479.9L703.3,482.2L705.9,480.6L708.9,481.2L711.9,478.6L713.5,481.1L715.7,479.6L718.5,481.8L722.1,479.6L724.3,483.2L730.8,480.8L729.1,484.7L732.2,484.3L737.6,489.5L744.1,488.5L748.5,494.7L756.8,486.4L755.3,484.2L762.0,482.3L763.1,479.3L760.9,475.9L761.2,469.2L758.5,457.4L751.3,457.7L745.5,452.5L742.1,444.4L733.4,446.1L729.3,445.9L729.6,444.2L724.9,444.3L724.7,447.8L722.1,447.9L721.0,454.6L714.3,454.7L713.8,462.7L715.7,466.3L710.7,468.0L704.3,465.5L697.2,468.0L696.0,467.0L688.4,467.9L685.1,465.6L681.1,468.4L677.5,468.1L676.3,462.9L673.4,463.8L670.0,461.7L670.1,455.4L665.0,455.2L663.3,448.6L665.2,446.3L669.2,445.4L670.4,443.1L666.9,443.1L664.5,440.2L661.7,420.8L657.8,418.2L654.9,423.1L643.8,426.5L643.7,424.8L638.9,421.9L637.7,417.4L634.2,417.5L633.9,413.8L637.4,412.1L639.3,406.7L642.9,402.5L641.7,399.7L645.1,390.8L650.7,392.5L651.2,378.3L656.8,373.7L656.1,366.4L651.8,363.4L646.6,363.4L642.0,366.1L637.3,365.0L630.2,368.0L619.1,366.6L615.0,368.9L612.5,365.0L614.0,364.2L615.4,350.9L611.5,352.1L607.3,346.5L607.1,340.8L602.9,337.1L601.3,340.0L596.9,341.5L594.3,336.1L591.5,333.9L583.5,337.2L580.4,336.8L575.7,331.2L571.2,333.2L567.7,332.1L565.7,333.4L559.2,333.1L553.1,329.8L552.4,327.2L542.5,323.3L545.1,317.9L536.9,311.6L538.3,305.2L536.1,303.6L536.9,301.1L530.9,299.2L522.8,301.1L517.4,294.6L499.2,290.6L499.4,288.8L489.1,282.6L487.7,278.5L483.3,277.0L483.0,274.9L477.4,276.0L473.4,277.9L472.5,279.9L468.6,279.1L464.8,284.8L459.7,282.4L459.1,286.4L460.4,289.2L457.8,290.4L456.2,294.0L461.6,299.7L461.3,301.8L465.6,302.3L475.8,308.0L477.2,313.4L485.7,313.1L491.6,310.4L496.2,311.4L498.2,313.4L494.5,315.8L494.3,319.6L496.6,323.1L493.6,324.9L492.8,327.7L497.6,333.1L500.0,338.6Z"}, {"n": "今山東", "d": "M477.4,276.0L479.2,269.0L476.4,268.5L476.9,265.1L480.3,264.4L480.8,254.9L484.5,250.4L501.4,247.7L502.2,246.0L518.1,248.3L518.9,242.5L521.6,243.5L522.2,247.0L525.8,247.1L532.2,250.5L532.9,255.7L536.6,255.5L537.9,258.5L535.1,258.9L536.9,262.8L542.2,264.1L547.0,268.6L546.2,272.4L547.3,276.1L550.4,275.1L555.2,284.1L553.9,287.3L556.6,296.6L564.8,294.9L565.3,291.3L567.3,290.0L566.8,286.7L570.4,285.8L567.3,284.3L577.1,281.5L580.3,283.0L580.3,284.9L586.5,291.5L593.8,293.3L599.3,293.7L601.0,290.9L605.9,289.9L608.4,285.3L620.2,288.1L619.4,274.8L630.3,275.6L631.0,272.9L635.2,272.2L645.4,274.9L648.4,274.4L651.5,278.6L647.9,283.0L658.5,285.6L656.5,289.5L653.3,291.7L657.8,294.7L658.0,302.0L661.8,302.1L662.0,299.4L667.7,299.5L669.0,297.5L678.0,298.5L680.5,297.2L683.9,289.2L682.5,280.5L683.9,277.4L687.4,277.7L686.1,274.4L694.6,269.4L700.1,268.6L700.8,270.6L706.4,270.6L709.0,272.2L718.4,267.7L716.4,266.0L711.9,265.5L713.9,260.7L717.2,260.6L720.5,252.7L726.1,245.6L726.3,237.4L732.8,234.9L734.3,235.9L751.5,234.5L753.8,230.4L761.7,229.3L765.0,227.5L768.7,228.5L770.6,232.3L777.4,232.1L782.8,227.9L779.8,226.2L781.1,216.8L785.1,211.5L789.3,208.1L793.8,210.3L794.4,205.2L799.0,202.7L798.0,199.3L801.9,194.0L806.3,183.7L806.2,181.1L815.1,178.2L817.2,182.1L822.4,175.4L823.0,178.0L826.8,179.1L832.5,176.3L831.2,173.9L835.0,167.0L832.0,166.0L832.6,164.0L835.8,164.0L841.4,168.6L845.0,161.3L843.2,158.8L846.4,152.7L851.2,151.5L852.5,149.3L855.3,149.3L860.8,145.2L857.0,151.2L860.2,150.8L860.9,148.2L866.6,143.4L870.5,142.8L871.6,139.8L869.0,138.3L864.9,140.8L865.7,137.5L859.9,140.4L863.5,136.9L863.9,133.8L858.1,133.3L855.2,130.5L851.7,129.7L850.9,127.2L854.3,125.6L854.1,122.6L858.1,119.6L862.0,119.1L862.4,120.9L866.1,120.1L866.3,121.8L871.0,121.5L869.7,117.4L872.0,116.8L876.2,120.4L868.6,135.3L883.0,134.3L886.9,131.2L894.7,130.8L894.7,129.2L899.4,129.9L901.6,128.0L911.2,127.3L908.1,116.1L908.6,112.1L905.7,112.4L906.3,106.8L914.4,107.2L909.4,101.0L916.0,93.7L922.9,93.3L925.9,97.5L924.9,99.7L927.2,103.3L931.8,98.2L930.9,95.0L933.8,95.2L936.5,93.4L935.4,89.2L938.3,85.4L936.2,83.7L931.0,83.1L928.5,79.9L924.7,78.1L928.2,77.3L932.7,78.8L935.6,82.4L942.9,82.7L956.1,74.9L965.2,72.9L969.9,69.8L975.8,68.7L980.1,69.9L979.4,66.2L985.4,64.7L990.7,59.6L996.5,56.9L994.9,59.2L988.5,61.4L993.2,66.4L997.5,66.0L995.6,63.5L1005.2,67.6L1003.2,59.9L1012.6,57.4L1016.2,55.4L1016.8,52.5L1040.9,43.8L1044.3,52.8L1045.2,49.5L1049.3,48.6L1052.5,45.6L1054.1,46.2L1052.0,50.8L1057.6,50.6L1058.9,53.4L1057.4,55.7L1062.1,55.1L1074.4,57.2L1077.8,55.5L1078.4,53.4L1081.6,54.1L1085.5,52.1L1083.4,48.6L1088.3,48.6L1088.9,51.3L1093.2,49.9L1095.8,43.2L1094.5,39.5L1098.3,36.3L1097.5,34.6L1086.7,36.3L1088.4,27.1L1093.4,24.7L1098.1,25.2L1097.4,22.4L1102.4,20.9L1099.3,13.9L1096.7,14.0L1097.4,10.4L1101.1,6.0L1100.8,3.6L1105.1,1.1L1109.2,2.6L1111.4,0.8L1110.2,-1.9L1107.6,-1.3L1104.1,-2.8L1095.4,-0.7L1089.5,-1.4L1088.7,-3.5L1081.7,-1.5L1073.7,-1.4L1068.1,-3.1L1068.7,-4.5L1065.3,-6.8L1056.6,-3.9L1053.2,-9.9L1056.3,-11.9L1055.0,-15.7L1048.9,-15.4L1041.7,-13.1L1039.8,-9.5L1032.4,-7.3L1006.6,-7.4L1003.6,-9.4L997.6,-6.0L997.1,-4.1L987.7,-7.6L986.0,-12.3L980.1,-15.8L979.6,-19.0L983.5,-19.3L979.1,-22.5L974.9,-23.5L975.8,-19.7L970.5,-18.3L961.7,-18.3L957.4,-19.7L954.9,-22.6L956.2,-24.6L954.3,-26.1L956.0,-29.9L953.6,-32.4L943.7,-31.9L934.3,-38.5L934.1,-42.0L927.5,-43.3L923.9,-42.4L913.3,-43.4L905.7,-39.3L903.4,-39.6L899.1,-36.4L891.8,-35.0L885.5,-35.8L876.8,-29.8L862.8,-29.4L862.0,-27.2L866.9,-25.9L867.2,-23.7L861.5,-22.1L860.8,-18.8L864.7,-15.7L854.4,-8.2L835.0,-2.0L832.7,1.3L824.4,2.3L823.7,5.3L828.3,8.9L829.2,13.6L826.5,16.6L823.0,17.4L814.0,26.6L808.7,25.6L807.9,24.2L797.6,27.2L789.0,26.5L772.8,28.4L770.1,26.1L769.9,20.3L760.7,17.7L759.1,14.0L760.4,12.0L753.7,16.9L752.8,14.5L749.1,14.2L748.4,16.0L745.4,14.5L744.0,9.6L740.1,8.1L734.0,-12.7L738.9,-22.1L742.4,-24.2L766.2,-26.1L770.9,-40.5L769.2,-47.0L764.0,-47.8L761.2,-43.9L756.1,-41.9L752.8,-44.8L751.1,-52.2L740.2,-59.6L737.4,-69.4L730.8,-73.9L721.1,-75.8L702.6,-73.8L700.8,-72.9L699.8,-67.9L695.2,-65.6L690.5,-71.4L685.0,-72.4L683.1,-70.6L680.4,-72.1L661.7,-74.7L657.8,-78.6L651.2,-81.0L644.5,-81.4L641.9,-80.2L629.7,-87.9L629.6,-90.2L620.9,-82.8L616.7,-75.9L617.1,-73.5L614.7,-72.5L610.5,-67.6L598.7,-67.2L595.7,-64.6L591.3,-54.3L583.9,-45.4L580.1,-44.5L572.0,-46.2L567.2,-44.0L547.5,-44.9L542.7,-43.2L531.9,-44.6L523.8,-43.5L520.5,-44.9L515.4,-39.3L515.4,-37.0L507.9,-32.9L506.3,-28.6L500.5,-22.5L484.8,-10.3L483.4,-7.3L478.0,-12.2L476.7,-16.6L473.6,-18.1L469.5,-15.4L467.9,-12.5L469.0,-8.4L467.6,-6.7L464.1,-9.0L462.5,-8.0L464.3,-4.8L462.6,-2.8L468.5,-0.4L463.6,3.9L459.3,3.4L456.9,1.6L442.4,4.0L437.6,6.3L437.0,16.0L431.0,19.3L431.2,22.3L428.0,24.9L428.8,28.8L425.6,33.9L417.7,40.7L419.7,43.1L415.8,49.8L411.2,51.7L408.4,59.2L388.0,64.0L385.2,69.8L382.0,71.3L376.6,77.8L375.5,77.3L373.1,85.0L367.3,90.3L369.1,94.0L371.7,94.6L369.8,98.7L374.0,100.2L376.9,105.8L376.7,109.1L382.3,107.8L381.7,110.7L386.3,112.4L388.4,127.4L384.9,135.3L384.8,138.8L376.3,142.8L375.4,146.1L376.4,150.6L373.5,160.3L376.3,162.0L389.5,150.4L391.3,151.0L398.4,147.8L404.9,147.7L409.9,143.4L417.5,142.5L418.0,140.6L421.7,138.7L426.0,139.6L429.9,137.3L439.0,135.5L445.8,129.5L449.9,128.8L444.9,143.0L431.2,144.0L430.8,147.3L427.3,148.1L428.3,152.0L426.0,154.2L421.7,155.6L417.4,154.6L413.5,156.7L409.6,161.1L409.4,164.6L392.9,166.6L388.6,169.0L378.3,183.1L374.5,184.6L375.6,191.0L370.7,192.0L363.7,197.7L352.6,198.2L351.8,200.0L349.2,198.4L347.4,202.6L344.3,202.3L335.8,213.9L332.9,215.5L333.2,220.2L326.1,221.8L324.2,224.9L328.3,230.1L323.6,232.3L321.9,234.8L325.2,235.8L322.4,238.8L328.1,239.6L332.4,243.1L335.1,241.0L340.8,241.2L342.9,242.8L347.5,239.9L352.8,239.5L355.7,244.2L361.9,244.0L360.5,248.6L365.2,249.4L363.9,252.2L365.6,255.5L371.7,254.1L382.7,259.5L384.9,265.6L383.4,267.5L386.1,276.3L391.6,281.8L395.3,283.1L402.3,282.6L408.6,284.4L409.7,280.6L418.8,281.9L422.7,284.2L438.4,281.1L439.1,278.5L443.7,280.7L450.1,279.4L453.5,284.0L455.7,284.6L459.7,282.4L464.8,284.8L468.6,279.1L472.5,279.9L473.4,277.9L477.4,276.0ZM389.5,150.4L388.8,151.9L391.3,151.0L389.5,150.4Z"}, {"n": "今河南", "d": "M111.7,504.2L117.6,504.1L126.1,500.4L128.9,502.3L131.2,500.9L139.2,502.2L140.1,498.3L142.6,497.5L147.9,500.5L150.8,500.1L151.9,502.4L155.6,501.9L155.9,498.9L161.2,496.8L173.4,506.4L171.8,507.3L175.4,510.5L177.6,510.2L182.9,512.9L202.5,503.9L205.1,498.7L210.0,497.9L213.6,498.9L216.8,503.0L215.4,507.2L216.8,511.6L213.9,514.4L218.2,521.5L215.0,528.4L212.3,527.6L212.9,531.7L219.2,536.4L215.8,541.0L221.7,543.6L220.6,547.1L223.2,548.1L223.1,552.1L225.4,555.7L229.4,555.3L231.5,552.3L235.8,554.7L235.2,560.6L238.9,565.0L241.8,562.9L248.7,561.8L252.2,559.1L253.4,555.7L259.2,554.8L263.6,556.7L269.3,564.7L275.0,564.4L284.4,567.2L293.1,565.7L295.0,563.3L298.6,563.8L297.1,573.9L294.8,577.6L296.1,583.9L297.3,584.6L301.7,581.5L304.2,581.8L309.6,587.4L317.9,587.9L318.9,592.0L323.0,594.1L327.0,592.1L328.4,593.1L336.2,590.5L339.5,592.9L342.3,587.2L349.6,589.2L351.5,587.0L350.7,583.2L352.5,580.1L356.4,579.5L361.3,584.5L363.6,584.5L361.1,595.8L365.3,597.8L365.1,600.8L370.1,601.6L377.4,599.4L379.0,595.0L377.1,590.4L381.6,587.4L384.0,581.2L388.5,579.1L387.7,575.7L389.5,572.7L393.4,570.1L395.4,570.5L407.6,562.2L413.1,563.3L416.7,561.2L420.8,563.0L425.2,561.3L428.6,562.4L431.5,558.5L429.4,556.8L429.5,553.5L432.0,548.0L430.9,545.7L432.9,539.7L432.2,535.0L434.2,523.4L431.3,517.2L429.9,500.9L426.5,494.1L428.3,491.2L424.6,489.8L431.0,483.3L429.1,482.4L418.9,493.1L417.2,489.5L414.2,492.4L410.5,490.5L406.8,499.0L405.8,497.1L402.6,499.5L400.4,497.4L397.1,498.1L392.3,495.8L389.8,490.8L380.9,485.1L381.1,482.5L370.5,484.7L370.6,481.7L360.1,480.8L357.9,467.4L359.0,462.9L361.1,461.4L359.0,458.8L359.7,454.4L355.6,453.5L353.9,450.2L343.0,449.3L343.5,446.7L334.3,446.5L328.3,441.0L329.2,438.0L332.6,438.3L331.3,431.7L329.7,431.3L330.3,427.0L333.3,424.6L336.6,425.3L339.1,429.8L344.1,431.3L356.8,431.1L359.5,427.9L364.5,426.4L369.0,426.8L370.4,425.0L370.1,419.6L374.0,413.9L373.5,410.2L376.2,410.2L376.5,406.4L374.2,402.9L371.4,402.3L372.9,399.7L371.5,396.9L372.5,394.3L374.6,395.0L374.6,389.7L376.7,387.7L379.5,389.4L382.3,384.3L386.4,383.3L391.1,384.7L396.5,382.4L404.0,381.5L400.1,374.1L400.2,368.1L396.3,362.7L397.7,361.2L401.4,362.4L403.2,353.0L394.8,352.5L400.7,337.0L404.2,336.8L405.8,333.9L410.6,334.0L413.6,332.3L420.9,333.8L424.6,337.1L425.0,339.5L427.7,339.7L427.7,337.1L430.4,339.0L435.8,339.2L440.0,343.5L438.2,348.3L445.9,353.9L445.6,359.5L447.4,361.9L450.0,361.7L455.6,369.0L463.0,366.5L466.3,367.0L471.7,362.9L479.4,361.7L480.8,359.4L483.7,359.9L483.8,355.4L495.8,351.9L496.7,349.2L503.1,351.2L504.3,350.3L504.2,342.2L500.0,338.6L497.6,333.1L492.8,327.7L493.6,324.9L496.6,323.1L494.3,319.6L494.5,315.8L498.2,313.4L496.2,311.4L491.6,310.4L485.7,313.1L477.2,313.4L475.8,308.0L465.6,302.3L461.3,301.8L461.6,299.7L456.2,294.0L457.8,290.4L460.4,289.2L459.1,286.4L459.7,282.4L455.7,284.6L453.5,284.0L450.1,279.4L443.7,280.7L439.1,278.5L438.4,281.1L422.7,284.2L418.8,281.9L409.7,280.6L408.6,284.4L391.6,281.8L386.1,276.3L383.4,267.5L384.9,265.6L382.7,259.5L371.7,254.1L365.6,255.5L363.9,252.2L365.2,249.4L360.5,248.6L361.9,244.0L355.7,244.2L352.8,239.5L347.5,239.9L342.9,242.8L340.8,241.2L335.1,241.0L332.4,243.1L328.1,239.6L322.4,238.8L325.2,235.8L321.9,234.8L323.6,232.3L328.3,230.1L324.2,224.9L326.1,221.8L333.2,220.2L332.9,215.5L335.8,213.9L344.3,202.3L347.4,202.6L349.2,198.4L351.8,200.0L352.6,198.2L363.7,197.7L370.7,192.0L375.6,191.0L374.5,184.6L378.3,183.1L388.6,169.0L392.9,166.6L409.4,164.6L409.6,161.1L413.5,156.7L417.4,154.6L421.7,155.6L426.0,154.2L428.3,152.0L427.3,148.1L430.8,147.3L431.2,144.0L444.9,143.0L449.9,128.8L445.8,129.5L439.0,135.5L429.9,137.3L426.0,139.6L421.7,138.7L418.0,140.6L417.5,142.5L409.9,143.4L404.9,147.7L398.4,147.8L388.8,151.9L376.3,162.0L373.5,160.3L376.4,150.6L375.4,146.1L376.3,142.8L384.8,138.8L384.9,135.3L388.4,127.4L386.5,123.0L385.1,124.8L377.7,127.2L376.6,130.1L371.3,131.2L370.2,127.2L367.9,126.2L364.2,120.9L360.1,119.0L358.4,120.7L352.5,119.0L350.5,122.8L346.3,122.2L344.9,123.8L344.6,128.7L339.8,133.0L331.4,134.8L332.7,131.1L331.3,125.9L325.8,125.5L325.8,127.2L317.2,127.5L313.5,124.4L312.0,126.0L304.0,126.3L298.9,128.2L298.7,125.9L293.3,122.8L288.0,122.2L286.6,120.2L281.7,119.4L280.8,117.5L275.6,117.0L274.5,114.4L269.9,115.4L265.8,113.6L264.1,114.9L261.0,112.7L260.3,115.5L257.0,115.4L257.6,113.5L252.9,112.0L248.0,113.0L244.3,109.7L245.6,107.1L240.3,106.6L238.2,108.2L236.3,104.6L231.1,108.5L228.2,104.6L224.9,105.2L225.7,107.1L221.3,106.8L215.5,103.4L213.1,103.7L213.6,107.5L211.2,109.7L211.6,113.8L208.2,118.4L209.8,121.8L205.1,122.6L210.6,125.1L211.3,127.0L205.5,127.5L207.1,128.4L208.6,134.4L206.0,136.5L209.5,137.3L207.9,141.4L204.9,140.6L205.4,146.8L203.8,153.0L206.1,156.3L198.3,158.2L200.5,160.2L198.8,166.3L199.3,170.8L202.3,172.5L202.5,176.7L197.8,176.7L194.8,174.3L195.8,177.8L191.4,182.6L189.9,186.8L183.9,189.3L179.2,189.3L174.8,193.2L171.2,191.9L170.4,197.3L164.3,195.1L159.0,195.1L158.5,199.1L156.5,198.7L154.9,204.9L152.6,206.8L139.6,203.8L139.2,210.4L133.6,211.6L133.4,213.7L128.4,215.6L122.2,214.2L117.3,219.2L112.0,219.4L102.8,213.7L103.7,217.4L91.3,218.2L79.1,216.1L76.8,218.0L68.8,218.0L70.5,214.8L64.2,216.5L61.7,214.7L45.9,212.0L47.9,218.1L44.0,220.6L46.6,224.7L46.2,234.4L43.9,235.4L41.9,233.1L33.3,231.7L21.0,233.8L20.7,236.7L6.4,241.6L8.2,244.9L4.7,246.1L-3.0,255.7L-5.6,254.7L-9.7,257.0L-16.1,256.2L-21.1,258.5L-25.4,256.8L-30.8,259.3L-34.5,258.0L-36.7,261.0L-45.1,259.2L-48.2,264.3L-56.5,265.9L-62.4,269.4L-68.0,267.0L-71.6,275.6L-77.5,278.4L-80.8,275.0L-85.1,274.8L-89.0,279.5L-98.9,279.2L-106.7,281.7L-111.2,278.9L-117.5,281.2L-122.1,279.9L-123.3,283.3L-119.5,284.2L-122.8,285.6L-123.9,288.3L-119.7,296.7L-112.7,300.7L-109.6,306.3L-114.8,310.7L-117.1,311.2L-116.0,315.7L-104.8,318.7L-104.2,320.7L-95.8,323.9L-98.6,328.7L-100.8,329.8L-101.3,337.7L-97.9,336.4L-92.9,343.4L-93.4,346.2L-97.3,347.5L-97.1,349.0L-101.3,351.2L-98.8,354.8L-93.7,354.7L-88.8,356.6L-85.9,360.1L-81.8,360.4L-76.8,368.6L-77.6,371.4L-72.1,376.6L-63.3,379.1L-59.6,382.1L-59.7,386.4L-57.3,393.2L-60.4,396.4L-57.4,402.5L-57.4,406.9L-61.5,414.5L-55.3,419.7L-55.4,423.0L-51.1,421.8L-47.2,424.5L-45.4,427.6L-42.1,428.5L-40.7,432.8L-44.7,436.0L-37.8,435.7L-34.1,439.4L-32.6,442.8L-35.7,446.9L-34.5,451.6L-32.4,449.7L-30.7,454.1L-22.0,457.1L-18.7,464.3L-12.4,464.0L-14.2,467.4L-8.7,472.6L-7.0,477.2L-2.2,480.7L4.1,476.5L4.6,479.4L11.3,479.4L20.9,486.3L25.8,487.1L29.0,489.7L34.9,488.3L37.6,492.8L41.5,495.0L46.4,492.6L48.1,497.4L55.6,502.3L55.0,498.8L57.3,501.5L60.6,500.7L72.8,507.8L76.0,503.4L79.1,502.9L84.9,505.7L87.7,501.9L93.1,502.3L94.6,499.6L98.9,501.9L101.2,501.3L104.5,503.2L111.7,504.2ZM216.8,511.6L216.9,509.9L214.9,512.7L216.8,511.6Z"}, {"n": "今湖北", "d": "M-55.4,423.0L-56.6,422.2L-55.3,419.7L-61.5,414.5L-63.9,414.6L-67.8,419.6L-73.5,418.6L-77.1,419.9L-77.5,424.2L-84.7,425.0L-89.7,430.3L-94.9,424.3L-97.6,425.6L-100.6,423.2L-102.2,415.0L-105.9,414.5L-112.9,422.9L-122.8,421.4L-126.2,424.0L-131.4,422.9L-138.2,423.7L-143.5,419.1L-156.9,420.8L-160.1,418.8L-162.7,419.6L-174.8,415.2L-186.7,416.9L-190.7,414.6L-195.0,414.9L-198.0,412.5L-199.3,416.4L-208.6,416.2L-216.1,424.8L-207.8,426.1L-202.4,429.0L-191.2,428.3L-180.5,433.3L-183.5,449.1L-181.0,451.8L-175.2,450.7L-174.3,449.0L-169.3,449.6L-167.3,451.3L-161.1,451.4L-149.5,456.7L-145.8,459.7L-147.3,462.2L-144.1,463.3L-144.3,471.7L-139.4,476.7L-144.6,480.7L-147.6,478.3L-151.0,478.3L-151.6,481.9L-158.2,485.3L-162.9,482.2L-168.9,480.7L-178.3,482.3L-187.3,479.1L-196.8,480.0L-198.0,483.2L-196.3,485.9L-202.5,489.3L-207.3,496.7L-207.0,499.4L-209.7,501.1L-208.7,505.8L-210.5,510.0L-207.1,513.0L-205.0,517.5L-200.7,518.1L-199.6,520.1L-201.3,523.9L-197.8,529.3L-200.9,535.2L-200.9,538.7L-196.8,543.8L-198.0,547.2L-201.5,550.0L-199.6,551.4L-196.6,559.6L-200.8,561.1L-201.4,567.3L-197.8,568.8L-191.7,568.0L-186.9,569.9L-186.3,577.1L-183.5,579.7L-185.5,580.2L-187.2,585.2L-176.2,584.5L-170.5,588.1L-163.0,589.1L-165.5,592.9L-161.2,592.5L-154.6,598.9L-148.1,599.0L-143.8,608.6L-144.4,612.0L-142.0,622.0L-140.0,624.1L-142.0,627.8L-145.3,628.3L-148.0,631.1L-147.9,636.8L-146.0,636.9L-145.9,641.3L-142.7,642.1L-144.6,644.6L-144.8,648.8L-151.8,660.0L-155.2,659.9L-158.0,657.1L-159.2,651.7L-165.6,652.1L-170.5,650.0L-181.9,655.2L-194.3,663.9L-193.9,666.1L-197.5,669.7L-200.9,670.6L-202.6,675.3L-205.7,676.0L-206.5,673.5L-216.4,680.4L-224.5,691.3L-226.3,687.8L-223.9,684.9L-230.0,677.0L-235.5,681.9L-245.6,687.9L-250.7,682.1L-248.8,675.4L-252.9,676.0L-255.7,674.4L-259.4,677.3L-262.8,677.2L-276.1,689.7L-279.1,690.9L-281.0,688.7L-285.6,690.5L-290.1,685.5L-291.1,681.2L-295.7,682.1L-295.0,686.1L-303.2,693.1L-304.4,691.2L-308.7,689.8L-312.7,691.3L-317.3,690.8L-318.9,696.1L-317.0,698.4L-319.8,702.3L-316.9,704.6L-313.9,704.0L-309.9,708.5L-307.6,709.0L-305.5,713.0L-301.8,714.4L-304.8,723.6L-303.2,724.3L-308.6,734.2L-306.8,734.8L-306.4,741.7L-308.2,746.1L-308.4,751.5L-313.2,753.6L-316.6,752.0L-322.9,755.9L-317.6,758.4L-317.8,762.7L-315.7,762.1L-316.3,765.9L-313.9,765.9L-309.6,769.2L-309.5,767.1L-305.1,765.1L-307.5,762.9L-299.9,753.6L-294.1,754.5L-292.0,760.0L-290.9,771.0L-284.7,775.1L-281.4,770.8L-280.2,774.0L-281.8,776.4L-275.6,774.2L-271.2,777.1L-273.0,780.3L-269.9,779.5L-268.7,782.5L-272.2,786.1L-271.1,789.8L-273.3,792.9L-271.6,795.9L-267.3,796.4L-266.6,800.0L-268.1,807.4L-261.6,806.7L-260.0,803.6L-256.5,803.9L-253.9,799.7L-248.8,803.9L-249.3,811.1L-245.8,813.0L-249.0,818.4L-246.1,823.1L-243.7,821.9L-236.8,828.1L-232.6,827.8L-233.9,823.9L-232.5,819.8L-234.2,817.7L-224.8,811.5L-225.6,803.1L-220.9,802.8L-223.1,798.6L-218.2,794.7L-218.4,790.2L-216.4,791.1L-216.6,786.9L-214.2,788.7L-213.3,784.0L-211.1,784.7L-208.4,777.4L-204.1,779.3L-202.1,777.0L-194.8,777.4L-193.5,780.0L-188.2,778.5L-189.9,776.4L-188.5,772.6L-184.0,771.1L-184.5,766.7L-182.1,764.2L-173.0,762.5L-169.2,763.6L-157.6,763.0L-148.6,761.0L-143.9,764.6L-138.0,765.3L-131.0,770.4L-129.8,773.8L-126.1,773.2L-122.8,776.7L-115.3,773.5L-113.3,768.7L-109.3,770.8L-103.7,768.7L-95.7,762.4L-100.0,756.0L-105.0,755.2L-106.1,750.4L-110.1,748.8L-108.3,743.9L-104.3,741.2L-110.9,738.0L-110.2,734.5L-99.9,734.6L-94.9,732.2L-88.8,736.7L-84.4,734.6L-85.3,728.7L-74.9,727.4L-67.6,728.9L-67.0,733.7L-35.8,736.0L-26.8,742.9L-25.7,745.5L-21.7,745.0L-20.6,748.7L-16.3,747.0L-12.4,748.1L-7.3,747.4L-4.6,750.6L10.5,751.0L15.8,748.0L21.1,749.9L26.1,754.3L36.6,756.7L35.5,760.3L47.6,765.6L46.6,771.9L49.0,771.5L51.1,774.1L57.8,774.3L60.2,776.6L64.4,774.1L63.4,778.4L70.3,781.4L68.1,786.3L69.1,788.3L73.3,785.5L76.9,785.9L82.5,780.1L84.0,776.6L89.9,777.1L94.2,779.9L97.2,777.6L104.0,779.2L105.1,780.8L109.4,779.8L111.4,775.1L113.3,775.5L118.9,771.9L119.4,766.4L126.1,761.7L130.2,760.9L132.9,762.6L132.7,770.8L134.5,771.7L137.5,766.7L142.6,762.7L140.5,770.6L131.2,779.3L135.0,792.7L143.5,787.6L145.7,787.7L147.8,796.2L150.0,794.0L154.5,795.1L177.8,769.7L197.2,755.1L197.5,759.1L195.1,763.2L195.9,767.3L194.0,770.0L194.7,772.4L200.6,773.3L206.3,771.6L208.1,775.7L210.4,776.5L213.9,782.1L203.1,787.7L207.8,788.6L215.5,795.3L213.1,800.6L207.5,801.2L206.1,806.7L203.2,808.4L201.0,814.9L205.2,817.4L209.3,817.4L209.2,820.3L206.3,823.1L209.6,832.3L212.3,829.5L215.0,833.9L217.6,830.5L221.6,829.5L225.3,834.1L228.2,833.5L227.7,836.2L229.8,837.1L234.2,835.3L235.2,830.7L243.5,824.8L246.3,819.5L265.2,816.5L265.9,805.6L270.7,803.5L274.2,807.2L277.6,807.7L284.0,805.8L286.6,807.6L292.0,807.4L307.3,800.4L314.1,801.3L316.0,803.7L318.4,801.4L326.6,799.6L329.5,800.2L333.1,797.7L334.7,793.5L333.6,791.3L330.5,792.7L331.8,794.6L328.9,796.4L326.0,792.4L330.1,789.4L334.0,790.6L336.7,787.8L334.8,785.7L340.1,782.8L343.3,785.3L348.7,784.0L348.6,787.4L355.4,789.0L355.7,781.5L352.0,780.2L354.4,775.4L351.8,774.4L351.3,771.5L357.7,774.5L365.1,774.0L368.6,778.2L370.5,776.3L375.5,775.0L387.1,766.0L387.9,758.9L391.2,756.0L406.8,755.0L410.7,756.2L423.7,765.2L431.0,767.6L436.6,767.6L453.5,758.0L452.8,750.2L447.4,743.0L449.1,736.4L447.9,733.8L448.8,729.0L445.6,721.9L446.6,719.5L439.8,714.7L438.6,710.9L430.3,708.6L431.5,706.2L428.5,702.0L432.1,698.4L429.5,694.7L431.0,688.1L427.7,681.8L424.9,679.8L421.9,680.2L421.4,676.3L416.3,671.5L418.3,664.8L425.1,664.3L426.4,658.4L424.9,657.2L426.5,653.6L433.3,651.0L437.6,646.8L444.0,644.2L447.2,644.3L445.9,638.7L441.5,638.8L440.6,636.5L433.9,635.3L434.0,632.8L428.8,629.1L426.7,625.2L417.9,628.8L410.1,619.9L405.5,618.9L398.6,625.6L394.0,620.5L394.0,616.8L390.8,613.2L387.3,613.5L384.4,605.6L377.2,605.1L379.3,601.0L377.4,599.4L370.1,601.6L365.1,600.8L365.3,597.8L361.1,595.8L363.6,584.5L361.3,584.5L356.4,579.5L352.5,580.1L350.7,583.2L351.5,587.0L349.6,589.2L342.3,587.2L339.5,592.9L336.2,590.5L328.4,593.1L327.0,592.1L323.0,594.1L318.9,592.0L317.9,587.9L309.6,587.4L304.2,581.8L301.7,581.5L297.3,584.6L296.1,583.9L294.8,577.6L297.1,573.9L298.6,563.8L295.0,563.3L293.1,565.7L284.4,567.2L275.0,564.4L269.3,564.7L263.6,556.7L259.2,554.8L253.4,555.7L252.2,559.1L248.7,561.8L241.8,562.9L238.9,565.0L235.2,560.6L235.8,554.7L231.5,552.3L229.4,555.3L225.4,555.7L223.1,552.1L223.2,548.1L220.6,547.1L221.7,543.6L215.8,541.0L219.2,536.4L212.9,531.7L212.3,527.6L215.0,528.4L218.2,521.5L213.9,514.4L216.9,509.9L215.4,507.2L216.8,503.0L213.6,498.9L210.0,497.9L205.1,498.7L202.5,503.9L182.9,512.9L177.6,510.2L175.4,510.5L171.8,507.3L173.4,506.4L161.2,496.8L155.9,498.9L155.6,501.9L151.9,502.4L150.8,500.1L147.9,500.5L142.6,497.5L140.1,498.3L139.2,502.2L131.2,500.9L128.9,502.3L126.1,500.4L117.6,504.1L113.6,504.4L104.5,503.2L101.2,501.3L98.9,501.9L94.6,499.6L93.1,502.3L87.7,501.9L84.9,505.7L79.1,502.9L76.0,503.4L72.8,507.8L60.6,500.7L57.3,501.5L55.0,498.8L55.6,502.3L48.1,497.4L46.4,492.6L41.5,495.0L37.6,492.8L34.9,488.3L29.0,489.7L25.8,487.1L20.9,486.3L11.3,479.4L4.6,479.4L4.1,476.5L-2.2,480.7L-7.0,477.2L-8.7,472.6L-14.2,467.4L-12.4,464.0L-18.7,464.3L-22.0,457.1L-30.7,454.1L-32.4,449.7L-34.5,451.6L-35.7,446.9L-32.6,442.8L-34.1,439.4L-37.8,435.7L-44.7,436.0L-40.7,432.8L-42.1,428.5L-45.4,427.6L-47.2,424.5L-51.1,421.8L-55.4,423.0ZM-55.3,419.7L-56.6,422.2L-55.4,423.0L-55.3,419.7ZM111.7,504.2L113.6,504.4L111.7,504.2Z"}], "inset": "M106.8,31.6L105.1,30.5L104.3,30.8L104.6,31.2L102.9,31.7L103.4,32.4L102.2,33.0L102.2,33.9L105.4,34.0L105.4,32.9L106.8,32.7L106.8,31.6ZM107.8,34.5L108.2,34.1L107.2,33.3L107.8,32.9L106.9,32.4L106.4,33.9L105.5,34.0L105.3,36.1L107.7,36.2L108.5,34.9L107.8,34.5ZM107.1,31.4L106.5,32.1L107.8,32.9L107.2,33.2L107.5,34.0L109.6,35.7L112.9,33.1L112.2,31.7L110.4,31.0L111.4,29.8L109.2,29.8L108.7,28.8L109.1,28.0L107.9,26.7L105.7,27.2L105.4,28.2L103.1,28.3L102.0,29.1L100.7,29.1L100.6,27.8L99.1,28.7L98.2,30.4L99.9,32.2L98.4,33.0L100.0,34.1L99.5,35.3L98.4,35.3L97.6,36.5L99.0,38.7L97.3,41.0L97.6,41.6L102.0,42.5L101.7,41.6L103.4,39.5L107.8,37.6L108.3,37.0L107.5,36.4L105.3,36.1L105.5,34.0L104.6,34.4L102.1,33.6L102.2,33.0L103.4,32.4L102.9,31.7L105.0,30.5L107.1,31.4ZM106.4,32.8L105.4,32.9L105.7,33.8L106.4,33.9L106.4,32.8ZM89.8,46.2L97.7,43.7L98.0,41.9L97.3,41.0L99.0,38.7L97.6,36.5L98.4,35.3L99.5,35.3L100.0,34.1L98.4,33.0L99.9,32.2L99.0,31.2L97.6,32.2L94.5,32.4L93.6,33.9L91.7,34.5L91.0,36.8L90.1,37.4L90.8,39.0L89.8,40.3L90.4,43.7L89.4,45.5L89.8,46.2ZM57.6,26.2L59.3,29.0L58.8,29.5L60.5,30.8L60.5,31.6L64.8,30.9L64.9,32.4L63.2,33.3L66.6,34.5L66.9,35.6L68.9,36.3L69.6,35.7L69.2,35.2L74.5,34.4L74.8,35.5L72.8,36.9L72.7,37.8L74.7,39.3L78.6,38.4L79.1,35.7L80.6,34.6L81.5,35.4L80.3,37.1L84.1,38.8L85.9,38.7L86.6,36.8L89.3,34.4L92.1,34.4L93.6,33.9L94.5,32.4L98.8,31.7L98.3,29.6L99.2,29.3L100.0,27.8L100.7,27.9L100.7,29.1L101.6,29.2L103.1,28.3L105.4,28.2L105.7,27.2L107.8,26.7L109.1,28.0L108.7,28.8L109.3,29.8L111.3,29.9L111.8,29.2L111.4,27.7L112.0,27.2L113.5,28.9L118.0,26.5L121.9,25.7L122.3,24.8L121.3,24.5L121.9,24.2L121.5,22.9L120.8,22.0L118.8,22.7L118.2,21.1L118.7,20.2L117.2,19.0L117.7,18.4L119.9,19.1L120.0,18.2L121.0,17.8L120.5,17.0L122.0,16.7L121.3,16.0L120.6,16.6L119.1,15.1L123.6,12.2L124.3,13.2L124.9,10.8L125.9,10.7L126.0,8.4L128.0,6.1L125.7,4.6L124.0,5.6L120.6,5.5L119.6,3.6L120.0,3.2L118.5,2.6L117.4,3.0L116.1,2.3L117.6,1.3L117.3,0.8L115.2,0.7L113.3,1.9L115.0,2.5L115.2,3.4L111.1,7.7L111.7,8.3L107.9,9.8L105.2,9.0L102.3,13.2L103.3,14.3L105.4,13.8L106.9,14.4L107.9,13.5L109.8,13.6L112.5,15.5L113.0,16.8L107.0,17.0L106.8,17.5L104.9,17.7L103.9,19.2L100.0,19.9L97.7,21.5L93.5,20.7L92.3,22.4L93.6,24.0L87.8,27.0L82.7,27.0L76.7,29.2L66.6,26.5L57.6,26.2ZM121.8,33.5L123.3,33.7L124.8,32.1L127.1,31.2L127.3,30.2L126.1,28.6L126.6,27.8L125.1,26.2L125.1,25.4L124.1,26.1L122.5,24.5L121.1,26.1L118.0,26.5L113.5,28.9L112.9,27.6L111.4,27.7L111.8,29.4L110.4,31.0L112.2,31.7L112.9,33.1L114.4,32.5L116.0,30.9L117.7,30.9L118.7,31.8L116.2,34.1L117.4,34.6L116.0,36.1L121.8,33.5ZM136.6,27.1L137.3,25.7L139.2,27.1L138.6,26.4L140.4,25.9L140.8,24.5L138.6,24.1L138.5,23.2L134.9,24.4L133.6,22.0L132.2,23.1L131.6,21.9L130.4,21.9L130.2,20.5L127.8,20.5L127.1,19.6L123.9,19.8L122.7,17.7L120.0,18.2L119.9,19.1L117.7,18.4L117.2,19.0L118.7,20.2L118.2,21.1L118.8,22.7L120.8,22.0L121.6,24.7L122.6,24.6L124.1,26.1L125.1,25.4L125.1,26.2L126.6,27.8L126.2,28.9L127.3,30.2L126.8,30.9L127.9,30.8L130.1,28.6L130.9,29.4L133.0,29.7L133.5,29.2L132.8,28.2L135.0,28.1L136.6,27.1ZM121.9,17.9L122.9,17.7L123.0,19.0L123.9,19.8L127.1,19.6L127.8,20.5L130.2,20.5L130.4,21.9L131.6,21.9L132.2,23.1L133.6,22.0L134.9,24.4L138.5,23.2L138.6,24.1L140.4,24.7L140.8,23.2L139.9,21.2L142.2,20.0L145.2,20.5L147.1,17.8L147.8,15.2L149.2,14.2L149.0,12.9L150.0,12.5L145.2,13.2L143.8,14.2L140.1,14.3L139.2,13.3L139.2,11.4L138.2,11.4L136.4,10.1L131.6,9.1L131.8,8.1L130.1,6.1L129.2,3.5L126.9,1.2L121.8,0.0L117.4,0.4L116.9,0.6L117.7,1.2L116.1,2.3L120.0,3.2L119.6,3.6L120.6,5.5L124.0,5.6L125.7,4.6L128.0,6.1L126.0,8.4L125.9,10.7L124.9,10.8L124.3,13.2L123.6,12.2L119.1,15.1L120.6,16.7L121.3,16.0L122.0,16.2L120.5,17.0L121.0,17.8L121.9,17.9ZM115.4,54.9L116.3,55.7L118.1,55.3L116.5,53.7L115.4,54.9ZM118.0,53.4L116.0,53.1L117.7,53.9L118.0,53.4ZM106.7,46.3L106.3,46.6L105.4,45.3L104.4,46.1L107.5,47.6L107.8,48.3L108.8,48.3L108.2,49.5L108.9,49.6L109.1,50.6L111.3,50.5L111.0,51.4L109.8,51.1L110.1,51.7L109.3,52.3L110.5,53.4L110.3,54.4L113.0,54.5L114.5,55.5L116.6,53.6L116.2,52.9L118.0,53.4L116.7,51.5L115.6,51.0L114.0,46.9L111.4,45.7L111.5,44.9L110.5,45.1L109.3,46.6L108.2,46.0L106.7,46.3ZM109.4,61.6L110.3,61.7L110.6,63.6L112.3,63.0L112.7,63.9L113.9,63.6L114.6,64.3L115.1,62.8L116.1,62.7L115.8,62.0L117.2,61.6L117.2,59.4L118.0,59.7L117.7,58.2L118.4,57.6L115.9,56.1L116.3,55.6L115.6,54.9L114.5,55.5L112.5,54.5L111.4,55.9L111.8,56.5L110.5,56.6L110.2,58.0L108.5,59.3L109.4,61.6ZM105.0,47.6L103.9,48.3L102.7,47.5L101.8,49.8L100.8,49.8L101.5,51.1L103.3,51.1L103.3,53.0L102.0,54.1L103.6,54.9L102.9,55.7L103.8,57.8L105.1,57.2L105.7,57.5L105.3,58.4L106.5,57.6L109.1,58.8L110.5,57.5L110.5,56.6L111.8,56.5L111.4,55.9L112.3,54.9L111.7,54.2L110.3,54.4L110.5,53.4L109.3,52.7L110.1,51.7L109.8,51.1L111.0,51.4L111.3,50.5L109.3,50.8L108.9,49.6L108.2,49.5L108.8,48.3L107.8,48.3L107.5,47.6L104.5,46.1L103.9,46.5L105.0,47.6ZM110.8,69.6L110.6,68.9L111.1,69.5L111.7,69.0L111.3,68.4L112.9,68.5L112.0,68.0L112.3,66.7L113.1,66.3L112.2,65.6L113.6,65.6L114.3,64.1L112.7,63.9L112.3,63.0L110.6,63.6L110.1,61.5L107.7,62.7L106.6,62.6L105.9,63.2L106.1,64.4L104.8,65.1L105.0,66.2L103.2,69.7L105.5,70.4L106.7,73.1L108.8,71.3L108.7,70.6L109.9,70.7L109.9,69.9L110.8,69.6ZM108.8,58.9L106.5,57.6L105.3,58.4L105.7,57.5L105.1,57.2L98.5,59.6L99.2,61.5L97.6,63.4L98.9,65.7L98.5,66.8L99.2,66.8L98.5,68.5L100.4,68.9L99.1,70.4L99.7,70.8L102.1,70.1L103.1,70.6L103.1,69.1L105.1,66.0L104.8,65.1L106.3,64.0L105.9,63.2L109.5,61.5L108.5,59.6L108.8,58.9ZM104.4,46.1L105.4,45.3L106.3,46.6L108.2,46.0L109.3,46.6L114.0,42.8L113.7,42.3L115.0,42.5L115.3,41.3L119.4,40.6L119.8,39.4L117.1,39.3L115.0,38.3L111.6,40.1L110.7,39.1L111.5,38.2L110.6,37.6L108.1,37.2L107.0,38.3L105.5,38.3L101.9,41.2L101.9,43.3L103.7,42.5L100.6,45.1L102.4,46.3L104.4,46.1ZM95.5,51.6L98.0,51.5L98.3,52.9L100.1,53.1L100.6,53.8L101.5,53.5L101.8,54.0L103.2,53.1L103.3,51.1L101.5,51.1L100.8,49.8L101.8,49.7L102.5,47.6L104.1,48.3L105.1,47.9L104.9,47.0L100.6,45.1L103.7,42.5L101.9,43.3L102.2,42.4L98.0,41.9L97.7,43.7L96.5,44.4L93.9,44.5L92.7,45.6L89.8,46.2L91.9,50.4L95.5,51.6ZM91.4,49.7L87.5,49.7L89.3,50.6L87.7,51.8L87.9,53.2L89.4,54.6L89.1,55.4L87.3,56.2L85.1,56.2L84.9,57.8L85.6,57.7L86.8,59.4L88.3,58.0L90.3,58.1L90.1,57.2L91.0,57.1L94.5,58.6L96.0,57.9L96.5,58.7L97.6,57.8L97.7,59.2L98.4,59.7L102.3,57.8L103.8,57.8L102.9,55.7L103.7,55.1L103.2,54.6L101.5,53.5L100.6,53.8L100.1,53.1L98.6,53.1L98.0,51.5L94.6,51.7L92.7,51.1L91.4,49.7ZM93.8,70.2L94.2,69.1L95.9,69.8L95.8,68.7L98.5,68.5L99.2,66.8L98.5,66.8L98.9,65.7L97.6,63.4L99.2,61.5L99.0,60.2L97.9,59.6L97.6,57.8L96.4,58.8L96.3,57.9L94.5,58.6L93.2,57.6L90.1,57.2L90.3,58.1L87.5,58.5L86.9,60.7L87.6,63.3L85.9,64.5L87.6,64.4L87.9,65.3L87.1,65.4L87.1,66.3L88.1,67.4L88.8,66.7L89.5,67.2L90.4,66.3L92.0,66.5L91.8,67.2L92.5,67.5L91.2,69.6L92.0,69.2L92.4,70.4L93.8,70.2ZM97.6,76.4L97.8,75.1L98.4,75.8L99.9,75.8L100.4,74.9L100.8,75.6L101.5,74.9L102.5,75.3L104.7,74.6L106.4,73.1L105.5,70.4L103.2,69.7L103.1,70.6L102.1,70.1L99.7,70.8L99.0,70.3L100.4,69.3L99.9,68.5L98.7,69.0L96.7,68.3L95.8,68.7L95.9,69.8L94.2,69.1L92.2,74.7L88.3,77.8L88.7,81.2L90.2,80.7L89.3,79.6L89.9,78.8L96.0,77.3L96.4,76.6L96.8,77.2L97.6,76.4ZM87.6,67.1L87.3,67.8L86.2,67.8L86.5,68.3L85.7,68.0L85.5,68.8L84.9,68.3L83.4,69.3L82.1,68.1L79.2,70.5L77.2,69.6L75.5,70.7L77.0,71.0L77.3,71.8L79.3,71.8L79.5,73.0L78.3,73.4L78.1,74.3L81.2,74.9L80.5,75.8L80.8,77.0L82.5,77.9L88.4,78.2L92.2,74.7L92.3,73.3L93.9,71.1L93.8,70.2L92.4,70.3L92.2,69.2L91.2,69.6L92.5,67.5L91.8,67.2L92.0,66.5L90.4,66.3L89.5,67.2L88.8,66.7L88.3,67.5L87.6,67.1ZM89.1,81.7L87.2,81.9L85.6,83.3L85.6,85.4L87.9,86.3L90.1,85.0L91.4,82.3L90.6,81.3L89.1,81.7ZM80.1,61.0L80.3,60.2L80.9,61.2L81.6,60.1L82.5,60.2L82.6,59.4L83.4,59.3L83.7,59.9L84.8,59.6L85.4,61.4L85.7,61.0L85.8,61.7L86.7,61.8L87.2,59.7L85.6,57.7L84.9,57.8L85.1,56.2L89.1,55.4L89.2,54.0L85.0,52.0L84.6,52.6L85.3,53.3L83.7,55.5L82.8,55.3L81.7,57.3L78.6,56.3L78.0,57.0L78.5,57.6L77.5,58.5L80.1,61.0ZM67.4,64.2L68.5,66.6L69.7,67.0L71.8,66.2L71.6,64.0L74.0,61.5L73.9,60.6L75.3,60.7L75.0,62.1L75.7,62.6L76.9,62.0L77.5,63.0L79.9,62.7L79.6,61.9L78.3,61.5L79.1,60.4L80.1,61.1L79.6,60.1L78.6,60.0L77.5,58.7L78.5,57.6L78.0,57.0L78.7,56.3L81.7,57.3L82.8,55.3L83.7,55.5L85.3,53.3L84.6,52.6L85.2,51.9L84.0,52.2L81.7,50.8L78.2,50.8L77.8,50.2L77.2,51.0L75.8,50.9L75.0,50.5L75.3,49.3L74.7,48.6L72.2,48.1L71.6,46.9L69.7,47.7L70.6,48.8L69.9,49.5L69.0,49.8L69.0,48.6L68.5,49.8L67.3,49.5L67.3,50.9L66.1,51.2L64.8,51.0L64.2,50.0L63.8,50.7L62.8,50.4L60.6,47.4L58.8,47.3L58.1,48.1L59.1,49.1L58.1,50.3L60.2,51.7L61.8,54.0L61.1,54.5L62.0,55.5L62.5,61.2L63.0,61.8L63.8,60.2L65.3,62.9L66.2,62.4L67.4,64.2ZM87.1,61.1L85.9,61.7L84.8,59.6L82.7,59.3L82.5,60.2L81.6,60.1L80.9,61.2L80.3,60.2L80.1,61.1L79.1,60.4L78.2,61.0L79.8,62.1L79.7,62.8L77.6,62.9L76.4,64.0L74.1,63.6L73.3,64.5L73.7,65.7L75.3,65.4L75.9,66.2L75.0,68.0L76.3,69.0L75.6,70.2L77.2,69.6L79.2,70.5L82.1,68.1L83.6,69.3L84.8,68.3L85.5,68.8L85.7,68.0L87.3,67.8L87.7,66.8L87.1,65.4L87.7,64.5L85.9,64.5L87.6,63.3L87.1,61.1ZM77.5,63.0L76.9,62.0L75.5,62.6L74.9,61.3L75.3,60.7L73.9,60.6L74.0,61.5L71.6,64.0L71.8,66.3L69.0,67.0L66.2,62.4L65.3,62.9L63.8,60.2L62.8,61.7L62.0,59.3L62.0,60.2L61.2,59.9L61.4,61.7L60.6,62.0L60.4,61.3L60.0,61.9L60.4,63.4L61.4,63.3L61.4,67.5L59.0,69.4L58.5,72.2L61.8,71.6L61.3,72.5L61.8,73.9L63.5,74.6L62.5,76.5L64.5,76.7L65.1,78.2L67.3,77.4L67.5,78.7L68.8,78.9L68.6,75.7L70.1,75.8L70.6,75.0L71.9,75.8L72.6,74.9L74.2,75.6L74.6,74.9L76.1,74.9L76.4,74.0L79.5,73.0L79.1,71.7L77.3,71.8L77.0,71.0L75.7,71.0L76.3,69.0L75.0,68.0L75.9,66.1L75.3,65.4L73.8,65.8L73.3,64.5L74.1,63.6L77.2,63.8L77.5,63.0ZM39.5,42.5L36.5,41.6L33.9,41.7L26.0,44.3L21.8,43.5L19.9,44.6L16.9,44.1L15.3,46.5L13.5,46.6L12.6,47.4L14.1,50.7L13.3,51.7L12.8,50.8L11.9,51.2L13.4,54.8L15.0,55.0L18.6,57.3L19.3,56.4L20.9,56.5L24.6,59.4L25.8,59.1L26.7,60.5L28.3,60.6L28.3,61.4L29.8,61.3L30.4,62.5L30.9,61.8L33.4,62.7L37.2,62.1L37.7,64.2L39.7,61.7L42.7,62.6L43.7,62.2L44.0,63.4L45.2,63.7L45.3,65.0L49.5,64.6L50.6,63.3L54.4,61.5L57.5,62.9L58.6,60.9L60.0,61.9L60.4,61.3L60.6,62.0L61.4,61.7L61.2,59.9L62.0,60.2L62.3,57.6L62.0,55.5L61.1,54.5L61.8,54.0L60.2,51.7L58.1,51.1L58.0,52.3L56.5,52.5L56.7,53.3L55.2,52.7L55.2,53.5L53.6,53.1L52.9,51.5L51.4,50.9L48.7,51.4L41.2,49.4L39.3,47.5L39.9,45.7L38.8,44.7L39.7,43.1L38.7,42.7L39.5,42.5ZM89.8,46.2L89.4,45.5L90.4,43.7L89.8,40.3L90.8,39.0L90.1,37.4L91.9,34.7L91.7,34.0L90.6,34.8L89.3,34.4L86.6,36.8L85.9,38.7L83.2,38.2L82.3,38.9L82.3,40.6L85.6,41.8L85.5,44.4L83.4,44.4L83.7,45.2L82.9,45.4L80.5,45.0L79.9,46.2L80.9,46.7L80.1,47.9L80.6,48.7L79.1,48.6L78.4,49.1L78.9,50.1L77.9,50.4L81.7,50.8L82.2,51.5L85.2,51.9L87.9,53.2L88.0,51.1L89.4,51.0L87.7,49.5L90.6,49.8L91.4,49.3L89.8,46.2ZM80.4,43.4L80.0,44.6L78.9,44.2L77.6,43.3L78.0,42.4L77.1,40.3L72.8,38.2L72.8,36.9L74.8,35.5L74.5,34.4L69.2,35.2L69.6,35.7L68.9,36.3L66.9,35.6L66.6,34.5L63.2,33.3L64.9,32.4L64.8,30.9L60.5,31.6L60.5,30.8L58.8,29.5L59.3,29.0L57.6,26.2L55.0,26.7L54.9,28.3L51.2,29.4L49.3,31.4L47.3,31.6L45.9,34.9L50.8,36.0L51.3,37.0L54.1,36.9L55.4,37.5L57.4,36.5L57.1,35.0L59.9,36.0L61.6,35.3L64.8,37.3L64.7,36.6L67.5,38.3L69.4,38.6L71.0,40.1L70.5,40.4L72.0,42.2L71.7,43.2L69.2,45.5L70.0,46.8L69.3,47.4L66.8,46.7L66.4,47.2L67.4,48.5L69.1,48.7L69.1,49.8L70.5,49.0L69.7,47.7L71.6,46.9L72.2,48.1L74.7,48.6L75.3,49.3L75.0,50.5L75.8,50.9L78.8,50.2L78.9,48.7L80.6,48.7L80.1,47.9L80.9,46.7L79.9,46.2L80.5,45.0L82.9,45.4L83.7,45.2L83.4,44.4L85.5,44.4L85.5,41.7L82.0,40.0L80.6,40.0L80.7,41.0L80.0,41.4L81.5,42.5L81.3,43.4L80.4,43.4ZM71.4,41.9L70.5,40.4L70.9,39.9L69.4,38.6L67.5,38.3L64.7,36.6L64.8,37.3L61.6,35.3L59.9,36.0L57.1,35.0L57.4,36.5L55.4,37.5L54.1,36.9L51.3,37.0L50.8,36.0L47.9,35.7L47.8,35.0L40.5,36.7L41.5,37.1L41.4,38.6L43.3,39.9L41.9,41.2L42.9,42.5L40.2,42.1L38.7,42.7L39.7,43.1L38.8,44.7L39.9,45.7L39.3,47.5L41.1,49.4L48.7,51.4L51.4,50.9L52.9,51.5L53.6,53.1L55.3,53.5L55.2,52.7L56.7,53.3L56.5,52.5L58.0,52.3L58.0,51.2L59.0,51.2L58.1,50.3L59.1,49.1L58.1,48.0L59.2,47.1L60.6,47.4L62.8,50.4L63.8,50.7L64.2,50.0L65.0,51.0L67.3,50.9L67.3,49.5L68.5,49.8L68.9,48.8L67.4,48.5L66.5,46.9L68.8,47.4L70.0,46.8L69.2,45.5L70.4,44.8L70.1,44.2L71.4,43.8L71.1,43.3L72.0,42.2L71.4,41.9ZM82.2,40.1L82.3,38.9L83.2,38.3L80.3,37.1L81.5,35.6L81.0,34.5L79.1,35.7L78.6,38.4L75.0,39.3L77.1,40.3L78.0,42.4L77.6,43.3L80.0,44.6L80.2,43.5L81.4,43.2L81.4,42.4L80.0,41.4L80.7,41.0L80.6,40.0L82.2,40.1ZM55.7,26.4L53.2,23.2L53.4,22.6L51.7,22.5L48.7,20.9L42.3,20.4L41.8,19.4L42.7,18.4L42.7,16.7L41.1,14.4L35.2,12.1L34.9,10.7L32.6,10.8L31.8,12.2L29.4,13.1L29.3,15.8L27.9,16.3L23.2,15.5L21.3,19.3L22.1,20.4L20.2,19.9L15.6,21.1L16.8,21.8L17.8,25.3L16.7,25.6L17.3,26.0L16.5,26.1L16.2,28.1L10.4,30.5L8.2,30.5L6.9,32.2L5.4,32.3L5.1,31.4L3.3,31.8L3.4,32.2L1.3,32.8L0.9,34.3L0.0,34.5L0.7,36.4L3.3,36.7L4.0,39.5L2.4,40.2L5.8,41.1L6.5,43.2L11.3,44.0L11.5,45.9L13.1,46.8L15.3,46.5L16.9,44.1L19.9,44.6L21.8,43.5L26.0,44.3L33.8,41.7L36.5,41.6L42.2,42.7L42.9,42.5L42.0,40.8L43.3,39.9L41.4,38.6L41.5,37.1L40.4,36.7L46.1,35.4L47.3,31.6L49.3,31.4L51.2,29.4L54.9,28.3L54.7,27.1L55.7,26.4ZM114.3,75.8L115.3,77.2L116.7,74.1L118.1,69.6L117.2,68.8L115.7,69.5L113.5,72.7L113.3,74.3L114.3,75.8ZM98.7,75.6L98.3,76.4L99.6,76.0L98.7,75.6Z", "iw": 150.0, "ih": 88.9, "ibox": [91.3, 38.9, 20.0, 12.2]};
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/176_v190-kzlife-js.js ════ */
try {
/* V190：〈論語選〉「孔子的一生」地圖動畫（取代舊「周遊列國」長圖頁；老師 11/2）。
   頁面本身是 extras.authorPages「作者·補充｜孔子的一生」，body 只放 <div class="kzl"></div>，本檔負責畫出內容。
   左：示意地圖（只標國名位置，不畫河流）＋小紅點逐站移動、留下軌跡；右：該階段文字說明；上：階段時間軸可點。
   內容依據（不寫在頁面上）：翰林備課用書「作者生平傳略」為主；周遊列國 8 段路線與文字照翰林 PPT（原「周遊列國」頁文字）；
   三民閱讀文選備課用書「孔子生平事略」補翰林沒有的（夾谷、墮三都、北返經陳、弟子守喪）；原「生平軼事」浮框文字（西狩獲麟）。
   出處與差異整理見教學系統專案 docs/交接_20261102_論語選_孔子一生與儒家_待做.md 與 docs/課文盤點/孔子一生與儒家_資料整理.md。 */
(function () {
  /* 地點：經緯度（今地）→ SVG 座標 */
  var PL = {
    '周': { ll: [112.45, 34.62], n: '周（雒邑）' }, '鄭': { ll: [113.74, 34.40], n: '鄭' },
    '衛': { ll: [115.03, 35.76], n: '衛' }, '匡': { ll: [114.67, 35.20], n: '匡', s: 1 },
    '曹': { ll: [115.57, 35.07], n: '曹' }, '宋': { ll: [115.65, 34.41], n: '宋' },
    '魯': { ll: [116.99, 35.58], n: '魯（曲阜）' }, '陬': { ll: [117.17, 35.47], n: '陬邑', s: 1 },
    '齊': { ll: [118.31, 36.81], n: '齊' }, '陳': { ll: [114.88, 33.73], n: '陳' },
    '蔡': { ll: [114.27, 33.26], n: '蔡' }, '楚': { ll: [113.36, 33.62], n: '楚（葉）' }
  };
  /* 標籤位置微調（避免與點、其他字重疊）：[dx, dy, 對齊] */
  var LBL = { '周': [0, -16, 'middle'], '鄭': [0, 30, 'middle'], '衛': [-14, -10, 'end'], '匡': [-12, 6, 'end'], '曹': [14, 6, 'start'],
    '宋': [14, 8, 'start'], '魯': [-14, -12, 'end'], '陬': [12, 18, 'start'], '齊': [0, -16, 'middle'], '陳': [14, 8, 'start'],
    '蔡': [-14, 9, 'end'], '楚': [0, -16, 'middle'] };
  function xy(k) { var ll = PL[k].ll; return [Math.round((ll[0] - 112) * 100 + 40), Math.round((37.2 - ll[1]) * 100 + 20)]; }

  /* g：時間軸分組；tl：時間軸按鈕字；age：右上大字；yr：年代；path：本階段走過的地點（第一個是出發點） */
  var ST = [
    { g: '早年', tl: '出生', age: '出生', yr: '西元前 551 年（魯襄公二十二年）', path: ['陬'], h: '生於魯國陬邑',
      t: '祖先是<b>宋國</b>貴族，因避難來到魯國，家境逐漸衰落。父親<b>叔梁紇</b>晚年與<b>顏徵在</b>生下孔子。孔子名<b>丘</b>，字<b>仲尼</b>。' },
    { g: '早年', tl: '3歲', age: '3 歲', path: ['陬', '魯'], h: '父親去世，遷居曲阜',
      t: '母親帶著孔子遷居魯國國都<b>曲阜</b>的闕里，貧賤度日。魯國是周公的封地，保留許多周禮；孔子小時候玩遊戲，常擺設俎豆等祭器，模仿祭禮。<span class="kzl-q">「為兒嬉戲，常陳俎豆，設禮容。」（《史記．孔子世家》）</span>' },
    { g: '早年', tl: '15歲', age: '15～19 歲', path: ['魯'], h: '志於學、少也賤',
      t: '<span class="kzl-q">「吾十有五而志于學。」（〈為政〉）</span>十六、七歲母親去世；十九歲結婚，生子<b>孔鯉</b>。為了謀生，做過管理倉庫的<b>委吏</b>、牧養牛羊的<b>乘田</b>。<span class="kzl-q">「吾少也賤，故多能鄙事。」（〈子罕〉）</span>' },
    { g: '求學授徒', tl: '問禮', age: '青年', path: ['魯', '周', '魯'], h: '好學善問',
      t: '到周的都城雒邑考察宗廟制度，<b>向老子問禮</b>，向周大夫<b>萇弘</b>問樂；也向郯子學官制、向師襄學琴，連隱士、狂人都虛心求教。' },
    { g: '求學授徒', tl: '30歲', age: '30 歲左右', path: ['魯'], h: '開始講學',
      t: '成為中國歷史上<b>第一位私人興學</b>的教育家。主張<b>有教無類</b>：只要備「束脩」（十條乾肉）之禮就收。弟子有貴族子弟孟懿子、南宮敬叔，也有貧家子弟顏回、子路等。' },
    { g: '求學授徒', tl: '35歲', age: '35 歲', path: ['魯', '齊', '魯'], h: '去魯至齊，接淅而行',
      t: '魯國三桓專權、禮壞樂崩，孔子到齊國。齊景公兩度問政，孔子答<span class="kzl-q">「君君、臣臣、父父、子子」</span>、<span class="kzl-q">「政在節財」</span>。景公想封他尼谿之地，<b>晏嬰</b>反對；孔子<span class="kzl-q">「接淅而行」</span>，匆匆返回魯國。' },
    { g: '從政', tl: '52歲', age: '52 歲', yr: '西元前 501 年（魯定公九年）', path: ['魯'], h: '治魯有方',
      t: '任<b>中都宰</b>，<span class="kzl-q">「一年，四方皆則之」</span>；再升<b>司空</b>、<b>大司寇</b>。夾谷之會讓齊國歸還侵占的土地；推動「墮三都」削弱三桓，功敗垂成。齊國送來女樂，魯君沉溺其中，一連三日不上朝。' },
    { g: '周遊列國', tl: '①', zy: 1, age: '55 歲', path: ['魯', '衛'], h: '由魯到衛',
      t: '魯國辦郊祭，孔子未收到祭肉，知抱負無法實現，離魯去衛，周遊列國自此開始。' },
    { g: '周遊列國', tl: '②', zy: 2, path: ['衛', '匡', '衛'], h: '離衛去陳再返衛',
      t: '離衛去陳途中，因相貌近似殘害匡地的宰相陽貨，而被匡人圍攻，受困於匡邑，解圍後再度返衛。' },
    { g: '周遊列國', tl: '③', zy: 3, path: ['衛', '魯'], h: '離衛返魯',
      t: '因不齒衛靈公耽溺美色，再度離開衛國，回到魯國。' },
    { g: '周遊列國', tl: '④', zy: 4, path: ['魯', '衛'], h: '再返衛國',
      t: '返魯不久，再到衛國，衛靈公雖以禮相待，但未能重用。晉內亂，衛靈公請教孔子作戰之法，孔子僅說自己只聽過祭祀禮儀之事，便離開衛國。' },
    { g: '周遊列國', tl: '⑤', zy: 5, path: ['衛', '曹', '宋', '鄭'], h: '離衛，經曹到宋，再到鄭國',
      t: '離開衛國後，孔子經曹到宋，再到鄭國。期間因批評宋國司馬而險被殺害，逃亡途中與弟子走散，落魄模樣被鄭人稱為「喪家犬」。' },
    { g: '周遊列國', tl: '⑥', zy: 6, path: ['鄭', '陳', '蔡'], h: '陳蔡遊歷',
      t: '由鄭國到陳國後，孔子於陳、蔡間遊歷。' },
    { g: '周遊列國', tl: '⑦', zy: 7, path: ['蔡', '楚', '陳', '衛'], h: '前往楚國',
      t: '應楚昭王之聘，取道陳、蔡前往楚國，卻受困於此，<b>絕糧七日</b>。後楚昭王派軍隊來迎接，始得解除危機。楚昭王過世後，孔子返衛國。' },
    { g: '周遊列國', tl: '⑧', zy: 8, age: '68 歲', yr: '魯哀公十一年', path: ['衛', '魯'], h: '結束周遊列國',
      t: '季康子派人帶著禮物到衛國迎接，孔子自衛返魯，結束長達<b>十四年</b>的周遊列國，從此致力於教育職志。並整理《詩》、《書》，作《春秋》。' },
    { g: '晚年', tl: '71歲', age: '71 歲', path: ['魯'], h: '西狩獲麟',
      t: '晚年整理六經：刪《詩》、《書》，定《禮》、《樂》，作《春秋》。聽聞「西狩獲麟」，嘆<span class="kzl-q">「吾道窮矣」</span>，這年停止修訂《春秋》。妻子、兒子孔鯉、得意門生<b>顏回</b>、跟隨最久的<b>子路</b>相繼去世。' },
    { g: '晚年', tl: '73歲', age: '73 歲', yr: '西元前 479 年（魯哀公十六年）', path: ['魯'], h: '病逝',
      t: '孔子病逝，享年七十三歲。弟子感念師恩，在墓旁建屋守喪<b>三年</b>；三年後各奔東西，只有<b>子貢</b>又多住了三年。後世尊為「至聖先師」、「萬世師表」。' }
  ];

  /* V201：原典故事（老師 11/2：遇險、南子、身高等補原文；點開才顯示）。原文用維基文庫核對，出處見 docs/課文盤點/春秋的士與孔子遇險_資料整理.md */
  var X = {"0": ["身高", "<div class=\"sp-anc\">孔子長九尺有六寸，人皆謂之「長人」而異之。（《史記．孔子世家》）</div>大家都叫他「長人」，覺得他高得出奇（古今尺長不同，換算說法不一）。"], "3": ["魯君出車", "<div class=\"sp-anc\">魯南宮敬叔言魯君曰：「請與孔子適周。」魯君與之一乘車，兩馬，一豎子俱，適周問禮，蓋見老子云。（《史記．孔子世家》）</div>學生南宮敬叔向魯君請求，魯君給了一輛車、兩匹馬、一個僮僕，讓孔子到周去問禮。"], "7": ["奉粟六萬", "<div class=\"sp-anc\">衛靈公問孔子：「居魯得祿幾何？」對曰：「奉粟六萬。」衛人亦致粟六萬。（《史記．孔子世家》）</div>衛靈公問他在魯國領多少俸祿，衛國就照樣給（「六萬」的單位說法不一）。"], "8": ["匡人圍孔子", "<div class=\"sp-anc\">子畏於匡。曰：「文王既沒，文不在茲乎？天之將喪斯文也，後死者不得與於斯文也；天之未喪斯文也，匡人其如予何？」（〈子罕〉）</div>被圍時孔子說：上天如果還不想讓這套文化滅亡，匡人又能拿我怎樣？<div class=\"sp-anc\">子畏於匡，顏淵後。子曰：「吾以女為死矣。」曰：「子在，回何敢死？」（〈先進〉）</div>顏淵落在後面才到，孔子以為他死了；顏淵說：老師還在，我怎麼敢死？"], "9": ["同車招搖過市", "<div class=\"sp-anc\">居衛月餘，靈公與夫人同車，宦者雍渠參乘，出，使孔子為次乘，招搖市過之。孔子曰：「吾未見好德如好色者也。」於是醜之，去衛，過曹。（《史記．孔子世家》）</div>衛靈公和夫人南子坐第一輛車、宦官陪坐，卻讓孔子坐後面那輛，在街上招搖而過。孔子覺得可恥，離開衛國。"], "10": ["靈公問陳", "<div class=\"sp-anc\">衛靈公問陳於孔子。孔子對曰：「俎豆之事，則嘗聞之矣；軍旅之事，未之學也。」明日遂行。（〈衛靈公〉）</div>衛靈公問排兵布陣，孔子說祭祀禮儀聽過，打仗的事沒學過，第二天就走了。"], "11": ["宋國拔樹", "<div class=\"sp-anc\">孔子去曹適宋，與弟子習禮大樹下。宋司馬桓魋欲殺孔子，拔其樹。孔子去。弟子曰：「可以速矣。」孔子曰：「天生德於予，桓魋其如予何！」（《史記．孔子世家》）</div>孔子在大樹下帶學生演習禮儀，桓魋想殺他，把樹拔了。學生催他快走，孔子說：上天給了我德行，桓魋能拿我怎樣？"], "13": ["陳蔡絕糧、蒲人圍困", "<div class=\"sp-anc\">在陳絕糧，從者病，莫能興。子路慍見曰：「君子亦有窮乎？」子曰：「君子固窮，小人窮斯濫矣。」（〈衛靈公〉）</div>斷糧時大家餓到爬不起來，子路生氣地問：君子也會這麼窮困嗎？孔子說：君子窮困時仍守得住，小人一窮就亂來。<div class=\"sp-anc\">於是使子貢至楚。楚昭王興師迎孔子，然後得免。（《史記．孔子世家》）</div>派子貢到楚國求救，楚王派兵來接，才脫險。<div class=\"sp-anc\">過蒲，會公叔氏以蒲畔，蒲人止孔子。弟子有公良孺者，以私車五乘從孔子。其為人長賢，有勇力，謂曰：「吾昔從夫子遇難於匡，今又遇難於此，命也已。吾與夫子再罹難，寧鬥而死。」鬥甚疾。蒲人懼，謂孔子曰：「苟毋適衛，吾出子。」與之盟，出孔子東門。孔子遂適衛。子貢曰：「盟可負耶？」孔子曰：「要盟也，神不聽。」（《史記．孔子世家》）</div>《史記》記在離開陳國回衛國的路上：經過蒲，碰上蒲人叛亂被攔下。弟子公良孺帶著自家五輛車，拚死奮戰；蒲人怕了，要孔子發誓不去衛國才放人。孔子一出城就去衛國。子貢問：誓言可以違背嗎？孔子說：被要脅立的誓，神不會理。"]};

  /* V193：底圖＝今省界（177_v193-kzlmap-data-js.js）＋右下角全中國小地圖（紅框＝本圖範圍）；只作示意，古今疆界不同 */
  var PROV_LBL = [['今山西', 70, 92], ['今河北', 300, 44], ['今河南', 150, 222], ['今山東', 610, 232], ['今江蘇', 640, 392], ['今安徽', 500, 425]];
  function baseMap() {
    var M = window.KZL_MAP; if (!M) return '';
    var s = '<g clip-path="url(#kzl-clip)"><g class="kzl-prov">' + M.prov.map(function (p) { return p.d ? '<path d="' + p.d + '"/>' : ''; }).join('') + '</g>' +
      PROV_LBL.map(function (l) { return '<text class="kzl-prov-n" x="' + l[1] + '" y="' + l[2] + '" text-anchor="middle">' + l[0] + '</text>'; }).join('') + '</g>';
    var ox = 712 - M.iw - 8, oy = 432 - M.ih - 8, b = M.ibox;
    s += '<g class="kzl-inset" transform="translate(' + ox + ',' + oy + ')"><rect class="kzl-inset-bg" x="-6" y="-6" width="' + (M.iw + 12) + '" height="' + (M.ih + 12) + '" rx="6"/>' +
      '<path class="kzl-inset-land" d="' + M.inset + '"/><rect class="kzl-inset-box" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '"/></g>';
    return s;
  }
  function svgHTML() {
    var s = '<svg class="kzl-map" viewBox="0 0 720 440" role="img" aria-label="孔子一生行跡示意地圖">' +
      '<defs><clipPath id="kzl-clip"><rect x="2" y="2" width="716" height="436" rx="14"/></clipPath></defs>' +
      '<rect class="kzl-bg" x="2" y="2" width="716" height="436" rx="14"/>' + baseMap() +
      '<text class="kzl-compass" x="40" y="44" text-anchor="middle">北</text><path class="kzl-compass-a" d="M40 50 l-7 16 l7 -5 l7 5 z"/>' +
      '<g class="kzl-trail"></g><polyline class="kzl-cur" points=""/>';
    Object.keys(PL).forEach(function (k) {
      var p = xy(k), L = LBL[k];
      s += '<g class="kzl-pl' + (PL[k].s ? ' sm' : '') + '" data-k="' + k + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (PL[k].s ? 4 : 6) + '"/>' +
        '<text x="' + (p[0] + L[0]) + '" y="' + (p[1] + L[1]) + '" text-anchor="' + L[2] + '">' + PL[k].n + '</text></g>';
    });
    var o = xy('陬');
    s += '<g class="kzl-dot" transform="translate(' + o[0] + ',' + o[1] + ')"><circle class="kzl-halo" r="16"/><circle r="9"/></g></svg>';
    return s;
  }
  function slideHTML() {
    var lastG = '', tl = '';
    ST.forEach(function (s, i) {
      if (s.g !== lastG) { tl += (lastG ? '</span>' : '') + '<span class="kzl-grp"><i class="kzl-grp-head">' + s.g + '</i>'; lastG = s.g; }
      tl += '<button class="kzl-tb' + (s.zy ? ' zy' : '') + '" onclick="kzlGo(this,' + i + ')">' + s.tl + '</button>';
    });
    tl += '</span>';
    return '<div class="kzl-tl">' + tl + '</div>' +
      '<div class="kzl-main"><div class="kzl-mapbox">' + svgHTML() + '</div>' +
      '<div class="kzl-side"><div class="kzl-head"><b class="kzl-age"></b><span class="kzl-yr"></span></div>' +
      '<div class="kzl-title"></div><div class="kzl-txt"></div></div></div><div class="kzl-xout"></div>' +
      '<div class="kzl-ctrl"><button class="kzl-btn kzl-prev" onclick="kzlStep(this,-1)">◀ 上一步</button>' +
      '<button class="kzl-btn kzl-next" onclick="kzlStep(this,1)">下一步 ▶</button>' +
      '<button class="kzl-btn" onclick="kzlGo(this,0)">⟳ 從頭</button><span class="kzl-hint-ind"></span></div>';
  }

  function pts(path) { return path.map(xy); }
  function lastAge(i) { for (var j = i; j >= 0; j--) if (ST[j].age) return ST[j].age; return ''; }
  function render(box, i, animate) {
    var S = ST[i], svg = box.querySelector('.kzl-map');
    box.dataset.st = i;
    if (box._raf) cancelAnimationFrame(box._raf);
    box.querySelectorAll('.kzl-tb').forEach(function (b, j) { b.classList.toggle('cur', j === i); b.classList.toggle('done', j < i); });
    /* 右側文字 */
    var age = S.age || lastAge(i);
    box.querySelector('.kzl-age').textContent = S.zy ? '周遊列國 ' + S.tl + (S.age ? '　' + S.age : '') : age;
    var yr = box.querySelector('.kzl-yr'); yr.textContent = S.yr || ''; yr.style.display = S.yr ? '' : 'none';
    box.querySelector('.kzl-title').textContent = S.h;
    var x = X[i]; box.querySelector('.kzl-txt').innerHTML = S.t + (x ? '<button class="kzl-xbtn" onclick="kzlX(this)">▸ 原典故事：' + x[0] + '</button>' : '');
    box.classList.remove('xon'); box.querySelector('.kzl-xout').innerHTML = x ? '<b class="kzl-xh">原典故事：' + x[0] + '</b>' + x[1] : '';
    box.querySelector('.kzl-prev').disabled = i === 0;
    box.querySelector('.kzl-next').disabled = i === ST.length - 1;
    box.querySelector('.kzl-hint-ind').textContent = (i + 1) + ' / ' + ST.length;
    /* 軌跡：之前各階段（淡）＋本階段（深） */
    var trail = '';
    for (var j = 0; j < i; j++) if (ST[j].path.length > 1) trail += '<polyline points="' + pts(ST[j].path).join(' ') + '"/>';
    svg.querySelector('.kzl-trail').innerHTML = trail;
    var visited = {};
    for (j = 0; j <= i; j++) ST[j].path.forEach(function (k) { visited[k] = 1; });
    svg.querySelectorAll('.kzl-pl').forEach(function (g) {
      g.classList.toggle('on', !!visited[g.dataset.k]);
      g.classList.toggle('here', S.path.indexOf(g.dataset.k) >= 0);
    });
    var P = pts(S.path), cur = svg.querySelector('.kzl-cur'), dot = svg.querySelector('.kzl-dot');
    function place(p) { dot.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')'); }
    if (!animate || P.length < 2) {
      cur.setAttribute('points', P.length > 1 ? P.join(' ') : '');
      place(P[P.length - 1]);
      return;
    }
    /* 動畫：沿路線逐段移動，速度固定（每 100 單位約 0.55 秒） */
    var seg = [], total = 0;
    for (j = 1; j < P.length; j++) { var d = Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]); seg.push(d); total += d; }
    var dur = Math.max(900, total * 5.5) + (P.length - 2) * 250, t0 = null;
    cur.setAttribute('points', P[0].join(','));
    place(P[0]);
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var f = Math.min(1, (ts - t0) / dur), ease = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2, dist = ease * total, done = [P[0]];
      for (var k = 0; k < seg.length; k++) {
        if (dist >= seg[k]) { dist -= seg[k]; done.push(P[k + 1]); continue; }
        var r = seg[k] ? dist / seg[k] : 1, q = [P[k][0] + (P[k + 1][0] - P[k][0]) * r, P[k][1] + (P[k + 1][1] - P[k][1]) * r];
        done.push(q); break;
      }
      cur.setAttribute('points', done.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
      place(done[done.length - 1]);
      if (f < 1) box._raf = requestAnimationFrame(frame);
    }
    box._raf = requestAnimationFrame(frame);
  }
  function boxOf(el) { return el.closest('.kzl'); }
  function stop() { if (window.event) window.event.stopPropagation(); }
  window.kzlX = function (btn) { stop(); var box = boxOf(btn), on = btn.classList.toggle('on'); box.classList.toggle('xon', on); btn.textContent = (on ? '▾' : '▸') + btn.textContent.slice(1); };
  window.kzlStep = function (btn, dir) { stop(); var box = boxOf(btn), i = +box.dataset.st + dir; if (i >= 0 && i < ST.length) render(box, i, dir > 0); };
  window.kzlGo = function (btn, i) { stop(); var box = boxOf(btn); render(box, i, i === +box.dataset.st + 1); };
  function initAll() {
    document.querySelectorAll('.kzl:not([data-init])').forEach(function (box) {
      box.dataset.init = '1';
      box.innerHTML = slideHTML();
      render(box, 0, false);
    });
  }
  new MutationObserver(initAll).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') initAll();
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/178_v193-secpage-js.js ════ */
try {
/* V193：〈論語選〉課前加「小標頁」分段落（老師 11/2：加幾頁小標頁，分個段落）。
   插在指定頁之前；只是分段標題頁，沒有教材內容。work_answers 的頁碼同 142 一樣要往後推。 */
(function () {
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var SECS = [
    /* V201：老師 11/2「講士、儒家、孔子、論語」→ 依序一～四 */
    { before: /｜春秋的士$/, no: '一', title: '春秋的士', items: ['封建制度的金字塔', '春秋：金字塔開始鬆動', '孔子：從「士」出發', '私學：知識走出貴族圈', '《論語》裡的「士」'] },
    { before: /｜儒家$/, no: '二', title: '什麼是儒家？', items: ['儒家是什麼', '儒家的教育：六藝', '君子與聖人', '和道家、墨家、法家比一比', '孔子→孟子→荀子', '漢代：從黃老到獨尊儒術'] },
    { before: /^作者·課本$/, no: '三', title: '孔子介紹', items: ['孔子（課本）', '孔子的一生', '政治與教育主張', '弟子小檔案：四科十哲、顏淵、子貢'] },
    { before: /^題解·課本$/, no: '四', title: '認識《論語》', items: ['題解', '《論語》詳表', '十三經的演變', '寫作背景'] }
  ];
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function slideHTML(s) {
    return '<div class="wk-slide wks-info kz-sec">' +
      '<div class="kz-sec-head"><span class="kz-sec-head-no">' + esc(s.no) + '</span><span class="kz-sec-title">' + esc(s.title) + '</span></div>' +
      '<div class="kz-sec-hint">' + s.items.map(function (t, i) { return '<span class="kz-sec-hint-i"><b>' + (i + 1) + '</b>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '</div>';
  }
  var _parse = wkParseSlides;
  wkParseSlides = function (key) {
    var slides = _parse.apply(this, arguments);
    if (key !== LESSON) return slides;
    SECS.forEach(function (sec) {
      var at = -1;
      slides.forEach(function (s, i) { if (at < 0 && s.type === 'info' && sec.before.test(String(s.label || ''))) at = i; });
      if (at < 0) return;
      slides.splice(at, 0, { type: 'kzsec', sec: sec });
      slides.forEach(function (s) {
        if (s.type === 'work_answers') (s.targets || []).forEach(function (t) { if (t.slideIdx >= at) t.slideIdx += 1; });
      });
    });
    return slides;
  };
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    if (slide && slide.type === 'kzsec') return slideHTML(slide.sec);
    return _render.apply(this, arguments);
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/179_v194-hdclear-js.js ════ */
try {
/* V194：〈論語選〉補充講義遠看較清楚（老師 11/2：「遠看都糊在一起，沒好好標號分段，原文語譯都混在一起，應該換個顏色或用個底框」）。
   只改顯示，不動資料（data/lessons/01.js handoutV2 不變）：
   1. 表格儲存格裡用 <br> 接在一起的多行 → 分條：小標題行、編號條目（1. 或自動 ①②）、原文「」上色、「語譯：」改成有底框的語譯塊。
   2. 選項一行塞兩個（(A)…　(B)…）→ 一個選項一行。
   3. 閱讀文章的填空空白（連續空格）→ 畫成空格框；文章段落首行縮排。 */
(function () {
  /* V197：老師要還沒上過的課也套用（技1 L07～L10：樂府詩選、茫茫人海、桃花源記、極短篇） */
  var LESSONS = ['論語選—子路曾皙冉有公西華侍坐', '樂府詩選—長干行', '茫茫人海中的一名女孩', '桃花源記', '極短篇小說選'];
  var CIR = '①②③④⑤⑥⑦⑧⑨⑩';
  function txt(html) { var d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/ /g, ' ').trim(); }
  function quoteColor(html) { return html.replace(/「([^「」<>]{8,})」/g, '<span class="hdx-q">「$1」</span>'); }
  function fixCell(td) {
    var parts = td.innerHTML.split(/<br\s*\/?>/i).filter(function (h) { return txt(h); });
    if (parts.length < 2) return;
    var L = parts.map(function (h) {
      var t = txt(h), o = { h: h, t: t, k: 'p' };
      if (/^語譯[:：]/.test(t)) { o.k = 'tr'; o.h = h.replace(/語譯[:：]\s*/, ''); }
      else if (/^\(?\d{1,2}[\.．、)]/.test(t)) { o.k = 'n'; o.n = t.match(/\d{1,2}/)[0]; o.h = h.replace(/^(\s*(<[^>]+>)*\s*)\(?\d{1,2}[\.．、)]\s*/, '$1'); }
      return o;
    });
    /* 小標題：短、不以句號結尾、下一行是較長的內文 */
    /* V197：至少兩個才算（「小標題／內文」交錯的格子），避免把一般短句誤當小標題 */
    var hdIdx = [];
    L.forEach(function (o, i) {
      var nx = L[i + 1];
      if (o.k === 'p' && o.t.length <= 14 && !/[。！？」）]$/.test(o.t) && !/^[\(（→]/.test(o.t) && !/[：:→]/.test(o.t) && nx && nx.k === 'p' && nx.t.length > 20) hdIdx.push(i);
    });
    if (hdIdx.length >= 2) hdIdx.forEach(function (i) { L[i].k = 'hd'; });
    var hasTr = L.some(function (o) { return o.k === 'tr'; }), hasN = L.some(function (o) { return o.k === 'n'; });
    var pCount = L.filter(function (o) { return o.k === 'p'; }).length;
    var autoNum = hasTr && !hasN && pCount >= 2, c = 0;   /* 原文＋語譯成對、沒有原編號 → 自動加 ①② */
    var out = L.map(function (o) {
      if (o.k === 'tr') return '<div class="hdx-tr"><span class="hdx-trk">語譯</span>' + o.h + '</div>';
      if (o.k === 'hd') return '<div class="hdx-hd">' + o.h + '</div>';
      if (o.k === 'n') return '<div class="hdx-it"><b class="hdx-n">' + o.n + '</b><div class="hdx-c">' + quoteColor(o.h) + '</div></div>';
      if (autoNum) return '<div class="hdx-it"><b class="hdx-n">' + CIR.charAt(c++ % 10) + '</b><div class="hdx-c">' + quoteColor(o.h) + '</div></div>';
      return '<div class="hdx-p">' + quoteColor(o.h) + '</div>';
    }).join('');
    td.innerHTML = out;
    td.classList.add('hdx-cell');
  }
  function fixOpt(el) {
    var h = el.innerHTML;
    if (!/[　 ]{2,}\([A-E]\)/.test(h)) return;
    el.innerHTML = h.split(/[　 ]{2,}(?=\([A-E]\))/).map(function (x) { return '<span class="hdx-opt">' + x + '</span>'; }).join('');
    el.classList.add('hdx-opts');
  }
  function fixPara(el) {
    if (/[　 ]{6,}|(&nbsp;){4,}/.test(el.innerHTML)) el.innerHTML = el.innerHTML.replace(/(?:[　 ]|&nbsp;){6,}/g, '<span class="hdx-gap"></span>');
  }
  function run() {
    var k = (typeof wkKey !== 'undefined' && wkKey) || document.body.getAttribute('data-wk');
    if (LESSONS.indexOf(k) < 0) return;
    document.querySelectorAll('.wks-hd2:not([data-hdx])').forEach(function (s) {
      s.setAttribute('data-hdx', '1');
      s.classList.add('hdx-slide');
      s.querySelectorAll('.hd-body td').forEach(function (td) { if (/<br/i.test(td.innerHTML)) fixCell(td); });
      s.querySelectorAll('.hd-opt').forEach(fixOpt);
      s.querySelectorAll('.hd-para').forEach(fixPara);
    });
  }
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true });
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/184_v211-t13quiz-js.js ════ */
try {
/* V211（老師 11/4）：〈論語選〉十三經小考——放在「註釋小考」裡，選〈論語選〉時上方出現「十三經小考」。
   - 選題：13 格照十三經順序（同「十三經的演變」最後一步的今名）；點格子＝設「不抽」（記在本機 nq-t13-ex），按「抽！」從其餘隨機抽 N 格（預設 5）。
   - 考卷：13 格順序打亂；沒抽到的直接顯示書名，抽到的變空格並標題號，點空格（或「全部顯示答案」）看答案。格子一樣寬，不讓字數洩漏答案。
   - 答案不分順序（打亂後看不出哪一格該放哪一部），考卷下方註明。
   - 記錄：沿用 v60「記錄本次小考」（043 的 nqRecOverride 掛勾）、v109 編號（與〈論語選〉註釋小考同一套 L06xx）與訂正規則。
     紀錄 kind:'t13'；每題 { no: 十三經順序 1–13, w/a: 書名, s/x: 十三經全名單, ord: 考卷題號 }。
     學生端（stu115）靠「每題 s ＝ 十三經全名單」認出這種小考（後台 stuGet 只傳固定欄位，kind 傳不過去），顯示「訂正：十三經全抄」。 */
(function () {
  'use strict';
  var LESSON = '論語選—子路曾皙冉有公西華侍坐';
  var BOOKS = ['詩經', '尚書', '周禮', '儀禮', '禮記', '周易', '左傳', '公羊傳', '穀梁傳', '論語', '孝經', '爾雅', '孟子'];
  var LIST = BOOKS.join('、');
  var EXK = 'nq-t13-ex', NK = 'nq-t13-n';
  var on = false, picked = [], curRec = null;
  /* V216（老師 11/6）：老師自選要不要打亂 13 格順序。十三經小考預設打亂、加分題預設照順序；各記在本機 */
  var SHK = 'nq-t13-sh', BSHK = 'nq-t13-bsh';
  function shOn(k, d) { return !!jget(k, d); }

  function $(id) { return document.getElementById('nq2-' + id); }
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function jput(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function excl() { var a = jget(EXK, []); return Array.isArray(a) ? a.filter(function (b) { return BOOKS.indexOf(b) >= 0; }) : []; }
  function curLessonText() { var s = $('lesson'); return s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].text.replace(/（\d+ 題）$/, '') : ''; }
  function isLunyu() { return curLessonText() === LESSON; }

  /* ── 選題畫面 ── */
  function paint() {
    var box = $('t13'); if (!box) return;
    var ex = excl();
    box.querySelector('.t13s-grid').innerHTML = BOOKS.map(function (b) {
      var x = ex.indexOf(b) >= 0, p = picked.indexOf(b) >= 0;
      return '<button type="button" class="t13s-c' + (x ? ' ex' : '') + (p ? ' on' : '') + '" data-b="' + esc(b) + '"><span class="nm">' + esc(b) + '</span></button>';
    }).join('');
    var cnt = $('cnt'); if (cnt) cnt.textContent = '已抽 ' + picked.length + ' 格' + (ex.length ? '（不抽 ' + ex.length + ' 格）' : '');
    var go = $('bGo'); if (go) { go.disabled = !picked.length; go.style.opacity = picked.length ? 1 : .4; }
  }
  function draw() {
    var n = Math.max(1, Math.min(13, Math.round(+box().querySelector('#nq2-t13n').value) || 5));
    jput(NK, n);
    var ex = excl(), pool = BOOKS.filter(function (b) { return ex.indexOf(b) < 0; });
    picked = shuffle(pool).slice(0, n);
    paint();
    if (!picked.length) { alert('13 部都設成「不抽」了，沒有可以抽的。'); return; }
    if (pool.length < n) alert('可以抽的只有 ' + pool.length + ' 格（其他設成不抽），已全部抽入。');
    start();   /* V212（老師 11/4）：按「抽！」直接開考，不用再按「開始小考」 */
  }
  function box() { return $('t13'); }
  function setOn(v) {
    on = !!v && isLunyu();
    var root = document.getElementById('nq2'); if (!root) return;
    root.classList.toggle('t13q', on);
    var b = $('t13btn'); if (b) { b.classList.toggle('on', on); b.textContent = on ? '◀ 回註釋小考' : '十三經小考'; }
    if (on) { picked = []; paint(); }
    else { var cnt = $('cnt'); if (cnt) cnt.textContent = ''; var l = $('lesson'); if (l) l.dispatchEvent(new Event('change')); }   /* 回註釋小考：讓原本的選題畫面重畫（已選題數、開始鈕） */
  }
  function syncBtn() { var b = $('t13btn'); if (b) b.style.display = isLunyu() ? '' : 'none'; if (on && !isLunyu()) setOn(false); }

  /* ── 考卷 ── */
  function start() {
    var mix = shOn(SHK, true), order = mix ? shuffle(BOOKS) : BOOKS.slice(), k = 0, qs = [];   /* V216 */
    var cells = order.map(function (b) {
      if (picked.indexOf(b) < 0) return '<div class="t13q-c"><span class="nm">' + esc(b) + '</span></div>';
      k++;
      qs.push({ no: BOOKS.indexOf(b) + 1, w: b, a: b, s: LIST, x: LIST, ord: k });
      return '<div class="t13q-c blank" data-k="' + k + '"><span class="qn">' + k + '</span><span class="nm">' + esc(b) + '</span></div>';
    }).join('');
    var nos = qs.map(function (q) { return q.no; });
    curRec = { kind: 't13', lesson: LESSON, rangeStart: Math.min.apply(null, nos), rangeEnd: Math.max.apply(null, nos),
      questionKeys: qs.map(function (q) { return 't13|' + q.w; }), questions: qs };
    $('qTitle').innerHTML = '〈論語選〉十三經小考<small>共 ' + k + ' 題・點空格看答案</small>';
    $('qlist').innerHTML = '<div class="t13q-board">' + cells + '</div>' +
      '<div class="t13q-foot">' + (mix ? '空格裡缺的是哪 ' + k + ' 部？寫出書名就對，<b>不分順序</b>' : '13 部<b>依順序排列</b>，空格寫出書名') + '</div>';
    syncAll();
    $('quiz').classList.add('show');
    $('qlist').scrollTop = 0;
  }
  function blanks() { return Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist > .t13q-board .t13q-c.blank')); }
  function syncAll() { var bs = blanks(), b = $('bAll'); if (b && bs.length) b.textContent = bs.every(function (c) { return c.classList.contains('open'); }) ? '全部隱藏答案' : '全部顯示答案'; }
  function isT13Quiz() { return !!document.querySelector('#nq2-qlist > .t13q-board'); }   /* V214：加分段（.t13b 裡的 board）不算 */

  /* ── V214（老師 11/5）聯合小考：〈論語選〉註釋小考＋十三經加分 ──
     下方工具列「＋十三經加分 N 格・共 P 分」（N＝0 不加；每次打開註釋小考都回到 0，日曆那筆有設才帶入）。
     註釋考卷出來後，在最後接一段十三經：13 格「照順序」排（詩經→孟子），抽 N 格變空格，題號接在註釋後面；點空格看答案。
     「不抽」設定沿用十三經小考的。註釋題每題 100÷題數 分，加分題共 P 分，標題寫滿分（100＋P）。
     記錄：仍是一筆註釋小考紀錄（編號、訂正、成績都照註釋小考），另外帶 bonus＝{ kind:'t13', pts, questions:[{no,w,a,ord}] }。 */
  var bonusRec = null;
  function bn() { var i = $('t13bn'); return i ? Math.max(0, Math.min(13, Math.round(+i.value) || 0)) : 0; }
  function bp() { var i = $('t13bp'); return i ? Math.max(0, Math.round(+i.value) || 0) : 0; }
  function syncBonusUi() { var w = $('t13bw'); if (w) w.style.display = isLunyu() ? '' : 'none'; }
  function addBonus() {
    var ql = $('qlist'); if (!ql) return;
    var cards = ql.querySelectorAll('.qc');
    if (!cards.length || ql.querySelector('.t13b') || !isLunyu() || on) { if (!ql.querySelector('.t13b')) bonusRec = null; return; }
    var n = bn(); if (!n) { bonusRec = null; return; }
    var ex = excl(), pool = BOOKS.filter(function (b) { return ex.indexOf(b) < 0; });
    var pk = shuffle(pool).slice(0, n), base = cards.length, k = 0, qs = [], pts = bp();
    var mix = shOn(BSHK, false), order = mix ? shuffle(BOOKS) : BOOKS;   /* V216：加分題也可打亂 */
    var cells = order.map(function (b) {
      if (pk.indexOf(b) < 0) return '<div class="t13q-c"><span class="nm">' + esc(b) + '</span></div>';
      k++;
      qs.push({ no: BOOKS.indexOf(b) + 1, w: b, a: b, ord: base + k });
      return '<div class="t13q-c blank" data-k="' + (base + k) + '"><span class="qn">' + (base + k) + '</span><span class="nm">' + esc(b) + '</span></div>';
    }).join('');
    if (!k) { bonusRec = null; return; }
    bonusRec = { kind: 't13', pts: pts, questions: qs };
    var per = 100 / base, perT = per === Math.round(per) ? '每題 ' + per + ' 分，' : '';
    var sec = document.createElement('div'); sec.className = 't13b';   /* 不用 <section>：全域 section{display:none} */
    sec.innerHTML = '<div class="t13b-h">加分題・十三經' + (pts ? '（共 ' + pts + ' 分）' : '') + '<small>' + (mix ? '順序已打亂，空格寫出書名（不分順序）' : '依順序排列，空格寫出書名') +
      '（註釋 ' + base + ' 題' + (perT ? '・' + perT.replace(/，$/, '') : '') + '・共 100 分＋加分 ' + pts + '＝滿分 ' + (100 + pts) + '）</small></div>' +
      '<div class="t13q-board">' + cells + '</div>';
    var end = ql.querySelector('.qend'); if (end) ql.insertBefore(sec, end); else ql.appendChild(sec);
    var t = $('qTitle'), sm = t && t.querySelector(':scope > small');
    if (sm) sm.textContent = base + ' 題＋加分 ' + k + ' 格・滿分 ' + (100 + pts);
  }
  function bonusBlanks() { return Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist .t13b .t13q-c.blank')); }

  /* 日曆「開始小考」用：設好加分格數與分數（之後再出考卷） */
  var keepOnce = false;   /* V216：日曆剛帶入的格數，不要被「剛打開就歸 0」蓋掉 */
  window.nq2T13Bonus = function (n, pts) {
    var i = $('t13bn'), p = $('t13bp');
    keepOnce = true; setTimeout(function () { keepOnce = false; }, 0);
    if (i) i.value = Math.max(0, Math.min(13, +n || 0));
    if (p && pts != null) p.value = Math.max(0, +pts || 0);
    syncBonusUi();
  };

  /* 043「記錄本次小考」掛勾：註釋小考紀錄另外帶上十三經加分題 */
  window.nqRecExtra = function () { return bonusRec && document.querySelector('#nq2-qlist .t13b') ? { bonus: JSON.parse(JSON.stringify(bonusRec)) } : null; };

  /* 043「記錄本次小考」掛勾：考卷是十三經時回傳本次紀錄；否則 undefined（走原本註釋小考） */
  window.nqRecOverride = function () { return isT13Quiz() ? JSON.parse(JSON.stringify(curRec)) : undefined; };

  function init() {
    var root = document.getElementById('nq2'), sel = $('lesson'), grid = $('grid');
    if (!root || !sel || !grid || $('t13btn')) return !!$('t13btn');
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'nq2-t13btn'; b.className = 'btn'; b.textContent = '十三經小考';
    sel.parentNode.insertBefore(b, sel.nextSibling);
    b.onclick = function () { setOn(!on); };

    var d = document.createElement('div');
    d.id = 'nq2-t13';
    d.innerHTML = '<div class="t13s-bar"><b class="serif">十三經小考</b><span style="flex:1"></span>' +
      '<span>隨機抽</span><input type="number" id="nq2-t13n" min="1" max="13" value="' + esc(jget(NK, 5)) + '"><span>格</span>' +
      '<label class="t13-sh"><input type="checkbox" id="nq2-t13sh"' + (shOn(SHK, true) ? ' checked' : '') + '>打亂順序</label>' +
      '<button type="button" class="btn dk" data-t="draw">抽！開始小考 ▶</button><button type="button" class="btn" data-t="clr">清除「不抽」</button></div>' +
      '<div class="hint">點書名＝設成「不抽」（考卷上一定直接顯示）；再點一次恢復。按「抽！開始小考」從其餘的書隨機抽，直接出考卷：抽到的變成空格；勾「打亂順序」13 格會打亂，不勾就照《詩經》到《孟子》排。</div>' +
      '<div class="t13s-grid"></div>';
    grid.parentNode.insertBefore(d, grid.nextSibling);
    d.addEventListener('change', function (e) { if (e.target.id === 'nq2-t13sh') jput(SHK, e.target.checked); });   /* V216 */
    d.addEventListener('click', function (e) {
      var t = e.target.closest('[data-t]');
      if (t) {
        if (t.getAttribute('data-t') === 'draw') draw();
        else if (confirm('清除所有「不抽」標記？')) { jput(EXK, []); paint(); }
        return;
      }
      var c = e.target.closest('.t13s-c'); if (!c) return;
      var bk = c.getAttribute('data-b'), ex = excl(), i = ex.indexOf(bk);
      if (i >= 0) ex.splice(i, 1); else { ex.push(bk); picked = picked.filter(function (x) { return x !== bk; }); }
      jput(EXK, ex); paint();
    });

    /* 開始小考／全部顯示答案／點空格：十三經時攔下來自己處理（捕獲階段，原本的 onclick 不會執行） */
    root.addEventListener('click', function (e) {
      if (on && e.target.closest('#nq2-bGo')) { e.stopPropagation(); e.preventDefault(); if (picked.length) start(); return; }
      if (!isT13Quiz()) return;
      if (e.target.closest('#nq2-bAll')) {
        e.stopPropagation();
        var bs = blanks(), all = !bs.every(function (c) { return c.classList.contains('open'); });
        bs.forEach(function (c) { c.classList.toggle('open', all); }); syncAll(); return;
      }
      var c = e.target.closest('#nq2-qlist .t13q-c.blank');
      if (c) { c.classList.toggle('open'); syncAll(); }
    }, true);

    /* V214：聯合小考（註釋＋十三經加分）控制項放在下方工具列 */
    var dock = root.querySelector('.dock'), go0 = $('bGo');
    if (dock && go0) {
      var w = document.createElement('span'); w.id = 'nq2-t13bw';
      w.innerHTML = '＋十三經加分<input type="number" id="nq2-t13bn" min="0" max="13" value="0">格・共<input type="number" id="nq2-t13bp" min="0" value="' + esc(jget('nq-t13-bp', 20)) + '">分' +
        '<label class="t13-sh"><input type="checkbox" id="nq2-t13bsh"' + (shOn(BSHK, false) ? ' checked' : '') + '>打亂</label>';   /* V216 */
      dock.insertBefore(w, go0);
      w.addEventListener('change', function (e) {
        if (e.target.id === 'nq2-t13bp') jput('nq-t13-bp', bp());
        if (e.target.id === 'nq2-t13bsh') jput(BSHK, e.target.checked);
      });
    }
    new MutationObserver(addBonus).observe($('qlist'), { childList: true });
    $('qlist').addEventListener('click', function (e) {
      var c = e.target.closest('.t13b .t13q-c.blank'); if (c) c.classList.toggle('open');
    });
    $('bAll').addEventListener('click', function () {   /* 等 036 切好註釋題卡，加分格跟著一樣 */
      if (isT13Quiz()) return;
      setTimeout(function () {
        var cs = Array.prototype.slice.call(document.querySelectorAll('#nq2-qlist .qc'));
        var o = cs.length && cs.every(function (c) { return c.classList.contains('open'); });
        bonusBlanks().forEach(function (c) { c.classList.toggle('open', !!o); });
      }, 0);
    });

    sel.addEventListener('change', function () { if (on) setOn(false); syncBtn(); syncBonusUi(); });
    var wasOpen = root.classList.contains('open');   /* 只在面板「剛打開」時回到註釋小考（自己切 t13q class 也會觸發） */
    new MutationObserver(function () {
      var o = root.classList.contains('open');
      if (o && !wasOpen) { if (on) setOn(false); syncBtn(); var bi = $('t13bn'); if (bi && !keepOnce) bi.value = 0; syncBonusUi(); }   /* V214：每次自己打開都不加考；V216：日曆剛帶入的保留（重抽也還在） */
      wasOpen = o;
    }).observe(root, { attributes: true, attributeFilter: ['class'] });
    syncBtn(); syncBonusUi();
    return true;
  }
  (function tryInit(n) { if (!init() && n < 40) setTimeout(function () { tryInit(n + 1); }, 500); })(0);
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/180_v203-iquiz-num-js.js ════ */
try {
/* V203：基礎練習題目改成考卷格式（老師 11/3）：題目前加答案格＋題號「(　) 1. 題目」，選項 (A)～(D) 縮排在題目下。
   答案格平常空白，答案出現時（.ans-on，iqOpt／iqAll 設定）填入答案。樣式在 171_v203-iquiz-num-css。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var Q = slide.q, old = '<div class="iq-q">' + Q.q + '</div>';
    if (html.split(old).length !== 2) return html;   /* 結構不符就維持原樣 */
    return html.replace(old, function () {
      return '<div class="iq-q iq-num"><span class="iq-ab">(<span class="iq-abv">' + Q.ans + '</span>)</span>' +
        '<span class="iq-qn">' + Q.n + '.</span><span class="iq-qt">' + Q.q + '</span></div>';
    });
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/181_v204-iquiz-all-js.js ════ */
try {
/* V204：基礎練習「一鍵展開」（老師 11/3）：原「全部顯示」改名、放大；再按一次收起（回到題目＋選項都沒點開）。
   iqAll（015_main）只會展開，這裡包一層：已展開就收起。樣式在 172_v204-iquiz-all-css。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    return html.replace('onclick="iqAll(this)">全部顯示</button>', 'onclick="iqAll(this)">一鍵展開</button>');
  };
  var _all = iqAll;
  iqAll = function (btn) {
    var slide = btn.closest('.wk-slide');
    if (slide && slide.classList.contains('ans-on') && !slide.querySelector('.iq-opt:not(.on)')) {
      slide.classList.remove('ans-on');
      slide.querySelectorAll('.iq-opt').forEach(function (o) { o.classList.remove('on', 'right'); });
      btn.textContent = '一鍵展開';
      return;
    }
    _all.apply(this, arguments);
    btn.textContent = '收起';
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/182_v205-iquiz-top-js.js ════ */
try {
/* V205：基礎練習標題列（老師 11/3「這一排就不需要了，應該改成頁碼以及展開收起鍵」）：
   拿掉「基礎練習」標籤和「第 N 題 / 共 M 題」（題號已在題目前，V203），改放課本頁碼＋一鍵展開／收起（V204）。
   頁碼原本是 173_v178 放在投影片開頭的浮動標籤（.wks-book-page，fixed 在右上角），基礎練習改成放進標題列的 .iq-pg。 */
(function () {
  'use strict';
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var pg = '';
    html = html.replace(/<div class="wks-book-page">([^<]*)<\/div>/, function (m, t) { pg = t; return ''; });
    return html.replace(/<span class="iq-tag">基礎練習<\/span><span class="iq-no">[^<]*<\/span>/, '<span class="iq-pg">' + pg + '</span>');
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/183_v206-iquiz-page-js.js ════ */
try {
/* V206：基礎練習（老師 11/3）
   1. 頁碼要「那一題」的課本頁碼，用浮框（.wks-book-page，右上角）顯示，不要整個練習的 P.107~P.109。
      逐題頁碼由 scripts/RayOclass/basic_q_pages_20261103.py 從翰林技高國文(1)課本 PDF 文字層算出（每題答案格「︵　　︶」所在頁；
      跨頁寫 P.xx~P.yy；「▲」題組文章算進它指定的題目），跨頁與題組逐頁看過原頁確認。沒有資料的課照舊用整個練習的頁碼。
   2. 拿掉 V205 的標題列（頁碼＋一鍵展開），按鈕縮成「開／關」，放在題目那一行最右邊。 */
(function () {
  'use strict';
  var PAGES = {"論語選—子路曾皙冉有公西華侍坐": {"1": "P.107", "2": "P.107", "3": "P.107", "4": "P.107", "5": "P.108", "6": "P.108", "7": "P.108", "8": "P.108~P.109", "9": "P.109", "10": "P.109"}, "身為魚販": {"1": "P.20", "2": "P.20", "3": "P.20", "4": "P.21", "5": "P.21", "6": "P.21", "7": "P.22", "8": "P.23"}, "珍珠奶茶": {"1": "P.72", "2": "P.72", "3": "P.72~P.73", "4": "P.73", "5": "P.73~P.74", "6": "P.74", "7": "P.74~P.75", "8": "P.75"}, "臺灣最美麗的火車線": {"1": "P.91", "2": "P.91", "3": "P.91", "4": "P.91", "5": "P.92", "6": "P.92", "7": "P.92", "8": "P.92~P.93", "9": "P.93"}, "世說新語選": {"1": "P.36", "2": "P.36", "3": "P.36", "4": "P.36", "5": "P.37", "6": "P.37", "7": "P.37", "8": "P.37", "9": "P.38", "10": "P.38"}, "師說": {"1": "P.52", "2": "P.52", "3": "P.52", "4": "P.53", "5": "P.53", "6": "P.53", "7": "P.54", "8": "P.54~P.55"}, "桃花源記": {"1": "P.157", "2": "P.157", "3": "P.157", "4": "P.157", "5": "P.158", "6": "P.158", "7": "P.158", "8": "P.159", "9": "P.159", "10": "P.160"}, "樂府詩選—長干行": {"1": "P.121", "2": "P.121", "3": "P.121", "4": "P.122", "5": "P.122", "6": "P.122", "7": "P.122~P.123", "8": "P.123~P.124"}, "茫茫人海中的一名女孩": {"1": "P.140", "2": "P.140", "3": "P.140", "4": "P.141", "5": "P.141", "6": "P.141", "7": "P.142", "8": "P.142"}, "極短篇小說選": {"1": "P.176", "2": "P.176", "3": "P.176", "4": "P.176", "5": "P.177", "6": "P.177", "7": "P.177", "8": "P.178", "9": "P.178"}};
  var _render = wkRenderSlideHTML;
  wkRenderSlideHTML = function (slide) {
    var html = _render.apply(this, arguments);
    if (!slide || slide.type !== 'iquiz' || typeof html !== 'string') return html;
    var Q = slide.q, m = (typeof wkKey !== 'undefined') && PAGES[wkKey];
    var pg = m && m[Q.n] ? m[Q.n] : '';
    html = html.replace(/<div class="iq-top"><span class="iq-pg">([^<]*)<\/span>[\s\S]*?<\/button><\/div>/, function (all, t) {
      if (!pg) pg = t.replace(/^課本\s*/, '');
      return '';
    });
    var qt = '<span class="iq-qt">' + Q.q + '</span></div>';
    if (html.split(qt).length === 2) html = html.replace(qt, function () { return '<span class="iq-qt">' + Q.q + '</span><button class="iq-all iq-onoff" onclick="iqAll(this)">開</button></div>'; });
    if (pg) html = html.replace(/^(<div class="wk-slide[^>]*>)/, '$1<div class="wks-book-page">課本 ' + pg + '</div>');
    return html;
  };
  var _all = iqAll;
  iqAll = function (btn) {
    _all.apply(this, arguments);
    if (btn.classList.contains('iq-onoff')) btn.textContent = btn.closest('.wk-slide').classList.contains('ans-on') ? '關' : '開';
  };
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/185_v215-quickpts-js.js ════ */
try {
(function () {
  'use strict';
  /* ── V215（老師 11/6）浮動加分盤：邊投影邊快速 ±1，不開成績大視窗、不蓋住課文 ──
     ・畫面角落一顆 ⭐（可拖到任何位置，記在本裝置）；點一下展開小盤，再點 ⭐／✕ 收起；15 秒沒動作自動收起
     ・小盤＝依「座位表」排的迷你座位（講台在下）；也可切成座號方格
     ・點座號＝目前模式（＋1 或 −1）；長按座號＝反過來（加分模式下長按＝扣 1 分，原因用目前選的）
     ・鍵盤（小盤打開時）：打座號再按 ＋／− 或 Enter（Enter＝目前模式）；Backspace 改號碼；Esc 收起
     ・班級：上課節次內自動用課表那班；不在節次內用成績系統目前選的班，可在小盤切換
     ・資料、復原都和成績系統「⭐ 課堂加減分」共用（V106GR.qp，119 提供）；沒登入時點 🔒 打開登入 */
  var POS_K = 'qp_pos_v1', VIEW_K = 'qp_view_v1', HIDE_MS = 15000;
  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function Q() { return window.V106GR && V106GR.qp; }

  var st = { open: false, mode: '+', reason: '', cls: '', pickCls: false, typed: '', last: '', lastErr: false, view: get(VIEW_K, 'seat') };
  var fab, pad, hideT = 0;

  function build() {
    if (fab || !Q()) return;
    fab = document.createElement('button'); fab.type = 'button'; fab.id = 'qp-fab'; fab.title = '課堂加減分（可拖曳）'; fab.innerHTML = '⭐';
    pad = document.createElement('div'); pad.id = 'qp-pad';
    document.body.appendChild(pad); document.body.appendChild(fab);
    place();
    fabDrag();
    pad.addEventListener('click', onClick);
    pad.addEventListener('pointerdown', onDown);
    pad.addEventListener('pointerup', onUp);
    pad.addEventListener('pointercancel', cancelPress);
    pad.addEventListener('pointerleave', cancelPress);
    pad.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    pad.addEventListener('change', function (e) { if (e.target.id === 'qp-cls') { st.cls = e.target.value; st.pickCls = true; render(); poke(); } });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('v106gr-data', function () { if (st.open) render(); });
    window.addEventListener('resize', place);
  }

  /* ── ⭐ 位置：存成畫面比例，換解析度（投影機／iPad）也不會跑出畫面 ── */
  function place() {
    var p = get(POS_K, { x: 0.01, y: 0.62 }), w = innerWidth, h = innerHeight, s = 52;
    var x = Math.max(4, Math.min(w - s - 4, p.x * w)), y = Math.max(4, Math.min(h - s - 4, p.y * h));
    fab.style.left = x + 'px'; fab.style.top = y + 'px';
    if (st.open) placePad();
  }
  function placePad() {
    var r = fab.getBoundingClientRect(), pw = pad.offsetWidth, ph = pad.offsetHeight, w = innerWidth, h = innerHeight;
    var x = r.left + r.width / 2 < w / 2 ? r.right + 6 : r.left - pw - 6;   /* 往畫面中間那一側展開 */
    if (x < 4 || x + pw > w - 4) x = Math.max(4, Math.min(w - pw - 4, r.left));
    var y = Math.max(4, Math.min(h - ph - 4, r.top + r.height / 2 - ph / 2));
    pad.style.left = x + 'px'; pad.style.top = y + 'px';
  }
  function fabDrag() {
    var d = null;
    fab.addEventListener('pointerdown', function (e) { d = { x: e.clientX, y: e.clientY, l: fab.offsetLeft, t: fab.offsetTop, moved: false }; fab.setPointerCapture(e.pointerId); });
    fab.addEventListener('pointermove', function (e) {
      if (!d) return; var dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
      d.moved = true; e.preventDefault();
      fab.style.left = Math.max(4, Math.min(innerWidth - 56, d.l + dx)) + 'px'; fab.style.top = Math.max(4, Math.min(innerHeight - 56, d.t + dy)) + 'px';
      if (st.open) placePad();
    });
    fab.addEventListener('pointerup', function () {
      if (!d) return; var m = d.moved; d = null;
      if (m) { put(POS_K, { x: fab.offsetLeft / innerWidth, y: fab.offsetTop / innerHeight }); return; }
      toggle();
    });
    fab.addEventListener('pointercancel', function () { d = null; });
  }

  function toggle(v) {
    st.open = v == null ? !st.open : v;
    pad.classList.toggle('open', st.open); fab.classList.toggle('on', st.open);
    st.typed = '';
    if (st.open) {
      if (!st.pickCls) st.cls = '';
      var q = Q(); if (!q.ready() && !q.loading()) q.load(false);
      render(); poke();
    } else clearTimeout(hideT);
  }
  function poke() { clearTimeout(hideT); hideT = setTimeout(function () { if (st.open && !pressT) toggle(false); }, HIDE_MS); }   /* 沒動作 15 秒自動收起 */

  function curCls() {
    var q = Q(), list = q.classes();
    if (st.cls && list.indexOf(st.cls) >= 0) return st.cls;
    st.pickCls = false;
    return q.curCls() || q.cls() || list[0] || '';
  }

  function render() {
    var q = Q(); if (!q || !pad) return;
    var cls = curCls(), auto = !st.pickCls && q.curCls() === cls && cls;
    if (!st.reason) st.reason = q.reasons[0];
    var h = '<div class="qp-top">' +
      '<select id="qp-cls" title="班級">' + q.classes().map(function (c) { return '<option' + (c === cls ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>' +
      (auto ? '<span class="qp-auto" title="依課表自動選這節的班">本節</span>' : '') +
      '<span class="qp-sp"></span>' +
      '<button data-q="undo" title="復原上一筆"' + (q.canUndo() ? '' : ' disabled') + '>↶</button>' +
      '<button data-q="view" title="切換座位表／座號方格">' + (st.view === 'seat' ? '#' : '▦') + '</button>' +
      '<button data-q="full" title="打開完整的課堂加減分">⤢</button>' +
      '<button data-q="x" title="收起">✕</button></div>';
    h += '<div class="qp-mode"><button data-q="m+" class="p' + (st.mode === '+' ? ' on' : '') + '">＋1</button><button data-q="m-" class="m' + (st.mode === '-' ? ' on' : '') + '">−1</button></div>';
    if (st.mode === '-') h += '<div class="qp-rs">' + q.reasons.map(function (r) { return '<button data-q="r|' + esc(r) + '"' + (st.reason === r ? ' class="on"' : '') + '>' + esc(r) + '</button>'; }).join('') + '</div>';
    if (!q.ready()) h += '<div class="qp-msg">' + (q.err() ? esc(q.err()) + '<br><button data-q="reload">重試</button>' : '讀取中…') + '</div>';
    else if (!q.canWrite()) h += '<div class="qp-msg">加減分要先登入<br><button data-q="login">🔒 登入</button></div>';
    else {
      var seats = q.roster(cls), tot = q.totals(cls);
      if (!seats.length) h += '<div class="qp-msg">這班還沒有學生名單</div>';
      else h += st.view === 'seat' ? seatGrid(q, cls, seats, tot) : numGrid(seats, tot);
    }
    h += '<div class="qp-st' + (st.lastErr ? ' err' : '') + '">' + (st.typed ? '⌨ <b>' + esc(st.typed) + '</b> 號 → 按 ＋／− 或 Enter' : esc(st.last) || '長按＝' + (st.mode === '+' ? '扣' : '加') + '分') + '</div>';
    pad.innerHTML = h;
    pad.classList.toggle('minus', st.mode === '-');
    placePad();
  }
  function cell(n, t) {
    return '<button class="qp-c" data-seat="' + n + '">' + n + (t ? '<i class="' + (t > 0 ? 'p' : 'm') + '">' + (t > 0 ? '+' : '') + t + '</i>' : '') + '</button>';
  }
  function seatGrid(q, cls, seats, tot) {
    var L = q.layout(cls), on = {}, placed = {}, h = '';
    seats.forEach(function (s) { on[s] = 1; });
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var n = (L.grid[r] || [])[c] || 0;
      if (n && on[n]) { placed[n] = 1; h += cell(n, tot[n]); } else h += '<span class="qp-e"></span>';
    }
    var rest = seats.filter(function (s) { return !placed[s]; });
    return '<div class="qp-g" style="grid-template-columns:repeat(' + L.cols + ',1fr)">' + h + '</div><div class="qp-pod">講台</div>' +
      (rest.length ? '<div class="qp-g qp-rest">' + rest.map(function (s) { return cell(s, tot[s]); }).join('') + '</div>' : '');
  }
  function numGrid(seats, tot) {
    return '<div class="qp-g" style="grid-template-columns:repeat(7,1fr)">' + seats.map(function (s) { return cell(s, tot[s]); }).join('') + '</div>';
  }

  /* ── 點／長按 ── */
  var pressT = 0, pressEl = null, longDone = false;
  function onDown(e) {
    poke();
    var b = e.target.closest && e.target.closest('.qp-c'); if (!b) return;
    pressEl = b; longDone = false;
    clearTimeout(pressT);
    pressT = setTimeout(function () { pressT = 0; longDone = true; give(+b.getAttribute('data-seat'), st.mode === '+' ? -1 : 1, b); }, 550);
  }
  function onUp(e) {
    var b = e.target.closest && e.target.closest('.qp-c');
    if (pressT) { clearTimeout(pressT); pressT = 0; if (b && b === pressEl && !longDone) give(+b.getAttribute('data-seat'), st.mode === '+' ? 1 : -1, b); }
    pressEl = null;
  }
  function cancelPress() { if (pressT) { clearTimeout(pressT); pressT = 0; } pressEl = null; }

  function give(seat, d, btn) {
    var q = Q(), cls = curCls(); if (!q || !q.canWrite() || !seat) return;
    if (q.roster(cls).indexOf(seat) < 0) { st.last = cls + ' 沒有 ' + seat + ' 號'; st.lastErr = true; render(); return; }
    fly(btn || pad.querySelector('.qp-c[data-seat="' + seat + '"]'), d);
    st.last = seat + '號 ' + (d > 0 ? '+1' : '−1' + '（' + st.reason + '）') + ' 儲存中…'; st.lastErr = false;
    q.add(cls, seat, d, st.reason).then(function () {
      if (st.last.indexOf(seat + '號') === 0) st.last = '✓ ' + seat + '號 ' + (d > 0 ? '+1' : '−1（' + st.reason + '）');
      render();
    }, function () { st.last = '⚠ ' + seat + '號沒存到，請再按一次'; st.lastErr = true; render(); });
    render(); poke();
  }
  function fly(btn, d) {
    if (!btn) return;
    var r = btn.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'qp-fly ' + (d > 0 ? 'p' : 'm'); f.textContent = d > 0 ? '+1' : '−1';
    f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = r.top + 'px';
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 900);
  }

  function onClick(e) {
    var b = e.target.closest && e.target.closest('[data-q]'); poke(); if (!b) return;
    var a = b.getAttribute('data-q'), q = Q();
    if (a === 'x') toggle(false);
    else if (a === 'm+' || a === 'm-') { st.mode = a.charAt(1); render(); }
    else if (a.indexOf('r|') === 0) { st.reason = a.slice(2); render(); }
    else if (a === 'view') { st.view = st.view === 'seat' ? 'num' : 'seat'; put(VIEW_K, st.view); render(); }
    else if (a === 'undo') { st.last = '復原中…'; render(); q.undo().then(function (p) { st.last = p ? '↶ 已復原 ' + p.seat + '號 ' + (p.delta > 0 ? '+1' : '−1') : ''; st.lastErr = false; render(); }); }
    else if (a === 'full' || a === 'login') { toggle(false); q.open('pts'); }
    else if (a === 'reload') { q.load(true); render(); }
  }

  /* ── 鍵盤：小盤打開時才接；打字框裡不攔 ── */
  function onKey(e) {
    if (!st.open || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
    var gr = document.getElementById('v106-gr'); if (gr && gr.classList.contains('open')) return;
    var k = e.key, hit = true;
    if (/^[0-9]$/.test(k)) st.typed = (st.typed + k).slice(-2);
    else if (k === 'Backspace') st.typed = st.typed.slice(0, -1);
    else if (k === '+' || k === '=' || k === '-' || k === '_' || k === 'Enter') {
      if (!st.typed) { if (k !== 'Enter') { st.mode = (k === '-' || k === '_') ? '-' : '+'; } else hit = false; }
      else { var n = +st.typed; st.typed = ''; give(n, k === 'Enter' ? (st.mode === '+' ? 1 : -1) : (k === '-' || k === '_') ? -1 : 1); }
    } else if (k === 'Escape') { toggle(false); }
    else hit = false;
    if (!hit) return;
    e.preventDefault(); e.stopPropagation();
    if (st.open) { render(); poke(); }
  }

  function start() { if (Q()) build(); else setTimeout(start, 500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.V215QP = { toggle: function (v) { if (fab) toggle(v); }, state: function () { return st; } };   /* 測試用 */
})();
} catch (e) { setTimeout(function () { throw e; }); }
/* ════ src/js/136_v113-ver-js.js ════ */
try {

(function () {
  window.APP_VERSION = 'V216';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);
})();
} catch (e) { setTimeout(function () { throw e; }); }
