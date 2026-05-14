# Design system

Portable visual language extracted from elijahfrost.com. Drop the `design-system/` folder into any new project and you get the same colors, typography, motion, buttons, inputs, custom cursor, and background grid.

- **Framework-agnostic foundation.** CSS variables in `src/tokens/tokens.css`. No framework required.
- **React reference components.** Optional. Buttons, inputs, theme provider, custom cursor, background grid.
- **No imports from the source site.** Every token value lives in this folder as a literal — copying it out is enough.

---

## Standalone setup

After copying `design-system/` into an empty repo:

```bash
git init
npm install
```

That's it. The package now installs its dev dependencies (TypeScript, React types) and is ready to import from.

Optional:

```bash
npm run type-check   # validate the source
npm run build        # emit compiled .js + .d.ts to dist/
```

The package ships source as-is. Consumers using a bundler (Vite, Next.js, Webpack) can import directly from `src/`. The `build` script is only needed if you want pre-compiled JS to publish or to consume from a non-bundled environment.

---

## Using the system

Three import styles, depending on your stack.

### 1. CSS only (works anywhere)

Add the tokens stylesheet to your global CSS or HTML `<head>`:

```css
/* app/globals.css, src/main.css, or a plain index.css */
@import "@elijahfrost/design-system/tokens.css";
@import "@elijahfrost/design-system/components.css"; /* optional */
@import "@elijahfrost/design-system/cursor.css";     /* optional */
```

Or in one line:

```css
@import "@elijahfrost/design-system/styles.css";
```

Now use the tokens directly:

```html
<button class="ds-button">Send Message</button>
<input class="ds-input" type="email" />
<a class="ds-link" href="/about">About</a>
```

Custom elements pick up the canonical focus ring by adding `data-ds-focus-ring` or the `ds-focus-ring` class.

### 2. React (with provider)

```tsx
import "@elijahfrost/design-system/styles.css";
import {
  ThemeProvider,
  ThemeToggle,
  Button,
  TextInput,
  Textarea,
  SearchInput,
  Link,
  DownloadIcon,
  BackgroundGrid,
  CustomCursor,
} from "@elijahfrost/design-system";

export default function App() {
  return (
    <ThemeProvider storageKey="myapp-theme" defaultTheme="system">
      <CustomCursor />
      <header><ThemeToggle /></header>
      <main style={{ position: "relative" }}>
        <BackgroundGrid />
        <Button iconStart={<DownloadIcon />}>Download CV</Button>
      </main>
    </ThemeProvider>
  );
}
```

To prevent a dark-flash on first paint in light mode, drop the bootstrap script in `<head>` before React mounts (Next.js: in `app/layout.tsx`; Vite: in `index.html`):

```tsx
import { themeBootstrap } from "@elijahfrost/design-system";
// ...
<script dangerouslySetInnerHTML={{ __html: themeBootstrap("myapp-theme") }} />
```

### 3. Tokens from JS

When you need the same colors in a non-CSS context (canvas, PDF, native):

```ts
import { palette, tracking, motion, themeColor } from "@elijahfrost/design-system";

const heroBg = palette.dark.bgPage;  // "#0d0d0d"
const accent = palette.light.fgBright; // "#0c0a09"
```

---

## Fonts

The system expects two font-face variables on `<html>`:

- `--font-inter` — body / UI (Inter; weights 300–600)
- `--font-cormorant` — display / italic emphasis (Cormorant Garamond; weights 300–700, normal + italic)

Token CSS falls back to named families and then system fonts if you haven't wired the variables yet, so layouts won't break — they just lose the exact look.

### Next.js (App Router)

```tsx
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300","400","500","600"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  style: ["normal","italic"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Vite / static / anywhere else

Use `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300..600&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap">` and add this once in your global CSS:

```css
:root {
  --font-inter: "Inter";
  --font-cormorant: "Cormorant Garamond";
}
```

Self-hosting? Define the same variables wherever your `@font-face` declarations live.

---

## Override surface

You can change the system's appearance without forking it. Override any token at any layer — `:root`, `html.light`, a project root selector, or a single component.

```css
/* Project-wide override: lighter borders in dark mode */
:root {
  --color-border: #303030;
}

/* Per-component override: a darker page-bg shell for a single section */
.section--hero {
  --color-bg-page: #050505;
}
```

Common override points:

| Want to… | Override |
|---|---|
| Change brand background tone | `--color-bg-page` |
| Boost or quiet headings | `--color-fg`, `--color-fg-bright` |
| Recolor links on hover | `--color-fg-bright` |
| Tighter focus ring | the `.ds-focus-ring` rule in your own CSS |
| Project-scoped theme storage | `<ThemeProvider storageKey="myapp-theme">` |
| Different default theme | `<ThemeProvider defaultTheme="light">` |
| Disable system-pref tracking | `<ThemeProvider defaultTheme="dark">` and skip the system bootstrap |
| Disable cursor entirely | omit `cursor.css` and `<CustomCursor />` |
| Disable the grid below mobile | `<BackgroundGrid disableBelow={640} />` |
| Custom grid density | `<BackgroundGrid cellSize={40} opacity={0.06} />` |

---

## Extending the system

The intent is that you add **project-specific** components in your app, built on the tokens — not in this package. The system stays small.

To add a new component in your app using the tokens:

```tsx
// my-app/components/Card.tsx
export function Card({ children }) {
  return (
    <div style={{
      border: "1px solid var(--color-border)",
      background: "var(--color-bg-page)",
      padding: "1.5rem",
    }}>
      {children}
    </div>
  );
}
```

To extend a system component:

```tsx
import { Button } from "@elijahfrost/design-system";

// Wrap to add a project-specific variant
export function GhostButton(props) {
  return <Button {...props} className={`${props.className ?? ""} my-ghost`} />;
}
```

```css
.my-ghost { border-color: transparent; }
.my-ghost:hover { background: var(--color-border-section); }
```

If a token genuinely doesn't exist for what you're doing, add a new project-scoped variable first (`--color-card-shadow: …`), and only promote it into the system if a second project needs it.

---

## What lives where

```
design-system/
├── src/
│   ├── tokens/
│   │   ├── tokens.css        # required foundation: vars, base styles, motion, focus
│   │   └── tokens.ts         # parallel TS export (palette, tracking, motion, themeColor)
│   ├── components/
│   │   ├── components.css    # canonical button/input/link recipes
│   │   ├── Button.tsx
│   │   ├── TextInput.tsx
│   │   ├── Textarea.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Link.tsx
│   │   ├── DownloadIcon.tsx
│   │   ├── SPEC.md           # framework-agnostic spec (Vue / Svelte / vanilla HTML)
│   │   └── index.ts
│   ├── grid/
│   │   ├── BackgroundGrid.tsx
│   │   └── index.ts
│   ├── cursor/
│   │   ├── cursor.css        # optional: hide system pointer when CustomCursor is mounted
│   │   ├── cursor-icon.tsx   # geometry constants + SVG
│   │   ├── CustomCursor.tsx  # pointer-device-gated React component
│   │   └── index.ts
│   ├── theme/
│   │   ├── ThemeProvider.tsx # vanilla provider (no next-themes), localStorage + system pref
│   │   ├── ThemeToggle.tsx   # reference toggle
│   │   └── index.ts
│   ├── index.css             # combined CSS entry (tokens + components + cursor)
│   └── index.ts              # combined TS entry
├── examples/
│   └── ThemePreview.tsx      # both palettes pinned side-by-side
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## Notes on deviations from the source site

When this package is built, a handful of source-site inconsistencies were resolved as a single canonical version. Recorded for reference:

1. **Disabled-button opacity** → `0.4` (source had `0.5` on hero, `0.4` on form submit).
2. **Input transition** → `120ms` (unified with the theme transition; source used `100ms` on inputs and `120ms` on buttons).
3. **Focus ring** → `outline: 2px solid var(--color-fg-muted); outline-offset: 2px` on every interactive control (source only declared one on the theme toggle).
4. **Icon stroke width** → `1.5` default for `.ds-button__icon > svg`; `1.0` for ultra-light glyphs; the cursor stays at its geometry-tuned `1.35`.
5. **Cursor SVG stroke** → driven by `--cursor-stroke` (source hardcoded `var(--color-bg-page)`, leaving the token unused).
6. **Light-mode `--color-bullet`** → `#c4bfb6`, matching the relative quietness of the dark-mode value.
7. **Letter-spacing scale** → five tokens: `tight` / `label-sm` / `label` / `eyebrow` / `display-eyebrow`.
8. **Background grid viewport** → renders at all viewports by default; pass `disableBelow={640}` to gate on `sm`.
9. **Search input** → recipe synthesized from the text-input recipe + leading-icon slot (source site has no search input).
