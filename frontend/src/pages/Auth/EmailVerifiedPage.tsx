import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import { authApi } from '../../services/api';

const EmailVerifiedPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token provided.');
                return;
            }

            try {
                const response = await authApi.verifyEmail(token);
                setStatus('success');
                setMessage(response.data.message || 'Your email has been verified successfully!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Email verification failed. The link may be expired or invalid.');
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-caramel to-mocha rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl">☕</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">BookAVibe</h1>
                    <p className="text-gray-500">Email Verification</p>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
                                <Loader2 size={40} className="text-caramel animate-spin" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Verifying Your Email
                            </h2>
                            <p className="text-gray-500">
                                Please wait while we verify your email address...
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Email Verified! 🎉
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {message}
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                Your account is now fully activated. You can access all features of the dashboard.
                            </p>
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="w-full py-3 bg-gradient-to-r from-caramel to-mocha text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                Go to Dashboard
                                <ArrowRight size={18} />
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle size={40} className="text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-gray-500 mb-6">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 bg-gradient-to-r from-caramel to-mocha text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Back to Login
                                </button>
                                <p className="text-xs text-gray-400">
                                    You can request a new verification email from your account settings after logging in.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    © {new Date().getFullYear()} BookAVibe. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default EmailVerifiedPage;
