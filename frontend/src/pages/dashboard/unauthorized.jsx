import React from 'react';
import { Button } from "@material-tailwind/react"; // optional if you're using MTW
import { useNavigate } from "react-router-dom";

function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-center">
            <h1 className="text-3xl font-bold text-red-500 mb-4">🚫 Access Denied</h1>
            <p className="text-gray-600 mb-6">
                You don't have permission to view this page.
            </p>
            <Button onClick={() => navigate(-1)} color="gray">
                🔙 Go Back
            </Button>
        </div>
    );
}

export default Unauthorized;