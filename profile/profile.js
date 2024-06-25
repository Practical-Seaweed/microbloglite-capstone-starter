"use strict"

window.onload = async () => {

    console.log("hah im inside your profile.js");

    await displayUserData();

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        logout();
        alert("You've logged out!");
    })

    const publishForm = document.getElementById("publishForm");
    publishForm.addEventListener("submit", PublishPost);

};

const displayUserData = async () => {
    try {
        const loginData = getLoginData();

        // Fetch user data dynamically based on username or user identifier
        const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${loginData.token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        console.log("User Data:", userData);

        const createdAt = new Date(userData.createdAt);


        const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: true // [ WHO USES 24HOURS EWWW ]
        });

        const formattedCreatedAt = dateTimeFormat.format(createdAt);

        const profileContainer = document.getElementById("profile-container");
        profileContainer.innerHTML = `
            <h2>Welcome, ${userData.fullName}!</h2>
            <h5>Username: ${userData.username}</h3>
            <p>Bio: ${userData.bio}</p>
            <footer>User Created: ${formattedCreatedAt}</footer>
            <!-- Add more profile information here as needed -->
        `;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};


const PublishPost = async (event) => {
    event.preventDefault();

    try {
        const loginData = getLoginData();
        const textAreaValue = document.getElementById("text").value;

        const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${loginData.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: textAreaValue // Corrected from 'content' to 'text' based on server response
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to post data. Server response: ${errorMessage}`);
        }

        alert("Content published successfully!");

        // Clear textarea after successful post
        document.getElementById("text").value = "";

        // Optionally, redirect to the homepage or reload to see the new post
        window.location.replace("../posts/index.html");

    } catch (error) {
        console.error("Error publishing content:", error);
        alert("An error occurred while adding a post. Please try again later!");
    }
};
