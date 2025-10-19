"use client";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useChatStore from "@/stores/chatStore";
import { useQuizStore } from "@/providers/quizStoreProvider";

// Icons
import { RiChatSmileAiFill as ChatIcon } from "react-icons/ri";
import { FaBookBookmark as BookIcon } from "react-icons/fa6";
import { initializeChatWithContext, sendChatMessage } from "@/lib/gemini";

export default function Dash() {
  const [chatInput, setChatInput] = useState<string>("");

  const quizAnswers = useQuizStore((state) => state);

  const history = useChatStore((state) => state.history);
  const research = useChatStore((state) => state.research);
  const addUserMessage = useChatStore((state) => state.addUserMessage);
  const addModelMessage = useChatStore((state) => state.addModelMessage);
  const addResearch = useChatStore((state) => state.addResearch);

  // Initialize chat with quiz context on mount
  useEffect(() => {
    const initChat = async () => {
      await initializeChatWithContext({
        issue: quizAnswers.issue,
        feelings: quizAnswers.feelings,
        mood: Array.from(quizAnswers.mood),
      });
    };
    initChat();
  }, [quizAnswers]); // Reinitialize if quiz data changes

  const chatMutation = useMutation({
    mutationFn: async (msg: string) => {
      // Add user message immediately
      addUserMessage(msg);

      // Call server action
      const response = await sendChatMessage(msg);

      // Add model response
      addModelMessage(response.text);

      if (response.searchResults) {
        addResearch(response.searchResults);
      }

      return response;
    },
  });

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (chatInput.trim()) {
        chatMutation.mutate(chatInput);
        setChatInput("");
      }
    }
  };

  return (
    <div className="flex flex-wrap sm:flex-nowrap gap-4 w-full h-full p-4 text-neutral-700 overflow-scroll [scrollbar-width:none]">
      <div className="flex flex-col-reverse bg-neutral-400/25 backdrop-blur-xl sm:w-2/3 w-[220px] h-full p-4 rounded-2xl">
        <textarea
          className="bg-gray-200/25 backdrop-blur-xl rounded-xl ps-4 pe-4 pt-4 pb-4 focus:outline-none font-bold w-full max-h-24 [scrollbar-width:none] field-sizing-content resize-none"
          id="chatInput"
          placeholder="Chat here..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleSubmit}
          disabled={chatMutation.isPending}
        />

        {chatMutation.isPending && (
          <p className="text-sm mt-2 mb-2">Thinking...</p>
        )}

        <div className="flex flex-col-reverse gap-4 h-full overflow-y-scroll [scrollbar-width:none] pb-4 rounded-2xl">
          <LayoutGroup>
            <AnimatePresence mode="popLayout">
              {history.map((chat) => (
                <motion.div
                  key={chat.id}
                  layoutId={chat.id}
                  initial={{
                    x: chat.role === "user" ? 100 : -100,
                    scale: 0.4,
                    opacity: 0,
                  }}
                  animate={{ x: 0, scale: 1, opacity: 1 }}
                  className={`p-3 rounded-xl ${
                    chat.role === "user"
                      ? "bg-blue-400/25 ml-auto max-w-[80%]"
                      : "bg-gray-200/25 mr-auto max-w-[80%]"
                  }`}
                >
                  <p className="text-sm font-bold mb-1">
                    {chat.role === "user" ? "You" : "AI"}
                  </p>
                  <p>{chat.parts[0].text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>

        <div className="w-full border-[1px] border-neutral-700 mt-2 mb-2" />
        <div className="flex justify-start items-end">
          <ChatIcon className="me-2" size={32} />
          <h2 className="text-4xl font-extrabold">Chat Bot</h2>
        </div>
      </div>
      <div className="flex flex-col bg-neutral-400/25 backdrop-blur-xl sm:w-1/3 w-[220px] h-full p-4 rounded-2xl">
        <div className="flex justify-start items-end">
          <BookIcon className="me-2" size={32} />
          <h2 className="text-4xl font-extrabold">Resources</h2>
        </div>
        <div className="w-full border-[1px] border-neutral-700 mt-2 mb-2" />
        <div className="flex flex-col gap-4 overflow-y-scroll [scrollbar-width:none]">
          {research.map((article, idx) => (
            <div
              className="flex flex-col bg-gray-200/25 backdrop-blur-xl rounded-xl p-2"
              key={idx}
            >
              <h3 className="text-lg">{article.title}</h3>
              <p className="text-md">{article.publication_date}</p>

              <p className="underline">Written by:</p>
              <div className="flex flex-col">
                {article.authors.map((author, idx) => (
                  <h4 className="text-md" key={idx}>
                    {author}
                  </h4>
                ))}
              </div>

              <a
                className="text-md text-blue-500 underline cursor-pointer select-none"
                rel="noopener noreferrer"
                target="_blank"
                href={article.doi ? `https://doi.org/${article.doi}` : "#"}
              >
                {"Link to article"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
