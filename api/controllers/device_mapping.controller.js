const DeviceMapping = require('../models/device_mapping.model');
const { StatusCodes } = require('http-status-codes');

const addDeviceMapping = async (req, res) => {
    try {
        const { deviceId, roomName } = req.body;
        const result = await DeviceMapping.create({
            deviceId,
            roomName
        });
        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

const getAllMappings = async (req, res) => {
    try {
        const mappings = await DeviceMapping.find({});
        return res.status(StatusCodes.OK).json({ mappings });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

module.exports = {
    addDeviceMapping,
    getAllMappings
}; 