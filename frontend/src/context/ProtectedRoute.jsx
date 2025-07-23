// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('authToken');
    const { user, isLoggedIn, loading  } = useAuth();

    if (loading) return null;

    if (!token) {
        return <Navigate to="/auth/sign-in" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }


    return children;
}

export default ProtectedRoute;
