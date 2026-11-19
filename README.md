# Mr Trichardt's Science Lab

A home for my 3D models, interactives and websites for science classes.
It's a plain website with no build step, so GitHub Pages can host it for free.

```
index.html          ← homepage (search, topic bubbles, resource cards)
view.html           ← shows one resource inside the site frame
resources.js        ← ★ THE CATALOGUE: the only file you edit to add things
assets/             ← styling and scripts (no need to touch)
resources/
  nephron/
    index.html      ← the nephron interactive
    thumb.svg       ← its card picture
```

---

## Put the site online (one-time setup)

1. Sign in at **github.com** (make a free account if you need one).
2. Click **+** (top right), then **New repository**.
   - Name: `science-lab`, or anything you like. This becomes part of the web address.
   - Choose **Public**, then **Create repository**.
3. On the new repository page, click **uploading an existing file**.
4. Open this folder in File Explorer, select **everything inside it**
   (`index.html`, `view.html`, `resources.js`, `assets`, `resources`, `README.md`)
   and drag it all into the browser window. Then click **Commit changes**.
5. Go to **Settings**, then **Pages**. Under *Branch*, pick **main** and **/ (root)**, then **Save**.
6. Wait about a minute and refresh. Your site's address appears at the top of that page, like:
   `https://YOUR-USERNAME.github.io/science-lab/`

> Tip: if you name the repository `YOUR-USERNAME.github.io`, the address becomes just
> `https://YOUR-USERNAME.github.io/`.

---

## Add a new resource

### 1. Add the files
Make a new folder inside `resources/` with a short name (lowercase, use dashes, no spaces):

| What you're adding              | Put it here                                  |
|---------------------------------|----------------------------------------------|
| An interactive / HTML page      | `resources/my-thing/index.html`              |
| A 3D model (`.glb` file)        | `resources/my-thing/model.glb`               |
| A card picture (optional)       | `resources/my-thing/thumb.png` (or .jpg/.svg)|
| A link to another website       | no files needed                              |

### 2. Add it to the catalogue
Open `resources.js`, copy one of the **templates** at the bottom, paste it at the
**top** of the `RESOURCES` list, and fill it in. For example:

```js
window.RESOURCES = [
  {
    id: "the-heart",
    title: "The Human Heart",
    subtitle: "3D model",
    description: "Rotate and zoom a 3D heart and find the four chambers.",
    category: "human-biology",
    type: "model",
    model: "resources/the-heart/model.glb",
    years: "Year 10",
    tags: ["heart", "circulatory system"],
    added: "2026-12-01",
    emoji: "🫀"
  },
  {
    id: "nephron",
    ...
```

Don't forget the **comma** between entries.

- `type`: `"interactive"`, `"model"` or `"website"`
- `category`: one of the category ids near the top of `resources.js`
  (`human-biology`, `biology`, `chemistry`, `physics`, `earth-space`, `skills`)
- `added`: today's date. Anything added in the last 30 days gets a **New** badge,
  and the newest item shows as **Latest addition** on the homepage.

### 3. Upload the changes
On GitHub, open the repository, click **Add file**, then **Upload files**. Drag in the
new `resources/my-thing` folder **and** the updated `resources.js`. Then click **Commit changes**.
The site updates within a minute or two.

---

## Add or change a topic category
In `resources.js`, edit `window.CATEGORIES`. Each one has an `id`, `name`,
`emoji` and bubble `color`. Empty categories show "Coming soon".

## Share a link with a class
- The whole site: `https://YOUR-USERNAME.github.io/science-lab/`
- One topic: add `#human-biology` (or any category id) to the end
- One resource: open it and press **Copy link**, e.g. `.../view.html?r=nephron`

## Notes
- Websites like PhET can't always be shown inside another site, so external
  links open in a new tab.
- 3D models use Google's free `<model-viewer>`, including AR on phones.
  Get `.glb` files from Sketchfab (check the licence), Blender or similar.
- An HTML interactive should be **one self-contained file**. If it has extra
  files (images, scripts), put them in the same folder next to its `index.html`.
