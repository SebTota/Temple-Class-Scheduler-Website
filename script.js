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
async function getClassesAPI(classes) {
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

async function getClassAPI(className) {
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


function badInput(classError){
    document.getElementById("classesInput").style.borderColor = "red";
    document.getElementsByClassName("example-input-label")[1].textContent = "Error on class: " + classError;
}


//---ACTION LISTENERS---//
function classSubmit() {
    document.getElementsByClassName("example-input-label")[1].textContent = 'Ex. "CIS3223, CIS4345, CIS3515, CIS3296"';
    document.getElementById("classesInput").style.borderColor = "black";

    // Reset schedule if making a new schedule request
    currSchIndex = 0;
    numAvailSchedules = -1;
    availSchedules = {schedule: [], classes: []};

    var classIn = document.getElementById('classesInput').value; // Get class input data
    if (classIn === "") {
        return;
    }

    classIn = classIn.replace(/\s/g, ""); // Remove all empty spaces from input
    var classes = classIn.split(","); // Tokenize classes based on ','

    getClasses(classes).then(data => {
        if(typeof data !== "string") {
            scheduleChecker(data);
            updateSchPageIndex();
        } else {
            console.log("Error in class");
            badInput(data);
        }
    });
    // getClasses(classes).then(data => console.log(data));
}

// Schedule left and right buttons
document.getElementById("button_back").addEventListener("click", function(){
    if (numAvailSchedules === -1) return; // No schedule created yet

    // Only decrement schedule counter if currSchIndex (current schedule index) is positive
    if (currSchIndex >= 1) --currSchIndex;
    updateSchPageIndex();
    genScheduleEvents(availSchedules, currSchIndex % numAvailSchedules);
});

document.getElementById("button_forward").addEventListener("click", function(){
    if (numAvailSchedules === -1) return; // No schedule created yet

    currSchIndex = ++currSchIndex % numAvailSchedules;
    updateSchPageIndex();
    genScheduleEvents(availSchedules, currSchIndex);
});
//---END ACTION LISTENERS---//