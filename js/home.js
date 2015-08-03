var admin = false;
var master = false;
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {   
    if (localStorage.key(0) !== null) {        
        $('#mod_dialog_box').modal('hide');
        setAdminOption();
        getProctorList();
    }
    else {
        window.open('Login.html', '_self');
    }
};

////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {    
    $('#nav_logout').click(function() { 
        localStorage.clear();
        window.open('Login.html', '_self');
    });
    
    // report - all history click //////////////////////////////////////////////
    $('#nav_rpt_all').click(function() { 
        if (admin) {
            window.open('rptAdminHistory.html', '_self');
        }
        else {
            window.open('rptInstructorHistory.html', '_self');
        }
    });
    
    // table row open resource form click //////////////////////////////////////
    $('table').on('click', 'a[id^="proctor_id_"]', function(e) {
        e.preventDefault();
        var proctor_id = $(this).attr('id').replace("proctor_id_", "");
        var step = $('#step_' + proctor_id).html();
        var status = $('#status_' + proctor_id).html();
        
        switch (step) {
            case "DSPS 1 Review":
                window.open('dspsReview_1.html?proctor_id=' + proctor_id, '_self');
                break;
            case "Instructor Review":
                if (admin) {
                    if (master) {
                        window.open('instructorReview.html?proctor_id=' + proctor_id, '_self');
                    }
                    else {
                        window.open('printProctor.html?proctor_id=' + proctor_id, '_self');
                    }
                }
                else {
                    window.open('instructorReview.html?proctor_id=' + proctor_id, '_self');
                }
                break;
            case "DSPS 2 Review":
                if (status === "Accepted") {
                    if (admin) {
                        window.open('dspsComplete.html?proctor_id=' + proctor_id, '_self');
                    }
                    else {
                        window.open('instructorExamUpdate.html?proctor_id=' + proctor_id, '_self');
                    }
                }
                else {
                    if (admin) {
                        window.open('dspsReview_2.html?proctor_id=' + proctor_id, '_self');
                    }
                    else {
                        window.open('instructorExamUpdate.html?proctor_id=' + proctor_id, '_self');
                    }
                }
                break;
            default:
                window.open('printProctor.html?proctor_id=' + proctor_id, '_self');
                break;
        }
    });
});

////////////////////////////////////////////////////////////////////////////////
function setAdminOption() {
    var result = new Array();
    result = db_getAdmin(localStorage.getItem('ls_dsps_proctor_loginEmail'));
    
    if (localStorage.getItem('ls_dsps_proctor_loginEmail') === "ykim160@ivc.edu") {
        master = true;
    }
    if (result.length === 1) {
        admin = true;
    }

    $('#login_name').html(localStorage.getItem('ls_dsps_proctor_loginDisplayName'));
}

////////////////////////////////////////////////////////////////////////////////
function getProctorList() {
    if (admin) {
        getAdminProctorList();
    }
    else {
        getInstructorProctorList();
    }
}

function getAdminProctorList() {
    var result = new Array(); 
    result = db_getAdminProctorList();
    
    $('#body_tr').empty();
    if (result.length !== 0) {
        for(var i = 0; i < result.length; i++) { 
            setAdminProctorListHTML(result[i]['ProctorID'], result[i]['SectionNum'], result[i]['CourseID'], result[i]['StuName'], 
                                    result[i]['Status'], result[i]['Step'], convertDBDateTimeToString(result[i]['DateSubmitted']));
        }
    }
}

function getInstructorProctorList() {
    var result = new Array(); 
    result = db_getInstProctorList('echambers@ivc.edu');
//    result = db_getInstProctorList(localStorage.getItem('ls_dsps_proctor_loginEmail'));
    
    $('#body_tr').empty();
    if (result.length !== 0) {
        for(var i = 0; i < result.length; i++) { 
            setAdminProctorListHTML(result[i]['ProctorID'], result[i]['SectionNum'], result[i]['CourseID'], result[i]['StuName'], 
                                    result[i]['Status'], result[i]['Step'], convertDBDateTimeToString(result[i]['DateSubmitted']));
        }
    }
}

function setAdminProctorListHTML(proctor_id, section_num, course_id, stu_name, status, step, date_submitted) {
    var tbl_html = "<tr>";
    tbl_html += "<td class='span1'><a href=# id='proctor_id_" + proctor_id +  "'>" + section_num + "</a></td>";
    tbl_html += "<td class='span2'>" + course_id + "</td>";
    tbl_html += "<td class='span3'>" + stu_name + "</td>";
    tbl_html += "<td class='span2' id='status_" + proctor_id + "'>" + status + "</td>";
    tbl_html += "<td class='span2' id='step_" + proctor_id + "'>" + step + "</td>";
    tbl_html += "<td class='span2'>" + date_submitted + "</td>";
    tbl_html += "</tr>";
    $("#body_tr").append(tbl_html);
}