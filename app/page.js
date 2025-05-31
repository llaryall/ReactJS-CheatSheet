// app/page.jsx
// Import the new function
import { getAdminAuthenticatedPb } from "../lib/pocketbase";
// Import the new client component for search and display
import TopicBrowser from "../components/TopicBrowser";

async function getCategoriesAndTopics() {
  // Renamed for clarity, was getCategoriesAndAllTopics
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
    <main className="w-full min-h-screen pt-5 px-4 pb-6 md:pb-8 bg-[linear-gradient(135deg,_#8F87F1_-50%,_#f8fafc_100%)] dark:bg-[linear-gradient(135deg,_#7A70D8_-50%,_#d1d5db_100%)]">
      {" "}
      {/* Adjusted top padding of main */}
      {/* Combined Header Block for Title and Tier Legend - Set top margin to 0 as main has pt-5 */}
      <div className="mt-0 mb-6 md:mb-8 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md rounded-xl p-4 md:p-6 max-w-3xl mx-auto shadow-lg text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#3D3D3D] dark:text-gray-100 mb-4 md:mb-6">
          ReactJS Cheatsheet
        </h1>
        {/* Tier Legend */}
        <p className="text-sm sm:text-md text-[#3D3D3D]/80 dark:text-gray-300/90 flex flex-col sm:flex-row items-center justify-center sm:items-end gap-3 sm:gap-6 md:gap-8">
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
      {/* Render the TopicBrowser client component and pass the fetched data */}
      <TopicBrowser initialCategories={categoriesWithTopics} />
    </main>
  );
}
