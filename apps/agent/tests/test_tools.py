import pytest
from pydantic import BaseModel

from credentials import PageContext, ResumeSummary, SessionContext
from tools import JobLensTools, ResumeTailoring


class FakeBrain:
    async def complete(self, messages, temperature=0.3):
        return '{"tailoredBullets":["Built React dashboards with Kubernetes ownership"],"keywordsToAddIfTrue":["Kubernetes"],"warnings":[]}'

    async def aclose(self):
        return None


def make_context():
    return SessionContext(
        userId="00000000-0000-0000-0000-000000000001",
        pageContext=PageContext(url="https://example.com/job", title="Frontend Engineer", text="React job", headings=[]),
        resumeSummary=ResumeSummary(resumeId="r1", summary="Built React dashboards", skills=["React"], projects=[]),
        brainProvider="typegpt",
        brainModel="openai/gpt-oss-20b",
        brainApiKey="sk-test",
        voiceModel="gemini-2.0-flash-live",
        googleApiKey="google-test",
    )


@pytest.mark.asyncio
async def test_tailoring_flags_unsupported_claims():
    tools = JobLensTools(make_context(), "11111111-1111-1111-1111-111111111111", brain_client=FakeBrain())
    result = await tools.tailor_resume_bullets(["Built React dashboards"], ["Kubernetes"])
    assert isinstance(result, ResumeTailoring)
    assert result.warnings
    assert "kubernetes" in " ".join(result.warnings).lower()
