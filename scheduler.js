const empty_calendar = $("#calendar-content").html(); // Create a reference to an empty calendar
const empty_calendar_class_list = $("#class-event-list").html();
const numDaysInWeek = 5; // Only Monday - Friday is supported
let daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];


// Global variables
let currSchIndex = 0; // Current schedule index out of all possible schedules
let numAvailSchedules = -1; // Number of possible schedules found
let availSchedules = {schedule: [], classes: []};


/*
* Create a dynamic 2d array
 */
function create2dArray(arr, col) {
    for (let x = 0; x < col; x++) {
        arr[x] = [];
    }
}


/*
* Return day of the week index based on var 'day' input
* Return -1 if day is not specified
 */
function dayToIndex(day) { return daysOfWeek.indexOf(day); }


/*
* Return the day of the week in text based on index (0 - Monday, 4 - Friday)
* Note: Only works with Monday -> Friday
 */
function indexToDay(index){
    switch(index) {
        case 0:
            return "monday";
        case 1:
            return "tuesday";
        case 2:
            return "wednesday";
        case 3:
            return "thursday";
        case 4:
            return "friday";
        default:
            return null;
    }
}


/*
* Return a 2D array of meeting times (schedule) for a particular class.
* Input format expected: "DAYHHMMHHMM,"
 */
function parseScheduleInput(schedulerInput) {
    if (schedulerInput === null || schedulerInput.length === 0)
        return -1;

    /*
    * Create 2D array to hold classes for each day of the week
    * [dayOfTheWeek][startTime, endTime] || [dayOfTheWeek][startTime, endTime, startTime, endTime]
    * Certain classes have multiple meeting times per day, therefore the second index is an array of start
    * to end meeting times.
     */

    let weekSchedule = [];
    create2dArray(weekSchedule, numDaysInWeek);

    /*
    * Input string is split into sections of size 12 (including the separating comma)
    * Each 12 char chunk includes the day of the week and start & end meeting time.
     */
    for (let i = 0; i < schedulerInput.length; i+=12) {
        // Hold the current substring to be parsed   ex. "Tue11001220"
        let scheduleString = schedulerInput.substring(i, i+11);


        if (scheduleString === "online") {
            continue;
        }


        // Parse starting and ending times from string and convert to integer
        let classStart = parseInt(scheduleString.substring(3, 7), 10);
        let classEnd = parseInt(scheduleString.substring(7, 11), 10);

        /*
        * Push start & end meeting times as integers to corresponding index of the weekSchedule array
        * based on the day of the week.
        * The index to which a new time was added is sorted to avoid errors where a meeting that starts
        * earlier in the day is the last index in the array.
         */
        weekSchedule[dayToIndex(scheduleString.substring(0,3))].push([classStart, classEnd]);
        weekSchedule[1].sort(function(a, b){return a-b});
    }

    return weekSchedule;
}


/*
* Merge two schedules into a single merged array. If a new meeting time starts before the previously added meeting time
* finished -1 is returned to indicate no schedule could be made.
* O(n) time complexity
 */
function scheduleOrderConcat(schedule, newClass) {
    // O(n) time & O(n) space
    let merged = [];
    let index1 = 0;
    let index2 = 0;
    let current = 0; // Current index of the new merged list

    while (current < (schedule.length + newClass.length)) {

        let isArr1Depleted = index1 >= schedule.length;
        let isArr2Depleted = index2 >= newClass.length;

        if (!isArr1Depleted && (isArr2Depleted || (schedule[index1][0] < newClass[index2][0]))) {
            // Check for schedule conflict by comparing start time (index 0) of next entry to be added against
            // the last meeting end time in the successfully merged array
            if (current > 0 && schedule[index1][0] <= merged[current-1][1]) {
                return -1;
            }
            merged[current] = [ schedule[index1][0], schedule[index1][1] ];
            index1++;
        } else {
            // Check for schedule conflict by comparing start time (index 0) of next entry to be added against
            // the last meeting end time in the successfully merged array
            if (current > 0 && newClass[index2][0] <= merged[current-1][1]) {
                return -1;
            }
            merged[current] = [ newClass[index2][0], newClass[index2][1] ];
            index2++;
        }

        current++;
    }

    return merged;
}


/*
* Loop through each day of the week and check if newClass has any scheduled meeting times for that day of the week (indicated
* by newClass[day].length being grater than 0). If newClass has scheduled meeting times during said day, check if the
* class can be added ot the current schedule.
 */
