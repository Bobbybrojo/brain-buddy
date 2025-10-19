import type { Metadata } from "next";
import Image from "next/image";

import { Providers } from "@/providers/providers";

import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brain Buddy",
  description: "An app for chatting and learning about mental health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} antialiased`}>
        <div className="font-sans flex flex-col p-8 pb-0 items-center w-dvw h-dvh">
          <main className="relative">
            <Image
              className="rounded-2xl h-[calc(100dvh-6rem)] object-cover"
              src="/background.jpg"
              width={1920}
              height={1144}
              alt=""
            />
            <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center text-white">
              <Providers>{children}</Providers>
            </div>
          </main>
          <footer className="flex flex-col items-center justify-center h-full">
            <p>Brain Buddy</p>
            <p>Made with ❤️ by Robert Rojo</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
