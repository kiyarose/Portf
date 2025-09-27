import { useEffect, useState } from "react";
import App from "./App";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import {
  getCurrentPath,
  normalizePath,
  subscribeToNavigation,
} from "./utils/navigation";

const PRIVACY_ROUTE = "/privacy-policy";

export function AppRouter() {
  const [path, setPath] = useState<string>(() => getCurrentPath());

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());
    window.addEventListener("popstate", handlePopState);
    const unsubscribe = subscribeToNavigation((nextPath) => {
      setPath(normalizePath(nextPath));
    });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      unsubscribe();
    };
  }, []);

  if (path === PRIVACY_ROUTE) {
    return <PrivacyPolicyPage />;
  }

  return <App />;
}
