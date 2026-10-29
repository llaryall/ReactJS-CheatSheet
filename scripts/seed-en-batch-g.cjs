// English interactive primitives for the composition & routing batch:
//   props-children-composition · what-is-client-side-routing · routes-route-link
const crypto = require('crypto');
const { Client } = require('pg');

const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
  throw new Error('DATABASE_URI is required. Load it with: node --env-file=.env.local <script>');
}

const newId = () => crypto.randomBytes(12).toString('hex');

const TOPICS = [
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'props-children-composition',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. A Layout With a Boolean Prop Per Variant',
        phase: 'Prop Explosion',
        domState: 'A card with header, body and footer',
        screenContent: 'The page looks correct.',
        activeAction: 'The card takes hasHeader, hasFooter, headerTitle, footerAction, showClose. Every new variant adds another boolean and another branch inside the component.',
        closureSnapshot: 'props = { hasHeader, hasFooter, showClose, headerTitle, footerAction }',
        explanation: 'Each boolean is a variant the component has to know about. The component now depends on every use case that will ever exist.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Composition Passes the Slot Instead',
        phase: 'Inversion of Control',
        domState: 'The card renders whatever it was handed',
        screenContent: 'Header and footer appear in the right places.',
        activeAction: 'The card exposes header, footer and children props. It renders them where they belong and knows nothing about their contents.',
        closureSnapshot: '<Card header={<UserHeader />}>{content}</Card>',
        explanation: 'The parent decides what goes in each slot. The card only decides where the slots are.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. Children Keep Their Own Render Scope',
        phase: 'Render Isolation',
        domState: 'The parent re-renders on a keystroke',
        screenContent: 'The expensive child list does not flicker.',
        activeAction: 'The parent\'s state changes, so the parent re-renders. But the element passed as children was created by the grandparent and is passed through unchanged, so React uses the same element object and skips re-rendering that subtree.',
        closureSnapshot: 'children element reference unchanged → subtree skipped',
        explanation: 'This is the part people miss: composition gives you a de-facto memo boundary without writing memo anywhere.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. State Moves Down to a Gate Component',
        phase: 'Colocation',
        domState: 'Only the toggle area updates',
        screenContent: 'Opening the panel does not repaint the list beside it.',
        activeAction: 'A small component owns the open/closed state and receives the panel as children. When its state changes, only that component and its slot re-render.',
        closureSnapshot: 'state lives in <Panel>, children passed through',
        explanation: 'Wrapping children in a stateful container is the cheapest fix for a re-render that originates from one small piece of state.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Inline Children Regenerated',
        phase: 'Reference Churn',
        domState: 'The child subtree re-renders anyway',
        screenContent: 'Performance is unchanged despite the refactor.',
        activeAction: 'The parent now creates JSX inline above its own state, so the children element is a new object on every render and the skip never happens.',
        closureSnapshot: '<Panel><ExpensiveList /></Panel> created inside the stateful component → new every render',
        explanation: 'Composition only helps if the element is created outside the component that re-renders. Move the state down, not just the markup.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Boolean Prop Explosion',
        subtitle: 'Eleven booleans that no pair of which should ever be true together',
        why: 'A component with hasHeader, hasFooter, showClose, compact, bordered and six more has 64 combinations, most of which were never designed. Each new requirement adds a flag rather than a composition boundary, and the component accumulates branches nobody can safely delete. Bugs appear as layout that only breaks in one combination.',
        fix: 'Replace variant flags with slots: header, footer, children, actions. The caller decides the contents; the component decides the placement.',
        designPattern: 'Strategy / Slot-based composition (Dive Into Design Patterns): swap the behaviour at the boundary instead of enumerating every behaviour inside.',
      },
      {
        order: 2,
        title: 'Passing Children Through a Stateful Parent',
        subtitle: 'The memo boundary that disappears on the first state change',
        why: 'Composition only skips renders when the element passed as children is created outside the re-rendering component. Writing <ExpensiveList /> inline inside a component that holds frequently-changing state recreates that element on every render, so the subtree re-renders exactly as before. The refactor looks correct and changes nothing.',
        fix: 'Lift the element creation to the owner that does not re-render, or move the volatile state down into a small wrapper around the children. Where the element is created is what determines the boundary.',
        designPattern: 'Scope of Construction: a value is stable if the scope that creates it is stable. This applies to elements as much as to callbacks.',
      },
      {
        order: 3,
        title: 'Refactoring Everything Into Configuration',
        subtitle: 'A component with a props API that mirrors an entire page',
        why: 'Composition is not a mandate to replace every prop with JSX. When a prop is a simple primitive — a label, a boolean that genuinely has two states, a number — literal JSX makes the API harder to read and impossible to validate. Teams over-correct and end up with card header={<span>Title</span>} where cardTitle="Title" was clearer.',
        fix: 'Use slots for structural variation. Keep primitive props for primitive values. The rule is: does the caller need to control structure, or only a value?',
        designPattern: 'Appropriate Abstraction: an abstraction earns its complexity when it absorbs variation. Wrapping a string in JSX absorbs none.',
      },
    ],
    comparison: {
      title: 'Boolean explosion vs. slot composition',
      subtitle: 'One API survives new requirements; the other doubles each time',
      badLabel: 'A flag per variant',
      badGotcha: 'The assistant writes a Layout with six booleans to cover header, footer, close button and inset padding. The seventh requirement needs a new prop, and every existing call site has to be checked for compatibility.',
      goodLabel: 'Slots decide structure, component decides placement',
      goodReason: 'New content needs no change to the component at all. It also gets a free render boundary when the slots are created outside the re-rendering component.',
      badCode: `// ❌ Every new variant adds a flag
function Card({
  hasHeader,
  hasFooter,
  showClose,
  headerTitle,
  footerAction,
  compact,
  children,
}) {
  return (
    <div className={compact ? "card card--compact" : "card"}>
      {hasHeader && (
        <header>
          <h3>{headerTitle}</h3>
          {showClose && <button>×</button>}
        </header>
      )}
      <div>{children}</div>
      {hasFooter && <footer>{footerAction}</footer>}
    </div>
  );
}`,
      goodCode: `// ✅ The component decides placement, the caller decides content
function Card({ header, footer, children }: {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      {header && <header>{header}</header>}
      <div>{children}</div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

<Card
  header={<UserHeader name={user.name} onClose={close} />}
  footer={<SaveBar onSave={save} />}
>
  <OrderSummary order={order} />
</Card>`,
      footerNote: 'If you are adding a second boolean for the same concept, you needed a slot the first time.',
    },
    decisionTree: {
      title: 'Decision Tree: prop, slot, or compound component?',
      subtitle: 'Ask who should own the structure',
      rootQuestion: 'Does the caller need to change the structure, or only the value?',
      nodes: {
        branchA: 'Only a value — a label, a number, a genuine two-state flag',
        resultA: 'A primitive prop. It is readable, validatable and greppable.',
        codeA: '<Badge count={3} />',
        branchB: 'The structure varies — different headers, bodies, footers, actions',
        subQuestion: 'Is the variation limited to one or two named regions?',
        yesLabel: 'Yes — header and footer, or a body and an action bar',
        yesResult: 'Named slot props. The component places them; the caller composes them, which also creates a render boundary.',
        codeYes: '<Card header={<H />} footer={<F />}>{body}</Card>',
        noLabel: 'No — the caller arranges arbitrary children',
        noResult: 'A compound component with context: Card, Card.Header, Card.Body. More power, and more API surface to maintain.',
        codeNo: '<Card><Card.Header>…</Card.Header><Card.Body>…</Card.Body></Card>',
      },
    },
    quiz: {
      title: 'Quiz: why did the refactor not improve performance?',
      subtitle: 'Where the element is created matters more than what it is',
      codeSnippet: `function Panel() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      <ExpensiveList />
    </div>
  );
}

function App() {
  return <Panel />;
}`,
      question: 'ExpensiveList re-renders on every toggle despite being "just a child". What is the actual fix?',
      options: [
        {
          text: 'Wrap ExpensiveList in React.memo.',
          isCorrect: false,
          explanation: 'That masks the problem and adds a comparison per render. The element is recreated by the same component that holds the state.',
        },
        {
          text: 'Move the state into a small component and pass ExpensiveList as children from a parent that does not re-render.',
          isCorrect: true,
          explanation: 'Correct. Once the toggle state lives in a small wrapper and the list element is created by App, its element reference is stable across toggles and React skips the subtree — no memo needed.',
        },
        {
          text: 'Use useCallback for the onClick handler.',
          isCorrect: false,
          explanation: 'The handler is not causing the render. Panel re-renders because its own state changed, and its JSX is rebuilt with it.',
        },
        {
          text: 'Move ExpensiveList outside the div.',
          isCorrect: false,
          explanation: 'Position in the markup has no effect. The render relationship is what matters.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'what-is-client-side-routing',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. An Anchor Tag Navigates',
        phase: 'Full Page Request',
        domState: 'The current page is discarded',
        screenContent: 'The screen goes white as the browser leaves.',
        activeAction: 'The browser navigates to /settings and requests a new document. React state, refs and the running application are destroyed without any cleanup.',
        closureSnapshot: 'window.location → new document → everything in memory lost',
        explanation: 'The browser does exactly what it was told. The cost is the entire client state of the app you just left.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Client Router Intercepts Instead',
        phase: 'Interception',
        domState: 'The page stays mounted',
        screenContent: 'The view swaps; the header never flickers.',
        activeAction: 'A Link component prevents the default navigation, calls history.pushState, and notifies the router which route now matches.',
        closureSnapshot: 'pushState("/settings") → router re-renders',
        explanation: 'The URL changes and the browser history records it. No document was fetched.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Only the Matching Route Re-renders',
        phase: 'Partial Render',
        domState: 'The layout frame is untouched',
        screenContent: 'The content area changes; the sidebar keeps its scroll position.',
        activeAction: 'The router matches the new path and renders the corresponding route element. Components outside the switched region keep their identity, so their state survives.',
        closureSnapshot: 'layout: preserved | route content: remounted',
        explanation: 'This is the actual benefit: state outside the route change persists, and so does the cost of having built it.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Back Button Replays History',
        phase: 'Popstate',
        domState: 'The previous view returns',
        screenContent: 'The user goes back and sees the list where they left it.',
        activeAction: 'The browser fires popstate. The router reads the new location and renders the matching route without a network request for the document.',
        closureSnapshot: 'popstate → match(location) → render',
        explanation: 'The History API is the mechanism the whole model rests on. Client routing is bookkeeping around pushState and popstate.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: A Raw Anchor Inside the SPA',
        phase: 'Full Reload',
        domState: 'The whole application remounts',
        screenContent: 'The page flashes white and the scroll position resets.',
        activeAction: 'One <a href="/settings"> inside the app triggers a real navigation. Every component unmounts, every store is rebuilt, and any unsaved form state is gone.',
        closureSnapshot: 'document unloaded → app bootstraps from scratch',
        explanation: 'The router only intercepts what goes through it. A plain anchor opts out of the entire model.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'A Plain Anchor Inside the App',
        subtitle: 'One href that throws away the whole session',
        why: 'A raw <a href> inside a client-routed application performs a real document navigation. Every component unmounts, refs and store state are discarded, unsaved form data disappears, and the app re-bootstraps from a cold start. It looks like a styling inconsistency and behaves like a hard reload.',
        fix: 'Use the router\'s Link component for every internal navigation. Reserve <a> for external URLs and downloads, and add rel="noopener noreferrer" when it opens a new tab.',
        designPattern: 'Adapter: the Link component adapts an anchor to the router\'s interception. Bypassing the adapter bypasses the behaviour.',
      },
      {
        order: 2,
        title: 'Assuming Client Routing Fixes Initial Load',
        subtitle: 'A fast second navigation on top of a slow first one',
        why: 'Client-side routing makes navigation between pages fast because it skips the document request. It does nothing for the first load: the browser still needs the HTML, the JavaScript bundle and the data before anything is usable. Teams measure a snappy internal navigation and conclude the app is fast, while first-time visitors wait four seconds on a cold cache.',
        fix: 'Optimise the initial load separately: server rendering, code splitting on routes, and prefetching the chunks the user is likely to need next.',
        designPattern: 'Two Different Problems: navigation latency and cold-start latency share a UI but not a fix.',
      },
      {
        order: 3,
        title: 'Losing Scroll and Focus on Route Change',
        subtitle: 'Every navigation lands at the bottom of the new page',
        why: 'In a multi-page app the browser resets scroll to the top on navigation. In a client-routed app the document never reloads, so the scroll position simply stays where it was — usually hundreds of pixels down a page that no longer exists. Keyboard focus stays on a link that has been unmounted, which strands screen reader users.',
        fix: 'On each route change, scroll to the top (or restore the saved position for back navigation) and move focus to the new page heading.',
        designPattern: 'State Restoration: the browser handled this implicitly for full navigations. Client routing takes over the responsibility and has to reimplement it.',
      },
    ],
    comparison: {
      title: 'Anchor tag vs. router Link',
      subtitle: 'One destroys the app, the other updates a route',
      badLabel: 'A raw anchor',
      badGotcha: 'The assistant writes <a href="/dashboard"> because it is valid HTML. Every click reloads the bundle, clears the store, and drops the user\'s unsaved draft.',
      goodLabel: 'Router Link',
      goodReason: 'Navigation stays inside the app. Layout, stores and scroll listeners survive, and the history entry is still recorded so the back button works.',
      badCode: `// ❌ Full document navigation inside an SPA
function Nav() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/settings">Settings</a>
    </nav>
  );
}`,
      goodCode: `// ✅ Router interception, history preserved
import { Link } from "react-router-dom";

function Nav() {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/settings">Settings</Link>
    </nav>
  );
}`,
      footerNote: 'An <a> inside a client-routed app is not a small inconsistency. It is a full application restart.',
    },
    decisionTree: {
      title: 'Decision Tree: Link or anchor?',
      subtitle: 'One question: does the destination belong to this app?',
      rootQuestion: 'Does this URL point to a route inside the current application?',
      nodes: {
        branchA: 'Yes — a page this app renders',
        resultA: 'Router Link. Keeps the app mounted, preserves state, records history.',
        codeA: '<Link to="/settings">Settings</Link>',
        branchB: 'No — an external site, a download, a mailto',
        subQuestion: 'Should it open in a new tab?',
        yesLabel: 'Yes — an external resource the user may want to keep open',
        yesResult: 'An anchor with target="_blank" and rel="noopener noreferrer".',
        codeYes: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a>',
        noLabel: 'No — same tab, external destination',
        noResult: 'A plain anchor. There is no router route to intercept.',
        codeNo: '<a href="https://example.com">Docs</a>',
      },
    },
    quiz: {
      title: 'Quiz: what actually happens on a raw anchor click in an SPA?',
      subtitle: 'The difference between a route change and a document request',
      codeSnippet: `// Inside a client-routed React app:
<a href="/settings">Settings</a>`,
      question: 'The user clicks this link. What happens?',
      options: [
        {
          text: 'The router intercepts it automatically because the path is internal.',
          isCorrect: false,
          explanation: 'Routers intercept their own Link component and programmatic navigation. A raw anchor is not part of that flow.',
        },
        {
          text: 'The browser performs a full document navigation: the app unmounts, all state is lost, and the bundle re-bootstraps.',
          isCorrect: true,
          explanation: 'Correct. The URL changes via a real request. React state, refs and stores are discarded, and the new page is a cold start.',
        },
        {
          text: 'Nothing happens, because the click handler is missing.',
          isCorrect: false,
          explanation: 'An anchor with href needs no handler. The browser navigates by default.',
        },
        {
          text: 'The History API updates the URL and React re-renders the route.',
          isCorrect: false,
          explanation: 'pushState is only used when something calls it — a Link, or an explicit navigate call.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'routes-route-link',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. Routes Match the Current Location',
        phase: 'Matching',
        domState: 'One route element is selected',
        screenContent: 'The dashboard view renders inside the layout.',
        activeAction: 'The router walks the route configuration, scores each pattern against window.location.pathname, and picks the best match.',
        closureSnapshot: 'pathname "/orders/42" → match "/orders/:id"',
        explanation: 'Routing is pattern matching. The order and specificity of your patterns decide which element wins.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Params Are Extracted From the Path',
        phase: 'Param Extraction',
        domState: 'The detail component receives an id',
        screenContent: 'The order detail page shows order 42.',
        activeAction: 'The matched segment is captured as params.id. The component re-renders with the new param whenever the URL changes.',
        closureSnapshot: 'params = { id: "42" }',
        explanation: 'Params arrive as strings. Parsing and validating them is your job, not the router\'s.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. NavLink Computes isActive',
        phase: 'Active Styling',
        domState: 'The current section is highlighted',
        screenContent: 'The "Orders" tab in the sidebar looks selected.',
        activeAction: 'NavLink compares the current location with its own target and passes isActive to the className function, so styling follows the URL rather than a separate state variable.',
        closureSnapshot: 'isActive: true → className="nav nav--active"',
        explanation: 'This removes a whole class of bugs where the visual selection drifts from the actual route.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. Trailing Slashes and Prefix Matches',
        phase: 'Match Ambiguity',
        domState: 'Two tabs appear active at once',
        screenContent: 'Both "Orders" and "Order 42" look selected.',
        activeAction: 'By default a NavLink matches by prefix, so /orders is considered active while the user is at /orders/42. Nested sections light up at every level.',
        closureSnapshot: 'to="/orders" vs pathname "/orders/42" → prefix match → active',
        explanation: 'Prefix matching is a feature for nested navigation and a bug for sibling tabs. The end prop controls it.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Catch-All Route',
        phase: 'Fallback Match',
        domState: 'A 404 page renders',
        screenContent: 'The user sees "Page not found" instead of a blank layout.',
        activeAction: 'A path="*" route sits last in the configuration and catches every location that matched nothing else.',
        closureSnapshot: 'pathname "/typo" → no match → "*" → NotFound',
        explanation: 'Without it, an unmatched route renders the layout shell and an empty content area — which looks like a broken app, not a missing page.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'NavLink Without end on an Index Route',
        subtitle: 'The home tab is highlighted on every page in the app',
        why: 'A NavLink to="/" matches every path by prefix, because every path starts with a slash. The home item stays visually active across the entire application, and users lose their sense of location. It looks like a styling problem and is actually a matching rule.',
        fix: 'Add end to links that should match exactly: <NavLink to="/" end>. For section links, decide deliberately whether nested paths should keep the parent highlighted.',
        designPattern: 'Pattern Specificity: the more general a matcher, the more it will match. Exactness has to be requested, not assumed.',
      },
      {
        order: 2,
        title: 'Route Order and Specificity',
        subtitle: 'A dynamic route that swallows a static one',
        why: 'With path="/:id" declared before path="/new", the string "new" matches the dynamic segment and renders the detail page for an id of "new". The static route is unreachable, and the symptom is a detail view trying to load a record that does not exist.',
        fix: 'Order patterns from most specific to least, or use a router that ranks static segments above dynamic ones. Test the ambiguous URLs explicitly.',
        designPattern: 'First Match Wins: in an ordered rule set, a general rule placed early makes every specific rule after it dead code.',
      },
      {
        order: 3,
        title: 'Assuming Params Are Validated',
        subtitle: 'Number(id) producing NaN and a fetch to /api/orders/NaN',
        why: 'Route params are strings extracted from the URL, and the user can type anything into the address bar. Treating id as a number without parsing gives NaN, which becomes a request for a record that cannot exist — and often a 500 instead of a 404, which pollutes error monitoring.',
        fix: 'Parse and validate params at the boundary of the component: coerce to a number and check for NaN, or run a schema. Render a not-found state rather than issuing the request.',
        designPattern: 'Boundary Validation: the URL is user input. It gets the same treatment as a form field.',
      },
    ],
    comparison: {
      title: 'Link vs. NavLink with the wrong match mode',
      subtitle: 'Active state is a routing fact, not a styling decision',
      badLabel: 'Prefix match on every nav item',
      badGotcha: 'The assistant uses NavLink everywhere without end. The home tab stays highlighted on every route, and nested sections light up their parent, the parent\'s parent and the grandparent at once.',
      goodLabel: 'Explicit matching per link',
      goodReason: 'Home matches exactly. Section links keep prefix matching intentionally, and the styling reflects the actual location.',
      badCode: `// ❌ "/" matches every path
<nav>
  <NavLink to="/" className={({ isActive }) => (isActive ? "on" : "")}>
    Home
  </NavLink>
  <NavLink to="/orders" className={({ isActive }) => (isActive ? "on" : "")}>
    Orders
  </NavLink>
</nav>`,
      goodCode: `// ✅ Exactly where it should match, and only there
<nav>
  <NavLink to="/" end className={({ isActive }) => (isActive ? "on" : "")}>
    Home
  </NavLink>
  <NavLink to="/orders" className={({ isActive }) => (isActive ? "on" : "")}>
    Orders
  </NavLink>
</nav>`,
      footerNote: 'If two nav items are ever active at the same time, one of them needed end.',
    },
    decisionTree: {
      title: 'Decision Tree: Link, NavLink, or redirect?',
      subtitle: 'Pick by what the navigation has to express',
      rootQuestion: 'Does the user need to see where they currently are?',
      nodes: {
        branchA: 'No — an inline link inside content, a button that navigates',
        resultA: 'Link. Navigation without active styling.',
        codeA: '<Link to={`/orders/${order.id}`}>View order</Link>',
        branchB: 'Yes — it is part of a navigation menu',
        subQuestion: 'Should this item be highlighted on nested routes below it?',
        yesLabel: 'Yes — a section tab that stays active inside its subtree',
        yesResult: 'NavLink with prefix matching (the default). Do not add end.',
        codeYes: '<NavLink to="/orders" className={({ isActive }) => (isActive ? "on" : "")}>',
        noLabel: 'No — it must match this path exactly',
        noResult: 'NavLink with end, especially for the index route.',
        codeNo: '<NavLink to="/" end className={({ isActive }) => (isActive ? "on" : "")}>',
      },
    },
    quiz: {
      title: 'Quiz: why do two nav items look active?',
      subtitle: 'One prop, one rule',
      codeSnippet: `<NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
  Home
</NavLink>
<NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>
  Orders
</NavLink>`,
      question: 'At /orders/42, both items render as active. What is the correct fix?',
      options: [
        {
          text: 'Add end to the "/" NavLink so it only matches the index route.',
          isCorrect: true,
          explanation: 'Correct. Every path starts with "/", so a prefix match on "/" is always active. end makes it exact.',
        },
        {
          text: 'Add end to the "/orders" NavLink.',
          isCorrect: false,
          explanation: 'That would make Orders inactive on /orders/42, which is usually the opposite of what a section tab should do.',
        },
        {
          text: 'Replace NavLink with Link and track the active route in state.',
          isCorrect: false,
          explanation: 'That reintroduces the exact drift NavLink removes: a state variable that can disagree with the URL.',
        },
        {
          text: 'Move the "/" link below "/orders" in the markup.',
          isCorrect: false,
          explanation: 'Order of elements in the DOM does not affect route matching.',
        },
      ],
    },
  },
];

