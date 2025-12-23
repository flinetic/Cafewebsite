import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  RotateCw,
  Power,
  PowerOff,
  QrCode,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Layers,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { tableApi, configApi } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface Table {
  id: string;
  tableNumber: number;
  qrCodeDataUrl: string;
  isActive: boolean;
  hasQR: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  message: string;
}

const Tables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [cafeConfig, setCafeConfig] = useState<{ logoUrl?: string; cafeName?: string }>({});

  // Bulk operations state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStartNumber, setBulkStartNumber] = useState('');
  const [bulkCount, setBulkCount] = useState('');
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [isTogglingAll, setIsTogglingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchCafeConfig();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await tableApi.getAllTables();
      setTables(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchCafeConfig = async () => {
    try {
      const response = await configApi.getConfig();
      setCafeConfig(response.data.data || {});
    } catch (error) {
      console.error('Failed to fetch cafe config:', error);
    }
  };

  const handleCreateTable = async () => {
    const tableNumber = parseInt(newTableNumber);

    if (!tableNumber || tableNumber < 1) {
      toast.error('Please enter a valid table number');
      return;
    }

    setIsCreating(true);
    try {
      await tableApi.createTable(tableNumber);
      toast.success(`Table ${tableNumber} created successfully!`);
      setNewTableNumber('');
      setShowCreateModal(false);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to create table');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async (table: Table) => {
    if (!confirm(`Are you sure you want to delete Table ${table.tableNumber}?`)) {
      return;
    }

    try {
      await tableApi.deleteTable(table.id);
      toast.success(`Table ${table.tableNumber} deleted`);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to delete table');
    }
  };

  const handleToggleActive = async (table: Table) => {
    try {
      await tableApi.toggleActive(table.id);
      toast.success(`Table ${table.tableNumber} ${table.isActive ? 'deactivated' : 'activated'}`);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to toggle table status');
    }
  };

  const handleRegenerateQR = async (table: Table) => {
    try {
      await tableApi.regenerateQR(table.id);
      toast.success(`QR code regenerated for Table ${table.tableNumber}`);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to regenerate QR code');
    }
  };

  const handleDownloadQR = (table: Table, format: 'png' | 'svg') => {
    const url = format === 'png'
      ? tableApi.getQRPngUrl(table.id)
      : tableApi.getQRSvgUrl(table.id);

    const link = document.createElement('a');
    link.href = url;
    link.download = `table-${table.tableNumber}-qr.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkCreate = async () => {
    const start = parseInt(bulkStartNumber);
    const count = parseInt(bulkCount);

    if (!start || start < 1) {
      toast.error('Please enter a valid start number');
      return;
    }

    if (!count || count < 1 || count > 50) {
      toast.error('Count must be between 1 and 50');
      return;
    }

    setIsBulkCreating(true);
    try {
      const response = await tableApi.createBulkTables(start, count);
      const result = response.data.data;
      toast.success(`Created ${result.createdCount} tables${result.skippedCount > 0 ? `, skipped ${result.skippedCount} existing` : ''}`);
      setBulkStartNumber('');
      setBulkCount('');
      setShowBulkModal(false);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to create tables');
    } finally {
      setIsBulkCreating(false);
    }
  };

  const handleActivateAll = async () => {
    if (!confirm('Are you sure you want to activate ALL tables?')) return;

    setIsTogglingAll(true);
    try {
      const response = await tableApi.activateAll();
      toast.success(response.data.message);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to activate tables');
    } finally {
      setIsTogglingAll(false);
    }
  };

  const handleDeactivateAll = async () => {
    if (!confirm('Are you sure you want to deactivate ALL tables? Customers will not be able to scan QR codes.')) return;

    setIsTogglingAll(true);
    try {
      const response = await tableApi.deactivateAll();
      toast.success(response.data.message);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to deactivate tables');
    } finally {
      setIsTogglingAll(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL tables and their QR codes. This action cannot be undone. Are you absolutely sure?')) return;

    setIsDeletingAll(true);
    try {
      const response = await tableApi.deleteAll();
      toast.success(response.data.message);
      fetchTables();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to delete tables');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.tableNumber.toString().includes(searchTerm)
  );

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
          <p className="text-gray-600 mt-1">Manage tables and their QR codes</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Layers size={20} />
            Bulk Add
          </button>
          <button
            onClick={handleActivateAll}
            disabled={isTogglingAll || tables.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isTogglingAll ? <Loader2 size={20} className="animate-spin" /> : <ToggleRight size={20} />}
            Activate All
          </button>
          <button
            onClick={handleDeactivateAll}
            disabled={isTogglingAll || tables.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isTogglingAll ? <Loader2 size={20} className="animate-spin" /> : <ToggleLeft size={20} />}
            Deactivate All
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={isDeletingAll || tables.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50"
          >
            {isDeletingAll ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            Delete All
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add Table
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Total Tables</p>
          <p className="text-2xl font-bold text-gray-800">{tables.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {tables.filter(t => t.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {tables.filter(t => !t.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">With QR Codes</p>
          <p className="text-2xl font-bold text-amber-600">
            {tables.filter(t => t.hasQR).length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by table number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No tables found' : 'No tables yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first table to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Create Table
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Table Header */}
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">Table {table.tableNumber}</h3>
                  <div className="flex gap-1">
                    {table.isActive ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-amber-50">
                  {table.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>

              {/* QR Code Preview */}
              <div className="p-3">
                {table.qrCodeDataUrl ? (
                  <div className="relative group">
                    <img
                      src={table.qrCodeDataUrl}
                      alt={`QR Code for Table ${table.tableNumber}`}
                      className="w-full rounded-lg border-2 border-gray-200"
                    />
                    {/* Logo Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {cafeConfig.logoUrl && !cafeConfig.logoUrl.includes('/assets/') ? (
                        <img
                          src={cafeConfig.logoUrl}
                          alt={cafeConfig.cafeName || 'Cafe'}
                          className="w-8 h-8 rounded-full object-cover bg-white shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-600 text-sm font-bold">
                          {cafeConfig.cafeName ? cafeConfig.cafeName.charAt(0).toUpperCase() : 'C'}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTable(table);
                        setShowQRModal(true);
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                    >
                      <Eye className="w-8 h-8 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-3 border-t border-gray-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownloadQR(table, 'png')}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <Download size={16} />
                    PNG
                  </button>
                  <button
                    onClick={() => handleDownloadQR(table, 'svg')}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <Download size={16} />
                    SVG
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleToggleActive(table)}
                    className={`flex items-center justify-center p-2 rounded-lg transition-colors ${table.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    title={table.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {table.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                  </button>
                  <button
                    onClick={() => handleRegenerateQR(table)}
                    className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Regenerate QR"
                  >
                    <RotateCw size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table)}
                    className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Table</h2>
            <p className="text-gray-600 mb-6">
              Enter a table number to create a new table with its QR code
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="number"
                min="1"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="e.g., 1, 2, 3..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isCreating) {
                    handleCreateTable();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTableNumber('');
                }}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                disabled={isCreating}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Table'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk Add Tables</h2>
            <p className="text-gray-600 mb-6">
              Create multiple tables at once. Existing table numbers will be skipped.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={bulkStartNumber}
                  onChange={(e) => setBulkStartNumber(e.target.value)}
                  placeholder="e.g., 1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Tables
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="e.g., 10 (max 50)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 50 tables at once</p>
              </div>
              {bulkStartNumber && bulkCount && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    This will create tables <strong>{bulkStartNumber}</strong> to <strong>{parseInt(bulkStartNumber) + parseInt(bulkCount) - 1}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStartNumber('');
                  setBulkCount('');
                }}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isBulkCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCreate}
                disabled={isBulkCreating}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBulkCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Layers size={20} />
                    Create Tables
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Table {selectedTable.tableNumber} QR Code
                </h2>
                <p className="text-gray-600 mt-1">
                  Scan to access menu
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedTable(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6 flex justify-center">
              <div className="relative">
                <img
                  src={selectedTable.qrCodeDataUrl}
                  alt={`QR Code for Table ${selectedTable.tableNumber}`}
                  className="w-full max-w-sm mx-auto"
                />
                {/* Logo Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {cafeConfig.logoUrl && !cafeConfig.logoUrl.includes('/assets/') ? (
                    <img
                      src={cafeConfig.logoUrl}
                      alt={cafeConfig.cafeName || 'Cafe'}
                      className="w-14 h-14 rounded-full object-cover bg-white shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-amber-600 text-2xl font-bold">
                      {cafeConfig.cafeName ? cafeConfig.cafeName.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadQR(selectedTable, 'png')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Download size={20} />
                Download PNG
              </button>
              <button
                onClick={() => handleDownloadQR(selectedTable, 'svg')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Download size={20} />
                Download SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
