import { Middleware, ResponseContext, ErrorContext } from './api/runtime';

/**
 * Middleware to handle client error (4xx) responses
 * Automatically redirects to login page when authentication fails
 */
export const authMiddleware: Middleware = {
    async post(context: ResponseContext): Promise<Response | void> {
        const { response } = context;
        
        // Check if response status is 401 (Unauthorized) or 403 (Forbidden)
        if (response.status === 401 || response.status === 403) {
            // Clear the access token from localStorage for auth-related errors
            localStorage.removeItem('access_token');
            
            // Redirect to login page
            window.location.href = '/login';
            
            // Return the response to prevent further processing
            return response;
        }
        
        // For all other responses, return undefined to continue normal processing
        return undefined;
    },
    
    async onError(context: ErrorContext): Promise<Response | void> {
        const { response, error, url } = context;
        
        // If there's a response available (e.g., CORS error with 401), check its status
        if (response && (response.status === 401 || response.status === 403)) {
            // Clear the access token from localStorage for auth-related errors
            localStorage.removeItem('access_token');
            
            // Redirect to login page
            window.location.href = '/login';
            
            // Return the response to prevent further processing
            return response;
        }
        
        // Handle CORS errors or network failures that might be auth-related
        // When CORS blocks a 401 response, we can't access the status code
        // but we can detect it's likely an auth issue if:
        // 1. It's a TypeError (fetch failure)
        // 2. The URL is an API endpoint (not a public resource)
        // 3. We have an access token (suggesting this should be an authenticated request)
        if (error instanceof TypeError && 
            error.message.includes('fetch') && 
            url.includes('/api/') &&
            localStorage.getItem('access_token')) {
            
            console.warn('Fetch failed, possibly due to authentication. Redirecting to login...');
            
            // Clear the access token from localStorage
            localStorage.removeItem('access_token');
            
            // Redirect to login page
            window.location.href = '/login';
            
            // Don't return a response - let the error propagate but after redirect
            return undefined;
        }
        
        // For all other errors, return undefined to continue normal error handling
        return undefined;
    }
};

