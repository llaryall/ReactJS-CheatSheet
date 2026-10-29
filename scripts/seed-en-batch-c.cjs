// English interactive primitives for the performance/internals batch:
//   react-memo · react-profiler · virtual-dom-basics
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
    slug: 'react-memo',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Parent Re-renders',
        phase: 'Parent Render',
        domState: 'Nothing has changed yet',
        screenContent: 'The user types in a filter box above a large table.',
        activeAction: 'The parent\'s state changes, so React begins rendering it again. Its children are candidates for a re-render, not obligations.',
        closureSnapshot: 'parentState = { filter: "act" }',
        explanation: 'A parent render does not automatically re-render memoized children. It offers them a render, and memo decides whether to accept.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. memo Compares Props by Reference',
        phase: 'Shallow Compare',
        domState: 'The heavy table has not been touched',
        screenContent: 'The table does not flicker; it was skipped.',
        activeAction: 'React walks the prop object and compares each entry with Object.is. Every prop is the same reference, so the comparison short-circuits to "skip".',
        closureSnapshot: 'prevProps === nextProps on every key → bail out',
        explanation: 'The comparison is one level deep. A new object with identical contents fails it, because the reference changed.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. The Inline Callback Defeats It',
        phase: 'Reference Break Trap',
        domState: 'The heavy table flickers',
        screenContent: 'Typing feels sluggish; every keypress repaints the whole list.',
        activeAction: 'The parent passes onSelect={(id) => pick(id)}. A new function is allocated on every render, so Object.is returns false and memo re-renders the table anyway.',
        closureSnapshot: 'onSelect: fn#1 !== fn#2 (same code, new reference)',
        explanation: 'This is the pattern that ships: memo present, effect zero. The hook is not broken; the prop identity was never stable.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. Stabilising the Reference',
        phase: 'Identity Fix',
        domState: 'The table goes quiet again',
        screenContent: 'Typing is smooth even with ten thousand rows.',
        activeAction: 'onSelect is wrapped in useCallback with an empty dependency list, so the same function object is reused across renders. Now the comparison passes.',
        closureSnapshot: 'onSelect: fn#1 === fn#2 → bail out',
        explanation: 'memo and useCallback are a pair. Adding one without the other is the most common way this optimization silently does nothing.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. memo Cannot Stop What It Does Not See',
        phase: 'Scope Limit',
        domState: 'The component re-renders despite memo',
        screenContent: 'The memoized panel still repaints on every keystroke.',
        activeAction: 'The panel reads a context value that changes on each keystroke, or holds its own state. Neither goes through the prop comparison, so memo never gets a vote.',
        closureSnapshot: 'context value changed → render bypasses prop equality',
        explanation: 'memo filters one input: props. Context, local state and internal hooks are all upstream of it.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'memo That Never Bails Out',
        subtitle: 'The wrapper is present, the re-renders never stopped',
        why: 'A parent passing an inline object, array or arrow function gives the child a fresh reference on every render. Object.is fails, memo re-renders, and the only thing that changed is that the code now looks optimized. In a large tree this can mean thousands of wasted renders per interaction with the reviewer assuming the work is done.',
        fix: 'Stabilise the props first: useCallback for handlers, useMemo for object and array literals, or hoist constants to module scope. Then measure — memo without stable props is decorative.',
        designPattern: 'Identity Map (Dive Into Design Patterns): correctness depends on object identity, not structural equality. If the identity changes every time, the cache can never hit.',
      },
      {
        order: 2,
        title: 'Memoizing Everything by Default',
        subtitle: 'A codebase wrapped in memo, none of it measured',
        why: 'memo is not free. Every render performs a shallow comparison, and it stores an extra fiber. Applied to components that re-render rarely or are cheap, the comparison can cost more than the render it avoids. It also makes the tree harder to reason about, since props no longer flow the way the code suggests.',
        fix: 'Profile first, then memoize the exact boundary the profiler identifies. React Compiler removes most of this decision in React 19, which is another reason not to pre-emptively wrap everything.',
        designPattern: 'Premature optimization, in the original Knuth sense: the cost of the mechanism is paid unconditionally, while the benefit is speculative.',
      },
      {
        order: 3,
        title: 'Expecting memo to Freeze State or Context',
        subtitle: 'The memoized component still re-renders, and the search for the cause goes elsewhere',
        why: 'memo compares props only. A component that consumes a changing context, or owns state that updates, will still render. Teams often conclude memo is broken and start removing it, when the real fix is splitting the context or moving the state down.',
        fix: 'Ask what caused the render before reaching for memo. React DevTools "Why did this render?" answers it in one click: props, state, or context.',
        designPattern: 'Separation of Concerns: memo is one gate for one input. Routing all performance problems through it confuses the tool with the architecture.',
      },
    ],
    comparison: {
      title: 'memo with unstable props vs. memo that actually bails',
      subtitle: 'Identical JSX, completely different behaviour under load',
      badLabel: 'Inline props defeat the wrapper',
      badGotcha: 'The assistant adds memo to the expensive table and passes onSelect={(id) => pick(id)}. The reference changes on every parent render, so the comparison always fails and the table re-renders on every keystroke — with a memo badge in the diff.',
      goodLabel: 'Stable handler, real bail-out',
      goodReason: 'useCallback keeps the handler reference across renders, so memo\'s shallow comparison succeeds and the subtree is skipped entirely.',
      badCode: `// ❌ memo is present and does nothing
const HeavyTable = memo(function HeavyTable({ rows, onSelect }) {
  return rows.map((r) => <Row key={r.id} row={r} onClick={onSelect} />);
});

function Page({ rows }) {
  const [filter, setFilter] = useState("");
  return (
    <>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {/* 🚨 new function reference on every render */}
      <HeavyTable rows={rows} onSelect={(id) => pick(id)} />
    </>
  );
}`,
      goodCode: `// ✅ The reference survives the re-render
const HeavyTable = memo(function HeavyTable({ rows, onSelect }) {
  return rows.map((r) => <Row key={r.id} row={r} onClick={onSelect} />);
});

function Page({ rows }) {
  const [filter, setFilter] = useState("");
  const onSelect = useCallback((id) => pick(id), []);

  return (
    <>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <HeavyTable rows={rows} onSelect={onSelect} />
    </>
  );
}`,
      footerNote: 'If React Compiler is enabled, delete most of this. It is the tool this pattern was waiting for.',
    },
    decisionTree: {
      title: 'Decision Tree: should this component be wrapped in memo?',
      subtitle: 'Start from a measurement, not from a rule of thumb',
      rootQuestion: 'Has the profiler shown this component re-rendering without its props changing?',
      nodes: {
        branchA: 'No — nobody has measured it',
        resultA: 'Do not add memo. Measure with the Profiler first; the flame graph tells you which subtree actually costs time.',
        codeA: '<Profiler id="table" onRender={logRender}><Table rows={rows} /></Profiler>',
        branchB: 'Yes — it re-renders on parent updates with identical props',
        subQuestion: 'Are all of its props reference-stable across those renders?',
        yesLabel: 'Yes — primitives, or stable callbacks and memoized objects',
        yesResult: 'Wrap it in memo. The comparison will pass and the subtree will be skipped.',
        codeYes: 'const Row = memo(function Row({ item, onPick }) { /* … */ });',
        noLabel: 'No — the parent creates objects, arrays or inline functions',
        noResult: 'Fix the identity first: useCallback, useMemo, or move the literal to module scope. memo alone changes nothing.',
        codeNo: 'const onPick = useCallback((id) => pick(id), []);',
      },
    },
    quiz: {
      title: 'Quiz: why does this memo never bail out?',
      subtitle: 'Two components, one identical prop',
      codeSnippet: `const Row = memo(function Row({ item }) {
  return <li>{item.label}</li>;
});

function List({ items }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {items.map((item) => (
        <Row key={item.id} item={{ ...item }} />
      ))}
    </div>
  );
}`,
      question: 'Toggling the button re-renders every Row, even though the data has not changed. Why?',
      options: [
        {
          text: 'memo does not work on list items.',
          isCorrect: false,
          explanation: 'memo works on any component. The position in a list is irrelevant to the comparison.',
        },
        {
          text: 'item={{ ...item }} creates a new object on every render, so the shallow comparison fails for every row.',
          isCorrect: true,
          explanation: 'Correct. The spread produces a fresh reference each time. memo compares by Object.is, sees a different object, and re-renders — with identical contents.',
        },
        {
          text: 'useState inside List forces all children to re-render by design.',
          isCorrect: false,
          explanation: 'Parent state makes children candidates for a re-render, not obligations. memo is exactly the mechanism that lets them decline.',
        },
        {
          text: 'The key prop must be passed to memo as a second argument.',
          isCorrect: false,
          explanation: 'key is handled by React\'s list reconciliation and is never part of props. It has nothing to do with memo\'s comparison.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'react-profiler',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Profiler Wraps the Suspect Subtree',
        phase: 'Instrumentation',
        domState: 'Nothing visible — a component and a callback',
        screenContent: 'The page looks exactly the same as before.',
        activeAction: 'A <Profiler id="inbox" onRender={onRender}> element is placed around the subtree. It renders nothing and adds no DOM node.',
        closureSnapshot: 'id = "inbox" → all commits in this subtree are reported',
        explanation: 'You get measurements from a boundary you chose, not from the whole application. That difference is what makes the numbers readable.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. An Interaction Triggers a Commit',
        phase: 'Commit Measured',
        domState: 'The list updates',
        screenContent: 'The user marks a message as read.',
        activeAction: 'React commits the update and calls onRender with the phase, actualDuration and baseDuration for that pass.',
        closureSnapshot: '{ phase: "update", actualDuration: 12.4, baseDuration: 48.1 }',
        explanation: 'The callback fires once per commit, after the work is done. It never measures during render.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. actualDuration vs. baseDuration',
        phase: 'Interpretation',
        domState: 'No change',
        screenContent: 'No change — this step is reading numbers, not the page.',
        activeAction: 'baseDuration is the worst-case cost of rendering the subtree from scratch. actualDuration is what this pass actually spent, memoization included.',
        closureSnapshot: 'actual 12.4ms vs base 48.1ms → memoization is doing real work',
        explanation: 'If the two numbers are close, nothing is being skipped. Those milliseconds are the honest answer to "is my memo helping?"',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Trap: Memoizing Before Measuring',
        phase: 'Speculative Optimization',
        domState: 'The tree is littered with memo wrappers',
        screenContent: 'The app is not visibly faster, and keyboard input still lags.',
        activeAction: 'A dozen components were wrapped in memo without profiling. The real cost was a context provider re-broadcasting on every keystroke, which memo cannot intercept.',
        closureSnapshot: 'memo × 12 | actual ≈ base | cause still unaddressed',
        explanation: 'Without a baseline there is no way to tell an improvement from a decoration. The profile would have pointed at the provider in one render.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Fix Is at the Source',
        phase: 'Targeted Fix',
        domState: 'One boundary changed, not twelve',
        screenContent: 'Typing is smooth again.',
        activeAction: 'The context is split so keystrokes stop notifying consumers that do not read the input value. actualDuration drops for the whole subtree — not just the memoized leaves.',
        closureSnapshot: 'actual 4.2ms (was 12.4ms) with a single structural change',
        explanation: 'Profiling does not tell you to add memo. It tells you where the time is, and the fix is usually structural.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Optimizing Without a Baseline',
        subtitle: 'Twelve memo wrappers, no number that ever moved',
        why: 'Without a before/after measurement there is no evidence the work helped, and worse, no way to know whether it addressed the actual bottleneck. Teams ship a large diff of memo wrappers, the frame time stays at 22ms, and the next investigation starts from zero.',
        fix: 'Wrap the suspect subtree in a Profiler, record actualDuration and baseDuration for a representative interaction, make one change, record again. Keep the two numbers in the PR description.',
        designPattern: 'Measure-Twice: an optimization without a baseline is a hypothesis, not an improvement. The profiler is the experiment.',
      },
      {
        order: 2,
        title: 'Reading actualDuration as Absolute Cost',
        subtitle: 'Comparing numbers across machines and builds',
        why: 'Profiler timings are wall-clock measurements of the machine you are on. A 4ms commit on a developer workstation can be 40ms on a mid-range Android, and production builds run faster than dev builds because of less instrumentation. Comparing a dev number to a production number, or to a colleague\'s laptop, produces conclusions that do not survive.',
        fix: 'Compare against yourself: same machine, same build type, same interaction, before and after. Treat the ratio between actual and base as the meaningful signal, not the raw milliseconds.',
        designPattern: 'Controlled Experiment: hold the environment fixed and vary one thing. Otherwise the measurement describes the machine, not the code.',
      },
      {
        order: 3,
        title: 'Leaving the Profiler in Production',
        subtitle: 'An onRender callback that posts to analytics on every commit',
        why: 'onRender fires on every commit in the subtree it wraps. A callback that logs, serialises, or posts to a network endpoint adds overhead proportional to render frequency — and profiler subtrees can commit dozens of times per second during interactions.',
        fix: 'Gate instrumentation behind a development check, or remove it once the investigation closes. If you need production timing, use the User Timing API through the React DevTools profiler build instead.',
        designPattern: 'Observer with a cost: every notification has a price, and this one fires on the hottest path in the application.',
      },
    ],
    comparison: {
      title: 'Memoizing by intuition vs. profiling first',
      subtitle: 'One measurement replaces a dozen guesses',
      badLabel: 'Optimize, then hope',
      badGotcha: 'The assistant sees a slow page and wraps components in memo until the diff is large enough to look like work. Frame time barely moves because the cost was never in those components.',
      goodLabel: 'Measure, change one thing, measure again',
      goodReason: 'The Profiler names the expensive subtree and shows whether memoization is already effective. The change targets the component with the largest gap between actual and base duration.',
      badCode: `// ❌ No measurement anywhere
const Sidebar = memo(function Sidebar() { /* … */ });
const Toolbar = memo(function Toolbar() { /* … */ });
const List = memo(function List({ items }) { /* … */ });
const Row = memo(function Row({ item }) { /* … */ });
// frame time: still 22ms

export default function Page() {
  return (
    <Layout>
      <Sidebar />
      <Toolbar />
      <List items={items} />
    </Layout>
  );
}`,
      goodCode: `// ✅ One boundary, one number, one change
import { Profiler } from "react";

function onRender(id, phase, actualDuration, baseDuration) {
  if (import.meta.env.DEV) {
    console.log(id, phase, { actualDuration, baseDuration });
  }
}

export default function Page() {
  return (
    <Profiler id="inbox" onRender={onRender}>
      <Layout>
        <Sidebar />
        <Toolbar />
        <List items={items} />
      </Layout>
    </Profiler>
  );
}`,
      footerNote: 'If actual and base are the same number, memoization is not your problem — and no amount of it will help.',
    },
    decisionTree: {
      title: 'Decision Tree: is memoization actually working?',
      subtitle: 'Two numbers from one callback answer it',
      rootQuestion: 'What do actualDuration and baseDuration say about the subtree?',
      nodes: {
        branchA: 'actualDuration is close to baseDuration',
        resultA: 'Nothing is being skipped. Adding memo will not help — look for a context re-broadcast, a large child that always renders, or state living too high in the tree.',
        codeA: '// actual 44ms / base 48ms → look for structural causes',
        branchB: 'actualDuration is far below baseDuration',
        subQuestion: 'Is the remaining cost concentrated in one child rather than spread across siblings?',
        yesLabel: 'Yes — one child dominates the flame graph',
        yesResult: 'That child is the target. Check whether its props are reference-stable before reaching for memo, then profile again.',
        codeYes: 'const onSelect = useCallback((id) => pick(id), []);',
        noLabel: 'No — no single child stands out',
        noResult: 'The cost is distribution, not a hotspot. Reduce what re-renders at the top: colocate state, split context, or defer the update with useDeferredValue.',
        codeNo: 'const deferred = useDeferredValue(query);',
      },
    },
    quiz: {
      title: 'Quiz: what does actual ≈ base tell you?',
      subtitle: 'The gap is the signal',
      codeSnippet: `// Profiler reported:
// phase="update"
// actualDuration = 44.2ms
// baseDuration   = 46.0ms`,
      question: 'What is the correct reading of these two numbers?',
      options: [
        {
          text: 'Memoization is working well and no further work is needed.',
          isCorrect: false,
          explanation: 'It is the opposite. A near-zero gap means almost nothing is being skipped.',
        },
        {
          text: 'Almost the entire subtree rendered from scratch. Memoization is not saving anything, so the cause is structural.',
          isCorrect: true,
          explanation: 'Correct. baseDuration is the cost of rendering everything; actual nearly equals it, so the update paid full price. Adding memo at the leaves would not fix a cost that originates above them.',
        },
        {
          text: 'The component mounted for the first time.',
          isCorrect: false,
          explanation: 'The phase is "update", not "mount". Mount also converges toward base duration, but the phase field already distinguishes them.',
        },
        {
          text: 'The Profiler is measuring the wrong subtree.',
          isCorrect: false,
          explanation: 'The profiler measures exactly what it wraps. A near-equal pair is a valid and useful measurement — it rules memoization out.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'virtual-dom-basics',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. State Changes, Render Runs in Memory',
        phase: 'Render Phase',
        domState: 'The browser has not been touched',
        screenContent: 'The counter on screen still shows the old value.',
        activeAction: 'React calls the component function and receives a new tree of lightweight element objects. These are plain JavaScript descriptions, not DOM nodes.',
        closureSnapshot: 'prevTree = <div><span>3</span></div> | nextTree = <div><span>4</span></div>',
        explanation: 'Creating elements is cheap. No layout is triggered and no pixels move during this step.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. Diffing Compares Two Descriptions',
        phase: 'Reconciliation',
        domState: 'Still untouched',
        screenContent: 'No visual change yet.',
        activeAction: 'React walks both trees, matches nodes by position and type, and collects the minimal set of mutations: in this case, one text node.',
        closureSnapshot: 'diff = [{ type: "TEXT", path: [0, 0], value: "4" }]',
        explanation: 'The value of the diff is not speed — it is that you never wrote the traversal. You described the result and React worked out the steps.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Only the Difference Reaches the DOM',
        phase: 'Commit',
        domState: 'One text node updated',
        screenContent: 'The counter reads 4.',
        activeAction: 'React applies the single mutation. The surrounding div and span are not recreated, so focus, scroll position and input state survive.',
        closureSnapshot: 'span.firstChild.nodeValue = "4"',
        explanation: 'This is the part that makes forms usable. A naive re-render would replace the input node and drop the cursor on every keystroke.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Performance Myth',
        phase: 'Misconception',
        domState: 'Unchanged',
        screenContent: 'Unchanged.',
        activeAction: 'The diff is not free. React compared two trees and allocated a new one to get a single text update — measured against one direct DOM write, the virtual DOM loses.',
        closureSnapshot: 'tree allocation + traversal vs. one nodeValue write',
        explanation: 'The win appears when updates are frequent and the tree is large: you avoid hand-written traversal bugs, not milliseconds.',
        highlight: true,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Trap: High-Frequency State',
        phase: 'Thrashing',
        domState: 'The page stutters',
        screenContent: 'Scrolling feels heavy; the cursor lags behind the mouse.',
        activeAction: 'A mousemove handler writes to state on every event. Each event allocates a tree, diffs it, and commits — hundreds of times per second, for a value the user sees as continuous motion.',
        closureSnapshot: 'mousemove → setState → render → diff → commit (×120)',
        explanation: 'The virtual DOM amortises structural complexity. It does not make an O(events) render loop cheap, and nothing in React pretends otherwise.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Believing the Virtual DOM Is Faster Than the DOM',
        subtitle: 'The claim nobody measured against a direct update',
        why: 'A single targeted DOM write will always beat "allocate a tree, diff it, write one node". React is not faster per operation; it is faster to build and maintain for complex UIs, because you specify the outcome instead of the mutation sequence. Treating it as a performance guarantee leads to render-triggering code that a direct write would have handled trivially.',
        fix: 'Reach for state when the UI must derive from it. For values that change on every mouse move or scroll tick, use a ref and mutate the DOM directly — or throttle before it reaches state.',
        designPattern: 'Virtual Proxy (Dive Into Design Patterns): the virtual tree is a stand-in that defers real work. A proxy adds a layer, and layers cost something. You buy clarity, not throughput.',
      },
      {
        order: 2,
        title: 'High-Frequency State Updates',
        subtitle: 'A mousemove handler that renders a hundred times per second',
        why: 'Scroll and pointer events fire far faster than the screen refreshes. Wiring them straight into state means every event triggers a full render, diff and commit for a change the user cannot perceive. On low-end hardware this saturates the main thread and the interaction degrades exactly when it matters.',
        fix: 'Throttle to one update per frame with requestAnimationFrame, or keep the value in a ref and write it to the DOM imperatively. Let state carry what the UI must react to, not every raw event.',
        designPattern: 'Debounce and Throttle, sampled at display rate: the rate that matters is the refresh rate, not the event rate.',
      },
      {
        order: 3,
        title: 'Thinking the Virtual DOM Is a Cache',
        subtitle: 'Assuming work is skipped because the tree already exists',
        why: 'There is no memoization at the tree level. Every render runs your component functions and builds new elements. Skipping work only happens where you asked for it — memo, useMemo, useCallback — or where React Compiler inserts it. Developers who assume otherwise are surprised by profiling output showing every function executing on every keystroke.',
        fix: 'Treat render output as disposable and the render itself as the cost. Optimise by reducing how often and how far renders propagate, not by hoping the tree remembers.',
        designPattern: 'Flyweight (Dive Into Design Patterns): elements are lightweight and shared descriptions. The flyweight pattern reduces per-object cost; it does not cache the computation that produced them.',
      },
    ],
    comparison: {
      title: 'Declarative render vs. imperative DOM updates',
      subtitle: 'What the abstraction actually buys',
      badLabel: 'Hand-written DOM mutation per event',
      badGotcha: 'The assistant decides the virtual DOM is wasteful and writes manual querySelector updates. It works until a node is removed by another branch of the UI, and then every following update throws on a detached element.',
      goodLabel: 'Describe the result, let the diff apply it',
      goodReason: 'You never look up nodes. React owns the mapping from your description to the live tree, so removed or reordered elements cannot leave you holding a stale reference.',
      badCode: `// ❌ Every update has to find its own node
function Counter() {
  const countRef = useRef(0);
  const labelRef = useRef(null);

  function increment() {
    countRef.current += 1;
    // 🚨 manual lookup, manual write, manual sync
    labelRef.current.textContent = \`Count: \${countRef.current}\`;
  }

  return (
    <div>
      <span ref={labelRef}>Count: 0</span>
      <button onClick={increment}>+1</button>
    </div>
  );
}`,
      goodCode: `// ✅ The result is described once
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}`,
      footerNote: 'The virtual DOM did not make the browser faster. It moved the traversal into React so you stopped writing it.',
    },
    decisionTree: {
      title: 'Decision Tree: state or imperative write?',
      subtitle: 'How often does the value change, and does the UI depend on it?',
      rootQuestion: 'Does the value need to be reflected in the rendered output?',
      nodes: {
        branchA: 'Yes — it drives what the user sees',
        resultA: 'State. React owns the DOM, and the diff will apply the minimal mutation. This is the case the abstraction was built for.',
        codeA: 'const [isOpen, setIsOpen] = useState(false);',
        branchB: 'No — it is an implementation detail, or it changes faster than the screen',
        subQuestion: 'Does it update more often than once per frame (scroll, pointer, animation)?',
        yesLabel: 'Yes — it fires dozens of times per second',
        yesResult: 'A ref plus a direct DOM write, or requestAnimationFrame. Routing every event through state means a full render per event.',
        codeYes: 'rafRef.current ??= requestAnimationFrame(() => { node.style.transform = `translateX(${x}px)`; });',
        noLabel: 'No — it just needs to survive re-renders',
        noResult: 'A ref. Changing it must not trigger a render, and React will not notice when it does.',
        codeNo: 'const idRef = useRef(0); idRef.current += 1;',
      },
    },
    quiz: {
      title: 'Quiz: what does the virtual DOM actually optimise?',
      subtitle: 'Speed is not one of the options',
      codeSnippet: `const [count, setCount] = useState(0);
return <span onClick={() => setCount(count + 1)}>Count: {count}</span>;`,
      question: 'When count changes, what does React actually do?',
      options: [
        {
          text: 'It renders faster than a direct DOM update because the DOM is slow.',
          isCorrect: false,
          explanation: 'For a single text change, a direct write is faster. React adds a tree allocation and a traversal on top of the same write.',
        },
        {
          text: 'It rebuilds the element tree in memory, diffs it against the previous one, and commits only the text change.',
          isCorrect: true,
          explanation: 'Correct. That is the entire mechanism, and it is why the surrounding nodes and their browser state survive the update.',
        },
        {
          text: 'It reloads the component from the bundler and replaces the DOM node.',
          isCorrect: false,
          explanation: 'Nothing is fetched or reloaded at update time. The component function is already in memory.',
        },
        {
          text: 'It caches the previous render and skips the component entirely.',
          isCorrect: false,
          explanation: 'No tree-level caching exists. The function runs again and a new tree is produced, unless memo or React Compiler opts that component out.',
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
    console.log('\nBatch C (performance & internals) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
