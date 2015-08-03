////////////////////////////////////////////////////////////////////////////////
window.onload = function() {
    $('#logn_error').hide();
    var curBrowser = bowser.name;
    var curVersion = Number(bowser.version);
    
    switch (curBrowser) {
        case "Safari":
            if (curVersion < 5)
                window.open('browser_not_support.html', '_self');
            break;
        case "Chrome":
            if (curVersion < 7)
                window.open('browser_not_support.html', '_self');
            break;
        case "Firefox":
            if (curVersion < 22)
                window.open('browser_not_support.html', '_self');
            break;
        case "Internet Explorer":
            if (curVersion < 11)
                window.open('browser_not_support.html', '_self');
            break;
        default:     
            break;
    }
    
    if (localStorage.key(0) !== null) {
        if (IsLoginExpired()) {
            window.open('Login.html', '_self');
        }
    }
};

////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {  
    // enter key to login
    $('#password').keypress(function (e) {
        if(e.keyCode === 13){
            $('#btn_login').click();
        }
    });
    
    $('#btn_login').click(function() { 
        var url_param = sessionStorage.getItem('ls_dsps_url_param');
        
        if(loginInfo()) {
            var login_type = localStorage.getItem('ls_dsps_proctor_loginType');
            if (login_type === "Staff") {
                if (url_param === null) {
                    window.open('home.html', '_self');
                }
                else {
                    window.open(url_param, '_self');
                }
            }
            else {
                window.open('newProctor.html', '_self');
            }
        }
        else {
            $('#logn_error').show();
            this.blur();
        }
    });
});

////////////////////////////////////////////////////////////////////////////////
function loginInfo() {   
    var result = new Array();
    var username = $('#username').val().toLowerCase().replace("@ivc.edu", "");
    var password = $('#password').val();
    
    result = getLoginUserInfo("php/login.php", username, password);
    if (result.length === 0) {
        result = getLoginUserInfo("php/login_student.php", username, password);
    }
    
    if (result.length === 0) {
        return false;
    }
    else {
        var display_name = result[0];
        var email = result[1];
        var phone = result[2];
        var loginID = result[3];
        var login_type = result[4];
        
        if (email === null || typeof email === 'undefined') {
            alert("Login error: There was an error getting login user information from Active Direcy please try again");
            return;
        }

        localData_login(display_name, email, phone, loginID, login_type);
        return true;
    }
}