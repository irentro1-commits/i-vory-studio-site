/* u4-transitions.js — U4 Lenis smooth scroll (desktop-only)
   View Transitions cross-document handled via @view-transition CSS in each page head.
   Desktop-only (>900px, fine pointer, motion allowed). Mobile skips entirely.
   Loads Lenis 1.1.20 from cdnjs on-demand.
   Guard: window.__U4_LOADED blocks double-init. */
(function () {
  "use strict";
  if (window.__U4_LOADED) return;
  window.__U4_LOADED = true;

  // --- Desktop-only gate ---
  var isDesktop = window.innerWidth > 900;
  var isFinePtr = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isDesktop || !isFinePtr || reduced) return;

  // --- Dynamic Lenis load ---
  // cdnjs hosts lenis under "lenis/<ver>/lenis.min.js" — fallback to unpkg if missing.
  var LENIS_PRIMARY = "https://cdnjs.cloudflare.com/ajax/libs/lenis/1.1.20/lenis.min.js";
  var LENIS_FALLBACK = "https://unpkg.com/lenis@1.1.20/dist/lenis.min.js";

  loadScript(LENIS_PRIMARY, function (ok) {
    if (ok && window.Lenis) return initLenis();
    // fallback
    loadScript(LENIS_FALLBACK, function (ok2) {
      if (ok2 && window.Lenis) initLenis();
      else console.warn("u4-transitions: Lenis CDN load failed, native scroll active");
    });
  });

  function loadScript(src, done) {
    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.onload = function () { done(true); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  function initLenis() {
    var lenis = new window.Lenis({
      duration: 1.05,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    var rafId = null;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Anchor links with Lenis smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href || href === "#" || href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      });
    });

    // Expose for debug
    window.__lenis = lenis;

    // Cleanup
    window.addEventListener("beforeunload", function () {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis && lenis.destroy) lenis.destroy();
    });
  }
})();
