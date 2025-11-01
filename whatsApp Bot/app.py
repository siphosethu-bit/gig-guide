# app.py
import os, httpx
from fastapi import FastAPI, Request
from dotenv import load_dotenv

load_dotenv()
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "myverifytoken123")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID")
GRAPH_API_VERSION = os.getenv("GRAPH_API_VERSION", "v21.0")

app = FastAPI(title="Gig Guide WhatsApp Bot")

def wa_url(path: str) -> str:
    return f"https://graph.facebook.com/{GRAPH_API_VERSION}/{path}"

async def wa_send(payload: dict) -> dict:
    headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"}
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(wa_url(f"{PHONE_NUMBER_ID}/messages"), json=payload, headers=headers)
        r.raise_for_status()
        return r.json()

@app.get("/healthz")
async def healthz():
    return {"ok": True}

# Webhook verification (Meta calls GET once; you must echo hub.challenge)
@app.get("/webhook")
async def verify(hub_mode: str = "", hub_challenge: str = "", hub_verify_token: str = ""):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        # return the raw challenge
        try:
            return int(hub_challenge)
        except:
            return hub_challenge
    return {"status": "invalid token"}

# Incoming messages (Meta sends POSTs here)
@app.post("/webhook")
async def inbound(req: Request):
    body = await req.json()
    for entry in body.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for msg in value.get("messages", []):
                to = msg["from"]
                text = ""
                if msg.get("type") == "text":
                    text = msg["text"].get("body", "")
                # simple echo
                payload = {
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": f"Echo: {text or '👋 Hi! Type menu'}"}
                }
                await wa_send(payload)
    return {"status": "ok"}
