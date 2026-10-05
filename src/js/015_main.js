

/* ════════ 資料 ════════ */
const TEXTBOOK = (function () {
  var o = {}, a = window.TB_LESSONS || [];
  a.forEach(function (p) { o[p[0]] = p[1]; });
  if (a.length !== 29) {   /* 課檔沒載完整：停止主程式，避免在資料不全時寫入任何紀錄 */
    var m = '課文資料沒有完整載入（29 課只讀到 ' + a.length + ' 課），請重新整理網頁。';
    alert(m); throw new Error(m);
  }
  return o;
})();

/* ═══ v36：師說習作補回（沿用既有 A卷手寫題＋選擇題資料，不另造題） ═══ */
(function(){
  const d = TEXTBOOK['師說'];
  if (!d || d.workbook) return;
  const answerSpan = function(v){
    return '<span class="wk-tans" onclick="this.classList.toggle(\'show\')"><span class="wk-tcov">？</span><span class="wk-tval">' + String(v == null ? '' : v) + '</span></span>';
  };
  const handSecs = (d.aHand && d.aHand.secs) || [];
  const sections = handSecs.map(function(sec){
    return {
      kind:'table',
      head:sec.h,
      cols:['題號','題目','答案'],
      rows:(sec.items || []).map(function(it){ return [it[0], it[1], answerSpan(it[2])]; })
    };
  });
  const qItems = (d.aQuiz || []).map(function(q){
    return { n:q.n, q:q.stem, opts:q.opts, ans:q.ans };
  });
  if (qItems.length) {
    sections.push({ kind:'quiz', head:'三、選擇題（逐題作答）', items:qItems });
  }
  if (sections.length) d.workbook = { title:'習作Ａ　第三課　師說', sections:sections };
})();

const WK_14 = ['師說','桃花源記','種樹郭橐駝傳','夢溪筆談選','郁離子選','庖丁解牛','燭之武退秦師','蘭亭集序','岳陽樓記','赤壁賦','天工開物','紅樓夢','臺煤減稅片','清代臺灣鐵路'];
const WK_EXTRA = ["論語選—子路曾皙冉有公西華侍坐",'世說新語選','醉翁亭記','漁父','鴻門宴','始得西山宴遊記','勞山道士','出師表','詩經','大同與小康','晚由六橋待月記'];
const WK_PROSE = ['身為魚販','散戲'];

/* ════════ 課程模式（高職／高中）════════ */
let SITE_MODE = 'voc';
function setMode(m) {
  SITE_MODE = m;
  document.body.classList.toggle('mode-senior', m === 'sen');
  document.getElementById('mode-voc').classList.toggle('active', m === 'voc');
  document.getElementById('mode-sen').classList.toggle('active', m === 'sen');
  const hint = document.getElementById('mode-hint');
  if (hint) hint.textContent = '目前：' + (m === 'sen' ? '高中版（含補充字義）' : '高職版');
  try { localStorage.setItem('site_mode', m); } catch(e) {}
  if (typeof wkRenderCurrent === 'function' && wkKey) wkRenderCurrent();
}

/* ════════ 深色模式 ════════ */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const on = document.body.classList.contains('dark-mode');
  try { localStorage.setItem('dark_mode', on ? '1' : '0'); } catch(e) {}
  syncDisplayDark();
}
function toggleDisplayPanel() {
  const panel = document.getElementById('display-panel');
  if (panel) panel.classList.toggle('open');
}
function syncDisplayDark() {
  const on = document.body.classList.contains('dark-mode');
  const btn = document.getElementById('display-dark-toggle');
  if (btn) btn.textContent = on ? '☀️ 亮色' : '🌙 暗色';
  const top = document.getElementById('site-dark-btn');
  if (top) top.textContent = on ? '☀️' : '🌙';
}
function setBaseSize(value) {
  const n = Math.max(12, Math.min(44, parseFloat(value) || 15));
  document.documentElement.style.setProperty('--base-size', n + 'px');
  document.documentElement.style.setProperty('--slider-base-size', n + 'px');
  const label = document.getElementById('display-font-value');
  if (label) label.textContent = n + ' px';
  const slider = document.getElementById('display-font-slider');
  if (slider && slider.value !== String(n)) slider.value = String(n);
  saveSettings();
}
function syncFontControl() {
  const n = parseFloat(document.documentElement.style.getPropertyValue('--base-size')) ||
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 15;
  setBaseSize(n);
}
function saveSettings() {
  try { localStorage.setItem('base_size', getComputedStyle(document.documentElement).getPropertyValue('--base-size').trim()); } catch(e) {}
}

/* ════════ 投影狀態 ════════ */
let wkKey = null, wkSlides = [], wkIdx = 0, wkProjMode = false, wkSectionMap = [];

/* ════════ 核心函式 ════════ */

/* 講義偏旁圖片（打不出來的字放圖） */
function pianUp(el){
  const k = el.getAttribute('data-k');
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=function(e){
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=function(ev){
      try{ localStorage.setItem('pian_'+k, ev.target.result); }catch(err){ alert('圖片太大，請選小一點的圖'); return; }
      pianLoad();
    };
    r.readAsDataURL(f);
  };
  inp.click();
}
function pianLoad(){
  document.querySelectorAll('.pian-slot').forEach(function(el){
    const k=el.getAttribute('data-k');
    let src=''; try{ src=localStorage.getItem('pian_'+k)||''; }catch(e){}
    const img=el.querySelector('.pian-img');
    if(src&&img){ img.src=src; el.classList.add('has-img'); }
  });
}

/* A卷互動 */
function asGo(i){
  const base = wkSlides.findIndex(function(s){ return s.type==='aq'; });
  if (base >= 0) wkGoto(base + parseInt(i));
}
/* 習作答案總覽：點題號跳回對應習作頁，並在該頁定位到指定題目。 */
function wkWorkAnswerGo(slideIdx, qn){
  const idx = parseInt(slideIdx, 10);
  if (!Number.isFinite(idx)) return;
  wkIdx = Math.max(0, Math.min(idx, wkSlides.length - 1));
  const go = function(root){
    if (!root) return;
    const target = root.querySelector('.wq-item[data-qno="' + String(qn).replace(/"/g,'&quot;') + '"]');
    if (target) target.scrollIntoView({behavior:'smooth', block:'center'});
  };
  wkRenderCurrent();
  setTimeout(function(){
    go(document.getElementById('wk-slide-area'));
    go(document.getElementById('wkfs-body'));
  }, 80);
}
function wqOpt(el){
  if (el.classList.contains('on')) return;
  el.classList.add('on');
  const it=el.closest('.wq-item');
  const tot=parseInt(it.getAttribute('data-tot'));
  if (it.querySelectorAll('.wq-opt.on').length >= tot) {
    it.classList.add('ans-on');
    const ans=it.getAttribute('data-ans');
    it.querySelectorAll('.wq-opt').forEach(function(o){
      if (ans.indexOf(o.getAttribute('data-k'))>=0) o.classList.add('right');
    });
  }
}
function wkWorkReveal(btn, ev){
  if (ev && ev.stopPropagation) ev.stopPropagation();
  const it = btn.closest('.wq-item');
  if (!it) return;
  it.classList.toggle('ans-on');
  btn.textContent = it.classList.contains('ans-on') ? '隱藏答案' : '直接顯示答案';
  if (it.classList.contains('ans-on')) {
    const ans = it.getAttribute('data-ans') || '';
    it.querySelectorAll('.wq-opt').forEach(function(o){
      if (ans.indexOf(o.getAttribute('data-k')) >= 0) o.classList.add('right');
    });
  }
}
function ahAll(btn){
  const sl=btn.closest('.wk-slide');
  sl.querySelectorAll('.ah-a').forEach(function(a){ a.classList.add('show'); });
  btn.textContent='已全部顯示';
}
function asAll(btn){
  const sl=btn.closest('.wk-slide');
  sl.querySelectorAll('.as-a').forEach(function(a){ a.classList.add('show'); });
  btn.textContent='已全部顯示';
}
function aqOpt(el){
  if (el.classList.contains('on')) return;
  el.classList.add('on');
  const sl=el.closest('.wk-slide');
  const tot=parseInt(sl.getAttribute('data-tot'));
  if (sl.querySelectorAll('.aq-opt.on').length >= tot) aqReveal(sl);
}
function aqAll(btn){
  const sl=btn.closest('.wk-slide');
  sl.querySelectorAll('.aq-opt').forEach(function(o){ o.classList.add('on'); });
  aqReveal(sl);
}
function aqReveal(sl){
  sl.classList.add('ans-on');
  const ans=sl.getAttribute('data-ans');
  sl.querySelectorAll('.aq-opt').forEach(function(o){
    if (ans.indexOf(o.getAttribute('data-k'))>=0) o.classList.add('right');
  });
}

/* 小節結束記號（教師專用暗記：右下角小圓點串） */
function wkSecMark() {
  const area = document.getElementById('wk-slide-area');
  const fsb = document.getElementById('wkfs-body');
  [area, fsb].forEach(function(el) {
    if (!el) return;
    const old = el.querySelector('.sec-mark'); if (old) old.remove();
    if (!wkSectionMap || !wkSectionMap.length) return;
    // 找出目前頁所屬小節，及該小節最後一頁
    let cur = -1;
    for (let i = 0; i < wkSectionMap.length; i++) {
      if (wkIdx >= wkSectionMap[i].idx) cur = i; else break;
    }
    if (cur < 0) return;
    const nextIdx = (cur + 1 < wkSectionMap.length) ? wkSectionMap[cur+1].idx : wkSlides.length;
    const isLast = (wkIdx === nextIdx - 1);
    if (!isLast) return;
    const sl = el.querySelector('.wk-slide'); if (!sl) return;
    if (getComputedStyle(sl).position === 'static') sl.style.position = 'relative';
    const m = document.createElement('div');
    m.className = 'sec-mark';
    m.textContent = '◈ ◈ ◈';
    m.title = '本小節最後一頁，下一頁進入：' + (cur+1 < wkSectionMap.length ? wkSectionMap[cur+1].label : '結束');
    sl.appendChild(m);
  });
}

/* 上課投影片：共用內容區塊 */
const LS_KEY3 = '<table class="jy-table ls-tbl">' +
  '<tr><th class="jy-th-full" colspan="2">關鍵句　｜　怎麼問</th></tr>' +
  '<tr><th class="jy-th"><span class="ls-q">阿公說賣魚要學，<b>學一輩子</b>。<br>爸說賣魚要學，<b>學一下子</b>。</span></th>' +
  '<td>「同樣一句『賣魚要學』，阿公和爸差在哪<b>三個字</b>？」<br>「這三個字的差別，代表他們怎麼看這份工作？」<br>「作者後來比較像誰？」</td></tr>' +
  '<tr><th class="jy-th"><span class="ls-q">我會將手掌<b>摀住同學的嘴</b>。</span></th>' +
  '<td>「他為什麼摀的是<b>別人的嘴</b>，不是自己的手？」<br>「這句有出現『丟臉』兩個字嗎？那我們怎麼知道他丟臉？」</td></tr>' +
  '<tr><th class="jy-th"><span class="ls-q"><b>裝睡的人叫不醒。</b></span></th>' +
  '<td>「這句在說誰？」<br>「『叫不醒』是<b>叫不動</b>，還是<b>不想再叫了</b>？」<br>「這是一個 happy ending 嗎？」</td></tr></table>';
const LS_DEMO1 = '<table class="jy-table ls-tbl">' +
  '<tr><th class="jy-th-full" colspan="3">如果只寫感受　｜　課文怎麼寫　｜　讀者從哪裡讀出來</th></tr>' +
  '<tr><th class="jy-th">我覺得很丟臉</th><td class="ls-good">我會將手掌摀住同學的嘴。</td><td>摀的是<b>別人的嘴</b>→怕被說<br>用<b>手掌</b>→身上有味道的那隻手</td></tr>' +
  '<tr><th class="jy-th">我被肯定了</th><td class="ls-good">我說正鯧，暗鯧與斗鯧偏軟。阿公稱讚嘴刁的我。</td><td><b>先答對，再被稱讚</b><br>「嘴刁」是阿公的用詞，不是自誇</td></tr>' +
  '<tr><th class="jy-th">兩代人想法不同</th><td class="ls-good">阿公說賣魚要學，學一輩子。<br>爸說賣魚要學，學一下子。</td><td>不評論誰對，<b>把兩句並排</b><br>差別自己浮出來</td></tr>' +
  '<tr><th class="jy-th">我不再期待了</th><td class="ls-good">裝睡的人叫不醒。</td><td>沒有罵，沒有哭<br><b>一句俗語</b>收掉全部情緒</td></tr></table>';
const LS_DEMO2 = '<table class="jy-table ls-tbl">' +
  '<tr><th class="jy-th-full" colspan="3">學生寫　｜　你問　｜　改寫示範</th></tr>' +
  '<tr><th class="jy-th">我打工<br>很累很委屈</th><td>當時幾點？在做什麼？看到什麼？</td><td class="ls-good">打烊後，我把最後一張桌子擦完，抬頭看了一眼牆上的時鐘。手機跳出同學聚餐的照片，我打了「你們玩得開心」，又把手機放回口袋。</td></tr>' +
  '<tr><th class="jy-th">我很緊張</th><td>緊張時<b>身體或動作</b>有什麼變化？</td><td class="ls-good">輪到我報告時，我發現自己一直在按原子筆。按了第七下，前面的同學回頭看我，我才把手放下。</td></tr>' +
  '<tr><th class="jy-th">他罵我</th><td>他<b>說了什麼</b>？當時你在做什麼？</td><td class="ls-good">我正把杯子排上架子。店長走過來說：「這排歪了，重來。」我「嗯」了一聲，把整排拿下來。第二次排完，他沒再說話。</td></tr>' +
  '<tr><th class="jy-th">後來我<br>很難過</th><td>事情結束後你<b>做了什麼</b>？</td><td class="ls-good">下班後我沒有等公車，一路走回家。走到第三個路口才發現，制服上的名牌還別著。</td></tr>' +
  '<tr><th class="jy-th">我很開心</th><td>開心時<b>第一件事</b>做什麼？跟誰說？</td><td class="ls-good">成績單發下來，我先看了一遍，又看了一遍，然後拍照傳給阿嬤。她回了一個貼圖，我看了很久。</td></tr>' +
  '<tr><th class="jy-th">我學到<br>很多</th><td>原本<b>不會</b>什麼？現在<b>會</b>什麼？</td><td class="ls-good">第一次切洋蔥我哭了整整十分鐘。師傅說泡冰水。第二次我照做，還是哭，但只哭了三分鐘。</td></tr>' +
  '<tr><th class="jy-th">那天很尷尬</th><td>尷尬的<b>那一秒</b>，誰先開口？</td><td class="ls-good">我叫錯了她的名字。空氣停了一下，她笑著說「沒關係」，然後我們兩個同時低頭看手機。</td></tr>' +
  '<tr><th class="jy-th">我很後悔</th><td><b>現在</b>想起這件事，最先想到哪個畫面？</td><td class="ls-good">現在經過那間店，我還是會下意識看一眼門口。那張公告已經換了，但我記得它貼過的位置。</td></tr></table>';
const LS_FILL = '<table class="jy-table ls-tbl">' +
  '<tr><th class="jy-th">一份工作</th><td>洗碗這件事／外送員／我家的店</td></tr>' +
  '<tr><th class="jy-th">一個人</th><td>我的組員／那個很兇的教官／我阿嬤</td></tr>' +
  '<tr><th class="jy-th">一種責任</th><td>當班長／照顧弟弟／社團的交接</td></tr>' +
  '<tr><th class="jy-th">一個選擇</th><td>我選這個科／放棄比賽／轉學</td></tr>' +
  '<tr><th class="jy-th">原本不喜歡的事</th><td>早自習／被檢討／重來一次</td></tr></table>' +
  '<div class="ls-hint">「重新看待」<b>不等於</b>「變喜歡」。可以是：我還是不喜歡，但我知道它為什麼存在／我原本以為他針對我，後來發現不是／我到現在還是不確定，但我不再生氣了。</div>';
const LS_RUBRIC = '<table class="jy-table ls-tbl">' +
  '<tr><th class="jy-th">事件清楚　25</th><td>讀者看得懂事情發生的原因與經過</td></tr>' +
  '<tr><th class="jy-th">細節具體　25</th><td>有動作、對話、場景或有效細節</td></tr>' +
  '<tr><th class="jy-th">想法與感受　25</th><td>能說明原本的想法，以及後來的理解或疑問</td></tr>' +
  '<tr><th class="jy-th">結構連貫　15</th><td>段落順序清楚，前後有連結</td></tr>' +
  '<tr><th class="jy-th">語句與標點　10</th><td>句意通順，標點大致正確</td></tr></table>';
function lsTeach(btn){
  const sl=btn.closest('.wk-slide');
  const t=sl.querySelector('.ls-teach');
  if(!t) return;
  t.classList.toggle('show');
  btn.classList.toggle('on');
}

/* 作者／題解：補充框換段展開 */
function spTog(el, si){
  const sl = el.closest('.wk-slide');
  const box = sl.querySelector('.sp-box[data-si="' + si + '"]');
  if (!box) return;
  box.classList.toggle('show');
  el.classList.toggle('on');
}

/* 補充框：古文注釋／語譯互動格式化 */
function spAnnoTog(el){
  el.classList.toggle('on');
}
function spTransTog(btn){
  const body = btn.nextElementSibling;
  if (!body) return;
  body.classList.toggle('show');
  btn.classList.toggle('on');
  btn.textContent = btn.classList.contains('on') ? '▾ 收起語譯' : '▸ 顯示語譯';
}
function spFormatAnc(html){
  if (!html) return '';
  /* 將已有 ruby 改成藍色可點注釋；不再把注音塞到字的正上方 */
  html = html.replace(/<ruby>([\s\S]*?)<rt>([\s\S]*?)<\/rt><\/ruby>/g, function(_, word, note){
    return '<span class="sp-anno-toggle" onclick="spAnnoTog(this)">' + word + '<span class="sp-anno-mark">註</span><span class="sp-anno">' + note + '</span></span>';
  });
  return html;
}
function spFormatBody(html){
  if (!html) return '';
  /* 所有補充內容共用：明確 sp-anc + 保守辨識完整古文引文。 */
  html = html.replace(/<div class=(?:"|')sp-anc(?:"|')>([\s\S]*?)<\/div>/g, function(_, inner){
    return '<div class="sp-anc">' + spFormatAnc(inner) + '</div>';
  });
  const parts = html.split('<br><br>');
  const out = [];
  parts.forEach(function(part){
    if (!part.trim()) return;
    if (part.indexOf('class="sp-anc"') >= 0 || part.indexOf("class='sp-anc'") >= 0) {
      out.push(part); return;
    }
    const m = part.match(/「([^」]{18,})」/);
    if (m) {
      const quote = m[1];
      const punct = (quote.match(/[，。；：！？]/g) || []).length;
      if (punct >= 2) {
        const before = part.slice(0, m.index).trim();
        const after = part.slice(m.index + m[0].length).trim();
        if (before) out.push(before);
        out.push('<div class="sp-anc">' + spFormatAnc('「' + quote + '」') + '</div>');
        if (after) out.push(after);
        return;
      }
    }
    out.push(part);
  });
  return out.join('<br><br>');
}

/* 所有補充講義共用同一套古文呈現格式。 */
function hdFormatShiShuoExample(html){
  if (!html) return '';
  /* 先處理既有 ruby，避免古文上方再出現小字。 */
  html = spFormatAnc(html);

  /* 將語譯改成教師可控制揭示的按鈕。 */
  html = html.replace(/(?:<b>語譯：<\/b>|語譯：)\s*([\s\S]*?)(?=<br><br>|$)/g, function(_, trans){
    return '<button type="button" class="hd-trans-toggle" onclick="hdTransTog(this)">▸ 顯示語譯</button>' +
           '<div class="hd-trans-body">' + trans + '</div>';
  });

  /* 只把「明顯是例句／引文」的 quoted passage 做成內框。 */
  html = html.replace(/「([^」]{8,})」/g, function(_, quote){
    const punct = (quote.match(/[，。；：！？、]/g) || []).length;
    if (quote.length < 10 && punct < 1) return '「' + quote + '」';
    return '<div class="hd-anc">' + spFormatAnc(quote) + '</div>';
  });
  return html;
}
function hdTransTog(btn){
  const body = btn.nextElementSibling;
  if (!body) return;
  body.classList.toggle('show');
  btn.classList.toggle('on');
  btn.textContent = btn.classList.contains('on') ? '▾ 收起語譯' : '▸ 顯示語譯';
}

/* 修辭超連結：跳到該修辭說明頁 */
function gotoRhet(name){
  const i = wkSlides.findIndex(function(s){ return s.type==='keyrhet' && s.name===name; });
  if (i >= 0) wkGoto(i);
}

/* 講義表格：相同內容自動合併儲存格 */
function hdMergeTables(root){
  var tabs = (root||document).querySelectorAll('.hd-table, .ls-tbl, .jy-table');
  for (var t = 0; t < tabs.length; t++) {
    var tb = tabs[t];
    if (tb.getAttribute('data-merged')) continue;
    tb.setAttribute('data-merged','1');
    var rows = tb.rows;
    if (rows.length < 3) continue;
    var grid = [];
    for (var r = 0; r < rows.length; r++) {
      var line = [];
      for (var c = 0; c < rows[r].cells.length; c++) line.push(rows[r].cells[c]);
      grid.push(line);
    }
    var maxCol = 0;
    for (var r2 = 0; r2 < grid.length; r2++) if (grid[r2].length > maxCol) maxCol = grid[r2].length;
    if (maxCol < 3) continue;
    var prevG = [];
    for (var z = 0; z < rows.length; z++) prevG.push(0);
    var lim = maxCol - 1;
    if (lim > 6) lim = 6;
    for (var c2 = 0; c2 < lim; c2++) {
      var grp = [];
      for (var z2 = 0; z2 < rows.length; z2++) grp.push(z2);
      var i2 = 0;
      while (i2 < grid.length) {
        var cell = grid[i2][c2];
        if (!cell || cell.getAttribute('colspan')) { i2++; continue; }
        var val = cell.innerHTML.replace(/\s+/g,'');
        if (!val || val === '&nbsp;') { i2++; continue; }
        var j2 = i2 + 1;
        while (j2 < grid.length) {
          var nx = grid[j2][c2];
          if (!nx || nx.getAttribute('colspan')) break;
          if (nx.innerHTML.replace(/\s+/g,'') !== val) break;
          if (prevG[j2] !== prevG[i2]) break;
          j2++;
        }
        if (j2 - i2 > 1) {
          cell.rowSpan = j2 - i2;
          cell.className += ' cell-merged';
          for (var k2 = i2 + 1; k2 < j2; k2++) if (grid[k2][c2]) grid[k2][c2].parentNode.removeChild(grid[k2][c2]);
        }
        for (var k3 = i2; k3 < j2; k3++) grp[k3] = i2;
        i2 = j2;
      }
      prevG = grp;
    }
  }
}

/* ════════ 內容自適應表格欄寬 ════════
   先用固定「基準字級」16px 測量每欄實際內容寬度，寫入 colgroup。
   之後表格採 fixed layout：放大／縮小字體只改文字換行，不重新分配欄寬。
   螢幕方向改變時，百分比欄寬仍會隨表格 100% 寬度一起伸縮。 */
const TABLE_LAYOUT_BASE_FONT = 16;
function resetAdaptiveTableWidths(root){
  const host = root || document;
  host.querySelectorAll('table[data-width-frozen="1"]').forEach(function(table){
    const cg = table.querySelector(':scope > colgroup[data-generated-widths]');
    if (cg) cg.remove();
    table.removeAttribute('data-width-frozen');
    table.style.tableLayout = 'auto';
  });
}

/*
 * 所有教學表格共用：先用固定基準字級 16px 做真正的 auto layout，
 * 取得瀏覽器實際分配的欄寬，再凍結成百分比。之後只調字體不重算欄寬；
 * 只有螢幕尺寸／方向改變時才重新計算。
 */
function freezeAdaptiveTableWidths(root){
  const host = root || document;
  const tables = host.querySelectorAll('.wk-slide-area table, #wk-fullscreen table, .q-body table, .tb-body table, .cross-year-table, .jy-table, .wk-table, .hd-table, .ls-tbl');
  tables.forEach(function(table){
    if (table.getAttribute('data-width-frozen') === '1') return;
    if (!table.rows.length) return;

    const rect = table.getBoundingClientRect();
    const parentWidth = table.parentElement ? table.parentElement.getBoundingClientRect().width : rect.width;
    const width = Math.max(280, parentWidth || rect.width || 0);
    if (!width) return;

    const cloneHost = document.createElement('div');
    cloneHost.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none;width:'+width+'px;max-width:'+width+'px;overflow:hidden;';
    const clone = table.cloneNode(true);
    clone.removeAttribute('data-width-frozen');
    const oldCg = clone.querySelector(':scope > colgroup[data-generated-widths]');
    if (oldCg) oldCg.remove();
    clone.style.cssText += ';width:'+width+'px;max-width:'+width+'px;table-layout:auto!important;';
    clone.style.fontSize = TABLE_LAYOUT_BASE_FONT + 'px';
    clone.querySelectorAll('*').forEach(function(el){
      el.style.removeProperty('width');
      el.style.removeProperty('min-width');
      el.style.removeProperty('max-width');
      el.style.removeProperty('table-layout');
    });
    clone.querySelectorAll('th,td').forEach(function(cell){
      cell.style.fontSize = TABLE_LAYOUT_BASE_FONT + 'px';
      cell.style.whiteSpace = 'normal';
      cell.style.wordBreak = 'normal';
      cell.style.overflowWrap = 'break-word';
    });
    cloneHost.appendChild(clone);
    document.body.appendChild(cloneHost);

    /* 優先找一列真正涵蓋全部欄位、且沒有 colspan 的資料列。 */
    let fullRow = null, maxCount = 0;
    Array.from(clone.rows).forEach(function(row){
      const cells = Array.from(row.cells);
      const count = cells.length;
      if (count > maxCount && cells.length > 1 && cells.every(function(c){ return !c.getAttribute('colspan') || c.getAttribute('colspan') === '1'; })) {
        maxCount = count; fullRow = row;
      }
    });
    if (!fullRow) { cloneHost.remove(); return; }

    const widthsPx = Array.from(fullRow.cells).map(function(cell){ return Math.max(1, cell.getBoundingClientRect().width); });
    const totalPx = widthsPx.reduce(function(a,b){ return a+b; },0);
    if (!totalPx || widthsPx.length < 2) { cloneHost.remove(); return; }
    const widths = widthsPx.map(function(v){ return v / totalPx * 100; });
    cloneHost.remove();

    const old = table.querySelector(':scope > colgroup[data-generated-widths]');
    if (old) old.remove();
    const cg = document.createElement('colgroup');
    cg.setAttribute('data-generated-widths','1');
    widths.forEach(function(w){
      const col = document.createElement('col');
      col.style.width = w.toFixed(3) + '%';
      cg.appendChild(col);
    });
    table.insertBefore(cg, table.firstChild);
    table.setAttribute('data-width-frozen','1');
    table.style.tableLayout = 'fixed';
  });
}

/* 螢幕尺寸／平板轉向才重新計算；調字級不觸發重算。 */
(function(){
  let timer = null;
  function onResize(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      resetAdaptiveTableWidths(document);
      freezeAdaptiveTableWidths(document);
    }, 180);
  }
  window.addEventListener('resize', onResize, {passive:true});
  window.addEventListener('orientationchange', onResize, {passive:true});
})();

