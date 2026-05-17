/*
 * Vanilla DOM auto-script — walks the document for elements with
 * `data-requires-scope="read|write|admin"` and locks any that exceed the
 * visitor's current scope. Re-runs on cookie change and on DOM mutations.
 *
 * Imported as a side-effect from the design-system entry, so any consumer
 * pulling from "@elijahfrost/design-system" gets this for free. Apps that
 * don't want the auto-run can import only the submodules they need.
 *
 * SSR-safe: every browser-only path guards on typeof window.
 */

import { SCOPE_RANK, type MinScope, type Scope, getScope, onScopeChange } from "./scope.js";
import { showUpgradePrompt } from "./upgrade-prompt.js";

const ATTR = "data-requires-scope";
const LOCKED_CLASS = "ef-scope-locked";
const INTERCEPT_FLAG = "__efScopeIntercept";

type LockableElement = HTMLElement & { disabled?: boolean; [INTERCEPT_FLAG]?: boolean };

function readRequired(el: Element): MinScope | null {
  const raw = el.getAttribute(ATTR);
  if (raw === "read" || raw === "write" || raw === "admin") return raw;
  return null;
}

function clickInterceptor(this: Element, ev: Event): void {
  const el = this as HTMLElement;
  // Re-read on click so a freshly-unlocked element doesn't keep intercepting
  // after the visitor signs in (though the unlock-walk should have cleared
  // the class + listener already).
  const required = readRequired(el);
  if (!required) return;
  if (SCOPE_RANK[getScope()] >= SCOPE_RANK[required]) return;
  ev.preventDefault();
  ev.stopPropagation();
  showUpgradePrompt(required);
}

function lock(el: LockableElement, required: MinScope): void {
  if (typeof el.disabled === "boolean") el.disabled = true;
  el.setAttribute("aria-disabled", "true");
  el.classList.add(LOCKED_CLASS);
  if (!el[INTERCEPT_FLAG]) {
    el.addEventListener("click", clickInterceptor, true);
    el[INTERCEPT_FLAG] = true;
  }
  // Title hint for hover; non-essential decoration that survives without CSS.
  if (!el.title) {
    el.title = `Requires ${required} access`;
  }
}

function unlock(el: LockableElement): void {
  if (typeof el.disabled === "boolean") el.disabled = false;
  el.removeAttribute("aria-disabled");
  el.classList.remove(LOCKED_CLASS);
  if (el[INTERCEPT_FLAG]) {
    el.removeEventListener("click", clickInterceptor, true);
    el[INTERCEPT_FLAG] = false;
  }
  // Don't strip title — apps may have set their own.
}

function walkAndApply(root: ParentNode, currentScope: Scope): void {
  const candidates = root.querySelectorAll(`[${ATTR}]`);
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i] as LockableElement;
    const required = readRequired(el);
    if (!required) continue;
    if (SCOPE_RANK[currentScope] >= SCOPE_RANK[required]) {
      unlock(el);
    } else {
      lock(el, required);
    }
  }
}

let observer: MutationObserver | null = null;
let mounted = false;

function applyAll(): void {
  if (typeof document === "undefined") return;
  walkAndApply(document, getScope());
}

function onMutations(mutations: MutationRecord[]): void {
  const currentScope = getScope();
  for (const m of mutations) {
    if (m.type === "attributes" && m.target instanceof Element) {
      const el = m.target as LockableElement;
      const required = readRequired(el);
      if (!required) {
        unlock(el);
      } else if (SCOPE_RANK[currentScope] >= SCOPE_RANK[required]) {
        unlock(el);
      } else {
        lock(el, required);
      }
      continue;
    }
    for (let i = 0; i < m.addedNodes.length; i++) {
      const node = m.addedNodes[i];
      if (node instanceof Element) {
        walkAndApply(node, currentScope);
      }
    }
  }
}

/**
 * Boot the vanilla scope enforcer. Idempotent — safe to call multiple times
 * (e.g. from SPAs re-importing the entry after navigation).
 */
export function mountScopeGuard(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (mounted) return;
  mounted = true;

  const start = () => {
    applyAll();
    observer = new MutationObserver(onMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [ATTR],
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  // Live re-evaluation on cookie change. The scope module polls cookie
  // every 5s; on transition we re-walk the entire document.
  onScopeChange(() => applyAll());
}

export function unmountScopeGuard(): void {
  if (!mounted) return;
  observer?.disconnect();
  observer = null;
  mounted = false;
  // We intentionally do NOT unlock everything on unmount: that's the
  // consumer's responsibility if they want to truly disable the guard.
}
