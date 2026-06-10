/**
 * Typed API client — all calls to the FastAPI backend.
 * Base URL falls back to localhost:8000 for local dev.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types matching backend schemas ─────────────────────────────────────────

export interface AnalysisResult {
  pattern: string;
  difficulty: string;
  key_observations: string[];
  why_pattern_fits: string;
  approach_summary: string;
}

export interface HintResult {
  hint_level: number;
  hint: string;
}

export interface ReviewResult {
  correctness: string;
  bugs: string[];
  edge_cases: string[];
  readability: string;
  time_complexity: string;
  space_complexity: string;
  optimization: string;
  rating: number;
  mistake_categories: string[];
}

export interface TestCase {
  input: string;
  expected_output: string;
  reason: string;
  type: "basic" | "edge" | "stress";
}

export interface TestsResult {
  tests: TestCase[];
}

export interface TestRunResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string | null;
}

export interface RunCodeResult {
  passed: number;
  failed: number;
  results: TestRunResult[];
  error?: string | null;
}

export interface MistakeOut {
  mistake_type: string;
  count: number;
  last_occurred: string;
  suggestion: string;
}

export interface PatternProgressOut {
  pattern_name: string;
  attempts: number;
  solved: number;
  hints_used: number;
  average_rating: number;
  strength_score: number;
}

export interface ProgressResult {
  problems_analyzed: number;
  hints_used: number;
  accuracy: number;
  weakest_pattern: string;
  mistakes: MistakeOut[];
  pattern_progress: PatternProgressOut[];
}

export interface RevisionItem {
  pattern_name: string;
  review_date: string;
  status: string;
}

export interface RevisionResult {
  items: RevisionItem[];
}

export interface RoadmapDay {
  day: number;
  title: string;
  tasks: string[];
  pattern_focus: string;
}

export interface RoadmapResult {
  plan: RoadmapDay[];
  advice: string;
}

export interface ChatResult {
  reply: string;
}

// ── API calls ──────────────────────────────────────────────────────────────

export const api = {
  analyzeProblem: (body: {
    title: string;
    description: string;
    constraints?: string;
    examples?: string;
  }) =>
    apiFetch<AnalysisResult>("/analyze-problem", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  generateHint: (body: {
    problem: string;
    pattern: string;
    hint_level: number;
  }) =>
    apiFetch<HintResult>("/generate-hint", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  reviewCode: (body: {
    problem: string;
    pattern: string;
    language: string;
    code: string;
  }) =>
    apiFetch<ReviewResult>("/review-code", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  generateTests: (body: { problem: string; pattern: string }) =>
    apiFetch<TestsResult>("/generate-tests", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  runCode: (body: {
    language: string;
    code: string;
    test_cases: { input: string; expected: string }[];
  }) =>
    apiFetch<RunCodeResult>("/run-code", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  mentorChat: (body: {
    problem?: string;
    code?: string;
    message: string;
    context?: Record<string, unknown>;
  }) =>
    apiFetch<ChatResult>("/mentor-chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getProgress: () => apiFetch<ProgressResult>("/progress"),

  getRevisionToday: () => apiFetch<RevisionResult>("/revision-today"),

  generateRoadmap: (body?: { weak_patterns?: string[] }) =>
    apiFetch<RoadmapResult>("/generate-roadmap", {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
};
