"""
POST /generate-hint — return a progressive hint for a given level.
"""
from fastapi import APIRouter, HTTPException
from schemas import GenerateHintRequest, GenerateHintResponse
from services import llm_service
from services.prompt_templates import HINT_SYSTEM, HINT_USER

router = APIRouter()


@router.post("/generate-hint", response_model=GenerateHintResponse)
async def generate_hint(req: GenerateHintRequest):
    try:
        user_prompt = HINT_USER.format(
            problem=req.problem,
            pattern=req.pattern,
            hint_level=req.hint_level,
        )
        data = llm_service.call_llm_json(HINT_SYSTEM, user_prompt)
        return GenerateHintResponse(
            hint_level=data.get("hint_level", req.hint_level),
            hint=data.get("hint", "Think carefully about the pattern — you're on the right track!"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
