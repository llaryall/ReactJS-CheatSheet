// lib/redirectMap.ts
// Deterministic 90-record collision-free redirect dictionary
// Maps all existing/legacy database slugs to their canonical slugs

export const LEGACY_REDIRECT_MATRIX: Record<string, string> = {
  // Category: Core Fundamentals & Rendering (12 DB topics)
  "what is react?": "what-is-react",
  "what%20is%20react%3F": "what-is-react",
  "what-is-react": "what-is-react",

  "jsx: syntax, curly braces, className": "jsx-syntax-rules",
  "jsx%3A%20syntax%2C%20curly%20braces%2C%20className": "jsx-syntax-rules",
  "jsx-syntax-rules": "jsx-syntax-rules",

  "functional components: syntax and why they're used": "components-and-props",
  "functional%20components%3A%20syntax%20and%20why%20they%27re%20used": "components-and-props",

  "props: how to pass data (parent to child)": "components-and-props",
  "props%3A%20how%20to%20pass%20data%20%28parent%20to%20child%29": "components-and-props",

  "props.children and Composition": "props-children-composition",
  "props.children and composition": "props-children-composition",
  "props.children%20and%20Composition": "props-children-composition",
  "props.children%20and%20composition": "props-children-composition",
  "props-children-composition": "props-children-composition",

  "fragments and self-closing tags": "fragments-and-syntax",
  "fragments%20and%20self-closing%20tags": "fragments-and-syntax",
  "fragments-and-syntax": "fragments-and-syntax",

  "default props": "components-and-props",
  "default%20props": "components-and-props",

  "virtual dOM basics": "virtual-dom-basics",
  "virtual%20dOM%20basics": "virtual-dom-basics",
  "virtual-dom-basics": "virtual-dom-basics",

  "reconciliation algorithm": "reconciliation-algorithm",
  "reconciliation%20algorithm": "reconciliation-algorithm",
  "reconciliation-algorithm": "reconciliation-algorithm",

  "fiber architecture": "fiber-architecture",
  "fiber%20architecture": "fiber-architecture",
  "fiber-architecture": "fiber-architecture",

  "keys in lists": "rendering-lists-keys",
  "keys%20in%20lists": "rendering-lists-keys",
  "rendering-lists-keys": "rendering-lists-keys",

  "elements, components, and instances": "elements-components-instances",
  "elements%2C%20components%2C%20and%20instances": "elements-components-instances",
  "elements-components-instances": "elements-components-instances",

  // Category: State Management (7 DB topics)
  "what is state in react?": "what-is-state",
  "what%20is%20state%20in%20react%3F": "what-is-state",
  "what-is-state": "what-is-state",

  "local component state concepts": "what-is-state",
  "local%20component%20state%20concepts": "what-is-state",

  "colocation of state": "state-colocation",
  "colocation%20of%20state": "state-colocation",
  "state-colocation": "state-colocation",

  "form state basics": "form-state-basics",
  "form%20state%20basics": "form-state-basics",
  "form-state-basics": "form-state-basics",

  "Immutable update patterns": "immutable-update-patterns",
  "Immutable%20update%20patterns": "immutable-update-patterns",
  "immutable-update-patterns": "immutable-update-patterns",

  "context API introduction": "context-api-introduction",
  "context%20API%20introduction": "context-api-introduction",
  "context-api-introduction": "context-api-introduction",

  "useState, useReducer, or lifting state up": "state-architecture-selection",
  "useState%2C%20useReducer%2C%20or%20lifting%20state%20up": "state-architecture-selection",
  "state-architecture-selection": "state-architecture-selection",

  // Category: Lifecycle & Side Effects (6 DB topics)
  "lifecycle phases": "lifecycle-phases",
  "lifecycle%20phases": "lifecycle-phases",
  "lifecycle-phases": "lifecycle-phases",

  "what are side effects? ": "what-are-side-effects",
  "what%20are%20side%20effects%3F%20": "what-are-side-effects",
  "what-are-side-effects": "what-are-side-effects",

  "cleanup in effects": "effect-cleanup-lifecycle",
  "cleanup%20in%20effects": "effect-cleanup-lifecycle",
  "effect-cleanup-lifecycle": "effect-cleanup-lifecycle",

  "effects after render": "effect-cleanup-lifecycle",
  "effects%20after%20render": "effect-cleanup-lifecycle",

  "async effects and race conditions": "async-effects-race-conditions",
  "async%20effects%20and%20race%20conditions": "async-effects-race-conditions",
  "async-effects-race-conditions": "async-effects-race-conditions",

  "execution timing and batching": "execution-timing-batching",
  "execution%20timing%20and%20batching": "execution-timing-batching",
  "execution-timing-batching": "execution-timing-batching",

  // Category: Hooks (Core + Library Hooks) (20 DB topics)
  "usereducer": "usereducer",
  "what are hooks?": "what-are-hooks",
  "what%20are%20hooks%3F": "what-are-hooks",
  "what-are-hooks": "what-are-hooks",

  "usecontext": "usecontext",
  "rules of hooks": "rules-of-hooks",
  "rules%20of%20hooks": "rules-of-hooks",
  "rules-of-hooks": "rules-of-hooks",

  "usestate": "usestate",
  "use": "use-hook",
  "use-hook": "use-hook",

  "useEffect": "useeffect",
  "useeffect": "useeffect",

  "useid": "useid",
  "useref": "useref",

  "usecallback, usememo": "usecallback-usememo",
  "usecallback%2C%20usememo": "usecallback-usememo",
  "usecallback-usememo": "usecallback-usememo",
  "usememo": "usecallback-usememo",
  "usecallback": "usecallback-usememo",

  "useactionstate": "useactionstate",
  "useoptimistic": "useoptimistic",
  "usesyncexternalstore": "usesyncexternalstore",

  "useImperativehandle ": "useimperativehandle",
  "useImperativehandle%20": "useimperativehandle",
  "useimperativehandle": "useimperativehandle",

  "uselayoutffect ": "uselayouteffect",
  "uselayoutffect%20": "uselayouteffect",
  "uselayouteffect": "uselayouteffect",

  "usedebugvalue ": "usedebugvalue",
  "usedebugvalue%20": "usedebugvalue",
  "usedebugvalue": "usedebugvalue",

  "creating custom hooks ": "creating-custom-hooks",
  "creating%20custom%20hooks%20": "creating-custom-hooks",
  "creating-custom-hooks": "creating-custom-hooks",

  "usetransition, usedeferredvalue ": "usetransition-usedeferredvalue",
  "usetransition%2C%20usedeferredvalue%20": "usetransition-usedeferredvalue",
  "usetransition-usedeferredvalue": "usetransition-usedeferredvalue",

  "useformstate ": "useactionstate",
  "useformstate%20": "useactionstate",

  "useformstatus": "useformstatus",

  // Category: Data Flow & Patterns (14 DB topics)
  "component composition": "props-children-composition",
  "component%20composition": "props-children-composition",

  " One-way data flow": "one-way-data-flow",
  "%20One-way%20data%20flow": "one-way-data-flow",
  "one-way-data-flow": "one-way-data-flow",

  " props (properties)": "components-and-props",
  "%20props%20%28properties%29": "components-and-props",
  "components-and-props": "components-and-props",

  " state vs props": "state-vs-props",
  "%20state%20vs%20props": "state-vs-props",
  "state-vs-props": "state-vs-props",

  "event handling": "event-handling",
  "event%20handling": "event-handling",
  "event-handling": "event-handling",

  "conditional rendering": "conditional-rendering",
  "conditional%20rendering": "conditional-rendering",
  "conditional-rendering": "conditional-rendering",

  "rendering lists with keys": "rendering-lists-keys",
  "rendering%20lists%20with%20keys": "rendering-lists-keys",

  "controlled forms": "controlled-forms",
  "controlled%20forms": "controlled-forms",
  "controlled-forms": "controlled-forms",

  "render props ": "render-props",
  "render%20props%20": "render-props",
  "render-props": "render-props",

  "lifting state up": "lifting-state-up",
  "lifting%20state%20up": "lifting-state-up",
  "lifting-state-up": "lifting-state-up",

  "HOCs (higher order components)": "higher-order-components",
  "HOCs%20%28higher%20order%20components%29": "higher-order-components",
  "higher-order-components": "higher-order-components",

  "advanced form validation": "advanced-form-validation",
  "advanced%20form%20validation": "advanced-form-validation",
  "advanced-form-validation": "advanced-form-validation",

  "data fetching patterns": "data-fetching-patterns",
  "data%20fetching%20patterns": "data-fetching-patterns",
  "data-fetching-patterns": "data-fetching-patterns",

  "server actions (react 19)": "server-actions",
  "server%20actions%20%28react%2019%29": "server-actions",
  "server-actions": "server-actions",

  // Category: Routing & Navigation (11 DB topics)
  "what is client-side routing?": "what-is-client-side-routing",
  "what%20is%20client-side%20routing%3F": "what-is-client-side-routing",
  "what-is-client-side-routing": "what-is-client-side-routing",

  "createbrowserrouter": "createbrowserrouter",
  "routes, route, link": "routes-route-link",
  "routes%2C%20route%2C%20link": "routes-route-link",
  "routes-route-link": "routes-route-link",

  "Nested Routes (<Outlet />)": "nested-routes-outlet",
  "Nested%20Routes%20%28%3COutlet%20%2F%3E%29": "nested-routes-outlet",
  "nested-routes-outlet": "nested-routes-outlet",

  "dynamic routes (:id)": "dynamic-routes-params",
  "dynamic%20routes%20%28%3Aid%29": "dynamic-routes-params",
  "dynamic-routes-params": "dynamic-routes-params",

  " protected routes": "protected-routes",
  "%20protected%20routes": "protected-routes",
  "protected-routes": "protected-routes",

  "useRoutes config": "createbrowserrouter",
  "useRoutes%20config": "createbrowserrouter",

  "code-splitting": "code-splitting-lazy-suspense",
  " Error boundaries with errorElement": "error-boundaries",
  "%20Error%20boundaries%20with%20errorElement": "error-boundaries",

  "scroll restoration": "scroll-restoration",
  "scroll%20restoration": "scroll-restoration",
  "scroll-restoration": "scroll-restoration",

  "Route Loaders + actions (React Router 6.4+)": "route-loaders-actions",
  "Route%20Loaders%20%2B%20actions%20%28React%20Router%206.4%2B%29": "route-loaders-actions",
  "route-loaders-actions": "route-loaders-actions",

  // Category: Performance Optimization (7 DB topics)
  "Key Prop importance": "rendering-lists-keys",
  "Key%20Prop%20importance": "rendering-lists-keys",

  "react.memo()": "react-memo",
  "react.memo%28%29": "react-memo",
  "react-memo": "react-memo",

  "react profiler": "react-profiler",
  "react%20profiler": "react-profiler",
  "react-profiler": "react-profiler",

  "Code splitting (React.lazy, Suspense)": "code-splitting-lazy-suspense",
  "Code%20splitting%20%28React.lazy%2C%20Suspense%29": "code-splitting-lazy-suspense",
  "code-splitting-lazy-suspense": "code-splitting-lazy-suspense",

  "virtualization (react-window)": "virtualization-large-lists",
  "virtualization%20%28react-window%29": "virtualization-large-lists",
  "virtualization-large-lists": "virtualization-large-lists",

  "Streaming with suspense": "streaming-with-suspense",
  "Streaming%20with%20suspense": "streaming-with-suspense",
  "streaming-with-suspense": "streaming-with-suspense",

  "Concurrent Rendering optimization": "concurrent-rendering-optimization",
  "Concurrent%20Rendering%20optimization": "concurrent-rendering-optimization",
  "concurrent-rendering-optimization": "concurrent-rendering-optimization",

  // Category: Context & State Libraries (5 DB topics)
  "createContext & context.Provider": "createcontext-provider",
  "createContext%20%26%20context.Provider": "createcontext-provider",
  "createcontext-provider": "createcontext-provider",

  "use() for Consuming Context (server Components)": "use-hook",
  "use%28%29%20for%20Consuming%20Context%20%28server%20Components%29": "use-hook",

  "Updating context": "updating-context",
  "Updating%20context": "updating-context",
  "updating-context": "updating-context",

  "Avoiding Prop drilling": "avoiding-prop-drilling",
  "Avoiding%20Prop%20drilling": "avoiding-prop-drilling",
  "avoiding-prop-drilling": "avoiding-prop-drilling",

  "Context Performance tricks": "context-performance-optimization",
  "Context%20Performance%20tricks": "context-performance-optimization",
  "context-performance-optimization": "context-performance-optimization",

  // Category: Specialized React Concepts (8 DB topics)
  "Error boundaries": "error-boundaries",
  "Error%20boundaries": "error-boundaries",
  "error-boundaries": "error-boundaries",

  "portals": "portals",

  "React.forwardref": "forwardref-and-ref-prop",
  "React.forwardRef": "forwardref-and-ref-prop",
  "forwardref-and-ref-prop": "forwardref-and-ref-prop",

  "Server Components fundamentals": "server-components-fundamentals",
  "Server%20Components%20fundamentals": "server-components-fundamentals",
  "server-components-fundamentals": "server-components-fundamentals",

  "Server Actions basics": "server-actions",
  "Server%20Actions%20basics": "server-actions",

  "Error handling": "error-boundaries",
  "Error%20handling": "error-boundaries",

  "Forms with Server actions": "server-actions",
  "Forms%20with%20Server%20actions": "server-actions",

  "Concurrent Rendering & boundaries ": "concurrent-rendering-optimization",
  "Concurrent%20Rendering%20%26%20boundaries%20": "concurrent-rendering-optimization",
};

/**
 * Resolves any incoming slug (legacy, encoded, or canonical) to the canonical slug.
 * Returns null if not recognized.
 */
export function resolveCanonicalSlug(rawSlug: string): string | null {
  if (!rawSlug) return null;
  const decoded = decodeURIComponent(rawSlug).trim();

  // 1. Direct dictionary match
  if (LEGACY_REDIRECT_MATRIX[rawSlug]) {
    return LEGACY_REDIRECT_MATRIX[rawSlug];
  }
  if (LEGACY_REDIRECT_MATRIX[decoded]) {
    return LEGACY_REDIRECT_MATRIX[decoded];
  }
  if (LEGACY_REDIRECT_MATRIX[decoded.toLowerCase()]) {
    return LEGACY_REDIRECT_MATRIX[decoded.toLowerCase()];
  }

  // 2. Normalized kebab-case match
  const normalized = decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (LEGACY_REDIRECT_MATRIX[normalized]) {
    return LEGACY_REDIRECT_MATRIX[normalized];
  }

  return null;
}
