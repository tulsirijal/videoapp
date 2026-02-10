
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PUBLIC_ROUTES = ["/login", "/register", "/videos", "/search"];
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isPublicRoute = PUBLIC_ROUTES.some((route) => originalRequest.url?.includes(route));
        
        if (isPublicRoute) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                
                await axios.post(`${BASE_URL}/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;