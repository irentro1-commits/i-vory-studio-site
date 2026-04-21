#!/usr/bin/env python3
"""PIVOT.9 UNBLOCK — i-vory.studio crawler unblock atomic.

Idempotent operations:
  1. Rewrite robots.txt (Disallow: / → Allow: /, keep iorga Disallow, add Sitemap ref)
  2. Rewrite _headers (remove X-Robots-Tag global line)
  3. Strip NOINDEX_BLOCK_START/END blocks from 18 HTML files (SKIP iorga — stays hidden)
  4. Normalize hreflang 3-way (en self + x-default + ro alternate) on indexable pages
  5. Refresh sitemap.xml lastmod → today

iorga.html remains blocked via:
  - Its own NOINDEX_BLOCK preserved (meta robots noindex)
  - robots.txt Disallow /case/iorga.html
  - sitemap exclusion (HIDE_IORGA comment block)

Run from workspace bash:
  python3 /sessions/practical-cool-dirac/mnt/websites/ivory-studio/deploy/_scripts/pivot9_unblock.py
"""
import re
import sys
from pathlib import Path

ROOT = Path("/sessions/practical-cool-dirac/mnt/websites/ivory-studio/deploy")
TODAY = "2026-04-21"

# Studio path → (studio URL segment after domain, ro URL segment after domain)
# None means NO ro equivalent → skip hreflang ro + x-default targets studio
HREFLANG_MAP = {
    "index.html":                                              ("", ""),
    "portofoliu.html":                                         ("portofoliu.html", "portofoliu.html"),
    "cookies.html":                                            ("cookies.html", "cookies.html"),
    "gdpr.html":                                               ("gdpr.html", "gdpr.html"),
    "privacy.html":                                            ("privacy.html", "privacy.html"),
    "terms.html":                                              ("terms.html", "terms.html"),
    "blog/index.html":                                         ("blog/", "blog/"),
    "blog/cat-costa-social-media-romania-2026.html":           ("blog/cat-costa-social-media-romania-2026.html",)*2,
    "blog/ce-face-agentie-social-media-marketing.html":        ("blog/ce-face-agentie-social-media-marketing.html",)*2,
    "blog/cum-alegi-agentie-social-media-2026.html":           ("blog/cum-alegi-agentie-social-media-2026.html",)*2,
    "blog/de-ce-ai-nevoie-de-social-media.html":               ("blog/de-ce-ai-nevoie-de-social-media.html",)*2,
    "blog/tiktok-vs-instagram-2026.html":                      ("blog/tiktok-vs-instagram-2026.html",)*2,
    "case/ghibu.html":                                         ("case/ghibu.html", "case/ghibu.html"),
    "case/popa.html":                                          ("case/popa.html", "case/popa.html"),
    "case/urbancat.html":                                      ("case/urbancat.html", "case/urbancat.html"),
}

# Files to strip NOINDEX_BLOCK from (everything except iorga which stays hidden)
STRIP_NOINDEX = list(HREFLANG_MAP.keys()) + ["portfolio.html", "404.html"]

# Markers
NOINDEX_START = "<!-- NOINDEX_BLOCK_START"
NOINDEX_END = "<!-- NOINDEX_BLOCK_END -->"

# Hreflang MARKER (idempotent injection wrapper)
HL_START = "<!-- HREFLANG_START PIVOT.9 -->"
HL_END = "<!-- HREFLANG_END PIVOT.9 -->"


def log(msg):
    print(msg, flush=True)


# ========================================================================
# STEP 1 — robots.txt
# ========================================================================
def rewrite_robots():
    robots_path = ROOT / "robots.txt"
    new_content = f"""# i-vory.studio — INDEXING ALLOWED (unblocked {TODAY})
# Dual-domain active: i-vory.ro (RO) + i-vory.studio (EN) with hreflang bidirectional.
# Note: /case/iorga.html remains blocked (client NDA — HIDE_IORGA policy).

User-agent: *
Allow: /
Disallow: /case/iorga.html

User-agent: GPTBot
Allow: /
Disallow: /case/iorga.html

User-agent: ClaudeBot
Allow: /
Disallow: /case/iorga.html

User-agent: Claude-Web
Allow: /
Disallow: /case/iorga.html

User-agent: PerplexityBot
Allow: /
Disallow: /case/iorga.html

User-agent: Google-Extended
Allow: /
Disallow: /case/iorga.html

User-agent: CCBot
Allow: /
Disallow: /case/iorga.html

Sitemap: https://i-vory.studio/sitemap.xml
"""
    robots_path.write_text(new_content, encoding="utf-8")
    log(f"[1/5] robots.txt rewritten → Allow: / (Disallow only iorga)")


