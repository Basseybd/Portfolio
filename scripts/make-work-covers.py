#!/usr/bin/env python3
"""Render the cover art for the Selected work wheel.

Capital One work has no screenshots (NDA), so every item gets an editorial
cover instead: a graphite or brushed aluminum ground, polished chrome details,
the title in Shippori Mincho, the outcome line, the stack in Fragment Mono, and
an abstract motif drawn for that project.

Content comes straight from lib/content.ts (selectedWork, then sideBuilds), read
through Node's type stripping, so the covers never drift from the site copy.

Usage, from the repo root:
    python3 scripts/make-work-covers.py            # all covers
    python3 scripts/make-work-covers.py build-migration

Output: public/work/<slug>.webp (1450x1000) and public/work/<slug>-725.webp.
Needs Python Playwright (chromium) and Pillow.
"""

from __future__ import annotations

import html
import io
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "work"
FONTS = ROOT / "node_modules" / "@fontsource"
W, H = 1450, 1000


def slugify(title: str) -> str:
    # Same rule as slugify() in components/work/WorksWheel.tsx.
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", title.lower()))


def load_items() -> list[dict]:
    js = (
        "import('./lib/content.ts').then(m => console.log(JSON.stringify("
        "{work: m.selectedWork, side: m.sideBuilds})))"
    )
    raw = subprocess.check_output(
        ["node", "--experimental-strip-types", "--no-warnings", "-e", js],
        cwd=ROOT,
        text=True,
    )
    data = json.loads(raw)
    items = []
    for w in data["work"]:
        items.append(
            {
                "slug": slugify(w["title"]),
                "kicker": "Capital One",
                "title": w["title"],
                "outcome": w["outcome"],
                "stack": w["stack"],
            }
        )
    for s in data["side"]:
        items.append(
            {
                "slug": slugify(s["title"]),
                "kicker": "Side build",
                "title": s["title"],
                "outcome": s["body"],
                "stack": [x.strip() for x in s["stack"].split(",")],
            }
        )
    return items


def font(family: str, path: str, weight: int) -> str:
    url = (FONTS / path).as_uri()
    return (
        f"@font-face{{font-family:'{family}';src:url('{url}') format('woff2');"
        f"font-weight:{weight};font-style:normal;}}"
    )


FONT_CSS = "".join(
    [
        font("Shippori Mincho", "shippori-mincho/files/shippori-mincho-latin-500-normal.woff2", 500),
        font("Shippori Mincho", "shippori-mincho/files/shippori-mincho-latin-400-normal.woff2", 400),
        font("Zen Kaku Gothic New", "zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-400-normal.woff2", 400),
        font("Zen Kaku Gothic New", "zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-500-normal.woff2", 500),
        font("Zen Kaku Gothic New", "zen-kaku-gothic-new/files/zen-kaku-gothic-new-latin-700-normal.woff2", 700),
        font("Fragment Mono", "fragment-mono/files/fragment-mono-latin-400-normal.woff2", 400),
    ]
)

# Grounds. Graphite reads as a dark lacquered panel, aluminum as brushed metal.
GROUNDS = {
    "graphite": {
        "ink": "#ECEDEB",
        "muted": "#A7ABAF",
        "rule": "rgba(201,205,209,0.22)",
        "css": (
            "background-color:#17181A;"
            "background-image:"
            "radial-gradient(90% 70% at 78% 18%, rgba(201,205,209,0.10), transparent 62%),"
            "radial-gradient(70% 60% at 0% 100%, rgba(0,0,0,0.45), transparent 70%),"
            "linear-gradient(180deg, #1c1d20 0%, #151618 100%);"
        ),
        "grain": 0.07,
        "shadow": "rgba(0,0,0,0.7)",
    },
    "aluminum": {
        "ink": "#141516",
        "muted": "#4A4D50",
        "rule": "rgba(20,21,22,0.22)",
        "css": (
            "background-color:#D4D7DA;"
            "background-image:"
            "radial-gradient(110% 70% at 16% 0%, rgba(255,255,255,0.62), transparent 60%),"
            "linear-gradient(104deg, rgba(255,255,255,0) 28%, rgba(255,255,255,0.32) 47%, rgba(255,255,255,0) 64%),"
            "linear-gradient(180deg, #d9dcde 0%, #c8ccd0 100%);"
        ),
        "grain": 0.10,
        "shadow": "rgba(20,21,22,0.38)",
    },
}

