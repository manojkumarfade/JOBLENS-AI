from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class AgentConfig:
    joblens_api_base_url: str = os.getenv("JOBLENS_API_BASE_URL", "http://localhost:3000").rstrip("/")
    joblens_agent_secret: str = os.getenv("JOBLENS_AGENT_SECRET", "")
    livekit_url: str = os.getenv("LIVEKIT_URL", "")
    livekit_api_key: str = os.getenv("LIVEKIT_API_KEY", "")
    livekit_api_secret: str = os.getenv("LIVEKIT_API_SECRET", "")
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    gemini_live_model: str = os.getenv("GEMINI_LIVE_MODEL", "gemini-2.0-flash-live")


config = AgentConfig()
