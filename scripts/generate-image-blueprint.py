#!/usr/bin/env python3
"""
ASAS Frontend — Master Image Blueprint generator.

Builds a complete IMAGE SLOT inventory (not just files) and writes REPORT files only:
  docs/asas-image-blueprint.md
  docs/asas-image-blueprint.csv
  docs/asas-image-blueprint.json
  docs/asas-image-generation-prompts.md
  docs/asas-real-project-images.md

Does NOT modify website app code or image assets.
"""

from __future__ import annotations

import csv
import json
import math
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    raise SystemExit("Pillow (PIL) is required: pip install Pillow") from exc

ROOT = Path(__file__).resolve().parents[2]  # Asass Platform
FRONTEND = ROOT / "Frontend"
PUBLIC = FRONTEND / "public"
DOCS = ROOT / "docs"

ASAS_STYLE = (
    "ASAS Engineering Consultants Abu Dhabi brand aesthetic: sophisticated neutral palette "
    "(warm stone, soft sand, graphite, muted teal accents), premium editorial architectural "
    "photography, natural UAE daylight, clean composition, no logos, no watermarks, no text overlays, "
    "no fictional named buildings, professional multidisciplinary consultancy atmosphere"
)

NEG_GENERIC = (
    "text, watermark, logo, brand mark, UI mockup, cartoon, illustration, stock-photo cliché, "
    "oversaturated HDR, neon glow, purple lighting, blurry, low-res, distorted architecture, "
    "wrong skyline landmark labels, people looking at camera awkwardly, clipart"
)

NEG_REAL = (
    "fictional building, invented facade, AI-hallucinated architecture replacing the real project, "
    "wrong location skyline, added logos, text overlays, heavy stylization that changes geometry"
)

# ---------------------------------------------------------------------------
# Reference data (from audit + data/*.js)
# ---------------------------------------------------------------------------

PROJECTS: list[dict[str, Any]] = [
    {"slug": "four-towers-al-nahda", "title": "Four Towers, Al Nahda", "category": "towers", "location": "Sharjah, Al Nahda", "kind": "towers"},
    {"slug": "building-mbz-musaffah-m26", "title": "Commercial & Residential Building — M26", "category": "buildings", "location": "Mohammed Bin Zayed City / Musaffah M26", "kind": "buildings"},
    {"slug": "building-khalifa-city-msh36", "title": "Commercial & Residential Building — MSH36", "category": "buildings", "location": "Khalifa City, Sector MSH36", "kind": "buildings"},
    {"slug": "residential-building-al-raha-rbw2", "title": "Residential Building — RBW2", "category": "buildings", "location": "Al Raha Beach, Abu Dhabi, RBW2", "kind": "buildings"},
    {"slug": "mbz-city-towers", "title": "MBZ City Towers", "category": "towers", "location": "Mohammed Bin Zayed City, Abu Dhabi", "kind": "towers"},
    {"slug": "showroom-musaffah-m42", "title": "Showroom — M42", "category": "industrial", "location": "Musaffah Industrial, M42", "kind": "industrial"},
    {"slug": "industrial-facility-musaffah-m42", "title": "Industrial Facility — M42", "category": "industrial", "location": "Musaffah Industrial, M42", "kind": "industrial"},
    {"slug": "industrial-facility-musaffah-m15", "title": "Industrial Facility — M15", "category": "industrial", "location": "Musaffah Industrial, M15", "kind": "industrial"},
    {"slug": "traffic-access-studies", "title": "Traffic & Access Studies", "category": "infrastructure", "location": "Abu Dhabi Island and Khalifa City — C61, C31, C32, C47", "kind": "infrastructure", "approved": True},
    {"slug": "culture-private-school", "title": "Culture Private School", "category": "education", "location": "UAE", "kind": "education"},
    {"slug": "emirates-private-school", "title": "Emirates Private School", "category": "education", "location": "UAE", "kind": "education"},
    {"slug": "american-international-school", "title": "American International School", "category": "education", "location": "UAE", "kind": "education"},
    {"slug": "compound-villas-portfolio", "title": "Compound Villas Portfolio", "category": "compound-villas", "location": "Khalifa City SE36; MBZ Z19/C176; Shakhbout MSH6", "kind": "villas"},
    {"slug": "private-villa-shakhbout-w01", "title": "Private Villa — W01", "category": "private-villas", "location": "Shakhbout City, W01", "kind": "villas"},
    {"slug": "private-villa-khalifa-se24", "title": "Private Villa — SE24", "category": "private-villas", "location": "Khalifa City, SE24", "kind": "villas"},
    {"slug": "private-villa-mbz-z14", "title": "Private Villa — Z14", "category": "private-villas", "location": "Mohammed Bin Zayed City, Z14", "kind": "villas"},
    {"slug": "residential-villa-al-shamkha-sh3", "title": "Residential Villa — SH3", "category": "residential-villas", "location": "Al Shamkha, SH3", "kind": "villas"},
    {"slug": "residential-villa-riyadh-rd32", "title": "Residential Villa — RD32", "category": "residential-villas", "location": "Madinat Al Riyadh, RD32", "kind": "villas"},
    {"slug": "residential-villa-bani-yas-eb11-01", "title": "Residential Villa — EB11-01", "category": "residential-villas", "location": "Bani Yas, EB11-01", "kind": "villas"},
    {"slug": "reception-hall-private-villa", "title": "Reception Hall — Private Villa", "category": "interior-design", "location": "Private villa, UAE", "kind": "interior"},
    {"slug": "majlis-and-dining", "title": "Majlis & Dining — Private Villa", "category": "interior-design", "location": "Private villa, UAE", "kind": "interior"},
    {"slug": "restaurant-interior", "title": "Restaurant Interior", "category": "interior-design", "location": "UAE hospitality", "kind": "interior"},
    {"slug": "hotel-lobby-interior", "title": "Hotel Lobby Interior", "category": "interior-design", "location": "UAE hospitality", "kind": "interior"},
]
PROJECT_BY_SLUG = {p["slug"]: p for p in PROJECTS}

TRAFFIC_PATHS = {
    "portfolio": "/assets/asas/real-projects/asas-traffic-access-studies-portfolio.webp",
    "card": "/assets/asas/real-projects/asas-traffic-access-studies-card.webp",
    "mobile": "/assets/asas/real-projects/asas-traffic-access-studies-mobile.webp",
}

SERVICES = [
    ("architectural-design", "Architectural Design", "SERVICE_ARCHITECTURE", "/assets/asas/roles/asas-role-architecture-service.webp"),
    ("civil-structural-engineering", "Civil & Structural Engineering", "SERVICE_STRUCTURAL", "/assets/asas/roles/asas-role-structural-service.webp"),
    ("mep-engineering-design", "Electromechanical / MEP Engineering", "SERVICE_MEP", "/assets/asas/roles/asas-role-mep-service.webp"),
    ("quantities-cost", "Quantities, Cost & Value Engineering", "SERVICE_QS", "/assets/asas/roles/asas-role-qs-service.webp"),
    ("project-management", "Project Management", "SERVICE_PM", "/assets/asas/roles/asas-role-pm-service.webp"),
    ("construction-supervision", "Construction Supervision", "SERVICE_SUPERVISION", "/assets/asas/services/asas-editorial-site-supervision.webp"),
    ("infrastructure-urban-planning", "Infrastructure & Urban Planning", "SERVICE_INFRASTRUCTURE", "/assets/asas/roles/asas-role-infra-service.webp"),
    ("traffic-studies", "Traffic Studies & Analysis", "SERVICE_TRAFFIC", "/assets/asas/roles/asas-role-traffic-service.webp"),
    ("sustainability-green-building", "Sustainability & Green Building", "SERVICE_SUSTAINABILITY", "/assets/asas/roles/asas-role-sustainability-service.webp"),
    ("interior-design", "Interior Design", "SERVICE_INTERIOR", "/assets/asas/roles/asas-role-interior-service.webp"),
    ("studies-specifications", "Studies & Technical Specifications", "SERVICE_STUDIES", "/assets/asas/roles/asas-role-studies-service.webp"),
    ("health-safety-fire-design", "Health, Safety & Fire Design Review", "SERVICE_HSE", "/assets/asas/roles/asas-role-hse-service.webp"),
    ("landscape-design", "Landscape Design", "SERVICE_LANDSCAPE", "/assets/asas/roles/asas-role-landscape-service.webp"),
]

SECTORS = [
    ("towers-high-rise", "Towers & High-Rise", "SECTOR_TOWERS", "/assets/asas/roles/asas-role-towers-sector.webp", ["four-towers-al-nahda", "mbz-city-towers"]),
    ("commercial-residential-buildings", "Commercial & Residential Buildings", "SECTOR_BUILDINGS", "/assets/asas/generated-editorial/asas-editorial-buildings-sector.webp", ["building-mbz-musaffah-m26", "building-khalifa-city-msh36", "residential-building-al-raha-rbw2"]),
    ("industrial-showrooms", "Industrial Facilities & Showrooms", "SECTOR_INDUSTRIAL", "/assets/asas/generated-editorial/asas-editorial-industrial-sector.webp", ["showroom-musaffah-m42", "industrial-facility-musaffah-m42", "industrial-facility-musaffah-m15"]),
    ("infrastructure-urban-planning", "Infrastructure & Urban Planning", "SECTOR_INFRASTRUCTURE", "/assets/asas/roles/asas-role-infrastructure-sector.webp", ["traffic-access-studies"]),
    ("education", "Education", "SECTOR_EDUCATION", "/assets/asas/generated-editorial/asas-editorial-education-sector.webp", ["culture-private-school", "emirates-private-school", "american-international-school"]),
    ("villas-compounds-palaces", "Villas, Compounds & Palaces", "SECTOR_VILLAS", "/assets/asas/generated-editorial/asas-editorial-villas-sector.webp", ["compound-villas-portfolio", "private-villa-shakhbout-w01", "private-villa-khalifa-se24"]),
    ("interior-hospitality-retail", "Interiors, Hospitality & Retail", "SECTOR_INTERIORS", "/assets/asas/generated-editorial/asas-editorial-interiors-sector.webp", ["reception-hall-private-villa", "majlis-and-dining", "restaurant-interior"]),
]

HOME_DISCIPLINES = [
    ("architectural-design", "HOME_DISC_ARCHITECTURE", "/assets/asas/roles/asas-role-home-disc-architecture.webp", "Architectural design coordination"),
    ("civil-structural-engineering", "HOME_DISC_STRUCTURAL", "/assets/asas/roles/asas-role-home-disc-structural.webp", "Structural engineering coordination"),
    ("mep-engineering-design", "HOME_DISC_MEP", "/assets/asas/roles/asas-role-home-disc-mep.webp", "MEP engineering coordination"),
    ("quantities-cost", "HOME_DISC_QS", "/assets/asas/roles/asas-role-home-disc-qs.webp", "Quantities and cost engineering"),
    ("project-management", "HOME_DISC_PM", "/assets/asas/roles/asas-role-home-disc-pm.webp", "Project management delivery"),
]

HOME_SECTORS = [
    ("towers-high-rise", "/assets/asas/roles/asas-role-home-sector-towers.webp", "Towers mosaic card"),
    ("infrastructure-urban-planning", "/assets/asas/roles/asas-role-home-sector-infrastructure.webp", "Infrastructure mosaic card"),
    ("commercial-residential-buildings", "/assets/asas/roles/asas-role-home-sector-buildings.webp", "Buildings mosaic card"),
    ("education", "/assets/asas/roles/asas-role-home-sector-education.webp", "Education mosaic card"),
    ("villas-compounds-palaces", "/assets/asas/roles/asas-role-home-sector-villas.webp", "Villas mosaic card"),
    ("interior-hospitality-retail", "/assets/asas/roles/asas-role-home-sector-interiors.webp", "Interiors mosaic card"),
]

