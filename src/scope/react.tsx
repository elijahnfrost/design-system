/*
 * React adapters for the scope module.
 *
 * Subpath export: import from "@elijahfrost/design-system/scope/react".
 * This file imports react, so it stays separate from the main entry to
 * keep vanilla consumers from needing the dependency.
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  SCOPE_RANK,
  type MinScope,
  type Scope,
  getScope,
  onScopeChange,
} from "./scope.js";
import { showUpgradePrompt } from "./upgrade-prompt.js";

/**
 * React hook: returns the current scope and re-renders on transitions.
 * SSR-safe: returns "none" during the first render, then upgrades on mount.
 */
export function useScope(): Scope {
  const [scope, setScope] = useState<Scope>("none");
  useEffect(() => {
    setScope(getScope());
    const unsub = onScopeChange((s) => setScope(s));
    return unsub;
  }, []);
  return scope;
}

export interface RequireScopeProps {
  min: MinScope;
  children: ReactNode;
}

/**
 * If the current scope satisfies `min`, renders children unchanged.
 *
 * Otherwise, wraps the children in a span with the ef-scope-locked class
 * and a capture-phase click listener that intercepts and shows the upgrade
 * prompt. Also forwards `disabled` + `aria-disabled` onto child elements
 * that accept them.
 *
 * Re-renders on scope change so the lock lifts the moment the visitor
 * re-authenticates without a page reload.
 */
export function RequireScope({ min, children }: RequireScopeProps): ReactElement {
  const scope = useScope();
  const satisfies = SCOPE_RANK[scope] >= SCOPE_RANK[min];

  if (satisfies) {
    return <>{children}</>;
  }

  const intercept = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showUpgradePrompt(min);
  };

  // Try to forward disabled/aria-disabled to direct child element(s) so
  // form controls render visually disabled; the wrapper still intercepts
  // clicks because some browsers swallow events on disabled buttons.
  const augmented = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    type AnyProps = Record<string, unknown>;
    const existing = (child.props ?? {}) as AnyProps;
    const className = [
      typeof existing.className === "string" ? existing.className : "",
      "ef-scope-locked",
    ]
      .filter(Boolean)
      .join(" ");
    return cloneElement(child as ReactElement<AnyProps>, {
      disabled: true,
      "aria-disabled": true,
      className,
      title: `Requires ${min} access`,
    });
  });

  return (
    <span
      className="ef-scope-locked"
      onClickCapture={intercept}
      style={{ display: "contents" }}
    >
      {augmented}
    </span>
  );
}

export { showUpgradePrompt, dismissUpgradePrompt } from "./upgrade-prompt.js";
export { getScope, isAtLeast, onScopeChange } from "./scope.js";
export type { Scope, MinScope } from "./scope.js";
