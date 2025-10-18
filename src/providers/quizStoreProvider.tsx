"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type QuizStore, createQuizStore } from "@/stores/quizStore";

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

export const QuizStoreContext = createContext<QuizStoreApi | undefined>(
  undefined
);

export interface QuizStoreProviderProps {
  children: ReactNode;
}

export const QuizStoreProvider = ({ children }: QuizStoreProviderProps) => {
  const storeRef = useRef<QuizStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createQuizStore();
  }

  return (
    <QuizStoreContext.Provider value={storeRef.current}>
      {children}
    </QuizStoreContext.Provider>
  );
};

export const useQuizStore = <T,>(selector: (store: QuizStore) => T): T => {
  const quizStoreContext = useContext(QuizStoreContext);

  if (!quizStoreContext) {
    throw new Error(`useQuizStore must be used within QuizStoreProvider`);
  }

  return useStore(quizStoreContext, selector);
};
