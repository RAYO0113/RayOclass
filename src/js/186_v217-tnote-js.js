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
      case 'work': return 'work:' + ((s.sec && s.sec.head) || '');
      case 'work_answers': return 'work_answers:';
      case 'aq': return 'aq:' + (s.q && s.q.n);
      case 'asheet': return 'asheet:';
      case 'ahand': return 'ahand:';
      default: return s.type + ':' + (s.label || s.title || s.head || '');
    }
  }
  var TYPE_NAME = { cover: '封面', aq: 'A卷', ahand: 'A卷', asheet: 'A卷', work: '習作', work_answers: '習作答案', hd2: '補充講義',
    iadv: '進階練習', question: '提問', exam: '考題', structure: '結構', keyrhet: '修辭', rhet_table: '修辭表', t13anim: '十三經' };
  function head(s) {
    if (!s) return '';
    if (s.type === 'iquiz' && s.q) return '練習 第 ' + s.q.n + ' 題';
    if (s.type === 'aq' && s.q) return 'A卷 第 ' + s.q.n + ' 題';
    if ((s.type === 'work' || s.type === 'iadv') && s.sec) return String(s.sec.head || '').slice(0, 60);
    if (s.type === 'work_answers') return '習作答案總覽';
    return String(s.head || (s.page && (s.page.title || s.page.seg)) || (s.sec && s.sec.title) || s.label || s.title || TYPE_NAME[s.type] || s.type || '').slice(0, 60);
  }

  var timer = 0, lastSent = '', busy = false, again = false, curLi = -1, doneCb = null;
  function send() {
    if (jget(OFF_K, 0) == 1 || !pw() || typeof wkKey === 'undefined') return;
    var k = wkKey;
    if (!k || typeof wkSlides === 'undefined' || !wkSlides.length) return;
    var s = wkSlides[wkIdx];
    var id = sid(s); if (curLi >= 0 && s && s.type === 'textpage') id += '#' + curLi;   /* V219：點到第幾句（手機捲到那句） */
    var pos = { k: String(k), i: wkIdx, n: wkSlides.length, id: id, h: head(s) };
    var sig = JSON.stringify(pos);
    if (sig === lastSent) return;
    if (busy) { again = true; return; }
    busy = true;
    fetch(url(), { method: 'POST', body: JSON.stringify({ action: 'liveSet', pw: pw(), pos: pos }), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) lastSent = sig; if (doneCb) { doneCb(!!(r && r.ok)); doneCb = null; } })
      .catch(function () { if (doneCb) { doneCb(false); doneCb = null; } })
      .then(function () { busy = false; if (again) { again = false; send(); } });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(send, 600); }

  function hook() {
    if (typeof wkRenderCurrent !== 'function' || wkRenderCurrent._v217) return;
    var r0 = wkRenderCurrent;
    wkRenderCurrent = function () { var v = r0.apply(this, arguments); try { curLi = -1; soon(); } catch (e) {} return v; };
    wkRenderCurrent._v217 = true;
  }
  hook();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  window.addEventListener('load', hook);
  /* V219：課文頁點了某一句（句子本身或它的修辭／句意／翻譯／提問按鈕）→ 送句子序號，手機捲到那一句 */
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var ln = t.closest('.tp-line'); if (!ln || !ln.closest('#wk-slide-area, #wkfs-body')) return;
    var li = parseInt(ln.getAttribute('data-li'), 10); if (isNaN(li) || li === curLi) return;
    curLi = li; clearTimeout(timer); timer = setTimeout(send, 300);
  }, true);
  /* 回到這個分頁時補送一次（手機可能剛打開） */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { lastSent = ''; soon(); } });
  window.V217TN = { sid: sid, send: function () { lastSent = ''; send(); },
    /* V222：句首小點強制送這一句（就算剛剛點過，手機可能已被滑走）；cb(ok) 給小點閃綠／紅 */
    sendLine: function (li, cb) { curLi = li; lastSent = ''; clearTimeout(timer); doneCb = cb || null; send(); },
    on: function () { return jget(OFF_K, 0) != 1 && !!pw(); } };
})();
