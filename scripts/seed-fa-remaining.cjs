// Persian interactive primitives for the 2 remaining topics:
//   effect-cleanup · form-actions-server-forms
// Brings Persian database coverage to 51/51 topics (100%).
const { Client } = require('pg');

const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
  throw new Error('DATABASE_URI is required. Load it with: node --env-file=.env.local <script>');
}

const TOPICS = [
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'effect-cleanup',
    topicId: 94,
    cmpId: 50,
    dtId: 50,
    qzId: 50,
    base: {
      title: 'پاکسازی اثر (Effect Cleanup): چرخه معکوس ستاپ، لغو اشتراک و مهار نشت حافظه',
      summary: 'تابع کلین‌آپ همگام‌سازی بیرونی یک اثر را متوقف یا معکوس می‌کند. ری‌اکت این تابع را پیش از اجرای مجدد افکتی که وابستگی‌هایش عوض شده، و همچنین هنگام آنمانت نهایی کامپوننت فراخوانی می‌کند. نبود یا تقارن نداشتن کلین‌آپ ریشه خاموش‌ترین نشت‌های حافظه در وب است.',
      mentalModel: 'افکت را مانند یک اجاره‌نامه کوتاه‌مدت روی یک منبع بیرونی ببینید: تابع ستاپ منبع را اجاره می‌کند و تابع کلین‌آپ دقیقاً همان منبع را پس می‌دهد. با تغییر وابستگی‌ها، ری‌اکت ابتدا اجاره‌نامه قبلی را فسخ می‌کند و سپس قرارداد جدید می‌بندد. این دو بخش باید مثل تصویر آینه متقارن باشند.',
      goldenRule: 'هر افکتی که اشتراک، وب‌سوکت، تایمر یا درخواست شبکه‌ای باز می‌کند، باید در تابع بازگشتی خود دقیقاً همان منبع را آزاد کند. هرگز تابع اصلی useEffect را async نکنید؛ ری‌اکت فقط تابع پاکسازی را می‌پذیرد و پرامیس را نادیده می‌گیرد.',
      whenToUse: `۱. لغو اشتراک از ایونت‌لیسنرهای پنجره (resize، scroll) و وب‌سوکت‌ها با بستن صریح سوکت بازشده.
۲. متوقف کردن تایمرها با clearInterval و clearTimeout پیش از شروع چرخه بعدی یا خروج از صفحه.
۳. ابطال درخواست‌های معلق شبکه با AbortController یا پرچم ignore برای مهار مسابقه ناهمگام و نشت استیت.`,
      whenNotToUse: `۱. برای معکوس کردن اکشن‌های مستقیم کاربر مانند کلیک دکمه یا سابمیت فرم؛ این منطق منحصراً به هندلر رویداد تعلق دارد.
۲. برای محاسبات همگام و خالص استیت که هیچ منبع مستمر بیرونی ندارند؛ این محاسبات باید درون رندر یا useMemo انجام شوند.
۳. تبدیل بدنه اصلی useEffect به یک تابع async؛ ری‌اکت پرامیس برگشتی را اجرا نمی‌کند و کلین‌آپ عملاً ثبت نمی‌شود.`,
      codeExplanation: 'سوکت بازشده در کلوژر ستاپ نگهداری می‌شود. با تغییر chatId، ری‌اکت ابتدا کلین‌آپ قبلی را صدا می‌زند که سوکت قبلی را می‌بندد، سپس ستاپ تازه را اجرا می‌کند. در محیط دولوپمنت با Strict Mode، ری‌اکت این چرخه را دو بار اجرا می‌کند تا تقارن کلین‌آپ تحت فشار سنجیده شود.',
      description: {
        root: {
          type: 'root', format: '', indent: 0, version: 1, direction: 'rtl',
          children: [
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'افکت‌ها پل اتصال کامپوننت ری‌اکت به دنیای بیرون هستند: اتصالات شبکه، رویدادهای مرورگر، وب‌سوکت‌ها، تایمرها و آبزرورها. کلین‌آپ نیمه دوم و مهارکننده این همگام‌سازی است.',
              }],
            },
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'ری‌اکت کلین‌آپ دوره قبل را قبل از اجرای ستاپ جدید (با وابستگی‌های تغییریافته) فراخوانی می‌کند. این ترتیب زمانی تضمین می‌کند که هرگز دو اشتراک همزمان برای یک کامپوننت باز نمانند.',
              }],
            },
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'در استریکت مد (Strict Mode) ری‌اکت یک بار ستاپ، کلین‌آپ و دوباره ستاپ را اجرا می‌کند تا استحکام کد سنجیده شود. مقاومت در برابر این تست به معنای تطابق کامل رفتاری میان ستاپ و کلین‌آپ است.',
              }],
            },
          ],
        },
      },
    },
    steps: [
      {
        order: 1, stepId: 1,
        title: '۱. ستاپ منبع بیرونی را در اختیار می‌گیرد (Setup Acquires Resource)',
        phase: 'Setup',
        domState: 'شمارنده اعضای اتاق چت به سوکت وصل شد',
        screenContent: 'کاربر پیام اتصال اتاق عمومی (general) و افزایش شمارنده را می‌بیند.',
        activeAction: 'افکت یک اتصال WebSocket برای roomId = "general" باز می‌کند و لیسنرهای پیام را روی آن ست می‌نماید.',
        closureSnapshot: 'socket = new WebSocket("/ws?room=general")',
        explanation: 'ستاپ فقط یک محاسبه زودگذر نیست؛ بلکه تملک یک منبع فعال را به عهده می‌گیرد که پس از پایان تابع همچنان زنده است.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '۲. تغییر وابستگی — کلین‌آپ قبل از ستاپ جدید اجرا می‌شود',
        phase: 'Cleanup Before Re-Sync',
        domState: 'سوکت قبلی در حال بسته شدن است',
        screenContent: 'شمارنده برای کسری از ثانیه متوقف شده و سپس با اتاق جدید سینک می‌شود.',
        activeAction: 'پیش از اجرای ستاپ برای roomId = "random"، ری‌اکت تابع کلین‌آپ ستاپ قبلی را فراخوانی می‌کند. آن تابع سوکت قبلی را از کلوژر خود می‌خواند و close می‌کند.',
        closureSnapshot: 'cleanup#1 closes socket("/ws?room=general")',
        explanation: 'کلین‌آپ فقط مال زمان خروج از صفحه (Unmount) نیست. با هر تغییر وابستگی اجرا می‌شود تا اشتراک‌ها روی هم تلمبار نشوند.',
        highlight: true,
      },
      {
        order: 3, stepId: 3,
        title: '۳. اجرای مجدد ستاپ با مقادیر تازه (Re-Sync)',
        phase: 'Re-Sync',
        domState: 'دقیقاً یک سوکت باز روی مرورگر باقی مانده است',
        screenContent: 'پیام‌های اتاق random دریافت می‌شوند؛ هیچ پیامی از اتاق قبلی نشت نمی‌کند.',
        activeAction: 'ستاپ تازه سوکت جدیدی برای "random" باز می‌کند و کلین‌آپ تازه‌ای را به ری‌اکت تحویل می‌دهد.',
        closureSnapshot: 'socket = new WebSocket("/ws?room=random")',
        explanation: 'در هر چرخه رندر تنها یک منبع فعال در پنل شبکه وجود دارد. اتصال قبلی به کلی آزاد شده است.',
        highlight: false,
      },
      {
        order: 4, stepId: 4,
        title: '۴. آنمانت کامپوننت و پاکسازی نهایی (Teardown)',
        phase: 'Teardown',
        domState: 'تمام کانکشن‌های شبکه بسته شدند',
        screenContent: 'کاربر از صفحه چت خارج شد؛ پردازش اضافه‌ای در پس‌زمینه در جریان نیست.',
        activeAction: 'ری‌اکت آخرین تابع کلین‌آپ را فراخوانی می‌کند و سوکت اتاق random را نیز می‌بندد.',
        closureSnapshot: 'cleanup#2 closes socket("/ws?room=random")',
        explanation: 'کلوژر جاوااسکریپت ضامن امنیت است: هر تابع کلین‌آپ دقیقاً منبع ایجادشده در نوبت خودش را می‌شناسد.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '۵. تله: عدم تقارن میان ستاپ و کلین‌آپ (Mismatched Mirror Trap)',
        phase: 'Mismatched Mirror',
        domState: 'دو سوکت همزمان باز است و یک لیسنر یتیم شده',
        screenContent: 'پیام‌های چت دو بار دریافت می‌شوند و شمارنده تکراری بالا می‌رود.',
        activeAction: 'کد هوش مصنوعی لیسنر را با فلش‌فانکشن اینلاین حذف می‌کند یا بستن سوکت را فراموش می‌کند. اشتراک قبلی در حافظه مرورگر زنده می‌ماند.',
        closureSnapshot: 'listener#1 still bound after cleanup ran',
        explanation: 'قانون بنیادین: کلین‌آپ باید دقیقاً تصویر آینه‌ای و خط‌به‌خط ستاپ باشد. هر عدم تقارنی به نشت حافظه ختم می‌شود.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'تله آینه نامتقارن (The Mismatched Mirror)',
        subtitle: 'ستاپ ثبت می‌کند، کلین‌آپ فراموش می‌کند — نشت آرام حافظه با هر جابجایی',
        why: 'وقتی کلین‌آپ هندلری با رفرنس متفاوت از ستاپ را حذف می‌کند (مثلاً استفاده از توابع پیکانی ناشناس داخل removeEventListener)، لیسنر قبلی زنده می‌ماند. این باگ هیچ خطایی پرت نمی‌کند، اما باعث اجرای دوبرابری پیام‌ها و اشغال دائم رم در سشن‌های طولانی می‌شود.',
        fix: 'کلین‌آپ را دقیقاً معکوس خط‌به‌خط ستاپ بنویسید. تابع هندلر را خارج از متد نام‌گذاری کنید تا رفرنس آن در هر دو طرف یکسان باشد.',
        designPattern: 'الگوی RAII و Scope Guard (کتاب Dive Into Design Patterns): تصاحب و آزادسازی یک منبع یک جفت تفکیک‌ناپذیرند. کلین‌آپ کلوژری بر همان منبع اختصاص‌یافته است.',
      },
      {
        order: 2,
        title: 'فرض اشتباه اینکه کلین‌آپ فقط برای آنمانت است (Treating Cleanup as Unmount)',
        subtitle: 'افزایش مداوم اشتراک‌ها با هر تغییر وابستگی به جای یک اشتراک پایدار',
        why: 'برنامه‌نویسانی که از کامپوننت‌های کلاسی به هوک‌ها آمده‌اند، کلین‌آپ را با componentWillUnmount یکی می‌دانند. کلین‌آپ قبل از هر رندر مجدد با وابستگی‌های تغییریافته هم اجرا می‌شود. اگر تصور کنید فقط هنگام خروج اجرا می‌شود، کدهایی می‌نویسید که وضعیت‌های مشترک را به ازای هر بار تایپ تغییر می‌دهند.',
        fix: 'در قالب یک چرخه واحد فکر کنید: ستاپ، کلین‌آپ، تکرار. بپرسید آیا اجرای مکرر این جفت به صورت مستقل امن است یا خیر.',
        designPattern: 'الگوی طول عمر منبع منفرد (Single-Resource Lifetime): افکت مالک یک چرخه واحد است نه کل تاریخچه حیات کامپوننت.',
      },
      {
        order: 3,
        title: 'تله ستاپ ناهمگام (The Async Setup Trap)',
        subtitle: 'افکتی که پرامیس برمی‌گرداند و عملاً هیچ کلین‌آپی ندارد',
        why: 'تبدیل تابع اصلی useEffect به async باعث می‌شود خروجی آن به جای تابع کلین‌آپ، یک پرامیس جاوااسکریپت باشد. ری‌اکت هر چیزی غیر از تابع را نادیده می‌گیرد، بنابراین کلین‌آپ هرگز رجیستر نمی‌شود و درخواست‌های معلق به فراخوانی setState بعد از تخریب کامپوننت ادامه می‌دهند.',
        fix: 'تابع ستاپ افکت را همگام نگه دارید. تابع ناهمگام را درون افکت تعریف و بلافاصله صدا بزنید، و تابع کلین‌آپ را از اسکوپ همگام بیرونی برگردانید.',
        designPattern: 'قرارداد اینترفیس (Interface Contract): ری‌اکت منحصراً یک خروجی به شکل تابع برای کلین‌آپ می‌شناسد؛ هر نوع داده دیگری بی‌اثر است.',
      },
    ],
    cmp: {
      title: 'ستاپ بدون کلین‌آپ متقارن در برابر کلین‌آپ آینه‌ای کامل',
      subtitle: 'تفاوت یک خط کد میان پایان اشتراک و زنده ماندن سوکت بعد از ترک صفحه',
      badLabel: 'ستاپ ناقص با نشت لیسنر و سوکت',
      badGotcha: 'هوش مصنوعی سوکت را باز می‌کند و رفرنسی برای کلین‌آپ برنمی‌گرداند؛ برای resize هم یک فلش‌فانکشن جدید پاس می‌دهد که با هندلر قبلی هم‌ارز نیست. با هر ورود به اتاق سوکت قبلی زنده می‌ماند.',
      goodLabel: 'کلین‌آپ متقارن با آزادسازی دقیق منابع',
      goodReason: 'رفرنس هندلرها در متغیرهای یکتا ذخیره شده و دقیقا همان رفرنس در کلین‌آپ حذف می‌شود. سوکت وب‌سوکت نیز صراحتاً با متد close بسته می‌شود.',
      footerNote: 'اگر ستاپ و کلین‌آپ از همان متغیرها استفاده نکنند، افکت هنوز کامل نشده است.',
    },
    dt: {
      title: 'درخت تصمیم: آیا این افکت به تابع کلین‌آپ نیاز دارد؟',
      subtitle: 'بپرسید چه چیزی بعد از بازگشت تابع همچنان در پس‌زمینه زنده می‌ماند',
      rootQuestion: 'آیا ستاپ منبعی می‌سازد که فراتر از فراخوانی عمر می‌کند — سوکت، تایمر، لیسنر، ریکوئست؟',
      nodes: {
        branchA: 'بله — منبعی که تا کسی متوقفش نکند کار می‌کند (تایمر، وب‌سوکت، لیسنر)',
        resultA: 'تابع کلین‌آپی برگردانید که دقیقاً همان منبع را متوقف کند. متغیرهای متقارن، یک جفت در هر چرخه.',
        codeA: `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`,
        branchB: 'خیر — یک محاسبه همگام بدون دستگیره بیرونی است',
        subQuestion: 'آیا این کار مستقیماً با تعامل کاربر (کلیک، تایپ، سابمیت) تحریک می‌شود؟',
        yesLabel: 'بله — با رویداد کاربر شروع می‌شود (کلیک دکمه، ارسال پیام)',
        yesResult: 'جایش داخل هندلر رویداد است. افکت برای همگام‌سازی با دنیای بیرون است نه واکنش به کلیک.',
        codeYes: 'onClick={() => { track("purchase"); pay(); }}',
        noLabel: 'خیر — استخراج خالص از استیت و پراپ است',
        noResult: 'مستقیماً در فاز رندر محاسبه کنید؛ اگر محاسبه واقعاً گران بود از useMemo استفاده کنید.',
        codeNo: 'const total = items.reduce((sum, i) => sum + i.price, 0);',
      },
    },
    qz: {
      title: 'چالش: چرا این افکت حافظه نشت می‌دهد؟',
      subtitle: 'تایپ بازگشتی را بخوانید، نه نیت کد را',
      question: 'این کد تابع کلین‌آپ دارد؛ اما چرا همچنان درخواست قبلی را لغو نمی‌کند و حافظه نشت می‌دهد؟',
      options: [
        {
          text: 'هیچ مشکلی ندارد — کنترلر در کلین‌آپ abort شده و درخواست لغو می‌شود.',
          isCorrect: false,
          explanation: 'کنترلر هرگز به تابع fetch پاس داده نشده است؛ پس فراخوانی abort هیچ اثری روی درخواست شبکه ندارد.',
        },
        {
          text: 'شیء AbortController ساخته شده ولی به عنوان signal به fetch پاس داده نشده، در نتیجه abort هیچ نقشی ندارد.',
          isCorrect: true,
          explanation: 'دقیقاً! متد abort فقط درخواست‌هایی را لغو می‌کند که signal آن کنترلر را دریافت کرده باشند. اینجا fetch بدون سیگنال صدا زده شده و درخواست به راهش ادامه می‌دهد.',
        },
        {
          text: 'تعریف تابع async داخل بدنه useEffect ممنوع است.',
          isCorrect: false,
          explanation: 'تعریف و فراخوانی تابع async درون افکت کاملاً قانونی است؛ چیزی که ممنوع است async کردن خودِ کالبک اصلی افکت است.',
        },
        {
          text: 'آرایه وابستگی‌ها برای یک درخواست فچ حتماً باید خالی باشد.',
          isCorrect: false,
          explanation: 'خالی بودن آرایه باعث می‌شود با تغییر userId درخواست جدیدی ارسال نشود و داده‌ها کهنه بمانند.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'form-actions-server-forms',
    topicId: 95,
    cmpId: 51,
    dtId: 51,
    qzId: 51,
    base: {
      title: 'اکشن‌های فرم و فرم‌های سرور (Form Actions & Server Forms): استیت ترنزیشن، FormData بومی و مرز امنیتی سرور اکشن',
      summary: 'اکشن‌های فرم در ری‌اکت به فرم اجازه می‌دهند مستقیماً به یک تابع سابمیت شود. اکشن‌ها ناهمگام هستند، درون ترنزیشن اجرا می‌شوند و با وضعیت pending، آپدیت‌های خوش‌بینانه و useActionState یکپارچه می‌گردند. سرور اکشن‌ها قابلیت پیشرفته فریم‌ورک هستند و باید مرزهای اعتبارسنجی و احراز هویت را رعایت کنند.',
      mentalModel: 'اکشن فرم مانند فرمان ارسالی توسط فرم است: FormData ورودی آن، و مقدار بازگشتی وضعیت outcome است. ری‌اکت دوره انتظار و به‌روزرسانی UI را مدیریت می‌کند. فرم یک فرم استاندارد HTML باقی می‌ماند، بنابراین رفتارهای بومی وب و پیشرفت تدریجی (Progressive Enhancement) حفظ می‌شوند.',
      goldenRule: 'از اکشن برای سابمیت فرم استفاده کنید، FormData را در مرز ورودی سرور با اسکیما اعتبارسنجی کنید، و تفاوت اکشن‌های فرم کلاینت با سرور اکشن‌های واقعی را تفکیک نمایید.',
      whenToUse: `۱. سابمیت‌های ناهمگام برای ایجاد یا به‌روزرسانی داده‌ها با استفاده از شیء استاندارد FormData.
۲. استفاده از useActionState برای نمایش خطاهای اعتبارسنجی بازگشتی از سرور و مدیریت فیلدهای فرم.
۳. خواندن وضعیت در حال ارسال (pending) با useFormStatus درون دکمه سابمیت که فرزند فرم است.`,
      whenNotToUse: `۱. فرض اینکه اکشن ری‌اکت خودکار یک اندپوینت امن سمت سرور است، بدون اینکه فریم‌ورک آن را با "use server" پشتیبانی کند.
۲. اعتماد به اعتبارسنجی سمت کلاینت و نادیده گرفتن بررسی نشست (Session) و احراز هویت در بدنه سرور اکشن.
۳. تعاملات ساده همگام بدون ارسال فرم؛ در آنجا یک هندلر رویداد و استیت معمولی ساده‌تر و کم‌هزینه‌تر است.`,
      codeExplanation: 'اکشن فرم داده‌های FormData را دریافت کرده و وضعیت جدید را برمی‌گرداند که توسط useActionState مدیریت می‌شود. دکمه ارسال وضعیت pending را از کامپوننتی که در درون فرم رندر شده می‌خواند. در سرور اکشن‌ها دایرکتیو "use server" الزامی است و داده‌ها باید اعتبارسنجی شوند.',
      description: {
        root: {
          type: 'root', format: '', indent: 0, version: 1, direction: 'rtl',
          children: [
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'اکشن فرم تابعی است که به اتریبیوت action تگ فرم داده می‌شود. ری‌اکت آن را با شیء FormData صدا می‌زند، کارهای ناهمگام را در یک ترنزیشن کپسوله می‌کند و مانع رفرش صفحه می‌شود.',
              }],
            },
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'هوک useActionState وضعیت بازگشتی، تابع ارسال و حالت pending را مدیریت می‌کند. برای خواندن وضعیت لودینگ درون فرم از useFormStatus در کامپوننت فرزند استفاده می‌شود.',
              }],
            },
            {
              type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl',
              children: [{
                type: 'text', mode: 'normal', style: '', detail: 0, format: 0, version: 1,
                text: 'سرور اکشن‌ها توسط فریم‌ورک‌هایی مثل Next.js به اندپوینت‌های عمومی تبدیل می‌شوند. همیشه داده‌های ورودی را با اسکیماهایی مثل Zod بررسی کنید و هویت کاربر را از کوکی سشن بخوانید.',
              }],
            },
          ],
        },
      },
    },
    steps: [
      {
        order: 1, stepId: 1,
        title: '۱. سابمیت بومی، مهارشده توسط ری‌اکت (Native Submission Intercepted)',
        phase: 'Submit',
        domState: 'مرورگر داده‌های فرم را جمع‌آوری کرده است',
        screenContent: 'کاربر دکمه ذخیره را می‌زند؛ صفحه رفرش نمی‌شود.',
        activeAction: 'چون اتریبیوت action فرم یک تابع است، ری‌اکت مانع ناوبری پیش‌فرض مرورگر شده و ارسال را در یک Transition کپسوله می‌کند.',
        closureSnapshot: 'transition started → form is now pending',
        explanation: 'فرم همچنان یک فرم واقعی HTML است؛ چیزی که تغییر کرده نحوه هماهنگی و پردازش ارسال توسط ری‌اکت است.',
        highlight: false,
      },
      {
        order: 2, stepId: 2,
        title: '۲. ساخت خودکار FormData از صفت‌های name فیلدها',
        phase: 'FormData Assembly',
        domState: 'هیچ استیت ری‌اکتی برای جمع‌آوری مقادیر به کار نرفت',
        screenContent: 'دکمه به حالت غیرفعال با متن "در حال ذخیره..." تغییر وضعیت می‌دهد.',
        activeAction: 'تمام اینپوت‌های دارای اتریبیوت name درون یک شیء FormData بسته‌بندی می‌شوند. فیلدهای بدون name نادیده گرفته می‌شوند.',
        closureSnapshot: 'formData.get("email") → "ada@example.com"',
        explanation: 'دلیل اینکه نیازی به اینپوت‌های کنترل‌شده نبود همین است: دام همیشه مقادیر را نگه داشته بود و ری‌اکت در لحظه ارسال آن را می‌خواند.',
        highlight: false,
      },
      {
        order: 3, stepId: 3,
        title: '۳. انتقال وضعیت Pending به کامپوننت فرزند (Pending Propagation)',
        phase: 'Pending Propagation',
        domState: 'دکمه ارسال غیرفعال و محافظت‌شده است',
        screenContent: 'اسپینر ظاهر شده و امکان دوبار کلیک ناخواسته سلب می‌شود.',
        activeAction: 'کامپوننتی که درون تگ فرم رندر شده با useFormStatus وضعیت pending: true را از کانتکست فرم بالاسری می‌خواند.',
        closureSnapshot: 'useFormStatus() → { pending: true }',
        explanation: 'این هوک کانتکست فرم والد را می‌خواند؛ به همین دلیل صریحاً باید در کامپوننت فرزند فرم قرار گیرد نه در خود کامپوننت فرم.',
        highlight: true,
      },
      {
        order: 4, stepId: 4,
        title: '۴. بازگشت پاسخ اکشن و ریست فیلدها (Resolve & Reset)',
        phase: 'Resolve',
        domState: 'فیلدهای کنترل‌نشده فرم به طور خودکار پاک شدند',
        screenContent: 'پیام سبز "ذخیره شد" نمایان می‌شود و فرم برای ورودی بعدی آماده است.',
        activeAction: 'اکشن نتیجه را برمی‌گرداند؛ useActionState آن را به عنوان استیت جدید ذخیره کرده و ری‌اکت فیلدهای کنترل‌نشده را ریست می‌کند.',
        closureSnapshot: 'state = { ok: true, message: "Saved" } | pending: false',
        explanation: 'ریست خودکار فقط روی اینپوت‌های کنترل‌نشده اثر دارد؛ فیلدهای متصل به useState مقدارشان را نگه می‌دارند.',
        highlight: false,
      },
      {
        order: 5, stepId: 5,
        title: '۵. مرز امنیتی سرور اکشن (Server Boundary)',
        phase: 'Server Boundary',
        domState: 'مرورگر درخواستی ارسال کرده که فرم کلاینت شاید ننوشته باشد',
        screenContent: 'هیچ چیز مشکوکی در UI دیده نمی‌شود.',
        activeAction: 'سرور اکشن به یک اندپوینت شبکه عمومی ترجمه می‌شود. هر کلاینتی می‌تواند با پی‌لود دستکاری‌شده آن را صدا بزند، بدون اینکه از UI شما رد شده باشد.',
        closureSnapshot: 'request body is attacker-controlled',
        explanation: 'تابع روی سرور اجرا می‌شود اما از طریق اینترنت قابل دسترس است. یعنی یک اندپوینت عمومی است و باید تمام پارامترهایش اعتبارسنجی شوند.',
        highlight: false,
      },
    ],
    gotchas: [
      {
        order: 1,
        title: 'استفاده از useFormStatus در همان کامپوننت فرم (useFormStatus in the Wrong Component)',
        subtitle: 'دکمه‌ای که هرگز غیرفعال نمی‌شود و کاربری که دو بار سابمیت می‌کند',
        why: 'هوک useFormStatus کانتکست نزدیک‌ترین فرم والد را می‌خواند. اگر آن را در کامپوننتی صدا بزنید که خودش تگ form را برمی‌گرداند، این هوک کانتکست خودش را نمی‌بیند و همیشه pending: false پس می‌دهد. نتیجه: دکمه موقع ارسال غیرفعال نمی‌شود.',
        fix: 'دکمه ارسال را به یک کامپوننت مستقل جداگانه تبدیل کرده و درون تگ form قرار دهید. والد فرم را ترکیب می‌کند؛ فرزند وضعیت را می‌خواند.',
        designPattern: 'کانتکست پیرامونی (Ambient Context از کتاب Dive Into Design Patterns): ناشر نمی‌تواند ناظر محتوای خودش باشد. مصرف‌کننده باید در درخت ساختاری زیر ناشر قرار گیرد.',
      },
      {
        order: 2,
        title: 'اعتماد به اعتبارسنجی کلاینت در سرور اکشن (Trusting Client Validation in a Server Action)',
        subtitle: 'اندپوینتی که مقادیری را می‌پذیرد که فرم هرگز اجازه ارسالش را نمی‌داد',
        why: 'تعیین صفت required یا اعتبارسنجی کلاینت فقط مرورگر را محدود می‌کند. سرور اکشن یک اندپوینت باز در شبکه است؛ هر کسی می‌تواند با curl پی‌لودی با مقادیر منفی، شناسه‌های جعلی یا متون مخرب ارسال کند. سرور اکشن به صورت خودکار داده‌ها را امن نمی‌کند.',
        fix: 'در ابتدای سرور اکشن ورودی‌ها را با اسکیماهایی مثل Zod اعتبارسنجی کنید و هویت کاربر را از نشست (Session) سرور استخراج نمایید نه از پارامتر ارسالی فرم.',
        designPattern: 'مرز اعتماد (Trust Boundary): هر داده‌ای که از شبکه عبور می‌کند غیرقابل اعتماد است، صرف‌نظر از اینکه کدام کامپوننت کلاینت آن را ساخته باشد.',
      },
      {
        order: 3,
        title: 'انتظار ریست شدن فیلدهای کنترل‌شده (Expecting Controlled Inputs to Reset)',
        subtitle: 'فرم اعلام موفقیت می‌کند اما مقادیر قبلی همچنان در کادرها باقی مانده‌اند',
        why: 'ری‌اکت پس از موفقیت اکشن فقط اینپوت‌های کنترل‌نشده را ریست می‌کند. فیلدی که به useState متصل باشد مقدار ذخیره‌شده در استیت را حفظ می‌کند. اگر کاربر دوباره دکمه را بزند داده‌های قدیمی دوباره ارسال می‌شوند.',
        fix: 'برای هر فرم یک مدل انتخاب کنید: یا با defaultValue کاملاً کنترل‌نشده بمانید و ریست را به ری‌اکت بسپارید، یا کنترل‌شده باشید و استیت را دستی در مسیر موفقیت خالی کنید.',
        designPattern: 'مالکیت یگانه (Single Owner): دقیقاً یکی از استیت ری‌اکت یا DOM مرورگر مالک مقدار فیلد است. تفکیک نامناسب باعث ناهماهنگی صفحه با خودش می‌شود.',
      },
    ],
    cmp: {
      title: 'سرور اکشن بدون مرز اعتبارسنجی در برابر اکشن امن بر پایه اسکیما و سشن',
      subtitle: 'دایرکتیو تابع را در دسترس عموم می‌گذارد؛ اعتبارسنجی است که آن را قابل دفاع می‌کند',
      badLabel: 'سرور اکشن متکی به پی‌لود کلاینت',
      badGotcha: 'هوش مصنوعی "use server" می‌نویسد، userId و نقش را مستقیماً از FormData می‌خواند و در دیتابیس ثبت می‌کند. فرم هرگز فیلد نقش را نشان نمی‌دهد، اما اندپوینت عمومی هر مقداری را از هر کسی می‌پذیرد.',
      goodLabel: 'هویت از سشن سرور، ورودی کنترل‌شده با اسکیما',
      goodReason: 'هویت کاربر از کوکی سشن مطمئن خوانده شده و ورودی با Zod فیلتر می‌شود. حمله دستکاری پارامتر خنثی شده و فقط به رکوردهای متعلق به خود کاربر اعمال می‌گردد.',
      footerNote: 'سرور اکشن یک اندپوینت باز است. فرض کنید هر کسی می‌تواند مستقیماً با پی‌لود دستکاری‌شده آن را فراخوانی کند.',
    },
    dt: {
      title: 'درخت تصمیم: آیا این سابمیت به سرور اکشن نیاز دارد؟',
      subtitle: 'قابلیت اکشن ری‌اکت را از قابلیت سرور اکشن فریم‌ورک تفکیک کنید',
      rootQuestion: 'دقیقاً چه داده‌ای ارسال می‌شود و چه کسی باید آن را پردازش کند؟',
      nodes: {
        branchA: 'داده‌ای که باید پایدار روی دیتابیس سرور ذخیره شود — رکورد، پرداخت، فایل',
        resultA: 'از سرور اکشن با اعتبارسنجی اسکیما و استخراج سشن امن استفاده کنید.',
        codeA: 'const [state, formAction, isPending] = useActionState(serverAction, initial);',
        branchB: 'تعامل محلی کلاینت بدون نیاز به پایگاه داده — فیلتر کردن، چندمرحله‌ای کردن ویزارد',
        subQuestion: 'آیا فریم‌ورک شما سرور اکشن دارد و معماری پروژه بر پایه آن است؟',
        yesLabel: 'بله — Next.js App Router یا ران‌تایم سرور معادل',
        yesResult: 'از سرور اکشن ("use server") همراه با بررسی دسترسی و Zod استفاده کنید.',
        codeYes: '"use server"; const parsed = Schema.safeParse(Object.fromEntries(formData));',
        noLabel: 'خیر — ری‌اکت SPA معمولی یا محیط رندر کلاینت',
        noResult: 'از اکشن فرم به همراه یک API Route استاندارد و fetch استفاده کنید.',
        codeNo: 'await fetch("/api/profile", { method: "POST", body: formData });',
      },
    },
    qz: {
      title: 'چالش: چرا دکمه ثبت فرم در حین ارسال غیرفعال نمی‌شود؟',
      subtitle: 'منبع انتشار وضعیت pending را دنبال کنید',
      question: 'در حین ارسال فرم، مقدار pending همچنان false می‌ماند و دکمه غیرفعال نمی‌شود. علت چیست؟',
      options: [
        {
          text: 'هوک useFormStatus نیاز به کلمه کلیدی await قبل از خواندن pending دارد.',
          isCorrect: false,
          explanation: 'این یک هوک ری‌اکت است نه تابع ناهمگام؛ مقدار pending به صورت همگام از کانتکست خوانده می‌شود.',
        },
        {
          text: 'هوک درون همان کامپوننتی فراخوانی شده که تگ form را می‌سازد؛ پس کانتکست فرم بالاسری را می‌خواند نه این فرم را.',
          isCorrect: true,
          explanation: 'دقیقاً! تگ form وضعیت خود را به کامپوننت‌های پایین‌دست خود منتشر می‌کند. کامپوننتی که خودش فرم را می‌سازد والد فرم است و به وضعیت آن دسترسی ندارد.',
        },
        {
          text: 'سرور اکشن‌ها اصولاً وضعیت pending را پشتیبانی نمی‌کنند.',
          isCorrect: false,
          explanation: 'سرور اکشن‌ها کاملاً با useFormStatus و useActionState یکپارچه‌اند.',
        },
        {
          text: 'دکمه برای دریافت کانتکست حتماً باید دارای صفت type="submit" باشد.',
          isCorrect: false,
          explanation: 'نوع دکمه رفتار سابمیت را تعیین می‌کند، نه توانایی خواندن کانتکست ری‌اکت را.',
        },
      ],
    },
  },
];

