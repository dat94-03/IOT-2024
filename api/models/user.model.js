const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Vui lòng nhập email hợp lệ',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 6,
    }
}, {
    timestamps: true
});

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this.email, name: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    );
};

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);