# ========================================================================
# STEP 2 — _headers remove X-Robots-Tag
# ========================================================================
def rewrite_headers():
    headers_path = ROOT / "_headers"
    content = headers_path.read_text(encoding="utf-8")
    before = content.count("X-Robots-Tag:")
    # Remove any line starting with "  X-Robots-Tag:"
    content = re.sub(r"^\s*X-Robots-Tag:.*\n", "", content, flags=re.MULTILINE)
    after = content.count("X-Robots-Tag:")
    headers_path.write_text(content, encoding="utf-8")
    log(f"[2/5] _headers: removed {before - after} X-Robots-Tag lines (before={before}, after={after})")


# ========================================================================
# STEP 3 — strip NOINDEX_BLOCK from indexable files
# ========================================================================
def strip_noindex_block(rel_path):
    p = ROOT / rel_path
    if not p.exists():
        log(f"  SKIP {rel_path} (missing)")
        return False
    content = p.read_text(encoding="utf-8")
    # Match the entire NOINDEX_BLOCK (comment start to comment end, incl. content between)
    pattern = re.compile(
        r"\s*<!--\s*NOINDEX_BLOCK_START.*?<!--\s*NOINDEX_BLOCK_END\s*-->",
        re.DOTALL
    )
    new_content, n = pattern.subn("", content)
    if n > 0:
        p.write_text(new_content, encoding="utf-8")
        log(f"  stripped {rel_path} ({n} block(s))")
        return True
    else:
        log(f"  clean {rel_path} (already no block)")
        return False


def strip_all_noindex():
    log(f"[3/5] Strip NOINDEX_BLOCK from {len(STRIP_NOINDEX)} files (iorga preserved):")
    stripped = 0
    for rel in STRIP_NOINDEX:
        if strip_noindex_block(rel):
            stripped += 1
    log(f"[3/5] stripped {stripped} files (iorga.html intentionally skipped → stays hidden)")


# ========================================================================
# STEP 4 — normalize hreflang 3-way
# ========================================================================
def build_hreflang_block(studio_rel, ro_rel):
    """3-link hreflang block wrapped in idempotent marker."""
    studio_url = f"https://i-vory.studio/{studio_rel}" if studio_rel else "https://i-vory.studio/"
    ro_url = f"https://i-vory.ro/{ro_rel}" if ro_rel else "https://i-vory.ro/"
    return f"""{HL_START}
<link rel="alternate" hreflang="en" href="{studio_url}">
<link rel="alternate" hreflang="ro" href="{ro_url}">
<link rel="alternate" hreflang="x-default" href="{studio_url}">
{HL_END}"""


def normalize_hreflang(rel_path, studio_seg, ro_seg):
    p = ROOT / rel_path
    if not p.exists():
        log(f"  SKIP {rel_path} (missing)")
        return False
    content = p.read_text(encoding="utf-8")

    # Remove all existing <link rel="alternate" hreflang="..."> anywhere
    content = re.sub(
        r'\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*/?>\s*',
        "\n",
        content,
        flags=re.IGNORECASE
    )

    # Remove any previous HREFLANG_START...HREFLANG_END marker block (idempotent re-run)
    content = re.sub(
        re.escape(HL_START) + r".*?" + re.escape(HL_END),
        "",
        content,
        flags=re.DOTALL
    )

    # Inject NEW block right before </head>
    new_block = build_hreflang_block(studio_seg, ro_seg)

    if "</head>" in content:
        content = content.replace("</head>", f"{new_block}\n</head>", 1)
    else:
        log(f"  WARN {rel_path}: no </head> found, skipping")
        return False

    p.write_text(content, encoding="utf-8")
    return True


def normalize_all_hreflang():
    log(f"[4/5] Normalize hreflang 3-way on {len(HREFLANG_MAP)} files:")
    for rel, (studio_seg, ro_seg) in HREFLANG_MAP.items():
        if normalize_hreflang(rel, studio_seg, ro_seg):
            log(f"  ✓ {rel} → en+ro+x-default")
    log(f"[4/5] hreflang done")


# ========================================================================
# STEP 5 — sitemap lastmod refresh
# ========================================================================
def refresh_sitemap():
    sp = ROOT / "sitemap.xml"
    content = sp.read_text(encoding="utf-8")
    # Replace all <lastmod>YYYY-MM-DD</lastmod> with TODAY (but only for non-commented-out entries)
    # Simple approach: replace all in file
    new_content, n = re.subn(
        r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>",
        f"<lastmod>{TODAY}</lastmod>",
        content
    )
    sp.write_text(new_content, encoding="utf-8")
    log(f"[5/5] sitemap.xml: {n} lastmod entries refreshed → {TODAY}")


# ========================================================================
# MAIN
# ========================================================================
if __name__ == "__main__":
    log("=" * 70)
    log(f"PIVOT.9 UNBLOCK — i-vory.studio — {TODAY}")
    log("=" * 70)
    rewrite_robots()
    log("")
    rewrite_headers()
    log("")
    strip_all_noindex()
    log("")
    normalize_all_hreflang()
    log("")
    refresh_sitemap()
    log("")
    log("=" * 70)
    log("DONE — verify with grep + curl before commit")
    log("=" * 70)