async function topicRow(c, slug) {
  const row = (await c.query('SELECT * FROM topics WHERE slug = $1', [slug])).rows[0];
  if (!row) throw new Error(`topic not found: ${slug}`);
  return row;
}

async function ensurePrimitiveShells(c, topic, slug) {
  let cmp = (await c.query('SELECT id FROM code_comparisons WHERE slug = $1', [slug])).rows[0];
  if (!cmp) {
    cmp = (await c.query(
      `INSERT INTO code_comparisons (slug, bad_code, good_code, related_topic_id, updated_at, created_at)
       VALUES ($1, '', '', $2, NOW(), NOW()) RETURNING id`, [slug, topic.id])).rows[0];
  }
  let dt = (await c.query('SELECT id FROM decision_trees WHERE slug = $1', [slug])).rows[0];
  if (!dt) {
    dt = (await c.query(
      `INSERT INTO decision_trees (slug, related_topic_id, updated_at, created_at)
       VALUES ($1, $2, NOW(), NOW()) RETURNING id`, [slug, topic.id])).rows[0];
  }
  let qz = (await c.query('SELECT id FROM quizzes WHERE slug = $1', [slug])).rows[0];
  if (!qz) {
    qz = (await c.query(
      `INSERT INTO quizzes (slug, related_topic_id, updated_at, created_at)
       VALUES ($1, $2, NOW(), NOW()) RETURNING id`, [slug, topic.id])).rows[0];
  }
  const opts = (await c.query(
    'SELECT id FROM quizzes_options WHERE _parent_id = $1 ORDER BY _order', [qz.id])).rows;
  if (opts.length === 0) {
    for (let i = 0; i < 4; i += 1) {
      await c.query(
        'INSERT INTO quizzes_options (_order, _parent_id, id, is_correct) VALUES ($1, $2, $3, false)',
        [i + 1, qz.id, newId()]);
    }
  }
  return { cmpId: cmp.id, dtId: dt.id, qzId: qz.id };
}

