# Branding control map

Central source of truth: **Settings → Branding** (`/admin/settings/branding`).

Stored in CMS `settings.json` → `branding`.

| Surface | Admin control |
| --- | --- |
| Primary logo | Settings → Branding → Primary logo |
| Light logo | Settings → Branding → Light logo |
| Dark / reverse logo | Settings → Branding → Dark logo |
| Header logo (light mode) | Settings → Branding → Header logo (light) |
| Header logo (dark mode) | Settings → Branding → Header logo (dark) |
| Footer logo | Settings → Branding → Footer logo |
| Mobile logo (optional) | Settings → Branding → Mobile logo |
| Favicon | Settings → Branding → Favicon |
| Apple touch icon | Settings → Branding → Apple touch icon |
| Default OG / social image | Settings → Branding → Default social / OG image |
| Print / letterhead mark | Settings → Branding → Print logo |
| Letterhead lockup | Settings → Branding → Letterhead lockup |
| Email / document logo | Settings → Branding → Email / document logo |

## Consumers

- Site header (`Header` → `ThemeLogo`) uses `headerLogoLight` / `headerLogoDark`
- Site footer uses `footerLogo`
- Root metadata icons use `favicon` / `appleTouchIcon`
- Organization JSON-LD logo prefers branding primary/light logo
- Digital employee cards use branding light/dark logos
- SEO default OG can also be set in SEO Control Center; branding provides the brand fallback

## Protected brand colors

- ASAS Navy: `#070463`
- ASAS Rust: `#A02315`

Shown in Branding for reference; not exposed as free-form theme editors for normal clients.
