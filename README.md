# widget

Static prototypes, deployed on Vercel. The root `index.html` is a home page that links to each exploration.

## Adding an exploration

1. Create a folder `explorations/<slug>/` with its own `index.html` (plus any CSS, JS and `assets/` it needs; use relative paths).
2. Add an entry to the `EXPLORATIONS` list in the root `index.html`.

It will be live at `/explorations/<slug>/`.
