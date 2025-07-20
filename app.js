let users = []; 
let currentUserIndex = 0; 
let likedUsers = []; 
let isLoading = false;

const profileContainer = document.getElementById('profile-card-container');
const likeBtn = document.getElementById('like-btn');
const nopeBtn = document.getElementById('nope-btn');
const likedNumSpan = document.getElementById('liked-num');
const loadingSpinner = document.getElementById('loading-spinner');
const appContainer = document.getElementById('app-container');

function showLoadingSpinner() {
    loadingSpinner.classList.add('active');
    appContainer.style.overflow = 'hidden'; 
    profileContainer.innerHTML = ''; 
    likeBtn.disabled = true;
    nopeBtn.disabled = true;
}

function hideLoadingSpinner() {
    loadingSpinner.classList.remove('active');
    appContainer.style.overflow = 'visible'; 
    likeBtn.disabled = false;
    nopeBtn.disabled = false;
}

function updateLikedCount() {
    likedNumSpan.textContent = likedUsers.length;
}


function renderProfile() {
    if (currentUserIndex >= users.length) {
        profileContainer.innerHTML = `
            <div class="no-profiles">
                <p>No more profiles to show!</p>
                <p>You've liked <span style="font-weight: bold; color: #ff6b6b;">${likedUsers.length}</span> profile(s)</p>
                <button id="reload-btn">Load More Profiles</button>
            </div>
        `;
        document.getElementById('reload-btn')?.addEventListener('click', () => {
            currentUserIndex = 0; 
            fetchUsers();
        });
        likeBtn.disabled = true;
        nopeBtn.disabled = true;
        return;
    }

 
    profileContainer.innerHTML = '';

    const user = users[currentUserIndex];

    const card = document.createElement('div');
    card.className = 'profile-card';
    card.setAttribute('data-user-id', user.login.uuid); 
    card.style.backgroundImage = `url(${user.picture.large})`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';

    infoDiv.innerHTML = `
        <h2>${user.name.first} ${user.name.last}</h2>
        <p>${user.dob.age} &bull; ${user.location.city}, ${user.location.country}</p>
    `;

    card.appendChild(infoDiv);
    profileContainer.appendChild(card);

    likeBtn.disabled = false;
    nopeBtn.disabled = false;
}

function handleAction(actionType) {
    if (currentUserIndex >= users.length || isLoading) return;

    const card = profileContainer.querySelector('.profile-card');
    if (!card) return;

    if (actionType === 'like') {
        const userToLike = users[currentUserIndex];
        const alreadyLiked = likedUsers.some(user => user.login.uuid === userToLike.login.uuid);
        if (!alreadyLiked) {
            likedUsers.push(userToLike);
            updateLikedCount();
            console.log('Liked:', userToLike.name.first);
        }
    } else {
        console.log('Noped:', users[currentUserIndex].name.first);
    }

    if (actionType === 'like') {
        card.style.transform = 'translateX(200%) rotate(30deg)';
    } else { 
        card.style.transform = 'translateX(-200%) rotate(-30deg)';
    }
    card.style.opacity = '0';

    likeBtn.disabled = true;
    nopeBtn.disabled = true;

    card.addEventListener('transitionend', () => {
        currentUserIndex++;
        renderProfile();
        if (currentUserIndex < users.length) {
            likeBtn.disabled = false;
            nopeBtn.disabled = false;
        }
    }, { once: true }); 
}

likeBtn.addEventListener('click', () => handleAction('like'));
nopeBtn.addEventListener('click', () => handleAction('nope'));

async function fetchUsers() {
    if (isLoading) return; 
    isLoading = true;
    showLoadingSpinner();

    try {
        const response = await fetch("https://randomuser.me/api/?results=10"); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        users = data.results; 
        currentUserIndex = 0; 
        renderProfile(); 
    } catch (error) {
        console.error('Error fetching users:', error);
        profileContainer.innerHTML = `
            <div class="no-profiles" style="color: #dc3545;">
                <p>Failed to load profiles. Please check your internet connection or try again later.</p>
                <button id="reload-btn">Retry</button>
            </div>
        `;
        document.getElementById('reload-btn')?.addEventListener('click', fetchUsers);
        likeBtn.disabled = true; 
        nopeBtn.disabled = true;
    } finally {
        hideLoadingSpinner();
        isLoading = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    updateLikedCount(); 
});