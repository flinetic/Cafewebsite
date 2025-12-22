import React, { useState, useEffect } from 'react';
import {
  RefreshCcw,
  Clock,
  CheckCircle,
  History,
  User,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
  IndianRupee,
  Calendar,
  Package,
  TrendingUp
} from 'lucide-react';
import { orderApi } from '../../services/api';
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
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'history';
  notes?: string;
  createdAt: string;
  completedAt?: string;
  paidAt?: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  paidOrders: number;
  totalEarnings: number;
  pendingAmount: number;
}

interface ErrorResponse {
  message: string;
}

type TabType = 'pending' | 'completed' | 'history';

const Orders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoryOrders();
    }
  }, [historyDate, activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPendingOrders(),
        fetchCompletedOrders(),
        fetchStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await orderApi.getPendingOrders();
      setPendingOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const response = await orderApi.getCompletedOrders();
      setCompletedOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  };

  const fetchHistoryOrders = async () => {
    try {
      const response = await orderApi.getHistoryOrders(historyDate);
      setHistoryOrders(response.data.data.orders);
      setHistoryTotal(response.data.data.totalEarnings);
    } catch (error) {
      console.error('Error fetching history orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await orderApi.getTodaysStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    try {
      await orderApi.markAsCompleted(orderId);
      toast.success('Order marked as completed');
      fetchPendingOrders();
      fetchCompletedOrders();
      fetchStats();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to update order');
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      await orderApi.markAsPaid(orderId);
      toast.success('Order marked as paid');
      fetchCompletedOrders();
      fetchStats();
      if (activeTab === 'history') {
        fetchHistoryOrders();
      }
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
      fetchPendingOrders();
      fetchStats();
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

  const renderOrderCard = (order: Order) => {
    const isExpanded = expandedOrder === order.id;

    return (
      <div
        key={order.id}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Order Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">Table {order.tableNumber}</span>
                  <span className="text-sm text-gray-500">#{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {order.customerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatTime(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-lg text-amber-600">₹{order.totalAmount}</p>
                <p className="text-sm text-gray-500">{order.items.length} items</p>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            {/* Customer Info */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Phone size={14} />
                {order.customerPhone}
              </span>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg p-3 mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-400 italic">"{item.specialInstructions}"</p>
                      )}
                    </div>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                <span className="font-bold">Total</span>
                <span className="font-bold text-amber-600">₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleMarkCompleted(order.id)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
              {order.status === 'completed' && (
                <button
                  onClick={() => handleMarkPaid(order.id)}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <IndianRupee size={18} />
                  Mark as Paid
                </button>
              )}
              {order.status === 'history' && (
                <div className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                  Paid at {order.paidAt ? formatTime(order.paidAt) : 'N/A'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-600 mt-1">View and manage customer orders</p>
        </div>
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <RefreshCcw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-amber-600">₹{stats?.totalEarnings || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'pending'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Clock size={18} />
            Pending
            {pendingOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'completed'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle size={18} />
            Completed
            {completedOrders.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {completedOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* History Date Picker */}
        {activeTab === 'history' && (
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total for {formatDate(historyDate)}</p>
              <p className="text-xl font-bold text-amber-600">₹{historyTotal}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="p-4">
          {getOrdersByTab().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No orders</h3>
              <p className="text-gray-500">
                {activeTab === 'pending' && 'No pending orders at the moment'}
                {activeTab === 'completed' && 'No completed orders waiting for payment'}
                {activeTab === 'history' && `No orders found for ${formatDate(historyDate)}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getOrdersByTab().map(order => renderOrderCard(order))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
