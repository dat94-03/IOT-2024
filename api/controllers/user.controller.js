const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
	try {
		const user = await User.create({ ...req.body });
		const token = user.createJWT();
		res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });	
	} catch (err) {
		return res.status(400).json({err: err.toString()});
	}

}

const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new BadRequestError('Please provide email and password');
		}
		const user = await User.findOne({ email: email });
		if (!user) {
			throw new UnauthenticatedError('Invalid Credentials');
		}
		const isPasswordCorrect = await user.comparePassword(password);
		if (!isPasswordCorrect) {
			throw new UnauthenticatedError('Invalid Credentials');
		}
		
		const token = user.createJWT();
	
		return res.status(StatusCodes.OK).json({ user: { name: user.name }, token});
	
	} catch (err) {
		return res.status(400).json({err: err.toString()});
	}
}

const changePassword = async (req, res) => {
	try {
	const { userId } = req.user;

	const { currentPassword, newPassword, confirmPassword } = req.body;

	if (!currentPassword || !newPassword || !confirmPassword) {
		throw new BadRequestError("Not enough information provided");
	}

	if (newPassword !== confirmPassword) {
		throw new BadRequestError("New password and confirm password must be the same");
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new BadRequestError("Invalid credentials");
	}

	const comparisionRes = await user.comparePassword(currentPassword);
	if (!comparisionRes) {
		throw new BadRequestError("Invalid password");
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(newPassword, salt)

	const result = await User.updateOne({
		_id: userId
	}, {
		password: hashedPassword
	});

	return res.status(StatusCodes.OK).json({ result });
	} catch (err) {
		return res.status(400).json({err: err.toString()});
	}
}

module.exports = {
	register,
	login,
	changePassword
}
