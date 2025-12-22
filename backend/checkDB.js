const mongoose = require('mongoose');
require('dotenv').config();
const Table = require('./models/Table');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const tables = await Table.find();
    tables.forEach(t => {
        console.log(`Table ${t.tableNumber}: ${t.qrCodeDataUrl ? 'Has QR' : 'No QR'}`);
        // Extract URL from SVG if possible or just check the dataUrl
        // But we want to know what's IN the QR.
        // Actually the tableService uses qrService which uses config.menuBaseUrl.
    });
    const CafeConfig = require('./models/CafeConfig');
    const config = await CafeConfig.findOne();
    console.log('Current Config MenuBaseUrl:', config.menuBaseUrl);
    process.exit(0);
}
check();
