"""
POST /analyze-problem — detect DSA pattern from problem description.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import AnalyzeProblemRequest, AnalyzeProblemResponse
from services import llm_service
from services.prompt_templates import ANALYZE_SYSTEM, ANALYZE_USER
from models import Problem

router = APIRouter()


@router.post("/analyze-problem", response_model=AnalyzeProblemResponse)
async def analyze_problem(req: AnalyzeProblemRequest, db: Session = Depends(get_db)):
    try:
        user_prompt = ANALYZE_USER.format(
            title=req.title,
            description=req.description,
            constraints=req.constraints or "None specified",
            examples=req.examples or "None provided",
        )
        data = llm_service.call_llm_json(ANALYZE_SYSTEM, user_prompt)

        # Persist the problem
        problem = Problem(
            title=req.title,
            description=req.description,
            pattern=data.get("pattern", "Unknown"),
            difficulty=data.get("difficulty", "Unknown"),
        )
        db.add(problem)
        db.commit()

        return AnalyzeProblemResponse(
            pattern=data.get("pattern", "Unknown"),
            difficulty=data.get("difficulty", "Medium"),
            key_observations=data.get("key_observations", []),
            why_pattern_fits=data.get("why_pattern_fits", ""),
            approach_summary=data.get("approach_summary", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
