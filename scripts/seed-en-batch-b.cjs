// English interactive primitives for the forms batch:
//   controlled-forms · advanced-form-validation · form-actions-server-forms
// form-actions-server-forms has no primitive shells and no quickRef — built from scratch here.
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
    slug: 'controlled-forms',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Keystroke Never Reaches the DOM First',
        phase: 'Intercepted Event',
        domState: 'The input still shows the previous character',
        screenContent: 'The user presses "a" and for one frame nothing changes.',
        activeAction: 'React intercepts the native input event. Because the element has a value prop, React controls what the DOM shows and defers to state.',
        closureSnapshot: 'event.value = "a" | state = ""',
        explanation: 'This is the defining property of a controlled input. It cannot display anything state has not approved.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. onChange Enqueues the Update',
        phase: 'State Dispatch',
        domState: 'Still the old value — the commit has not happened',
        screenContent: 'The cursor sits still; the character is in flight, not on screen.',
        activeAction: 'The handler calls setForm(prev => ({ ...prev, username: "a" })), scheduling a render.',
        closureSnapshot: 'enqueued = { username: "a" }',
        explanation: 'Nothing is eager here. Every character is a state transaction, which is the cost that buys you control.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. New Render, Then the Character Appears',
        phase: 'Commit',
        domState: 'input.value is now "a"',
        screenContent: 'The "a" lands in the field, in sync with state.',
        activeAction: 'React re-renders the component with the new form object and writes the resulting value to the DOM node.',
        closureSnapshot: 'state = { username: "a" } | DOM = "a"',
        explanation: 'State and the DOM never diverge for longer than a frame. That is what makes live masking and validation possible.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Whole Form Re-renders on Every Letter',
        phase: 'Re-render Cost',
        domState: 'Nothing visibly wrong — just work being done',
        screenContent: 'Typing feels fine on a laptop and slightly laggy on an older phone.',
        activeAction: 'A state update at the form level re-renders the form component and every child that is not memoized. Thirty keystrokes, thirty full-form renders.',
        closureSnapshot: '30 keystrokes → 30 renders of the form subtree',
        explanation: 'The cost is not the single character. It is everything that hangs off the component holding the state.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Uncontrolled-to-Controlled Flip',
        phase: 'Contradiction Trap',
        domState: 'Console fills with a warning',
        screenContent: 'The user can suddenly type again — the field is behaving differently than before.',
        activeAction: 'value started as undefined, so React treated the input as uncontrolled. The first keystroke made it controlled, and React warns about the switch.',
        closureSnapshot: 'initial: undefined → controlled → "changing an uncontrolled input"',
        explanation: 'React decides controlled-or-not on the first render. Changing that decision later is undefined behaviour, and React says so.',
        highlight: true,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'Per-Keystroke Re-render Lag',
        subtitle: 'Fine on a developer laptop, unusable on a mid-range Android',
        why: 'A single form-level state object means every keystroke re-renders the form and all of its children. With thirty fields and a live preview, that is thirty renders per character. The profiling graph looks like a sawtooth and the page feels out of sync with the keyboard.',
        fix: 'Isolate each field into its own component so state lives closer to the input, or drop the controlled pattern entirely for fields that are only read on submit — React 19 Actions read FormData natively.',
        designPattern: 'Composite with local ownership: a form is a tree, and state placed at the root of a tree pays the cost of the whole tree. Place it where the change happens.',
      },
      {
        order: 2,
        title: 'The Uncontrolled-to-Controlled Flip',
        subtitle: 'value={undefined} makes React change its mind about your input',
        why: 'React decides on the first render whether an input is controlled. Passing undefined — usually from a user object that has not loaded yet — makes it uncontrolled; the first keystroke makes it controlled. React warns, and in some paths the cursor jumps to the end of the field.',
        fix: 'Always coerce: value={user?.name ?? ""}. The same applies to checkbox checked props. Never let the presence of a value depend on whether data has arrived.',
        designPattern: 'Invariant: the mode of a component must not change over its lifetime. Changing it is the equivalent of swapping the implementation under a live instance.',
      },
      {
        order: 3,
        title: 'value Without onChange',
        subtitle: 'A read-only input that looks broken and reports nothing',
        why: 'A value prop with no onChange renders a field the user cannot edit. React logs a warning in the console, but in a busy console — or a production build where warnings are stripped — this looks like a UI bug rather than a wiring mistake.',
        fix: 'Pair value with onChange, or use readOnly explicitly if the field genuinely should not be edited. If the field is uncontrolled, use defaultValue instead of value.',
        designPattern: 'Paired Invariants: a controlled value implies an update channel. One without the other is an incomplete contract.',
      },
    ],
    comparison: {
      title: 'Hand-wired controlled form vs. React 19 form Action',
      subtitle: 'Same fifteen fields, a fraction of the bookkeeping',
      badLabel: 'A useState per field plus manual submit',
      badGotcha: 'The assistant generates three useState calls, three onChange handlers, a preventDefault, a loading flag and an error flag for a three-field form. It works, it just costs fifty lines and a re-render per keystroke.',
      goodLabel: 'FormData read by an Action',
      goodReason: 'React collects every named field into FormData, wraps the submission in a Transition, and hands you isPending. Uncontrolled fields cost zero renders while typing.',
      badCode: `// ❌ Five pieces of state for three fields
function LegacyForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitApi({ name, email });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={loading}>{loading ? "Saving…" : "Save"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}`,
      goodCode: `// ✅ Zero field state, zero keystroke renders
import { useActionState } from "react";

async function saveAction(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  try {
    await submitApi({ name, email });
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function ModernForm() {
  const [state, formAction, isPending] = useActionState(saveAction, {
    ok: false,
    error: null,
  });

  return (
    <form action={formAction}>
      <input name="name" defaultValue="" />
      <input name="email" defaultValue="" />
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
      footerNote: 'Reach for the controlled pattern when the UI needs the value on every keystroke. Otherwise let the form hold it.',
    },
    decisionTree: {
      title: 'Decision Tree: controlled input or FormData?',
      subtitle: 'The question is whether the UI needs the value before submission',
      rootQuestion: 'Does anything on screen need to react to the value while the user is still typing?',
      nodes: {
        branchA: 'Yes — live password strength, formatting masks, dependent dropdowns, enable/disable rules',
        resultA: 'Controlled input. The value must live in React state because the UI reads it per keystroke.',
        codeA: '<input value={card} onChange={(e) => setCard(formatCard(e.target.value))} />',
        branchB: 'No — the value only matters when the form is submitted',
        subQuestion: 'Are you on React 19 or a framework that supports form Actions?',
        yesLabel: 'Yes — React 19, Next.js App Router or similar',
        yesResult: 'Uncontrolled fields plus an Action. React builds FormData for you and useActionState gives you pending and result state.',
        codeYes: '<form action={formAction}><input name="email" /><button disabled={isPending}>Save</button></form>',
        noLabel: 'No — React 18 or a plain SPA',
        noResult: 'Still uncontrolled, but read the form yourself: new FormData(e.currentTarget) inside onSubmit.',
        codeNo: 'function onSubmit(e) { e.preventDefault(); const data = new FormData(e.currentTarget); }',
      },
    },
    quiz: {
      title: 'Quiz: what does <form action={fn}> do on submit?',
      subtitle: 'The behaviour that changed in React 19',
      codeSnippet: `async function myAction(formData) {
  const query = formData.get("q");
  await searchApi(query);
}

function Search() {
  return (
    <form action={myAction}>
      <input name="q" />
      <button type="submit">Search</button>
    </form>
  );
}`,
      question: 'The user clicks Search. What happens?',
      options: [
        {
          text: 'The page reloads, because no preventDefault was called.',
          isCorrect: false,
          explanation: 'React 19 intercepts submission when action is a function. preventDefault is not needed.',
        },
        {
          text: 'React prevents the reload, runs the action inside a Transition, and resets uncontrolled fields when it finishes.',
          isCorrect: true,
          explanation: 'Correct. That three-part behaviour is the whole value of the action prop — no preventDefault, no manual loading flag, no manual reset.',
        },
        {
          text: 'A syntax error is thrown, because form only accepts onSubmit.',
          isCorrect: false,
          explanation: 'action on a form is a first-class React 19 feature, not a typo.',
        },
        {
          text: 'The action runs with empty data because the input is not controlled.',
          isCorrect: false,
          explanation: 'Uncontrolled inputs with a name attribute are exactly what FormData collects. Control is not required for submission.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'advanced-form-validation',
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. The Form Loads Completely Untouched',
        phase: 'Initial Mount',
        domState: 'Empty inputs, no red anywhere',
        screenContent: 'A clean signup form. Nothing is shouting at the user.',
        activeAction: 'The field holds { value: "", touched: false }. Validation has already determined the email is required — and nothing is rendered for it.',
        closureSnapshot: 'field = { value: "", touched: false, error: "Required" }',
        explanation: 'The error exists from the first frame. The question is never whether it is true, it is whether showing it helps.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. The Premature Error',
        phase: 'Aggressive Validation Trap',
        domState: 'A red border appears under a field the user just focused',
        screenContent: 'The user types "a" and immediately reads "Invalid email address" in red.',
        activeAction: 'Validation runs inside onChange and renders the error unconditionally. The user has typed one character of a forty-character task.',
        closureSnapshot: 'error rendered at value.length === 1',
        explanation: 'The rule is usually violated with the best intentions: someone wanted fast feedback. What they shipped was an accusation.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '3. Blur Marks the Field as Touched',
        phase: 'Blur Evaluation',
        domState: 'The field border turns red — now it is earned',
        screenContent: 'The user tabs away without an "@". The message appears at the moment it is useful.',
        activeAction: 'onBlur sets touched: true. The next render has permission to show the error that was already there.',
        closureSnapshot: 'field = { touched: true, error: "Invalid email" }',
        explanation: 'Leaving a field is the user telling you they consider it done. That is the only moment feedback is fair.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '4. Correction Clears the Error Immediately',
        phase: 'Live Recovery',
        domState: 'Red border back to neutral',
        screenContent: 'The "@" appears and the message vanishes in the same keystroke.',
        activeAction: 'Once touched is true, re-validation runs on every change, so the error clears as soon as it stops being true.',
        closureSnapshot: 'touched: true | error: null',
        explanation: 'Show late, clear early. The asymmetry is deliberate and it is what a well-behaved form feels like.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'The Premature Validation Trap',
        subtitle: 'A field turns red before the user has typed a single character',
        why: 'Validating unconditionally during render means the empty state of every field is an error state. The user opens a form and is greeted by eight red messages describing work they have not started. It reads as broken, and the people most likely to abandon are the ones who were doing fine.',
        fix: 'Track touched (or dirty) per field. Render the error only when touched is true or the form has been submitted. Combine that with re-validating on change so errors clear the instant they are fixed.',
        designPattern: 'Specification (Dive Into Design Patterns): validation rules are predicates that can be evaluated at any time. Whether to render their result is a separate policy decision — do not fuse them.',
      },
      {
        order: 2,
        title: 'Client Validation Treated as a Security Boundary',
        subtitle: 'The form says the email is valid, so the server believes it',
        why: 'Every check running in the browser can be removed with devtools, replayed with curl, or bypassed by a script. Client validation exists to save the user a round trip. When it is the only validation, the database receives whatever the attacker sends, including values the UI would never produce.',
        fix: 'Validate on the server with the same schema. Share the schema module between client and server so the rules cannot drift, but never let the client be the only place they run.',
        designPattern: 'Defense in Depth: the boundary that enforces is the one the attacker cannot edit. Every other layer is ergonomics.',
      },
      {
        order: 3,
        title: 'Hand-rolled Regex Instead of a Schema',
        subtitle: 'Three slightly different email regexes across two files and a server route',
        why: 'Rules written inline inside components are copied the moment a second form appears, and the copies drift. Nobody notices until support gets a ticket about a field that is "valid here but invalid there". The regex is also rarely reviewed, so the version that ships is usually the version someone found on a forum.',
        fix: 'Put the rules in one declarative schema (Zod, Valibot, Yup) and import it everywhere. Let the schema own both the types and the messages.',
        designPattern: 'Single Source of Truth: one definition of a rule, referenced by every consumer, is the only version that stays consistent.',
      },
    ],
    comparison: {
      title: 'Validating on every keystroke vs. validating on blur',
      subtitle: 'The difference between helpful and hostile is one boolean',
      badLabel: 'Error shown from the first character',
      badGotcha: 'The assistant computes isInvalid during render and renders the message unconditionally. The user sees red before they have typed anything meaningful, and every keystroke flashes a fresh error.',
      goodLabel: 'touched gate, early clear',
      goodReason: 'The same validation rule, gated behind touched. Nothing shows until the user leaves the field, and the message disappears the moment the value becomes valid.',
      badCode: `// ❌ Red on frame one, red on every keystroke
function BadEmailInput() {
  const [email, setEmail] = useState("");
  const isInvalid = !email.includes("@");

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {isInvalid && <p role="alert">Invalid email address</p>}
    </div>
  );
}`,
      goodCode: `// ✅ The error waits for the user to be done
