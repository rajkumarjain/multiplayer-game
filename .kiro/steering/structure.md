# Project Structure

## Directory Organization

```
multiplayer-ludo-game/
├── app.py                 # Main Flask application and Socket.IO handlers
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/            # Jinja2 HTML templates
│   ├── index.html        # Main menu/landing page
│   └── game.html         # Game room interface
└── static/               # Static web assets
    ├── css/
    │   ├── style.css     # Global styles and main menu
    │   └── game.css      # Game-specific styles and board layout
    └── js/
        ├── main.js       # Main menu functionality and Socket.IO setup
        └── game.js       # Game room logic and real-time updates
```

## File Responsibilities

### Backend (`app.py`)
- **Flask Routes**: `/` (index), `/game/<game_id>` (game room)
- **LudoGame Class**: Game state management, rule validation, player handling
- **Socket.IO Handlers**: Real-time event processing (create_game, join_game, roll_dice, etc.)
- **Game Storage**: In-memory dictionaries for active games and player sessions

### Templates
- **index.html**: Landing page with create/join game forms, color selection
- **game.html**: Game interface with board, player list, dice, chat, controls

### Frontend JavaScript
- **main.js**: Form handling, game creation/joining, Socket.IO connection setup
- **game.js**: Game state updates, board interactions, dice rolling, chat functionality

### Styling
- **style.css**: Global styles, landing page layout, form styling, notifications
- **game.css**: Game board layout, player panels, dice animations, responsive design

## Key Architectural Patterns

### Route Structure
- **Static Routes**: Flask serves templates with minimal server-side data
- **Dynamic Routes**: Game ID passed as URL parameter to game template
- **API Communication**: All game logic handled via Socket.IO events

### State Management
- **Server State**: Games stored in memory with unique IDs, players tracked by Socket.IO session
- **Client State**: JavaScript maintains local game state synchronized via Socket.IO
- **Session Handling**: Player-to-game mapping maintained server-side

### Component Organization
- **Modular CSS**: Separate files for different page concerns
- **Event-driven JS**: Socket.IO events drive UI updates and game flow
- **Template Inheritance**: Shared base styles and scripts across templates

## Naming Conventions

### Files & Directories
- **Templates**: Descriptive names matching routes (`index.html`, `game.html`)
- **Static Assets**: Organized by type (`css/`, `js/`) with descriptive names
- **Python**: Single main file (`app.py`) for simplicity

### CSS Classes
- **Components**: `.menu-card`, `.game-container`, `.players-panel`
- **States**: `.show`, `.disabled`, `.rolling`, `.occupied`
- **Colors**: `.red`, `.blue`, `.green`, `.yellow` for game pieces
- **Layout**: `.game-layout`, `.board-container`, `.chat-section`

### JavaScript
- **Variables**: camelCase (`gameState`, `currentPlayer`, `myColor`)
- **Functions**: Descriptive verbs (`updateGameState`, `handlePieceClick`, `sendChatMessage`)
- **DOM Elements**: Element type suffix (`rollDiceBtn`, `chatInput`, `playersList`)

### Socket.IO Events
- **Server Events**: snake_case (`create_game`, `roll_dice`, `move_piece`)
- **Client Handlers**: Match server event names for consistency
- **Data Structure**: Consistent object shapes across events