# Chrome: shared gradient and filter definitions used by every motif.
DEFS = """
<defs>
  <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f8f9fa"/>
    <stop offset="0.18" stop-color="#9da3a8"/>
    <stop offset="0.34" stop-color="#eef0f2"/>
    <stop offset="0.5" stop-color="#6e7378"/>
    <stop offset="0.62" stop-color="#d6dade"/>
    <stop offset="0.8" stop-color="#8d9398"/>
    <stop offset="1" stop-color="#f4f6f7"/>
  </linearGradient>
  <linearGradient id="chromeH" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6e7378"/>
    <stop offset="0.16" stop-color="#f4f6f7"/>
    <stop offset="0.32" stop-color="#9da3a8"/>
    <stop offset="0.5" stop-color="#e9ecee"/>
    <stop offset="0.68" stop-color="#7a8085"/>
    <stop offset="0.84" stop-color="#f8f9fa"/>
    <stop offset="1" stop-color="#8d9398"/>
  </linearGradient>
  <linearGradient id="chromeD" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f6f7f8"/>
    <stop offset="0.22" stop-color="#8d9398"/>
    <stop offset="0.45" stop-color="#eef0f2"/>
    <stop offset="0.7" stop-color="#6e7378"/>
    <stop offset="1" stop-color="#dfe3e6"/>
  </linearGradient>
  <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#fff" stop-opacity="1"/>
  </linearGradient>
  <mask id="taper" maskContentUnits="objectBoundingBox">
    <rect width="1" height="1" fill="url(#fadeL)"/>
  </mask>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="160%">
    <feGaussianBlur stdDeviation="9"/>
  </filter>
  <filter id="glint" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur stdDeviation="0.9"/>
  </filter>
</defs>
"""


def tube(d: str, width: float, shadow: str, grad: str = "chrome", extra: str = "") -> str:
    """A polished chrome tube along a path: soft cast shadow, dark rim, the
    reflective body, then a thin specular glint riding the top edge."""
    hi = max(1.6, width * 0.2)
    return f"""
    <g {extra}>
      <path d="{d}" fill="none" stroke="{shadow}" stroke-width="{width + 4}" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)" transform="translate(0 14)"/>
      <path d="{d}" fill="none" stroke="#3a3d40" stroke-width="{width + 2.5}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="{d}" fill="none" stroke="url(#{grad})" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="{d}" fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="{hi}" stroke-linecap="round" stroke-linejoin="round" filter="url(#glint)" transform="translate(0 {-width * 0.22:.2f})"/>
    </g>"""


def capsule(x: float, y: float, w: float, h: float, shadow: str) -> str:
    """A polished chrome bar or post, drawn as a rounded rect so the gradient
    always has a real box to span."""
    r = min(w, h) / 2
    grad = "chrome" if w >= h else "chromeH"
    if w >= h:
        glint = f'<rect x="{x + r * 0.6}" y="{y + h * 0.16}" width="{w - r * 1.2}" height="{max(1.6, h * 0.14)}" rx="1" fill="#fff" opacity="0.8" filter="url(#glint)"/>'
    else:
        glint = f'<rect x="{x + w * 0.2}" y="{y + r * 0.6}" width="{max(1.6, w * 0.14)}" height="{h - r * 1.2}" rx="1" fill="#fff" opacity="0.8" filter="url(#glint)"/>'
    return (
        f'<rect x="{x}" y="{y + 12}" width="{w}" height="{h}" rx="{r}" fill="{shadow}" filter="url(#soft)"/>'
        f'<rect x="{x - 1.25}" y="{y - 1.25}" width="{w + 2.5}" height="{h + 2.5}" rx="{r + 1.25}" fill="#3a3d40"/>'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="url(#{grad})"/>'
        + glint
    )


# Motifs. Each draws in the 1450x1000 cover space and leaves the lower left
# clear for the title block.


