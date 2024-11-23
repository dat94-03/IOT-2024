const DeviceType = require('../models/devicetype.model');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
const { NotBeforeError } = require('jsonwebtoken');

const getAll = async (req, res) => {
    try {
        const result = await DeviceType.find();
        return res.status(StatusCodes.OK).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

const create = async (req, res) => {
    try {
        const result = await DeviceType.create(req.body);
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

const update = async (req, res) => {
    try {
        const deviceTypeId = req.body.deviceTypeId;
        if (!deviceTypeId) {
            throw new BadRequestError("Device type's id is missing");
        }
        const result = await DeviceType.findByIdAndUpdate(deviceTypeId, req.body, {
            runValidators: true,
            new: true
        });
        if (!result) {
            throw new NotBeforeError("Device type not found");
        }
        return res.status(StatusCodes.OK).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

module.exports = {
    getAll,
    create,
    update
}