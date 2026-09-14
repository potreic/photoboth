import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Returns false during SSR and the initial client hydration pass (so they
// match), then true after mount. Use this to gate reads of browser-only
// APIs (window, sessionStorage) without a hydration mismatch.
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
