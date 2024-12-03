const Device = require('../models/device.model');
const Room = require('../models/room.model');
const { NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const DeviceData = require('../models/devicedata.model');

const getDeviceSensorData = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        
        // Lấy dữ liệu sensor mới nhất
        const latestData = await DeviceData.findOne(
            { deviceId: deviceId }
        ).sort({ timestamp: -1 });

        console.log("Latest sensor data:", latestData);

        return res.status(StatusCodes.OK).json({ 
            deviceId,
            temperature: latestData?.temperature,
            humidity: latestData?.humidity,
            gasLevel: latestData?.gasLevel,
            timestamp: latestData?.timestamp
        });
    } catch (err) {
        console.error("Error in getDeviceSensorData:", err);
        return res.status(400).json({"err": err.toString()});
    }
}

const getByRoom = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const room = await Room.exists({ _id: deviceId });
        if (!room) {
            throw new NotFoundError("Room not found");
        }

        // Lấy bản ghi mới nhất cho phòng
        const latestData = await DeviceData.findOne(
            { deviceId: deviceId }
        ).sort({ timestamp: -1 });

        return res.status(StatusCodes.OK).json({ 
            deviceId,
            temperature: latestData?.temperature,
            humidity: latestData?.humidity,
            gasLevel: latestData?.gasLevel,
            timestamp: latestData?.timestamp
        });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

module.exports = {
    getByRoom,
    getDeviceSensorData
}