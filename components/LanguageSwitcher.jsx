"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({ currentLocale = "en" }) {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = (targetLocale) => {
    if (targetLocale === currentLocale) return;

    // Replace the first path segment (locale) with targetLocale
    const segments = pathname ? pathname.split("/").filter(Boolean) : [];
    if (segments[0] === "en" || segments[0] === "fa") {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }

    const newPath = `/${segments.join("/")}`;
    // Persist locale preference in cookie
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center rounded-full bg-slate-100/90 border border-slate-200/90 p-0.5 text-xs font-mono" dir="ltr">
      <button
        type="button"
        onClick={() => toggleLocale("en")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          currentLocale === "en"
            ? "bg-white text-slate-900 font-bold shadow-2xs"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => toggleLocale("fa")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-sans ${
          currentLocale === "fa"
            ? "bg-white text-slate-900 font-bold shadow-2xs"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="تغییر به زبان فارسی"
      >
        فارسی
      </button>
    </div>
  );
}
