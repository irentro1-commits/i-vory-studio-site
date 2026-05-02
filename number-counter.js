/* number-counter.js — BATCH 5 (U46) animated number count-up
   IntersectionObserver pe span/div cu data-count sau detect auto cifre proeminente in headings.
   Modifica doar text content cand intra in viewport. Layout neatins. Desktop-only gated.
*/
(function(){
  'use strict';
  if(window.__NUMBER_COUNTER_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__NUMBER_COUNTER_LOADED=true;

  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el, from, to, duration, suffix){
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOut(t);
      const cur = from + (to - from) * eased;
      // Render with appropriate decimals
      let txt;
      if(Number.isInteger(to) && Math.abs(to) < 100){
        txt = Math.round(cur).toString();
      } else if(to % 1 !== 0){
        txt = cur.toFixed(1);
      } else {
        txt = Math.round(cur).toString();
      }
      el.textContent = txt + (suffix || '');
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init(){
    // Pattern 1: Explicit data-count attribute
    const explicit = document.querySelectorAll('[data-count]');
    // Pattern 2: Auto-detect cifre proeminente in heading-uri mari
    // (skip pentru siguranta — explicit only ca sa nu rupem nimic neasteptat)

    if(!explicit.length)return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(!entry.isIntersecting)return;
        const el = entry.target;
        if(el.dataset.ncDone)return;
        el.dataset.ncDone = '1';
        const target = parseFloat(el.dataset.count);
        if(isNaN(target))return;
        const suffix = el.dataset.countSuffix || '';
        const dur = parseInt(el.dataset.countDuration || '1400', 10);
        animateNumber(el, 0, target, dur, suffix);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    explicit.forEach(el => observer.observe(el));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
