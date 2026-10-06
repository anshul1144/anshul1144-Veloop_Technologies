import subprocess
import sys
from pathlib import Path


def main() -> int:
    target = Path(__file__).resolve().parent / "streamlit_app.py"
    return subprocess.call(
        [sys.executable, "-m", "streamlit", "run", str(target), *sys.argv[1:]]
    )


if __name__ == "__main__":
    raise SystemExit(main())
