const apiUrl = "https://temple.sebtota.com";
const apiPort = "3000";

//---API CALLS---//

// Generate the end of the url string to send an array of classes
// Format: "cls=CLASS&cls=CLASS2&cls=CLASS3"
function genClassArrStr(classes) {
    let classUrl = ("cls=") + classes[0]; // First class does not get '&' in front of 'cls' key

    // Append format '&cls=CLASS' for classes 2-n in classes
    for (let cls = 1; cls < classes.length; cls++) {
        classUrl = classUrl + ("&cls=") + classes[cls];
    }

    return classUrl; // Return string
}

// Make an api call to return all weekSchedule of each course in array 'classes'
async function getClasses(classes) {
    let apiCall = apiUrl + ":" + apiPort + "/classes?" + genClassArrStr(classes);

    // Make api call and wait for response before returning
    // Add CORS header to allow cross origin resource sharing
    let response = await fetch(apiCall, {
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin':'*'
        }
    });
    return await response.json();
}

async function getClass(className) {
    let apiCall = apiUrl + ":" + apiPort + "/class/" + className;

    // Make api call and wait for response before returning
    // Add CORS header to allow cross origin resource sharing
    let response = await fetch(apiCall, {
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin':'*'
        }
    });
    return await response.json();
}

//---END OF API CALLS---//


//---ACTION LISTENERS---//
document.getElementById('btnFindSchedules').addEventListener("click", function() {
    var classIn = document.getElementById('classesInput').value; // Get class input data
    classIn = classIn.replace(/\s/g, ""); // Remove all empty spaces from input
    var classes = classIn.split(","); // Tokenize classes based on ','

    scheduleChecker(classes);
    // getClasses(classes).then(data => console.log(data));

});
//---END ACTION LISTENERS---//