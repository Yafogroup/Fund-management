import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:5090/api/',  // your base URL
    headers: {
        'Accept': 'application/json',
    }
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;