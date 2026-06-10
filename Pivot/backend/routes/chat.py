"""
POST /mentor-chat — AI mentor conversational endpoint.
"""
from fastapi import APIRouter, HTTPException
from schemas import MentorChatRequest, MentorChatResponse
from services import llm_service
from services.prompt_templates import CHAT_SYSTEM, CHAT_USER

router = APIRouter()


@router.post("/mentor-chat", response_model=MentorChatResponse)
async def mentor_chat(req: MentorChatRequest):
    try:
        user_prompt = CHAT_USER.format(
            problem=req.problem or "No problem context provided.",
            code=req.code or "No code provided yet.",
            message=req.message,
            context=str(req.context or {}),
        )
        data = llm_service.call_llm_json(CHAT_SYSTEM, user_prompt)
        return MentorChatResponse(
            reply=data.get(
                "reply",
                "I'm here to help! Could you give me a bit more context about what you're stuck on?",
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
