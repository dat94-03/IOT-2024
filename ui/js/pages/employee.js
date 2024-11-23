// Attr field value khớp field dữ liệu backend để dễ bảo trì, thay đổi 
const FIELD_ATTR = "field";

// Số lượng button pag number tối đa hiển thị trên navigation
const PAG_NUMBER_MAX_SIZE = 4;
let pageMaxNumber = 4;
let pageMinNumber = PAG_NUMBER_MAX_SIZE;

// 2 chế độ form ADD và EDIT
const ADD_EMPLOYEE = 0;
const EDIT_EMPLOYEE = 1;
let formMode = ADD_EMPLOYEE;

// Đánh dấu trang cuối cùng
const LAST_PAGE = 0;

// Từ khóa tìm kiếm
let keyword = null;

// Bản ghi đang được chọn
let employee = null;

// Số lượng tối đa dòng hiển thị trên bảng trên một trang
let pageSize = 20;
let pagePrevSize;

// Số thứ tự trang hiển thị hiện tại
let currentPage = 1;

// Vị trí đang được lựa chọn
let positionId = null;

// Phòng ban đang được lựa chọn
let departmentId = null;

// Trang hiển thị đầu tiên ở phần chọn trang
let firstPageNumber = 1;

// Trang hiển thị cuối ở phần chọn trang
let lastPageNumber = pageMaxNumber;

// Trang được chọn
let pageSelected = 1;

// Tổng số trang
let totalPage = 1;

// Kiểm tra có phải thực hiện chọn trang
let pageSelectMode = 0;

$(document).ready(function() {
    // gán các sự kiện cho các element:
    initEvents();

    // Load dữ liệu:
    loadData(1);
    
    // Tải các phòng ban đưa vào combobox  
    loadDepartment();

    // Tải các vị trí đưa vào combobox
    loadPosition();
})

var employeeId = null;
formMode = "add";

