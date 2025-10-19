"use server";

export type WHOArticle = {
  Title: string;
  ItemDefaultUrl: string;
  PublicationDateAndTime: string;
  FormatedDate: string;
  Provider: string;
  SystemSourceKey: string;
  UrlName: string;
};

export type WHOArticleResponse = WHOArticle[] | { value?: WHOArticle[] };

/**
 * Check if search text matches query keywords (very lenient)
 */
function matchesKeywords(searchText: string, query: string): boolean {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (keywords.length === 0) return true;

  const textLower = searchText.toLowerCase();

  // Match if ANY keyword is found (not all)
  return keywords.some((keyword) => {
    const regex = new RegExp(`\\b${keyword}`, "i");
    return regex.test(textLower);
  });
}

/**
 * Search WHO articles with pagination
 * @param query - Search term for filtering articles
 * @param limit - Number of results to return (default: 5)
 */
export async function searchWHOArticles(
  query: string,
  limit: number = 5
): Promise<string> {
  try {
    // Try different pagination parameters that WHO API might support
    // Common OData pagination: $top, $skip, per_page, pageSize
    const urls = [
      "https://www.who.int/api/news/articles?$top=200", // OData style
      "https://www.who.int/api/news/articles?pageSize=200",
      "https://www.who.int/api/news/articles?per_page=200",
      "https://www.who.int/api/news/articles", // Default
    ];

    let data: WHOArticle[] = [];
    let fetchSuccess = false;

    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log("Trying WHO API URL:", url);
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) continue;

        const rawData = await response.json();

        // Handle different response structures
        if (Array.isArray(rawData)) {
          data = rawData;
        } else if (rawData.value && Array.isArray(rawData.value)) {
          data = rawData.value;
        } else if (rawData.results && Array.isArray(rawData.results)) {
          data = rawData.results;
        }

        if (data.length > 0) {
          console.log(`WHO API returned ${data.length} articles from ${url}`);
          fetchSuccess = true;
          break;
        }
      } catch (err) {
        console.log(`Failed with ${url}:`, err);
        continue;
      }
    }

    if (!fetchSuccess || data.length === 0) {
      return "Unable to fetch WHO articles at this time.";
    }

    console.log("Total WHO articles available:", data.length);
    console.log("Search query:", query);

    // Use very lenient filtering - match on common mental health terms
    const mentalHealthKeywords = [
      "mental",
      "health",
      "depression",
      "anxiety",
      "stress",
      "wellbeing",
      "well-being",
      "psychological",
      "psychiatr",
      "therapy",
      "counseling",
      "emotional",
      "mood",
      "suicide",
    ];

    // First try strict matching with user query
    let filteredResults = data.filter((item) => {
      if (!item.Title) return false;
      return matchesKeywords(item.Title, query);
    });

    // If no results, try broader mental health keywords
    if (filteredResults.length === 0) {
      console.log("No results with user query, trying mental health keywords");
      filteredResults = data.filter((item) => {
        if (!item.Title) return false;
        const titleLower = item.Title.toLowerCase();
        return mentalHealthKeywords.some((keyword) =>
          titleLower.includes(keyword)
        );
      });
    }

    // If still no results, just return most recent articles
    if (filteredResults.length === 0) {
      console.log("No mental health articles found, returning recent articles");
      filteredResults = data.slice(0, limit);

      const formattedResults = filteredResults
        .map((item, index) => {
          return `${index + 1}. "${item.Title || "Untitled"}"
   Published: ${item.FormatedDate || "Unknown date"}
   Link: ${item.ItemDefaultUrl || "#"}`;
        })
        .join("\n\n");

      return `No mental health specific articles found. Here are ${filteredResults.length} recent WHO articles:\n\n${formattedResults}`;
    }

    // Take only the requested limit
    const finalResults = filteredResults.slice(0, limit);
    console.log(`Returning ${finalResults.length} filtered results`);

    // Format results
    const formattedResults = finalResults
      .map((item, index) => {
        return `${index + 1}. "${item.Title || "Untitled"}"
   Published: ${item.FormatedDate || "Unknown date"}
   Link: ${item.ItemDefaultUrl || "#"}`;
      })
      .join("\n\n");

    return `Found ${finalResults.length} WHO articles:\n\n${formattedResults}`;
  } catch (error) {
    console.error("WHO API error:", error);
    return "Sorry, I couldn't fetch WHO articles at this time.";
  }
}

/**
 * Get WHO articles by specific health topics
 * @param healthTopicId - GUID of the health topic
 * @param limit - Number of results to return
 */
export async function getWHOArticlesByHealthTopic(
  healthTopicId: string,
  limit: number = 5
): Promise<WHOArticle[]> {
  try {
    const response = await fetch(
      `https://www.who.int/api/news/articles?healthtopics=${healthTopicId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WHO API error: ${response.status}`);
    }

    const rawData = await response.json();

    let data: WHOArticle[];
    if (Array.isArray(rawData)) {
      data = rawData;
    } else if (rawData.value) {
      data = rawData.value;
    } else if (rawData.results) {
      data = rawData.results;
    } else {
      return [];
    }

    return data.slice(0, limit);
  } catch (error) {
    console.error("WHO API error:", error);
    return [];
  }
}

/**
 * Get a single WHO article by key
 */
export async function getWHOArticleById(
  key: string
): Promise<WHOArticle | null> {
  try {
    const response = await fetch(
      `https://www.who.int/api/news/articles(${key})`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WHO API error: ${response.status}`);
    }

    const data: WHOArticle = await response.json();
    return data;
  } catch (error) {
    console.error("WHO API error:", error);
    return null;
  }
}
