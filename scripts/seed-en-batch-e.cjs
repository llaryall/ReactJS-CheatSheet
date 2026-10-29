// English interactive primitives for the server & streaming batch:
//   streaming-with-suspense · server-components-fundamentals · server-actions
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
    slug: 'streaming-with-suspense',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Shell Is Sent First',
        phase: 'Initial Flush',
        domState: 'Header, navigation and layout are painted',
        screenContent: 'The page structure appears immediately; two cards show skeletons.',
        activeAction: 'The server renders everything that does not suspend and flushes the HTML plus the React runtime in the first response chunk.',
        closureSnapshot: 'flush#1 = shell + two Suspense fallbacks',
        explanation: 'The user can read and navigate before any data has arrived. The shell is the part that was never waiting on anything.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Slow Regions Suspend Independently',
        phase: 'Parallel Suspension',
        domState: 'Two fallbacks, two independent waits',
        screenContent: 'The revenue card and the activity feed both show placeholders.',
        activeAction: 'Each Suspense boundary suspends on its own promise. Both queries started before the shell flushed, so they run in parallel rather than in sequence.',
        closureSnapshot: 'boundary A: pending | boundary B: pending | both requests in flight',
        explanation: 'The parallelism comes from starting the work early, not from the boundaries. Boundaries only decide where results land.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The First Result Streams In',
        phase: 'Progressive Hydration',
        domState: 'Revenue card replaced by real content',
        screenContent: 'Numbers appear in the first card; the feed still shows its skeleton.',
        activeAction: 'When the revenue promise resolves, the server streams a small inline script with the rendered HTML fragment. React swaps the fallback for the real content.',
        closureSnapshot: 'boundary A resolved → fragment streamed, boundary B still pending',
        explanation: 'Nothing waited for the slowest query. Each region became real as soon as it could.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Second Result Follows',
        phase: 'Stream Complete',
        domState: 'The page is fully real',
        screenContent: 'The activity feed fills in and the page is complete.',
        activeAction: 'The second promise resolves and its fragment streams in the same way. The document closes.',
        closureSnapshot: 'boundary B resolved → stream closed',
        explanation: 'Total time to a complete page is the slowest query, but time to a usable page was the shell — the two are no longer the same number.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Single Boundary Regret',
        phase: 'Boundary Scope Trap',
        domState: 'A blank page until the last query returns',
        screenContent: 'Nothing visible for four seconds, then everything appears at once.',
        activeAction: 'One Suspense boundary wraps the whole route. The first suspension catches at the outermost level, so the entire page falls back and the shell never paints.',
        closureSnapshot: 'root boundary → nothing flushes until slowest query',
        explanation: 'The streaming machinery is working perfectly. The boundary placement threw away the benefit.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'One Suspense Around the Whole Page',
        subtitle: 'A blank screen, and the slowest query decides when it ends',
        why: 'A single boundary at the route level means the first component that suspends blocks everything below it — including content that was already ready. The server cannot stream what the boundary is holding back, so the page behaves exactly like the blocking render it replaced.',
        fix: 'Give each independently-loading region its own boundary. The shell above the first boundary should contain everything genuinely urgent; everything below should be content that can arrive on its own schedule.',
        designPattern: 'Blast Radius again: a boundary decides who waits for a failure. Widening it does not make anything faster, it only makes more things wait.',
      },
      {
        order: 2,
        title: 'Awaited Fetches Stacked in One Component',
        subtitle: 'Two independent queries that were made to depend on each other',
        why: 'Writing const a = await getA(); const b = await getB(); inside one async component creates a waterfall. The second request does not start until the first finishes, so total latency is the sum instead of the maximum. Nothing about the rendering model caused this — the code did.',
        fix: 'Start both requests before awaiting either: const [a, b] = await Promise.all([getA(), getB()]). Or split the two into separate components with separate boundaries so each can stream independently.',
        designPattern: 'Parallelism is a code property: Suspense can render in parallel, but it cannot un-serialize awaits you wrote in sequence.',
      },
      {
        order: 3,
        title: 'Suspense Without a Meaningful Fallback',
        subtitle: 'Layout shift on every load, in exactly the region the user is reading',
        why: 'A spinner that occupies 20px followed by a 400px card pushes everything below it down when the content arrives. Cumulative Layout Shift is a real ranking signal, and more importantly the user loses their place. The same happens with a fallback that shows different content than the region it replaces.',
        fix: 'Give the fallback the same dimensions as the resolved content — a skeleton with the right height. Reserve the space so nothing moves when the real data lands.',
        designPattern: 'Placeholder Integrity: the fallback is a promise about the shape of something. Break the shape and every arrival becomes a jump.',
      },
    ],
    comparison: {
      title: 'One global boundary vs. boundaries per region',
      subtitle: 'Identical queries, four seconds of difference in perceived speed',
      badLabel: 'Everything waits for the slowest query',
      badGotcha: 'The assistant wraps the dashboard in a single Suspense with a full-page spinner. The shell never paints, and a five-second report query holds the entire page hostage.',
      goodLabel: 'Shell first, each region on its own schedule',
      goodReason: 'The layout renders immediately and each waiting region has its own boundary. Fast data appears in under a second; slow data fills in when it can.',
      badCode: `// ❌ Nothing paints until the slowest query resolves
export default function Dashboard() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Header />
      <RevenueCard />
      <ActivityFeed />
    </Suspense>
  );
}`,
      goodCode: `// ✅ The shell is never hostage to a slow query
export default function Dashboard() {
  return (
    <>
      <Header />
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<RevenueSkeleton />}>
          <RevenueCard />
        </Suspense>
        <Suspense fallback={<FeedSkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </>
  );
}`,
      footerNote: 'Every boundary is a promise to the user about what they can start doing now.',
    },
    decisionTree: {
      title: 'Decision Tree: where does the Suspense boundary go?',
      subtitle: 'The boundary is a UX decision, not a technical one',
      rootQuestion: 'Can the user do something useful before this region loads?',
      nodes: {
        branchA: 'Yes — the header, navigation and layout are useful on their own',
        resultA: 'Keep them above every boundary. They flush first and never wait for data.',
        codeA: '<Header /><main><Suspense fallback={<Skeleton />}><SlowRegion /></Suspense></main>',
        branchB: 'No — this region must be present for the page to make sense',
        subQuestion: 'Are there multiple independent data sources under it?',
        yesLabel: 'Yes — two or more queries that do not depend on each other',
        yesResult: 'One boundary per source so each streams as it resolves. Wrap each with a skeleton of the right size.',
        codeYes: '<Suspense fallback={<A />}><WidgetA /></Suspense><Suspense fallback={<B />}><WidgetB /></Suspense>',
        noLabel: 'No — one query, and the page is meaningless without it',
        noResult: 'A single boundary around that region is correct. Do not manufacture extra boundaries to look sophisticated.',
        codeNo: '<Suspense fallback={<PageSkeleton />}><DetailPage id={id} /></Suspense>',
      },
    },
    quiz: {
      title: 'Quiz: why does streaming show nothing at all?',
      subtitle: 'The mechanism is fine — the boundary is not',
      codeSnippet: `export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <Header />
      <SlowReport />
      <Footer />
    </Suspense>
  );
}`,
      question: 'SlowReport takes four seconds. The user sees a spinner and nothing else for four seconds. Why?',
      options: [
        {
          text: 'Streaming requires a Suspense boundary per component and none were provided.',
          isCorrect: false,
          explanation: 'There is a boundary. The problem is its scope, not its absence.',
        },
        {
          text: 'The single boundary is above Header and Footer, so the suspension of SlowReport replaces all three — the shell never gets a chance to paint.',
          isCorrect: true,
          explanation: 'Correct. A boundary catches everything below it. Because Header and Footer are inside the same boundary as the slow component, they fall back with it.',
        },
        {
          text: 'SlowReport must be wrapped in React.lazy to stream.',
          isCorrect: false,
          explanation: 'lazy applies to code loading. Streaming data is driven by suspension, which async components already do.',
        },
        {
          text: 'The fallback needs to be null for streaming to begin.',
          isCorrect: false,
          explanation: 'The fallback content is irrelevant here. What matters is how much of the tree sits inside the boundary.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'server-components-fundamentals',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Server Component Runs at Request Time',
        phase: 'Server Execution',
        domState: 'No client bundle exists for this component',
        screenContent: 'Nothing visible yet — this happens before the browser receives anything.',
        activeAction: 'A component with no "use client" directive runs on the server. It can read the database, touch the filesystem, and use secrets without exposing any of them.',
        closureSnapshot: 'runs on Node → output is serialized JSX, not JavaScript code',
        explanation: 'This component never exists in the browser. What ships is its output.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Output Becomes a Serialized Tree',
        phase: 'Serialization',
        domState: 'The browser receives markup and a payload',
        screenContent: 'The article renders — text, headings, paragraphs.',
        activeAction: 'The resolved tree is serialized and streamed. Functions and class instances cannot cross this boundary; only plain data can.',
        closureSnapshot: 'props crossing the boundary must be serializable',
        explanation: 'This is the constraint people hit first: passing a callback from a Server Component to a Client Component is a hard error, not a warning.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Client Boundary Begins',
        phase: 'use client Boundary',
        domState: 'A search box becomes interactive',
        screenContent: 'The user types in the filter and it responds instantly.',
        activeAction: 'A component marked "use client" and everything it imports is compiled into the client bundle. The boundary is a door, not a label.',
        closureSnapshot: 'client bundle += this module + its entire import graph',
        explanation: 'The directive does not mark one component as interactive. It marks a subtree as client code.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. Server Renders Client as a Child',
        phase: 'Composition Across the Boundary',
        domState: 'A client wrapper holds server-rendered content',
        screenContent: 'A collapsible panel contains article text that was never bundled.',
        activeAction: 'A Client Component receives server-rendered JSX through the children prop. It can wrap and position content it did not render.',
        closureSnapshot: 'children = serialized server output (not source)',
        explanation: 'This is how you keep interactivity at the leaves without dragging whole pages into the bundle.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Leaking Directive',
        phase: 'Boundary Creep',
        domState: 'The bundle grows by hundreds of kilobytes',
        screenContent: 'Nothing visible changes — the page is simply slower to become interactive.',
        activeAction: '"use client" was placed at the top of a shared layout, pulling the header, footer, and three data-fetching modules into the client bundle.',
        closureSnapshot: 'client bundle: +240KB for components with no interactivity',
        explanation: 'The directive propagates downward through imports. One line at the top of a layout can undo an entire server-first architecture.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'use client at the Root of a Layout',
        subtitle: 'The entire application becomes a client application, quietly',
        why: '"use client" marks a module boundary, not a single component. Everything imported below it is client code. Placing it on a shared layout pulls the header, footer, navigation and every data module they import into the browser bundle. The app still works, so nothing looks broken — the cost appears as a slower first interaction on mid-range devices.',
        fix: 'Push "use client" to the leaves: the button that needs state, the input that needs an event handler. Keep layouts and data access on the server. Pass server-rendered content into client components as children.',
        designPattern: 'Boundary Placement: the directive has transitive effects, and the cost is paid once per module in the import graph, not once per component that uses interactivity.',
      },
      {
        order: 2,
        title: 'Passing Functions Across the Boundary',
        subtitle: 'A serialization error that reads like a syntax problem',
        why: 'Props passed from a Server Component to a Client Component must be serializable. A function, a class instance, a Date in some paths, or a symbol cannot cross. The error message points at the prop, and the reflex is to add "use client" to the parent — which solves the symptom by turning a server component into a client one.',
        fix: 'Pass data, not behaviour. If the child needs to trigger a server operation, pass a Server Action reference, which is serializable by design. If the child needs a client callback, define it inside the client component.',
        designPattern: 'Serialization Boundary: only plain data crosses. Behaviour must be referenced (a Server Action) or created on the side where it runs.',
      },
      {
        order: 3,
        title: 'Server Components Used for Interactivity',
        subtitle: 'useState in a component that will never hydrate',
        why: 'Server Components have no state, no effects, and no event handlers. They render once and are done. Reaching for useState or onClick and getting an error leads people to add "use client" to the file, which converts the whole component — and its imports — to client code, when the intent was one interactive button.',
        fix: 'Extract the interactive piece into a small Client Component and render it from the Server Component. The page stays server-rendered and the bundle grows by one button.',
        designPattern: 'Island Architecture: interactivity is scoped to the island, not the ocean around it.',
      },
    ],
    comparison: {
      title: 'Directive at the layout vs. directive at the leaf',
      subtitle: 'Same UI, a very different bundle',
      badLabel: '"use client" on a shared layout',
      badGotcha: 'The assistant needs a dropdown in the header, so it marks the layout as client. Every page under it becomes client-rendered, the database modules get bundled, and the server-first architecture is gone in one line.',
      goodLabel: 'Server layout, client island',
      goodReason: 'The layout stays on the server. Only the dropdown ships to the browser, wrapped around server-rendered children it never had to fetch.',
      badCode: `// ❌ One dropdown turns the whole app into a client app
"use client"; // at the top of app/layout.tsx

import { db } from "@/lib/db";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <html>
      <body>
        <header onClick={() => setOpen(!open)}>Menu</header>
        {children}
      </body>
    </html>
  );
}`,
      goodCode: `// ✅ app/layout.tsx — stays on the server
import { Menu } from "./menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Menu />
        {children}
      </body>
    </html>
  );
}

// menu.tsx — the only client code in the tree
"use client";
import { useState } from "react";

export function Menu() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>;
}`,
      footerNote: 'If a component has no state, no effects and no handlers, it should not be a client component.',
    },
    decisionTree: {
      title: 'Decision Tree: server or client component?',
      subtitle: 'One question decides it, and the answer is usually server',
      rootQuestion: 'Does this component need state, effects, or an event handler?',
      nodes: {
        branchA: 'No — it renders data and nothing else',
        resultA: 'Server Component. No directive, no bundle cost, direct data access.',
        codeA: 'export default async function Page() { const rows = await db.query(); return <Table rows={rows} />; }',
        branchB: 'Yes — it holds state or responds to the user',
        subQuestion: 'Is the interactive part the whole component, or just a piece of it?',
        yesLabel: 'Just a piece — a button, an input, a dropdown',
        yesResult: 'Extract that piece into a Client Component. Leave everything around it on the server and pass server-rendered content as children.',
        codeYes: '<Menu><ServerRenderedList /></Menu>  // Menu is "use client"',
        noLabel: 'The whole component is interactive',
        noResult: 'Client Component. Place "use client" at that file, as deep in the tree as it can go.',
        codeNo: '"use client"; export function Editor({ initial }) { /* … */ }',
      },
    },
    quiz: {
      title: 'Quiz: what does "use client" actually mark?',
      subtitle: 'A door, not a label',
      codeSnippet: `// app/layout.tsx
"use client";

import { Header } from "./header";
import { Footer } from "./footer";
import { db } from "@/lib/db";

export default function Layout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>;
}`,
      question: 'Which statement about this layout is correct?',
      options: [
        {
          text: 'Only the Layout component becomes a client component; Header and Footer stay on the server.',
          isCorrect: false,
          explanation: 'The directive applies to the module and its entire import graph. Header, Footer and even the db import become client code.',
        },
        {
          text: 'The layout and everything it imports become client code, including modules with no interactivity at all.',
          isCorrect: true,
          explanation: 'Correct. "use client" defines a module boundary. Every import below it is compiled for the browser, whether or not it uses state.',
        },
        {
          text: 'It has no effect unless the file also uses useState or useEffect.',
          isCorrect: false,
          explanation: 'The directive is not conditional on what the file uses. Its effect on the bundle applies regardless.',
        },
        {
          text: 'It only affects components rendered directly inside the layout.',
          isCorrect: false,
          explanation: 'Imports propagate. Anything reachable through the module graph crosses the boundary with it.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'server-actions',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. A Client Component Calls the Action',
        phase: 'Client Invocation',
        domState: 'The button switches to pending',
        screenContent: 'The user clicks "Archive".',
        activeAction: 'The client calls a function imported from a "use server" module. It looks like a normal async call, but it compiles to a POST to an endpoint.',
        closureSnapshot: 'archivePost(id) → POST /_action?id=...',
        explanation: 'The ergonomics are a local function call. The reality is a network request to a public route.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Server Function Runs',
        phase: 'Server Execution',
        domState: 'No visible change yet',
        screenContent: 'The button stays in its pending state.',
        activeAction: 'The function executes in the server runtime with full access to the database and environment secrets.',
        closureSnapshot: 'runs on server, never shipped to the browser',
        explanation: 'This is the real benefit: the logic and the credentials stay on the server. It is not a security property of the caller.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Boundary Check',
        phase: 'Validation & Authorization',
        domState: 'Unchanged',
        screenContent: 'Unchanged — this step is the one that decides what the user will see.',
        activeAction: 'The function validates the payload against a schema and reads the current user from the session. Both happen on the server, after the request has already crossed the boundary.',
        closureSnapshot: 'session.user.id !== payload.userId → reject',
        explanation: 'Everything arriving in this function is attacker-controlled, including the fields the UI never showed.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Write and the Revalidation',
        phase: 'Persist & Invalidate',
        domState: 'The list updates',
        screenContent: 'The archived item disappears from the list.',
        activeAction: 'The database write commits, then revalidatePath tells the framework to re-render the affected route so cached server output is refreshed.',
        closureSnapshot: 'db.update(...) → revalidatePath("/inbox")',
        explanation: 'Without revalidation the data is correct and the page still shows the old version — a bug that is easy to misread as a caching problem.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Trusting the Payload',
        phase: 'Trust Boundary Trap',
        domState: 'Nothing looks wrong in the UI',
        screenContent: 'The attacker\'s own dashboard shows a successful action.',
        activeAction: 'A request arrives without your form, with someone else\'s userId and a role field your UI never rendered. The action wrote exactly what it was told.',
        closureSnapshot: 'payload = { userId: <victim>, role: "admin" } → accepted',
        explanation: 'The UI is not a security control. The action is an endpoint, and endpoints are called by whatever can reach them.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Reading Identity From the Payload',
        subtitle: 'A userId field that anyone can change before the request leaves',
        why: 'The most common Server Action vulnerability is trusting an id sent from the client. The form posts whatever the browser says, and the browser is under the caller\'s control. Changing one hidden field is enough to act on another user\'s record, and nothing in the UI ever looked insecure.',
        fix: 'Derive identity from the server-side session, never from the payload. Then scope the query by that identity so a mismatched id cannot select someone else\'s row.',
        designPattern: 'Trust Boundary: authorization facts must originate on the trusted side. Any identity received from the client is a claim, not a fact.',
      },
      {
        order: 2,
        title: 'No Schema Validation on the Payload',
        subtitle: 'The action accepts a 4MB string and a negative quantity',
        why: 'Client-side validation is a UX affordance and disappears the moment someone calls the endpoint directly. Without server-side schema validation, the action will happily write types, shapes and sizes the UI would never produce — including values that break downstream jobs or blow past database constraints at 3am.',
        fix: 'Parse with a schema (Zod, Valibot) at the top of every action and return field-level errors. Validate the wire format, not the intended usage.',
        designPattern: 'Validate at the Boundary: the system edge is the only place where unknown input enters. Everything inside can then trust its own types.',
      },
      {
        order: 3,
        title: 'Forgetting to Revalidate',
        subtitle: 'The write succeeded and the screen still shows the old data',
        why: 'A Server Action mutates data, then the framework serves the previously cached render of the page. The user sees no change and submits again, creating a duplicate. Nothing failed — the cache was simply never told.',
        fix: 'Call revalidatePath or revalidateTag for every route that reads the affected data, immediately after a successful write. Treat revalidation as part of the mutation, not an optimization.',
        designPattern: 'Observer with invalidation: a write is incomplete until every reader has been notified that its view is stale.',
      },
    ],
    comparison: {
      title: 'An action that trusts the client vs. one that verifies',
      subtitle: 'Both work through the UI. Only one survives being called directly',
      badLabel: 'Payload-driven authorization',
      badGotcha: 'The assistant reads userId and role from FormData and writes them straight to the database. The form never shows a role field, so the code looks safe — but the endpoint accepts any body.',
      goodLabel: 'Session-derived identity, schema-validated input',
      goodReason: 'The user comes from the session, the input is parsed before use, and the update is scoped to that user. A forged payload can only affect the caller\'s own record.',
      badCode: `// ❌ The endpoint believes whatever it is told
"use server";

export async function updateUser(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  // 🚨 no auth check, no schema, no scoping
  await db.users.update({ where: { id: userId }, data: { role } });
  return { ok: true };
}`,
      goodCode: `// ✅ Identity from the session, input from a schema
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const Schema = z.object({
  displayName: z.string().trim().min(2).max(80),
});

export async function updateUser(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const parsed = Schema.safeParse({ displayName: formData.get("displayName") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await db.users.update({
    where: { id: session.user.id }, // scoped by identity, not by payload
    data: { displayName: parsed.data.displayName },
  });

  revalidatePath("/settings");
  return { ok: true, error: null };
}`,
      footerNote: 'The only field you can safely trust is the one the client cannot send.',
    },
    decisionTree: {
      title: 'Decision Tree: what does this action verify?',
      subtitle: 'Every action answers three questions before it writes',
      rootQuestion: 'Who is calling, and should they be allowed to do this?',
      nodes: {
        branchA: 'The identity comes from the payload or a hidden field',
        resultA: 'Stop. Read the session instead and scope the write to it. The payload is attacker-controlled.',
        codeA: 'const user = await auth(); if (!user) return unauthorized();',
        branchB: 'The identity comes from the session',
        subQuestion: 'Has the input been parsed against a schema on the server?',
        yesLabel: 'Yes — parsed and typed before use',
        yesResult: 'Write, then revalidate every path that reads the changed data.',
        codeYes: 'revalidatePath("/settings");',
        noLabel: 'No — the fields are used as they arrive',
        noResult: 'Add a schema at the top of the action. Validate wire format, not intended usage.',
        codeNo: 'const parsed = Schema.safeParse(Object.fromEntries(formData));',
      },
    },
    quiz: {
      title: 'Quiz: how far does the form protect this action?',
      subtitle: 'The distance between a UI and an endpoint',
      codeSnippet: `"use server";

export async function deletePost(formData: FormData) {
  const postId = formData.get("postId") as string;
  await db.posts.delete({ where: { id: postId } });
  return { ok: true };
}`,
      question: 'The form only renders a postId the user owns. Is this action safe?',
      options: [
        {
          text: 'Yes — the id is only rendered for posts the user owns.',
          isCorrect: false,
          explanation: 'Rendering is a UI decision. The endpoint accepts any postId sent to it, by anyone who can reach it.',
        },
        {
          text: 'No — anyone can call the action with any postId. It needs a session check and an ownership condition in the delete.',
          isCorrect: true,
          explanation: 'Correct. A Server Action is a public endpoint. Authorization must be enforced in the action, and the delete must be scoped to the caller so a mismatched id cannot match a row.',
        },
        {
          text: 'No — FormData cannot carry an id that was not rendered.',
          isCorrect: false,
          explanation: 'FormData is just a request body. Anything can be put in it by a client that is not your UI.',
        },
        {
          text: 'Yes — Server Actions cannot be invoked outside the app.',
          isCorrect: false,
          explanation: 'They compile to HTTP endpoints. Replay tools and scripts reach them without difficulty.',
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
    console.log('\nBatch E (server & streaming) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
