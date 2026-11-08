# widget

Static prototypes, deployed on Vercel. The root `index.html` is a home page that links to each exploration.

## Access

- The home page (`/`) shows a password screen. Enter the shared team password once and the browser stays signed in for 30 days.
- Exploration pages (`/<slug>/`) are public, so you can share their links directly.

The check is in `middleware.js` (Vercel Routing Middleware) and only runs on Vercel, not on a local static server. The password is the `SITE_PASSWORD` environment variable in the Vercel project (Settings → Environment Variables). Change it there and redeploy; that also signs everyone out. Until it's set, the home page stays locked.

## Adding an exploration

1. Create a folder `<slug>/` at the repo root with its own `index.html` (plus any CSS, JS and `assets/` it needs; use relative paths). Don't use `assets` or `scripts` as a slug.
2. Add an entry to the `EXPLORATIONS` list in the root `index.html`: title, description, `started` / `updated` dates, and optionally `preview`.

It will be live at `/<slug>/`.

## Images and caching

- Use WebP for photos and raster icons, sized at no more than 3× their display size. A full-screen PNG can be several MB; the same image as WebP is usually under 100 KB.
- Files in any `assets/` folder are cached by browsers for an hour (set in `vercel.json`). If you replace an image and need everyone to see it right away, give it a new filename.

## Preview images

The home page card shows `<slug>/preview.png`. To take or refresh it (needs Node 22+ and Google Chrome):

```bash
node scripts/preview.mjs <slug>
```

It captures the `.widget-frame` element by default. Pass a different CSS selector as a second argument to capture something else, e.g. `node scripts/preview.mjs <slug> ".phone"`.
