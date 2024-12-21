document.getElementById('addRoomForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const roomName = document.getElementById('roomName').value;
    const deviceId = document.getElementById('deviceId').value;
    const baseUrl = 'http://localhost:3000';
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(baseUrl + '/api/device-mapping/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomName,
                deviceId
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Phòng đã được thêm thành công!');
            window.location.href = '/frontend/roomList.html';
        } else {
            alert('Lỗi: ' + data.err);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Đã xảy ra lỗi trong quá trình thêm phòng.');
    }
});
