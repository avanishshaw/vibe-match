// App State
let users = []; // Stores fetched data
let currentUserIndex = 0; // Tracks current profile
let likedUsers = []; // Stores liked profiles
let isLoading = false; // Flag to prevent multiple fetches

// DOM Elements
const profileContainer = document.getElementById('profile-card-container');
const likeBtn = document.getElementById('like-btn');
const nopeBtn = document.getElementById('nope-btn');
const likedNumSpan = document.getElementById('liked-num');
const loadingSpinner = document.getElementById('loading-spinner');
const appContainer = document.getElementById('app-container');

// --- Helper Functions ---

function showLoadingSpinner() {
    loadingSpinner.classList.add('active');
    appContainer.style.overflow = 'hidden'; // Prevent scroll during loading
    profileContainer.innerHTML = ''; // Clear existing cards
    likeBtn.disabled = true;
    nopeBtn.disabled = true;
}

function hideLoadingSpinner() {
    loadingSpinner.classList.remove('active');
    appContainer.style.overflow = 'visible'; // Restore scroll
    likeBtn.disabled = false;
    nopeBtn.disabled = false;
}

function updateLikedCount() {
    likedNumSpan.textContent = likedUsers.length;
}

// --- Main Functions ---

// Function to render a single profile
function renderProfile() {
    // 1. Check if we have profiles to show
    if (currentUserIndex >= users.length) {
        profileContainer.innerHTML = `
            <div class="no-profiles">
                <p>No more profiles to show!</p>
                <p>You've liked <span style="font-weight: bold; color: #ff6b6b;">${likedUsers.length}</span> profile(s)</p>
                <button id="reload-btn">Load More Profiles</button>
            </div>
        `;
        // Ensure the reload button is functional
        document.getElementById('reload-btn')?.addEventListener('click', () => {
            currentUserIndex = 0; // Reset index for new batch
            fetchUsers();
        });
        // Disable action buttons when no profiles
        likeBtn.disabled = true;
        nopeBtn.disabled = true;
        return;
    }

    // Clear previous card (if any) to prevent stacking without animation
    // If you want to keep previous card visible briefly for animation, you'd add a class
    // and let CSS handle its fade out/transform. For simplicity, we clear here.
    profileContainer.innerHTML = '';

    // Get the current user
    const user = users[currentUserIndex];

    // Create element of card
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.setAttribute('data-user-id', user.login.uuid); // Add a unique ID for potential future use

    // Set profile photo as background
    card.style.backgroundImage = `url(${user.picture.large})`;

    // Create profile info section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';

    // Populate the data
    infoDiv.innerHTML = `
        <h2>${user.name.first} ${user.name.last}</h2>
        <p>${user.dob.age} &bull; ${user.location.city}, ${user.location.country}</p>
    `;

    // Append them together
    card.appendChild(infoDiv);
    profileContainer.appendChild(card);

    // Re-enable buttons if they were disabled (e.g., after "no more profiles")
    likeBtn.disabled = false;
    nopeBtn.disabled = false;
}

// Handler for Like and Nope buttons
function handleAction(actionType) {
    if (currentUserIndex >= users.length || isLoading) return;

    const card = profileContainer.querySelector('.profile-card');
    if (!card) return;

    // Add user to liked list if 'like'
    if (actionType === 'like') {
        const userToLike = users[currentUserIndex];
        // Check if user is already liked (prevent duplicates if user rapidly clicks)
        const alreadyLiked = likedUsers.some(user => user.login.uuid === userToLike.login.uuid);
        if (!alreadyLiked) {
            likedUsers.push(userToLike);
            updateLikedCount();
            console.log('Liked:', userToLike.name.first);
        }
    } else {
        console.log('Noped:', users[currentUserIndex].name.first);
    }

    // Apply animation
    if (actionType === 'like') {
        card.style.transform = 'translateX(200%) rotate(30deg)';
    } else { // nope
        card.style.transform = 'translateX(-200%) rotate(-30deg)';
    }
    card.style.opacity = '0';

    // Disable buttons during animation to prevent rapid clicks
    likeBtn.disabled = true;
    nopeBtn.disabled = true;

    // Wait for animation to finish then render next profile
    card.addEventListener('transitionend', () => {
        currentUserIndex++;
        renderProfile();
        // Re-enable buttons only after new profile is rendered, unless there are no more
        if (currentUserIndex < users.length) {
            likeBtn.disabled = false;
            nopeBtn.disabled = false;
        }
    }, { once: true }); // Ensure this listener runs only once
}

// Event Listeners
likeBtn.addEventListener('click', () => handleAction('like'));
nopeBtn.addEventListener('click', () => handleAction('nope'));

// Fetch users from API
async function fetchUsers() {
    if (isLoading) return; // Prevent multiple concurrent fetches
    isLoading = true;
    showLoadingSpinner();

    try {
        const response = await fetch("https://randomuser.me/api/?results=10"); // Fetch 10 users
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        users = data.results; // Update the global users array
        currentUserIndex = 0; // Reset index for new batch of users
        renderProfile(); // Render the first profile from the new batch
    } catch (error) {
        console.error('Error fetching users:', error);
        profileContainer.innerHTML = `
            <div class="no-profiles" style="color: #dc3545;">
                <p>Failed to load profiles. Please check your internet connection or try again later.</p>
                <button id="reload-btn">Retry</button>
            </div>
        `;
        document.getElementById('reload-btn')?.addEventListener('click', fetchUsers);
        likeBtn.disabled = true; // Keep buttons disabled on error
        nopeBtn.disabled = true;
    } finally {
        hideLoadingSpinner();
        isLoading = false;
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    updateLikedCount(); // Initialize liked count display
});