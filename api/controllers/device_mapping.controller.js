const DeviceMapping = require('../models/device_mapping.model');
const { StatusCodes } = require('http-status-codes');
const AvailableDevice = require('../models/available_device.model');

const addDeviceMapping = async (req, res) => {
    try {
        const { deviceId, roomName } = req.body;
        const userId = req.user.userId;

        if (!deviceId || !roomName) {
            return res.status(400).json({
                err: 'Vui lòng điền đầy đủ Device ID và tên phòng'
            });
        }

        // Kiểm tra xem deviceId có trong danh sách available
        const availableDevice = await AvailableDevice.findOne({
            deviceId: deviceId.trim()
        });

        if (!availableDevice) {
            return res.status(400).json({
                err: 'Device ID không hợp lệ'
            });
        }

        // Tạo mapping mới với userId
        const result = await DeviceMapping.create({
            deviceId: deviceId.trim(),
            roomName: roomName.trim(),
            userId: userId
        });

        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        // Nếu lỗi là duplicate key error, có nghĩa là user đã map device này
        if (err.code === 11000) {
            return res.status(400).json({
                err: 'Bạn đã thêm thiết bị này trước đó'
            });
        }
        return res.status(400).json({err: err.toString()});
    }
}

const getAllMappings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const mappings = await DeviceMapping.find({ userId })
            .sort({ roomName: 1 });
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
const removeDeviceMapping = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const result = await DeviceMapping.findOneAndDelete({
            deviceId:deviceId,
        });
        if (!result) {
            throw new NotFoundError(`No device with id ${deviceId}`);
        } 
        return res.status(200).json({"message": "Delete success"});
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

module.exports = {
    addDeviceMapping,
    getAllMappings,
    updateMapping,
    removeDeviceMapping
}; 