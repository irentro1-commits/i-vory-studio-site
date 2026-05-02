/* hero-galaxy-text.js — U51 hero h2 kinetic entrance "din galaxie litera cu litera"
   Wrap fiecare caracter in span cu cosmic scatter initial state →
   fluid stagger sosire la pozitia finala. 1400ms cubic-bezier(.16,1,.3,1).
   Marcheaza data-splitDone pe el pentru ca kinetic-fx sa skip. Desktop only.
*/
(function(){
  'use strict';
  if(window.__HERO_GALAXY_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__HERO_GALAXY_LOADED=true;

  function wrapChars(el){
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let n;
    while((n = walker.nextNode())) textNodes.push(n);
    const charSpans = [];
    textNodes.forEach(node => {
      const text = node.nodeValue;
      if(!text || !text.trim()) return;
      const frag = document.createDocumentFragment();
      for(let i=0; i<text.length; i++){
        const ch = text[i];
        if(ch === ' ' || ch === '\n' || ch === '\t'){
          frag.appendChild(document.createTextNode(ch));
        } else {
          const span = document.createElement('span');
          span.className = 'galaxy-char';
          span.textContent = ch;
          span.style.display = 'inline-block';
          span.style.willChange = 'transform, opacity, filter';
          frag.appendChild(span);
          charSpans.push(span);
        }
      }
      node.parentNode.replaceChild(frag, node);
    });
    return charSpans;
  }

  function init(){
    const targets = document.querySelectorAll('.s2 h2');
    if(!targets.length) return;

    targets.forEach(el => {
      if(el.dataset.splitDone) return;
      el.dataset.splitDone = '1';
      el.dataset.galaxyDone = '1';

      const chars = wrapChars(el);
      if(!chars.length) return;

      // Cosmic scatter initial state per char
      chars.forEach((span, i) => {
        const dx = (Math.random() - 0.5) * 480;   // -240..240px
        const dy = (Math.random() - 0.5) * 360;   // -180..180px
        const dz = (Math.random() - 0.5) * 200;   // depth
        const rot = (Math.random() - 0.5) * 120;  // -60..60 deg
        const scale = 0.2 + Math.random() * 0.3;  // 0.2..0.5
        span.style.transform = `translate3d(${dx.toFixed(0)}px, ${dy.toFixed(0)}px, ${dz.toFixed(0)}px) rotate(${rot.toFixed(0)}deg) scale(${scale.toFixed(2)})`;
        span.style.opacity = '0';
        span.style.filter = 'blur(14px)';
        const delay = 200 + i * 45;
        span.style.transition = `transform 1400ms cubic-bezier(.16,1,.3,1) ${delay}ms, opacity 1100ms ease-out ${delay}ms, filter 900ms ease-out ${delay}ms`;
      });

      // Force reflow
      void el.offsetHeight;

      // Trigger arrival on next 2 frames (paint + 1 RAF for transition pickup)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chars.forEach(span => {
            span.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
            span.style.opacity = '1';
            span.style.filter = 'blur(0px)';
          });
        });
      });

      // Cleanup will-change after animation done (~2200ms)
      setTimeout(() => {
        chars.forEach(span => { span.style.willChange = 'auto'; });
      }, 2500);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    // Already loaded — give browser 50ms to settle
    setTimeout(init, 50);
  }
})();
