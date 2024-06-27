"use strict";

window.onload = () => {
    getPostsByAsync();

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        logout();
        alert("You've logged out!");
    });
}

const getPostsByAsync = async () => {
    const loginData = getLoginData();

    const response = await fetch("http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${loginData.token}`
        }
    });

    const posts = await response.json();

    const mainElement = document.querySelector("main");

    posts.forEach(post => {
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
            </div>
            <p class="post-timestamp">${formattedCreatedAt}</p>
        `;

        postElement.innerHTML = postContent;
        mainElement.appendChild(postElement);

        const heartIcon = postElement.querySelector('.bi-heart, .bi-heart-fill');
        const likeCountElement = postElement.querySelector('.like-count');

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
                console.log('Trying to unlike. Like ID:', likeId); // Debugging
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
}

const updateLike = async (id, isLiking) => {
    const loginData = getLoginData();
    const url = isLiking ? "http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes" : `http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${id}`;

    const response = await fetch(url, {
        method: isLiking ? "POST" : "DELETE",
        headers: {
            Authorization: `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
        },
        body: isLiking ? JSON.stringify({ postId: id }) : null
    });

    if (response.ok) {
        if (isLiking) {
            const likeData = await response.json();
            return likeData._id; // Return the like ID for future reference
        } else {
            return true; // Return true if deletion was successful
        }
    } else {
        console.error("Failed to update like status.");
        return false;
    }
}
