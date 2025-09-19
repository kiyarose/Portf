import { Component, type ErrorInfo, type PropsWithChildren } from "react";
import { sanitizeErrorMessage } from "../utils/errorSanitizer";
import { DefaultErrorFallback } from "./DefaultErrorFallback";

interface ErrorBoundaryState {
  hasError: boolean;
  errorId: string;
}

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: React.ComponentType<{ errorId: string; onRetry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary that catches React errors and displays a sanitized fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorId: "" };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Generate a simple error ID for reference (not sensitive)
    const errorId = `ERR_${Date.now().toString(36).toUpperCase()}`;
    return { hasError: true, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log sanitized error information
    const sanitizedMessage = sanitizeErrorMessage(error);
    console.error("React Error Boundary caught an error:", sanitizedMessage);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In development, we might want to log more details for debugging
    if (import.meta.env.DEV) {
      console.group("Error Boundary Debug Info (Development Only)");
      console.error("Component Stack:", errorInfo.componentStack);
      console.error("Error:", error);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: "" });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          errorId={this.state.errorId} 
          onRetry={this.handleRetry} 
        />
      );
    }

    return this.props.children;
  }
}