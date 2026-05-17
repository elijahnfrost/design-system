/**
 * Aggregate entry — re-exports every public symbol.
 *
 * Most apps will only need the CSS:
 *   import "@elijahfrost/design-system/tokens.css";
 *   import "@elijahfrost/design-system/components.css";
 *
 * React consumers can also import components and hooks from this root:
 *   import { Button, ThemeProvider, BackgroundGrid } from "@elijahfrost/design-system";
 */

export * from "./tokens/tokens.js";
export * from "./components/index.js";
export * from "./grid/index.js";
export * from "./cursor/index.js";
export * from "./theme/index.js";
export * from "./scope/index.js";

// Side-effect: in the browser, walk the document for [data-requires-scope]
// elements and lock them when the visitor's scope is insufficient. SSR-safe
// (mountScopeGuard no-ops without window/document). Apps that don't want
// this can import the submodules they need without the side-effect.
import { mountScopeGuard } from "./scope/vanilla.js";
mountScopeGuard();