CLIENTS = [
    ("c01", "Coastal Residence Group", "CRG"),
    ("c02", "Horizon Contracting", "HORIZON"),
    ("c03", "Desert Line Properties", "DLP"),
    ("c04", "Education Trust UAE", "ET UAE"),
    ("c05", "Urban Edge Planning", "URBAN EDGE"),
    ("c06", "Atelier Hospitality", "ATELIER"),
    ("c07", "Mir Group", "MIR GROUP"),
    ("c08", "Gulf Frame Engineers", "GFE"),
    ("c09", "Palm Court Developments", "PALM COURT"),
    ("c10", "North Gate Estates", "NORTH GATE"),
]

TEAM = [
    ("ahmad-al-faisal", "Ahmad Al Faisal", "Managing Director", ["four-towers-al-nahda", "mbz-city-towers"]),
    ("asaad-moghrabi", "Asaad Moghrabi", "Director of Engineering", ["culture-private-school", "compound-villas-portfolio"]),
    ("mufaq-abdelbaset", "Mufaq Abdelbaset", "Senior Structural Engineer", ["four-towers-al-nahda", "residential-building-al-raha-rbw2"]),
    ("mohammed-sami", "Mohammed Sami", "MEP Engineering Manager", ["building-mbz-musaffah-m26", "industrial-facility-musaffah-m42"]),
    ("omar-hassan", "Omar Hassan", "Senior Architect", ["compound-villas-portfolio", "private-villa-shakhbout-w01"]),
    ("sara-khaled", "Sara Khaled", "Project Management Specialist", ["traffic-access-studies", "culture-private-school"]),
]

HOME_FEATURED_GRID = [
    "culture-private-school",
    "compound-villas-portfolio",
    "residential-villa-al-shamkha-sh3",
    "reception-hall-private-villa",
]

WHY_ICONS = [
    ("why-cross-check.svg", "Cross-discipline checking"),
    ("why-timely-report.svg", "Timely reporting"),
    ("why-project-cycle.svg", "Integrated project cycle"),
    ("why-records-commitment.svg", "Records and commitment"),
]

DIM_CACHE: dict[str, tuple[int, int] | None] = {}


def measure(path: str | None) -> tuple[int, int] | None:
    if not path:
        return None
    if path in DIM_CACHE:
        return DIM_CACHE[path]
    rel = path.lstrip("/")
    full = PUBLIC / rel
    if not full.is_file():
        DIM_CACHE[path] = None
        return None
    try:
        with Image.open(full) as im:
            DIM_CACHE[path] = (im.width, im.height)
            return DIM_CACHE[path]
    except Exception:
        DIM_CACHE[path] = None
        return None


def gcd_ratio(w: int, h: int) -> str:
    g = math.gcd(w, h)
    return f"{w // g}:{h // g}"


def orientation_of(w: int, h: int) -> str:
    r = w / h
    if 0.95 <= r <= 1.05:
        return "Square"
    if r >= 2.0:
        return "Ultra-wide"
    if r > 1:
        return "Landscape"
    return "Portrait"


def fmt_dims(dims: tuple[int, int] | None) -> str:
    if not dims:
        return ""
    return f"{dims[0]}×{dims[1]}"


def recommended_for(role: str, aspect: str = "16:9") -> str:
    mapping = {
        "HOME_HERO": "2560×1440",
        "ABOUT_HERO": "2560×1440",
        "SERVICE_HERO": "2400×1350",
        "SECTOR_HERO": "2400×1350",
        "PROJECT_HERO": "2400×1600",
        "PROJECT_THUMBNAIL": "1800×1350",
        "PROJECT_GALLERY": "2400×1600",
        "PORTFOLIO_PROJECT": "1800×1350",
        "HOME_ABOUT": "2400×1800",
        "HOME_SERVICE": "1800×1400",
        "HOME_SECTOR": "2000×1400",
        "HOME_PROJECT": "1800×1350",
        "TEAM": "1800×2250",
        "CAREERS": "2400×1350",
        "CONTACT": "2400×1350",
        "CORPORATE_EDITORIAL": "2400×1600",
        "LOGO": "1024×1024",
        "ICON": "512×512",
        "HOME_CLIENT_LOGO": "1200×600",
        "CTA_BACKGROUND": "2400×900",
        "TECHNICAL_DRAWING": "2400×1600",
        "SERVICE_FEATURE": "1800×1200",
        "SECTOR_CARD": "1800×1200",
        "HOME_TESTIMONIAL": "800×800",
        "DECORATIVE": "1600×1200",
        "OTHER": "2400×1350",
    }
    return mapping.get(role, "2400×1600")


def enhancement_prompt(project_title: str, slot_purpose: str) -> str:
    return (
        f"RESTORATION / ENHANCEMENT ONLY for real ASAS project “{project_title}”. "
        f"Gently restore clarity, correct exposure, reduce compression artifacts, and straighten horizon "
        f"while preserving exact real geometry, materials, and location identity. Slot purpose: {slot_purpose}. "
        f"Do not invent facades, floors, or surrounding context. Do not replace the building with a fictional design. "
        f"Photorealistic professional consultancy presentation quality."
    )


def generic_prompt(subject: str, composition: str, size_hint: str) -> str:
    return (
        f"Photorealistic editorial photograph for ASAS Engineering Consultants website. "
        f"Subject: {subject}. Composition: {composition}. "
        f"Camera: full-frame, sharp architectural detail, natural UAE daylight, soft shadows, "
        f"neutral sophisticated color grade. Output master roughly {size_hint}. {ASAS_STYLE}."
    )


def slot(**kwargs: Any) -> dict[str, Any]:
    path = kwargs.get("path")
    dims = measure(path) if path else None
    role = kwargs.get("role", "OTHER")
    real = kwargs.get("realProject", "NO")
    can_ai = kwargs.get("canAI")
    if can_ai is None:
        can_ai = real != "YES"
    if real == "YES":
        can_ai = False  # generation of fictional project imagery forbidden; enhancement only

    source_w_h = fmt_dims(dims)
    aspect = gcd_ratio(*dims) if dims else kwargs.get("aspectRatio", "")
    orient = orientation_of(*dims) if dims else kwargs.get("orientation", "")

    status = kwargs.get("status", "PRESENT" if path else "MISSING")
    classification = kwargs.get("classification", "UNKNOWN")
    prompt = kwargs.get("prompt", "")
    if not prompt:
        if real == "YES":
            prompt = enhancement_prompt(
                kwargs.get("relatedProjectName") or "ASAS project",
                kwargs.get("purpose") or kwargs.get("section") or role,
            )
        elif status in {"PHOTO_FREE_CTA", "TEXT_MARK", "TEXT_AVATAR", "INITIALS_FALLBACK", "MAP_EMBED"}:
            prompt = ""
        elif status == "MISSING" and role in {"PROJECT_HERO", "PROJECT_THUMBNAIL", "PROJECT_GALLERY", "PORTFOLIO_PROJECT", "HOME_PROJECT"}:
            # Still real-project slots even when missing
            prompt = enhancement_prompt(
                kwargs.get("relatedProjectName") or "ASAS project",
                "Capture or carefully enhance an authentic photograph of this named ASAS project only — never invent architecture.",
            )
            can_ai = False
            real = "YES"
        else:
            prompt = generic_prompt(
                kwargs.get("intendedDescription") or kwargs.get("section") or role,
                kwargs.get("crop") or "subject centered with calm negative space",
                kwargs.get("recommendedSize") or recommended_for(role),
            )

    neg = kwargs.get("negativePrompt", NEG_REAL if real == "YES" else NEG_GENERIC)

    record = {
        "id": kwargs["id"],
        "filename": Path(path).name if path else (kwargs.get("filename") or ""),
        "path": path or "",
        "route": kwargs.get("route", ""),
        "section": kwargs.get("section", ""),
        "component": kwargs.get("component", ""),
        "role": role,
        "classification": classification,
        "sourceType": kwargs.get("sourceType", "file" if path else status),
        "status": status,
        "realProject": real,
        "relatedProjectName": kwargs.get("relatedProjectName", ""),
        "relatedProjectSlug": kwargs.get("relatedProjectSlug", ""),
        "projectLocation": kwargs.get("projectLocation", ""),
        "projectCategory": kwargs.get("projectCategory", ""),
        "sourceVerified": kwargs.get("sourceVerified", ""),
        "relatedService": kwargs.get("relatedService", ""),
        "relatedSector": kwargs.get("relatedSector", ""),
        "existingDescription": kwargs.get("existingDescription", ""),
        "intendedDescription": kwargs.get("intendedDescription", ""),
        "why": kwargs.get("why", ""),
        "purpose": kwargs.get("purpose", ""),
        "sourceDimensions": source_w_h or kwargs.get("sourceDimensions", ""),
        "renderedDimensions": kwargs.get("renderedDimensions", ""),
        "aspectRatio": aspect or kwargs.get("aspectRatio", ""),
        "orientation": orient or kwargs.get("orientation", ""),
        "recommendedSize": kwargs.get("recommendedSize") or recommended_for(role),
        "crop": kwargs.get("crop", "subject centered; keep edges clear of critical detail"),
        "objectFit": kwargs.get("objectFit", "cover"),
        "objectPosition": kwargs.get("objectPosition", "50% 50%"),
        "desktop": kwargs.get("desktop", "full slot"),
        "tablet": kwargs.get("tablet", "scaled cover crop"),
        "mobile": kwargs.get("mobile", "tightened cover crop"),
        "quality": kwargs.get("quality", "unknown"),
        "duplicate": kwargs.get("duplicate", "unique"),
        "usedAlsoIn": kwargs.get("usedAlsoIn", []),
        "canAI": bool(can_ai),
        "aiGenerationAllowed": bool(can_ai),
        "authenticity": kwargs.get(
            "authenticity",
            "REAL_PROJECT_AUTHENTICITY_REQUIRED" if real == "YES" else "GENERIC_EDITORIAL_OK",
        ),
        "priority": kwargs.get("priority", "P2"),
        "prompt": prompt,
        "negativePrompt": neg if prompt else "",
        "suggestedFilename": kwargs.get("suggestedFilename")
        or (f"asas-{kwargs['id'].lower().replace('_', '-')}.webp" if kwargs.get("id") else ""),
        "alt": kwargs.get("alt", ""),
        "notes": kwargs.get("notes", ""),
        "textSafeArea": kwargs.get("textSafeArea", "Leave calm negative space opposite primary subject for overlays"),
    }
    return record


def project_card_path(slug: str) -> str | None:
    if slug == "traffic-access-studies":
        return TRAFFIC_PATHS["card"]
    return None


def project_visual_desc(slug: str) -> str:
    p = PROJECT_BY_SLUG[slug]
    if slug == "traffic-access-studies":
        return (
            "Technical municipal traffic and access plan drawing for Abu Dhabi / Khalifa City corridors, "
            "linework parking layouts, kerb adjustments and circulation annotations in cool grey on white"
        )
    return (
        f"Authentic photography of ASAS project “{p['title']}” at {p['location']} "
        f"(category {p['category']}) — currently MISSING; needs original source"
    )


def related_peers(slug: str, limit: int = 3) -> list[str]:
    cat = PROJECT_BY_SLUG[slug]["category"]
    peers = [p["slug"] for p in PROJECTS if p["category"] == cat and p["slug"] != slug]
    return peers[:limit]


