import {createContext, useContext, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userToken = localStorage.getItem('userToken');
        const role = localStorage.getItem('userRole');
        if (token) {
            setIsLoggedIn(true);
        }
        setUser({
            ...user, role: role, auth_token: token, user_token: userToken,
        });
    }, []);

    const login = (userData) => {
        setIsLoggedIn(true);
        localStorage.setItem('authToken', userData.auth_token);
        localStorage.setItem('userToken', userData.user_token);
        localStorage.setItem('userRole', userData.role);
        setUser(userData);
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate("/auth/sign-in");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
