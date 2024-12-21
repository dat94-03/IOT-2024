document.getElementById('addRoomForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const roomName = document.getElementById('roomName').value;
    const deviceId = document.getElementById('deviceId').value;
    const baseUrl = 'http://localhost:3000';

    try {
        // Kiểm tra tính khả dụng của deviceId
        const checkResponse = await fetch(`${baseUrl}/api/available-device/check/${deviceId}`);
        const checkData = await checkResponse.json();

        if (!checkResponse.ok || !checkData.available) {
            alert('Device ID không hợp lệ hoặc đã được sử dụng');
            return;
        }

        // Nếu deviceId hợp lệ, tiến hành thêm phòng
        const response = await fetch(baseUrl + '/api/device-mapping/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomName,
                deviceId
            })
        });

        if (response.ok) {
            alert('Phòng đã được thêm thành công!');
            window.location.href = '/frontend/roomList.html';
        } else {
            const errorData = await response.json();
            alert('Lỗi: ' + errorData.err);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Đã xảy ra lỗi trong quá trình thêm phòng.');
    }
});
