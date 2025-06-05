import axiosClient from './axiosClient';

const PortfolioService = {

    getList: (params) => {
        return axiosClient.post('/portfolio/list', params);
    },

    save: (formData) => {
        return axiosClient.post('/portfolio/add', formData);
    },

    delete: (uid) => {
        return axiosClient.delete(`/portfolio/delete/${uid}`);
    },

    close: (params) => {
        return axiosClient.post('/portfolio/close', params);
    },
}

export default PortfolioService;