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
        // Generate URL with query parameter format: /menu?table=tableNumber
        const menuUrl = `${baseUrl}/menu?table=${tableNumber}`;

        const options = {
            errorCorrectionLevel: 'H',
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 300
        };

        try {
            // Generate QR codes in different formats
            const [svg, dataUrl, png] = await Promise.all([
                // SVG format
                QRCode.toString(menuUrl, { ...options, type: 'svg' }),
                // Data URL format (for displaying in browser)
                QRCode.toDataURL(menuUrl, options),
                // PNG buffer (for downloading)
                QRCode.toBuffer(menuUrl, { ...options, type: 'png' })
            ]);

            // Add logo to SVG
            const svgWithLogo = this._addLogoToSVG(svg);

            return {
                svg: svgWithLogo,
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
            margin: 2,
            errorCorrectionLevel: 'H'
        });
    }

    /**
     * Generate QR code SVG only
     */
    async generateSVG(tableNumber, baseUrl) {
        const menuUrl = `${baseUrl}?table=${tableNumber}`;
        const svg = await QRCode.toString(menuUrl, {
            type: 'svg',
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H'
        });
        return this._addLogoToSVG(svg);
    }

    /**
     * Helper to add logo to SVG string
     * @private
     */
    _addLogoToSVG(svgString) {
        // Simple demo: Inject a coffee emoji in the center
        // The QR code is 300x300 (or whatever viewbox is). 
        // We'll assume standard viewbox or injected percentage.
        // Re-parsing string to find closing tag
        const closingTag = '</svg>';
        const logo = `
            <rect x="35%" y="35%" width="30%" height="30%" fill="white" rx="15" />
            <text x="50%" y="54%" font-size="60" text-anchor="middle" dominant-baseline="middle">☕</text>
        `;
        return svgString.replace(closingTag, `${logo}${closingTag}`);
    }
}

module.exports = new QRService();
