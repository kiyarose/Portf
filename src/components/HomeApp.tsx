import App from "../App";
import { ErrorBoundary } from "./ErrorBoundary";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";

export function HomeApp() {
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
