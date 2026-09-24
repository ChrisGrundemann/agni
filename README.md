# Agni Advisors — agniadvisors.com

Single-page static placeholder site for Agni Advisors. Plain HTML + CSS, no
framework, no build step, no JavaScript of our own.

## Structure

```
.
├── README.md
└── public/                  ← Cloudflare Pages output directory
    ├── index.html           ← the site (markup + inline <style>)
    ├── 404.html             ← not-found page, picked up by Pages automatically
    ├── _headers             ← Cloudflare Pages security headers + CSP
    ├── robots.txt           ← allow all, points at the sitemap
    ├── sitemap.xml          ← single URL
    ├── favicon.svg          ← "A" in dark grey on burnt orange
    ├── apple-touch-icon.png ← 180×180
    └── og-image.png         ← 1200×630 social card
```

Everything served lives in `public/`. There is nothing to compile — open
`public/index.html` in a browser, or run any static server:

```sh
python3 -m http.server 8080 --directory public
```

(`_headers` is a Cloudflare Pages feature and is ignored by a local server, so
test CSP against a real Pages deploy or a preview URL.)

## Design notes

| Token | Value | Use |
| --- | --- | --- |
| Burnt orange | `#E35B1E` | header band, section rules |
| Link orange | `#C24A12` | link text — 4.6:1 on the off-white, WCAG AA |
| Dark grey | `#2B2B2B` | all text |
| Off-white | `#FAF8F5` | body background |

Contrast: body grey on off-white is 13.4:1. The brand orange itself is only
3.4:1 on off-white, so links use the darkened `#C24A12` instead — the bright
orange is reserved for the band and the rules, where it carries no text.
Dark grey on the orange band is 3.9:1, which meets AA for **large** text, so
the tagline is clamped to a 24px minimum to stay in that category.

Fonts are system stacks only (serif for headings, sans for body) — no Google
Font, so the page makes zero external requests and the CSP can stay strict. If
you later add a Google Font, add `https://fonts.googleapis.com` to `style-src`
and `https://fonts.gstatic.com` to `font-src` in `public/_headers`.

`favicon.svg` is full-bleed for legibility at 16px; `apple-touch-icon.png` is
inset ~14% so iOS's rounded mask can't clip the letterform.

Because there is no build step, `404.html` carries its own trimmed copy of the
same custom properties rather than sharing a stylesheet — **if you change a
brand color, change it in both files.** Two pages is under the threshold where
a shared `style.css` would earn the extra request; a third page would not be.

## Security headers

`public/_headers` sets `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`,
`Cross-Origin-Opener-Policy` and this CSP:

```
default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';
object-src 'none'; upgrade-insecure-requests
```

- `style-src 'unsafe-inline'` is required by the inline `<style>` block.
- `script-src 'self'` exists only so Cloudflare's **Email Address
  Obfuscation** can load its same-origin `/cdn-cgi/` decode script. The page
  ships no JavaScript of its own. Mailto links are written normally in the
  HTML; Cloudflare rewrites them at the edge.
- Turning on Rocket Loader or Cloudflare Web Analytics would inject scripts
  from `ajax.cloudflare.com` / `static.cloudflareinsights.com` and require
  widening `script-src` (and adding `connect-src`).

## Deploy

### Cloudflare Pages, from Git

Workers & Pages → Create → Pages → Connect to Git, pick this repo, then:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `public` |
| Root directory | `/` |

Every push to `main` publishes; other branches get preview URLs.

### Direct deploy with Wrangler

```sh
npx wrangler pages deploy public --project-name=agni-advisors --branch=main
```

### Custom domain

Pages project → **Custom domains** → **Set up a domain** → `agniadvisors.com`,
then repeat for `www.agniadvisors.com`. If the zone is already on Cloudflare
the records are created automatically; otherwise follow the CNAME instructions
shown. Add a redirect rule if you want `www` to fold into the apex.

### Email Address Obfuscation

The Cloudflare dashboard setting only applies to traffic on the proxied custom
domain (not `*.pages.dev`). Select the `agniadvisors.com` zone → **Scrape
Shield** → toggle **Email Address Obfuscation** on. Verify with:

```sh
curl -s https://agniadvisors.com/ | grep -c '__cf_email__'
```

A non-zero count means the addresses are being rewritten at the edge.
