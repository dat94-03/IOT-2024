const mongoose = require('mongoose');

const DeviceMappingSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'Vui lòng cung cấp Device ID'],
        unique: true
    },
    roomName: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên phòng'],
        default: 'Phòng 1'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceMapping', DeviceMappingSchema); 