# Agni Advisors — agniadvisors.com

Single-page static placeholder site for Agni Advisors. Plain HTML + CSS, no
framework, no build step. The only JavaScript is `email.js`, which assembles
the contact address.

## Structure

```
.
├── README.md
├── wrangler.jsonc           ← Worker name + static-asset settings
└── public/                  ← the static assets directory
    ├── index.html           ← the site (markup + inline <style>)
    ├── 404.html             ← served on unmatched paths
    ├── _headers             ← security headers + CSP
    ├── email.js             ← builds mailto links from data attributes
    ├── robots.txt
    ├── sitemap.xml
    ├── favicon.svg
    ├── apple-touch-icon.png ← 180×180, inset ~14% for iOS's rounded mask
    └── og-image.png         ← 1200×630 social card
```

Everything served lives in `public/`. To preview locally:

```sh
python3 -m http.server 8080 --directory public
```

`_headers` is a Cloudflare feature and is ignored by a local server, so test
the CSP against a real deploy.

## Design

| Token | Value | Use |
| --- | --- | --- |
| Burnt orange | `#E35B1E` | header band, section rules — not for text |
| Link orange | `#C24A12` | link text (WCAG AA on off-white) |
| Dark grey | `#2B2B2B` | all text |
| Off-white | `#FAF8F5` | body background |

- `404.html` has its own copy of the styles. **If you change a brand color,
  change it in both files.**
- Dark grey on the orange band only passes AA for large text, so keep the
  tagline at 24px or larger.
- Fonts are system stacks only; the page makes no external requests.

## CSP

`public/_headers` sets the security headers. Constraints on the CSP:

- `style-src 'unsafe-inline'` is required by the inline `<style>` blocks.
- `script-src 'self'` allows `/email.js`. Don't add inline scripts.
- Enabling Rocket Loader or Cloudflare Web Analytics injects third-party
  scripts that the CSP will block.

## Contact email

The address never appears in the HTML, because Cloudflare's Email Address
Obfuscation doesn't apply to Worker-served assets. Contact links look like:

```html
<a data-u="analysts" data-d="agniadvisors.com" data-q="?subject=..."></a>
<noscript>analysts [at] agniadvisors [dot] com</noscript>
```

`email.js` sets the `mailto:` href (appending `data-q` if present) and fills
in the address as link text if the link is empty.

## Deploy

This is a **Worker with static assets**, not a Cloudflare Pages project.
Pushing to `main` deploys via Workers Builds. To deploy by hand:

```sh
npx wrangler deploy        # not `wrangler pages deploy`
```

In `wrangler.jsonc`:

- `name` must stay `agni`, or a deploy creates a second Worker.
- `"not_found_handling": "404-page"` is what makes `404.html` serve on
  unmatched paths.
