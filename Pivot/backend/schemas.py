"""
Pydantic request/response schemas for all API routes.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any


# ── Analyze Problem ──────────────────────────────────────────────────────────

class AnalyzeProblemRequest(BaseModel):
    title: str
    description: str
    constraints: Optional[str] = ""
    examples: Optional[str] = ""


class AnalyzeProblemResponse(BaseModel):
    pattern: str
    difficulty: str
    key_observations: List[str]
    why_pattern_fits: str
    approach_summary: str


# ── Hints ────────────────────────────────────────────────────────────────────

class GenerateHintRequest(BaseModel):
    problem: str
    pattern: str
    hint_level: int = Field(ge=1, le=5)


class GenerateHintResponse(BaseModel):
    hint_level: int
    hint: str


# ── Code Review ──────────────────────────────────────────────────────────────

class ReviewCodeRequest(BaseModel):
    problem: str
    pattern: str
    language: str
    code: str


class ReviewCodeResponse(BaseModel):
    correctness: str
    bugs: List[str]
    edge_cases: List[str]
    readability: str
    time_complexity: str
    space_complexity: str
    optimization: str
    rating: float
    mistake_categories: List[str]


# ── Test Cases ───────────────────────────────────────────────────────────────

class GenerateTestsRequest(BaseModel):
    problem: str
    pattern: str


class TestCase(BaseModel):
    input: str
    expected_output: str
    reason: str
    type: str  # basic | edge | stress


class GenerateTestsResponse(BaseModel):
    tests: List[TestCase]


# ── Code Execution ───────────────────────────────────────────────────────────

class RunCodeRequest(BaseModel):
    language: str = "python"
    code: str
    test_cases: List[dict]


class TestResult(BaseModel):
    input: str
    expected: str
    actual: str
    passed: bool
    error: Optional[str] = None


class RunCodeResponse(BaseModel):
    passed: int
    failed: int
    results: List[TestResult]
    error: Optional[str] = None


# ── Mentor Chat ──────────────────────────────────────────────────────────────

class MentorChatRequest(BaseModel):
    problem: Optional[str] = ""
    code: Optional[str] = ""
    message: str
    context: Optional[dict] = {}


class MentorChatResponse(BaseModel):
    reply: str


# ── Progress ─────────────────────────────────────────────────────────────────

class MistakeOut(BaseModel):
    mistake_type: str
    count: int
    last_occurred: str
    suggestion: str


class PatternProgressOut(BaseModel):
    pattern_name: str
    attempts: int
    solved: int
    hints_used: int
    average_rating: float
    strength_score: float


class ProgressResponse(BaseModel):
    problems_analyzed: int
    hints_used: int
    accuracy: float
    weakest_pattern: str
    mistakes: List[MistakeOut]
    pattern_progress: List[PatternProgressOut]


# ── Revision Today ───────────────────────────────────────────────────────────

class RevisionItem(BaseModel):
    pattern_name: str
    review_date: str
    status: str


class RevisionTodayResponse(BaseModel):
    items: List[RevisionItem]


# ── Roadmap ──────────────────────────────────────────────────────────────────

class GenerateRoadmapRequest(BaseModel):
    weak_patterns: Optional[List[str]] = []


class RoadmapDay(BaseModel):
    day: int
    title: str
    tasks: List[str]
    pattern_focus: str


class GenerateRoadmapResponse(BaseModel):
    plan: List[RoadmapDay]
    advice: str
