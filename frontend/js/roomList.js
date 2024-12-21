async function fetchRooms() {
    try {
        const token = localStorage.getItem('token');
        const baseUrl = 'http://localhost:3000';
        const rooms = {};

        try {
            const response = await fetch(baseUrl + '/api/device-mapping/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            const datas = data.mappings;
            datas.forEach(data => {
                rooms[data.deviceId] = data;
            });
        } catch (error) {
            console.error('Lỗi khi tải danh sách phòng:', error);
        }

        // Lấy container để hiển thị danh sách phòng
        const roomListContainer = document.getElementById('roomList');
        roomListContainer.innerHTML = '';  // Xóa nội dung cũ trước khi render

        // Duyệt qua danh sách các phòng và tạo các phần tử HTML cho mỗi phòng
        Object.entries(rooms).forEach(([key, room]) => {
            const roomElement = document.createElement('div');
            roomElement.classList.add('room-card', 'relative'); // Thêm class relative để dễ dàng định vị icon

            // Thêm icon xóa ở góc trên cùng
            const deleteIcon = document.createElement('button');
            deleteIcon.innerHTML = '<i class="fas fa-trash delete-icon"></i>'; // Thùng rác icon từ Font Awesome
            deleteIcon.classList.add('delete-icon', 'absolute', 'top-2', 'right-2', 'bg-red-500', 'hover:bg-red-600', 'p-2', 'rounded-full');
            deleteIcon.onclick = async () => {
                if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
                    try {
                        // Gửi yêu cầu DELETE đến server để xóa phòng
                        const response = await fetch(baseUrl + `/api/device-mapping/remove/${room.deviceId}`, {
                            method: 'DELETE',
                        });

                        if (response.ok) {
                            // Xóa phòng khỏi DOM nếu xóa thành công
                            roomElement.remove();
                            alert('Phòng đã được xóa thành công!');
                        } else {
                            const errorData = await response.json();
                            alert('Lỗi: ' + errorData.message);
                        }
                    } catch (error) {
                        console.error('Lỗi khi xóa phòng:', error);
                        alert('Đã xảy ra lỗi trong quá trình xóa phòng.');
                    }
                }
            };
            roomElement.appendChild(deleteIcon);

            // Image placeholder, bạn có thể thay đổi tùy theo dữ liệu
            const roomImage = document.createElement('img');
            roomImage.src = 'https://via.placeholder.com/200';  // Sử dụng ảnh placeholder
            roomImage.classList.add('room-image');
            roomElement.appendChild(roomImage);

            // Room name và description
            const roomName = document.createElement('h3');
            roomName.innerText = room.roomName;
            roomName.classList.add('room-name');
            roomElement.appendChild(roomName);

            const roomDescription = document.createElement('p');
            roomDescription.innerText = `Device ID: ${room.deviceId}`;
            roomDescription.classList.add('room-description');
            roomElement.appendChild(roomDescription);

            // Button xem chi tiết
            const buttonView = document.createElement('button');
            buttonView.innerText = 'Xem chi tiết';
            buttonView.classList.add('button');
            buttonView.onclick = () => {
                // Sử dụng URLSearchParams để tạo query string
                const params = new URLSearchParams({
                    deviceId: room.deviceId,
                    // roomName: room.name
                });
                console.log(params)
                // Điều hướng đến dashboard.html với các tham số
                window.location.href = `/frontend/dashboard.html?${params.toString()}`;
            };
            roomElement.appendChild(buttonView);


            roomListContainer.appendChild(roomElement);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
    // dang xuat
    document.getElementById('logoutBtn').addEventListener('click', function () {
        // Xóa dữ liệu người dùng (ví dụ: token, session) từ localStorage hoặc sessionStorage
        localStorage.removeItem('Token');
        localStorage.removeItem('userName');
        // Hoặc sessionStorage.removeItem(...) nếu bạn sử dụng sessionStorage
    
        // Điều hướng về trang đăng nhập
        window.location.href = '/frontend/index.html';
    });
}

// Gọi hàm fetch khi trang được load
window.onload = fetchRooms;
