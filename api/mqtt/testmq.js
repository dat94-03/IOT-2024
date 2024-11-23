var mqtt = require('mqtt')

var options = {
    host: "21d87a63d7064472b2615fc6e38d6919.s1.eu.hivemq.cloud",
    port: 8883,
    protocol: 'mqtts',
    username: "tiendat",
    password: "iot2024"
}
// const char *WifiSSID = "July1992 Coffee";
// const char *WifiPassword = "July1992"; //wifi nhà 
// const char *mqttServer = "d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud";

// int mqttPort = 8883;
// const char *mqtt_username = "AnhDuc";
// const char *mqtt_password = "DucIot2024";
// const char *topicPublish = "iot_hust_2024/data";

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('IOT');

// publish message 'Hello' to topic 'my/test/topic'
const msg = {
    "name": "status",
    "deviceId": "640ecef593e18848065f2cc5",
    "value": "ON"
};

client.publish('IOT', JSON.stringify(msg));