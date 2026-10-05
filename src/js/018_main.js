
/* ═══ v39：重新定義浮框定位——不再硬設高度，讓 40px 字級也能完整展開 ═══ */
function tpPlacePopup(el) {
  if (!el || !el.classList.contains('show')) return;
  const pop = tpPopNode(el);
  if (!pop) return;

  const anchor = el.getBoundingClientRect();
  const bounds = tpPopupBounds(el);
  const maxW = Math.max(120, Math.floor(bounds.right - bounds.left));
  const fs = parseFloat(getComputedStyle(el).fontSize) ||
             parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-size')) || 16;

  pop.style.position = 'fixed';
  pop.style.display = 'block';
  pop.style.visibility = 'hidden';
  pop.style.transform = 'none';
  pop.style.left = '0px';
  pop.style.top = '0px';
  pop.style.width = 'max-content';
  pop.style.minWidth = '0px';
  pop.style.maxWidth = maxW + 'px';
  pop.style.maxHeight = 'none';
  pop.style.overflow = 'visible';
  pop.style.fontSize = fs + 'px';
  pop.style.lineHeight = '1.5';

  let pr = pop.getBoundingClientRect();
  if (!isFinite(pr.width) || pr.width <= 0) {
    pop.style.width = Math.min(maxW, window.innerWidth - 16) + 'px';
    pr = pop.getBoundingClientRect();
  } else if (pr.width > maxW + 1) {
    pop.style.width = maxW + 'px';
    pr = pop.getBoundingClientRect();
  }

  /* 貼近原文：下方浮框只留 3px 緩衝，避免看起來懸浮得太遠。 */
  const gap = 3;
  const left = Math.max(bounds.left, Math.min(
    anchor.left + anchor.width / 2 - pr.width / 2,
    bounds.right - pr.width
  ));
  pop.style.left = Math.round(left) + 'px';

  const others = Array.from(document.querySelectorAll('.tp-g.show,.tp-p.show,.tp-z.show'))
    .filter(x => x !== el && x.closest('.wk-slide') === el.closest('.wk-slide'))
    .map(tpPopRect)
    .filter(Boolean);

  /* 優先貼近原文；若附近有其他浮框，只嘗試極小幅度錯開，不再整塊跳遠。 */
  const candidates = [
    { y: anchor.top - pr.height - gap, below: false },
    { y: anchor.bottom + gap, below: true },
    { y: anchor.top - pr.height - 5, below: false },
    { y: anchor.bottom + 5, below: true }
  ];

  let chosen = null;
  for (const c of candidates) {
    if (c.y < 6 || c.y + pr.height > window.innerHeight - 6) continue;
    const test = {left, right:left + pr.width, top:c.y, bottom:c.y + pr.height};
    if (!others.some(o => tpRectsOverlap(test, o))) {
      chosen = c;
      break;
    }
  }

  if (!chosen) {
    const above = anchor.top - pr.height - 3;
    const below = anchor.bottom + 3;
    if (above >= 6) {
      chosen = {y:above, below:false};
    } else if (below + pr.height <= window.innerHeight - 6) {
      chosen = {y:below, below:true};
    } else {
      /* 若上下都不夠，就貼近可視區域邊緣；不裁切內容、不出現內部捲軸。 */
      const y = Math.max(6, Math.min(below, window.innerHeight - pr.height - 6));
      chosen = {y, below:y >= anchor.bottom};
    }
  }

  pop.style.top = Math.round(chosen.y) + 'px';
  pop.style.visibility = 'visible';
  el.classList.toggle('tp-pop-below', !!chosen.below);
}
