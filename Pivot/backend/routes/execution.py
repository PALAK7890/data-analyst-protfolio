"""
POST /run-code — execute Python code safely against test cases.
Other languages return a clean error (not a crash).
"""
from fastapi import APIRouter, HTTPException
from schemas import RunCodeRequest, RunCodeResponse, TestResult
from services.code_runner import run_against_test_cases

router = APIRouter()


@router.post("/run-code", response_model=RunCodeResponse)
async def run_code(req: RunCodeRequest):
    if req.language.lower() != "python":
        # Return a structured response instead of raising an exception
        # so the frontend can display the message gracefully.
        return RunCodeResponse(
            passed=0,
            failed=0,
            results=[],
            error="Code execution is currently supported only for Python. Other languages show review-only mode.",
        )

    try:
        result = run_against_test_cases(req.code, req.test_cases)
        test_results = [
            TestResult(
                input=r["input"],
                expected=r["expected"],
                actual=r["actual"],
                passed=r["passed"],
                error=r.get("error"),
            )
            for r in result["results"]
        ]
        return RunCodeResponse(
            passed=result["passed"],
            failed=result["failed"],
            results=test_results,
            error=result.get("error"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
