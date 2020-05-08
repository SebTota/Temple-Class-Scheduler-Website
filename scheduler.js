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
* Merge two schedules into a single merged array. If a new meeting time starts before the previously added meeting time
* finished -1 is returned to indicate no schedule could be made.
* O(n) time complexity
 */
function scheduleOrderConcat(schedule, newClass) {
    // O(n) time & O(n) space
    let merged = [];
    let index1 = 0;
    let index2 = 0;
    let current = 0;

    while (current < (schedule.length + newClass.length)) {

        let isArr1Depleted = index1 >= schedule.length;
        let isArr2Depleted = index2 >= newClass.length;

        if (!isArr1Depleted && (isArr2Depleted || (schedule[index1][0] < newClass[index2][0]))) {
            if (current > 0 && schedule[index1][0] < merged[current-1][1]) {
                return -1;
            }
            merged[current] = [ schedule[index1][0], schedule[index1][1] ];
            index1++;
        } else {
            if (current > 0 && newClass[index2][0] < merged[current-1][1]) {
                return -1;
            }
            merged[current] = [ newClass[index2][0], newClass[index2][1]];
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
    for (let day = 0 ; day < daysOfTheWeek; day++) {
        // Check if newClass has any meeting times on day
        if (newClass[day].length === 0) {
            continue; // Skip to the next day of the week
        }

        schedule[day] = scheduleOrderConcat(schedule[day], newClass[day])
        if (schedule[day] === -1)
            return -1;

    }
    return schedule;
}


// TESTING
let class1 = {schedule: parseScheduleInput("Mon08000900,Tue11001220,Thu11001220,"), instructor: "Sebastian"};
let class2 = {schedule: parseScheduleInput("Mon11001220,Wed11001220,Fri08000900,"), instructor: "Tota"};

let testSchedule = {schedule: [], classes: []};

class1.schedule = checkScheduleFit(class1.schedule, class2.schedule);
console.log(class1.schedule);