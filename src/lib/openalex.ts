// lib/openalex.ts
"use server";

export interface ResearchArticle {
  id: string;
  title: string;
  authors: string[];
  publication_date: string;
  abstract: string | null;
  doi: string | null;
  url: string;
  citation_count: number;
}

interface OpenAlexWork {
  id: string;
  title: string;
  authorships: Array<{
    author: {
      display_name: string;
    };
  }>;
  publication_date: string;
  abstract_inverted_index: Record<string, number[]> | null;
  doi: string | null;
  url: string;
  cited_by_count: number;
}

interface OpenAlexResponse {
  results: OpenAlexWork[];
  meta: {
    count: number;
    page: number;
  };
}

function reconstructAbstract(
  abstractInvertedIndex: Record<string, number[]> | null
): string | null {
  if (!abstractInvertedIndex) return null;

  const words = new Array(Object.values(abstractInvertedIndex).flat().length);

  Object.entries(abstractInvertedIndex).forEach(([word, positions]) => {
    positions.forEach((pos) => {
      words[pos] = word;
    });
  });

  return words.join(" ");
}

export async function searchResearchArticles(
  searchTerms: string,
  limit: number = 10,
  page: number = 1
): Promise<ResearchArticle[]> {
  try {
    if (!searchTerms.trim()) {
      throw new Error("Search terms cannot be empty");
    }

    const perPage = Math.min(limit, 100);
    const params = new URLSearchParams({
      search: searchTerms,
      per_page: perPage.toString(),
      page: page.toString(),
      sort: "cited_by_count:desc",
    });

    const response = await fetch(
      `https://api.openalex.org/works?${params.toString()}`,
      {
        headers: {
          "User-Agent": "MyApp/1.0 (contact: your-email@example.com)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `OpenAlex API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenAlexResponse = await response.json();

    const articles: ResearchArticle[] = data.results.map((result) => ({
      id: result.id,
      title: result.title,
      authors: result.authorships.map((a) => a.author.display_name),
      publication_date: result.publication_date || "Unknown",
      abstract: reconstructAbstract(result.abstract_inverted_index),
      doi: result.doi,
      url: result.url,
      citation_count: result.cited_by_count,
    }));

    return articles;
  } catch (error) {
    console.error("Error fetching from OpenAlex:", error);
    throw error;
  }
}

export async function getArticleById(
  articleId: string
): Promise<ResearchArticle | null> {
  try {
    const response = await fetch(
      `https://api.openalex.org/works/${articleId}`,
      {
        headers: {
          "User-Agent": "MyApp/1.0 (contact: your-email@example.com)",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const result: OpenAlexWork = await response.json();

    return {
      id: result.id,
      title: result.title,
      authors: result.authorships.map((a) => a.author.display_name),
      publication_date: result.publication_date || "Unknown",
      abstract: reconstructAbstract(result.abstract_inverted_index),
      doi: result.doi,
      url: result.url,
      citation_count: result.cited_by_count,
    };
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    return null;
  }
}