async function seedTopic(c, spec) {
  const { slug } = spec;
  const topic = await topicRow(c, slug);
  const ids = await ensurePrimitiveShells(c, topic, slug);

  if (spec.quickRefTs) {
    await c.query(
      'UPDATE topics SET quick_ref_ts_snippet = $1, quick_ref_js_snippet = $2, updated_at = NOW() WHERE id = $3',
      [spec.quickRefTs, spec.quickRefJs, topic.id]);
  }

  await c.query("DELETE FROM topics_timeline_steps WHERE _parent_id = $1 AND _locale = 'en'", [topic.id]);
  for (const s of spec.steps) {
    await c.query(
      `INSERT INTO topics_timeline_steps
        (_order,_parent_id,_locale,id,step_id,title,phase,dom_state,
         screen_content,active_action,closure_snapshot,explanation,highlight)
       VALUES ($1,$2,'en',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [s.order, topic.id, `${slug}-en-step-${s.stepId}`, s.stepId, s.title, s.phase,
        s.domState, s.screenContent, s.activeAction, s.closureSnapshot, s.explanation, s.highlight]);
  }

  await c.query("DELETE FROM topics_gotcha_radar WHERE _parent_id = $1 AND _locale = 'en'", [topic.id]);
  for (const g of spec.gotchas) {
    await c.query(
      `INSERT INTO topics_gotcha_radar
        (_order,_parent_id,_locale,id,title,subtitle,why,fix,design_pattern)
       VALUES ($1,$2,'en',$3,$4,$5,$6,$7,$8)`,
      [g.order, topic.id, `${slug}-en-gotcha-${g.order}`, g.title, g.subtitle, g.why, g.fix, g.designPattern]);
  }

  await c.query(
    'UPDATE code_comparisons SET bad_code = $1, good_code = $2, updated_at = NOW() WHERE id = $3',
    [spec.comparison.badCode, spec.comparison.goodCode, ids.cmpId]);
  await c.query("DELETE FROM code_comparisons_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.cmpId]);
  await c.query(
    `INSERT INTO code_comparisons_locales
      (_parent_id,_locale,title,subtitle,bad_label,bad_gotcha,good_label,good_reason,footer_note)
     VALUES ($1,'en',$2,$3,$4,$5,$6,$7,$8)`,
    [ids.cmpId, spec.comparison.title, spec.comparison.subtitle, spec.comparison.badLabel,
      spec.comparison.badGotcha, spec.comparison.goodLabel, spec.comparison.goodReason,
      spec.comparison.footerNote]);

  await c.query("DELETE FROM decision_trees_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.dtId]);
  await c.query(
    `INSERT INTO decision_trees_locales (_parent_id,_locale,title,subtitle,root_question,nodes)
     VALUES ($1,'en',$2,$3,$4,$5)`,
    [ids.dtId, spec.decisionTree.title, spec.decisionTree.subtitle,
      spec.decisionTree.rootQuestion, JSON.stringify(spec.decisionTree.nodes)]);

  await c.query('UPDATE quizzes SET code_snippet = $1, updated_at = NOW() WHERE id = $2',
    [spec.quiz.codeSnippet, ids.qzId]);
  await c.query("DELETE FROM quizzes_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.qzId]);
  await c.query(
    `INSERT INTO quizzes_locales (_parent_id,_locale,title,subtitle,question)
     VALUES ($1,'en',$2,$3,$4)`,
    [ids.qzId, spec.quiz.title, spec.quiz.subtitle, spec.quiz.question]);

  const opts = (await c.query(
    'SELECT id FROM quizzes_options WHERE _parent_id = $1 ORDER BY _order', [ids.qzId])).rows;
  if (opts.length !== spec.quiz.options.length) {
    throw new Error(`${slug}: ${opts.length} quiz option rows vs ${spec.quiz.options.length} in content`);
  }
  for (let i = 0; i < spec.quiz.options.length; i += 1) {
    const o = spec.quiz.options[i];
    await c.query('UPDATE quizzes_options SET is_correct = $1 WHERE id = $2', [o.isCorrect, opts[i].id]);
    await c.query("DELETE FROM quizzes_options_locales WHERE _parent_id = $1 AND _locale = 'en'", [opts[i].id]);
    await c.query(
      `INSERT INTO quizzes_options_locales (_parent_id,_locale,text,explanation)
       VALUES ($1,'en',$2,$3)`,
      [opts[i].id, o.text, o.explanation]);
  }

  return { slug, steps: spec.steps.length, gotchas: spec.gotchas.length };
}

async function main() {
  const c = new Client({ connectionString: DATABASE_URI });
  await c.connect();
  console.log('Connected.\n');
  try {
    for (const spec of TOPICS) {
      await c.query('BEGIN');
      const r = await seedTopic(c, spec);
      await c.query('COMMIT');
      console.log(`✓ ${r.slug}: ${r.steps} steps · ${r.gotchas} gotchas · comparison · tree · quiz`);
    }
    console.log('\nBatch G (composition & routing) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
