import { CircleAlertIcon } from "lucide-react";
import { ReactNode, ErrorInfo, Component } from "react";

interface ErrorBoundaryProps {
  children: ReactNode; // Accepts any valid React child
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    // Update state to render fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    this.setState({ error, errorInfo });
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-secondary-light">
          <CircleAlertIcon className="size-12 text-danger" />
          <h1 className="mb-4 mt-5 text-2xl">Oops! Something went wrong.</h1>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
