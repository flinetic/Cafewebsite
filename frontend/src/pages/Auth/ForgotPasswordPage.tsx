import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface ErrorResponse {
    message: string;
}

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.forgotPassword(email);
            setEmailSent(true);
            toast.success('Password reset link sent to your email!');
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-caramel via-primary-700 to-mocha flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6">
                        <Coffee className="w-12 h-12 text-primary-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">BookAVibe</h1>
                    <p className="text-mocha mt-2 text-lg">Cafe Management System</p>
                </div>

                {/* Forgot Password Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10">
                    {emailSent ? (
                        // Success State
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h2>
                            <p className="text-gray-600 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Click the link in the email to reset your password.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Try Different Email
                                </button>
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-caramel text-white rounded-xl hover:bg-mocha transition-colors font-medium"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">Forgot Password?</h2>
                            <p className="text-gray-500 mb-8 text-lg">
                                Enter your email and we'll send you a reset link
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-4 border border-milk-foam rounded-xl focus:ring-2 focus:ring-caramel focus:border-transparent transition-all outline-none text-base"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-caramel to-mocha text-white py-4 rounded-xl font-semibold text-lg hover:from-primary-700 hover:to-primary-500 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            {/* Back to Login Link */}
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 mt-6 text-primary-600 hover:text-mocha font-medium"
                            >
                                <ArrowLeft size={18} />
                                Back to Login
                            </Link>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-mocha text-sm">
                    © 2024 BookAVibe. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
