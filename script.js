const apiUrl = "https://temple.sebtota.com";
const apiPort = "3000";

let moreOptionsDiv = document.getElementById("more-options-form");

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

async function getClasses(userClassList) {
    let classListAPIReturn = [];

    //--- Receive and parse data---//
    // Iterate through each class in class list to get all all the schedules for each course
    for (let i = 0; i < userClassList.length; i++) {
        let courseSchedules = await getClassAPI(userClassList[i]);
        if (courseSchedules === "Class Does Not Exist")
            return userClassList[i];
        classListAPIReturn.push(courseSchedules);
    }

    return classListAPIReturn;
}

//---END OF API CALLS---//

/*
 * Change display to indicate an error in one of the classes from the input
 */
function badClassInput(classError){
    document.getElementById("classesInput").style.borderColor = "red";
    document.getElementsByClassName("example-input-label")[1].textContent = "Error on class: " + classError;
}

function parseUnavailableTimesInput() {
    let unavailArr = [];
    for (let day = 0; day < numDaysInWeek; day++) {
        let dayInput = document.getElementsByClassName("unavailable-input")[day].value;
        if (dayInput.length === 0) {continue}

        // input cleanup and tokenization
        let str = dayInput.replace(/\s/g, "") // Remove whitespaces
        let times = str.split(","); // Tokenize input

        // Loop through all unavailable time slots
        for (let timeSlot = 0; timeSlot < times.length; timeSlot++) {
            let timePeriod = times[timeSlot].split("-"); // 0 - start time, 1 - end time

            // Ensure start and end time length is 4, adding any needed "0" (EX. 8:35 => 08:35)
            for (let i = 0; i < 2; i++) {
                timePeriod[i] = timePeriod[i].replace(':', "");
                while (timePeriod[i].length < 4) { timePeriod[i] = "0" + timePeriod[i] }
            }

            //{"crn":30054,"subject":"CIS","courseNumber":3223,"subjectCourse":"CIS3223","creditHours":3,"title":"Data Structures and Algorithms","capacity":30,"currentCapacity":0,"capacityFull":1,"instructor":"Bo Ji","schedule":"Tue12301350,Thu12301350,","campus":"Main"}

            // Create schedule in same format as database "DDDHHMMHHMM,"
            let addToSchedule = daysOfWeek[day] + timePeriod[0] + timePeriod[1] + ",";
            let newUnavailable = {title: "Unavailable", crn: "", courseNumber:null, subject: null, subjectCourse: null,
            schedule: addToSchedule};
            unavailArr.push([newUnavailable]);
        }
    }
    return unavailArr;
}


//---ACTION LISTENERS---//
function classSubmit() {
    // Reset bad class input label if previous find schedules call returned in error
    document.getElementsByClassName("example-input-label")[1].textContent = 'Ex. "CIS3223, CIS4345, CIS3515, CIS3296"';
    document.getElementById("classesInput").style.borderColor = "black";

    moreOptionsDiv.style.display = "none"; // Hide more options dropdown to allow more space for calendar

    // Reset schedule if making a new schedule request
    currSchIndex = 0;
    numAvailSchedules = -1;
    availSchedules = {schedule: [], classes: []};

    let classInputList = document.getElementById('classesInput').value; // Get class input data
    if (classInputList === "") return; // Check if class input is empty

    classInputList = classInputList.replace(/\s/g, ""); // Remove all empty spaces from input
    let tokenizedClassInputList = classInputList.split(","); // Tokenize classes based on ','

    let unavailTimes = parseUnavailableTimesInput();
    console.log(unavailTimes);

    getClasses(tokenizedClassInputList).then(data => {
        /*
        * If data is a string, then it will be the first class from the input that resulted in an error/class not found
        * from the api. If the data is not a string, then it is an array of unique course arrays holding all the objects
        * of each unique section.
         */
        if(typeof data !== "string") {
            if (unavailTimes !== undefined) {
                data = data.concat(unavailTimes);
            }

            scheduleChecker(data); // Put in some serious work to find all combinations of possible schedules
            updateSchPageIndex(); // Update the counter indicating total number of available schedules
        } else {
            // Indicate error in class list input
            badClassInput(data);
        }
    });
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

document.getElementById("more-options-button").addEventListener("click", function () {
    if (moreOptionsDiv.style.display === "none" || moreOptionsDiv.style.display === "") {
        moreOptionsDiv.style.display = "inline";
    } else {
        moreOptionsDiv.style.display = "none";
    }
});
//---END ACTION LISTENERS---//