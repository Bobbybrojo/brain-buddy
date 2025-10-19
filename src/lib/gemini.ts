"use server";

import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { searchResources, ResourceResults } from "./resources";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type QuizContext = {
  issue?: string;
  feelings?: string;
  mood?: string[];
};

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

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

  systemInstruction += `\n\nYou have access to mental health resources through the searchResources function. Use it when the user asks for research, studies, or information about mental health topics. This function returns academic research articles.`;
  systemInstruction += `\n\nReturn a brief answer in markdown.`;

  return systemInstruction;
}

// Unified search function declaration
const searchResourcesDeclaration: FunctionDeclaration = {
  name: "searchResources",
  description:
    "Search for mental health resources including academic research papers and scientific evidence. Use this when the user asks for research, studies, papers, or information about mental health topics.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          "The search query for mental health resources. Include relevant keywords like the mental health topic, condition, or intervention. Search using a keyword style rather than a google style search.",
      },
      limit: {
        type: Type.NUMBER,
        description:
          "Number of results per source to return (default: 5, max: 10)",
      },
    },
    required: ["query"],
  },
};

type ChatResponse = {
  text: string;
  resources?: ResourceResults;
};

export async function sendChatMessage(
  message: string,
  previousMessages: ChatMessage[],
  quizContext?: QuizContext
): Promise<ChatResponse> {
  // Create a fresh chat with full history each time
  const chat = await ai.chats.create({
    model: "gemini-2.5-flash-lite",
    history: [
      {
        role: "model",
        parts: [
          {
            text: quizContext
              ? `Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing resources on what you're dealing with.\nYou said that you're feeling ${
                  quizContext.issue
                }.\nYour current mood includes ${quizContext.mood?.join(
                  ", "
                )}. You described your feelings: ${quizContext.feelings}`
              : "Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing research resources on what you're dealing with.",
          },
        ],
      },
      // Add previous messages from history
      ...previousMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    ],
    config: {
      systemInstruction: buildSystemInstruction(quizContext),
      tools: [
        {
          functionDeclarations: [searchResourcesDeclaration],
        },
      ],
    },
  });

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

    if (functionCall.name === "searchResources" && functionCall.args) {
      const query = functionCall.args.query as string;
      const limit = (functionCall.args.limit as number) || 5;

      console.log("Calling searchResources with query:", query);

      // Call the unified search function
      const resources = await searchResources(query, limit);

      console.log(
        "Resources found - Articles:",
        resources.researchArticles.length
      );

      return {
        text: "Here are the resources I found:",
        resources: resources,
      };
    }
  }

  // No function call, return the text
  return {
    text: response.text || "Sorry, I couldn't generate a response.",
  };
}
