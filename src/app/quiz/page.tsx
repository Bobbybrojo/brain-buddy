"use client";
import Image from "next/image";
import { motion } from "motion/react";

export default function Quiz() {
  return (
    <div className="font-sans flex flex-col p-8 items-center w-dvw h-dvh">
      <main className="relative">
        <Image
          className="rounded-2xl h-[calc(100dvh-8rem)] object-cover"
          src="/background.jpg"
          width={1920}
          height={1144}
          alt=""
        />
        <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center text-white">
          <h3 className="text-7xl text-wrap text-center">Quiz</h3>
          <motion.a
            className="bg-neutral-400/30 backdrop-blur-xl pt-4 pb-4 ps-6 pe-6 rounded-2xl"
            href="/auth/login?returnTo=/quiz"
            initial={{}}
            whileHover={{ scale: 1.05 }}
          >
            Enter
          </motion.a>
        </div>
      </main>
      <footer className="flex items-center justify-center h-full">
        Made with ❤️ by Robert Rojo
      </footer>
    </div>
  );
}