/**
 * Tạo các sự kiện
 * Author: NVMANH ()
 */
 function initEvents() {
    // Xác định từ khóa và hiển thị hint nếu không có nội dung
    $("#searchInput").blur(function (e) { 
        if ($(this).val() == "") {
            $("#searchInput").val("Tìm kiếm theo mã hoặc tên");
            keyword = null;
        } 
        else {
            keyword = $(this).val();
        }
    });
    // Enter thì kiểm tra có từ khóa thì gọi tải dữ liệu theo từ khóa
    $("#searchInput").keypress(function(e){
        if (e.which === 13) {
            $(this).blur();
            loadData(1); 
        }
    });

    // Khởi tạo sự kiện khi thay đổi thì load trang với lọc theo phòng ban mới
    $("#departmentComboBox").change(function(){
        departmentId = $(this).val() == "" ? null : $(this).val();
        loadData(1);
    })

    // Khởi tạo sự kiện khi thay đổi thì load trang với lọc theo vị trí mới
    $("#positionComboBox").change(function(){
        positionId = $(this).val() == "" ? null : $(this).val();
        loadData(1);
    })

    $("#paging select").change(function(){
        pagePrevSize = pageSize;
        pageSize = parseInt($(this).val());
        loadData(1);
    });

    $(document).on("click", "#paging .paging__number", function(){ 
        pageSelected = parseInt($(this).text());
        pageSelectMode = 1;
        loadData(pageSelected);
    });

    $('.paging__button--first').click(function(){
        firstPageNumber = 1;
        lastPageNumber = Math.min(totalPage, PAG_NUMBER_MAX_SIZE);
        resetNumberFooter();
    });

    $('.paging__button--last').click(function(){
        lastPageNumber = totalPage;
        firstPageNumber = Math.max(1, lastPageNumber - PAG_NUMBER_MAX_SIZE + 1);
        resetNumberFooter();
    });

    $('.paging__button--prev').click(function(){
        firstPageNumber = Math.max(1, firstPageNumber - PAG_NUMBER_MAX_SIZE);
        lastPageNumber = Math.min(totalPage, firstPageNumber + PAG_NUMBER_MAX_SIZE - 1);
        resetNumberFooter();
    });

    $('.paging__button--next').click(function(){
        lastPageNumber = Math.min(totalPage, lastPageNumber + PAG_NUMBER_MAX_SIZE);
        firstPageNumber = Math.max(1, lastPageNumber - PAG_NUMBER_MAX_SIZE + 1);
        resetNumberFooter();
    });

    // $("#paging .paging__number").click(function() {
    //     alert(1);
    // });

    $("#btnDelete").click(function() {
        $("#dlgDialog3").show();
    });

    $("#btnOk").click(function() {
        // Gọi api thực hiện xóa:
        //debugger
        $.ajax({
            type: "DELETE",
            url: "http://localhost:35246/api/v1/employees/" + employeeId,
            success: function(response) {
                $("#dlgDialog3").hide();
                // Load lại dữ liệu:
                loadData(1);
            }
        });
    });
    $("#btnSave").click(saveData);

    $(document).on('dblclick', 'table#tbEmployeeList tbody tr', function() {
        showInfoForm($(this), $(this).data('id'));
    });

    $(document).on('click', 'table#tbEmployeeList tbody tr', function() {
        // Xóa tất cả các trạng thái được chọn của các dòng dữ liệu khác:
        $(this).siblings().removeClass('row-selected');
        // In đậm dòng được chọn:
        this.classList.add("row-selected");
        employeeId = $(this).data('id');
    });
    // Gán sự kiện click cho button thêm mới nhân viên:
    var btnAdd = document.getElementById("btnAdd");

    btnAdd.addEventListener("click", function() {
        formMode = "add";
        // Hiển thị form nhập thông tin chi tin chi tiết:
        document.getElementById("dlgEmployeeDetail").style.display = "block";
        $('input').val(null);
        $('textarea').val(null);
        // Lấy mã nhân viên mới:
        $.ajax({
            url: "http://localhost:35246/api/v1/Employees/NewEmployeeCode",
            method: "GET",
            success: function(newEmployeeCode) {
                $("#txtEmployeeCode").val(newEmployeeCode);
                $("#txtEmployeeCode").focus();
            }
        });
    })

    $("#btnAdd").click(function() {
        // Hiển thị form
        $("#dlgEmployeeDetail").show();

        // Focus vào ô nhập liệu đầu tiên:
        //debugger
        $('#dlgEmployeeDetail input')[0].focus();
    })
    
    $("#btnDuplicate").click(function(){
        let employeeSelectedRow = $('table#tbEmployeeList tbody tr.row-selected');
        let employeeId = employeeSelectedRow.data('id');
        
        // Chỉ hiển thị form khi có dòng được chọn
        if (employeeId != null){
            showInfoForm(employeeSelectedRow, employeeId);
            $.ajax({
                url: "http://localhost:35246/api/v1/Employees/NewEmployeeCode",
                method: "GET",
                success: function(newEmployeeCode) {
                    $("#txtEmployeeCode").val(newEmployeeCode);
                }
            });
            formMode = ADD_EMPLOYEE;
        } else {
            alert("Cần chọn một hàng để nhân bản");
        }
    });

    $("#btnRefresh").click(function(){
        pageSelected = 1;
        loadData(1);
    })

    $(".dialog__button--close").click(function() {
        //debugger;
        // Ẩn dialog tương ứng với button close hiện tại:
        // this.parentElement.parentElement.style.display = "none";
        $('input[required]').removeClass("input--error").removeAttr('title');
        $('input[required]').siblings(".notice").html("");
        $(this).parents(".dialog").hide();
    })

    $(".button--cancel").click(function() {
        // Ẩn dialog tương ứng với button close hiện tại:
        // this.parentElement.parentElement.style.display = "none";
        $(this).parents(".dialog").hide();
    })

    $('input[required]').blur(function() {
        // Lấy ra value:
        var value = this.value;
        // Kiểm tra value:
        if (!value) {
            // ĐẶt trạng thái tương ứng:
            // Nếu value rỗng hoặc null thì hiển thị trạng thái lỗi:
            $(this).addClass("input--error");
            $(this).attr('title', "Thông tin này không được phép để trống");
        } else {
            // Nếu có value thì bỏ cảnh báo lỗi:
            $(this).removeClass("input--error");
            $(this).removeAttr('title');
            $(this).siblings(".notice").html("");
        }
    })

    $('input[type=email]').blur(function() {
        // Kiểm tra email:
        var email = this.value;
        var isEmail = checkEmailFormat(email);
        if (!isEmail) {
            console.log("Email KHÔNG đúng định dạng");
            $(this).addClass("input--error");
            $(this).attr('title', "Email không đúng định dạng.");
        } else {
            console.log("Email đúng định dạng");
            $(this).removeClass("input--error");
            $(this).removeAttr('title');
            $(this).siblings(".notice").html("");
        }
    })


}

/**
 * Thực hiện load dữ liệu lên table
 * Author: NVMANH (26/08/2022)
 */
