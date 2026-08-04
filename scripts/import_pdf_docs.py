"""Import archival PDF text extracts into editable markdown. One-off helper."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]


def extract_pdf_text(pdf_path: Path) -> str:
    import pdfplumber

    parts: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n\n".join(parts)


def normalize(text: str) -> str:
    replacements = {
        "\u2014": "---",
        "\u2013": "-",
        "\u2022": "-",
        "\u2264": "<=",
        "\u00b7": "-",
        "\u2026": "...",
        "\u201c": '"',
        "\u201d": '"',
        "\u2018": "'",
        "\u2019": "'",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def main() -> int:
    master_pdf = REPO / "chipin-master-v1.2.md.pdf"
    design_pdf = REPO / "Chip In Design Markdown.md.pdf"
    if not master_pdf.exists() or not design_pdf.exists():
        print("PDF archives missing; pull origin/main first.", file=sys.stderr)
        return 1

    try:
        import pdfplumber  # noqa: F401
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber", "--quiet"])

    docs = REPO / "docs"
    brand = REPO / "chipin-brand"
    docs.mkdir(exist_ok=True)
    brand.mkdir(exist_ok=True)

    master_body = normalize(extract_pdf_text(master_pdf))
    design_body = normalize(extract_pdf_text(design_pdf))

    master_md = (
        "# ChipIn --- Project Master Document\n\n"
        "> Canonical editable copy imported from `chipin-master-v1.2.md.pdf` "
        "(archival PDF at repo root).\n"
        "> Version 1.2 --- brand locked, Stage 0 ready.\n"
        "> Owner: Lanardo \"Nardo\" Gibson --- First Glance Bahamas / "
        "Traceline Bahamas Ltd.\n"
        "> Status: Pre-build validation (Stage 0). Domain: chipin242.com "
        "(primary); chipin.bs (secondary redirect).\n\n"
        "---\n\n"
        f"{master_body}"
    )

    design_md = (
        "# ChipIn --- DESIGN.md\n\n"
        "> Canonical editable copy imported from "
        "`Chip In Design Markdown.md.pdf` (archival PDF at repo root).\n"
        "> Version 1.0 --- locked brand foundation, working design system.\n"
        "> Authoritative brand reference. SVG/PWA assets belong in "
        "`chipin-brand/` when supplied.\n"
        "> Parent: [Project Master Document v1.2]"
        "(../docs/chipin-master-v1.2.md).\n\n"
        "---\n\n"
        f"{design_body}"
    )

    (docs / "chipin-master-v1.2.md").write_text(master_md, encoding="utf-8")
    (brand / "DESIGN.md").write_text(design_md, encoding="utf-8")
    print(f"wrote {docs / 'chipin-master-v1.2.md'}")
    print(f"wrote {brand / 'DESIGN.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
