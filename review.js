function updateTextInput(id, value) {
    document.getElementById(id).textContent = value;
}

function togglePass(id) {
    let checkBox = document.getElementById(id);
    if (checkBox.type === "password") {
        checkBox.type = "text";
    } else {
        checkBox.type = "password";
    }
}

//--- PROFESSOR DROPDOWN SEARCH ---//
function createDropdownItems(profs) {
    $("#professor-search-results").empty();

    let newRows = [];

    if (profs === null || profs.length === 0) {
        newRows.push('<a class="dropdown-item">No Results</a>');
    } else {
        for (let i = 0; i < profs.length; i++) {
            newRows.push('<a onclick="professorSelected(this.textContent)" class="dropdown-item">' + profs[i].name + '</a>');
        }
    }

    $('#professor-search-results').append(newRows.join(""));
}

function filterInstructor(val) {
    // Only start showing search results after 3 characters of input
    if (val.length >= 3) {
        searchProf(val).then(returnVal => {
            document.getElementById("professor-search-results").style.display = "inline";
            createDropdownItems(returnVal.data);
        });
    }
}

function professorSelected(prof) {
    document.getElementById("prof-search-container").style.display = "none";
    document.getElementById("review-form").style.display = "inline";
    console.log(prof);
}

//--- ---//

$(document).click(function() {
    document.getElementById("professor-search-results").style.display = "none";
});