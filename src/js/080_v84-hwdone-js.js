
(function () {
  /* 課次依 source/115-1/高職/第一冊 教材檔名的 L01～L06；k＝TEXTBOOK 課名 */
  var LESSONS = [
    { no: 'L1', k: '身為魚販' },
    { no: 'L2', k: '世說新語選' },
    { no: 'L3', k: '師說' },
    { no: 'L4', k: '珍珠奶茶' },
    { no: 'L5', k: '臺灣最美麗的火車線', s: '火車線' },
    { no: 'L6', k: '論語選—子路曾皙冉有公西華侍坐', s: '侍坐' }
  ];
  var ITEMS = ['課後習題', '習作', 'A卷'];
  var STAGES = ['考試', '檢討'];
  /* V123 重要進度檢核：A卷多一格「訂正加分」（鍵 'A卷|訂正'）；課後習題／習作的「考試」格改叫「交作業」（鍵不變，舊紀錄照用） */
  var STG = { '課後習題': ['考試', '檢討'], '習作': ['考試', '檢討'], 'A卷': ['考試', '檢討', '訂正'] };
  function itLabel(it) { return it === '課後習題' ? '課本後習題' : it; }   /* 畫面名稱（基礎練習＋進階練習）；資料鍵仍是「課後習題」 */
  function stLabel(it, st) { return st === '考試' ? (it === 'A卷' ? '考試' : '交作業') : st === '訂正' ? '訂正加分' : st; }
  var K = { data: 'hw_done_v1', les: 'hw_done_lesson_v1', fold: 'hw_done_fold_v1' };
  var exporting = false;

  function get(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { alert('儲存失敗，可能是瀏覽器限制。'); return false; } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function classes() { return (typeof CLS_LIST !== 'undefined' && CLS_LIST) || []; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function md(s) { var a = String(s).split('-'); return (+a[1]) + '/' + (+a[2]); }
  function les(k) { for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].k === k) return LESSONS[i]; return null; }
  function short(L) { return L.s || L.k; }
  function curLesson() {
    try { if (typeof wkKey !== 'undefined' && les(wkKey)) return wkKey; } catch (e) {}
    var k = get(K.les, ''); return les(k) ? k : LESSONS[2].k;
  }
  var picked = null;   /* 本次開啟面板時所選的課（未選＝跟著目前所在課文） */

  /* 資料：{ 課名: { 班級: { '習作|考試': 'YYYY-MM-DD' } } } */
  function toggle(lesson, cls, item, stage) {
    var d = get(K.data, {}), key = item + '|' + stage;
    var row = ((d[lesson] = d[lesson] || {})[cls] = d[lesson][cls] || {});
    if (row[key]) {
      if (!confirm('取消「' + cls + '・' + short(les(lesson)) + '・' + itLabel(item) + ' ' + stLabel(item, stage) + '」的完成紀錄（' + md(row[key]) + '）？')) return;
      delete row[key];
    } else row[key] = today();
    put(K.data, d);
    render();
  }

  function render() {
    var panel = document.getElementById('cls-panel'); if (!panel) return;
    var el = document.getElementById('v84-hw');
    if (!el) {
      el = document.createElement('div'); el.id = 'v84-hw';
      var tabs = document.getElementById('cls-tabs');
      panel.insertBefore(el, tabs || null);
      el.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('button[data-v84], .v84-h');
        if (!b) return;
        if (b.classList.contains('v84-h')) { put(K.fold, !get(K.fold, false)); render(); return; }
        var a = b.getAttribute('data-v84').split('|');
        if (a[0] === 'L') { picked = a[1]; put(K.les, a[1]); render(); }
        else toggle(a[1], a[2], a[3], a[4]);
      });
    }
    var fold = get(K.fold, false);
    var lk = picked || curLesson(), L = les(lk), d = (get(K.data, {})[lk]) || {};
    var h = '<div class="v84-h"><span>重要進度檢核</span><i>' + (fold ? '展開 ▸' : '收起 ▾') + '</i></div>';
    if (!fold) {
      h += '<div class="v84-les">' + LESSONS.map(function (x) {
        return '<button type="button" data-v84="L|' + esc(x.k) + '"' + (x.k === lk ? ' class="on"' : '') + ' title="' + esc(x.k) + '"><b>' + x.no + '</b>' + esc(short(x)) + '</button>';
      }).join('') + '</div>';
      h += '<table><tr><th rowspan="2" style="width:58px">' + esc(L.no) + '</th>' +
        ITEMS.map(function (it) { return '<th colspan="' + STG[it].length + '" class="v84-g v84-gs">' + itLabel(it) + '</th>'; }).join('') + '</tr><tr>' +
        ITEMS.map(function (it) { return STG[it].map(function (st, j) { return '<th class="v84-sub' + (j ? '' : ' v84-gs') + '">' + stLabel(it, st) + '</th>'; }).join(''); }).join('') + '</tr>';
      classes().forEach(function (c) {
        var row = d[c] || {};
        h += '<tr><td class="v84-cls">' + esc(c) + '</td>' + ITEMS.map(function (it) {
          return STG[it].map(function (st, j) {
            var v = row[it + '|' + st];
            return '<td' + (j ? '' : ' class="v84-gs"') + '><button type="button" class="v84-c' + (j ? (st === '訂正' ? ' v84-fx' : ' v84-rv') : '') + (v ? ' done' : '') + '" data-v84="C|' +
              esc(lk) + '|' + esc(c) + '|' + it + '|' + st + '" title="' + esc(c + '・' + itLabel(it) + ' ' + stLabel(it, st)) + '">' +
              '<span class="v84-mk">' + (v ? '✓' : '○') + '</span>' + (v ? '<span class="v84-dt">' + md(v) + '</span>' : '') + '</button></td>';
          }).join('');
        }).join('') + '</tr>';
      });
      h += '</table><div class="v84-note">點一下＝完成（自動記今天日期）；再點一下可取消。日曆排的考試／檢討日期到了、成績系統登記了繳交／訂正加分，會自動打勾。</div>';
    }
    el.innerHTML = h;
  }

  /* 面板每次開啟時，預設跟著目前所在課文 */
  var _v84tog = clsToggle;
  clsToggle = function () { picked = null; return _v84tog.apply(this, arguments); };
  var _v84render = clsRender;
  clsRender = function () { var r = _v84render.apply(this, arguments); try { render(); } catch (e) {} return r; };

  /* 備份：匯出附帶 __v84hw；匯入時只補本機沒有的格子，不覆蓋既有紀錄 */
  var _v84load = clsLoad;
  clsLoad = function () {
    var d = _v84load.apply(this, arguments);
    if (exporting) d.__v84hw = get(K.data, {});
    return d;
  };
  var _v84exp = clsExport;
  clsExport = function () { exporting = true; try { return _v84exp.apply(this, arguments); } finally { exporting = false; } };
  var _v84save = clsSave;
  clsSave = function (d) {
    if (d && d.__v84hw) {
      var x = d.__v84hw, cur = get(K.data, {}); delete d.__v84hw;
      Object.keys(x || {}).forEach(function (l) {
        Object.keys(x[l] || {}).forEach(function (c) {
          Object.keys(x[l][c] || {}).forEach(function (k) {
            var r = ((cur[l] = cur[l] || {})[c] = cur[l][c] || {});
            if (!r[k]) r[k] = x[l][c][k];
          });
        });
      });
      put(K.data, cur);
    }
    return _v84save.apply(this, arguments);
  };

  window.V84HW = { data: function () { return get(K.data, {}); }, render: render, stages: STG, label: stLabel };
})();