// function loadData() {
//     // Gọi api thực hiện lấy dữ liệu:
//     console.log("CALL AJAX !!!!");
//     $.ajax({
//         type: "GET",
//         async: false,
//         url: "http://localhost:35246/api/v1/Employees",
//         success: function(res) {
//             console.log("GET DATA DONE !!!!");
//             $("table#tbEmployeeList tbody").empty();
//             // Xử lý dữ liệu từng đối tượng:
//             var sort = 1;
//             let ths = $("table#tbEmployeeList thead th");
//             //debugger
//             for (const emp of res) {
//                 // duyệt từng cột trong tiêu đề:
//                 var trElement = $('<tr></tr>');
//                 for (const th of ths) {
//                     //debugger
//                     // Lấy ra propValue tương ứng với các cột:
//                     const propValue = $(th).attr("propValue");

//                     const format = $(th).attr("format");
//                     // Lấy giá trị tương ứng với tên của propValue trong đối tượng:
//                     let value = null;
//                     if (propValue == "Sort")
//                         value = sort
//                     else
//                         value = emp[propValue];
//                     if (propValue == "WorkStatus"){
//                         value = formatWorkStatus(value)
//                     }
//                     else if (propValue == "Gender"){
//                         value = formatGender(value)
//                     }
//                     // if (propValue == "GenderName"){
//                     //     if (sort < 5){
//                     //         console.log(value);
//                     //     }
//                     // }
//                     let classAlign = "";
//                     switch (format) {
//                         case "date":
//                             value = formatDate(value);
//                             classAlign = "text-align--center";
//                             break;
//                         case "money":
//                             value = formatMoney(value);
//                             classAlign = "text-align--right";
//                             break;
//                         default:
//                             break;
//                     }

//                     // Tạo thHTML:
//                     let thHTML = `<td class='${classAlign}'>${value||""}</td>`;

//                     // Đẩy vào trHMTL:
//                     trElement.append(thHTML);
//                 }
//                 sort++;
//                 $(trElement).data("id", emp.EmployeeId);
//                 $(trElement).data("entity", emp);
//                 $("table#tbEmployeeList tbody").append(trElement)
//             }
//         },
//         error: function(res) {
//             console.log(res);
//         }
//     });
// }

function loadData(pageNumber) {
    // Phần lọc trong api
    const filter = `keyword=${keyword||''}&positionId=${positionId||''}&departmentId=${departmentId||''}&pageSize=${pageSize||''}&pageNumber=${pageNumber}`;

    // Gọi api thực hiện lấy dữ liệu:
    console.log("CALL AJAX !!!!");
    $.ajax({
        type: "GET",
        async: false,
        url: "http://localhost:35246/api/v1/Employees/filter?" + filter,
        success: function(res) {
            const data = res["Data"];
            const totalRecord = parseInt(res["TotalRecord"]||0);
            totalPage = Math.ceil(totalRecord / pageSize);
            console.log("GET DATA DONE !!!!");
            $("table#tbEmployeeList tbody").empty();
            // Xử lý dữ liệu từng đối tượng:
            var sort = pageSize * pageNumber - pageSize + 1;
            let ths = $("table#tbEmployeeList thead th");
            //debugger
            for (const emp of data) {
                // duyệt từng cột trong tiêu đề:
                var trElement = $('<tr></tr>');
                for (const th of ths) {
                    //debugger
                    // Lấy ra propValue tương ứng với các cột:
                    const propValue = $(th).attr("propValue");

                    const format = $(th).attr("format");
                    // Lấy giá trị tương ứng với tên của propValue trong đối tượng:
                    let value = null;
                    if (propValue == "Sort")
                        value = sort
                    else
                        value = emp[propValue];
                    if (propValue == "WorkStatus"){
                        value = formatWorkStatus(value)
                    }
                    else if (propValue == "Gender"){
                        value = formatGender(value)
                    }
                    // if (propValue == "GenderName"){
                    //     if (sort < 5){
                    //         console.log(value);
                    //     }
                    // }
                    let classAlign = "";
                    switch (format) {
                        case "date":
                            value = formatDate(value);
                            classAlign = "text-align--center";
                            break;
                        case "money":
                            if (value > 0){
                                value = formatMoney(value);
                            }
                            classAlign = "text-align--right";
                            break;
                        default:
                            break;
                    }

                    // Tạo thHTML:
                    let thHTML = `<td class='${classAlign}'>${value||""}</td>`;

                    // Đẩy vào trHMTL:
                    trElement.append(thHTML);
                }
                sort++;
                $(trElement).data("id", emp.EmployeeId);
                $(trElement).data("entity", emp);
                $("table#tbEmployeeList tbody").append(trElement)
            }

            // Chỉnh footer, nếu vừa chọn trang thì không chỉnh
            if (!pageSelectMode){
                pageSelected = 1;
                firstPageNumber = 1;
                lastPageNumber = Math.min(totalPage, pageMaxNumber);
            } else {
                pageSelectMode = 0;
            }
            resetNumberFooter();
            
            $('.table__paging--left').html("Hiển thị <b>" + (pageSize * pageNumber - pageSize + 1) + "-"+ Math.min(pageSize * pageNumber, totalRecord) 
                +"/"+ totalRecord +"</b> nhân viên");

        },
        error: function(res) {
            console.log(res);
        }
    });
}

