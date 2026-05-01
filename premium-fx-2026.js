/* premium-fx-2026.js — DESKTOP ONLY premium UX layer 2026
   Features: Lenis smooth scroll + magnetic cursor + number count-up + mouse glow radial S2.
   Gated: skip on mobile + in-app webview + touch-only devices.
   Loaded via <script defer src="/premium-fx-2026.js?v=N"></script> in body end.
   Lenis library expected at window.Lenis (loaded from CDN <script defer> in head, runs first via DOM order).
*/
(function(){
  'use strict';
  // === GATING ===
  if(window.__PREMIUM_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  window.__PREMIUM_FX_LOADED=true;

  // === 1) SMOOTH SCROLL via Lenis ===
  function initLenis(){
    if(!window.Lenis){console.warn("[premium-fx] Lenis not loaded — smooth scroll skipped");return;}
    const lenis = new window.Lenis({
      duration: 1.15,
      easing: t=>Math.min(1, 1.001 - Math.pow(2, -10*t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.085,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__LENIS = lenis;
    try{
      if(window.gsap && window.ScrollTrigger){
        lenis.on('scroll', window.ScrollTrigger.update);
        window.gsap.ticker.add(t=>lenis.raf(t*1000));
        window.gsap.ticker.lagSmoothing(0);
      }
    }catch(_){}
  }

  // === 2) MAGNETIC CURSOR pe butoane ===
  function initMagnetic(){
    const targets = document.querySelectorAll('.bh, .pk-btn, .btn-pf');
    if(!targets.length)return;
    const STRENGTH = 0.32;
    targets.forEach(el=>{
      let raf=null;
      el.addEventListener('mousemove', e=>{
        if(raf)cancelAnimationFrame(raf);
        raf = requestAnimationFrame(()=>{
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width/2;
          const y = e.clientY - r.top - r.height/2;
          el.style.transform = 'translate('+(x*STRENGTH).toFixed(2)+'px,'+(y*STRENGTH).toFixed(2)+'px)';
          el.style.transition = 'transform 0.18s ease-out';
        });
      });
      el.addEventListener('mouseleave', ()=>{
        if(raf)cancelAnimationFrame(raf);
        el.style.transform = 'translate(0,0)';
        el.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
      });
    });
  }

  // === 3) NUMBER COUNT-UP pe .proof-num ===
  function initCountUp(){
    const els = document.querySelectorAll('.proof-num[data-target]');
    if(!els.length)return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting)return;
        const el = e.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        if(target === 0){ el.textContent = '0'; io.unobserve(el); return; }
        const dur = 1600;
        const start = performance.now();
        function tick(now){
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1-p, 3.2);
          el.textContent = Math.round(eased * target);
          if(p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => io.observe(el));
  }

  // === 4) MOUSE GLOW RADIAL pe .s2 hero ===
  function initMouseGlow(){
    const s2 = document.querySelector('.s2');
    if(!s2)return;
    const cs = window.getComputedStyle(s2);
    if(cs.position === 'static') s2.style.position = 'relative';
    s2.style.overflow = s2.style.overflow || 'hidden';
    const glow = document.createElement('div');
    glow.id = 'pfx-mouse-glow';
    glow.style.cssText = [
      'position:absolute',
      'inset:0',
      'pointer-events:none',
      'background:radial-gradient(circle 380px at 50% 50%, rgba(0,224,192,0.10), transparent 62%)',
      'mix-blend-mode:screen',
      'z-index:1',
      'opacity:0',
      'transition:opacity 0.45s ease-out'
    ].join(';');
    s2.appendChild(glow);
    let raf=null;
    s2.addEventListener('mousemove', e=>{
      if(raf)cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        const r = s2.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        glow.style.background = 'radial-gradient(circle 420px at '+x.toFixed(1)+'% '+y.toFixed(1)+'%, rgba(0,224,192,0.13), transparent 62%)';
        glow.style.opacity = '1';
      });
    });
    s2.addEventListener('mouseleave', ()=>{ glow.style.opacity = '0'; });
  }

  function boot(){
    try{ initLenis(); }catch(e){ console.warn('[premium-fx] lenis err', e); }
    try{ initMagnetic(); }catch(e){ console.warn('[premium-fx] magnetic err', e); }
    try{ initCountUp(); }catch(e){ console.warn('[premium-fx] countup err', e); }
    try{ initMouseGlow(); }catch(e){ console.warn('[premium-fx] glow err', e); }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
