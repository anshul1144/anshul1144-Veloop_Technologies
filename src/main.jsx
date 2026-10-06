import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Streamlit custom component communication
if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
  window.parent.postMessage({ type: 'streamlit:componentReady', apiVersion: 1 }, '*');

  const updateHeight = () => {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight || 800
    );
    window.parent.postMessage({ type: 'streamlit:setFrameHeight', height }, '*');
  };

  window.addEventListener('load', updateHeight);
  window.addEventListener('resize', updateHeight);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => updateHeight());
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body);
    });
    if (document.body) {
      observer.observe(document.body);
    }
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
