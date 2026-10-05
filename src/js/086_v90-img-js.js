
/* v90：課文頁補充圖片。只在畫面上插入圖片元素，不動 TEXTBOOK 資料。
   圖片：data/115-1/高職/第一冊/<課>/img/補圖_*.jpg（由 scripts/v90_build.py 以 base64 嵌入 V90_IMG）。
   PLAN[課名][seg] = { banner:{i,c}, after:{ 句序li: [ {i,c,big} ] 或 {t:組名, items:[{i,c}]} } } */
(function () {
  window.APP_VERSION = 'V90';
  function setVer() { var d = document.getElementById('v88-ver'); if (d) d.textContent = window.APP_VERSION; }
  setVer(); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setVer);

  var IMG = (function () { var B = /整理版_v\d+\.html$/.test(decodeURIComponent(location.pathname)) ? '上傳/' : ''; var P = {"九芎": "img/火車線/九芎.jpg", "光復糖廠": "img/火車線/光復糖廠.jpg", "冬候鳥群": "img/火車線/冬候鳥群.jpg", "吉安壽豐車票": "img/火車線/吉安壽豐車票.jpg", "吉安稻田": "img/火車線/吉安稻田.jpg", "吉安車站": "img/火車線/吉安車站.jpg", "四色牌": "img/火車線/四色牌.jpg", "夜鷹": "img/火車線/夜鷹.jpg", "太陽麻": "img/火車線/太陽麻.jpg", "木瓜溪橋火車": "img/火車線/木瓜溪橋火車.jpg", "棕背伯勞": "img/火車線/棕背伯勞.jpg", "永保安康車票": "img/火車線/永保安康車票.jpg", "泛舟": "img/火車線/泛舟.jpg", "烏頭翁": "img/火車線/烏頭翁.jpg", "環頸雉": "img/火車線/環頸雉.jpg", "甘蔗田": "img/火車線/甘蔗田.jpg", "田菁": "img/火車線/田菁.jpg", "白頭錦鴝": "img/火車線/白頭錦鴝.jpg", "臺灣野兔": "img/火車線/臺灣野兔.jpg", "苦楝": "img/火車線/苦楝.jpg", "虎爪豆": "img/火車線/虎爪豆.jpg", "賞鯨": "img/火車線/賞鯨.jpg", "路線圖_花蓮壽豐": "img/火車線/路線圖_花蓮壽豐.jpg", "軋日機": "img/火車線/軋日機.jpg", "金針花海": "img/火車線/金針花海.jpg"}; for (var k in P) P[k] = B + P[k]; return P; })();
  var PLAN = {
    '臺灣最美麗的火車線': {
      '第1部分': {
        after: {
          2: { natural: true, items: [{ i: '軋日機', c: '軋日機' }, { i: '永保安康車票', c: '永康→保安 硬紙車票' }, { i: '四色牌', c: '四色牌' }] }
        }
      },
      '第2部分': {
        after: {
          2: [{ i: '路線圖_花蓮壽豐', c: '花東線：花蓮—吉安—志學—平和—壽豐' }],
          6: { natural: true, items: [{ i: '吉安壽豐車票', c: '吉安→壽豐（15 元）' }, { i: '永保安康車票', c: '永康→保安' }] }
        }
      },
      '第3部分': {
        after: {
          0: [{ i: '吉安車站', c: '吉安車站' }],
          1: { banner: { i: '吉安稻田', c: '吉安的稻田', pos: 'center 52%' } }
        }
      },
      '第5部分': {
        after: {
          0: { t: '一般遊客的花蓮', items: [{ i: '賞鯨', c: '賞鯨' }, { i: '光復糖廠', c: '光復糖廠' }, { i: '泛舟', c: '秀姑巒溪泛舟' }] },
          1: { t: '作者的花蓮', items: [{ i: '苦楝', c: '苦楝' }, { i: '九芎', c: '九芎' }] }
        }
      },
      '第6部分': {
        after: {
          0: { contain: true, items: [{ i: '環頸雉', c: '環頸雉' }, { i: '白頭錦鴝', c: '白頭錦鴝' }, { i: '棕背伯勞', c: '棕背伯勞' }, { i: '夜鷹', c: '夜鷹' }, { i: '烏頭翁', c: '烏頭翁' }] },
          1: [{ i: '臺灣野兔', c: '臺灣野兔' }],
          2: [{ i: '冬候鳥群', c: '成群的冬候鳥', big: true }]
        }
      },
      '第4部分': {
        banner: { i: '金針花海', c: '金針花海' },
        after: {
          1: [{ i: '甘蔗田', c: '甘蔗田' }],
          2: { t: '肥料植物', items: [{ i: '虎爪豆', c: '虎爪豆' }, { i: '太陽麻', c: '太陽麻' }, { i: '田菁', c: '田菁' }] },
          3: [{ i: '木瓜溪橋火車', c: '火車過木瓜溪', big: true }]
        }
      }
    }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function imgTag(it) { return '<img class="v90-zoom" src="' + IMG[it.i] + '" alt="' + esc(it.c) + '" data-cap="' + esc(it.c) + '">'; }
  function banner(it) {
    var b = document.createElement('div');
    b.className = 'v90-banner v90-zoom';
    b.style.backgroundImage = 'url(' + IMG[it.i] + ')';
    if (it.pos) b.style.backgroundPosition = it.pos;
    b.setAttribute('data-src', IMG[it.i]);
    b.setAttribute('data-cap', it.c);
    b.title = it.c;
    return b;
  }
  function build(spec) {
    var d = document.createElement('div');
    if (spec.banner) {
      d.className = 'v90-block';
      if (IMG[spec.banner.i]) d.appendChild(banner(spec.banner));
    } else if (Array.isArray(spec)) {
      d.className = 'v90-block';
      d.innerHTML = spec.filter(function (it) { return IMG[it.i]; }).map(function (it) {
        return '<div class="v90-fig' + (it.big ? ' v90-big' : '') + '">' + imgTag(it) + '<div class="v90-cap">' + esc(it.c) + '</div></div>';
      }).join('');
    } else {
      d.className = 'v90-block v90-group' + (spec.contain ? ' v90-contain' : '') + (spec.natural ? ' v90-natural' : '');
      d.innerHTML = (spec.t ? '<div class="v90-gtitle">' + esc(spec.t) + '</div>' : '') + '<div class="v90-grow">' +
        spec.items.filter(function (it) { return IMG[it.i]; }).map(function (it) {
          return '<figure>' + imgTag(it) + '<div class="v90-cap">' + esc(it.c) + '</div></figure>';
        }).join('') + '</div>';
    }
    return d;
  }
  function inject(area) {
    if (!area || typeof wkKey === 'undefined' || !PLAN[wkKey]) return;
    var s = wkSlides && wkSlides[wkIdx];
    if (!s || s.type !== 'textpage' || !s.page) return;
    var plan = PLAN[wkKey][s.page.seg];
    if (!plan) return;
    var body = area.querySelector('.wks-textpage .tp-body');
    if (!body || body.getAttribute('data-v90')) return;
    body.setAttribute('data-v90', s.page.seg);
    if (plan.banner && IMG[plan.banner.i]) body.insertBefore(banner(plan.banner), body.firstChild);
    Object.keys(plan.after || {}).forEach(function (li) {
      var line = body.querySelector('.tp-line[data-li="' + li + '"]');
      if (line) line.insertAdjacentElement('afterend', build(plan.after[li]));
    });
  }
  function run() { try { inject(document.getElementById('wk-slide-area')); inject(document.getElementById('wkfs-body')); } catch (e) {} }

  /* 點圖放大（燈箱掛在 body，z-index 高於全螢幕投影 9550） */
  function closeLb() { var lb = document.getElementById('v90-lb'); if (lb) lb.remove(); }
  document.addEventListener('click', function (e) {
    var z = e.target.closest && e.target.closest('.v90-zoom');
    if (!z) return;
    e.stopPropagation();
    closeLb();
    var lb = document.createElement('div');
    lb.id = 'v90-lb';
    var src = z.getAttribute('data-src') || z.getAttribute('src');
    lb.innerHTML = '<img src="' + src + '" alt=""><div>' + esc(z.getAttribute('data-cap') || '') + '</div>';
    lb.addEventListener('click', function (ev) { ev.stopPropagation(); closeLb(); });
    document.body.appendChild(lb);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('v90-lb')) { e.stopPropagation(); closeLb(); }
  }, true);

  var _v90render = wkRenderCurrent;
  wkRenderCurrent = function () { closeLb(); var r = _v90render.apply(this, arguments); run(); setTimeout(run, 0); return r; };
  ['wk-slide-area', 'wkfs-body'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) new MutationObserver(function () { run(); }).observe(el, { childList: true, subtree: true });
  });
  run();
})();
