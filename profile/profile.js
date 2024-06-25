"use strict";

window.onload = async () => {
    console.log("hah im inside your profile.js");

    await displayUserData();

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
        alert("You've logged out!");
    });

    const publishForm = document.getElementById("publishForm");
    publishForm.addEventListener("submit", PublishPost);
};

const displayUserData = async () => {
    try {
        const loginData = getLoginData();

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
            hour12: true
        });
        const formattedCreatedAt = dateTimeFormat.format(createdAt);

        const profileContainer = document.getElementById("profile-container");
        profileContainer.innerHTML = `
            <h2>Welcome, ${userData.fullName}!</h2>
            <h5>Username: ${userData.username}</h5>
            <p>User Created: ${formattedCreatedAt}</p>
            <br>
            <p>Bio: <span id="bio">${userData.bio || "Pretty empty... Add some personality!"}</span></p>
            <button class="btn btn-secondary" id="editBioButton">Edit Bio</button>
        `;

        const bioElement = document.getElementById("bio");
        bioElement.classList.add("bioClass", "fw-light");

        document.getElementById("editBioButton").addEventListener("click", showBioEditForm);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

const showBioEditForm = () => {
    const bioElement = document.getElementById("bio");
    bioElement.innerHTML = `
        <textarea class="form-control" id="bioInput" rows="3">${bioElement.textContent}</textarea>
        <button class="btn btn-primary mt-2" id="saveBioButton">Save</button>
    `;
    document.getElementById("saveBioButton").addEventListener("click", saveBio);
};

const saveBio = async () => {
    try {
        const loginData = getLoginData();
        const newBio = document.getElementById("bioInput").value;

        const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${loginData.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ bio: newBio })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to update bio. Server response: ${errorMessage}`);
        }

        alert("Bio updated successfully!");
        await displayUserData();
    } catch (error) {
        console.error("Error updating bio:", error);
        alert("An error occurred while updating the bio. Please try again later!");
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
            body: JSON.stringify({ text: textAreaValue })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to post data. Server response: ${errorMessage}`);
        }

        alert("Content published successfully!");

        document.getElementById("text").value = "";
        window.location.replace("../posts/index.html");
    } catch (error) {
        console.error("Error publishing content:", error);
        alert("An error occurred while adding a post. Please try again later!");
    }
};
