/**
 * Theme preview — every component rendered under both palettes so the
 * dark↔light flip can be eyeballed as a clean inversion.
 *
 * Two panels side-by-side: the top panel inherits the page's resolved theme
 * (toggle via <ThemeToggle />), and each side panel hard-pins a palette by
 * locally overriding the color tokens. This lets you compare both at once
 * without flipping the document class.
 */

import type { CSSProperties } from "react";
import { Button } from "../src/components/Button.js";
import { TextInput } from "../src/components/TextInput.js";
import { Textarea } from "../src/components/Textarea.js";
import { SearchInput } from "../src/components/SearchInput.js";
import { Link } from "../src/components/Link.js";
import { DownloadIcon } from "../src/components/DownloadIcon.js";
import { BackgroundGrid } from "../src/grid/BackgroundGrid.js";
import { ThemeToggle } from "../src/theme/ThemeToggle.js";
import { palette } from "../src/tokens/tokens.js";

function paletteVars(theme: "dark" | "light"): CSSProperties {
  const p = palette[theme];
  return {
    "--color-bg-page": p.bgPage,
    "--color-fg": p.fg,
    "--color-fg-bright": p.fgBright,
    "--color-fg-muted": p.fgMuted,
    "--color-fg-dim": p.fgDim,
    "--color-fg-soft": p.fgSoft,
    "--color-fg-body": p.fgBody,
    "--color-label": p.label,
    "--color-border": p.border,
    "--color-border-hover": p.borderHover,
    "--color-border-section": p.borderSection,
    "--color-border-divider": p.borderDivider,
    "--color-numeral": p.numeral,
    "--color-bullet": p.bullet,
    "--color-border-input-focus": p.borderInputFocus,
    "--color-border-input-error": p.borderInputError,
    "--color-border-input-error-focus": p.borderInputErrorFocus,
    "--color-chrome-border": p.chromeBorder,
    "--color-hero-grid": p.heroGrid,
    "--color-footer-year": p.footerYear,
    "--color-error-text": p.errorText,
    "--color-tap-highlight": p.tapHighlight,
    background: p.bgPage,
    color: p.fg,
  } as CSSProperties;
}

function Showcase({ titleNote }: { titleNote: string }) {
  return (
    <div style={{ position: "relative", padding: "3rem 1.5rem", minHeight: 480 }}>
      <BackgroundGrid />
      <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.25rem",
            color: "var(--color-fg-dim)",
            marginBottom: "0.5rem",
          }}
        >
          Hello, I am
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            letterSpacing: "var(--tracking-tight)",
            fontSize: "clamp(2.25rem, 8vw, 3.5rem)",
            lineHeight: 0.95,
            margin: 0,
            color: "var(--color-fg)",
          }}
        >
          Theme preview
        </h1>
        <p
          style={{
            marginTop: "1.25rem",
            fontSize: 11,
            letterSpacing: "var(--tracking-display-eyebrow)",
            textTransform: "uppercase",
            color: "var(--color-fg-muted)",
          }}
        >
          {titleNote}
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: "1.75rem", flexWrap: "wrap" }}>
          <Button iconStart={<DownloadIcon />}>Download CV</Button>
          <Button iconStart={<DownloadIcon />}>Download Résumé</Button>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--color-border-section)",
            margin: "2rem 0",
          }}
        />

        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-field__label" htmlFor="preview-email">Email</label>
          <TextInput id="preview-email" type="email" placeholder="your@email.com" />
        </div>

        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-field__label" htmlFor="preview-search">Search</label>
          <SearchInput id="preview-search" placeholder="Search…" />
        </div>

        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-field__label" htmlFor="preview-msg">Message</label>
          <Textarea id="preview-msg" placeholder="What would you like to say?" />
        </div>

        <div className="ds-field" style={{ marginBottom: 16 }}>
          <label className="ds-field__label" htmlFor="preview-err">Error state</label>
          <TextInput id="preview-err" invalid defaultValue="not-an-email" />
          <p className="ds-field__error" role="alert">Use a valid email with @ and a domain.</p>
        </div>

        <Button align="start" block iconStart={<DownloadIcon />}>
          Send Message
        </Button>

        <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--color-fg-body)" }}>
          Body copy reads at <Link href="#">the canonical link color</Link>, with{" "}
          <Link href="#" variant="quiet">a quiet alternate</Link> that drops the underline.
        </p>
      </div>
    </div>
  );
}

export function ThemePreview() {
  return (
    <div>
      <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "flex-end" }}>
        <ThemeToggle />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderTop: "1px solid var(--color-border-section)",
        }}
      >
        <section style={paletteVars("dark")}>
          <Showcase titleNote="Dark palette (pinned)" />
        </section>
        <section style={paletteVars("light")}>
          <Showcase titleNote="Light palette (pinned)" />
        </section>
      </div>
    </div>
  );
}
