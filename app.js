import UTTS from './utts-sdk.js';
import { auth0Config } from './auth0-config.js';
import { createAuth0Client } from 'https://cdn.auth0.com/js/auth0-spa-js/2.0.1/auth0-spa-js.production.esm.js';

const sdk = new UTTS('http://localhost:3000'); // Backend URL
let auth0Client = null;

async function initializeAuth0() {
    try {
        auth0Client = await createAuth0Client({
            domain: auth0Config.domain,
            clientId: auth0Config.clientId,
            authorizationParams: {
                redirect_uri: auth0Config.callbackUrl,
                audience: auth0Config.audience
            }
        });
    } catch (err) {
        console.error('Error initializing Auth0:', err);
    }
}

// Handle Login Flow
if (window.location.pathname.endsWith('index.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to ensure Auth0 script is loaded
        setTimeout(async () => {
            const loginButton = document.getElementById('login-button');
            const messageDiv = document.getElementById('message');

            // Initialize Auth0
            await initializeAuth0();

            loginButton.addEventListener('click', async () => {
        try {
            if (!auth0Client) {
                throw new Error('Auth0 client not initialized');
            }
            console.log('Starting login redirect...');
            await auth0Client.loginWithRedirect();
        } catch (err) {
            console.error('Error during login:', err.message || err);
            console.error('Full error:', err);
            messageDiv.style.color = 'red';
            messageDiv.innerText = `Failed to login: ${err.message || 'Unknown error'}`;
        }
            });
        }, 1000); // 1 second delay
    });
}

// Handle Dashboard
if (window.location.pathname.endsWith('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            const userIdDisplay = document.getElementById('user-id-display');
            const registerKeyForm = document.getElementById('register-key-form');
            const registerKeyMessage = document.getElementById('register-key-message');
            const logoutButton = document.getElementById('logout-button');

            // Initialize Auth0 and handle callback
            await initializeAuth0();
        try {
            // Handle callback
            if (window.location.search.includes('code=')) {
                await auth0Client.handleRedirectCallback();
                // Clean up the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Check if user is authenticated
            const isAuthenticated = await auth0Client.isAuthenticated();
            console.log('Authentication status:', isAuthenticated);
            
            // Prevent redirect loop by checking if we just came from index.html
            const cameFromIndex = document.referrer.endsWith('index.html');
            if (!isAuthenticated && !cameFromIndex) {
                console.log('User not authenticated, redirecting to login');
                window.location.href = 'index.html';
                return;
            }

            try {
                // Get user info and token
                const user = await auth0Client.getUser();
                const token = await auth0Client.getTokenSilently({
                    timeoutInSeconds: 60,
                    cacheMode: 'off'  // Force token refresh
                });
                
                console.log('Token obtained successfully');
                
                // Set token in SDK
                sdk.setAccessToken(token);

                // Get user profile from our backend
                const profile = await sdk.getProfile();
                console.log('Profile retrieved successfully');
                userIdDisplay.innerText = `Welcome ${user.name || user.email}! (ID: ${profile.userId})`;
            } catch (tokenError) {
                console.error('Token or profile error:', tokenError);
                if (tokenError.error === 'login_required' || 
                    tokenError.error === 'invalid_token' || 
                    tokenError.message?.includes('Failed to fetch user profile')) {
                    console.log('Token invalid or expired, redirecting to login');
                    window.location.href = 'index.html';
                    return;
                }
                throw tokenError; // Re-throw unexpected errors
            }

            // Handle logout
            logoutButton.addEventListener('click', async () => {
                await auth0Client.logout({
                    logoutParams: {
                        returnTo: window.location.origin + '/index.html'
                    }
                });
            });
            // Handle form submission
            registerKeyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const service = document.getElementById('service').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const baseUrl = document.getElementById('baseUrl').value.trim();
        const customHeadersInput = document.getElementById('customHeaders').value.trim();

        let customHeaders = {};
        if (customHeadersInput) {
            try {
                customHeaders = JSON.parse(customHeadersInput);
            } catch (err) {
                alert('Invalid JSON format for custom headers');
                return;
            }
        }

        try {
            const response = await sdk.registerKey(service, apiKey, baseUrl, customHeaders);
            registerKeyMessage.style.color = 'green';
            registerKeyMessage.innerText = response.message || 'API key registered successfully!';
        } catch (err) {
            console.error('Error registering API key:', err);
            registerKeyMessage.style.color = 'red';
            registerKeyMessage.innerText = 'Failed to register API key.';
        }
            });
        } catch (err) {
            console.error('Error in dashboard authentication:', err);
            console.error('Error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
            
            // Only redirect on specific authentication errors
            if (err.error === 'login_required' || err.error === 'invalid_token') {
                console.log('Authentication error, redirecting to login');
                window.location.href = 'index.html';
            }
        }
        }, 1000); // 1 second delay
    });
}
