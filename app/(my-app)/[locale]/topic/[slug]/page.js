import { getPayload } from "payload";
import config from "@payload-config";
import TopicDetailClient from "@/components/TopicDetailClient";
import { getInteractiveTopic } from "@/lib/interactiveTopicsData";
import { isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { resolveCanonicalSlug } from "@/lib/redirectMap";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const currentLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const decodedSlug = decodeURIComponent(slug);
  const canonical = resolveCanonicalSlug(decodedSlug) || decodedSlug;

  const isFa = currentLocale === "fa";

  return {
    title: `${canonical} — React Cheat Sheet`,
    description: isFa
      ? `مرجع مهندسی، مدل ذهنی و بررسی تله‌های هوش مصنوعی برای ${canonical}.`
      : `Production engineering reference, mental models, and gotchas for ${canonical}.`,
    alternates: {
      canonical: `/${currentLocale}/topic/${canonical}`,
      languages: {
        en: `/en/topic/${canonical}`,
        fa: `/fa/topic/${canonical}`,
        "x-default": `/en/topic/${canonical}`,
      },
    },
  };
}

export default async function LocalizedTopicPage({ params }) {
  const { locale, slug } = await params;
  const currentLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const decodedSlug = decodeURIComponent(slug);

  // Check if legacy slug needs permanent redirect to canonical
  const canonical = resolveCanonicalSlug(decodedSlug);
  if (canonical && canonical !== decodedSlug) {
    redirect(`/${currentLocale}/topic/${canonical}`);
  }

  // Check interactive dataset
  const interactive = getInteractiveTopic(decodedSlug);

  // Query Payload PostgreSQL database with locale
  let dbTopic = null;
  let dbCategory = null;
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: "topics",
      where: {
        or: [
          { slug: { equals: decodedSlug } },
          { slug: { equals: decodedSlug.toLowerCase() } },
          { title: { equals: decodedSlug } },
        ],
      },
      locale: currentLocale,
      limit: 1,
      depth: 0,
      select: {
        id: true,
        title: true,
        slug: true,
        tier: true,
        category: true,
        description: true,
        summary: true,
        mentalModel: true,
        goldenRule: true,
      },
    });
    if (found.docs.length > 0) {
      dbTopic = found.docs[0];
      const categoryId =
        typeof dbTopic.category === "object" && dbTopic.category !== null
          ? dbTopic.category.id
          : dbTopic.category;

      if (categoryId != null) {
        const categories = await payload.find({
          collection: "categories",
          where: { id: { equals: categoryId } },
          locale: currentLocale,
          limit: 1,
          depth: 0,
          select: { id: true, name: true },
        });
        dbCategory = categories.docs[0] || null;
      }
    }
  } catch (e) {
    console.error("Payload find topic error:", e);
  }

  if (!dbTopic && !interactive) {
    notFound();
  }

  const topicData = {
    title: dbTopic?.title || interactive?.title || decodedSlug,
    slug: dbTopic?.slug || interactive?.slug || decodedSlug,
    tier: dbTopic?.tier || interactive?.tier || "🔵",
    category: dbCategory?.name || interactive?.category || "Hooks",
    description: dbTopic?.description || null,
    summary: dbTopic?.summary || null,
    mentalModel: dbTopic?.mentalModel || interactive?.mentalModel || null,
    goldenRule: dbTopic?.goldenRule || interactive?.rule || null,
  };

  return (
    <main className="min-h-screen living-canvas-backdrop py-4">
      <TopicDetailClient
        topic={topicData}
        interactive={interactive}
        currentLocale={currentLocale}
      />
    </main>
  );
}
