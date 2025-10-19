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
  mood: Set<MoodType>;
};

export type QuizActions = {
  setIssue: (issue: IssueType) => void;
  setFeelings: (feelings: string) => void;
  addMood: (newMood: MoodType) => void;
  removeMood: (oldMood: MoodType) => void;
};

export type QuizStore = QuizState & QuizActions;

export const defaultInitState: QuizState = {
  issue: "Anxiety",
  feelings: "[Not Answered]",
  mood: new Set<MoodType>(),
};

export const createQuizStore = (initState: QuizState = defaultInitState) => {
  return createStore<QuizStore>()((set) => ({
    ...initState,
    setIssue: (issue: IssueType) => set((state) => ({ ...state, issue })),
    setFeelings: (feelings: string) => set((state) => ({ ...state, feelings })),
    addMood: (newMood: MoodType) =>
      set((state) => {
        const newMoodSet = new Set(state.mood);
        newMoodSet.add(newMood);
        return { ...state, mood: newMoodSet };
      }),
    removeMood: (oldMood: MoodType) =>
      set((state) => {
        const newMoodSet = new Set(state.mood);
        newMoodSet.delete(oldMood);
        return { ...state, mood: newMoodSet };
      }),
  }));
};
