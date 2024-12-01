const mqtt = require("mqtt");
const DeviceData = require('../models/devicedata.model');
const Device = require('../models/device.model');

const topic1 = process.env.TOPIC1;
const topic2 = process.env.TOPIC2;
const host = process.env.HOST;
const mqttPort = process.env.MQTTPORT;
const username = process.env.MQTTUSERNAME;
const password = process.env.MQTTPASSWORD;

console.log(username, password);

const addOneData = async (data) => {
    try {
        const now = (new Date()).toISOString();
        const deviceId = data.roomId;

        if (!deviceId) {
            console.log(`${now}: Device ID is missing`);
            return;
        }

        if (data.temperature !== undefined) {
            await DeviceData.create({
                name: "temperature",
                value: data.temperature,
                deviceId: deviceId,
                timestamp: now
            });
            await Device.findByIdAndUpdate(deviceId, {
                value: data.temperature
            });
        }

        if (data.humidity !== undefined) {
            await DeviceData.create({
                name: "humidity", 
                value: data.humidity,
                deviceId: deviceId,
                timestamp: now
            });
        }

        if (data.gasLevel !== undefined) {
            await DeviceData.create({
                name: "gasLevel",
                value: data.gasLevel,
                deviceId: deviceId,
                timestamp: now
            });
        }

        console.log(`${now}: Data saved successfully`);
        return true;
    } catch (err) {
        console.log(`Error saving data: ${err}`);
        return null;
    }
}

const addDatas = async (topic, message) => {
    try {
        const msgJson = JSON.parse(message.toString());
        console.log(`Received message on ${topic}:`, msgJson);
        
        if (Array.isArray(msgJson)) {
            for (let data of msgJson) {
                await addOneData(data);
            }
        } else {
            await addOneData(msgJson);
        }
    } catch (err) {
        console.log('Error processing message:', err);
    }
}

const client = mqtt.connect({
    host: host,
    port: mqttPort,
    protocol: 'mqtts',
    username: username,
    password: password
    }
);

client.subscribe(topic1);
client.subscribe(topic2);

client.on('connect', function () {
    console.log('Connectedd');
});

client.on('error', function (error) {
    console.log(error);
});

client.on("message", addDatas);