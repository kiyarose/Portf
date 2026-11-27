import { PrivacyPolicyPage } from "../views/PrivacyPolicyPage";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";

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
