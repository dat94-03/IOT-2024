const Room = require('../models/room.model');
const Device = require('../models/device.model');
const { BadRequestError, NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getByUser = async (req, res) => {
    try {
        const { userId } = req.user;

        const rooms = await Room.find({ userId: userId });
    
        return res.status(StatusCodes.OK).json(rooms);
    
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

const create = async (req, res) => {
    try {
        const { userId } = req.user;
        const roomName = req.body.name;
        if (!roomName) {
            throw new BadRequestError("No room's name provded");
        }

        const result = await Room.create({
            name: roomName,
            userId: userId,
        });

        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

const update = async (req, res) => {
    try {
        const roomId = req.body.roomId;
        const newName = req.body.name;
        const {userId} = req.user;
    
        const result = await Room.findByIdAndUpdate({
            _id: roomId,
            userId: userId,
        }, {
            name: newName
        }, {
            new: true,
            runValidators: true
        });
    
        if (!result) {
            throw new NotFoundError("Room not found");
        }
    
        return res.status(StatusCodes.OK).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
    
}

const destroy = async (req, res) => {
    try {
        const {userId} = req.user;
        const { roomId } = req.body;
        const result = await Room.findOneAndDelete({
            _id: roomId,
            userId: userId
        });
        if (!result) {
            throw new NotFoundError(`No room with id ${roomId}`);
        }
    
        await Device.deleteMany({
            roomId
        });
    
        return res.status(200).json({"message": "Delete success"});
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

module.exports = {
    getByUser,
    create,
    update,
    destroy
}