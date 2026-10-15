import "../globals.css";
import { isValidLocale, DEFAULT_LOCALE, getLocaleDirection } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const currentLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const isFa = currentLocale === "fa";

  return {
    title: isFa
      ? "چیت‌شیت مهندسی ری‌اکت — یادگیری عمیق، سریع و هوشمندانه"
      : "React Cheat Sheet — Master React. Smarter.",
    description: isFa
      ? "مرجع تعاملی مهندسی ری‌اکت، مدل‌های ذهنی، تله‌های هوش مصنوعی و معماری پروداکشن."
      : "A modern, interactive cheat sheet and engineering guide for React developers.",
    alternates: {
      canonical: `/${currentLocale}`,
      languages: {
        en: "/en",
        fa: "/fa",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocalizedRootLayout({ children, params }) {
  const { locale } = await params;
  const currentLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const dir = getLocaleDirection(currentLocale);

  return (
    <html lang={currentLocale} dir={dir} className="scroll-smooth">
      <body className="living-canvas-backdrop text-[#334155] min-h-screen selection:bg-sky-100 selection:text-sky-900 font-sans">
        {children}
      </body>
    </html>
  );
}
