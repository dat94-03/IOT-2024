// content_dashboard = $("#content_dashboard")
// content_temperature = $("#content_temperature")
// content_humidity = $("#content_humidity")
// content_lamp = $("#content_lamp")

// $(document).ready(function() {
//     // gán các sự kiện cho các element:
//     renderDashboard(content_dashboard);
//     initEvents();

//     // Load dữ liệu:
//     loadData();
// })

// function loadData() {
    
//     // $("#chartContainer").CanvasJSChart(options);
// }

// // $(function() {
// // 	$(".chartContainer").CanvasJSChart({
// // 		title: {
// // 			text: "Temperature"
// // 		},
// // 		axisY: {
// // 			title: "Temperature in C degree",
// // 			includeZero: false
// // 		},
// // 		axisX: {
// // 			interval: 1
// // 		},
// // 		data: [
// // 		{
// // 			type: "line", //try changing to column, area
// // 			toolTipContent: "{label}: {y} &#8451",
// // 			dataPoints: [
// // 				{ label: "1",  y: 5.28 },
// // 				{ label: "2",  y: 3.83 },
// // 				{ label: "3",y: 6.55 },
// // 				{ label: "4",y: 4.81 },
// // 				{ label: "5",  y: 2.37 },
// // 				{ label: "6", y: 2.33 },
// // 				{ label: "7", y: 3.06 },
// // 				{ label: "8",  y: 2.94 },
// // 				{ label: "9",  y: 5.41 },
// // 				{ label: "10",  y: 2.17 },
// // 				{ label: "11",  y: 2.17 },
// // 				{ label: "12",  y: 2.80 }
// // 			]
// // 		}
// // 		]
// // 	});
// // });

// function initEvents() {
//     $(".item").click(function(){     
//         $('.item').removeClass("item--selected");
//         $(this).addClass("item--selected");
//         item_name = $(this).attr('name');

//         switch (item_name) {
//             case "item_dashboard":
//                 renderDashboard(content_dashboard);
//                 break;
//             case "item_temperature":
//                 renderTemperature(content_temperature);
//                 break;
//             case "item_humidity":
//                 renderHumidity(content_humidity)
//                 break;
//             case "item_lamp":
//                 renderLamp(content_lamp);
//                 break;
//           }
        
//     })

//     $("#btnRefresh").click(function(){
//         loadData();
//     })

    
// }

// function renderDashboard(thispage){
//     $('.page__content').remove();
//     thispage.insertAfter('.page__header');
//     localStorage.setItem("tab", "device");
//     // $("#640ee113bf49af0a529390ad").click(function() {
//     //     console.log(1111);
//     //     changeLampStatus($(this));
//     // });

//     // $("#640ee119bf49af0a529390b1").click(function() {
//     //     changeLampStatus($(this));
//     // });
// }

// function renderTemperature(thispage) {
//     localStorage.setItem("tab", "temperature");
//     const token = localStorage.getItem("token");
//     const baseUrl = "http://localhost:3000";
//     const roomId = $("#roomListing :selected").val();    

//     const deviceId = localStorage.getItem(`${roomId}_temperature_sensors`);

//     $('.page__content').remove();
//     thispage.insertAfter('.page__header');
//     $.ajax({
//         url: baseUrl + `/api/data`,
//         type: "post",
//         dataType: "json",   
//         contentType: "application/json; charset=UTF-8",
//         headers: {
//             'Authorization': token
//         },
//         data: JSON.stringify({
//             deviceId: deviceId
//         }),
//         success: function(data) {
//             const options = [];
//             for (let i = 0; i < data.result.length; i++) {
//                 const res = data.result[i];
//                 options.push({
//                     label: res.time.split(' ')[1],
//                     y: res.value
//                 })
//             }
//             console.log(options)
//             drawLinePlot("Nhiệt độ " + String.fromCharCode(8451), options, "&#8451");
//         }
//     })
// }

// function renderHumidity(thispage){
//     localStorage.setItem("tab", "humidity");
//     const token = localStorage.getItem("token");
//     const baseUrl = "http://localhost:3000";
//     const roomId = $("#roomListing :selected").val();    
//     const deviceId = localStorage.getItem(`${roomId}_humidity_sensors`);

//     $('.page__content').remove();
//     thispage.insertAfter('.page__header');
//     $.ajax({
//         url: baseUrl + `/api/data`,
//         type: "post",
//         dataType: "json",   
//         contentType: "application/json; charset=UTF-8",
//         headers: {
//             'Authorization': token
//         },
//         data: JSON.stringify({
//             deviceId: deviceId
//         }),
//         success: function(data) {
//             const options = [];
//             for (let i = 0; i < data.result.length; i++) {
//                 const res = data.result[i];
//                 options.push({
//                     label: res.time.split(' ')[1],
//                     y: res.value
//                 })
//             }
//             drawLinePlot("Độ ẩm %", options, "g/m<sup>3");  
//         }
//     })
    
// }

// function changeLampStatus(lamp_id){
//     console.log(lamp_id);
//     lamp = $(`#${lamp_id}`);
//     var obj = {};
//     if (lamp.hasClass("button__icon--lamp--on")){
//         obj = {name: "status", value: "OFF", deviceId: lamp_id};
//     } else {
//         obj = {name: "status", value: "ON", deviceId: lamp_id};
//     }
//     info = JSON.stringify(obj);
//     publishMessage(info);
// }

// function drawLinePlot(title, options, unit){
//     $(".chartContainer").CanvasJSChart({
//         title: {
//             text: ""
//         },
//         axisY: {
//             title: title,
//             includeZero: false
//         },
//         axisX: {
//             labelAngle: 120,
//             interval: 1
//         },
//         data: [
//         {
//             type: "line", //try changing to column, area
//             toolTipContent: "{y} "+unit,
//             dataPoints: options
//         }
//         ]
//     });
// }


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
    const baseUrl = "http://localhost:3000";
    const roomId = $("#roomListing :selected").val();
    const deviceId = localStorage.getItem(`${roomId}_temperature_sensors`);

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
    const baseUrl = "http://localhost:3000";
    const roomId = $("#roomListing :selected").val();
    const deviceId = localStorage.getItem(`${roomId}_humidity_sensors`);

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
