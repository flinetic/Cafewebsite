const Table = require('../models/Table');
const qrService = require('./qrService');
const CafeConfig = require('../models/CafeConfig');

/**
 * Table Management Service
 */
class TableService {
    /**
     * Create a new table with QR code
     */
    async createTable(tableNumber) {
        // Check if table already exists
        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            throw new Error(`Table ${tableNumber} already exists`);
        }

        // Get café config for menu base URL
        const config = await CafeConfig.getConfig();

        // Generate QR code
        const qrData = await qrService.generateQRCode(tableNumber, config.menuBaseUrl);

        // Create table
        const table = await Table.create({
            tableNumber,
            qrCodeSvg: qrData.svg,
            qrCodePng: qrData.png,
            qrCodeDataUrl: qrData.dataUrl
        });

        return table;
    }

    /**
     * Get all tables
     */
    async getAllTables() {
        return Table.find().sort({ tableNumber: 1 });
    }

    /**
     * Get table by ID
     */
    async getTableById(id) {
        const table = await Table.findById(id);
        if (!table) {
            throw new Error('Table not found');
        }
        return table;
    }

    /**
     * Get table by table number
     */
    async getTableByNumber(tableNumber) {
        const table = await Table.findOne({ tableNumber });
        if (!table) {
            throw new Error(`Table ${tableNumber} not found`);
        }
        return table;
    }

    /**
     * Update table
     */
    async updateTable(id, updateData) {
        const table = await Table.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!table) {
            throw new Error('Table not found');
        }
        return table;
    }

    /**
     * Delete table
     */
    async deleteTable(id) {
        const table = await Table.findByIdAndDelete(id);
        if (!table) {
            throw new Error('Table not found');
        }
        return table;
    }

    /**
     * Regenerate QR code for a table
     */
    async regenerateQR(id) {
        const table = await Table.findById(id);
        if (!table) {
            throw new Error('Table not found');
        }

        const config = await CafeConfig.getConfig();
        const qrData = await qrService.generateQRCode(table.tableNumber, config.menuBaseUrl);

        table.qrCodeSvg = qrData.svg;
        table.qrCodePng = qrData.png;
        table.qrCodeDataUrl = qrData.dataUrl;
        await table.save();

        return table;
    }

    /**
     * Get QR code as PNG buffer
     */
    async getQRPng(id) {
        const table = await Table.findById(id);
        if (!table) {
            throw new Error('Table not found');
        }

        if (!table.qrCodePng) {
            // Generate if not exists
            await this.regenerateQR(id);
            return (await Table.findById(id)).qrCodePng;
        }

        return table.qrCodePng;
    }

    /**
     * Get QR code as SVG string
     */
    async getQRSvg(id) {
        const table = await Table.findById(id);
        if (!table) {
            throw new Error('Table not found');
        }

        if (!table.qrCodeSvg) {
            await this.regenerateQR(id);
            return (await Table.findById(id)).qrCodeSvg;
        }

        return table.qrCodeSvg;
    }

    /**
     * Toggle table active status
     */
    async toggleActive(id) {
        const table = await Table.findById(id);
        if (!table) {
            throw new Error('Table not found');
        }

        table.isActive = !table.isActive;
        await table.save();
        return table;
    }
}

module.exports = new TableService();
