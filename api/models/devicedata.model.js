const mongoose = require('mongoose');

const DeviceDataSchema = mongoose.Schema({
    deviceId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    temperature: {
        type: Number
    },
    humidity: {
        type: Number
    },
    gasLevel: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeviceData', DeviceDataSchema);