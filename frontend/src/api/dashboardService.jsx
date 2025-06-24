import axiosClient from './axiosClient';

const DashboardService = {

    get_info: (params) => {
        return axiosClient.post('/dashboard/info', params);
    },
};

export default DashboardService;