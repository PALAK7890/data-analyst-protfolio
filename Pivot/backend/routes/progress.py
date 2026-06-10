"""
GET /progress — dashboard stats
GET /revision-today — spaced repetition items due today
"""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ProgressResponse, RevisionTodayResponse, RevisionItem
from services.mistake_tracker import get_mistake_summary
from models import Problem, PatternProgress, Submission, RevisionSchedule

router = APIRouter()


@router.get("/progress", response_model=ProgressResponse)
async def get_progress(db: Session = Depends(get_db)):
    try:
        problems_analyzed = db.query(Problem).count()

        # Total hints from pattern_progress table
        hint_rows = db.query(PatternProgress.hints_used).all()
        total_hints = sum((h[0] or 0) for h in hint_rows)

        # Accuracy from rated submissions
        rated = [
            s.rating for s in db.query(Submission).all()
            if s.rating is not None
        ]
        accuracy = round((sum(rated) / len(rated)) * 10, 1) if rated else 0.0

        # Weakest pattern = lowest strength score with at least 1 attempt
        weakest = (
            db.query(PatternProgress)
            .filter(PatternProgress.attempts > 0)
            .order_by(PatternProgress.strength_score.asc())
            .first()
        )
        weakest_pattern = weakest.pattern_name if weakest else "N/A"

        mistakes = get_mistake_summary(db)

        pattern_progress = (
            db.query(PatternProgress)
            .order_by(PatternProgress.strength_score.desc())
            .all()
        )

        return ProgressResponse(
            problems_analyzed=problems_analyzed,
            hints_used=total_hints,
            accuracy=accuracy,
            weakest_pattern=weakest_pattern,
            mistakes=mistakes,
            pattern_progress=[
                {
                    "pattern_name": p.pattern_name,
                    "attempts": p.attempts,
                    "solved": p.solved,
                    "hints_used": p.hints_used or 0,
                    "average_rating": round(p.average_rating or 0.0, 2),
                    "strength_score": round(p.strength_score or 0.0, 1),
                }
                for p in pattern_progress
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revision-today", response_model=RevisionTodayResponse)
async def revision_today(db: Session = Depends(get_db)):
    try:
        today = date.today()
        items = (
            db.query(RevisionSchedule)
            .filter(
                RevisionSchedule.review_date <= today,
                RevisionSchedule.status == "pending",
            )
            .order_by(RevisionSchedule.review_date.asc())
            .all()
        )
        return RevisionTodayResponse(
            items=[
                RevisionItem(
                    pattern_name=i.pattern_name,
                    review_date=str(i.review_date),
                    status=i.status,
                )
                for i in items
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
