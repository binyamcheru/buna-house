// lib/error-handler.ts
// Global error handling for better UX

type ErrorType = 'network' | 'validation' | 'auth' | 'server' | 'unknown';

interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  details?: any;
}

class ErrorHandler {
  /**
   * Parse and handle API errors
   */
  static handleApiError(error: any): AppError {
    // Network error
    if (!navigator.onLine) {
      return {
        type: 'network',
        message: 'Network connection lost',
        userMessage: 'Please check your internet connection',
      };
    }

    // Fetch failed
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        message: 'Failed to reach server',
        userMessage: 'Unable to connect. Please try again.',
      };
    }

    // API returned error
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          return {
            type: 'validation',
            message: 'Invalid request',
            userMessage: 'Please check your input and try again',
          };
        case 401:
          return {
            type: 'auth',
            message: 'Unauthorized',
            userMessage: 'Please login again',
          };
        case 404:
          return {
            type: 'server',
            message: 'Not found',
            userMessage: 'Requested item not found',
          };
        case 500:
          return {
            type: 'server',
            message: 'Server error',
            userMessage: 'Something went wrong. Please try again.',
          };
        default:
          return {
            type: 'server',
            message: `HTTP ${status}`,
            userMessage: 'An error occurred. Please try again.',
          };
      }
    }

    // Unknown error
    return {
      type: 'unknown',
      message: error.message || 'Unknown error',
      userMessage: 'Something went wrong. Please refresh and try again.',
    };
  }

  /**
   * Show user-friendly error toast
   */
  static showError(error: AppError) {
    // You can replace this with a toast library later
    alert(`⚠️ ${error.userMessage}`);
    console.error('Error details:', error);
  }

  /**
   * Retry logic for failed requests
   */
  static async retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Retry attempt ${i + 1}/${maxRetries}`);

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError;
  }
}

export { ErrorHandler, type AppError };

// Usage Example:
//
// try {
//   const response = await fetch('/api/orders', { method: 'POST', body: ... });
//   if (!response.ok) throw new Error(`HTTP ${response.status}`);
// } catch (error) {
//   const appError = ErrorHandler.handleApiError(error);
//   ErrorHandler.showError(appError);
// }
//
// // With retry:
// const data = await ErrorHandler.retryRequest(async () => {
//   const response = await fetch('/api/products');
//   return response.json();
// }, 3, 1000);
