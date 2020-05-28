// Updates text value of labels associated with slider input for prof. rating and difficulty
function updateTextInput(id, value) {
    document.getElementById(id).textContent = value;
}

// Update text counter for professor review text input
function updateTextCounter(length) {
    console.log(length)
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
        searchProf(val).then(returnVal => {
            document.getElementById("professor-search-results").style.display = "inline";
            createProfResultItems(returnVal.data);
        });
    }
}

function professorSelected(prof) {
    document.getElementById("prof-search-container").style.display = "none";
    document.getElementById("review-form").style.display = "inline";
}
//--- ---//



//--- CLASS DROPDOWN SEARCH ---//
function createClassSearchList(classes) {
    console.log(classes)

    $("#class-search-results").empty();

    let newRows = [];

    if (classes === null || classes.length === 0) {
        newRows.push('<li><a class="dropdown-item">No Results</a></li>');
    } else {
        for (let i = 0; i < classes.length; i++) {
            newRows.push('<li><a onclick=classSelected(this.textContent) class="dropdown-item">' + classes[i].subjectCourse + '</a></li>');
        }
    }

    $('#class-search-results').append(newRows.join(""));
}

// Create a list of professors from the database once the user enters at least 3 characters
function classSearchHandler(val) {
    val = val.replace(/\s/g,''); // Remove all spaces because no spaces in database class names

    // Only start showing search results after 3 characters of input
    if (val.length >= 3) {
        findClassAPI(val).then(returnVal => {
            document.getElementById("class-search-results").style.display = "inline";
            if (returnVal.success === true) {
                createClassSearchList(returnVal.data);
            }
        });
    }
}

function classSelected(className) {
    document.getElementById('course-input').value = className;
}
//--- ----//



// Hide dropdown if user clicks outside the dropdown list
$(document).click(function() {
    document.getElementById("professor-search-results").style.display = "none";
    document.getElementById("class-search-results").style.display = "none";
});