// Ad slots (index.html `.ad-slot[data-ad]`, styled in menu.css): banners on the homemade menu and
// towers in columns beside the game (main.js's resize() asks adGutter() for their width). Google
// AdSense: index.html loads adsbygoogle.js; each slot becomes a fixed-size display unit
// (<ins class="adsbygoogle">) the first time it is on screen. AdSense can't size a unit inside a
// display:none parent, and pages that are display:none never intersect (menu pages away from them,
// #home during races, the towers whenever the home menu is up or the window has no room).
const CLIENT = 'ca-pub-3274826616160862';
// Ad unit ids (AdSense > Ads > By ad unit > Display ads, fixed size): a size without one stays an
// empty placeholder, and the towers beside the game stay off (the canvas keeps the full width).
const UNITS = {
  '728x90': '',
  '468x60': '',
  '320x50': '',
  '300x250': '',
  '160x600': '',
  '160x300': '',
};
// The "banner" slot's size by viewport width (same breakpoints as menu.css).
const BANNERS = [['(min-width: 1101px)', '728x90'], ['(min-width: 521px)', '468x60'], ['all', '320x50']];
// The "tower" slots beside the game (index.html .ad-gutter): the tallest that fits the window.
const TOWERS = [[620, '160x600'], [320, '160x300']];
const GUTTER = 176; // a 160-wide tower + 8px each side

function tower(wh) {
  const t = TOWERS.find(([minH]) => wh >= minH);
  return t && UNITS[t[1]] ? t[1] : null;
}

function size(slot) {
  if (slot.dataset.ad === 'tower') return tower(window.innerHeight);
  if (slot.dataset.ad !== 'banner') return slot.dataset.ad;
  return BANNERS.find(([q]) => matchMedia(q).matches)[1];
}

// Called by main.js's resize(): the width to keep clear on each side of the game canvas for the
// towers, or 0 (no tower unit, a touch screen, or a window too small to give up 2 x 176px).
export function adGutter(ww, wh) {
  const on = !matchMedia('(pointer: coarse)').matches && ww >= 1100 && tower(wh) !== null;
  document.body.classList.toggle('ad-gutters', on);
  return on ? GUTTER : 0;
}

function fill(slot) {
  const fmt = size(slot);
  const unit = fmt && UNITS[fmt];
  if (!unit) return; // no ad unit for this size (yet)
  const [w, h] = fmt.split('x').map(Number);
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.cssText = `display:inline-block;width:${w}px;height:${h}px`;
  ins.dataset.adClient = CLIENT;
  ins.dataset.adSlot = unit;
  slot.style.width = `${w}px`; slot.style.height = `${h}px`;
  slot.replaceChildren(ins);
  slot.classList.add('filled');
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.warn('adsense:', e); }
}

const seen = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    seen.unobserve(e.target);
    fill(e.target);
  }
});
for (const slot of document.querySelectorAll('.ad-slot[data-ad]')) seen.observe(slot);
