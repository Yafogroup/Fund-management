import axiosClient from './axiosClient';

const EventService = {

    getEventList: (params) => {
        return axiosClient.post('/event/list', params);
    },

    addEvent: (formData) => {
        return axiosClient.post('/event/add', formData);
    },

    updateEvent: (formData) => {
        return axiosClient.post('/event/edit', formData);
    },

    deleteEvent: (uid) => {
        return axiosClient.delete(`/event/delete/${uid}`);
    },

    export: () => {
        return axiosClient.post('/event/export');
    },

    import: (data) => {
        return axiosClient.post('/event/import', data);
    },
};

export default EventService;