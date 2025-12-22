import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface EmailVerificationGuardProps {
    children: React.ReactNode;
}

interface ErrorResponse {
    message: string;
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
    const { user } = useAuth();
    const [resending, setResending] = useState(false);

    const handleResendVerification = async () => {
        if (!user?.email) return;

        setResending(true);
        try {
            await authApi.resendVerification(user.email);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Failed to send verification email');
        } finally {
            setResending(false);
        }
    };

    // If email is verified, allow access
    if (user?.isEmailVerified) {
        return <>{children}</>;
    }

    // If not verified, show verification required message
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-amber-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Email Verification Required
                </h2>

                <p className="text-gray-600 mb-6">
                    Please verify your email address to access this feature. Check your inbox for a verification link.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left text-sm">
                            <p className="font-medium text-amber-800">Your email:</p>
                            <p className="text-amber-700">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {resending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Resend Verification Email
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin/dashboard'}
                        className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                    <p className="text-sm text-gray-500">
                        Check your spam folder if you don't see the email
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationGuard;
