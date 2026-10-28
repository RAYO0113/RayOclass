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
