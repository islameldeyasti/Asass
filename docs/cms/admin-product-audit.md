# Admin product audit

Date: 2026-09-13

## Summary

Admin IA was reorganized into Dashboard / Content / CRM / Media / SEO / Corporate / Site / Settings / System.
Branding Center, Footer manager, Homepage hero/sector media editors, project gallery MediaPicker, and Media Library usage/safe-delete/replace/focal-point were added.

## Route notes

| ADMIN ROUTE | PURPOSE | UX BEFORE | ISSUES | IMPROVEMENTS | MEDIA UX | SEARCH | FILTER | EMPTY | LOADING | ERROR | RESPONSIVE | STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /admin/dashboard | Executive overview | Basic | Limited health signals | Reports + command palette exist | n/a | Yes (global) | Partial | Yes | Partial | Toast/error | Good | IMPROVED |
| /admin/homepage | Homepage CMS | Sections/about/FAQ only | Hero/sector images not editable | Hero slides + sector cards + MediaPicker + focal | Pass | n/a | n/a | Pass | Pass | Pass | Good | UPGRADED |
| /admin/projects | Projects | Single image | No gallery | GalleryMediaEditor | Pass | List search | Status | Pass | Pass | Pass | Good | UPGRADED |
| /admin/services | Services | Text-heavy | Image missing historically | MediaPicker image field | Pass | Yes | Yes | Pass | Pass | Pass | Good | UPGRADED |
| /admin/sectors | Sectors | Text-heavy | Image missing historically | MediaPicker image field | Pass | Yes | Yes | Pass | Pass | Pass | Good | UPGRADED |
| /admin/media | Media library | Upload/search/meta | No usage/safe delete/multi/focal | Usage index, multi upload, replace, focal, filters | Pass | Yes | Usage/sort | Pass | Pass | Conflict UI | Good | UPGRADED |
| /admin/settings/branding | Brand assets | Missing | Logos hardcoded | Full MediaPicker branding center | Pass | n/a | n/a | Pass | Pass | Toast | Good | NEW |
| /admin/settings/contact | Contact | Split/legacy | Duplication risk | Dedicated settings page | n/a | n/a | n/a | Pass | Pass | Pass | Good | NEW |
| /admin/settings/social | Social | Split/legacy | Duplication risk | Dedicated settings page | n/a | n/a | n/a | Pass | Pass | Pass | Good | NEW |
| /admin/footer | Footer links/CTA | Missing | Hardcoded links | Footer manager | Logo via Branding | n/a | n/a | Pass | Pass | Pass | Good | NEW |
| /admin/navigation | Nav | Flat table | Weak nesting UX | Existing editor retained | n/a | n/a | Hidden | Pass | Pass | Pass | Good | PARTIAL |
| /admin/seo | SEO center | Strong | Fix workflow exists | Kept + reports link | OG MediaPicker | Yes | Tabs | Pass | Pass | Pass | Good | PASS |
| /admin/reports | Health hub | Missing | No hub | Live content/media/CRM counts | Links to media | n/a | n/a | Pass | Pass | Pass | Good | NEW |
| /admin/crm/* | CRM | Functional | Form-ish | Kept; reports surface counts | Attachments via media where present | Yes | Status | Pass | Pass | Pass | Usable | PASS |
| /admin/corporate/* | Letterhead/cards | Studio quality | Branding logos now wired | Branding fallbacks | MediaPicker | Yes | Yes | Pass | Pass | Pass | Good | PASS |

## Remaining gaps (honest)

- Navigation nesting editor still table-oriented (children exist in seed but limited UI).
- Page role heroes still can fall back to `image-manifest` when CMS image empty (by design as fallback, not primary control).
- Full XLSX export / version history restore UI not fully productized everywhere.
- Command palette + shell exist; not every module uses identical PageHeader/EmptyState yet.
