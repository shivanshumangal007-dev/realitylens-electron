import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export default api;
