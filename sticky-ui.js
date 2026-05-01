/* sticky-ui.js — BATCH 4B: sticky UI persistence layer (S1 + S2 + S3 + S4)
   Features: section number indicator + h2 sticky-top + section progress vertical bar + nav smooth morph.
   Gated DESKTOP only + prefers-reduced-motion respect.
*/
(function(){
  'use strict';
  if(window.__STICKY_UI_LOADED)return;
  if(window.__IS_MOBILE||window.__IS_INAPP)return;
  if(!window.matchMedia||!window.matchMedia("(pointer:fine)").matches)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  window.__STICKY_UI_LOADED=true;

  function init(){
    const sections = Array.from(document.querySelectorAll('main > section')).filter(s=>!s.classList.contains('prob'));

    // === S1: SECTION NUMBER INDICATOR sticky bottom-left ===
    const indicator = document.createElement('div');
    indicator.id = 'sui-section-num';
    indicator.style.cssText = [
      'position:fixed','bottom:32px','left:32px',
      'font-family:Geist Mono, monospace',
      'font-size:.7rem',
      'color:rgba(255,255,255,.55)',
      'letter-spacing:.18em',
      'text-transform:uppercase',
      'z-index:50',
      'pointer-events:none',
      'mix-blend-mode:difference',
      'transition:opacity .4s ease-out',
      'opacity:0'
    ].join(';');
    indicator.innerHTML = `<span id="sui-num">01</span><span style="opacity:.4"> / ${String(sections.length).padStart(2,'0')}</span><div id="sui-name" style="font-size:.62rem;letter-spacing:.22em;margin-top:6px;opacity:.7"></div>`;
    document.body.appendChild(indicator);

    const nameEl = indicator.querySelector('#sui-name');
    const numEl = indicator.querySelector('#sui-num');
    let currentIdx = -1;

    function pickSectionLabel(sec, idx){
      // Prefer eyebrow .lb text, else id, else fallback
      const eyebrow = sec.querySelector('.lb');
      if(eyebrow) return eyebrow.textContent.trim().toUpperCase().substring(0, 24);
      if(sec.id) return sec.id.toUpperCase();
      return 'SECTION';
    }

    function updateIndicator(){
      const scrollY = window.scrollY + window.innerHeight * 0.4;
      let active = 0;
      sections.forEach((sec, i)=>{
        const top = sec.offsetTop;
        if(scrollY >= top) active = i;
      });
      if(active !== currentIdx){
        currentIdx = active;
        numEl.textContent = String(active + 1).padStart(2, '0');
        nameEl.textContent = pickSectionLabel(sections[active], active);
      }
      indicator.style.opacity = window.scrollY > 200 ? '1' : '0';
    }
    window.addEventListener('scroll', updateIndicator, { passive: true });
    updateIndicator();

    // === S3: SECTION PROGRESS VERTICAL BAR (right side, dot indicators clickable) ===
    const progressBar = document.createElement('nav');
    progressBar.id = 'sui-progress';
    progressBar.setAttribute('aria-label', 'Section navigation');
    progressBar.style.cssText = [
      'position:fixed','top:50%','right:24px',
      'transform:translateY(-50%)',
      'display:flex','flex-direction:column',
      'gap:14px','z-index:48',
      'opacity:0',
      'transition:opacity .4s ease-out'
    ].join(';');
    sections.forEach((sec, i)=>{
      const dot = document.createElement('button');
      dot.dataset.idx = i;
      dot.title = pickSectionLabel(sec, i);
      dot.style.cssText = [
        'width:8px','height:8px','padding:0',
        'border-radius:50%',
        'border:1px solid rgba(255,255,255,.35)',
        'background:transparent',
        'cursor:pointer',
        'transition:width .35s cubic-bezier(.34,1.56,.64,1), height .35s, background .35s, border-color .35s',
        'pointer-events:auto'
      ].join(';');
      dot.addEventListener('click', ()=>{
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      progressBar.appendChild(dot);
    });
    document.body.appendChild(progressBar);

    function updateProgressDots(){
      const dots = progressBar.querySelectorAll('button');
      dots.forEach((d, i)=>{
        if(i === currentIdx){
          d.style.width = '12px';
          d.style.height = '12px';
          d.style.background = 'var(--ac, #00e0c0)';
          d.style.borderColor = 'var(--ac, #00e0c0)';
        } else {
          d.style.width = '8px';
          d.style.height = '8px';
          d.style.background = 'transparent';
          d.style.borderColor = 'rgba(255,255,255,.35)';
        }
      });
      progressBar.style.opacity = window.scrollY > 200 ? '1' : '0';
    }
    window.addEventListener('scroll', updateProgressDots, { passive: true });
    setTimeout(updateProgressDots, 100);

    // === S2: H2 STICKY-TOP IN CONTENT-HEAVY SECTIONS ===
    // Pe sectiuni cu lots of content (services, pachete, faq), titlul ramane sticky top cand scrollezi continutul.
    const stickyHeaders = ['servicii','pachete','faq'].map(id=>document.getElementById(id)).filter(Boolean);
    stickyHeaders.forEach(sec=>{
      const heading = sec.querySelector('.sh');
      if(!heading)return;
      const wrap = heading.closest('.si > .rv') || heading.parentElement;
      if(!wrap)return;
      wrap.style.position = 'sticky';
      wrap.style.top = '20px';
      wrap.style.zIndex = '5';
      wrap.style.background = 'transparent';
      wrap.style.paddingBottom = '1rem';
      wrap.style.transition = 'opacity .3s';
    });

    // === S4: NAV SMOOTH MORPH (transparent → solid on scroll) ===
    const nav = document.querySelector('nav.dock, header nav, .nav, .dock');
    if(nav){
      const navEl = nav.tagName === 'NAV' ? nav : nav.querySelector('nav') || nav;
      const initialBg = window.getComputedStyle(navEl).backgroundColor;
      const initialBorder = window.getComputedStyle(navEl).borderBottomColor;
      navEl.style.transition = 'background-color .35s ease-out, border-color .35s ease-out, backdrop-filter .35s, padding .3s';
      function updateNav(){
        const sy = window.scrollY;
        if(sy > 100){
          navEl.style.backgroundColor = 'rgba(5,5,10,.85)';
          navEl.style.backdropFilter = 'blur(20px) saturate(1.2)';
          navEl.style.borderBottom = '1px solid rgba(255,255,255,.08)';
        } else {
          navEl.style.backgroundColor = 'transparent';
          navEl.style.backdropFilter = 'blur(0)';
          navEl.style.borderBottom = '1px solid transparent';
        }
      }
      window.addEventListener('scroll', updateNav, { passive: true });
      updateNav();
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
