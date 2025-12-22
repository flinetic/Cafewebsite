const CafeConfig = require('../models/CafeConfig');

/**
 * Location Validation Service
 * Uses Haversine formula to calculate distance between two coordinates
 */
class LocationService {
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {number} lat1 - Latitude of point 1
     * @param {number} lon1 - Longitude of point 1
     * @param {number} lat2 - Latitude of point 2
     * @param {number} lon2 - Longitude of point 2
     * @returns {number} Distance in meters
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance); // Return distance in meters
    }

    /**
     * Convert degrees to radians
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Validate if user is within allowed radius of café
     * @param {number} userLat - User's latitude
     * @param {number} userLon - User's longitude
     * @returns {Object} Validation result with distance
     */
    async validateLocation(userLat, userLon) {
        // Get café configuration
        const config = await CafeConfig.getConfig();

        const cafeLat = config.location.latitude;
        const cafeLon = config.location.longitude;
        const allowedRadius = config.allowedRadiusMeters;

        // Calculate distance
        const distance = this.calculateDistance(userLat, userLon, cafeLat, cafeLon);

        // Check if within radius
        const isWithinRadius = distance <= allowedRadius;

        return {
            isValid: isWithinRadius,
            distance: distance,
            allowedRadius: allowedRadius,
            message: isWithinRadius
                ? 'Location verified successfully'
                : `You are ${distance}m away from the café. Please come within ${allowedRadius}m to view the menu.`,
            cafeLocation: {
                latitude: cafeLat,
                longitude: cafeLon
            }
        };
    }

    /**
     * Check if coordinates are valid
     */
    isValidCoordinates(lat, lon) {
        return (
            typeof lat === 'number' &&
            typeof lon === 'number' &&
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180
        );
    }

    /**
     * Get café location info
     */
    async getCafeLocation() {
        const config = await CafeConfig.getConfig();
        return {
            latitude: config.location.latitude,
            longitude: config.location.longitude,
            address: config.location.address,
            allowedRadius: config.allowedRadiusMeters
        };
    }
}

module.exports = new LocationService();
