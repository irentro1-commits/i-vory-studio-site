/* cursor-fx.js — BATCH 2B premium 2026 cursor + micro-interactions
   Features: cursor custom (dot+ring lerp) + cursor preview thumbnail portofoliu tabs +
             3D card tilt mousemove + hover image saturate/scale + tabs underline animat.
   Gated DESKTOP only.
*/
(function(){
  'use strict';
  if(window.__CURSOR_FX_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  window.__CURSOR_FX_LOADED=true;

  function initCustomCursor(){
    const style=document.createElement('style');
    style.textContent=`
      html, body { cursor: none !important; }
      a, button, .bh, .pk-btn, .pf-tab, .pf-img, [role=button], [data-cta], input, textarea, select { cursor: none !important; }
      .cfx-dot, .cfx-ring { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 99999; will-change: transform; }
      .cfx-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ac, #00e0c0); transform: translate(-50%, -50%); transition: opacity .25s, background .25s; }
      .cfx-ring { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid rgba(0,224,192,.55); transform: translate(-50%, -50%); transition: width .35s cubic-bezier(.34,1.56,.64,1), height .35s cubic-bezier(.34,1.56,.64,1), border-color .25s; }
      .cfx-ring.expand { width: 56px; height: 56px; border-color: rgba(0,224,192,.85); }
      .cfx-dot.hidden { opacity: 0; }
    `;
    document.head.appendChild(style);
    const dot=document.createElement('div'); dot.className='cfx-dot'; document.body.appendChild(dot);
    const ring=document.createElement('div'); ring.className='cfx-ring'; document.body.appendChild(ring);
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; dot.style.transform=`translate(${mx}px, ${my}px) translate(-50%,-50%)`; });
    function loop(){
      rx += (mx-rx)*0.18;
      ry += (my-ry)*0.18;
      ring.style.transform=`translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    const expandSel='a, button, .bh, .pk-btn, .pf-tab, .pf-img, [role=button], [data-cta], .pk, input, textarea, select';
    document.addEventListener('mouseover', e=>{
      if(e.target.closest && e.target.closest(expandSel)){ ring.classList.add('expand'); dot.classList.add('hidden'); }
    });
    document.addEventListener('mouseout', e=>{
      if(e.target.closest && e.target.closest(expandSel)){ ring.classList.remove('expand'); dot.classList.remove('hidden'); }
    });
    document.addEventListener('mouseleave', ()=>{ dot.style.opacity='0'; ring.style.opacity='0'; });
    document.addEventListener('mouseenter', ()=>{ dot.style.opacity='1'; ring.style.opacity='1'; });
  }

  function initCursorPreview(){
    const tabs=document.querySelectorAll('.pf-tab');
    if(!tabs.length)return;
    const previews={
      'ivory': '/portfolio2/design/carusel/promotional/ivory-1/1.webp',
      'urbancat': '/portfolio2/design/carusel/promotional/urbancat/1.webp',
      'popa': '/portfolio2/design/carusel/educational/avocat/1.webp'
    };
    const preview=document.createElement('div');
    preview.id='cfx-preview';
    preview.style.cssText=[
      'position:fixed','top:0','left:0','width:200px','height:260px',
      'pointer-events:none','z-index:99998',
      'background-size:cover','background-position:center',
      'border-radius:12px','box-shadow:0 20px 60px rgba(0,0,0,.5)',
      'opacity:0','transform:translate(-50%,-50%) scale(.85)',
      'transition:opacity .3s ease-out, transform .35s cubic-bezier(.34,1.56,.64,1)',
      'will-change:transform,opacity'
    ].join(';');
    document.body.appendChild(preview);
    let mx=0,my=0,rx=0,ry=0,active=false;
    document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });
    function loop(){
      rx += (mx-rx)*0.12;
      ry += (my-ry)*0.12;
      if(active) preview.style.transform=`translate(${rx-100}px, ${ry-130}px) scale(1)`;
      requestAnimationFrame(loop);
    }
    loop();
    tabs.forEach(tab=>{
      const key=tab.dataset.tab;
      tab.addEventListener('mouseenter', ()=>{
        if(previews[key]){
          preview.style.backgroundImage=`url('${previews[key]}')`;
          preview.style.opacity='1';
          active=true;
        }
      });
      tab.addEventListener('mouseleave', ()=>{
        preview.style.opacity='0';
        active=false;
      });
    });
  }

  function init3DTilt(){
    const cards=document.querySelectorAll('.pk, .pf-img');
    cards.forEach(card=>{
      card.style.transformStyle='preserve-3d';
      card.style.willChange='transform';
      let raf=null;
      card.addEventListener('mousemove', e=>{
        if(raf)cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          const r=card.getBoundingClientRect();
          const x=(e.clientX-r.left)/r.width-0.5;
          const y=(e.clientY-r.top)/r.height-0.5;
          const rotX=(-y*7).toFixed(2);
          const rotY=(x*7).toFixed(2);
          card.style.transform=`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
          card.style.transition='transform 0.12s ease-out';
        });
      });
      card.addEventListener('mouseleave', ()=>{
        if(raf)cancelAnimationFrame(raf);
        card.style.transform='perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
        card.style.transition='transform 0.5s cubic-bezier(.34,1.56,.64,1)';
      });
    });
  }

  function initHoverDistortion(){
    const style=document.createElement('style');
    style.textContent=`
      .pf-img img { transition: transform .55s cubic-bezier(.16,1,.3,1), filter .35s ease-out !important; }
      .pf-img:hover img { transform: scale(1.06) !important; filter: saturate(1.2) brightness(1.06) !important; }
    `;
    document.head.appendChild(style);
  }

  function initTabsIndicator(){
    const tabsContainer=document.querySelector('.pf-tabs');
    if(!tabsContainer)return;
    const tabs=tabsContainer.querySelectorAll('.pf-tab');
    if(!tabs.length)return;
    const indicator=document.createElement('div');
    indicator.style.cssText=[
      'position:absolute','bottom:-4px','left:0',
      'height:2px','background:var(--ac,#00e0c0)',
      'border-radius:1px',
      'transition:left .5s cubic-bezier(.34,1.56,.64,1), width .5s cubic-bezier(.34,1.56,.64,1)',
      'pointer-events:none'
    ].join(';');
    const cs=window.getComputedStyle(tabsContainer);
    if(cs.position==='static')tabsContainer.style.position='relative';
    tabsContainer.appendChild(indicator);
    function move(tab){
      const r=tab.getBoundingClientRect();
      const cr=tabsContainer.getBoundingClientRect();
      indicator.style.left=(r.left-cr.left)+'px';
      indicator.style.width=r.width+'px';
    }
    const initialActive=tabsContainer.querySelector('.pf-tab.active')||tabs[0];
    setTimeout(()=>move(initialActive), 100);
    tabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{ setTimeout(()=>move(tab), 50); });
    });
    window.addEventListener('resize', ()=>{
      const a=tabsContainer.querySelector('.pf-tab.active');
      if(a)move(a);
    });
  }

  function boot(){
    try{ initCustomCursor(); }catch(e){console.warn('[cursor-fx] cc',e);}
    try{ initCursorPreview(); }catch(e){console.warn('[cursor-fx] cp',e);}
    try{ init3DTilt(); }catch(e){console.warn('[cursor-fx] tilt',e);}
    try{ initHoverDistortion(); }catch(e){console.warn('[cursor-fx] hd',e);}
    try{ initTabsIndicator(); }catch(e){console.warn('[cursor-fx] tabs',e);}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
