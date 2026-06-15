# JobLens Voice Agent

Python LiveKit + Gemini Live worker for Natural Call Voice.

## Local

```bash
pip install -r requirements.txt
python agent.py dev
```

For a real session:

```bash
python agent.py dev <roomName> <voiceSessionId>
```

The agent fetches per-session credentials from `/api/internal/agent/session-context` using `JOBLENS_AGENT_SECRET`. Decrypted user keys stay in memory only.
