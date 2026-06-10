"""
Database engine, session factory, and initialization with demo seed data.
"""
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from models import Base, PatternProgress, RevisionSchedule, Mistake, Problem

DATABASE_URL = "sqlite:///./patternpilot.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create tables and seed demo data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_demo_data(db)
    finally:
        db.close()


def _seed_demo_data(db: Session):
    """Insert demo data if tables are empty."""
    if db.query(PatternProgress).count() > 0:
        return  # Already seeded

    # --- Pattern Progress ---
    patterns = [
        ("Sliding Window", 12, 9, 18, 7.8, 75),
        ("Two Pointers", 8, 6, 10, 8.1, 82),
        ("Binary Search", 6, 3, 14, 6.5, 52),
        ("Dynamic Programming", 10, 4, 22, 5.9, 45),
        ("Graph BFS", 5, 2, 12, 6.2, 48),
        ("Graph DFS", 4, 2, 8, 6.8, 55),
        ("Greedy", 7, 5, 9, 7.5, 70),
        ("Backtracking", 3, 1, 10, 5.5, 38),
        ("Stack", 9, 8, 6, 8.5, 88),
        ("Hash Map", 11, 10, 8, 8.9, 92),
        ("Heap / Priority Queue", 4, 2, 11, 6.1, 46),
        ("Recursion", 6, 5, 7, 7.9, 78),
        ("Tree Traversal", 8, 6, 10, 7.6, 72),
        ("Prefix Sum", 5, 4, 6, 8.0, 80),
    ]
    for name, attempts, solved, hints_used, avg_rating, strength in patterns:
        db.add(PatternProgress(
            pattern_name=name,
            attempts=attempts,
            solved=solved,
            hints_used=hints_used,
            average_rating=avg_rating,
            strength_score=strength,
            last_practiced=datetime.utcnow() - timedelta(days=1),
        ))

    # --- Demo Problems ---
    problems = [
        ("Maximum Sum Subarray of Size K", "Find the maximum sum of a subarray of size K.", "Sliding Window", "Easy"),
        ("3Sum", "Find all triplets that sum to zero.", "Two Pointers", "Medium"),
        ("Coin Change", "Minimum coins to make amount.", "Dynamic Programming", "Medium"),
        ("Number of Islands", "Count connected islands in a grid.", "Graph BFS", "Medium"),
        ("Valid Parentheses", "Check if brackets are balanced.", "Stack", "Easy"),
    ]
    for title, desc, pattern, diff in problems:
        db.add(Problem(title=title, description=desc, pattern=pattern, difficulty=diff))

    # --- Demo Mistakes ---
    mistake_data = [
        ("Missing edge case", "Forgot to handle empty array input", 4),
        ("Off-by-one error", "Loop ran one iteration too many", 3),
        ("Wrong data structure", "Used list where set was optimal", 2),
        ("Inefficient brute force", "Nested loops instead of sliding window", 3),
        ("Incorrect base case", "DP base case not initialized properly", 2),
    ]
    for mtype, desc, count in mistake_data:
        for _ in range(count):
            db.add(Mistake(
                problem_id=1,
                mistake_type=mtype,
                description=desc,
                created_at=datetime.utcnow() - timedelta(days=count),
            ))

    # --- Revision Schedule ---
    today = date.today()
    schedule = [
        ("Dynamic Programming", today, "pending"),
        ("Binary Search", today, "pending"),
        ("Backtracking", today + timedelta(days=1), "pending"),
        ("Graph BFS", today + timedelta(days=3), "pending"),
        ("Heap / Priority Queue", today + timedelta(days=7), "pending"),
    ]
    for pattern, review_date, status in schedule:
        db.add(RevisionSchedule(
            pattern_name=pattern,
            review_date=review_date,
            status=status,
        ))

    db.commit()
