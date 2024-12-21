document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Kiểm tra mật khẩu trùng khớp
    if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Mật khẩu nhập lại không khớp';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Đăng ký thành công
            alert('Đăng ký thành công!');
            window.location.href = 'index.html'; // Chuyển đến trang đăng nhập
        } else {
            // Hiển thị lỗi
            document.getElementById('error-message').textContent = data.message || 'Đăng ký thất bại';
        }
    } catch (error) {
        document.getElementById('error-message').textContent = 'Có lỗi xảy ra, vui lòng thử lại';
    }
}); 