# ---------------------------------------------------------------------------
# Inventory builder
# ---------------------------------------------------------------------------

def build_slots() -> list[dict[str, Any]]:
    slots: list[dict[str, Any]] = []

    # GLOBAL logos
    logo = "/brand/asas-mark-header.png"
    slots.append(slot(
        id="GLOBAL-LOGO-HEADER-001",
        path=logo,
        route="*",
        section="Site header brand mark",
        component="components/Header.js",
        role="LOGO",
        classification="LOGO",
        sourceType="brand_png",
        existingDescription="ASAS mark (gold/graphite symbol) on transparent background",
        intendedDescription="Official ASAS header brand mark, crisp edges, transparent PNG",
        why="Identifies ASAS across every page in the sticky header",
        purpose="Brand recognition and navigation home link",
        renderedDimensions="~47–62px square",
        objectFit="contain",
        objectPosition="center",
        recommendedSize="1024×1024",
        crop="full mark visible with padding",
        desktop="header ~50px",
        tablet="header ~48px",
        mobile="header ~44px",
        quality="good",
        priority="P0",
        canAI=False,
        authenticity="BRAND_ASSET_DO_NOT_AI_REPLACE",
        prompt="",
        alt="ASAS",
        notes="Also used by Brand.js and Footer — documented as separate slots",
        textSafeArea="N/A — logo mark",
        duplicate="primary",
    ))
    slots.append(slot(
        id="GLOBAL-LOGO-FOOTER-001",
        path=logo,
        route="*",
        section="Site footer brand mark",
        component="components/Footer.js",
        role="LOGO",
        classification="LOGO",
        sourceType="brand_png",
        existingDescription="Same ASAS mark as header, larger footer rendering",
        intendedDescription="Official ASAS footer brand mark",
        why="Reinforces brand identity in footer",
        purpose="Footer brand lockup",
        renderedDimensions="Image 168×168; CSS height ~76px",
        objectFit="contain",
        recommendedSize="1024×1024",
        quality="good",
        priority="P1",
        canAI=False,
        authenticity="BRAND_ASSET_DO_NOT_AI_REPLACE",
        prompt="",
        alt="ASAS",
        notes="Duplicate file of header logo; different rendered size",
        duplicate="duplicate_usage",
        textSafeArea="N/A",
    ))
    slots.append(slot(
        id="GLOBAL-LOGO-BRAND-001",
        path=logo,
        route="*",
        section="Brand component mark",
        component="components/Brand.js",
        role="LOGO",
        classification="LOGO",
        existingDescription="ASAS mark via Brand.js Image 68×68",
        intendedDescription="Official ASAS brand mark",
        why="Reusable brand component",
        purpose="Consistent brand rendering",
        renderedDimensions="68×68",
        objectFit="contain",
        canAI=False,
        authenticity="BRAND_ASSET_DO_NOT_AI_REPLACE",
        prompt="",
        priority="P2",
        quality="good",
        duplicate="duplicate_usage",
        alt="ASAS",
        notes="Same file as header/footer",
        textSafeArea="N/A",
    ))

    # HOME heroes
    heroes = [
        ("HOME-HERO-001", "Hero slide: Four Towers editorial", "/assets/asas/generated-editorial/asas-editorial-homepage-hero.webp",
         "68% 38%", "AI_GENERATED", "NO", "", "",
         "Wide dusk UAE high-rise cluster with podium massing, cinematic architectural lighting",
         "Premium Abu Dhabi / UAE high-rise skyline editorial (generic, not a named ASAS project), clear left text-safe band",
         "P0", "Leave left ~35% darker/calmer for headline overlay"),
        ("HOME-HERO-002", "Hero slide: Traffic & Access Studies", TRAFFIC_PATHS["portfolio"],
         "50% 50%", "TECHNICAL_DRAWING", "YES", "Traffic & Access Studies", "traffic-access-studies",
         "Real ASAS traffic/access plan portfolio frame",
         "Keep authentic technical drawing; enhance clarity only",
         "P0", "Center drawing; avoid cropping legends"),
        ("HOME-HERO-003", "Hero slide: Education campus editorial", "/assets/asas/roles/asas-role-home-slide-education.webp",
         "35% 40%", "AI_GENERATED", "NO", "", "",
         "Sunlit educational campus exterior, landscaped courtyards, contemporary Middle East school architecture",
         "Editorial UAE school campus — generic, not Culture Private School facade replacement",
         "P0", "Negative space left for copy"),
        ("HOME-HERO-004", "Hero slide: Compound villas editorial", "/assets/asas/roles/asas-role-home-slide-villas.webp",
         "55% 45%", "AI_GENERATED", "NO", "", "",
         "Luxury villa compound streetscape, warm stone facades, soft desert light",
         "Editorial UAE villa compound atmosphere (generic)",
         "P0", "Subject slightly right; left text-safe"),
        ("HOME-HERO-005", "Hero slide: Interiors editorial", "/assets/asas/roles/asas-role-home-slide-interiors.webp",
         "40% 50%", "AI_GENERATED", "NO", "", "",
         "Refined hospitality interior with marble, warm wood, layered lighting",
         "Editorial hospitality interior (generic ASAS interiors sector mood)",
         "P0", "Keep ceiling details; text-safe lower-left"),
    ]
    for hid, section, path, opos, clas, real, pname, pslug, existing, intended, pri, tsafe in heroes:
        pmeta = PROJECT_BY_SLUG.get(pslug, {})
        slots.append(slot(
            id=hid,
            path=path,
            route="/",
            section=section,
            component="components/home/HeroSlider.js",
            role="HOME_HERO",
            classification=clas,
            realProject=real,
            relatedProjectName=pname,
            relatedProjectSlug=pslug,
            projectLocation=pmeta.get("location", ""),
            projectCategory=pmeta.get("category", ""),
            sourceVerified="YES" if pslug == "traffic-access-studies" else "",
            existingDescription=existing,
            intendedDescription=intended,
            why="Homepage hero carousel communicates ASAS sector breadth and credibility",
            purpose="Primary homepage visual story",
            renderedDimensions="min-h 560 / min(92vh,820); object-fit cover fill",
            objectFit="cover",
            objectPosition=opos,
            quality="good" if path else "missing",
            priority=pri,
            alt=section,
            textSafeArea=tsafe,
            notes="HOME_HERO slide; thumb duplicate documented separately",
            suggestedFilename=Path(path).name if path else "",
        ))
        # matching thumb
        n = hid.split("-")[-1]
        slots.append(slot(
            id=f"HOME-HERO-THUMB-{n}",
            path=path,
            route="/",
            section=f"Hero thumb: {section}",
            component="components/home/HeroSlider.js",
            role="HOME_HERO",
            classification=clas,
            realProject=real,
            relatedProjectName=pname,
            relatedProjectSlug=pslug,
            projectLocation=pmeta.get("location", ""),
            projectCategory=pmeta.get("category", ""),
            sourceVerified="YES" if pslug == "traffic-access-studies" else "",
            existingDescription=existing + " (thumbnail crop)",
            intendedDescription=intended + " — readable at 96×58",
            why="Lets users preview and select hero slides",
            purpose="Hero navigation thumbnail",
            renderedDimensions="96×58",
            objectFit="cover",
            objectPosition=opos,
            recommendedSize="960×580",
            quality="good",
            priority="P2",
            duplicate="duplicate_usage",
            alt=f"Thumbnail — {section}",
            notes=f"Same source as {hid}",
            textSafeArea="N/A — thumb",
            suggestedFilename=Path(path).name if path else "",
        ))

    # HOME about
    slots.append(slot(
        id="HOME-ABOUT-001",
        path="/assets/asas/roles/asas-role-home-about.webp",
        route="/",
        section="About us visual",
        component="app/[locale]/page.js",
        role="HOME_ABOUT",
        classification="AI_GENERATED",
        existingDescription="Multidisciplinary engineering team reviewing drawings/model in bright office",
        intendedDescription="Premium editorial of UAE consultancy team reviewing architectural/structural drawings around a physical model, Abu Dhabi office daylight",
        why="Supports About section with collaboration credibility",
        purpose="Humanize ASAS expertise on homepage",
        renderedDimensions="Image declared 1280×960; .hp-about-visual",
        objectFit="cover",
        recommendedSize="2400×1800",
        priority="P1",
        quality="good",
        alt="ASAS multidisciplinary engineering team collaboration",
        textSafeArea="Keep faces/model away from far edges",
        notes="WireframeSphere SVG decorative only — not counted as photo slot",
    ))

    # Client logos
    for i, (cid, name, mark) in enumerate(CLIENTS, 1):
        slots.append(slot(
            id=f"HOME-CLIENT-LOGO-{i:03d}",
            path=None,
            route="/",
            section=f"Clients marquee — {name}",
            component="components/home/ClientsMarquee.js",
            role="HOME_CLIENT_LOGO",
            classification="LOGO",
            status="TEXT_MARK",
            sourceType="TEXT_MARK",
            existingDescription=f"Text wordmark chip “{mark}” — no logo file",
            intendedDescription=f"Official client logo for {name}, monochrome on transparent PNG/SVG",
            why="Social proof in clients marquee",
            purpose="Partner credibility",
            renderedDimensions=".asas-clients-logo chip",
            objectFit="contain",
            recommendedSize="1200×600",
            orientation="Landscape",
            aspectRatio="2:1",
            quality="missing",
            priority="P2",
            canAI=False,
            authenticity="CLIENT_LOGO_REQUIRES_OFFICIAL_ASSET",
            prompt="",
            alt=name,
            notes=f"data/clients.js id={cid}; replace TEXT_MARK with real logo when licensed",
            textSafeArea="N/A",
            suggestedFilename=f"asas-client-{cid}-{re.sub(r'[^a-z0-9]+','-', name.lower()).strip('-')}.svg",
        ))

    # Home disciplines
    for i, (slug, role_key, path, label) in enumerate(HOME_DISCIPLINES, 1):
        slots.append(slot(
            id=f"HOME-SERVICE-{i:03d}",
            path=path,
            route="/",
            section=f"Discipline tab — {label}",
            component="components/home/ServicesTabs.js",
            role="HOME_SERVICE",
            classification="AI_GENERATED",
            relatedService=slug,
            existingDescription=f"Editorial discipline visual for {label}",
            intendedDescription=f"ASAS {label} workplace/process editorial photograph, UAE consultancy setting",
            why="Illustrates homepage service discipline tabs",
            purpose="Explain core disciplines visually",
            renderedDimensions=".insp-tab-media min-h ~380; Image ~900×700 cover",
            objectFit="cover",
            recommendedSize="1800×1400",
            priority="P1",
            quality="good",
            alt=label,
            notes=f"Exclusive homeDisciplineImages ({role_key}); not reused as service page hero",
            textSafeArea="Subject slightly off-center for caption overlay",
        ))

    # Home sectors
    for i, (slug, path, label) in enumerate(HOME_SECTORS, 1):
        slots.append(slot(
            id=f"HOME-SECTOR-{i:03d}",
            path=path,
            route="/",
            section=label,
            component="components/home/SectorShowcase.js",
            role="HOME_SECTOR",
            classification="AI_GENERATED",
            relatedSector=slug,
            existingDescription=f"Homepage sector mosaic media for {slug}",
            intendedDescription=f"Premium editorial representing {slug.replace('-', ' ')} sector for ASAS mosaic",
            why="SectorShowcase mosaic navigation",
            purpose="Drive users into sector pages",
            renderedDimensions="Featured ~66vw / side ~34vw / quad ~25vw; fill cover",
            objectFit="cover",
            recommendedSize="2000×1400",
            priority="P1",
            quality="good",
            alt=label,
            notes="Exclusive homeSectorImages; industrial-showrooms omitted from homepage mosaic",
            textSafeArea="Lower third reserved for sector title overlay",
        ))

    # Home projects
    slots.append(slot(
        id="HOME-PROJECT-FEATURED-001",
        path=TRAFFIC_PATHS["card"],
        route="/",
        section="Featured project — Traffic & Access Studies",
        component="app/[locale]/page.js",
        role="HOME_PROJECT",
        classification="TECHNICAL_DRAWING",
        realProject="YES",
        relatedProjectName="Traffic & Access Studies",
        relatedProjectSlug="traffic-access-studies",
        projectLocation=PROJECT_BY_SLUG["traffic-access-studies"]["location"],
        projectCategory="infrastructure",
        sourceVerified="YES",
        existingDescription="Approved traffic studies card crop of technical plan",
        intendedDescription="Authentic ASAS traffic plan card — enhancement only",
        why="Featured real project proof on homepage",
        purpose="Showcase approved portfolio piece",
        renderedDimensions=".hp-featured-visual fill",
        objectFit="cover",
        objectPosition="50% 50%",
        quality="B_PROJECT_CARD",
        priority="P0",
        alt="Traffic & Access Studies technical plan",
        notes="Only approved real project card on homepage featured slot",
        textSafeArea="Keep annotations readable; avoid aggressive crop",
    ))
    for i, slug in enumerate(HOME_FEATURED_GRID, 1):
        p = PROJECT_BY_SLUG[slug]
        slots.append(slot(
            id=f"HOME-PROJECT-GRID-{i:03d}",
            path=None,
            route="/",
            section=f"Project grid — {p['title']}",
            component="components/ProjectVisualFallback.js",
            role="HOME_PROJECT",
            classification="REAL_PROJECT_PHOTO",
            status="MISSING",
            realProject="YES",
            relatedProjectName=p["title"],
            relatedProjectSlug=slug,
            projectLocation=p["location"],
            projectCategory=p["category"],
            sourceVerified="NO",
            existingDescription="ProjectVisualFallback — no approved photography",
            intendedDescription=project_visual_desc(slug),
            why="Homepage portfolio grid needs authentic project photography",
            purpose="Cross-link to project detail",
            renderedDimensions="grid card cover",
            quality="missing",
            priority="P0",
            alt=p["title"],
            notes="needsOriginalImage=true",
            textSafeArea="Title overlay lower third",
        ))

    # Testimonials (text avatar only)
    for i in range(1, 7):
        slots.append(slot(
            id=f"HOME-TESTIMONIAL-{i:03d}",
            path=None,
            route="/",
            section=f"Testimonial card avatar {i}",
            component="components/home/TestimonialsSection.js",
            role="HOME_TESTIMONIAL",
            classification="DECORATIVE",
            status="TEXT_AVATAR",
            sourceType="TEXT_AVATAR",
            existingDescription="Initial letter avatar only — no photo planned in code",
            intendedDescription="Optional professional headshot if testimonials become named+consented",
            why="Visual anchor for testimonial card",
            purpose="Humanize quotes",
            renderedDimensions="small circular initial",
            objectFit="cover",
            recommendedSize="800×800",
            orientation="Square",
            aspectRatio="1:1",
            quality="n/a",
            priority="P3",
            canAI=False,
            authenticity="REQUIRES_REAL_PERSON_CONSENT",
            prompt="",
            alt="",
            notes="No photography currently; keep as initials unless consent obtained",
            textSafeArea="N/A",
        ))

    # Home team
    slots.append(slot(
        id="HOME-TEAM-ASIDE-001",
        path="/assets/asas/roles/asas-role-home-team.webp",
        route="/",
        section="Home team aside editorial",
        component="components/team/HomeTeamSection.js",
        role="TEAM",
        classification="AI_GENERATED",
        existingDescription="Editorial team/office atmosphere image",
        intendedDescription="ASAS Abu Dhabi team collaboration editorial, calm office architecture",
        why="Supports homepage team section narrative",
        purpose="Invite users to Team page",
        renderedDimensions=".tm-home-aside-media",
        objectFit="cover",
        objectPosition="48% 35%",
        recommendedSize="1800×2250",
        priority="P1",
        quality="good",
        alt="ASAS team collaboration",
        textSafeArea="Keep heads away from top crop",
    ))
    for i, (tslug, tname, title, _) in enumerate(TEAM[:4], 1):
        slots.append(slot(
            id=f"HOME-TEAM-CARD-{i:03d}",
            path=None,
            route="/",
            section=f"Home team card — {tname}",
            component="components/team/HomeTeamSection.js",
            role="TEAM",
            classification="REAL_TEAM",
            status="INITIALS_FALLBACK",
            sourceType="INITIALS_FALLBACK",
            existingDescription="Demo member with empty profile_image → initials fallback",
            intendedDescription=f"Authentic portrait of {tname}, {title}, professional headshot",
            why="Feature leadership on homepage",
            purpose="Team credibility",
            renderedDimensions=".tm-card-media",
            objectFit="cover",
            recommendedSize="1600×2000",
            orientation="Portrait",
            aspectRatio="4:5",
            quality="missing",
            priority="P1",
            canAI=False,
            authenticity="REAL_PERSON_PHOTO_REQUIRED",
            prompt="",
            alt=tname,
            notes=f"slug={tslug}; do not AI-generate likeness",
            textSafeArea="Lower third for name/title",
            suggestedFilename=f"asas-team-{tslug}.webp",
        ))

    # Why icons (SVG assets)
    for i, (fname, label) in enumerate(WHY_ICONS, 1):
        path = f"/assets/asas/icons/{fname}"
        slots.append(slot(
            id=f"HOME-WHY-ICON-{i:03d}",
            path=path,
            route="/",
            section=f"Why ASAS icon — {label}",
            component="components/icons/WhyIcons.js (runtime React SVG; matching asset on disk)",
            role="ICON",
            classification="ICON",
            sourceType="svg_icon",
            existingDescription=f"Line-icon motif for {label}",
            intendedDescription=f"Clean monoline SVG icon communicating {label}",
            why="Supports Why ASAS benefit cards",
            purpose="Iconographic clarity",
            renderedDimensions="~28px badge icon",
            objectFit="contain",
            recommendedSize="512×512",
            orientation="Square",
            aspectRatio="1:1",
            quality="good",
            priority="P3",
            canAI=False,
            authenticity="VECTOR_ICON",
            prompt="",
            alt=label,
            notes="Live UI uses React WhyIcons; SVG files remain in public/assets/asas/icons/",
            textSafeArea="N/A",
        ))

    # ABOUT
    slots.append(slot(
        id="ABOUT-HERO-001",
        path="/assets/asas/roles/asas-role-about-hero.webp",
        route="/about",
        section="About page hero",
        component="app/[locale]/about/page.js",
        role="ABOUT_HERO",
        classification="AI_GENERATED",
        existingDescription="Corporate/architectural about hero editorial",
        intendedDescription="Wide editorial of ASAS Abu Dhabi consultancy identity — architecture + engineering collaboration mood",
        why="Sets About page tone",
        purpose="Page identity hero",
        renderedDimensions=".about-hero-photo fill cover",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="About ASAS",
        textSafeArea="Left third for title",
    ))
    slots.append(slot(
        id="ABOUT-CORPORATE-001",
        path="/assets/asas/roles/asas-role-about-featured.webp",
        route="/about",
        section="About featured editorial",
        component="app/[locale]/about/page.js",
        role="ABOUT_CORPORATE",
        classification="GENERIC_CORPORATE",
        existingDescription="Featured corporate editorial photograph",
        intendedDescription="Premium corporate editorial of multidisciplinary review workshop",
        why="Deepens About story mid-page",
        purpose="Corporate credibility",
        renderedDimensions=".about-featured-media ~55vw",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="ASAS corporate collaboration",
        textSafeArea="Keep subjects clear of edges",
    ))
    slots.append(slot(
        id="ABOUT-CTA-001",
        path=None,
        route="/about",
        section="About bottom CTA band",
        component="app/[locale]/about/page.js",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="Photo-free gradient/tone CTA band",
        intendedDescription="Remain photo-free; do not recycle project photos",
        why="Drive enquiry without diluting project authenticity",
        purpose="Conversion CTA",
        renderedDimensions=".about-cta.asas-cta-band",
        objectFit="n/a",
        recommendedSize="2400×900",
        quality="n/a",
        priority="P3",
        canAI=False,
        prompt="",
        notes="Intentionally photo-free",
        textSafeArea="Full band is text",
        alt="",
    ))

    # SERVICES index
    slots.append(slot(
        id="SERVICES-HERO-001",
        path="/assets/asas/roles/asas-role-services-hero.webp",
        route="/services",
        section="Services listing hero",
        component="app/[locale]/services/page.js",
        role="SERVICE_HERO",
        classification="AI_GENERATED",
        existingDescription="Services index hero editorial",
        intendedDescription="Editorial of coordinated engineering disciplines — drawings, models, site coordination mood",
        why="Services index identity",
        purpose="Introduce full service catalogue",
        renderedDimensions=".sv-hero-media",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="ASAS engineering services",
        textSafeArea="Left/center title band",
    ))
    for i, (slug, title, _, _) in enumerate(SERVICES, 1):
        slots.append(slot(
            id=f"SERVICES-CARD-{i:03d}",
            path=None,
            route="/services",
            section=f"Service tone card — {title}",
            component="app/[locale]/services/page.js",
            role="SERVICE_FEATURE",
            classification="GENERIC_ENGINEERING",
            status="MISSING",
            relatedService=slug,
            existingDescription="Tone-only panel (.sv-card-media-frame--tone) — no photo",
            intendedDescription=f"Optional editorial still for {title} card (generic process, not a named project)",
            why="Service catalogue cards currently photo-free",
            purpose="Optional visual enrichment of service cards",
            renderedDimensions="service card media frame",
            objectFit="cover",
            recommendedSize="1800×1200",
            quality="missing",
            priority="P2",
            alt=title,
            notes="Optional photography; currently intentional tone-only",
            textSafeArea="Lower third for title",
        ))
    slots.append(slot(
        id="SERVICES-CTA-001",
        path=None,
        route="/services",
        section="Services enquiry CTA",
        component="components/.../ServicesEnquiryCta (ctaImage null)",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="Photo-free CTA",
        intendedDescription="Remain photo-free",
        why="Conversion without project photo reuse",
        purpose="Enquiry CTA",
        canAI=False,
        prompt="",
        priority="P3",
        quality="n/a",
        notes="ctaImage forced null",
        textSafeArea="Full band text",
        alt="",
    ))

    # Service detail heroes + CTA + scope panel
    for slug, title, role_key, path in SERVICES:
        slots.append(slot(
            id=f"SERVICE-HERO-{slug}",
            path=path,
            route=f"/services/{slug}",
            section=f"Service detail hero — {title}",
            component="app/[locale]/services/[slug]/page.js",
            role="SERVICE_HERO",
            classification="AI_GENERATED",
            relatedService=slug,
            existingDescription=f"Dedicated service hero for {title}",
            intendedDescription=f"Photorealistic editorial illustrating {title} practice for ASAS — tools, drawings, site/office context appropriate to discipline",
            why="Unique visual identity per service",
            purpose="Service detail page hero",
            renderedDimensions=".sd-hero-media fill cover",
            objectFit="cover",
            recommendedSize="2400×1350",
            priority="P1",
            quality="good",
            alt=title,
            notes=f"roleImages.{role_key}",
            textSafeArea="Left ~30% for title",
        ))
        slots.append(slot(
            id=f"SERVICE-SCOPE-PANEL-{slug}",
            path=None,
            route=f"/services/{slug}",
            section=f"Service scope tone panel — {title}",
            component="app/[locale]/services/[slug]/page.js",
            role="SERVICE_FEATURE",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="tone_panel",
            relatedService=slug,
            existingDescription="Decorative tone panel (sd-scope-media--panel), no photo",
            intendedDescription="Remain tone panel unless a discipline still is commissioned",
            why="Visual rhythm in scope section",
            purpose="Decorative structure",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            notes="Photo-free by design",
            textSafeArea="N/A",
            alt="",
        ))
        slots.append(slot(
            id=f"SERVICE-CTA-{slug}",
            path=None,
            route=f"/services/{slug}",
            section=f"Service detail CTA — {title}",
            component="ServiceDetailEnquiryCta.js",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            relatedService=slug,
            existingDescription="ctaImage = null",
            intendedDescription="Photo-free CTA",
            why="Enquiry conversion",
            purpose="CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            notes="Do not recycle project photos",
            textSafeArea="Full band",
            alt="",
        ))

    # SECTORS index
    slots.append(slot(
        id="SECTORS-HERO-001",
        path="/assets/asas/roles/asas-role-sectors-hero.webp",
        route="/sectors",
        section="Sectors listing hero",
        component="app/[locale]/sectors/page.js",
        role="SECTOR_HERO",
        classification="AI_GENERATED",
        existingDescription="Sectors index hero editorial",
        intendedDescription="Editorial panorama of ASAS sector breadth (towers, buildings, infrastructure mood) without naming a specific project",
        why="Sectors index identity",
        purpose="Introduce sectors",
        renderedDimensions="sectors hero media",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="ASAS sectors",
        textSafeArea="Left title band",
    ))
    for i, (slug, title, _, _, _) in enumerate(SECTORS, 1):
        slots.append(slot(
            id=f"SECTORS-CARD-{i:03d}",
            path=None,
            route="/sectors",
            section=f"Sector tone card — {title}",
            component="app/[locale]/sectors/page.js",
            role="SECTOR_CARD",
            classification="GENERIC_ARCHITECTURE",
            status="MISSING",
            relatedSector=slug,
            existingDescription="Tone-only sector card media",
            intendedDescription=f"Optional editorial still for {title} sector card (generic)",
            why="Sector catalogue cards currently tone-only",
            purpose="Optional card photography",
            renderedDimensions="sectors card / featured tone frame",
            objectFit="cover",
            recommendedSize="1800×1200",
            quality="missing",
            priority="P2",
            alt=title,
            notes="First card may use featured tone frame",
            textSafeArea="Lower third title",
        ))
    slots.append(slot(
        id="SECTORS-CTA-001",
        path=None,
        route="/sectors",
        section="Sectors CTA band",
        component="app/[locale]/sectors/page.js",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="Photo-free CTA",
        intendedDescription="Photo-free",
        why="Conversion",
        purpose="CTA",
        canAI=False,
        prompt="",
        priority="P3",
        quality="n/a",
        alt="",
        textSafeArea="Full band",
    ))

    # Sector detail heroes, CTAs, project cards
    for slug, title, role_key, path, related in SECTORS:
        slots.append(slot(
            id=f"SECTOR-HERO-{slug}",
            path=path,
            route=f"/sectors/{slug}",
            section=f"Sector detail hero — {title}",
            component="app/[locale]/sectors/[slug]/page.js",
            role="SECTOR_HERO",
            classification="AI_GENERATED",
            relatedSector=slug,
            existingDescription=f"Sector hero editorial for {title}",
            intendedDescription=f"Premium UAE {title.lower()} editorial photograph — generic sector mood, not a named ASAS project facade",
            why="Unique sector page identity",
            purpose="Sector hero",
            renderedDimensions="sector detail hero fill",
            objectFit="cover",
            recommendedSize="2400×1350",
            priority="P1",
            quality="good",
            alt=title,
            notes=f"roleImages.{role_key}; overviewImage intentionally null",
            textSafeArea="Left ~30% title",
        ))
        slots.append(slot(
            id=f"SECTOR-CTA-{slug}",
            path=None,
            route=f"/sectors/{slug}",
            section=f"Sector CTA — {title}",
            component="SectorDetailEnquiryCta.js",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            relatedSector=slug,
            existingDescription="image=null",
            intendedDescription="Photo-free",
            why="Conversion",
            purpose="CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            alt="",
            textSafeArea="Full band",
        ))
        for pslug in related:
            p = PROJECT_BY_SLUG[pslug]
            src = project_card_path(pslug)
            slots.append(slot(
                id=f"SECTOR-PROJECT-{slug}-{pslug}",
                path=src,
                route=f"/sectors/{slug}",
                section=f"Related project card — {p['title']}",
                component="app/[locale]/sectors/[slug]/page.js",
                role="PROJECT_THUMBNAIL",
                classification="TECHNICAL_DRAWING" if pslug == "traffic-access-studies" else "REAL_PROJECT_PHOTO",
                status="PRESENT" if src else "MISSING",
                realProject="YES",
                relatedProjectName=p["title"],
                relatedProjectSlug=pslug,
                projectLocation=p["location"],
                projectCategory=p["category"],
                relatedSector=slug,
                sourceVerified="YES" if src else "NO",
                existingDescription=project_visual_desc(pslug) if not src else "Approved traffic card",
                intendedDescription=project_visual_desc(pslug),
                why="Show real projects belonging to this sector",
                purpose="Sector → project navigation",
                renderedDimensions=".sc-project-media",
                objectFit="cover",
                quality="B_PROJECT_CARD" if src else "missing",
                priority="P0" if not src else "P1",
                alt=p["title"],
                notes="First ≤3 projects per sector",
                textSafeArea="Lower third title",
            ))

    # PROJECTS index
    slots.append(slot(
        id="PROJECTS-HERO-LEFT-001",
        path="/assets/asas/roles/asas-role-projects-hero.webp",
        route="/projects",
        section="Projects split hero — left editorial",
        component="app/[locale]/projects/page.js + data/projects.js#projectHeroVisuals",
        role="PROJECT_HERO",
        classification="AI_GENERATED",
        existingDescription="Projects listing left hero editorial",
        intendedDescription="Editorial architecture/engineering portfolio mood for projects index (generic)",
        why="Projects index identity",
        purpose="Split hero left",
        renderedDimensions=".pl-hero-photo ~65vw",
        objectFit="cover",
        objectPosition="50% 40%",
        priority="P1",
        quality="good",
        alt="ASAS projects",
        textSafeArea="Avoid critical detail near right seam",
    ))
    slots.append(slot(
        id="PROJECTS-HERO-RIGHT-001",
        path=TRAFFIC_PATHS["portfolio"],
        route="/projects",
        section="Projects split hero — right traffic plan",
        component="app/[locale]/projects/page.js",
        role="TECHNICAL_DRAWING",
        classification="TECHNICAL_DRAWING",
        realProject="YES",
        relatedProjectName="Traffic & Access Studies",
        relatedProjectSlug="traffic-access-studies",
        projectLocation=PROJECT_BY_SLUG["traffic-access-studies"]["location"],
        projectCategory="infrastructure",
        sourceVerified="YES",
        existingDescription="Traffic portfolio technical drawing in split hero",
        intendedDescription="Authentic technical drawing — enhance only",
        why="Shows real technical delivery capability",
        purpose="Split hero right",
        renderedDimensions=".pl-hero-plan ~40vw",
        objectFit="cover",
        objectPosition="50% 45%",
        quality="B_PROJECT_CARD",
        priority="P0",
        duplicate="duplicate_usage",
        alt="Traffic & Access Studies plan",
        notes="Shares traffic portfolio asset (documented exception)",
        textSafeArea="Keep plan legends readable",
    ))
    slots.append(slot(
        id="PROJECTS-CTA-001",
        path=None,
        route="/projects",
        section="Projects enquiry CTA",
        component="ProjectsEnquiryCta (image=null)",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="Photo-free",
        intendedDescription="Photo-free",
        why="Conversion",
        purpose="CTA",
        canAI=False,
        prompt="",
        priority="P3",
        quality="n/a",
        alt="",
        textSafeArea="Full band",
    ))

    for p in PROJECTS:
        src = project_card_path(p["slug"])
        slots.append(slot(
            id=f"PROJECTS-CARD-{p['slug']}",
            path=src,
            route="/projects",
            section=f"Projects listing card — {p['title']}",
            component="components/projects/ProjectsExplorer + ProjectVisual",
            role="PROJECT_THUMBNAIL",
            classification="TECHNICAL_DRAWING" if p["slug"] == "traffic-access-studies" else "REAL_PROJECT_PHOTO",
            status="PRESENT" if src else "MISSING",
            realProject="YES",
            relatedProjectName=p["title"],
            relatedProjectSlug=p["slug"],
            projectLocation=p["location"],
            projectCategory=p["category"],
            sourceVerified="YES" if src else "NO",
            existingDescription=project_visual_desc(p["slug"]),
            intendedDescription=project_visual_desc(p["slug"]),
            why="Projects catalogue browsing",
            purpose="Listing card",
            renderedDimensions=".pl-visual fill",
            objectFit="cover",
            objectPosition="50% 50%",
            quality="B_PROJECT_CARD" if src else "missing",
            priority="P0",
            alt=p["title"],
            notes="22 of 23 use ProjectVisualFallback",
            textSafeArea="Lower third title",
        ))

    # Project detail
    for p in PROJECTS:
        slug = p["slug"]
        if slug == "traffic-access-studies":
            frames = [
                ("PROJECT-HERO-traffic-access-studies", TRAFFIC_PATHS["portfolio"], "PROJECT_HERO", "Main gallery stage"),
                ("PROJECT-GALLERY-traffic-001", TRAFFIC_PATHS["portfolio"], "PROJECT_GALLERY", "Gallery frame portfolio"),
                ("PROJECT-GALLERY-traffic-002", TRAFFIC_PATHS["card"], "PROJECT_GALLERY", "Gallery frame card"),
                ("PROJECT-GALLERY-traffic-003", TRAFFIC_PATHS["mobile"], "PROJECT_GALLERY", "Gallery frame mobile"),
                ("PROJECT-THUMB-traffic-001", TRAFFIC_PATHS["portfolio"], "PROJECT_THUMBNAIL", "Filmstrip thumb portfolio"),
                ("PROJECT-THUMB-traffic-002", TRAFFIC_PATHS["card"], "PROJECT_THUMBNAIL", "Filmstrip thumb card"),
                ("PROJECT-THUMB-traffic-003", TRAFFIC_PATHS["mobile"], "PROJECT_THUMBNAIL", "Filmstrip thumb mobile"),
            ]
            for sid, path, role, section in frames:
                slots.append(slot(
                    id=sid,
                    path=path,
                    route=f"/projects/{slug}",
                    section=f"{section} — {p['title']}",
                    component="app/[locale]/projects/[slug]/page.js",
                    role=role,
                    classification="TECHNICAL_DRAWING",
                    realProject="YES",
                    relatedProjectName=p["title"],
                    relatedProjectSlug=slug,
                    projectLocation=p["location"],
                    projectCategory=p["category"],
                    sourceVerified="YES",
                    existingDescription="Approved traffic technical drawing frame",
                    intendedDescription="Authentic ASAS traffic drawing — enhancement only",
                    why="Project detail storytelling for approved real project",
                    purpose=section,
                    renderedDimensions=".pd-main-media / gallery / filmstrip",
                    objectFit="cover",
                    quality="B_PROJECT_CARD",
                    priority="P0",
                    duplicate="duplicate_usage" if "GALLERY" in sid or "THUMB" in sid else "unique",
                    alt=p["title"],
                    notes="Only project with multi-frame approved gallery",
                    textSafeArea="Preserve drawing margins",
                ))
        else:
            slots.append(slot(
                id=f"PROJECT-HERO-{slug}",
                path=None,
                route=f"/projects/{slug}",
                section=f"Project detail hero — {p['title']}",
                component="app/[locale]/projects/[slug]/page.js + ProjectVisualFallback",
                role="PROJECT_HERO",
                classification="REAL_INTERIOR" if p["kind"] == "interior" else "REAL_PROJECT_PHOTO",
                status="MISSING",
                realProject="YES",
                relatedProjectName=p["title"],
                relatedProjectSlug=slug,
                projectLocation=p["location"],
                projectCategory=p["category"],
                sourceVerified="NO",
                existingDescription="MISSING — ProjectVisualFallback",
                intendedDescription=project_visual_desc(slug),
                why="Primary visual for project detail page",
                purpose="Project hero",
                renderedDimensions=".pd-main-media fill",
                objectFit="cover",
                quality="missing",
                priority="P0",
                alt=p["title"],
                notes="needsOriginalImage; AI fictional rebuild forbidden",
                textSafeArea="Lower third for title overlays",
            ))

        for related in related_peers(slug):
            rp = PROJECT_BY_SLUG[related]
            rsrc = project_card_path(related)
            slots.append(slot(
                id=f"PROJECT-RELATED-{slug}-{related}",
                path=rsrc,
                route=f"/projects/{slug}",
                section=f"Related project card — {rp['title']}",
                component="project detail related list",
                role="PROJECT_THUMBNAIL",
                classification="TECHNICAL_DRAWING" if related == "traffic-access-studies" else "REAL_PROJECT_PHOTO",
                status="PRESENT" if rsrc else "MISSING",
                realProject="YES",
                relatedProjectName=rp["title"],
                relatedProjectSlug=related,
                projectLocation=rp["location"],
                projectCategory=rp["category"],
                sourceVerified="YES" if rsrc else "NO",
                existingDescription=project_visual_desc(related),
                intendedDescription=project_visual_desc(related),
                why="Cross-sell related projects in same category",
                purpose="Related card",
                renderedDimensions="related card media",
                objectFit="cover",
                quality="B_PROJECT_CARD" if rsrc else "missing",
                priority="P1",
                alt=rp["title"],
                notes=f"Category peer of {slug}",
                textSafeArea="Lower third",
            ))

        slots.append(slot(
            id=f"PROJECT-CTA-{slug}",
            path=None,
            route=f"/projects/{slug}",
            section=f"Project detail CTA — {p['title']}",
            component="project detail CTA band",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            realProject="NO",
            relatedProjectName=p["title"],
            relatedProjectSlug=slug,
            existingDescription="PHOTO_FREE .pd-cta.asas-cta-band",
            intendedDescription="Photo-free",
            why="Enquiry conversion",
            purpose="CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            alt="",
            textSafeArea="Full band",
            notes="Do not place project photos in CTA",
        ))

    # PORTFOLIO
    slots.append(slot(
        id="PORTFOLIO-HERO-001",
        path=None,
        route="/portfolio",
        section="Portfolio experience hero",
        component="components/portfolio/PortfolioExperience.js",
        role="PROJECT_HERO",
        classification="REAL_PROJECT_PHOTO",
        status="MISSING",
        realProject="YES",
        relatedProjectName=PROJECT_BY_SLUG["four-towers-al-nahda"]["title"],
        relatedProjectSlug="four-towers-al-nahda",
        projectLocation=PROJECT_BY_SLUG["four-towers-al-nahda"]["location"],
        projectCategory="towers",
        sourceVerified="NO",
        existingDescription="uniqueGallery(projects[0]) often empty because four-towers lacks approved images",
        intendedDescription=project_visual_desc("four-towers-al-nahda"),
        why="Portfolio entry hero",
        purpose="Portfolio hero",
        quality="missing",
        priority="P0",
        alt="Four Towers, Al Nahda",
        notes="Depends on first project gallery availability",
        textSafeArea="Title overlay",
    ))
    for p in PROJECTS:
        src = None
        status = "MISSING"
        clas = "REAL_PROJECT_PHOTO"
        if p["slug"] == "traffic-access-studies":
            # Represent stream as primary card + note multi-frame
            src = TRAFFIC_PATHS["portfolio"]
            status = "PRESENT"
            clas = "TECHNICAL_DRAWING"
        slots.append(slot(
            id=f"PORTFOLIO-PROJECT-{p['slug']}",
            path=src,
            route="/portfolio",
            section=f"Portfolio stream — {p['title']}",
            component="PortfolioExperience + ProjectGallery",
            role="PORTFOLIO_PROJECT",
            classification=clas,
            status=status,
            realProject="YES",
            relatedProjectName=p["title"],
            relatedProjectSlug=p["slug"],
            projectLocation=p["location"],
            projectCategory=p["category"],
            sourceVerified="YES" if src else "NO",
            existingDescription=project_visual_desc(p["slug"]),
            intendedDescription=project_visual_desc(p["slug"]),
            why="Portfolio continuous experience stream",
            purpose="Project stream media",
            objectFit="cover",
            quality="B_PROJECT_CARD" if src else "missing",
            priority="P0",
            alt=p["title"],
            notes="Traffic has 3 gallery frames + thumbs; others fallback",
            textSafeArea="Lower third",
        ))
    # inline CTAs every 6th → indices 6,12,18 → 3 CTAs
    for n, idx in enumerate([6, 12, 18], 1):
        slots.append(slot(
            id=f"PORTFOLIO-INLINE-CTA-{n:03d}",
            path=None,
            route="/portfolio",
            section=f"Portfolio inline CTA after project #{idx}",
            component="PortfolioExperience",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            existingDescription="Photo-free inline CTA",
            intendedDescription="Photo-free",
            why="Break stream for conversion",
            purpose="Inline CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            alt="",
            textSafeArea="Full band",
        ))
    for i, key in enumerate(["portfolio", "card", "mobile"], 1):
        slots.append(slot(
            id=f"PORTFOLIO-LIGHTBOX-traffic-{i:03d}",
            path=TRAFFIC_PATHS[key],
            route="/portfolio",
            section=f"Portfolio lightbox — traffic frame {key}",
            component="PortfolioExperience lightbox",
            role="PROJECT_GALLERY",
            classification="TECHNICAL_DRAWING",
            realProject="YES",
            relatedProjectName="Traffic & Access Studies",
            relatedProjectSlug="traffic-access-studies",
            projectLocation=PROJECT_BY_SLUG["traffic-access-studies"]["location"],
            projectCategory="infrastructure",
            sourceVerified="YES",
            existingDescription="Lightbox reuses gallery frames",
            intendedDescription="Authentic traffic drawing — enhancement only",
            why="Expanded viewing of technical frames",
            purpose="Lightbox",
            duplicate="duplicate_usage",
            quality="B_PROJECT_CARD",
            priority="P2",
            alt="Traffic & Access Studies",
            textSafeArea="Full frame readable",
        ))

    # COMPANY PROFILE
    slots.append(slot(
        id="COMPANY-HERO-001",
        path="/assets/asas/roles/asas-role-company-profile-hero.webp",
        route="/company-profile",
        section="Company profile hero",
        component="app/[locale]/company-profile/page.js",
        role="CORPORATE_EDITORIAL",
        classification="GENERIC_CORPORATE",
        existingDescription="Company profile hero editorial",
        intendedDescription="Corporate Abu Dhabi consultancy hero — professional architecture/engineering atmosphere",
        why="Company profile identity",
        purpose="Hero",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="ASAS company profile",
        textSafeArea="Left title",
    ))
    slots.append(slot(
        id="COMPANY-OVERVIEW-001",
        path="/assets/asas/corporate/asas-editorial-corporate-team.webp",
        route="/company-profile",
        section="Company overview media",
        component="app/[locale]/company-profile/page.js",
        role="CORPORATE_EDITORIAL",
        classification="GENERIC_CORPORATE",
        existingDescription="Corporate team editorial photograph",
        intendedDescription="Multidisciplinary ASAS team reviewing coordinated deliverables in bright office",
        why="Humanize company overview",
        purpose="Overview media",
        objectFit="cover",
        priority="P1",
        quality="good",
        alt="ASAS corporate team",
        textSafeArea="Keep faces clear",
    ))
    slots.append(slot(
        id="COMPANY-PROJECT-FEATURED-001",
        path=None,
        route="/company-profile",
        section="Featured project — Four Towers",
        component="app/[locale]/company-profile/page.js",
        role="PORTFOLIO_PROJECT",
        classification="REAL_PROJECT_PHOTO",
        status="MISSING",
        realProject="YES",
        relatedProjectName="Four Towers, Al Nahda",
        relatedProjectSlug="four-towers-al-nahda",
        projectLocation=PROJECT_BY_SLUG["four-towers-al-nahda"]["location"],
        projectCategory="towers",
        sourceVerified="NO",
        existingDescription="MISSING fallback",
        intendedDescription=project_visual_desc("four-towers-al-nahda"),
        why="Feature flagship project on company profile",
        purpose="Featured project",
        quality="missing",
        priority="P0",
        alt="Four Towers, Al Nahda",
        textSafeArea="Lower third",
    ))
    for i, slug in enumerate(["traffic-access-studies", "culture-private-school", "compound-villas-portfolio"], 1):
        p = PROJECT_BY_SLUG[slug]
        src = project_card_path(slug)
        slots.append(slot(
            id=f"COMPANY-PROJECT-CARD-{i:03d}",
            path=src,
            route="/company-profile",
            section=f"Company project card — {p['title']}",
            component="app/[locale]/company-profile/page.js",
            role="PORTFOLIO_PROJECT",
            classification="TECHNICAL_DRAWING" if slug == "traffic-access-studies" else "REAL_PROJECT_PHOTO",
            status="PRESENT" if src else "MISSING",
            realProject="YES",
            relatedProjectName=p["title"],
            relatedProjectSlug=slug,
            projectLocation=p["location"],
            projectCategory=p["category"],
            sourceVerified="YES" if src else "NO",
            existingDescription=project_visual_desc(slug),
            intendedDescription=project_visual_desc(slug),
            why="Selected works on company profile",
            purpose="Project card",
            quality="B_PROJECT_CARD" if src else "missing",
            priority="P0",
            alt=p["title"],
            textSafeArea="Lower third",
        ))
    slots.append(slot(
        id="COMPANY-CTA-001",
        path=None,
        route="/company-profile",
        section="Company profile enquiry CTA",
        component="CompanyProfileEnquiryCta",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="ctaImage null",
        intendedDescription="Photo-free",
        why="Conversion",
        purpose="CTA",
        canAI=False,
        prompt="",
        priority="P3",
        quality="n/a",
        alt="",
        textSafeArea="Full band",
    ))

    # TEAM listing
    slots.append(slot(
        id="TEAM-HERO-001",
        path="/assets/asas/roles/asas-role-team-hero.webp",
        route="/team",
        section="Team page hero",
        component="app/[locale]/team/page.js",
        role="TEAM",
        classification="GENERIC_CORPORATE",
        existingDescription="Team page hero editorial",
        intendedDescription="Editorial of professional engineering leadership environment (generic, not fake portraits of real staff)",
        why="Team page identity",
        purpose="Hero",
        objectFit="cover",
        objectPosition="55% 38%",
        recommendedSize="2400×1350",
        priority="P1",
        quality="good",
        alt="ASAS team",
        textSafeArea="Left title",
        notes="Do not depict identifiable real staff without consent",
    ))
    slots.append(slot(
        id="TEAM-PHILOSOPHY-001",
        path="/assets/asas/roles/asas-role-team-philosophy.webp",
        route="/team",
        section="Team philosophy media",
        component="app/[locale]/team/page.js",
        role="CORPORATE_EDITORIAL",
        classification="GENERIC_CORPORATE",
        existingDescription="Philosophy section editorial",
        intendedDescription="Quiet corporate editorial conveying collaboration philosophy",
        why="Supports philosophy copy",
        purpose="Mid-page editorial",
        renderedDimensions=".tm-philosophy ~48vw",
        objectFit="cover",
        priority="P2",
        quality="good",
        alt="ASAS team philosophy",
        textSafeArea="Keep subject clear of edges",
    ))
    for tslug, tname, title, projects in TEAM:
        slots.append(slot(
            id=f"TEAM-CARD-{tslug}",
            path=None,
            route="/team",
            section=f"Team directory card — {tname}",
            component="app/[locale]/team/page.js",
            role="TEAM",
            classification="REAL_TEAM",
            status="INITIALS_FALLBACK",
            sourceType="INITIALS_FALLBACK",
            existingDescription="Demo empty profile_image → initials",
            intendedDescription=f"Authentic portrait of {tname}, {title}",
            why="Team directory",
            purpose="Member card",
            renderedDimensions="team card media",
            objectFit="cover",
            recommendedSize="1600×2000",
            orientation="Portrait",
            aspectRatio="4:5",
            quality="missing",
            priority="P1",
            canAI=False,
            authenticity="REAL_PERSON_PHOTO_REQUIRED",
            prompt="",
            alt=tname,
            notes="Do not AI-generate likeness",
            textSafeArea="Lower third name/title",
            suggestedFilename=f"asas-team-{tslug}.webp",
        ))
    slots.append(slot(
        id="TEAM-CTA-001",
        path=None,
        route="/team",
        section="Team enquiry CTA",
        component="team page CTA",
        role="CTA_BACKGROUND",
        classification="DECORATIVE",
        status="PHOTO_FREE_CTA",
        sourceType="PHOTO_FREE_CTA",
        existingDescription="Photo-free",
        intendedDescription="Photo-free",
        why="Conversion",
        purpose="CTA",
        canAI=False,
        prompt="",
        priority="P3",
        quality="n/a",
        alt="",
        textSafeArea="Full band",
    ))

    # TEAM detail
    for tslug, tname, title, projects in TEAM:
        slots.append(slot(
            id=f"TEAM-PORTRAIT-{tslug}",
            path=None,
            route=f"/team/{tslug}",
            section=f"Team member hero portrait — {tname}",
            component="TeamMemberHero",
            role="TEAM",
            classification="REAL_TEAM",
            status="INITIALS_FALLBACK",
            sourceType="INITIALS_FALLBACK",
            existingDescription="MISSING initials fallback",
            intendedDescription=f"High-quality authentic portrait of {tname}, {title}",
            why="Member detail identity",
            purpose="Portrait hero",
            recommendedSize="1800×2250",
            orientation="Portrait",
            aspectRatio="4:5",
            quality="missing",
            priority="P1",
            canAI=False,
            authenticity="REAL_PERSON_PHOTO_REQUIRED",
            prompt="",
            alt=tname,
            notes="secondary_image not rendered on public pages",
            textSafeArea="Keep headroom",
            suggestedFilename=f"asas-team-{tslug}-portrait.webp",
        ))
        for pslug in projects:
            p = PROJECT_BY_SLUG[pslug]
            src = project_card_path(pslug)
            slots.append(slot(
                id=f"TEAM-PROJECT-{tslug}-{pslug}",
                path=src,
                route=f"/team/{tslug}",
                section=f"Notable project — {p['title']}",
                component="TeamProjects",
                role="PROJECT_THUMBNAIL",
                classification="TECHNICAL_DRAWING" if pslug == "traffic-access-studies" else "REAL_PROJECT_PHOTO",
                status="PRESENT" if src else "MISSING",
                realProject="YES",
                relatedProjectName=p["title"],
                relatedProjectSlug=pslug,
                projectLocation=p["location"],
                projectCategory=p["category"],
                sourceVerified="YES" if src else "NO",
                existingDescription=project_visual_desc(pslug),
                intendedDescription=project_visual_desc(pslug),
                why="Show member project experience",
                purpose="Notable project card",
                quality="B_PROJECT_CARD" if src else "missing",
                priority="P1",
                alt=p["title"],
                textSafeArea="Lower third",
            ))
        # related member cards ≤3
        others = [t for t in TEAM if t[0] != tslug][:3]
        for oslug, oname, _, _ in others:
            slots.append(slot(
                id=f"TEAM-RELATED-{tslug}-{oslug}",
                path=None,
                route=f"/team/{tslug}",
                section=f"Related member card — {oname}",
                component="related team cards",
                role="TEAM",
                classification="REAL_TEAM",
                status="INITIALS_FALLBACK",
                sourceType="INITIALS_FALLBACK",
                existingDescription="Initials fallback",
                intendedDescription=f"Authentic portrait of {oname}",
                why="Related people navigation",
                purpose="Related card",
                canAI=False,
                authenticity="REAL_PERSON_PHOTO_REQUIRED",
                prompt="",
                priority="P2",
                quality="missing",
                alt=oname,
                textSafeArea="Lower third",
                suggestedFilename=f"asas-team-{oslug}.webp",
            ))
        slots.append(slot(
            id=f"TEAM-CTA-{tslug}",
            path=None,
            route=f"/team/{tslug}",
            section=f"Team member CTA — {tname}",
            component="team detail CTA",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            existingDescription="Photo-free",
            intendedDescription="Photo-free",
            why="Conversion",
            purpose="CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            alt="",
            textSafeArea="Full band",
        ))

    # Careers / Contact / Downloads / Enquiry
    for sid, route, section, path, role, clas, component, alt in [
        ("CAREERS-HERO-001", "/careers", "Careers hero", "/assets/asas/roles/asas-role-careers-hero.webp", "CAREERS", "GENERIC_CORPORATE", "app/[locale]/careers/page.js", "Careers at ASAS"),
        ("CONTACT-HERO-001", "/contact", "Contact hero", "/assets/asas/roles/asas-role-contact-hero.webp", "CONTACT", "GENERIC_CORPORATE", "app/[locale]/contact/page.js", "Contact ASAS"),
        ("DOWNLOADS-HERO-001", "/downloads", "Downloads hero", "/assets/asas/roles/asas-role-downloads-hero.webp", "OTHER", "GENERIC_CORPORATE", "app/[locale]/downloads/page.js", "ASAS downloads"),
        ("ENQUIRY-HERO-001", "/project-enquiry", "Project enquiry hero", "/assets/asas/roles/asas-role-enquiry-hero.webp", "CONTACT", "GENERIC_CORPORATE", "app/[locale]/project-enquiry/page.js", "Project enquiry"),
    ]:
        slots.append(slot(
            id=sid,
            path=path,
            route=route,
            section=section,
            component=component,
            role=role,
            classification=clas,
            existingDescription=f"{section} editorial photograph",
            intendedDescription=f"Premium ASAS {section.lower()} editorial — Abu Dhabi consultancy atmosphere, generic (no named project)",
            why=f"Identity for {route}",
            purpose="Page hero",
            objectFit="cover",
            priority="P1",
            quality="good",
            alt=alt,
            textSafeArea="Left title band",
        ))

    slots.append(slot(
        id="CONTACT-MAP-001",
        path=None,
        route="/contact",
        section="Office map embed",
        component="app/[locale]/contact/page.js",
        role="OTHER",
        classification="OTHER",
        status="MAP_EMBED",
        sourceType="MAP_EMBED",
        existingDescription="Google Maps iframe — not a brand photo",
        intendedDescription="Keep live map embed (not AI imagery)",
        why="Show office location",
        purpose="Map",
        canAI=False,
        prompt="",
        priority="P2",
        quality="n/a",
        alt="ASAS office map",
        notes="Not a photographic slot",
        textSafeArea="N/A",
    ))
    slots.append(slot(
        id="DOWNLOADS-FEATURED-VISUAL-001",
        path=None,
        route="/downloads",
        section="Featured PDF cover visual",
        component="app/[locale]/downloads/page.js",
        role="OTHER",
        classification="GENERIC_CORPORATE",
        status="MISSING",
        existingDescription="Fallback panel + FileText icon — no cover art",
        intendedDescription="ASAS company profile PDF cover mock / document cover still (generic corporate, not a project photo)",
        why="Make downloads card visually richer",
        purpose="Document cover",
        renderedDimensions="downloads featured visual",
        objectFit="cover",
        recommendedSize="1600×2200",
        orientation="Portrait",
        aspectRatio="8:11",
        quality="missing",
        priority="P2",
        alt="ASAS company profile document",
        textSafeArea="Allow title block on cover",
    ))

    for sid, route, section in [
        ("CAREERS-CTA-001", "/careers", "Careers CTA"),
        ("CONTACT-CTA-001", "/contact", "Contact CTA"),
        ("DOWNLOADS-CTA-001", "/downloads", "Downloads CTA"),
        ("ENQUIRY-CTA-001", "/project-enquiry", "Enquiry CTA"),
    ]:
        slots.append(slot(
            id=sid,
            path=None,
            route=route,
            section=section,
            component=f"{route} CTA band",
            role="CTA_BACKGROUND",
            classification="DECORATIVE",
            status="PHOTO_FREE_CTA",
            sourceType="PHOTO_FREE_CTA",
            existingDescription="Photo-free CTA band pattern",
            intendedDescription="Photo-free",
            why="Conversion",
            purpose="CTA",
            canAI=False,
            prompt="",
            priority="P3",
            quality="n/a",
            alt="",
            textSafeArea="Full band",
        ))

    # Annotate duplicate path usages
    by_path: dict[str, list[str]] = defaultdict(list)
    for s in slots:
        if s["path"]:
            by_path[s["path"]].append(s["id"])
    for s in slots:
        if s["path"] and len(by_path[s["path"]]) > 1:
            others = [i for i in by_path[s["path"]] if i != s["id"]]
            s["usedAlsoIn"] = others
            if s["duplicate"] == "unique":
                s["duplicate"] = "duplicate_usage"

    return slots


