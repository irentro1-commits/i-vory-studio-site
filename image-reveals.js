/* image-reveals.js — BATCH 3 premium 2026 image clip-path reveals + h2 line-by-line text reveal
   Features: scroll-driven mask reveal pe portofoliu cards (clip-path inset) + section headers split lines.
   Gated DESKTOP only + prefers-reduced-motion respect.
*/
(function(){
  'use strict';
  if(window.__IMAGE_REVEALS_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__IMAGE_REVEALS_LOADED=true;

  function waitFor(predFn, cb, tries){
    tries=tries||40;
    if(predFn()){cb();return;}
    if(tries<=0)return;
    setTimeout(()=>waitFor(predFn,cb,tries-1),100);
  }

  waitFor(()=>window.gsap && window.ScrollTrigger, init);

  function init(){
    const gsap=window.gsap, ST=window.ScrollTrigger;
    gsap.registerPlugin(ST);

    const pfImgs=document.querySelectorAll('.pf-img');
    pfImgs.forEach(img=>{
      gsap.set(img, { clipPath: 'inset(100% 0 0 0)' });
      ST.create({
        trigger: img,
        start: 'top 85%',
        once: true,
        onEnter: ()=>{
          gsap.to(img, {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.4,
            ease: 'power3.out'
          });
        }
      });
    });

    const h2s=document.querySelectorAll('.sh, .contact-h, .reviews-cta-title');
    h2s.forEach(h=>{
      if(h.dataset.irDone)return;
      h.dataset.irDone='1';
      const html=h.innerHTML;
      const lines=html.split(/<br\s*\/?>/i);
      const wrapped=lines.map(line=>{
        return `<span class="ir-line-mask" style="display:block;overflow:hidden;line-height:1.1"><span class="ir-line-inner" style="display:inline-block;transform:translateY(100%);will-change:transform">${line}</span></span>`;
      }).join('');
      h.innerHTML=wrapped;
      const inners=h.querySelectorAll('.ir-line-inner');
      ST.create({
        trigger: h,
        start: 'top 85%',
        once: true,
        onEnter: ()=>{
          gsap.to(inners, {
            y: '0%',
            duration: 0.95,
            ease: 'power3.out',
            stagger: 0.08
          });
        }
      });
    });

    const subs=document.querySelectorAll('.ss, .s2 .s2-desc, .contact-s');
    subs.forEach(s=>{
      gsap.set(s, { opacity: 0, y: 24, filter: 'blur(4px)' });
      ST.create({
        trigger: s,
        start: 'top 88%',
        once: true,
        onEnter: ()=>{
          gsap.to(s, {
            opacity: 1, y: 0, filter: 'blur(0)',
            duration: 1.0,
            ease: 'power2.out',
            delay: 0.15
          });
        }
      });
    });

    const rows=document.querySelectorAll('.price-table tr:not(.pt-divider)');
    rows.forEach((row, i)=>{
      gsap.set(row, { opacity: 0, x: -30 });
      ST.create({
        trigger: row,
        start: 'top 90%',
        once: true,
        onEnter: ()=>{
          gsap.to(row, {
            opacity: 1, x: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: i * 0.04
          });
        }
      });
    });

    const items=document.querySelectorAll('.how-item, .dce-item, .faq-item');
    items.forEach(item=>{
      gsap.set(item, { opacity: 0, x: -40 });
      ST.create({
        trigger: item,
        start: 'top 88%',
        once: true,
        onEnter: ()=>{
          gsap.to(item, {
            opacity: 1, x: 0,
            duration: 0.85,
            ease: 'power3.out'
          });
        }
      });
    });

    setTimeout(()=>ST.refresh(), 200);
  }
})();