function GoodEmailInput() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const error = !email
    ? "Email is required"
    : !email.includes("@")
      ? "Email is incomplete"
      : null;

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={touched && Boolean(error)}
      />
      {touched && error && <p role="alert">{error}</p>}
    </div>
  );
}`,
      footerNote: 'aria-invalid belongs on the input, not the message. Screen readers need both.',
    },
    decisionTree: {
      title: 'Decision Tree: when should the error become visible?',
      subtitle: 'Validation truth and validation display are two separate decisions',
      rootQuestion: 'What has the user done with this field so far?',
      nodes: {
        branchA: 'Nothing — they have not focused it, or they are mid-word',
        resultA: 'Show nothing. The rule may already be failing; that is not information the user can act on yet.',
        codeA: '{touched && error && <p>{error}</p>}  // hidden until earned',
        branchB: 'Left the field, or pressed submit',
        subQuestion: 'Is the form using a schema-driven library already?',
        yesLabel: 'Yes — React Hook Form, TanStack Form, or similar',
        yesResult: 'Let the resolver own validation and read formState.errors. Set mode to onBlur or onSubmit.',
        codeYes: 'const { register, formState: { errors } } = useForm({ resolver: zodResolver(schema) });',
        noLabel: 'No — plain useState',
        noResult: 'Track touched yourself, validate in a pure function, and render behind the touched flag.',
        codeNo: '<input onBlur={() => setTouched(true)} aria-invalid={touched && Boolean(error)} />',
      },
    },
    quiz: {
      title: 'Quiz: which condition should gate the error message?',
      subtitle: 'One expression separates polite from hostile',
      codeSnippet: `function FormField({ value, error, touched }) {
  const shouldShow = ???;
  return <div>{shouldShow && <span role="alert">{error}</span>}</div>;
}`,
      question: 'What belongs in shouldShow?',
      options: [
        {
          text: 'error — if there is an error, show it.',
          isCorrect: false,
          explanation: 'This is the version that greets the user with a wall of red on an empty form.',
        },
        {
          text: 'touched && error — the user has been in the field, and the rule is failing.',
          isCorrect: true,
          explanation: 'Correct. touched means the user considers the field done, which is the moment the message becomes useful rather than accusatory.',
        },
        {
          text: 'value.length > 5 && error',
          isCorrect: false,
          explanation: 'A length threshold is a proxy for touched that happens to break on short valid values and on empty required fields.',
        },
        {
          text: 'Never show it — wait for the server response.',
          isCorrect: false,
          explanation: 'Server-only feedback costs a round trip per mistake and gives up the accessibility and speed of local validation.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'form-actions-server-forms',
    createShells: true,
    quickRefTs: `<form action={formAction}>
  <input name="email" required />
  <SubmitButton />
