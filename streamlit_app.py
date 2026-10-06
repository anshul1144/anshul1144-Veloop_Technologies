import os
import shutil
import subprocess
from pathlib import Path
import streamlit as st
import streamlit.components.v1 as components

# Configure page metadata
st.set_page_config(
    page_title="VELOOP Rewards — Games Hub & Arcade",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Custom CSS to make the React app seamlessly full-width and full-height
st.markdown(
    """
    <style>
    /* Hide Streamlit standard chrome */
    #MainMenu, header, footer, [data-testid="stToolbar"], [data-testid="stDecoration"] {
        visibility: hidden !important;
        display: none !important;
    }
    
    /* Remove padding around the main container */
    .stMainBlockContainer, .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }

    /* Style custom component iframe to fill window cleanly */
    iframe {
        width: 100% !important;
        min-height: 100vh !important;
        border: none !important;
        display: block !important;
    }

    /* Match the game hub dark background */
    body, [data-testid="stAppViewContainer"], [data-testid="stMain"] {
        background-color: #0b0e14 !important;
        margin: 0 !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

# Support local development mode with Vite live server: set VLOOP_DEV=1
is_dev = os.environ.get("VLOOP_DEV", "").strip().lower() in ("1", "true", "yes")

if is_dev:
    vloop_component = components.declare_component("vloop_app", url="http://localhost:5173")
    vloop_component()
else:
    # Ensure dist folder exists
    if not (DIST_DIR / "index.html").exists():
        if shutil.which("npm"):
            with st.spinner("Building production frontend assets..."):
                try:
                    subprocess.run(["npm", "run", "build"], cwd=BASE_DIR, check=True, shell=True)
                    st.rerun()
                except Exception as e:
                    st.error(f"Failed to build frontend bundle: {e}")
                    st.stop()
        else:
            st.error(
                "Production build folder `dist/` was not found and `npm` is not available on this server.\n"
                "Please run `npm run build` locally and commit the `dist/` folder."
            )
            st.stop()

    vloop_component = components.declare_component("vloop_app", path=str(DIST_DIR))
    vloop_component()
