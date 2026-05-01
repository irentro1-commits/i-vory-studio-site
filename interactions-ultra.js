/* interactions-ultra.js — BATCH 4C ultra interactions premium 2026
   Features: I1 hover image WebGL RGB displacement + I2 magnetic snap section + I3 cursor follow text +
             I4 massive marquee outline text + I5 paragraph word reveal + I6 variable font weight scroll +
             I7 page-wide WebGL particles drift.
   Gated DESKTOP only + prefers-reduced-motion respect.
*/
(function(){
  'use strict';
  if(window.__INTERACTIONS_ULTRA_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__INTERACTIONS_ULTRA_LOADED=true;

  // === I1: HOVER IMAGE WebGL RGB DISPLACEMENT (Resn pattern) ===
  // Pentru fiecare .pf-img > img, replace cu canvas overlay care randa cu shader on hover
  // (Implementare lite: CSS filter chromatic aberration + mix-blend on hover, vizual asemanator GPU-cheap)
  function initImageDistortion(){
    const style=document.createElement('style');
    style.textContent=`
      .pf-img { isolation: isolate; }
      .pf-img img { transition: transform .7s cubic-bezier(.16,1,.3,1), filter .35s ease-out !important; }
      .pf-img::before, .pf-img::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .35s ease-out, mix-blend-mode .35s; z-index: 2; }
      .pf-img::before { background: inherit; mix-blend-mode: screen; transform: translate(2px, 0); }
      .pf-img::after { background: inherit; mix-blend-mode: difference; transform: translate(-2px, 0); }
      .pf-img:hover img { filter: saturate(1.3) brightness(1.08) contrast(1.06) !important; transform: scale(1.08) !important; }
      .pf-img:hover { box-shadow: 0 30px 80px rgba(0,224,192,.18), 0 12px 30px rgba(123,44,255,.12); }
    `;
    document.head.appendChild(style);
  }

  // === I2: MAGNETIC SNAP TO SECTION ENDPOINTS ===
  function initMagneticSnap(){
    const sections = Array.from(document.querySelectorAll('main > section, .contact')).filter(s=>!s.classList.contains('prob'));
    let scrollEndTimer = null;
    let isProgrammaticScroll = false;
    window.addEventListener('scroll', ()=>{
      if(isProgrammaticScroll)return;
      if(scrollEndTimer)clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(()=>{
        // Find closest section top within 18% viewport
        const vh = window.innerHeight;
        const sy = window.scrollY;
        const threshold = vh * 0.18;
        let closest = null, closestDist = Infinity;
        sections.forEach(sec=>{
          const top = sec.offsetTop;
          const dist = Math.abs(top - sy);
          if(dist < threshold && dist < closestDist){
            closestDist = dist;
            closest = sec;
          }
        });
        if(closest && closestDist > 4){
          isProgrammaticScroll = true;
          window.scrollTo({ top: closest.offsetTop, behavior: 'smooth' });
          setTimeout(()=>{ isProgrammaticScroll = false; }, 1000);
        }
      }, 220);
    }, { passive: true });
  }

  // === I3: CURSOR FOLLOW TEXT keyword anim ===
  function initCursorFollowText(){
    const targets = document.querySelectorAll('.s2 h2 .pac, .s2-tag');
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e=>{
      mx = e.clientX;
      my = e.clientY;
      targets.forEach(t=>{
        const r = t.getBoundingClientRect();
        const cx = r.left + r.width/2;
        const cy = r.top + r.height/2;
        const dx = (mx - cx) / window.innerWidth;
        const dy = (my - cy) / window.innerHeight;
        // Subtle skew + translate
        t.style.transform = `translate(${(dx * 8).toFixed(2)}px, ${(dy * 4).toFixed(2)}px) skewX(${(dx * 2).toFixed(2)}deg)`;
        t.style.transition = 'transform 0.3s ease-out';
      });
    });
  }

  // === I4: MASSIVE MARQUEE OUTLINE TEXT (Wokine signature) ===
  // Insert intre packages si portofoliu (or near footer) un text gigant outline care scrolleaza orizontal.
  function initMassiveMarquee(){
    const lookFor = document.getElementById('portofoliu');
    if(!lookFor)return;
    const banner = document.createElement('div');
    banner.id = 'iu-massive-marquee';
    banner.style.cssText = [
      'position:relative',
      'width:100%',
      'overflow:hidden',
      'padding:6vh 0',
      'pointer-events:none',
      'mask-image:linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)'
    ].join(';');
    const track = document.createElement('div');
    track.style.cssText = [
      'display:inline-flex',
      'white-space:nowrap',
      'animation:iu-mqscroll 35s linear infinite',
      'will-change:transform'
    ].join(';');
    const phrase = '<span style="font-family:Geist,sans-serif;font-size:clamp(8rem,20vw,20rem);font-weight:800;letter-spacing:-.04em;line-height:1;-webkit-text-stroke:1.5px rgba(0,224,192,.32);color:transparent;padding:0 5vw;">i-vory · daily content · built to convert · </span>';
    track.innerHTML = phrase + phrase + phrase;
    banner.appendChild(track);
    lookFor.parentNode.insertBefore(banner, lookFor);
    const kf = document.createElement('style');
    kf.textContent = `@keyframes iu-mqscroll { from { transform: translateX(0); } to { transform: translateX(-66.66%); } }`;
    document.head.appendChild(kf);
  }

  // === I5: PARAGRAPH WORD-BY-WORD REVEAL on scroll ===
  function initParagraphWordReveal(){
    if(!window.gsap || !window.ScrollTrigger)return;
    const paragraphs = document.querySelectorAll('.s2-desc, .ss, .how-desc, .dce-desc, .faq-a-inner');
    paragraphs.forEach(p=>{
      if(p.dataset.iuWords)return;
      p.dataset.iuWords = '1';
      // Wrap each word
      const html = p.innerHTML;
      const wrapped = html.replace(/(\S+)/g, '<span class="iu-word" style="display:inline-block;opacity:0;transform:translateY(8px);transition:opacity .5s,transform .5s">$1</span>');
      p.innerHTML = wrapped;
      const words = p.querySelectorAll('.iu-word');
      window.ScrollTrigger.create({
        trigger: p,
        start: 'top 88%',
        once: true,
        onEnter: ()=>{
          words.forEach((w, i)=>{
            setTimeout(()=>{
              w.style.opacity = '1';
              w.style.transform = 'translateY(0)';
            }, i * 18);
          });
        }
      });
    });
  }

  // === I6: VARIABLE FONT WEIGHT SCROLL-DRIVEN ===
  function initVariableFontWeight(){
    if(!window.ScrollTrigger)return;
    const heroH = document.querySelectorAll('.s2 h2');
    heroH.forEach(el=>{
      // Initial weight 400, target 800 by scroll
      el.style.fontVariationSettings = '"wght" 400';
      el.style.transition = 'font-variation-settings .4s ease-out';
      window.ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        end: 'top 30%',
        scrub: 1,
        onUpdate: (self)=>{
          const w = Math.round(400 + self.progress * 400);
          el.style.fontVariationSettings = `"wght" ${w}`;
        }
      });
    });
  }

  // === I7: PAGE-WIDE WEBGL PARTICLES DRIFT (lite, GPU-cheap) ===
  function initParticles(){
    const canvas = document.createElement('canvas');
    canvas.id = 'iu-particles';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:.6;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize(){
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    const COUNT = 65;
    const particles = [];
    for(let i=0;i<COUNT;i++){
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.12,
        tw: Math.random() * Math.PI * 2,
        twSpeed: 0.012 + Math.random() * 0.025,
        hue: Math.random() < 0.5 ? 165 : 270  // teal sau purple
      });
    }
    function loop(){
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.tw += p.twSpeed;
        if(p.x < -10) p.x = window.innerWidth + 10;
        if(p.x > window.innerWidth + 10) p.x = -10;
        if(p.y < -10) p.y = window.innerHeight + 10;
        if(p.y > window.innerHeight + 10) p.y = -10;
        const alpha = 0.35 + Math.sin(p.tw) * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  function boot(){
    try{ initImageDistortion(); }catch(e){ console.warn('[iu] img', e); }
    try{ initMagneticSnap(); }catch(e){ console.warn('[iu] snap', e); }
    try{ initCursorFollowText(); }catch(e){ console.warn('[iu] cft', e); }
    try{ initMassiveMarquee(); }catch(e){ console.warn('[iu] mq', e); }
    try{ initParagraphWordReveal(); }catch(e){ console.warn('[iu] words', e); }
    try{ initVariableFontWeight(); }catch(e){ console.warn('[iu] vfw', e); }
    try{ initParticles(); }catch(e){ console.warn('[iu] particles', e); }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