/* 已取消平板左右滑動翻頁：避免誤觸換頁；頁面改由按鈕／段落選單／鍵盤操作。 */

/* 錯綜·交蹉語次：分步動畫（1324 → 1234） */
function cuoStep(btn){
  const box=btn.closest('.cuo2');
  let step=parseInt(box.dataset.step||'0')+1;
  box.dataset.step=step;
  const cs=[...box.querySelectorAll('.cuo2-stage .cuo2-c')];
  const tip=box.querySelector('.cuo2-tip');
  const res=box.querySelector('.cuo2-res');
  function byN(n){ return cs.find(function(c){ return c.dataset.n===String(n); }); }
  if(step===1){
    byN(1).classList.add('lit','g1');
    byN(2).classList.add('lit','g1');
    tip.textContent='① 先找出第 1 句配對的下句 → 是「2」，不是緊鄰的「3」';
  } else if(step===2){
    byN(3).classList.add('lit','g2');
    byN(4).classList.add('lit','g2');
    tip.textContent='② 剩下的「3」配「4」，也被中間隔開了';
  } else if(step===3){
    cs.forEach(function(c){ c.classList.add('shift'); });
    tip.textContent='③ 把它們拉回原位……';
  } else if(step===4){
    res.classList.add('show');
    tip.textContent='④ 還原完成：1‧2 ／ 3‧4';
    btn.disabled=true; btn.textContent='✓ 完成';
  }
}
function cuoReset(btn){
  const box=btn.closest('.cuo2');
  box.dataset.step='0';
  box.querySelectorAll('.cuo2-c').forEach(function(c){ c.classList.remove('lit','g1','g2','shift'); });
  box.querySelector('.cuo2-res').classList.remove('show');
  box.querySelector('.cuo2-tip').textContent='';
  const nb=box.querySelector('.cuo2-btn');
  nb.disabled=false; nb.textContent='▶ 下一步';
}

/* 錯綜：交錯語次動畫 */
function cuoPlay(btn){
  const box=btn.closest('.cuo-box');
  box.querySelectorAll('.cuo-hide').forEach(function(el){ el.classList.remove('cuo-hide'); });
  const A=box.querySelector('#cuoA');
  if(A){
    const cs=[...A.querySelectorAll('.cuo-c')];
    cs.forEach(function(c,i){ setTimeout(function(){ c.classList.add('lit'); }, i*280); });
  }
  const B=box.querySelector('#cuoB');
  if(B){
    setTimeout(function(){
      [...B.querySelectorAll('.cuo-c')].forEach(function(c,i){
        setTimeout(function(){ c.classList.add('lit'); }, i*280);
      });
    }, 500);
  }
  btn.textContent='↻ 重新播放';
  btn.onclick=function(){
    box.querySelectorAll('.cuo-c').forEach(function(c){ c.classList.remove('lit'); });
    setTimeout(function(){ cuoPlay(btn); }, 200);
  };
}

/* 基礎練習互動題 */
function iqOpt(el) {
  if (el.classList.contains('on')) return;
  el.classList.add('on');
  const slide = el.closest('.wk-slide');
  const tot = parseInt(slide.getAttribute('data-tot'));
  const done = slide.querySelectorAll('.iq-opt.on').length;
  if (done >= tot) {
    slide.classList.add('ans-on');
    const ans = slide.getAttribute('data-ans');
    slide.querySelectorAll('.iq-opt').forEach(function(o) {
      if (ans.indexOf(o.getAttribute('data-k')) >= 0) o.classList.add('right');
    });
  }
}
function iqAll(btn) {
  const slide = btn.closest('.wk-slide');
  slide.querySelectorAll('.iq-opt').forEach(function(o){ o.classList.add('on'); });
  slide.classList.add('ans-on');
  const ans = slide.getAttribute('data-ans');
  slide.querySelectorAll('.iq-opt').forEach(function(o) {
    if (ans.indexOf(o.getAttribute('data-k')) >= 0) o.classList.add('right');
  });
}

/* ══════ 班級進度記錄 ══════ */
const CLS_LIST = ['建一忠','建一孝','冷一忠','冷一孝'];
let clsCur = CLS_LIST[0];
function clsKey(){ return 'cls_records_v1'; }
function clsLoad(){ try { return JSON.parse(localStorage.getItem(clsKey()) || '{}'); } catch(e){ return {}; } }
function clsSave(d){ try { localStorage.setItem(clsKey(), JSON.stringify(d)); } catch(e){ alert('儲存失敗，可能是瀏覽器限制。'); } }
function clsToggle(){ document.getElementById('cls-panel').classList.toggle('open'); clsRender(); }
function clsPick(n){ clsCur = n; clsRender(); }
function clsAdd(){
  const d = document.getElementById('cls-date').value;
  const k = document.getElementById('cls-kind').value;
  const t = document.getElementById('cls-text').value.trim();
  if (!d || !t) { alert('請填寫日期與內容'); return; }
  const all = clsLoad();
  all[clsCur] = all[clsCur] || [];
  all[clsCur].push({ d:d, k:k, t:t });
  all[clsCur].sort(function(a,b){ return b.d.localeCompare(a.d); });
  clsSave(all);
  document.getElementById('cls-text').value = '';
  clsRender();
}
function clsDel(i){
  if (!confirm('確定刪除這筆紀錄？')) return;
  const all = clsLoad();
  all[clsCur].splice(i,1); clsSave(all); clsRender();
}
function clsRender(){
  const tabs = document.getElementById('cls-tabs');
  if (tabs) tabs.innerHTML = CLS_LIST.map(function(n){
    return '<button class="cls-b' + (n===clsCur?' on':'') + '" onclick="clsPick(\''+n+'\')">'+n+'</button>';
  }).join('');
  const all = clsLoad();
  const rec = all[clsCur] || [];
  const el = document.getElementById('cls-list');
  if (!el) return;
  if (!rec.length) { el.innerHTML = '<div class="cls-empty">尚無紀錄</div>'; return; }
  el.innerHTML = rec.map(function(r, i){
    return '<div class="cls-item cls-k-' + r.k + '"><div class="cls-d">' + r.d +
      '<span class="cls-kk">' + r.k + '</span></div><div class="cls-t">' + r.t +
      '</div><button class="cls-del" onclick="clsDel(' + i + ')">✕</button></div>';
  }).join('');
}
function clsExport(){
  const data = JSON.stringify(clsLoad(), null, 1);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '班級進度備份_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}
function clsImport(){
  const inp = document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange = function(e){
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = function(ev){
      try { clsSave(JSON.parse(ev.target.result)); clsRender(); alert('匯入完成'); }
      catch(err){ alert('檔案格式錯誤'); }
    };
    r.readAsText(f);
  };
  inp.click();
}
window.addEventListener('load', function(){
  const di = document.getElementById('cls-date');
  if (di) di.value = new Date().toISOString().slice(0,10);
  clsRender();
});

/* ════ 整合課文頁互動 ════ */
function tpTog(el, ev) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  const slide = el.closest('.wk-slide');
  const i = el.getAttribute('data-i');
  const wrap = slide.querySelector('.tp-wrap');
  const note = slide.querySelector('#tpn-' + i);
  if (!wrap || !note) return;
  const wasOn = el.classList.contains('on');
  el.classList.toggle('on');
  if (!wasOn) {
    wrap.classList.add('side-on');
    slide.querySelectorAll('.tp-note').forEach(n => n.classList.remove('hi'));
    note.classList.add('hi');
    setTimeout(function(){ note.scrollIntoView({block:'nearest', behavior:'smooth'}); }, 250);
  } else {
    note.classList.remove('hi');
    if (!slide.querySelector('.tp-n.on')) wrap.classList.remove('side-on');
  }
}

/* ════ v32：補充浮框智慧上下定位，避免相鄰標記全部擠在同一側 ════ */
function tpPopNode(el) {
  if (!el) return null;
  /* 浮框開啟後會移到 body，避免受到課文行高、overflow 或巢狀 inline span 影響。 */
  if (el._tpPopup && el._tpPopup.isConnected) return el._tpPopup;
  return el.querySelector('.tp-gd,.tp-pd,.tp-zd');
}
function tpPopRect(el) {
  const pop = tpPopNode(el);
  if (!pop) return null;
  return pop.getBoundingClientRect();
}
function tpRectsOverlap(a,b) {
  if (!a || !b) return false;
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}
function tpPopupScope(el) {
  if (!el) return null;
  return el.closest('.tp-body') || el.closest('.tp-main') || el.closest('.tp-line') || el.parentElement;
}
function tpPopupBounds(el) {
  const scope = tpPopupScope(el);
  const r = scope ? scope.getBoundingClientRect() : {left:8,right:window.innerWidth,top:8,bottom:window.innerHeight};
  const pad = 8;
  return {
    left: Math.max(pad, r.left + 4),
    right: Math.min(window.innerWidth - pad, r.right - 4),
    top: Math.max(6, r.top + 4),
    bottom: Math.min(window.innerHeight - 6, r.bottom - 4)
  };
}
function tpDetachPopup(el) {
  if (!el) return null;
  let pop = el._tpPopup || el.querySelector('.tp-gd,.tp-pd,.tp-zd');
  if (!pop) return null;
  if (!el._tpPopupSlot) {
    el._tpPopupSlot = document.createComment('tp-popup-slot');
    pop.parentNode.insertBefore(el._tpPopupSlot, pop);
  }
  if (pop.parentNode !== document.body) document.body.appendChild(pop);
  pop.classList.add('tp-popup-detached');
  el._tpPopup = pop;
  return pop;
}
function tpRestorePopup(el) {
  if (!el || !el._tpPopup) return;
  const pop = el._tpPopup;
  pop.classList.remove('tp-popup-detached');
  pop.style.visibility = 'hidden';
  pop.style.display = 'none';
  const slot = el._tpPopupSlot;
  if (slot && slot.parentNode) {
    slot.parentNode.insertBefore(pop, slot.nextSibling);
    slot.remove();
  } else if (el.isConnected) {
    el.appendChild(pop);
  }
  delete el._tpPopup;
  delete el._tpPopupSlot;
}
function tpPlacePopup(el) {
  if (!el || !el.classList.contains('show')) return;
  const pop = tpDetachPopup(el);
  if (!pop) return;

  const anchor = el.getBoundingClientRect();
  const bounds = tpPopupBounds(el);
  const maxW = Math.max(96, Math.floor(bounds.right - bounds.left));
  const fs = parseFloat(getComputedStyle(el).fontSize) || parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 16;

  /* 真正的「浮框」：搬到 body 後用 fixed 定位，完全脫離課文排版流。 */
  pop.style.position = 'fixed';
  pop.style.display = 'block';
  pop.style.visibility = 'hidden';
  pop.style.transform = 'none';
  pop.style.left = '0px';
  pop.style.right = 'auto';
  pop.style.top = '0px';
  pop.style.bottom = 'auto';
  pop.style.width = 'max-content';
  pop.style.height = 'auto';
  pop.style.minHeight = '0px';
  pop.style.maxWidth = maxW + 'px';
  pop.style.fontSize = fs + 'px';
  pop.style.lineHeight = '1.5';
  pop.style.boxSizing = 'border-box';
  /* 仍維持四行上限；若內容超過，浮框本身保持可讀高度並在內部捲動。 */
  pop.style.maxHeight = 'calc(6em + 14px)';
  pop.style.overflowY = 'auto';
  pop.style.overflowX = 'hidden';

  let pr = pop.getBoundingClientRect();
  if (!isFinite(pr.width) || pr.width <= 0) {
    pop.style.width = Math.min(maxW, window.innerWidth - 16) + 'px';
    pr = pop.getBoundingClientRect();
  } else if (pr.width > maxW + 1) {
    pop.style.width = maxW + 'px';
    pr = pop.getBoundingClientRect();
  }

  const gap = 3;
  const baseLeft = anchor.left + anchor.width / 2 - pr.width / 2;
  const leftCandidates = [
    baseLeft,
    anchor.left,
    anchor.right - pr.width,
    baseLeft - Math.min(24, pr.width),
    baseLeft + Math.min(24, pr.width)
  ].map(x => Math.max(bounds.left, Math.min(x, bounds.right - pr.width)));

  /*
   * 核心修正：只調整左右，不用「往下推很多」來避開其他浮框。
   * 因此浮框永遠緊貼原文的上方或下方；多個浮框同時存在時，優先橫向錯開。
   */
  const others = Array.from(document.querySelectorAll('.tp-g.show,.tp-p.show,.tp-z.show'))
    .filter(x => x !== el && x.closest('.wk-slide') === el.closest('.wk-slide'))
    .map(tpPopRect)
    .filter(Boolean);

  const yCandidates = [];
  const aboveY = anchor.top - pr.height - gap;
  const belowY = anchor.bottom + gap;
  if (aboveY >= bounds.top && aboveY + pr.height <= bounds.bottom) yCandidates.push({y:aboveY, below:false});
  if (belowY >= bounds.top && belowY + pr.height <= bounds.bottom) yCandidates.push({y:belowY, below:true});
  if (!yCandidates.length) {
    if (aboveY >= bounds.top) yCandidates.push({y:Math.max(bounds.top, aboveY), below:false});
    else yCandidates.push({y:Math.min(bounds.bottom - pr.height, belowY), below:true});
  }

  let chosen = null;
  for (const yc of yCandidates) {
    for (const lx of leftCandidates) {
      const test = {left:lx, right:lx + pr.width, top:yc.y, bottom:yc.y + pr.height};
      if (!others.some(o => tpRectsOverlap(test, o))) {
        chosen = {y:yc.y, below:yc.below, left:lx};
        break;
      }
    }
    if (chosen) break;
  }
  if (!chosen) chosen = {y:yCandidates[0].y, below:yCandidates[0].below, left:leftCandidates[0]};

  pop.style.left = Math.round(chosen.left) + 'px';
  pop.style.top = Math.round(chosen.y) + 'px';
  pop.style.visibility = 'visible';
  el.classList.toggle('tp-pop-below', !!chosen.below);
}
function tpTogglePop(el, ev) {
  if (ev && ev.stopPropagation) ev.stopPropagation();
  if (!el) return;
  const was = el.classList.contains('show');
  el.classList.toggle('show');
  if (!was) {
    tpDetachPopup(el);
    requestAnimationFrame(function(){
      tpPlacePopup(el);
      requestAnimationFrame(function(){ tpPlacePopup(el); });
    });
  } else {
    tpRestorePopup(el);
  }
}
/* 視窗大小或捲動變動時，開啟中的浮框重新定位。 */
if (!window.__tpPopupReflowBound) {
  window.__tpPopupReflowBound = true;
  window.addEventListener('resize', function(){
    document.querySelectorAll('.tp-g.show,.tp-p.show,.tp-z.show').forEach(tpPlacePopup);
  }, {passive:true});
  window.addEventListener('scroll', function(){
    document.querySelectorAll('.tp-g.show,.tp-p.show,.tp-z.show').forEach(tpPlacePopup);
  }, {passive:true, capture:true});
}

