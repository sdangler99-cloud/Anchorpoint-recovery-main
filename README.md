# Anchorpoint

**For When You Need To Climb Out**

A free, installable daily companion for recovery: morning gratitude journaling, a sobriety tracker with milestone badges, a guided "urge surfing" craving timer, a nightly reflection journal with a new prompt every day of the year, and a directory of local/national support resources.

It's a static, single-page app — vanilla HTML/CSS/JS, no framework, no build step, no dependencies. All user data (gratitude entries, journal entries, sobriety dates, craving logs, theme choice) is stored in the browser's `localStorage`; nothing is sent to a server. Since it's all local, the Settings tab can export it to a JSON backup file and import it back (e.g. onto a new device).

## Project layout

```
index.html         Page shell — head/meta tags and the #root mount point
styles.css          Global styles
data.js             Static content: color themes, the 366 journal prompts, quotes, and the resource directory
app.js              App logic: localStorage helpers, state, and all tab rendering
manifest.json        PWA manifest (name, icons, theme colors)
service-worker.js    Offline caching / installability
icon-*.png, apple-touch-icon*.png   App icons
```

`data.js` is loaded before `app.js` since `app.js` reads the constants it defines (`THEMES`, `TOPIC_DECK`, `QUOTES`, `RESOURCE_CATEGORIES`).

## Running it locally

No build step — just serve the folder over HTTP (opening `index.html` directly via `file://` will break the service worker and manifest). For example:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

Any other static file server (`npx serve`, `php -S localhost:8080`, etc.) works the same way.

## Deploying

This is a static site, so it can be deployed anywhere that serves static files (GitHub Pages, Netlify, Vercel, S3, etc.) — just publish the repo root as-is, with no build command.

**GitHub Pages** (simplest, since the site already lives at the repo root):
1. Push to `main`.
2. In the repo's **Settings → Pages**, set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site will be published at `https://<owner>.github.io/<repo>/`.

### After changing `index.html`, `styles.css`, `data.js`, or `app.js`

The service worker precaches those files for offline use. Bump `CACHE_VERSION` in `service-worker.js` on every deploy that changes any cached file — otherwise returning visitors may keep seeing a stale cached copy until the old cache is evicted.

## AdSense

`index.html` loads an AdSense script keyed off `ADSENSE_CLIENT_ID` (also set in `app.js` for the ad slot itself — the two are kept in sync manually). Leaving the placeholder or a real client ID in place is safe either way; the loader only fetches the AdSense script when a real (non-`XXXX`) client ID is set.
