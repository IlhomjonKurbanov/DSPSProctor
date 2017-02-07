var proctor_id = "";

var stu_email = "";
var date_submitted = "";

var inst_name = "";
var inst_email = "";
var section_num = "";

var str_img = "";
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {       
    if (sessionStorage.key(0) !== null) {
        getURLParameters();
        // email link validation
        if (!emailLinkValidation()) {
            sessionStorage.setItem('ls_dsps_review_step', "Review 1");
            window.open('emailAccessError.html', '_self');
            return false;
        }
        
        defaultHideDisalbe();
        setProctor();
        setAccom();
        getTransactionHistory();
    }
    else {
        sessionStorage.setItem('ls_dsps_url_param', location.href);
        window.open('Login.html', '_self');
        return false;
    }
};

////////////////////////////////////////////////////////////////////////////////
function getURLParameters() {
    var searchStr = location.search;
    var searchArray = new Array();
    while (searchStr!=='') {
        var name, value;
        // strip off leading ? or &
        if ((searchStr.charAt(0)==='?')||(searchStr.charAt(0)==='&')) {
            searchStr = searchStr.substring(1,searchStr.length);
        }
        // find name
        name = searchStr.substring(0,searchStr.indexOf('='));
        // find value
        if (searchStr.indexOf('&')!==-1) {
            value = searchStr.substring(searchStr.indexOf('=')+1,searchStr.indexOf('&'));
        }
        else {
            value = searchStr.substring(searchStr.indexOf('=')+1,searchStr.length);
        }
        // add pair to an associative array
        value = value.replace("%20", " ");
        searchArray[name] = value;
        // cut first pair from string
        if (searchStr.indexOf('&')!==-1) {
            searchStr =  searchStr.substring(searchStr.indexOf('&')+1,searchStr.length);
        }
        else {
            searchStr = '';
        }
    }
    
    proctor_id = searchArray['proctor_id'];
}