</form>

// Inside a component rendered below the form:
const { pending } = useFormStatus();
<button disabled={pending}>{pending ? "Saving…" : "Save"}</button>`,
    quickRefJs: `<form action={formAction}>
  <input name="email" required />
  <SubmitButton />
</form>

// Inside a component rendered below the form:
const { pending } = useFormStatus();
<button disabled={pending}>{pending ? "Saving…" : "Save"}</button>`,
    steps: [
      {
        order: 1, stepId: 1,
        title: '1. Native Submission, Intercepted',
        phase: 'Submit',
        domState: 'The browser has assembled the form data',
        screenContent: 'The user clicks Save. The page does not reload.',
        activeAction: 'The form has an action prop holding a function, so React prevents the default navigation and wraps the submission in a Transition.',
        closureSnapshot: 'transition started → form is now pending',
        explanation: 'The form is still a real HTML form. What changed is who processes the submission.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '2. FormData Is Built From Name Attributes',
        phase: 'FormData Assembly',
        domState: 'No React state was involved in collecting values',
        screenContent: 'The button switches to a disabled "Saving…" state.',
        activeAction: 'Every field with a name attribute is collected into a FormData object. Fields without a name are silently omitted.',
        closureSnapshot: 'formData.get("email") → "ada@example.com"',
        explanation: 'This is why the inputs never needed to be controlled. The DOM was always holding the values; React just reads them at submit time.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '3. Pending State Reaches the Descendant',
        phase: 'Pending Propagation',
        domState: 'Submit control disabled',
        screenContent: 'A spinner appears next to the label; the button cannot be double-clicked.',
        activeAction: 'A component rendered inside the form calls useFormStatus() and receives pending: true from the form context above it.',
        closureSnapshot: 'useFormStatus() → { pending: true }',
        explanation: 'The hook reads context published by the nearest form ancestor. That is the whole reason it must live in a child component.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '4. The Action Returns a Result',
        phase: 'Resolve',
        domState: 'Uncontrolled fields reset',
        screenContent: 'A green confirmation appears; the form is empty again.',
        activeAction: 'The action resolves with a state object. useActionState stores it as the new state and React resets the uncontrolled fields.',
        closureSnapshot: 'state = { ok: true, message: "Saved" } | pending: false',
        explanation: 'Reset is automatic for uncontrolled fields and does nothing for controlled ones — which is a common source of confusion.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '5. The Server Action Boundary',
        phase: 'Server Boundary',
        domState: 'The browser sent a request it did not author',
        screenContent: 'Nothing visible — the response is what the caller chose to send.',
        activeAction: 'A Server Action compiles to a network endpoint. Anyone can call it directly with arbitrary payloads, without your UI and without your client-side validation.',
        closureSnapshot: 'request body is attacker-controlled',
        explanation: 'The function runs on the server, but it is reachable from the client. That makes it an API surface, and API surfaces validate.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'useFormStatus in the Wrong Component',
        subtitle: 'The button that never disables, and the double submit that follows',
        why: 'useFormStatus reads context provided by the nearest form ancestor. Calling it in the component that renders the form makes it a consumer of nothing — React returns pending: false forever. The button stays enabled during submission and the user clicks twice.',
        fix: 'Extract the submit control into its own component and render it inside the form. The parent composes the form; the child reads its status.',
        designPattern: 'Ambient Context (Dive Into Design Patterns): a publisher cannot observe its own publication. The consumer must be a descendant, structurally.',
      },
      {
        order: 2,
        title: 'Trusting Client Validation in a Server Action',
        subtitle: 'The endpoint accepts what the form would never send',
        why: 'Marking an input required in JSX constrains the browser, not the network. A Server Action is a public endpoint: anyone can POST a payload with a negative quantity, a foreign user id, or a 10MB string. Server Actions skip the HTML validation entirely because they are not the HTML form.',
        fix: 'Validate the FormData on the server with a schema before touching the database, and check authorization against the session — never against an id sent in the payload.',
        designPattern: 'Trust Boundary: anything crossing from client to server is untrusted input, regardless of which component appeared to produce it.',
      },
      {
        order: 3,
        title: 'Expecting Controlled Inputs to Reset',
        subtitle: 'The form says "Saved" and still shows the old values',
        why: 'React resets uncontrolled fields after a successful action. A field wired to useState keeps whatever value state holds. The user submits twice, and the second submission sends data they believed they had already cleared.',
        fix: 'Pick one model per form. Either stay fully uncontrolled with defaultValue and let React reset, or stay controlled and clear the state yourself on success.',
        designPattern: 'Single Owner: exactly one of React state or the DOM owns each field value. Split ownership produces a form that disagrees with itself.',
      },
    ],
    comparison: {
      title: 'A function that looks like a Server Action vs. one that is safe',
      subtitle: 'The directive makes it reachable; the validation makes it defensible',
      badLabel: 'Action with no boundary checks',
      badGotcha: 'The assistant writes "use server", reads FormData, and writes to the database. It works perfectly through the UI and accepts any payload from anyone who finds the endpoint id in the bundle.',
      goodLabel: 'Validated and authorized on the server',
      goodReason: 'The same schema the client used runs again on the server, and the user identity comes from the session rather than from the submitted form.',
      badCode: `// ❌ Reachable by anyone, trusting the client completely
