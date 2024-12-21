/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import api from '../../axios.js';


function LogoutUser({ className, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true)
        setError(null)
        try {
            await api.post("/logout");
            document.cookie = "accessToken=; Max-Age=0; path=/; Secure; SameSite=Strict";
            document.cookie = "refreshToken=; Max-Age=0; path=/; Secure; SameSite=Strict";
            dispatch(logout());
            navigate("/dashboard");
            if (onClose) onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Logout failed. Please try again.");
            console.error("Logout failed:", error);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className={className}>
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
                <p className="text-lg font-semibold text-gray-800 mb-6">
                    Are you sure you want to logout?
                </p>
                <div className="flex justify-center space-x-4">
                    <Button
                        onClick={handleLogout}
                        disabled={loading}
                        color='bg-red-500 hover:bg-red-700'
                        className="px-4 py-2  font-medium"
                    >
                        {loading ? (
                            <div className="spinner-border animate-spin"></div>
                        ) : "Yes"}
                    </Button>
                    <Button
                        onClick={onClose}
                        color='bg-blue-500 hover:bg-blue-700'
                        className="px-4 py-2 font-medium "
                    >
                        No
                    </Button>
                </div>
                {error && <p className="text-red-600 text-sm mt-4" aria-live="assertive">{error}</p>}
            </div>
        </div>
    );
}

export default LogoutUser;
