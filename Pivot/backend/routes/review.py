"""
POST /review-code — AI code review + mistake tracking side effect.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ReviewCodeRequest, ReviewCodeResponse
from services import llm_service
from services.prompt_templates import REVIEW_SYSTEM, REVIEW_USER
from services.mistake_tracker import record_mistakes, update_pattern_progress
from models import Submission

router = APIRouter()


@router.post("/review-code", response_model=ReviewCodeResponse)
async def review_code(req: ReviewCodeRequest, db: Session = Depends(get_db)):
    try:
        user_prompt = REVIEW_USER.format(
            problem=req.problem,
            pattern=req.pattern,
            language=req.language,
            code=req.code,
        )
        data = llm_service.call_llm_json(REVIEW_SYSTEM, user_prompt)

        rating = float(data.get("rating", 7.0))
        mistake_categories = data.get("mistake_categories", [])

        # Persist submission
        submission = Submission(
            language=req.language,
            code=req.code,
            status="reviewed",
            rating=rating,
            time_complexity=data.get("time_complexity", ""),
            space_complexity=data.get("space_complexity", ""),
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)

        # Track mistakes & update pattern progress
        if mistake_categories:
            record_mistakes(db, submission.id, mistake_categories)

        solved = rating >= 7.0
        update_pattern_progress(db, req.pattern, solved=solved, hints_used=0, rating=rating)

        return ReviewCodeResponse(
            correctness=data.get("correctness", ""),
            bugs=data.get("bugs", []),
            edge_cases=data.get("edge_cases", []),
            readability=data.get("readability", ""),
            time_complexity=data.get("time_complexity", ""),
            space_complexity=data.get("space_complexity", ""),
            optimization=data.get("optimization", ""),
            rating=rating,
            mistake_categories=mistake_categories,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
