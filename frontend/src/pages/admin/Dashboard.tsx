import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  UtensilsCrossed,
  ShoppingCart,
  Grid,
  Tag,
  Clock,
  CheckCircle,
  IndianRupee,
  ChefHat,
  Loader2,
  ArrowRight,
  AlertCircle,
  Send
} from 'lucide-react';
import { orderApi, offerApi, authApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import logo from '../../assets/logo.svg';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  completedOrders: number;
  paidOrders: number;
  totalEarnings: number;
  pendingAmount: number;
}

interface ErrorResponse {
  message: string;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [activeOffers, setActiveOffers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh user data when window gains focus (after email verification in another tab)
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if email is not verified yet
      if (user && !user.isEmailVerified) {
        refreshUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, refreshUser]);

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

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, offersResponse] = await Promise.all([
        orderApi.getTodaysStats(),
        offerApi.getActiveOffers()
      ]);

      setStats(statsResponse.data.data);
      setActiveOffers(offersResponse.data.data?.length || 0);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      label: 'Manage Tables',
      desc: 'Add, edit, or remove tables',
      icon: Grid,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/admin/tables'
    },
    {
      label: 'View Orders',
      desc: 'Track and manage orders',
      icon: ShoppingCart,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/admin/orders'
    },
    {
      label: 'Menu Manager',
      desc: 'Add or update menu items',
      icon: UtensilsCrossed,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      path: '/admin/menu'
    },
    {
      label: 'Offers',
      desc: 'Create promotional offers',
      icon: Tag,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/admin/offers'
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {user && !user.isEmailVerified && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Email Verification Required</h3>
              <p className="text-sm text-amber-700 mt-1">
                Please verify your email address to access all features. Check your inbox at <strong>{user.email}</strong> for the verification link.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Resend Verification Email
                    </>
                  )}
                </button>
                <span className="text-xs text-amber-600">Check spam folder if not received</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="BookAVibe"
            className="w-16 h-16 rounded-full object-cover bg-white"
          />
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-amber-100">
              Here's your cafe overview for today
            </p>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.pendingOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Preparing</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.preparingOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats?.completedOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-600">Earnings</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats?.totalEarnings || 0)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Orders Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Total Orders Today</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">{stats?.totalOrders || 0}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {stats?.paidOrders || 0} paid
            </span>
            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              {(stats?.pendingOrders || 0) + (stats?.preparingOrders || 0) + (stats?.completedOrders || 0)} active
            </span>
          </div>
        </div>

        {/* Pending Revenue Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Pending Revenue</h3>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mb-2">{formatCurrency(stats?.pendingAmount || 0)}</p>
          <p className="text-sm text-gray-500">
            {(stats?.pendingOrders || 0) + (stats?.preparingOrders || 0) + (stats?.completedOrders || 0)} orders awaiting payment
          </p>
        </div>

        {/* Active Offers Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Active Offers</h3>
            <Tag className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">{activeOffers}</p>
          <button
            onClick={() => navigate('/admin/offers')}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Manage Offers <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => navigate(link.path)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all text-left group"
            >
              <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{link.label}</h3>
              <p className="text-xs text-gray-500">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Activity Indicator */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              System is active • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
