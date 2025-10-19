import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { ResearchArticle } from "@/lib/openalex";

type TextPart = {
  text: string;
};

type InlineDataPart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

type ChatParts = [TextPart, ...InlineDataPart[]];

export type ChatMsg = {
  role: "model" | "user";
  parts: ChatParts;
  id: string;
};

type chatHistory = ChatMsg[];

type ChatStore = {
  history: chatHistory;
  research: ResearchArticle[];
  addUserMessage: (msg: string) => void;
  addModelMessage: (msg: string) => void;
  addResearch: (newResearch: ResearchArticle[]) => void;
};

const useChatStore = create<ChatStore>((set) => ({
  history: [
    {
      role: "model",
      parts: [
        {
          text: "Hi there! I'm Brain Buddy. Here to help you uplift and motivate yourself while providing research resources on what you're dealing with.",
        },
      ],
      id: uuidv4(),
    },
  ],
  research: [],
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
  addResearch: (newResearch: ResearchArticle[]) => {
    set((state) => ({
      ...state,
      research: [...state.research, ...newResearch],
    }));
  },
}));

export default useChatStore;
