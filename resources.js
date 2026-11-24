/* =====================================================================
   MR TRICHARDT'S SCIENCE LAB — RESOURCE CATALOGUE
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to add something new.

   To add a resource:
     1. Put its files in a new folder:  resources/<short-name>/
        (an interactive or website  -> resources/<short-name>/index.html
         a 3D model (.glb file)     -> resources/<short-name>/model.glb)
     2. Copy one of the entries in RESOURCES below, paste it at the TOP
        of the list, and change the details.
     3. Upload to GitHub. Done!

   See README.md for the full step-by-step guide.
   ===================================================================== */

window.SITE = {
  title: "Mr Trichardt's Science Lab",
  shortTitle: "Mr Trichardt's Science",
  tagline: "3D models, interactives and websites to help you explore science, built for my classes and free for anyone to use."
};

/* ---------------------------------------------------------------------
   CATEGORIES
   Add, rename or reorder these whenever you like.
   - id:    short lowercase name, no spaces (used in links, e.g. #biology)
   - emoji: the icon shown in the category bubble
   - color: the bubble colour
   --------------------------------------------------------------------- */
window.CATEGORIES = [
  { id: "human-biology", name: "Human Biology", emoji: "🫀", color: "#f472b6",
    blurb: "Body systems, cells and how we keep everything in balance." },
  { id: "biology",       name: "Biology",       emoji: "🧬", color: "#34d399",
    blurb: "Living things, ecosystems, genetics and evolution." },
  { id: "chemistry",     name: "Chemistry",     emoji: "⚗️", color: "#a78bfa",
    blurb: "Atoms, reactions and the stuff everything is made of." },
  { id: "physics",       name: "Physics",       emoji: "⚡", color: "#fbbf24",
    blurb: "Forces, energy, waves, electricity and motion." },
  { id: "earth-space",   name: "Earth & Space", emoji: "🪐", color: "#60a5fa",
    blurb: "Our planet, the solar system and the universe beyond." },
  { id: "skills",        name: "Science Skills", emoji: "🔬", color: "#22d3ee",
    blurb: "Investigations, data, graphing and working like a scientist." }
];

/* ---------------------------------------------------------------------
   RESOURCES  (newest first)
   - id:          short lowercase name, no spaces. Must be unique.
   - title / subtitle / description: what students see on the card
   - category:    one of the category ids above
   - type:        "interactive" | "model" | "website"
   - path:        file inside this site (for interactives, websites)
   - model:       a .glb file inside this site (for type "model")
   - url:         a link to another website (opens in a new tab)
   - years:       optional, e.g. "Year 9" or "Year 11–12"
   - tags:        words students might search for
   - added:       date added (YYYY-MM-DD). Shows a "New" badge for 30 days.
   - thumb:       optional picture for the card (otherwise the emoji is used)
   - emoji:       optional icon for the card
   --------------------------------------------------------------------- */
window.RESOURCES = [
  {
    id: "signal-race",
    title: "Signal Race",
    subtitle: "Nerves vs hormones",
    description: "Label a neuron, build a reflex arc, test your reaction time, unlock hormone target cells, then race a nerve impulse against adrenaline. Four missions with check-in questions.",
    category: "biology",
    type: "interactive",
    path: "resources/signal-race/index.html",
    years: "Year 9",
    tags: ["nervous system", "neuron", "reflex arc", "hormones", "endocrine", "adrenaline", "insulin", "stimulus", "response", "EQ2"],
    added: "2026-11-24",
    thumb: "resources/signal-race/thumb.svg",
    emoji: "⚡"
  },
  {
    id: "field-trip",
    title: "Ecosystem Field Trip",
    subtitle: "Monitoring ecosystems",
    description: "Spot human impacts, throw quadrats to estimate a population, walk a transect from creek to ridge, and test creek health with water bugs. Four missions with check-in questions.",
    category: "biology",
    type: "interactive",
    path: "resources/field-trip/index.html",
    years: "Year 9",
    tags: ["ecosystem", "monitoring", "quadrat", "transect", "sampling", "population", "indicator species", "human impact", "EQ6"],
    added: "2026-11-24",
    thumb: "resources/field-trip/thumb.svg",
    emoji: "🔍"
  },
  {
    id: "carbon-quest",
    title: "Carbon Quest",
    subtitle: "Open-world adventure game",
    description: "Become a carbon atom and explore an island of forests, farms, reefs and towns. Follow the carbon cycle all the way around, chat to characters, collect fact bubbles, and answer questions to unlock each new area.",
    category: "biology",
    type: "interactive",
    path: "resources/carbon-quest/index.html",
    years: "Year 9–10",
    tags: ["carbon cycle", "photosynthesis", "respiration", "decomposition", "combustion", "fossil fuels", "ocean", "climate change", "game"],
    added: "2026-11-20",
    thumb: "resources/carbon-quest/thumb.svg",
    emoji: "🌍"
  },
  {
    id: "nephron",
    title: "The Nephron",
    subtitle: "Interactive 3D model",
    description: "Spin, zoom and explore the kidney's filtering unit. Follow filtration, reabsorption and secretion along the tubule, then test yourself with the built-in quiz.",
    category: "human-biology",
    type: "interactive",
    path: "resources/nephron/index.html",
    years: "Year 11",
    tags: ["kidney", "excretion", "excretory system", "filtration", "reabsorption", "secretion", "loop of Henle", "glomerulus", "urine", "3D"],
    added: "2026-11-19",
    thumb: "resources/nephron/thumb.svg",
    emoji: "🫘"
  }

  /* ---- TEMPLATES: copy one of these, paste it above, and fill it in ----

  ,{
    id: "my-interactive",
    title: "Title here",
    subtitle: "Interactive",
    description: "One or two sentences about what students can do with it.",
    category: "chemistry",
    type: "interactive",
    path: "resources/my-interactive/index.html",
    years: "Year 9",
    tags: ["atoms", "periodic table"],
    added: "2026-12-01",
    emoji: "⚛️"
  }

  ,{
    id: "heart-model",
    title: "The Human Heart",
    subtitle: "3D model",
    description: "Rotate and zoom a 3D heart. Works with AR on phones.",
    category: "human-biology",
    type: "model",
    model: "resources/heart-model/model.glb",
    years: "Year 10",
    tags: ["heart", "circulatory system"],
    added: "2026-12-01",
    emoji: "🫀"
  }

  ,{
    id: "phet-circuits",
    title: "Circuit Construction Kit",
    subtitle: "External website",
    description: "Build circuits with batteries, bulbs and switches.",
    category: "physics",
    type: "website",
    url: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc",
    years: "Year 9",
    tags: ["electricity", "circuits"],
    added: "2026-12-01",
    emoji: "💡"
  }

  ---------------------------------------------------------------------- */
];
