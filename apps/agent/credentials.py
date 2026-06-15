from __future__ import annotations

from typing import Any, Literal

import httpx
from pydantic import BaseModel, Field

from config import AgentConfig, config


class PageContext(BaseModel):
    url: str = ""
    title: str = ""
    text: str = ""
    headings: list[str] = Field(default_factory=list)


class ResumeSummary(BaseModel):
    resumeId: str | None = None
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    experienceLevel: str | None = None


class SessionContext(BaseModel):
    userId: str
    pageContext: PageContext
    resumeSummary: ResumeSummary | None = None
    brainProvider: Literal["typegpt", "gemini"]
    brainModel: str
    brainApiKey: str
    voiceModel: str
    googleApiKey: str


async def fetch_session_context(
    voice_session_id: str,
    room_name: str,
    cfg: AgentConfig = config,
    client: httpx.AsyncClient | None = None,
) -> SessionContext:
    if not cfg.joblens_agent_secret:
        raise RuntimeError("JOBLENS_AGENT_SECRET is required")

    close_client = client is None
    http = client or httpx.AsyncClient(timeout=20)
    try:
        res = await http.post(
            f"{cfg.joblens_api_base_url}/api/internal/agent/session-context",
            headers={"Authorization": f"Bearer {cfg.joblens_agent_secret}"},
            json={"voiceSessionId": voice_session_id, "roomName": room_name},
        )
        res.raise_for_status()
        data: dict[str, Any] = res.json()
        return SessionContext.model_validate(data)
    finally:
        if close_client:
            await http.aclose()
