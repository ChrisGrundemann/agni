# Agni Advisors — agniadvisors.com

Single-page static placeholder site for Agni Advisors. Plain HTML + CSS, no
framework, no build step. The only JavaScript is `email.js`, which assembles
the contact address (see "Email obfuscation").

## Structure

```
.
├── README.md
├── wrangler.jsonc           ← Worker name + static-asset settings
└── public/                  ← the static assets directory
    ├── index.html           ← the site (markup + inline <style>)
    ├── 404.html             ← served on unmatched paths (see not_found_handling)
    ├── _headers             ← security headers + CSP
    ├── email.js             ← builds mailto links from data attributes
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

(`_headers` is a Cloudflare feature and is ignored by a local server, so test
the CSP against a real deploy.)

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
- `script-src 'self'` — allows `/email.js` and nothing else. There are no
  inline scripts; keep it that way rather than adding `'unsafe-inline'`.
- Turning on Rocket Loader or Cloudflare Web Analytics would inject scripts
  from `ajax.cloudflare.com` / `static.cloudflareinsights.com` and require
  widening `script-src` (and adding `connect-src`).

## Deploy

This site is deployed as a **Worker with static assets**, not as a Cloudflare
Pages project. The two are configured differently — Pages infers behavior from
the files present, Workers requires `wrangler.jsonc`.

### From Git

The Worker is connected to this repo via Workers Builds; pushing to `main`
builds and deploys. There is no build command — `wrangler.jsonc` points at
`public/` and the assets are uploaded as-is.

`name` in `wrangler.jsonc` must match the existing Worker (`agni`). A
mismatched name creates a second Worker instead of updating this one.

### Direct deploy

```sh
npx wrangler deploy
```

(Not `wrangler pages deploy` — that targets a Pages project, which this is not.)

### not_found_handling

```jsonc
"not_found_handling": "404-page"
```

This is required for `public/404.html` to be served on unmatched paths. The
default is `"none"`, which returns a bodiless 404 and leaves the 404 page
reachable only at its own URL. Verify after deploy:

```sh
curl -sI https://agniadvisors.com/nope | head -1   # expect: HTTP/2 404
curl -s  https://agniadvisors.com/nope | head -1   # expect: <!DOCTYPE html>
```

### Custom domain

Worker → **Settings** → **Domains & Routes** → add `agniadvisors.com`. If the
zone is already on Cloudflare the records are created for you. Add a redirect
rule if you want `www` to fold into the apex.

### Email obfuscation

Scrape Shield's Email Address Obfuscation does not rewrite content served by
a Worker, so the site does its own. The address never appears in the HTML;
each contact link is a placeholder:

```html
<a data-u="analysts" data-d="agniadvisors.com" data-q="?subject=..."></a>
<noscript>analysts [at] agniadvisors [dot] com</noscript>
```

`public/email.js` (loaded with `defer`) joins `data-u` and `data-d`, sets the
`mailto:` href (appending `data-q` if present), and fills in the address as
link text when the link is empty. Links with their own text keep it. Confirm
after deploy:

```sh
curl -s https://agniadvisors.com/ | grep -c "analysts@agniadvisors.com"   # expect: 0
```
