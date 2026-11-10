"""Отправка результатов протоколов: email (SMTP) и Telegram Bot API."""

from __future__ import annotations

import json
import logging
import os
import smtplib
import ssl
import urllib.error
import urllib.request
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DRY_RUN = os.getenv("NOTIFY_DRY_RUN", "").strip().lower() in {"1", "true", "yes", "on"}
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587") or "587")
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM = os.getenv("SMTP_FROM", "").strip() or SMTP_USER
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").strip().lower() not in {"0", "false", "no"}
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "").strip()

_DRY_LOG = Path(__file__).resolve().parent / "notifications.log"


@dataclass
class ChannelResult:
    channel: str
    ok: bool
    detail: str


def notify_status() -> dict:
    return {
        "dry_run": DRY_RUN,
        "email_configured": bool(SMTP_HOST and SMTP_FROM and (SMTP_USER or not SMTP_PASSWORD)),
        "telegram_configured": bool(TELEGRAM_BOT_TOKEN),
        "default_telegram_chat_id": TELEGRAM_CHAT_ID or None,
        "smtp_host": SMTP_HOST or None,
        "smtp_from": SMTP_FROM or None,
    }


def send_email(to_email: str, subject: str, body: str) -> ChannelResult:
    to_email = (to_email or "").strip()
    if not to_email:
        return ChannelResult("email", False, "Не указан адрес получателя")

    if DRY_RUN or not SMTP_HOST or not SMTP_FROM:
        _write_dry("email", to_email, subject, body)
        mode = "dry-run" if DRY_RUN else "SMTP не настроен — сохранено локально"
        return ChannelResult("email", True, f"{mode}: {to_email}")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(body)

    try:
        if SMTP_USE_TLS:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
                server.ehlo()
                server.starttls(context=ssl.create_default_context())
                if SMTP_USER:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30) as server:
                if SMTP_USER:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        return ChannelResult("email", True, f"Отправлено на {to_email}")
    except Exception as exc:  # noqa: BLE001 — отдаём текст клиенту
        logger.exception("email send failed")
        return ChannelResult("email", False, f"Ошибка SMTP: {exc}")


def send_telegram(chat_id: str, text: str) -> ChannelResult:
    chat_id = (chat_id or "").strip() or TELEGRAM_CHAT_ID
    if not chat_id:
        return ChannelResult(
            "telegram",
            False,
            "Не указан chat_id. Напишите боту /start и укажите id, либо задайте TELEGRAM_CHAT_ID в .env",
        )

    if DRY_RUN or not TELEGRAM_BOT_TOKEN:
        _write_dry("telegram", chat_id, "Telegram", text)
        mode = "dry-run" if DRY_RUN else "TELEGRAM_BOT_TOKEN не задан — сохранено локально"
        return ChannelResult("telegram", True, f"{mode}: chat {chat_id}")

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps(
        {"chat_id": chat_id, "text": text, "disable_web_page_preview": True}
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if not data.get("ok"):
            return ChannelResult("telegram", False, f"Telegram API: {data}")
        return ChannelResult("telegram", True, f"Отправлено в chat {chat_id}")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        return ChannelResult("telegram", False, f"HTTP {exc.code}: {detail}")
    except Exception as exc:  # noqa: BLE001
        logger.exception("telegram send failed")
        return ChannelResult("telegram", False, str(exc))


def _write_dry(channel: str, target: str, subject: str, body: str) -> None:
    _DRY_LOG.parent.mkdir(parents=True, exist_ok=True)
    with _DRY_LOG.open("a", encoding="utf-8") as fh:
        fh.write("\n" + "=" * 60 + "\n")
        fh.write(f"channel={channel}\ntarget={target}\nsubject={subject}\n\n{body}\n")
