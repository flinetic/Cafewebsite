import React, { useState, useEffect } from 'react';
import {
    Plus,
    Loader2,
    X,
    Save,
    Tag,
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    Calendar,
    IndianRupee,
    Clock
} from 'lucide-react';
import { offerApi, type OfferData } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface Offer {
    id: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat' | 'bogo';
    discountValue: number;
    minimumOrder: number;
    maxDiscount: number | null;
    code: string | null;
    image: string | null;
    validFrom: string;
    validTo: string;
    isActive: boolean;
    usageLimit: number | null;
    usedCount: number;
    isValid: boolean;
    isUpcoming: boolean;
    isExpired: boolean;
    createdAt: string;
}

interface ErrorResponse {
    message: string;
}

const OffersManager: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<OfferData>({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrder: 0,
        maxDiscount: undefined,
        code: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        usageLimit: undefined
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await offerApi.getAllOffers();
            setOffers(response.data.data);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Failed to fetch offers');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            discountType: 'percentage',
            discountValue: 10,
            minimumOrder: 0,
            maxDiscount: undefined,
            code: '',
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true,
            usageLimit: undefined
        });
        setEditingOffer(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (offer: Offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            minimumOrder: offer.minimumOrder,
            maxDiscount: offer.maxDiscount || undefined,
            code: offer.code || '',
            validFrom: offer.validFrom.split('T')[0],
            validTo: offer.validTo.split('T')[0],
            isActive: offer.isActive,
            usageLimit: offer.usageLimit || undefined
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Offer title is required');
            return;
        }
        if (formData.discountValue <= 0) {
            toast.error('Discount value must be greater than 0');
            return;
        }

        setIsSaving(true);
        try {
            if (editingOffer) {
                await offerApi.updateOffer(editingOffer.id, formData);
                toast.success('Offer updated successfully');
            } else {
                await offerApi.createOffer(formData);
                toast.success('Offer created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchOffers();
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Operation failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (offer: Offer) => {
        if (!confirm(`Are you sure you want to delete "${offer.title}"?`)) {
            return;
        }

        try {
            await offerApi.deleteOffer(offer.id);
            toast.success('Offer deleted successfully');
            fetchOffers();
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Failed to delete offer');
        }
    };

    const handleToggleStatus = async (offer: Offer) => {
        try {
            await offerApi.toggleOfferStatus(offer.id);
            toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'}`);
            fetchOffers();
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            toast.error(axiosError.response?.data?.message || 'Failed to toggle status');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDiscountLabel = (offer: Offer) => {
        switch (offer.discountType) {
            case 'percentage':
                return `${offer.discountValue}% OFF`;
            case 'flat':
                return `₹${offer.discountValue} OFF`;
            case 'bogo':
                return 'Buy 1 Get 1';
            default:
                return offer.discountValue.toString();
        }
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Offers Manager</h1>
                    <p className="text-gray-600 mt-1">Create and manage promotional offers</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto bg-caramel text-white rounded-lg hover:bg-mocha transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Offer
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Total Offers</p>
                    <p className="text-2xl font-bold text-gray-800">{offers.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                        {offers.filter(o => o.isActive && o.isValid).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {offers.filter(o => o.isUpcoming).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">Expired/Inactive</p>
                    <p className="text-2xl font-bold text-red-600">
                        {offers.filter(o => o.isExpired || !o.isActive).length}
                    </p>
                </div>
            </div>

            {/* Offers List */}
            {offers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No offers yet</h3>
                    <p className="text-gray-600 mb-6">Create your first promotional offer to attract customers</p>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors"
                    >
                        Create Offer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map(offer => (
                        <div
                            key={offer.id}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden border ${offer.isActive && offer.isValid
                                    ? 'border-green-200'
                                    : offer.isUpcoming
                                        ? 'border-blue-200'
                                        : 'border-gray-200 opacity-70'
                                }`}
                        >
                            {/* Header */}
                            <div className="bg-caramel p-4 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold">{getDiscountLabel(offer)}</span>
                                    {offer.code && (
                                        <span className="bg-white/20 px-2 py-1 rounded text-sm font-mono">
                                            {offer.code}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg">{offer.title}</h3>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {offer.description && (
                                    <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar size={14} />
                                        <span>{formatDate(offer.validFrom)} - {formatDate(offer.validTo)}</span>
                                    </div>
                                    {offer.minimumOrder > 0 && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <IndianRupee size={14} />
                                            <span>Min order: ₹{offer.minimumOrder}</span>
                                        </div>
                                    )}
                                    {offer.usageLimit && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Tag size={14} />
                                            <span>Usage: {offer.usedCount}/{offer.usageLimit}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className="mt-4">
                                    {offer.isActive && offer.isValid ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            Active
                                        </span>
                                    ) : offer.isUpcoming ? (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
                                            <Clock size={12} />
                                            Upcoming - Starts {formatDate(offer.validFrom)}
                                        </span>
                                    ) : !offer.isActive ? (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                            Inactive
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                            Expired
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleToggleStatus(offer)}
                                        className={`p-2 rounded-lg transition-colors ${offer.isActive
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                        title={offer.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {offer.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(offer)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingOffer ? 'Edit Offer' : 'Create Offer'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Offer Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Weekend Special"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the offer..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Discount Type and Value */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount Type
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as OfferData['discountType'] })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat (₹)</option>
                                        <option value="bogo">Buy 1 Get 1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Code and Min Order */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Promo Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g., SAVE20"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Min Order (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minimumOrder}
                                        onChange={(e) => setFormData({ ...formData, minimumOrder: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Validity Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valid From
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Valid To <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validTo}
                                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-caramel"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Active (visible to customers)
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-3 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            {editingOffer ? 'Update Offer' : 'Create Offer'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersManager;
