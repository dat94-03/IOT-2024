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

const removeDeviceMapping = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const userId = req.user.userId;

        // Thêm điều kiện userId để đảm bảo chỉ xóa mapping của user hiện tại
        const result = await DeviceMapping.findOneAndDelete({
            deviceId: deviceId,
            userId: userId
        });

        if (!result) {
            return res.status(404).json({
                err: 'Không tìm thấy thiết bị hoặc bạn không có quyền xóa'
            });
        }

        // Cập nhật trạng thái added về false trong AvailableDevice
        await AvailableDevice.findOneAndUpdate(
            { deviceId: deviceId },
            { added: false }
        );

        return res.status(200).json({"message": "Xóa thành công"});
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

const updateDeviceMapping = async (req, res) => {
    try {
        const deviceId = req.params.deviceId;
        const { roomName } = req.body;
        const userId = req.user.userId;

        if (!roomName) {
            return res.status(400).json({
                err: 'Vui lòng cung cấp tên phòng mới'
            });
        }

        const result = await DeviceMapping.findOneAndUpdate(
            { 
                deviceId: deviceId,
                userId: userId 
            },
            { 
                roomName: roomName.trim() 
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!result) {
            return res.status(404).json({
                err: 'Không tìm thấy thiết bị hoặc bạn không có quyền cập nhật'
            });
        }

        return res.status(200).json({
            message: "Cập nhật thành công",
            result
        });
    } catch (err) {
        return res.status(400).json({
            err: err.toString()
        });
    }
};

module.exports = {
    addDeviceMapping,
    getAllMappings,
    removeDeviceMapping,
    updateDeviceMapping
}; 