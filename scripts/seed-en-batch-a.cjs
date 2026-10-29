// English interactive primitives for:
//   state-architecture-selection · async-effects-race-conditions · effect-cleanup
// effect-cleanup has no primitive shells, no quickRef, and no fa locale row —
// this batch builds its record set from scratch.
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
    slug: 'state-architecture-selection',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Handler Reports What Happened',
        phase: 'Dispatch Intent',
        domState: 'Interface still shows the idle form',
        screenContent: 'The user clicks "Pay now".',
        activeAction: 'The click handler calls dispatch({ type: "PAYMENT_STARTED" }). It assigns no variable directly and knows nothing about how the state should change.',
        closureSnapshot: 'action = { type: "PAYMENT_STARTED" }',
        explanation: 'A dispatch is a report, not an instruction. The handler describes the event; the reducer decides what that event means.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Reducer Runs as a Pure Function Outside React',
        phase: 'Pure Evaluation',
        domState: 'Nothing committed yet — still the old frame',
        screenContent: 'No spinner has appeared; the click feels unacknowledged for one frame.',
        activeAction: 'React calls the reducer with (previousState, action) and receives a brand-new object: { status: "processing", attempts: 1 }.',
        closureSnapshot: 'next = reducer({ status: "idle" }, action)',
        explanation: 'The reducer touches no DOM, no network, no clock. Same input, same output, every time — which is exactly what makes it testable in isolation.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. Contradictory States Become Unrepresentable',
        phase: 'State Machine Integrity',
        domState: 'Submit control disabled while processing',
        screenContent: 'The button greys out. It cannot be clicked twice.',
        activeAction: 'Because status is one string rather than three booleans, "loading and success at the same time" has no value that can express it.',
        closureSnapshot: 'status ∈ { idle, processing, success, error }',
        explanation: 'This is the whole return on the reducer: you are not handling impossible states better, you are making them impossible to write.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. One Cohesive Commit',
        phase: 'Commit',
        domState: 'All dependent fields update in a single paint',
        screenContent: 'The receipt appears with the transaction id already filled in.',
        activeAction: 'The new state object is committed once. Every field that describes the outcome arrives together.',
        closureSnapshot: 'committed = { status: "success", attempts: 1, receiptId: "tx_88f1" }',
        explanation: 'With three separate setState calls, a fast render can land between them and flash a half-updated screen. One object, one commit, no flashing.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'The Impossible State Trap',
        subtitle: 'Loading and error painted on screen at the same time',
        why: 'Independent booleans multiply. With isLoading, isSuccess and isError you are not describing four outcomes, you are describing eight combinations, and six of them are nonsense. Miss one reset in one branch and the UI renders a combination that should not exist — a spinner next to an error message that says the retry succeeded.',
        fix: 'Collapse the flags into a single discriminated value: status: "idle" | "processing" | "success" | "error", plus a payload field for whatever the outcome carries. If the type system cannot represent it, the bug cannot come back.',
        designPattern: 'State Pattern / Finite State Machine (Dive Into Design Patterns): a state object owns the legal transitions out of itself. Booleans are not states; they are independent facts that happen to be correlated, and correlation is not enforced anywhere.',
      },
      {
        order: 2,
        title: 'The Reducer Defined Inside the Component',
        subtitle: 'The assistant moves the switch into the component body and quietly destroys every benefit',
        why: 'A reducer declared inside the component closes over props, state, and anything else in scope. It is no longer pure, it is recreated on every render, and you cannot export it to test. The refactor looks like a reducer and behaves like the useState spaghetti it replaced.',
        fix: 'Declare the reducer at module scope, take everything it needs from the action payload, and export it. If the reducer seems to need a prop, that prop belongs in the action.',
        designPattern: 'Dependency Injection read backwards: the reducer receives its context through the action rather than capturing it from a lexical parent.',
      },
      {
        order: 3,
        title: 'Context Used as a Fast-Changing Store',
        subtitle: 'The performance cliff that appears around update number two hundred',
        why: 'Context broadcasts to every consumer. It has no selector, so a single field change wakes the entire subtree under the provider — including components that read nothing from it. It looks fine with five consumers in development and drops frames in a dashboard with a few hundred.',
        fix: 'Split contexts by update frequency, or move fast-changing values to an external store read through useSyncExternalStore (Zustand, Redux, Jotai). Keep context for things that change roughly never: theme, locale, current user.',
        designPattern: 'Observer with a coarse notification channel: every subscriber is notified regardless of interest. Selectors are the refinement you add when notification cost matters, and Context deliberately does not ship them.',
      },
    ],
    comparison: {
      title: 'Three booleans vs. one discriminator',
      subtitle: 'Why the version that passes code review is the one that ships the impossible screen',
      badLabel: 'Three independent flags',
      badGotcha: 'The assistant writes isLoading, isSuccess and isError as separate states. One forgotten reset in the success branch leaves the spinner running next to a "Payment complete" message — and nothing in the codebase flags it.',
      goodLabel: 'One discriminator, no impossible combinations',
      goodReason: 'status holds exactly one of four values. There is no assignment that produces a spinner plus a success message, and the reducer can be unit tested without mounting anything.',
      badCode: `// ❌ 3 booleans = 8 combinations, 6 of them nonsense
function PaymentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handlePay() {
    setIsLoading(true);
    try {
      await pay();
      setIsSuccess(true);
      // 🚨 setIsLoading(false) missing → spinner + success together
    } catch {
      setIsError(true);
      // 🚨 and here too
    }
  }

  return (
    <div>
      {isLoading && <Spinner />}
      {isSuccess && <p>Payment complete</p>}
      {isError && <p>Payment failed</p>}
    </div>
  );
}`,
      goodCode: `// ✅ One value, four legal states
type PaymentState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "success"; receiptId: string }
  | { status: "error"; message: string };

type PaymentAction =
  | { type: "PAYMENT_STARTED" }
  | { type: "PAYMENT_SUCCEEDED"; receiptId: string }
  | { type: "PAYMENT_FAILED"; message: string };

export function paymentReducer(
  state: PaymentState,
  action: PaymentAction,
): PaymentState {
  switch (action.type) {
    case "PAYMENT_STARTED":
      return { status: "processing" };
    case "PAYMENT_SUCCEEDED":
      return { status: "success", receiptId: action.receiptId };
    case "PAYMENT_FAILED":
      return { status: "error", message: action.message };
    default:
      return state;
  }
}

function PaymentForm() {
  const [state, dispatch] = useReducer(paymentReducer, { status: "idle" });

  return (
    <div>
      {state.status === "processing" && <Spinner />}
      {state.status === "success" && <p>Receipt {state.receiptId}</p>}
      {state.status === "error" && <p>{state.message}</p>}
    </div>
  );
}`,
      footerNote: 'The reducer lives at module scope. That one line placement is the difference between an architecture and a costume.',
    },
    decisionTree: {
      title: 'Decision Tree: which state architecture does this value need?',
      subtitle: 'Start with shape and update frequency, not with the library you last used',
      rootQuestion: 'How many values move together, and how often does the value change?',
      nodes: {
        branchA: 'A single independent primitive — a toggle, an input value, a selected id',
        resultA: 'useState. Anything more is ceremony.',
        codeA: 'const [isOpen, setIsOpen] = useState(false);',
        branchB: 'Several fields that always change together, or a lifecycle with named phases',
        subQuestion: 'Does the value have to be readable outside this component subtree, or change many times per second?',
        yesLabel: 'Yes — that is what makes it a store rather than local state',
        yesResult: 'External store read through useSyncExternalStore (Zustand, Redux, Jotai). Context broadcasts to every consumer and has no selector.',
        codeYes: 'const count = useStore((s) => s.count); // subscribes to one slice',
        noLabel: 'No — it stays under one component and updates on user events',
        noResult: 'useReducer with a discriminated status field. Export the reducer and unit test it without rendering anything.',
        codeNo: 'const [state, dispatch] = useReducer(flowReducer, initialState);',
      },
    },
    quiz: {
      title: 'Quiz: what does extracting a reducer actually buy you?',
      subtitle: 'The property that survives contact with production',
      codeSnippet: `function counterReducer(state, action) {
  switch (action.type) {
    case 'INC': return state + 1;
    case 'DEC': return state - 1;
    default: return state;
  }
}`,
      question: 'What is the engineering payoff of writing update logic as this pure function at module scope?',
      options: [
        {
          text: 'The reducer does not need tests, because React guarantees it stays pure.',
          isCorrect: false,
          explanation: 'React guarantees nothing about your reducer beyond calling it during render. Business logic still needs tests — that is the point.',
        },
        {
          text: 'You can test the whole business rule with a plain JavaScript unit test — no component, no DOM, no renderer.',
          isCorrect: true,
          explanation: 'Correct. (state, action) => nextState has no React dependency, so the test is an assertion about a function call. It runs in microseconds and does not break when markup changes.',
        },
        {
          text: 'Reducers execute on the server, so client-side test coverage is unnecessary.',
          isCorrect: false,
          explanation: 'A reducer is ordinary JavaScript and runs wherever you call it. Server execution is not a testing strategy.',
        },
        {
          text: 'The switch statement makes state updates faster than useState.',
          isCorrect: false,
          explanation: 'Performance is not the trade. useState and useReducer both schedule the same kind of update; the difference is structure and testability.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'async-effects-race-conditions',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Slow Request Goes Out',
        phase: 'First Request In Flight',
        domState: 'Results from the previous search are still painted',
        screenContent: 'The user types "Ali" and keeps looking at the old list.',
        activeAction: 'The Effect fires a fetch for "Ali". The server is slow; the response is two seconds away.',
        closureSnapshot: 'request#1 { person: "Ali", ignore: false }',
        explanation: 'Nothing is wrong yet. A race needs two competitors, and the second one has not been dispatched.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Typing Continues — Cleanup Runs, Then the New Request',
        phase: 'Cleanup, Then Re-Sync',
        domState: 'Input now reads "Alice"',
        screenContent: 'The user finishes typing. The pending result is not what they asked for any more.',
        activeAction: 'React runs the previous cleanup first (setting that closure\'s ignore to true), then runs setup again with person === "Alice" and fires a fast request.',
        closureSnapshot: 'req#1.ignore = true | req#2 { person: "Alice", ignore: false }',
        explanation: 'This ordering is the entire mechanism: the old request is disarmed before the new one is armed. Without a cleanup there is no disarming step at all.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Fast Response Lands',
        phase: 'Fresh Response Committed',
        domState: 'Alice\'s bio is rendered',
        screenContent: 'The correct profile appears. Everything looks fine.',
        activeAction: 'The second request resolves. Its ignore flag is still false, so setData commits the fresh value.',
        closureSnapshot: 'bio = "Alice — frontend engineer…"',
        explanation: 'A clean frame proves nothing. The bug is still in flight; it just has not arrived.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Stale Response Overtakes the Truth',
        phase: 'Stale Overwrite Trap',
        domState: 'The text flips back to the previous person',
        screenContent: 'The input still says "Alice" but the panel now shows Ali\'s bio.',
        activeAction: 'The first request finally resolves. With no cleanup guarding it, its setData runs and wins — last writer, not latest request.',
        closureSnapshot: 'person = "Alice" | bio = "Ali — backend engineer…" (STALE)',
        explanation: 'This is the defining signature of the trap: request order and response order disagree, and React cannot tell the difference because both settlements are legitimate state updates.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. Two Guards, Different Costs',
        phase: 'Stale Guard Armed',
        domState: 'Only the newest request may write',
        screenContent: 'At any typing speed, the panel shows the answer to the query in the input.',
        activeAction: 'ignore = true discards the result before setData. controller.abort() cancels the network work itself and frees the connection.',
        closureSnapshot: 'stale result dropped | AbortError filtered, real errors still surface',
        explanation: 'The ignore flag is what react.dev documents. AbortController goes one step further and stops the work, which matters when bandwidth or server load is real.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'The Stale Overwrite Race',
        subtitle: 'State says Alice, the screen says Ali, and nothing in the console complains',
        why: 'Network responses arrive in whatever order the network decides. An Effect with no cleanup accepts every settlement, so a slow earlier request overwrites a fast later one. There is no error, no warning, and the reproduction depends on timing — which is why it survives testing and reaches the fastest typist in production.',
        fix: 'Give every fetch Effect a cleanup that either sets ignore = true or calls controller.abort(). For anything beyond a toy, replace the hand-rolled fetch with TanStack Query or SWR, which close this hole along with caching and deduplication.',
        designPattern: 'Double Buffer with a generation counter (classic concurrency): only the newest generation may write to the visible buffer. ignore is that counter; AbortController is a cancellation token at the transport layer.',
      },
      {
        order: 2,
        title: 'Guarding Only on Unmount',
        subtitle: 'The cleanup runs far more often than the name suggests',
        why: 'Cleanup fires before every re-sync, not just when the component disappears. Code that assumes a single teardown — clearing a module-level cache, resetting a shared flag — corrupts state on the second keystroke. The component is still mounted; the guard already ran.',
        fix: 'Write cleanup as the exact inverse of setup for one cycle. Never accumulate across cycles, and think about one setup/cleanup pair in isolation rather than the component\'s whole lifetime.',
        designPattern: 'Resource Acquisition Is Initialization: acquire and release are a pair scoped to one lifetime. Cleanup is that release, and its lifetime is the dependency array, not the component.',
      },
      {
        order: 3,
        title: 'Swallowing Every Error to Silence AbortError',
        subtitle: 'One catch block hides the cancellation and the outage together',
        why: 'AbortController rejects with a DOMException named AbortError, so the obvious fix is a bare catch. That also swallows 500s, CORS failures, and schema mismatches — the component simply renders nothing and the incident gets attributed to the backend.',
        fix: 'Filter on the name: rethrow anything that is not an AbortError. Let real failures reach an error boundary or a toast instead of vanishing.',
        designPattern: 'Exception Translation, done precisely: translate exactly one expected exception and let everything else propagate unchanged.',
      },
    ],
    comparison: {
      title: 'Bare fetch vs. an abort guard',
      subtitle: 'Why the demo passes, the test suite passes, and the fast typist still sees the wrong person',
      badLabel: 'Bare fetch, no guard',
      badGotcha: 'The assistant writes fetch().then(setBio) with no cleanup. It works in every manual test because manual tests type slowly. The first user who edits the query twice in under a second gets a stale bio and no explanation.',
      goodLabel: 'AbortController with error filtering',
      goodReason: 'Cleanup cancels the previous request before the next one starts, so the stale response never reaches the then chain. AbortError is filtered; genuine failures still surface.',
      badCode: `// ❌ Last resolve wins, not last request
useEffect(() => {
  fetchBio(person).then((bio) => setBio(bio));
}, [person]);`,
      goodCode: `// ✅ The previous request is cancelled before the next starts
useEffect(() => {
  const controller = new AbortController();

  fetchBio(person, { signal: controller.signal })
    .then((bio) => setBio(bio))
    .catch((err) => {
      if (err.name !== "AbortError") throw err;
    });

  return () => controller.abort();
}, [person]);`,
      footerNote: 'If the catch block is longer than the fetch, ask whether you should be using a data library instead.',
    },
    decisionTree: {
      title: 'Decision Tree: how do you stop stale responses from winning?',
      subtitle: 'The answer depends on whether the request is repeatable and whether the work is expensive',
      rootQuestion: 'Does this Effect fetch something that depends on a value the user can change while the request is in flight?',
      nodes: {
        branchA: 'Yes — a query, an id, a selected tab, a filter',
        resultA: 'A cleanup is mandatory. Start with the ignore flag; it is what react.dev documents and it needs no polyfill.',
        codeA: `useEffect(() => {
  let ignore = false;
  fetchBio(person).then((r) => { if (!ignore) setBio(r); });
  return () => { ignore = true; };
}, [person]);`,
        branchB: 'Yes — and the request is expensive, or you also need caching and deduplication',
        subQuestion: 'Does the app already depend on a server-state library, or is this the first data-fetching screen?',
        yesLabel: 'A library is already in place, or the app has several data screens',
        yesResult: 'Reach for TanStack Query or SWR. Cancellation, caching and revalidation are solved there, and react.dev recommends exactly this for production.',
        codeYes: "const { data } = useQuery({ queryKey: ['bio', person], queryFn: fetchBio });",
        noLabel: 'It is one screen and a library is not worth the dependency yet',
        noResult: 'AbortController in cleanup, with an AbortError filter so real failures still surface.',
        codeNo: 'const c = new AbortController(); fetchBio(person, { signal: c.signal }); return () => c.abort();',
      },
    },
    quiz: {
      title: 'Quiz: after both requests settle, what is on screen?',
      subtitle: 'Trace the settlements, not the dispatches',
      codeSnippet: `// person changes 'Ali' → 'Alice'
// request#1 (Ali)   : slow — resolves after 2000ms
// request#2 (Alice) : fast — resolves after 200ms
useEffect(() => {
  fetchBio(person).then(setBio);
}, [person]);`,
      question: 'Both requests resolve. What does the panel show?',
      options: [
        {
          text: "Alice's bio — React discards the older request automatically.",
          isCorrect: false,
          explanation: 'React has no notion of request age. Both settlements are ordinary state updates and both are accepted.',
        },
        {
          text: "Ali's bio — the first request resolved last, so its setBio overwrote the newer one while person is still 'Alice'.",
          isCorrect: true,
          explanation: 'Correct. Resolution order is not dispatch order. The last setState call wins, and here that call carries the older data.',
        },
        {
          text: 'A concurrent setState warning is thrown.',
          isCorrect: false,
          explanation: 'Concurrent setState calls are completely legal. Only the value is wrong, and nothing detects that.',
        },
        {
          text: 'The panel stays in a loading state because neither request completes.',
          isCorrect: false,
          explanation: 'Both requests complete. The failure is the order they complete in, not whether they do.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'effect-cleanup',
    createShells: true,
    quickRefTs: `useEffect(() => {
  const controller = new AbortController();
  const id = setInterval(tick, 1000);
  window.addEventListener("resize", onResize);

  return () => {
    controller.abort();          // cancels in-flight work
    clearInterval(id);           // stops the timer
    window.removeEventListener("resize", onResize);
  };
}, []);`,
    quickRefJs: `useEffect(() => {
  const controller = new AbortController();
  const id = setInterval(tick, 1000);
  window.addEventListener("resize", onResize);

  return () => {
    controller.abort();
    clearInterval(id);
    window.removeEventListener("resize", onResize);
  };
}, []);`,
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. Setup Acquires the Resource',
        phase: 'Setup',
        domState: 'The live counter is connected',
        screenContent: 'The user sees the room connect and the member count start moving.',
        activeAction: 'The Effect opens a WebSocket for chatId = "general" and registers message and error handlers on it.',
        closureSnapshot: 'socket = new WebSocket("/ws?room=general")',
        explanation: 'Setup does not just compute something — it takes ownership of an external resource that will keep running after the function returns.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Dependency Changes — Cleanup Runs First',
        phase: 'Cleanup Before Re-Sync',
        domState: 'The old socket is closing',
        screenContent: 'The member count briefly freezes, then resumes on the new room.',
        activeAction: 'Before re-running setup for chatId = "random", React calls the cleanup returned by the previous setup. That cleanup holds the old socket in its closure and closes it.',
        closureSnapshot: 'cleanup#1 closes socket("/ws?room=general")',
        explanation: 'Cleanup is not an unmount hook. It runs every time the dependencies change, which is the entire reason subscriptions do not stack up.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. Setup Runs Again With the New Values',
        phase: 'Re-Sync',
        domState: 'One socket open, not two',
        screenContent: 'Messages from the new room arrive; none from the old one.',
        activeAction: 'A fresh setup opens a socket for "random" and stores a new cleanup. The old resource no longer exists.',
        closureSnapshot: 'socket = new WebSocket("/ws?room=random")',
        explanation: 'One live resource per render cycle. The count in the network panel stays at one.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Component Unmounts — Final Cleanup',
        phase: 'Teardown',
        domState: 'The connection is closed',
        screenContent: 'The user navigated away; nothing is left running in the background.',
        activeAction: 'React calls the latest cleanup one final time, closing the "random" socket.',
        closureSnapshot: 'cleanup#2 closes socket("/ws?room=random")',
        explanation: 'The closure is what makes this safe: each cleanup remembers its own resource instead of guessing which one is current.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: Setup and Cleanup Disagree',
        phase: 'Mismatched Mirror',
        domState: 'Two sockets open, one handler leaked',
        screenContent: 'The count doubles every time the room changes.',
        activeAction: 'The assistant writes setup for chatId but cleanup with a stale reference, or forgets the off() call. Each navigation leaves a live subscription behind.',
        closureSnapshot: 'listener#1 still bound after cleanup#1 ran',
        explanation: 'The rule is that cleanup undoes exactly what its own setup did. Anything asymmetric leaks, and it leaks silently until the tab is closed.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'The Mismatched Mirror',
        subtitle: 'Setup subscribes, cleanup forgets — and every navigation adds a listener',
        why: 'When cleanup removes a different handler than the one setup added, or omits the removal entirely, the old subscription survives. Nothing throws. The symptom is a message handled twice, a count that climbs by two on each visit, or a memory graph that never comes back down after hours of use.',
        fix: 'Write cleanup as a line-by-line inverse of setup, using the same variables. If setup calls addEventListener with a named handler, cleanup calls removeEventListener with that exact reference — which means not defining the handler inline.',
        designPattern: 'RAII / Scope Guard: acquire and release are a matched pair over one lifetime. The cleanup closes over the exact resource its setup created, so it never has to guess.',
      },
      {
        order: 2,
        title: 'Treating Cleanup as an Unmount Hook',
        subtitle: 'One extra subscription per dependency change, compounding quietly',
        why: 'Developers arriving from class components map cleanup to componentWillUnmount and assume it runs once. It runs before every re-sync with changed dependencies. Code that increments a shared counter or pushes into a module-level array therefore grows on every render that changes a dependency, not once at the end.',
        fix: 'Think in one cycle: setup, cleanup, repeat. Ask whether a single setup/cleanup pair is safe in isolation — that is the only question React asks of your Effect, and it asks it on every commit.',
        designPattern: 'Single-resource lifetime: the Effect owns one cycle, not the component\'s whole history. Accumulating across cycles is a leak by construction.',
      },
      {
        order: 3,
        title: 'The Async Setup Trap',
        subtitle: 'An Effect that returns a Promise has no cleanup at all',
        why: 'Making the setup function async means it returns a Promise, and React ignores anything that is not a function. The Effect looks cleaned up because the code says return, but nothing is registered. This pairs badly with fetching: every re-sync leaves another in-flight request that will still call setState.',
        fix: 'Keep the Effect synchronous. Define an async function inside it, call it, and return the cleanup from the outer scope. The ignore flag or a controller lives in that outer scope where cleanup can reach it.',
        designPattern: 'Interface Contract: React accepts exactly one return type from setup, a function. Returning anything else is silently equivalent to returning nothing.',
      },
    ],
    comparison: {
      title: 'Unpaired setup vs. mirror-image cleanup',
      subtitle: 'One line decides whether the subscription ends or outlives the component',
      badLabel: 'Setup with no matched cleanup',
      badGotcha: 'The assistant subscribes on mount and never unsubscribes, or calls removeEventListener with a freshly created arrow function that was never the one added. Each room change stacks another live socket, and the leak only shows up in a long session.',
      goodLabel: 'Cleanup that releases exactly what setup acquired',
      goodReason: 'The handler is stored once, so removal targets the same reference. The interval id comes from setup\'s own closure. One setup, one release, no accumulation across cycles.',
      badCode: `// ❌ Two leaks in six lines
function Chat({ chatId }: { chatId: string }) {
  useEffect(() => {
    const socket = new WebSocket(\`/ws?room=\${chatId}\`);
    // 🚨 no cleanup returned — socket survives every room change
    socket.onmessage = (e) => append(e.data);

    window.addEventListener("resize", () => layout());
    return () => {
      // 🚨 a different function object than the one added
      window.removeEventListener("resize", () => layout());
    };
  }, [chatId]);
}`,
      goodCode: `// ✅ Every acquisition has a matching release
function Chat({ chatId }: { chatId: string }) {
  useEffect(() => {
    const socket = new WebSocket(\`/ws?room=\${chatId}\`);
    const onMessage = (e: MessageEvent) => append(e.data);
    const onResize = () => layout();

    socket.addEventListener("message", onMessage);
    window.addEventListener("resize", onResize);

    return () => {
      socket.removeEventListener("message", onMessage);
      socket.close();
      window.removeEventListener("resize", onResize);
    };
  }, [chatId]);
}`,
      footerNote: 'If setup and cleanup do not mention the same variables, the Effect is not done.',
    },
    decisionTree: {
      title: 'Decision Tree: does this Effect need a cleanup?',
      subtitle: 'Ask what keeps running after the function returns',
      rootQuestion: 'Does setup create something that outlives the call — a subscription, timer, connection, observer, or request?',
      nodes: {
        branchA: 'Yes — it keeps running until someone stops it',
        resultA: 'Return a cleanup that stops exactly that resource. One pair per cycle, matched variables.',
        codeA: `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`,
        branchB: 'No — it is a synchronous computation with no external handle',
        subQuestion: 'Is the work actually triggered by a user action rather than by mounting?',
        yesLabel: 'Yes — a click, a submit, a keypress',
        yesResult: 'It belongs in the event handler. Effects are for synchronizing with the outside world, not for reacting to events.',
        codeYes: 'onClick={() => { track("purchase"); pay(); }}',
        noLabel: 'No — it is pure derivation from props and state',
        noResult: 'Compute it during render, and reach for useMemo only if the calculation is genuinely expensive.',
        codeNo: 'const total = items.reduce((sum, i) => sum + i.price, 0);',
      },
    },
    quiz: {
      title: 'Quiz: why does this Effect leak?',
      subtitle: 'Read the return type, not the intent',
      codeSnippet: `useEffect(() => {
  async function load() {
    const res = await fetch("/api/rooms");
    setRooms(await res.json());
  }
  load();
  return () => {
    abortController.abort();
  };
}, [userId]);`,
      question: 'This code has a cleanup function. What is actually wrong with it?',
      options: [
        {
          text: 'Nothing — the cleanup aborts the controller, so the request is cancelled.',
          isCorrect: false,
          explanation: 'The controller is never passed to fetch, so abort() has no effect on that request. The variable is decorative.',
        },
        {
          text: 'The controller is never connected to the request, so abort() cancels nothing and the response still calls setRooms after re-sync.',
          isCorrect: true,
          explanation: 'Correct. abort() only cancels work that received controller.signal. Here fetch was called without it, so every cycle leaves a live request that will still write state.',
        },
        {
          text: 'The async function cannot be declared inside an Effect.',
          isCorrect: false,
          explanation: 'Declaring and calling an async function inside a synchronous Effect is the correct pattern. What would break is making the Effect callback itself async.',
        },
        {
          text: 'The dependency array should be empty for a fetch.',
          isCorrect: false,
          explanation: 'An empty array would fetch once and never re-fetch when userId changes — a different bug, not a fix.',
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
    const r = await c.query(
      `INSERT INTO code_comparisons (slug, bad_code, good_code, related_topic_id, updated_at, created_at)
       VALUES ($1, '', '', $2, NOW(), NOW()) RETURNING id`,
      [slug, topic.id],
    );
    cmp = r.rows[0];
  }

  let dt = (await c.query('SELECT id FROM decision_trees WHERE slug = $1', [slug])).rows[0];
  if (!dt) {
    const r = await c.query(
      `INSERT INTO decision_trees (slug, related_topic_id, updated_at, created_at)
       VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
      [slug, topic.id],
    );
    dt = r.rows[0];
  }

  let qz = (await c.query('SELECT id FROM quizzes WHERE slug = $1', [slug])).rows[0];
  if (!qz) {
    const r = await c.query(
      `INSERT INTO quizzes (slug, related_topic_id, updated_at, created_at)
       VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
      [slug, topic.id],
    );
    qz = r.rows[0];
  }

  const opts = (await c.query(
    'SELECT id FROM quizzes_options WHERE _parent_id = $1 ORDER BY _order', [qz.id])).rows;
  if (opts.length === 0) {
    for (let i = 0; i < 4; i += 1) {
      await c.query(
        'INSERT INTO quizzes_options (_order, _parent_id, id, is_correct) VALUES ($1, $2, $3, false)',
        [i + 1, qz.id, newId()],
      );
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
      [spec.quickRefTs, spec.quickRefJs, topic.id],
    );
  }

  await c.query("DELETE FROM topics_timeline_steps WHERE _parent_id = $1 AND _locale = 'en'", [topic.id]);
  for (const s of spec.steps) {
    await c.query(
      `INSERT INTO topics_timeline_steps
        (_order,_parent_id,_locale,id,step_id,title,phase,dom_state,
         screen_content,active_action,closure_snapshot,explanation,highlight)
       VALUES ($1,$2,'en',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [s.order, topic.id, `${slug}-en-step-${s.stepId}`, s.stepId, s.title, s.phase,
        s.domState, s.screenContent, s.activeAction, s.closureSnapshot, s.explanation, s.highlight],
    );
  }

  await c.query("DELETE FROM topics_gotcha_radar WHERE _parent_id = $1 AND _locale = 'en'", [topic.id]);
  for (const g of spec.gotchas) {
    await c.query(
      `INSERT INTO topics_gotcha_radar
        (_order,_parent_id,_locale,id,title,subtitle,why,fix,design_pattern)
       VALUES ($1,$2,'en',$3,$4,$5,$6,$7,$8)`,
      [g.order, topic.id, `${slug}-en-gotcha-${g.order}`, g.title, g.subtitle, g.why, g.fix, g.designPattern],
    );
  }

  await c.query(
    'UPDATE code_comparisons SET bad_code = $1, good_code = $2, updated_at = NOW() WHERE id = $3',
    [spec.comparison.badCode, spec.comparison.goodCode, ids.cmpId],
  );
  await c.query("DELETE FROM code_comparisons_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.cmpId]);
  await c.query(
    `INSERT INTO code_comparisons_locales
      (_parent_id,_locale,title,subtitle,bad_label,bad_gotcha,good_label,good_reason,footer_note)
     VALUES ($1,'en',$2,$3,$4,$5,$6,$7,$8)`,
    [ids.cmpId, spec.comparison.title, spec.comparison.subtitle, spec.comparison.badLabel,
      spec.comparison.badGotcha, spec.comparison.goodLabel, spec.comparison.goodReason,
      spec.comparison.footerNote],
  );

  await c.query("DELETE FROM decision_trees_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.dtId]);
  await c.query(
    `INSERT INTO decision_trees_locales (_parent_id,_locale,title,subtitle,root_question,nodes)
     VALUES ($1,'en',$2,$3,$4,$5)`,
    [ids.dtId, spec.decisionTree.title, spec.decisionTree.subtitle,
      spec.decisionTree.rootQuestion, JSON.stringify(spec.decisionTree.nodes)],
  );

  await c.query('UPDATE quizzes SET code_snippet = $1, updated_at = NOW() WHERE id = $2',
    [spec.quiz.codeSnippet, ids.qzId]);
  await c.query("DELETE FROM quizzes_locales WHERE _parent_id = $1 AND _locale = 'en'", [ids.qzId]);
  await c.query(
    `INSERT INTO quizzes_locales (_parent_id,_locale,title,subtitle,question)
     VALUES ($1,'en',$2,$3,$4)`,
    [ids.qzId, spec.quiz.title, spec.quiz.subtitle, spec.quiz.question],
  );

  const opts = (await c.query(
    'SELECT id FROM quizzes_options WHERE _parent_id = $1 ORDER BY _order', [ids.qzId])).rows;
  if (opts.length !== spec.quiz.options.length) {
    throw new Error(`${slug}: has ${opts.length} quiz options, content defines ${spec.quiz.options.length}`);
  }
  for (let i = 0; i < spec.quiz.options.length; i += 1) {
    const o = spec.quiz.options[i];
    await c.query('UPDATE quizzes_options SET is_correct = $1 WHERE id = $2', [o.isCorrect, opts[i].id]);
    await c.query("DELETE FROM quizzes_options_locales WHERE _parent_id = $1 AND _locale = 'en'", [opts[i].id]);
    await c.query(
      `INSERT INTO quizzes_options_locales (_parent_id,_locale,text,explanation)
       VALUES ($1,'en',$2,$3)`,
      [opts[i].id, o.text, o.explanation],
    );
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
    console.log('\nBatch A (English primitives) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
