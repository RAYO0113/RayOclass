/* V187：把目前打開的課名寫到 <body data-wk="課名">，讓 CSS 可以只對某一課生效（〈論語選〉整課字級統一，166 css）。 */
(function () {
  function sync() {
    var k = (typeof wkKey !== 'undefined' && wkKey) ? wkKey : '';
    if (document.body && document.body.getAttribute('data-wk') !== k) document.body.setAttribute('data-wk', k);
  }
  setInterval(sync, 300);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
