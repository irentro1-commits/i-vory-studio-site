/* section-transitions.js — BATCH 2A premium 2026 desktop section transitions
   Features: pin sections services+packages (Apple-style scrub) + section enter (fade+scale+blur) +
             color theme drift bg gradient + mask reveal alt + divider line draw + eyebrow accent slide.
   Gated DESKTOP only — exits silently on mobile/touch/in-app.
   Requires: window.gsap + window.ScrollTrigger (loaded via CDN before this script).
*/
(function(){
  'use strict';
  if(window.__SECTION_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  window.__SECTION_FX_LOADED=true;

  function waitFor(predFn, cb, tries){
    tries=tries||40;
    if(predFn()){cb();return;}
    if(tries<=0){console.warn('[section-fx] timeout waiting for deps');return;}
    setTimeout(()=>waitFor(predFn,cb,tries-1),100);
  }

  waitFor(()=>window.gsap && window.ScrollTrigger, init);

  function init(){
    const gsap=window.gsap, ST=window.ScrollTrigger;
    gsap.registerPlugin(ST);

    if(window.__LENIS){
      window.__LENIS.on('scroll', ST.update);
      gsap.ticker.add(t=>window.__LENIS.raf(t*1000));
      gsap.ticker.lagSmoothing(0);
    }

    const allSections = document.querySelectorAll('main > section, .sec, .reviews-cta, .contact');
    allSections.forEach(sec=>{
      if(sec.classList.contains('prob')||sec.classList.contains('s2'))return;
      gsap.set(sec, { opacity: 0, scale: 0.97, filter: 'blur(8px)', y: 40 });
      ST.create({
        trigger: sec,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(sec, {
            opacity: 1, scale: 1, filter: 'blur(0px)', y: 0,
            duration: 1.1,
            ease: 'power3.out'
          });
        }
      });
    });

    const servicii = document.getElementById('servicii');
    if(servicii){
      const priceRows = servicii.querySelectorAll('.price-table tr:not(.pt-divider)');
      gsap.set(priceRows, { opacity: 0.3, x: -20 });
      ST.create({
        trigger: servicii,
        start: 'top top',
        end: '+=600',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          priceRows.forEach((row, i) => {
            const localP = Math.max(0, Math.min(1, (p * priceRows.length) - i));
            gsap.set(row, { opacity: 0.3 + 0.7 * localP, x: -20 + 20 * localP });
          });
        }
      });
    }

    const pachete = document.getElementById('pachete');
    if(pachete){
      const pkCards = pachete.querySelectorAll('.pk');
      gsap.set(pkCards, { opacity: 0, y: 80, scale: 0.92 });
      ST.create({
        trigger: pachete,
        start: 'top 70%',
        end: 'top 20%',
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          pkCards.forEach((card, i) => {
            const localP = Math.max(0, Math.min(1, (p * (pkCards.length + 1.5)) - i));
            const eased = 1 - Math.pow(1 - localP, 3);
            gsap.set(card, {
              opacity: eased,
              y: 80 * (1 - eased),
              scale: 0.92 + 0.08 * eased
            });
          });
        }
      });
    }

    const bgblobs = document.querySelector('.bgblobs');
    if(bgblobs){
      document.documentElement.style.setProperty('--scroll-tint', '0%');
      ST.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: (self) => {
          const p = self.progress;
          const r = Math.round(10 + Math.sin(p * Math.PI) * 8);
          const g = Math.round(10 + Math.sin(p * Math.PI) * 4);
          const b = Math.round(18 + Math.sin(p * Math.PI) * 22);
          bgblobs.style.background = `radial-gradient(ellipse at 50% ${20 + p*60}%, rgb(${r},${g},${b}) 0%, #050505 70%)`;
        }
      });
    }

    allSections.forEach((sec, idx) => {
      if(idx === 0)return;
      if(sec.classList.contains('prob')||sec.classList.contains('s2'))return;
      const cs = window.getComputedStyle(sec);
      const divider = document.createElement('div');
      divider.className = 'sec-divider-line';
      divider.style.cssText = [
        'position:absolute',
        'top:0','left:50%',
        'transform:translateX(-50%)',
        'width:0',
        'height:1px',
        'background:linear-gradient(90deg, transparent 0%, rgba(0,224,192,.4) 50%, transparent 100%)',
        'pointer-events:none',
        'z-index:5',
        'transition:width 1.2s cubic-bezier(.16,1,.3,1)'
      ].join(';');
      if(cs.position === 'static') sec.style.position = 'relative';
      sec.appendChild(divider);
      ST.create({
        trigger: sec,
        start: 'top 80%',
        once: true,
        onEnter: () => { divider.style.width = '60%'; }
      });
    });

    const eyebrows = document.querySelectorAll('.lb');
    eyebrows.forEach(eb => {
      const bar = document.createElement('span');
      bar.className = 'lb-accent-anim';
      bar.style.cssText = [
        'display:inline-block',
        'width:0',
        'height:1.5px',
        'background:var(--ac)',
        'margin-right:.6rem',
        'vertical-align:middle',
        'transition:width 0.8s cubic-bezier(.16,1,.3,1)'
      ].join(';');
      eb.insertBefore(bar, eb.firstChild);
      ST.create({
        trigger: eb,
        start: 'top 90%',
        once: true,
        onEnter: () => { bar.style.width = '32px'; }
      });
    });

    setTimeout(() => ST.refresh(), 200);
  }
})();
