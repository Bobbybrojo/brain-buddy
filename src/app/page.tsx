"use client";
import { motion } from "motion/react";

export default function Home() {
  return (
    <>
      <h3 className="text-7xl text-wrap text-center">Brain Buddy</h3>
      <motion.a
        className="bg-neutral-400/25 backdrop-blur-xl pt-4 pb-4 ps-6 pe-6 rounded-2xl"
        href="/auth/login?returnTo=/quiz"
        initial={{}}
        whileHover={{ scale: 1.05 }}
      >
        Enter
      </motion.a>
    </>
  );
}