def motif_ai_message_assistant(g: dict) -> str:
    # An outgoing message under review: lines of text, one typo underlined,
    # one span of sensitive data caught and redacted, and the chrome check.
    rule, muted = g["rule"], g["muted"]
    x0, y0, w, h = 690, 96, 640, 430
    lines = [(0, 560), (1, 610), (2, 380), (3, 520), (4, 300)]
    out = [
        f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" rx="34" fill="rgba(255,255,255,0.025)" stroke="{rule}" stroke-width="2.5"/>',
        f'<circle cx="{x0 + 52}" cy="{y0 + 52}" r="14" fill="none" stroke="{muted}" stroke-width="2.5" opacity="0.7"/>',
        f'<rect x="{x0 + 82}" y="{y0 + 46}" width="150" height="12" rx="6" fill="{muted}" opacity="0.55"/>',
    ]
    for i, length in lines:
        y = y0 + 122 + i * 56
        if i == 1:
            # Sensitive span, caught and covered by a brushed metal bar.
            out.append(f'<rect x="{x0 + 52}" y="{y}" width="180" height="14" rx="7" fill="{muted}" opacity="0.5"/>')
            out.append(f'<rect x="{x0 + 250}" y="{y - 10}" width="230" height="34" rx="9" fill="url(#chromeH)"/>')
            out.append(f'<rect x="{x0 + 250}" y="{y - 10}" width="230" height="34" rx="9" fill="none" stroke="#2c2f32" stroke-width="2"/>')
            out.append(f'<rect x="{x0 + 498}" y="{y}" width="{length - 446}" height="14" rx="7" fill="{muted}" opacity="0.5"/>')
        elif i == 3:
            out.append(f'<rect x="{x0 + 52}" y="{y}" width="{length}" height="14" rx="7" fill="{muted}" opacity="0.5"/>')
            # Typo caught: a fine wavy underline under one word.
            wave = " ".join(
                f"q {9 if k % 2 == 0 else 9} {-7 if k % 2 == 0 else 7} 18 0" for k in range(9)
            )
            out.append(
                f'<path d="M {x0 + 230} {y + 32} {wave}" fill="none" stroke="#C9CDD1" stroke-width="3" stroke-linecap="round"/>'
            )
        else:
            out.append(f'<rect x="{x0 + 52}" y="{y}" width="{length}" height="14" rx="7" fill="{muted}" opacity="0.5"/>')
    out.append(tube("M 1080 478 L 1162 560 L 1352 330", 30, g["shadow"]))
    return "".join(out)


def motif_preference_aware_chat_prototype(g: dict) -> str:
    # The follow-up a good person would ask. A small bubble says seafood,
    # the chrome bubble answers with the question.
    ink, muted, rule = g["ink"], g["muted"], g["rule"]
    small = (
        f'<rect x="700" y="112" width="330" height="104" rx="52" fill="rgba(255,255,255,0.35)" stroke="{rule}" stroke-width="2.5"/>'
        f'<text x="865" y="178" text-anchor="middle" font-family="Zen Kaku Gothic New" font-weight="500" font-size="40" fill="{muted}">seafood</text>'
    )
    bubble = "M 812 268 H 1260 a 76 76 0 0 1 76 76 V 452 a 76 76 0 0 1 -76 76 H 1010 L 948 590 L 940 528 H 812 a 76 76 0 0 1 -76 -76 V 344 a 76 76 0 0 1 76 -76 Z"
    return (
        '<g transform="translate(40 0)">'
        + small
        + f'<path d="{bubble}" fill="rgba(255,255,255,0.28)"/>'
        + tube(bubble, 16, g["shadow"])
        + f'<text x="1036" y="426" text-anchor="middle" font-family="Shippori Mincho" font-weight="500" font-size="88" letter-spacing="-1.5" fill="{ink}">What kind?</text>'
        + "</g>"
    )


def motif_session_reliability_fix(g: dict) -> str:
    # Three open tabs that used to fight over one session, now held on a
    # single chrome thread. Four knots mark the four root causes, fixed.
    rule, muted = g["rule"], g["muted"]
    out = []
    for k in range(3):
        x, y = 660 + k * 130, 104 + k * 84
        tab = (
            f"M {x} {y + 64} V {y + 26} a 22 22 0 0 1 22 -22 H {x + 160} a 22 22 0 0 1 20 13 L {x + 196} {y + 64} "
            f"H {x + 420} a 20 20 0 0 1 20 20 V {y + 286} a 20 20 0 0 1 -20 20 H {x + 20} a 20 20 0 0 1 -20 -20 Z"
        )
        out.append(f'<path d="{tab}" fill="rgba(23,24,26,0.94)" stroke="{rule if k < 2 else muted}" stroke-width="2.5"/>')
        out.append(f'<rect x="{x + 34}" y="{y + 30}" width="96" height="10" rx="5" fill="{muted}" opacity="0.6"/>')
    thread = "M 590 430 C 740 430, 800 362, 940 362 S 1160 430, 1372 430"
    out.append(tube(thread, 12, g["shadow"]))
    for cx, cy in [(686, 422), (872, 368), (1058, 386), (1246, 426)]:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="21" fill="#17181A" stroke="url(#chromeD)" stroke-width="7"/>')
    # The session token itself, a polished capsule.
    out.append(capsule(1076, 606, 150, 44, g["shadow"]))
    out.append(f'<text x="1151" y="690" text-anchor="middle" font-family="Fragment Mono" font-size="22" letter-spacing="3" fill="{muted}">session</text>')
    return "".join(out)


