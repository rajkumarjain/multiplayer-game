// Game page JavaScript
const socket = io();

// Game state
let gameState = null;
let currentPlayer = null;
let myColor = null;

// DOM elements
const playersList = document.getElementById('playersList');
const startGameBtn = document.getElementById('startGameBtn');
const leaveGameBtn = document.getElementById('leaveGameBtn');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const passTurnBtn = document.getElementById('passTurnBtn');
const dice = document.getElementById('dice');
const currentTurn = document.getElementById('currentTurn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const copyGameIdBtn = document.getElementById('copyGameId');
const notification = document.getElementById('notification');
const gameOverModal = document.getElementById('gameOverModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeBoard();
    
    // Auto-join if coming from main page
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name');
    const color = urlParams.get('color');
    
    if (playerName && color) {
        socket.emit('join_game', {
            game_id: GAME_ID,
            player_name: playerName,
            color: color
        });
    }
});

function setupEventListeners() {
    // Game controls
    startGameBtn.addEventListener('click', () => {
        socket.emit('start_game');
    });
    
    leaveGameBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave the game?')) {
            window.location.href = '/';
        }
    });
    
    rollDiceBtn.addEventListener('click', () => {
        if (rollDiceBtn.disabled) return;
        
        rollDiceBtn.disabled = true;
        rollDiceBtn.textContent = 'Rolling...';
        
        // Animate dice
        dice.classList.add('rolling');
        
        socket.emit('roll_dice');
        
        setTimeout(() => {
            dice.classList.remove('rolling');
            rollDiceBtn.textContent = 'Roll Dice';
        }, 1000);
    });
    
    passTurnBtn.addEventListener('click', () => {
        if (passTurnBtn.disabled) return;
        
        if (confirm('Are you sure you want to pass your turn?')) {
            socket.emit('pass_turn');
        }
    });
    
    // Chat functionality
    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Copy game ID
    copyGameIdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(GAME_ID).then(() => {
            showNotification('Game ID copied to clipboard!', 'success');
        });
    });
    
    // Modal buttons
    playAgainBtn.addEventListener('click', () => {
        window.location.reload();
    });
    
    backToMenuBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}

