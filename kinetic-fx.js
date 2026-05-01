/* kinetic-fx.js — BATCH 2C premium 2026 kinetic typography + polish
   Features: hero h1 SplitText amplify + section headers vertical accent line +
             marquee dramatic + idle ambient anims + scroll progress indicator top.
   Gated DESKTOP only.
*/
(function(){
  'use strict';
  if(window.__KINETIC_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  window.__KINETIC_FX_LOADED=true;

  function initHeroAmplify(){
    if(!window.gsap)return;
    const heroH=document.querySelectorAll('.s2 h2, .s2 .s2-tag');
    heroH.forEach(el=>{
      if(el.dataset.splitDone)return;
      el.dataset.splitDone='1';
      const html=el.innerHTML;
      const wrapped=html.replace(/(>)([^<]+)(<)/g, (m, a, txt, c)=>{
        const chars=txt.split('').map(ch=>ch===' '?' ':`<span class="kfx-char">${ch}</span>`).join('');
        return a+chars+c;
      });
      el.innerHTML=wrapped;
      const chars=el.querySelectorAll('.kfx-char');
      window.gsap.set(chars, { y: '100%', opacity: 0, display: 'inline-block' });
      window.gsap.to(chars, {
        y: '0%', opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.022,
        delay: 0.3
      });
    });
  }

  function initVerticalAccent(){
    const headers=document.querySelectorAll('.sh');
    headers.forEach(h=>{
      if(h.dataset.kfxBar)return;
      h.dataset.kfxBar='1';
      const cs=window.getComputedStyle(h);
      if(cs.position==='static')h.style.position='relative';
      const bar=document.createElement('span');
      bar.style.cssText=[
        'position:absolute',
        'left:-20px','top:50%',
        'transform:translateY(-50%)',
        'width:2px',
        'height:0',
        'background:var(--ac,#00e0c0)',
        'transition:height 0.9s cubic-bezier(.16,1,.3,1)'
      ].join(';');
      h.appendChild(bar);
      const io=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            bar.style.height='65%';
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      io.observe(h);
    });
  }

  function initMarqueeDramatic(){
    const marquees=document.querySelectorAll('.mq, .brands-marquee .mq-wrap');
    marquees.forEach(mq=>{
      const cs=window.getComputedStyle(mq);
      if(cs.position==='static')mq.style.position='relative';
      mq.style.maskImage='linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)';
      mq.style.webkitMaskImage='linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)';
      const track=mq.querySelector('.mt, .mq-track');
      if(track){
        mq.addEventListener('mouseenter', ()=>{ track.style.animationPlayState='paused'; });
        mq.addEventListener('mouseleave', ()=>{ track.style.animationPlayState='running'; });
      }
    });
  }

  function initIdleAnims(){
    let idleTimer=null;
    let isIdle=false;
    const IDLE_MS=5000;
    function setIdle(state){
      if(isIdle===state)return;
      isIdle=state;
      document.body.classList.toggle('kfx-idle', state);
    }
    function resetIdle(){
      setIdle(false);
      if(idleTimer)clearTimeout(idleTimer);
      idleTimer=setTimeout(()=>setIdle(true), IDLE_MS);
    }
    ['mousemove','scroll','keydown','touchstart'].forEach(evt=>{
      window.addEventListener(evt, resetIdle, {passive:true});
    });
    resetIdle();
    const style=document.createElement('style');
    style.textContent=`
      @keyframes kfx-pulse-idle { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
      @keyframes kfx-glow-idle { 0%,100% { filter: drop-shadow(0 0 28px rgba(186,85,211,.7)); } 50% { filter: drop-shadow(0 0 42px rgba(186,85,211,1)); } }
      body.kfx-idle .hero3d canvas { animation: kfx-pulse-idle 4s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
  }

  function initScrollProgress(){
    const bar=document.createElement('div');
    bar.id='kfx-scroll-progress';
    bar.style.cssText=[
      'position:fixed','top:0','left:0',
      'height:2px',
      'width:0',
      'background:linear-gradient(90deg, var(--ac,#00e0c0), #7b2cff)',
      'z-index:9999',
      'pointer-events:none',
      'transition:width 0.1s linear'
    ].join(';');
    document.body.appendChild(bar);
    function update(){
      const sh=document.documentElement.scrollHeight - window.innerHeight;
      const st=window.scrollY||document.documentElement.scrollTop;
      const pct=sh>0?(st/sh)*100:0;
      bar.style.width=pct.toFixed(2)+'%';
    }
    window.addEventListener('scroll', update, {passive:true});
    update();
  }

  function boot(){
    try{ initHeroAmplify(); }catch(e){console.warn('[kinetic-fx] hero',e);}
    try{ initVerticalAccent(); }catch(e){console.warn('[kinetic-fx] vert',e);}
    try{ initMarqueeDramatic(); }catch(e){console.warn('[kinetic-fx] mq',e);}
    try{ initIdleAnims(); }catch(e){console.warn('[kinetic-fx] idle',e);}
    try{ initScrollProgress(); }catch(e){console.warn('[kinetic-fx] sp',e);}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
