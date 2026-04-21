#!/usr/bin/env python3
"""LANG-SWITCH — injecteaza buton comutare limba RO <-> EN pe ambele domenii.

Per pagina:
  - Desktop nav: adauga <a class="nlang" data-lang-switch="..."> INAINTE de .nc (CTA WhatsApp)
  - Mobile menu (mm-nav): adauga item 06 Language
  - CSS: .nlang + hover (wrapped in MARKER style block)
  - JS: click handler smart path-match (wrapped in MARKER script block)

Idempotent via MARKER pairs (LANG_CSS_*, LANG_NAV_*, LANG_MM_*, LANG_JS_*).
Pre-strip existing markers pentru safe re-run.

Usage:
  # Pentru studio (EN site, switcher RO):
  python3 lang_switcher_inject.py studio

  # Pentru ro (RO site, switcher EN):
  python3 lang_switcher_inject.py ro
"""
import re
import sys
from pathlib import Path

SITE = sys.argv[1] if len(sys.argv) > 1 else ""
if SITE not in ("ro", "studio"):
    print("Usage: python3 lang_switcher_inject.py [ro|studio]")
    sys.exit(1)

# Determina root + target config
if SITE == "ro":
    ROOT = Path("/sessions/practical-cool-dirac/mnt/websites/ivory-ro/deploy")
    TARGET_LANG = "en"
    TARGET_DOMAIN = "https://i-vory.studio"
    BTN_LABEL = "EN"
    BTN_ARIA = "Switch to English version"
    BTN_TITLE = "English version"
    MM_LABEL = "English"
    # SVG: glob (go international)
    BTN_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
else:  # studio
    ROOT = Path("/sessions/practical-cool-dirac/mnt/websites/ivory-studio/deploy")
    TARGET_LANG = "ro"
    TARGET_DOMAIN = "https://i-vory.ro"
    BTN_LABEL = "RO"
    BTN_ARIA = "Schimba la versiunea romana"
    BTN_TITLE = "Versiunea romana"
    MM_LABEL = "Romana"
    # SVG: flag RO (3 stripes: blue yellow red)
    BTN_SVG = '<svg width="18" height="12" viewBox="0 0 3 2" aria-hidden="true" style="display:inline-block;vertical-align:middle;border:1px solid rgba(255,255,255,.18);border-radius:2px;flex-shrink:0"><rect x="0" y="0" width="1" height="2" fill="#002B7F"/><rect x="1" y="0" width="1" height="2" fill="#FCD116"/><rect x="2" y="0" width="1" height="2" fill="#CE1126"/></svg>'

# Pagini pe care NU injectam (hidden sau error)
SKIP_FILES = {"case/iorga.html", "404.html"}

# Fisiere-tinta (toate HTML-urile indexabile + blog posts)
TARGET_FILES = [
    "index.html",
    "portofoliu.html",
    "cookies.html",
    "gdpr.html",
    "privacy.html",
    "terms.html",
    "blog/index.html",
    "blog/cat-costa-social-media-romania-2026.html",
    "blog/ce-face-agentie-social-media-marketing.html",
    "blog/cum-alegi-agentie-social-media-2026.html",
    "blog/de-ce-ai-nevoie-de-social-media.html",
    "blog/tiktok-vs-instagram-2026.html",
    "case/ghibu.html",
    "case/popa.html",
    "case/urbancat.html",
]

# RO-only path pe i-vory.ro (fallback la homepage EN)
if SITE == "ro":
    TARGET_FILES.append("blog/metrici-reale-social-media-2026.html")

# ====== MARKERS ======
CSS_START = "<!-- LANG_CSS_START -->"
CSS_END = "<!-- LANG_CSS_END -->"
NAV_START = "<!-- LANG_NAV_START -->"
NAV_END = "<!-- LANG_NAV_END -->"
MM_START = "<!-- LANG_MM_START -->"
MM_END = "<!-- LANG_MM_END -->"
JS_START = "<!-- LANG_JS_START -->"
JS_END = "<!-- LANG_JS_END -->"

# ====== BLOCKS ======
CSS_BLOCK = f"""{CSS_START}
<style>
.nlang{{display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .7rem;margin:0 .5rem;border:1px solid rgba(255,255,255,.18);border-radius:999px;font-family:var(--sans);font-size:.78rem;font-weight:600;letter-spacing:.04em;color:rgba(255,255,255,.82);text-decoration:none;background:transparent;transition:all .25s cubic-bezier(.4,0,.2,1);white-space:nowrap}}
.nlang:hover{{border-color:rgba(0,224,192,.5);color:#fff;background:rgba(0,224,192,.08)}}
.nlang svg{{flex-shrink:0;opacity:.9}}
.nlang:hover svg{{opacity:1}}
.mm-lang{{display:flex;align-items:center;gap:.5rem;padding:.8rem 0;color:rgba(255,255,255,.72);font-family:var(--sans);font-size:.95rem;text-decoration:none;border-top:1px solid rgba(255,255,255,.08);margin-top:.8rem}}
.mm-lang svg{{flex-shrink:0}}
.mm-lang:hover{{color:#fff}}
@media(max-width:720px){{.nlang{{padding:.3rem .55rem;margin:0 .3rem}}.nlang span{{display:none}}}}
</style>
{CSS_END}"""