def motif_build_migration(g: dict) -> str:
    # Speed lines. Long tapered chrome streaks pulling to the right, the way a
    # five minute build feels when it lands in two seconds.
    rows = [
        (150, 360, 18), (196, 620, 8), (236, 470, 26), (292, 760, 10), (330, 540, 14),
        (372, 880, 34), (430, 600, 9), (466, 700, 20), (512, 420, 7), (548, 520, 12),
    ]
    out = []
    for y, length, t in rows:
        x2 = 1360
        x1 = x2 - length
        out.append(
            f'<rect x="{x1}" y="{y + 10}" width="{length}" height="{t}" rx="{t / 2}" fill="{g["shadow"]}" opacity="0.5" filter="url(#soft)" mask="url(#taper)"/>'
        )
        out.append(f'<rect x="{x1}" y="{y}" width="{length}" height="{t}" rx="{t / 2}" fill="url(#chrome)" mask="url(#taper)"/>')
        out.append(
            f'<rect x="{x1 + length * 0.35}" y="{y + t * 0.18}" width="{length * 0.65}" height="{max(1.5, t * 0.16)}" rx="1" fill="#fff" opacity="0.75" mask="url(#taper)"/>'
        )
    # The finish: a polished post the streaks run into.
    out.append(capsule(1372, 112, 16, 500, g["shadow"]))
    return "".join(out)


def motif_react_upgrade_with_coding_agents(g: dict) -> str:
    # 79 files, every one passing. A grid of polished tiles with a fine check.
    out = []
    cols, size, gap = 12, 34, 10
    x0, y0 = 1366 - cols * (size + gap) + gap, 96
    n = 79
    for i in range(n):
        r, c = divmod(i, cols)
        x, y = x0 + c * (size + gap), y0 + r * (size + gap)
        out.append(f'<rect x="{x}" y="{y + 5}" width="{size}" height="{size}" rx="7" fill="{g["shadow"]}" opacity="0.6" filter="url(#glint)"/>')
        out.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="7" fill="url(#chromeD)"/>')
        out.append(
            f'<path d="M {x + 9} {y + 18} l 6 6 l 10 -12" fill="none" stroke="#2a2d30" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        )
    return "".join(out)


def motif_duckbot(g: dict) -> str:
    # A question goes in, an image comes out: a chrome speech mark beside a
    # dithered field resolving into a sphere, the way a generated image does.
    out = []
    cx, cy, R = 1106, 332, 232
    step = 22
    for gy in range(cy - R, cy + R + 1, step):
        for gx in range(cx - R, cx + R + 1, step):
            dx, dy = gx - cx, gy - cy
            d = (dx * dx + dy * dy) ** 0.5
            if d > R:
                continue
            light = max(0.0, 1 - ((dx + 90) ** 2 + (dy + 90) ** 2) ** 0.5 / (R * 1.7))
            r = 3 + 7.5 * (1 - light) * (1 - (d / R) ** 6) ** 0.5
            out.append(f'<circle cx="{gx}" cy="{gy}" r="{r:.2f}" fill="{g["ink"]}" opacity="0.82"/>')
    bubble = "M 640 152 H 796 a 46 46 0 0 1 46 46 V 262 a 46 46 0 0 1 -46 46 H 720 L 682 346 L 680 308 H 640 a 46 46 0 0 1 -46 -46 V 198 a 46 46 0 0 1 46 -46 Z"
    out.append(f'<path d="{bubble}" fill="rgba(255,255,255,0.3)"/>')
    out.append(tube(bubble, 12, g["shadow"]))
    for k in range(3):
        out.append(f'<circle cx="{678 + k * 40}" cy="230" r="9" fill="{g["ink"]}" opacity="0.75"/>')
    return "".join(out)


def motif_default(g: dict) -> str:
    return tube("M 1110 120 a 210 210 0 1 0 0.1 0", 22, g["shadow"])


# Wider measure where the motif sits high enough to let the title run long.
TITLE_WIDTH = {"react-upgrade-with-coding-agents": 1120}

MOTIFS = {
    "ai-message-assistant": (motif_ai_message_assistant, "graphite"),
    "preference-aware-chat-prototype": (motif_preference_aware_chat_prototype, "aluminum"),
    "session-reliability-fix": (motif_session_reliability_fix, "graphite"),
    "build-migration": (motif_build_migration, "aluminum"),
    "react-upgrade-with-coding-agents": (motif_react_upgrade_with_coding_agents, "graphite"),
    "duckbot": (motif_duckbot, "aluminum"),
}


def page(item: dict) -> str:
    fn, ground = MOTIFS.get(item["slug"], (motif_default, "graphite"))
    g = GROUNDS[ground]
    stack = "".join(f"<span>{html.escape(s)}</span>" for s in item["stack"])
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
{FONT_CSS}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:{W}px; height:{H}px; overflow:hidden; }}
body {{ {g["css"]} color:{g["ink"]}; position:relative; -webkit-font-smoothing:antialiased; }}
.brush {{ position:absolute; inset:0; opacity:{0.55 if ground == "aluminum" else 0.0};
  background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 1px, rgba(0,0,0,0.035) 1px 2px, rgba(255,255,255,0) 2px 3px); }}
