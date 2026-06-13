# 🌿 Flora — Dev Journal

A daily learning journal for the Flora backend. It explains **every line of code in plain English** — what each annotation does, why each field exists, with real-life examples from Gowtham's farm.

## How to open it

Just **double-click `index.html`** — it opens in any browser, no server or internet needed (except the Google Font, which is optional). Everything works offline from `file://`.

> Tip in VS Code: right-click `index.html` → **Open with Live Server** (or "Reveal in File Explorer" → double-click).

## How it's organised

```
journal/
├── index.html              ← the page you open
├── assets/
│   └── engine.js           ← renders everything · NEVER needs editing
├── data/
│   ├── 00-meta.js          ← project info + 4 phases + roadmap plan
│   ├── day-01.js           ← Day 1 content
│   ├── day-02.js           ← Day 2 content
│   └── day-03.js           ← Day 3 content
└── README.md               ← this file
```

**One file = one day.** That's the whole idea. To add a day you create one new file and add one line to `index.html`. Nothing else.

## How to add a new day (the daily routine)

When you bring me the content you worked on, I'll do this for you. But here's exactly what happens, so you understand it:

1. **Copy** the last day file, e.g. `data/day-03.js` → `data/day-04.js`.
2. **Change the numbers** at the top: `day:4`, the new `date:"YYYY-MM-DD"`, `title`, `summary`, `tags`.
3. **Fill the sections** (all optional except `day`/`date`/`title`):

   | Field | What goes in it |
   |-------|-----------------|
   | `built[]` | Bullets: *what you built today* |
   | `understood[]` | Bullets: *what finally made sense today* |
   | `code[]` | Code cards: `{ file, sub, code }` — the highlighted code |
   | `extras[]` | Diagrams, tables, and **glossaries** (see below) |
   | `next[]` | Bullets: *what comes next* |
   | `snapshot` | Running totals `{ entities, enums, tables, endpoints }` |

4. **Register the file** — add one line in `index.html`, right after the previous day:
   ```html
   <script src="data/day-04.js"></script>
   ```
5. **Save & refresh.** The calendar tile, timeline entry, sidebar link, streak counter and progress bar all update automatically.

## The glossary (plain-English explanations)

This is the feature that explains things like `@Entity` in 2–3 simple lines. Inside a day's `extras[]`:

```js
{ type:"glossary", title:"Every word on this page, in plain English",
  items:[
    { term:"@Entity",
      def:"Tells Hibernate this Java class is a database table. <b>Bold</b> the key idea.",
      eg:"Real-life example shown with a 🌱 — use <em>code style</em> for code words." }
  ]
}
```

- **`term`** — the word/annotation being explained (shown in orange, code font)
- **`def`** — 2–3 sentences of simple English. Wrap key ideas in `<b>…</b>`.
- **`eg`** — a real-life example (auto-prefixed with 🌱). Wrap code words in `<em>…</em>`.

Other `extras` types you can use:
- `{ type:"diagram", title, html }` — ASCII relationship maps (monospace box)
- `{ type:"table", title, html }` — comparison tables (use `class="ann-table"`)

## Code highlighting cheat-sheet

Inside a `code:` string, wrap words in these spans to colour them:

| Class | Colour | Use for |
|-------|--------|---------|
| `kw` | purple | keywords — `public`, `class`, `private`, `return` |
| `cls` | yellow | class names — `Farmer`, `District` |
| `ann` | orange | annotations — `@Entity`, `@Column` |
| `prop` | blue | method names — `getDisplayName` |
| `val` | green | enum constants — `EN`, `MILK` |
| `str` | light green | text strings — `"English"` |
| `cmt` | grey italic | comments |

> ⚠️ Inside code, write `<` as `&lt;` and `>` as `&gt;` (e.g. `List&lt;Crop&gt;`), otherwise the browser thinks it's an HTML tag.

## The old file

`docs/Flora_Dev_Journal.html` was the original single-file version. This `journal/` folder replaces it. Once you're happy with the new one, you can delete the old file.
