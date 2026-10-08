/* 按鈕爆粒子（2026-10-08 老師）：點下去按鈕 1→0.8→1.2→1 回彈（帶回彈曲線），中心炸出 8 顆古典色小圓點向外飛散淡出，共 600ms。
   套用範圍（老師同意的建議）：
     ① 看答案類按鈕（全部顯示答案、直接顯示答案、一鍵全開…）→ 回彈＋粒子；只在「顯示」時爆，按「隱藏」不爆
     ② 成績、同步的主要按鈕（.gr-btn.pri、.sy-btn.pri：登入、儲存、匯入、立即同步…）→ 回彈＋粒子
     ③ 點遮罩看答案（點此顯示答案與解析、點一下揭曉、點一下看答案、表格裡的點此顯示答案）→ 遮罩消失時只炸粒子（遮罩會不見，不做回彈）
   翻頁、畫筆、關閉、字級、深色模式這些常按的不爆。系統設定「減少動態效果」就不播。
   做法：document 捕獲階段先記下按下前的狀態（按鈕文字、遮罩是否可見、位置），等原本的 onclick 跑完（setTimeout 0）再判斷要不要爆；
   不改任何既有模組。同一份程式也放在班級網站（教學系統專案 scripts/stu_class_addon.html），兩邊改要一起改。 */
(function () {
  if (window.popFx) return;
  var COLORS = ['#c23a2b', '#d9a420', '#3f8f6b', '#2b6c9e', '#9d2933', '#c8a046', '#6aa3b8', '#9b5b2b'];   // 朱砂、藤黃、石綠、石青、胭脂、泥金、天青、赭石
  var DUR = 600, BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var st = document.createElement('style'); st.id = 'popfx-css';
  st.textContent = '.pop-fx-layer{position:fixed;left:0;top:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:2147483647}' +
    '.pop-fx-dot{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;will-change:transform,opacity}';
  document.head.appendChild(st);

  var layer = null;
  function getLayer() {
    if (!layer || !layer.isConnected) { layer = document.createElement('div'); layer.className = 'pop-fx-layer'; document.body.appendChild(layer); }
    return layer;
  }
  /* btn：要回彈的元素（可為 null）；r：炸粒子的位置（視窗座標，沒給就用 btn 現在的位置） */
  function popFx(btn, r) {
    if (reduce || !document.body.animate) return;
    if (btn) {
      var base = getComputedStyle(btn).transform; base = base && base !== 'none' ? base + ' ' : '';   // 原本有 transform 的按鈕（置中定位等）不能被蓋掉
      var rb = btn.getBoundingClientRect(), room = Math.min(rb.left, document.documentElement.clientWidth - rb.right);
      var hi = rb.width ? Math.min(1.2, Math.max(1.03, 1 + 2 * room / rb.width)) : 1.2;   // 滿版寬的按鈕放大幅度自動縮小，不會超出螢幕（手機才不會左右晃）
      btn.animate([
        { transform: base + 'scale(1)', easing: 'cubic-bezier(.3,0,.6,1)' },
        { transform: base + 'scale(0.8)', offset: 0.22, easing: BOUNCE },
        { transform: base + 'scale(' + hi + ')', offset: 0.6, easing: BOUNCE },
        { transform: base + 'scale(1)' }
      ], { duration: DUR });
      r = btn.getBoundingClientRect();
    }
    if (!r || !r.width) return;
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2, L = getLayer();
    var s0 = Math.min(Math.max(r.width, r.height) / 2 * 0.6, 60), a0 = Math.random() * Math.PI * 2;   // 大遮罩起點最多離中心 60px
    for (var i = 0; i < 8; i++) {
      var a = a0 + i * Math.PI / 4 + (Math.random() - 0.5) * 0.35, dist = s0 + 16 + Math.random() * 10, sz = 3 + Math.random() * 1.5;
      var sx = cx + Math.cos(a) * s0, sy = cy + Math.sin(a) * s0, ex = cx + Math.cos(a) * dist, ey = cy + Math.sin(a) * dist;
      var dot = document.createElement('div'); dot.className = 'pop-fx-dot';
      dot.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;margin:' + (-sz / 2) + 'px 0 0 ' + (-sz / 2) + 'px;background:' + COLORS[i];
      L.appendChild(dot);
      var P = (function (sx, sy, ex, ey) { return function (k) { return 'translate(' + (sx + (ex - sx) * k) + 'px,' + (sy + (ey - sy) * k) + 'px)'; }; })(sx, sy, ex, ey);
      dot.animate([
        { transform: P(0) + ' scale(.4)', opacity: 0, easing: 'ease-out' },
        { transform: P(0.3) + ' scale(1.2)', opacity: 1, offset: 0.15, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { transform: P(0.9) + ' scale(1)', opacity: 1, offset: 0.7, easing: 'ease-in' },
        { transform: P(1) + ' scale(.4)', opacity: 0 }
      ], { duration: DUR }).onfinish = (function (el) { return function () { el.remove(); }; })(dot);
    }
  }
  window.popFx = popFx;

  var REVEAL_BTN = '.wq-reveal-btn,.jy-toggle-all,.iq-all,.as-all,button.all,#bAll,button[onclick^="v68AoAll"],#stu-sp-all';   // #stu-sp-all：班級網站衝刺區「👀 本頁答案全開」
  var CONFIRM_BTN = '.gr-btn.pri,.sy-btn.pri';
  var BOX = '.wks-q-ansbox,.wks-exam-ansbox,.wks-selfq-box,.wks-cq-card,.ah-a,#nq2 .qc';
  var COVER = '.wks-q-cover,.wks-cq-cover,.ah-cov,.qa-hint';
  function shown(el) { return !!(el && el.isConnected && el.getClientRects().length); }
  function keyOf(b) { return b.getAttribute('data-g') || b.getAttribute('data-s') || b.id || ''; }

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest(CONFIRM_BTN + ',' + REVEAL_BTN);
    if (b) {
      if (b.disabled) return;
      var txt = b.textContent || '';
      if (!b.matches(CONFIRM_BTN) && (/隱藏|遮|藏起來/.test(txt) || !/顯示|全開|揭曉|答案/.test(txt))) return;   // 看答案類：只在「顯示」時爆
      var r = b.getBoundingClientRect(), k = keyOf(b), par = b.parentNode;
      setTimeout(function () {
        if (b.isConnected) { popFx(b); return; }
        var nb = k && document.querySelector('[data-g="' + k + '"],[data-s="' + k + '"]');   // 按完整塊重畫：找新的同一顆
        if (nb && shown(nb)) popFx(nb); else popFx(null, r);
      }, 0);
      return;
    }
    var wa = document.body.classList.contains('stu-sprint-on') && t.closest('.wk-a');   // 班級網站衝刺區的「點我」（遮罩是 ::before，點一下切換 stu-show）
    if (wa) { var r1 = wa.getBoundingClientRect(); setTimeout(function () { if (wa.classList.contains('stu-show')) popFx(null, r1); }, 0); return; }
    var box = t.closest(BOX), cov = box && box.querySelector(COVER);
    if (!shown(cov)) return;   // 已經打開了（這下是要收起來）→ 不爆
    var r2 = cov.getBoundingClientRect();
    setTimeout(function () { if (!shown(cov)) popFx(null, r2); }, 0);
  }, true);
})();
