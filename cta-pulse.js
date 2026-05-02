/* cta-pulse.js — BATCH 6 (U47) idle CTA pulse glow
   Dupa 5s fara mouse activity, CTA primary (.bh) pulseaza subtle teal-glow.
   Pure additive: doar inject style + animation. Zero DOM modify, zero layout impact.
   Desktop only gated.
*/
(function(){
  'use strict';
  if(window.__CTA_PULSE_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__CTA_PULSE_LOADED=true;

  function init(){
    // Inject keyframes once
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cta-pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0,224,192,0); }
        50%      { box-shadow: 0 0 0 14px rgba(0,224,192,.18), 0 0 28px rgba(0,224,192,.32); }
      }
      .cta-pulse-active { animation: cta-pulse-glow 1.8s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    const ctas = document.querySelectorAll('.bh');
    if(!ctas.length)return;

    let idleTimer = null;
    function activate(){
      ctas.forEach(b => b.classList.add('cta-pulse-active'));
    }
    function deactivate(){
      ctas.forEach(b => b.classList.remove('cta-pulse-active'));
    }
    function reset(){
      deactivate();
      if(idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(activate, 5000);
    }

    ['mousemove','scroll','keydown','touchstart','click'].forEach(ev => {
      document.addEventListener(ev, reset, { passive: true });
    });
    reset();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
