import { PrivacyPolicyPage } from "../views/PrivacyPolicyPage";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";
import { initializeIcons } from "../utils/icons";

if (typeof window !== "undefined") {
  initializeIcons();
}

export function PrivacyPolicyApp() {
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