function tpShow(btn, k) {
  const line = btn.closest('.tp-line');
  const box = line.querySelector(k === 'r' ? '.tp-box-r' : (k === 's' ? '.tp-box-s' : (k === 't' ? '.tp-box-t' : (k === 'a' ? '.tp-box-a' : '.tp-box-m'))));
  if (!box) return;
  box.classList.toggle('show');
  btn.classList.toggle('on');
  /* 點「修辭」／「句意」大按鈕時，展開說明框的同時，裡面所有項目一起變色，
     不用再多點一次；同一句有多個修辭時，仍可個別點掉其中一條單獨關閉。 */
  if (k === 'r' || k === 'm') {
    const turnOn = btn.classList.contains('on');
    box.querySelectorAll('[data-lid]').forEach(function(item) {
      const isOn = item.classList.contains('on');
      if (turnOn !== isOn) tpLayerToggle(item.getAttribute('data-lid'), item);
    });
  }
}

/* ════ 修辭／句意：每一條各自獨立開關，重疊處由「最後開啟」的取得顯示權 ════ */
window.tpLayerOrder = window.tpLayerOrder || [];
function tpLayerToggle(id, btn) {
  const order = window.tpLayerOrder;
  const idx = order.indexOf(id);
  if (idx >= 0) {
    order.splice(idx, 1);
  } else {
    order.push(id);
  }
  if (btn) btn.classList.toggle('on');
  tpRecolor();
}
function tpRecolor() {
  const order = window.tpLayerOrder;
  document.querySelectorAll('.tp-seg[data-layers]').forEach(function(seg) {
    const ids = seg.getAttribute('data-layers').split(' ').filter(Boolean);
    let winner = null, winnerRank = -1;
    ids.forEach(function(id) {
      const rank = order.indexOf(id);
      if (rank > winnerRank) { winnerRank = rank; winner = id; }
    });
    seg.classList.remove('tp-seg-rhet', 'tp-seg-mean');
    if (winner) seg.classList.add(winner.charAt(0) === 'r' ? 'tp-seg-rhet' : 'tp-seg-mean');
  });
}
function tpNotes(btn) {
  const wrap = btn.closest('.wk-slide').querySelector('.tp-wrap');
  if (!wrap) return;
  wrap.classList.toggle('side-on');
  btn.classList.toggle('on');
}
function tpPanel(btn, k) {
  const slide = btn.closest('.wk-slide');
  const panel = slide.querySelector('.tp-panel[data-k="' + k + '"]');
  if (!panel) return;
  panel.classList.toggle('show');
  btn.classList.toggle('on');
}

/* ── 解析投影片 ── */
function wkParseSlides(key) {
  const data = TEXTBOOK[key];
  if (!data) return [];
  const slides = [];

  // 1. 封面
  slides.push({ type:'cover', key, data });

  // 2. 作者（舊架構備援：僅當該課沒有 extras.authorPages 時才產生）
  if (data.author && !(data.extras && data.extras.authorPages && data.extras.authorPages.length)) {
    const a = data.author;
    slides.push({ type:'author', label:'作者簡介',
      html:`<b>${a.name}</b><br><span style="color:var(--muted);font-size:0.9em">${a.dynasty}</span><br><br>${a.intro}` });
    slides.push({ type:'author', label:'寫作背景', html: a.context });
  }

  // ══════ 上課順序：作者→題解→背景→課文→作文→補充講義→習作→A卷 ══════
  if (data.textPages || data.detailSlides) {
    const ex = data.extras || {};
    const qBySeg = {}; (ex.questions || []).forEach(q => { (qBySeg[q.seg] = qBySeg[q.seg] || []).push(q); });
    const eBySeg = {}; (ex.exams || []).forEach(e => { (eBySeg[e.seg] = eBySeg[e.seg] || []).push(e); });
    const usedQ = {}, usedE = {};
    const LS = data.lesson || [];
    const pushLesson = (sec) => {
      LS.forEach((L, li) => { if (L.sec === sec) slides.push({ type:'lesson', L:L, idx:li,
        secFirst: LS.findIndex(x => x.sec === sec) === li }); });
    };

    /* ⓪ 課前引導 */
    if (ex.lead) slides.push({ type:'info', kind:'lead', label:ex.lead.label, head:ex.lead.head, body:ex.lead.body });
    /* ① 作者 */
    (ex.authorPages || []).forEach((p) => slides.push({ type:'info', kind:'author', bookKey:key, label:p.label, head:p.head, body:p.body, supList:p.supList }));
    /* ② 題解 */
    (ex.intro || []).filter(p => (p.label||'').indexOf('背景') < 0)
      .forEach(p => slides.push({ type:'info', kind:'intro', bookKey:key, label:p.label, head:p.head, body:p.body, supList:p.supList }));
    /* ③ 寫作背景 */
    (ex.intro || []).filter(p => (p.label||'').indexOf('背景') >= 0)
      .forEach(p => slides.push({ type:'info', kind:'intro', bookKey:key, label:p.label, head:p.head, body:p.body }));
    /* ④ 課文（含第1、2節上課流程） */
    pushLesson('第1節');
    pushLesson('第2節');
    if (data.textPages) {
      data.textPages.forEach((p, pi) => slides.push({ type:'textpage', bookKey:key, page:p, first: pi===0 }));
    }
    (data.detailSlides || []).forEach(d => {
      if (d.type === 'summary') {
        (qBySeg[d.seg] || []).forEach(q => { slides.push({ type:'question', seg:d.seg, q:q.q, a:q.a }); usedQ[d.seg]=1; });
        (eBySeg[d.seg] || []).forEach(e => { slides.push({ type:'exam', seg:d.seg, year:e.year, stem:e.stem, ans:e.ans, exp:e.exp }); usedE[d.seg]=1; });
      }
    });
    /* ⑤ 結構表 */
    if (data.structure) slides.push({ type:'structure', data:data.structure });
    /* ⑥ 課後統整／補充 */
    (ex.supplement || []).forEach(p => slides.push({ type:'info', kind:'supp', label:p.label, head:p.head, body:p.body }));
    /* ⑦ 賞析 */
    (ex.appreciation || []).forEach(p => slides.push({ type:'info', kind:'appreciation', label:p.label, head:p.head, body:p.body }));
    /* ⑧ 字義辨析 */
    (data.charBian || []).forEach(cb => {
      cb.pages.forEach((pg, pi) => slides.push({ type:'charbian', name:cb.name, sub:pg.sub, body:pg.body, first: pi===0 }));
    });
    /* ⑧＋ 互動形音義辨析 */
    (data.charQuiz || []).forEach((cq, qi) => slides.push({ type:'charquiz', data:cq, first: qi===0 }));
    /* ⑨ 修辭分析 */
    (data.keyRhetoric || []).forEach(rt => {
      rt.pages.forEach((pg, pi) => slides.push({ type:'keyrhet', name:rt.name, sub:pg.sub, body:pg.body, first: pi===0 }));
    });
    if (data.rhetTable && data.rhetTable.pages) {
      data.rhetTable.pages.forEach((p, pi) => slides.push({
        type:'rhet_table', name:p.name, own:p.own, body:p.body,
        first: pi===0, mine:(data.rhetTable.mine||[]).join('、') }));
    }
    /* ⑩ 作文（第3節） */
    pushLesson('第3節');
    /* ⑪ 補充講義 */
    if (data.handoutV2) {
      data.handoutV2.forEach((p, pi) => slides.push({ type:'hd2', bookKey:key, page:p, first: pi===0 }));
    } else if (data.handout) {
      const h = data.handout;
      (h.tables || []).forEach((t, ti) => slides.push({ type:'handout_table', title:t.title, rows:t.rows, first: ti===0 }));
      (h.mingju && h.mingju.length) && slides.push({ type:'handout_mingju', items:h.mingju });
      (h.readings || []).forEach(r => slides.push({ type:'handout_reading', title:r.title, passage:r.passage, items:r.items, trans:r.trans }));
    }
    /* ⑫ 基礎練習 */
    if (data.basicQ) {
      data.basicQ.forEach((q, qi) => slides.push({ type:'iquiz', q:q, first: qi===0, tot:data.basicQ.length }));
    }
    (ex.questions || []).forEach(q => { if (!usedQ[q.seg]) slides.push({ type:'question', seg:q.seg, q:q.q, a:q.a }); });
    (ex.exams || []).forEach(e => { if (!usedE[e.seg]) slides.push({ type:'exam', seg:e.seg, year:e.year, stem:e.stem, ans:e.ans, exp:e.exp }); });
    /* ⑬ 習作：所有課別統一先放一張「答案總覽」，後面才進入各習作頁。 */
    if (data.workbook) {
      const wa = { type:'work_answers', workbook:data.workbook, first:true, overview:true, targets:[] };
      slides.push(wa);
      (data.workbook.sections || []).forEach((sec, si) => {
        const targetIdx = slides.length;
        slides.push({ type:'work', sec:sec, first: si===0, title:data.workbook.title });
        if (sec.kind === 'quiz' || sec.kind === 'read') {
          (sec.items || []).forEach(function(it){
            wa.targets.push({ slideIdx: targetIdx, qn: String(it.n == null ? '' : it.n) });
          });
        }
      });
    }
    /* ⑭ A卷 */
    if (data.aHand) slides.push({ type:'ahand', data:data.aHand });
    if (data.aQuiz) {
      slides.push({ type:'asheet', items:data.aQuiz });
      data.aQuiz.forEach((q, qi) => slides.push({ type:'aq', q:q, idx:qi, tot:data.aQuiz.length, first: qi===0 }));
    }
    /* 跨閱／延伸／影音 */
    (ex.thinking || []).forEach(p => slides.push({ type:'info', kind:'thinking', label:p.label, head:p.head, body:p.body }));
    (ex.reading || []).forEach(p => slides.push({ type:'info', kind:'reading', label:p.label, head:p.head, body:p.body }));
    if (ex.media) slides.push({ type:'info', kind:'media', label:ex.media.label, head:ex.media.head, body:ex.media.body });
    return slides;
  }

  // 3. 課文（每1句一頁）
  const div = document.createElement('div');
  div.innerHTML = data.content;
  const nodes = Array.from(div.children);
  let origBuffer = '';

  const matchRhetoric = (orig) => {
    return (data.rhetoric || []).find(r => {
      const key2 = r.example.replace(/[「」【】〈〉《》]/g,'').substring(0,6);
      return orig.includes(key2);
    }) || null;
  };

  for (const el of nodes) {
    if (el.classList.contains('tb-note')) {
      const trans = el.textContent.replace(/^[▸►]\s*/,'').trim();
      if (origBuffer) {
        slides.push({ type:'text', orig:origBuffer, trans, rhetoric:matchRhetoric(origBuffer) });
        origBuffer = '';
      }
    } else if (el.classList.contains('tb-prompt')) {
      if (origBuffer) { slides.push({ type:'text', orig:origBuffer, trans:'', rhetoric:null }); origBuffer=''; }
      slides.push({ type:'prompt', text: el.textContent.replace(/^🎤\s*/,'').trim() });
    } else if (el.tagName === 'P') {
      if (origBuffer) { slides.push({ type:'text', orig:origBuffer, trans:'', rhetoric:null }); }
      origBuffer = el.innerHTML;
    }
  }
  if (origBuffer) { slides.push({ type:'text', orig:origBuffer, trans:'', rhetoric:null }); }

  // 4. 修辭（每2項一頁）
  if (data.rhetoric && data.rhetoric.length > 0) {
    for (let i = 0; i < data.rhetoric.length; i += 2) {
      slides.push({ type:'rhetoric', items: data.rhetoric.slice(i, Math.min(i+2, data.rhetoric.length)) });
    }
  }

  return slides;
}

/* ── 建立段落索引 ── */
function wkBuildSections(slides) {
  const map = [];
  let hasText = false;
  let lastSeg = '';
  slides.forEach((s, i) => {
    if (s.type === 'cover') map.push({ label:'封面', idx:i });
    else if (s.type === 'lesson' && s.secFirst) map.push({ label: s.L.sec==='第3節' ? '✎作文課' : '▶'+s.L.sec, idx:i });
    else if (s.type === 'author' && s.label === '作者簡介') map.push({ label:'作者', idx:i });
    else if (s.type === 'author' && s.label === '寫作背景') map.push({ label:'背景', idx:i });
    // 細分頁：依「段」建立導覽（第一段、第二段…）
    else if (s.type === 'info' && s.kind === 'author') {
      const isBook = (s.label||'').indexOf('課本') >= 0;
      const lb = isBook ? '作者·課本' : '作者·補充';
      if (map.length===0 || map[map.length-1].label!==lb) map.push({ label:lb, idx:i });
    }
    else if (s.type === 'info' && s.kind === 'intro') {
      const lb2 = (s.label||'').indexOf('課本')>=0 ? '題解·課本'
                : (s.label||'').indexOf('素養')>=0 ? '素養fun' : '題解·補充';
      if (map.length===0 || map[map.length-1].label!==lb2) map.push({ label:lb2, idx:i });
    }
    else if (s.type === 'textpage') map.push({ label:'◉'+s.page.seg, idx:i });
    else if (s.type === 'focus' && s.seg && s.seg !== lastSeg) { lastSeg = s.seg; map.push({ label:s.seg, idx:i }); }
    else if (s.type === 'structure') map.push({ label:'結構表', idx:i });
    else if (s.type === 'info' && s.kind === 'appreciation' && (map.length===0 || map[map.length-1].label!=='賞析')) map.push({ label:'賞析', idx:i });
    else if (s.type === 'info' && s.kind === 'supp') {
      const isGd = (s.label||'').indexOf('教學引導') >= 0;
      const lb = isGd ? '✦教學引導' : '補充';
      if (map.length===0 || map[map.length-1].label!==lb) map.push({ label:lb, idx:i });
    }
    else if (s.type === 'charbian' && s.first) map.push({ label:'字·'+s.name, idx:i });
    else if (s.type === 'charquiz' && s.first) map.push({ label:'🔵形音義', idx:i });
    else if (s.type === 'keyrhet' && s.first) map.push({ label:'◆'+s.name, idx:i });
    else if (s.type === 'concept') map.push({ label:'概念圖', idx:i });
    else if (s.type === 'info' && s.kind === 'thinking' && (map.length===0 || map[map.length-1].label!=='跨閱')) map.push({ label:'跨閱', idx:i });
    else if (s.type === 'rhet_text' && s.first) map.push({ label:'▤課文修辭', idx:i });
    else if (s.type === 'rhet_table' && s.first) map.push({ label:'▤修辭總表', idx:i });
    else if (s.type === 'iquiz' && s.first) map.push({ label:'✐基礎練習', idx:i });
    else if (s.type === 'hd2' && s.first) map.push({ label:'✎補充講義', idx:i });
    else if (s.type === 'handout_table' && s.first) map.push({ label:'✎補充講義', idx:i });
    else if (s.type === 'ahand') map.push({ label:'📝A卷手寫', idx:i });
    else if (s.type === 'asheet') map.push({ label:'📝A卷答案', idx:i });
    else if (s.type === 'aq' && s.first) map.push({ label:'📝A卷檢討', idx:i });
    else if (s.type === 'work' && s.first) map.push({ label:'📓習作', idx:i });
    else if (s.type === 'work_answers') map.push({ label:'📖習作答案總覽', idx:i });
    // 舊模式相容
    else if (s.type === 'text' && !hasText) { hasText = true; map.push({ label:'§課文', idx:i }); }
    else if (s.type === 'rhetoric' && (map.length === 0 || map[map.length-1].label !== '修辭')) map.push({ label:'修辭', idx:i });
    else if (s.type === 'prompt') map.push({ label:'提問', idx:i });
  });
  return map;
}

