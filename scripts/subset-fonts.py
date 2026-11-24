"""Subset the variable fonts to the glyphs the site uses and narrow their axes to the ranges the
design uses (fewer variation deltas = smaller files).
Run:  python3 scripts/subset-fonts.py   (requires: pip install fonttools brotli)"""
import io
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'public' / 'fonts'
UNICODES = 'U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2010-2027,U+2030,U+2032-2033,U+2039-203A,U+2044,U+2122,U+2212,U+2215'
FEATURES = 'kern,liga,clig,calt,tnum,lnum,pnum,case,ccmp,locl,mark,mkmk'

JOBS = [
    ('archivo-full.woff2', 'archivo.woff2', {'wght': (400, 620), 'wdth': (100, 125)}),
    ('newsreader-full.woff2', 'newsreader.woff2', {'wght': (280, 420), 'opsz': (12, 72)}),
    ('newsreader-italic-full.woff2', 'newsreader-italic.woff2', {'wght': (280, 400), 'opsz': 48}),
]

for src, dst, axes in JOBS:
    opts = subset.Options()
    opts.layout_features = FEATURES.split(',')
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    font = subset.load_font(str(ROOT / 'fonts-src' / src), opts)
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(UNICODES))
    s.subset(font)
    buf = io.BytesIO()
    font.flavor = None
    font.save(buf)
    buf.seek(0)
    font = instancer.instantiateVariableFont(TTFont(buf), axes)
    font.flavor = 'woff2'
    font.save(str(OUT / dst))
    print(dst, (OUT / dst).stat().st_size)
