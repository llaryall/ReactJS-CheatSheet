// lib/interactiveTopicsData.js
// Curated authoritative interactive engineering dataset for key React topics
// Written in authentic, practitioner-grade Persian according to the authentic-writer skill

export const interactiveTopicsData = {
  // 1. useEffect (Lighthouse benchmark)
  useeffect: {
    title: "useEffect: همگام‌سازی، چرخه حیات و تله‌های پروداکشن",
    slug: "useEffect",
    category: "Hooks (Core + Library Hooks)",
    tier: "🔵",
    mentalModel: "افکت پلی میان مدل محاسباتی و اعلامی ری‌اکت و سیستم‌های ناهمگام بیرونی (DOM، وب‌سوکت، لیسنرها و رکوئست‌های شبکه) است. اگر طرف حساب شما یک سیستم خارجی نیست، افکت اشتباه‌ترین ابزار ممکن است.",
    rule: "محاسبات مبتنی بر استیت قبلی، فیلتر کردن لیست‌ها و هندلرهای رویداد کاربر را در افکت نریزید. کدهای ناشی از اکشن کاربر باید در همان onClick اجرا شوند.",
    reactVersion: "React 18 & 19",
    quickRef: {
      tsSnippet: `import { useEffect } from 'react';

useEffect(() => {
  // ۱. اتصال یا برقراری شنود سیستم بیرونی
  const controller = new AbortController();
  fetchData(id, { signal: controller.signal });

  // ۲. کلین‌آپ: لغو عملیات قبل از رندر بعدی یا هنگام خروج کامپوننت
  return () => {
    controller.abort();
  };
}, [id]); // ۳. فقط مقادیر واکنشی (Reactive values) که در بدنه استفاده شده‌اند`,
      jsSnippet: `import { useEffect } from 'react';

useEffect(() => {
  const controller = new AbortController();
  fetchData(id, { signal: controller.signal });

  return () => {
    controller.abort();
  };
}, [id]);`,
    },
    decisionTree: {
      title: "درخت تصمیم: آیا واقعاً به useEffect نیاز دارید؟",
      subtitle: "پیش از نوشتن افکت، این مسیر تصمیم را بررسی کنید تا گرفتار رندرهای آبشاری نشوید.",
      treeData: {
        start: {
          id: "start",
          question: "قصد داری دقیقاً چه کاری در این کامپوننت انجام دهی؟",
          hint: "بیش از ۷۰٪ موارد استفاده روزمره از افکت در پروژه‌ها، با ساختارهای ساده‌تر و تمیزتر بدون افکت حل می‌شوند.",
          options: [
            {
              label: "تبدیل یا فیلتر کردن داده بر اساس Props یا State موجود",
              sublabel: "مثال: فیلتر کردن فهرست کاربران با عبارت تایپ‌شده",
              next: "derived_state",
            },
            {
              label: "واکنش به تعامل مستقیم کاربر (کلیک، سابمیت، فشردن کلید)",
              sublabel: "مثال: ارسال فرم لاگین یا نمایش Toast",
              next: "event_handler",
            },
            {
              label: "برقراری ارتباط با سیستم خارجی (Network, WebSocket, Browser APIs)",
              sublabel: "مثال: فچ دیتای صفحه، اتصال به کانال چت، لیسنر پنجره",
              next: "external_system",
            },
          ],
        },
        derived_state: {
          id: "derived_state",
          type: "result",
          verdict: "avoid",
          verdictLabel: "آنتی‌پترن ❌",
          title: "نیازی به افکت نیست؛ مستقیماً در بدنه رندر محاسبه کنید (Derived State)",
          explanation: "محاسبه مستقیم مقادیر در بدنه تابع در کسری از میلی‌ثانیه انجام می‌شود. ریختن آن در یک استیت دیگر درون افکت، یک دور رندر اضافه و ناهمگام ناخواسته به UI تحمیل می‌کند.",
          recommendedSolution: "const filtered = list.filter(item => item.name.includes(query));",
        },
        event_handler: {
          id: "event_handler",
          type: "result",
          verdict: "avoid",
          verdictLabel: "آنتی‌پترن ❌",
          title: "کد را داخل همان Event Handler اجرا کنید",
          explanation: "کدی که در پاسخ به رویداد کاربر اجرا می‌شود باید در بدنه هندلر رویداد قرار گیرد. ارسال آن به افکت ردیابی علت رخداد را دشوار و کدهای شما را پر از فلگ‌های کمکی می‌کند.",
          recommendedSolution: "function handleClick() { sendAnalytics(); navigate('/dashboard'); }",
        },
        external_system: {
          id: "external_system",
          type: "result",
          verdict: "use",
          verdictLabel: "کاربرد استاندارد ✅",
          title: "استفاده از useEffect مجاز است — حتماً تابع Cleanup را برگردانید",
          explanation: "چون با یک بستر خارج از ری‌اکت در ارتباط هستید، مسئولیت تمیزکاری منابع هنگام آن‌مانت شدن کامپوننت بر عهده شماست تا حافظه نشت نکند.",
          recommendedSolution: "return () => socket.disconnect();",
        },
      },
    },
    codeComparison: {
      title: "Race Condition در واکشی داده: کد هوش مصنوعی در برابر استاندارد پروداکشن",
      description: "هوش مصنوعی معمولاً فراموش می‌کند پاسخ درخواست‌های کند شبکه ممکن است پس از تعویض صفحه یا فیلتر به دست کلاینت برسد.",
      badTitle: "کد متداول هوش مصنوعی / جونیور",
      badGotcha: "اگر کاربر دو تب یا آیدی را پشت سر هم کلیک کند، ریکوئست کندتر دیتای اشتباه را در پایان روی صفحه می‌نشاند.",
      badCode: `// ❌ تله Race Condition
function UserProfile({ id }: { id: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(\`/api/user/\${id}\`)
      .then(r => r.json())
      .then(user => setData(user));
  }, [id]);

  return <div>{data?.name}</div>;
}`,
      goodTitle: "کد استاندارد مهندسی با AbortController",
      goodReason: "با تغییر id، درخواست قبلی در سطح شبکه لغو شده و تداخل دیتای کهنه با دیتای تازه به صفر می‌رسد.",
      goodCode: `// ✅ ضدگلوله با ابطال شبکه
function UserProfile({ id }: { id: string }) {
  const [data, setData] = useState<User | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/user/\${id}\`, { signal: controller.signal })
      .then(r => r.json())
      .then(user => setData(user))
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort();
  }, [id]);

  return <div>{data?.name}</div>;
}`,
    },
    react19Notes: {
      summary: "در ری‌اکت ۱۹ به ندرت برای واکشی داده یا فرم‌ها نیازی به افکت دارید.",
      points: [
        { title: "Server Components (RSC)", desc: "دیتا مستقیماً روی سرور بدون نیاز به هوک واکشی می‌شود." },
        { title: "هوک use()", desc: "پرامیس‌ها مستقیماً با هوک use در کلاینت در ترکیب با Suspense خوانده می‌شوند." },
      ],
    },
    quiz: {
      title: "چالش ۳۰ ثانیه‌ای: رندرهای بی‌پایان در آبجکت‌های وابسته",
      question: "کد زیر در هر بار اجرا چه رفتاری بروز می‌دهد؟",
      codeSnippet: `function Search({ query }: { query: string }) {
  const options = { filter: query, page: 1 };

  useEffect(() => {
    api.search(options);
  }, [options]);
}`,
      options: [
        { id: "a", text: "بدون مشکل اجرا می‌شود و داده فیلترشده را می‌گیرد.", isCorrect: false, explanation: "در جاوااسکریپت {} !== {} است و در هر رندر آبجکت نو با آدرس حافظه جدید ساخته می‌شود." },
        { id: "b", text: "کامپوننت به دام حلقه رندر بی‌پایان (Infinite Loop) می‌افتد.", isCorrect: true, explanation: "آفرین! چون رفرنس options در هر بار صدا خوردن عوض می‌شود، افکت همواره تحریک شده و اگر استیت ست کند حلقه نامتناهی رخ می‌دهد." },
        { id: "c", text: "کد خطای کامپایل می‌دهد.", isCorrect: false, explanation: "سینتکس درست است، خطای منطقی ران‌تایم وجود دارد." },
      ],
    },
  },

  // 2. useState
  usestate: {
    title: "useState: اسنپ‌شات‌های رندر، Batching و استیت همگام",
    slug: "usestate",
    category: "State Management",
    tier: "🟢",
    mentalModel: "استیت در ری‌اکت یک متغیر معمولی نیست؛ یک اسنپ‌شات ثابت از همان رندر است. وقتی ()setState را صدا می‌زنید، مقدار متغیر در خط بعدی همان لحظه تغییر نمی‌کند، بلکه ری‌اکت یک رندر تازه را با مقدار جدید در صف می‌گذارد.",
    rule: "اگر مقدار استیت جدید به مقدار استیت قبلی وابسته است، همیشه از تابع Updater استفاده کنید: (prev => prev + 1).",
    reactVersion: "React 18 & 19",
    quickRef: {
      tsSnippet: `import { useState } from 'react';

// استیت همراه با تعریف نوع دقیق
const [count, setCount] = useState<number>(0);

// آپدیت ایمن وابسته به مقدار گذشته
const increment = () => {
  setCount(prev => prev + 1);
};`,
      jsSnippet: `import { useState } from 'react';

const [count, setCount] = useState(0);

const increment = () => {
  setCount(prev => prev + 1);
};`,
    },
    decisionTree: {
      title: "درخت تصمیم: این استیت دقیقاً در کجای برنامه باید زندگی کند؟",
      subtitle: "انتخاب نادرست مکان استیت دلیل بیش از ۶۰٪ ری‌رندرهای سنگین و پیچیدگی‌های بی‌مورد است.",
      treeData: {
        start: {
          id: "start",
          question: "این داده قرار است توسط چه بخش‌هایی خوانده و تغییر داده شود؟",
          hint: "استیت را تا جای ممکن در پایین‌ترین کامپوننتی که به آن نیاز دارد نگهداری کنید (State Colocation).",
          options: [
            { label: "تنها درون همین کامپوننت و فرزندان بی‌واسطه‌اش", next: "local_state" },
            { label: "در چند کامپوننت که در شاخه‌های مختلف درخت قرار دارند", next: "shared_state" },
            { label: "داده‌ای که از بک‌اند دریافت شده و تغییرات سروری دارد", next: "server_state" },
            { label: "فیلترها، شماره صفحه یا سرچ که باید قابل بوکمارک یا رفرش باشند", next: "url_state" },
          ],
        },
        local_state: {
          id: "local_state",
          type: "result",
          verdict: "use",
          verdictLabel: "استیت محلی استاندارد ✅",
          title: "useState بهترین و تمیزترین انتخاب است",
          explanation: "داده کامپوننت را بی‌دلیل به رداکس، زاستند یا کانتکست نبرید. محلی نگه‌داشتن استیت مانع از پخش شدن موج ریرندر در کل صفحه می‌شود.",
          recommendedSolution: "const [isOpen, setIsOpen] = useState(false);",
        },
        shared_state: {
          id: "shared_state",
          type: "result",
          verdict: "caution",
          verdictLabel: "مدیریت استیت مشترک ⚖️",
          title: "ابتدا Lifting State Up را بسنجید، سپس Zustand یا Context",
          explanation: "اگر اشتراک داده فقط میان دو برادر است، استیت را به پدر مشترک منتقل کنید. اگر کل درخت مصرف‌کننده است، Zustand به دلیل عدم تحریک کل درخت بر کانتکست برتری دارد.",
          recommendedSolution: "Zustand برای استیت اپلیکیشن، یا Context برای قالب/تم.",
        },
        server_state: {
          id: "server_state",
          type: "result",
          verdict: "avoid",
          verdictLabel: "آنتی‌پترن ❌",
          title: "از useState برای دیتای سرور استفاده نکنید",
          explanation: "ذخیره دیتای سرور در استیت محلی نیازمند مدیریت دستی لودینگ، کش، خطا و رفرش است. از TanStack Query یا Server Components استفاده کنید.",
          recommendedSolution: "const { data } = useQuery(...) یا Server Components در ری‌اکت ۱۹",
        },
        url_state: {
          id: "url_state",
          type: "result",
          verdict: "use",
          verdictLabel: "بهترین الگو برای فیلترها 🌐",
          title: "داده را در URL SearchParams نگه دارید",
          explanation: "کاربر باید بتواند لینک فیلترشده را برای دیگران بفرستد و با رفرش صفحه وضعیت حفظ شود. استفاده از useState برای سرچ باعث پاک شدن فیلتر با رفرش می‌شود.",
          recommendedSolution: "useSearchParams() در Next.js یا React Router",
        },
      },
    },
    codeComparison: {
      title: "آپدیت‌های پشت‌سرهم: باگ اسنپ‌شات در برابر تابع Updater",
      description: "ری‌اکت در نسخه ۱۸ و ۱۹ تغییرات استیت را در قالب یک بسته واحد (Automatic Batching) به فاز رندر می‌برد.",
      badTitle: "کد دارای باگ منطقی اسنپ‌شات",
      badGotcha: "چون مقدار count در اسنپ‌شات جاری ثابت (مثلاً ۰) است، سه بار فراخوانی setCount(count + 1) مقدار نهایی را تنها ۱ می‌کند نه ۳!",
      badCode: `// ❌ مقدار نهایی به جای ۳ برابر ۱ می‌شود
function Counter() {
  const [count, setCount] = useState(0);

  const addThree = () => {
    setCount(count + 1); // 0 + 1
    setCount(count + 1); // 0 + 1
    setCount(count + 1); // 0 + 1
  };

  return <button onClick={addThree}>{count}</button>;
}`,
      goodTitle: "استفاده استاندارد از فرمول Updater",
      goodReason: "ری‌اکت توابع آپدیتر را در صف قرار داده و خروجی هر تابع را به عنوان ورودی به تابع بعدی تحویل می‌دهد.",
      goodCode: `// ✅ مقدار نهایی به طور حتم ۳ می‌شود
function Counter() {
  const [count, setCount] = useState(0);

  const addThree = () => {
    setCount(c => c + 1); // 0 -> 1
    setCount(c => c + 1); // 1 -> 2
    setCount(c => c + 1); // 2 -> 3
  };

  return <button onClick={addThree}>{count}</button>;
}`,
    },
    react19Notes: {
      summary: "در ری‌اکت ۱۹، برای وضعیت فرم‌ها و تغییرات خوش‌بینانه هوک‌های تخصصی اضافه شده است.",
      points: [
        { title: "useActionState", desc: "جایگزین ده‌ها خط کد لودینگ/خطای دستی با useState برای ارسال فرم‌ها." },
        { title: "useOptimistic", desc: "تغییر آنی استیت در UI قبل از پاسخ سرور با قابلیت بازگشت خودکار در صورت خطا." },
      ],
    },
    quiz: {
      title: "چالش: خواندن استیت بلافاصله پس از تغییر",
      question: "خروجی console.log در کلیک روی دکمه چیست؟",
      codeSnippet: `function Profile() {
  const [name, setName] = useState("علی");

  const update = () => {
    setName("رضا");
    console.log(name);
  };

  return <button onClick={update}>تغییر نام</button>;
}`,
      options: [
        { id: "a", text: "بلافاصله 'رضا' چاپ می‌شود.", isCorrect: false, explanation: "خیر، مقدار متغیر name در اسنپ‌شات رندر جاری همچنان مقدار قبلی است." },
        { id: "b", text: "'علی' چاپ می‌شود؛ مقدار تا رندر بعدی تغییر نمی‌کند.", isCorrect: true, explanation: "دقیقاً! تغییر استیت درخواستی برای رندر بعدی است و متغیرهای جاوااسکریپت اسنپ‌شات کنونی دست‌نخورده می‌مانند." },
        { id: "c", text: "مقدار undefined چاپ می‌شود.", isCorrect: false, explanation: "متغیر name دارای مقدار اولیه معتبر است." },
      ],
    },
  },

  // 3. useReducer
  usereducer: {
    title: "useReducer: ماشین‌های وضعیت، منطق تراکنشی و استیت‌های مقیاس‌پذیر",
    slug: "usereducer",
    category: "Hooks (Core + Library Hooks)",
    tier: "🔵",
    mentalModel: "اگر تغییرات استیت شما شامل چند فیلد وابسته است یا اکشن‌های گوناگون ساختار داده را جابجا می‌کنند، useReducer منطق نحوه تغییر استیت را از کامپوننت جدا کرده و تبدیل به یک تابع خالص و آزمون‌پذیر (Pure Function) می‌کند.",
    rule: "ردیوسرها باید کاملاً خالص باشند؛ هرگز داخل تابع ردیوسر فراخوانی API، تولید اعداد رندوم یا تغییر مستقیم اشیاء را قرار ندهید.",
    reactVersion: "React 18 & 19",
    quickRef: {
      tsSnippet: `import { useReducer } from 'react';

type State = { count: number; error: string | null };
type Action = { type: 'inc' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { ...state, count: state.count + 1 };
    case 'reset': return { count: 0, error: null };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, error: null });`,
      jsSnippet: `import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'inc': return { ...state, count: state.count + 1 };
    case 'reset': return { count: 0, error: null };
    default: return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0, error: null });`,
    },
    decisionTree: {
      title: "درخت تصمیم: useState یا useReducer؟",
      subtitle: "کدام الگوی مدیریت استیت برای مقیاس این کامپوننت مناسب‌تر است؟",
      treeData: {
        start: {
          id: "start",
          question: "پیچیدگی استیت و نحوه تعامل داده‌ها در کامپوننت چگونه است؟",
          options: [
            { label: "مقادیر ساده، مستقل از هم (مثلاً باز/بسته بودن منو، تکست اینپوت)", next: "simple" },
            { label: "استیت شامل چند فیلد که همزمان با یک اکشن باید تغییر کنند", next: "coupled" },
            { label: "منطق استیت پیچیده است و باید بدون نیاز به مانت کردن کامپوننت تست واحد شود", next: "testing" },
          ],
        },
        simple: {
          id: "simple",
          type: "result",
          verdict: "use",
          verdictLabel: "useState انتخاب بهتری است ✅",
          title: "استفاده از useReducer برای مقادیر مجزا Boileplate اضافی است",
          explanation: "برای تاگل‌ها و متغیرهای ساده نیازی به تعریف Action و Reducer نیست.",
          recommendedSolution: "const [isOpen, setIsOpen] = useState(false);",
        },
        coupled: {
          id: "coupled",
          type: "result",
          verdict: "use",
          verdictLabel: "useReducer کاملاً توصیه می‌شود ✅",
          title: "از useReducer برای جلوگیری از حالت‌های متناقض استفاده کنید",
          explanation: "با متمرکز کردن تغییرات در یک اکشن صریح، هرگز فرم شما در وضعیتی نخواهد بود که همزمان لودینگ باشد و خطای منسوخ را نمایش دهد.",
          recommendedSolution: "dispatch({ type: 'SUBMIT_SUCCESS', payload: data });",
        },
        testing: {
          id: "testing",
          type: "result",
          verdict: "use",
          verdictLabel: "معماری حرفه‌ای ✅",
          title: "تابع Reducer را خارج از فایل کامپوننت اک سپورت و تست کنید",
          explanation: "می‌توانید تابع reducer را با Jest یا Vitest به عنوان یک تابع ریاضی خالص تست کنید بدون اینکه نیاز به کامپوننت رندر شده باشد.",
          recommendedSolution: "expect(reducer(initial, { type: 'RESET' })).toEqual(...)",
        },
      },
    },
    codeComparison: {
      title: "حالت‌های غیرممکن (Impossible States) در برابر ساختار ردیوسر",
      description: "وقتی چند استیت مستقل تعریف می‌کنید، احتمال دارد فلگ‌ها با یکدیگر تداخل کنند.",
      badTitle: "تعریف استیت‌های جزیره‌ای با باگ احتمالی",
      badGotcha: "ممکن است به دلیل اشتباه در فراخوانی توابع، isLoading و isError هر دو true باشند که یک حالت متناقض است.",
      badCode: `// ❌ امکان بروز حالت نامعتبر
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

function handleSuccess(res) {
  setData(res);
  // فراموش کردن خاموش کردن isLoading یا پاک کردن error باگ می‌سازد
}`,
      goodTitle: "الگوی مهارتی با useReducer",
      goodReason: "ردیوسر وضعیت را به عنوان یک ماشین متناهی (Finite State Machine) انتقال می‌دهد و تناقض ناممکن است.",
      goodCode: `// ✅ تغییرات اتمیک و بدون حالت متناقض
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', data: null, error: null };
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.error };
  }
}`,
    },
    react19Notes: {
      summary: "ارتباط میان useReducer و اکشن‌های ری‌اکت ۱۹",
      points: [
        { title: "Actions در ری‌اکت ۱۹", desc: "اکشن‌های سروری و useActionState مفهوم dispatch را تا سطح کلاینت-سرور یکپارچه کرده‌اند." },
      ],
    },
    quiz: {
      title: "چالش: اصالت و خلوص تابع Reducer",
      question: "چرا انجام عملیات زیر در تابع ردیوسر یک تخلف مهندسی است؟",
      codeSnippet: `function cartReducer(state, action) {
  if (action.type === 'ADD') {
    state.items.push(action.item); // خط الف
    localStorage.setItem('cart', JSON.stringify(state)); // خط ب
    return state;
  }
}`,
      options: [
        { id: "a", text: "ری‌اکت ارور سینتکسی نشان می‌دهد.", isCorrect: false, explanation: "کد از نظر جاوااسکریپت اجرا می‌شود اما سیستم رندر را از کار می‌اندازد." },
        { id: "b", text: "استیت به شکل مستقیم جهش یافته (Mutation) و ساید‌افکت ایجاد شده؛ ری‌اکت متوجه تغییر رفرنس نخواهد شد.", isCorrect: true, explanation: "احسنت! توابع ردیوسر باید خالص باشند و هرگز نباید شیء ورودی را تغییر دهند و ساید‌افکت‌هایی مثل LocalStorage باید خارج از ردیوسر باشند." },
        { id: "c", text: "استفاده از push سرعت را کم می‌کند.", isCorrect: false, explanation: "مشکل اصلی جهش رفرنس و ساید افکت است." },
      ],
    },
  },

  // 4. useMemo & useCallback
  "usecallback, usememo": {
    title: "useMemo و useCallback: مالیات مموایز، رندرهای بیهوده و ری‌اکت کامپایلر",
    slug: "usecallback, usememo",
    category: "Performance Optimization",
    tier: "🔵",
    mentalModel: "مموایز کردن رایگان نیست! هر بار استفاده از این هوک‌ها، هزینه‌ای برای تخصیص حافظه، ساخت آرایه دپندنسی و مقایسه کم‌عمق (Shallow Compare) به ری‌اکت تحمیل می‌کند. اگر هزینه محاسبه از هزینه مقایسه کمتر باشد، شما عملاً پرفورمنس را تضعیف کرده‌اید.",
    rule: "تا زمانی که کندی واقعی را در React Profiler اندازه‌گیری نکرده‌اید یا تابع را به عنوان پراپ به کامپوننت با React.memo پاس نداده‌اید، از useCallback و useMemo استفاده نکنید.",
    reactVersion: "React 18 & 19 (React Compiler)",
    quickRef: {
      tsSnippet: `import { useMemo, useCallback } from 'react';

// ۱. useMemo: کش کردن نتیجه محاسبات سنگین ریاضی یا فیلترینگ هزاران آیتم
const visibleTodos = useMemo(() => {
  return filterHeavyList(todos, filter);
}, [todos, filter]);

// ۲. useCallback: حفظ رفرنس پایدار تابع برای جلوگیری از ریرندر کامپوننت‌های مموشده
const handleClick = useCallback(() => {
  submitForm(id);
}, [id]);`,
      jsSnippet: `import { useMemo, useCallback } from 'react';

const visibleTodos = useMemo(() => {
  return filterHeavyList(todos, filter);
}, [todos, filter]);

const handleClick = useCallback(() => {
  submitForm(id);
}, [id]);`,
    },
    decisionTree: {
      title: "درخت تصمیم: آیا واقعاً این محاسبه نیاز به useMemo دارد؟",
      subtitle: "بیش از ۸۰٪ موارد استفاده از useMemo در اپ‌های ری‌اکت غیرضروری هستند.",
      treeData: {
        start: {
          id: "start",
          question: "این محاسبه چه ماهیتی دارد و چقدر زمان می‌برد؟",
          options: [
            { label: "محاسبه ساده آرایه (مثلاً زیر ۱۰۰۰ آیتم، مپ یا فیلتر معمولی)", next: "cheap" },
            { label: "محاسبه سنگین با پردازش فشرده یا هزاران آیتم که تاخیر لمس می‌شود", next: "expensive" },
            { label: "پاس دادن یک آبجکت یا تابع به عنوان وابستگی به useEffect یا React.memo", next: "stable_ref" },
          ],
        },
        cheap: {
          id: "cheap",
          type: "result",
          verdict: "avoid",
          verdictLabel: "مموایز نکنید ❌",
          title: "محاسبه مستقیم سریع‌تر و ارزان‌تر از useMemo است",
          explanation: "جاوااسکریپت در اجرای چند صد عملیات ساده بسیار سریع عمل می‌کند. استفاده از useMemo برای مقادیر ساده مصرف حافظه را بالا می‌برد بدون اینکه به سرعت رندر بیفزاید.",
          recommendedSolution: "const total = items.reduce((acc, i) => acc + i.price, 0);",
        },
        expensive: {
          id: "expensive",
          type: "result",
          verdict: "use",
          verdictLabel: "استفاده استاندارد ✅",
          title: "useMemo در این شرایط کامپوننت را سبک نگه می‌دارد",
          explanation: "با کش کردن خروجی در ازای ثابت بودن وابستگی‌ها، از تکرار پردازش‌های سنگین در هر رندر غیرمرتبط جلوگیری می‌شود.",
          recommendedSolution: "useMemo(() => complexCalculation(data), [data])",
        },
        stable_ref: {
          id: "stable_ref",
          type: "result",
          verdict: "use",
          verdictLabel: "تثبیت رفرنس حافظه ✅",
          title: "برای حفظ رفرنس‌های پایدار کاملاً معتبر است",
          explanation: "اگر فرزندی با React.memo بسته‌بندی شده باشد، تنها در صورتی از رندر مجدد معاف می‌شود که رفرنس تابع ورودی با useCallback پایدار بماند.",
          recommendedSolution: "useCallback(() => onSelect(id), [id])",
        },
      },
    },
    codeComparison: {
      title: "مالیات اضافه مموایز کردن در برابر بهینه‌سازی واقعی",
      description: "کد هوش مصنوعی تمایل دارد دور تمام توابع useCallback بپیچد غافل از اینکه فرزند اصلاً Memo نشده است!",
      badTitle: "استفاده تشریفاتی و بی‌خاصیت هوش مصنوعی",
      badGotcha: "کامپوننت Button عادی بدون React.memo با ریرندر پدر دوباره رندر می‌شود و useCallback در اینجا هیچ کمکی نمی‌کند!",
      badCode: `// ❌ مموایز کردن بدون فایده پرفورمنسی
function Form() {
  const [text, setText] = useState('');

  // این هوک هیچ تاثیری ندارد چون دکمه در هر رندر ریرندر خواهد شد!
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <NormalButton onClick={handleClick} />;
}`,
      goodTitle: "الگوی مهندسی هدفمند",
      goodReason: "تنها زمانی که کامپوننت هدف سنگین بوده و با memo بهینه‌سازی شده باشد، پایدارسازی رفرنس کاربرد دارد.",
      goodCode: `// ✅ ترکیب هدفمند با React.memo
const ExpensiveChart = React.memo(function ExpensiveChart({ onSelect }: Props) {
  // رندرهای سنگین
});

function Dashboard() {
  const [tab, setTab] = useState('summary');

  const handleSelect = useCallback((id: string) => {
    trackSelection(id);
  }, []); // رفرنس در رندرهای ناشی از تغییر tab ثابت می‌ماند

  return <ExpensiveChart onSelect={handleSelect} />;
}`,
    },
    react19Notes: {
      summary: "ظهور React Compiler و مرگ تدریجی useMemo و useCallback دستی!",
      points: [
        { title: "React Compiler (React Forget)", desc: "کامپایلر ری‌اکت ۱۹ به صورت خودکار مقادیر و توابع را در سطح AST مموایز می‌کند و کدنویس نیازی به نوشتن دستی این هوک‌ها ندارد." },
      ],
    },
    quiz: {
      title: "چالش: چرا تغییر رفرنس باعث شکست React.memo شد؟",
      question: "در کد زیر با وجود React.memo، چرا کامپوننت Child در هر بار کلیک دکمه ریرندر می‌شود؟",
      codeSnippet: `const Child = React.memo(({ style }: { style: any }) => <div style={style} />);

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>افزایش</button>
      <Child style={{ color: 'red' }} />
    </div>
  );
}`,
      options: [
        { id: "a", text: "اشکال از React.memo است که باگ دارد.", isCorrect: false, explanation: "خیر، مکانیزم مموایز بر اساس مقایسه سطح کم‌آب است." },
        { id: "b", text: "آبجکت {{ color: 'red' }} در هر رندر پدر از نو در حافظه ساخته می‌شود و رفرنس آن برابر رفرنس رندر قبل نیست.", isCorrect: true, explanation: "دقیقاً! آبجکت‌های درون‌خطی در هر بار رندر مجدداً ایجاد می‌شوند و مقایسه استایل در Child شکست می‌خورد. حل: انتقال آبجکت به خارج کامپوننت یا کش با useMemo." },
        { id: "c", text: "پراپ style توسط ری‌اکت پشتیبانی نمی‌شود.", isCorrect: false, explanation: "پراپ استاندارد است." },
      ],
    },
  },

  // 5. useRef
  useref: {
    title: "useRef: پایداری داده بدون تحریک رندر، رفرنس‌های DOM و متغیرهای چرخه حیات",
    slug: "useref",
    category: "Hooks (Core + Library Hooks)",
    tier: "🔵",
    mentalModel: "رفرنس جعبه‌ای در حافظه است که در تمام طول حیات کامپوننت ثابت می‌ماند و تغییر مقدار current آن هرگز سیستم رندرینگ ری‌اکت را تحریک نمی‌کند. مثل متغیری است که خارج از رندر ذخیره شده است.",
    rule: "هرگز مقدار ref.current را در بدنه رندر کامپوننت نخوانید یا تغییر ندهید؛ رفرنس‌ها باید در Event Handlerها یا useEffect خوانده و نوشته شوند.",
    reactVersion: "React 18 & 19",
    quickRef: {
      tsSnippet: `import { useRef, useEffect } from 'react';

// ۱. دسترسی مستقیم به المنت واقعی DOM
const inputRef = useRef<HTMLInputElement>(null);

// ۲. ذخیره متغیرهای چرخه حیات بدون ایجاد ریرندر (مثلاً تایمرها)
const timerRef = useRef<number | null>(null);

const focusInput = () => {
  inputRef.current?.focus();
};`,
      jsSnippet: `import { useRef } from 'react';

const inputRef = useRef(null);
const timerRef = useRef(null);

const focusInput = () => {
  inputRef.current?.focus();
};`,
    },
    decisionTree: {
      title: "درخت تصمیم: useState یا useRef؟",
      subtitle: "آیا تغییر این داده باید ظاهر صفحه را دگرگون کند؟",
      treeData: {
        start: {
          id: "start",
          question: "آیا تغییر مقدار این متغیر باید بلافاصله تغییری در خروجی تصویری UI ایجاد کند؟",
          options: [
            { label: "بله، مقدار روی صفحه چاپ شده یا کلاسی را جابجا می‌کند", next: "ui_visible" },
            { label: "خیر، فقط داده‌ای فنی است (شناسه تایمر، وضعیت اسکرول قبلی، فلگ داخلی)", next: "behind_scenes" },
            { label: "دسترسی مستقیم به توابع بومی DOM مانند focus() یا scrollIntoView()", next: "dom_access" },
          ],
        },
        ui_visible: {
          id: "ui_visible",
          type: "result",
          verdict: "use",
          verdictLabel: "باید از useState استفاده کنید ✅",
          title: "تغییر useRef رندر مجدد ایجاد نمی‌کند",
          explanation: "اگر مقداری که در ref.current است تغییر کند، کاربر تا زمان وقوع یک رندر تصادفی دیگر تغییر را روی صفحه نخواهد دید.",
          recommendedSolution: "const [value, setValue] = useState(initial);",
        },
        behind_scenes: {
          id: "behind_scenes",
          type: "result",
          verdict: "use",
          verdictLabel: "useRef بهترین انتخاب است ✅",
          title: "useRef از رندرهای بیهوده جلوگیری می‌کند",
          explanation: "برای نگهداری شناسه setInterval، نگهداری دیتای پیشین و پرچم‌های داخلی، useRef عملکرد فوق‌العاده‌ای دارد چون رندر را قفل نمی‌کند.",
          recommendedSolution: "const timerId = useRef(null);",
        },
        dom_access: {
          id: "dom_access",
          type: "result",
          verdict: "use",
          verdictLabel: "کاربرد اصلی useRef 🎯",
          title: "متصل کردن به ویژگی ref المنت در JSX",
          explanation: "ری‌اکت در زمان مانت المنت، رفرنس واقعی مرورگر را داخل شیء ref.current قرار می‌دهد.",
          recommendedSolution: "<input ref={inputRef} />",
        },
      },
    },
    codeComparison: {
      title: "باگ نابودی تایمرها با استیت در برابر استفاده اصولی از useRef",
      description: "استفاده از useState برای نگهداری شناسه تایمر، رندر اضافه ایجاد می‌کند و خطر باگ Stale Timer دارد.",
      badTitle: "نگهداری شناسه تایمر در State",
      badGotcha: "تنظیم شناسه تایمر در استیت باعث یک ریرندر بیهوده می‌شود و کاربردی در ظاهر UI ندارد.",
      badCode: `// ❌ ریرندر بیهوده برای داده‌ای که نمایشی نیست
function StopWatch() {
  const [timerId, setTimerId] = useState(null); // ریرندر غیرضروری!

  const start = () => {
    const id = setInterval(() => tick(), 1000);
    setTimerId(id);
  };
}`,
      goodTitle: "نگهداری شناسه در useRef",
      goodReason: "رفرنس بدون ایجاد حتی یک رندر اضافه، شناسه تایمر را تا زمان پاکسازی در حافظه امن نگه می‌دارد.",
      goodCode: `// ✅ پایداری بدون ریرندر
function StopWatch() {
  const timerRef = useRef<number | null>(null);

  const start = () => {
    timerRef.current = window.setInterval(() => tick(), 1000);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}`,
    },
    react19Notes: {
      summary: "حذف نیاز به forwardRef در ری‌اکت ۱۹!",
      points: [
        { title: "پراپ مستقیم ref", desc: "در ری‌اکت ۱۹ دیگر نیازی به تابع پیچیده React.forwardRef نیست؛ ref مستقیماً به عنوان یک پراپ عادی به کامپوننت فرزند پاس داده می‌شود." },
      ],
    },
    quiz: {
      title: "چالش: چرا تغییر Ref در رندر تخلف است؟",
      question: "چرا کد زیر خطرناک است و قوانین خلوص ری‌اکت را نقض می‌کند؟",
      codeSnippet: `function BadComponent() {
  const countRef = useRef(0);
  countRef.current += 1; // تغییر در بدنه تابع

  return <div>{countRef.current}</div>;
}`,
      options: [
        { id: "a", text: "ری‌اکت در Strict Mode و Concurrent ممکن است یک رندر را چند بار ارزیابی کند و خروجی پیش‌بینی‌ناپذیر شود.", isCorrect: true, explanation: "کاملاً درست است! بدنه کامپوننت باید یک تابع خالص بدون ساید‌افکت باشد. تغییر رفرنس‌ها فقط باید در افکت‌ها یا هندلرها باشد." },
        { id: "b", text: "useRef فقط می‌تواند المنت DOM ذخیره کند.", isCorrect: false, explanation: "خیر، useRef هر مقداری را می‌تواند نگه دارد." },
        { id: "c", text: "خطای تایپ‌اسکریپت رخ می‌دهد.", isCorrect: false, explanation: "تایپ‌اسکریپت مانع این کار نمی‌شود." },
      ],
    },
  },

  // 6. useContext
  usecontext: {
    title: "useContext: رفع مسأله Prop Drilling، ایزولاسیون مصرف‌کننده و مرزهای بازسازی",
    slug: "usecontext",
    category: "Context & State Libraries",
    tier: "🔵",
    mentalModel: "کانتکست یک کانال مخابراتی مستقیم از بالا به پایین درخت است، اما ابزار مدیریت استیت نیست! هر زمان مقدار کانتکست تغییر کند، تمام کامپوننت‌هایی که آن را مصرف می‌کنند دوباره رندر می‌شوند، حتی اگر فقط بخش کوچکی از داده را خوانده باشند.",
    rule: "کانتکست‌های بزرگ و ترکیبی نسازید. داده‌های به‌ندرت تغییرکننده (مثل زبان و تم) را از داده‌های پرتکرار جدا کنید.",
    reactVersion: "React 18 & 19",
    quickRef: {
      tsSnippet: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<string>('dark');

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}`,
      jsSnippet: `import { createContext, useContext } from 'react';

const ThemeContext = createContext('dark');

export function useTheme() {
  return useContext(ThemeContext);
}`,
    },
    decisionTree: {
      title: "درخت تصمیم: Context یا راهکار دیگر؟",
      subtitle: "آیا مسأله شما با کانتکست حل می‌شود یا گرفتار ریرندرهای دسته‌جمعی می‌شوید؟",
      treeData: {
        start: {
          id: "start",
          question: "داده مورد نظر چه سرعتی در تغییر دارد و در کجا استفاده می‌شود؟",
          options: [
            { label: "داده‌های با تغییرات بسیار کم (تنظیمات تم، کاربر لاگین‌شده، زبان)", next: "low_freq" },
            { label: "داده‌های با تغییرات بسیار بالا (موقعیت اسکرول، تایپ در اینپوت، استیت چت)", next: "high_freq" },
            { label: "صرفاً پاس دادن پراپ از پدر به نوه (فاصله ۲ یا ۳ لایه)", next: "prop_drilling" },
          ],
        },
        low_freq: {
          id: "low_freq",
          type: "result",
          verdict: "use",
          verdictLabel: "بهترین کاربرد Context ✅",
          title: "کانتکست دقیقاً برای همین ساخته شده است",
          explanation: "برای تم، زبان و احراز هویت، هزینه ریرندر تغییرات کم به حساب می‌آید.",
          recommendedSolution: "<ThemeContext.Provider value={theme}>",
        },
        high_freq: {
          id: "high_freq",
          type: "result",
          verdict: "avoid",
          verdictLabel: "تله پرفورمنس Context ❌",
          title: "از کتابخانه‌های مبتنی بر Selector (مثل Zustand) استفاده کنید",
          explanation: "چون کانتکست قابلیت انتخاب‌گر تک‌فیلدی ندارد، هر تغییر در یک فیلد، کل درخت متصل را ریرندر می‌کند.",
          recommendedSolution: "Zustand: const count = useStore(s => s.count);",
        },
        prop_drilling: {
          id: "prop_drilling",
          type: "result",
          verdict: "avoid",
          verdictLabel: "الگوی ترجیحی Component Composition 💡",
          title: "ابتدا از ترکیب کامپوننت‌ها (Component Composition) بهره ببرید",
          explanation: "با پاس دادن کامپوننت فرزند به عنوان props.children، نیاز به کانتکست به کلی از بین می‌رود.",
          recommendedSolution: "<Layout sidebar={<Sidebar user={user} />} />",
        },
      },
    },
    codeComparison: {
      title: "کانتکست یکپارچه و غول‌پیکر در برابر کانتکست‌های تفکیک‌شده",
      description: "قرار دادن توابع و داده‌ها در یک آبجکت کانتکست مشترک، باعث رندرهای زنجیره‌ای غیرضروری می‌شود.",
      badTitle: "یک کانتکست برای همه چیز",
      badGotcha: "تغییر یک فیلد ساده در user، کامپوننت‌هایی را که فقط تابع logout را می‌خواستند دوباره رندر می‌کند!",
      badCode: `// ❌ ریرندر اجباری برای همه مصرف‌کنندگان
const AppContext = createContext({ user: null, theme: 'dark', logout: () => {} });`,
      goodTitle: "تفکیک کانتکست‌های مستقل",
      goodReason: "تفکیک کانتکست‌ها رندرهای نامرتبط را کاملاً خنثی می‌کند.",
      goodCode: `// ✅ تفکیک بر اساس فرکانس تغییر
const UserContext = createContext(null);
const ThemeContext = createContext('dark');`,
    },
    react19Notes: {
      summary: "خواندن کانتکست با هوک use() در ری‌اکت ۱۹",
      points: [
        { title: "هوک use(Context)", desc: "در ری‌اکت ۱۹ می‌توانید کانتکست را با هوک use() حتی داخل شرط‌ها و حلقه‌ها فراخوانی کنید!" },
      ],
    },
    quiz: {
      title: "چالش: چرا کامپوننت بدون تغییر فیلد ریرندر شد؟",
      question: "اگر کامپوننت A فقط فیلد a را از یک آبجکت کانتکست { a, b } بخواند، با تغییر فیلد b چه می‌شود؟",
      options: [
        { id: "a", text: "چون فیلد a تغییری نکرده، ری‌اکت هوشمندانه مانع ریرندر کامپوننت A می‌شود.", isCorrect: false, explanation: "خیر، useContext مکانیزم selector ندارد و با تغییر کل آبجکت ریرندر رخ می‌دهد." },
        { id: "b", text: "کامپوننت A قطعاً ریرندر می‌شود چون کل آبجکت ورودی پرووایدر تغییر کرده است.", isCorrect: true, explanation: "درست است! این بزرگ‌ترین دام کارایی کانتکست است." },
      ],
    },
  },

  // 7. useActionState & useOptimistic (React 19)
  useactionstate: {
    title: "useActionState و useOptimistic: فرم‌های مدرن، وضعیت در حال ارسال و UI بدون لرزش",
    slug: "useactionstate",
    category: "Hooks (Core + Library Hooks)",
    tier: "🟢",
    mentalModel: "در گذشته برای یک فرم ساده به useStateهای متوالی، هندلر سابمیت و افکت‌های کنترلی نیاز بود. در ری‌اکت ۱۹، Actionها متدولوژی درجه‌یک ری‌اکت هستند که وضعیت ارسال، بازگشت خطا و آپدیت‌های خوش‌بینانه را بدون نیاز به مدیریت دستی استیت سروسامان می‌دهند.",
    rule: "از هوک useActionState برای پیوند دادن متدهای Async با ورودی فرم‌ها استفاده کنید و با useOptimistic تأخیر پاسخ سرور را برای کاربر به صفر برسانید.",
    reactVersion: "React 19 Exclusives",
    quickRef: {
      tsSnippet: `import { useActionState, useOptimistic } from 'react';

// ۱. تابع اکشن ناهمگام
async function updateNameAction(prevState: string, formData: FormData) {
  const newName = formData.get('name') as string;
  await api.saveName(newName);
  return newName;
}

// ۲. هوک اکشن در کامپوننت
const [state, formAction, isPending] = useActionState(updateNameAction, 'علی');`,
      jsSnippet: `import { useActionState } from 'react';

async function updateNameAction(prevState, formData) {
  const newName = formData.get('name');
  await api.saveName(newName);
  return newName;
}

const [state, formAction, isPending] = useActionState(updateNameAction, 'علی');`,
    },
    decisionTree: {
      title: "درخت تصمیم: معماری فرم در ری‌اکت ۱۹",
      subtitle: "کدام رویکرد برای ارتباط فرم با سرور کمترین باگ و بهترین UX را به همراه دارد؟",
      treeData: {
        start: {
          id: "start",
          question: "فرم شما چه نوع ارتباطی با سرور دارد؟",
          options: [
            { label: "ارسال فرم ساده با اکشن سرور یا API داخلی", next: "action_state" },
            { label: "لایک، کامنت، چت یا اقداماتی که کاربر انتظار فیدبک میلی‌ثانیه‌ای دارد", next: "optimistic" },
          ],
        },
        action_state: {
          id: "action_state",
          type: "result",
          verdict: "use",
          verdictLabel: "الگوی استاندارد ری‌اکت ۱۹ ✅",
          title: "استفاده از useActionState",
          explanation: "فلگ isPending به طور خودکار لودینگ را مدیریت می‌کند بدون اینکه نیاز به try/catch دستی در کامپوننت باشد.",
          recommendedSolution: "const [state, formAction, isPending] = useActionState(serverAction, init);",
        },
        optimistic: {
          id: "optimistic",
          type: "result",
          verdict: "use",
          verdictLabel: "تجربه کاربری درجه یک 🚀",
          title: "ترکیب useActionState با useOptimistic",
          explanation: "بلافاصله تغییر را در کلاینت اعمال کنید. اگر درخواست پس از ۵۰۰ میلی‌ثانیه با شکست مواجه شد، ری‌اکت خودکار وضعیت را به حالت قبل رول‌بک می‌کند.",
          recommendedSolution: "const [optState, setOpt] = useOptimistic(state, updateFn);",
        },
      },
    },
    codeComparison: {
      title: "فرم سنتی با ده‌ها استیت در برابر اکشن‌های ری‌اکت ۱۹",
      description: "هوش مصنوعی معمولاً فرم‌ها را با الگوهای قدیمی React 16 (انبوهی از استیت‌ها) می‌سازد.",
      badTitle: "فرم سنتی با مدیریت دستی لودینگ و خطا",
      badGotcha: "کدنویسی طولانی، ناهماهنگی در کنترل دکمه لودینگ و احتمال ارسال همزمان چند فرم.",
      badCode: `// ❌ کدهای سنتی و پیچیده
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await api.post('/name', { name });
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};`,
      goodTitle: "استفاده از اکشن ری‌اکت ۱۹",
      goodReason: "یک خط کد اکشن، تمام مسئولیت‌های فرم و فیلدهای ارسال را به سادگی کنترل می‌کند.",
      goodCode: `// ✅ اکشن تمیز و خودکار در ری‌اکت ۱۹
const [name, action, isPending] = useActionState(async (prev, formData) => {
  return await updateName(formData.get('name'));
}, '');

return (
  <form action={action}>
    <input name="name" />
    <button disabled={isPending}>ارسال</button>
  </form>
);`,
    },
    react19Notes: {
      summary: "پایان دوران فرم‌های سنگین و هماهنگی کامل با Progressive Enhancement",
      points: [
        { title: "Progressive Enhancement", desc: "فرم‌های مبتنی بر اکشن حتی قبل از لود کامل باندل جاوااسکریپت می‌توانند کار کنند." },
      ],
    },
    quiz: {
      title: "چالش: رفتار useOptimistic در زمان بروز خطا",
      question: "اگر اکشن سرور در نیمه راه با ارور ۵۰۰ مواجه شود، چه بر سر داده خوش‌بینانه می‌آید؟",
      options: [
        { id: "a", text: "ری‌اکت به صورت خودکار تغییرات را لغو کرده و UI را به آخرین حالت پایدار برمی‌گرداند.", isCorrect: true, explanation: "دقیقاً! ویژگی خارق‌العاده useOptimistic قابلیت رول‌بک خودکار در شرایط عدم قطعیت است." },
        { id: "b", text: "داده غلط در UI باقی می‌ماند و صفحه باید دستی رفرش شود.", isCorrect: false, explanation: "خیر، ری‌اکت متوجه خطا در اکشن شده و وضعیت خوش‌بینانه را باطل می‌کند." },
      ],
    },
  },
};

// Helper function to find interactive topic by slug or title
export function getInteractiveTopic(slugOrTitle) {
  if (!slugOrTitle) return null;
  const normalized = slugOrTitle.toLowerCase().replace(/[^a-z]/g, "");

  // Direct matches
  if (normalized.includes("useeffect")) return interactiveTopicsData["useeffect"];
  if (normalized.includes("usestate")) return interactiveTopicsData["usestate"];
  if (normalized.includes("usereducer")) return interactiveTopicsData["usereducer"];
  if (normalized.includes("usememo") || normalized.includes("usecallback")) return interactiveTopicsData["usecallback, usememo"];
  if (normalized.includes("useref")) return interactiveTopicsData["useref"];
  if (normalized.includes("usecontext")) return interactiveTopicsData["usecontext"];
  if (normalized.includes("useactionstate") || normalized.includes("useoptimistic")) return interactiveTopicsData["useactionstate"];

  return null;
}
