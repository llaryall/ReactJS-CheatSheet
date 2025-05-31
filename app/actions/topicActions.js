"use server";

// Assuming your lib folder is at the root of your project,
// and 'actions' is a subfolder of 'app'.
// Adjust the path if your project structure is different.
// If you have a path alias like '@/' for the root, you could use:
// import { getAdminAuthenticatedPb } from '@/lib/pocketbase';
import { getAdminAuthenticatedPb } from '../../lib/pocketbase';

export async function getTopicById(topicId) {
  if (!topicId) {
    console.error("[Server Action] getTopicById: topicId is required.");
    // It's good practice to return a structured error or throw
    return { data: null, error: "Topic ID is required." };
  }

  try {
    const pb = await getAdminAuthenticatedPb();
    console.log(`[Server Action] Admin PB instance obtained. Fetching topic with ID: ${topicId}`);

    if (!pb.authStore.isValid || !pb.authStore.isAdmin) {
        console.error("[Server Action] Admin authentication failed or PB instance is not admin.");
        return { data: null, error: "Admin authentication failed. Cannot fetch topic." };
    }

    const topicData = await pb.collection('topics').getOne(topicId);
    return { data: topicData, error: null };
  } catch (error) {
    console.error(`[Server Action] Failed to fetch topic ${topicId}:`, error.name, error.message, error.response || error.originalError);
    return { data: null, error: `Failed to load topic: ${error.message}` };
  }
}