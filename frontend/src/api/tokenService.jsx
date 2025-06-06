import axiosClient from './axiosClient';

const TokenService = {
    getTokenList: () => {
        return axiosClient.post('/token/list');
    },

    getCurrentTokenList: () => {
        return axiosClient.post('/token/current_list');
    },

    updateParam: (interval, min, max) => {
        return axiosClient.post('/token/update_param', {
            interval: interval,
            min_change: min,
            max_change: max,
        });
    },

    updateUserToken: (token) => {
        return axiosClient.post('/token/update_user_token', {
            token_ids: token,
        })
    },

    getTokenType: (params) => {
        return axiosClient.post('/toke_type/list', params);
    },

    saveTokenType: (formData) => {
        return axiosClient.post('/toke_type/save', formData)
    },

    deleteTokenType: (uid) => {
        return axiosClient.delete(`/toke_type/delete/${uid}`, )
    }
};

export default TokenService;