import { motion } from "motion/react";

import { IssueType } from "@/stores/quizStore";
import { useQuizStore } from "@/providers/quizStoreProvider";

interface IssueOptionProps {
  name: IssueType;
}

export default function IssueOption({ name }: IssueOptionProps) {
  const { issue, setIssue } = useQuizStore((state) => state);
  return (
    <motion.div
      className={`${
        issue === name
          ? "border-2 border-white z-10"
          : "border-2 border-transparent"
      } select-none box-border bg-neutral-400/30 backdrop-blur-xl w-full min-w-fit text-nowrap p-4 first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl cursor-pointer`}
      initial={{}}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIssue(name)}
    >
      {name}
    </motion.div>
  );
}
