document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';
    // const roomSelect = document.getElementById('roomSelect');
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    const sensorChart = document.getElementById('sensorChart');
    let chart;
    fetchDataAndDrawChart(deviceId);
    const chartTypeSelect = document.getElementById('chartTypeSelect');

    // roomSelect.addEventListener('change', function () {
    //     const deviceId = this.value;
    //     if (deviceId) {
    //         fetchDataAndDrawChart(deviceId);
    //     }
    // });

    chartTypeSelect.addEventListener('change', function () {
        fetchDataAndDrawChart(deviceId);
    });

    let lastTemperature = null;
    let lastTempCheckTime = null;
    const tempThreshold = 10; // Ngưỡng thay đổi nhiệt độ (độ C)
    const tempCheckInterval = 5 * 60 * 1000; // 5 phút
    const gasThreshold = 1; // Ngưỡng gas

    // Thêm hàm kiểm tra nhiệt độ
    function checkTemperatureChange(currentTemp) {
        const now = Date.now();
        
        if (lastTemperature !== null && lastTempCheckTime !== null) {
            const tempDiff = Math.abs(currentTemp - lastTemperature);
            const timeDiff = now - lastTempCheckTime;
            
            if (tempDiff >= tempThreshold && timeDiff <= tempCheckInterval) {
                const tempAlert = document.getElementById('tempAlert');
                tempAlert.style.display = 'flex';
                tempAlert.querySelector('.alert-message').textContent = 
                    `Cảnh báo: Nhiệt độ thay đổi ${tempDiff.toFixed(1)}°C trong ${(timeDiff/1000/60).toFixed(1)} phút!`;
            }
        }
        
        lastTemperature = currentTemp;
        lastTempCheckTime = now;
    }

    // Thêm hàm kiểm tra ngưỡng nhiệt độ
    function checkTemperatureThreshold(temperature) {
        if (temperature > 25 || temperature < 20) {
            const tempThresholdAlert = document.getElementById('tempThresholdAlert');
            tempThresholdAlert.style.display = 'flex';
            const message = temperature > 25 
                ? `Cảnh báo: Nhiệt độ quá cao (${temperature}°C)!`
                : `Cảnh báo: Nhiệt độ quá thấp (${temperature}°C)!`;
            tempThresholdAlert.querySelector('.alert-message').textContent = message;
        }
    }

   
    
    document.getElementById('backBtn').addEventListener('click', () => {

            window.location.href = '/frontend/roomList.html';
    
    });

    

    function fetchDataAndDrawChart(deviceId) {
        console.log('Device ID gửi tới API:', deviceId);
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
            console.log(data)
            if (data && data.result && Array.isArray(data.result)) {
                const latestData = data.result[0];
                if (latestData) {
                    // Cập nhật giá trị hiển thị
                    document.getElementById('tempValue').textContent = `${latestData.temperature}°C`;
                    document.getElementById('humidValue').textContent = `${latestData.humidity}%`;
                    document.getElementById('gasValue').textContent = `${latestData.gasLevel}`;

                    // Kiểm tra nhiệt độ
                    // const selectedRoom = JSON.stringify(fetchRoomName(deviceId));
                    
                    // console.log(`selectedRoom: ${typeof(selectedRoom)}`);
                    // console.log(`selectedRoom la: ${selectedRoom}`);
                    checkTemperatureChange(latestData.temperature);

                    // Thêm kiểm tra ngưỡng nhiệt độ
                    checkTemperatureThreshold(latestData.temperature);

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
    
        const maxY = Math.max(...values); // Tìm giá trị lớn nhất
        const minY = Math.min(...values); // Tìm giá trị nhỏ nhất
    
        const step = Math.ceil(labels.length / 5); // Chọn khoảng cách giữa các nhãn x để chỉ hiển thị 5 nhãn
        const tickvals = labels.filter((_, index) => index % step === 0); // Lấy các nhãn cách đều
    
        const trace = {
            x: labels,
            y: values,
            type: 'scatter',
            mode: 'lines',
            marker: { 
                color: '#a6c1ee', // Màu dot
                size: 6 // Kích thước nhỏ hơn
            },
            line: {
                color: 'rgba(75, 192, 192, 0.8)', // Màu đường
                width: 2 // Độ dày đường
            },
            name: title
        };
    
        const layout = {
            title: {
                text: title,
                font: {
                    family: 'Arial, sans-serif',
                    size: 24,
                    color: '#333'
                }
            },
            xaxis: {
                title: {
                    text: 'Time',
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: '#333'
                    }
                },
                tickmode: 'array',
                tickvals: tickvals,
                ticktext: tickvals,
                tickfont: {
                    family: 'Arial, sans-serif',
                    size: 14,
                    color: '#555'
                },
                showgrid: true,
                gridcolor: '#aaa'
            },
            yaxis: {
                title: {
                    text: unit,
                    font: {
                        family: 'Arial, sans-serif',
                        size: 18,
                        color: '#333'
                    }
                },
                range: [minY - 1, maxY + 1],
                tickfont: {
                    family: 'Arial, sans-serif',
                    size: 14,
                    color: '#555'
                },
                showgrid: true,
                gridcolor: '#aaa'
            },
            plot_bgcolor: '#cfdeed',
            paper_bgcolor: '#cfdeed',
            margin: {
                l: 50,
                r: 30,
                t: 50,
                b: 50
            },
            hovermode: 'closest'
        };
    
        Plotly.newPlot('sensorChart', [trace], layout);
    }
    
    // Đăng xuất khi bấm vào nút "Đăng xuất"
document.getElementById('logoutBtn').addEventListener('click', function () {
    // Xóa dữ liệu người dùng (ví dụ: token, session) từ localStorage hoặc sessionStorage
    localStorage.removeItem('Token');
    localStorage.removeItem('userName');
    // Hoặc sessionStorage.removeItem(...) nếu bạn sử dụng sessionStorage

    // Điều hướng về trang đăng nhập
    window.location.href = '/frontend/index.html';
});

    

    
    // Thêm event listener cho nút refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
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