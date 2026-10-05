
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
