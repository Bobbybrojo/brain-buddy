"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IssueOption from "./issueOption";
import MoodOption from "./moodOption";
import { useQuizStore } from "@/providers/quizStoreProvider";

const NextLink = motion.create(Link);

export default function Quiz() {
  const [feelingsInput, setFeelingsInput] = useState("");
  const setFeelings = useQuizStore((state) => state.setFeelings);
  const router = useRouter();

  return (
    <>
      <motion.form className="absolute inset-0 flex flex-col gap-4 items-center justify-start pt-4 h-full text-white [scrollbar-width:none] overflow-y-scroll">
        <h2 className="text-4xl sm:text-7xl text-wrap ps-8 pe-8 text-start text-shadow-lg">
          {"What area could you most use support in?"}
        </h2>

        <div className="flex flex-row flex-wrap sm:flex-nowrap items-start w-full gap-4 ps-8 pe-8">
          <div className="flex flex-col justify-center items-center text-xl">
            <IssueOption name="Anxiety" />
            <IssueOption name="Depression" />
            <IssueOption name="Loneliness" />
            <IssueOption name="Social Anxiety" />
            <IssueOption name="Stress" />
            <IssueOption name="Burnout" />
            <IssueOption name="Grief" />
            <IssueOption name="Low Self-Esteem" />
          </div>

          <div className="flex flex-col items-end w-full h-fit sm:h-full min-w-s gap-2">
            <h3 className="text-4xl w-full font-bold text-start text-shadow-lg">
              Current Mood (Select multiple)
            </h3>

            <div className="flex flex-wrap gap-4">
              <MoodOption name="Happy" emoji={"😊"} />
              <MoodOption name="Sad" emoji={"😢"} />
              <MoodOption name="Angry" emoji={"😤"} />
              <MoodOption name="Worried" emoji={"😰"} />
              <MoodOption name="Calm" emoji={"😌"} />
              <MoodOption name="Neutral" emoji={"😐"} />
              <MoodOption name="Excited" emoji={"🤩"} />
              <MoodOption name="Grateful" emoji={"🙏"} />
              <MoodOption name="Embarrassed" emoji={"😳"} />
              <MoodOption name="Motivated" emoji={"💪"} />
              <MoodOption name="Bored" emoji={"🥱"} />
              <MoodOption name="Proud" emoji={"😎"} />
            </div>

            <input
              className="bg-neutral-400/25 backdrop-blur-xl pt-4 pb-4 ps-6 pe-6 mt-4 rounded-2xl focus:outline-none text-2xl sm:text-3xl w-full"
              id="feelings"
              maxLength={55}
              placeholder="Briefly describe your feelings"
              value={feelingsInput}
              onChange={(e) => setFeelingsInput(e.target.value)}
              onSubmit={() => {
                setFeelings(feelingsInput);
                router.replace("/dash");
              }}
            />
            <NextLink
              className="bg-neutral-400/25 backdrop-blur-xl mb-4 pt-4 pb-4 ps-6 pe-6 rounded-2xl w-fit"
              href="/dash"
              initial={{}}
              whileHover={{ scale: 1.05 }}
              onSubmit={() => setFeelings(feelingsInput)}
            >
              Submit
            </NextLink>
          </div>
        </div>
      </motion.form>
    </>
  );
}
