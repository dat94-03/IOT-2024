const mongoose = require('mongoose');

const DeviceMappingSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'Vui lòng cung cấp Device ID'],
        trim: true
    },
    userId: {
        type: String,
        required: [true, 'User ID là bắt buộc']
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

// Composite unique index cho deviceId và userId - đảm bảo mỗi user chỉ có thể map một deviceId một lần
DeviceMappingSchema.index({ deviceId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('DeviceMapping', DeviceMappingSchema); 