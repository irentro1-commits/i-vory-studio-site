/* hero-center-fix.js — U50 force center hero h2/desc/tag/ctas pe desktop ≥1280px
   Cauza: design original .s2-content max-width:50% + text-align:left → arata urat pe desktop wide (1920px+).
   Fix CSS injectat. Pamantul + sateliti raman absolute positioned in spate. Mobile NEATINS.
*/
(function(){
  'use strict';
  if(window.__HERO_CENTER_FIX_LOADED)return;
  window.__HERO_CENTER_FIX_LOADED=true;

  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 1280px) {
      .s2-wrap { justify-content: center !important; }
      .s2-content {
        max-width: 1100px !important;
        margin: 0 auto !important;
        text-align: center !important;
        padding-left: 40px !important;
        padding-right: 40px !important;
      }
      .s2 h2, .s2-content h1, .s2-desc, .s2-tag, .s2-content .lb {
        text-align: center !important;
      }
      .s2-content .ctas, .s2-content .cta-row, .s2-content .bh, .s2-content .b-ghost {
        margin-left: auto !important;
        margin-right: auto !important;
      }
      .s2-content .ctas { display: flex !important; justify-content: center !important; gap: 1rem !important; flex-wrap: wrap !important; }
    }
  `;
  document.head.appendChild(style);
})();
