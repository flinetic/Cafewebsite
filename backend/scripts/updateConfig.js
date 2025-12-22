/**
 * Update Cafe Configuration Script
 * Updates the database config with values from .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const CafeConfig = require('../models/CafeConfig');
const Table = require('../models/Table');
const qrService = require('../services/qrService');

const updateConfig = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const menuBaseUrl = process.env.MENU_BASE_URL || 'http://localhost:5173';
        console.log(`Updating MENU_BASE_URL to: ${menuBaseUrl}`);

        let config = await CafeConfig.findOne();
        if (!config) {
            console.log('No configuration found. Creating new one...');
            config = new CafeConfig({
                menuBaseUrl
            });
        } else {
            console.log('Existing configuration found. Updating...');
            config.menuBaseUrl = menuBaseUrl;
        }

        await config.save();
        console.log('✅ Configuration updated successfully.');

        // Optionally regenerate all QR codes
        console.log('Regenerating all table QR codes...');
        const tables = await Table.find();
        console.log(`Found ${tables.length} tables.`);

        for (const table of tables) {
            console.log(`Regenerating QR for Table ${table.tableNumber}...`);
            const qrData = await qrService.generateQRCode(table.tableNumber, menuBaseUrl);
            table.qrCodeSvg = qrData.svg;
            table.qrCodePng = qrData.png;
            table.qrCodeDataUrl = qrData.dataUrl;
            await table.save();
        }

        console.log('✅ All QR codes regenerated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating config:', error);
        process.exit(1);
    }
};

updateConfig();
