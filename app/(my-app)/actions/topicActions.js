"use server";

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getTopicById(topicId) {
  if (!topicId) {
    console.error("[Server Action] getTopicById: topicId is required.");
    return { data: null, error: "Topic ID is required." };
  }

  try {
    const payload = await getPayload({ config })
    const topicData = await payload.findByID({
      collection: 'topics',
      id: topicId,
      depth: 2,
    })
    return { data: topicData, error: null };
  } catch (error) {
    console.error(`[Server Action] Failed to fetch topic ${topicId}:`, error);
    return { data: null, error: `Failed to load topic: ${error.message}` };
  }
}