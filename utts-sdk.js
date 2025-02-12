class UTTS {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.accessToken = null;
    }

    setAccessToken(token) {
        this.accessToken = token;
    }

    async getProfile() {
        if (!this.accessToken) {
            throw new Error('Access token not found. Please log in first.');
        }

        return fetch(`${this.baseUrl}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
        }).then((res) => res.json());
    }

    async registerKey(service, apiKey, baseUrl, customHeaders) {
        if (!this.accessToken) {
            throw new Error('Access token not found. Please log in first.');
        }

        return fetch(`${this.baseUrl}/register-key`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ service, apiKey, baseUrl, customHeaders }),
        }).then((res) => res.json());
    }

    async getTempToken(service, scopes) {
        if (!this.accessToken) {
            throw new Error('Access token not found. Please log in first.');
        }

        return fetch(`${this.baseUrl}/get-temp-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ service, scopes }),
        }).then(res => res.json());
    }

    async proxyRequest(token, endpoint, options) {
        if (!this.accessToken) {
            throw new Error('Access token not found. Please log in first.');
        }

        return fetch(`${this.baseUrl}/proxy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, endpoint, ...options }),
        }).then(res => res.json());
    }
}

export default UTTS;
