// Take again buttons elements
const yesColor = "#7fe47f";
const noColor = "#e47f7f";
const takeAgainBtnYes = document.getElementById('take-again-btn-yes');
const takeAgainBtnNo = document.getElementById('take-again-btn-no');

// Password elements
const passwordInput = document.getElementById('password-input');
const passwordVerifyInput = document.getElementById('password-verify-input');
const passwordMatchLabel = document.getElementById('password-match-label');

// Completed review elements
const reviewCompleteLabel = document.getElementById("review-complete-label");
const reviewCompleteLabelNewAccont = document.getElementById("new-account-label");

// Form elements
const reviewForm = document.getElementById('review-form');
const professorSearchForm = document.getElementById('prof-search-form');

// Global variables
let takeAgain;

//--- ACTION HANDLERS ---//
// Updates text value of labels associated with slider input for prof. rating and difficulty
function updateTextInput(id, value) {
    document.getElementById(id).textContent = value;
}

// Update text counter for professor review text input
function updateTextCounter(length) {
    document.getElementById('professor-review-text-count').textContent = length;
}

// Toggle between showing hidden password field
function togglePass(id) {
    let checkBox = document.getElementById(id);
    if (checkBox.type === "password") {
        checkBox.type = "text";
    } else {
        checkBox.type = "password";
    }
}

// Compare password and password verification input
function comparePass() {
    if (passwordInput.value !== passwordVerifyInput.value) {
        passwordVerifyInput.style.borderColor = 'red';
        passwordMatchLabel.style.display = 'inline';
        return false;
    } else {
        passwordVerifyInput.style.borderColor = '';
        passwordMatchLabel.style.display = 'none';
        return true;
    }
}

// Toggle between "Would you take this professor again?" buttons and toggle color
function toggleTakeProfAgain(toggle) {
    if (toggle === "yes") {
        // Yes button clicked
        takeAgainBtnYes.style.backgroundColor = yesColor;
        takeAgainBtnNo.style.backgroundColor = "";
        takeAgain = true; // Set global takeAgain variable
    } else {
        // No button clicked
        takeAgainBtnNo.style.backgroundColor = noColor;
        takeAgainBtnYes.style.backgroundColor = "";
        takeAgain = false; // Set global variable to false
    }
}

function reviewSubmit() {
    let course = document.getElementById('course-input').value;
    let professor = document.getElementById('instructor-dropdown-input').value;
    let rating = document.getElementById('rating-input').value;
    let difficulty = document.getElementById('difficulty-input').value;
    let review = document.getElementById('professor-review-input').value;
    let email = document.getElementById('email-input').value;
    let pass = document.getElementById('password-input').value;


    api_addReview(course, professor, rating, difficulty, review, email, pass).then(ret => {
        reviewComplete(ret);
    });

    // Reset global variables for selected instructor and course
    selectedInstructor = "";
    selectedCourse = ""
}

function reviewComplete(ret) {
    // Reset review page and forms
    reviewForm.reset();
    professorSearchForm.reset();
    reviewForm.style.display = "none";
    professorSearchForm.style.display = "inline";

    if (ret.data === 'review added') {
        reviewCompleteLabel.style.display = "inline";
    } else {
        reviewCompleteLabel.style.display = "inline";
        reviewCompleteLabelNewAccont.style.display = "inline";
    }
}
//--- END OF ACTION HANDLERS ---//



//--- PROFESSOR DROPDOWN SEARCH ---//
// Create list items for each professor returned
function createProfResultItems(profs) {
    $("#professor-search-results").empty();

    let newRows = [];

    if (profs === null || profs.length === 0) {
        newRows.push('<li><a class="dropdown-item">No Results</a></li>');
    } else {
        for (let i = 0; i < profs.length; i++) {
            newRows.push('<li><a onclick="professorSelected(this.textContent)" class="dropdown-item">' + profs[i].name + '</a></li>');
        }
    }

    $('#professor-search-results').append(newRows.join(""));
}

// Create a list of professors from the database once the user enters at least 3 characters
function profSearchHandler(val) {
    // Only start showing search results after 3 characters of input
    if (val.length >= 3) {
        api_searchProf(val).then(returnVal => {
            document.getElementById("professor-search-results").style.display = "inline";
            createProfResultItems(returnVal.data);
        });
    }
}

function professorSelected(prof) {
    document.getElementById('instructor-dropdown-input').value = prof;
    professorSearchForm.style.display = "none";
    reviewForm.style.display = "inline";
}
//--- END PROFESSOR DROPDOWN SEARCH ---//



//--- COURSE DROPDOWN SEARCH ---//
function createClassSearchList(classes) {
    $("#class-search-results").empty();

    let newRows = [];

    if (classes === null || classes.length === 0) {
        newRows.push('<li><a class="dropdown-item">No Results</a></li>');
    } else {
        for (let i = 0; i < classes.length; i++) {
            newRows.push('<li><a onclick=courseSelected_ReviewPage(this.textContent) class="dropdown-item">' + classes[i].subjectCourse + '</a></li>');
        }
    }

    $('#class-search-results').append(newRows.join(""));
}

// Create a list of professors from the database once the user enters at least 3 characters
function classSearchHandler(val) {
    val = val.replace(/\s/g,''); // Remove all spaces because no spaces in database class names

    // Only start showing search results after 2 characters of input
    if (val.length >= 2) {
        findClassAPI(val).then(returnVal => {
            document.getElementById("class-search-results").style.display = "inline";
            if (returnVal.success === true) {
                createClassSearchList(returnVal.data);
            }
        });
    }
}

// Update course search box if user selects class from drop-down menu
function courseSelected_ReviewPage(className) {
    document.getElementById('course-input').value = className;
}
//--- END COURSE DROPDOWN SEARCH ---//



// Hide dropdown if user clicks outside the dropdown list
$(document).click(function() {
    document.getElementById("professor-search-results").style.display = "none";
    document.getElementById("class-search-results").style.display = "none";
});

// Toggle tooltip
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

// Disable enter key on form elements
$("form").keypress(function(e) {
    if (e.which == 13) {
        return false;
    }
});