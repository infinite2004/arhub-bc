// Global error handling and user feedback system

import { trackError } from './analytics';

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

export interface UserFeedback {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private feedbackQueue: UserFeedback[] = [];
  private maxErrors = 100;

  constructor() {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled promise rejection',
        code: 'UNHANDLED_REJECTION',
        context: 'global',
        severity: 'high',
        timestamp: new Date(),
        stack: event.reason?.stack,
        metadata: { reason: event.reason },
      });
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        code: 'JAVASCRIPT_ERROR',
        context: 'global',
        severity: 'high',
        timestamp: new Date(),
        url: event.filename,
        stack: event.error?.stack,
        metadata: {
          line: event.lineno,
          column: event.colno,
          filename: event.filename,
        },
      });
    });

    // Handle network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.handleError({
            message: `HTTP ${response.status}: ${response.statusText}`,
            code: 'HTTP_ERROR',
            context: 'network',
            severity: response.status >= 500 ? 'high' : 'medium',
            timestamp: new Date(),
            url: args[0]?.toString(),
            metadata: {
              status: response.status,
              statusText: response.statusText,
              url: args[0]?.toString(),
            },
          });
        }
        return response;
      } catch (error) {
        this.handleError({
          message: error instanceof Error ? error.message : 'Network request failed',
          code: 'NETWORK_ERROR',
          context: 'network',
          severity: 'medium',
          timestamp: new Date(),
          url: args[0]?.toString(),
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    };
  }

  public handleError(errorInfo: Omit<ErrorInfo, 'timestamp'>) {
    const error: ErrorInfo = {
      ...errorInfo,
      timestamp: new Date(),
      url: errorInfo.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: errorInfo.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : undefined),
    };

    // Add to local error log
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Track error in analytics
    trackError(error.message, error.context, {
      code: error.code,
      severity: error.severity,
      url: error.url,
    });

    // Log to console based on severity
    this.logError(error);

    // Show user feedback for high/critical errors
    if (error.severity === 'high' || error.severity === 'critical') {
      this.showUserFeedback({
        type: 'error',
        title: 'Something went wrong',
        message: this.getUserFriendlyMessage(error),
        duration: 0, // Don't auto-dismiss critical errors
        dismissible: true,
      });
    }

    // Send to error reporting service for critical errors
    if (error.severity === 'critical') {
      this.reportCriticalError(error);
    }
  }

  private logError(error: ErrorInfo) {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.message}`;
    const logData = {
      code: error.code,
      context: error.context,
      url: error.url,
      stack: error.stack,
      metadata: error.metadata,
    };

    switch (error.severity) {
      case 'low':
        console.info(logMessage, logData);
        break;
      case 'medium':
        console.warn(logMessage, logData);
        break;
      case 'high':
      case 'critical':
        console.error(logMessage, logData);
        break;
    }
  }

  private getUserFriendlyMessage(error: ErrorInfo): string {
    // Map technical errors to user-friendly messages
    const friendlyMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection and try again.',
      'HTTP_ERROR': 'The server encountered an error. Please try again in a few moments.',
      'JAVASCRIPT_ERROR': 'An unexpected error occurred. Please refresh the page and try again.',
      'UNHANDLED_REJECTION': 'An operation failed unexpectedly. Please try again.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'AUTHENTICATION_ERROR': 'Please sign in to continue.',
      'AUTHORIZATION_ERROR': 'You don\'t have permission to perform this action.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment and try again.',
      'FILE_UPLOAD_ERROR': 'Failed to upload file. Please check the file size and format.',
      'SEARCH_ERROR': 'Search is temporarily unavailable. Please try again later.',
    };

    return friendlyMessages[error.code || ''] || error.message;
  }

  private async reportCriticalError(error: ErrorInfo) {
    try {
      // Send to error reporting service
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (reportingError) {
      console.error('Failed to report critical error:', reportingError);
    }
  }

  public showUserFeedback(feedback: UserFeedback) {
    this.feedbackQueue.push(feedback);
    this.displayFeedback();
  }

  private displayFeedback() {
    if (this.feedbackQueue.length === 0) return;

    const feedback = this.feedbackQueue.shift()!;
    
    // Create and show toast notification
    this.createToast(feedback);
  }

  private createToast(feedback: UserFeedback) {
    if (typeof window === 'undefined') return;

    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 transform transition-all duration-300 translate-x-full`;
    
    const typeColors = {
      success: 'border-l-4 border-l-green-500',
      info: 'border-l-4 border-l-blue-500',
      warning: 'border-l-4 border-l-yellow-500',
      error: 'border-l-4 border-l-red-500',
    };

    toast.classList.add(typeColors[feedback.type]);

    const iconMap = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };

    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-lg">${iconMap[feedback.type]}</span>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            ${feedback.title}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            ${feedback.message}
          </p>
          ${feedback.action ? `
            <div class="mt-3">
              <button class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                ${feedback.action.label}
              </button>
            </div>
          ` : ''}
        </div>
        ${feedback.dismissible !== false ? `
          <div class="ml-4 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Set up close button
    const closeButton = toast.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.dismissToast(toast);
      });
    }

    // Set up action button
    if (feedback.action) {
      const actionButton = toast.querySelector('button:not([class*="ml-4"])');
      if (actionButton) {
        actionButton.addEventListener('click', () => {
          feedback.action!.onClick();
          this.dismissToast(toast);
        });
      }
    }

    // Auto-dismiss
    if (feedback.duration !== 0) {
      setTimeout(() => {
        this.dismissToast(toast);
      }, feedback.duration || 5000);
    }
  }

  private dismissToast(toast: HTMLElement) {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors() {
    this.errors = [];
  }

  public getErrorStats() {
    const stats = {
      total: this.errors.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byContext: {} as Record<string, number>,
      recent: this.errors.filter(error => 
        Date.now() - error.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length,
    };

    this.errors.forEach(error => {
      stats.bySeverity[error.severity]++;
      stats.byContext[error.context || 'unknown'] = 
        (stats.byContext[error.context || 'unknown'] || 0) + 1;
    });

    return stats;
  }
}

// Utility functions for common error scenarios
export function handleApiError(error: any, context?: string) {
  const errorHandler = new ErrorHandler();
  
  let message = 'An unexpected error occurred';
  let code = 'API_ERROR';
  let severity: ErrorInfo['severity'] = 'medium';

  if (error.response) {
    // HTTP error response
    const status = error.response.status;
    message = error.response.data?.message || `HTTP ${status} error`;
    code = `HTTP_${status}`;
    severity = status >= 500 ? 'high' : 'medium';
  } else if (error.request) {
    // Network error
    message = 'Network error - please check your connection';
    code = 'NETWORK_ERROR';
    severity = 'medium';
  } else if (error instanceof Error) {
    message = error.message;
    code = 'JAVASCRIPT_ERROR';
    severity = 'medium';
  }

  errorHandler.handleError({
    message,
    code,
    context: context || 'api',
    severity,
  });
}

export function handleValidationError(errors: any[], context?: string) {
  const errorHandler = new ErrorHandler();
  
  errors.forEach(error => {
    errorHandler.handleError({
      message: error.message || 'Validation error',
      code: 'VALIDATION_ERROR',
      context: context || 'validation',
      severity: 'low',
      metadata: { field: error.path, value: error.value },
    });
  });
}

export function handleAuthError(error: any, context?: string) {
  const errorHandler = new ErrorHandler();
  
  let message = 'Authentication failed';
  let code = 'AUTHENTICATION_ERROR';
  let severity: ErrorInfo['severity'] = 'medium';

  if (error.status === 401) {
    message = 'Please sign in to continue';
    code = 'AUTHENTICATION_ERROR';
    severity = 'medium';
  } else if (error.status === 403) {
    message = 'You don\'t have permission to perform this action';
    code = 'AUTHORIZATION_ERROR';
    severity = 'medium';
  }

  errorHandler.handleError({
    message,
    code,
    context: context || 'authentication',
    severity,
  });
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (errorInfo: Omit<ErrorInfo, 'timestamp'>) => 
      errorHandler.handleError(errorInfo),
    showFeedback: (feedback: UserFeedback) => 
      errorHandler.showUserFeedback(feedback),
    getErrors: () => errorHandler.getErrors(),
    getErrorStats: () => errorHandler.getErrorStats(),
    clearErrors: () => errorHandler.clearErrors(),
  };
}
