import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCcw,
  Clock,
  CheckCircle,
  History,
  User,
  Phone,
  Loader2,
  IndianRupee,
  Calendar,
  Package,
  TrendingUp,
  ChefHat,
  Play,
  Mail,
  // Send
} from 'lucide-react';
import { orderApi, authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  token?: number;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'completed' | 'history';
  notes?: string;
  createdAt: string;
  preparingAt?: string;
  completedAt?: string;
  paidAt?: string;
}

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

type TabType = 'pending' | 'completed' | 'history';

// Auto-refresh interval in milliseconds (30 seconds)
const REFRESH_INTERVAL = 30000;

const Orders: React.FC = () => {
  const { user } = useAuth(); // ADD refreshUser WHEN DOMAIN PURCHASE FOR EMAIL VERIFICATION
  const isKitchen = user?.role === 'kitchen';
  // const isEmailVerified = user?.isEmailVerified ?? false;

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyTotal, setHistoryTotal] = useState(0);
  // const [resendingEmail, setResendingEmail] = useState(false);

  // Refresh user data when window gains focus (after email verification)
  // useEffect(() => {
  //   const handleFocus = () => {
  //     if (user && !user.isEmailVerified) {
  //       refreshUser();
  //     }
  //   };
  //   window.addEventListener('focus', handleFocus);
  //   return () => window.removeEventListener('focus', handleFocus);
  // }, [user, refreshUser]);

  // const handleResendVerification = async () => {
  //   if (!user?.email) return;
  //   setResendingEmail(true);
  //   try {
  //     await authApi.resendVerification(user.email);
  //     toast.success('Verification email sent! Check your inbox.');
  //   } catch (error) {
  //     const axiosError = error as AxiosError<ErrorResponse>;
  //     toast.error(axiosError.response?.data?.message || 'Failed to send verification email');
  //   } finally {
  //     setResendingEmail(false);
  //   }
  // };

  const fetchPendingOrders = useCallback(async () => {
    try {
      const response = await orderApi.getPendingOrders();
      setPendingOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  }, []);

  const fetchCompletedOrders = useCallback(async () => {
    try {
      const response = await orderApi.getCompletedOrders();
      setCompletedOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  }, []);

  const fetchHistoryOrders = useCallback(async () => {
    try {
      const response = await orderApi.getHistoryOrders(historyDate);
      setHistoryOrders(response.data.data.orders);
      setHistoryTotal(response.data.data.totalEarnings);
    } catch (error) {
      console.error('Error fetching history orders:', error);
    }
  }, [historyDate]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await orderApi.getTodaysStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchPendingOrders(),
        fetchCompletedOrders(),
        fetchStats()
      ]);
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchPendingOrders, fetchCompletedOrders, fetchStats]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Fetch history when tab or date changes
  useEffect(() => {
    if (activeTab === 'history' && !isKitchen) {
      fetchHistoryOrders();
    }
  }, [historyDate, activeTab, fetchHistoryOrders, isKitchen]);

  const handleMarkPreparing = async (orderId: string) => {
    try {
      await orderApi.markAsPreparing(orderId);
      toast.success('Started preparing order');
      await fetchAllData(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    try {
      await orderApi.markAsCompleted(orderId);
      toast.success('Order marked as completed');
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      await fetchAllData(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      await orderApi.markAsPaid(orderId);
      toast.success('Order marked as paid');
      setCompletedOrders(prev => prev.filter(o => o.id !== orderId));
      await fetchAllData(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await orderApi.cancelOrder(orderId);
      toast.success('Order cancelled');
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      await fetchAllData(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrdersByTab = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'completed':
        return completedOrders;
      case 'history':
        return historyOrders;
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">New</span>;
      case 'preparing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><ChefHat size={12} /> Preparing</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Ready</span>;
      case 'history':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Paid</span>;
    }
  };

  const renderOrderCard = (order: Order) => {
    return (
      <div
        key={order.id}
        className="bg-white rounded-xl shadow-sm border border-mocha overflow-hidden relative"
      >
        {/* Table Number Badge - Large corner display */}
        <div className="absolute top-0 right-0 w-14 h-14 bg-caramel flex items-center justify-center rounded-bl-xl">
          <span className="text-white text-xl font-bold">{order.tableNumber}</span>
        </div>

        {/* Card Content */}
        <div className="p-3 pr-16">
          {/* Token Number - Upper Left Corner */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-primary-600">
              #{String(order.token || order.orderNumber.slice(-4)).padStart(3, '0')}
            </span>
            {getStatusBadge(order.status)}
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <User size={14} />
              {order.customerName}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {order.customerPhone}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatTime(order.createdAt)}
            </span>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-2 mb-3">
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-1">x{item.quantity}</span>
                    {item.specialInstructions && (
                      <span className="text-xs text-orange-600 ml-2">({item.specialInstructions})</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total</span>
              <span className="font-bold text-primary-600 text-lg">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3 text-sm">
              <span className="text-yellow-800"><strong>Note:</strong> {order.notes}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {/* Pending Status - Show Start Preparing */}
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleMarkPreparing(order.id)}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Play size={16} />
                  Start Preparing
                </button>
                {!isKitchen && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}

            {/* Preparing Status - Show Complete */}
            {order.status === 'preparing' && (
              <button
                onClick={() => handleMarkCompleted(order.id)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle size={16} />
                Mark Completed
              </button>
            )}

            {/* Completed Status - Show Mark Paid (Admin only) */}
            {order.status === 'completed' && !isKitchen && (
              <button
                onClick={() => handleMarkPaid(order.id)}
                className="flex-1 py-2 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors font-medium flex items-center justify-center gap-2 text-sm"
              >
                <IndianRupee size={16} />
                Mark as Paid
              </button>
            )}

            {/* Kitchen view of completed - read only info */}
            {order.status === 'completed' && isKitchen && (
              <div className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-center font-medium text-sm">
                ✓ Completed at {order.completedAt ? formatTime(order.completedAt) : 'N/A'}
              </div>
            )}

            {order.status === 'history' && (
              <div className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-center font-medium text-sm">
                Paid at {order.paidAt ? formatTime(order.paidAt) : 'N/A'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {/* {!isEmailVerified && (
        <div className="bg-mocha/20 border border-mocha rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-mocha/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-dark-roast">Email Verification Required</h3>
              <p className="text-sm text-primary-700 mt-1">
                Please verify your email to start managing orders. Check your inbox at <strong>{user?.email}</strong> for the verification link.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {resendingEmail ? (
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
                <span className="text-xs text-primary-600">Check spam folder if not received</span>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isKitchen ? 'Kitchen Orders' : 'Orders'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isKitchen ? 'Manage kitchen order preparation' : 'View and manage customer orders'}
          </p>
        </div>
        <button
          onClick={() => fetchAllData()}
          className="flex items-center gap-2 px-4 py-2 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors"
        >
          <RefreshCcw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isKitchen ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.pendingOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.completedOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-green-600">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        {!isKitchen && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mocha/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-primary-600">₹{stats?.totalEarnings || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'pending'
              ? 'text-primary-600 border-b-2 border-mocha bg-mocha/20'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Clock size={18} />
            {isKitchen ? 'Kitchen Queue' : 'Pending'}
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'completed'
              ? 'text-primary-600 border-b-2 border-mocha bg-mocha/20'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <CheckCircle size={18} />
            {isKitchen ? 'Served' : 'Completed'}
            {completedOrders.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {completedOrders.length}
              </span>
            )}
          </button>
          {/* History tab - Admin only */}
          {!isKitchen && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-mocha bg-mocha/20'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <History size={18} />
              History
            </button>
          )}
        </div>

        {/* History Date Picker (Admin only) */}
        {activeTab === 'history' && !isKitchen && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total for {formatDate(historyDate)}</p>
              <p className="text-xl font-bold text-primary-600">₹{historyTotal}</p>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="p-4">
          {getOrdersByTab().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders</h3>
              <p className="text-gray-500">
                {activeTab === 'pending' && (isKitchen ? 'No orders in the queue' : 'No pending orders at the moment')}
                {activeTab === 'completed' && (isKitchen ? 'No orders served yet' : 'No completed orders waiting for payment')}
                {activeTab === 'history' && `No orders found for ${formatDate(historyDate)}`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {getOrdersByTab().map(order => renderOrderCard(order))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
