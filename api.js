const BASE_URL = 'http://localhost:3000/api';

const apiClient = {
    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data?.error || data?.message || 'Lỗi hệ thống';
                return { success: false, error: errorMessage };
            }

            if (data && typeof data === 'object' && 'success' in data) {
                return {
                    success: data.success,
                    data: data.data,
                    error: data.error
                };
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    get(endpoint) {
        return this.request(endpoint, 'GET');
    },

    post(endpoint, body) {
        return this.request(endpoint, 'POST', body);
    },

    put(endpoint, body) {
        return this.request(endpoint, 'PUT', body);
    },

    delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
};
