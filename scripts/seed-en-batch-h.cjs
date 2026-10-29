// English interactive primitives for the routing-data batch:
//   protected-routes · scroll-restoration · route-loaders-actions
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
    slug: 'protected-routes',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. Navigation Begins, Loader Runs First',
        phase: 'Loader Execution',
        domState: 'The previous page is still visible',
        screenContent: 'The user clicks "Billing" and nothing appears to happen yet.',
        activeAction: 'The data router resolves the route and runs its loader before rendering anything. Loaders run before the component exists.',
        closureSnapshot: 'loader({ request }) → starts before any render',
        explanation: 'This is the whole advantage. The authorization decision happens before the protected component is even created.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. No Session — the Loader Throws',
        phase: 'Guard',
        domState: 'No protected UI was mounted at any point',
        screenContent: 'The user is taken to the login screen.',
        activeAction: 'The loader finds no session and throws redirect("/login"). The router treats the thrown response as a navigation instruction.',
        closureSnapshot: 'throw redirect("/login") → router intercepts',
        explanation: 'Throwing is the contract. A thrown Response is control flow; a returned Response is data.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Return Trap',
        phase: 'Silent Failure',
        domState: 'The URL never changes',
        screenContent: 'A blank area where the billing page should be.',
        activeAction: 'The loader returned redirect("/login") instead of throwing it. The router sees a successful loader result and renders the component with a Response object as its data.',
        closureSnapshot: 'loader resolved with Response → no navigation',
        explanation: 'Nothing errored, nothing logged, and the URL stayed on the protected route. This is the most common bug in this pattern.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Return-To Parameter',
        phase: 'Post-Login Redirect',
        domState: 'Login screen with a destination remembered',
        screenContent: 'After signing in, the user lands on the billing page they originally wanted.',
        activeAction: 'The redirect includes ?redirectTo=/billing, and the login action validates that the value is a relative path before navigating to it.',
        closureSnapshot: 'redirectTo = "/billing" → validated → navigate',
        explanation: 'Preserving the destination is a UX win. Trusting it blindly is an open redirect, which is why the validation step is not optional.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. Authorization Inside the Loader',
        phase: 'Server Check',
        domState: 'Unchanged — this happens before any response',
        screenContent: 'The user sees the billing page only if they own the account.',
        activeAction: 'The loader also checks that the session user owns the accountId in the URL, and throws a 403 for a valid session on someone else\'s record.',
        closureSnapshot: 'session.user.id !== params.accountId → throw 403',
        explanation: 'Authentication asks who you are. Authorization asks whether you may touch this specific record, and it belongs at the same boundary.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Returning redirect Instead of Throwing It',
        subtitle: 'The guard that appears to work and navigates nowhere',
        why: 'In a data router, a thrown redirect is intercepted as navigation. A returned redirect is just a value the loader produced, so the router considers the load successful. No navigation happens, the URL stays on the protected route, and the component renders with a Response object as its data — usually a blank screen with a prop that makes no sense.',
        fix: 'Always throw: throw redirect("/login"). The same applies to throw new Response("Not found", { status: 404 }) for missing records.',
        designPattern: 'Control Flow Versus Data: a value returned from a loader describes the result. A value thrown interrupts the result. Conflating them turns a guard into a no-op.',
      },
      {
        order: 2,
        title: 'Trusting the redirectTo Parameter',
        subtitle: 'An open redirect that starts with a helpful feature',
        why: 'Preserving the intended destination is good UX and a classic vulnerability. If the login page navigates to whatever redirectTo contains, an attacker sends users to /login?redirectTo=https://evil.example/ and the user signs in legitimately, then lands on a lookalike page that asks them to sign in again. The trusted domain was never compromised — it was used as the bait.',
        fix: 'Accept only relative paths that begin with a single forward slash. Reject protocol-relative values (//evil.example), absolute URLs, and anything that parses to a different origin.',
        designPattern: 'Allowlist, not Denylist: define exactly which destinations are valid rather than trying to enumerate the shapes of bad ones.',
      },
      {
        order: 3,
        title: 'Hiding the UI as the Only Protection',
        subtitle: 'The admin page that is hidden and still reachable',
        why: 'Rendering a component conditionally on a role flag protects nothing. The route, its loader and any API it calls are all reachable by typing the URL or by calling the endpoint directly. The role check lived in the component that was never the boundary.',
        fix: 'Enforce in the loader or middleware so no protected component renders, and enforce again in the data layer for anything the loader or an action reads or writes. The UI decision is cosmetic.',
        designPattern: 'Defense in Depth: the check that enforces is the one the attacker cannot skip. A hidden button is a hint, not a control.',
      },
    ],
    comparison: {
      title: 'Returning the redirect vs. throwing it',
      subtitle: 'Same call, one navigates and one silently fails',
      badLabel: 'return redirect(...)',
      badGotcha: 'The assistant writes return redirect("/login"). The guard looks correct in review, the build passes, and clicking a protected link produces a blank page with the URL unchanged.',
      goodLabel: 'throw redirect(...), with a validated return path',
      goodReason: 'The thrown response is intercepted as navigation. The return path is checked to be relative before it is used, so it cannot become an open redirect.',
      badCode: `// ❌ The loader succeeds and nothing navigates
export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login"); // 🚨 returns a value
  }
  return json({ user });
}`,
      goodCode: `// ✅ Thrown responses control navigation
export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    const url = new URL(request.url);
    throw redirect(\`/login?redirectTo=\${encodeURIComponent(url.pathname)}\`);
  }
  return json({ user });
}

// In the login action, before navigating:
export function safeRedirect(to: string | null) {
  if (!to || !to.startsWith("/") || to.startsWith("//")) return "/";
  return to;
}`,
      footerNote: 'A guard that returns instead of throws is not a guard. It is a value nobody reads.',
    },
    decisionTree: {
      title: 'Decision Tree: where does the auth check belong?',
      subtitle: 'Authentication is a gate; authorization is a per-record question',
      rootQuestion: 'Is the user allowed to see this route at all?',
      nodes: {
        branchA: 'No — signed-out users should never render it',
        resultA: 'A loader guard that throws a redirect, with the intended path preserved and validated.',
        codeA: 'if (!user) throw redirect(`/login?redirectTo=${safe(path)}`);',
        branchB: 'Yes, they are signed in — but the record may not be theirs',
        subQuestion: 'Does the route read or write a specific record identified by param?',
        yesLabel: 'Yes — an account id, an order id, a document id',
        yesResult: 'Authorize in the loader against the session, and scope the query by that identity so a mismatched id cannot match a row.',
        codeYes: 'const order = await db.orders.findFirst({ where: { id, userId: user.id } });',
        noLabel: 'No — the page is generic for any signed-in user',
        noResult: 'The session check is sufficient. Do not invent a per-record check with nothing to check.',
        codeNo: 'const user = await requireUser(request);',
      },
    },
    quiz: {
      title: 'Quiz: the guard runs and the user stays on the page. Why?',
      subtitle: 'Look at the keyword, not the call',
      codeSnippet: `export async function loader({ request }) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  return json({ user });
}`,
      question: 'Signed out, the user clicks a protected link. The URL never changes and the page renders blank. What is wrong?',
      options: [
        {
          text: 'redirect does not work in loaders and needs a navigate call.',
          isCorrect: false,
          explanation: 'redirect is the intended mechanism in data routers. The problem is how it is used here.',
        },
        {
          text: 'The redirect was returned, so the loader reported success. It must be thrown for the router to treat it as navigation.',
          isCorrect: true,
          explanation: 'Correct. A thrown Response interrupts the load and controls navigation. A returned one becomes the loader\'s data, so the component mounts with a Response and no navigation occurs.',
        },
        {
          text: 'getUser must be awaited twice for the session to be read.',
          isCorrect: false,
          explanation: 'It is awaited once, which is correct. The session check itself works.',
        },
        {
          text: 'The login route must be declared before the protected route.',
          isCorrect: false,
          explanation: 'Route declaration order affects matching of dynamic segments, not redirect propagation.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'scroll-restoration',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The User Scrolls a Long List',
        phase: 'Position Recorded',
        domState: 'The list is scrolled to 1,240px',
        screenContent: 'The user is deep in a feed and clicks an item.',
        activeAction: 'The current scroll offset is associated with this history entry, so the router can find it again later.',
        closureSnapshot: 'entry "/feed" → scrollY: 1240',
        explanation: 'The browser does this for full navigations automatically. In a client router it becomes your responsibility.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. A Push Navigation Resets to Top',
        phase: 'Push',
        domState: 'The detail view starts at 0',
        screenContent: 'The new page opens at the top, as expected.',
        activeAction: 'This was a PUSH navigation to a genuinely new page, so the offset for the new entry is 0 and the view scrolls to the top.',
        closureSnapshot: 'navigation type: PUSH → scrollTo(0)',
        explanation: 'Two navigation types, two correct behaviours. Treating them the same is the source of both scroll bugs.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Back Button',
        phase: 'Pop',
        domState: 'The feed is restored',
        screenContent: 'The user goes back and lands exactly where they left off.',
        activeAction: 'The navigation type is POP, so the router restores the stored offset of 1240 rather than resetting to the top.',
        closureSnapshot: 'navigation type: POP → scrollTo(0, 1240)',
        explanation: 'This is the entire feature. Back means "return me", not "start over".',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Trap: Unconditional Scroll Reset',
        phase: 'Scroll Reset Bug',
        domState: 'The feed is back at the top',
        screenContent: 'The user presses back and loses their place in a 300-item list.',
        activeAction: 'A scroll-to-top effect runs on every location change, including POP. The stored position is overwritten by 0 before it can be restored.',
        closureSnapshot: 'useEffect on pathname → scrollTo(0) → offsets lost',
        explanation: 'The effect cannot tell a back navigation from a forward one unless it asks, and most implementations do not ask.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. Restore After Content Exists',
        phase: 'Timing',
        domState: 'The list is tall enough to accept the offset',
        screenContent: 'The restore lands correctly rather than clamping to a short page.',
        activeAction: 'Scrolling to 1240 before the list has rendered only reaches the current document height. Restoration waits for the content to be present or runs in a layout phase after it.',
        closureSnapshot: 'content rendered → document height ≥ 1240 → restore applies',
        explanation: 'Even a correct restore fails silently if the page is short when it runs. Ordering matters as much as the offset.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Unconditional Scroll to Top',
        subtitle: 'The back button that always returns you to the beginning',
        why: 'An effect that calls window.scrollTo(0, 0) on every pathname change treats a back navigation exactly like a forward one. The user returns to a feed and finds the top, and their stored offset is overwritten before anything can restore it. This is the single most common complaint about client-routed list pages.',
        fix: 'Check the navigation type. Reset on PUSH, restore on POP, and prefer the router\'s built-in ScrollRestoration component when the router provides one.',
        designPattern: 'Event Classification: the handler must know which event it is handling. Treating "back" and "forward to a new page" as the same event makes a correct implementation impossible.',
      },
      {
        order: 2,
        title: 'Restoring Before the Content Renders',
        subtitle: 'A restored offset that clamps to the height of a loading skeleton',
        why: 'Scrolling to 1240px only works if the document is at least that tall. Restoring in an effect that runs before the list has mounted clamps silently to a much smaller offset. The page ends up in the wrong place with no error, and it is easy to misdiagnose as the wrong value being saved.',
        fix: 'Restore after the content that defines the height has committed — in a layout effect keyed on the data, or via the router\'s built-in component which handles the ordering.',
        designPattern: 'Ordering Constraints: a value can only be applied once its target exists. Sequence is part of correctness.',
      },
      {
        order: 3,
        title: 'Saving One Global Offset',
        subtitle: 'Two tabs, one scroll position, both wrong',
        why: 'A single scrollY variable in a store is overwritten by every navigation, so the entry you are leaving and the entry you are entering compete for one slot. With tabs or nested views, restoring it puts the user somewhere they were never standing.',
        fix: 'Key the offset by history entry — location.key in React Router, or the full path — so each entry owns its own position.',
        designPattern: 'Identity-keyed State (Identity Map): state belongs to a specific entity. Sharing one slot across many entities guarantees overwrites.',
      },
    ],
    comparison: {
      title: 'Unconditional reset vs. navigation-aware restoration',
      subtitle: 'One line decides whether the back button works',
      badLabel: 'Scroll to top on every navigation',
      badGotcha: 'The assistant adds a useEffect that scrolls to top on pathname change. It looks like a UX improvement until someone presses back on a long list and loses their place.',
      goodLabel: 'Push resets, pop restores',
      goodReason: 'Navigation type decides the behaviour. Forward moves start at the top; history moves return to where the user was, once the content is tall enough to accept the offset.',
      badCode: `// ❌ Back navigation is treated like a new page
function ScrollManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}`,
      goodCode: `// ✅ Restore only when returning through history
import { useNavigationType } from "react-router-dom";

function ScrollManager() {
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [navigationType]);

  return null;
}

// Or, with a data router, use the built-in component:
// <ScrollRestoration />`,
      footerNote: 'The browser did this for free before client routing. Reimplementing it means reimplementing the distinction too.',
    },
    decisionTree: {
      title: 'Decision Tree: how should this navigation affect scroll?',
      subtitle: 'Classify the navigation before touching the offset',
      rootQuestion: 'Is the user moving forward to new content, or returning to content they already saw?',
      nodes: {
        branchA: 'Forward — a push to a new page',
        resultA: 'Reset to the top. The previous offset does not describe this page.',
        codeA: 'if (navigationType === "PUSH") window.scrollTo(0, 0);',
        branchB: 'Returning — back or forward through history',
        subQuestion: 'Does the application have a data router with built-in restoration?',
        yesLabel: 'Yes — React Router 6.4+ with a data router',
        yesResult: 'Render <ScrollRestoration /> once in the root. It records and restores per history entry.',
        codeYes: '<ScrollRestoration />',
        noLabel: 'No — a custom router or an older version',
        noResult: 'Store the offset per location.key on leave, restore on POP after the content that defines the height has rendered.',
        codeNo: 'useLayoutEffect(() => { window.scrollTo(0, saved.get(key) ?? 0); }, [key, rows.length]);',
      },
    },
    quiz: {
      title: 'Quiz: why does back always land at the top?',
      subtitle: 'The offset was never restored, or never saved',
      codeSnippet: `function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}`,
      question: 'The user scrolls a long feed, opens an item, presses back, and is at the top. What is the cause?',
      options: [
        {
          text: 'The browser disables scroll restoration inside SPAs.',
          isCorrect: false,
          explanation: 'The browser still restores for full navigations. A client router bypasses those, so the app must handle it.',
        },
        {
          text: 'The effect runs on every pathname change, so the POP navigation also resets to 0 and overwrites the saved position.',
          isCorrect: true,
          explanation: 'Correct. Back navigation needs the stored offset restored, not reset. The effect cannot tell the two apart because it never checks the navigation type.',
        },
        {
          text: 'The feed component unmounts and loses its scroll position.',
          isCorrect: false,
          explanation: 'Scroll position belongs to the document, not to the component. Unmounting does not reset it by itself.',
        },
        {
          text: 'Scroll restoration only works with server-side rendering.',
          isCorrect: false,
          explanation: 'It is independent of rendering strategy. It depends on recording and restoring offsets per history entry.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'route-loaders-actions',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Router Matches and Runs Loaders',
        phase: 'Parallel Loaders',
        domState: 'The previous route is still on screen',
        screenContent: 'Clicking the profile link leaves the current page visible.',
        activeAction: 'The router matches every route in the new branch and starts all their loaders at once, before rendering any of them.',
        closureSnapshot: 'loaders: [user, posts, badges] start concurrently',
        explanation: 'Parallelism is structural here. Siblings cannot serialize each other because they never render first.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Data Arrives Before the Component Exists',
        phase: 'Resolve',
        domState: 'Content appears complete',
        screenContent: 'The profile renders with data already in place.',
        activeAction: 'Loaders resolve, then the route component mounts and reads the results through useLoaderData. No loading state is needed for the first paint.',
        closureSnapshot: 'useLoaderData() → { user, posts, badges }',
        explanation: 'The component is guaranteed its data on the first render. That removes an entire category of blank-then-fill layouts.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. A Form Submits to an Action',
        phase: 'Mutation',
        domState: 'The UI stays interactive during the write',
        screenContent: 'The user edits the name and saves; the page does not lock up.',
        activeAction: 'The form posts to a route action. The router runs it, then re-runs every loader on the page, so the rendered data reflects the write.',
        closureSnapshot: 'action → revalidate loaders → re-render with fresh data',
        explanation: 'Revalidation is automatic. That is the difference between a loader and a fetch you wired yourself.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Effect Alternative, Compared',
        phase: 'Waterfall',
        domState: 'Skeletons at every level',
        screenContent: 'The same profile page loads in visible stages.',
        activeAction: 'Fetching in useEffect instead means the parent renders, its effect starts, the child mounts, its effect starts — each level waiting for the one above.',
        closureSnapshot: 'parent fetch → child mount → child fetch (sequential)',
        explanation: 'Same data, same network, three sequential round trips instead of one. The difference is where the fetching was placed.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Loader and Component Both Fetching',
        phase: 'Duplicate Work',
        domState: 'Two identical requests in flight',
        screenContent: 'Nothing looks wrong; the page is just slower.',
        activeAction: 'A loader fetches the profile, and the component also fetches it in an effect for no reason. Both requests complete, both settle separately, and the second one can overwrite the first with older data.',
        closureSnapshot: 'loader GET /api/profile × component GET /api/profile',
        explanation: 'A loader is the single source for route data. An effect that duplicates it reintroduces the race conditions loaders were meant to remove.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Route Data Fetched in an Effect',
        subtitle: 'The waterfall that loaders exist to remove',
        why: 'An effect runs after mount, so the route renders with no data, the user sees a skeleton, and any nested component waits for its parent to finish before starting its own request. Three nesting levels produce three sequential round trips for data that could have loaded in parallel. The page is not slow because the network is slow; it is slow because the requests were queued by the component tree.',
        fix: 'Move route data into loaders. They run in parallel before rendering, so the component mounts with its data and the first paint is complete.',
        designPattern: 'Fetch Before Render: resolving dependencies before constructing the view removes the ordering constraint the tree would otherwise impose.',
      },
      {
        order: 2,
        title: 'Loaders Used for Component-Level State',
        subtitle: 'A loader that reruns on every navigation for data one component needed once',
        why: 'Loaders run on navigation and after actions. Putting something in a loader that only one leaf component needs means it re-fetches every time the user moves around the route branch, including for navigations that have nothing to do with that component. The cost is invisible until the route is large.',
        fix: 'Keep loaders for data the route needs to render. Component-local data belongs in the component, ideally through a query library that can cache and deduplicate it.',
        designPattern: 'Scope Alignment: data should be fetched at the level that consumes and owns it. Hoisting everything to the route is as wrong as fetching everything at the leaves.',
      },
      {
        order: 3,
        title: 'Assuming Actions Revalidate Everything',
        subtitle: 'The dependent route that still shows old numbers',
        why: 'An action revalidates the loaders of the routes currently rendered. A sidebar or a badge in a parent layout may read data that the action changed but that no active loader re-reads, so the visible count stays stale until the next full navigation.',
        fix: 'Call the router\'s revalidate function explicitly when a write affects data outside the current route branch. Revalidation is scoped, and the scope is something you specify.',
        designPattern: 'Observer Invalidation: a write is not complete until every reader has been told its view is stale. Scoped notification requires naming the readers.',
      },
    ],
    comparison: {
      title: 'Effect fetching vs. route loaders',
      subtitle: 'The same three queries, one round trip deep vs. three',
      badLabel: 'Fetch inside the route component',
      badGotcha: 'The assistant writes the familiar useEffect pattern in the page component and in the list item. On a 150ms connection, the profile takes 450ms and shows three separate loading flashes.',
      goodLabel: 'Loaders resolve before render',
      goodReason: 'All three queries start together, the component mounts with complete data, and there is no skeleton for content the route always needs.',
      badCode: `// ❌ Renders empty, then fetches, then fetches again
function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then(setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(\`/api/posts?author=\${user.id}\`).then((r) => r.json()).then(setPosts);
  }, [user]);

  if (!user) return <Skeleton />;
  return <Posts posts={posts} />;
}`,
      goodCode: `// ✅ Parallel, complete on first paint
export async function loader({ params }: LoaderArgs) {
  const [user, posts] = await Promise.all([
    getMe(),
    getPosts(params.id),
  ]);
  return json({ user, posts });
}

export default function Profile() {
  const { user, posts } = useLoaderData<typeof loader>();
  return <Posts posts={posts} author={user.name} />;
}`,
      footerNote: 'If the route cannot render without the data, the route should not render until it has the data.',
    },
    decisionTree: {
      title: 'Decision Tree: loader, action, or component fetch?',
      subtitle: 'Decide by who owns the data and what triggers the read',
      rootQuestion: 'Does the route need this data to render its first frame?',
      nodes: {
        branchA: 'Yes — the page is meaningless without it',
        resultA: 'A loader. It runs in parallel with sibling loaders and resolves before the component mounts.',
        codeA: 'export async function loader() { return json(await getData()); }',
        branchB: 'No — it is interaction-driven, or local to one widget',
        subQuestion: 'Does the interaction write data that other parts of the page display?',
        yesLabel: 'Yes — a form, a status change, a delete',
        yesResult: 'A route action. It performs the write and the router revalidates the active loaders.',
        codeYes: 'export async function action({ request }) { await save(await request.formData()); return redirect("/"); }',
        noLabel: 'No — a chart that loads when a tab is opened',
        noResult: 'Keep it in the component with a query library that caches by key.',
        codeNo: "useQuery({ queryKey: ['chart', id], queryFn: getChart })",
      },
    },
    quiz: {
      title: 'Quiz: why is the loader page still three round trips deep?',
      subtitle: 'Parallelism is a property of the code, not the router',
      codeSnippet: `export async function loader({ params }) {
  const user = await getUser(params.id);
  const posts = await getPosts(params.id);
  const badges = await getBadges(params.id);
  return json({ user, posts, badges });
}`,
      question: 'These are three independent queries in one loader. What is the actual latency characteristic?',
      options: [
        {
          text: 'They run in parallel because loaders are always concurrent.',
          isCorrect: false,
          explanation: 'The loader is one function. Sequential awaits inside it are sequential, regardless of how the router schedules loaders.',
        },
        {
          text: 'They run sequentially: total latency is the sum of all three, because each await waits for the previous one.',
          isCorrect: true,
          explanation: 'Correct. Promise.all would collapse it to the slowest single query. Awaiting one at a time adds them together.',
        },
        {
          text: 'The router batches them automatically after the first await.',
          isCorrect: false,
          explanation: 'The router cannot see inside the function or reorder its awaits. Only your code decides the ordering.',
        },
        {
          text: 'It depends on whether the route is nested.',
          isCorrect: false,
          explanation: 'Nesting affects how sibling loaders are scheduled, not how awaits inside a single loader behave.',
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
    console.log('\nBatch H (routing data) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
