import { useEffect } from "react";
import App from "../App";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";
import { initializeIcons } from "../utils/icons";

export function HomeApp() {
  useEffect(() => {
    initializeIcons();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
