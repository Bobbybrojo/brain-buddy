"use client";

import { useQuizStore } from "@/providers/quizStoreProvider";
import { MoodType } from "@/stores/quizStore";
import { motion } from "motion/react";

interface MoodOptionProps {
  name: MoodType;
  emoji: string;
}

export default function MoodOption({ name, emoji }: MoodOptionProps) {
  const { mood, addMood, removeMood } = useQuizStore((state) => state);
  return (
    <motion.div
      className={`${
        mood.has(name) ? "border-2 border-white" : "border-2 border-transparent"
      } flex flex-col justify-center items-center text-xl select-none box-border bg-neutral-400/30 backdrop-blur-xl w-32 h-24 p-4 rounded-2xl cursor-pointe isloater`}
      style={{ transform: "translateZ(0)" }}
      initial={{}}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => (!mood.has(name) ? addMood(name) : removeMood(name))}
    >
      <p className="text-3xl">{emoji}</p>
      <p>{name}</p>
    </motion.div>
  );
}
