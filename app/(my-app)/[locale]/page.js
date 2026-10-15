import { getPayload } from "payload";
import config from "@payload-config";
import HomepageComposition from "@/components/HomepageComposition";
import { isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n";

async function getCategoriesAndTopics(locale) {
  try {
    const payload = await getPayload({ config });

    const categories = await payload.find({
      collection: "categories",
      sort: "display_order",
      pagination: false,
      locale,
      select: {
        id: true,
        name: true,
        display_order: true,
      },
    });

    const topics = await payload.find({
      collection: "topics",
      sort: "display_order",
      pagination: false,
      locale,
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
        display_order: true,
      },
    });

    const combinedData = categories.docs.map((category) => {
      const topicsForThisCategory = topics.docs
        .filter((topic) => {
          const catId =
            typeof topic.category === "object" && topic.category !== null
              ? topic.category.id
              : topic.category;
          return catId === category.id;
        })
        .map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          tier: t.tier,
          description: t.description,
          summary: t.summary || null,
          mentalModel: t.mentalModel || null,
        }));

      return {
        id: category.id,
        name: category.name,
        display_order: category.display_order,
        topics: topicsForThisCategory,
      };
    });

    return combinedData;
  } catch (error) {
    throw new Error("Failed to fetch categories or topics.", { cause: error });
  }
}

export default async function LocalizedHomePage({ params }) {
  const { locale } = await params;
  const currentLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const categoriesWithTopics = await getCategoriesAndTopics(currentLocale);

  return (
    <HomepageComposition
      initialCategories={categoriesWithTopics}
      currentLocale={currentLocale}
    />
  );
}
