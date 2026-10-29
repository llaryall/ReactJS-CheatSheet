// English interactive primitives for the rendering-scale batch:
//   fiber-architecture · code-splitting-lazy-suspense · virtualization-large-lists
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
    slug: 'fiber-architecture',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. A Fiber Node per Component Instance',
        phase: 'Fiber Tree Built',
        domState: 'The previous frame is still on screen',
        screenContent: 'Nothing has changed visually.',
        activeAction: 'Each rendered component gets a fiber: a plain JavaScript object holding the type, pending props, memoized state, and three pointers — child, sibling, return.',
        closureSnapshot: 'fiber = { type, pendingProps, memoizedState, child, sibling, return }',
        explanation: 'The fiber is the unit of work. Everything else in this architecture follows from that one decision.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Work Is Traversed, Not Recursed',
        phase: 'Begin Work',
        domState: 'Unchanged',
        screenContent: 'Unchanged.',
        activeAction: 'React walks the fiber tree with a loop, following child pointers down and sibling pointers across. At any point it holds a cursor and can stop.',
        closureSnapshot: 'cursor = fiber | next = fiber.child ?? fiber.sibling',
        explanation: 'The old stack reconciler used the JavaScript call stack, which cannot be paused. A linked list can be paused between any two nodes.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Interrupt',
        phase: 'Yield to Main Thread',
        domState: 'A keystroke is processed immediately',
        screenContent: 'The user types and the character appears without waiting for the filter to finish.',
        activeAction: 'React yields after a slice of work — roughly five milliseconds — to let the browser handle input and paint, then resumes from the saved cursor.',
        closureSnapshot: 'workInProgress paused at fiber#4821 | input handled',
        explanation: 'This is the mechanism behind "interruptible rendering". The work is not faster; it is divisible.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. Lanes Decide What Comes First',
        phase: 'Priority Scheduling',
        domState: 'Typing stays responsive while filtering continues',
        screenContent: 'The input updates instantly; the list updates a moment later.',
        activeAction: 'Updates carry lane bits. Input is on a higher-priority lane than a transition, so React abandons and re-does the low-priority render instead of blocking.',
        closureSnapshot: 'lane(input) > lane(transition) → transition render restarted',
        explanation: 'Concurrency here means re-doing work on purpose. That is why the render function has to be pure — it may run more than once.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Blocking the Scheduler Itself',
        phase: 'Main Thread Lock',
        domState: 'The page freezes',
        screenContent: 'The cursor stops blinking for over a second.',
        activeAction: 'A synchronous loop of 400ms runs in render. Fiber can pause between components, but it cannot pause inside a single function call — the JS thread is gone until it returns.',
        closureSnapshot: 'one component → 400ms of uninterruptible JS',
        explanation: 'Interruptibility is per-fiber. A slow component is a slow fiber, and no scheduler can slice what it cannot enter.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Thinking Fiber Makes Slow Code Fast',
        subtitle: 'A 400ms synchronous loop is 400ms no matter which scheduler runs it',
        why: 'Fiber gives React the ability to pause between units of work. It cannot pause inside a function that is currently executing. A heavy filter, a deep JSON.parse, or a regex over a large string blocks the main thread exactly as it would without React, and every promise of concurrency evaporates for that duration.',
        fix: 'Keep per-component render work small. Move genuinely expensive computation into a transition, into a worker, or behind useDeferredValue so that a low-priority render can be abandoned when input arrives.',
        designPattern: 'Cooperative Multitasking: the scheduler can only yield at points it controls. A task that never yields is a task that owns the thread.',
      },
      {
        order: 2,
        title: 'Using Concurrency as a Substitute for Architecture',
        subtitle: 'Wrapping every update in startTransition and calling it done',
        why: 'startTransition marks an update as interruptible, but it does not reduce the work — React still renders the full tree, possibly several times if it keeps getting interrupted. If the underlying component is expensive, deferring it moves the cost around instead of removing it, and the profiler still shows long tasks.',
        fix: 'Measure first. Concurrency buys responsiveness on work that must happen. It cannot fix a component that renders 10,000 rows, because rendering 10,000 rows is the problem.',
        designPattern: 'Scheduling Versus Algorithm: a better scheduler improves latency; only a better algorithm improves throughput. These are different problems with different fixes.',
      },
      {
        order: 3,
        title: 'Assuming Render Runs Exactly Once',
        subtitle: 'A side effect in render fires twice, or not at all',
        why: 'An interruptible render can be started, abandoned and restarted. Code in the render body that mutates a module-level counter, writes to a ref, or fires an analytics call will run an unpredictable number of times. In development Strict Mode the double-invocation makes this visible; in production it just produces silently wrong counts.',
        fix: 'Keep the render body pure. Side effects belong in event handlers or Effects. If a value must be computed once, useMemo or a ref — not a mutation in the render body.',
        designPattern: 'Idempotence: a function that may run any number of times must produce the same result each time. That is the contract concurrency requires of your render.',
      },
    ],
    comparison: {
      title: 'Blocking work in render vs. deferring it',
      subtitle: 'The scheduler can only help if you give it something to interrupt',
      badLabel: 'A synchronous scan in the component body',
      badGotcha: 'The assistant filters 50,000 rows inside the component body and calls it a search feature. Typing freezes the input for a third of a second on every keystroke, because the render cannot be interrupted mid-function.',
      goodLabel: 'The same filter, marked as low priority',
      goodReason: 'The expensive render runs in a transition. React can abandon it the moment a keystroke arrives, so the input never waits behind the filter.',
      badCode: `// ❌ One uninterruptible 340ms call per keystroke
function SearchResults({ rows, query }) {
  const matches = rows.filter((row) => {
    // 🚨 heavy per-row work inline in render
    return expensiveMatch(row.text, query);
  });

  return <List items={matches} />;
}`,
      goodCode: `// ✅ Interruptible: input first, filtering after
function SearchResults({ rows, query }) {
  const deferredQuery = useDeferredValue(query);

  const matches = useMemo(
    () => rows.filter((row) => expensiveMatch(row.text, deferredQuery)),
    [rows, deferredQuery],
  );

  const isStale = deferredQuery !== query;
  return <List items={matches} style={{ opacity: isStale ? 0.6 : 1 }} />;
}`,
      footerNote: 'The list still takes the same time. What changed is who waits for it.',
    },
    decisionTree: {
      title: 'Decision Tree: is this update worth deferring?',
      subtitle: 'Concurrency helps only when the work is real but not urgent',
      rootQuestion: 'Does this update block typing, scrolling or clicking while it runs?',
      nodes: {
        branchA: 'Yes — and the result is a large list, chart or derived computation',
        subQuestion: 'Would showing a slightly stale result briefly be acceptable?',
        yesLabel: 'Yes — the old results are better than a frozen input',
        yesResult: 'useDeferredValue. React renders the urgent update first and the stale render is abandoned if input arrives.',
        codeYes: 'const deferred = useDeferredValue(query);',
        noLabel: 'No — every frame must show current data',
        noResult: 'Do the work outside render: a worker, a server call, or a structure that makes the computation cheap. No amount of scheduling fixes a required synchronous cost.',
        codeNo: 'const matches = await worker.filter(rows, query);',
        branchB: 'No — typing already feels responsive',
        resultA: 'Do not add a transition. Concurrency is a tool for a measured problem, and it does not make the render itself cheaper.',
        codeA: 'const matches = useMemo(() => filter(rows, query), [rows, query]);',
      },
    },
    quiz: {
      title: 'Quiz: why does the input still freeze?',
      subtitle: 'The gap between "interruptible" and "sliced"',
      codeSnippet: `function Results({ rows, query }) {
  const matches = rows.filter((row) => heavyCompare(row.text, query));
  return <List items={matches} />;
}`,
      question: 'This render takes 340ms. React 18+ renders concurrently. Why does typing still lag?',
      options: [
        {
          text: 'Concurrent rendering is opt-in and is off by default.',
          isCorrect: false,
          explanation: 'Concurrent rendering is the default in React 18+ for createRoot. Nothing needs to be enabled.',
        },
        {
          text: 'Fiber can pause between components, but not inside a single function. The 340ms filter is one uninterruptible unit of work.',
          isCorrect: true,
          explanation: 'Correct. Time slicing yields at fiber boundaries. A synchronous call inside one component blocks the thread until it returns.',
        },
        {
          text: 'The List component needs to be wrapped in Suspense.',
          isCorrect: false,
          explanation: 'Suspense handles suspended resources, not CPU time. It will not preempt a running loop.',
        },
        {
          text: 'rows.filter is asynchronous and resolves after paint.',
          isCorrect: false,
          explanation: 'Array.prototype.filter is synchronous. The main thread is occupied for the whole duration.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'code-splitting-lazy-suspense',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Bundle Before Splitting',
        phase: 'Single Chunk',
        domState: 'The app cannot render anything yet',
        screenContent: 'A blank screen while the browser downloads one 1.2MB file.',
        activeAction: 'Every route, modal and chart library ships in the initial chunk. First paint waits on bytes the landing page will never use.',
        closureSnapshot: 'main.js: 1.2MB → parsed before first render',
        explanation: 'The cost is not only download. Parsing and executing a megabyte of JavaScript delays interactivity on the devices that can least afford it.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. lazy Turns a Module Into a Boundary',
        phase: 'Split Point',
        domState: 'The shell renders immediately',
        screenContent: 'The header and navigation appear right away.',
        activeAction: 'React.lazy(() => import("./Reports")) tells the bundler to emit a separate chunk. The import is only requested when the component is first rendered.',
        closureSnapshot: 'Reports → reports.4f2a.js (requested on demand)',
        explanation: 'The split lives at the import, not at the route. Anything you can defer rendering is a candidate.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Suspense Catches the Pending Module',
        phase: 'Suspending',
        domState: 'A skeleton occupies the reports area',
        screenContent: 'The rest of the page stays usable while the chunk downloads.',
        activeAction: 'While the module is in flight, the lazy component throws a promise. The nearest Suspense boundary above it catches that and renders its fallback.',
        closureSnapshot: 'status: pending → fallback rendered in place',
        explanation: 'The boundary determines the blast radius. Where you place it decides how much of the screen disappears.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Global Fallback Trap',
        phase: 'Boundary Scope Trap',
        domState: 'The entire page is replaced',
        screenContent: 'Navigating to Reports blanks the header, sidebar and everything else.',
        activeAction: 'A single Suspense boundary at the application root catches the suspension, so one lazy child hides the whole tree.',
        closureSnapshot: 'root boundary → full-app fallback',
        explanation: 'This is the most common code-splitting bug: the split worked, the boundary placement undid it.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. Per-Route Boundaries Restore the Shell',
        phase: 'Scoped Fallback',
        domState: 'Only the content area shows a skeleton',
        screenContent: 'Navigation stays interactive while the chunk loads.',
        activeAction: 'A Suspense boundary placed around the route content replaces just that segment. The user keeps their bearings.',
        closureSnapshot: 'route boundary → skeleton in content area only',
        explanation: 'One boundary per lazy region. The fallback should occupy the space the real content will take.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'The Global Suspense Boundary',
        subtitle: 'Code splitting is configured correctly and the app still flashes blank',
        why: 'A Suspense boundary at the root catches every suspension below it. Any lazy route blanks the entire interface, including navigation the user was about to use. The network is doing exactly what you configured; the boundary is hiding far more than it needs to.',
        fix: 'Place a boundary per route or per lazy region. Put the fallback where the content will land so the layout does not jump when the chunk arrives.',
        designPattern: 'Blast Radius: the cost of a failure is determined by the scope that catches it. Narrowing the catcher narrows the damage.',
      },
      {
        order: 2,
        title: 'lazy() Called Inside the Component',
        subtitle: 'A fresh lazy component on every render, and a fallback that never leaves',
        why: 'React.lazy must be called at module scope. Calling it inside a component creates a new lazy component type on every render, so React unmounts and remounts — and in some paths re-suspends — on each pass. The result is a skeleton that flickers and local state that resets.',
        fix: 'Hoist every lazy() call to the top of the file. The component identity must be stable for React to keep the resolved module.',
        designPattern: 'Stable Identity: a component type is a key in reconciliation. Recreate it and you have created a different component.',
      },
      {
        order: 3,
        title: 'Splitting What Is Always Needed',
        subtitle: 'An extra round trip on the critical path',
        why: 'Turning the main layout, a button, or the authentication guard into a lazy chunk adds a request before first meaningful paint, on every visit. The bundle got smaller on paper and the page got slower in practice, because the split moved bytes off the critical path and put a network round trip in their place.',
        fix: 'Split by route or by genuinely deferred UI — modals, settings panels, heavy chart libraries. Anything needed on first paint should stay in the initial chunk.',
        designPattern: 'Critical Path: the only measure that matters is what must arrive before the user can act. Moving work off it helps; adding round trips to it hurts.',
      },
    ],
    comparison: {
      title: 'One root boundary vs. per-route boundaries',
      subtitle: 'The same lazy import, a completely different navigation experience',
      badLabel: 'Global Suspense',
      badGotcha: 'The assistant wraps the whole app in a single Suspense with a centered spinner. Every navigation to a lazy route blanks the chrome, the sidebar and the tabs the user was navigating from.',
      goodLabel: 'Boundary at the route content',
      goodReason: 'The shell never unmounts. Only the region that is actually waiting shows a fallback, and it occupies the same space as the content.',
      badCode: `// ❌ One boundary swallows every navigation
function App() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Header />
      <Sidebar />
      <Routes />
    </Suspense>
  );
}`,
      goodCode: `// ✅ Boundaries scoped to what actually waits
const Reports = lazy(() => import("./routes/Reports"));

function App() {
  return (
    <>
      <Header />
      <Sidebar />
      <main>
        <Suspense fallback={<ReportsSkeleton />}>
          <Routes />
        </Suspense>
      </main>
    </>
  );
}`,
      footerNote: 'The fallback should be the shape of what is coming, not a spinner in the middle of nowhere.',
    },
    decisionTree: {
      title: 'Decision Tree: should this module be split out?',
      subtitle: 'Ask when the code is needed, not how large it is',
      rootQuestion: 'Is this code needed for the first screen the user sees?',
      nodes: {
        branchA: 'No — it is behind a route, a tab, a modal or a click',
        subQuestion: 'Is the module large enough that a separate request is worth it?',
        yesLabel: 'Yes — a charting library, an editor, a heavy form',
        yesResult: 'lazy at module scope, Suspense at the region, fallback shaped like the content.',
        codeYes: 'const Editor = lazy(() => import("./Editor"));',
        noLabel: 'No — it is small and the extra request would cost more than the bytes',
        noResult: 'Leave it in the main bundle. A split that saves 4KB and adds a round trip is a net loss.',
        codeNo: 'import { Badge } from "./Badge";',
        branchB: 'Yes — layout, navigation, auth guard, anything needed to render the first frame',
        resultA: 'Keep it in the initial bundle. Splitting critical-path code delays interactivity for everyone to help nobody.',
        codeA: 'import { Header } from "./Header";',
      },
    },
    quiz: {
      title: 'Quiz: why does the whole page go blank on navigation?',
      subtitle: 'Find the boundary, not the import',
      codeSnippet: `const Reports = lazy(() => import("./Reports"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Header />
      <Sidebar />
      <main><Reports /></main>
    </Suspense>
  );
}`,
      question: 'Navigating to Reports blanks the header and sidebar too. What is the fix?',
      options: [
        {
          text: 'Move lazy() inside the App component.',
          isCorrect: false,
          explanation: 'That makes it worse: a new component type on every render, causing remounts and repeated suspense.',
        },
        {
          text: 'Move the Suspense boundary inside <main> so only the content area falls back.',
          isCorrect: true,
          explanation: 'Correct. The root boundary catches the suspension and replaces everything below it. Narrowing the boundary narrows what disappears.',
        },
        {
          text: 'Remove Suspense entirely — lazy works without it.',
          isCorrect: false,
          explanation: 'A lazy component with no boundary above it throws and reaches the nearest error boundary. Suspense is required.',
        },
        {
          text: 'Add a key to the Reports component.',
          isCorrect: false,
          explanation: 'A key changes reconciliation identity. It has no effect on which boundary catches a suspended child.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'virtualization-large-lists',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. Ten Thousand Rows, Ten Thousand Nodes',
        phase: 'Naive Render',
        domState: 'The browser holds 10,000 elements',
        screenContent: 'The list takes a second to appear and scrolling stutters.',
        activeAction: 'Array.map produces a row element for every record. React builds a fiber for each one and the browser lays out all of them, including the 9,970 off-screen.',
        closureSnapshot: 'fibers = 10,000 | DOM nodes = 10,000 | visible ≈ 30',
        explanation: 'Nothing about this code is wrong. It is the correct expression of the wrong architecture for this data size.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Container Keeps the Full Height',
        phase: 'Scroll Geometry',
        domState: 'The scrollbar reflects the real dataset',
        screenContent: 'The thumb is small, accurately representing ten thousand rows.',
        activeAction: 'A spacer element is sized to rows.length × rowHeight. The scrollable area describes the whole dataset even though most rows do not exist.',
        closureSnapshot: 'containerHeight = 10,000 × 44px = 440,000px',
        explanation: 'Without this, the scrollbar would shrink to the rendered window and the list would feel like it ends after one screen.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Only the Visible Window Renders',
        phase: 'Windowing',
        domState: 'About 15 nodes, absolutely positioned',
        screenContent: 'The same rows are visible; the page is instantly responsive.',
        activeAction: 'Scroll position divided by row height gives the first visible index. Only that index range plus an overscan margin is rendered.',
        closureSnapshot: 'start = floor(scrollTop / 44) - 5 | end = start + 20',
        explanation: 'DOM size is now a function of the viewport, not the dataset. Ten thousand rows and ten rows cost the same.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. Scrolling Swaps the Window',
        phase: 'Recycle',
        domState: 'Different rows, same node count',
        screenContent: 'Scrolling is smooth; content changes as expected.',
        activeAction: 'Each scroll event recomputes the index range and re-renders the window. The node count stays constant while the data underneath moves.',
        closureSnapshot: 'rendered rows: 8–27 → 14–33 (still 20 nodes)',
        explanation: 'This is why virtualization scales: the cost is bounded by the viewport rather than by the dataset.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Unstable Keys Break Recycling',
        phase: 'Identity Churn',
        domState: 'Rows remount on every scroll step',
        screenContent: 'Images flicker and inputs lose focus while scrolling.',
        activeAction: 'Using the array index as key means row 0 is a different record at every scroll position. React tears down and recreates nodes instead of moving them.',
        closureSnapshot: 'key=0 → "Alice" then "Bob" → remount, not update',
        explanation: 'Virtualization relies on identity to recycle. An index key gives every record a new identity each time the window moves.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Rendering Every Row',
        subtitle: 'The list that works in development with twelve records',
        why: 'Array.map over the full dataset creates a fiber and a DOM node per record. At a few hundred rows this is invisible. At ten thousand it produces a multi-second first render, heavy memory use, and layout work on every update — and the code is identical in both cases, which is why it survives review.',
        fix: 'Virtualize once the list can exceed a few hundred rows. Render the visible window plus a small overscan. Reach for react-window, TanStack Virtual, or framework equivalents.',
        designPattern: 'Flyweight with recycling (Dive Into Design Patterns): a fixed pool of rendered rows is reused as the viewport moves. The number of live objects is bounded by the screen, not the data.',
      },
      {
        order: 2,
        title: 'Index as Key',
        subtitle: 'Every scroll position reassigns identity to every record',
        why: 'A virtualized list moves the window, so index 0 holds a different record after each scroll. With index keys, React sees the same key with different content and updates in place — which breaks focus, resets uncontrolled inputs, and restarts image loads. It looks like the list is re-rendering everything, because from React\'s perspective the identity of every row changed.',
        fix: 'Key each row by a stable entity id from the data. The key must identify the record, not its position on the current screen.',
        designPattern: 'Identity Map: identity belongs to the entity. Position is a rendering detail that changes every time the user scrolls.',
      },
      {
        order: 3,
        title: 'Variable Heights Without Measurement',
        subtitle: 'Rows overlap, gaps appear, and the scrollbar lies',
        why: 'Fixed-height virtualization assumes every row is the same height. With wrapped text, expanded items, or images, the math that maps scrollTop to an index is wrong. Rows overlap or leave gaps, and the scrollbar thumb represents a height that does not exist.',
        fix: 'Measure rows as they mount and maintain a cumulative offset table, which is what dynamic-size virtualizers do. Or constrain rows to a fixed height so the arithmetic is exact.',
        designPattern: 'Measure-Then-Layout: the geometry must come from reality, not from an assumption baked into the index math.',
      },
    ],
    comparison: {
      title: 'map over everything vs. a virtualized window',
      subtitle: 'Which one stays responsive at ten thousand rows',
      badLabel: 'Every row is a DOM node',
      badGotcha: 'The assistant writes a beautiful rows.map with correct keys and sorting. It passes review because the fixtures have ten rows. Production loads ten thousand and the tab allocates a gigabyte.',
      goodLabel: 'Only the visible window exists',
      goodReason: 'The DOM is bounded by the viewport. The container carries the full height so the scrollbar stays honest, and each row keeps its entity key so recycling preserves identity.',
      badCode: `// ❌ Cost grows with the dataset
function Transcript({ lines }) {
  return (
    <div className="h-[600px] overflow-y-auto">
      {lines.map((line) => (
        <p key={line.id} className="h-11">{line.text}</p>
      ))}
    </div>
  );
}`,
      goodCode: `// ✅ Cost grows with the viewport
import { FixedSizeList } from "react-window";

function Transcript({ lines }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={lines.length}
      itemSize={44}
      width="100%"
    >
      {({ index, style }) => (
        <p style={style} key={lines[index].id}>
          {lines[index].text}
        </p>
      )}
    </FixedSizeList>
  );
}`,
      footerNote: 'The scrollbar should still tell the truth. Virtualization hides rows, not the size of the dataset.',
    },
    decisionTree: {
      title: 'Decision Tree: does this list need virtualization?',
      subtitle: 'Answer with a number, not a feeling',
      rootQuestion: 'How many rows can this list contain in the worst real case?',
      nodes: {
        branchA: 'A few hundred at most, and it is paginated anyway',
        resultA: 'Render them. Virtualization adds measurement, scroll math and keyboard-navigation complexity for no gain.',
        codeA: '{rows.map((row) => <Row key={row.id} row={row} />)}',
        branchB: 'Thousands, or unbounded — logs, transcripts, search results, data tables',
        subQuestion: 'Are row heights fixed and known?',
        yesLabel: 'Yes — uniform rows',
        yesResult: 'Fixed-size virtualization. The index math is exact and no measurement is needed.',
        codeYes: '<FixedSizeList itemSize={44} itemCount={rows.length} />',
        noLabel: 'No — wrapped text, images, expandable rows',
        noResult: 'Dynamic virtualization with measured offsets, or constrain the row height so the math becomes exact.',
        codeNo: '<VariableSizeList itemSize={(i) => heights[i] ?? 60} itemCount={rows.length} />',
      },
    },
    quiz: {
      title: 'Quiz: why do rows flicker while scrolling?',
      subtitle: 'Identity is the thing being recycled',
      codeSnippet: `{rows.map((row, index) => (
  <Row key={index} data={rows[index]} />
))}`,
      question: 'In a virtualized list, scrolling causes focus loss and image reloads. What is the cause?',
      options: [
        {
          text: 'The overscan value is too low.',
          isCorrect: false,
          explanation: 'Overscan affects how many extra rows render. It does not change whether React treats a row as the same component.',
        },
        {
          text: 'Index keys give each record a new identity as the window moves, so React remounts instead of updating.',
          isCorrect: true,
          explanation: 'Correct. The key is React\'s identity for the row. With the window sliding, index 0 holds a different record, so identity churns and every recycled row is a new component.',
        },
        {
          text: 'Virtualized lists cannot render images.',
          isCorrect: false,
          explanation: 'They can. Images reload here because the components remount, which discards the loaded resource.',
        },
        {
          text: 'The list needs React.memo on every row.',
          isCorrect: false,
          explanation: 'memo would skip re-renders, but the problem is remounting caused by identity churn — memo cannot prevent an unmount.',
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
    console.log('\nBatch D (rendering at scale) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