.grain {{ position:absolute; inset:0; opacity:{g["grain"]}; mix-blend-mode:overlay; }}
svg.motif {{ position:absolute; inset:0; }}
.kicker {{ position:absolute; left:84px; top:76px; font:500 27px/1 'Zen Kaku Gothic New'; letter-spacing:0.01em; color:{g["muted"]}; }}
.kicker::before {{ content:""; display:inline-block; width:40px; height:2px; margin-right:18px; vertical-align:middle; background:{g["muted"]}; opacity:0.8; }}
.block {{ position:absolute; left:84px; right:84px; bottom:78px; }}
h1 {{ font:500 116px/0.98 'Shippori Mincho'; letter-spacing:-0.022em; max-width:{TITLE_WIDTH.get(item["slug"], 860)}px; text-wrap:balance; }}
.outcome {{ margin-top:30px; font:400 35px/1.3 'Zen Kaku Gothic New'; color:{g["muted"]}; max-width:900px; text-wrap:pretty; }}
.rule {{ margin-top:38px; height:2px; width:100%; background:{g["rule"]}; }}
.stack {{ margin-top:24px; display:flex; flex-wrap:wrap; gap:10px 34px; font:400 24px/1.2 'Fragment Mono'; letter-spacing:0.02em; color:{g["muted"]}; }}
</style></head><body>
<div class="brush"></div>
<svg class="grain" width="{W}" height="{H}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="{'0.004 0.95' if ground == 'aluminum' else '0.85'}" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
<svg class="motif" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{DEFS}{fn(g)}</svg>
<div class="kicker">{html.escape(item["kicker"])}</div>
<div class="block">
  <h1>{html.escape(item["title"])}</h1>
  <p class="outcome">{html.escape(item["outcome"])}</p>
  <div class="rule"></div>
  <div class="stack">{stack}</div>
</div>
</body></html>"""


def main() -> None:
    only = set(sys.argv[1:])
    items = [i for i in load_items() if not only or i["slug"] in only]
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p, tempfile.TemporaryDirectory() as tmp:
        browser = p.chromium.launch()
        pg = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for item in items:
            src = Path(tmp) / f"{item['slug']}.html"
            src.write_text(page(item), encoding="utf-8")
            pg.goto(src.as_uri())
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(120)
            png = pg.screenshot(type="png")
            img = Image.open(io.BytesIO(png)).convert("RGB")
            img.save(OUT / f"{item['slug']}.webp", "WEBP", quality=86, method=6)
            img.resize((W // 2, H // 2), Image.LANCZOS).save(
                OUT / f"{item['slug']}-725.webp", "WEBP", quality=84, method=6
            )
            print(f"wrote public/work/{item['slug']}.webp")
        browser.close()


if __name__ == "__main__":
    main()
