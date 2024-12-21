async function fetchRooms() {
    try {
        // Hiển thị tên người dùng
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userNameDisplay').textContent = `Xin chào, ${userName}`;
    }

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
        roomListContainer.innerHTML = '';  // Xóa nội dung c trước khi render

        // Duyệt qua danh sách các phòng và tạo các phần tử HTML cho mỗi phòng
        Object.entries(rooms).forEach(([key, room]) => {
            const roomElement = document.createElement('div');
            roomElement.classList.add('card');

            roomElement.innerHTML = `
                <img src="/frontend/Assets/iot.png" class="card__icon" alt="IoT Icon" />
                <button class="delete-icon">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="card__overlay">
                    <div class="card__header">
                        <svg class="card__arc" xmlns="http://www.w3.org/2000/svg"><path /></svg>
                        <div class="card__header-text">
                            <h3 class="card__title">${room.roomName}</h3>
                            <span class="card__status">Device ID: ${room.deviceId}</span>
                        </div>
                    </div>
                    <p class="card__description">Nhấn để xem chi tiết thông tin và điều khiển thiết bị trong phòng</p>
                </div>
            `;

            // Thêm sự kiện click cho toàn bộ container
            roomElement.onclick = (event) => {
                if (!event.target.closest('.delete-icon')) {
                    const params = new URLSearchParams({
                        deviceId: room.deviceId,
                    });
                    window.location.href = `/frontend/dashboard.html?${params.toString()}`;
                }
            };

            // Thêm sự kiện cho nút xóa
            const deleteButton = roomElement.querySelector('.delete-icon');
            deleteButton.onclick = async (event) => {
                event.stopPropagation(); // Ngăn sự kiện click lan ra container
                if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(baseUrl + `/api/device-mapping/remove/${room.deviceId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (response.ok) {
                            roomElement.remove();
                            alert('Phòng đã được xóa thành công!');
                        } else {
                            const errorData = await response.json();
                            alert('Lỗi khi xóa phòng: ' + (errorData.err || 'Không xác định'));
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Đã xảy ra lỗi khi xóa phòng');
                    }
                }
            };

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