NAV_BLOCK = f"""{NAV_START}<a href="{TARGET_DOMAIN}/" class="nlang" data-lang-switch="{TARGET_LANG}" aria-label="{BTN_ARIA}" title="{BTN_TITLE}">{BTN_SVG}<span>{BTN_LABEL}</span></a>{NAV_END}"""

MM_BLOCK = f"""{MM_START}<a href="{TARGET_DOMAIN}/" class="mm-lang" data-lang-switch="{TARGET_LANG}" aria-label="{BTN_ARIA}">{BTN_SVG}<span>{MM_LABEL}</span></a>{MM_END}"""

JS_BLOCK = f"""{JS_START}
<script>
(function(){{
  var RO_ONLY=['/blog/metrici-reale-social-media-2026.html'];
  document.addEventListener('click',function(e){{
    var el=e.target.closest('[data-lang-switch]');
    if(!el)return;
    e.preventDefault();
    var lang=el.getAttribute('data-lang-switch');
    var domain=lang==='en'?'https://i-vory.studio':'https://i-vory.ro';
    var path=window.location.pathname;
    if(lang==='en'&&RO_ONLY.indexOf(path)!==-1){{
      window.location.href=domain+'/';
    }}else{{
      window.location.href=domain+path;
    }}
  }});
}})();
</script>
{JS_END}"""


def log(msg):
    print(msg, flush=True)


def strip_markers(content, start, end):
    """Remove any existing MARKER block (idempotent re-run)."""
    return re.sub(
        re.escape(start) + r".*?" + re.escape(end),
        "",
        content,
        flags=re.DOTALL
    )


def inject_page(rel_path):
    p = ROOT / rel_path
    if not p.exists():
        log(f"  SKIP {rel_path} (missing)")
        return False
    content = p.read_text(encoding="utf-8")

    # Pre-strip all previous markers
    content = strip_markers(content, CSS_START, CSS_END)
    content = strip_markers(content, NAV_START, NAV_END)
    content = strip_markers(content, MM_START, MM_END)
    content = strip_markers(content, JS_START, JS_END)

    # 1. CSS block inainte de </head>
    if "</head>" in content:
        content = content.replace("</head>", f"{CSS_BLOCK}\n</head>", 1)
    else:
        log(f"  WARN {rel_path}: no </head>")
        return False

    # 2. NAV block: match first WhatsApp anchor (nav CTA, by document order)
    # Catches both class="nc" (index) + inline-styled (blog posts)
    nav_pattern = re.compile(
        r'(<a\s+href="https://api\.whatsapp\.com[^"]*"[^>]*>[^<]*</a>)',
        re.DOTALL
    )
    new_content, nav_n = nav_pattern.subn(NAV_BLOCK + r'\1', content, count=1)

    # Fallback: inject as last <li> in <ul class="nk"> (legal/case pages without WA nav CTA)
    if nav_n == 0:
        nav_pattern_nk = re.compile(
            r'(<ul class="nk">[\s\S]*?)(</ul>)',
            re.DOTALL
        )
        nav_li_block = f'<li>{NAV_BLOCK}</li>'
        new_content, nav_n = nav_pattern_nk.subn(r'\1' + nav_li_block + r'\2', content, count=1)
        if nav_n == 0:
            log(f"  WARN {rel_path}: no nav target (WA CTA or ul.nk)")
    content = new_content

    # 3. MM block: inainte de </nav> in <nav class="mm-nav">...</nav>
    # Find the mm-nav block and inject at end
    mm_pattern = re.compile(r'(<nav class="mm-nav">.*?)(</nav>)', re.DOTALL)
    new_content, mm_n = mm_pattern.subn(r'\1' + MM_BLOCK + r'\2', content, count=1)
    if mm_n == 0:
        log(f"  WARN {rel_path}: mm-nav not matched (skipping mobile)")
    content = new_content

    # 4. JS block: inainte de </body> sau EOF fallback
    if "</body>" in content:
        content = content.replace("</body>", f"{JS_BLOCK}\n</body>", 1)
    else:
        # No </body> tag — append at EOF (browser auto-closes)
        if not content.endswith("\n"):
            content += "\n"
        content += JS_BLOCK + "\n"

    p.write_text(content, encoding="utf-8")
    log(f"  injected {rel_path} (nav={nav_n}, mm={mm_n})")
    return True


if __name__ == "__main__":
    log("=" * 70)
    log(f"LANG-SWITCH inject on i-vory.{SITE} ({len(TARGET_FILES)} files)")
    log(f"Target: {TARGET_DOMAIN} | Label: {BTN_LABEL}")
    log("=" * 70)
    ok = 0
    for rel in TARGET_FILES:
        if rel in SKIP_FILES:
            log(f"  SKIP {rel} (hidden/error)")
            continue
        if inject_page(rel):
            ok += 1
    log("=" * 70)
    log(f"DONE: {ok}/{len(TARGET_FILES)} pages injected")
    log("=" * 70)
