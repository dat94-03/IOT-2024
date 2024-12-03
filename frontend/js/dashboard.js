document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';
    const roomSelect = document.getElementById('roomSelect');
    const sensorChart = document.getElementById('sensorChart').getContext('2d');
    let chart;

    roomSelect.addEventListener('change', function () {
        const deviceId = roomSelect.value;
        fetchDataAndDrawChart(deviceId);
    });

    function fetchDataAndDrawChart(deviceId) {
        fetch(baseUrl + '/api/data', {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceId: deviceId })
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.result && Array.isArray(data.result)) {
                const options = data.result.map(res => {
                    if (res && res.timestamp && res.humidity) {
                        return {
                            label: new Date(parseInt(res.timestamp.$date.$numberLong)).toLocaleTimeString(),
                            y: parseInt(res.humidity.$numberInt || res.humidity)
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                if (options.length > 0) {
                    drawLinePlot("Độ ẩm %", options, "g/m<sup>3</sup>");
                } else {
                    console.log("Không có dữ liệu hợp lệ");
                }
            } else {
                console.log("Không có dữ liệu hoặc dữ liệu không đúng định dạng", data);
            }
        })
        .catch(error => {
            console.error("Error fetching humidity data:", error);
        });
    }

    function drawLinePlot(title, dataPoints, unit) {
        if (chart) {
            chart.destroy();
        }
        chart = new Chart(sensorChart, {
            type: 'line',
            data: {
                labels: dataPoints.map(dp => dp.label),
                datasets: [{
                    label: title,
                    data: dataPoints.map(dp => dp.y),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.raw + ' ' + unit;
                            }
                        }
                    }
                }
            }
        });
    }

    // Khởi tạo với deviceId đầu tiên
    if (roomSelect.value) {
        fetchDataAndDrawChart(roomSelect.value);
    }
});