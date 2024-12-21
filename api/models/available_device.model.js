const mongoose = require('mongoose');

const AvailableDeviceSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'Vui lòng cung cấp Device ID'],
        unique: true,
        trim: true
    },
    added: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AvailableDevice', AvailableDeviceSchema); 