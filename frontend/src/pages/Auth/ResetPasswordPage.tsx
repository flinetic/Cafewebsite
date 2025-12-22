import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Coffee, Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface ErrorResponse {
    message: string;
}

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState(false);

    const validatePassword = () => {
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) return;
        if (!token) {
            toast.error('Invalid reset token');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword(token, password);
            setResetSuccess(true);
            toast.success('Password reset successfully!');
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || 'Failed to reset password';
            toast.error(message);
            if (message.includes('expired') || message.includes('Invalid')) {
                setResetError(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6">
                        <Coffee className="w-12 h-12 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">BookAVibe</h1>
                    <p className="text-purple-200 mt-2 text-lg">Cafe Management System</p>
                </div>

                {/* Reset Password Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10">
                    {resetSuccess ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Password Reset!</h2>
                            <p className="text-gray-600 mb-6">
                                Your password has been successfully reset. You can now login with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : resetError ? (
                        // Error State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Link Expired</h2>
                            <p className="text-gray-600 mb-6">
                                This password reset link has expired or is invalid. Please request a new one.
                            </p>
                            <Link
                                to="/forgot-password"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg"
                            >
                                Request New Link
                            </Link>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Reset Password</h2>
                            <p className="text-gray-500 mb-8 text-lg">
                                Enter your new password below
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full pl-12 pr-14 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full pl-12 pr-14 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>

                            {/* Back to Login Link */}
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 mt-6 text-purple-600 hover:text-purple-700 font-medium"
                            >
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-purple-200 text-sm">
                    © 2024 BookAVibe. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
