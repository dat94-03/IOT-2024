const DeviceData = require('../models/devicedata.model');
const Device = require('../models/device.model');
const { StatusCodes } = require('http-status-codes');

const getDeviceData = async (req, res) => {
    try {
        const deviceId = req.body.deviceId;
        console.log("Fetching data for device:", deviceId); // Debug

        const resultx = await DeviceData.find({
            deviceId: deviceId,
        }).sort({timestamp: -1}).limit(50);

        console.log("Found data:", resultx); // Debug

        const result = [];
        for (let i = resultx.length - 1; i >= 0; i--) {
            result.push(resultx[i]);
        }

        const returnedResult = result.map(data => {
            const date = data.timestamp;
            const dateString = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            return {
                ...data.toObject(),
                time: dateString
            };
        });

        return res.status(StatusCodes.OK).json({ result: returnedResult });
    } catch (err) {
        console.error("Error in getDeviceData:", err); // Debug
        return res.status(400).json({"err": err.toString()});
    }
}

const addData = async (req, res) => {
    try {
        const name = req.body.name;
        if (!name) {
            throw new BadRequestError("Name of data is missing");
        }

        let value = req.body.value;
        if (value == undefined) {
            throw new BadRequestError("Value of data is missing");
        }

        const result = await DeviceData.create(req.body);
        
        if (name == "status" && (value == "ON" || value == "OFF")) {
            await Device.findByIdAndUpdate(req.body.deviceId, {
                status: value
            });
        }

        return res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        return res.status(400).json({"err": err.toString()});
    }
}

module.exports = {
    getDeviceData,
    addData
}