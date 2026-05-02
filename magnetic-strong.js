/* magnetic-strong.js — BATCH 6 (U47) stronger magnetic CTA effect
   Boost peste premium-fx-2026 magnetic — CTA primary .bh attract cursor mai puternic.
   Doar transform on mousemove, zero layout impact. Desktop only.
*/
(function(){
  'use strict';
  if(window.__MAGNETIC_STRONG_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__MAGNETIC_STRONG_LOADED=true;

  function init(){
    const ctas = document.querySelectorAll('.bh, .b-ghost');
    if(!ctas.length)return;

    ctas.forEach(btn => {
      // Skip if already wrapped by premium-fx-2026
      if(btn.dataset.magneticStrongDone)return;
      btn.dataset.magneticStrongDone = '1';

      btn.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)';
      btn.style.willChange = 'transform';

      let rect = null;
      btn.addEventListener('mouseenter', () => {
        rect = btn.getBoundingClientRect();
      });

      btn.addEventListener('mousemove', e => {
        if(!rect) rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        // Stronger magnetic: 0.45 strength (default premium-fx is ~0.25)
        btn.style.transform = `translate(${(x * 0.45).toFixed(2)}px, ${(y * 0.45).toFixed(2)}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
