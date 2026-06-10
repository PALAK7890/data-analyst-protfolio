# PatternPilot AI 🚀

> **Master DSA patterns with an AI mentor, not memorized solutions.**

PatternPilot AI is a full-stack AI-powered DSA/LeetCode mentor that helps students understand *why* a pattern works — not just memorize solutions. Paste any coding problem, get the pattern detected, unlock progressive hints, write and review code with AI feedback, and track your mistake history over time.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Problem Analyzer** | Detects DSA pattern, difficulty, key observations, and approach |
| **Progressive Hints** | 5-level hint system — reveals gradually, never dumps the answer |
| **Monaco Code Editor** | Full-featured in-browser editor with Python, JS, Java, C++ |
| **AI Code Review** | Correctness, bugs, edge cases, complexity, rating out of 10 |
| **Test Case Generator** | AI-generated basic, edge, and stress test cases |
| **Python Code Runner** | Safe sandboxed execution against generated test cases |
| **Mistake Tracker** | SQLite-backed mistake dashboard with improvement suggestions |
| **Pattern Progress** | Strength score per DSA pattern across all submissions |
| **7-Day Roadmap** | Personalized study plan based on weakest patterns |
| **AI Mentor Chat** | Conversational mentor with problem + code context |
| **Spaced Repetition** | Revision schedule with 1/3/7 day review cycles |
| **Demo Mode** | Works fully without an API key using realistic mock responses |

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- Monaco Editor (`@monaco-editor/react`)
- Lucide React icons

**Backend**
- Python FastAPI
- SQLAlchemy + SQLite
- OpenAI-compatible LLM client (works with GPT-4o-mini or Gemini)
- Pydantic v2 schemas

---

## 🏗️ Architecture

```
PatternPilot AI
├── frontend/                  # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── analyze/page.tsx   # Problem Analyzer
│   │   ├── practice/page.tsx  # Code Editor + Hints + Review
│   │   ├── progress/page.tsx  # Mistake Dashboard
│   │   ├── roadmap/page.tsx   # 7-Day Plan
│   │   └── chat/page.tsx      # Mentor Chat
│   ├── components/            # Sidebar, StatCard, Badge
│   └── lib/api.ts             # Typed API client
│
└── backend/                   # FastAPI app
    ├── main.py                # App entry + CORS + routers
    ├── database.py            # SQLite engine + seed data
    ├── models.py              # SQLAlchemy ORM models
    ├── schemas.py             # Pydantic request/response types
    ├── routes/                # One file per API route
    └── services/              # LLM, code runner, prompts, tracking
```

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/patternpilot-ai
cd patternpilot-ai
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt

# Copy env file and optionally add your API key
cp .env.example .env
# Edit .env — leave LLM_API_KEY blank to use demo mode

uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## 🔑 Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
# LLM API Key — leave blank to use demo/mock responses
LLM_API_KEY=

# Model name (OpenAI or Gemini compatible)
LLM_MODEL=gpt-4o-mini

# Optional: custom base URL for Gemini OpenAI-compat API
# LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# SQLite database path
DATABASE_URL=sqlite:///./patternpilot.db
```

> **Demo Mode:** If `LLM_API_KEY` is empty, all AI features return realistic mock responses. The app is fully usable for demos and portfolio showcasing without any API cost.

---

## 📡 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/progress` | Dashboard stats |
| `GET` | `/revision-today` | Today's spaced repetition |
| `POST` | `/analyze-problem` | Detect DSA pattern |
| `POST` | `/generate-hint` | Progressive hint (level 1–5) |
| `POST` | `/review-code` | AI code review |
| `POST` | `/generate-tests` | Generate test cases |
| `POST` | `/run-code` | Execute Python safely |
| `POST` | `/mentor-chat` | AI mentor conversation |
| `POST` | `/generate-roadmap` | 7-day learning plan |

Full interactive docs: `http://localhost:8000/docs`

---

## 🗄️ Database Schema

```sql
problems         — title, description, pattern, difficulty
submissions      — language, code, rating, time/space complexity
mistakes         — mistake_type, description, problem_id
pattern_progress — strength score, attempts, solved, hints_used
revision_schedule — pattern, review_date, status
```

---

## 📸 Screenshots

> _Add screenshots here after running the app locally._

---

## 🔮 Future Improvements

- [ ] Browser extension for LeetCode integration
- [ ] GitHub OAuth login + user accounts
- [ ] Docker-based secure code execution sandbox
- [ ] Multi-language code execution (JS, Java, C++)
- [ ] Voice mock interview mode
- [ ] Leaderboard and community features
- [ ] Problem recommendation engine (collaborative filtering)
- [ ] Adaptive learning model (adjusts difficulty automatically)
- [ ] VS Code extension

---

## 💼 Portfolio Notes

**What this demonstrates:**
- Full-stack TypeScript + Python development
- LLM integration with graceful fallback design
- REST API design with Pydantic validation
- SQLite/SQLAlchemy data modeling
- Secure sandboxed code execution
- Component-based React architecture
- Dark-mode SaaS UI design

**Resume bullet points:**
- Built a full-stack AI coding mentor SaaS with Next.js 14, FastAPI, SQLite, and OpenAI-compatible LLM integration
- Implemented a sandboxed Python code execution engine with AST-level import blocking and 5s timeout
- Designed a progressive hint system (5 levels) that teaches DSA patterns without revealing solutions
- Created a spaced repetition engine and personalized 7-day study plan generator based on mistake tracking
- Achieved graceful demo mode: app runs fully without API keys using realistic mock responses

---

## 📄 License

MIT
