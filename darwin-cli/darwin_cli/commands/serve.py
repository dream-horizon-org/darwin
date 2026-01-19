"""Serve (Hermes) commands reused within darwin-cli."""

import typer

try:
    from hermes.src.main import app as serve_app  # type: ignore
except Exception as exc:  # pragma: no cover
    raise exc

# Expose the hermes Typer app directly
app = serve_app


