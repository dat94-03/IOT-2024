document.getElementById('addRoomForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const roomName = document.getElementById('roomName').value;
    const deviceId = document.getElementById('deviceId').value;

    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:3000';

    try {
        const response = await fetch(baseUrl + '/api/device-mapping/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // nếu cần token bảo mật
            },
            body: JSON.stringify({
                roomName,
                deviceId
            })
        });

        if (response.ok) {
            alert('Phòng đã được thêm thành công!');
            window.location.href = '/frontend/roomList.html'; // Quay lại trang danh sách phòng sau khi thêm
        } else {
            const errorData = await response.json();
            alert('Lỗi: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error adding room:', error);
        alert('Đã xảy ra lỗi trong quá trình thêm phòng.');
    }
});
