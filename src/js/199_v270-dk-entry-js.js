(function () {
  /* V270（老師 11/27：「做成題目檢討 連到國文教學網裡面去」）段考檢討的入口。
     左側選單「作文教學」下面多一區「段考檢討」，每份考卷一顆；點了蓋滿整個畫面開 dk/index.html?e=<卷代號>。
     頁內「✕ 回網站」（送 lbClose）或 Esc 關掉，回到原本那一頁。一般畫面、投影都能開（投影時蓋在全螢幕層上面）。
     新增考卷：dk/exams/<卷代號>.js 放好，在 EXAMS 加一筆。 */
  var EXAMS = [['115-1-2', '115-1 第二次段考（L4–L6）']];
  var BOX = 'dk-box';

  function close() { var b = document.getElementById(BOX); if (b) b.remove(); window.focus(); }
  window.dkOpen = function (code) {
    if (document.getElementById(BOX)) return;
    var box = document.createElement('div');
    box.id = BOX;
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#F4F0E7';
    var f = document.createElement('iframe');
    f.title = '段考檢討'; f.setAttribute('allow', 'fullscreen');
    f.style.cssText = 'width:100%;height:100%;border:0;display:block';
    f.src = 'dk/index.html?e=' + encodeURIComponent(code);
    box.appendChild(f);
    (document.fullscreenElement || document.body).appendChild(box);
    setTimeout(function () { try { f.focus(); } catch (er) {} }, 400);
  };
  window.addEventListener('message', function (e) {
    var b = document.getElementById(BOX);
    if (b && e.data && e.data.lbClose && (e.origin === location.origin || e.origin === 'null')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById(BOX)) close(); });

  window.addEventListener('load', function () {
    var zw = document.getElementById('wenxue-zuowen-list');
    if (!zw || document.getElementById('wenxue-dk-list')) return;
    zw.insertAdjacentHTML('afterend',
      '<div class="wenxue-sidebar-title" style="margin-top:12px">段考檢討</div><div id="wenxue-dk-list">' +
      EXAMS.map(function (d) {
        return '<button class="wenxue-nav-item" onclick="dkOpen(\'' + d[0] + '\')">' + d[1] + '</button>';
      }).join('') + '</div>');
  });
})();
