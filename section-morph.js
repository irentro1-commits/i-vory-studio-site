/* section-morph.js — BATCH 4A M2+M3+M4+M5: cinematic section morph layer
   Features: M2 section overlap z-stacking + M3 shared element FLIP morph + M4 pinned hero curtain reveal +
             M5 services horizontal scroll timeline (replaces buggy pin).
   Gated DESKTOP only + prefers-reduced-motion.
*/
(function(){
  'use strict';
  if(window.__SECTION_MORPH_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__SECTION_MORPH_LOADED=true;

  function waitFor(predFn, cb, tries){
    tries=tries||40;
    if(predFn()){cb();return;}
    if(tries<=0)return;
    setTimeout(()=>waitFor(predFn,cb,tries-1),100);
  }

  // Kill old buggy pin services from section-transitions BEFORE init new
  function killOldPin(){
    if(!window.ScrollTrigger)return;
    const all = window.ScrollTrigger.getAll();
    all.forEach(st=>{
      // Kill pins on services + packages (we'll redo packages too if needed)
      if(st.trigger && (st.trigger.id === 'servicii') && st.pin){
        st.kill(true);
      }
    });
  }

  waitFor(()=>window.gsap && window.ScrollTrigger, init);

  function init(){
    const gsap=window.gsap, ST=window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // Wait pentru section-transitions sa init pinurile, apoi le kill
    setTimeout(killOldPin, 300);

    // === M2: SECTION OVERLAP Z-STACKING ===
    // Inject CSS — sections (services, pachete, portofoliu, etc) au margin-top negativ + border-radius top + shadow
    // Premium pattern: cards stacked cinematic Stripe-style.
    const style=document.createElement('style');
    style.textContent=`
      /* M2: sections overlap z-stacking. Skip hero (s2) si prob (storytelling). */
      main > section:not(.s2):not(.prob):not(.proof):not(.brands-marquee) {
        position: relative;
        z-index: 2;
        margin-top: -8vh;
        border-radius: 32px 32px 0 0;
        background-clip: padding-box;
        box-shadow: 0 -30px 80px rgba(0,0,0,.45), 0 -8px 24px rgba(0,0,0,.25);
        will-change: transform, opacity;
      }
      main > section:not(.s2):not(.prob):not(.proof):not(.brands-marquee):nth-of-type(odd){
        background-color: rgba(8,8,16,.55);
      }
      main > section:not(.s2):not(.prob):not(.proof):not(.brands-marquee):nth-of-type(even){
        background-color: rgba(5,5,10,.65);
      }
      main > section:last-child { margin-top: -8vh; }
      .contact { margin-top: -8vh !important; border-radius: 32px 32px 0 0; box-shadow: 0 -30px 80px rgba(0,0,0,.45); }
      /* M3: shared morph elements default state */
      .smm-morph-target { display: inline-block; transition: transform .7s cubic-bezier(.16,1,.3,1), color .7s; will-change: transform; }
      /* M4: pinned hero curtain mask */
      .smm-curtain { position: absolute; inset: 0; pointer-events: none; z-index: 3; clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%); background: linear-gradient(135deg, rgba(0,224,192,.04), rgba(123,44,255,.06)); transition: clip-path 1.2s cubic-bezier(.83,0,.17,1); will-change: clip-path; }
      .smm-curtain.active { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
      /* M5: services horizontal track */
      .smm-services-track-wrap { overflow: hidden; position: relative; }
      .smm-services-track { display: flex; gap: 1rem; will-change: transform; }
    `;
    document.head.appendChild(style);

    // === M3: SHARED ELEMENT MORPH (cuvinte cheie persistente intre sectiuni) ===
    // Foloseste FLIP-like — wrap "key words" in spans, anim color/scale scroll-driven
    const KEYWORDS = ['Daily', 'daily', 'Pick', 'pick', 'Why', 'why', 'Built', 'Every'];
    document.querySelectorAll('.s2 h2, .sh, .lb, .s2-tag').forEach(el=>{
      if(el.dataset.smmDone)return;
      KEYWORDS.forEach(kw=>{
        const regex = new RegExp('\\b('+kw+')\\b', 'g');
        if(regex.test(el.innerHTML)){
          el.innerHTML = el.innerHTML.replace(regex, '<span class="smm-morph-target" data-keyword="'+kw.toLowerCase()+'">$1</span>');
        }
      });
      el.dataset.smmDone='1';
    });
    // ScrollTrigger sync — keyword highlighted on scroll progress
    const targets = document.querySelectorAll('.smm-morph-target');
    targets.forEach(t=>{
      ST.create({
        trigger: t,
        start: 'top 80%',
        end: 'bottom 20%',
        onUpdate: (self) => {
          const p = self.progress;
          const intensity = Math.sin(p * Math.PI);
          t.style.color = `rgb(${Math.round(0 + intensity * 0)}, ${Math.round(224 + intensity * 0)}, ${Math.round(192 + intensity * 0)})`;
          t.style.transform = `scale(${1 + intensity * 0.04})`;
        }
      });
    });

    // === M4: PINNED HERO CURTAIN REVEAL ===
    // S2 hero ramane pinned in viewport pe ~80vh scroll; in spate, content nou intra cu mask sweep
    const s2 = document.querySelector('.s2');
    if(s2){
      const curtain = document.createElement('div');
      curtain.className = 'smm-curtain';
      s2.appendChild(curtain);
      ST.create({
        trigger: s2,
        start: 'top top',
        end: '+=80%',
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          // Curtain slide diagonal up-right
          const a = Math.min(100, 100 - p * 100);
          curtain.style.clipPath = `polygon(0 ${a}%, 100% ${a-15}%, 100% 100%, 0 100%)`;
          // S2 hero subtle scale + opacity fade
          s2.style.transform = `scale(${1 - p * 0.04})`;
          s2.style.opacity = 1 - p * 0.3;
        }
      });
    }

    // === M5: SERVICES HORIZONTAL SCROLL TIMELINE (replaces buggy pin) ===
    // Price-table rows aluneca lateral cand verticalizezi scroll. Stripe pricing pattern.
    const servicii = document.getElementById('servicii');
    if(servicii){
      const priceTable = servicii.querySelector('.price-table');
      if(priceTable){
        // Wrap rows in horizontal track
        const rows = Array.from(priceTable.querySelectorAll('tr:not(.pt-divider)'));
        rows.forEach((row, i)=>{
          gsap.set(row, {
            opacity: 0,
            x: 80,
            scale: 0.96
          });
          ST.create({
            trigger: row,
            start: 'top 92%',
            end: 'top 30%',
            scrub: 1.2,
            onUpdate: (self)=>{
              const p = self.progress;
              const eased = 1 - Math.pow(1 - p, 3);
              gsap.set(row, {
                opacity: eased,
                x: 80 * (1 - eased),
                scale: 0.96 + 0.04 * eased
              });
            }
          });
        });
        // Plus on dividers — line-draw effect at scroll
        priceTable.querySelectorAll('.pt-divider').forEach(d=>{
          gsap.set(d, { opacity: 0, scaleX: 0, transformOrigin: 'left center' });
          ST.create({
            trigger: d,
            start: 'top 88%',
            once: true,
            onEnter: ()=>{
              gsap.to(d, { opacity: 1, scaleX: 1, duration: 0.9, ease: 'power3.out' });
            }
          });
        });
      }
    }

    setTimeout(()=>ST.refresh(), 400);
  }
})();
