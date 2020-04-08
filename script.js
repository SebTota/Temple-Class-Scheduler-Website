//---API CALLS---//
function genClassArrStr(classes) {
    var classUrl = ("cls=") + classes[0];

    for (let cls = 1; cls < classes.length; cls++) {
        classUrl = classUrl + ("&cls=") + classes[cls];
    }
    return classUrl;
}

function getClasses(classes) {
    let apiUrl = "http://3.21.207.37:3000/classes?" + genClassArrStr(classes);
    console.log(apiUrl);

    fetch(apiUrl).then(function(response) {
        return response.json();
    }).then(function(data) {
        return(data);
    }).catch(function() {
        console.log("Error making api call");
        return -1;
    });


}


//---ACTION LISTENERS---//
document.getElementById('btnFindSchedules').addEventListener("click", function() {
    var classIn = document.getElementById('classesInput').value; // Get class input data
    classIn = classIn.replace(/\s/g, ""); // Remove all empty spaces from input
    var classes = classIn.split(","); // Tokenize classes based on ','

    console.log(getClasses(classes));



});
//---END ACTION LISTENERS---//