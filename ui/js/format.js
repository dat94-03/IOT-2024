/**
 * Định dạng hiển thị ngày tháng năm
 * @param {Date} value
 * @return {string}
 * Author: NVMANH (26/08/2022) THVUONG (27/08/2022)
 */
 function formatDate(value) {
    if (!value)
        return "";
    const dateValue = new Date(value);

    // Lấy ra ngày:
    value = dateValue.getDate();
    const date = value < 10 ? "0" + value : value;

    // lấy ra tháng:
    value = dateValue.getMonth() + 1;
    const month = value < 10 ? "0" + value : value;

    // lấy ra năm:
    const year = dateValue.getFullYear();

    return date + "/" + month + "/" + year;
}

/**
 * Định dạng hiển thị tiền VND
 * @param {number} money 
 * @return {string}
 * Author: NVMANH (26/08/2022) THVUONG (27/08/2022)
 */
 function formatMoney(money) {
    const format = new Intl.NumberFormat('vn-VI', { style: 'currency', currency: 'VND' });
    return (format != undefined) ? format.format(money) : "";
}

/**
 * Kiểm tra định dạng hiển thị email
 * @param {string} email 
 * @return {RegExpMatchArray | null}
 * Author: NVMANH (26/08/2022) THVUONG (27/08/2022)
 */
function checkEmailFormat(email) {
    if (email.startsWith(".")) return null;
    // `[^@[\\]<>(),:;\\.\\s\\\\"]` là 1 ký tự 
    // khác `@` `[` `]` `<` `>` `(` `)` `,` `:` `;` `.` khoảngtrắng `\` `"`
    const aChar = `[^@[\\]<>(),:;\\.\\s\\\\"]`;
    // `\.?X` tương đương với `.X` hoặc`X`
    // `X+` tương đương với `X` hoặc `XX` hoặc `XXX` vân vân
    const localName = `((\\.?${aChar})+)`;
    // `X\.` tương đương với `X`.
    // `X{2,}` tương đương với có ít nhất 2 ký tự trong chuỗi X
    const domainName = `((${aChar}+\\.)+${aChar}{2,})`;
    // ^...$ tức là xét từ đầu dòng đến cuối dòng
    const pattern = `^${localName}@${domainName}$`;
    return email.match(new RegExp(pattern, 'i'));
}

function validateFormatEmail(email) {
    // Kiểm tra email:
    if (!checkEmailFormat($(email).val())) {
        $(email).parent().addClass("input--error");
        $(email).attr('title', "Email không đúng định dạng.");
        $(email).parent().siblings(".notice").html("Email không đúng định dạng.");
    } else {
        $(email).parent().removeClass("input--error");
        $(email).removeAttr('title', "Email không đúng định dạng.");
        $(email).parent().siblings(".notice").html("");
    }
}

function validateRequiredInput(input) {
    // Kiểm tra value:
    if (!$(input).val()) {
        // Nếu value rỗng hoặc null thì hiển thị trạng thái lỗi:
        $(input).parent().addClass("input--error");
        $(input).attr('title', "Thông tin này không được phép để trống");
        $(input).parent().siblings(".notice").html("Thông tin này không được phép để trống");
    } else {
        // Nếu có value thì bỏ cảnh báo lỗi:
        $(input).parent().removeClass("input--error");
        $(input).removeAttr('title', "Thông tin này không được phép để trống");
        $(input).parent().siblings(".notice").html("");
        if ($(input).attr("type") == "email") {
            validateFormatEmail(input);
        }
    }
}

function validateDateInput(input) {
    // Kiểm tra value:
    if ($(input).val() == null || $(input).val() == "") {
        // Nếu không có value thì bỏ cảnh báo lỗi:
        $(input).parent().removeClass("input--error");
        $(input).removeAttr('title', "Ngày tháng năm không được lớn hơn hiện tại");
        $(input).parent().siblings(".notice").html("");
    }
    else {
        let date = new Date($(input).val());
        let now = new Date(Date.now());
        let deltaYear = date.getFullYear() - now.getFullYear();
        let deltaMonth = date.getMonth() - now.getMonth();
        let deltaDate = date.getDate() - now.getDate();
        if (deltaYear > 0 || (deltaYear == 0 && (deltaMonth > 0 || (deltaMonth == 0 && deltaDate > 0)))) {
            // Nếu không hợp lệ thì hiển thị trạng thái lỗi:
            $(input).parent().addClass("input--error");
            $(input).attr('title', "Ngày tháng năm không được lớn hơn hiện tại");
            $(input).parent().siblings(".notice").html("Ngày tháng năm không được lớn hơn hiện tại");
        }
        else {
            // Nếu hợp lệ thì bỏ cảnh báo lỗi:
            $(input).parent().removeClass("input--error");
            $(input).removeAttr('title', "Ngày tháng năm không được lớn hơn hiện tại");
            $(input).parent().siblings(".notice").html("");
        }
    }
}

function validateEmployeeInformation(){
    let isValid = 1;
    for (const input of $('#dlgEmployeeDetail input[required]')){
        inputObject = $(input)
        if (!inputObject.val()) {
            // Nếu value rỗng hoặc null thì hiển thị trạng thái lỗi:
            inputObject.addClass("input--error");
            inputObject.attr('title', "Thông tin này không được phép để trống");
            inputObject.siblings(".notice").html("Thông tin này không được phép để trống").css('color','red');
            if (isValid){
                inputObject.focus();
            }
            isValid = 0;
            //     focusFlag = 0
            // }
        } else {
            // Nếu có value thì bỏ cảnh báo lỗi:
            inputObject.removeClass("input--error");
            inputObject.removeAttr('title', "Thông tin này không được phép để trống");
            inputObject.siblings(".notice").html("");
            if (inputObject.attr("type") == "email") {
                if (!checkEmailFormat(inputObject.val())) {
                    inputObject.addClass("input--error");
                    inputObject.attr('title', "Email không đúng định dạng.");
                    inputObject.siblings(".notice").html("Email không đúng định dạng.").css('color','red');
                    if (isValid){
                        inputObject.focus();
                    }
                    isValid = 0;
                } else {
                    inputObject.removeClass("input--error");
                    inputObject.removeAttr('title', "Email không đúng định dạng.");
                    inputObject.siblings(".notice").html("");
                }
            }
        }
    }
    
    return isValid;
}

/**
 * Định dạng hiển thị tiền giới tính
 * @param {number} value 
 * @returns {string}
 */
function formatGender(value) {
    switch (value) {
        case 0:
            value = "";
            break;
        case 1:
            value = "Nam";
            break;
        case 2:
            value = "Nữ";
            break;
        case 3:
            value = "Khác";
            break;
        default:
            value = 0;
    }
    return value;
}

/**
 * Định dạng hiển thị tình trạng công việc
 * @param {number} value 
 * @returns {string}
 */
function formatWorkStatus(value) {
    switch (value) {
        case 0:
            value = "Đang làm việc";
            break;
        case 1:
            value = "Đang nghỉ phép";
            break;
        case 2:
            value = "Khác";
            break;
    }
    return value;
}