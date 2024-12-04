document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';
    const roomSelect = document.getElementById('roomSelect');
    const sensorChart = document.getElementById('sensorChart');
    let chart;

    const chartTypeSelect = document.getElementById('chartTypeSelect');

    roomSelect.addEventListener('change', function () {
        const deviceId = roomSelect.value;
        fetchDataAndDrawChart(deviceId);
    });

    chartTypeSelect.addEventListener('change', function () {
        const deviceId = roomSelect.value;
        fetchDataAndDrawChart(deviceId);
    });

    function fetchDataAndDrawChart(deviceId) {
        fetch(baseUrl + '/api/data', {
            method: 'POST',
            headers: {
                'authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deviceId: deviceId })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data && data.result && Array.isArray(data.result)) {
                const chartType = chartTypeSelect.value;
                const options = data.result.map(res => {
                    if (res && res.timestamp) {
                        const value = chartType === 'temperature' ? res.temperature : res.humidity;
                        return {
                            label: new Date(res.timestamp).toLocaleTimeString(),
                            y: value
                        };
                    }
                    return null;
                }).filter(item => item !== null);

                if (options.length > 0) {
                    const title = chartType === 'temperature' ? "Nhiệt độ °C" : "Độ ẩm %";
                    const unit = chartType === 'temperature' ? "°C" : "%";
                    drawLinePlot(title, options, unit);
                } else {
                    console.log("Không có dữ liệu hợp lệ");
                }
            } else {
                console.log("Không có dữ liệu hoặc dữ liệu không đúng định dạng", data);
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }

    function drawLinePlot(title, dataPoints, unit) {
        const labels = dataPoints.map(dp => dp.label);
        const values = dataPoints.map(dp => dp.y);

        const trace = {
            x: labels,
            y: values,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'rgba(75, 192, 192, 1)' },
            name: title
        };

        const layout = {
            title: title,
            xaxis: {
                title: 'Time'
            },
            yaxis: {
                title: unit
            }
        };

        Plotly.newPlot('sensorChart', [trace], layout);
    }

    // Khởi tạo với deviceId đầu tiên
    if (roomSelect.value) {
        fetchDataAndDrawChart(roomSelect.value);
    }
});