var count = 0;

function saveData() {
    // Validate thông tin trước khi lưu
    isValid = validateEmployeeInformation();
    if (!isValid){
        return;
    }

    // Thu thập dữ liệu:
    let employee = {};

    for (const element of $("#dlgEmployeeDetail input, select")) {
        // Đọc thông tin field:
        const field = $(element).attr(FIELD_ATTR);
        // Lấy ra value:
        if (field != null && $(element).val() != "") {
            employee[field] = $(element).val();
        }
        // if (count < 2){
        //     console.log(field, employee[field]);
        // }
        
    }
    console.log(employee);

    // Gọi api thực hiện cất dữ liệu:
    if (formMode == EDIT_EMPLOYEE) {
        $.ajax({
            type: "PUT",
            url: "http://localhost:35246/api/v1/Employees/" + employeeId,
            data: JSON.stringify(employee),
            dataType: "json",
            contentType: "application/json",
            success: function(response) {
                alert("Sửa dữ liệu thành công!");
                // load lại dữ liệu:
                loadData(1);
                // Ẩn form chi tiết:
                $("#dlgEmployeeDetail").hide();

            },
            error: function(res) {
                console.log(employeeId),
                console.log(res.responseJSON['ErrorCode']);
                console.log(res);
                ErrorMessage = res.responseJSON['ErrorMessage'];
                if (ErrorMessage.includes("Duplicate entry") && ErrorMessage.includes("employee.EmployeeCode")){
                    employeeCodeDom = $('#txtEmployeeCode');
                    employeeCodeDom.focus();
                    employeeCodeDom.addClass("input--error").attr('title', "Mã nhân viên đã tồn tại");
                    employeeCodeDom.siblings(".notice").html("Không được thay đổi mã nhân viên").css('color','red');
                } else {
                    alert("Sửa dữ liệu không thành công");
                }
            }
        });
    } else {
        // employee["IdentityPlace"] = "29822";
        // employee["PersonalTaxCode"] = "4T";
        $.ajax({
            type: "POST",
            url: "http://localhost:35246/api/v1/Employees",
            data: JSON.stringify(employee),
            dataType: "json",
            contentType: "application/json",
            success: function(response) {
                alert("Thêm mới dữ liệu thành công!");
                // load lại dữ liệu:
                loadData(1);
                // Ẩn form chi tiết:
                $("#dlgEmployeeDetail").hide();

            },
            error: function(res){
                console.log(employeeId),
                console.log(res.responseJSON['ErrorCode']);
                console.log(res);
                ErrorMessage = res.responseJSON['ErrorMessage'];
                if (ErrorMessage.includes("Duplicate entry") && ErrorMessage.includes("employee.EmployeeCode")){
                    employeeCodeDom = $('#txtEmployeeCode');
                    employeeCodeDom.focus();
                    employeeCodeDom.addClass("input--error").attr('title', "Mã nhân viên đã tồn tại");
                    employeeCodeDom.siblings(".notice").html("Mã nhân viên đã tồn tại").css('color','red');
                } else {
                    alert("Thêm mới không thành công");;
                }
            }
        });
    }


}

// Đối tượng trong javascript
var obj_JS = {
    EmployeeCode: "NV001",
    FullName: "Nguyễn Văn Mạnh",
    DateOfBirth: new Date(),
    getName: function() {

    },
    Address: null,
}

// JSON Object:
var obj_JSON = {
    "EmployeeCode": "NV001",
    "FullName": "Nguyễn Văn Mạnh",
    "DateOfBirth": "2020-10-10",
    "Address": null
}

//1. Tên của property phải nằm trong cặp ký tự ""
//2. Không được chứa function
//3. Không được phép có dấu , ở property cuối cùng
//4. Không được nhận value là undefined

// JSON String
// Là một chuỗi nhưng có quy tắc: 
// VD: var jsonString = `{"EmployeeCode":"NV0001","FullName":"Nguyễn Văn Mạnh","DateOfBirth": null}`

