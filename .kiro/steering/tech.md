# Technology Stack

## Backend
- **Framework**: Flask 2.3.3 (Python web framework)
- **Real-time Communication**: Flask-SocketIO 5.3.6 with Socket.IO
- **WebSocket Engine**: python-socketio 5.8.0 + python-engineio 4.7.1
- **ASGI Server**: eventlet 0.33.3 for async handling
- **Language**: Python 3.x

## Frontend
- **Core**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Poppins font from Google Fonts
- **Real-time Client**: Socket.IO 4.0.1 (CDN)
- **UI Patterns**: Responsive grid layouts, CSS animations, modal dialogs

## Architecture Patterns
- **MVC Pattern**: Flask routes handle views, LudoGame class manages model
- **Event-driven**: Socket.IO events for real-time game state updates
- **Room-based**: Socket.IO rooms isolate game sessions
- **Stateful Server**: In-memory game state storage (games and players dicts)

## Development Commands

### Setup & Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

### Development Server
- **Host**: 0.0.0.0 (accessible from network)
- **Port**: 5000
- **Debug Mode**: Enabled in development
- **Auto-reload**: Flask debug mode handles file changes

### Production Deployment
```bash
# Using Gunicorn with eventlet workers
pip install gunicorn
gunicorn --worker-class eventlet -w 1 app:app

# Environment variables for production
FLASK_ENV=production
SECRET_KEY=your_secret_key_here
```

## Code Conventions
- **Python**: PEP 8 style guide, class names in PascalCase
- **JavaScript**: camelCase for variables/functions, const for immutable values
- **CSS**: kebab-case for classes, BEM-like naming for components
- **Socket Events**: snake_case for event names (create_game, roll_dice)
- **File Organization**: Separation of concerns (templates, static assets, main app)