const client_id_receiver = 'python-mqtt-receiver';

// Create a MQTT client instance
const receiver = new Paho.MQTT.Client(broker, port, client_id_receiver);

// Set the callback function for when the client connects to the broker
receiver.onConnectionLost = onConnectionLost;
receiver.onMessageArrived = onMessageArrived;

// Connect the client to the broker
receiver.connect({
  onSuccess: onConnect,
  userName: username,
  password: password,
  useSSL: true
});

// Function to run when the client successfully connects to the broker
function onConnect() {
  console.log("Connected to MQTT broker!");
  // Subscribe to the specified topic
  // receiver.subscribe(topicCommand);
  receiver.subscribe(topicData);
}

// Function to run when the client loses connection to the broker
function onConnectionLost(response) {
  console.log("Connection lost: " + response.errorMessage);
}

// Function to run when a message is received from the broker
function onMessageArrived(message) {
  let info = JSON.parse(message.payloadString);

  const infoId = info.deviceId;
  const value = info.value;

  const tab = localStorage.getItem("tab");

  if (info.name == "status") {
    setLampStatus($(`#${infoId}`), value);
  } else if (info.name == "temperature"){
    if (value != undefined){
      $(`#${infoId}`).text('Nhiệt độ: ' + value + String.fromCharCode(8451));
    } else {
      $(`#${infoId}`).text('Nhiệt độ: Không thu được kết quả ');
    }
    if (tab == "temperature") {
      renderTemperature($("#content_temperature"));
    } 

  } else if (info.name == "humidity"){
    if (value != undefined){
      $(`#${infoId}`).text('Độ ẩm: ' + value + "%");
    } else {
      $(`#${infoId}`).text('Độ ẩm: Không thu được kết quả g/m');
    }
    if (tab == "humidity") {
        renderHumidity($("#content_humidity"));
    }
  }
}

function setLampStatus(lamp, value){
  console.log(value)
  if (value == "OFF"){
    lamp.removeClass("button__icon--lamp--on");
    lamp.addClass("button__icon--lamp--off");
    lamp.text('Tắt');
  } else {
    lamp.removeClass("button__icon--lamp--off");
    lamp.addClass("button__icon--lamp--on");
    lamp.text('Hoạt động');
  }
  
}