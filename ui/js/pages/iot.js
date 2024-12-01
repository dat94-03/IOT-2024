const BASE_URL = "http://localhost:3000";

const content_dashboard = $("#content_dashboard");
const content_temperature = $("#content_temperature");
const content_humidity = $("#content_humidity");
const content_lamp = $("#content_lamp");
const content_gas = $("#content_gas");

// Thêm hằng số cho deviceId/roomId
const ROOM_1_ID = "62ce96c7cd95012e5f7155e1";
const ROOM_2_ID = "62ce96c7cd95012e5f7155e2";

// Thêm hàm helper để lấy tên phòng
function getRoomName(deviceId) {
    switch(deviceId) {
        case ROOM_1_ID:
            return "Phòng 1";
        case ROOM_2_ID:
            return "Phòng 2";
        default:
            return "Không xác định";
    }
}

$(document).ready(function () {
    // gán các sự kiện cho các element:
    renderDashboard(content_dashboard);
    initEvents();
    loadData();
    
    // Tự động refresh dữ liệu mỗi 5 giây
    setInterval(loadData, 5000);
});

function loadData() {
    const currentRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    
    // Load nhiệt độ
    $.ajax({
        url: BASE_URL + `/api/data`,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ 
            deviceId: currentRoom,
            name: "temperature"  // Thêm tham số name để lọc loại dữ liệu
        }),
        success: function (data) {
            if (data && data.result && data.result.length > 0) {
                $("#temperature_value").text(data.result[0].value + "°C");
            }
        }
    });

    // Load độ ẩm
    $.ajax({
        url: BASE_URL + `/api/data`,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ 
            deviceId: currentRoom,
            name: "humidity"
        }),
        success: function (data) {
            if (data && data.result && data.result.length > 0) {
                $("#humidity_value").text(data.result[0].value + "%");
            }
        }
    });

    // Load nồng độ khí
    $.ajax({
        url: BASE_URL + `/api/data`,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ 
            deviceId: currentRoom,
            name: "gasLevel"
        }),
        success: function (data) {
            if (data && data.result && data.result.length > 0) {
                $("#gas_value").text(data.result[0].value + " ppm");
            }
        }
    });
}

// Initialize event handlers for tabs
function initEvents() {
    $(".item").click(function () {
        $('.item').removeClass("item--selected");
        $(this).addClass("item--selected");
        const item_name = $(this).attr('name');

        switch (item_name) {
            case "item_dashboard":
                renderDashboard(content_dashboard);
                break;
            case "item_temperature":
                renderTemperature(content_temperature);
                break;
            case "item_humidity":
                renderHumidity(content_humidity);
                break;
            case "item_gas":
                renderGasLevel(content_gas);
                break;
            case "item_lamp":
                renderLamp(content_lamp);
                break;
        }
    });

    $("#btnRefresh").click(function () {
        loadData();
    });

    // Cập nhật room selector
    const roomSelector = $("#roomSelector");
    roomSelector.empty();
    roomSelector.append(`<option value="${ROOM_1_ID}">Phòng 1</option>`);
    roomSelector.append(`<option value="${ROOM_2_ID}">Phòng 2</option>`);
    
    // Đặt giá trị mặc định từ localStorage hoặc ROOM_1_ID
    const savedRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    roomSelector.val(savedRoom);

    roomSelector.change(function() {
        const selectedRoom = $(this).val();
        localStorage.setItem("currentRoom", selectedRoom);
        loadData(); // Tải lại data cho phòng được chọn
    });
}

// Function to render the dashboard
function renderDashboard(thispage) {
    $('.page__content').remove();
    thispage.insertAfter('.page__header');
    localStorage.setItem("tab", "device");
}

// Function to render temperature data and chart
function renderTemperature(thispage) {
    const currentRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    
    $('.page__content').remove();
    thispage.insertAfter('.page__header');

    $.ajax({
        url: BASE_URL + `/api/data`,
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ roomId: currentRoom }),
        success: function (data) {
            if (data && data.result && data.result.length > 0) {
                const options = [];
                for (let i = 0; i < data.result.length; i++) {
                    options.push({
                        label: data.result[i].time.split(' ')[1],
                        y: data.result[i].temperature
                    });
                }
                drawLinePlot("Nhiệt độ " + String.fromCharCode(8451), options, "&#8451");
            } else {
                console.error("Không có dữ liệu trả về");
            }
        },
        error: function(xhr, status, error) {
            console.error("Lỗi API:", error);
        }
    });
}

// Function to render humidity data and chart
function renderHumidity(thispage) {
    const currentRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    
    $('.page__content').remove();
    thispage.insertAfter('.page__header');

    $.ajax({
        url: baseUrl + `/api/data`,
        type: "post", 
        data: JSON.stringify({ roomId: currentRoom }),
        success: function (data) {
            const options = [];
            for (let i = 0; i < data.result.length; i++) {
                options.push({
                    label: data.result[i].time.split(' ')[1],
                    y: data.result[i].humidity
                });
            }
            drawLinePlot("Độ ẩm %", options, "%");
        }
    });
}

// Thêm hàm render cho gas level
function renderGasLevel(thispage) {
    const currentRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    
    $('.page__content').remove();
    thispage.insertAfter('.page__header');

    $.ajax({
        url: baseUrl + `/api/data`,
        type: "post",
        data: JSON.stringify({ roomId: currentRoom }),
        success: function (data) {
            const options = [];
            for (let i = 0; i < data.result.length; i++) {
                options.push({
                    label: data.result[i].time.split(' ')[1],
                    y: data.result[i].gasLevel
                });
            }
            drawLinePlot("Nồng độ khí (ppm)", options, "ppm");
        }
    });
}

// Function to change lamp status
function changeLampStatus(lamp_id) {
    console.log("Lamp ID:", lamp_id);
    const lamp = $(`#${lamp_id}`);
    let obj = {};

    if (lamp.hasClass("button__icon--lamp--on")) {
        obj = { name: "status", value: "OFF", deviceId: lamp_id };
    } else {
        obj = { name: "status", value: "ON", deviceId: lamp_id };
    }

    const info = JSON.stringify(obj);
    publishMessage(info); // Assuming this function is defined elsewhere
}

// Function to draw the line plot for temperature/humidity
function drawLinePlot(title, options, unit) {
    const currentRoom = localStorage.getItem("currentRoom") || ROOM_1_ID;
    const roomName = getRoomName(currentRoom);
    
    $(".chartContainer").CanvasJSChart({
        title: {
            text: `${title} - ${roomName}`
        },
        axisY: {
            title: title,
            includeZero: false
        },
        axisX: {
            labelAngle: 120,
            interval: 1
        },
        data: [{
            type: "line",
            toolTipContent: "{y} " + unit,
            dataPoints: options
        }]
    });
}
