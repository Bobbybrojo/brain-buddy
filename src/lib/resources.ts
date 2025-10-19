// src/lib/resources.ts
"use server";

import { searchResearchArticles, ResearchArticle } from "./openalex";

export type ResourceResults = {
  researchArticles: ResearchArticle[];
};

/**
 * Search all available mental health resources
 * Calls multiple APIs and returns combined results
 */
export async function searchResources(
  query: string,
  limit: number = 5
): Promise<ResourceResults> {
  try {
    console.log(`Searching all resources for: ${query}`);

    const researchArticles = await searchResearchArticles(query, limit);

    return {
      researchArticles,
    };
  } catch (error) {
    console.error("Error searching resources:", error);
    return {
      researchArticles: [],
    };
  }
}
