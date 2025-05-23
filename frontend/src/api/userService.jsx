import axiosClient from './axiosClient';

const UserService = {

    getUserList: (params) => {
        return axiosClient.post('/user/list', params);
    },

    updateUser: (formData) => {
        return axiosClient.post('/auth/user/update', formData);
    },

    deleteUser: (uid) => {
        return axiosClient.delete(`/user/delete/${uid}`);
    }
};

export default UserService;