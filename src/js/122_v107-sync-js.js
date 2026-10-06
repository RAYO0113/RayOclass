
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
    'gr_seat_v1': '座位表（加減分用，只有座號）'
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
