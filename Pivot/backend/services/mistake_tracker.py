"""
Mistake tracking — parses code review results and upserts mistake records.
Uses List from typing for Python 3.8 compatibility.
"""
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from models import Mistake, PatternProgress


MISTAKE_SUGGESTIONS: Dict[str, str] = {
    "Missing edge case": "Always test with empty input, single element, and boundary values before submitting.",
    "Wrong loop condition": "Trace through your loop with small examples. Check off-by-one carefully.",
    "Inefficient brute force": "Ask: can I avoid recomputation? Look for patterns like sliding window or prefix sums.",
    "Incorrect base case": "For recursion/DP, write base cases first and verify them independently.",
    "Wrong DP state": "Define your DP state clearly: what does dp[i] represent? Write it as a comment.",
    "Graph visited issue": "Always mark a node as visited BEFORE adding it to the queue/stack.",
    "Off-by-one error": "Use inclusive/exclusive ranges consistently. Draw the array indices out.",
    "Wrong data structure": "Ask: do I need ordering? Use dict/set for O(1) lookup, heap for min/max.",
    "Complexity misunderstanding": "Analyze nested loops carefully. O(n²) loops are often fixable with hashmaps.",
}


def record_mistakes(db: Session, problem_id: int, mistake_categories: List[str]) -> None:
    """Insert mistake records for a submission."""
    for category in mistake_categories:
        if category in MISTAKE_SUGGESTIONS:
            db.add(Mistake(
                problem_id=problem_id,
                mistake_type=category,
                description=MISTAKE_SUGGESTIONS[category],
                created_at=datetime.utcnow(),
            ))
    db.commit()


def update_pattern_progress(
    db: Session,
    pattern_name: str,
    solved: bool,
    hints_used: int,
    rating: float,
) -> None:
    """Upsert pattern progress after a submission."""
    record = db.query(PatternProgress).filter_by(pattern_name=pattern_name).first()
    if record is None:
        record = PatternProgress(
            pattern_name=pattern_name,
            attempts=0,
            solved=0,
            hints_used=hints_used,
            average_rating=0.0,
            strength_score=0.0,
        )
        db.add(record)
        db.flush()  # get ID before commit

    record.attempts += 1
    if solved:
        record.solved += 1
    record.hints_used = (record.hints_used or 0) + hints_used
    # Rolling average rating
    record.average_rating = (
        (record.average_rating * (record.attempts - 1) + rating) / record.attempts
    )
    # Strength score 0-100
    solve_rate = record.solved / max(record.attempts, 1)
    record.strength_score = round(solve_rate * 60 + (record.average_rating / 10) * 40, 1)
    record.last_practiced = datetime.utcnow()
    db.commit()


def get_mistake_summary(db: Session) -> List[Dict[str, Any]]:
    """Aggregate mistakes by type with count and last occurrence."""
    from sqlalchemy import func
    rows = (
        db.query(
            Mistake.mistake_type,
            func.count(Mistake.id).label("count"),
            func.max(Mistake.created_at).label("last_occurred"),
        )
        .group_by(Mistake.mistake_type)
        .all()
    )
    return [
        {
            "mistake_type": r.mistake_type,
            "count": r.count,
            "last_occurred": (
                r.last_occurred.strftime("%Y-%m-%d") if r.last_occurred else "N/A"
            ),
            "suggestion": MISTAKE_SUGGESTIONS.get(r.mistake_type, "Review the concept and retry."),
        }
        for r in rows
    ]
