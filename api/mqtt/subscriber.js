const mqtt = require("mqtt");
const DeviceData = require('../models/devicedata.model');

const topic1 = process.env.TOPIC1;
const topic2 = process.env.TOPIC2;
const host = process.env.HOST;
const mqttPort = process.env.MQTTPORT;
const username = process.env.MQTTUSERNAME;
const password = process.env.MQTTPASSWORD;

console.log(username, password);

const addOneData = async (data) => {
    try {
        const now = new Date();
        const { deviceId, temperature, humidity, gasLevel } = data;

        if (!deviceId) {
            console.log(`${now.toISOString()}: device ID is missing`);
            return;
        }

        await DeviceData.create({
            deviceId,
            temperature,
            humidity,
            gasLevel,
            timestamp: now
        });

        console.log(`${now.toISOString()}: Data saved successfully`);
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