const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    roomId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    status: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'ON'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', DeviceSchema);