function initializeBoard() {
    const board = document.getElementById('ludoBoard');
    
    // Initialize home squares with click handlers
    const homeSquares = board.querySelectorAll('.home-square');
    homeSquares.forEach(square => {
        const color = square.dataset.color;
        const piece = square.dataset.piece;
        
        square.addEventListener('click', () => {
            handlePieceClick(color, parseInt(piece), 'home');
        });
        
        // Add initial piece display
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${color}`;
        pieceElement.textContent = parseInt(piece) + 1;
        square.appendChild(pieceElement);
        square.classList.add('occupied');
    });
    
    // Create simple path for testing
    createSimplePath();
}

function createSimplePath() {
    const pathContainer = document.getElementById('pathContainer');
    if (!pathContainer) return;
    
    // Clear existing path
    pathContainer.innerHTML = '';
    
    // Create proper Ludo board path (52 squares around the board)
    const pathPositions = [];
    
    // Top horizontal path (left to right) - Red to Blue side
    for (let i = 0; i < 6; i++) {
        pathPositions.push({ x: 244 + (i * 35), y: 204, position: i, color: i === 0 ? 'red-start' : null });
    }
    
    // Right vertical path (top to bottom) - Blue side
    for (let i = 0; i < 6; i++) {
        pathPositions.push({ x: 419, y: 239 + (i * 35), position: 6 + i, color: i === 0 ? 'blue-start' : null });
    }
    
    // Bottom horizontal path (right to left) - Blue to Green side
    for (let i = 0; i < 6; i++) {
        pathPositions.push({ x: 384 - (i * 35), y: 379, position: 12 + i, color: i === 5 ? 'green-start' : null });
    }
    
    // Left vertical path (bottom to top) - Green to Yellow side
    for (let i = 0; i < 6; i++) {
        pathPositions.push({ x: 174, y: 344 - (i * 35), position: 18 + i, color: i === 5 ? 'yellow-start' : null });
    }
    
    // Create path squares
    pathPositions.forEach((pos, index) => {
        const square = document.createElement('div');
        square.className = 'path-square';
        square.dataset.position = pos.position;
        square.textContent = pos.position;
        square.style.left = pos.x + 'px';
        square.style.top = pos.y + 'px';
        square.style.position = 'absolute';
        
        // Add special styling for start squares
        if (pos.color) {
            square.classList.add('start-square');
            if (pos.color.includes('red')) square.classList.add('red-start');
            if (pos.color.includes('blue')) square.classList.add('blue-start');
            if (pos.color.includes('green')) square.classList.add('green-start');
            if (pos.color.includes('yellow')) square.classList.add('yellow-start');
        }
        
        square.addEventListener('click', () => {
            handlePathSquareClick(pos.position);
        });
        
        pathContainer.appendChild(square);
    });
    
    // Add home stretch paths (colored paths leading to center)
    createHomeStretches();
}

function createHomeStretches() {
    const pathContainer = document.getElementById('pathContainer');
    
    // Red home stretch (vertical, going down to center)
    for (let i = 0; i < 5; i++) {
        const square = document.createElement('div');
        square.className = 'path-square home-stretch red-stretch';
        square.dataset.position = `red-${i}`;
        square.textContent = `R${i}`;
        square.style.left = '279px';
        square.style.top = (169 - (i * 35)) + 'px';
        square.style.position = 'absolute';
        square.style.background = '#feb2b2';
        
        square.addEventListener('click', () => {
            handlePathSquareClick(`red-${i}`);
        });
        
        pathContainer.appendChild(square);
    }
    
    // Blue home stretch (horizontal, going left to center)
    for (let i = 0; i < 5; i++) {
        const square = document.createElement('div');
        square.className = 'path-square home-stretch blue-stretch';
        square.dataset.position = `blue-${i}`;
        square.textContent = `B${i}`;
        square.style.left = (454 + (i * 35)) + 'px';
        square.style.top = '274px';
        square.style.position = 'absolute';
        square.style.background = '#90cdf4';
        
        square.addEventListener('click', () => {
            handlePathSquareClick(`blue-${i}`);
        });
        
        pathContainer.appendChild(square);
    }
    
    // Green home stretch (vertical, going up to center)
    for (let i = 0; i < 5; i++) {
        const square = document.createElement('div');
        square.className = 'path-square home-stretch green-stretch';
        square.dataset.position = `green-${i}`;
        square.textContent = `G${i}`;
        square.style.left = '314px';
        square.style.top = (414 + (i * 35)) + 'px';
        square.style.position = 'absolute';
        square.style.background = '#9ae6b4';
        
        square.addEventListener('click', () => {
            handlePathSquareClick(`green-${i}`);
        });
        
        pathContainer.appendChild(square);
    }
    
    // Yellow home stretch (horizontal, going right to center)
    for (let i = 0; i < 5; i++) {
        const square = document.createElement('div');
        square.className = 'path-square home-stretch yellow-stretch';
        square.dataset.position = `yellow-${i}`;
        square.textContent = `Y${i}`;
        square.style.left = (139 - (i * 35)) + 'px';
        square.style.top = '309px';
        square.style.position = 'absolute';
        square.style.background = '#f6e05e';
        
        square.addEventListener('click', () => {
            handlePathSquareClick(`yellow-${i}`);
        });
        
        pathContainer.appendChild(square);
    }
}

function getBoardSquareType(row, col) {
    // Center square
    if (row === 7 && col === 7) {
        return { type: 'center', clickable: false };
    }
    
    // Home areas (6x6 squares in corners)
    if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
        return { type: 'home-red', clickable: true, color: 'red' };
    }
    if (row >= 1 && row <= 5 && col >= 9 && col <= 13) {
        return { type: 'home-blue', clickable: true, color: 'blue' };
    }
    if (row >= 9 && row <= 13 && col >= 9 && col <= 13) {
        return { type: 'home-green', clickable: true, color: 'green' };
    }
    if (row >= 9 && row <= 13 && col >= 1 && col <= 5) {
        return { type: 'home-yellow', clickable: true, color: 'yellow' };
    }
    
    // Path squares - main track
    const pathSquares = getPathSquares();
    const pathKey = `${row}-${col}`;
    
    if (pathSquares[pathKey]) {
        const pathInfo = pathSquares[pathKey];
        let classes = 'path';
        
        if (pathInfo.start) classes += ` start-${pathInfo.start}`;
        if (pathInfo.safe) classes += ' safe';
        if (pathInfo.stretch) classes += ` stretch-${pathInfo.stretch}`;
        
        return { type: classes, clickable: true, pathPosition: pathInfo.position };
    }
    
    return { type: '', clickable: false };
}

function getPathSquares() {
    const pathSquares = {};
    
    // Main path around the board (52 squares total)
    // Top row (left to right)
    for (let col = 1; col <= 5; col++) {
        pathSquares[`6-${col}`] = { position: col - 1 };
    }
    pathSquares['6-6'] = { position: 5, start: 'red' }; // Red start
    for (let col = 7; col <= 13; col++) {
        pathSquares[`6-${col}`] = { position: col - 1 };
    }
    
    // Right column (top to bottom)
    for (let row = 7; row <= 13; row++) {
        pathSquares[`${row}-8`] = { position: 13 + (row - 6) };
    }
    pathSquares['8-8'] = { position: 18, start: 'blue' }; // Blue start
    
    // Bottom row (right to left)
    for (let col = 13; col >= 7; col--) {
        pathSquares[`8-${col}`] = { position: 20 + (13 - col) };
    }
    pathSquares['8-6'] = { position: 27, start: 'green' }; // Green start
    for (let col = 5; col >= 1; col--) {
        pathSquares[`8-${col}`] = { position: 28 + (5 - col) };
    }
    
    // Left column (bottom to top)
    for (let row = 9; row <= 13; row++) {
        pathSquares[`${row}-6`] = { position: 33 + (row - 8) };
    }
    pathSquares['6-6'] = { position: 39, start: 'yellow' }; // Yellow start
    for (let row = 5; row >= 1; row--) {
        pathSquares[`${row}-6`] = { position: 40 + (5 - row) };
    }
    
    // Home stretches (colored paths to center)
    // Red stretch (column 7, rows 1-5)
    for (let row = 1; row <= 5; row++) {
        pathSquares[`${row}-7`] = { position: `red-${row - 1}`, stretch: 'red' };
    }
    
    // Blue stretch (row 7, columns 9-13)
    for (let col = 9; col <= 13; col++) {
        pathSquares[`7-${col}`] = { position: `blue-${col - 9}`, stretch: 'blue' };
    }
    
    // Green stretch (column 7, rows 9-13)
    for (let row = 9; row <= 13; row++) {
        pathSquares[`${row}-7`] = { position: `green-${row - 9}`, stretch: 'green' };
    }
    
    // Yellow stretch (row 7, columns 1-5)
    for (let col = 1; col <= 5; col++) {
        pathSquares[`7-${col}`] = { position: `yellow-${col - 1}`, stretch: 'yellow' };
    }
    
    // Safe squares
    pathSquares['6-2'] = { ...pathSquares['6-2'], safe: true };
    pathSquares['2-8'] = { ...pathSquares['2-8'], safe: true };
    pathSquares['8-12'] = { ...pathSquares['8-12'], safe: true };
    pathSquares['12-6'] = { ...pathSquares['12-6'], safe: true };
    
    return pathSquares;
}

function initializePieces() {
    // Clear existing pieces
    document.querySelectorAll('.game-piece').forEach(piece => piece.remove());
    
    // Place initial pieces in home areas
    const colors = ['red', 'blue', 'green', 'yellow'];
    const homePositions = {
        red: [[2, 2], [2, 4], [4, 2], [4, 4]],
        blue: [[2, 10], [2, 12], [4, 10], [4, 12]],
        green: [[10, 10], [10, 12], [12, 10], [12, 12]],
        yellow: [[10, 2], [10, 4], [12, 2], [12, 4]]
    };
    
    colors.forEach(color => {
        homePositions[color].forEach((pos, index) => {
            createPiece(color, index, pos[0], pos[1]);
        });
    });
}

function createPiece(color, pieceId, row, col) {
    const piece = document.createElement('div');
    piece.className = `game-piece ${color}`;
    piece.dataset.color = color;
    piece.dataset.piece = pieceId;
    piece.dataset.row = row;
    piece.dataset.col = col;
    piece.textContent = pieceId + 1;
    
    piece.addEventListener('click', () => {
        handlePieceClick(color, pieceId, 'home');
    });
    
    const square = document.querySelector(`[data-position="${row}-${col}"]`);
    if (square) {
        square.appendChild(piece);
    }
}

function handlePieceClick(color, piece, location) {
    if (!gameState || !gameState.game_started) {
        showNotification('Game not started yet!', 'error');
        return;
    }
    
    if (color !== myColor) {
        showNotification('You can only move your own pieces!', 'error');
        return;
    }
    
    // Check if it's the player's turn
    const playerColors = Object.values(gameState.players).map(p => p.color);
    const currentPlayerColor = playerColors[gameState.current_player];
    if (currentPlayerColor !== myColor) {
        showNotification('Wait for your turn!', 'error');
        return;
    }
    
    // Check if dice has been rolled
    if (!gameState.dice_value || gameState.dice_value === 0) {
        showNotification('Roll the dice first!', 'error');
        return;
    }
    
    // Determine actual piece location from game state
    let actualLocation = 'home';
    if (gameState.board && gameState.board[color]) {
        console.log(`DEBUG: Board state for ${color}:`, gameState.board[color]);
        if (gameState.board[color].path.includes(piece)) {
            actualLocation = 'path';
        } else if (gameState.board[color].safe.includes(piece)) {
            actualLocation = 'safe';
        } else if (gameState.board[color].home.includes(piece)) {
            actualLocation = 'home';
        } else {
            console.log(`DEBUG: Piece ${piece} not found in any location!`);
        }
    }
    
    console.log(`Clicked ${color} piece ${piece}, actual location: ${actualLocation}, dice: ${gameState.dice_value}`);
    
    // Validate move before sending
    if (actualLocation === 'home' && gameState.dice_value !== 6) {
        showNotification('You need to roll a 6 to move a piece from home!', 'error');
        return;
    }
    
    // This would emit a move_piece event to the server
    socket.emit('move_piece', {
        color: color,
        piece: parseInt(piece),
        from: actualLocation
    });
}

function handlePathSquareClick(position) {
    console.log(`Clicked path square ${position}`);
    
    if (!gameState || !gameState.game_started) {
        showNotification('Game not started yet!', 'error');
        return;
    }
    
    // Check if it's the player's turn
    const playerColors = Object.values(gameState.players).map(p => p.color);
    const currentPlayerColor = playerColors[gameState.current_player];
    if (currentPlayerColor !== myColor) {
        showNotification('Wait for your turn!', 'error');
        return;
    }
    
    // For now, just show that the path square was clicked
    showNotification(`Clicked path square ${position}`, 'info');
}

function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    console.log('Sending chat message:', message);
    socket.emit('chat_message', {
        message: message
    });
    
    chatInput.value = '';
}

function updatePlayersList(players) {
    playersList.innerHTML = '';
    
    Object.entries(players).forEach(([playerId, playerData]) => {
        const playerItem = document.createElement('div');
        playerItem.className = `player-item ${playerData.color}`;
        
        if (playerId === socket.id) {
            playerItem.classList.add('me');
            myColor = playerData.color;
        }
        
        playerItem.innerHTML = `
            <div class="player-color ${playerData.color}"></div>
            <span class="player-name">${playerData.name}</span>
            <span class="player-status">Ready</span>
        `;
        
        playersList.appendChild(playerItem);
    });
    
    // Show start button if I'm the first player and we have enough players
    const playerCount = Object.keys(players).length;
    if (playerCount >= 2 && Object.keys(players)[0] === socket.id) {
        startGameBtn.style.display = 'block';
    }
}

function updateGameState(newGameState) {
    gameState = newGameState;
    
    if (gameState.players) {
        updatePlayersList(gameState.players);
    }
    
    if (gameState.game_started) {
        startGameBtn.style.display = 'none';
        
        // Update current turn display
        const playerColors = Object.values(gameState.players).map(p => p.color);
        const currentPlayerColor = playerColors[gameState.current_player];
        currentTurn.textContent = `Current Turn: ${currentPlayerColor.toUpperCase()}`;
        
        // Enable/disable dice based on turn and dice state
        const isMyTurn = currentPlayerColor === myColor;
        const diceRolled = gameState.dice_value && gameState.dice_value > 0;
        
        // Enable dice button only if it's my turn AND dice hasn't been rolled yet
        rollDiceBtn.disabled = !isMyTurn || diceRolled;
        
        // Show/hide and enable/disable pass turn button
        if (isMyTurn && diceRolled && gameState.dice_value !== 6) {
            passTurnBtn.style.display = 'inline-block';
            passTurnBtn.disabled = false;
        } else {
            passTurnBtn.style.display = 'none';
            passTurnBtn.disabled = true;
        }
        
        if (isMyTurn) {
            rollDiceBtn.classList.add('btn-primary');
            rollDiceBtn.classList.remove('btn-secondary');
            
            if (diceRolled) {
                rollDiceBtn.textContent = `Rolled: ${gameState.dice_value}`;
            } else {
                rollDiceBtn.textContent = 'Roll Dice';
            }
        } else {
            rollDiceBtn.classList.add('btn-secondary');
            rollDiceBtn.classList.remove('btn-primary');
            rollDiceBtn.textContent = 'Roll Dice';
        }
        
        console.log(`DEBUG: Turn update - My turn: ${isMyTurn}, Dice rolled: ${diceRolled}, Dice value: ${gameState.dice_value}`);
    }
    
    if (gameState.winner) {
        showGameOver(gameState.winner);
    }
}

function updateBoardDisplay(gameState) {
    if (!gameState.board) return;
    
    // Clear all pieces from display
    document.querySelectorAll('.piece').forEach(piece => piece.remove());
    document.querySelectorAll('.home-square').forEach(square => {
        square.classList.remove('occupied');
    });
    document.querySelectorAll('.path-square').forEach(square => {
        square.classList.remove('occupied');
    });
    
    // Update pieces based on game state
    Object.entries(gameState.board).forEach(([color, pieces]) => {
        // Show pieces in home
        pieces.home.forEach(pieceId => {
            const homeSquare = document.querySelector(`[data-color="${color}"][data-piece="${pieceId}"]`);
            if (homeSquare) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${color}`;
                pieceElement.textContent = pieceId + 1;
                homeSquare.appendChild(pieceElement);
                homeSquare.classList.add('occupied');
            }
        });
        
        // Show pieces on path
        pieces.path.forEach(pieceId => {
            // For now, just place them on the first path square as a placeholder
            const pathSquare = document.querySelector('[data-position="0"]');
            if (pathSquare) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${color}`;
                pieceElement.textContent = pieceId + 1;
                pieceElement.style.position = 'absolute';
                pieceElement.style.top = '5px';
                pieceElement.style.left = '5px';
                pieceElement.style.zIndex = '10';
                pathSquare.appendChild(pieceElement);
                pathSquare.classList.add('occupied');
            }
        });
        
        // Show pieces in safe area (center)
        if (pieces.safe.length > 0) {
            console.log(`${color} pieces in safe area:`, pieces.safe);
        }
    });
}

function updateDice(value) {
    const diceFaces = dice.querySelectorAll('.dice-face');
    diceFaces.forEach(face => {
        face.style.display = 'none';
    });
    
    const activeFace = dice.querySelector(`[data-value="${value}"]`);
    if (activeFace) {
        activeFace.style.display = 'flex';
    }
}

function addChatMessage(message, isSystem = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSystem ? 'system' : ''}`;
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showGameOver(winner) {
    const winnerMessage = document.getElementById('winnerMessage');
    winnerMessage.textContent = `${winner} wins the game!`;
    gameOverModal.classList.add('show');
}

function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Socket event listeners
socket.on('game_joined', (data) => {
    updateGameState(data.game_state);
    updateBoardDisplay(data.game_state);
    showNotification('Joined game successfully!', 'success');
});

socket.on('player_joined', (data) => {
    updateGameState(data.game_state);
    addChatMessage(`${data.player_name} joined the game`, true);
});

socket.on('player_left', (data) => {
    updateGameState(data.game_state);
    addChatMessage(`${data.player_name} left the game`, true);
});

socket.on('game_started', (data) => {
    updateGameState(data.game_state);
    updateBoardDisplay(data.game_state);
    addChatMessage('Game started! Roll the dice to begin.', true);
    showNotification('Game started!', 'success');
});

socket.on('dice_rolled', (data) => {
    updateDice(data.dice_value);
    updateGameState(data.game_state);
    
    // Find the player who rolled
    const rollingPlayer = Object.entries(gameState.players).find(([id, player]) => id === data.player_id);
    const playerColor = rollingPlayer ? rollingPlayer[1].color : 'Unknown';
    
    addChatMessage(`${playerColor.toUpperCase()} rolled a ${data.dice_value}`, true);
    
    // Reset dice button text after animation
    setTimeout(() => {
        rollDiceBtn.textContent = 'Roll Dice';
        rollDiceBtn.disabled = false; // Will be properly set by updateGameState
        updateGameState(gameState); // Refresh button state
    }, 1000);
});

socket.on('piece_moved', (data) => {
    // Handle piece movement animation
    updateGameState(data.game_state);
    updateBoardDisplay(data.game_state);
    addChatMessage(`${data.color.toUpperCase()} moved piece ${data.piece}`, true);
});

socket.on('turn_changed', (data) => {
    updateGameState(data.game_state);
    
    if (data.message) {
        addChatMessage(data.message, true);
    } else {
        const playerColors = Object.values(data.game_state.players).map(p => p.color);
        const currentPlayerColor = playerColors[data.game_state.current_player];
        addChatMessage(`It's ${currentPlayerColor.toUpperCase()}'s turn`, true);
    }
});

socket.on('chat_message', (data) => {
    console.log('Received chat message:', data);
    addChatMessage(`${data.player_name}: ${data.message}`);
});

socket.on('error', (data) => {
    showNotification(data.message, 'error');
});

socket.on('disconnect', () => {
    showNotification('Disconnected from server', 'error');
    rollDiceBtn.disabled = true;
});

socket.on('reconnect', () => {
    showNotification('Reconnected to server', 'success');
    // Rejoin the game room
    socket.emit('rejoin_game', { game_id: GAME_ID });
});

// Initialize dice display
updateDice(1);