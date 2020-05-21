function updateSchPageIndex() {
    document.getElementById("schedule_index_label_0").textContent = (currSchIndex + 1).toString();

    if (numAvailSchedules === -1) {
        document.getElementById("schedule_index_label_1").textContent = "0";
    } else {
        document.getElementById("schedule_index_label_1").textContent = numAvailSchedules.toString();
    }
}

function newEvent(title, crn, startTime, endTime) {
    let event = document.createElement("li");
    event.classList.add("cd-schedule__event");

    let eventData = document.createElement("a");
    eventData.setAttribute("data-start", startTime);
    eventData.setAttribute("data-end", endTime);
    eventData.setAttribute("data-event", "event-" + crn);
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

function genScheduleEvents(availSchedules, scheduleIndex) {
    $("#calendar-content").html(old_html);

    for (let course = 0; course < availSchedules.classes[scheduleIndex].length; course++) {

        for (let day = 0; day < numDaysInWeek; day++) {
            for (let sch = 0; sch < availSchedules.classes[scheduleIndex][course].schedule[day].length; sch++) {
                let title = availSchedules.classes[scheduleIndex][course].title;
                let crn = (course + 1).toString();

                let classSchIntArr = availSchedules.classes[scheduleIndex][course].schedule[day][sch];
                let classTimeStr = scheduleTimeFormatting(classSchIntArr[0], classSchIntArr[1]);

                newEvent(document.getElementById("events-" + indexToDay(day)).appendChild(newEvent(title, crn, classTimeStr[0], classTimeStr[1])));
            }
        }
    }

    scheduleCall();
    console.log("complete");
}