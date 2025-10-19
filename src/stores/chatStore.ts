import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ResourceResults } from "@/lib/resources";

type TextPart = {
  text: string;
};

type ChatParts = [TextPart];

export type ChatMsg = {
  role: "model" | "user";
  parts: ChatParts;
  id: string;
};

type QuizContext = {
  issue?: string;
  feelings?: string;
  mood?: string[];
};

type ChatStore = {
  history: ChatMsg[];
  resources: ResourceResults | null; // Store the latest resources
  initializeWithContext: (quizContext: QuizContext) => void;
  addUserMessage: (msg: string) => void;
  addModelMessage: (msg: string) => void;
  addResources: (resources: ResourceResults) => void;
  setResources: (resources: ResourceResults) => void;
  clearResources: () => void;
};

const useChatStore = create<ChatStore>((set) => ({
  history: [],
  resources: null,

  initializeWithContext: (quizContext: QuizContext) => {
    const greetingText = quizContext.issue
      ? `Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing resources on what you're dealing with.\nYou said that you're feeling ${
          quizContext.issue
        }.\nYour current mood includes ${quizContext.mood?.join(
          ", "
        )}. You described your feelings: ${quizContext.feelings}`
      : "Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing research resources on what you're dealing with.";

    set({
      history: [
        {
          role: "model",
          parts: [{ text: greetingText }],
          id: uuidv4(),
        },
      ],
    });
  },

  addUserMessage: (msg: string) => {
    set((state) => ({
      history: [
        { role: "user", parts: [{ text: msg }], id: uuidv4() },
        ...state.history,
      ],
    }));
  },

  addModelMessage: (msg: string) => {
    set((state) => ({
      history: [
        { role: "model", parts: [{ text: msg }], id: uuidv4() },
        ...state.history,
      ],
    }));
  },

  addResources: (newResources: ResourceResults) => {
    set((state) => ({
      ...state,
      resources: {
        researchArticles: [
          ...newResources.researchArticles,
          ...(state.resources?.researchArticles || []),
        ],
      },
    }));
  },

  setResources: (resources: ResourceResults) => {
    set({ resources });
  },

  clearResources: () => {
    set({ resources: null });
  },
}));

export default useChatStore;
