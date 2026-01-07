import { Configuration, ConfigurationParameters } from '@/api/runtime';
import { authMiddleware } from './authMiddleware';
import AppConfig from '@/AppConfig';
import { jwtDecode } from "jwt-decode";

/**
 * Creates an API configuration with authentication middleware
 * This ensures all API calls automatically handle 401 errors and redirect to login
 * 
 * @returns Configuration object with auth middleware and token
 */
export function createApiConfiguration(additionalParams?: Partial<ConfigurationParameters>): Configuration {
    const accessToken = localStorage.getItem("access_token");
    
    return new Configuration({
        basePath: AppConfig.baseApiUrl,
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
        middleware: [authMiddleware],
        ...additionalParams
    });
}


export interface AuthenticatedUser {
    user_id: string;
    subscription_plan: string;
    email: string;
    name: string;       
}


function custom_decode_token(accessToken: string): AuthenticatedUser | null {
    try {
        const decodedToken: AuthenticatedUser = jwtDecode(accessToken);
        const { user_id, subscription_plan, email, name } = decodedToken;
        console.log({ user_id, subscription_plan, email, name });
        return { user_id, subscription_plan, email, name };
    } catch (error) {
        console.error("Error decoding token:", error);
    }
    return null;
}

function cognito_decode_token(accessToken: string): AuthenticatedUser | null {
    try {
        const decodedToken: {
            "custom:user_id": string,
            "custom:subscription_plan": string,
            email: string,
            name: string,
        } = jwtDecode(accessToken);
        
        const user_id = decodedToken["custom:user_id"];
        const subscription_plan = decodedToken["custom:subscription_plan"];
        const email = decodedToken.email;
        const name = decodedToken.name;
        console.log({ user_id, subscription_plan, email });
        return { user_id, subscription_plan, email, name };
    } catch (error) {
        console.error("Error decoding token:", error);
    }
    return null;
}

export function getAuthenticatedUser(): AuthenticatedUser | null {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        try {

            const decodedToken = jwtDecode<{[key: string]: any}>(accessToken);
            if (decodedToken && decodedToken["subscription_plan"]) {
                return custom_decode_token(accessToken);
            } else if (decodedToken && decodedToken["cognito:username"]) {
                return cognito_decode_token(accessToken);
            }
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }
    return null;
}

