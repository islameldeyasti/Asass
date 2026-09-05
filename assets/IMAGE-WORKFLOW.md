# ASAS image quality workflow

The official Company Profile is authoritative for identity and project matching, but its embedded image streams are not automatically production quality.

## Direct extraction

Run:

```shell
python3 scripts/process-profile-images.py
```

The script uses `PyMuPDF.Document.extract_image(xref)` to copy each embedded stream directly. It does not render or screenshot PDF pages. The stored sources were hash-compared with a second direct extraction: all 20 are byte-for-byte matches.

## Quality gate

- `A_HERO_QUALITY`: original usable width around 1600px or more, with strong visual detail.
- `B_PROJECT_CARD`: approximately 900–1600px usable width. Cards and controlled editorial layouts only.
- `C_SMALL_FEATURE`: approximately 600–900px usable width. Small supporting use only.
- `D_REFERENCE_ONLY`: below approximately 600px or visibly weak. Never published as large photography.
- `E_NEED_ORIGINAL_SOURCE`: too weak for production. Request the original ASAS file.

The profile currently contains no A- or C-tier real project images. The traffic/access technical drawing is the only B-tier real project asset. All other embedded project imagery is D or E and has no active public mapping.

## Real project policy

- Never generate or replace project architecture.
- Never invent façades, floors, windows, roads, interiors, materials, people, vehicles or landscaping.
- No repeated sharpen/upscale cycles.
- Do not create nominally large exports from weak sources.
- Preserve D/E streams under `assets/image-source/` for reference and future matching only.
- Publish a project image only after `data/image-manifest.js` explicitly approves it.

## Directory separation

- `assets/image-source/` — byte-exact PDF streams and original generated-editorial sources.
- `assets/image-masters/real-projects/` — native-resolution approved real-project masters only.
- `public/assets/asas/real-projects/` — approved real project WebP/AVIF outputs.
- `public/assets/asas/generated-editorial/` — generic architecture and sector atmosphere.
- `public/assets/asas/services/` — generic service/process visuals.
- `public/assets/asas/corporate/` — generic corporate/team visuals.
- `assets/image-inventory.json` — extraction evidence, source dimensions, tier and active status.
- `data/image-manifest.js` — the only active application mapping.

Generated editorial imagery must always have `project: null`, decorative alternative text where appropriate, and must never enter `projectImages`.

## Output rules

- Never enlarge a real-project output beyond its usable source crop.
- Keep the original stream as the lossless source.
- Generate WebP and AVIF only at or below native usable dimensions.
- The approved technical drawing currently exports at 936×624 portfolio, 800×600 card and 600×450 mobile sizes.
- Generated editorial sources are 1536×1024; 4:3 outputs are downsampled to 1280×960 and the hero is cropped without enlargement to 1536×864.

## Missing originals

Request uncropped original photographs/renders from ASAS for every D/E project and every empty profile slot. Do not provide generated substitutes. Once supplied:

1. Verify project name, category and location.
2. Add source dimensions and a visual assessment to the inventory.
3. Assign the quality tier from the real source, not an upscale dimension.
4. Add an active mapping only if the asset reaches the required tier.
5. Check crops at desktop, tablet and mobile sizes before publication.
