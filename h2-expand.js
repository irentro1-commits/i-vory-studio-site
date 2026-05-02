/* h2-expand.js — BATCH 6 (U47) letter-spacing expand on hover h2
   Pe hover h2, letter-spacing animeaza subtle expand (+0.02em). Premium feel pe titluri.
   Zero DOM modify, zero layout shift (transition smooth). Desktop only.
*/
(function(){
  'use strict';
  if(window.__H2_EXPAND_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__H2_EXPAND_LOADED=true;

  function init(){
    const style = document.createElement('style');
    style.textContent = `
      h2, .sh, .s2 h2 {
        transition: letter-spacing .55s cubic-bezier(.16,1,.3,1);
        will-change: letter-spacing;
      }
      h2:hover, .sh:hover, .s2 h2:hover {
        letter-spacing: 0.018em !important;
      }
    `;
    document.head.appendChild(style);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
