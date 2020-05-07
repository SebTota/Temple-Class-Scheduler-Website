const daysOfTheWeek = 5; // Only Monday - Friday is supported

/*
* Return day of the week index based on var 'day' input
* Return -1 if day is not specified
 */
function dayToIndex(day) {
    switch(day) {
        case "Mon":
            return 0;
        case "Tue":
            return 1;
        case "Wed":
            return 2;
        case "Thu":
            return 3;
        case "Fri":
            return 4;
        default:
            return -1;
    }
}

/*
* Return a 2D array of meeting times (schedule) for a particular class.
* Input format expected: "DAYHHMMHHMM,"
 */
function parseScheduleInput(schedulerInput) {
    /*
    * Create 2D array to hold classes for each day of the week
    * [dayOfTheWeek][startTime, endTime] || [dayOfTheWeek][startTime, endTime, startTime, endTime]
    * Certain classes have multiple meeting times per day, therefore the second index is an array of start
    * to end meeting times.
     */

    let weekSchedule = [];
    for (let day = 0; day < 5; day++) {
        weekSchedule[day] = [];
    }

    /*
    * Input string is split into sections of size 12 (including the separating comma)
    * Each 12 char chunk includes the day of the week and start & end meeting time.
     */
    for (let i = 0; i < schedulerInput.length; i+=12) {
        // Hold the current substring to be parsed   ex. "Tue11001220"
        let scheduleString = schedulerInput.substring(i, i+11);

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
* Check if class can fit the current schedule without overlapping meeting times
 */
function checkScheduleFit(schedule, newClass) {
    for (let day = 0 ; day < daysOfTheWeek; day++) {
        // Check if newClass has any meeting times on day
        if (newClass[day].length === 0) {
            continue; // Skip to the next day of the week
        }

        console.log(schedule.concat(newClass));

    }
    return true;
}


// TESTING
let class1 = {schedule: parseScheduleInput("Mon08000900,Tue11001220,Thu11001220,"), instructor: "Sebastian"};
let class2 = {schedule: parseScheduleInput("Mon11001220,Wed11001220,Fri08000900,"), instructor: "Tota"};

let testSchedule = {schedule: [], classes: []};


console.log(class1.schedule[0].concat(class2.schedule[0]));