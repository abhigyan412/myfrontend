import axios from "axios";

const API_BASE_URL = "https://mykazana.onrender.com/api"; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// 🔥 Attach JWT token to requests
api.interceptors.request.use(async (config) => {
    let token = localStorage.getItem("access_token");

    if (token) {
        const isExpired = (token) => {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        };

        if (isExpired(token)) {
            console.log("Access token expired. Refreshing...");
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: localStorage.getItem("refresh_token"),
                });
                localStorage.setItem("access_token", response.data.access);
                token = response.data.access;
            } catch (error) {
                console.error("Token refresh failed. Redirecting to login.");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/login"; // Redirect to login
                return Promise.reject(error);
            }
        }

        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
