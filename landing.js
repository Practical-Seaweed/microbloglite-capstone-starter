/* Landing Page JavaScript */

"use strict";

window.onload = () => {

    let showPassword = document.getElementById("showPassword");
    showPassword.addEventListener("change", () => {
        let isChecked = showPassword.checked; // [ this will get if it's checked ]
        passwordToggle("password", isChecked);
        passwordToggle("retypePassword", isChecked);
    });

}

function passwordToggle(fieldId, show) {
    let field = document.getElementById(fieldId);
    if (show) {
        field.type = "text";
    } else {
        field.type = "password";
    }
}

const loginForm = document.querySelector("#login");

loginForm.onsubmit = function (event) {
    // Prevent the form from refreshing the page,
    // as it will do by default when the Submit event is triggered:
    event.preventDefault();

    // We can use loginForm.username (for example) to access
    // the input element in the form which has the ID of "username".
    const loginData = {
        username: loginForm.username.value,
        password: loginForm.password.value,
    }

    // Disables the button after the form has been submitted already:
    loginForm.loginButton.disabled = true;

    // Time to actually process the login using the function from auth.js!
    login(loginData, function(success) {
        if (!success) {
            // If login is not successful, show an alert
            alert("Wrong username or password. Please try again.");
            loginForm.loginButton.disabled = false; // Re-enable the button
        }
    });
};

