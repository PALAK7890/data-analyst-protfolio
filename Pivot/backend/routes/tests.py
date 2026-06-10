"""
POST /generate-tests — generate AI test cases for a problem.
"""
from fastapi import APIRouter, HTTPException
from schemas import GenerateTestsRequest, GenerateTestsResponse, TestCase
from services import llm_service
from services.prompt_templates import TEST_SYSTEM, TEST_USER

router = APIRouter()


@router.post("/generate-tests", response_model=GenerateTestsResponse)
async def generate_tests(req: GenerateTestsRequest):
    try:
        user_prompt = TEST_USER.format(
            problem=req.problem,
            pattern=req.pattern,
        )
        data = llm_service.call_llm_json(TEST_SYSTEM, user_prompt)
        raw_tests = data.get("tests", [])

        tests = [
            TestCase(
                input=str(t.get("input", "")),
                expected_output=str(t.get("expected_output", "")),
                reason=str(t.get("reason", "")),
                type=t.get("type", "basic"),
            )
            for t in raw_tests
            if isinstance(t, dict)
        ]

        return GenerateTestsResponse(tests=tests)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
