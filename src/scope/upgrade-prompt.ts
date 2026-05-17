/*
 * Upgrade prompt — a small modal dialog telling the visitor they need a
 * higher-scope code, with a CTA that routes them through the auth gate
 * carrying ?next= back to wherever they were.
 *
 * Vanilla; the React side just calls into this so the rendered DOM is
 * identical regardless of consumer framework.
 */

import { getScope, type MinScope, type Scope } from "./scope.js";

const AUTH_ORIGIN = "https://auth.elijahfrost.com";

let activeRoot: HTMLDivElement | null = null;

function buildContent(required: MinScope, current: Scope): string {
  const sub = current !== "none"
    ? `<p class="ef-scope-dialog__sub">You are signed in as <strong>${current}</strong>.</p>`
    : "";
  return `
    <div class="ef-scope-dialog__backdrop" data-ef-action="cancel"></div>
    <div role="dialog" aria-modal="true" aria-labelledby="ef-scope-dialog-title" class="ef-scope-dialog">
      <h2 id="ef-scope-dialog-title" class="ef-scope-dialog__title">
        This action requires <strong>${required}</strong> access.
      </h2>
      ${sub}
      <div class="ef-scope-dialog__actions">
        <button type="button" data-ef-action="signin" class="ef-scope-dialog__primary">
          Sign in with a ${required} code
        </button>
        <button type="button" data-ef-action="cancel" class="ef-scope-dialog__secondary">
          Cancel
        </button>
      </div>
    </div>
  `;
}

function dismiss(): void {
  if (!activeRoot) return;
  activeRoot.remove();
  activeRoot = null;
  document.removeEventListener("keydown", onKeyDown, true);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    e.preventDefault();
    dismiss();
  }
}

/**
 * Show the upgrade prompt. If already showing, this is a no-op (a single
 * locked-control click shouldn't stack dialogs). Calls to this with a
 * different `required` while one is open are also ignored — close the
 * existing one first by calling dismissUpgradePrompt().
 */
export function showUpgradePrompt(required: MinScope): void {
  if (typeof document === "undefined") return;
  if (activeRoot) return;

  const current = getScope();
  activeRoot = document.createElement("div");
  activeRoot.className = "ef-scope-dialog-root";
  activeRoot.innerHTML = buildContent(required, current);

  activeRoot.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const action = target.getAttribute("data-ef-action");
    if (action === "cancel") {
      e.preventDefault();
      dismiss();
      return;
    }
    if (action === "signin") {
      e.preventDefault();
      const here = typeof location !== "undefined" ? location.href : "";
      const url = `${AUTH_ORIGIN}/?next=${encodeURIComponent(here)}`;
      location.href = url;
    }
  });

  document.body.appendChild(activeRoot);
  document.addEventListener("keydown", onKeyDown, true);

  // Focus the primary button for keyboard users.
  const primary = activeRoot.querySelector<HTMLButtonElement>('[data-ef-action="signin"]');
  primary?.focus();
}

export function dismissUpgradePrompt(): void {
  dismiss();
}
