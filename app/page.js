
import { getAdminAuthenticatedPb } from "../lib/pocketbase";
import Image from "next/image";
import TopicBrowser from "../components/TopicBrowser";

async function getCategoriesAndTopics() {
  const pb = await getAdminAuthenticatedPb();

  if (!pb.authStore.isValid || !pb.authStore.model?.id) {
    console.error(
      "Admin authentication failed. Cannot fetch data for homepage."
    );
    return []; // Return empty array, HomePage will show "No categories found"
  }

  try {
    console.log("Fetching categories...");
    const categoriesData = await pb.collection("categories").getFullList({
      sort: "display_order",
    });

    const allTopicsData = await pb.collection("topics").getFullList({
      sort: "display_order",
      fields: "id,title,slug,tier,category,description", // Added 'description'
    });

    // Combine categories with their respective topics
    const combinedData = categoriesData.map((category) => {
      const topicsForThisCategory = allTopicsData
        .filter((topic) => topic.category === category.id) // Match topics to this category
        .map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          tier: t.tier,
          description: t.description,
        })); // Include description

      return {
        ...category, // Spread all original category fields
        topics: topicsForThisCategory, // Add the topics array
      };
    });

    return combinedData;
  } catch (error) {
    console.error(
      "Failed to fetch categories or topics for homepage:",
      error.name,
      error.message,
      error.response || error.originalError
    );
    return []; // Return empty array on error
  }
}

export default async function HomePage() {
  const categoriesWithTopics = await getCategoriesAndTopics();
  return (
    <main className="w-full min-h-screen pt-5 px-2 pb-6 md:pb-8 bg-[linear-gradient(135deg,_#8F87F1_-50%,_#f8fafc_100%)] dark:bg-[linear-gradient(135deg,_#7A70D8_-50%,_#d1d5db_100%)]">
      <div className="sm:hidden md:block w-full flex justify-center mb-2">
        <a
          href="https://github.com/llaryall/ReactJS-CheatSheet"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
        >
          <Image
            src="/github.svg"
            alt="GitHub"
            className="h-8 w-8 hover:scale-110 transition-transform"
            width={32}
            height={32}
            style={{ minWidth: 24, minHeight: 24 }}
          />
        </a>
      </div>
      {/* Responsive centered header container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl bg-white/10 dark:bg-slate-800/20 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-6 shadow-lg flex flex-col items-center mt-2 mb-6 md:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#3D3D3D] dark:text-gray-100 mb-2 md:mb-4 text-center leading-tight truncate">
            ReactJS Cheatsheet
          </h1>
          {/* Tier Legend: always in a row */}
          <p className="text-xs sm:text-sm md:text-md text-[#3D3D3D]/80 dark:text-gray-300/90 flex flex-row flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="font-semibold text-center sm:text-left">
              <span className="text-green-600 dark:text-green-400">
                🟢 Beginner{" "}
              </span>
            </span>
            <span className="font-semibold text-center sm:text-left">
              <span className="text-blue-600 dark:text-blue-400">
                🔵 Common Use{" "}
              </span>
            </span>
            <span className="font-semibold text-center sm:text-left">
              <span className="text-purple-600 dark:text-purple-400">
                🟣 Advanced{" "}
              </span>
            </span>
          </p>
        </div>
      </div>
      {/* Render the TopicBrowser client component and pass the fetched data */}
      <TopicBrowser initialCategories={categoriesWithTopics} />
    </main>
  );
}
