import httpx
import pytest

from config import AgentConfig
from credentials import fetch_session_context


@pytest.mark.asyncio
async def test_fetch_session_context_uses_agent_secret():
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["authorization"] == "Bearer secret"
        return httpx.Response(
            200,
            json={
                "userId": "00000000-0000-0000-0000-000000000001",
                "pageContext": {"url": "https://example.com", "title": "Job", "text": "Text", "headings": []},
                "resumeSummary": None,
                "brainProvider": "gemini",
                "brainModel": "gemini-2.5-flash",
                "brainApiKey": "brain",
                "voiceModel": "gemini-2.0-flash-live",
                "googleApiKey": "voice",
            },
        )

    client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    cfg = AgentConfig(joblens_api_base_url="https://joblens.test", joblens_agent_secret="secret")
    context = await fetch_session_context("22222222-2222-2222-2222-222222222222", "room", cfg, client)
    await client.aclose()
    assert context.brainModel == "gemini-2.5-flash"
