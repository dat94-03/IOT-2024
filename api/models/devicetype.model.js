const mongoose = require('mongoose');

const DeviceTypeSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for device'],
        minlength: 2,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("DeviceType", DeviceTypeSchema);