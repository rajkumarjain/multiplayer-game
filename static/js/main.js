// Main page JavaScript
const socket = io();

// DOM elements
const createGameForm = document.getElementById('createGameForm');
const joinGameForm = document.getElementById('joinGameForm');
const notification = document.getElementById('notification');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Create game form
    createGameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(createGameForm);
        const playerName = formData.get('playerName').trim();
        const color = formData.get('color');
        
        if (!playerName) {
            showNotification('Please enter your name', 'error');
            return;
        }
        
        socket.emit('create_game', {
            player_name: playerName,
            color: color
        });
    });
    
    // Join game form
    joinGameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(joinGameForm);
        const playerName = formData.get('playerName').trim();
        const gameId = formData.get('gameId').trim().toLowerCase();
        const color = formData.get('joinColor');
        
        if (!playerName || !gameId) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        socket.emit('join_game', {
            game_id: gameId,
            player_name: playerName,
            color: color
        });
    });
}

// Socket event listeners
socket.on('game_created', function(data) {
    showNotification('Game created successfully!', 'success');
    setTimeout(() => {
        // Get the player info from the form that was just submitted
        const formData = new FormData(createGameForm);
        const playerName = formData.get('playerName').trim();
        const color = formData.get('color');
        
        window.location.href = `/game/${data.game_id}?name=${encodeURIComponent(playerName)}&color=${color}`;
    }, 1000);
});

socket.on('game_joined', function(data) {
    showNotification('Joined game successfully!', 'success');
    setTimeout(() => {
        // Get the player info from the form that was just submitted
        const formData = new FormData(joinGameForm);
        const playerName = formData.get('playerName').trim();
        const color = formData.get('joinColor');
        
        window.location.href = `/game/${data.game_id}?name=${encodeURIComponent(playerName)}&color=${color}`;
    }, 1000);
});

socket.on('error', function(data) {
    showNotification(data.message, 'error');
});

// Utility functions
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            input.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

// Auto-focus on first input
document.querySelector('#playerName').focus();

// Game ID input formatting
const gameIdInput = document.getElementById('gameId');
gameIdInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.toLowerCase();
});

// Color selection animation
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        
        // Add selection animation
        const circle = this.querySelector('.color-circle');
        circle.style.transform = 'scale(1.3)';
        setTimeout(() => {
            circle.style.transform = '';
        }, 200);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        const activeForm = document.activeElement.closest('form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Random name suggestions
const nameSuggestions = [
    'Player1', 'GameMaster', 'LudoKing', 'Challenger', 'Winner',
    'Champion', 'Strategist', 'Lucky', 'Swift', 'Clever'
];

function getRandomName() {
    return nameSuggestions[Math.floor(Math.random() * nameSuggestions.length)] + 
           Math.floor(Math.random() * 1000);
}

// Add random name button functionality
document.querySelectorAll('input[type="text"]').forEach(input => {
    if (input.name === 'playerName') {
        const randomBtn = document.createElement('button');
        randomBtn.type = 'button';
        randomBtn.className = 'btn btn-small';
        randomBtn.textContent = '🎲 Random';
        randomBtn.style.marginTop = '5px';
        
        randomBtn.addEventListener('click', () => {
            input.value = getRandomName();
        });
        
        input.parentNode.appendChild(randomBtn);
    }
});