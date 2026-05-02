/* cursor-trail.js — BATCH 5 (U46) cursor trail particles
   12 puncte care urmaresc cursorul cu trail fade-out. Pure overlay z-index 9999.
   Zero DOM touch, zero layout impact. Desktop-only gated.
*/
(function(){
  'use strict';
  if(window.__CURSOR_TRAIL_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__CURSOR_TRAIL_LOADED=true;

  function init(){
    const N = 12;
    const dots = [];
    const wrap = document.createElement('div');
    wrap.id = 'ct-wrap';
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;will-change:contents;';
    for(let i=0;i<N;i++){
      const d = document.createElement('div');
      const size = 6 - i * 0.35;  // 6px → 1.8px
      const opacity = 1 - i * 0.075; // 1 → 0.18
      d.style.cssText = `position:absolute;width:${size.toFixed(2)}px;height:${size.toFixed(2)}px;border-radius:50%;background:rgba(0,224,192,${opacity.toFixed(2)});box-shadow:0 0 ${(size*1.5).toFixed(1)}px rgba(0,224,192,.5);transform:translate3d(0,0,0);will-change:transform;left:0;top:0;mix-blend-mode:screen;`;
      wrap.appendChild(d);
      dots.push({ el: d, x: 0, y: 0 });
    }
    document.body.appendChild(wrap);

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

    function loop(){
      let px = mx, py = my;
      dots.forEach((dot, i) => {
        // Each dot lerps toward previous dot with eased delay
        const lerp = 0.32 - i * 0.012; // first dot follows fast, last dot follows slow
        dot.x += (px - dot.x) * lerp;
        dot.y += (py - dot.y) * lerp;
        dot.el.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
        px = dot.x;
        py = dot.y;
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