/**
 * Lấy dữ liệu và cập nhật bảng phòng ban
 */

/**
 * Hiển thị form thông tin nhân viên
 * @param {trElementHtml} selectedRow 
 * @param {guid} employeeId
 */
 function showInfoForm(selectedRow, employeeId) {
    // Đặt chế độ là xem và sửa thông tin nhân viên
    formMode = EDIT_EMPLOYEE;

    // Truy vấn api lấy thông tin chi tiết nhân viên bằng id:
    $.ajax({
        method: "GET",
        url: "http://localhost:35246/api/v1/Employees/" + employeeId,
        success: function(employee) {
            // Duyệt tất cả các input:
            for (const element of $('#dlgEmployeeDetail input')) {
                // Đặt lại mặc định
                $(element).parent().siblings(".notice").html("");
                $(element).parent().removeClass("input--default");
                $(element).parent().removeClass("input--error");
                $(element).parent().removeClass("input--focus");
                $(element).parent().removeClass("input--done");

                // Đọc thông tin field:
                const field = $(element).attr(FIELD_ATTR);
                // Gán giá trị cho element:
                $(element).val(employee[field]);
                if (employee[field] != null) {
                    if ($(element).attr("type") == "date") {
                        const date = new Date(employee[field]);
                        const dd = date.getDate() >= 10 ?   `${date.getDate()}`  : `0${date.getDate()}`;
                        const mm = date.getMonth() < 9 ?  `0${date.getMonth() + 1}` :  `${date.getMonth() + 1}`;
                        const yyyy = date.getFullYear();
                        // Gán gái trị cho elementHtml có type="date"
                        $(element).val(`${yyyy}-${mm}-${dd}`);
                    }
                    // else if (field == "Salary") {
                    //     let value = formatMoney(employee[field]);
                    //     if (value != "") $(element).val(value.substring(0, value.length - 2) + "(VNĐ)");
                    // }
                }

                if ($(element).hasClass("input-left__body")) {
                    if ($(element).val() == "") {
                        $(element).parent().addClass("input--default");
                        $(element).parent().children(".input-left__icon").hide();
                    }
                    else {
                        $(element).parent().addClass("input--done");
                        $(element).parent().children(".input-left__icon").show();
                    }
                }
            }

            // Duyệt tất cả các combobox:
            for (const element of $('#dlgEmployeeDetail select')) {
                // Đọc thông tin field:
                const field = $(element).attr(FIELD_ATTR);
                // Gán giá trị cho element:
                $(element).val(employee[field]);
            }
        
            // Hiển thị form:
            $("#dlgEmployeeDetail").show();
        
            // Focus vào ô input mã nhân viên:
            $("#dlgEmployeeDetail input")[0].focus();
        },
        error: function(res) {
            console.log(res);
            alert("Server không phản hồi");
        }
    });
}

function loadDepartment() {
    // Truy vấn api:
    $.ajax({
        type: "GET",
        async: false,
        url: "http://localhost:35246/api/v1/Departments",
        success: function(res) {
            // Xử lý dữ liệu từng đối tượng:
            for (const department of res) {
                // Tạo optionHtml và đẩy vào selectHMTL:
                $("[name=departmentComboBox]").append(`<option value="${department["DepartmentId"]}">${department["DepartmentName"]}</option>`);
            }
        },
        error: function(res) {
            console.log(res);
            alert("Tải dữ liệu phòng ban không thành công");
        }
    })
}

/**
 * Lấy dữ liệu và cập nhật bảng vị trí
 */
function loadPosition() {
    // Truy vấn api:
    $.ajax({
        type: "GET",
        async: false,
        url: "http://localhost:35246/api/v1/Positions",
        success: function(res) {
            // Xử lý dữ liệu từng đối tượng:
            for (const position of res) {
                // Tạo optionHtml và đẩy vào selectHMTL:
                $("[name=positionComboBox]").append(`<option value="${position["PositionId"]}">${position["PositionName"]}</option>`);
            }
        },
        error: function(res) {
            console.log(res);
            alert("Tải dữ liệu vị trí không thành công");
        }
    })
}

/**
 * Cập nhật lại các trang để chọn
 */
function resetNumberFooter() {
    let pageNumberGroup = $('.paging__button--group')
    pageNumberGroup.empty();
    for(let i = firstPageNumber; i <= lastPageNumber; ++i) {
        if (i == pageSelected){
            pageNumberGroup.append(`<div button class="paging__number paging__number--selected">${i}</div>`);
            continue;
        }
        pageNumberGroup.append(`<div button class="paging__number">${i}</div>`);
    }
}

