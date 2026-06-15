from pathlib import Path


def test_prompts_contain_safety_rules():
    root = Path(__file__).resolve().parents[1] / "prompts"
    system = (root / "system.md").read_text(encoding="utf-8")
    safety = (root / "safety.md").read_text(encoding="utf-8")
    combined = f"{system}\n{safety}".lower()
    assert "do not fabricate" in combined
    assert "untrusted" in combined
    assert "never auto-apply" in combined
    assert "api keys" in combined
