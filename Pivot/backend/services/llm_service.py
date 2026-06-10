"""
LLM Service — wraps OpenAI-compatible API calls with mock fallback.

If LLM_API_KEY is not set, all methods return realistic demo responses
so the app is fully usable without an API key.
"""
import os
import json
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("LLM_API_KEY", "")
MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
BASE_URL = os.getenv("LLM_BASE_URL", None)

_client = None


def _get_client():
    global _client
    if _client is None and API_KEY:
        from openai import OpenAI
        kwargs = {"api_key": API_KEY}
        if BASE_URL:
            kwargs["base_url"] = BASE_URL
        _client = OpenAI(**kwargs)
    return _client


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Call the LLM with a system + user prompt.
    Returns the text response.
    Falls back to mock data if no API key is configured.
    """
    client = _get_client()
    if client is None:
        return _mock_response(user_prompt)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=2048,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        return _mock_response(user_prompt, error=str(e))


def call_llm_json(system_prompt: str, user_prompt: str) -> dict:
    """
    Call LLM expecting JSON output. Parses and returns dict.
    Falls back to mock JSON on error.
    """
    client = _get_client()
    if client is None:
        return _mock_json_response(user_prompt)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        text = response.choices[0].message.content or "{}"
        return json.loads(text)
    except Exception:
        return _mock_json_response(user_prompt)


# ── Mock Responses ────────────────────────────────────────────────────────────

def _mock_response(prompt: str, error: str = "") -> str:
    prefix = f"[Demo Mode — LLM_API_KEY not set{': ' + error if error else ''}]\n\n"
    return prefix + (
        "This is a demo response from PatternPilot AI. "
        "Configure LLM_API_KEY in your .env file to enable real AI responses.\n\n"
        "**Pattern Detected:** Sliding Window\n"
        "**Key Insight:** Use a fixed or variable-size window to avoid recomputation.\n"
        "**Approach:** Slide the window one element at a time and update your running result."
    )


def _mock_json_response(prompt: str) -> dict:
    """Return context-appropriate mock JSON based on keywords in the prompt."""
    p = prompt.lower()

    if "analyze" in p or "pattern" in p:
        return {
            "pattern": "Sliding Window",
            "difficulty": "Medium",
            "key_observations": [
                "The problem asks for a subarray/substring of fixed or variable length.",
                "Brute force would be O(n²) — we can do better.",
                "We need to track a running aggregate (sum, count, etc.).",
            ],
            "why_pattern_fits": "Sliding Window is ideal here because we need to examine consecutive elements efficiently without recomputing the entire range each time.",
            "approach_summary": "Maintain a window with two pointers. Expand the right pointer and shrink from the left when a condition is violated. Track your result at each valid window state.",
        }

    if "hint" in p:
        level = 1
        for i in range(1, 6):
            if f"level {i}" in p or f'"hint_level": {i}' in p:
                level = i
        hints = {
            1: "Look at the problem constraints — do you need to examine consecutive elements?",
            2: "This problem follows the Sliding Window pattern. Think about maintaining a window of elements.",
            3: "Use two pointers (left, right) to define your window. Expand right, shrink left when needed.",
            4: "Initialize left=0, result=0. For each right, update window state. While window invalid: shrink from left. Update result.",
            5: "Your window should track a running sum/count. When the window condition breaks, move left forward until it's valid again.",
        }
        return {"hint_level": level, "hint": hints.get(level, hints[1])}

    if "review" in p or "code" in p:
        return {
            "correctness": "Mostly correct — handles the main cases well.",
            "bugs": ["May fail on empty input array", "Integer overflow risk for large sums"],
            "edge_cases": ["Empty array", "Single element", "All negative numbers", "Duplicate values"],
            "readability": "Code is clean and well-structured. Variable names could be more descriptive.",
            "time_complexity": "O(n)",
            "space_complexity": "O(1)",
            "optimization": "Current approach is near-optimal. Consider early termination for edge cases.",
            "rating": 7.5,
            "mistake_categories": ["Missing edge case"],
        }

    if "test" in p:
        return {
            "tests": [
                {"input": "[1, 2, 3, 4, 5], k=3", "expected_output": "12", "reason": "Normal case — window of size 3", "type": "basic"},
                {"input": "[], k=3", "expected_output": "0 or error", "reason": "Empty array edge case", "type": "edge"},
                {"input": "[5], k=1", "expected_output": "5", "reason": "Single element", "type": "edge"},
                {"input": "[1000000]*100000, k=50000", "expected_output": "50000000000", "reason": "Stress test — large input", "type": "stress"},
            ]
        }

    if "chat" in p or "mentor" in p or "message" in p:
        return {
            "reply": (
                "Great question! 🎯 Let me guide you through this step by step.\n\n"
                "Instead of jumping straight to the solution, think about **what information you need to maintain** "
                "as you scan through the array. What changes as you move from one element to the next?\n\n"
                "Try to identify the **invariant** — the condition that must always hold true for your window. "
                "Once you have that, the rest of the logic follows naturally.\n\n"
                "You've got this! What do you think the invariant might be? 💪"
            )
        }

    if "roadmap" in p or "plan" in p:
        return {
            "plan": [
                {"day": 1, "title": "Sliding Window Fundamentals", "tasks": ["Review fixed-size window template", "Solve: Maximum sum subarray of size K", "Understand when to use this pattern"], "pattern_focus": "Sliding Window"},
                {"day": 2, "title": "Variable Window Practice", "tasks": ["Study variable-size window technique", "Solve: Longest substring without repeating characters", "Practice with character frequency maps"], "pattern_focus": "Sliding Window"},
                {"day": 3, "title": "Two Pointers Deep Dive", "tasks": ["Review two-pointer template", "Solve: 3Sum problem", "Understand sorted array optimization"], "pattern_focus": "Two Pointers"},
                {"day": 4, "title": "Binary Search Mastery", "tasks": ["Review binary search variants", "Solve: Search in rotated array", "Practice on answer space search"], "pattern_focus": "Binary Search"},
                {"day": 5, "title": "Mistake Review Day", "tasks": ["Revisit your flagged mistakes", "Re-solve problems where you used hints", "Focus on edge cases you missed"], "pattern_focus": "Review"},
                {"day": 6, "title": "DP Introduction", "tasks": ["Understand memoization vs tabulation", "Solve: Climbing stairs", "Map out DP state definition"], "pattern_focus": "Dynamic Programming"},
                {"day": 7, "title": "Mock Test", "tasks": ["Solve 2 random medium problems under 45 min each", "No hints allowed", "Self-review your solutions"], "pattern_focus": "Mixed"},
            ],
            "advice": "You're making great progress! Focus on understanding *why* each pattern fits before implementing. The goal isn't to memorize — it's to recognize. Stay consistent and you'll see massive improvement this week! 🚀"
        }

    return {"result": "Demo mode response — configure LLM_API_KEY for real AI responses."}
