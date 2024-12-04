document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';
    const roomSelect = document.getElementById('roomSelect');
    const sensorChart = document.getElementById('sensorChart');
    let chart;

    const chartTypeSelect = document.getElementById('chartTypeSelect');

    roomSelect.addEventListener('change', function () {
        const deviceId = this.value;
        if (deviceId) {
            fetchDataAndDrawChart(deviceId);
        }
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

    // Thêm function mới
    async function loadRoomMappings() {
        try {
            const response = await fetch(baseUrl + '/api/device-mapping/all');
            const data = await response.json();
            
            const roomSelect = document.getElementById('roomSelect');
            roomSelect.innerHTML = '<option value="">Chọn phòng</option>';
            
            if (data.mappings && data.mappings.length > 0) {
                data.mappings.forEach(mapping => {
                    const option = document.createElement('option');
                    option.value = mapping.deviceId;
                    option.textContent = mapping.roomName;
                    roomSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách phòng:', error);
        }
    }

    // Sửa lại phần xử lý form thêm thiết bị
    document.getElementById('deviceMappingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const deviceId = document.getElementById('deviceId').value;
        const roomName = document.getElementById('roomName').value;
        const messageDiv = document.getElementById('mappingMessage');

        try {
            const response = await fetch(baseUrl + '/api/device-mapping/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ deviceId, roomName })
            });

            const data = await response.json();
            
            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Thêm thiết bị thành công!';
                document.getElementById('deviceId').value = '';
                // Tải lại danh sách phòng sau khi thêm thành công
                loadRoomMappings();
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = data.err || 'Có lỗi xảy ra';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Lỗi kết nối server';
        }
    });

    // Thêm vào phần document.addEventListener('DOMContentLoaded', ...)
    loadRoomMappings();
    
    // Thêm event listener cho nút refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadRoomMappings();
        const deviceId = roomSelect.value;
        if (deviceId) {
            fetchDataAndDrawChart(deviceId);
        }
    });
});