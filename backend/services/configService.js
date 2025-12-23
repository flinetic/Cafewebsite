const CafeConfig = require('../models/CafeConfig');

/**
 * Café Configuration Service
 */
class ConfigService {
    /**
     * Get café configuration
     */
    async getConfig() {
        return CafeConfig.getConfig();
    }

    /**
     * Update café configuration
     */
    async updateConfig(updateData) {
        let config = await CafeConfig.findOne();

        if (!config) {
            config = await CafeConfig.create(updateData);
        } else {
            Object.assign(config, updateData);
            await config.save();
        }

        return config;
    }

    /**
     * Update location settings
     */
    async updateLocation(latitude, longitude, address = '') {
        const config = await CafeConfig.getConfig();

        config.location = {
            latitude,
            longitude,
            address
        };

        await config.save();
        return config;
    }

    /**
     * Update allowed radius
     */
    async updateRadius(radiusMeters) {
        const config = await CafeConfig.getConfig();
        config.allowedRadiusMeters = radiusMeters;
        await config.save();
        return config;
    }

    /**
     * Update theme settings
     */
    async updateTheme(themeData) {
        const config = await CafeConfig.getConfig();
        config.theme = { ...config.theme, ...themeData };
        await config.save();
        return config;
    }

    /**
     * Update operating hours
     */
    async updateOperatingHours(hoursData) {
        const config = await CafeConfig.getConfig();
        config.operatingHours = { ...config.operatingHours, ...hoursData };
        await config.save();
        return config;
    }

    /**
     * Get public config (safe for frontend)
     */
    async getPublicConfig() {
        const config = await CafeConfig.getConfig();
        return {
            cafeName: config.cafeName,
            tagline: config.tagline,
            logoUrl: config.logoUrl,
            currency: config.currency,
            theme: config.theme,
            operatingHours: config.operatingHours,
            socialLinks: config.socialLinks,
            location: config.location,
            allowedRadiusMeters: config.allowedRadiusMeters
        };
    }
}

module.exports = new ConfigService();