# ---------------------------------------------------------------------------
# Writers
# ---------------------------------------------------------------------------

CSV_FIELDS = [
    "id", "filename", "path", "route", "section", "component", "role", "classification",
    "sourceType", "status", "realProject", "relatedProjectName", "relatedProjectSlug",
    "projectLocation", "projectCategory", "sourceVerified", "relatedService", "relatedSector",
    "existingDescription", "intendedDescription", "why", "purpose",
    "sourceDimensions", "renderedDimensions", "aspectRatio", "orientation", "recommendedSize",
    "crop", "objectFit", "objectPosition", "desktop", "tablet", "mobile", "quality",
    "duplicate", "usedAlsoIn", "canAI", "aiGenerationAllowed", "authenticity", "priority",
    "prompt", "negativePrompt", "suggestedFilename", "alt", "notes", "textSafeArea",
]


def summarize(slots: list[dict[str, Any]]) -> dict[str, Any]:
    paths = [s["path"] for s in slots if s["path"]]
    unique_paths = sorted(set(paths))
    dup_slots = sum(1 for s in slots if s["duplicate"] == "duplicate_usage")
    real = [s for s in slots if s["realProject"] == "YES"]
    ai = [s for s in slots if s["canAI"] and s["prompt"]]
    missing = [s for s in slots if s["status"] in {"MISSING", "INITIALS_FALLBACK", "TEXT_MARK"}]
    need_better = [s for s in slots if s["realProject"] == "YES" and s["status"] != "PRESENT"]
    low_q = [s for s in slots if s["quality"] in {"missing", "low", "unknown"} and s["status"] not in {"PHOTO_FREE_CTA", "MAP_EMBED", "TEXT_AVATAR"}]
    return {
        "totalSlots": len(slots),
        "uniqueSourceImages": len(unique_paths),
        "duplicateUsageSlots": dup_slots,
        "realProjectSlots": len(real),
        "genericSlots": len(slots) - len(real),
        "aiGeneratableSlots": len(ai),
        "missingSlots": len(missing),
        "needBetterSource": len(need_better),
        "lowOrUnknownQuality": len(low_q),
        "photoFreeCtas": sum(1 for s in slots if s["status"] == "PHOTO_FREE_CTA"),
    }


