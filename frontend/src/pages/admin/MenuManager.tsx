import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save,
  Coffee,
  Leaf,
  Flame,
  Clock,
  Upload,
  ImageIcon,
  FileJson,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { menuApi, type MenuItemData } from '../../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  preparationTime: number;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  message: string;
}

const CATEGORIES = [
  { value: 'appetizers', label: 'Appetizers', icon: '🥗' },
  { value: 'main-course', label: 'Main Course', icon: '🍽️' },
  { value: 'desserts', label: 'Desserts', icon: '🍰' },
  { value: 'beverages', label: 'Beverages', icon: '☕' },
  { value: 'snacks', label: 'Snacks', icon: '🍿' },
  { value: 'specials', label: 'Specials', icon: '⭐' },
];

const getCategoryLabel = (value: string) => {
  return CATEGORIES.find(c => c.value === value)?.label || value;
};

const getCategoryIcon = (value: string) => {
  return CATEGORIES.find(c => c.value === value)?.icon || '🍴';
};

const MenuManager: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk import state
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportData, setBulkImportData] = useState<MenuItemData[]>([]);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<MenuItemData>({
    name: '',
    description: '',
    price: 0,
    category: 'main-course',
    image: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    preparationTime: 15,
    tags: [],
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await menuApi.getAllItems();
      setItems(response.data.data);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'main-course',
      image: '',
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isSpicy: false,
      preparationTime: 15,
      tags: [],
    });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image || null;

    setIsUploading(true);
    try {
      const response = await menuApi.uploadImage(imageFile);
      return response.data.data.url;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || '',
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isSpicy: item.isSpicy,
      preparationTime: item.preparationTime,
      tags: item.tags,
    });
    // Set image preview if item has an image
    setImagePreview(item.image || null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    setIsSaving(true);
    try {
      // Upload image first if a new file was selected
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else if (imageFile) {
          // Image upload failed but user selected a file
          setIsSaving(false);
          return;
        }
      }

      const submitData = { ...formData, image: imageUrl };

      if (editingItem) {
        await menuApi.updateItem(editingItem.id, submitData);
        toast.success('Item updated successfully');
      } else {
        await menuApi.createItem(submitData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      await menuApi.deleteItem(item.id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuApi.toggleAvailability(item.id);
      toast.success(`"${item.name}" ${item.isAvailable ? 'hidden from menu' : 'visible on menu'}`);
      fetchItems();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to toggle availability');
    }
  };

  // Bulk import handlers
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setBulkImportError(null);
    setBulkImportData([]);

    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setBulkImportError('Please select a valid JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!Array.isArray(parsed)) {
          setBulkImportError('JSON must be an array of menu items');
          return;
        }

        // Validate items
        const invalidItems = parsed.filter((item: any) => !item.name || item.price === undefined);
        if (invalidItems.length > 0) {
          setBulkImportError(`${invalidItems.length} item(s) missing required fields (name, price)`);
          return;
        }

        setBulkImportData(parsed);
      } catch (err) {
        setBulkImportError('Invalid JSON format. Please check your file.');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (bulkImportData.length === 0) {
      toast.error('No items to import');
      return;
    }

    setIsBulkImporting(true);
    try {
      const response = await menuApi.bulkImport(bulkImportData);
      toast.success(response.data.message || `Successfully imported ${bulkImportData.length} items`);
      setShowBulkImportModal(false);
      setBulkImportData([]);
      setBulkImportError(null);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = '';
      }
      fetchItems();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Failed to import items');
    } finally {
      setIsBulkImporting(false);
    }
  };

  const closeBulkImportModal = () => {
    setShowBulkImportModal(false);
    setBulkImportData([]);
    setBulkImportError(null);
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
          <h1 className="text-2xl font-bold text-gray-800">Menu Manager</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-caramel border-2 border-caramel rounded-lg hover:bg-caramel/10 transition-colors shadow-sm"
          >
            <FileJson size={20} />
            Bulk Import
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{items.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Available</p>
          <p className="text-2xl font-bold text-green-600">
            {items.filter(i => i.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Hidden</p>
          <p className="text-2xl font-bold text-red-600">
            {items.filter(i => !i.isAvailable).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 mb-1">Categories</p>
          <p className="text-2xl font-bold text-primary-600">
            {new Set(items.map(i => i.category)).size}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${filterCategory === 'all'
                ? 'bg-caramel text-white'
                : 'bg-latte text-dark-roast hover:bg-mocha/20 border border-milk-foam'
                }`}
            >
              🍴 All Menu
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${filterCategory === cat.value
                  ? 'bg-caramel text-white'
                  : 'bg-latte text-dark-roast hover:bg-mocha/20 border border-milk-foam'
                  }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm || filterCategory !== 'all' ? 'No items found' : 'No menu items yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== 'all'
              ? 'Try a different search or filter'
              : 'Create your first menu item to get started'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors"
            >
              Create Menu Item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-mocha/40 to-caramel/30 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>{getCategoryIcon(category)}</span>
                  {getCategoryLabel(category)}
                  <span className="text-sm font-normal bg-white/20 px-2 py-0.5 rounded-full ml-2">
                    {categoryItems.length} items
                  </span>
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'opacity-60' : ''
                      }`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg bg-mocha/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        {item.isVegetarian && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <Leaf size={12} /> Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Vegan
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                            <Flame size={12} /> Spicy
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.description || 'No description'}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {item.preparationTime} min
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">₹{item.price}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`p-2 rounded-lg transition-colors ${item.isAvailable
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        title={item.isAvailable ? 'Hide from menu' : 'Show on menu'}
                      >
                        {item.isAvailable ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
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
              {/* Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Margherita Pizza"
                    className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the item..."
                  rows={3}
                  className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Price and Prep Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Image
                </label>
                <div className="flex items-start gap-4">
                  {/* Image Preview */}
                  <div className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG, or WebP • Max 5MB
                    </p>
                    {imageFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {imageFile.name} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Dietary Information
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-caramel"
                    />
                    <span className="flex items-center gap-1 text-sm">
                      <Leaf size={16} className="text-green-600" /> Vegetarian
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-caramel"
                    />
                    <span className="text-sm">🌱 Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSpicy}
                      onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-caramel"
                    />
                    <span className="flex items-center gap-1 text-sm">
                      <Flame size={16} className="text-red-600" /> Spicy
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-caramel"
                    />
                    <span className="flex items-center gap-1 text-sm">
                      <Eye size={16} className="text-gray-600" /> Available
                    </span>
                  </label>
                </div>
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
                      {editingItem ? 'Update Item' : 'Create Item'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileJson className="text-caramel" />
                Bulk Import Menu Items
              </h2>
              <button
                onClick={closeBulkImportModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select JSON File
                </label>
                <input
                  type="file"
                  ref={bulkFileInputRef}
                  onChange={handleBulkFileChange}
                  accept=".json"
                  className="w-full px-4 py-3 border border-milk-foam rounded-lg focus:ring-2 focus:ring-caramel focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-caramel file:text-white file:cursor-pointer hover:file:bg-mocha"
                />
              </div>

              {/* Error Message */}
              {bulkImportError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={20} />
                  <span>{bulkImportError}</span>
                </div>
              )}

              {/* Preview */}
              {bulkImportData.length > 0 && (
                <div className="border border-green-200 rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-2 flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle size={18} />
                    {bulkImportData.length} item(s) ready to import
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">#</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Price</th>
                          <th className="text-center px-4 py-2 font-medium text-gray-600">Tags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkImportData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                            <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                            <td className="px-4 py-2 text-gray-600">{getCategoryLabel(item.category || 'main-course')}</td>
                            <td className="px-4 py-2 text-right text-gray-800">₹{item.price}</td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex justify-center gap-1">
                                {item.isVegetarian && <Leaf size={14} className="text-green-600" />}
                                {item.isSpicy && <Flame size={14} className="text-red-600" />}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sample JSON Format */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Sample JSON Format</h4>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto">
                  {`[
  {
    "name": "Margherita Pizza",
    "description": "Classic cheese pizza with fresh basil",
    "price": 299,
    "category": "main-course",
    "isVegetarian": true,
    "isSpicy": false,
    "preparationTime": 20
  },
  {
    "name": "Espresso",
    "description": "Strong Italian coffee",
    "price": 99,
    "category": "beverages",
    "isVegetarian": true,
    "preparationTime": 5
  }
]`}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Required fields:</strong> name, price<br />
                  <strong>Optional fields:</strong> description, category (appetizers, main-course, desserts, beverages, snacks, specials), isVegetarian, isVegan, isSpicy, preparationTime, image, tags
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeBulkImportModal}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isBulkImporting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={isBulkImporting || bulkImportData.length === 0}
                className="flex-1 px-4 py-3 bg-caramel text-white rounded-lg hover:bg-mocha transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isBulkImporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import {bulkImportData.length > 0 ? `${bulkImportData.length} Items` : 'Items'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
