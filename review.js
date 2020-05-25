function updateTextInput(id, value) {
    document.getElementById(id).textContent = value;
}

function togglePass(id) {
    let checkBox = document.getElementById(id);
    if (checkBox.type === "password") {
        checkBox.type = "text";
    } else {
        checkBox.type = "password";
    }
}

// Init slider values to 5
updateTextInput("rating-indicator", document.getElementById("rating-slider-input").value = 5);
updateTextInput("difficulty-indicator", document.getElementById("difficulty-slider-input").value = 5);
