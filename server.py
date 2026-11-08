#!/usr/bin/env python3
"""
HTTP server for Puppy Treat Cafe & Kitty Island Adventure.
Serves static game assets and provides a server-side save API at /api/save?theme=dog|cat
persisted in ./saves/dog.json and ./saves/cat.json.
"""

import argparse
import json
import os
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SAVES_DIR = os.path.join(ROOT_DIR, "saves")
VALID_THEMES = {"dog", "cat"}


def get_save_path(theme: str) -> str:
    safe_theme = theme if theme in VALID_THEMES else "dog"
    os.makedirs(SAVES_DIR, exist_ok=True)
    return os.path.join(SAVES_DIR, f"{safe_theme}.json")


class GameRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def end_headers(self):
        # Prevent stale caching of JS modules and API responses during development/play
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def _parse_theme(self) -> str:
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        theme = (qs.get("theme", ["dog"])[0] or "dog").lower()
        if theme in ("cat", "kitty"):
            return "cat"
        return "dog"

    def _send_json(self, status: int, data: dict):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/save":
            theme = self._parse_theme()
            save_path = get_save_path(theme)
            if not os.path.exists(save_path):
                self._send_json(200, {"exists": False, "theme": theme, "state": None})
                return
            try:
                with open(save_path, "r", encoding="utf-8") as f:
                    state = json.load(f)
                self._send_json(200, {"exists": True, "theme": theme, "state": state})
            except Exception as err:
                self._send_json(500, {"error": str(err)})
            return

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/save":
            self._send_json(404, {"error": "Not found"})
            return

        theme = self._parse_theme()
        save_path = get_save_path(theme)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            payload = json.loads(raw_body)
            state = payload.get("state", payload) if isinstance(payload, dict) else {}
            if not isinstance(state, dict):
                self._send_json(400, {"error": "Invalid JSON state object"})
                return

            os.makedirs(SAVES_DIR, exist_ok=True)
            fd, tmp_path = tempfile.mkstemp(dir=SAVES_DIR, prefix=f".{theme}_", suffix=".tmp")
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as tmp_file:
                    json.dump(state, tmp_file, indent=2)
                    tmp_file.flush()
                    os.fsync(tmp_file.fileno())
                os.replace(tmp_path, save_path)
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass

            self._send_json(200, {"ok": True, "theme": theme, "state": state})
        except Exception as err:
            self._send_json(500, {"error": str(err)})

    def do_PUT(self):
        self.do_POST()


def main():
    parser = argparse.ArgumentParser(description="Puppy/Kitty Math Game Server with Server-Side Saves")
    parser.add_argument("port", nargs="?", type=int, default=8123, help="Port to listen on (default: 8123)")
    parser.add_argument("--bind", default="0.0.0.0", help="Address to bind to (default: 0.0.0.0)")
    args = parser.parse_args()

    os.makedirs(SAVES_DIR, exist_ok=True)
    server = ThreadingHTTPServer((args.bind, args.port), GameRequestHandler)
    print(f"Serving game & save API on http://{args.bind}:{args.port}/ (saves in {SAVES_DIR})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
