import axios from "axios";
import { refresh } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PUBLIC_ROUTES = ["/login", "/register", "/videos", "/search"];

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accesstoken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isPublicRoute = PUBLIC_ROUTES.some((route) => 
            originalRequest.url?.includes(route)
        );
        
        if (isPublicRoute) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    `${BASE_URL}/refresh`, 
                    {refreshToken: localStorage.getItem("refreshtoken")}, 
                    { withCredentials: true }
                );

                const newAccessToken = res.data.access;
                localStorage.setItem("accesstoken", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                localStorage.removeItem("accesstoken");
                localStorage.removeItem("refreshtoken");
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;