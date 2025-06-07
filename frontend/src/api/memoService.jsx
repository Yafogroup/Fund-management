import axiosClient from './axiosClient';

const MemoService = {

    getMemoList: (params) => {
        return axiosClient.post('/memo/list', params);
    },

    addMemo: (formData) => {
        return axiosClient.post('/memo/add', formData);
    },

    updateMemo: (formData) => {
        return axiosClient.post('/memo/edit', formData);
    },

    deleteMemo: (uid) => {
        return axiosClient.delete(`/memo/delete/${uid}`);
    },

    export: () => {
        return axiosClient.post('/memo/export');
    },

    import: (data) => {
        return axiosClient.post('/memo/import', data);
    },
};

export default MemoService;