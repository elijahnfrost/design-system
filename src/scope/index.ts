// Public surface for the scope module (vanilla / framework-agnostic).
//
// React consumers should import from "@elijahfrost/design-system/scope/react"
// to get useScope and <RequireScope>.

export {
  getScope,
  isAtLeast,
  onScopeChange,
  SCOPE_RANK,
  type Scope,
  type MinScope,
} from "./scope.js";

export { showUpgradePrompt, dismissUpgradePrompt } from "./upgrade-prompt.js";

export { mountScopeGuard, unmountScopeGuard } from "./vanilla.js";
