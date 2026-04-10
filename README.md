# Brain Buddy

> A mental health support application powered by AI that provides personalized, empathetic conversations and evidence-based research resources for individuals navigating anxiety, depression, burnout, loneliness, stress, grief, and more.

**Live Demo:** [https://brain-buddy-beta.vercel.app/](https://brain-buddy-beta.vercel.app/)

---

## Overview

Brain Buddy guides users through a short personalized quiz to understand their mental health concern and current emotional state, then connects them with an AI-powered chat companion. The AI draws on the user's context to provide tailored support and can autonomously surface relevant academic research articles to back up its guidance with evidence-based information.

---

## Features

- **Personalized Onboarding Quiz** — Users select their primary mental health issue (Anxiety, Depression, Loneliness, Social Anxiety, Stress, Burnout, Grief, Low Self-Esteem), their current mood(s), and share how they're feeling in their own words.
- **AI Chat Companion** — Conversational AI powered by Google Gemini provides empathetic, context-aware support tailored to each user's unique situation.
- **Evidence-Based Research Panel** — The AI autonomously searches academic literature (via OpenAlex) and surfaces relevant peer-reviewed articles alongside the conversation.
- **Smooth Animated UI** — Fluid transitions and interactions built with Motion (Framer Motion successor) for a calming, polished experience.
- **Secure API Handling** — All API keys remain server-side via Next.js Server Actions — no sensitive credentials are exposed to the client.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Animations | Motion 12 |
| State Management | Zustand 5 |
| Server State | TanStack React Query 5 |
| AI | Google Gemini API (`gemini-2.5-flash-lite`) |
| Research API | OpenAlex (free, no key required) |
| Authentication | Auth0 (integrated, ready for enforcement) |
| Icons | React Icons 5 |
| Font | Urbanist (Google Fonts via next/font) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone https://github.com/bobbybrojo/brain-buddy.git
cd brain-buddy
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Auth0 environment variables are optional — Auth0 is integrated but not currently enforced on the visible pages. If you wish to enable authentication, add `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET`.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

```bash
npm run build   # Production build (Turbopack)
npm start       # Start production server
npm run lint    # Run ESLint
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with global providers
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles (Tailwind directives)
│   ├── quiz/
│   │   ├── page.tsx            # Onboarding quiz (issue, mood, feelings)
│   │   ├── issueOption.tsx     # Issue selection card component
│   │   └── moodOption.tsx      # Mood selection emoji component
│   └── dash/
│       └── page.tsx            # Chat interface + research panel
├── stores/
│   ├── quizStore.ts            # Zustand store: quiz answers
│   └── chatStore.ts            # Zustand store: chat history & resources
├── providers/
│   ├── providers.tsx           # Root provider (QueryClient + QuizStore)
│   └── quizStoreProvider.tsx   # Zustand store context wrapper
├── lib/
│   ├── gemini.ts               # Gemini API integration (Server Action)
│   ├── resources.ts            # Resource search aggregator
│   ├── openalex.ts             # OpenAlex API wrapper
│   └── who.ts                  # WHO API wrapper (reserved for future use)
└── hooks/
    └── useWindowDimensions.ts  # Responsive design hook
```

---

## How It Works

### User Flow

```
Landing Page → Quiz (issue + mood + feelings) → Dashboard (AI chat + research panel)
```

### Data Flow

1. **Quiz** — User selects a mental health issue, one or more mood emoji, and types a short description of how they feel. Answers are stored in Zustand (`QuizStore`).

2. **Dashboard initialization** — On load, `ChatStore` reads the quiz context and sends an initial greeting request to Gemini, personalizing the opening message.

3. **Chat** — Each user message triggers a TanStack Query mutation that calls the `sendChatMessage` Server Action. The full conversation history and quiz context are sent to Gemini on every turn.

4. **Function Calling** — Gemini is given a `searchResources` function declaration. When it determines that research articles would be helpful, it autonomously invokes the function, which queries the OpenAlex API for peer-reviewed papers.

5. **Resources Panel** — Articles returned by OpenAlex are displayed in the right-hand panel with title, authors, publication date, citation count, and a DOI link.

### AI Context

The system prompt sent to Gemini includes:
- The user's selected mental health issue
- Their current mood(s)
- Their written feelings description
- Instructions to be empathetic, supportive, and non-clinical

---

## API Integrations

### Google Gemini (`gemini-2.5-flash-lite`)
- Conversational AI with function calling support
- All requests made via Next.js Server Actions (API key stays server-side)

### OpenAlex
- Free, open academic research API — no authentication required
- Filtered to articles published 2005 and later, sorted by relevance
- Abstracts reconstructed from OpenAlex's inverted index format

---

## License

MIT © 2025 Robert Rojo — see [LISCENSE.md](./LISCENSE.md) for details.
