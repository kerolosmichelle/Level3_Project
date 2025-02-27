// Function to append a value to the calculator display
function appendToDisplay(value) {
    document.getElementById('display').value += value; // Adds the value to the current display content
}

// Function to clear the calculator display
function clearDisplay() {
    document.getElementById('display').value = ''; // Sets the display value to an empty string
}

// Function to calculate the result of the expression in the display
function calculateResult() {
    try {
        // Evaluates the expression in the display and updates the display with the result
        document.getElementById('display').value = eval(document.getElementById('display').value);
    } catch {
        // Displays an alert if the expression is invalid
        alert('Invalid input');
    }
}

// Event listener for the theme changer button
document.getElementById("changetheme").addEventListener("click", function() {
    let body = document.body; // Gets the body element

    // Checks the current theme and cycles to the next one
    if (body.classList.contains("theme1")) {
        body.classList.remove("theme1"); // Removes theme1
        body.classList.add("theme2"); // Adds theme2
    } else if (body.classList.contains("theme2")) {
        body.classList.remove("theme2"); // Removes theme2
        body.classList.add("theme3"); // Adds theme3
    } else if (body.classList.contains("theme3")) {
        body.classList.remove("theme3"); // Removes theme3
        body.classList.add("theme1"); // Adds theme1
    } else {
        // Default case: If no theme is applied, start with theme3
        body.classList.remove("theme1"); // Removes theme1 (if present)
        body.classList.add("theme3"); // Adds theme3
    }
});

// Function to store and display a username
function storeAndDisplay() {
    let inputValue = document.getElementById("username").value; // Gets the value from the input field
    document.getElementById("welcome").textContent = "Welcome " + inputValue +  "!!"; // Updates the paragraph with the welcome message
}