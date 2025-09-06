from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid
import random
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ludo_game_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Game state storage
games = {}
players = {}

class LudoGame:
    def __init__(self, game_id):
        self.game_id = game_id
        self.players = {}
        self.current_player = 0
        self.dice_value = 0
        self.game_started = False
        self.winner = None
        self.board = self.initialize_board()
    
    def initialize_board(self):
        # Initialize board state with position tracking
        return {
            'red': {'home': [0, 1, 2, 3], 'path': {}, 'safe': []},
            'blue': {'home': [0, 1, 2, 3], 'path': {}, 'safe': []},
            'green': {'home': [0, 1, 2, 3], 'path': {}, 'safe': []},
            'yellow': {'home': [0, 1, 2, 3], 'path': {}, 'safe': []}
        }
    
    def add_player(self, player_id, player_name, color):
        if len(self.players) < 4 and color not in [p['color'] for p in self.players.values()]:
            self.players[player_id] = {'name': player_name, 'color': color}
            return True
        return False
    
    def remove_player(self, player_id):
        if player_id in self.players:
            del self.players[player_id]
    
    def start_game(self):
        if len(self.players) >= 2:
            self.game_started = True
            return True
        return False
    
    def roll_dice(self):
        self.dice_value = random.randint(1, 6)
        return self.dice_value
    
    def get_start_position(self, color):
        """Get the starting position on the path for each color"""
        start_positions = {
            'red': 0,
            'blue': 13,
            'green': 26,
            'yellow': 39
        }
        return start_positions[color]
    
    def move_piece(self, player_id, color, piece, from_location):
        # Basic move validation
        if player_id not in self.players:
            print(f"DEBUG: Player {player_id} not in game")
            return False
        
        if self.players[player_id]['color'] != color:
            print(f"DEBUG: Color mismatch - player color: {self.players[player_id]['color']}, requested: {color}")
            return False
        
        if self.dice_value == 0:
            print(f"DEBUG: No dice value set")
            return False
        
        print(f"DEBUG: Attempting to move {color} piece {piece} from {from_location} with dice value {self.dice_value}")
        print(f"DEBUG: Current board state for {color}: {self.board[color]}")
        
        # Enhanced move logic with position tracking
        if from_location == 'home':
            # Can only move from home with a 6
            if self.dice_value == 6:
                if piece in self.board[color]['home']:
                    self.board[color]['home'].remove(piece)
                    start_pos = self.get_start_position(color)
                    self.board[color]['path'][piece] = start_pos
                    print(f"DEBUG: Moved piece {piece} from home to path position {start_pos}")
                    print(f"DEBUG: New board state for {color}: {self.board[color]}")
                    return True
                else:
                    print(f"DEBUG: Piece {piece} not found in home. Home contains: {self.board[color]['home']}")
            else:
                print(f"DEBUG: Need dice value 6 to move from home, got {self.dice_value}")
        elif from_location == 'path':
            # Move piece along the path
            if piece in self.board[color]['path']:
                current_pos = self.board[color]['path'][piece]
                new_pos = (current_pos + self.dice_value) % 52  # 52 squares on the path
                self.board[color]['path'][piece] = new_pos
                print(f"DEBUG: Moved piece {piece} from position {current_pos} to {new_pos}")
                print(f"DEBUG: New board state for {color}: {self.board[color]}")
                return True
            else:
                print(f"DEBUG: Piece {piece} not found in path. Path contains: {list(self.board[color]['path'].keys())}")
        
        print(f"DEBUG: Move not allowed")
        return False
    
    def check_winner(self):
        for color, pieces in self.board.items():
            if len(pieces['safe']) == 4:
                self.winner = color
                return True
        return False
    
    def get_game_state(self):
        return {
            'game_id': self.game_id,
            'players': self.players,
            'current_player': self.current_player,
            'dice_value': self.dice_value,
            'game_started': self.game_started,
            'winner': self.winner,
            'board': self.board
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game/<game_id>')
def game(game_id):
    return render_template('game.html', game_id=game_id)

@socketio.on('create_game')
def handle_create_game(data):
    game_id = str(uuid.uuid4())[:8].lower()  # Ensure game ID is lowercase
    player_name = data['player_name']
    color = data['color']
    
    print(f"DEBUG: Creating game with ID: '{game_id}'")
    
    game = LudoGame(game_id)
    player_id = request.sid
    
    if game.add_player(player_id, player_name, color):
        games[game_id] = game
        players[player_id] = game_id
        join_room(game_id)
        
        print(f"DEBUG: Game created successfully. Games dict: {list(games.keys())}")
        
        emit('game_created', {
            'game_id': game_id,
            'player_id': player_id,
            'game_state': game.get_game_state()
        })
    else:
        emit('error', {'message': 'Failed to create game'})

@socketio.on('join_game')
def handle_join_game(data):
    original_game_id = data['game_id']
    game_id = data['game_id'].lower()  # Convert to lowercase for consistency
    player_name = data['player_name']
    color = data['color']
    player_id = request.sid
    
    print(f"DEBUG: Join attempt - Original ID: '{original_game_id}', Lowercase ID: '{game_id}'")
    print(f"DEBUG: Available games: {list(games.keys())}")
    
    if game_id in games:
        game = games[game_id]
        if game.add_player(player_id, player_name, color):
            players[player_id] = game_id
            join_room(game_id)
            
            emit('game_joined', {
                'game_id': game_id,
                'player_id': player_id,
                'game_state': game.get_game_state()
            })
            
            # Notify all players in the room
            socketio.emit('player_joined', {
                'player_name': player_name,
                'color': color,
                'game_state': game.get_game_state()
            }, room=game_id)
        else:
            emit('error', {'message': 'Cannot join game - full or color taken'})
    else:
        emit('error', {'message': f'Game not found. Available games: {list(games.keys())}'})

@socketio.on('start_game')
def handle_start_game():
    player_id = request.sid
    if player_id in players:
        game_id = players[player_id]
        game = games[game_id]
        
        if game.start_game():
            socketio.emit('game_started', {
                'game_state': game.get_game_state()
            }, room=game_id)
        else:
            emit('error', {'message': 'Need at least 2 players to start'})

@socketio.on('roll_dice')
def handle_roll_dice():
    player_id = request.sid
    if player_id in players:
        game_id = players[player_id]
        game = games[game_id]
        
        if game.game_started and not game.winner:
            # Check if it's the player's turn
            current_player_id = list(game.players.keys())[game.current_player]
            
            if player_id == current_player_id:
                # Only allow rolling if dice hasn't been rolled yet this turn
                if game.dice_value == 0:
                    dice_value = game.roll_dice()
                    print(f"DEBUG: Player {player_id} rolled {dice_value}")
                    
                    socketio.emit('dice_rolled', {
                        'dice_value': dice_value,
                        'player_id': player_id,
                        'game_state': game.get_game_state()
                    }, room=game_id)
                else:
                    emit('error', {'message': 'You have already rolled the dice! Make a move or pass your turn.'})
            else:
                emit('error', {'message': 'Not your turn!'})

@socketio.on('move_piece')
def handle_move_piece(data):
    player_id = request.sid
    if player_id in players:
        game_id = players[player_id]
        game = games[game_id]
        
        if game.game_started and not game.winner:
            color = data['color']
            piece = data['piece']
            from_location = data['from']
            
            print(f"DEBUG: Move piece request from {player_id} for {color} piece {piece}")
            
            # Check if it's the player's turn
            current_player_id = list(game.players.keys())[game.current_player]
            if player_id != current_player_id:
                emit('error', {'message': 'Not your turn to move!'})
                return
            
            # Check if dice has been rolled
            if game.dice_value == 0:
                emit('error', {'message': 'Roll the dice first!'})
                return
            
            # Validate move and update game state
            if game.move_piece(player_id, color, piece, from_location):
                # Store the dice value before resetting it
                rolled_six = game.dice_value == 6
                
                # Move was successful
                socketio.emit('piece_moved', {
                    'color': color,
                    'piece': piece,
                    'from': from_location,
                    'dice_value': game.dice_value,
                    'game_state': game.get_game_state()
                }, room=game_id)
                
                # Reset dice value after move (player needs to roll again)
                game.dice_value = 0
                print(f"DEBUG: Reset dice value after move")
                
                # Advance turn only if dice value was not 6
                if not rolled_six:
                    game.current_player = (game.current_player + 1) % len(game.players)
                    print(f"DEBUG: Turn advanced to player {game.current_player} (next player)")
                    
                    # Send turn change notification
                    socketio.emit('turn_changed', {
                        'game_state': game.get_game_state(),
                        'message': f"Turn passed to {list(game.players.values())[game.current_player]['color']}"
                    }, room=game_id)
                else:
                    print(f"DEBUG: Player gets another turn because they rolled a 6")
                    
                    # Send same turn notification
                    socketio.emit('turn_changed', {
                        'game_state': game.get_game_state(),
                        'message': f"Roll again! You got a 6."
                    }, room=game_id)
                
            else:
                emit('error', {'message': 'Invalid move!'})

# Add a new endpoint to handle passing turn when no valid moves
@socketio.on('pass_turn')
def handle_pass_turn():
    player_id = request.sid
    if player_id in players:
        game_id = players[player_id]
        game = games[game_id]
        
        if game.game_started and not game.winner:
            # Check if it's the player's turn
            current_player_id = list(game.players.keys())[game.current_player]
            if player_id != current_player_id:
                emit('error', {'message': 'Not your turn!'})
                return
            
            # Only allow passing if dice has been rolled and it's not a 6
            if game.dice_value == 0:
                emit('error', {'message': 'Roll the dice first!'})
                return
            
            if game.dice_value == 6:
                emit('error', {'message': 'You rolled a 6! You must move a piece or it will be moved automatically.'})
                return
            
            # Reset dice and advance turn
            game.dice_value = 0
            game.current_player = (game.current_player + 1) % len(game.players)
            print(f"DEBUG: Turn passed to player {game.current_player}")
            
            socketio.emit('turn_changed', {
                'game_state': game.get_game_state(),
                'message': f"Turn passed to {list(game.players.values())[game.current_player]['color']}"
            }, room=game_id)

@socketio.on('chat_message')
def handle_chat_message(data):
    player_id = request.sid
    if player_id in players:
        game_id = players[player_id]
        if game_id in games:
            game = games[game_id]
            
            if player_id in game.players:
                player_name = game.players[player_id]['name']
                message = data['message']
                
                socketio.emit('chat_message', {
                    'player_name': player_name,
                    'message': message,
                    'timestamp': str(uuid.uuid4())[:8]
                }, room=game_id)
            else:
                emit('error', {'message': 'Player not found in game'})
        else:
            emit('error', {'message': 'Game not found'})
    else:
        emit('error', {'message': 'Player not in any game'})

@socketio.on('disconnect')
def handle_disconnect():
    player_id = request.sid
    print(f"DEBUG: Player {player_id} disconnected")
    
    if player_id in players:
        game_id = players[player_id]
        print(f"DEBUG: Player was in game {game_id}")
        
        if game_id in games:
            game = games[game_id]
            player_info = game.players.get(player_id, {})
            game.remove_player(player_id)
            
            print(f"DEBUG: Removed player from game. Remaining players: {len(game.players)}")
            
            socketio.emit('player_left', {
                'player_name': player_info.get('name', 'Unknown'),
                'game_state': game.get_game_state()
            }, room=game_id)
            
            # Clean up empty games only if they've been started
            # Keep unstarted games for players to rejoin
            if len(game.players) == 0 and game.game_started:
                print(f"DEBUG: Deleting empty started game {game_id}")
                del games[game_id]
            elif len(game.players) == 0:
                print(f"DEBUG: Game {game_id} is empty but not started - keeping for reconnection")
        
        del players[player_id]
    
    print(f"DEBUG: Current games after disconnect: {list(games.keys())}")

@socketio.on('rejoin_game')
def handle_rejoin_game(data):
    game_id = data['game_id'].lower()
    player_id = request.sid
    
    print(f"DEBUG: Rejoin attempt for game {game_id} by player {player_id}")
    print(f"DEBUG: Available games: {list(games.keys())}")
    
    if game_id in games:
        join_room(game_id)
        game = games[game_id]
        
        emit('game_rejoined', {
            'game_id': game_id,
            'game_state': game.get_game_state()
        })
    else:
        emit('error', {'message': f'Cannot rejoin - game {game_id} not found'})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)