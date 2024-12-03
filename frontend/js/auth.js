document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('error-message').textContent = 
                data.err || 'Đăng nhập thất bại';
        }
    } catch (error) {
        document.getElementById('error-message').textContent = 
            'Lỗi kết nối server';
    }
}); 