async function seedTopic(c, spec) {
  const { slug, topicId, cmpId, dtId, qzId, base, steps, gotchas, cmp, dt, qz } = spec;

  // 1. topics_locales for 'fa'
  await c.query("DELETE FROM topics_locales WHERE _parent_id = $1 AND _locale = 'fa'", [topicId]);
  await c.query(
    `INSERT INTO topics_locales
      (_parent_id, _locale, title, summary, mental_model, golden_rule,
       when_to_use, when_not_to_use, code_explanation, description)
     VALUES ($1, 'fa', $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      topicId, base.title, base.summary, base.mentalModel, base.goldenRule,
      base.whenToUse, base.whenNotToUse, base.codeExplanation, JSON.stringify(base.description),
    ],
  );

  // 2. topics_timeline_steps for 'fa'
  await c.query("DELETE FROM topics_timeline_steps WHERE _parent_id = $1 AND _locale = 'fa'", [topicId]);
  for (const s of steps) {
    await c.query(
      `INSERT INTO topics_timeline_steps
        (_order, _parent_id, _locale, id, step_id, title, phase, dom_state,
         screen_content, active_action, closure_snapshot, explanation, highlight)
       VALUES ($1, $2, 'fa', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        s.order, topicId, `${slug}-fa-step-${s.stepId}`, s.stepId, s.title, s.phase,
        s.domState, s.screenContent, s.activeAction, s.closureSnapshot, s.explanation, s.highlight,
      ],
    );
  }

  // 3. topics_gotcha_radar for 'fa'
  await c.query("DELETE FROM topics_gotcha_radar WHERE _parent_id = $1 AND _locale = 'fa'", [topicId]);
  for (const g of gotchas) {
    await c.query(
      `INSERT INTO topics_gotcha_radar
        (_order, _parent_id, _locale, id, title, subtitle, why, fix, design_pattern)
       VALUES ($1, $2, 'fa', $3, $4, $5, $6, $7, $8)`,
      [g.order, topicId, `${slug}-fa-gotcha-${g.order}`, g.title, g.subtitle, g.why, g.fix, g.designPattern],
    );
  }

  // 4. code_comparisons_locales for 'fa'
  await c.query("DELETE FROM code_comparisons_locales WHERE _parent_id = $1 AND _locale = 'fa'", [cmpId]);
  await c.query(
    `INSERT INTO code_comparisons_locales
      (_parent_id, _locale, title, subtitle, bad_label, bad_gotcha, good_label, good_reason, footer_note)
     VALUES ($1, 'fa', $2, $3, $4, $5, $6, $7, $8)`,
    [cmpId, cmp.title, cmp.subtitle, cmp.badLabel, cmp.badGotcha, cmp.goodLabel, cmp.goodReason, cmp.footerNote],
  );

  // 5. decision_trees_locales for 'fa'
  await c.query("DELETE FROM decision_trees_locales WHERE _parent_id = $1 AND _locale = 'fa'", [dtId]);
  await c.query(
    `INSERT INTO decision_trees_locales
      (_parent_id, _locale, title, subtitle, root_question, nodes)
     VALUES ($1, 'fa', $2, $3, $4, $5)`,
    [dtId, dt.title, dt.subtitle || null, dt.rootQuestion, JSON.stringify(dt.nodes)],
  );

  // 6. quizzes_locales for 'fa' + quizzes_options_locales
  await c.query("DELETE FROM quizzes_locales WHERE _parent_id = $1 AND _locale = 'fa'", [qzId]);
  await c.query(
    `INSERT INTO quizzes_locales (_parent_id, _locale, title, subtitle, question)
     VALUES ($1, 'fa', $2, $3, $4)`,
    [qzId, qz.title, qz.subtitle, qz.question],
  );

  const opts = (await c.query(
    'SELECT id FROM quizzes_options WHERE _parent_id = $1 ORDER BY _order', [qzId],
  )).rows;
  if (opts.length !== qz.options.length) {
    throw new Error(`${slug}: quiz has ${opts.length} option rows vs ${qz.options.length} in content`);
  }
  for (let i = 0; i < qz.options.length; i += 1) {
    const o = qz.options[i];
    await c.query("DELETE FROM quizzes_options_locales WHERE _parent_id = $1 AND _locale = 'fa'", [opts[i].id]);
    await c.query(
      `INSERT INTO quizzes_options_locales (_parent_id, _locale, text, explanation)
       VALUES ($1, 'fa', $2, $3)`,
      [opts[i].id, o.text, o.explanation],
    );
  }

  // 7. Update translation status to verified-parity
  await c.query(
    "UPDATE topics SET translation_status = 'verified-parity', updated_at = NOW() WHERE id = $1",
    [topicId],
  );
}

async function main() {
  const c = new Client({ connectionString: DATABASE_URI });
  await c.connect();
  console.log('Connected to Postgres.\n');
  try {
    for (const spec of TOPICS) {
      await c.query('BEGIN');
      await seedTopic(c, spec);
      await c.query('COMMIT');
      console.log(`✓ ${spec.slug}: Persian locale, 5 steps, 3 gotchas, comparison, tree, quiz seeded. Status → verified-parity.`);
    }
    console.log('\nAll missing Persian content successfully seeded.');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    console.error('Fatal:', err.message);
    process.exitCode = 1;
  } finally {
    await c.end();
  }
}

main();
