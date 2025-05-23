import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { Alert } from '@material-tailwind/react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        color: 'green',
    });

    const timeoutRef = useRef(null);

    const showNotification = useCallback((message, color = 'green', duration = 3000) => {
        setNotification({ open: true, message, color });

        // Clear any previous timer
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Auto-close after duration
        timeoutRef.current = setTimeout(() => {
            setNotification((prev) => ({ ...prev, open: false }));
        }, duration);
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const alertElement = notification.open ? (
        <div className="fixed top-5 right-5 z-[9999]">
            <Alert
                color={notification.color}
                onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
            >
                {notification.message}
            </Alert>
        </div>
    ) : null;

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {createPortal(alertElement, document.body)}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