function checkScheduleFit(schedule, newClass) {
    let tempSchedule = [];
    create2dArray(tempSchedule, numDaysInWeek);

    for (let day = 0 ; day < numDaysInWeek; day++) {
        if (newClass[day].length === 0 && schedule[day].length === 0) {
            continue; // Skip to the next day of the week
        }

        /*
        * Call scheduleOrderConcat to check if newClass can be added to schedule without time conflict.
        * If time conflict found return -1
         */
        tempSchedule[day] = scheduleOrderConcat(schedule[day], newClass[day]);
        if (tempSchedule[day] === -1) {
            // scheduleOrderConcat returned time conflict on specified day
            // return -1 to indicate schedule could not be created
            return -1;
        }
    }

    return tempSchedule;
}


/*
* Recursive function call used to traverse through each course, then each section of said course.
 */
function findScheduleRec(availClasses, classList, currSchedule, currClasses, classIndex) {
    for (let section = 0; section < classList[classIndex].length; section++) {
        classList[classIndex][section][0].title = classList[classIndex][section][0].title.replace("&amp;", "&");
        let tempSchedule = checkScheduleFit(currSchedule, classList[classIndex][section][0].schedule);

        if (tempSchedule !== -1) {
            /*
            * Copy array currClasses into tempCurrClasses to test if adding the  new class would result in schedule
            * interference. Use slice() method to create a copy of the array instead of making a reference to
            * currClasses.
             */
            let tempCurrClass = currClasses.slice();
            tempCurrClass.push(classList[classIndex][section]);

            if (classIndex === classList.length-1) {
                // End of successful recursion so add the possible schedule, along with the classes that made up
                // said schedule.
                availClasses.schedule.push(tempSchedule);
                availClasses.classes.push(tempCurrClass);
            } else {
                // Not at the end of a recursive algo. Keep testing.
                let tempInd = classIndex + 1;
                findScheduleRec(availClasses, classList, tempSchedule, tempCurrClass, tempInd);
            }
        }
    }
}


/*
* Thanks to Ryan O'Connor for help with the scheduling algorithm.
* https://github.com/ryan-SWE
 */
function scheduleChecker(classObjects) {
    let classList = [];
    create2dArray(classList, classObjects.length);

    //--- Receive and parse data---//
    // Iterate through each class in class list to get all all the schedules for each course
    for (let i = 0; i < classObjects.length; i++) {
        let courseSchedules = classObjects[i];

        // Iterate through each section of a class
        for (let j = 0; j < courseSchedules.length; j++) {
            /*
            * Check if class has an available schedule. If class is online, or no schedule has yet been made,
            * ignore the class for schedule creation. This includes Research work courses.
             */
            let tempClass = JSON.parse(JSON.stringify(courseSchedules[j]));
            let tempSchedule = parseScheduleInput(tempClass[0].schedule);

            // Check if class has an actual schedule and only add it if it does
            if (tempSchedule !== -1) {
                // Set the class schedule to the correctly formatted schedule
                // tempClass.schedule = tempSchedule;
                tempClass.forEach(cls => cls.schedule = tempSchedule);

                // Add class to the list of classes to be considered during schedule creation
                classList[i][j] = tempClass;
            }
        }
    }
    //--- ---//

    // Starting placeholder variables
    let startSchedule = [];
    create2dArray(startSchedule, numDaysInWeek);
    let startClasses = [];

    /*
    * Begin recursive algorithm for class search.
    * All possible schedules will be saved to availSchedules.schedules,
    * with the corresponding class objects (including the schedules) being stored in availSchedules.classes
     */
    findScheduleRec(availSchedules, classList, startSchedule, startClasses,0);
    console.log('available schedules found:');
    console.log(availSchedules)
    numAvailSchedules = availSchedules.classes.length; // Set to number of possible schedules found
    if (numAvailSchedules === 0) {
        console.log("No available schedules found");
        // Reset webpage to represent no available schedules
        $("#calendar-content").html(empty_calendar); // Reset the schedule to include no courses
        $("#class-event-list").html(empty_calendar_class_list); // Reset the schedule to include no courses
    } else {
        genScheduleEvents(availSchedules, currSchIndex); // Update webpage schedule to represent first possible schedule
    }
}