import { useQuizStore } from "@/providers/quizStoreProvider";
import { MoodType } from "@/stores/quizStore";
import { motion } from "motion/react";

interface MoodOptionProps {
  name: MoodType;
  emoji: string;
}

export default function MoodOption({ name, emoji }: MoodOptionProps) {
  const { mood, setMood } = useQuizStore((state) => state);
  return (
    <motion.div
      className={`${
        mood === name
          ? "border-2 border-white z-10"
          : "border-2 border-transparent"
      } flex flex-col justify-center items-center text-xl select-none box-border bg-neutral-400/30 backdrop-blur-xl w-32 h-24 p-4 rounded-2xl cursor-pointer`}
      initial={{}}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setMood(name)}
    >
      <p className="text-3xl">{emoji}</p>
      <p>{name}</p>
    </motion.div>
  );
}
