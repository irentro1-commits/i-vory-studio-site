/* card-tilt-3d.js — BATCH 5 (U46) 3D perspective tilt on hover
   perspective(1000px) rotateX/Y pe selectori specifici cards. CSS+JS pure-additive.
   NU touch layout existent. Doar transform on hover. Desktop-only gated.
*/
(function(){
  'use strict';
  if(window.__CARD_TILT_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__CARD_TILT_LOADED=true;

  function init(){
    // Conservative selector list — only known card-like elements that benefit from tilt
    // SKIP .pf-img (already has hover scale via image-reveals.js)
    const selectors = [
      '.pf-card',          // portfolio cards
      '.pkg',              // package cards
      '.pkg-card',
      '.pricing-card',
      '.case-card',
      '.blog-card'
    ];

    const cards = document.querySelectorAll(selectors.join(','));
    if(!cards.length)return;

    cards.forEach(card => {
      // Skip cards inside other tilted containers
      if(card.closest('[data-tilt-applied]'))return;
      card.dataset.tiltApplied = '1';

      // Set base 3D perspective on container
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform .35s cubic-bezier(.16,1,.3,1)';
      card.style.willChange = 'transform';

      let rect = null;
      function updateRect(){ rect = card.getBoundingClientRect(); }

      card.addEventListener('mouseenter', () => {
        updateRect();
      });

      card.addEventListener('mousemove', e => {
        if(!rect) updateRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        // Tilt amount: max ±6deg
        const ry = ((x - cx) / cx) * 5;   // rotateY
        const rx = -((y - cy) / cy) * 4;  // rotateX (inverted)
        card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
