/* V122 預先調課（2026-10-07，老師：10/13 第5節建一孝 調到 10/12 第7節）
   - 原本只能在那一節當下用「本節改為」（V82.setOverride）調課；這裡在班級進度面板 #v82-box 下面加「🔁 調課」區塊，可以預先設定。
   - 資料沿用 tp_override_v1（{ '日期|節': { cls, at } }，雲端同步本來就有這個鍵）：
       新的那節  → { cls: 班, at, swap: id, from: '原日期|節' }
       原本那節  → { cls: '', at, swap: id, to: '新日期|節' }   ← cls 空白＝這節不上課（V82 slotsAt 本來就認：cls 取 o.cls）
     舊站 v113 讀到 cls 空白也一樣當成沒課；舊站「本節改為」選「依課表」會刪掉該節設定（恢復課表）。
   - 教學進度（138_plan-js）同步改為認 cls 空白＝沒課（原本會退回課表）。
   - 清單：今天以後的調課；同一次調課的兩節一起刪。 */
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
  function whoAt(ds, p) { var o = ovr()[ds + '|' + p]; return o ? (o.cls || '') : schedCls(ds, p); }
  function label(key) { var a = key.split('|'), d = parse(a[0]); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）第' + a[1] + '節'; }

  var F = { fd: '', fp: '', td: '', tp: '', cls: '', open: false };

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
  function del(key) {
    var o = ovr(), x = o[key]; if (!x) return;
    var keys = x.swap ? Object.keys(o).filter(function (k) { return o[k] && o[k].swap === x.swap; }) : [key];
    if (!confirm('刪除這筆調課？\n' + keys.map(function (k) { return label(k) + '：' + (o[k].cls || '不上課'); }).join('\n') + '\n\n（刪除後恢復原本課表）')) return;
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
      } else {
        rows.push('<li>' + esc(label(k)) + '：' + (x.cls ? '改為 <b>' + esc(x.cls) + '</b>' : '不上課') + '<small>（當節「本節改為」）</small>' +
          '<button type="button" data-v122-del="' + esc(k) + '" title="刪除">✕</button></li>');
      }
    });
    return rows.length ? '<ul class="v122-list">' + rows.join('') + '</ul>' : '<div class="v82-sub">目前沒有之後的調課。</div>';
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
        '<div class="v122-lb2">之後的調課</div>' + listHTML() + '</div>';
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
  }
  function onChange(e) {
    var a = e.target.getAttribute('data-v122'); if (!a) return;
    F[a] = e.target.value;
    render();
  }

  window.V122SWAP = { whoAt: whoAt, render: render };
  if (typeof clsRender === 'function') {
    var _cr = clsRender;
    clsRender = function () { var r = _cr.apply(this, arguments); try { render(); } catch (e) { setTimeout(function () { throw e; }); } return r; };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
