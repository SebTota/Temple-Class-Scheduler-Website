// const apiUrl = "https://api.sebtota.com";
const apiUrl="http://localhost"
const apiPort = "3000";

let moreOptionsDiv = document.getElementById("more-options-form");

let selectedClasses = [];

//---API CALLS---//
async function fetchApi(apiCall) {
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

async function findClassAPI(searchTerm) {
    return await fetchApi(apiUrl + ":" + apiPort + "/searchClassList/" + searchTerm);
}

async function api_addReview(instructor, course, rating, difficulty, review, email, pass) {
    let addReviewUrl =
        "instructor=" + encodeURIComponent(instructor) +
        "&course=" + encodeURIComponent(course) +
        "&rating=" + encodeURIComponent(rating) +
        "&difficulty=" + encodeURIComponent(difficulty) +
        "&review=" + encodeURIComponent(review) +
        "&takeAgain=" + encodeURIComponent(takeAgain) +
        "&email=" + encodeURIComponent(email) +
        "&pass=" + encodeURIComponent(pass);

    return await fetchApi(apiUrl + ":" + apiPort + '/addReview?' + addReviewUrl);
}

async function api_getCourse(className) {
    let apiCall = apiUrl + ":" + apiPort + "/course?title=" + className;
    console.log(apiCall);

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
        let courseSchedules = await api_getCourse(userClassList[i]);

        // Check if API returned successfully
        if (courseSchedules.success === false){
            // Upon failure return which class failed/not found in database
            return userClassList[i];
        } else {
            // Class was found so add data to successful classes
            classListAPIReturn.push(courseSchedules.data);
        }
    }

    return classListAPIReturn;
}

async function api_searchProf(searchTerm) {
    let apiCall = apiUrl + ":" + apiPort + "/searchProfList/" + searchTerm;

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


// https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value
// Remove from array by value
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

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


//---EVENT HANDLERS---//
function classSubmit() {
    moreOptionsDiv.style.display = "none"; // Hide more options dropdown to allow more space for calendar

    // Reset schedule if making a new schedule request
    currSchIndex = 0;
    numAvailSchedules = -1;
    availSchedules = {schedule: [], classes: []};

    // Set default value if no classes were entered
    if (selectedClasses.length === 0) {
        selectedClasses = ["cis3223", "cis4345", "cis3515", "cis3296"];
    }

    let unavailTimes = parseUnavailableTimesInput();

    getClasses(selectedClasses).then(data => {
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

// Scroll through schedules using left and right buttons
function calendarScrollButton(btn) {
    if (numAvailSchedules <= 0) return; // No schedule created yet

    if (btn === "forward") {
        currSchIndex = ++currSchIndex % numAvailSchedules;
    } else {
        // Only decrement schedule counter if currSchIndex (current schedule index) is positive
        if (currSchIndex >= 1) --currSchIndex;
    }

    updateSchPageIndex();
    genScheduleEvents(availSchedules, currSchIndex);
}

function displayMoreOptions() {
    if (moreOptionsDiv.style.display === "none" || moreOptionsDiv.style.display === "") {
        moreOptionsDiv.style.display = "inline";
    } else {
        moreOptionsDiv.style.display = "none";
    }
}
//---END EVENT HANDLERS---//




// Duplicate in review.js
function createClassSearchList_SchedulePage(classes) {
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

// Duplicate in review.js
// Create a list of professors from the database once the user enters at least 3 characters
function classSearchHandler_SchedulePage(val) {
    val = val.replace(/\s/g,''); // Remove all spaces because no spaces in database class names

    // Only start showing search results after 2 characters of input
    if (val.length >= 2) {
        findClassAPI(val).then(returnVal => {
            document.getElementById("class-search-results").style.display = "inline";
            if (returnVal.success === true) {
                createClassSearchList_SchedulePage(returnVal.data);
            }
        });
    }
}

function courseSelected_ReviewPage(className) {
    if (!selectedClasses.includes(className)) {
        document.getElementById("course-list-input").value = ""; // Clear search bar
        document.getElementById("class-search-results").style.display = "none"; // Hide class dropdown until new search
        selectedClasses.push(className);
        let newClass = '<li class="list-inline-item"><a onclick="classListItemHandler(this)" class=" class-list-elem list-group-item">' + className + '</a></li>'
        $('#selected-class-list').append(newClass);
    }
}

function classListItemHandler(item) {
    console.log(item);
    console.log(item.classList[1]);
    if (item.classList.contains('list-group-item-danger')) {
        item.parentNode.removeChild(item);
        selectedClasses.remove(item.textContent);
    } else {
        item.classList.add('list-group-item-danger');
    }
}

// Hide class dropdown when clicked outside the dropdown
$(document).click(function() {
    document.getElementById("class-search-results").style.display = "none";
});