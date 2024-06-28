"use strict";

window.onload = async () => {
    console.log("hah im inside your profile.js");

    await userPosts();

    await displayUserData();

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
        alert("You've logged out!");
    });

    const publishForm = document.getElementById("publishForm");
    publishForm.addEventListener("submit", PublishPost);

    // Ensure the user posts container exists before calling getUserPOSTS
    if (document.getElementById("user-posts-container")) {
        await userPosts();
    }
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

        // Create a card for profile data
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="card-body text-center">
                <div class="d-flex justify-content-center align-items-center mb-2">
                    <h2 class="me-3">Welcome, <span id="fullName">${userData.fullName}</span>!</h2>
                    <button class="btn btn-secondary" id="editFullNameButton"><i class="bi bi-pencil-square"></i> Edit Name</button>
                </div>
                <div class="d-flex justify-content-center align-items-center mt-2 mb-2">
                    <h5 id="username" class="me-3">Username: ${userData.username}</h5>
                </div>
                <p class="mt-3">User Created: ${formattedCreatedAt}</p>
                <div class="d-flex justify-content-center align-items-center mt-3">
                    <p>Bio: <span id="bio" class="fw-light">${userData.bio || "Pretty empty... Add some personality!"}</span></p>
                    <button class="btn btn-secondary ms-3" id="editBioButton"><i class="bi bi-pencil-square"></i> Edit Bio</button>
                </div>
            </div>
        `;

        // Clear only the contents inside profileContainer, not the container itself
        profileContainer.innerHTML = '';
        profileContainer.appendChild(card);

        // Add event listeners for edit buttons
        document.getElementById("editBioButton").addEventListener("click", showBioEditForm);
        document.getElementById("editFullNameButton").addEventListener("click", showFullNameEditForm);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

const showFullNameEditForm = () => {
    const fullNameElement = document.getElementById("fullName");
    const fullNameText = fullNameElement.textContent;
    fullNameElement.innerHTML = `
        <input type="text" class="form-control" id="fullNameInput" value="${fullNameText}">
        <button class="btn btn-primary mt-2" id="saveFullNameButton">Save</button>
    `;
    document.getElementById("saveFullNameButton").addEventListener("click", saveFullName);
};

const showBioEditForm = () => {
    const bioElement = document.getElementById("bio");
    bioElement.innerHTML = `
        <textarea class="form-control" id="bioInput" rows="3">${bioElement.textContent}</textarea>
        <button class="btn btn-primary mt-2" id="saveBioButton">Save</button>
    `;
    document.getElementById("saveBioButton").addEventListener("click", saveBio);
};


const saveFullName = async () => {
    try {
        const loginData = getLoginData();
        const newFullName = document.getElementById("fullNameInput").value;

        const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${loginData.username}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${loginData.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fullName: newFullName })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to update full name. Server response: ${errorMessage}`);
        }

        alert("Full name updated successfully!");
        await displayUserData();
    } catch (error) {
        console.error("Error updating full name:", error);
        alert("An error occurred while updating the full name. Please try again later!");
    }
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
            throw new Error(`Server returned ${response.status} (${response.statusText}): ${errorMessage}`);
        }

        alert("Content published successfully!");

        document.getElementById("text").value = "";
        await userPosts(); // Fetch and display the updated list of posts
    } catch (error) {
        console.error("Error publishing content:", error);
        alert("An error occurred while adding a post. Please try again later!");
    }
};



const userPosts = async () => {
    const loginData = getLoginData();

    const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts?username=${loginData.username}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`
        }
    });

    const userPosts = await response.json();

    const sectionElement = document.querySelector("section");

    userPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        const createdAt = new Date(post.createdAt);

        const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: true
        });

        const formattedCreatedAt = dateTimeFormat.format(createdAt);

        const initialLikes = Array.isArray(post.likes) ? post.likes.length : 0;

        const hasLiked = post.likes.some(like => like.username === loginData.username);

        const postContent = `
            <div class="post-header">
                <h2 class="post-username">${post.username}</h2>
                <p class="post-text">${post.text}</p>
                <p class="post-likes">
                    <i class="bi ${hasLiked ? 'bi-heart-fill red-heart' : 'bi-heart'}"></i> 
                    <span class="like-count">${initialLikes}</span>
                </p>
                <button class="btn btn-danger btn-sm delete-post-button"><i class="bi bi-trash"></i> Delete</button>
            </div>
            <p class="post-timestamp">${formattedCreatedAt}</p>
        `;

        postElement.innerHTML = postContent;
        sectionElement.appendChild(postElement);

        const heartIcon = postElement.querySelector('.bi-heart, .bi-heart-fill');
        const likeCountElement = postElement.querySelector('.like-count');
        const deleteButton = postElement.querySelector('.delete-post-button');

        deleteButton.addEventListener('click', async () => {
            const confirmation = confirm("Are you sure you want to delete this post?");

            if (confirmation) {
                await deletePost(post._id);
                postElement.remove(); // Remove the post from the UI
            }
        });

        heartIcon.addEventListener('click', async () => {
            let currentLikes = parseInt(likeCountElement.textContent);
            if (heartIcon.classList.contains('bi-heart')) {
                const likeId = await updateLike(post._id, true);
                if (likeId) {
                    heartIcon.dataset.likeId = likeId;
                    heartIcon.classList.remove('bi-heart');
                    heartIcon.classList.add('bi-heart-fill', 'red-heart');
                    likeCountElement.textContent = currentLikes + 1;
                }
            } else {
                const likeId = heartIcon.dataset.likeId;
                if (await updateLike(likeId, false)) {
                    heartIcon.removeAttribute('data-like-id');
                    heartIcon.classList.remove('bi-heart-fill', 'red-heart');
                    heartIcon.classList.add('bi-heart');
                    likeCountElement.textContent = currentLikes - 1;
                }
            }
        });

        // Assign the like ID if already liked
        if (hasLiked) {
            const userLike = post.likes.find(like => like.username === loginData.username);
            if (userLike) {
                heartIcon.dataset.likeId = userLike._id;
            }
        }
    });
};

const deletePost = async (postId) => {
    try {
        const loginData = getLoginData();

        const response = await fetch(`http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts/${postId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${loginData.token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete post");
        }

        alert("Post deleted successfully!");
        // Optionally reload user posts after deletion:
        // await userPosts();
    } catch (error) {
        console.error("Error deleting post:", error);
        alert("An error occurred while deleting the post. Please try again later!");
    }
};
