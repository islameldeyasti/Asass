# ASAS Image Workflow

## Absolute rule

One logical source image = one primary website role.

Responsive AVIF/WebP siblings of the same visual are allowed.

## Source of truth

- `data/image-manifest.js` — role / sector / service / project maps
- `data/global-image-manifest.json` — inventory + audit snapshot

## Role ownership

| Area | Exclusive roles |
| --- | --- |
| Homepage | `HOME_*`, `HOME_SECTOR_*`, `HOME_DISC_*`, `HOME_SLIDE_*` |
| About / Team / Careers / Contact / Downloads / Enquiry | matching `*_HERO` / featured roles |
| Company profile | `COMPANY_HERO`, `COMPANY_OVERVIEW` |
| Services detail | `SERVICE_*` (index uses tone panels) |
| Sectors detail | `SECTOR_*` (index uses tone panels) |
| Projects listing | `PROJECTS_HERO` (+ traffic ecosystem in hero plan) |
| Named projects | `projectImages` only when `APPROVED_FOR_CARDS` |

## Project photography

- Never invent a building and label it as a real ASAS project.
- Never reuse another project's photo.
- Never use generated editorial assets as project photos.
- If no verified original exists: `needsOriginalImage: true` + `ProjectVisualFallback`.

## Allowed exception

`traffic-access-studies` technical drawings may appear across that project's own ecosystem (card / portfolio / project detail / homepage traffic slide).

## CTAs

Prefer photo-free `.asas-cta-band` strips. Do not recycle section heroes into CTAs.
