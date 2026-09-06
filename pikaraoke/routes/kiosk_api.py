"""Kiosk and Mobile API routes for PiKaraoke."""

from __future__ import annotations

import math
import os
import re

import flask_babel
from flask import jsonify, redirect, request, send_from_directory
from flask_smorest import Blueprint

from pikaraoke.lib.auth import public
from pikaraoke.lib.current_app import get_karaoke_instance
from pikaraoke.lib.metadata_parser import youtube_id_suffix
from pikaraoke.lib.youtube_dl import get_search_results

_ = flask_babel.gettext

kiosk_api_bp = Blueprint("kiosk_api", __name__)

def get_frontend_dist_dir() -> str:
    """Resolve directory containing built frontend dist files."""
    if "PIKARAOKE_FRONTEND_DIST" in os.environ:
        return os.path.abspath(os.environ["PIKARAOKE_FRONTEND_DIST"])
    dev_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
    )
    if os.path.isdir(dev_path):
        return dev_path
    if os.path.isdir("/app/frontend/dist"):
        return "/app/frontend/dist"
    return dev_path


def _extract_youtube_id(file_path: str) -> str | None:
    """Extract the clean 11-char YouTube ID from a file path."""
    suffix = youtube_id_suffix(file_path)
    if not suffix:
        return None
    # Suffix is either '---<11-char-id>' or ' [<11-char-id>]'
    match = re.search(r"---([A-Za-z0-9_-]{11})$", suffix)
    if match:
        return match.group(1)
    match = re.search(r"\[([A-Za-z0-9_-]{11})\]$", suffix)
    if match:
        return match.group(1)
    return None


@kiosk_api_bp.route("/api/kiosk/autocomplete", methods=["GET"])
@public
def autocomplete():
    """Get YouTube search autocomplete suggestions (no CORS issues)."""
    query = (request.args.get("q") or "").strip()
    if not query or len(query) < 2:
        return jsonify([])
    try:
        import json
        import urllib.parse
        import urllib.request

        url = f"https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
            suggestions = data[1] if len(data) > 1 and isinstance(data[1], list) else []
            return jsonify(suggestions[:8])
    except Exception:
        return jsonify([])


@kiosk_api_bp.route("/api/kiosk/search", methods=["GET"])
@public
def search():
    """Search YouTube songs and check whether each is in the local library."""
    k = get_karaoke_instance()
    query = (request.args.get("q") or request.args.get("search_string") or "").strip()
    if not query:
        return jsonify([])

    non_karaoke = request.args.get("non_karaoke") == "true"
    search_query = query if non_karaoke else f"{query} karaoke"

    try:
        count = max(1, min(100, int(request.args.get("count", 10))))
    except ValueError:
        count = 10

    try:
        results = get_search_results(search_query, count)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if not results:
        return jsonify([])

    video_ids = [r.video_id for r in results if getattr(r, "video_id", None)]
    library_matches = k.db.get_paths_by_youtube_ids(video_ids) if video_ids else {}

    data = []
    for r in results:
        vid = getattr(r, "video_id", "")
        in_lib = vid in library_matches
        lib_path = library_matches.get(vid)
        data.append(
            {
                "video_id": vid,
                "title": getattr(r, "title", ""),
                "url": getattr(r, "url", ""),
                "channel": getattr(r, "channel", ""),
                "duration": getattr(r, "duration", ""),
                "thumbnail": f"https://img.youtube.com/vi/{vid}/mqdefault.jpg" if vid else None,
                "in_library": in_lib,
                "library_path": lib_path,
            }
        )

    return jsonify(data)


@kiosk_api_bp.route("/api/kiosk/songs", methods=["GET"])
@public
def songs():
    """Browse and search local library songs with pagination."""
    k = get_karaoke_instance()
    q = (request.args.get("q") or "").strip()
    letter = (request.args.get("letter") or "").strip()
    sort_mode = request.args.get("sort", "alpha")

    try:
        page = max(1, int(request.args.get("page", 1)))
    except ValueError:
        page = 1

    try:
        per_page = max(1, min(100, int(request.args.get("per_page", 24))))
    except ValueError:
        per_page = 24

    if q:
        available_songs = k.song_manager.search(q)
    elif letter:
        available_songs = k.song_manager.songs_by_letter(letter)
    else:
        available_songs = k.song_manager.songs

    if sort_mode == "date":
        try:
            available_songs = sorted(
                available_songs, key=lambda x: os.path.getmtime(x), reverse=True
            )
        except Exception:
            pass

    total = len(available_songs)
    total_pages = max(1, math.ceil(total / per_page))
    page = min(page, total_pages)
    start_idx = (page - 1) * per_page
    page_songs = available_songs[start_idx : start_idx + per_page]

    items = []
    for s in page_songs:
        display_name = k.song_manager.display_name_from_path(s)
        y_id = _extract_youtube_id(s)
        items.append(
            {
                "path": s,
                "title": display_name,
                "youtube_id": y_id,
                "thumbnail": f"https://img.youtube.com/vi/{y_id}/mqdefault.jpg" if y_id else None,
            }
        )

    return jsonify(
        {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "songs": items,
        }
    )


@kiosk_api_bp.route("/kiosk", defaults={"path": ""})
@kiosk_api_bp.route("/kiosk/", defaults={"path": ""})
@kiosk_api_bp.route("/kiosk/<path:path>")
@public
def serve_kiosk(path: str = ""):
    """Serve the compiled Kiosk single page app."""
    frontend_dist = get_frontend_dist_dir()
    if not os.path.isdir(frontend_dist):
        return (
            "<h3>PiKaraoke KTV Touch</h3><p>Frontend chưa được build. Vui lòng chạy <code>cd frontend && npm run build</code>.</p>",
            200,
            {"Content-Type": "text/html; charset=utf-8"},
        )

    if path:
        target_file = os.path.join(frontend_dist, path)
        if os.path.isfile(target_file):
            return send_from_directory(frontend_dist, path)

    # Default to index.html for SPA routing
    return send_from_directory(frontend_dist, "index.html")
