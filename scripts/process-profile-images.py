#!/usr/bin/env python3
"""Direct ASAS Company Profile image extraction and quality-gated preparation.

Real project streams are extracted byte-for-byte with PyMuPDF. Low-resolution
project images remain private reference sources and are not enlarged into active
website photography. Run from the Frontend directory:

    python3 scripts/process-profile-images.py

Requires: PyMuPDF and Pillow with WebP/AVIF support.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import fitz
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "assets" / "image-source"
MASTER_ROOT = ROOT / "assets" / "image-masters"
WEB_ROOT = ROOT / "public" / "assets" / "asas"
INVENTORY_PATH = ROOT / "assets" / "image-inventory.json"
PDF = ROOT / "public" / "downloads" / "asas-company-profile.pdf"
GENERATED_HERO = SOURCE_ROOT / "corporate" / "asas-generic-engineering-hero-source.png"
GENERATED_COORDINATION = SOURCE_ROOT / "services" / "asas-generic-technical-coordination-source.png"

TIER_B = {"traffic-access-studies"}
TIER_E = {
    "residential-building-al-raha-rbw2",
    "compound-villas",
    "private-villa-shakhbout-w01",
    "private-villa-khalifa-se24",
    "residential-villa-al-shamkha-sh3",
    "residential-villa-riyadh-rd32",
    "residential-villa-bani-yas-eb11-01",
    "restaurant-interior",
    "hotel-lobby-interior",
}


IMAGES = [
    dict(id="four-towers-al-nahda", page=30, xref=12, category="towers", project="Four Towers, Al Nahda", location="Sharjah, Al Nahda", imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(0, 8, 525, 718), focal=(0.52, 0.48), use=["homepage selected work", "project detail", "tower sector"]),
    dict(id="unidentified-high-rise", page=3, xref=28, category="corporate", project=None, location=None, imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(62, 8, 447, 737), focal=(0.68, 0.48), use=["editorial company imagery only"]),
    dict(id="commercial-residential-building-m26", page=31, xref=73, category="buildings", project="Commercial & Residential Building — M26", location="Mohammed Bin Zayed City / Musaffah M26", imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(29, 75, 438, 547), focal=(0.56, 0.52), use=["project detail", "buildings sector", "architecture service"]),
    dict(id="commercial-residential-building-msh36", page=31, xref=84, category="buildings", project="Commercial & Residential Building — MSH36", location="Khalifa City, Sector MSH36", imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(29, 70, 441, 551), focal=(0.55, 0.50), use=["project detail", "buildings sector", "structural service"]),
    dict(id="supervision-building-unidentified", page=21, xref=96, category="corporate", project=None, location=None, imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(10, 43, 370, 368), focal=(0.58, 0.50), use=["construction supervision service only"]),
    dict(id="residential-building-al-raha-rbw2", page=31, xref=134, category="buildings", project="Residential Building — RBW2", location="Al Raha Beach, Abu Dhabi, RBW2", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(0, 40, 241, 366), focal=(0.57, 0.50), use=["project detail", "MEP service"]),
    dict(id="mbz-city-towers", page=32, xref=137, category="towers", project="MBZ City Towers", location="Mohammed Bin Zayed City, Abu Dhabi", imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(63, 0, 447, 450), focal=(0.70, 0.50), use=["project detail", "about feature"]),
    dict(id="traffic-access-studies", page=34, xref=171, category="infrastructure", project="Traffic & Access Studies", location="Abu Dhabi Island and Khalifa City — C61, C31, C32, C47", imageType="TECHNICAL_DRAWING", quality="GOOD", crop=(178, 70, 1119, 694), focal=(0.60, 0.56), use=["project detail", "infrastructure sector", "traffic studies service"]),
    dict(id="culture-private-school", page=35, xref=176, category="schools", project="Culture Private School", location=None, imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(0, 0, 593, 523), focal=(0.53, 0.55), use=["project detail", "education sector"]),
    dict(id="emirates-private-school", page=35, xref=177, category="schools", project="Emirates Private School", location=None, imageType="REAL_RENDER", quality="NEEDS_ENHANCEMENT", crop=(0, 0, 573, 297), focal=(0.55, 0.52), use=["project detail", "education sector"]),
    dict(id="compound-villas", page=36, xref=187, category="villas", project="Compound Villas Portfolio", location="Khalifa City; Mohammed Bin Zayed City; Shakhbout City", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(35, 30, 293, 359), focal=(0.54, 0.58), use=["compound portfolio", "villas sector", "project management service"]),
    dict(id="private-villa-shakhbout-w01", page=37, xref=190, category="villas", project="Private Villa — W01", location="Shakhbout City, W01", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(28, 29, 227, 359), focal=(0.58, 0.53), use=["project detail", "private villas"]),
    dict(id="private-villa-khalifa-se24", page=37, xref=191, category="villas", project="Private Villa — SE24", location="Khalifa City, SE24", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(0, 36, 211, 335), focal=(0.57, 0.50), use=["project detail", "private villas"]),
    dict(id="residential-villa-al-shamkha-sh3", page=38, xref=198, category="villas", project="Residential Villa — SH3", location="Al Shamkha, SH3", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(0, 46, 212, 335), focal=(0.55, 0.52), use=["project detail", "residential villas"]),
    dict(id="residential-villa-riyadh-rd32", page=38, xref=199, category="villas", project="Residential Villa — RD32", location="Madinat Al Riyadh, RD32", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(0, 46, 211, 335), focal=(0.54, 0.55), use=["project detail", "residential villas"]),
    dict(id="residential-villa-bani-yas-eb11-01", page=38, xref=200, category="villas", project="Residential Villa — EB11-01", location="Bani Yas, EB11-01", imageType="REAL_RENDER", quality="NEEDS_BETTER_SOURCE", crop=(0, 46, 211, 335), focal=(0.58, 0.50), use=["project detail", "residential villas"]),
    dict(id="reception-hall-private-villa", page=41, xref=207, category="interiors", project="Reception Hall — Private Villa", location=None, imageType="REAL_PROJECT", quality="NEEDS_ENHANCEMENT", crop=(0, 0, 405, 406), focal=(0.52, 0.52), use=["project detail", "interior sector", "interior service"]),
    dict(id="majlis-and-dining-private-villa", page=41, xref=208, category="interiors", project="Majlis & Dining — Private Villa", location=None, imageType="REAL_PROJECT", quality="NEEDS_ENHANCEMENT", crop=(0, 0, 406, 406), focal=(0.55, 0.52), use=["project detail", "interior sector"]),
    dict(id="restaurant-interior", page=42, xref=211, category="interiors", project="Restaurant Interior", location=None, imageType="REAL_PROJECT", quality="NEEDS_BETTER_SOURCE", crop=(0, 0, 244, 408), focal=(0.53, 0.50), use=["project detail", "hospitality interiors"]),
    dict(id="hotel-lobby-interior", page=42, xref=212, category="interiors", project="Hotel Lobby Interior", location=None, imageType="REAL_PROJECT", quality="NEEDS_BETTER_SOURCE", crop=(0, 0, 244, 406), focal=(0.53, 0.50), use=["project detail", "hospitality interiors"]),
]


MISSING_SOURCE_QUEUE = [
    {"asset": "Showroom — M42", "category": "industrial", "sourceProfilePage": 33, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot; no project pixels are embedded.", "desired": "2400px-wide landscape source"},
    {"asset": "Industrial Facility — M42", "category": "industrial", "sourceProfilePage": 33, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot; no project pixels are embedded.", "desired": "2400px-wide landscape source"},
    {"asset": "Industrial Facility — M15", "category": "industrial", "sourceProfilePage": 33, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot; no project pixels are embedded.", "desired": "2400px-wide landscape source"},
    {"asset": "American International School", "category": "schools", "sourceProfilePage": 35, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot.", "desired": "2400px-wide landscape source"},
    {"asset": "Private Villa — Z14", "category": "villas", "sourceProfilePage": 37, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot.", "desired": "1600px-wide source"},
    {"asset": "Retail / Showroom Interior", "category": "interiors", "sourceProfilePage": 42, "status": "NEEDS_BETTER_SOURCE", "reason": "Profile contains an empty image slot.", "desired": "2000px-wide source"},
]

SAFE_EXTERNAL_RESTORATION_PROMPT = (
    "Upscale by up to 4x using non-generative restoration only. Preserve every "
    "building, facade, floor, window, road, engineering line, interior element, "
    "person, vehicle and landscape feature exactly as supplied. Apply conservative "
    "deblocking, denoise, mild deblur, neutral white balance, exposure correction "
    "and restrained edge sharpening. Do not use generative fill, outpainting, "
    "object replacement, invented texture or geometry reconstruction. Leave absent "
    "detail unresolved rather than synthesising it."
)


def cover_crop(image: Image.Image, ratio: float, focal: tuple[float, float]) -> Image.Image:
    width, height = image.size
    current = width / height
    fx, fy = focal
    if current > ratio:
        crop_width = round(height * ratio)
        left = round((width - crop_width) * fx)
        left = max(0, min(left, width - crop_width))
        return image.crop((left, 0, left + crop_width, height))
    crop_height = round(width / ratio)
    top = round((height - crop_height) * fy)
    top = max(0, min(top, height - crop_height))
    return image.crop((0, top, width, top + crop_height))


def cleanup_without_upscale(image: Image.Image) -> Image.Image:
    """Normalize orientation/color without synthesizing or enlarging detail."""
    return ImageOps.exif_transpose(image).convert("RGB")


def save_web(image: Image.Image, base: Path, size: tuple[int, int]) -> dict:
    if size[0] > image.width or size[1] > image.height:
        raise ValueError(f"Refusing to upscale {image.size} to {size}: {base}")
    base.parent.mkdir(parents=True, exist_ok=True)
    output = image.resize(size, Image.Resampling.LANCZOS)
    webp = base.with_suffix(".webp")
    avif = base.with_suffix(".avif")
    output.save(webp, "WEBP", quality=84, method=6)
    output.save(avif, "AVIF", quality=72)
    return {
        "webp": "/" + webp.relative_to(ROOT / "public").as_posix(),
        "avif": "/" + avif.relative_to(ROOT / "public").as_posix(),
        "width": size[0],
        "height": size[1],
    }


def remove_superseded_enlargements() -> None:
    for path in [WEB_ROOT / "projects", WEB_ROOT / "generic"]:
        if path.exists():
            shutil.rmtree(path)
    if MASTER_ROOT.exists():
        for path in MASTER_ROOT.iterdir():
            if path.name != "real-projects":
                shutil.rmtree(path) if path.is_dir() else path.unlink()


def main() -> None:
    SOURCE_ROOT.mkdir(parents=True, exist_ok=True)
    MASTER_ROOT.mkdir(parents=True, exist_ok=True)
    WEB_ROOT.mkdir(parents=True, exist_ok=True)
    remove_superseded_enlargements()
    doc = fitz.open(PDF)
    inventory = []

    for item in IMAGES:
        page = doc[item["page"] - 1]
        available = {image[0] for image in page.get_images(full=True)}
        if item["xref"] not in available:
            raise RuntimeError(f'Image xref {item["xref"]} missing from PDF page {item["page"]}')

        extracted = doc.extract_image(item["xref"])
        source_dir = SOURCE_ROOT / item["category"]
        source_dir.mkdir(parents=True, exist_ok=True)
        source_path = source_dir / f'asas-{item["id"]}-source.{extracted["ext"]}'
        source_path.write_bytes(extracted["image"])

        original = Image.open(source_path).convert("RGB")
        cropped = cleanup_without_upscale(original.crop(item["crop"]))
        tier = "B_PROJECT_CARD" if item["id"] in TIER_B else ("E_NEED_ORIGINAL_SOURCE" if item["id"] in TIER_E else "D_REFERENCE_ONLY")
        outputs = None
        master_path = None
        master_dimensions = None

        if tier == "B_PROJECT_CARD":
            master_dir = MASTER_ROOT / "real-projects"
            master_dir.mkdir(parents=True, exist_ok=True)
            master_path = master_dir / f'asas-{item["id"]}-master.png'
            cropped.save(master_path, "PNG", optimize=True)
            card = cover_crop(cropped, 4 / 3, item["focal"])
            portfolio = cover_crop(cropped, 3 / 2, item["focal"])
            outputs = {
                "card": save_web(card, WEB_ROOT / "real-projects" / f'asas-{item["id"]}-card', (800, 600)),
                "portfolio": save_web(portfolio, WEB_ROOT / "real-projects" / f'asas-{item["id"]}-portfolio', (936, 624)),
                "mobile": save_web(card, WEB_ROOT / "real-projects" / f'asas-{item["id"]}-mobile', (600, 450)),
            }
            master_dimensions = {"width": cropped.width, "height": cropped.height}

        inventory.append({
            **{key: value for key, value in item.items() if key not in {"crop", "focal"}},
            "source": str(source_path.relative_to(ROOT)),
            "sourceDimensions": {"width": original.width, "height": original.height},
            "usableCropDimensions": {"width": cropped.width, "height": cropped.height},
            "qualityTier": tier,
            "activeWebsiteAsset": tier == "B_PROJECT_CARD",
            "approvedWebsiteUse": "Project cards and technical editorial layouts" if tier == "B_PROJECT_CARD" else "Internal reference only; request original ASAS source",
            "master": str(master_path.relative_to(ROOT)) if master_path else None,
            "masterDimensions": master_dimensions,
            "processing": ["Direct embedded-stream extraction", "PDF framing crop"] if tier != "B_PROJECT_CARD" else ["Direct embedded-stream extraction", "PDF framing crop", "native-resolution web export"],
            "externalEnhancementPrompt": SAFE_EXTERNAL_RESTORATION_PROMPT if tier == "E_NEED_ORIGINAL_SOURCE" else None,
            "outputs": outputs,
        })

    generic_assets = []
    generic_specs = [
        ("homepage-hero", GENERATED_HERO, "generated-editorial", 16 / 9, (1536, 864), "Homepage hero and contact atmosphere"),
        ("technical-coordination", GENERATED_COORDINATION, "services", 4 / 3, (1280, 960), "Design, quantities, project management and process"),
        ("site-supervision", SOURCE_ROOT / "services" / "asas-editorial-site-supervision-source.png", "services", 4 / 3, (1280, 960), "Construction supervision"),
        ("corporate-team", SOURCE_ROOT / "corporate" / "asas-editorial-corporate-team-source.png", "corporate", 4 / 3, (1280, 960), "About and coordinated team"),
        ("buildings-sector", SOURCE_ROOT / "generated-editorial" / "asas-editorial-buildings-sector-source.png", "generated-editorial", 4 / 3, (1280, 960), "Generic towers and buildings sector headers"),
        ("education-sector", SOURCE_ROOT / "generated-editorial" / "asas-editorial-education-sector-source.png", "generated-editorial", 4 / 3, (1280, 960), "Generic education sector header"),
        ("villas-sector", SOURCE_ROOT / "generated-editorial" / "asas-editorial-villas-sector-source.png", "generated-editorial", 4 / 3, (1280, 960), "Generic villas sector header"),
        ("interiors-sector", SOURCE_ROOT / "generated-editorial" / "asas-editorial-interiors-sector-source.png", "generated-editorial", 4 / 3, (1280, 960), "Generic interiors sector header"),
        ("industrial-sector", SOURCE_ROOT / "generated-editorial" / "asas-editorial-industrial-sector-source.png", "generated-editorial", 4 / 3, (1280, 960), "Generic industrial sector header"),
    ]
    for asset_id, generated_path, output_group, ratio, size, website_use in generic_specs:
        image = Image.open(generated_path).convert("RGB")
        output = save_web(
            cover_crop(image, ratio, (0.50, 0.50)),
            WEB_ROOT / output_group / f"asas-editorial-{asset_id}",
            size,
        )
        generic_assets.append({
            "id": asset_id,
            "imageType": "GENERATED_EDITORIAL",
            "qualityTier": "B_EDITORIAL",
            "project": None,
            "websiteUse": website_use,
            "source": str(generated_path.relative_to(ROOT)),
            "output": output,
        })

    payload = {
        "sourceDocument": str(PDF),
        "policy": "Only B-tier real project assets are published. D/E sources remain private reference files. Generated editorial assets are never connected to the project database.",
        "counts": {
            "directStreamsVerified": len(inventory),
            "heroQualityRealProjects": 0,
            "projectCardQualityRealProjects": sum(item["qualityTier"] == "B_PROJECT_CARD" for item in inventory),
            "smallFeatureRealProjects": 0,
            "referenceOnly": sum(item["qualityTier"] == "D_REFERENCE_ONLY" for item in inventory),
            "needOriginalSource": sum(item["qualityTier"] == "E_NEED_ORIGINAL_SOURCE" for item in inventory),
            "missingSourceQueue": len(MISSING_SOURCE_QUEUE),
            "generatedEditorialAssets": len(generic_assets),
        },
        "genericAssets": generic_assets,
        "images": inventory,
        "removedSupersededOutputs": [
            "public/assets/asas/projects/",
            "public/assets/asas/generic/",
            "assets/image-masters/* except assets/image-masters/real-projects/",
        ],
        "enhancementQueue": [
            {
                **item,
                "sourceRequest": (
                    f"Please provide the original uncropped ASAS image for {item['asset']} "
                    f"at {item['desired']}; do not provide a generated substitute."
                ),
            }
            for item in MISSING_SOURCE_QUEUE
        ],
    }
    INVENTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    INVENTORY_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(payload["counts"], indent=2))


if __name__ == "__main__":
    main()
