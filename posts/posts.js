"use strict";

window.onload = () => {

    getPostsByAsync();

    const logoutLink = document.getElementById("logoutLink");
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault();

        logout();
        alert("You've logged out!");
    })

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
            hour12: true // [ WHO USES 24HOURS EWWW ]
        });

        const formattedCreatedAt = dateTimeFormat.format(createdAt);

        const postContent = `
            <div class="post-header">
                <h2 class="post-username">${post.username}</h2>
                <p class="post-text">Message: ${post.text}</p>
            </div>
            <p class="post-timestamp">${formattedCreatedAt}</p>
        `;

        postElement.innerHTML = postContent;
        mainElement.appendChild(postElement);
    });

}

