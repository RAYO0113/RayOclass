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
      default: return s.type + ':' + (s.label || s.title || s.head || '');
    }
  }
  var TYPE_NAME = { cover: '封面', aq: 'A卷', ahand: 'A卷', asheet: 'A卷', work: '習作', work_answers: '習作答案', hd2: '補充講義',
    iadv: '進階練習', question: '提問', exam: '考題', structure: '結構', keyrhet: '修辭', rhet_table: '修辭表', t13anim: '十三經' };
  function head(s) {
    if (!s) return '';
    if (s.type === 'iquiz' && s.q) return '練習 第 ' + s.q.n + ' 題';
    return String(s.head || (s.page && (s.page.title || s.page.seg)) || (s.sec && s.sec.title) || s.label || s.title || TYPE_NAME[s.type] || s.type || '').slice(0, 60);
  }

  var timer = 0, lastSent = '', busy = false, again = false;
  function send() {
    if (jget(OFF_K, 0) == 1 || !pw() || typeof wkKey === 'undefined') return;
    var k = wkKey;
    if (!k || typeof wkSlides === 'undefined' || !wkSlides.length) return;
    var s = wkSlides[wkIdx];
    var pos = { k: String(k), i: wkIdx, n: wkSlides.length, id: sid(s), h: head(s) };
    var sig = JSON.stringify(pos);
    if (sig === lastSent) return;
    if (busy) { again = true; return; }
    busy = true;
    fetch(url(), { method: 'POST', body: JSON.stringify({ action: 'liveSet', pw: pw(), pos: pos }), redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) lastSent = sig; })
      .catch(function () {})
      .then(function () { busy = false; if (again) { again = false; send(); } });
  }
  function soon() { clearTimeout(timer); timer = setTimeout(send, 600); }

  function hook() {
    if (typeof wkRenderCurrent !== 'function' || wkRenderCurrent._v217) return;
    var r0 = wkRenderCurrent;
    wkRenderCurrent = function () { var v = r0.apply(this, arguments); try { soon(); } catch (e) {} return v; };
    wkRenderCurrent._v217 = true;
  }
  hook();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook);
  window.addEventListener('load', hook);
  /* 回到這個分頁時補送一次（手機可能剛打開） */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { lastSent = ''; soon(); } });
  window.V217TN = { sid: sid, send: function () { lastSent = ''; send(); } };
})();
