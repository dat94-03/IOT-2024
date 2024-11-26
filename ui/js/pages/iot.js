const BASE_URL="http://localhost:3000"


const content_dashboard = $("#content_dashboard");
const content_temperature = $("#content_temperature");
const content_humidity = $("#content_humidity");
const content_lamp = $("#content_lamp");

$(document).ready(function () {
    // gán các sự kiện cho các element:
    renderDashboard(content_dashboard);
    initEvents();

    // Load dữ liệu:
    loadData();
});

function loadData() {
    // You can add a data refreshing mechanism here
    console.log("Load data triggered");
    // Example: Call AJAX to refresh data if needed.
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
            case "item_lamp":
                renderLamp(content_lamp);
                break;
        }
    });

    $("#btnRefresh").click(function () {
        loadData();
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
    localStorage.setItem("tab", "temperature");
    const token = localStorage.getItem("token");
    const baseUrl = BASE_URL;
    // const roomId = $("#roomListing :selected").val();
    const roomId ='62ce96c7cd95012e5f7155e1'
    // const deviceId = localStorage.getItem(`${roomId}_temperature_sensors`);
    const deviceId='640ee2c0246bf48329d6deb1'

    $('.page__content').remove();
    thispage.insertAfter('.page__header');

    $.ajax({
        url: baseUrl + `/api/data`,
        type: "post",
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        data: JSON.stringify({ deviceId: deviceId }),
        success: function (data) {
            const options = [];
            for (let i = 0; i < data.result.length; i++) {
                const res = data.result[i];
                options.push({
                    label: res.time.split(' ')[1], // Only display time part
                    y: res.value
                });
            }
            drawLinePlot("Nhiệt độ " + String.fromCharCode(8451), options, "&#8451");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching temperature data:", status, error);
        }
    });
}

// Function to render humidity data and chart
function renderHumidity(thispage) {
    localStorage.setItem("tab", "humidity");
    const token = localStorage.getItem("token");
    const baseUrl = BASE_URL;
    //fix cứng tạm sau sửa trên data base sau
    // const roomId = $("#roomListing :selected").val();
    // const deviceId = localStorage.getItem(`${roomId}_humidity_sensors`);
    const roomId ='62ce96c7cd95012e5f7155e1'
    // const deviceId = localStorage.getItem(`${roomId}_temperature_sensors`);
    const deviceId='640ee2b1246bf48329d6dead'
    $('.page__content').remove();
    thispage.insertAfter('.page__header');

    $.ajax({
        url: baseUrl + `/api/data`,
        type: "post",
        dataType: "json",
        contentType: "application/json; charset=UTF-8",
        headers: {
            'Authorization': token
        },
        data: JSON.stringify({ deviceId: deviceId }),
        success: function (data) {
            const options = [];
            for (let i = 0; i < data.result.length; i++) {
                const res = data.result[i];
                options.push({
                    label: res.time.split(' ')[1],
                    y: res.value
                });
            }
            drawLinePlot("Độ ẩm %", options, "g/m<sup>3</sup>");
        },
        error: function (xhr, status, error) {
            console.error("Error fetching humidity data:", status, error);
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
    $(".chartContainer").CanvasJSChart({
        title: {
            text: title
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
            type: "line", // Try changing to column, area
            toolTipContent: "{y} " + unit,
            dataPoints: options
        }]
    });
}
