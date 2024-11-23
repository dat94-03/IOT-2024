const broker = '21d87a63d7064472b2615fc6e38d6919.s1.eu.hivemq.cloud';
const port = 8884;
const topicData = 'iot_haobinhtuan_hust/command';
const topicCommand = 'iot_haobinhtuan_hust/data';
const username = 'tiendat';
const password = 'iot2024';
const client_id = 'python-mqtt-1';

const client = new Paho.MQTT.Client(broker, port, client_id);

function onConnect() {
  console.log('Connected to MQTT broker');
}

function onFailure(err) {
  console.error('Failed to connect to MQTT broker:', err);
}

function onMessageDelivered() {
  console.log('Message delivered');
}

function publishMessage(message) {
  //const message = document.getElementById('message').value;
  
  const mqttMessage = new Paho.MQTT.Message(message);
  mqttMessage.destinationName = topicCommand;
  mqttMessage.qos = 0;
  mqttMessage.retained = false;
  client.send(mqttMessage);
}

function connectToBroker() {
  client.connect({
    onSuccess: onConnect,
    onFailure: onFailure,
    userName: username,
    password: password,
    useSSL: true,
  });
}

function setupForm() {
  const form = document.querySelector('form');
  const publishBtn = document.getElementById('publish-btn');
  publishBtn.addEventListener('click', publishMessage);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    publishMessage();
  });
}

connectToBroker();
// setupForm();