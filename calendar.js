/*
* Update the index of which schedule you are looking at out of all the possible schedules.
 */
function updateSchPageIndex() {
    // Set current index
    document.getElementById("schedule_index_label_0").textContent = (currSchIndex + 1).toString();

    // Set total number of schedule possibilities index
    if (numAvailSchedules === -1) {
        document.getElementById("schedule_index_label_1").textContent = "0";
    } else {
        document.getElementById("schedule_index_label_1").textContent = numAvailSchedules.toString();
    }
}

/*
* Create a new schedule event based on information of the class.
 */
function newEvent(course, eventNum, startTime, endTime) {
    let event = document.createElement("li");
    event.setAttribute("start_time", startTime);
    event.classList.add("cd-schedule__event");

    let eventData = document.createElement("a");
    eventData.setAttribute("data-start", startTime);
    eventData.setAttribute("data-end", endTime);
    eventData.setAttribute("data-event", "event-" + eventNum);
    eventData.style.padding = "10px";

    let eventTitle = document.createElement("em");
    eventTitle.classList.add("event-schedule-list-block");
    eventTitle.textContent = course.title;

    /*let eventCrn = document.createElement("em");
    eventCrn.classList.add("event-schedule-list-block");
    eventCrn.classList.add("event-schedule-mobile");
    eventCrn.textContent = "CRN: " + course.crn;

    let eventProf = document.createElement("em");
    eventProf.classList.add("event-schedule-list-block");
    eventProf.classList.add("event-schedule-mobile");
    eventProf.textContent = "Prof: " + course.instructor;
     */

    eventData.appendChild(eventTitle);
    //eventData.appendChild(document.createElement("br"));
    //eventData.appendChild(eventCrn);
    //eventData.appendChild(document.createElement("br"));
    //eventData.appendChild(eventProf);
    event.appendChild(eventData);

    return event;
}

/*
* Add new calendar event in order based on start time.
 */
function addNewEventCal(course, day, eventNum, classTimeStr) {
    let dayElem = document.getElementById("events-" + indexToDay(day));
    let newElem = newEvent(course, eventNum, classTimeStr[0], classTimeStr[1]);
    dayElem.appendChild(newElem);

    let childNum = dayElem.children.length - 2;
    while (childNum >= 0 && parseInt(newElem.getAttribute("start_time").replace(":", ""), 10) < parseInt(dayElem.children[childNum].getAttribute("start_time").replace(":", ""), 10)) {
        dayElem.insertBefore(newElem, dayElem.children[childNum]);
        childNum--;
    }
}

/*
* Create a new HTML element that holds all the information about a specific class for the schedule class list
 */
function newListItem(courseObj, eventNum, scheduleIndex, multiple) {
    let item = document.createElement("li");
    item.value = 0; // Indicates which position in the array this course display is in (0 by default)
    item.classList.add("list-group-item");
    item.classList.add("list_event_" + eventNum);

    let infoDiv = document.createElement("div");

    let title = document.createElement("p");
    title.classList.add("item_title");
    title.textContent = courseObj.title;

    let crnLabel = document.createElement("p");
    crnLabel.textContent = "CRN: ";
    crnLabel.style.display = "inline";

    let crn = document.createElement("p");
    crn.classList.add("item_crn");
    crn.textContent = courseObj.crn;
    crn.style.display = "inline";

    let profLabel = document.createElement("p");
    profLabel.textContent = "Instr: ";
    profLabel.style.display = "inline";

    let prof = document.createElement("p");
    prof.classList.add("item_prof");
    prof.textContent = courseObj.instructor;
    prof.style.display = "inline";

    item.appendChild(infoDiv);
    infoDiv.appendChild(title);
    infoDiv.appendChild(crnLabel);
    infoDiv.appendChild(crn);
    infoDiv.appendChild(document.createElement("br"));
    infoDiv.appendChild(profLabel);
    infoDiv.appendChild(prof);
    infoDiv.appendChild(document.createElement("br"));


    if (multiple) {
        let buttonDiv = document.createElement("div");

        let buttonLeft = document.createElement("button");
        buttonLeft.textContent = " < ";
        buttonLeft.classList.add("btn-list-item-nav");
        buttonLeft.classList.add("btn-sm");

        // buttonLeft.addEventListener("click", calItemScroll(item, scheduleIndex, 0, "backward"));
        buttonLeft.onclick = function() {
            calItemScroll(item, scheduleIndex, eventNum-1, "backward")
        }

        let buttonRight = document.createElement("button");
        buttonRight.textContent = " > ";
        buttonRight.style.float = "right";
        buttonRight.classList.add("btn-list-item-nav");
        buttonRight.classList.add("btn-sm");

        // buttonRight.addEventListener("click", calItemScroll(item, scheduleIndex, 0, "forward"));
        buttonRight.onclick = function() {
            calItemScroll(item, scheduleIndex, eventNum-1, "forward")
        }

        item.appendChild(buttonDiv);
        buttonDiv.appendChild(buttonLeft);
        buttonDiv.appendChild(buttonRight);
    }


    return item;
}


