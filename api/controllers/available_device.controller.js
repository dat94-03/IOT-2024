const AvailableDevice = require('../models/available_device.model');
const { StatusCodes } = require('http-status-codes');

const addAvailableDevice = async (req, res) => {
    try {
        const { deviceId } = req.body;
        
        // Kiểm tra deviceId đã tồn tại chưa
        const existingDevice = await AvailableDevice.findOne({ deviceId });
        if (existingDevice) {
            return res.status(400).json({
                err: 'Device ID này đã tồn tại trong danh sách'
            });
        }

        const result = await AvailableDevice.create({
            deviceId: deviceId.trim()
        });

        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

const checkDeviceAvailability = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const device = await AvailableDevice.findOne({ 
            deviceId: deviceId,
            added: false
        });

        if (!device) {
            return res.status(404).json({
                available: false,
                message: 'Device ID không tồn tại hoặc đã được sử dụng'
            });
        }

        return res.status(StatusCodes.OK).json({
            available: true,
            device
        });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

module.exports = {
    addAvailableDevice,
    checkDeviceAvailability
}; 