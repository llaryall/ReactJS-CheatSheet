// English interactive primitives for the data & isolation batch:
//   data-fetching-patterns · error-boundaries · portals
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
    slug: 'data-fetching-patterns',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Component Mounts and Renders Empty',
        phase: 'First Paint',
        domState: 'A skeleton occupies the content area',
        screenContent: 'The user sees a loading placeholder, not the data.',
        activeAction: 'A client-side fetch in useEffect has not started yet, because Effects run after the commit. The server sent HTML with no data in it.',
        closureSnapshot: 'html contains skeleton → data arrives later',
        explanation: 'In a client-fetched screen the user always pays for the round trip after hydration. That is a design choice, not a React limitation.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Waterfall Builds',
        phase: 'Network Waterfall',
        domState: 'Nested components start their own requests',
        screenContent: 'The skeleton stays for another beat as the child fetches fire.',
        activeAction: 'The parent fetches its data, renders a child, and the child then fetches its own. Each level waits for the one above it to finish rendering.',
        closureSnapshot: 'user → JS → parent fetch → child render → child fetch',
        explanation: 'This is the most expensive shape: latency multiplied by depth. The server data path collapses it into one level.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Same Data, Fetched Twice',
        phase: 'Duplicate Request',
        domState: 'Two identical requests in the network panel',
        screenContent: 'No visible difference — just a slower page.',
        activeAction: 'Two components independently request the same resource. With no shared cache, both go to the network and both settle separately.',
        closureSnapshot: 'GET /api/user/42 × 2',
        explanation: 'Deduplication is a cache feature. A raw useEffect fetch has no idea another component asked for the same thing.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. Server-First Removes Both Problems',
        phase: 'Server Render',
        domState: 'The HTML arrives with data already in it',
        screenContent: 'The content is visible on first paint.',
        activeAction: 'The async Server Component awaited the query before responding. There is no client fetch, no waterfall, and no second request.',
        closureSnapshot: 'server: await query() → streamed HTML with data',
        explanation: 'For data that is needed at first paint and does not change underneath the user, this is the shortest path that exists.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. Client Cache for Data That Changes',
        phase: 'Stale-While-Revalidate',
        domState: 'Cached content painted instantly',
        screenContent: 'The list appears immediately and refreshes quietly a moment later.',
        activeAction: 'A query library returns the cached value for this key, renders it, and revalidates in the background when staleTime expires.',
        closureSnapshot: 'cache hit → paint → background refetch',
        explanation: 'Two strategies, two kinds of data. Choosing one for both is where most fetching architecture goes wrong.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Fetching at First Paint in an Effect',
        subtitle: 'A thumbprint of server-first data rendered as an empty shell',
        why: 'Effects run after the commit, so a client fetch always starts after HTML has already been sent. Anything the user needs to see immediately ships as a skeleton first, then waits for JavaScript to download, parse and hydrate before the request even leaves. On a slow connection this is often the difference between a usable page and a blank one.',
        fix: 'Fetch server data on the server. If React Server Components are available, await the query in the component. Otherwise use a framework loader or getServerSideProps so the data is in the first response.',
        designPattern: 'Push Work Upstream: the earlier in the request lifecycle data is resolved, the fewer devices and round trips it depends on.',
      },
      {
        order: 2,
        title: 'A Fetch Per Nesting Level',
        subtitle: 'Total latency becomes the sum of the tree depth',
        why: 'When each component fetches in its own Effect, children cannot start until parents have rendered. Three nested levels means three sequential round trips, and on a 150ms connection the page takes 450ms longer than it has to. The requests themselves are not slow; their ordering is.',
        fix: 'Collect data requirements at the route level and fetch them in parallel, or use a query library that hoists and deduplicates. Start independent requests together rather than in sequence.',
        designPattern: 'Batch and Parallelize: latency is easier to reduce by removing serialization than by making each call faster.',
      },
      {
        order: 3,
        title: 'Using One Strategy for Every Kind of Data',
        subtitle: 'Server-rendering a live counter, client-fetching a static article',
        why: 'The two mistakes are symmetrical and both common: fetching user-specific live data on the server (so it is stale before hydration finishes and cannot be revalidated cheaply), and fetching static reference data on the client (so every visitor pays for a round trip to read a list that never changes). Each choice is reasonable in isolation and wrong for the other data.',
        fix: 'Choose per resource by lifetime. Needed at first paint and stable → server. Changes during the session → client cache with staleTime. Read once, no revalidation → a cached promise and use().',
        designPattern: 'Strategy (Dive Into Design Patterns): the fetching approach is an interchangeable algorithm selected by the data\'s characteristics, not by team habit.',
      },
    ],
    comparison: {
      title: 'Effect fetch with a waterfall vs. server-resolved data',
      subtitle: 'Same screen, two round trips vs. none after HTML',
      badLabel: 'Client fetch per component',
      badGotcha: 'The assistant writes a useEffect fetch in every component that needs data. The parent arrives, then the child fetches, then the grandchild. Three levels deep, the page is 400ms slower than it needs to be and nobody can see where the time went.',
      goodLabel: 'Resolved before the response',
      goodReason: 'The query completes on the server, so the HTML arrives complete. No waterfall, no loading state for content that was always going to be needed.',
      badCode: `// ❌ Three components, three sequential round trips
function Post({ id }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(\`/api/posts/\${id}\`).then((r) => r.json()).then(setPost);
  }, [id]);

  if (!post) return <Skeleton />;
  return (
    <>
      <Article post={post} />
      <Comments postId={post.id} />   {/* fetches again, after this render */}
    </>
  );
}`,
      goodCode: `// ✅ Data is resolved before anything is sent
async function Post({ id }: { id: string }) {
  const [post, comments] = await Promise.all([
    getPost(id),
    getComments(id),
  ]);

  return (
    <>
      <Article post={post} />
      <CommentList comments={comments} />
    </>
  );
}`,
      footerNote: 'If two requests do not depend on each other, the await between them is a bug you wrote.',
    },
    decisionTree: {
      title: 'Decision Tree: where should this data be fetched?',
      subtitle: 'Answer from the data lifetime, not from the tool you like',
      rootQuestion: 'When is this data needed, and does it change while the user is on the page?',
      nodes: {
        branchA: 'Needed for the first screen, and stable during the session',
        resultA: 'Fetch on the server. Async Server Component, loader, or an equivalent. No client round trip, no skeleton.',
        codeA: 'export default async function Page() { const post = await getPost(id); return <Article post={post} />; }',
        branchB: 'Needed at first paint but changes while the user is present',
        subQuestion: 'Does more than one component read the same resource?',
        yesLabel: 'Yes — a profile, a cart, a shared list',
        yesResult: 'A client cache with staleTime: shared, deduplicated, and revalidated in the background. TanStack Query or SWR.',
        codeYes: "const { data } = useQuery({ queryKey: ['cart'], queryFn: getCart, staleTime: 30_000 });",
        noLabel: 'No — a single value read once',
        noResult: 'Server fetch, or a cached promise read with use() if a promise already exists higher in the tree.',
        codeNo: 'const user = use(userPromise);',
      },
    },
    quiz: {
      title: 'Quiz: where does the extra 400ms come from?',
      subtitle: 'Not the network speed',
      codeSnippet: `function Parent() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/parent").then(r => r.json()).then(setData); }, []);
  return data ? <Child parentId={data.id} /> : <Skeleton />;
}

function Child({ parentId }) {
  const [child, setChild] = useState(null);
  useEffect(() => { fetch(\`/api/child/\${parentId}\`).then(r => r.json()).then(setChild); }, [parentId]);
  return child ? <GrandChild childId={child.id} /> : <Skeleton />;
}`,
      question: 'Each request takes ~150ms. The page takes noticeably longer than 300ms. Why?',
      options: [
        {
          text: 'Each fetch re-downloads the React runtime.',
          isCorrect: false,
          explanation: 'The runtime is loaded once. Fetches during the session do not reload it.',
        },
        {
          text: 'The requests are serialized by the component tree: the child cannot start until the parent has rendered with its data.',
          isCorrect: true,
          explanation: 'Correct. That is the waterfall. Total latency is the sum along the dependency chain, not the maximum of parallel requests.',
        },
        {
          text: 'useEffect runs twice in development, so every request is sent twice.',
          isCorrect: false,
          explanation: 'Strict Mode double-invocation happens in development only and would not explain the production behaviour described.',
        },
        {
          text: 'fetch has a fixed 150ms overhead per call.',
          isCorrect: false,
          explanation: 'The 150ms figure is the round trip in this scenario. There is no fixed per-call penalty on top of it.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'error-boundaries',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. A Child Throws During Render',
        phase: 'Render Error',
        domState: 'The tree below the boundary is unmounted',
        screenContent: 'The broken widget disappears and a fallback takes its place.',
        activeAction: 'A child component throws while rendering. React unwinds to the nearest error boundary above it rather than continuing to render the tree.',
        closureSnapshot: 'throw in <Chart /> → boundary catches → siblings survive',
        explanation: 'Without a boundary, an uncaught render error unmounts the entire root and the user gets a white page.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. static getDerivedStateFromError Runs',
        phase: 'State Update',
        domState: 'The fallback is about to render',
        screenContent: 'The user sees "Something went wrong" where the chart was.',
        activeAction: 'React calls the boundary\'s static getDerivedStateFromError, which returns { hasError: true } and schedules the fallback render.',
        closureSnapshot: 'boundaryState = { hasError: true }',
        explanation: 'This must be a pure static method. It runs during the render phase, so it cannot have side effects.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. componentDidCatch Reports It',
        phase: 'Commit Side Effect',
        domState: 'Fallback is painted',
        screenContent: 'The rest of the page keeps working.',
        activeAction: 'After the commit, componentDidCatch receives the error and the component stack, which is where logging and error reporting belong.',
        closureSnapshot: 'log(errorInfo.componentStack) → Sentry',
        explanation: 'Two methods, two phases: one decides what to render, the other reports. Mixing them is a common source of subtle bugs.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. An Event Handler Throws',
        phase: 'Event Error',
        domState: 'Nothing changes',
        screenContent: 'The button click does nothing; the fallback never appears.',
        activeAction: 'The throw happens inside an onClick handler. React is not rendering, so no boundary is involved — the error goes to the browser and disappears from the boundary\'s view.',
        closureSnapshot: 'throw in onClick → uncaught, boundary unaware',
        explanation: 'Boundaries catch render-phase errors. Event handlers, timers and promises are outside that scope entirely.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Boundary Needs a Reset Path',
        phase: 'Recovery',
        domState: 'Fallback still shown after the cause is fixed',
        screenContent: 'The user clicks Retry and the widget renders correctly.',
        activeAction: 'The fallback calls a reset function that clears hasError and bumps a key, so React mounts a fresh subtree instead of re-rendering the broken one.',
        closureSnapshot: 'reset() → hasError: false, key++ → remount',
        explanation: 'An error boundary is a latch. Once latched it stays that way until something resets it, and nothing resets it automatically.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Expected the Boundary to Catch Event Errors',
        subtitle: 'The fallback that never appears for the failures users actually hit',
        why: 'Error boundaries only catch errors thrown during render, in lifecycle methods, and in constructors of the tree below them. Errors thrown in event handlers, setTimeout callbacks, and promise rejections bypass them completely. In practice those are the majority of errors, so a boundary can be present, correctly placed, and still never fire.',
        fix: 'Use try/catch inside event handlers and convert async failures into state. For a global net, attach a window error and unhandledrejection listener alongside your boundaries.',
        designPattern: 'Scope of a Handler: a catch mechanism only intercepts the call path it wraps. React is not on the stack for an onClick, so it has nothing to catch.',
      },
      {
        order: 2,
        title: 'One Boundary at the Application Root',
        subtitle: 'A single broken widget takes down the entire interface',
        why: 'React unmounts everything below the boundary that catches. With one boundary at the root, a chart that throws on a malformed date removes the navigation, the user menu and any unsaved form state along with it. The user loses work because a decorative panel failed.',
        fix: 'Place boundaries around regions that can fail independently: each widget, each route section, each third-party embed. The granularity of recovery should match the granularity of failure.',
        designPattern: 'Bulkhead (Dive Into Design Patterns): partition the system so one failing compartment cannot sink the rest. A boundary is a bulkhead for the render tree.',
      },
      {
        order: 3,
        title: 'A Fallback With No Way Back',
        subtitle: 'A permanent error screen for a transient network failure',
        why: 'Once hasError is true, the boundary renders the fallback forever. If the failure was a timeout, the user is stuck looking at an error message with no retry — and the only recovery is a full page reload. This turns a recoverable blip into a lost session.',
        fix: 'Give every fallback a reset action. Clear hasError and change a key on the child so React mounts a fresh instance rather than resuming a broken one.',
        designPattern: 'Circuit Breaker: a tripped circuit must have a defined reset path, or the protection becomes the outage.',
      },
    ],
    comparison: {
      title: 'Root boundary vs. per-region boundaries',
      subtitle: 'The difference between losing a widget and losing the page',
      badLabel: 'One boundary for the whole app',
      badGotcha: 'The assistant wraps the app in a single ErrorBoundary with a full-page error screen. A chart that throws on one malformed timestamp replaces the whole interface, including the form the user was filling in.',
      goodLabel: 'Boundaries where failures actually happen',
      goodReason: 'Each risky region recovers on its own. The navigation, the form, and every other widget stay mounted while the broken panel shows its own fallback and retry.',
      badCode: `// ❌ One throw blanks the entire application
function App() {
  return (
    <ErrorBoundary fallback={<h1>Something went wrong</h1>}>
      <Header />
      <BookingForm />   {/* unsaved state lost */}
      <RevenueChart />  {/* throws */}
      <Footer />
    </ErrorBoundary>
  );
}`,
      goodCode: `// ✅ Failure is contained to the region that failed
function App() {
  return (
    <>
      <Header />
      <BookingForm />
      <ErrorBoundary fallback={<WidgetError label="revenue" />}>
        <RevenueChart />
      </ErrorBoundary>
      <Footer />
    </>
  );
}`,
      footerNote: 'If a widget failing would make the page unusable, that widget needs its own boundary.',
    },
    decisionTree: {
      title: 'Decision Tree: where do boundaries belong?',
      subtitle: 'Match the recovery scope to the failure scope',
      rootQuestion: 'If this region throws, what else should stay usable?',
      nodes: {
        branchA: 'The rest of the page — navigation, forms, sibling widgets',
        resultA: 'Wrap only the fragile region. Everything outside keeps its state and stays mounted.',
        codeA: '<ErrorBoundary fallback={<WidgetError />}><Chart /></ErrorBoundary>',
        branchB: 'Nothing useful remains — the whole route depends on this data',
        subQuestion: 'Is a retry likely to succeed?',
        yesLabel: 'Yes — the failure is probably transient',
        yesResult: 'A route-level boundary with a reset action. Give the user a way back without reloading.',
        codeYes: '<ErrorBoundary onReset={() => reset()} fallback={<RetryScreen />}>',
        noLabel: 'No — the route is permanently unusable for this user',
        noResult: 'A route boundary with a clear explanation and a link out. Do not offer a retry that cannot work.',
        codeNo: '<ErrorBoundary fallback={<NotFound />}>',
      },
    },
    quiz: {
      title: 'Quiz: why does the fallback never render?',
      subtitle: 'Read the throw site, not the tree',
      codeSnippet: `function Widget() {
  function handleClick() {
    throw new Error("boom");
  }
  return <button onClick={handleClick}>Click</button>;
}

function App() {
  return (
    <ErrorBoundary fallback={<p>Something broke</p>}>
      <Widget />
    </ErrorBoundary>
  );
}`,
      question: 'The button is clicked and the handler throws. What does the user see?',
      options: [
        {
          text: 'The fallback replaces the widget.',
          isCorrect: false,
          explanation: 'The throw happens outside React\'s render phase, so the boundary is never consulted.',
        },
        {
          text: 'Nothing changes — the error bypasses the boundary entirely and surfaces only in the console.',
          isCorrect: true,
          explanation: 'Correct. Boundaries catch render-phase errors. Event handler errors are ordinary JavaScript errors; wrapping the handler in try/catch is the fix.',
        },
        {
          text: 'The whole app unmounts to a white screen.',
          isCorrect: false,
          explanation: 'That is the behaviour for an uncaught render error with no boundary. A click-handler error is not a render error.',
        },
        {
          text: 'React re-renders the widget and retries the handler automatically.',
          isCorrect: false,
          explanation: 'React never replays user events. The handler ran once and threw.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'portals',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Modal Renders Inside the Component',
        phase: 'Create Portal',
        domState: 'A dialog element appears at document.body',
        screenContent: 'The modal covers the page with a backdrop.',
        activeAction: 'createPortal(children, document.body) renders the modal into a different DOM parent while leaving it in the same place in the React tree.',
        closureSnapshot: 'React tree: Card → Modal | DOM tree: body → <div role="dialog">',
        explanation: 'Two trees, two parents. The element is a child of the card in React and a child of body in the document.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Stacking Contexts Stop Mattering',
        phase: 'DOM Escape',
        domState: 'The modal sits above every sibling',
        screenContent: 'Nothing clips it; no z-index fight with the card header.',
        activeAction: 'Because the node is a direct child of body, it is not trapped inside an ancestor with overflow: hidden or a transform-based stacking context.',
        closureSnapshot: 'portal node is not clipped by ancestor overflow',
        explanation: 'This is the reason portals exist. A modal rendered inside a scrolling card will always be clipped by that card.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Props and Context Still Flow',
        phase: 'React Tree Intact',
        domState: 'Unchanged',
        screenContent: 'The modal reads the same theme as the card around it.',
        activeAction: 'The portal does not cut the React tree. Context providers above the component still reach the portal content, and props still pass normally.',
        closureSnapshot: 'context from <Card /> reaches portal children',
        explanation: 'Only the DOM parent changed. Everything React manages — context, props, event routing — is unchanged.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. A Click Inside Bubbles to the Card',
        phase: 'Event Bubbling Trap',
        domState: 'The card behind the modal also reacts',
        screenContent: 'Clicking a button inside the modal opens the card behind it.',
        activeAction: 'React synthesizes events along the component tree, not the DOM tree. A click inside the portal bubbles to the card\'s onClick even though the DOM nodes are in different parents.',
        closureSnapshot: 'click in portal → bubbles to Card onClick → unintended action',
        explanation: 'This surprises almost everyone once. The DOM says they are unrelated; React says they are parent and child.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. Stopping the Bubble at the Modal Edge',
        phase: 'Containment',
        domState: 'Only the modal reacts',
        screenContent: 'The modal behaves like the separate surface it appears to be.',
        activeAction: 'A handler on the modal container calls e.stopPropagation(), ending the synthetic event before it reaches the card.',
        closureSnapshot: 'e.stopPropagation() at the dialog boundary',
        explanation: 'One line restores the behaviour the DOM layout implied. The visual and the event model now agree.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Event Bubbling Through the Component Tree',
        subtitle: 'A modal that also triggers the row it opened from',
        why: 'React routes synthetic events along the React tree, and a portal keeps its original position there. A click on a modal button therefore bubbles to the onClick of the card that rendered the modal — even though in the DOM they are siblings under body. The action fires twice: once for the modal, once for the card behind it.',
        fix: 'Call e.stopPropagation() on the modal container or on the specific interactive elements. Alternatively attach the risky parent handler with a check for the event target.',
        designPattern: 'Two Trees, One Routing Table: the DOM decides layout, React decides event flow. Portals change only the first.',
      },
      {
        order: 2,
        title: 'A Portal Without Focus Management',
        subtitle: 'A dialog that looks modal and lets keyboard users tab out of it',
        why: 'A portal changes where the node lives in the DOM. It does not add a focus trap, an Escape handler, or inert background content. Keyboard and screen-reader users navigate a dialog that is visually blocking but functionally not, and Tab lands on links behind the overlay.',
        fix: 'Use the native <dialog> element with showModal(), or a tested headless primitive (Radix, React Aria) that implements focus trapping, restoration and Escape handling.',
        designPattern: 'Adapter (Dive Into Design Patterns): the portal adapts where content renders; accessibility behaviour is a separate concern that must be supplied by the primitive.',
      },
      {
        order: 3,
        title: 'Rendering Into a Target That Does Not Exist Yet',
        subtitle: 'A crash on first render that disappears after a refresh',
        why: 'createPortal needs a real DOM node. If the target is queried during render, or created in an Effect that has not run, or lives in a Server Component render, the node is null and the call throws. The failure is timing-dependent, which makes it look intermittent.',
        fix: 'Create the target once in an Effect, or use a document.body fallback, and render the portal only after mount. Guard with a mounted flag so the first paint does not reference a node that does not exist.',
        designPattern: 'Lazy Initialization: obtain the resource when it is guaranteed to exist, not when the code first needs to mention it.',
      },
    ],
    comparison: {
      title: 'Inline modal vs. portal with contained events',
      subtitle: 'Why the same JSX behaves differently under a scrolling card',
      badLabel: 'Modal rendered in place',
      badGotcha: 'The assistant renders a modal inside a table row. It works in the demo, then ships and gets clipped by the row\'s overflow, and clicks inside it also fire the row\'s onClick.',
      goodLabel: 'Portal to body, events stopped at the dialog',
      goodReason: 'The node escapes overflow and stacking contexts, while the component tree stays intact for context. stopPropagation keeps the row handler out of the click.',
      badCode: `// ❌ Clipped by the row, and clicks leak to it
function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  return (
    <tr onClick={() => select(order)}>
      <td>{order.id}</td>
      {open && (
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </tr>
  );
}`,
      goodCode: `// ✅ Escapes the row visually, keeps the React tree
import { createPortal } from "react-dom";

function OrderRow({ order }) {
  const [open, setOpen] = useState(false);
  return (
    <tr onClick={() => select(order)}>
      <td>{order.id}</td>
      {open &&
        createPortal(
          <div role="dialog" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>,
          document.body,
        )}
    </tr>
  );
}`,
      footerNote: 'A portal fixes clipping. It does not fix focus, and it does not fix the event path — surprise, the DOM parent is now different.',
    },
    decisionTree: {
      title: 'Decision Tree: does this need a portal?',
      subtitle: 'Ask what is clipping it, and what is listening to it',
      rootQuestion: 'Is the overlay being clipped or stacked incorrectly by its ancestors?',
      nodes: {
        branchA: 'Yes — a modal, tooltip or dropdown inside an overflow or transform ancestor',
        resultA: 'Portal to document.body. The node escapes the stacking context; context and props still flow through the React tree.',
        codeA: 'createPortal(<Dialog />, document.body)',
        branchB: 'No — the element lays out correctly where it is',
        subQuestion: 'Does an ancestor have a click handler that would fire on this element?',
        yesLabel: 'Yes — a row or card that opens the overlay',
        yesResult: 'Keep it inline and stop propagation, or portal it and still stop propagation. The event path follows the component tree either way.',
        codeYes: 'onClick={(e) => e.stopPropagation()}',
        noLabel: 'No — it is self-contained',
        noResult: 'No portal needed. A portal is a DOM placement tool, not a modal ingredient.',
        codeNo: '{open && <Dialog onClose={close} />}',
      },
    },
    quiz: {
      title: 'Quiz: why does clicking the modal button also open the editor?',
      subtitle: 'Follow the React tree, not the DOM',
      codeSnippet: `function Row({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => console.log("row clicked")}>
      <button onClick={() => setOpen(true)}>Edit</button>
      {open &&
        createPortal(
          <div>
            <button onClick={() => console.log("save")}>Save</button>
          </div>,
          document.body,
        )}
    </div>
  );
}`,
      question: 'Clicking "Save" logs both "save" and "row clicked". Why?',
      options: [
        {
          text: 'The portal is rendered inside the row in the DOM.',
          isCorrect: false,
          explanation: 'The portal node is a child of document.body in the DOM. That is precisely why the behaviour is surprising.',
        },
        {
          text: 'React bubbles synthetic events along the component tree, and the portal keeps its original position there — so the click reaches the row\'s handler.',
          isCorrect: true,
          explanation: 'Correct. Portal content stays a React child of Row. React\'s event system walks that tree, not the DOM tree.',
        },
        {
          text: 'createPortal forwards events to the DOM parent explicitly.',
          isCorrect: false,
          explanation: 'No forwarding is involved. The React tree never changed, so no forwarding is needed.',
        },
        {
          text: 'The click handler runs twice because of Strict Mode.',
          isCorrect: false,
          explanation: 'Strict Mode affects effects and render, not how many handlers a single event invokes.',
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
    console.log('\nBatch F (data & isolation) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
