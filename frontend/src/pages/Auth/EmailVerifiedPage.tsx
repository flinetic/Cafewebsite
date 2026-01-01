import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Coffee, ArrowRight, Sparkles, XCircle } from 'lucide-react';

const EmailVerifiedPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [showConfetti, setShowConfetti] = useState(true);
    const status = searchParams.get('status');
    const isSuccess = status !== 'failed';

    useEffect(() => {
        // Hide confetti animation after 3 seconds
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-caramel via-primary-700 to-mocha flex items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Confetti Animation */}
            {showConfetti && isSuccess && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <Sparkles className="w-4 h-4 text-yellow-400 opacity-80" />
                        </div>
                    ))}
                </div>
            )}

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-4">
                        <Coffee className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">BookAVibe</h1>
                </div>

                {/* Success/Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
                    {isSuccess ? (
                        <>
                            {/* Success Icon with Animation */}
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
                                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Success Message */}
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">
                                Account Verified! 🎉
                            </h2>
                            <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                                Your email has been successfully verified. You now have full access to all features of BookAVibe Cafe Management System.
                            </p>

                            {/* Features Unlocked */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8">
                                <p className="text-emerald-700 font-medium text-sm mb-3">✨ Features Unlocked</p>
                                <ul className="text-emerald-600 text-sm space-y-2">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Access to all admin features</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Order management</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Menu customization</span>
                                    </li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Error Icon */}
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                                    <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                                </div>
                            </div>

                            {/* Error Message */}
                            <h2 className="text-3xl font-bold text-gray-800 mb-3">
                                Verification Failed
                            </h2>
                            <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                                The verification link is invalid or has expired. Please request a new verification email from your account settings.
                            </p>
                        </>
                    )}

                    {/* Login Button */}
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-caramel to-mocha text-white py-4 rounded-xl font-semibold text-lg hover:from-caramel hover:to-primary-400 transition-all duration-200 shadow-lg hover:shadow-xl group"
                    >
                        {isSuccess ? 'Continue to Login' : 'Back to Login'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-mocha text-sm">
                    © 2024 BookAVibe. All rights reserved.
                </p>
            </div>

            {/* CSS for Confetti Animation */}
            <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
        </div>
    );
};

export default EmailVerifiedPage;
