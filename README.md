# Multiplayer Ludo Game

A real-time multiplayer Ludo game built with Python Flask, Socket.IO, and modern web technologies.

## Features

- 🎮 Real-time multiplayer gameplay (2-4 players)
- 🎲 Interactive dice rolling with animations
- 🎨 Rich, responsive UI with modern design
- 💬 In-game chat system
- 🔄 Automatic game state synchronization
- 📱 Mobile-friendly responsive design
- 🎯 Classic Ludo rules implementation

## Technologies Used

- **Backend**: Python Flask, Flask-SocketIO
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: Socket.IO
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Unicode emojis and symbols

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multiplayer-ludo-game
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## How to Play

### Starting a Game

1. **Create a New Game**
   - Enter your name
   - Choose your color (Red, Blue, Green, or Yellow)
   - Click "Create Game"
   - Share the generated Game ID with friends

2. **Join an Existing Game**
   - Enter your name
   - Enter the Game ID provided by the host
   - Choose an available color
   - Click "Join Game"

### Game Rules

- **Objective**: Move all 4 of your pieces from home to the center to win
- **Starting**: Roll a 6 to move a piece out of home
- **Movement**: Roll the dice and move your pieces clockwise around the board
- **Capturing**: Land on an opponent's piece to send it back to their home
- **Safe Squares**: Colored squares protect your pieces from capture
- **Extra Turn**: Roll a 6 to get another turn
- **Winning**: First player to get all 4 pieces to the center wins

### Game Controls

- **Roll Dice**: Click the dice or "Roll Dice" button when it's your turn
- **Move Pieces**: Click on your pieces to move them (when valid moves are available)
- **Chat**: Use the chat box to communicate with other players
- **Leave Game**: Click "Leave Game" to exit

## Project Structure

```
multiplayer-ludo-game/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   ├── index.html        # Main menu page
│   └── game.html         # Game room page
└── static/
    ├── css/
    │   ├── style.css     # Main styles
    │   └── game.css      # Game-specific styles
    └── js/
        ├── main.js       # Main menu JavaScript
        └── game.js       # Game room JavaScript
```

## Game Architecture

### Backend (Flask + Socket.IO)

- **Game Management**: Handles game creation, player joining, and game state
- **Real-time Events**: Manages dice rolls, piece movements, and chat messages
- **Game Logic**: Implements Ludo rules and validates moves
- **Room System**: Isolates games using Socket.IO rooms

### Frontend (HTML + CSS + JavaScript)

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant synchronization of game state across all players
- **Interactive UI**: Animated dice, clickable pieces, and visual feedback
- **Modern Styling**: Gradient backgrounds, smooth transitions, and hover effects

## Customization

### Adding New Features

1. **Game Variants**: Modify the `LudoGame` class to implement different rule sets
2. **Themes**: Add new CSS files for different visual themes
3. **Sound Effects**: Integrate Web Audio API for dice rolls and piece movements
4. **Spectator Mode**: Allow users to watch ongoing games
5. **Tournament Mode**: Implement bracket-style tournaments

### Styling Customization

- Modify `static/css/style.css` for main menu styling
- Modify `static/css/game.css` for game board styling
- Colors can be easily changed by updating CSS custom properties
- Animations can be adjusted by modifying CSS transitions and keyframes

## Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

1. **Using Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn --worker-class eventlet -w 1 app:app
   ```

2. **Using Docker**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 5000
   CMD ["python", "app.py"]
   ```

3. **Environment Variables**
   - Set `FLASK_ENV=production` for production
   - Configure `SECRET_KEY` for security
   - Set appropriate `HOST` and `PORT` values

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the browser console for JavaScript errors
2. Ensure all dependencies are installed correctly
3. Verify that the Flask server is running on the correct port
4. Check that Socket.IO connections are working properly

## Future Enhancements

- [ ] AI opponents for single-player mode
- [ ] Game replay system
- [ ] Player statistics and leaderboards
- [ ] Custom game rules and variants
- [ ] Voice chat integration
- [ ] Mobile app versions
- [ ] Offline mode with local multiplayer

---

Enjoy playing Ludo with your friends! 🎲🎮