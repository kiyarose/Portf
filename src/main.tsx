import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter } from "./AppRouter";
import { ThemeProvider } from "./providers/ThemeProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GENERIC_ERROR_MESSAGES } from "./utils/errorSanitizer";
// Icons are registered on demand in individual components

const container = document.getElementById("root");

if (!container) {
  // Display a user-friendly error instead of throwing a raw error
  const errorContainer = document.createElement("div");
  errorContainer.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    font-family: system-ui, sans-serif;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  `;

  const errorCard = document.createElement("div");
  errorCard.style.cssText = `
    max-width: 400px;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  `;

  const heading = document.createElement("h1");
  heading.style.cssText = "margin: 0 0 1rem 0; color: #2d3748;";
  heading.textContent = "Unable to Load";

  const message = document.createElement("p");
  message.style.cssText =
    "margin: 0 0 1.5rem 0; color: #4a5568; line-height: 1.6;";
  message.textContent = GENERIC_ERROR_MESSAGES.UNKNOWN;

  const reloadButton = document.createElement("button");
  reloadButton.style.cssText = `
    background: #f56565;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
  `;
  reloadButton.textContent = "Reload Page";
  reloadButton.addEventListener("click", () => {
    window.location.reload();
  });

  errorCard.appendChild(heading);
  errorCard.appendChild(message);
  errorCard.appendChild(reloadButton);
  errorContainer.appendChild(errorCard);
  document.body.appendChild(errorContainer);

  throw new Error("Application container not found");
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AppRouter />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
