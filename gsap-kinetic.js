/* gsap-kinetic.js — U3 kinetic hero + magnetic buttons
   Desktop-only (>900px, fine pointer, motion allowed). Mobile skips entirely.
   Loads GSAP 3.12 core (free) from Cloudflare CDN on-demand.
   Guard: window.__KIN_LOADED blocks double-init. */
(function () {
  "use strict";
  if (window.__KIN_LOADED) return;
  window.__KIN_LOADED = true;

  // --- Desktop-only gate ---
  var isDesktop = window.innerWidth > 900;
  var isFinePtr = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isDesktop || !isFinePtr || reduced) return;

  // --- Dynamic GSAP load ---
  var GSAP_URL = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
  var s = document.createElement("script");
  s.src = GSAP_URL;
  s.defer = true;
  s.onload = function () {
    if (!window.gsap) return;
    initKinetic();
    initMagnetic();
  };
  s.onerror = function () {
    console.warn("gsap-kinetic: CDN load failed, skipping");
  };
  document.head.appendChild(s);

  // --- Kinetic: split h2 in section .s2 by chars, stagger on viewport ---
  function initKinetic() {
    var heading = document.querySelector(".s2 h2");
    if (!heading) return;
    // Preserve inner <br> and <span> — split only text nodes.
    splitTextNodes(heading);
    var chars = heading.querySelectorAll(".kin-char");
    if (!chars.length) return;

    window.gsap.set(chars, { opacity: 0, y: 18, display: "inline-block" });

    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !fired) {
          fired = true;
          window.gsap.to(chars, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.022,
            ease: "power3.out"
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(heading);
  }

  // Wrap each visible character in .kin-char span, preserve <br>, <span>, spaces.
  function splitTextNodes(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) textNodes.push(n);
    textNodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      var text = tn.nodeValue;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
        } else {
          var span = document.createElement("span");
          span.className = "kin-char";
          span.textContent = ch;
          frag.appendChild(span);
        }
      }
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  // --- Magnetic buttons: mousemove translate + ease return ---
  function initMagnetic() {
    var targets = document.querySelectorAll(".nc, .bh, .btn-pf");
    if (!targets.length) return;

    targets.forEach(function (el) {
      // Bbox cached per-enter to avoid thrashing getBoundingClientRect.
      var rect = null;
      var strength = 0.28; // 0.28 = subtle, not cartoonish
      var maxOffset = 14; // px clamp

      function onEnter() {
        rect = el.getBoundingClientRect();
      }
      function onMove(e) {
        if (!rect) rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) * strength;
        var dy = (e.clientY - cy) * strength;
        dx = Math.max(-maxOffset, Math.min(maxOffset, dx));
        dy = Math.max(-maxOffset, Math.min(maxOffset, dy));
        window.gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: "power2.out" });
      }
      function onLeave() {
        rect = null;
        window.gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      }

      el.addEventListener("mouseenter", onEnter, { passive: true });
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave, { passive: true });
    });
  }
})();
