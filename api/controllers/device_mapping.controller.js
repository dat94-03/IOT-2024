const DeviceMapping = require('../models/device_mapping.model');
const { StatusCodes } = require('http-status-codes');

const addDeviceMapping = async (req, res) => {
    try {
        const { deviceId, roomName } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!deviceId || !roomName) {
            return res.status(400).json({
                err: 'Vui lòng điền đầy đủ Device ID và tên phòng'
            });
        }

        // Kiểm tra xem deviceId đã tồn tại chưa
        const existingDevice = await DeviceMapping.findOne({ deviceId });
        if (existingDevice) {
            return res.status(400).json({
                err: 'Device ID này đã được sử dụng'
            });
        }

        const result = await DeviceMapping.create({
            deviceId: deviceId.trim(),
            roomName: roomName.trim()
        });

        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

const getAllMappings = async (req, res) => {
    try {
        const mappings = await DeviceMapping.find({})
            .sort({ roomName: 1 }); // Sắp xếp theo tên phòng
        return res.status(StatusCodes.OK).json({ mappings });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

const updateMapping = async (req, res) => {
    try {
        const { deviceId, roomName } = req.body;
        
        if (!deviceId || !roomName) {
            return res.status(400).json({
                err: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        const result = await DeviceMapping.findOneAndUpdate(
            { deviceId },
            { roomName: roomName.trim() },
            { new: true, runValidators: true }
        );

        if (!result) {
            return res.status(404).json({
                err: 'Không tìm thấy thiết bị'
            });
        }

        return res.status(StatusCodes.OK).json({ result });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
}

module.exports = {
    addDeviceMapping,
    getAllMappings,
    updateMapping
}; 