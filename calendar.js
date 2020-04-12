// https://css-tricks.com/building-a-conference-schedule-with-css-grid/

// day: mon, tue, wed, thr, fri
function newEvent(title, day, startTime, endTime) {
    var event = document.createElement("div");
    event.classList.add("session");
    event.classList.add("track-" + day)
    event.style.gridColumn = "track-" + day;
    event.style.gridRow = "time-" + startTime + " / time-"+ endTime;
    event.style.backgroundColor = "#35626e"
    event.style.color = "white";

    var eventText = document.createElement("h3");
    eventText.style.margin=".5em";
    eventText.innerHTML=title;
    eventText.classList.add("session-title")
    event.appendChild(eventText);

    document.getElementById("schedule").appendChild(event);


}

newEvent("CIS TEST", "thr", "0900", "1000");

/*
<div class="session track-mon" style="grid-column: track-mon; grid-row: time-0800 / time-0900; height:83%; background-color:#35626e; color: white;">
                <div style="margin:.5em;">
                    <h3 class="session-title">CIS1001</h3>
                </div>
            </div>
 */