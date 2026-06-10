"""
POST /generate-roadmap — personalized 7-day learning plan.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import GenerateRoadmapRequest, GenerateRoadmapResponse, RoadmapDay
from services import llm_service
from services.prompt_templates import ROADMAP_SYSTEM, ROADMAP_USER
from models import PatternProgress

router = APIRouter()


@router.post("/generate-roadmap", response_model=GenerateRoadmapResponse)
async def generate_roadmap(req: GenerateRoadmapRequest, db: Session = Depends(get_db)):
    try:
        # Auto-detect weak patterns from DB if none provided
        weak_patterns = req.weak_patterns or []
        if not weak_patterns:
            weak = (
                db.query(PatternProgress)
                .filter(PatternProgress.attempts > 0)
                .order_by(PatternProgress.strength_score.asc())
                .limit(3)
                .all()
            )
            weak_patterns = [w.pattern_name for w in weak]

        user_prompt = ROADMAP_USER.format(
            weak_patterns=(
                ", ".join(weak_patterns) if weak_patterns else "General DSA improvement"
            )
        )
        data = llm_service.call_llm_json(ROADMAP_SYSTEM, user_prompt)

        plan = [
            RoadmapDay(
                day=d.get("day", i + 1),
                title=d.get("title", f"Day {i + 1}"),
                tasks=d.get("tasks", []),
                pattern_focus=d.get("pattern_focus", "Review"),
            )
            for i, d in enumerate(data.get("plan", []))
            if isinstance(d, dict)
        ]

        return GenerateRoadmapResponse(
            plan=plan,
            advice=data.get(
                "advice",
                "Keep practicing consistently — you're making great progress! 🚀",
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
