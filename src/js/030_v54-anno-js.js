
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
