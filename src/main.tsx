import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GENERIC_ERROR_MESSAGES } from "./utils/errorSanitizer";

const container = document.getElementById("root");

if (!container) {
  // Display a user-friendly error instead of throwing a raw error
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    ">
      <div style="
        max-width: 400px;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
      ">
        <h1 style="margin: 0 0 1rem 0; color: #2d3748;">Unable to Load</h1>
        <p style="margin: 0 0 1.5rem 0; color: #4a5568; line-height: 1.6;">
          ${GENERIC_ERROR_MESSAGES.UNKNOWN}
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #f56565;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
          "
        >
          Reload Page
        </button>
      </div>
    </div>
  `;
  throw new Error("Application container not found");
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
