/**
 * 16×16 download arrow — the icon used inside the "Download CV" and
 * "Download Résumé" buttons on the source site. Stroke is left at 1.5 (the
 * canonical utility weight) because `.ds-button__icon > svg` enforces it.
 */
export function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 3v8" />
      <path d="m6.75 8.75 3.25 3.25 3.25-3.25" />
      <path d="M4 14.5h12" />
    </svg>
  );
}
