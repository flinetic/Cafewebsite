import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react';
import { calculateDistance } from '../utils/geo';
import { configApi } from '../services/api';

interface LocationGuardProps {
    children: React.ReactNode;
}

type LocationStatus = 'loading' | 'requesting' | 'granted' | 'denied' | 'out_of_range' | 'error';

const LocationGuard: React.FC<LocationGuardProps> = ({ children }) => {
    const [status, setStatus] = useState<LocationStatus>('loading');
    const [cafeLocation, setCafeLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [cafeName, setCafeName] = useState<string>('Cafe');

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
                        radius: data.allowedRadiusMeters || 50 // Default 50m if not set
                    });
                    setCafeName(data.cafeName || 'Cafe');
                    setStatus('requesting');
                } else {
                    // If location not configured in backend, allow access by default (or block depending on requirement)
                    // For safety, let's allow access if config is missing to avoid blocking everyone
                    console.warn('Cafe location not configured, bypassing location check');
                    setStatus('granted');
                }
            } catch (error) {
                console.error('Failed to fetch config', error);
                setErrorMessage('Failed to load cafe configuration');
                setStatus('error');
            }
        };

        fetchConfig();
    }, []);

    // Check location when cafe config is loaded
    useEffect(() => {
        if (status === 'requesting' && cafeLocation) {
            checkLocation();

            // Re-check every 5 minutes (300,000 ms)
            const intervalId = setInterval(checkLocation, 300000);
            return () => clearInterval(intervalId);
        }
    }, [status, cafeLocation]);

    const checkLocation = () => {
        if (!navigator.geolocation) {
            setStatus('error');
            setErrorMessage('Geolocation is not supported by your browser');
            return;
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
                    calculatedDistance: dist,
                    allowedRadius: cafeLocation.radius,
                    isWithinRange: dist <= cafeLocation.radius
                });

                setDistance(dist);

                if (dist <= cafeLocation.radius) {
                    setStatus('granted');
                } else {
                    setStatus('out_of_range');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                if (error.code === error.PERMISSION_DENIED) {
                    setStatus('denied');
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

    if (status === 'loading' || status === 'requesting') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">Verifying Location...</h2>
                <p className="text-gray-600 mt-2 text-center max-w-sm">
                    Please allow location access to verify you are at {cafeName}.
                </p>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Navigation className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Access Required</h2>
                <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    We need to verify that you are physically present at the cafe to show the menu. Please enable location permissions for this site.
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

    if (status === 'out_of_range') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">You are too far away</h2>
                <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                    This menu is only accessible when you are inside {cafeName}.
                </p>
                {distance && (
                    <p className="text-sm text-gray-500 mb-8 bg-white px-4 py-2 rounded-full inline-block shadow-sm">
                        Distance: {Math.round(distance)} meters (Allowed: {cafeLocation?.radius}m)
                    </p>
                )}
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm max-w-sm mx-auto mb-6">
                    <p className="font-semibold mb-1">Visit us at:</p>
                    <p>123 Main Street, City</p>
                </div>
                <button
                    onClick={checkLocation}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                    Re-check Location
                </button>
            </div>
        );
    }

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

    return <>{children}</>;
};

export default LocationGuard;
