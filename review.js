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

function updateTextCounter() {

}