/*
Convert class start and end time to a format the html scheduler will understand by converting int to
string and formatting.
FORMAT: HH:MM
Returns start and end time in correct string format using an array [startTime, endTime]
*/
function scheduleTimeFormatting(classStartInt, classEndInt) {
    // New string values
    let classStartStr = "0";
    let classEndStr = "0";

    /*
    Convert start/end integers to string to compare length (Can not get length of int!)
    If length is 3, add a "0" in front of the string to keep correct formatting
     */

    if (classStartInt.toString().length === 3) {
        classStartStr = classStartStr + classStartInt.toString().substring(0,1) + ":" + classStartInt.toString().substring(1,3);
    } else {
        classStartStr = classStartInt.toString().substring(0,2) + ":" + classStartInt.toString().substring(2,4);
    }

    if (classEndInt.toString().length === 3) {
        classEndStr = classEndStr + classEndInt.toString().substring(0,1) + ":" + classEndInt.toString().substring(1,3);
    } else {
        classEndStr = classEndInt.toString().substring(0,2) + ":" + classEndInt.toString().substring(2,4);
    }

    return [classStartStr, classEndStr];
}


/*
* Generate all schedule events for the specified index of all possible schedules.
 */
function genScheduleEvents(availSchedules, scheduleIndex) {
    let addedUnavailable = "false";

    $("#calendar-content").html(empty_calendar); // Reset the schedule to include no courses
    $("#class-event-list").html(empty_calendar_class_list); // Reset the schedule to include no courses

    let courseColor = 1;
    console.log(availSchedules.classes);
    for (let course = 0; course < availSchedules.classes[scheduleIndex].length; course++) { // Each course
        let cls = availSchedules.classes[scheduleIndex][course][0]

        /*
        * Needed to make sure "Unavailable" events are all the same color
         */
        let eventNum = "";
        if (cls.title !== "Unavailable") {
            eventNum = courseColor.toString(); courseColor++;
        } else {
            eventNum = "unavailable";
        }

        /*
        * Use the commented out code below if you would like the calendar-list to hold each reference to an
        * unavailable time slot.
         */

        /*
        document.getElementById("class-event-list").appendChild(
            newListItem(availSchedules.classes[scheduleIndex][course], eventNum));
         */

        if (cls.title !== "Unavailable") {
            document.getElementById("class-event-list").appendChild(
                newListItem(availSchedules.classes[scheduleIndex][course][0], eventNum, course, availSchedules.classes[scheduleIndex][course].length > 1));
        } else if(addedUnavailable === "false") {
            document.getElementById("class-event-list").appendChild(
                newListItem(availSchedules.classes[scheduleIndex][course][0], eventNum, course, false));
            addedUnavailable = "True";
        }


        for (let day = 0; day < numDaysInWeek; day++) { // Each day of the week
            for (let sch = 0; sch < availSchedules.classes[scheduleIndex][course][0].schedule[day].length; sch++) { // Each start/end pair for that specific day
                /*
                * Find the start and end time (ensuring a HH:MM format to preserve future functions)
                 */
                let classSchIntArr = availSchedules.classes[scheduleIndex][course][0].schedule[day][sch];
                let classTimeStr = scheduleTimeFormatting(classSchIntArr[0], classSchIntArr[1]);

                // Create new event based on given info
                addNewEventCal(cls, day, eventNum, classTimeStr);
            }
        }
    }

    scheduleCall(); // Generate CSS for each new event
}