const mongoose = require('mongoose');

const DeviceMappingSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'Vui lòng cung cấp Device ID'],
        unique: true,
        trim: true
    },
    roomName: {
        type: String,
        required: [true, 'Vui lòng cung cấp tên phòng'],
        trim: true,
        minlength: [2, 'Tên phòng phải có ít nhất 2 ký tự'],
        maxlength: [50, 'Tên phòng không được vượt quá 50 ký tự']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeviceMapping', DeviceMappingSchema); 