def write_json(slots: list[dict[str, Any]], summary: dict[str, Any]) -> Path:
    out = DOCS / "asas-image-blueprint.json"
    payload = {
        "meta": {
            "title": "ASAS Frontend Master Image Blueprint",
            "generatedBy": "Frontend/scripts/generate-image-blueprint.py",
            "policy": "Document IMAGE SLOTS. Real named projects: AI_GENERATION_ALLOWED=false; enhancement-only prompts. CTA bands photo-free.",
            "summary": summary,
        },
        "slots": slots,
    }
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return out


def write_csv(slots: list[dict[str, Any]]) -> Path:
    out = DOCS / "asas-image-blueprint.csv"
    with out.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        for s in slots:
            row = dict(s)
            row["usedAlsoIn"] = "|".join(s.get("usedAlsoIn") or [])
            row["canAI"] = "YES" if s["canAI"] else "NO"
            row["aiGenerationAllowed"] = "YES" if s["aiGenerationAllowed"] else "NO"
            w.writerow({k: row.get(k, "") for k in CSV_FIELDS})
    return out


def write_md(slots: list[dict[str, Any]], summary: dict[str, Any]) -> Path:
    out = DOCS / "asas-image-blueprint.md"
    by_route: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for s in slots:
        by_route[s["route"]].append(s)

    route_order = [
        "*", "/", "/about", "/services",
        *[f"/services/{slug}" for slug, *_ in SERVICES],
        "/sectors",
        *[f"/sectors/{slug}" for slug, *_ in SECTORS],
        "/projects",
        *[f"/projects/{p['slug']}" for p in PROJECTS],
        "/portfolio", "/company-profile", "/team",
        *[f"/team/{t[0]}" for t in TEAM],
        "/careers", "/contact", "/downloads", "/project-enquiry",
    ]
    # include any leftovers
    for r in sorted(by_route.keys()):
        if r not in route_order:
            route_order.append(r)

    lines: list[str] = []
    lines.append("# ASAS Master Image Blueprint")
    lines.append("")
    lines.append("Generated by `Frontend/scripts/generate-image-blueprint.py`.")
    lines.append("Documents **image slots / visual requirements** (not only files).")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append("| Metric | Count |")
    lines.append("|---|---:|")
    for k, label in [
        ("totalSlots", "Total image slots"),
        ("uniqueSourceImages", "Unique source images"),
        ("duplicateUsageSlots", "Duplicate usage slots"),
        ("realProjectSlots", "Real project slots (REAL_PROJECT=YES)"),
        ("genericSlots", "Generic / non-project slots"),
        ("aiGeneratableSlots", "AI-generatable slots"),
        ("missingSlots", "Missing / fallback / text-mark slots"),
        ("needBetterSource", "Real project slots needing better source"),
        ("lowOrUnknownQuality", "Low / missing / unknown quality"),
        ("photoFreeCtas", "Photo-free CTA slots"),
    ]:
        lines.append(f"| {label} | {summary[k]} |")
    lines.append("")
    lines.append("### Rules")
    lines.append("")
    lines.append("- Named ASAS projects: `AI_GENERATION_ALLOWED=false`; enhancement/restoration prompts only — never invent buildings.")
    lines.append("- Generic services/sectors/corporate: Midjourney/DALL·E-ready prompts with ASAS style.")
    lines.append("- Duplicate file usages are separate slots with `usedAlsoIn`.")
    lines.append("- CTA bands are photo-free by design.")
    lines.append("")

    for route in route_order:
        group = by_route.get(route)
        if not group:
            continue
        title = "Global" if route == "*" else f"Route `{route}`"
        lines.append(f"## {title}")
        lines.append("")
        lines.append(f"_Slots on this page: **{len(group)}**_")
        lines.append("")
        for s in group:
            lines.append(f"### {s['id']} — {s['section']}")
            lines.append("")
            lines.append(f"- **Path / file:** `{s['path'] or '—'}` ({s['filename'] or 'n/a'})")
            lines.append(f"- **Component:** `{s['component']}`")
            lines.append(f"- **Role / classification:** `{s['role']}` / `{s['classification']}`")
            lines.append(f"- **Status / source type:** `{s['status']}` / `{s['sourceType']}`")
            lines.append(f"- **Real project:** {s['realProject']}" + (f" — {s['relatedProjectName']} (`{s['relatedProjectSlug']}`)" if s['relatedProjectName'] else ""))
            if s["projectLocation"]:
                lines.append(f"- **Project location / category / verified:** {s['projectLocation']} / {s['projectCategory']} / {s['sourceVerified'] or '—'}")
            if s["relatedService"]:
                lines.append(f"- **Related service:** `{s['relatedService']}`")
            if s["relatedSector"]:
                lines.append(f"- **Related sector:** `{s['relatedSector']}`")
            lines.append(f"- **Existing description:** {s['existingDescription']}")
            lines.append(f"- **Intended description:** {s['intendedDescription']}")
            lines.append(f"- **Why / purpose:** {s['why']} / {s['purpose']}")
            lines.append(
                f"- **Dimensions:** source `{s['sourceDimensions'] or '—'}` · rendered `{s['renderedDimensions'] or '—'}` · "
                f"aspect `{s['aspectRatio'] or '—'}` · orientation `{s['orientation'] or '—'}` · recommended `{s['recommendedSize']}`"
            )
            lines.append(
                f"- **Crop / fit:** {s['crop']} · object-fit `{s['objectFit']}` · object-position `{s['objectPosition']}`"
            )
            lines.append(f"- **Responsive:** desktop `{s['desktop']}` · tablet `{s['tablet']}` · mobile `{s['mobile']}`")
            lines.append(f"- **Quality / priority / duplicate:** `{s['quality']}` / `{s['priority']}` / `{s['duplicate']}`")
            if s["usedAlsoIn"]:
                lines.append(f"- **Also used in slots:** {', '.join(s['usedAlsoIn'])}")
            lines.append(
                f"- **AI allowed:** {'YES' if s['canAI'] else 'NO'} · authenticity `{s['authenticity']}`"
            )
            lines.append(f"- **Text-safe area:** {s['textSafeArea']}")
            lines.append(f"- **Suggested filename / alt:** `{s['suggestedFilename']}` / “{s['alt']}”")
            if s["prompt"]:
                lines.append("")
                lines.append("**AI prompt:**")
                lines.append("")
                lines.append(f"> {s['prompt']}")
                lines.append("")
                lines.append("**Negative prompt:**")
                lines.append("")
                lines.append(f"> {s['negativePrompt']}")
            if s["notes"]:
                lines.append("")
                lines.append(f"_Notes:_ {s['notes']}")
            lines.append("")

    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def write_prompts(slots: list[dict[str, Any]]) -> Path:
    out = DOCS / "asas-image-generation-prompts.md"
    ai_slots = [s for s in slots if s["canAI"] and s["prompt"] and s["realProject"] != "YES"]
    lines = [
        "# ASAS AI Generation Prompts",
        "",
        "Only slots where **AI generation is allowed** (generic / editorial / optional photography).",
        "Real named ASAS projects are excluded — see `asas-real-project-images.md`.",
        "",
        f"Total AI-ready prompts: **{len(ai_slots)}**",
        "",
    ]
    for s in ai_slots:
        lines.extend([
            f"## {s['id']}",
            "",
            f"IMAGE ID: {s['id']}",
            f"PAGE: {s['route']}",
            f"SECTION: {s['section']}",
            f"PURPOSE: {s['purpose']}",
            f"SIZE: {s['recommendedSize']}",
            f"ASPECT RATIO: {s['aspectRatio'] or 'match recommended size'}",
            "",
            "PROMPT:",
            s["prompt"],
            "",
            "NEGATIVE PROMPT:",
            s["negativePrompt"],
            "",
            "---",
            "",
        ])
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def write_real(slots: list[dict[str, Any]]) -> Path:
    out = DOCS / "asas-real-project-images.md"
    real = [s for s in slots if s["realProject"] == "YES"]
    lines = [
        "# ASAS Real Project Image Slots",
        "",
        "All slots with **REAL_PROJECT = YES**.",
        "Do **not** invent buildings. Prompts below are enhancement/restoration only (or source-capture guidance).",
        "",
        f"Total real-project slots: **{len(real)}**",
        "",
    ]
    by_project: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for s in real:
        by_project[s["relatedProjectSlug"] or "unknown"].append(s)

    for slug in [p["slug"] for p in PROJECTS]:
        group = by_project.get(slug)
        if not group:
            continue
        p = PROJECT_BY_SLUG[slug]
        lines.append(f"## {p['title']} (`{slug}`)")
        lines.append("")
        lines.append(f"- Location: {p['location']}")
        lines.append(f"- Category: {p['category']}")
        lines.append(f"- Approved live assets: {'YES (traffic card/portfolio/mobile)' if slug == 'traffic-access-studies' else 'NO — needs original source'}")
        lines.append("")
        for s in group:
            lines.append(f"### {s['id']}")
            lines.append("")
            lines.append(f"- Route / section: `{s['route']}` — {s['section']}")
            lines.append(f"- Current source: `{s['path'] or 'MISSING / fallback'}`")
            lines.append(f"- Status / quality: `{s['status']}` / `{s['quality']}`")
            lines.append(f"- Source dimensions: `{s['sourceDimensions'] or '—'}`")
            lines.append(f"- Existing image: {s['existingDescription']}")
            lines.append(f"- Better source needed: {'NO' if s['status'] == 'PRESENT' and slug == 'traffic-access-studies' else 'YES'}")
            lines.append(f"- Verified: {s['sourceVerified'] or 'NO'}")
            if s["prompt"]:
                lines.append("")
                lines.append("**Enhancement / authenticity prompt (NOT a fictional rebuild):**")
                lines.append("")
                lines.append(f"> {s['prompt']}")
            lines.append("")
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def main() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    print("Building image slot inventory…")
    slots = build_slots()
    summary = summarize(slots)
    print("Writing reports…")
    paths = [
        write_md(slots, summary),
        write_csv(slots),
        write_json(slots, summary),
        write_prompts(slots),
        write_real(slots),
    ]
    print("")
    print("=== SUMMARY COUNTS ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")
    print("")
    print("=== OUTPUT FILES ===")
    for p in paths:
        exists = p.is_file()
        print(f"  [{'OK' if exists else 'MISSING'}] {p} ({p.stat().st_size if exists else 0} bytes)")
    missing_files = [str(p) for p in paths if not p.is_file()]
    if missing_files:
        raise SystemExit(f"Failed to write: {missing_files}")
    print("")
    print(f"Slot count verified: {len(slots)}")


if __name__ == "__main__":
    main()
