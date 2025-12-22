import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Coffee, Mail, Lock, User, Phone, Loader2, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { authApi } from '../../services/api';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  message: string;
  errors?: ValidationError[];
}

interface AdminExistsResponse {
  success: boolean;
  data: {
    adminExists: boolean;
    adminCount: number;
    maxAdminLimit: number;
    canRegisterAsAdmin: boolean;
  };
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'admin' as 'admin' | 'kitchen',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [canRegisterAsAdmin, setCanRegisterAsAdmin] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if admin exists on mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await authApi.checkAdminExists();
        const data = response.data as AdminExistsResponse;
        setAdminExists(data.data.adminExists);
        setCanRegisterAsAdmin(data.data.canRegisterAsAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        // If API fails, assume admin exists for safety
        setAdminExists(true);
        setCanRegisterAsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password validation checks
  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, password, confirmPassword, phone, role } = formData;

    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      // Only pass role if this is first admin registration
      const registerData = {
        firstName,
        lastName,
        email,
        password,
        phone,
        role: !adminExists && canRegisterAsAdmin ? role : undefined,
      };

      const response = await register(registerData);

      // Check if registration is pending (for non-admin users)
      if (response?.isPending) {
        setRegistrationPending(true);
        toast.success('Registration submitted! Please wait for admin approval.');
      } else {
        toast.success('Registration successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.errors) {
        axiosError.response.data.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error(axiosError.response?.data?.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${valid ? 'text-green-600' : 'text-gray-400'}`}>
      {valid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  // Show loading while checking admin status
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (registrationPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Registration Pending</h1>
            <p className="text-purple-200 mt-2 text-lg">Waiting for admin approval</p>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Almost There!</h2>
            <p className="text-gray-600 mb-6">
              Your registration has been submitted successfully. An administrator will review your request and assign you a role.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You will be able to login once your account is approved.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              Back to Login
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-purple-200 text-sm">
            © 2024 BookAVibe. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6">
            <Coffee className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">BookAVibe</h1>
          <p className="text-purple-200 mt-2 text-lg">
            {!adminExists ? 'Create Admin Account' : 'Join our cafe team'}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {!adminExists ? 'Setup Admin' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            {!adminExists
              ? 'Create the first admin account to get started'
              : 'Fill in your details. An admin will approve your registration.'}
          </p>

          {/* First Admin Notice */}
          {!adminExists && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-amber-800 font-medium">First Admin Registration</p>
                  <p className="text-amber-600 text-sm">You will be the administrator of this cafe.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base"
                />
              </div>
            </div>

            {/* Role Field - Only shown for first admin */}
            {!adminExists && canRegisterAsAdmin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base appearance-none bg-white cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-amber-600 mt-2 font-medium">
                  ✓ You will be registered as the first admin
                </p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                  <p className="text-sm font-medium text-gray-600 mb-2">Password must have:</p>
                  <PasswordCheck valid={passwordChecks.minLength} text="At least 8 characters" />
                  <PasswordCheck valid={passwordChecks.hasUppercase} text="One uppercase letter" />
                  <PasswordCheck valid={passwordChecks.hasLowercase} text="One lowercase letter" />
                  <PasswordCheck valid={passwordChecks.hasNumber} text="One number" />
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-base ${formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                    }`}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-500 mt-2">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {!adminExists ? 'Creating Admin...' : 'Submitting...'}
                </>
              ) : (
                !adminExists ? 'Create Admin Account' : 'Submit Registration'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-8 text-gray-600 text-lg">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-purple-200 text-sm">
          © 2024 BookAVibe. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
