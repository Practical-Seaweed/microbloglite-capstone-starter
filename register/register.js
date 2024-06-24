"use strict"

window.onload = () => {
    console.log("heh im inside your register.js");

    let createRegisterForm = document.getElementById("registerForm");
    createRegisterForm.addEventListener("submit", createAUser);

    let showPassword = document.getElementById("showPassword");
    showPassword.addEventListener("change", () => {
        let isChecked = showPassword.checked; // [ this will get if it's checked ]
        passwordToggle("password", isChecked);
        passwordToggle("retypePassword", isChecked);
    });

    let passwordField = document.getElementById("password");
    passwordField.addEventListener("input", checkPasswordMatch);

    let retypePasswordField = document.getElementById("retypePassword");
    retypePasswordField.addEventListener("input", checkPasswordMatch);
}

function passwordToggle(fieldId, show) {
    let field = document.getElementById(fieldId);
    if (show) {
        field.type = "text";
    } else {
        field.type = "password";
    }
}

function checkPasswordMatch() {
    let password = document.getElementById("password").value;
    let retypePassword = document.getElementById("retypePassword").value;
    
    if (password !== retypePassword) {
        document.getElementById("retypePassword").setCustomValidity("Passwords must match");
    } else {
        document.getElementById("retypePassword").setCustomValidity("");
    }
}


let createAUser = async (event) => {
    event.preventDefault();

    let formData = new FormData(event.target);
    let formDataAsObject = Object.fromEntries(formData);

    console.log("Form data as object:", formDataAsObject);

    try {
        let response = await fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/users", {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(formDataAsObject)
        });

        if (response.status === 403) {
            alert("Username is already in use. Please choose a different username.");
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to add user. Please try again later.");
        }

        alert("User registered successfully!");

        window.location.href = "../index.html";

    } catch (error) {
        console.log("uh oh error error:", error);
        alert("An error occurred while adding the user. Please try again later.")
    }
}