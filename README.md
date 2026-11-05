# widget

Static prototypes, deployed on Vercel. The root `index.html` is a home page that links to each exploration.

## Adding an exploration

1. Create a folder `explorations/<slug>/` with its own `index.html` (plus any CSS, JS and `assets/` it needs; use relative paths).
2. Add an entry to the `EXPLORATIONS` list in the root `index.html`: title, description, `started` / `updated` dates, and optionally `preview`.

It will be live at `/explorations/<slug>/`.

## Preview images

The home page card shows `explorations/<slug>/preview.png`. To take or refresh it (needs Node 22+ and Google Chrome):

```bash
node scripts/preview.mjs <slug>
```

It captures the `.widget-frame` element by default. Pass a different CSS selector as a second argument to capture something else, e.g. `node scripts/preview.mjs <slug> ".phone"`.
