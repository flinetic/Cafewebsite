const QRCode = require('qrcode');

/**
 * QR Code Generation Service
 */
class QRService {
    /**
     * Generate QR code for a table
     * @param {number} tableNumber - Table number
     * @param {string} baseUrl - Base URL for menu (e.g., http://localhost:5173)
     * @returns {Promise<{svg: string, png: Buffer, dataUrl: string}>}
     */
    async generateQRCode(tableNumber, baseUrl) {
        // Generate URL with table path format: /table/:tableNumber/menu
        const menuUrl = `${baseUrl}/table/${tableNumber}/menu`;

        try {
            // Generate QR codes in different formats
            const [svg, dataUrl, png] = await Promise.all([
                // SVG format
                QRCode.toString(menuUrl, {
                    type: 'svg',
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }),
                // Data URL format (for displaying in browser)
                QRCode.toDataURL(menuUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }),
                // PNG buffer (for downloading)
                QRCode.toBuffer(menuUrl, {
                    type: 'png',
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                })
            ]);

            return {
                svg,
                png,
                dataUrl,
                url: menuUrl
            };
        } catch (error) {
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }

    /**
     * Generate QR code PNG only
     */
    async generatePNG(tableNumber, baseUrl) {
        const menuUrl = `${baseUrl}?table=${tableNumber}`;
        return QRCode.toBuffer(menuUrl, {
            type: 'png',
            width: 300,
            margin: 2
        });
    }

    /**
     * Generate QR code SVG only
     */
    async generateSVG(tableNumber, baseUrl) {
        const menuUrl = `${baseUrl}?table=${tableNumber}`;
        return QRCode.toString(menuUrl, {
            type: 'svg',
            width: 300,
            margin: 2
        });
    }
}

module.exports = new QRService();
