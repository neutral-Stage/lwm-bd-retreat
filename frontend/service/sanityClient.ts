import { createClient } from "@sanity/client";

// Environment variables for better security
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "4sm78dyf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "retreat";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token =
  process.env.SANITY_API_TOKEN ||
  "sknnqqY9maFNdrzrtDtXV95jxPrDuHV557tP6EbHkvr2DhpdT5lgC76zFRPa9Ji4VCRr7NqSxb6MdKd3ybmJ7NLRyX0qO4Fo9RKeyz7YNuImW9FUi2xxKq4ZHwpEcOU32u5KJfps8FDKL9QxihFXH64j15FbCjo7gRa6WeiMgF2Qe6oZsN4b";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // Disable CDN to avoid caching issues for mutations
  perspective: "published", // Use published perspective by default
  ignoreBrowserTokenWarning: true, // Allow mutations from browser
});

// Export a client for preview mode (drafts)
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // Never use CDN for preview
  perspective: "previewDrafts", // Include draft content
  ignoreBrowserTokenWarning: true,
});

// Helper function to get the appropriate client based on preview mode
export const getClient = (preview = false) =>
  preview ? previewClient : client;
