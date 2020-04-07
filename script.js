

//---ACTION LISTENERS---//
document.getElementById('btnFindSchedules').addEventListener("click", function() {
    var classIn = document.getElementById('classesInput').value; // Get class input data
    classIn = classIn.replace(/\s/g, ""); // Remove all empty spaces from input
    var classes = classIn.split(","); // Tokenize classes based on ','

    // For testing only, remove in production
    for (var i = 0; i < classes.length; i++) {
        console.log(classes[i]);
    }

});