/* page-transitions-v2.js — BATCH 3 premium 2026 page transitions
   Strategy: View Transitions API native (Chrome 111+, Safari 18+, Edge) cu shared-element morphing.
   Fallback: custom fade+scale orchestrated overlay pentru browsers vechi.
   Smart preload: hover >120ms pe link intern → prefetch HTML in background.
   Triggers: <a href> pe acelasi origin (i-vory.ro/.studio).
*/
(function(){
  'use strict';
  if(window.__PAGE_TRANS_V2_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__PAGE_TRANS_V2_LOADED=true;

  const style=document.createElement('style');
  style.textContent=`
    .ptv2-overlay { position: fixed; inset: 0; background: #050505; z-index: 99997; pointer-events: none; opacity: 0; transition: opacity 0.42s cubic-bezier(.4,0,.2,1); will-change: opacity; }
    .ptv2-overlay.active { opacity: 1; pointer-events: auto; }
    @view-transition { navigation: auto; }
    ::view-transition-old(root) { animation: ptv2-fadeout 0.4s cubic-bezier(.4,0,.2,1) both; }
    ::view-transition-new(root) { animation: ptv2-fadein 0.55s cubic-bezier(.16,1,.3,1) both; animation-delay: 0.15s; }
    @keyframes ptv2-fadeout { to { opacity: 0; transform: scale(0.985) translateY(-8px); filter: blur(6px); } }
    @keyframes ptv2-fadein { from { opacity: 0; transform: scale(1.015) translateY(8px); filter: blur(6px); } }
    .pf-img[data-pt-name] { view-transition-name: var(--pt-name); }
  `;
  document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.className='ptv2-overlay';
  document.body.appendChild(overlay);

  const prefetched=new Set();
  function prefetchHTML(url){
    if(prefetched.has(url))return;
    prefetched.add(url);
    const link=document.createElement('link');
    link.rel='prefetch';
    link.href=url;
    document.head.appendChild(link);
  }
  let hoverTimer=null;
  document.addEventListener('mouseover', e=>{
    const link=e.target.closest && e.target.closest('a[href]');
    if(!link)return;
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:'))return;
    try{
      const url=new URL(href, location.origin);
      if(url.origin!==location.origin)return;
      if(hoverTimer)clearTimeout(hoverTimer);
      hoverTimer=setTimeout(()=>prefetchHTML(url.href), 120);
    }catch(_){}
  });
  document.addEventListener('mouseout', ()=>{ if(hoverTimer){clearTimeout(hoverTimer);hoverTimer=null;} });

  const supportsViewTrans = typeof document.startViewTransition === 'function';

  document.addEventListener('click', e=>{
    if(e.defaultPrevented)return;
    if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const link=e.target.closest && e.target.closest('a[href]');
    if(!link)return;
    if(link.target&&link.target!=='_self')return;
    if(link.hasAttribute('download'))return;
    const href=link.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return;
    let url;
    try{ url=new URL(href, location.origin); }catch(_){ return; }
    if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname && url.search===location.search) return;

    e.preventDefault();

    const sharedImg=link.querySelector('img.pf-img-img, .pf-img img');
    if(sharedImg){
      sharedImg.style.viewTransitionName='pf-shared-hero';
    }

    if(supportsViewTrans){
      document.startViewTransition(()=>{
        location.href=url.href;
      });
      return;
    }

    overlay.classList.add('active');
    document.body.style.transition='transform 0.4s cubic-bezier(.4,0,.2,1), filter 0.4s';
    document.body.style.transform='scale(0.99)';
    document.body.style.filter='blur(4px)';
    setTimeout(()=>{ location.href=url.href; }, 380);
  });

  if(document.referrer && document.referrer.indexOf(location.origin) === 0 && !supportsViewTrans){
    overlay.style.opacity='1';
    overlay.classList.add('active');
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        overlay.style.opacity='0';
        setTimeout(()=>overlay.classList.remove('active'), 500);
      });
    });
  }
})();