////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() { 
    $('#nav_home').click(function() { 
        window.open('adminHome.html', '_self');
        return false;
    });
    
    $('#nav_logout').click(function() { 
        sessionStorage.clear();
        window.open("Login.html", '_self');
        return false;
    });
    
    $('#nav_capture').click(function() { 
        capture();
        $('#mod_tech_problems').val("");
        $('#mod_tech_img_screen').prop('src', str_img);
        $('#mod_tech_support').modal('show');
    });
    
    // accept button click /////////////////////////////////////////////////////
    $('#btn_accept').click(function() { 
        $(this).prop("disabled", true);
        if (!updateProctorTestDateTime()) {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error UPDATE TEST DATETIME";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        if (!db_updateProctorStatus(proctor_id, 2, "DateDSPSReview1")) {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error UPDATE PROCTOR STATUS - ACCEPT";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        if (!db_updateProctorStep(proctor_id, 2, "DateDSPSReview1")) {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error UPDATE PROCTOR STEP";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        if (db_insertProctorLog(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), 1, 7) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT PROCTOR LOG - ACCEPT";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        
        var note = "DSPS Review 1 Accepted";
        var dsps_comments = $('#dsps_comments').val();
        if (dsps_comments !== "") {
            note += "\nComments: " + dsps_comments;
        } 
        if (db_insertTransaction(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), note) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT TRANSACTION - ACCEPT";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        sendEmailToInstructor();
        
        $('#mod_dialog_box_header').html("Complete");
        $('#mod_dialog_box_body').html("DSPS Review 1 has been Accepted");
        $('#mod_dialog_box').modal('show');
    });
    
    // deny button click ///////////////////////////////////////////////////////
    $('#btn_deny').click(function() { 
        $('#mod_deny_box').modal('show');
    });
    
    // dialog deny yes button click ////////////////////////////////////////////
    $('#mod_deny_btn_yes').click(function() { 
        $('#mod_deny_box').modal('hide');
        if ($('#dsps_comments').val().replace(/\s+/g, '') === "") {
            alert("Please specify reasons for denial under Comments");
            return false;
        }
        
        $(this).prop("disabled", true);
        if (!db_updateProctorStatus(proctor_id, 3, "DateDSPSReview1")) {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error UPDATE PROCTOR STATUS - DENY";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        if (db_insertProctorLog(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), 1, 3) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT PROCTOR LOG - DENY";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        
        var note = "DSPS Review 1 Denied";
        var dsps_comments = $('#dsps_comments').val();
        note += "\nComments: " + dsps_comments;
        if (db_insertTransaction(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), note) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT TRANSACTION - DENY";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        sendEmailToStudentDeny();
        
        $('#mod_dialog_box_header').html("Complete");
        $('#mod_dialog_box_body').html("DSPS Review 1 has been Denied");
        $('#mod_dialog_box').modal('show');
        
        return false;
    });
    
    // cancel button click ///////////////////////////////////////////////////////
    $('#btn_cancel').click(function() { 
        if ($('#dsps_comments').val().replace(/\s+/g, '') === "") {
            alert("Please specify reasons for cancel under Comments");
            return false;
        }
        
        $(this).prop("disabled", true);
        if (!db_updateProctorStatus(proctor_id, 10, "DateDSPSReview1")) {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error UPDATE PROCTOR STATUS - CANCEL";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        if (db_insertProctorLog(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), 1, 10) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT PROCTOR LOG - CANCEL";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        
        var note = "DSPS Review 1 Canceled";
        var dsps_comments = $('#dsps_comments').val();
        note += "\nComments: " + dsps_comments;
        if (db_insertTransaction(proctor_id, sessionStorage.getItem('ls_dsps_proctor_loginDisplayName'), note) === "") {
            var str_msg = "DSPS Review 1: " + proctor_id + " DB system error INSERT TRANSACTION - CANCEL";
            sendEmailToDeveloper(str_msg);
            alert(str_msg + ", please contact IVC Tech Support at 949.451.5696");
            sessionStorage.clear();
            window.open("Login.html", '_self');
            return false;
        }
        sendEmailToStudentCanceled();
        
        $('#mod_dialog_box_header').html("Complete");
        $('#mod_dialog_box_body').html("DSPS Review 1 has been Canceled");
        $('#mod_dialog_box').modal('show');
    });
    
    // dialog ok click /////////////////////////////////////////////////////////
    $('#mod_dialog_btn_ok').click(function() { 
        window.open('adminHome.html', '_self');
        return false;
    });
    
    // modal submit button click ///////////////////////////////////////////////
    $('#mod_tech_btn_submit').click(function() { 
        if (sendEmailToTechSupport()) {
            $('#mod_tech_support').modal('hide');
            alert("Your request has been submitted successfully");
        }
        else {
            $('#mod_tech_support').modal('hide');
            alert("Sending email error!");
        }
    });
    
    // get screen shot image ///////////////////////////////////////////////////
    html2canvas($('body'), {
        onrendered: function(canvas) { str_img = canvas.toDataURL("image/jpg"); }
    });
    
    // popover
    $('#nav_capture').popover({content:"Contact IVC Tech Support", placement:"bottom"});
    
    // auto size
    $('#comments').autosize();
    $('#dsps_comments').autosize();
    
    // datepicker
    $('#test_date').datepicker();
});

////////////////////////////////////////////////////////////////////////////////
function emailLinkValidation() {
    var result = new Array();
    result = db_getProctor(proctor_id);
    
    if (result.length === 1) {
        var step_id = result[0]['StepID'];
        var status_id = result[0]['StatusID'];
        
        if (step_id === "1" && status_id === "1") {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

////////////////////////////////////////////////////////////////////////////////
function defaultHideDisalbe() {    
    $('#mod_dialog_box').modal('hide');
    $('#mod_deny_box').modal('hide');
    $('#mod_tech_support').modal('hide');
}

////////////////////////////////////////////////////////////////////////////////
function setProctor() {
    var result = new Array();
    result = db_getProctor(proctor_id);
    
    if (result.length === 1) {
        $('#stu_name').html(result[0]['StuName']);
        $('#stu_id').html(result[0]['StuID']);
        $('#inst_name').html(result[0]['InstName']);
        $('#course_id').html(result[0]['CourseID']);
        $('#test_date').val(result[0]['TestDate']);
        $('#test_time').timepicker({defaultTime: result[0]['TestTime']});
        $('#comments').html(result[0]['Comments'].replace(/\n/g, "<br>")).css({height: 'auto'});
        
        stu_email = result[0]['StuEmail'];
        inst_name = result[0]['InstName'];
        inst_email = result[0]['InstEmail'];
        section_num = result[0]['SectionNum'];
        date_submitted = convertDBDateTimeToString(result[0]['DateSubmitted']);
    }
}

function setAccom() {
    var result = new Array();
    result = db_getAccom(proctor_id);
    
    if (result.length === 1) {
        if (result[0]['TimeOneHalf'] === "1") {
            $("#ckb_time_one_half").prop('checked', true);
        }
        if (result[0]['DoubleTime'] === "1") {
            $("#ckb_double_time").prop('checked', true);
        }
        if (result[0]['Reader'] === "1") {
            $("#ckb_reader").prop('checked', true);
        }
        if (result[0]['EnlargeExam'] === "1") {
            $("#ckb_enlarge_exam").prop('checked', true);
        }
        if (result[0]['UseOfComp'] === "1") {
            $("#ckb_user_of_comp").prop('checked', true);
        }
        if (result[0]['Scribe'] === "1") {
            $("#ckb_scribe").prop('checked', true);
            var ckb_scantron = result[0]['Scantron'];
            var ckb_written_exam = result[0]['WrittenExam'];
            var scribe_html = "";
            if (ckb_scantron === "1" && ckb_written_exam === "0") {
                scribe_html = "Scantron Only";
            }
            else if (ckb_scantron === "0" && ckb_written_exam === "1") {
                scribe_html = "Written Exam";
            }
            else {
                scribe_html = "Scantron and Written Exam";
            }
            $('#cbo_scribe_list').html(scribe_html);
        }
        if (result[0]['Distraction'] === "1") {
            $("#ckb_distraction").prop('checked', true);
        }
        if (result[0]['Other'] === "1") {
            $("#ckb_other").prop('checked', true);
        }
        $('#txt_other').html(result[0]['txtOther']);
    }
}

////////////////////////////////////////////////////////////////////////////////
function getTransactionHistory() {
    var result = new Array();
    result = db_getTransaction(proctor_id);
    
    var html = "";
    for (var i = 0; i < result.length; i++) {
        var dt_stamp = convertDBDateTimeToString(result[i]['DTStamp']);
        var login_name = result[i]['LoginName'];
        var note = result[i]['Note'];

        html += login_name + " : " + dt_stamp + "<br>" + note.replace(/\n/g, "<br>") + "<br><br>";
    }
    $("#transaction_history").append(html);
}

////////////////////////////////////////////////////////////////////////////////
function updateProctorTestDateTime() {
    var test_date = $('#test_date').val();
    var test_time = $('#test_time').val();
    return db_updateProctorTestDT(proctor_id, test_date, test_time);
}

////////////////////////////////////////////////////////////////////////////////
function capture() {    
    html2canvas($('body')).then(function(canvas) { str_img = canvas.toDataURL(); });
}

////////////////////////////////////////////////////////////////////////////////
function sendEmailToTechSupport() {
    var subject = "Request for New Ticket";
    var message = "New tickert has been requested from <b>" + sessionStorage.getItem('ls_dsps_proctor_loginDisplayName') + "</b> (" + sessionStorage.getItem('ls_dsps_proctor_loginEmail') + ")<br><br>";
    message += "Application Web Site: <b>DSPS 1 Review</b><br><br>";
    message += "<b>Problems:</b><br>" + $('#mod_tech_problems').val().replace(/\n/g, "<br>");
//    message += "<img src='cid:screen_shot'/>";    
    var img_base64 = str_img.replace("data:image/png;base64,", "");
    return proc_sendEmailToTechSupport("presidenttest@ivc.edu", "Do Not Reply", "", "", subject, message, img_base64);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sendEmailToDeveloper(str_msg) {
    proc_sendEmail("ykim160@ivc.edu", "Rich Kim", "DSPS Review 1: DB System Error", str_msg);
}

////////////////////////////////////////////////////////////////////////////////
function sendEmailToInstructor() {
    var subject = "Test Proctoring Request: New";
    var message = "Dear " + inst_name + ",<br><br>";
    message += "A new DSPS test proctoring request has been submitted, reviewed and accepted.<br><br>";
    
    if ($('#dsps_comments').val() !== "") {
        message += "<b>Comments:</b><br>" + $('#dsps_comments').val().replace(/\n/g, "<br>") + "<br><br>";
    }
    
    message += "Student Name: <b>" + $('#stu_name').html() + "</b><br>";
    message += "Student ID: <b>" + $('#stu_id').html() + "</b><br>";
    message += "Ticket #: <b>" + section_num + "</b><br>";
    message += "Course: <b>" + $('#course_id').html() + "</b><br>";
    message += "Test Date: <b>" + $('#test_date').val() + "</b><br>";
    message += "Test Time: <b>" + $('#test_time').val() + "</b><br><br>";

    var str_url = location.href;
    str_url = str_url.replace("dspsReview_1.html", "instructorReview.html");
    message += "Please click the ticket number below to open the Instructor Review page<br><br>";
    message += "<a href='" + str_url + "'>" + section_num + "</a><br><br>";
    
    // demo setup
//    proc_sendEmail("deantest@ivc.edu", inst_name, subject, message);
    proc_sendEmail(inst_email, inst_name, subject, message);
}

function sendEmailToStudentDeny() {
    var subject = "Test proctoring request has been Denied";
    var message = "Dear " + $('#stu_name').html() + ",<br><br>";
    message += "Your test proctoring request that was submitted on <b>" + date_submitted + "</b> has been <b>Denied;</b><br><br>";
    
    if ($('#dsps_comments').val() !== "") {
        message += "<b>Comments:</b><br>" + $('#dsps_comments').val().replace(/\n/g, "<br>") + "<br><br>";
    }
    
    message += "Please contact the DSPS office as soon as possible regarding your request at 949.451.5630 or ivcdspsexams@ivc.edu<br>";
    message += "DSPS office hours are Monday through Thursday 8 AM - 7 PM, and Friday 8 AM - 5 PM<br><br>";
    
    message += "Instructor Name: <b>" + inst_name + "</b><br>";
    message += "Ticket #: <b>" + section_num + "</b><br>";
    message += "Course: <b>" + $('#course_id').html() + "</b><br>";
    message += "Test Date: <b>" + $('#test_date').val() + "</b><br>";
    message += "Test Time: <b>" + $('#test_time').val() + "</b><br><br>";
    
    // demo setup
//    proc_sendEmail("stafftest@ivc.edu", $('#stu_name').html(), subject, message);
    proc_sendEmail(stu_email, $('#stu_name').html(), subject, message);
}

function sendEmailToStudentCanceled() {
    var subject = "Test proctoring request has been Canceled";
    var message = "Dear " + $('#stu_name').html() + ",<br><br>";
    message += "Your test proctoring request that was submitted on <b>" + date_submitted + "</b> has been <b>Canceled;</b><br><br>";
    
    if ($('#dsps_comments').val() !== "") {
        message += "<b>Comments:</b><br>" + $('#dsps_comments').val().replace(/\n/g, "<br>") + "<br><br>";
    }
    
    message += "Instructor Name: <b>" + inst_name + "</b><br>";
    message += "Ticket #: <b>" + section_num + "</b><br>";
    message += "Course: <b>" + $('#course_id').html() + "</b><br>";
    message += "Test Date: <b>" + $('#test_date').val() + "</b><br>";
    message += "Test Time: <b>" + $('#test_time').val() + "</b><br><br>";

    // demo setup
//    proc_sendEmail("stafftest@ivc.edu", $('#stu_name').html(), subject, message);
    proc_sendEmail(stu_email, $('#stu_name').html(), subject, message);
}