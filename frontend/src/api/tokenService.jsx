import axiosClient from './axiosClient';

const TokenService = {
    getTokenList: () => {
        return axiosClient.post('/token/list');
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
    }
};

export default TokenService;