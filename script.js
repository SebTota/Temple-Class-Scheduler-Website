const apiUrl = "https://api.sebtota.com";
// const apiUrl="http://localhost"
const apiPort = "4001";

const calendarElem = document.getElementById("calendar-content");
const listElem = document.getElementById("list-content");

let moreOptionsDiv = document.getElementById("more-options-form");

let selectedClasses = [];

/*
* Create a dynamic 2d array
 */
function create2dArray(arr, col) {
    for (let x = 0; x < col; x++) {
        arr[x] = [];
    }
}

//---API CALLS---//
async function fetchApi(apiCall){
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

    console.log(addReviewUrl);

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

function appendToDictList(dict, key, value) {
    // Create array inside dictionary key if it doesn't exist
    if (typeof(dict[key]) === 'undefined') {
        dict[key] = [];
    }
    // Add value to array
    dict[key].push(value);
}

//---EVENT HANDLERS---//
function classSubmit() {
    moreOptionsDiv.style.display = "none"; // Hide more options dropdown to allow more space for calendar

    // Reset schedule if making a new schedule request
    currSchIndex = 0;
    numAvailSchedules = -1;
    availSchedules = {schedule: [], classes: []};

    // Bug fix: Needed in case no classes are specified at first, but then more are added since default classes
    // added below wont clear out.
    let selectedClassList = selectedClasses;

    // Set default value if no classes were entered
    if (selectedClasses.length === 0) {
        selectedClassList = ["cis3207", "math1015"];
    }

    let unavailTimes = parseUnavailableTimesInput();

    getClasses(selectedClassList).then(data => {
        /*
        * If data is a string, then it will be the first class from the input that resulted in an error/class not found
        * from the api. If the data is not a string, then it is an array of unique course arrays holding all the objects
        * of each unique section.
         */
        if(typeof data !== "string") {
            if (unavailTimes !== undefined) {
                data = data.concat(unavailTimes);
            }

            console.log("data:");
            console.log(data);

            let combinedCoursesDict = [];

            create2dArray(combinedCoursesDict, data.length)

            for (let i = 0; i < combinedCoursesDict.length; i++) {
                combinedCoursesDict[i] = {};
            }

            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    let tempClass = data[i][j];
                    appendToDictList(combinedCoursesDict[i], tempClass['schedule'], tempClass);
                }
            }

            // console.log("cleaned data:");
            // console.log(combinedCoursesDict);

            let combinedCourses = [];
            create2dArray(combinedCourses, data.length);

            /*
            Given an array of dictionaries holding arrays, extract the inner most arrays and append them to
            combinedCourses array.
             */
            for (let i = 0; i < combinedCoursesDict.length; i++) {
                for (let key in combinedCoursesDict[i]) {
                    // check if the property/key is defined in the object itself, not in parent
                    if (combinedCoursesDict[i].hasOwnProperty(key)) {
                        // console.log(combinedCoursesDict[i][key]);
                        combinedCourses[i].push(combinedCoursesDict[i][key])
                    }
                }
            }

            console.log("Combined courses:");
            console.log(combinedCourses);

            scheduleChecker(combinedCourses); // Put in some serious work to find all combinations of possible schedules
            updateSchPageIndex(); // Update the counter indicating total number of available schedules
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

/*
 Scroll through each section of class, if multiple were found
 item = Div that shows class info
 classIndex = Overall index to indicate which index to check in the array of schedules
 direction = Which way to more (forward/backward)
 */
function calItemScroll(item, scheduleIndex, classIndex, displayIndex, direction) {
    if (numAvailSchedules <= 0) return; // No schedule created yet

    console.log(item);

    const courseDisplayOptions = availSchedules.classes[scheduleIndex][classIndex]
    const numOptions = courseDisplayOptions.length

    if (direction === "forward") {
        displayIndex = ++displayIndex % numOptions;
    } else {
        // Only decrement schedule counter if currSchIndex (current schedule index) is positive
        if (displayIndex >= 1) --displayIndex;
    }

    const newCourseInfo = availSchedules.classes[scheduleIndex][classIndex][displayIndex];
    item.getElementsByClassName('item_crn')[0].textContent = newCourseInfo.crn;


    // updateSchPageIndex();
    // genScheduleEvents(availSchedules, currSchIndex);
}

function displayMoreOptions() {
    if (moreOptionsDiv.style.display === "none" || moreOptionsDiv.style.display === "") {
        moreOptionsDiv.style.display = "inline";
    } else {
        moreOptionsDiv.style.display = "none";
    }
}

function changeCalendarView() {
    var mq = window.matchMedia( "(max-width: 1024px)" );
    if (mq.matches) {
        if (listElem.style.display !== "inline") {
            // Make list visible
            calendarElem.style.display = "none";
            calendarElem.style.width = "0";
            listElem.style.display = "inline";
            listElem.style.width = "100%";
        } else {
            // Make calendar visible
            listElem.style.display = "none";
            listElem.style.width = "0";
            calendarElem.style.display = "inline";
            calendarElem.style.width = "100%";
        }
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
    if (item.classList.contains('list-group-item-danger')) {
        item.parentNode.parentNode.removeChild(item.parentNode);
        selectedClasses.remove(item.textContent);
    } else {
        item.classList.add('list-group-item-danger');
    }
}

$(document).click(function(event) {
    // Hide class dropdown when clicked outside the dropdown
    document.getElementById("class-search-results").style.display = "none";

    var $target = $(event.target);
    if(!$target.closest('.class-list-elem').length) {
        const addedClasses = document.getElementsByClassName('class-list-elem');
        console.log("Resetting class list removal danger class");
        for (let i = 0; i < addedClasses.length; i++) {
            console.log(addedClasses[i].classList);
            addedClasses[i].classList.remove('list-group-item-danger');
        }
    }
});