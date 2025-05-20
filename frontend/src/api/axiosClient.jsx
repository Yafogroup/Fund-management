import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:5090/api/',  // your base URL
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
});
export default axiosClient;