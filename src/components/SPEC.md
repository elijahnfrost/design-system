# Components — framework-agnostic spec

Every component below is a thin wrapper around a native HTML element plus the CSS classes defined in `components.css`. To use this design system in Vue / Svelte / vanilla HTML, ignore the `.tsx` files and replicate the class names + states described here.

State surface across all interactive controls:

- **default**
- **:hover** — typically shifts border-color or color one token brighter
- **:focus-visible** — `outline: 2px solid var(--color-fg-muted); outline-offset: 2px`
- **:active** — no special treatment; rely on existing color states
- **:disabled** — `opacity: 0.4`; cursor changes to `wait` on actions or `not-allowed` on inputs

---

## Button

Markup:

```html
<button class="ds-button" type="button">
  <span class="ds-button__icon"><!-- optional 16×16 SVG --></span>
  <span class="ds-button__label">Send Message</span>
</button>
```

Variants (toggleable additive classes):

- `ds-button--align-start` — left-align label, padded as form submit (taller).
- `ds-button--block ds-button--block-sm-auto` — full-width on mobile, auto width sm+.

The stylesheet enforces icon `stroke-width: 1.5` for any `<svg>` placed inside `.ds-button__icon` — pass an icon without stroke props and it will look canonical.

## Text input

```html
<input class="ds-input" type="text" />
<input class="ds-input" type="text" aria-invalid="true" />
<input class="ds-input" type="text" disabled />
```

## Textarea

```html
<textarea class="ds-textarea" rows="5"></textarea>
```

## Search input

```html
<span class="ds-search">
  <input class="ds-input" type="search" />
  <svg class="ds-search__icon"><!-- 16×16 magnifier --></svg>
</span>
```

Search input is synthesized — the source site does not have one. The recipe reuses `.ds-input` and adjusts the left padding for a leading icon slot.

## Field group (label + input + error)

```html
<div class="ds-field">
  <label for="email" class="ds-field__label">Email</label>
  <input id="email" class="ds-input" type="email" aria-invalid="true" aria-describedby="email-error" />
  <p id="email-error" class="ds-field__error" role="alert">Please add your email.</p>
</div>
```

## Inline link

```html
<a class="ds-link" href="/about">About</a>
<a class="ds-link ds-link--quiet" href="/about">About</a>
```

## Focus ring on custom elements

Add the `ds-focus-ring` class (or the `data-ds-focus-ring` attribute) to any custom interactive element to inherit the canonical focus ring:

```html
<div tabindex="0" class="ds-focus-ring">Custom focusable</div>
```
