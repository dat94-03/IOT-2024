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

    let lastTemperature = null;
    let lastTempCheckTime = null;
    const tempThreshold = 10; // Ngưỡng thay đổi nhiệt độ (độ C)
    const tempCheckInterval = 5 * 60 * 1000; // 5 phút
    const gasThreshold = 1; // Ngưỡng gas

    // Thêm hàm kiểm tra nhiệt độ
    function checkTemperatureChange(currentTemp, roomName) {
        const now = Date.now();
        
        if (lastTemperature !== null && lastTempCheckTime !== null) {
            const tempDiff = Math.abs(currentTemp - lastTemperature);
            const timeDiff = now - lastTempCheckTime;
            
            if (tempDiff >= tempThreshold && timeDiff <= tempCheckInterval) {
                const tempAlert = document.getElementById('tempAlert');
                tempAlert.style.display = 'flex';
                tempAlert.querySelector('.alert-message').textContent = 
                    `Cảnh báo: Nhiệt độ tại ${roomName} thay đổi ${tempDiff.toFixed(1)}°C trong ${(timeDiff/1000/60).toFixed(1)} phút!`;
            }
        }
        
        lastTemperature = currentTemp;
        lastTempCheckTime = now;
    }

    // Thêm hàm kiểm tra ngưỡng nhiệt độ
    function checkTemperatureThreshold(temperature, roomName) {
        if (temperature > 25 || temperature < 20) {
            const tempThresholdAlert = document.getElementById('tempThresholdAlert');
            tempThresholdAlert.style.display = 'flex';
            const message = temperature > 25 
                ? `Cảnh báo: Nhiệt độ tại ${roomName} quá cao (${temperature}°C)!`
                : `Cảnh báo: Nhiệt độ tại ${roomName} quá thấp (${temperature}°C)!`;
            tempThresholdAlert.querySelector('.alert-message').textContent = message;
        }
    }

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
            if (data && data.result && Array.isArray(data.result)) {
                const latestData = data.result[0];
                if (latestData) {
                    // Cập nhật giá trị hiển thị
                    document.getElementById('tempValue').textContent = `${latestData.temperature}°C`;
                    document.getElementById('humidValue').textContent = `${latestData.humidity}%`;
                    document.getElementById('gasValue').textContent = `${latestData.gasLevel}`;

                    // Kiểm tra nhiệt độ
                    const selectedRoom = roomSelect.options[roomSelect.selectedIndex].text;
                    checkTemperatureChange(latestData.temperature, selectedRoom);

                    // Thêm kiểm tra ngưỡng nhiệt độ
                    checkTemperatureThreshold(latestData.temperature, selectedRoom);

                    // Kiểm tra gas
                    const gasAlert = document.getElementById('gasAlert');
                    if (latestData.gasLevel > gasThreshold) {
                        gasAlert.style.display = 'flex';
                    } else {
                        gasAlert.style.display = 'none';
                    }
                }

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

    // Thêm xử lý nút tắt còi
    document.getElementById('stopBuzzerBtn').addEventListener('click', () => {
        try {
            const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
            const options = {
                clientId: clientId,
                username: 'AnhDuc',
                password: 'DucIot2024',
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 1000,
                // Xóa protocol: 'wss' vì đã được chỉ định trong URL
            };
    
            // Sửa URL kết nối để sử dụng port 8884 thay vì 8883
            const client = mqtt.connect('wss://d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud:8884/mqtt', options);

            client.on('connect', () => {
                console.log('Kết nối MQTT thành công');
                // Sửa lại message thành "off buzzer" trực tiếp
                client.publish('iot_hust/command', 'off buzzer', 
                    { qos: 0, retain: false }, 
                    (error) => {
                        if (error) {
                            console.error('Lỗi khi gửi lệnh:', error);
                            alert('Có lỗi xảy ra khi gửi lệnh tắt còi!');
                        } else {
                            alert('Đã gửi lệnh tắt còi báo động!');
                        }
                        client.end();
                    }
                );
            });
            client.on('error', (error) => {
                console.error('Lỗi kết nối MQTT:', error);
                alert('Có lỗi xảy ra khi kết nối MQTT!');
                client.end();
            });

            client.on('close', () => {
                console.log('Đã đóng kết nối MQTT');
            });

        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra!');
        }
    });
    
   

});