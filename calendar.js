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
function newEvent(title, courseNum, startTime, endTime) {
    let event = document.createElement("li");
    event.classList.add("cd-schedule__event");

    let eventData = document.createElement("a");
    eventData.setAttribute("data-start", startTime);
    eventData.setAttribute("data-end", endTime);
    eventData.setAttribute("data-event", "event-" + courseNum);
    eventData.style.padding = "10px";

    let eventTitle = document.createElement("em");
    eventTitle.classList.add("cd-schedule__name");
    eventTitle.textContent = title;
    eventTitle.style.fontSize = "15px";
    eventTitle.style.padding = "0px";

    eventData.appendChild(eventTitle);
    event.appendChild(eventData);

    return event;
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
    $("#calendar-content").html(old_html); // Reset the schedule to include no courses


    for (let course = 0; course < availSchedules.classes[scheduleIndex].length; course++) { // Each course
        for (let day = 0; day < numDaysInWeek; day++) { // Each day of the week
            for (let sch = 0; sch < availSchedules.classes[scheduleIndex][course].schedule[day].length; sch++) { // Each start/end pair for that specific day
                let title = availSchedules.classes[scheduleIndex][course].title;
                let crn = (course + 1).toString();

                /*
                * Find the start and end time (ensuring a HH:MM format to preserve future functions)
                 */
                let classSchIntArr = availSchedules.classes[scheduleIndex][course].schedule[day][sch];
                let classTimeStr = scheduleTimeFormatting(classSchIntArr[0], classSchIntArr[1]);

                // Create new event based on given info
                newEvent(document.getElementById("events-" + indexToDay(day)).appendChild(newEvent(title, crn, classTimeStr[0], classTimeStr[1])));
            }
        }
    }

    scheduleCall(); // Generate CSS for each new event
    console.log("complete");
}