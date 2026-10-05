
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
