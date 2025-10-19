"use server";

import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { cookies } from "next/headers";
import { ResearchArticle, searchResearchArticles } from "./openalex";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type QuizContext = {
  issue?: string;
  feelings?: string;
  mood?: string[];
};

// Store chat instances per session
const chatSessions = new Map<string, Chat>();

async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("chat_session_id")?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("chat_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return sessionId;
}

function buildSystemInstruction(quizContext?: QuizContext): string {
  let systemInstruction = `You are an AI chat bot named Brain Buddy. Your goal is to motivate and uplift the user as well as dive deeper into their condition and current mood and feelings.`;

  if (quizContext) {
    if (quizContext.issue) {
      systemInstruction += `\n\nThe user has indicated they need support with: ${quizContext.issue}.`;
    }
    if (quizContext.mood && quizContext.mood.length > 0) {
      systemInstruction += `\n\nThe user's current mood includes: ${quizContext.mood.join(
        ", "
      )}.`;
    }
    if (quizContext.feelings && quizContext.feelings !== "[Not Answered]") {
      systemInstruction += `\n\nThe user described their feelings as: "${quizContext.feelings}".`;
    }
    systemInstruction += `\n\nTailor your responses to be empathetic and relevant to their specific situation.`;
  }

  systemInstruction += `\n\nReturn your answer in plain-text with no markdown.`;

  return systemInstruction;
}

// Define the OpenAlex search function for Gemini
const searchResearchArticlesDeclaration: FunctionDeclaration = {
  name: "searchResearchArticles",
  description:
    "Search for academic research papers, studies, and scientific articles related to mental health, psychology, and wellbeing topics. Use this when the user asks for research, studies, papers, or scientific evidence.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          "The search query for research papers. Include relevant keywords like the mental health topic, condition, or intervention being researched.",
      },
      limit: {
        type: Type.NUMBER,
        description: "Number of results to return (default: 5, max: 10)",
      },
    },
    required: ["query"],
  },
};

async function getOrCreateChat(sessionId: string): Promise<Chat> {
  if (!chatSessions.has(sessionId)) {
    const chat = await ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [
        {
          role: "model",
          parts: [
            {
              text: "Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing research resources on what you're dealing with.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: buildSystemInstruction(),
        tools: [
          {
            functionDeclarations: [searchResearchArticlesDeclaration],
          },
        ],
      },
    });

    chatSessions.set(sessionId, chat);

    // Clean up old sessions after 1 hour
    setTimeout(() => {
      chatSessions.delete(sessionId);
    }, 60 * 60 * 1000);
  }

  return chatSessions.get(sessionId)!;
}

export async function initializeChatWithContext(
  quizContext: QuizContext
): Promise<void> {
  const sessionId = await getSessionId();

  // Always recreate chat with new context
  const chat = await ai.chats.create({
    model: "gemini-2.5-flash-lite",
    history: [
      {
        role: "model",
        parts: [
          {
            text: "Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing research resources on what you're dealing with.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: buildSystemInstruction(quizContext),
      tools: [
        {
          functionDeclarations: [searchResearchArticlesDeclaration],
        },
      ],
    },
  });

  chatSessions.set(sessionId, chat);

  // Clean up old sessions after 1 hour
  setTimeout(() => {
    chatSessions.delete(sessionId);
  }, 60 * 60 * 1000);
}

type ChatResponse = {
  text: string;
  searchResults?: ResearchArticle[];
};

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const sessionId = await getSessionId();
  const chat = await getOrCreateChat(sessionId);

  const response = await chat.sendMessage({
    message: message,
  });

  console.log(
    "Response has function calls:",
    response.functionCalls?.length || 0
  );

  // Check if Gemini wants to call a function
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    console.log(
      "Function call detected:",
      functionCall.name,
      functionCall.args
    );

    if (functionCall.name === "searchResearchArticles" && functionCall.args) {
      const query = functionCall.args.query as string;
      const limit = (functionCall.args.limit as number) || 5;

      console.log("Calling searchOpenAlex with query:", query);

      // Call the actual function
      const searchResults = await searchResearchArticles(query, limit);

      console.log("Search results length:", searchResults.length);

      return {
        text: "Here are some relevant research papers I found:",
        searchResults: searchResults,
      };
    }
  }

  // No function call, return the text
  return {
    text: response.text || "Sorry, I couldn't generate a response.",
  };
}

export async function resetChat(): Promise<void> {
  const sessionId = await getSessionId();
  chatSessions.delete(sessionId);
}
