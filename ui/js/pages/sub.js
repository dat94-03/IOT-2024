const client_id_receiver = 'python-mqtt-receiver';
const ROOM_1_ID = '62ce96c7cd95012e5f7155e1';
const ROOM_2_ID = 'your_room_2_id';

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
  let data = JSON.parse(message.payloadString);
  const tab = localStorage.getItem("tab");

  // Xử lý theo từng phòng
  switch(data.roomId) {
    case ROOM_1_ID:
      updateRoom1Data(data);
      break;
    case ROOM_2_ID: 
      updateRoom2Data(data);
      break;
    default:
      console.log("Unknown room ID:", data.roomId);
  }

  // Cập nhật biểu đồ nếu đang ở tab tương ứng
  if (tab == "temperature") {
    renderTemperature($("#content_temperature"));
  } else if (tab == "humidity") {
    renderHumidity($("#content_humidity"));
  } else if (tab == "gas") {
    renderGasLevel($("#content_gas"));
  }
}

function updateRoom1Data(data) {
  // Cập nhật UI cho phòng 1
  $("#room1_temp").text('Nhiệt độ: ' + data.temperature + String.fromCharCode(8451));
  $("#room1_humidity").text('Độ ẩm: ' + data.humidity + "%");
  $("#room1_gas").text('Nồng độ khí: ' + data.gasLevel + " ppm");
}

function updateRoom2Data(data) {
  // Cập nhật UI cho phòng 2  
  $("#room2_temp").text('Nhiệt độ: ' + data.temperature + String.fromCharCode(8451));
  $("#room2_humidity").text('Độ ẩm: ' + data.humidity + "%");
  $("#room2_gas").text('Nồng độ khí: ' + data.gasLevel + " ppm");
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