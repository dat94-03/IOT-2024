document.addEventListener('DOMContentLoaded', function () {
    // Hiển thị tên người dùng
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userNameDisplay').textContent = `Xin chào, ${userName}`;
    }

    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';
    // const roomSelect = document.getElementById('roomSelect');
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    const sensorChart = document.getElementById('sensorChart');
    let chart;
    fetchRoomName(deviceId);
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
    const tempThreshold = {
        low: 20,     // Ngưỡng nhiệt độ thấp
        high: 30     // Ngưỡng nhiệt độ cao
    };
    const tempChange = 10;
    const tempCheckInterval = 5 * 60 * 1000; // 5 phút
    const gasThreshold = {
        warning: 200,  // Ngưỡng cảnh báo
        danger: 300 // Ngưỡng nguy hiểm
    };

    // Thêm hàm kiểm tra nhiệt độ
    function checkTemperatureChange(currentTemp) {
        const now = Date.now();
        
        if (lastTemperature !== null && lastTempCheckTime !== null) {
            const tempDiff = Math.abs(currentTemp - lastTemperature);
            const timeDiff = now - lastTempCheckTime;
            
            if (tempDiff >= tempChange && timeDiff <= tempCheckInterval) {
                const tempAlert = document.getElementById('tempAlert');
                tempAlert.style.display = 'flex';
                tempAlert.querySelector('.alert-message').textContent = 
                    `Cảnh báo: Nhiệt độ thay đổi ${tempDiff.toFixed(1)}°C trong ${(timeDiff/1000/60).toFixed(1)} phút!`;
            }
        }
        
        lastTemperature = currentTemp;
        lastTempCheckTime = now;
    }

    // Hàm kiểm tra ngưỡng nhiệt độ
    function checkTemperatureThreshold(temperature) {
        const tempAlertModal = document.getElementById('tempAlertModal');
        const alertMessage = tempAlertModal.querySelector('.alert-message');
        
        if (temperature > tempThreshold.high) {
            tempAlertModal.style.display = 'block';
            alertMessage.textContent = `Cảnh báo: Nhiệt độ quá cao (${temperature}°C)!`;
            alertMessage.style.color = '#721c24'; // Màu đỏ cho nhiệt độ cao
            tempAlertModal.querySelector('.modal-header').className = 'modal-header danger';
            return true;
        } else if (temperature < tempThreshold.low) {
            tempAlertModal.style.display = 'block';
            alertMessage.textContent = `Cảnh báo: Nhiệt độ quá thấp (${temperature}°C)!`;
            alertMessage.style.color = '#856404'; // Màu vàng cho nhiệt độ thấp
            tempAlertModal.querySelector('.modal-header').className = 'modal-header warning';
            return true;
        }
        return false;
    }

    // Thêm hàm kiểm tra ngưỡng khí gas
    function checkGasThreshold(gasLevel) {
        const gasAlertModal = document.getElementById('gasAlertModal');
        const alertMessage = gasAlertModal.querySelector('.alert-message');
        
        if (gasLevel > gasThreshold.danger) {
            gasAlertModal.style.display = 'block';
            alertMessage.textContent = `Cảnh báo: Nồng độ khí gas rất cao (${gasLevel})! Nguy hiểm!`;
            alertMessage.style.color = '#721c24'; // Màu đỏ cho mức nguy hiểm
            return true;
        } else if (gasLevel > gasThreshold.warning) {
            gasAlertModal.style.display = 'block';
            alertMessage.textContent = `Cảnh báo: Nồng độ khí gas cao (${gasLevel})!`;
            alertMessage.style.color = '#856404'; // Màu vàng cho mức cảnh báo
            return true;
        }
        return false;
    }

   
    
    document.getElementById('backBtn').addEventListener('click', () => {

            window.location.href = '/frontend/roomList.html';
    
    });

    

    function fetchDataAndDrawChart(deviceId) {
        // console.log('Device ID gửi tới API:', deviceId);
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
            // console.log(data)
            if (data && data.result && Array.isArray(data.result)) {
                const latestData = data.result[0];
                if (latestData) {
                    // Cập nhật giá trị hiển thị
                    document.getElementById('tempValue').textContent = `${latestData.temperature}°C`;
                    document.getElementById('humidValue').textContent = `${latestData.humidity}%`;
                    document.getElementById('gasValue').textContent = `${latestData.gasLevel}`;

                    // Kiểm tra các ngưỡng
                    const isTempAbnormal = checkTemperatureThreshold(latestData.temperature);
                    const isGasHigh = checkGasThreshold(latestData.gasLevel);
                    
                    // Ẩn các modal nếu giá trị trở về bình thường
                    if (!isTempAbnormal) {
                        tempAlertModal.style.display = 'none';
                    }
                    if (!isGasHigh) {
                        gasAlertModal.style.display = 'none';
                    }

                    // Kiểm tra nhiệt độ
                    // const selectedRoom = JSON.stringify(fetchRoomName(deviceId));
                    
                    // console.log(`selectedRoom: ${typeof(selectedRoom)}`);
                    // console.log(`selectedRoom la: ${selectedRoom}`);
                    checkTemperatureChange(latestData.temperature);

                    // Thêm kiểm tra ngưỡng nhiệt độ
                    checkTemperatureThreshold(latestData.temperature);
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

    // Xử lý tắt còi báo động
    document.getElementById('stopBuzzerBtn').addEventListener('click',  () => {
        console.log('Stopping buzzer - button clicked');
        gasAlertModal.style.display = 'none';
        try {
            const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
            console.log('Connecting to MQTT with clientId:', clientId);

            const client = mqtt.connect('wss://d2d60be70c7847508b58bd5018279da5.s1.eu.hivemq.cloud:8884/mqtt', {
                clientId: clientId,
                username: 'AnhDuc',
                password: 'DucIot2024',
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 1000,
            });

            client.on('connect', () => {
                console.log('MQTT Connected successfully');
                
                // Gửi lệnh tắt còi
                const command = 'off buzzer';
                console.log('Publishing command:', command);
                
                client.publish('iot_hust/command', command, { qos: 0, retain: false }, 
                    (error) => {
                        if (error) {
                            console.error('MQTT Publish error:', error);
                            alert('Có lỗi xảy ra khi gửi lệnh tắt còi!');
                            gasAlertModal.style.display = 'block';
                        } else {
                            console.log('MQTT Command sent successfully');
                            setTimeout(() => {
                                fetchDataAndDrawChart(deviceId);
                            }, 2000);
                        }
                        client.end(() => {
                            console.log('MQTT Connection closed');
                        });
                    }
                );
            });

            client.on('error', (error) => {
                console.error('MQTT Connection error:', error);
                alert('Có lỗi xảy ra khi kết nối MQTT!');
                gasAlertModal.style.display = 'block';
                client.end();
            });

            client.on('close', () => {
                console.log('MQTT Connection closed');
            });

        } catch (error) {
            console.error('Error in stopBuzzer function:', error);
            alert('Có lỗi xảy ra!');
            gasAlertModal.style.display = 'block';
        }
    });

    // Xử lý đóng modal
    const closeModalBtn = document.querySelector('.close-modal');
    const gasAlertModal = document.getElementById('gasAlertModal');

    closeModalBtn.addEventListener('click', () => {
        gasAlertModal.style.display = 'none';
    });

    // Đóng modal khi click bên ngoài
    window.addEventListener('click', (event) => {
        if (event.target === gasAlertModal) {
            gasAlertModal.style.display = 'none';
        }
    });

    // Thêm interval để kiểm tra định kỳ
    const checkInterval = setInterval(() => {
        if (deviceId) {
            fetchDataAndDrawChart(deviceId);
        }
    }, 5000); // Kiểm tra mỗi 5 giây

    // Cleanup interval khi component unmount
    window.addEventListener('beforeunload', () => {
        clearInterval(checkInterval);
    });
    
    function fetchRoomName(deviceId) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Cập nhật Device ID ngay lập tức
        document.getElementById('currentDeviceId').textContent = deviceId;
        
        fetch(`${baseUrl}/api/device-mapping/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.mappings) {
                // Tìm thiết bị có deviceId và userId tương ứng
                const device = data.mappings.find(mapping => 
                    mapping.deviceId === deviceId && 
                    mapping.userId === userId
                );
                
                if (device) {
                    // Cập nhật tiêu đề với tên phòng
                    const header = document.querySelector('header h1');
                    header.textContent = `Hệ thống giám sát nhà từ xa - ${device.roomName}`;
                    
                    // Cập nhật thông tin phòng trong phần device info
                    document.getElementById('currentRoomName').textContent = device.roomName;
                } else {
                    console.log('Device not found in mappings');
                    const header = document.querySelector('header h1');
                    header.textContent = `Hệ thống giám sát nhà từ xa - Unknown Room`;
                    document.getElementById('currentRoomName').textContent = 'Unknown Room';
                }
            }
        })
        .catch(error => {
            console.error("Error fetching mappings:", error);
            const header = document.querySelector('header h1');
            header.textContent = `Hệ thống giám sát nhà từ xa - Unknown Room`;
            document.getElementById('currentRoomName').textContent = 'Unknown Room';
        });
    }
   
    
});

// Cập nhật style cho modal để phân biệt các mức cảnh báo
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .modal-header.warning {
        background-color: #fff3cd;
        color: #856404;
    }
    
    .modal-header.danger {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    .alert-message.warning {
        color: #856404;
    }
    
    .alert-message.danger {
        color: #721c24;
    }

    .modal-actions button {
        padding: 8px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        border: none;
        margin-left: 10px;
    }

    .close-modal-temp {
        background-color: #6c757d;
        color: white;
    }

    .close-modal-temp:hover {
        background-color: #5a6268;
    }
`;
document.head.appendChild(styleSheet);
