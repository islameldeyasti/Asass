# Reporting system

## Hub

`/admin/reports` — live counts from CMS collections (not invented metrics).

## Dashboard / Reports KPIs

- Content: drafts, missing service/sector/project images, missing client logos, missing team photos
- SEO: deep-link into SEO Control Center for missing titles/descriptions/OG/alts
- Media: library size, images missing EN alt
- CRM: enquiry totals / new-open
- Careers: application totals

## Content reports

Open related modules from the reports hub (Projects, Services, Sectors, Team, Blog).

## SEO reports

`/admin/seo` remains the actionable SEO system (overview, pages, redirects, sitemap, robots) with Fix flows.

## Media reports

Media Library filters:

- Used / Unused
- Missing alt (via metadata + reports count)
- Usage drawer lists referencing modules

Safe delete blocks in-use assets unless force confirmed.

## CRM / Careers reports

Counts from `listEnquiries` / `listApplications`. Pipeline detail remains in CRM modules.

## Exports

CSV export can be added per module where tables already exist; hub currently prioritizes actionable navigation over file dumps.

## Permissions

Reports hub gated by `DASHBOARD` permission. Module deep-links still enforce their own read permissions.
