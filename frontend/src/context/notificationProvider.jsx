import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '@material-tailwind/react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        color: 'green',
    });

    const showNotification = useCallback((message, color = 'green') => {
        setNotification({ open: true, message, color });

        setTimeout(() => {
            setNotification((prev) => ({ ...prev, open: false }));
        }, 3000); // auto close after 3 sec
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification.open && (
                <div className="fixed top-5 right-5 z-50">
                    <Alert color={notification.color} onClose={() => setNotification((prev) => ({ ...prev, open: false }))}>
                        {notification.message}
                    </Alert>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
