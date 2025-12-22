import React, { useState, useEffect, useRef } from 'react';
import {
    Settings as SettingsIcon,
    MapPin,
    Radius,
    Save,
    Loader2,
    Check,
    AlertCircle,
    Navigation,
    Users,
    UserCheck,
    UserX,
    Shield,
    ChefHat,
    Camera,
    User
} from 'lucide-react';
import { configApi, staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface PendingUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    createdAt: string;
}

// Generate initials-based avatar color
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-amber-500',
        'bg-purple-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

const Settings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const isAdmin = user?.role === 'admin';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form state
    const [cafeName, setCafeName] = useState('');
    const [tagline, setTagline] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [radius, setRadius] = useState('');
    const [menuBaseUrl, setMenuBaseUrl] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [maxAdminLimit, setMaxAdminLimit] = useState('1');

    // Pending users state
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [processingUser, setProcessingUser] = useState<string | null>(null);

    // Active tab for settings
    const [activeTab, setActiveTab] = useState<'profile' | 'cafe' | 'users'>('profile');

    useEffect(() => {
        if (isAdmin) {
            fetchConfig();
            fetchPendingUsers();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchConfig = async () => {
        try {
            const response = await configApi.getConfig();
            const data = response.data.data;
            setCafeName(data.cafeName || '');
            setTagline(data.tagline || '');
            setLatitude(data.location?.latitude?.toString() || '');
            setLongitude(data.location?.longitude?.toString() || '');
            setAddress(data.location?.address || '');
            setRadius(data.allowedRadiusMeters?.toString() || '50');
            setMenuBaseUrl(data.menuBaseUrl || '');
            setContactPhone(data.contactPhone || '');
            setContactEmail(data.contactEmail || '');
            setMaxAdminLimit(data.maxAdminLimit?.toString() || '1');
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingUsers = async () => {
        setLoadingPending(true);
        try {
            const response = await staffApi.getPendingRegistrations();
            setPendingUsers(response.data.data.pending || []);
        } catch (error) {
            console.error('Failed to load pending users:', error);
        } finally {
            setLoadingPending(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await configApi.updateConfig({
                cafeName,
                tagline,
                menuBaseUrl,
                contactPhone,
                contactEmail
            });
            toast.success('Profile settings saved!');
        } catch (error) {
            toast.error('Failed to save profile settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveLocation = async () => {
        setSaving(true);
        try {
            await configApi.updateLocation(
                parseFloat(latitude),
                parseFloat(longitude),
                address
            );
            toast.success('Location settings saved!');
        } catch (error) {
            toast.error('Failed to save location settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRadius = async () => {
        const radiusNum = parseInt(radius);
        if (radiusNum < 10 || radiusNum > 5000) {
            toast.error('Radius must be between 10 and 5000 meters');
            return;
        }
        setSaving(true);
        try {
            await configApi.updateRadius(radiusNum);
            toast.success('Radius updated successfully!');
        } catch (error) {
            toast.error('Failed to update radius');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAdminLimit = async () => {
        const limitNum = parseInt(maxAdminLimit);
        if (limitNum < 1 || limitNum > 10) {
            toast.error('Admin limit must be between 1 and 10');
            return;
        }
        setSaving(true);
        try {
            await configApi.updateAdminLimit(limitNum);
            toast.success('Admin limit updated successfully!');
        } catch (error) {
            toast.error('Failed to update admin limit');
        } finally {
            setSaving(false);
        }
    };

    const handleFetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toString());
                setLongitude(position.coords.longitude.toString());
                setFetchingLocation(false);
                toast.success('Location fetched successfully!');
            },
            (error) => {
                setFetchingLocation(false);
                toast.error('Failed to get location: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleApproveUser = async (userId: string, role: 'admin' | 'kitchen') => {
        setProcessingUser(userId);
        try {
            await staffApi.approveRegistration(userId, role);
            toast.success(`User approved as ${role}!`);
            setPendingUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve user');
        } finally {
            setProcessingUser(null);
        }
    };

    const handleRejectUser = async (userId: string) => {
        setProcessingUser(userId);
        try {
            await staffApi.rejectRegistration(userId);
            toast.success('Registration rejected');
            setPendingUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error) {
            toast.error('Failed to reject user');
        } finally {
            setProcessingUser(null);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploadingImage(true);
        try {
            const response = await staffApi.uploadProfileImage(file);
            const newProfileImage = response.data.data.profileImage;

            // Update user in context
            if (user) {
                updateUser({ ...user, profileImage: newProfileImage });
            }

            toast.success('Profile image updated!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName?.charAt(0).toUpperCase() || '';
        const last = lastName?.charAt(0).toUpperCase() || '';
        return first + last || 'U';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    // Profile Avatar Component
    const ProfileAvatar = () => (
        <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
                {user?.profileImage && !user.profileImage.includes('ui-avatars.com') ? (
                    <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                    />
                ) : (
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-amber-100 ${getAvatarColor(user?.firstName || 'U')}`}>
                        {getInitials(user?.firstName, user?.lastName)}
                    </div>
                )}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors shadow-lg disabled:opacity-50"
                >
                    {uploadingImage ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Camera size={16} />
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h3>
                <p className="text-gray-500">{user?.email}</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 mt-2 rounded-full text-sm font-medium ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                    {isAdmin ? <Shield size={14} /> : <ChefHat size={14} />}
                    {isAdmin ? 'Administrator' : 'Kitchen Staff'}
                </span>
            </div>
        </div>
    );

    // Kitchen user view - simplified settings
    if (!isAdmin) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <SettingsIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-500">Manage your profile</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-amber-600" />
                        Your Profile
                    </h2>

                    <ProfileAvatar />

                    <p className="text-sm text-gray-500 mt-4">
                        <Camera size={14} className="inline mr-1" />
                        Click the camera icon to upload a new profile picture
                    </p>
                </div>
            </div>
        );
    }

    // Admin view - full settings
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <SettingsIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500">Manage your cafe profile, location, and users</p>
                </div>
            </div>

            {/* Profile Avatar for Admin */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <ProfileAvatar />
                <p className="text-sm text-gray-500">
                    <Camera size={14} className="inline mr-1" />
                    Click the camera icon to upload a new profile picture
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile'
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Cafe Profile
                </button>
                <button
                    onClick={() => setActiveTab('cafe')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'cafe'
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Location & Access
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users'
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    User Management
                    {pendingUsers.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {pendingUsers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <SettingsIcon size={20} className="text-amber-600" />
                        Cafe Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cafe Name
                            </label>
                            <input
                                type="text"
                                value={cafeName}
                                onChange={(e) => setCafeName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="BookAVibe Cafe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tagline
                            </label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="Where Every Sip Tells a Story"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                placeholder="contact@bookavibe.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Menu Base URL
                            </label>
                            <input
                                type="url"
                                value={menuBaseUrl}
                                onChange={(e) => setMenuBaseUrl(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
                                placeholder="http://192.168.0.107:5173"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This URL is used for QR code generation. Update this to your network IP for mobile access.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Profile
                    </button>
                </div>
            )}

            {activeTab === 'cafe' && (
                <>
                    {/* Location Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-amber-600" />
                            Location Settings
                        </h2>
                        <p className="text-sm text-gray-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                            <AlertCircle size={16} className="inline mr-2 text-amber-600" />
                            Set your cafe's coordinates to verify customers are within range when scanning QR codes.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="28.6139"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="77.2090"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="123 Main Street, City"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleFetchCurrentLocation}
                                disabled={fetchingLocation}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {fetchingLocation ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Navigation size={18} />
                                )}
                                Get Current Location
                            </button>
                            <button
                                onClick={handleSaveLocation}
                                disabled={saving}
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Location
                            </button>
                        </div>
                    </div>

                    {/* Radius Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Radius size={20} className="text-amber-600" />
                            Access Radius
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Customers must be within this radius (in meters) to view the menu via QR code.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 max-w-xs">
                                <input
                                    type="range"
                                    min="10"
                                    max="500"
                                    value={radius}
                                    onChange={(e) => setRadius(e.target.value)}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>10m</span>
                                    <span>250m</span>
                                    <span>500m</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="10"
                                    max="5000"
                                    value={radius}
                                    onChange={(e) => setRadius(e.target.value)}
                                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <span className="text-gray-600 font-medium">meters</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveRadius}
                            disabled={saving}
                            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            Update Radius
                        </button>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <>
                    {/* Admin Limit Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-amber-600" />
                            Admin Settings
                        </h2>
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Admin Accounts
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={maxAdminLimit}
                                        onChange={(e) => setMaxAdminLimit(e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSaveAdminLimit}
                                        disabled={saving}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        Save
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Limit the number of admin accounts that can be created (1-10)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Registrations */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-amber-600" />
                                Pending Registrations
                            </h2>
                            <button
                                onClick={fetchPendingUsers}
                                disabled={loadingPending}
                                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                            >
                                {loadingPending ? <Loader2 size={14} className="animate-spin" /> : null}
                                Refresh
                            </button>
                        </div>

                        {loadingPending ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                            </div>
                        ) : pendingUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No pending registrations</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingUsers.map((pendingUser) => (
                                    <div
                                        key={pendingUser._id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getAvatarColor(pendingUser.firstName)}`}>
                                                {pendingUser.firstName.charAt(0)}{pendingUser.lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {pendingUser.firstName} {pendingUser.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500">{pendingUser.email}</p>
                                                {pendingUser.phone && (
                                                    <p className="text-sm text-gray-400">{pendingUser.phone}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Registered: {new Date(pendingUser.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApproveUser(pendingUser._id, 'kitchen')}
                                                disabled={processingUser === pendingUser._id}
                                                className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                                                title="Approve as Kitchen Staff"
                                            >
                                                {processingUser === pendingUser._id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <ChefHat size={16} />
                                                )}
                                                <span className="hidden sm:inline">Kitchen</span>
                                            </button>
                                            <button
                                                onClick={() => handleApproveUser(pendingUser._id, 'admin')}
                                                disabled={processingUser === pendingUser._id}
                                                className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                title="Approve as Admin"
                                            >
                                                {processingUser === pendingUser._id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <UserCheck size={16} />
                                                )}
                                                <span className="hidden sm:inline">Admin</span>
                                            </button>
                                            <button
                                                onClick={() => handleRejectUser(pendingUser._id)}
                                                disabled={processingUser === pendingUser._id}
                                                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                title="Reject Registration"
                                            >
                                                {processingUser === pendingUser._id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <UserX size={16} />
                                                )}
                                                <span className="hidden sm:inline">Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Settings;
