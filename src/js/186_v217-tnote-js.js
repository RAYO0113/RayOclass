(function () {
  'use strict';
  /* ── V217（老師 11/9）講稿同步：平板投影翻頁 → 手機講稿（RayOclass/tn/）跟著跳 ──
     ・換頁（wkRenderCurrent）後 0.6 秒，把「目前哪一課、第幾頁、頁面代號」送到 Apps Script（liveSet，gr-21 起）。
     ・只送位置，不送任何講稿內容；講稿本身加密放在 tn/，投影畫面上看不到、也沒有任何按鈕。
     ・要有登記密碼（同成績系統／雲端同步，gr_pw_v1）才送；沒登入就什麼都不做。
     ・頁面代號 sid()：課文頁＝seg:第三段；說明頁＝info:<label>；練習題＝q:<題號>；其他＝<type>:<label>。
       手機講稿用同一套代號對應提醒（見 tn/index.html 的 sid 說明）。 */
  var GS_URL = 'https://script.google.com/macros/s/AKfycbxfJoT1iS5tIzXtShetthjspMQ-yUwgUkiPfWc2nBEDNwYgs49u87eKvAJo5x73k7K1/exec';   /* 同 v106／v107 */
  var OFF_K = 'tn_sync_off_v1';   /* 設成 "1" 就停止送出（這台裝置） */
  function jget(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function url() { return jget('gr_url_v1', '') || GS_URL; }
  function pw() { var p = ''; try { p = sessionStorage.getItem('gr_pw_v1') || ''; } catch (e) {} return p || jget('gr_pw_v1', '') || ''; }

  function sid(s) {
    if (!s) return '';
    switch (s.type) {
      case 'textpage': return 'seg:' + ((s.page && s.page.seg) || '');
      case 'info': return 'info:' + (s.label || s.head || '');
      case 'kzsec': return 'sec:' + ((s.sec && s.sec.title) || '');
      case 'iquiz': return 'q:' + (s.q && s.q.n);
      /* V223（老師 11/10「能同步到課後習題、習作、A卷講解嗎」）：這幾種頁面各自有代號，手機顯示該頁題目＋答案＋解析 */
      case 'iadv': return 'iadv:' + ((s.sec && s.sec.head) || '');
      case 'work': return 'work:' + ((s.sec && s.sec.head) || '') + (s.item ? '|' + s.item.n : '');   /* V243：習作選擇題一題一頁 → |題號 */
      case 'work_answers': return 'work_answers:';
      case 'aq': return 'aq:' + (s.q && s.q.n);
      case 'asheet': return 'asheet:';
      case 'ahand': return 'ahand:';
      /* V232（老師 11/11「手機版補充的地方怎麼沒有跟上」）：補充講義、字義辨析、修辭、修辭總表、問題、統測題原本代號都是空的
         （14 張補充講義全叫 hd2:），手機分不出哪一張 → 改送它在課文資料裡的序號（0 起算），手機照序號畫出那一頁 */
      case 'hd2': return 'hd2:' + dataIdx(function (d) { return d.handoutV2 || []; }, function (p) { return p === s.page; });
      case 'charbian': return 'charbian:' + dataIdx(function (d) { return flat(d.charBian); }, function (p) { return p.body === s.body; });
      case 'keyrhet': return 'keyrhet:' + dataIdx(function (d) { return flat(d.keyRhetoric); }, function (p) { return p.body === s.body; });
      case 'rhet_table': return 'rhet_table:' + dataIdx(function (d) { return (d.rhetTable && d.rhetTable.pages) || []; }, function (p) { return p.body === s.body; });
      case 'question': return 'question:' + dataIdx(function (d) { return (d.extras && d.extras.questions) || []; }, function (p) { return p.q === s.q; });
      case 'exam': return 'exam:' + dataIdx(function (d) { return (d.extras && d.extras.exams) || []; }, function (p) { return p.stem === s.stem; });
      default: return s.type + ':' + (s.label || s.title || s.head || '');
    }
  }
  function flat(arr) { var o = []; (arr || []).forEach(function (x) { (x.pages || []).forEach(function (p) { o.push(p); }); }); return o; }
  function dataIdx(listOf, hit) {
    var d = (typeof TEXTBOOK !== 'undefined' && typeof wkKey !== 'undefined') ? TEXTBOOK[wkKey] : null; if (!d) return '';
    var a = listOf(d); for (var i = 0; i < a.length; i++) if (hit(a[i])) return String(i);
    return '';
  }
  /* V232：同名說明頁（〈侍坐〉三張「賞析」、〈桃花源記〉兩張「作者·生平概覽」）第 2 張起加 |1、|2…；第 1 張代號不變（舊講稿 anchors 照用） */
  function sidN(s) {
    var id = sid(s);
    if (!s || s.type !== 'info' || typeof wkSlides === 'undefined') return id;
    var n = 0, at = wkSlides.indexOf(s);
    for (var i = 0; i < at; i++) if (wkSlides[i] && wkSlides[i].type === 'info' && sid(wkSlides[i]) === id) n++;
    return n ? id + '|' + n : id;
  }
  var TYPE_NAME = { cover: '封面', aq: 'A卷', ahand: 'A卷', asheet: 'A卷', work: '習作', work_answers: '習作答案', hd2: '補充講義',
    iadv: '進階練習', question: '提問', exam: '考題', structure: '結構', keyrhet: '修辭', rhet_table: '修辭表', t13anim: '十三經' };
  function head(s) {
    if (!s) return '';
    if (s.type === 'iquiz' && s.q) return '練習 第 ' + s.q.n + ' 題';
    if (s.type === 'aq' && s.q) return 'A卷 第 ' + s.q.n + ' 題';
    if (s.type === 'work' && s.item) return '習作 第 ' + s.item.n + ' 題　' + String(s.sec.head || '').replace(/[（(]每[題格答][^）)]*[）)]/g, '').slice(0, 40);   /* V243 */
    if ((s.type === 'work' || s.type === 'iadv') && s.sec) return String(s.sec.head || '').slice(0, 60);
    if (s.type === 'work_answers') return '習作答案總覽';
    return String(s.head || (s.page && (s.page.title || s.page.seg)) || (s.sec && s.sec.title) || s.label || s.title || TYPE_NAME[s.type] || s.type || '').slice(0, 60);
  }

  var timer = 0, lastSent = '', busy = false, again = false, curLi = -1, doneCb = null, retryN = 0, retrySig = '', retryT = 0;
  /* V231（老師 11/10「我點提問，手機要直接跳到提問的地方；點到哪手機都要迅速對應」）：
     代號後面再加「點了什麼」：@題號（.gd[data-gq] 提問）、@end（本段統整框）、~m／~r／~t／~a／~s（句意／修辭／翻譯／提問／筆法按鈕）。
     點提問立刻送（不等 0.3 秒）。 */
  var curTag = '';
  function tagOf(t) {
    var g = t.closest('.gd[data-gq]'); if (g) return '@' + g.getAttribute('data-gq');
    var b = t.closest('.tp-lb'); if (b) { var m = b.className.match(/tp-lb-([a-z])/); if (m) return '~' + m[1]; }
    if (t.closest('.tp-sumbox')) return '@end';
    return '';
  }
  function send() {
    if (jget(OFF_K, 0) == 1 || !pw() || typeof wkKey === 'undefined') return;
    if (document.hidden) return;   /* V268：背景分頁（另一個分頁、別台忘了關的）不送，才不會把手機拉走；回到前景時 visibilitychange 會補送 */
    var k = wkKey;
    if (!k || typeof wkSlides === 'undefined' || !wkSlides.length) return;
    var s = wkSlides[wkIdx];
    var id = sidN(s); if (curLi >= 0 && s && s.type === 'textpage') id += '#' + curLi;   /* V219：點到第幾句（手機捲到那句） */
    if (curTag) id += curTag;   /* V231 */
    var pos = { k: String(k), i: wkIdx, n: wkSlides.length, id: id, h: head(s) };
    /* V258：長卷頁（type yf）的代號與頁名由 196 提供（yf:<長卷頁代號>#<第幾步>） */
    var ext = null; try { ext = window.V217TN_EXT ? window.V217TN_EXT(s) : null; } catch (e) {}
    if (ext && ext.id) { pos.id = String(ext.id); if (ext.h) pos.h = String(ext.h); }
    /* V268（老師 11/25「手機講稿加上預覽模式，我想先知道下一頁是什麼」）：下一頁的代號接在頁名後面（⟫ 分隔；Apps Script 只存 k/i/n/id/h，h 上限 80 字，不用改後台）。
       長卷、畫卷頁不接（畫卷由手機照步驟表自己算）。代號太長就只送下一頁名稱（~開頭，手機只顯示名稱、不預覽） */
    else if (wkSlides[wkIdx + 1]) { var nxs = wkSlides[wkIdx + 1], nid = sidN(nxs), hh = pos.h.slice(0, 26);
      pos.h = hh + '⟫' + (nid.length <= 79 - hh.length - 1 ? nid : ('~' + head(nxs)).slice(0, 79 - hh.length - 1)); }
    var sig = JSON.stringify(pos);
    if (sig === lastSent) return;
    if (busy) { again = true; return; }
    busy = true;
    /* V268（老師 11/25「有時候沒跟著平板」）：原本送失敗（學校網路斷一下、Google 忙）就不再送，要等下一次翻頁 → 失敗 2 秒後自動重送（同一個位置最多 5 次）；
       一次最多等 8 秒，卡住的請求不再擋住後面的翻頁 */
    var ac = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ac) ac.abort(); }, 8000), ok = false, noAuth = false;
    fetch(url(), { method: 'POST', body: JSON.stringify({ action: 'liveSet', pw: pw(), pos: pos }), redirect: 'follow', signal: ac ? ac.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (r) { ok = !!(r && r.ok); if (ok) lastSent = sig; if (doneCb) { doneCb(ok); doneCb = null; } if (r && r.auth === false) noAuth = true; })
      .catch(function () { if (doneCb) { doneCb(false); doneCb = null; } })
      .then(function () { clearTimeout(to); busy = false;
        if (again) { again = false; retryN = 0; send(); return; }
        if (!ok && !noAuth) { if (retrySig !== sig) { retrySig = sig; retryN = 0; } if (++retryN <= 5) { clearTimeout(retryT); retryT = setTimeout(send, 2000); } } });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(send, 600); }

  function hook() {
    if (typeof wkRenderCurrent !== 'function' || wkRenderCurrent._v217) return;
    var r0 = wkRenderCurrent;
    wkRenderCurrent = function () { var v = r0.apply(this, arguments); try { curLi = -1; curTag = ''; soon(); } catch (e) {} return v; };
    wkRenderCurrent._v217 = true;
  }
  hook();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  window.addEventListener('load', hook);
  /* V219：課文頁點了某一句（句子本身或它的修辭／句意／翻譯／提問按鈕）→ 送句子序號，手機捲到那一句 */
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    if (!t.closest('#wk-slide-area, #wkfs-body')) return;
    var ln = t.closest('.tp-line'), tag = tagOf(t);   /* V231：句子以外（本段統整框、課後延伸頁）的提問也送 */
    if (!ln && !tag) return;
    var li = ln ? parseInt(ln.getAttribute('data-li'), 10) : -1; if (isNaN(li)) return;
    if (li === curLi && tag === curTag) return;
    curLi = li; curTag = tag; clearTimeout(timer);
    if (tag) send(); else timer = setTimeout(send, 100);
  }, true);
  /* 回到這個分頁時補送一次（手機可能剛打開） */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { lastSent = ''; soon(); } });
  window.V217TN = { sid: sidN, send: function () { lastSent = ''; send(); },
    now: function () { clearTimeout(timer); send(); },   /* V258：長卷每一步立刻送（內容沒變就不送） */
    /* V222：句首小點強制送這一句（就算剛剛點過，手機可能已被滑走）；cb(ok) 給小點閃綠／紅 */
    sendLine: function (li, cb) { curLi = li; curTag = ''; lastSent = ''; clearTimeout(timer); doneCb = cb || null; send(); },
    on: function () { return jget(OFF_K, 0) != 1 && !!pw(); } };
})();
