import { useEffect } from "react";
import { PrivacyPolicyPage } from "../views/PrivacyPolicyPage";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";
import { initializeIcons } from "../utils/icons";

export function PrivacyPolicyApp() {
  useEffect(() => {
    initializeIcons();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <PrivacyPolicyPage />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
