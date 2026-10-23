# JD Junk Removal

Marketing site for JD Junk Removal — reliable, local junk removal for homes and
businesses across San Diego County.

## Stack
Vanilla HTML / CSS / JS. No build step — `index.html` is the entry point.

## Files
- `index.html` — single-page site (hero, services, process, service area, quote form, contact)
- `404.html` — not-found page
- `styles.css` — all styling (CSS custom properties, responsive)
- `script.js` — mobile nav, scroll reveals, quote form submission
- `favicon.svg` — favicon
- `images/source/` — photography

## Local preview
```
python3 -m http.server 8000
```
Then open http://localhost:8000

## Forms
The quote form posts to the LeadrVision endpoint. It works without JavaScript
(plain POST returns to the page with `?submitted=1`) and is progressively
enhanced with a `fetch()` JSON submission that shows an inline confirmation.

## Contact
(760) 710-9309 · jdjunkremoval365@gmail.com
