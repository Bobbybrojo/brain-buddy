import { createStore } from "zustand/vanilla";

export type IssueType =
  | "Anxiety"
  | "Depression"
  | "Loneliness"
  | "Social Anxiety"
  | "Stress"
  | "Burnout"
  | "Grief"
  | "Low Self-Esteem";

export type MoodType =
  | "Happy"
  | "Sad"
  | "Angry"
  | "Worried"
  | "Calm"
  | "Neutral"
  | "Excited"
  | "Grateful"
  | "Embarrassed"
  | "Motivated"
  | "Bored"
  | "Proud";

export type QuizState = {
  issue: IssueType;
  feelings: string;
  mood: MoodType;
};

export type QuizActions = {
  setIssue: (issue: IssueType) => void;
  setFeelings: (feelings: string) => void;
  setMood: (mood: MoodType) => void;
};

export type QuizStore = QuizState & QuizActions;

export const defaultInitState: QuizState = {
  issue: "Anxiety",
  feelings: "[Not Answered]",
  mood: "Happy",
};

export const createQuizStore = (initState: QuizState = defaultInitState) => {
  return createStore<QuizStore>()((set) => ({
    ...initState,
    setIssue: (issue: IssueType) => set((state) => ({ ...state, issue })),
    setFeelings: (feelings: string) => set((state) => ({ ...state, feelings })),
    setMood: (mood: MoodType) => set((state) => ({ ...state, mood })),
  }));
};
