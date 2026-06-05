"""Star-World Flask entry point.

This project is intentionally built as a static-first learning site. Flask is
used for local classroom hosting, while the same index.html/style.css/script.js
files can be published directly to GitHub Pages.
"""

from pathlib import Path

from flask import Flask, jsonify, send_from_directory


BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__)


@app.route("/")
def home():
    """Serve the interactive learning page."""
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/health")
def health():
    """A tiny endpoint teachers can use to confirm the server is running."""
    return jsonify({"status": "ok", "project": "Star-World"})


@app.route("/<path:filename>")
def static_files(filename):
    """Serve the CSS and JavaScript files without requiring a static folder."""
    allowed_files = {"index.html", "style.css", "script.js", "requirements.txt"}
    if filename in allowed_files:
        return send_from_directory(BASE_DIR, filename)
    return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    # host="0.0.0.0" lets tablets or phones on the same network open the lesson.
    app.run(host="0.0.0.0", port=5000, debug=True)
