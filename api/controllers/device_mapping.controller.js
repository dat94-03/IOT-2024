const DeviceMapping = require('../models/device_mapping.model');
const { StatusCodes } = require('http-status-codes');
const AvailableDevice = require('../models/available_device.model');

const addDeviceMapping = async (req, res) => {
    try {
        const { deviceId, roomName } = req.body;
        
        if (!deviceId || !roomName) {
            return res.status(400).json({
                err: 'Vui lòng điền đầy đủ Device ID và tên phòng'
            });
        }

        // Kiểm tra xem deviceId có trong danh sách available và chưa được sử dụng
        const availableDevice = await AvailableDevice.findOne({
            deviceId: deviceId.trim(),
            added: false
        });

        if (!availableDevice) {
            return res.status(400).json({
                err: 'Device ID không hợp lệ hoặc đã được sử dụng'
            });
        }

        // Kiểm tra xem deviceId đã được map chưa
        const existingMapping = await DeviceMapping.findOne({ deviceId });
        if (existingMapping) {
            return res.status(400).json({
                err: 'Device ID này đã được sử dụng'
            });
        }

        // Tạo mapping mới
        const result = await DeviceMapping.create({
            deviceId: deviceId.trim(),
            roomName: roomName.trim()
        });

        // Cập nhật trạng thái added của available device
        await AvailableDevice.findOneAndUpdate(
            { deviceId: deviceId.trim() },
            { added: true }
        );

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