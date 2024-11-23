var baseUrl = "http://localhost:3000";

function loginFunction() {
    let email = $("#email").val();
    let password = $("#password").val();
    $.ajax({
        url: baseUrl + '/api/auth/login',
        type: "post",
        dataType: "json",   
        contentType: "application/json; charset=UTF-8",
        data: JSON.stringify({
            email: email,
            password: password
        }),
        success: function(data) {
            localStorage.setItem("token", "Bearer " + data.token);
            localStorage.setItem("nameUser", data.user.name);
            location.href = "./index.html";
        },
        error: function(err) {
            console.log(err)
            alert("Tài khoản mật khẩu không chính xác")
        }
    })

    
}