"use server";

export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  // 🚨 no schema, no auth check — the payload is taken at face value
  await db.users.update({ where: { id: userId }, data: { role } });

  return { ok: true };
}`,
      goodCode: `// ✅ Validated, authorized, and scoped to the session
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";

const ProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
});

export async function updateProfile(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const parsed = ProfileSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  // keep the authorization and the write in one transaction
  const result = await db.users.updateMany({
    where: { id: session.user.id },
    data: { displayName: parsed.data.displayName },
  });

  if (result.count === 0) return { ok: false, error: "Update failed" };
  return { ok: true, error: null };
}`,
      footerNote: 'A Server Action is an endpoint. The moment it exists, assume someone will find and call it.',
    },
    decisionTree: {
      title: 'Decision Tree: does this submission need a Server Action?',
      subtitle: 'Separate the React feature from the framework capability',
      rootQuestion: 'What is actually being submitted, and who must receive it?',
      nodes: {
        branchA: 'Data that must be persisted on the server — a record, a payment, a file',
        subQuestion: 'Does your framework provide Server Actions, and is the code base already using them?',
        yesLabel: 'Yes — Next.js App Router or an equivalent setup',
        yesResult: 'Use a Server Action with a schema validated on the server and authorization read from the session.',
        codeYes: '"use server"; const parsed = Schema.safeParse(Object.fromEntries(formData));',
        noLabel: 'No — plain React SPA or React 18',
        noResult: 'Post to an existing API route. Form Actions still work; only the server directive does not exist there.',
        codeNo: 'await fetch("/api/profile", { method: "POST", body: formData });',
        branchB: 'A local interaction with no persistence — filtering, a wizard step, a search preview',
        resultA: 'Plain React state or useActionState without any server function. No endpoint is needed.',
        codeA: 'const [state, formAction, isPending] = useActionState(localAction, initial);',
      },
    },
    quiz: {
      title: 'Quiz: why is the submit button still enabled?',
      subtitle: 'Trace where pending comes from',
      codeSnippet: `function ContactForm() {
  const { pending } = useFormStatus();

  return (
    <form action={sendMessage}>
      <input name="message" />
      <button disabled={pending}>Send</button>
    </form>
  );
}`,
      question: 'During submission, pending stays false and the button never disables. Why?',
      options: [
        {
          text: 'useFormStatus requires an await before reading pending.',
          isCorrect: false,
          explanation: 'It is a hook, not an async function. pending is read synchronously from context.',
        },
        {
          text: 'The hook is called in the component that renders the form, so it reads the context of whatever form is above it — not this one.',
          isCorrect: true,
          explanation: 'Correct. A form publishes status to its descendants. The component that renders the form is its parent, so it cannot observe the status it publishes.',
        },
        {
          text: 'Server Actions do not expose pending state at all.',
          isCorrect: false,
          explanation: 'They do — but through useActionState, or through useFormStatus from a descendant of the form.',
        },
        {
          text: 'The button needs type="submit" to receive the context.',
          isCorrect: false,
          explanation: 'type="submit" affects submission behaviour, not context reading. It is a separate fix for a separate problem.',
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
    console.log('\nBatch B (forms) seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
