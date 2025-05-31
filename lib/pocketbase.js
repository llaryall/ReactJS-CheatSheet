// lib/pocketbase.js
import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

// This instance can be used for any public, unauthenticated calls if needed.
export const pb = new PocketBase(POCKETBASE_URL);

// --- New function for an admin authenticated client ---
let adminAuthPromise = null; // To avoid authenticating multiple times unnecessarily

export async function getAdminAuthenticatedPb() {
  const adminPb = new PocketBase(POCKETBASE_URL); // Create a new instance for admin auth

  // Check if already authenticated or if auth is in progress
  if (adminPb.authStore.isValid && adminPb.authStore.model?.email === process.env.POCKETBASE_ADMIN_EMAIL) {
    // console.log("Admin already authenticated or token still valid.");
    return adminPb;
  }

  // If another request is already authenticating, wait for it
  if (adminAuthPromise) {
    // console.log("Waiting for existing admin authentication process...");
    await adminAuthPromise;
    // Re-check if auth store is now valid after waiting
    if (adminPb.authStore.isValid && adminPb.authStore.model?.email === process.env.POCKETBASE_ADMIN_EMAIL) {
        return adminPb;
    }
  }

  if (process.env.POCKETBASE_ADMIN_EMAIL && process.env.POCKETBASE_ADMIN_PASSWORD) {
    // console.log("Attempting admin authentication...");
    adminAuthPromise = adminPb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL,
      process.env.POCKETBASE_ADMIN_PASSWORD
    );
    try {
      await adminAuthPromise;
      // console.log("Admin authenticated successfully.");
    } catch (error) {
      console.error("Admin authentication failed:", error.message);
      // Depending on your error handling, you might want to throw this error
      // or return the unauthenticated client. For now, it will return the client
      // which will then likely fail on the collection request if rules are strict.
    } finally {
        adminAuthPromise = null; // Reset promise after completion
    }
  } else {
    console.warn("Admin email or password not provided in environment variables.");
  }
  return adminPb;
}