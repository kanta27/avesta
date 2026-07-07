// One-shot Phase-B helper: remove legacy blocks from app/globals.css that are
// superseded by styles/home.css (the verbatim reference CSS), and scope the
// survivors that share class names with the reference so inner pages keep
// their current look. Run once, review with git diff, then delete or keep.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "app/globals.css";
const src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

// ---- parse into top-level chunks: {selector, startLine, endLine} ----
const chunks = [];
let depth = 0;
let start = null;
let selector = "";
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  if (depth === 0 && opens > 0) {
    // selector may span preceding lines (multi-selector) — walk back
    let s = i;
    while (s > 0 && /,\s*$/.test(lines[s - 1])) s--;
    start = s;
    selector = lines
      .slice(s, i + 1)
      .join(" ")
      .replace(/\{.*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  depth += opens - closes;
  if (depth === 0 && start !== null && (opens > 0 || closes > 0)) {
    chunks.push({ selector, start, end: i });
    start = null;
  }
}

const KILL = new Set(
  [
    // base duplicated verbatim in home.css
    "html",
    "body",
    "::selection",
    "img",
    "h1, h2, h3",
    "h2",
    "h3",
    ".lead",
    ".wrap",
    "body::before",
    "main, header, footer",
    // announcement + old nav (reference header replaces the shell)
    ".announce",
    "nav",
    "nav.scrolled",
    ".nav-in",
    ".logo",
    ".logo .dot",
    ".nav-links",
    ".nav-links a",
    ".nav-links a:hover",
    ".nav-links a::after",
    ".nav-links a:hover::after",
    ".nav-cta",
    ".nav-cta .btn",
    // btn base + textlink + eyebrow (verbatim in home.css; variant classes stay)
    ".btn",
    ".btn:hover",
    ".btn .arr",
    ".btn:hover .arr",
    ".textlink",
    ".textlink:hover",
    ".eyebrow",
    ".eyebrow::before",
    ".eyebrow.center",
    ".eyebrow.center::before",
    ".eyebrow b",
    // old hero + visuals
    ".hero",
    ".hero-grid",
    ".hero h1",
    ".hero h1 em",
    ".hero p.lead",
    ".hero-ctas",
    ".stats",
    ".stat .num",
    ".stat .lab",
    ".hero-visual",
    ".product-card-hero",
    ".product-card-hero .ph",
    ".pc1",
    ".pc1 .ph",
    ".pc2",
    ".pc2 .ph",
    "@keyframes float",
    ".pch-name",
    ".pch-meta",
    ".badge-float",
    ".bf1",
    ".bf1 b",
    ".helix",
    // trust strip / old marquee
    ".trust",
    ".marquee",
    ".marquee span",
    ".marquee i",
    "@keyframes scroll",
    // concerns
    ".concern-grid",
    ".concern",
    ".concern:hover",
    ".concern .ic",
    ".concern h3",
    ".concern p",
    // old science section
    ".sci-grid",
    ".sci-grid p",
    ".checks",
    ".checks li",
    ".checks .ck",
    ".pipeline",
    ".pipeline::after",
    ".pipeline h3",
    ".step",
    ".step:last-child",
    ".step::before",
    ".step:last-child::before",
    ".step .n",
    ".step h4",
    ".step p",
    // old testimonials
    "#reviews",
    ".rev-grid",
    ".rev",
    ".rev .q",
    ".rev .who",
    ".rev .av",
    ".rev .who b",
    ".rev .who span",
    ".src",
    "a.rev",
    // old research cards
    ".res-grid",
    ".res",
    ".res:hover",
    ".res:hover .res-k, .res:hover p",
    ".res:hover .res-k",
    ".res:hover .arrow",
    ".res-k",
    ".res h3",
    ".res p",
    ".arrow",
    // old quiz band
    ".quiz",
    ".quiz::before",
    ".quiz::after",
    ".quiz > *",
    "@keyframes spin",
    ".quiz h2",
    ".quiz p",
    // old homepage blog teasers
    ".post",
    ".post:hover",
    ".post .thumb",
    ".post .body",
    ".post .meta",
    ".post h3",
    // old footer (reference foot-* replaces it; .f-news-* stays for newsletter)
    "footer",
    ".f-grid",
    ".f-grid h4",
    ".f-grid a",
    ".f-grid a:hover",
    ".f-logo",
    ".f-grid p",
    ".f-bottom",
    ".f-cert",
    ".f-cert span",
    // old lead popup + old .field (reference .field/.form replaces)
    ".overlay",
    ".overlay.show",
    "@keyframes fade",
    ".popup",
    "@keyframes pop",
    ".pop-left",
    ".pop-left::after",
    ".pop-left .off",
    ".pop-left h3",
    ".pop-left p",
    ".pop-right",
    ".pop-close",
    ".field",
    ".field input",
    ".field input:focus",
    ".pop-note",
    // old whatsapp fab
    ".wa",
    ".wa:hover",
    // reveal (verbatim in home.css)
    ".reveal",
    ".reveal.in",
    // nav cart button (reference version in home.css)
    ".cart-btn",
    ".cart-btn:hover",
    ".cart-count",
    // old slide-over drawer (reference .drawer replaces it)
    ".cart-overlay",
    ".cart-overlay.show",
    ".cart-drawer",
    ".cart-overlay.show .cart-drawer",
    ".cart-drawer-head",
    ".cart-drawer-title",
    ".cart-drawer-count",
    ".cart-drawer-close",
    ".cart-drawer-close:hover",
    ".cart-body-drawer",
    ".cart-body-drawer .cart-lines",
    ".cart-body-drawer .cart-summary",
  ].map((s) => s.replace(/\s+/g, " ")),
);

// legacy blocks that keep their look on inner pages but must not leak onto the
// reference markup (which reuses the same class names)
const RENAME = new Map([
  [".prod", ".prod:not(:has(.prod-art))"],
  [".prod:hover", ".prod:not(:has(.prod-art)):hover"],
  [".prod h3", ".prod:not(:has(.prod-art)) h3"],
  [".stars", ".stars:not(:has(.s))"],
  [".packs", ".packs:not(:has(.pk))"],
  [".pack", ".pack:not(:has(.pk))"],
  [".pack.on, .pack:hover", ".pack:not(:has(.pk)).on, .pack:not(:has(.pk)):hover"],
  [".shop-filters", ".shop-filters:has(.filter-group)"],
  [".cart-empty", ".cart-empty:has(.cart-empty-title)"],
]);

const killed = [];
const renamed = [];
const drop = new Set();
let firstBlogGridSeen = false;

for (const c of chunks) {
  const sel = c.selector.replace(/\s+/g, " ");
  // homepage-era .blog-grid: two definitions exist; kill only the FIRST
  if (sel === ".blog-grid" && !firstBlogGridSeen) {
    firstBlogGridSeen = true;
    for (let i = c.start; i <= c.end; i++) drop.add(i);
    killed.push(sel + " (first)");
    continue;
  }
  if (KILL.has(sel)) {
    for (let i = c.start; i <= c.end; i++) drop.add(i);
    killed.push(sel);
    continue;
  }
  if (RENAME.has(sel)) {
    const to = RENAME.get(sel);
    // rewrite the selector line(s)
    const open = lines[c.start + (sel.includes(",") ? 1 : 0)];
    if (sel.includes(",")) {
      // two-line selector: rewrite both lines
      const parts = to.split(", ");
      lines[c.start] = parts[0] + ",";
      lines[c.start + 1] = parts[1] + " {";
    } else {
      lines[c.start] = lines[c.start].replace(sel, to);
    }
    renamed.push(`${sel} -> ${to}${open ? "" : ""}`);
  }
}

let out = lines.filter((_, i) => !drop.has(i)).join("\n");

// collapse 3+ consecutive blank lines and orphaned section comments
out = out.replace(/\n{3,}/g, "\n\n");

writeFileSync(FILE, out);
console.log("KILLED:", killed.length);
console.log(killed.join("\n"));
console.log("\nRENAMED:", renamed.length);
console.log(renamed.join("\n"));
