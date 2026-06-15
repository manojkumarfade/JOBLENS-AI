from __future__ import annotations

import asyncio
import sys

from credentials import fetch_session_context
from tools import JobLensTools


async def run_dev(room_name: str | None = None, voice_session_id: str | None = None) -> None:
    if not room_name or not voice_session_id:
        print("Agent dev mode ready. Provide room_name and voice_session_id to fetch session context.")
        return

    context = await fetch_session_context(voice_session_id, room_name)
    tools = JobLensTools(context, voice_session_id)
    try:
        print(f"Loaded JobLens session for user {context.userId}; page: {context.pageContext.title}")
    finally:
        await tools.aclose()


def main() -> None:
    if len(sys.argv) >= 2 and sys.argv[1] == "dev":
        room_name = sys.argv[2] if len(sys.argv) > 2 else None
        voice_session_id = sys.argv[3] if len(sys.argv) > 3 else None
        asyncio.run(run_dev(room_name, voice_session_id))
        return

    try:
        from livekit.agents import cli, WorkerOptions
    except Exception:
        print("LiveKit Agents SDK is not installed. Run `pip install -r requirements.txt` or use `python agent.py dev`.")
        return

    # The deploy worker entrypoint is intentionally small; session-specific
    # credentials are fetched inside each room job before Gemini Live starts.
    cli.run_app(WorkerOptions())


if __name__ == "__main__":
    main()
