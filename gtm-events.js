/* =============================================================================
   i-vory Studio GTM Event Tracking
   Universal dataLayer pushes for key conversion events.
   Works with any GTM container - configure tags/triggers in GTM UI.
   ============================================================================= */
(function () {
  'use strict';
  window.dataLayer = window.dataLayer || [];

  function push(event, params) {
    params = params || {};
    params.event = event;
    window.dataLayer.push(params);
  }

  /* --- 1. WhatsApp clicks (CTA primary) ------------------------------------ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp.com/send"]');
    if (!link) return;
    push('whatsapp_click', {
      link_url: link.href,
      link_location: getLinkLocation(link),
      page_path: window.location.pathname
    });
  }, true);

  /* --- 2. Calendly clicks (CTA secondary) ---------------------------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="calendly.com"]');
    if (!link) return;
    push('calendly_click', {
      link_url: link.href,
      link_location: getLinkLocation(link),
      page_path: window.location.pathname
    });
  }, true);

  /* --- 3. Phone clicks ------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    push('phone_click', {
      phone_number: link.href.replace('tel:', ''),
      page_path: window.location.pathname
    });
  }, true);

  /* --- 4. Email clicks ------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="mailto:"]');
    if (!link) return;
    push('email_click', {
      email: link.href.replace('mailto:', ''),
      page_path: window.location.pathname
    });
  }, true);

  /* --- 5. Google Review clicks --------------------------------------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="search.google.com/local/writereview"]');
    if (!link) return;
    push('review_click', { page_path: window.location.pathname });
  }, true);

  /* --- 6. Scroll depth (25/50/75/100%) ------------------------------------- */
  var scrollMarks = { 25: false, 50: false, 75: false, 100: false };
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    requestAnimationFrame(function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) { ticking = false; return; }
      var pct = Math.round((window.scrollY / scrollable) * 100);
      Object.keys(scrollMarks).forEach(function (mark) {
        var m = parseInt(mark, 10);
        if (!scrollMarks[m] && pct >= m) {
          scrollMarks[m] = true;
          push('scroll_depth', { percent_scrolled: m, page_path: window.location.pathname });
        }
      });
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  /* --- 7. Time engaged (15/30/60/180 sec) ---------------------------------- */
  var timeMarks = [15, 30, 60, 180];
  var startTime = Date.now();
  timeMarks.forEach(function (sec) {
    setTimeout(function () {
      if (document.visibilityState === 'visible') {
        push('time_engaged', { seconds: sec, page_path: window.location.pathname });
      }
    }, sec * 1000);
  });

  /* --- 8. Video plays ------------------------------------------------------- */
  document.addEventListener('play', function (e) {
    if (e.target.tagName !== 'VIDEO') return;
    var src = e.target.currentSrc || (e.target.querySelector('source') || {}).src || '';
    push('video_play', {
      video_src: src,
      page_path: window.location.pathname
    });
  }, true);

  /* --- 9. External link clicks (non-i-vory.studio) ----------------------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="http"]');
    if (!link) return;
    var href = link.href;
    if (href.indexOf('i-vory.studio') !== -1) return;
    if (href.match(/wa\.me|whatsapp\.com|calendly\.com|search\.google\.com\/local/)) return;
    push('external_link', { link_url: href, page_path: window.location.pathname });
  }, true);

  /* --- 10. Form submission ------------------------------------------------- */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.tagName !== 'FORM') return;
    push('form_submit', {
      form_id: form.id || 'unnamed',
      form_action: form.action || '',
      page_path: window.location.pathname
    });
  }, true);

  /* --- 11. Generic CTA click (data-cta attribute) -------------------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-cta]');
    if (!el) return;
    push('click_cta', {
      cta_id: el.getAttribute('data-cta') || 'unknown',
      cta_label: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 80),
      cta_location: getLinkLocation(el),
      page_path: window.location.pathname
    });
  }, true);

  /* --- 12. Hero video unmute ----------------------------------------------- */
  document.addEventListener('click', function (e) {
    var vid = e.target.closest('video');
    if (!vid) return;
    if (vid.muted) return;
    push('video_unmute', {
      video_id: vid.id || 'unnamed',
      page_path: window.location.pathname
    });
  }, true);

  /* --- 13. Portfolio link clicks (any -> /portofoliu) ---------------------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="portofoliu"]');
    if (!link) return;
    push('portfolio_click', {
      link_url: link.href,
      link_location: getLinkLocation(link),
      page_path: window.location.pathname
    });
  }, true);

  /* --- Helper: detect where on page the link was clicked ------------------- */
  function getLinkLocation(link) {
    if (link.closest('nav, header, .nav, #nav'))       return 'header';
    if (link.closest('footer, .footer, #footer'))      return 'footer';
    if (link.closest('.hero, .p-hero, #hero'))         return 'hero';
    if (link.closest('.cta, #contact, .contact'))      return 'cta';
    if (link.closest('.wa-float, [class*="whatsapp-float"]')) return 'floating_button';
    return 'body';
  }

  /* --- Initial page_view (GA4 sends this auto, but we push for clarity) ---- */
  push('page_view_custom', {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href
  });
})();
