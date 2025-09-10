"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check, ExternalLink, Shield } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number | null;
  isReporting: boolean;
  reportCopied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      errorId: null,
      retryCount: 0,
      lastErrorTime: null,
      isReporting: false,
      reportCopied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKeys change
    if (
      this.state.hasError &&
      prevProps.resetKeys !== this.props.resetKeys
    ) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  handleReset = async () => {
    this.setState({ isRecovering: true });
    
    try {
      // Wait a bit to show recovery state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        retryCount: prevState.retryCount + 1,
        reportCopied: false,
      }));
    } catch (error) {
      this.setState({ isRecovering: false });
      console.error("Failed to reset error boundary:", error);
    }
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReportError = async () => {
    this.setState({ isReporting: true });
    
    const { error, errorInfo, errorId, retryCount } = this.state;
    const errorReport = {
      id: errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount,
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
    };

    try {
      // In production, send this to your error reporting service
      console.log("Error Report:", errorReport);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      this.setState({ reportCopied: true });
      
      // Send to error reporting service (example)
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        }).catch(err => console.warn('Failed to send error report:', err));
      }
      
      // Reset copied state after 3 seconds
      setTimeout(() => {
        this.setState({ reportCopied: false });
      }, 3000);
      
    } catch (error) {
      console.error('Failed to report error:', error);
    } finally {
      this.setState({ isReporting: false });
    }
  };

  getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'medium';
    if (message.includes('chunk') || message.includes('loading')) return 'low';
    if (message.includes('memory') || message.includes('out of memory')) return 'critical';
    if (message.includes('permission') || message.includes('unauthorized')) return 'high';
    
    return 'medium';
  };

  getErrorCategory = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'Network';
    if (message.includes('chunk') || message.includes('loading')) return 'Loading';
    if (message.includes('memory')) return 'Memory';
    if (message.includes('permission')) return 'Permission';
    if (message.includes('syntax')) return 'Syntax';
    if (message.includes('type')) return 'Type';
    
    return 'Unknown';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const { error, errorId, retryCount, isReporting, reportCopied } = this.state;
      const severity = error ? this.getErrorSeverity(error) : 'medium';
      const category = error ? this.getErrorCategory(error) : 'Unknown';
      
      const severityColors = {
        low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Please try to recover or contact support if the problem persists.
              </CardDescription>
              
              {/* Error metadata */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="outline" className="text-xs">
                  ID: {errorId}
                </Badge>
                <Badge className={severityColors[severity]}>
                  {severity.toUpperCase()}
                </Badge>
                <Badge variant="secondary">
                  {category}
                </Badge>
                {retryCount > 0 && (
                  <Badge variant="outline">
                    Retry #{retryCount}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded bg-gray-100 dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <Button
                  onClick={this.handleReset}
                  disabled={this.state.isRecovering}
                  className="flex-1"
                  variant="default"
                >
                  {this.state.isRecovering ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleReportError}
                  variant="ghost"
                  size="sm"
                  disabled={isReporting}
                  className="w-full"
                >
                  {isReporting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reporting...
                    </>
                  ) : reportCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Report Error
                    </>
                  )}
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://github.com/your-username/arhub-bc/issues', '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    GitHub Issues
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('mailto:support@arhub.com', '_blank')}
                    className="flex-1"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    console.error("Error caught by useErrorHandler:", error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Higher-order component for error handling
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
