"""
Safe Python code execution sandbox.
Blocks dangerous imports, keywords, and builtins.
Runs with a 5-second timeout.
"""
import ast
import threading
from typing import Optional, List, Dict, Any


# Module imports that are never allowed
BLOCKED_IMPORTS = {
    "os", "sys", "subprocess", "socket", "importlib", "shutil",
    "pathlib", "urllib", "http", "ftplib", "smtplib", "ctypes",
    "multiprocessing", "signal", "pty", "tty", "termios",
    "pickle", "marshal", "shelve", "requests", "aiohttp",
}

# Dangerous string patterns blocked before AST parse
BLOCKED_PATTERNS = [
    "__import__", "eval(", "exec(", "open(", "input(",
    "compile(", "__builtins__", "__class__", "__subclasses__",
    "breakpoint(", "globals(", "locals(", "vars(",
]

# Safe builtins available to student code
SAFE_BUILTINS: Dict[str, Any] = {
    "range": range,
    "len": len,
    "enumerate": enumerate,
    "zip": zip,
    "map": map,
    "filter": filter,
    "sorted": sorted,
    "reversed": reversed,
    "min": min,
    "max": max,
    "sum": sum,
    "abs": abs,
    "round": round,
    "int": int,
    "float": float,
    "str": str,
    "bool": bool,
    "list": list,
    "dict": dict,
    "set": set,
    "tuple": tuple,
    "type": type,
    "isinstance": isinstance,
    "hasattr": hasattr,
    "getattr": getattr,
    "setattr": setattr,
    "any": any,
    "all": all,
    "chr": chr,
    "ord": ord,
    "bin": bin,
    "hex": hex,
    "oct": oct,
    "pow": pow,
    "hash": hash,
    "repr": repr,
    "divmod": divmod,
    "format": format,
    # Disabled intentionally:
    "print": None,
    "input": None,
    "open": None,
    "eval": None,
    "exec": None,
    "__import__": None,
    "compile": None,
}


def _check_pattern_safety(code: str) -> Optional[str]:
    """Block dangerous string patterns before parsing."""
    for pattern in BLOCKED_PATTERNS:
        if pattern in code:
            return f"Blocked: '{pattern}' is not allowed for security reasons."
    return None


def _check_ast_safety(code: str) -> Optional[str]:
    """Parse AST and block any import of disallowed modules."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"Syntax error: {e}"

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names: List[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name.split(".")[0] for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    names = [node.module.split(".")[0]]
            for name in names:
                if name in BLOCKED_IMPORTS:
                    return f"Import of '{name}' is not allowed for security reasons."
    return None


def run_python_code(code: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Execute Python code safely in a restricted environment.
    Returns {"output": str, "error": str | None}
    """
    # Pattern-level check first (fast)
    pattern_error = _check_pattern_safety(code)
    if pattern_error:
        return {"output": "", "error": pattern_error}

    # AST-level import check
    ast_error = _check_ast_safety(code)
    if ast_error:
        return {"output": "", "error": ast_error}

    result: Dict[str, Any] = {"output": "", "error": None}
    output_buffer: List[str] = []

    def safe_print(*args: Any, **kwargs: Any) -> None:
        sep = kwargs.get("sep", " ")
        output_buffer.append(sep.join(str(a) for a in args))

    safe_globals: Dict[str, Any] = {
        "__builtins__": {k: v for k, v in SAFE_BUILTINS.items() if v is not None},
        "print": safe_print,
    }

    def _execute() -> None:
        try:
            exec(compile(code, "<student_code>", "exec"), safe_globals)  # noqa: S102
            result["output"] = "\n".join(output_buffer)
        except Exception as e:
            result["error"] = f"{type(e).__name__}: {e}"

    thread = threading.Thread(target=_execute, daemon=True)
    thread.start()
    thread.join(timeout=timeout)

    if thread.is_alive():
        result["error"] = "Time limit exceeded (5 seconds). Check for infinite loops."

    return result


def run_against_test_cases(code: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Run code against a list of test cases.
    Each test case: {"input": str, "expected": str}
    """
    passed = 0
    failed = 0
    results: List[Dict[str, Any]] = []

    for tc in test_cases:
        test_input = str(tc.get("input", ""))
        expected = str(tc.get("expected", "") or tc.get("expected_output", "")).strip()

        # Wrap: try common function names
        wrapped = f"""{code}

_result = None
for _fname in ['solution', 'solve', 'main', 'answer']:
    if _fname in dir():
        _fn = eval(_fname)
        try:
            _result = _fn({test_input})
        except Exception as _e:
            print(f"Error: {{_e}}")
        break
if _result is not None:
    print(_result)
"""
        run_result = run_python_code(wrapped)
        actual = run_result.get("output", "").strip()
        error = run_result.get("error")

        is_passed = (actual == expected) and not error
        if is_passed:
            passed += 1
        else:
            failed += 1

        results.append({
            "input": test_input,
            "expected": expected,
            "actual": actual if not error else "",
            "passed": is_passed,
            "error": error,
        })

    return {"passed": passed, "failed": failed, "results": results, "error": None}
