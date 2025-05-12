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
    }
};

export default TokenService;