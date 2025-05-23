import axiosClient from './axiosClient';

const AuthService = {
    login: (email, password) => {
        return axiosClient.post('/auth/login', {
            email: email,
            password: password,
        })
    },

    signup: (email, password) => {
        return axiosClient.post('/auth/register', {
            email: email,
            password: password,
        })
    },

    checkAdmin: () => {
        return axiosClient.post('/referral')
    }
}

export default AuthService;