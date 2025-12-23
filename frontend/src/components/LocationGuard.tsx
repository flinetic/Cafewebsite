import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, Loader2, LocateFixed } from 'lucide-react';
import { calculateDistance } from '../utils/geo';
import { configApi } from '../services/api';

interface LocationGuardProps {
    children: React.ReactNode;
}

type LocationStatus =
    | 'loading'           // Loading cafe config
    | 'not_configured'    // Cafe location not set in backend
    | 'prompt'            // Show "Share Location" button
    | 'checking'          // Currently checking user location
    | 'granted'           // User is within radius
    | 'denied'            // User denied location permission
    | 'out_of_range'      // User is outside radius
    | 'error';            // General error

interface CafeLocation {
    lat: number;
    lng: number;
    radius: number;
    address?: string;
}

const LocationGuard: React.FC<LocationGuardProps> = ({ children }) => {
    const [status, setStatus] = useState<LocationStatus>('loading');
    const [cafeLocation, setCafeLocation] = useState<CafeLocation | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [cafeName, setCafeName] = useState<string>('Cafe');
    const intervalRef = useRef<number | null>(null);

    // Fetch cafe config on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await configApi.getPublicConfig();
                const data = response.data.data;

                if (data.location?.latitude && data.location?.longitude) {
                    setCafeLocation({
                        lat: data.location.latitude,
                        lng: data.location.longitude,
                        radius: data.allowedRadiusMeters || 50,
                        address: data.location.address || ''
                    });
                    setCafeName(data.cafeName || 'Cafe');
                    // Show the "Share Location" prompt instead of auto-checking
                    setStatus('prompt');
                } else {
                    // If location not configured in backend, block access
                    console.warn('Cafe location not configured - blocking access');
                    setStatus('not_configured');
                }
            } catch (error) {
                console.error('Failed to fetch config', error);
                setErrorMessage('Failed to load cafe configuration');
                setStatus('error');
            }
        };

        fetchConfig();

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Start the 5-minute re-check interval when granted
    useEffect(() => {
        if (status === 'granted' && cafeLocation) {
            // Re-check every 5 minutes (300,000 ms)
            intervalRef.current = setInterval(() => {
                console.log('Re-checking location (5-minute interval)...');
                checkLocation(true); // silent re-check
            }, 300000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [status, cafeLocation]);

    const checkLocation = (isSilentRecheck = false) => {
        if (!navigator.geolocation) {
            setStatus('error');
            setErrorMessage('Geolocation is not supported by your browser');
            return;
        }

        if (!isSilentRecheck) {
            setStatus('checking');
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (!cafeLocation) return;

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const dist = calculateDistance(
                    userLat,
                    userLng,
                    cafeLocation.lat,
                    cafeLocation.lng
                );

                // Debug logging to verify distance calculations
                console.log('Location check:', {
                    userLat,
                    userLng,
                    cafeLat: cafeLocation.lat,
                    cafeLng: cafeLocation.lng,
                    calculatedDistance: Math.round(dist),
                    allowedRadius: cafeLocation.radius,
                    isWithinRange: dist <= cafeLocation.radius
                });

                setDistance(dist);

                if (dist <= cafeLocation.radius) {
                    setStatus('granted');
                } else {
                    setStatus('out_of_range');
                    // Stop the interval if user moved out of range
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    setStatus('denied');
                } else if (error.code === error.TIMEOUT) {
                    setStatus('error');
                    setErrorMessage('Location request timed out. Please ensure GPS is enabled and try again.');
                } else {
                    setStatus('error');
                    setErrorMessage('Failed to get your location. Please ensure GPS is enabled.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );
    };

    // Handler for "Share Location" button
    const handleShareLocation = () => {
        checkLocation();
    };

    // Loading state
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
                <p className="text-gray-600 mt-2 text-center max-w-sm">
                    Please wait while we load the cafe information.
                </p>
            </div>
        );
    }

    // Cafe location not configured
    if (status === 'not_configured') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Menu Not Available</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    The cafe menu is currently not available. Please visit the cafe directly or contact them for assistance.
                </p>
            </div>
        );
    }

    // Prompt user to share location
    if (status === 'prompt') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <MapPin className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {cafeName}!</h2>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    To view our menu, please share your location so we can verify you're at the cafe.
                </p>
                <button
                    onClick={handleShareLocation}
                    className="px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-semibold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <LocateFixed size={24} />
                    Share My Location
                </button>
                <p className="text-gray-400 text-sm mt-4 max-w-xs">
                    Your location is only used to verify you're at the cafe and is not stored.
                </p>
            </div>
        );
    }

    // Checking location
    if (status === 'checking') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Verifying Location...</h2>
                <p className="text-gray-600 mt-2 text-center max-w-sm">
                    Please wait while we verify you are at {cafeName}.
                </p>
            </div>
        );
    }

    // Location permission denied
    if (status === 'denied') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Navigation className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Access Required</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    We need to verify that you are physically present at {cafeName} to show the menu. Please enable location permissions for this site in your browser settings.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // User is out of range
    if (status === 'out_of_range') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Visit Us at the Cafe</h2>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    You appear to be outside {cafeName}. Our digital menu is only accessible when you're at the cafe.
                </p>
                {distance && (
                    <p className="text-sm text-gray-500 mb-6 bg-white px-4 py-2 rounded-full inline-block shadow-sm">
                        You are {Math.round(distance)} meters away (must be within {cafeLocation?.radius}m)
                    </p>
                )}
                {cafeLocation?.address && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm max-w-sm mx-auto mb-6">
                        <p className="font-semibold mb-1">📍 Find us at:</p>
                        <p>{cafeLocation.address}</p>
                    </div>
                )}
                <button
                    onClick={() => checkLocation()}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
                >
                    <LocateFixed size={18} />
                    Re-check My Location
                </button>
            </div>
        );
    }

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Error</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    {errorMessage || 'Something went wrong while checking your location.'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Granted - show children (menu)
    return <>{children}</>;
};

export default LocationGuard;
