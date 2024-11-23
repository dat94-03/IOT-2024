const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true]
    },
    name: {
        type: String,
        required: [true, 'Please provide a name for room'],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', RoomSchema);