/* ── 渲染單張投影片 ── */
function wkRenderSlideHTML(slide) {
  if (slide.type === 'cover') {
    const a = slide.data.author || {};
    const isProse = slide.data.type === 'prose';
    const isExtra = WK_EXTRA.includes(slide.key);
    const coverClass = isProse ? 'wks-cover-prose' : isExtra ? 'wks-cover-extra' : '';
    return `<div class="wk-slide wks-cover ${coverClass}">
      <div class="wks-cover-dyn">${a.dynasty || ''}</div>
      <div class="wks-cover-title">〈${slide.key}〉</div>
      <div class="wks-cover-author">${(a.name || '').split('，')[0]}</div>
      <div class="wks-cover-sub">${slide.data.title}</div>
      ${isProse ? '<div class="wks-prose-badge">白話文</div>' : isExtra ? '<div class="wks-extra-badge">選讀古文</div>' : ''}
    </div>`;
  }
  if (slide.type === 'author') {
    return `<div class="wk-slide wks-author">
      <div class="wks-section-badge">${slide.label}</div>
      <div class="wks-author-text">${slide.html}</div>
    </div>`;
  }
  if (slide.type === 'text') {
    const rh = slide.rhetoric ? `<div class="wks-rhetoric-callout">
      <span class="wks-rt-tag">${slide.rhetoric.name}</span>
      <span class="wks-rt-ex">「${slide.rhetoric.example}」</span>
      <span class="wks-rt-note">${slide.rhetoric.explanation}</span>
    </div>` : '';
    return `<div class="wk-slide wks-text">
      <div class="wks-text-pair">
        <div class="wks-orig">${slide.orig}</div>
        <div class="wks-trans">▸ ${slide.trans}</div>
      </div>${rh}
    </div>`;
  }
  if (slide.type === 'rhetoric') {
    const items = slide.items.map(r => `<div class="wks-rh-item">
      <div class="wks-rh-name">✦ ${r.name}</div>
      <div class="wks-rh-ex">「${r.example}」</div>
      <div class="wks-rh-explain">${r.explanation}</div>
    </div>`).join('');
    return `<div class="wk-slide wks-rhetoric">
      <div class="wks-section-badge">重要修辭</div>
      <div class="wks-rh-grid">${items}</div>
    </div>`;
  }
  if (slide.type === 'prompt') {
    return `<div class="wk-slide wks-prompt">
      <div class="wks-prompt-icon">🎤</div>
      <div class="wks-prompt-text">${slide.text}</div>
      <div class="wks-prompt-hint">課堂討論</div>
    </div>`;
  }

  /* ── 細分頁① 句子聚焦（讓學生專注眼前句子） ── */
  if (slide.type === 'focus') {
    return `<div class="wk-slide wks-focus">
      <div class="wks-focus-tag">${slide.seg}　·　${slide.page || ''}</div>
      <div class="wks-focus-orig">${slide.orig}</div>
      <div class="wks-focus-hint">先讀一遍，圈出不懂的字</div>
    </div>`;
  }
  /* ── ② 字義（藍）── */
  if (slide.type === 'glosses') {
    const rows = slide.words.map(w => `<div class="wks-word-row wks-gloss-row">
      <div class="wks-word-key">${w.w}</div>
      <div class="wks-word-def">${w.d}</div>
    </div>`).join('');
    return `<div class="wk-slide wks-words wks-layer-gloss">
      <div class="wks-mini-orig">${slide.orig}</div>
      <div class="wks-section-badge wks-badge-gloss">字　義</div>
      <div class="wks-word-list">${rows}</div>
    </div>`;
  }
  /* ── ③ 修辭（綠）── */
  if (slide.type === 'sentrhet') {
    const items = slide.items.map(r => `<div class="wks-srhet-item">
      <span class="wks-rt-tag">${r.name}</span>
      <span class="wks-srhet-note">${r.note}</span>
    </div>`).join('');
    return `<div class="wk-slide wks-srhet wks-layer-rhet">
      <div class="wks-mini-orig">${slide.orig}</div>
      <div class="wks-section-badge wks-badge-rhet">修　辭</div>
      <div class="wks-srhet-list">${items}</div>
    </div>`;
  }
  /* ── ④ 句意（紫）＝出處、說理、寫作用意 ── */
  if (slide.type === 'sentmean') {
    return `<div class="wk-slide wks-meaning wks-layer-mean">
      <div class="wks-mini-orig">${slide.orig}</div>
      <div class="wks-section-badge wks-badge-mean">句　意</div>
      <div class="wks-meaning-body">${slide.note}</div>
    </div>`;
  }
  /* ── ⑤ 翻譯（語譯）── */
  if (slide.type === 'trans') {
    return `<div class="wk-slide wks-meaning wks-layer-trans">
      <div class="wks-mini-orig">${slide.orig}</div>
      <div class="wks-section-badge wks-badge-trans">翻　譯</div>
      <div class="wks-meaning-trans">${slide.trans}</div>
    </div>`;
  }
  /* ── 課本注釋（豬肝紅，學生不用抄）── */
  if (slide.type === 'booknotes') {
    const CIR = ['❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','⓫','⓬','⓭','⓮','⓯','⓰','⓱','⓲','⓳','⓴'];
    const rows = slide.rows.map((w, i) => `<div class="wks-word-row wks-booknote-row">
      <div class="wks-word-key"><span class="bk-num">${CIR[i] || (i+1)}</span>${w.w.replace(/^[●○]/,'')}</div>
      <div class="wks-word-def">${w.d}</div>
    </div>`).join('');
    return `<div class="wk-slide wks-words wks-layer-booknote">
      <div class="wks-booknote-hint">📖 課本注釋 · 課本上有，不用抄，往下看就好</div>
      <div class="wks-word-list">${rows}</div>
    </div>`;
  }
  /* ── 段旨 ── */
  if (slide.type === 'segsum') {
    return `<div class="wk-slide wks-segsum">
      <div class="wks-segsum-tag">${slide.seg}</div>
      <div class="wks-segsum-title">${slide.title}</div>
      <div class="wks-segsum-body">${slide.body}</div>
    </div>`;
  }
  /* ── 結構表（看清文章結構與邏輯） ── */
  if (slide.type === 'structure') {
    const st = slide.data;
    const groups = st.groups.map(g => {
      const rows = g.rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('');
      return `<div class="wks-st-group wks-st-${g.color}">
        <div class="wks-st-head">${g.head}</div>
        <table class="wks-st-table">${rows}</table>
      </div>`;
    }).join('');
    return `<div class="wk-slide wks-structure">
      <div class="wks-st-title">${st.title}</div>
      <div class="wks-st-groups">${groups}</div>
      <div class="wks-st-theme"><span class="wks-note-label">主旨</span>${st.theme}</div>
    </div>`;
  }

  const TEXTBOOK_INFO_PAGES = {
    '身為魚販': { author:'課本 P.7', intro:'課本 P.6', background:'課本 P.6' },
    '世說新語選': { author:'課本 P.29', intro:'課本 P.28', background:'課本 P.28' },
    '師說': { author:'課本 P.43~P.44', intro:'課本 P.42', background:'課本 P.42' }
  };
  function textbookInfoPage(slide){
    const m = TEXTBOOK_INFO_PAGES[slide.bookKey];
    if(!m) return '';
    if(slide.kind === 'author') return m.author || '';
    if(slide.kind === 'background') return m.background || m.intro || '';
    if(slide.kind === 'intro') return m.intro || '';
    return '';
  }

  /* ── 題解 / 作者 / 賞析 / 跨閱（資訊頁，依 kind 上色） ── */
  if (slide.type === 'info') {
    if (slide.supList && slide.supList.length) {
      /*
       * 先在「原始段落」上定位所有補充詞，再一次性插入補充框。
       * 舊做法會在前一個框插入後，讓後續 indexOf() 有機會搜尋到前一個框內，
       * 於是原本平行的補充框被誤包成「框中框」。
       */
      const parts = (slide.body || '').split('<br><br>');
      const marksByPart = parts.map(() => []);
      const boxesByPart = parts.map(() => []);

      slide.supList.forEach(function(pair, si) {
        const w = pair[0], d = pair[1];
        let foundPart = -1;
        let foundAt = -1;
        for (let pi = 0; pi < parts.length; pi++) {
          const at = parts[pi].indexOf(w);
          if (at >= 0) { foundPart = pi; foundAt = at; break; }
        }
        if (foundPart < 0) return;

        const token = '@@SPMARK' + si + '@@';
        parts[foundPart] = parts[foundPart].slice(0, foundAt) + token + parts[foundPart].slice(foundAt + w.length);
        marksByPart[foundPart].push({ token: token, html: '<span class="sp-w" onclick="spTog(this,' + si + ')">' + w + '</span>' });
        boxesByPart[foundPart].push(
          '<div class="sp-box" data-si="' + si + '">' +
          '<div class="sp-h">補充　' + w + '</div>' +
          '<div class="sp-b">' + spFormatBody(d) + '</div></div>'
        );
      });

      for (let pi = 0; pi < parts.length; pi++) {
        marksByPart[pi].forEach(function(m){ parts[pi] = parts[pi].split(m.token).join(m.html); });
        if (boxesByPart[pi].length) parts[pi] += boxesByPart[pi].join('');
      }
      slide = Object.assign({}, slide, { body: parts.join('<br><br>') });
    }
    const isSupplementInfo = slide.kind === 'supp' || (slide.label || '').indexOf('補充') >= 0;
    const formattedInfoBody = isSupplementInfo ? spFormatBody(slide.body) : slide.body;
    let bodyHtml = wkHighlight(formattedInfoBody);
    /* Phase2：師說 作者／題解 依 <br><br> 切段、包 <p class="wks-para">（首行縮排由 CSS 處理，僅師說）；
       含區塊元素或補充框(sp-box)的段落保持原樣，避免 <div> 巢在 <p> 內。 */
    if (slide.bookKey === '師說' && (slide.kind === 'author' || slide.kind === 'intro')) {
      bodyHtml = bodyHtml.split('<br><br>').map(function(part){
        var s = part.trim();
        if (!s) return '';
        if (/^<(div|table|ul|ol|figure|h\d)/i.test(s) || /class=["']sp-box["']/.test(s)) return part;
        return '<p class="wks-para">' + part + '</p>';
      }).join('');
    }
    const isRead = (slide.kind === 'intro' || slide.kind === 'author' || slide.kind === 'appreciation' || slide.kind === 'background');
    const readBtn = isRead ? `<button class="wks-hl-toggle" onclick="wkToggleHL(this)">✎ 螢光筆</button>` : '';
    return `<div class="wk-slide wks-info wks-info-${slide.kind}${slide.bookKey==='師說' ? ' wks-shishuo-info' : ''}">
      <div class="wks-info-topbar"><div class="wks-section-badge">${slide.label}</div><div class="wks-book-page">${textbookInfoPage(slide)}</div>${readBtn}</div>
      <div class="wks-info-head">${slide.head}</div>
      <div class="wks-info-wrap"><div class="wks-info-body">${bodyHtml}</div></div>
    </div>`;
  }
  /* ── 課堂提問（答案預設遮住，點一下才顯示，方便老師決定給不給學生看） ── */
  if (slide.type === 'question') {
    return `<div class="wk-slide wks-question">
      <div class="wks-q-tag">${slide.seg}　·　課堂提問</div>
      <div class="wks-q-text">${slide.q}</div>
      <div class="wks-q-ansbox" onclick="this.classList.toggle('show')">
        <div class="wks-q-cover">點此顯示參考答案</div>
        <div class="wks-q-ans"><span class="wks-note-label">答</span>${slide.a}</div>
      </div>
    </div>`;
  }
  /* ── 歷屆考題（答案/解析預設遮住） ── */
  if (slide.type === 'exam') {
    return `<div class="wk-slide wks-exam">
      <div class="wks-exam-tag">${slide.seg}　·　${slide.year}</div>
      <div class="wks-exam-stem">${slide.stem}</div>
      <div class="wks-exam-ansbox" onclick="this.classList.toggle('show')">
        <div class="wks-q-cover">點此顯示答案與解析</div>
        <div class="wks-exam-reveal">
          <div class="wks-exam-ans"><span class="wks-note-label">答案</span>${slide.ans}</div>
          <div class="wks-exam-exp">${slide.exp}</div>
        </div>
      </div>
    </div>`;
  }
  /* ── 重要修辭專頁 ── */
  if (slide.type === 'keyrhet') {
    /* 自我評量頁：答案預設遮住，點一下才顯示 */
    let body = wkHighlight(slide.body);
    if (slide.sub === '自我評量') {
      body = body.replace(/<span class="wks-selfq-ans">([\s\S]*?)<\/span>/,
        '<div class="wks-selfq-box" onclick="this.classList.toggle(\'show\')"><div class="wks-q-cover">點此顯示答案與解析</div><div class="wks-selfq-reveal">$1</div></div>');
    }
    return `<div class="wk-slide wks-keyrhet">
      <div class="wks-kr-head"><span class="wks-kr-name">${slide.name}</span><span class="wks-kr-sub">${slide.sub}</span></div>
      <div class="wks-kr-body">${body}</div>
    </div>`;
  }
  /* ── 概念圖 ── */
  if (slide.type === 'concept') {
    const items = slide.data.items.map(t => `<div class="wks-concept-item">${t}</div>`).join('');
    return `<div class="wk-slide wks-concept">
      <div class="wks-st-title">${slide.data.title}</div>
      <div class="wks-concept-list">${items}</div>
    </div>`;
  }

  /* ── 逐則課文修辭對照 ── */
  if (slide.type === 'rhet_text') {
    const badge = slide.own ? '<span class="rt-own">本課</span>' : '<span class="rt-ref">他版</span>';
    return `<div class="wk-slide wks-rhet-table">
      <div class="jy-topbar"><div class="jy-title">▤ 課文修辭</div>
        <div class="jy-sub">〈${slide.seg}〉${badge}</div></div>
      <div class="jy-scroll">${slide.body}</div>
    </div>`;
  }
  /* ── 字義辨析 ── */
  if (slide.type === 'charbian') {
    return '<div class="wk-slide wks-charbian">' +
      '<div class="jy-topbar"><div class="jy-title">字義辨析</div>' +
      '<div class="jy-sub">「' + slide.name + '」　' + (slide.sub||'') + '</div></div>' +
      '<div class="jy-scroll">' + slide.body + '</div></div>';
  }
  /* ── 互動形音義辨析 ── */
  if (slide.type === 'charquiz') {
    const D = slide.data || {};
    const cards = (D.items || []).map(function(it, i) {
      return '<div class="wks-cq-card" onclick="this.classList.toggle(\'show\')">' +
        '<div class="wks-cq-n">' + (i+1) + '</div>' +
        '<div class="wks-cq-char">「' + it.char + '」</div>' +
        '<div class="wks-cq-word">' + it.word + '</div>' +
        '<div class="wks-cq-cover">點一下揭曉</div>' +
        '<div class="wks-cq-ans"><b>' + it.ans + '</b><span>' + (it.note || '') + '</span></div>' +
        '</div>';
    }).join('');
    return '<div class="wk-slide wks-charquiz">' +
      '<div class="jy-topbar"><div class="jy-title">形音義辨析</div><div class="jy-sub">' + (D.title||'') + '</div>' +
      '<button class="jy-toggle-all" onclick="event.stopPropagation();this.closest(\'.wks-charquiz\').querySelectorAll(\'.wks-cq-card\').forEach(function(x){x.classList.add(\'show\')})">全部顯示答案</button></div>' +
      '<div class="wks-cq-hint">' + (D.sub||'') + '</div>' +
      '<div class="wks-cq-grid">' + cards + '</div>' +
      '</div>';
  }

  /* ── 文法修辭總表 ── */
  if (slide.type === 'rhet_table') {
    const badge = slide.own ? '<span class="rt-own">本課</span>' : '<span class="rt-ref">參考</span>';
    const hint = slide.first && slide.mine ? `<div class="rt-mine">本課修辭：${slide.mine}</div>` : '';
    return `<div class="wk-slide wks-rhet-table">
      <div class="jy-topbar"><div class="jy-title">▤ 文法修辭</div>
        <div class="jy-sub">${slide.name} ${badge}</div></div>
      ${hint}
      <div class="jy-scroll">${slide.body}</div>
    </div>`;
  }
  /* ── 補充講義·表格 ── */
  if (slide.type === 'handout_table') {
    const maxCols = Math.max(1, ...slide.rows.map(r => r.length));
    const tableClass = `jy-table jy-cols-${Math.min(maxCols, 6)}`;
    const trs = slide.rows.map(r => {
      // 單欄視為跨欄小標題；跨欄數量依實際表格欄數
      if (r.length === 1) return `<tr><th class="jy-th-full" colspan="${maxCols}">${r[0]}</th></tr>`;
      const first = `<th class="jy-th">${r[0]}</th>`;
      const rest = r.slice(1).map(c => `<td>${c}</td>`).join('');
      return `<tr>${first}${rest}</tr>`;
    }).join('');
    return `<div class="wk-slide wks-handout">
      <div class="jy-topbar"><div class="jy-title">✎ 補充講義</div><div class="jy-sub">${slide.title}</div>
        <button class="jy-toggle-all" onclick="jyToggleAll(this)">顯示全部答案</button></div>
      <div class="jy-scroll"><table class="${tableClass}">${trs}</table></div>
      <div class="jy-hint">點空格可逐一顯示答案；右上按鈕可一次顯示／隱藏全部</div>
    </div>`;
  }
  /* ── 補充講義·名句 ── */
  if (slide.type === 'handout_mingju') {
    const items = slide.items.map(m => `<div class="jy-mj-item">
      <div class="jy-mj-j">${m.j}<span class="jy-mj-men">〈${m.men}〉</span></div>
      <div class="jy-mj-y"><span class="jy-lbl">語譯</span>${m.y}</div>
      <div class="jy-mj-s"><span class="jy-lbl jy-lbl-s">釋義</span>${m.s}</div>
    </div>`).join('');
    return `<div class="wk-slide wks-handout">
      <div class="jy-topbar"><div class="jy-title">✎ 補充講義</div><div class="jy-sub">名句</div></div>
      <div class="jy-scroll">${items}</div>
    </div>`;
  }
  /* ── 補充講義·相關作品閱讀 ── */
  if (slide.type === 'handout_reading') {
    const qs = slide.items.map(it => `<div class="jy-rq">
      <div class="jy-rq-q">${it.q}</div>
      <div class="wks-exam-ansbox" onclick="this.classList.toggle('show')">
        <div class="wks-q-cover">點此顯示答案與解析</div>
        <div class="wks-exam-reveal"><div class="wks-exam-ans"><span class="wks-note-label">答案</span>${it.ans}</div><div class="wks-exam-exp">${it.exp}</div></div>
      </div></div>`).join('');
    const transBox = slide.trans ? `<div class="jy-rq"><div class="wks-exam-ansbox" onclick="this.classList.toggle('show')"><div class="wks-q-cover">點此顯示語譯</div><div class="wks-exam-reveal"><div class="wks-exam-exp">${slide.trans}</div></div></div></div>` : '';
    return `<div class="wk-slide wks-handout">
      <div class="jy-topbar"><div class="jy-title">✎ 補充講義</div><div class="jy-sub">${slide.title}</div></div>
      <div class="jy-scroll"><div class="jy-passage">${slide.passage}</div>${qs}${transBox}</div>
    </div>`;
  }

  /* ── 課文即時注（點字出義）── */
  if (slide.type === 'inline_note') {
    const chips = slide.marks.map(m => `<span class="jy-inline-chip" onclick="this.classList.toggle('show')"><span class="jy-inline-w">${m[0]}</span><span class="jy-inline-d">${m[1]}</span></span>`).join('');
    return `<div class="wk-slide wks-inline">
      <div class="wks-mini-orig">${slide.orig}</div>
      <div class="wks-section-badge wks-badge-gloss">課文即時注</div>
      <div class="jy-inline-list">${chips}</div>
      <div class="jy-hint">點各詞可顯示／隱藏旁注</div>
    </div>`;
  }

  /* ── 整合課文頁（仿補充版面）── */
  if (slide.type === 'textpage') {
    const P = slide.page;
    const CIR = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳','㉑','㉒','㉓','㉔','㉕','㉖','㉗','㉘','㉙','㉚','㉛','㉜','㉝','㉞','㉟','㊱','㊲','㊳','㊴','㊵','㊶','㊷','㊸','㊹','㊺','㊻','㊼','㊽','㊾','㊿'];
    /* Phase2：直式注音（逐字元堆疊，非旋轉橫字串）。聲調獨立定位，避免落在整串最下方。 */
    function vertZhuyin(zy, kind){
      var raw = String(zy || '');
      var toneMatch = raw.match(/[\u02C7\u02C9\u02CA\u02CB\u02D9]/);
      var tone = toneMatch ? toneMatch[0] : '';
      var cs = Array.from(raw.replace(/[\u02C7\u02C9\u02CA\u02CB\u02D9]/g, ''));
      if (!cs.length) return '';
      return '<span class="tp-ruby tp-ruby-' + kind + '" aria-hidden="true">' +
             '<span class="tp-ruby-col">' + cs.map(function(c){ return '<span class="tp-ruby-char">' + c + '</span>'; }).join('') + '</span>' +
             (tone ? '<span class="tp-ruby-tone ' + (tone === '\u02D9' ? 'tp-ruby-tone-light' : '') + '">' + tone + '</span>' : '') +
             '</span>';
    }
    var ZY = '[\\u3105-\\u312F\\u02C7\\u02C9\\u02CA\\u02CB\\u02D9]';
    function parse(t) {
      /* 先解析課本圈號，才能正確處理「生{n:6|乎}吾前」這種巢狀標記；
         再解析字義／補充／字音，避免內層 } 提前截斷外層。 */
      t = t.replace(/\{n:(\d+)\|((?:\{[gzpy]:[^}]*\}|[^}])*)\}/g, function(m, num, word) {
        const g = parseInt(num) - 1;
        const k = g - ((P.noteStart || 1) - 1);
        var wordHtml = word;
        /* Phase2 注釋注音：由對應 notes[k] 取「X，音ㄅˊ」，標到 word 中該字（豬肝紅直式）；
           以 {n:} 錨定位、非全域搜尋；跳過已在 word 內以 {z:} 標課本注音的字（10-2）。 */
        try {
          var note = P.notes && P.notes[k];
          if (note && note[1]) {
            var noteText = String(note[1]).replace(/<[^>]+>/g, '');
            var re = new RegExp('([\\u4e00-\\u9fff])，?音(' + ZY + '+)', 'g');
            var mm, applied = {};
            while ((mm = re.exec(noteText)) !== null) {
              var ch = mm[1], zy = mm[2];
              if (applied[ch]) continue; applied[ch] = 1;
              /* 僅檢查這一個 {n} anchor 內、同一字元位置的 {z}；不可跨段或全頁搜尋。 */
              var zAtSameAnchor = new RegExp('\\{z:' + ch.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '(?:\\||\\})').test(wordHtml);
              if (zAtSameAnchor) continue; /* 同一 anchor 已有課本注音({z})，不再加註釋注音。 */
              var at = wordHtml.indexOf(ch);
              if (at >= 0) wordHtml = wordHtml.slice(0, at + ch.length) + vertZhuyin(zy, 'note') + wordHtml.slice(at + ch.length);
            }
          }
        } catch(e){}
        return '<span class="tp-n" onclick="tpTog(this,event)" data-i="' + k + '">' + wordHtml +
               '<sup class="tp-num">' + (CIR[g] || num) + '</sup></span>';
      });
      t = t.replace(/\{g:([^|]*)\|([^}]*)\}/g, function(m, w, d) {
        /* 若本課有此字的字義辨析／形音義專頁，於字義浮窗內加「完整辨析 →」連結，可跳頁並一鍵回課文。 */
        var plainW = String(w).replace(/<[^>]+>/g, '');
        var gMore = (typeof wkFindExplainIdx === 'function' && wkFindExplainIdx('char', plainW) >= 0)
          ? '<a class="tp-more" onclick="wkJumpExplain(event,\'char\',\'' + plainW.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\')">完整辨析 →</a>' : '';
        return '<span class="tp-g" onclick="tpTogglePop(this,event)">' + w +
               '<span class="tp-gd" onclick="event.stopPropagation()">' + d + gMore + '</span></span>';
      });
      t = t.replace(/\{p:([^|]*)\|([^}]*)\}/g, function(m, w, d) {
        const plainW = String(w).replace(/<[^>]+>/g, '');
        /* v59：老師指示「生乎吾前／生乎吾後」都維持紫色補充標記，不再改藍色（原：plainW === '生乎吾前' || plainW === '生乎吾後'）。 */
        const bluePhrase = false;
        return '<span class="tp-p' + (bluePhrase ? ' tp-p-blue' : '') + '" onclick="tpTogglePop(this,event)">' + w +
               '<span class="tp-pd" onclick="event.stopPropagation()">' + d + '</span></span>';
      });
      t = t.replace(/\{y:([^}]*)\}/g, '<span class="tp-y">$1</span>');
      t = t.replace(/\{z:([^|]*)\|([^}]*)\}/g, function(m, w, z) {
        /* Phase2 課本注音：抽出開頭的注音（含聲調），黑色直式標於字右；其餘（通假/說明）留 popup。 */
        var zm = String(z).match(new RegExp('^(' + ZY + '+)([\\s\\S]*)$'));
        var ruby = (zm && zm[1]) ? vertZhuyin(zm[1], 'book') : '';
        /* 注音已在課文旁直排呈現；浮窗只保留注音以外的通假／說明，避免與直式注音重複。 */
        var popup = (zm ? String(zm[2] || '') : String(z)).replace(/^[\s，,、：:；;]+/, '');
        if (!popup.trim()) return '<span class="tp-z tp-z-inline">' + w + ruby + '</span>';
        return '<span class="tp-z" onclick="tpTogglePop(this,event)" aria-label="切換注音或通假">' + w + ruby +
               '<span class="tp-zd" onclick="event.stopPropagation()">' + popup + '</span></span>';
      });
      return t;
    }
    /* 取 HTML 中 tp-rq 的可見原句，供沒有明確 rcite 時自動標示 */
    function visibleRhetPhrase(html) {
      if (!html) return '';
      const m = String(html).match(/<span class=["']tp-rq["'][^>]*>([\s\S]*?)<\/span>/i);
      if (!m) return '';
      return m[1].replace(/<[^>]+>/g,'').replace(/──[\s\S]*$/,'').trim();
    }
    /* 取 tp-rq 的完整可見原句，並記錄裡面 <b class='rq-hi'> 標出的重點字
       在這段原句中的相對位置。修辭真正要框的往往只是重點字（例如「轉品」
       只框那一個字，不是整句），有標重點字時只框那幾個字；沒標的話
       （例如「頂真」整段前後蟬聯的情形）才退回整句都框。 */
    function visibleRhetQuote(html) {
      if (!html) return null;
      const m = String(html).match(/<span class=["']tp-rq["'][^>]*>([\s\S]*?)<\/span>/i);
      if (!m) return null;
      const inner = m[1].replace(/──[\s\S]*$/, '');
      const hiRanges = [];
      let plain = '';
      const hiRegex = /<b class=['"]rq-hi['"]>([\s\S]*?)<\/b>/g;
      let lastIndex = 0, match;
      while ((match = hiRegex.exec(inner)) !== null) {
        plain += inner.slice(lastIndex, match.index).replace(/<[^>]+>/g, '');
        const hiText = match[1].replace(/<[^>]+>/g, '');
        if (hiText) { hiRanges.push([plain.length, plain.length + hiText.length]); plain += hiText; }
        lastIndex = hiRegex.lastIndex;
      }
      plain += inner.slice(lastIndex).replace(/<[^>]+>/g, '');
      return {
        full: plain,
        hiRanges: hiRanges,
        hiTexts: hiRanges.map(function(r){ return plain.slice(r[0], r[1]); })
      };
    }
    /*
     * 修辭／句意的引句定位＋上色，改用真正的 DOM 節點來做，
     * 不再直接切 HTML 字串。原因：parse() 之後課文字串裡已經有
     * <span class="tp-g">、<span class="tp-n"> 等標記，如果只在
     * 字串上找位置再包一層 <span>，遇到引句邊界剛好卡在既有標記
     * 「裡面」時，會把 HTML 標籤切成不成對的破碎結構。改成在
     * 真正的 DOM 樹上用 Range 去抓取／包裹對應範圍，瀏覽器會自動
     * 正確處理巢狀關係，不會產生無效的 HTML。
     */
    /* 這些是「預設隱藏、點開才顯示」或純 UI 用的內容（字義小括號、通同字注音、
       注釋圈號），不算課文本身的文字，比對修辭／句意引句時要整段跳過，
       否則引句會被這些插入的內容打斷而配對失敗。 */
    const TP_SKIP_CLASSES = ['tp-gd', 'tp-pd', 'tp-zd', 'tp-num', 'tp-ruby'];
    function tpIsSkipEl(el) {
      if (!el || el.nodeType !== 1) return false;
      for (let i = 0; i < TP_SKIP_CLASSES.length; i++) {
        if (el.classList && el.classList.contains(TP_SKIP_CLASSES[i])) return true;
      }
      return false;
    }
    function tpIsInsideSkip(node, container) {
      let el = node;
      while (el && el !== container) {
        if (tpIsSkipEl(el)) return true;
        el = el.parentNode;
      }
      return false;
    }
    /* 把 container 裡「使用者實際看得到的文字」抽成一個字元陣列，
       每個字元都記著它在真正 DOM 裡對應的 (文字節點, 位移)。 */
    function tpBuildVisibleChars(container) {
      const chars = [];
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        if (tpIsInsideSkip(node.parentNode, container)) continue;
        const text = node.nodeValue;
        for (let i = 0; i < text.length; i++) chars.push({ node: node, offset: i, ch: text[i] });
      }
      return chars;
    }
    function normalizeForMatch(str) {
      return String(str || '')
        .replace(/[「」『』“”"'‘’]/g, '')
        .replace(/[，,、]/g, '，')
        .replace(/[。．.]/g, '。')
        .replace(/[；;]/g, '；')
        .replace(/[：:]/g, '：')
        .replace(/[！!]/g, '！')
        .replace(/[？?]/g, '？')
        .replace(/\s+/g, '');
    }
    function stripPunctForMatch(str) {
      return normalizeForMatch(str).replace(/[，。；：！？]/g, '');
    }
    function tpFindWithTransform(visible, s, transform) {
      const target = transform(s);
      if (!target) return null;
      let norm = '';
      const normMap = [];
      for (let j = 0; j < visible.length; j++) {
        const n = transform(visible[j]);
        if (!n) continue;
        for (let k = 0; k < n.length; k++) { norm += n[k]; normMap.push(j); }
      }
      const ns = norm.indexOf(target);
      if (ns < 0) return null;
      return { start: normMap[ns], end: normMap[ns + target.length - 1] + 1 };
    }
    /* 在「可見文字」字串裡找出 s 的 [start,end)；找不到回傳 null。
       第一層完全比對；第二層容許全形／半形標點風格不同；
       第三層（最後手段）把兩邊標點都拿掉再比一次──修辭說明裡
       摘出來的引句偶爾會漏標一兩個逗號句號，寧可標寬鬆一點，
       也不要完全標不到、又整句誤框。 */
    function locate(visible, s) {
      if (!s) return null;
      const exact = visible.indexOf(s);
      if (exact >= 0) return { start: exact, end: exact + s.length };
      let loc = tpFindWithTransform(visible, s, normalizeForMatch);
      if (loc) return loc;
      return tpFindWithTransform(visible, s, stripPunctForMatch);
    }
    /* 引句邊界如果剛好落在某個標記元件（注釋號、字義、通同字…）的最前面
       或最後面，就把邊界往外推到該元件外側，讓元件維持完整、不被硬生生
       切開──切開會產生一份空的複製品，讓點字看注釋／切換通同字的功能
       在那份空殼上完全失效（這正是「點了卻沒有反應、原字也不見」的成因）。
       起點看前面的手足節點、終點看後面的手足節點，兩邊都要做。 */
    function tpHoistStart(node, container) {
      let ref = node;
      while (ref !== container) {
        let sib = ref.previousSibling;
        while (sib && tpIsSkipEl(sib)) { ref = sib; sib = ref.previousSibling; }
        if (ref.previousSibling) break;
        if (!ref.parentNode || ref.parentNode === container) break;
        ref = ref.parentNode;
      }
      return ref;
    }
    function tpHoistEnd(node, container) {
      let ref = node;
      while (ref !== container) {
        let sib = ref.nextSibling;
        while (sib && tpIsSkipEl(sib)) { ref = sib; sib = ref.nextSibling; }
        if (ref.nextSibling) break;
        if (!ref.parentNode || ref.parentNode === container) break;
        ref = ref.parentNode;
      }
      return ref;
    }
    /* 把一整行課文（已 parse() 過的 HTML）與一批要上色的引句範圍，
       轉成「已包好 tp-seg 圖層」的 HTML；每個 tp-seg 段落記錄涵蓋它
       的所有層級 id，實際顏色由 tpRecolor() 依開啟先後即時決定。 */
    function tpApplyLayers(html, ranges) {
      if (!ranges.length) return html;
      const container = document.createElement('div');
      container.innerHTML = html;
      const chars = tpBuildVisibleChars(container);
      const boundarySet = new Set([0, chars.length]);
      ranges.forEach(function(r){ boundarySet.add(r.start); boundarySet.add(r.end); });
      const bounds = Array.from(boundarySet).sort(function(a,b){ return a - b; });
      for (let s = bounds.length - 2; s >= 0; s--) {
        const segStart = bounds[s], segEnd = bounds[s+1];
        if (segStart >= segEnd || segStart < 0 || segEnd > chars.length) continue;
        const covering = ranges.filter(function(r){ return r.start <= segStart && r.end >= segEnd; }).map(function(r){ return r.id; });
        if (!covering.length) continue;
        const startChar = chars[segStart], endChar = chars[segEnd - 1];
        try {
          const range = document.createRange();
          if (startChar.offset === 0) {
            const firstNode = tpHoistStart(startChar.node, container);
            if (firstNode !== startChar.node) range.setStartBefore(firstNode);
            else range.setStart(startChar.node, 0);
          } else {
            range.setStart(startChar.node, startChar.offset);
          }
          if (endChar.offset + 1 === endChar.node.nodeValue.length) {
            const lastNode = tpHoistEnd(endChar.node, container);
            if (lastNode !== endChar.node) range.setEndAfter(lastNode);
            else range.setEnd(endChar.node, endChar.offset + 1);
          } else {
            range.setEnd(endChar.node, endChar.offset + 1);
          }
          const wrap = document.createElement('span');
          wrap.className = 'tp-seg';
          wrap.setAttribute('data-layers', covering.join(' '));
          const frag = range.extractContents();
          wrap.appendChild(frag);
          range.insertNode(wrap);
        } catch (e) { /* 極少數邊界情況找不到乾淨的包裹方式，略過這一段的顏色圖層即可，不影響課文本身顯示 */ }
      }
      return container.innerHTML;
    }

    /*
     * 先把所有課文行 parse 成 HTML，並建立「整頁可見文字座標」。
     * 這裡特別處理跨行修辭／句意：例如「古之學者必有師。師者」的「頂真」，
     * 引句跨越兩個 lines，若逐行比對就永遠找不到。
     * 現在先在整頁文字中定位，再把同一個標記切成各行的局部範圍。
     */
    const parsedTexts = (P.lines || []).map(function(L){ return parse(L.text || ''); });
    const lineMeasures = parsedTexts.map(function(txt){
      const el = document.createElement('div');
      el.innerHTML = txt;
      const chars = tpBuildVisibleChars(el);
      return { html: txt, el: el, chars: chars, text: chars.map(function(c){ return c.ch; }).join('') };
    });
    const lineStarts = [];
    let pageVisibleText = '';
    lineMeasures.forEach(function(m){
      lineStarts.push(pageVisibleText.length);
      pageVisibleText += m.text;
    });

    function locateInLineOrPage(lineText, lineStart, phrase) {
      if (!phrase) return null;
      const local = locate(lineText, phrase);
      if (local) return { start: lineStart + local.start, end: lineStart + local.end };
      return locate(pageVisibleText, phrase);
    }

    /* 對跨行引句只取「目前這一行真正覆蓋到的區段」。 */
    function sliceGlobalRange(globalRange, lineIndex) {
      if (!globalRange) return null;
      const ls = lineStarts[lineIndex];
      const le = ls + lineMeasures[lineIndex].text.length;
      const s0 = Math.max(globalRange.start, ls);
      const e0 = Math.min(globalRange.end, le);
      if (e0 <= s0) return null;
      return { start: s0 - ls, end: e0 - ls };
    }

    const lineStates = (P.lines || []).map(function(L, li) {
      const styleItems = (L.rhet || []).filter(function(r){
        return /開門見山/.test(String(r[0] || '')) || /文章筆法|寫作手法/.test(String(r[0] || ''));
      });
      const rhetItems = (L.rhet || []).filter(function(r){
        return !(/開門見山/.test(String(r[0] || '')) || /文章筆法|寫作手法/.test(String(r[0] || '')));
      });
      const stylePhrases = styleItems.map(visibleRhetPhrase).filter(Boolean);
      const usedRcite = {};

      const meanLayers = [];
      if (L.cite) meanLayers.push({ id:'m' + li + '_0', phrase:String(L.cite) });
      if (L.cite2) meanLayers.push({ id:'m' + li + '_1', phrase:String(L.cite2) });

      const rhetLayers = rhetItems.map(function(r, ri){
        const q = visibleRhetQuote(r[1]);
        let quote = q;
        if (quote && stylePhrases.indexOf(quote.full.trim()) !== -1) quote = null;
        if (!quote || !quote.full) {
          const explicit = (L.rcite || []).find(function(c){ return !usedRcite[c]; });
          if (explicit) {
            quote = { full:String(explicit), hiRanges:[] };
            usedRcite[String(explicit)] = true;
          }
        } else {
          usedRcite[quote.full.trim()] = true;
        }
        return {
          id:'r' + li + '_' + ri,
          name:r[0],
          desc:r[1],
          quote:quote,
          globalRange:null,
          matched:false
        };
      });

      /* 修辭／句意定位：先找同一行，找不到才到整頁找，以降低重複短句誤配。 */
      meanLayers.forEach(function(m){
        if (!m.phrase) {
          m.globalRange = { start: lineStarts[li], end: lineStarts[li] + lineMeasures[li].text.length };
          m.matched = true;
          return;
        }
        const found = locateInLineOrPage(lineMeasures[li].text, lineStarts[li], m.phrase);
        if (found) { m.globalRange = found; m.matched = true; }
      });

      rhetLayers.forEach(function(r){
        if (!r.quote || !r.quote.full) return;
        const found = locateInLineOrPage(lineMeasures[li].text, lineStarts[li], r.quote.full);
        if (!found) return;
        r.globalRange = found;
        r.matched = true;
      });

      return {
        L:L,
        li:li,
        html:lineMeasures[li].html,
        styleItems:styleItems,
        rhetLayers:rhetLayers,
        meanLayers:meanLayers
      };
    });

    const lines = lineStates.map(function(state) {
      const L = state.L;
      const li = state.li;
      let txt = state.html;
      const ranges = [];

      state.meanLayers.forEach(function(m){
        const local = sliceGlobalRange(m.globalRange, li);
        if (local) ranges.push({ id:m.id, start:local.start, end:local.end });
      });

      state.rhetLayers.forEach(function(r){
        if (!r.globalRange) return;
        if (r.quote && r.quote.hiTexts && r.quote.hiTexts.length) {
          /*
           * 依序在已定位的整段引句中尋找每個「重點字串」。
           * 這比直接套用 hiRanges 的字元偏移穩定，尤其是跨行、
           * 以及引句中的標點在比對時被正規化的情況。
           */
          let cursor = r.globalRange.start;
          r.quote.hiTexts.forEach(function(ht){
            const loc = locate(pageVisibleText.slice(cursor, r.globalRange.end), ht);
            if (!loc) return;
            const gs = cursor + loc.start;
            const ge = cursor + loc.end;
            const local = sliceGlobalRange({start:gs, end:ge}, li);
            if (local) ranges.push({ id:r.id, start:local.start, end:local.end });
            cursor = ge;
          });
        } else {
          const local = sliceGlobalRange(r.globalRange, li);
          if (local) ranges.push({ id:r.id, start:local.start, end:local.end });
        }
      });

      txt = tpApplyLayers(txt, ranges);

      const citeHtml = L.cite ? '<span class="tp-citetxt">' + L.cite + '</span>──' : '';
      const cite2Html = L.cite2 ? '<div class="tp-mean2"><span class="tp-citetxt">' + L.cite2 + '</span>──' + (L.mean2||'') + '</div>' : '';

      /* 修辭顯示順序：依修辭標記在原文中的起始位置排序（沿用既有 globalRange 定位）；
         未定位者置後、同位置維持資料原序。只影響顯示排序，不影響定位與上色。 */
      const rh = state.rhetLayers.slice().sort(function(a,b){
        var pa=(a.globalRange&&typeof a.globalRange.start==='number')?a.globalRange.start:Number.MAX_SAFE_INTEGER;
        var pb=(b.globalRange&&typeof b.globalRange.start==='number')?b.globalRange.start:Number.MAX_SAFE_INTEGER;
        if(pa!==pb) return pa-pb;
        return state.rhetLayers.indexOf(a)-state.rhetLayers.indexOf(b);
      }).map(function(r) {
        const tog = r.matched ? ' tp-item-tog" data-lid="' + r.id + '" onclick="tpLayerToggle(\'' + r.id + '\',this)"' : ' tp-item-static"';
        /* 若本課有對應的修辭說明專頁，於此修辭條末端加「詳解 →」連結，點了跳到該頁並可一鍵回課文。 */
        const rMore = (typeof wkFindExplainIdx === 'function' && wkFindExplainIdx('rhet', r.name) >= 0)
          ? '<a class="tp-more" onclick="wkJumpExplain(event,\'rhet\',\'' + String(r.name).replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\')">詳解 →</a>' : '';
        return '<div class="tp-rhet' + tog + '><span class="tp-rt">修辭</span><b>' + r.name + '</b>　' + r.desc + rMore + '</div>';
      }).join('');

      const st = state.styleItems.map(function(r) {
        return '<div class="tp-style"><span class="tp-stk">筆法</span><b>' + r[0] + '</b>　' + r[1] + '</div>';
      }).join('');

      let mn = '';
      if (L.mean) {
        const m0 = state.meanLayers[0], m1 = state.meanLayers[1];
        const tog0 = (m0 && m0.matched) ? ' tp-item-tog" data-lid="' + m0.id + '" onclick="tpLayerToggle(\'' + m0.id + '\',this)"' : ' tp-item-static"';
        mn = '<div class="tp-mean' + tog0 + '><span class="tp-mk">句意</span>' + citeHtml + L.mean + '</div>';
        if (cite2Html && m1) {
          const tog1 = m1.matched ? ' tp-item-tog" data-lid="' + m1.id + '" onclick="tpLayerToggle(\'' + m1.id + '\',this)"' : ' tp-item-static"';
          mn += '<div class="tp-mean tp-mean2' + tog1 + '><span class="tp-mk">句意</span><span class="tp-citetxt">' + L.cite2 + '</span>──' + (L.mean2||'') + '</div>';
        }
      }

      /* 筆法單獨放在段落正文之前；修辭／句意／翻譯／提問維持在正文之後。 */
      const styleBefore = st ? '<div class="tp-style-before">' +
        '<button class="tp-lb tp-lb-s" onclick="tpShow(this,\'s\')">筆法</button>' +
        '<div class="tp-style-before-box tp-box tp-box-s">' + st + '</div>' +
        '</div>' : '';

      const btns = '<div class="tp-lbtns">' +
        (rh ? '<button class="tp-lb tp-lb-r" onclick="tpShow(this,\'r\')">修辭</button>' : '') +
        (mn ? '<button class="tp-lb tp-lb-m" onclick="tpShow(this,\'m\')">句意</button>' : '') +
        (L.tr ? '<button class="tp-lb tp-lb-t" onclick="tpShow(this,\'t\')">翻譯</button>' : '') +
        (L.ask ? '<button class="tp-lb tp-lb-a" onclick="tpShow(this,\'a\')">提問</button>' : '') + '</div>';

      const nt = L.note ? '<span class="tp-src">' + L.note + '</span>' : '';
      const exAfter = (rh || mn || L.tr || L.ask) ? '<div class="tp-extra">' + btns +
        '<div class="tp-exin"><div class="tp-box tp-box-r">' + rh + '</div>' +
        '<div class="tp-box tp-box-m">' + mn + '</div>' +
        '<div class="tp-box tp-box-t">' + (L.tr ? '<div class="tp-tr"><span class="tp-trk">翻譯</span>' + L.tr + '</div>' : '') + '</div>' +
        '<div class="tp-box tp-box-a">' + (L.ask ? '<div class="tp-askbox"><span class="tp-askk">提問</span>' +
          '<ol class="tp-askl">' + L.ask.map(function(q){return '<li>'+q+'</li>';}).join('') + '</ol>' +
          (L.askT ? '<div class="tp-askt"><button class="tp-askb" onclick="this.parentNode.classList.toggle(\'show\')">師</button>' +
            '<div class="tp-asktin">' + L.askT + '</div></div>' : '') + '</div>' : '') + '</div></div></div>' : '';

      return '<div class="tp-line" data-li="' + li + '">' +
        styleBefore + '<div class="tp-text">' + txt + nt + '</div>' + exAfter + '</div>';
    }).join('');
    const st0 = (P.noteStart || 1) - 1;
    const notes = (P.notes || []).map(function(n, i) {
      return '<div class="tp-note" id="tpn-' + i + '"><span class="tp-nn">' + (CIR[st0+i] || (st0+i+1)) +
             '</span><b>' + n[0] + '</b>：' + n[1] + '</div>';
    }).join('');
    const yun = P.yun ? '<div class="tp-yun"><span class="tp-yk">韻腳</span>' + P.yun +
      '<span class="tp-why">世說新語雖是散文，但〈詠絮之才〉的問與答刻意押韻，讀來音節和諧、朗朗上口，也顯示魏晉名士言談講究音律之美，是「言語門」重視語言藝術的表現。</span></div>' : '';
    const tong = P.tong ? '<span class="tp-tong">統測 ' + P.tong + '</span>' : '';
    const qa = (P.qa || []).map(function(q, qi) {
      return '<div class="tp-qa"><div class="tp-q"><span class="tp-qn">' + (qi+1) + '</span>' + q[0] + '</div>' +
             '<div class="tp-abox" onclick="this.classList.toggle(\'show\')"><div class="tp-acov">點此顯示參考答案</div>' +
             '<div class="tp-a"><span class="tp-ak">答</span><div class="tp-atext">' + q[1] + '</div></div></div></div>';
    }).join('');
    return '<div class="wk-slide wks-textpage">' +
      '<div class="tp-top"><div class="tp-title">' + P.title + tong +
        '<span class="tp-sub">' + (P.sub || '') + '</span></div>' +
        '<div class="tp-btns">' +
          '<button class="tp-b tp-b-note" onclick="tpNotes(this)">注釋 ▸</button>' +
          '<button class="tp-b tp-b-duan" onclick="tpPanel(this,\'pian\')">段旨</button>' +
          '<button class="tp-b tp-b-xi" onclick="tpPanel(this,\'xi\')">段析</button>' +
          '<button class="tp-b tp-b-fan" onclick="tpPanel(this,\'fan\')">翻譯</button>' +
          (P.ask ? '<button class="tp-b tp-b-ask" onclick="tpPanel(this,\'ask\')">本段提問</button>' : '') +
          '<button class="tp-b tp-b-ti" onclick="tpPanel(this,\'qa\')">課堂提問</button>' +
        '</div><div class="tp-page">' + P.book + '</div></div>' +
      '<div class="tp-wrap">' +
        '<div class="tp-main">' +
          '<div class="tp-panel" data-k="pian"><span class="tp-pk">段旨</span>' + (P.pian||'') + '</div>' +
          '<div class="tp-panel" data-k="xi"><span class="tp-pk">段析</span>' + (P.xi||'') + '</div>' +
          '<div class="tp-panel" data-k="fan"><span class="tp-pk">翻譯</span>' + (P.fan||'') + '</div>' +
          (P.ask ? '<div class="tp-panel tp-askpanel" data-k="ask"><span class="tp-pk">本段提問</span>' +
            '<ol class="tp-askl">' + P.ask.map(function(q){return '<li>'+q+'</li>';}).join('') + '</ol>' +
            (P.askT ? '<div class="tp-askt"><button class="tp-askb" onclick="this.parentNode.classList.toggle(\'show\')">師</button>' +
              '<div class="tp-asktin">' + P.askT + '</div></div>' : '') + '</div>' : '') +
          '<div class="tp-panel tp-qapanel" data-k="qa"><span class="tp-pk">課堂提問</span>' + qa + '</div>' +
          '<div class="tp-body">' + lines + yun + '</div>' +
        '</div>' +
        '<aside class="tp-side"><div class="tp-side-h">注　釋</div><div class="tp-side-b">' + notes + '</div></aside>' +
      '</div></div>';
  }

  /* ── 基礎練習互動題（逐選項揭曉→出答案）── */
  if (slide.type === 'iquiz') {
    const Q = slide.q;
    const opts = Q.opts.map(function(o, oi) {
      const has = o[2] && o[2].length;
      return '<div class="iq-opt" data-oi="' + oi + '" data-k="' + o[0] + '" onclick="iqOpt(this)">' +
        '<div class="iq-oh"><span class="iq-ok">' + o[0] + '</span>' + o[1] + '</div>' +
        (has ? '<div class="iq-od">' + o[2] + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="wk-slide wks-iquiz" data-ans="' + Q.ans + '" data-tot="' + Q.opts.length + '">' +
      '<div class="iq-top"><span class="iq-tag">基礎練習</span><span class="iq-no">第 ' + Q.n + ' 題 / 共 ' + slide.tot + ' 題</span>' +
      '<button class="iq-all" onclick="iqAll(this)">全部顯示</button></div>' +
      '<div class="iq-q">' + Q.q + '</div>' +
      '<div class="iq-opts">' + opts + '</div>' +
      '<div class="iq-ansbox"><span class="iq-ak">答案</span><span class="iq-av">' + Q.ans + '</span>' +
      '<span class="iq-next">▸ 按 → 進入下一題</span></div>' +
      '<div class="iq-hint">點各選項逐一顯示詳解；全部點完後自動顯示答案</div></div>';
  }
  /* ── 習作（對答案與檢討）── */
  if (slide.type === 'work') {
    const S = slide.sec;
    let body = '';
    if (S.kind === 'table') {
      const th = '<tr>' + S.cols.map(function(c){ return '<th class="jy-th">' + c + '</th>'; }).join('') + '</tr>';
      const tr = S.rows.map(function(r) {
        return '<tr>' + r.map(function(c, ci) {
          return ci === 0 ? '<th class="jy-th wk-fix">' + c + '</th>' : '<td>' + c + '</td>';
        }).join('') + '</tr>';
      }).join('');
      body = (S.note ? '<div class="wk-note">' + S.note + '</div>' : '') +
             '<div class="wk-tblwrap"><table class="jy-table wk-table">' + th + tr + '</table></div>';
    } else if (S.kind === 'quiz' || S.kind === 'read') {
      const items = (S.items || []).map(function(it, ii) {
        const opts = it.opts.map(function(o) {
          return '<div class="wq-opt" data-k="' + o[0] + '" onclick="wqOpt(this)">' +
            '<div class="wq-oh"><span class="wq-ok">' + o[0] + '</span>' + o[1] + '</div>' +
            (o[2] ? '<div class="wq-od">' + o[2] + '</div>' : '') + '</div>';
        }).join('');
        return '<div class="wq-item" data-qno="' + String(it.n == null ? '' : it.n).replace(/"/g,'&quot;') + '" data-ans="' + it.ans + '" data-tot="' + it.opts.length + '">' +
          '<div class="wk-q"><span class="wk-qn">' + it.n + '</span>' + it.q + '</div>' +
          '<div class="wq-opts">' + opts + '</div>' +
          '<button type="button" class="wq-reveal-btn" onclick="wkWorkReveal(this,event)">直接顯示答案</button>' +
          '<div class="wq-ansbox"><span class="wk-ak">答</span><span class="wq-av">' + it.ans + '</span></div></div>';
      }).join('');
      const app = S.appraise ? '<div class="wk-app"><span class="wk-appk">賞析</span>' + S.appraise + '</div>' : '';
      if (S.passage) {
        body = '<div class="aq-wrap"><aside class="aq-psg"><div class="aq-psgh">題　幹</div>' +
          '<div class="aq-psgb">' + S.passage + '</div></aside>' +
          '<div class="aq-main">' + items + app + '</div></div>';
      } else {
        body = items + app;
      }
    }
    return '<div class="wk-slide wks-work">' +
      '<div class="wk-top"><span class="wk-tag">習作Ａ</span><span class="wk-head">' + S.head + '</span></div>' +
      '<div class="wk-body">' + body + '</div></div>';
  }

  /* ── 習作答案總覽：通用生成版 ── */
  if (slide.type === 'work_answers') {
    const W = slide.workbook || {};
    const S = W.sections || [];
    const targets = slide.targets || [];
    const roman = {'壹':'基礎認知站','貳':'進階實力站','參':'挑戰加分站','肆':'補充題組','伍':'其他練習'};

    function escAttr(v){ return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function htmlText(v){ return String(v == null ? '' : v); }
    function qNumFromRow(r, idx){
      for (let j=idx-1;j>=0;j--){
        const t=String(r[j] == null ? '' : r[j]).replace(/<[^>]+>/g,'').trim();
        const m=t.match(/^(?:[（(]\s*)?(\d+)(?:\s*[）).、:]?)?$/);
        if(m) return m[1];
        const m2=t.match(/^[（(]\s*(\d+)\s+/);
        if(m2) return m2[1];
      }
      const all= r.map(function(c){ return String(c==null?'':c).replace(/<[^>]+>/g,'').trim(); });
      const first=all.find(function(t){ return /^\d+$/.test(t); });
      return first || '';
    }
    function pullAnswerChips(sec){
      const out=[];
      (sec.rows||[]).forEach(function(r,ri){
        (r||[]).forEach(function(c,ci){
          const raw=htmlText(c);
          const holder=document.createElement('div'); holder.innerHTML=raw;
          holder.querySelectorAll('.wk-tans .wk-tval').forEach(function(v){
            let q=qNumFromRow(r,ci);
            if(!q){
              const txt=holder.textContent||''; const m=txt.match(/[（(]\s*(\d+)\s*/); if(m) q=m[1];
            }
            out.push({q:q || String(out.length+1), a:v.textContent.trim()});
          });
          holder.querySelectorAll('.jy-blank .jy-blank-ans').forEach(function(v){
            let q=qNumFromRow(r,ci);
            out.push({q:q || String(out.length+1), a:v.textContent.trim()});
          });
          /* 現有少數習作直接用「（1 <b>答案</b>）」嵌在內容中，亦一併抽取。 */
          let m; const re=/[（(]\s*(\d+)\s*<b[^>]*>([\s\S]*?)<\/b>\s*[）)]/g;
          while((m=re.exec(raw))!==null){
            const box=document.createElement('div'); box.innerHTML=m[2];
            out.push({q:m[1], a:box.textContent.trim()});
          }
        });
      });
      if(out.length) return out;
      /* 沒有隱藏答案標記時，依表頭自動找「答案型」欄位。 */
      const cols=(sec.cols||[]).map(function(x){return String(x==null?'':x).replace(/<[^>]+>/g,'').trim();});
      const ansCols=[];
      cols.forEach(function(h,ci){
        if(/^(答案|字音|字形|詞義|詞義\/解釋|注音|國字)$/.test(h)) ansCols.push(ci);
      });
      (sec.rows||[]).forEach(function(r){
        ansCols.forEach(function(ci){
          if(r[ci]==null || r[ci]==='') return;
          const val=String(r[ci]).replace(/<[^>]+>/g,'').trim();
          if(!val || /^[-—]$/.test(val)) return;
          let q=qNumFromRow(r,ci);
          /* 「答案」欄常與題號直接成對出現。 */
          if(!q){
            for(let j=0;j<r.length;j++){
              const t=String(r[j]==null?'':r[j]).replace(/<[^>]+>/g,'').trim();
              if(/^\d+$/.test(t)){ q=t; break; }
            }
          }
          out.push({q:q || String(out.length+1), a:val});
        });
      });
      return out;
    }

    function chipLine(sec){
      const vals=pullAnswerChips(sec);
      if(!vals.length) return '<div class="wk-ao-empty">本區沒有可自動擷取的填答欄位。</div>';
      return '<div class="wk-ao-chipline">' + vals.map(function(x){
        return '<span class="wk-ao-chip"><b>' + escAttr(x.q) + '</b><span>' + x.a + '</span></span>';
      }).join('') + '</div>';
    }

    function majorOf(head){
      const m=String(head||'').match(/^\s*([壹貳參肆伍陸柒捌拾])\s+/);
      return m ? m[1] : '';
    }
    function cleanHead(head){
      return String(head||'').replace(/^\s*[壹貳參肆伍陸柒捌拾]\s+/, '').trim();
    }
    function choiceCards(sec, sectionIndex){
      const items=sec.items||[];
      if(!items.length) return '<div class="wk-ao-empty">本區沒有題目。</div>';
      return '<div class="wk-ao-choice-grid">' + items.map(function(it){
        let target=null;
        for(let ti=0;ti<targets.length;ti++){
          if(targets[ti].slideIdx != null && String(targets[ti].qn)===String(it.n)){ target=targets[ti]; break; }
        }
        /* 同題號在不同 section 重複時，以最近的 section 位置為優先。 */
        const slideIdx=target ? target.slideIdx : '';
        const fn=slideIdx!=='' ? ' onclick="wkWorkAnswerGo(' + slideIdx + ',\'' + String(it.n).replace(/'/g,"\\'") + '\')"' : '';
        return '<button type="button" class="wk-ao-choice"' + fn + '><span class="wk-ao-cqn">' + escAttr(it.n) + '</span><strong>' + escAttr(it.ans) + '</strong></button>';
      }).join('') + '</div>';
    }

    /* 先依主要大題分組，不依賴固定 section 索引。 */
    const groups=[]; let current=null;
    S.forEach(function(sec,si){
      const m=majorOf(sec.head);
      if(m){
        current={roman:m, sections:[]}; groups.push(current);
      }
      if(!current){ current={roman:'', sections:[]}; groups.push(current); }
      current.sections.push({sec:sec, index:si});
    });

    const groupHtml=groups.map(function(g){
      const label=roman[g.roman] || (g.roman ? g.roman : '習作內容');
      const body=g.sections.map(function(x){
        const sec=x.sec;
        const head=cleanHead(sec.head) || sec.title || '';
        if(sec.kind==='quiz' || sec.kind==='read'){
          return '<div class="wk-ao-sub"><div class="wk-ao-subhead">' + head + '</div>' + choiceCards(sec,x.index) + '</div>';
        }
        if(sec.kind==='table'){
          return '<div class="wk-ao-sub"><div class="wk-ao-subhead">' + head + '</div>' + chipLine(sec) + '</div>';
        }
        return '';
      }).join('');
      return '<section class="wk-ao-group wk-ao-generic"><div class="wk-ao-label"><span class="wk-ao-icon">' + (g.roman || '答') + '</span><span>' + label + '</span></div>' + body + '</section>';
    }).join('');

    return '<div class="wk-slide wks-workanswers wk-ao-page">' +
      '<div class="wk-ao-title"><span class="wk-ao-kicker">習作Ａ</span><span>' + (W.title||'') + '｜答案總覽</span></div>' +
      '<div class="wk-ao-desc">填空類直接列答案；選擇題點題號可跳回該題檢討，答案不必再點一次。</div>' +
      groupHtml +
      '</div>';
  }

  /* ── 補充講義 v2（依原講義結構）── */
  if (slide.type === 'hd2') {
    const P = slide.page;
    const rendered = P.blocks.map(function(b) {
      if (b[0] === 'table') {
        const colCount = Math.max(1, ...b[2].map(function(r){ return r.length; }));
        const tableClass = 'jy-table jy-cols-' + Math.min(colCount, 6);
        const rows = b[2].map(function(r, ri) {
          if (r.length === 1) return '<tr><th class="jy-th-full" colspan="' + colCount + '">' + r[0] + '</th></tr>';
          const first = '<th class="jy-th">' + r[0] + '</th>';
          const rest = r.slice(1).map(function(c){
            if (slide.bookKey === '師說') {
              /*
               * 不能用 regex 拆巢狀 <div>：hd-in 裡可能還有可點開的 hd-box，
               * regex 會在第一個 </div> 就提前結束，導致「點此顯示例句／補充」消失。
               * 改用 DOM 層級處理，只格式化真正的 hd-in.hd-eg-in 內容，
               * 完整保留其內部的 hd-box、按鈕與 onclick。
               */
              try {
                const holder = document.createElement('div');
                holder.innerHTML = c;
                holder.querySelectorAll('.hd-in.hd-eg-in').forEach(function(node){
                  node.innerHTML = hdFormatShiShuoExample(node.innerHTML);
                });
                c = holder.innerHTML;
              } catch (e) {
                /* 若瀏覽器 DOM 處理失敗，保留原始內容，不讓補充消失。 */
              }
            }
            return '<td>' + c + '</td>';
          }).join('');
          return '<tr>' + first + rest + '</tr>';
        }).join('');
        return { part: 'psg', html: '<div class="hd-tw"><table class="' + tableClass + ' hd-table">' + rows + '</table></div>' };
      }
      const k = b[1], t = b[2];
      if (k === 'sub')   return { part: 'psg', html: '<div class="hd-sub">' + t + '</div>' };
      if (k === 'mj')    return { part: 'psg', html: '<div class="hd-mj">' + t + '</div>' };
      if (k === 'q')     return { part: 'q', html: '<div class="hd-q">' + t.replace(/^【\s*\(?([A-D])\)?\s*】/,
                            '<span class="hd-ansbox" onclick="this.classList.toggle(\'show\')"><span class="hd-acov">答</span><span class="hd-aval">$1</span></span>') + '</div>' };
      if (k === 'opt')   return { part: 'q', html: '<div class="hd-opt">' + t + '</div>' };
      if (k === 'exp')   return { part: 'q', html: '<div class="hd-box" onclick="this.classList.toggle(\'show\')">' +
        '<div class="hd-cov hd-cov-e">▸ 點此顯示解析</div>' +
        '<div class="hd-in hd-exp"><span class="hd-k hd-k-exp">解析</span>' + t.replace('【解析】','') + '</div></div>' };
      if (k === 'trans') return { part: 'q', html: '<div class="hd-box" onclick="this.classList.toggle(\'show\')">' +
        '<div class="hd-cov hd-cov-t">▸ 點此顯示語譯</div>' +
        '<div class="hd-in hd-trans"><span class="hd-k hd-k-tr">語譯</span>' + t.replace('【語譯】','') + '</div></div>' };
      if (k === 'ans')   return { part: 'q', html: '<div class="hd-ansline">' + t + '</div>' };
      if (k === 'note')  return { part: 'psg', html: '<div class="hd-note">' + t.replace(/^(語譯|釋義)：/, '<b>$1：</b>') + '</div>' };
      /* 'para' 若出現在第一個 q 之前，視為題幹（左欄）的一部分；之後則視為語譯/解析等說明（右欄）*/
      return { part: 'pending', html: '<div class="hd-para">' + t + '</div>' };
    });
    let blocksHtml;
    if (P.layout === 'split') {
      let seenQ = false;
      const psgHtml = [], qHtml = [];
      rendered.forEach(function(r) {
        let part = r.part;
        if (part === 'pending') part = seenQ ? 'q' : 'psg';
        if (part === 'q') seenQ = true;
        (part === 'psg' ? psgHtml : qHtml).push(r.html);
      });
      blocksHtml = '<div class="hd-split"><aside class="hd-split-psg">' + psgHtml.join('') +
        '</aside><div class="hd-split-q">' + qHtml.join('') + '</div></div>';
    } else {
      blocksHtml = rendered.map(function(r){ return r.html; }).join('');
    }
    return '<div class="wk-slide wks-hd2">' +
      '<div class="hd-top"><span class="hd-tag">補充講義</span>' +
      '<span class="hd-title">' + P.title + '</span>' +
      (P.page ? '<span class="hd-page">補充講義 ' + P.page + '</span>' : '') +
      '<button class="jy-toggle-all" onclick="jyToggleAll(this)">顯示全部答案</button></div>' +
      '<div class="hd-body">' + blocksHtml + '</div></div>';
  }

  /* ── A卷：非選擇題（手寫）── */
  if (slide.type === 'ahand') {
    const D = slide.data;
    const secs = D.secs.map(function(sec) {
      const rows = sec.items.map(function(it) {
        return '<tr><th class="jy-th">' + it[0] + '</th><td>' + it[1] + '</td>' +
          '<td><span class="ah-a" onclick="this.classList.toggle(\'show\')">' +
          '<span class="ah-cov">點此顯示答案</span><span class="ah-val">' + it[2] + '</span></span></td></tr>';
      }).join('');
      return '<div class="hd-sub">' + sec.h + '</div>' +
        '<table class="jy-table"><tr><th class="jy-th">題號</th><td>題目</td><td>答案</td></tr>' + rows + '</table>';
    }).join('');
    return '<div class="wk-slide wks-work">' +
      '<div class="as-top"><span class="as-tag">A卷</span><span class="as-title">' + D.title + '</span>' +
      '<button class="as-all" onclick="ahAll(this)">顯示全部答案</button></div>' +
      '<div class="wk-body">' + secs + '</div></div>';
  }
  /* ── A卷：對答案總覽 ── */
  if (slide.type === 'asheet') {
    /* Phase2：依「連續相同 psg」合成題組（≥2 題）；其餘為單題。單題每列 5 題，題組整組不可拆行。 */
    const items = slide.items || [];
    const normP = function(s){ return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ''); };
    const unitHtml = function(q, i){
      return '<span class="as-unit" onclick="asGo(' + i + ')"><span class="as-n">' + q.n + '</span>' +
        '<span class="as-a" onclick="event.stopPropagation();this.classList.toggle(\'show\')">' +
        '<span class="as-cov">?</span><span class="as-val">' + q.ans + '</span></span></span>';
    };
    const units = [];
    for (let i = 0; i < items.length; ) {
      const pg = normP(items[i].psg);
      if (pg) {
        let j = i + 1;
        while (j < items.length && normP(items[j].psg) === pg) j++;
        if (j - i >= 2) { units.push({ type:'grp', list: items.slice(i, j).map(function(q, k){ return { q:q, i:i+k }; }) }); i = j; continue; }
      }
      units.push({ type:'single', q: items[i], i: i });
      i++;
    }
    const rows = [];
    let cur = [], cnt = 0;
    const flush = function(){ if (cur.length){ rows.push('<div class="as-row">' + cur.join('') + '</div>'); cur = []; cnt = 0; } };
    units.forEach(function(u){
      if (u.type === 'grp') {
        flush();
        const inner = u.list.map(function(x){ return unitHtml(x.q, x.i); }).join('');
        rows.push('<div class="as-row"><div class="as-grp">' + inner + '</div></div>');
      } else {
        if (cnt >= 5) flush();
        cur.push(unitHtml(u.q, u.i)); cnt++;
      }
    });
    flush();
    return '<div class="wk-slide wks-asheet">' +
      '<div class="as-top"><span class="as-tag">A卷</span><span class="as-title">對答案</span>' +
      '<button class="as-all" onclick="asAll(this)">顯示全部答案</button></div>' +
      '<div class="as-rows">' + rows.join('') + '</div>' +
      '<div class="as-hint">點題號→跳到該題檢討；點問號→顯示答案；虛線框為題組（不拆行）</div></div>';
  }
  /* ── A卷：逐題檢討 ── */
  if (slide.type === 'aq') {
    const Q = slide.q;
    const opts = Q.opts.map(function(o) {
      const per = (Q.per && Q.per[o[0]]) ? o[0] + ' ' + Q.per[o[0]] : '';
      return '<div class="aq-opt" data-k="' + o[0] + '" onclick="aqOpt(this)">' +
        '<div class="aq-oh"><span class="aq-ok">' + o[0] + '</span>' + o[1] + '</div>' +
        (per ? '<div class="aq-od">' + per + '</div>' : '') + '</div>';
    }).join('');
    const ex = '';
    const tr = Q.trans ? '<div class="aq-trbox" onclick="this.classList.toggle(\'show\')">' +
      '<div class="aq-trcov">▸ 點此顯示語譯</div>' +
      '<div class="aq-trin"><span class="hd-k hd-k-tr">語譯</span>' + Q.trans + '</div></div>' : '';
    const ext = Q.extra ? '<div class="aq-extra">' + Q.extra + '</div>' : '';
    const jump = '<select class="aq-jump" onchange="asGo(this.value)">' +
      Array.from({length: slide.tot}, function(_, i) {
        return '<option value="' + i + '"' + (i===slide.idx?' selected':'') + '>第 ' + (i+1) + ' 題</option>';
      }).join('') + '</select>';
    const hasP = !!Q.psg;
    const imgTip = Q.need_img ? '<div class="aq-imgtip">※ 本題原卷含圖，圖片待補</div>' : '';
    const imgs = (Q.imgs && Q.imgs.length) ? '<div class="aq-imgs' + (Q.imgs.length>1?' multi':'') + '">' +
      Q.imgs.map(function(g){ return '<figure class="aq-fig">' +
        '<img src="' + g[1] + '" alt="' + g[0] + '">' +
        (g[0] ? '<figcaption>（' + g[0] + '）</figcaption>' : '') + '</figure>'; }).join('') + '</div>' : '';
    const sub = Q.extra ? '<div class="aq-subwrap">' + Q.extra + '</div>' : '';
    function pgloss(t){
      return t.replace(/\{g:([^|]*)\|([^}]*)\}/g, function(m,w,d){
        return '<span class="tp-g" onclick="this.classList.toggle(\'show\')">' + w +
               '<span class="tp-gd">' + d + '</span></span>';
      });
    }
    const left = hasP ? '<aside class="aq-psg"><div class="aq-psgh">題　幹</div>' +
      '<div class="aq-psgb">' + pgloss(Q.psg) + '</div>' + imgs + imgTip + '</aside>' : '';
    const app = Q.appraise ? '<div class="wk-app"><span class="wk-appk">賞析</span>' + Q.appraise + '</div>' : '';
    const body = '<div class="aq-main">' +
      '<div class="aq-stem">' + Q.stem + '</div>' + sub + (hasP ? '' : ext + imgs + imgTip) +
      '<div class="aq-opts">' + opts + '</div>' +
      '<div class="aq-ansbox"><span class="iq-ak">答案</span><span class="iq-av">' + Q.ans + '</span></div>' +
      ex + tr + app + '</div>';
    return '<div class="wk-slide wks-aq' + (hasP ? ' has-psg' : '') + '" data-ans="' + Q.ans + '" data-tot="' + Q.opts.length + '">' +
      '<div class="as-top"><span class="as-tag">A卷</span><span class="aq-no">第 ' + Q.n + ' 題 / 共 ' + slide.tot + ' 題</span>' +
      jump + '<button class="as-all" onclick="aqAll(this)">全部顯示</button></div>' +
      '<div class="aq-wrap">' + left + body + '</div></div>';
  }

  /* ── 上課投影片 ── */
  if (slide.type === 'lesson') {
    const L = slide.L;
    const badge = L.time ? '<span class="ls-time">' + L.time + '</span>' : '';
    let body = '';
    if (L.kind === 'cover') {
      body = '<div class="ls-cover"><div class="ls-ct">' + L.title + '</div>' +
             (L.sub ? '<div class="ls-cs">' + L.sub + '</div>' : '') + '</div>';
    } else {
      body = '<div class="ls-title">' + L.title + '</div>';
      if (L.quote) body += '<div class="ls-quote">' + L.quote + '</div>';
      if (L.ask)   body += '<ul class="ls-ask">' + L.ask.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>';
      if (L.points) body += '<ul class="ls-ask">' + L.points.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ul>';
      if (L.board) body += '<div class="ls-board">' + L.board.map(function(x){return '<div class="ls-bl">'+x+'</div>';}).join('') + '</div>';
      if (L.task)  body += '<ol class="ls-task">' + L.task.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ol>';
      if (L.qs)    body += '<ol class="ls-task">' + L.qs.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ol>';
      if (L.spec)  body += '<ol class="ls-task">' + L.spec.map(function(x){return '<li>'+x+'</li>';}).join('') + '</ol>';
      if (L.lines) body += '<div class="ls-lines">' + L.lines.map(function(x){return '<div class="ls-ln">'+x+'</div>';}).join('') + '</div>';
      if (L.items) body += '<div class="ls-menu">' + L.items.map(function(x){return '<span class="ls-chip">'+x+'</span>';}).join('') + '</div>';
      if (L.topic) body += '<div class="ls-topic">' + L.topic + '</div>';
      if (L.cols) {
        body += '<table class="jy-table ls-tbl"><tr>' + L.cols.map(function(c){return '<th class="jy-th">'+c+'</th>';}).join('') + '</tr>' +
          (L.rows||[]).map(function(r){ return '<tr>' + r.map(function(c,i){
            return i===0 ? '<th class="jy-th">'+c+'</th>' : '<td>'+(c||'&nbsp;')+'</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      } else if (L.rows && L.kind === 'outline') {
        body += '<table class="jy-table ls-tbl"><tr><th class="jy-th">段</th><td>要寫什麼</td><td>提示句</td></tr>' +
          L.rows.map(function(r){ return '<tr><th class="jy-th">'+r[0]+'</th><td>'+r[1]+'</td><td class="ls-hintcell">'+r[2]+'</td></tr>'; }).join('') + '</table>';
      }
      if (L.kind === 'key3')  body += LS_KEY3;
      if (L.kind === 'demo1') body += LS_DEMO1;
      if (L.kind === 'demo2') body += LS_DEMO2;
      if (L.kind === 'fill')  body += LS_FILL;
      if (L.kind === 'rubric') body += LS_RUBRIC;
      if (L.sub)  body += '<div class="ls-sub2">' + L.sub + '</div>';
      if (L.hint) body += '<div class="ls-hint">' + L.hint + '</div>';
    }
    const teach = L.teach ? '<div class="ls-teach"><div class="ls-th">教師引導</div>' + L.teach + '</div>' : '';
    return '<div class="wk-slide wks-lesson">' +
      '<div class="ls-top"><span class="ls-sec">' + L.sec + '</span>' + badge +
      '<span class="ls-no">' + L.no + '</span>' +
      (L.teach ? '<button class="ls-tbtn" onclick="lsTeach(this)">師</button>' : '') + '</div>' +
      '<div class="ls-body">' + body + teach + '</div></div>';
  }

  return '<div class="wk-slide"></div>';
}

/* ── 更新畫面 ── */
function wkRenderCurrent() {
  if (!wkSlides.length) return;
  /* 換頁時清空修辭／句意圖層的開啟順序：圖層 id（r0_0、m0_0…）每頁重複使用，
     若沿用上一頁殘留的順序，會使 tpLayerToggle 的加入/移除判斷反轉，造成
     「說明框外框亮但課文未上色」或「未點按鈕卻已上色」的狀態脫節。 */
  window.tpLayerOrder = [];
  const html = wkRenderSlideHTML(wkSlides[wkIdx]);
  const counter = `${wkIdx+1} / ${wkSlides.length}`;

  const area = document.getElementById('wk-slide-area');
  if (area) {
    area.innerHTML = html;
    setTimeout(function(){ if(typeof pianLoad==='function') pianLoad(); if(typeof wkSecMark==='function') wkSecMark(); if(typeof hdMergeTables==='function'){ hdMergeTables(document.getElementById('wk-slide-area')); hdMergeTables(document.getElementById('wkfs-body')); } if(typeof freezeAdaptiveTableWidths==='function'){ freezeAdaptiveTableWidths(document.getElementById('wk-slide-area')); freezeAdaptiveTableWidths(document.getElementById('wkfs-body')); } },30);
    const sl = area.querySelector('.wk-slide');
    if (sl) { sl.classList.remove('mk-ink-in'); void sl.offsetWidth; sl.classList.add('mk-ink-in'); }
  }
  const cnt = document.getElementById('wk-counter');
  if (cnt) cnt.textContent = counter;

  // Update section buttons
  wkSectionMap.forEach(s => {
    document.querySelectorAll('.wk-sec-btn').forEach(b => b.classList.remove('wk-sec-active'));
  });
  const activeSection = [...wkSectionMap].reverse().find(s => s.idx <= wkIdx);
  if (activeSection) {
    document.querySelectorAll('.wk-sec-btn').forEach(b => {
      if (b.dataset.idx == activeSection.idx) b.classList.add('wk-sec-active');
    });
  }

  if (wkProjMode) {
    const fsBody = document.getElementById('wkfs-body');
    if (fsBody) {
      fsBody.innerHTML = html;
      const fsl = fsBody.querySelector('.wk-slide');
      if (fsl) { fsl.classList.remove('mk-ink-in'); void fsl.offsetWidth; fsl.classList.add('mk-ink-in'); }
      if (typeof wkInkSync === 'function') wkInkSync();
    }
    const fsCnt = document.getElementById('wkfs-counter');
    if (fsCnt) fsCnt.textContent = counter;
    const fsTitle = document.getElementById('wkfs-title');
    if (fsTitle) fsTitle.textContent = `〈${wkKey}〉 ${counter}`;
    // Update fullscreen section buttons
    document.querySelectorAll('.wkfs-sec-btn').forEach(b => b.classList.remove('active'));
    if (activeSection) {
      document.querySelectorAll('.wkfs-sec-btn').forEach(b => {
        if (b.dataset.idx == activeSection.idx) b.classList.add('active');
      });
    }
  }
  /* 說明頁若是從課文跳來，注入「⤺ 回課文」；作者/題解頁注入分層與填空。 */
  if (typeof wkInjectReturnBtn === 'function') wkInjectReturnBtn();
  if (typeof wkEnhanceInfoLayers === 'function') wkEnhanceInfoLayers();
}

/* ── 選擇課文 ── */
function showWenxue(key) {
  if (!key) return;
  wkKey = key;
  wkSlides = wkParseSlides(key);
  wkIdx = 0;
  wkSectionMap = wkBuildSections(wkSlides);

  // Sidebar active
  document.querySelectorAll('.wenxue-nav-item').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('wk-nav-' + key);
  if (btn) btn.classList.add('active');

  // Render section jump buttons
  const secEl = document.getElementById('wk-sections');
  if (secEl) {
    secEl.innerHTML = wkSectionMap.map(s =>
      `<button class="wk-sec-btn" data-idx="${s.idx}" onclick="wkGoto(${s.idx})">${s.label}</button>`
    ).join('');
  }

  // Update select
  const sel = document.getElementById('wk-text-select');
  if (sel) sel.value = key;

  wkRenderCurrent();
}

function wkGoto(idx) {
  wkIdx = Math.max(0, Math.min(idx, wkSlides.length - 1));
  const menu = document.getElementById('wkfs-sections');
  const btn = document.getElementById('wkfs-section-toggle');
  if (menu) menu.classList.remove('open');
  if (btn) btn.classList.remove('on');
  wkRenderCurrent();
}

function wkPrev() { if (wkIdx > 0) { wkIdx--; wkRenderCurrent(); } }
/* ── 全螢幕段落選單：浮動顯示，不占課文高度 ── */
function wkToggleSections() {
  const menu = document.getElementById('wkfs-sections');
  const btn = document.getElementById('wkfs-section-toggle');
  if (!menu) return;
  const open = menu.classList.toggle('open');
  if (btn) btn.classList.toggle('on', open);
}

/* ── 全螢幕投影 ── */
function wkOpenProj() {
  if (!wkKey) { alert('請先選擇一篇課文'); return; }
  if (window.wkInkState) { window.wkInkState.active = false; window.wkInkState.drawing = false; }
  wkProjMode = true;
  const fs = document.getElementById('wk-fullscreen');
  fs.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Section buttons in fullscreen header
  const fsSec = document.getElementById('wkfs-sections');
  if (fsSec) {
    fsSec.innerHTML = wkSectionMap.map(s =>
      `<button class="wkfs-sec-btn" data-idx="${s.idx}" onclick="wkGoto(${s.idx})">${s.label}</button>`
    ).join('');
  }
  wkRenderCurrent();
}

function wkNext() { if (wkIdx < wkSlides.length - 1) { wkIdx++; wkRenderCurrent(); } }


/* ════ Apple Pencil / 觸控畫記 ════ */
(function(){
  window.wkInkState = {
    active:false, color:'#c0392b', size:3, drawing:false,
    strokes:{}, current:null, canvas:null, ctx:null, dpr:1
  };
})();
function wkInkKey(){ return String(wkKey || '') + '::' + String(wkIdx); }
function wkInkCurrentStrokes(){
  const st = window.wkInkState;
  const k = wkInkKey();
  if (!st.strokes[k]) st.strokes[k] = [];
  return st.strokes[k];
}
function wkInkSetupCanvas(){
  const st = window.wkInkState;
  const c = document.getElementById('wk-ink-canvas');
  if (!c) return;
  st.canvas = c;
  st.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const rect = c.getBoundingClientRect();
  const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
  c.width = Math.round(w * st.dpr);
  c.height = Math.round(h * st.dpr);
  st.ctx = c.getContext('2d');
  st.ctx.setTransform(st.dpr,0,0,st.dpr,0,0);
  st.ctx.lineCap='round'; st.ctx.lineJoin='round';
  wkInkRedraw();
}
function wkInkRedraw(){
  const st = window.wkInkState;
  const c = st.canvas, ctx = st.ctx;
  if (!c || !ctx) return;
  const rect = c.getBoundingClientRect();
  ctx.clearRect(0,0,rect.width,rect.height);
  const arr = wkInkCurrentStrokes();
  arr.forEach(function(stroke){
    if (!stroke.points || stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color || '#c0392b';
    ctx.lineWidth = stroke.size || 5;
    const p0 = stroke.points[0];
    ctx.moveTo(p0.x * rect.width, p0.y * rect.height);
    for (let i=1;i<stroke.points.length;i++) {
      const p = stroke.points[i];
      ctx.lineTo(p.x * rect.width, p.y * rect.height);
    }
    ctx.stroke();
  });
}
function wkInkPoint(e){
  const st = window.wkInkState, r = st.canvas.getBoundingClientRect();
  return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)), y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};
}
function wkInkToggle(){
  const st = window.wkInkState;
  st.active = !st.active;
  const layer = document.getElementById('wk-ink-layer');
  const btn = document.getElementById('wk-ink-toggle');
  if (layer) layer.classList.toggle('active', st.active);
  if (btn) { btn.classList.toggle('on', st.active); btn.textContent = st.active ? '✎ 關閉畫記' : '✎ 畫記'; }
  const tab = document.getElementById('wk-ink-tab');
  if (tab) tab.classList.toggle('on', st.active);
  if (!st.active) {
    st.drawing = false;
    /* 再次點擊畫記籤頁＝結束畫記：一次清除目前頁面所有畫記（僅記憶體、不做任何持久化） */
    try { const arr = wkInkCurrentStrokes(); if (arr) arr.length = 0; } catch(e){}
    if (typeof wkInkRedraw === 'function') wkInkRedraw();
  }
}
function wkInkColor(btn, color){
  const st = window.wkInkState;
  st.color = color;
  document.querySelectorAll('.wk-ink-color').forEach(function(x){x.classList.remove('on');});
  if (btn) btn.classList.add('on');
}
function wkInkHighlighter(btn){
  const st = window.wkInkState;
  st.color = 'rgba(255,235,59,.48)';
  st.size = 16;
  document.querySelectorAll('.wk-ink-color').forEach(function(x){x.classList.remove('on');});
  if (btn) btn.classList.add('on');
  document.querySelectorAll('.wk-ink-size').forEach(function(x){x.classList.remove('on');});
}
function wkInkSetSize(size){
  window.wkInkState.size = size;
  document.querySelectorAll('.wk-ink-size').forEach(function(x){x.classList.remove('on');});
  const btn = Array.from(document.querySelectorAll('.wk-ink-size')).find(function(x){ return x.getAttribute('onclick') === 'wkInkSetSize(' + size + ')'; });
  if (btn) btn.classList.add('on');
}
function wkInkUndo(){
  const arr = wkInkCurrentStrokes();
  if (arr.length) arr.pop();
  wkInkRedraw();
}
function wkInkClear(){
  const arr = wkInkCurrentStrokes();
  arr.length = 0;
  wkInkRedraw();
}
function wkInkBind(){
  const c = document.getElementById('wk-ink-canvas');
  if (!c || c.dataset.bound) return;
  c.dataset.bound='1';
  const st = window.wkInkState;
  c.addEventListener('pointerdown', function(e){
    if (!st.active || (e.pointerType !== 'pen' && e.pointerType !== 'touch' && e.pointerType !== 'mouse')) return;
    st.drawing = true;
    c.setPointerCapture(e.pointerId);
    const p = wkInkPoint(e);
    st.current = {color:st.color, size:st.size, points:[p]};
    wkInkCurrentStrokes().push(st.current);
    e.preventDefault();
  }, {passive:false});
  c.addEventListener('pointermove', function(e){
    if (!st.active || !st.drawing || !st.current) return;
    const p = wkInkPoint(e);
    const pts = st.current.points;
    const last = pts[pts.length-1];
    const dx = p.x-last.x, dy=p.y-last.y;
    if ((dx*dx+dy*dy) < 0.000005) return;
    pts.push(p);
    wkInkRedraw();
    e.preventDefault();
  }, {passive:false});
  const end = function(e){
    if (!st.drawing) return;
    st.drawing=false; st.current=null;
    if (c.hasPointerCapture && c.hasPointerCapture(e.pointerId)) c.releasePointerCapture(e.pointerId);
    if (e && e.preventDefault) e.preventDefault();
  };
  c.addEventListener('pointerup', end, {passive:false});
  c.addEventListener('pointercancel', end, {passive:false});
  c.addEventListener('pointerleave', function(e){ if (st.drawing && e.pointerType === 'mouse') end(e); }, {passive:false});
}
function wkInkSync(){
  wkInkBind();
  requestAnimationFrame(function(){ wkInkSetupCanvas(); });
}
window.addEventListener('resize', function(){ if (window.wkInkState && window.wkInkState.canvas) wkInkSetupCanvas(); });

/* ── 全螢幕投影 ── */
function wkCloseProj() {
  if (window.wkInkState) { window.wkInkState.active = false; window.wkInkState.drawing = false; }
  const inkLayer = document.getElementById('wk-ink-layer');
  const inkBtn = document.getElementById('wk-ink-toggle');
  if (inkLayer) inkLayer.classList.remove('active');
  if (inkBtn) { inkBtn.classList.remove('on'); inkBtn.textContent = '✎ 畫記'; }
  wkProjMode = false;
  const fs = document.getElementById('wk-fullscreen');
  fs.style.display = 'none';
  document.body.style.overflow = '';
}

/* ── 朗讀頁螢光筆：‹‹...›› → highlight span ── */
function wkHighlight(html) {
  if (!html) return '';
  return html.replace(/\u2039\u2039(.+?)\u203a\u203a/g, '<span class="wks-hl">$1</span>');
}

/* 螢光筆顯示/隱藏切換（朗讀時可先關，講到重點再開） */
function wkToggleHL(btn) {
  const slide = btn.closest('.wk-slide');
  if (!slide) return;
  slide.classList.toggle('wks-hl-on');
  btn.classList.toggle('active');
}
/* 補充講義：一次顯示／隱藏全部填空答案 */
function jyToggleAll(btn) {
  const slide = btn.closest('.wk-slide');
  if (!slide) return;
  const blanks = slide.querySelectorAll('.jy-blank');
  const anyHidden = Array.from(blanks).some(b => !b.classList.contains('show'));
  blanks.forEach(b => b.classList.toggle('show', anyHidden));
  btn.textContent = anyHidden ? '隱藏全部答案' : '顯示全部答案';
}

/* ═══════════ 課文 ↔ 說明頁 導覽（跳說明頁後一鍵回課文原句） ═══════════ */
window.wkReturnTo = null;
/* 取修辭／字的「基底名稱」：去掉括號補述與空白，方便課文標記與說明頁互相對應。 */
function wkBaseName(s){ return String(s == null ? '' : s).replace(/[（(【].*$/, '').replace(/[\s　]/g, '').trim(); }
/* 依修辭名稱或字，在目前課次的投影片中找到對應說明頁的索引；找不到回 -1。 */
function wkFindExplainIdx(kind, keyword){
  if (!wkSlides || !wkSlides.length) return -1;
  const kw = wkBaseName(keyword);
  if (!kw) return -1;
  for (let i = 0; i < wkSlides.length; i++){
    const s = wkSlides[i];
    if (kind === 'rhet' && (s.type === 'keyrhet' || s.type === 'rhet_table' || s.type === 'rhet_text')){
      const nm = wkBaseName(s.name);
      if (nm && (nm === kw || nm.indexOf(kw) >= 0 || kw.indexOf(nm) >= 0)) return i;
    }
    if (kind === 'char' && s.type === 'charbian'){
      const nm = wkBaseName(s.name);
      if (nm && (nm === kw || nm.indexOf(kw) >= 0 || kw.indexOf(nm) >= 0)) return i;
    }
  }
  /* 字義找不到專頁時，退而找含此字的互動形音義辨析頁。 */
  if (kind === 'char'){
    for (let i = 0; i < wkSlides.length; i++){
      const s = wkSlides[i];
      if (s.type === 'charquiz'){
        try { if (JSON.stringify(s.data || '').indexOf(keyword) >= 0) return i; } catch(e){}
      }
    }
  }
  return -1;
}
/* 從課文點連結跳到說明頁，並記住來源課文頁與被點的句子（data-li）。 */
function wkJumpExplain(ev, kind, keyword){
  if (ev && ev.stopPropagation) ev.stopPropagation();
  const idx = wkFindExplainIdx(kind, keyword);
  if (idx < 0) return;
  let li = null;
  try { const ln = ev && ev.target && ev.target.closest ? ev.target.closest('.tp-line') : null; if (ln) li = ln.getAttribute('data-li'); } catch(e){}
  window.wkReturnTo = { idx: wkIdx, li: li };
  wkGoto(idx);
}
/* 一鍵回到原本的課文頁，並捲動、短暫高亮原句。 */
function wkReturnToText(){
  const rt = window.wkReturnTo;
  if (!rt) return;
  window.wkReturnTo = null;
  wkGoto(rt.idx);
  if (rt.li != null){
    setTimeout(function(){
      const el = document.querySelector('#wk-slide-area .tp-line[data-li="' + rt.li + '"]') ||
                 document.querySelector('.tp-line[data-li="' + rt.li + '"]');
      if (el){ el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('tp-line-flash'); setTimeout(function(){ el.classList.remove('tp-line-flash'); }, 1700); }
    }, 100);
  }
}
/* 在說明頁頂端注入「⤺ 回課文」按鈕；僅當是從課文跳來時才出現。 */
function wkInjectReturnBtn(){
  if (!window.wkReturnTo) return;
  const EXPL = ['wks-keyrhet','wks-charbian','wks-charquiz','wks-rhet-table'];
  document.querySelectorAll('#wk-slide-area .wk-slide, #wkfs-body .wk-slide').forEach(function(sl){
    if (!EXPL.some(function(c){ return sl.classList.contains(c); })) return;
    if (sl.querySelector('.wk-return-text')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'wk-return-text'; b.textContent = '⤺ 回課文';
    b.setAttribute('onclick', 'wkReturnToText()');
    sl.insertBefore(b, sl.firstChild);
  });
}

/* ═══════════ 作者／題解：同一頁分層（課本正文 / 補充 / 填空練習） ═══════════ */
/* 各資訊頁（依完整標籤精確對應）要併入的補充講義頁標題（子字串比對）。僅師說試作。 */
const WK_FILL_MAP = {
  '師說': {
    '作者·課本': ['作者與題解', '古文運動發展簡史', '韓愈與柳宗元比較'],
    '題解·課本': ['作者與題解', '文體簡介'],
    '題解·文體': ['文體簡介'],
    '作者·補充': ['駢文流變', '駢文、散文之比較']
  }
};
/* 將一個補充講義區塊渲染成 HTML（表格保留原本的 jy-blank 填空）。 */
function wkRenderFillBlock(b){
  if (b[0] === 'table'){
    const rows = b[2];
    const colCount = Math.max(1, ...rows.map(function(r){ return r.length; }));
    const cls = 'jy-table jy-cols-' + Math.min(colCount, 6);
    const trs = rows.map(function(r){
      if (r.length === 1) return '<tr><th class="jy-th-full" colspan="' + colCount + '">' + r[0] + '</th></tr>';
      return '<tr><th class="jy-th">' + r[0] + '</th>' + r.slice(1).map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="hd-tw"><table class="' + cls + ' hd-table">' + trs + '</table></div>';
  }
  const k = b[1], t = b[2];
  if (k === 'sub')  return '<div class="hd-sub">' + t + '</div>';
  if (k === 'mj')   return '<div class="hd-mj">' + t + '</div>';
  if (k === 'note') return '<div class="hd-note">' + t + '</div>';
  return '<div class="hd-para">' + t + '</div>';
}
/* 依資訊頁標籤，組出對應補充講義的「填空練習」面板 HTML；無對應則回空字串。 */
function wkBuildFillHTML(bookKey, label){
  const map = WK_FILL_MAP[bookKey]; if (!map) return '';
  const wanted = map[label]; if (!wanted || !wanted.length) return '';
  const data = (TEXTBOOK[bookKey] || {}).handoutV2 || []; if (!data.length) return '';
  const seen = {};
  const parts = [];
  data.forEach(function(p){
    const hit = wanted.some(function(w){ return (p.title || '').indexOf(w) >= 0; });
    if (!hit || seen[p.title]) return;
    seen[p.title] = 1;
    const body = (p.blocks || []).map(wkRenderFillBlock).join('');
    parts.push('<div class="wk-fill-sec"><div class="hd-sub">' + p.title +
      (p.page ? '　<span style="font-weight:400;opacity:.65">補充講義 ' + p.page + '</span>' : '') +
      '</div>' + body + '</div>');
  });
  if (!parts.length) return '';
  return '<div class="wk-fill-panel" hidden>' +
    '<div class="wk-fill-h"><span class="wk-fill-title">✎ 補充講義 · 對應填空</span>' +
    '<button class="jy-toggle-all" onclick="jyToggleAll(this)">顯示全部答案</button>' +
    '<span style="font-size:13px;opacity:.7">點空格逐一顯示；右側按鈕一次全開／全隱</span></div>' +
    parts.join('') + '</div>';
}
/* 在師說作者／題解頁注入「課本正文 / 補充 / 填空練習」分層切換與填空面板。 */
function wkEnhanceInfoLayers(){
  document.querySelectorAll('#wk-slide-area .wks-shishuo-info, #wkfs-body .wks-shishuo-info').forEach(function(slide){
    if (slide.querySelector('.wk-layerbar')) return;
    const badge = slide.querySelector('.wks-section-badge');
    const label = badge ? badge.textContent.trim() : '';
    const map = WK_FILL_MAP['師說'] || {};
    const hasSup = !!slide.querySelector('.sp-w, .sp-box');
    const fillHTML = wkBuildFillHTML('師說', label);
    /* 僅處理有對應填空、或本身有補充詞的作者／題解頁；其餘頁面維持原樣。 */
    if (!(label in map) && !fillHTML) return;
    const body = slide.querySelector('.wks-info-body');
    const wrap = slide.querySelector('.wks-info-wrap');
    if (!body || !wrap) return;
    const bar = document.createElement('div');
    bar.className = 'wk-layerbar';
    bar.innerHTML =
      '<button type="button" class="wk-layer-btn on" data-layer="book">課本正文</button>' +
      (hasSup ? '<button type="button" class="wk-layer-btn" data-layer="sup">補充</button>' : '') +
      (fillHTML ? '<button type="button" class="wk-layer-btn" data-layer="fill">填空練習</button>' : '');
    wrap.parentElement.insertBefore(bar, wrap);
    if (fillHTML){ const holder = document.createElement('div'); holder.innerHTML = fillHTML; if (holder.firstChild) wrap.appendChild(holder.firstChild); }
    bar.addEventListener('click', function(ev){
      const btn = ev.target.closest('.wk-layer-btn'); if (!btn) return;
      const layer = btn.getAttribute('data-layer');
      if (layer === 'book'){ btn.classList.toggle('on'); body.style.display = btn.classList.contains('on') ? '' : 'none'; }
      else if (layer === 'sup'){ btn.classList.toggle('on'); const on = btn.classList.contains('on');
        slide.querySelectorAll('.sp-box').forEach(function(x){ x.classList.toggle('show', on); });
        slide.querySelectorAll('.sp-w').forEach(function(x){ x.classList.toggle('on', on); }); }
      else if (layer === 'fill'){ btn.classList.toggle('on'); const p = slide.querySelector('.wk-fill-panel'); if (p) p.hidden = !btn.classList.contains('on'); }
    });
  });
}

/* ── 全螢幕字級控制 ── */
function wkFontUp() {
  const curr = parseFloat(document.documentElement.style.getPropertyValue('--base-size')) ||
               parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 15;
  const n = Math.min(curr + 2, 44);
  setBaseSize(n);
}

function wkFontDown() {
  const curr = parseFloat(document.documentElement.style.getPropertyValue('--base-size')) ||
               parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 15;
  const n = Math.max(curr - 2, 12);
  setBaseSize(n);
}

/* ── 初始化分頁 ── */
function initWenxuePage() {
  const list14 = document.getElementById('wenxue-list');
  if (!list14 || list14.dataset.init) return;
  list14.dataset.init = '1';

  list14.innerHTML = WK_14.map(k =>
    `<button class="wenxue-nav-item" id="wk-nav-${k}" onclick="showWenxue('${k}')">${k}</button>`
  ).join('');

  const listEx = document.getElementById('wenxue-extra-list');
  if (listEx) {
    listEx.innerHTML = WK_EXTRA.filter(k => TEXTBOOK[k]).map(k =>
      `<button class="wenxue-nav-item wenxue-nav-extra" id="wk-nav-${k}" onclick="showWenxue('${k}')">${k}</button>`
    ).join('');
  }

  const listProse = document.getElementById('wenxue-prose-list');
  if (listProse) {
    listProse.innerHTML = WK_PROSE.filter(k => TEXTBOOK[k]).map(k =>
      `<button class="wenxue-nav-item" id="wk-nav-${k}" onclick="showWenxue('${k}')">${k}</button>`
    ).join('');
  }

  const sel = document.getElementById('wk-text-select');
  if (sel) {
    sel.innerHTML = '<option value="">── 選擇課文 ──</option>' +
      WK_14.map(k => `<option value="${k}">${k}</option>`).join('') +
      WK_EXTRA.filter(k => TEXTBOOK[k]).map(k => `<option value="${k}">▸ ${k}</option>`).join('') +
      WK_PROSE.filter(k => TEXTBOOK[k]).map(k => `<option value="${k}">📝 ${k}</option>`).join('');
  }

  /* 進度功能在獨立站省略 */
}

/* ════════ 初始化 ════════ */
window.addEventListener('load', function() {
  initWenxuePage();
  try {
    const m = localStorage.getItem('site_mode'); if (m) setMode(m);
    if (localStorage.getItem('dark_mode') === '1') document.body.classList.add('dark-mode');
    const bs = localStorage.getItem('base_size'); if (bs) document.documentElement.style.setProperty('--base-size', bs);
  } catch(e) {}
  syncFontControl();
  syncDisplayDark();
  if (typeof freezeAdaptiveTableWidths === 'function') freezeAdaptiveTableWidths(document);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') wkNext();
    else if (e.key === 'ArrowLeft') wkPrev();
    else if (e.key === 'Escape' && wkProjMode) wkCloseProj();
  });
});

