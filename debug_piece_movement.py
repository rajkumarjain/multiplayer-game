#!/usr/bin/env python3
"""
Debug script to test piece movement logic
"""

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
        # Initialize empty board state
        return {
            'red': {'home': [0, 1, 2, 3], 'path': [], 'safe': []},
            'blue': {'home': [0, 1, 2, 3], 'path': [], 'safe': []},
            'green': {'home': [0, 1, 2, 3], 'path': [], 'safe': []},
            'yellow': {'home': [0, 1, 2, 3], 'path': [], 'safe': []}
        }
    
    def add_player(self, player_id, player_name, color):
        if len(self.players) < 4 and color not in [p['color'] for p in self.players.values()]:
            self.players[player_id] = {'name': player_name, 'color': color}
            return True
        return False
    
    def roll_dice(self):
        self.dice_value = 6  # Force 6 for testing
        return self.dice_value
    
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
        
        # Enhanced move logic
        if from_location == 'home':
            # Can only move from home with a 6
            if self.dice_value == 6:
                if piece in self.board[color]['home']:
                    self.board[color]['home'].remove(piece)
                    self.board[color]['path'].append(piece)
                    print(f"DEBUG: Moved piece {piece} from home to path")
                    print(f"DEBUG: New board state for {color}: {self.board[color]}")
                    return True
                else:
                    print(f"DEBUG: Piece {piece} not found in home. Home contains: {self.board[color]['home']}")
            else:
                print(f"DEBUG: Need dice value 6 to move from home, got {self.dice_value}")
        elif from_location == 'path':
            # Move piece along the path (simplified - just move within path for now)
            if piece in self.board[color]['path']:
                # For now, just keep it in path (in full game, would move to specific positions)
                print(f"DEBUG: Moved piece {piece} along path")
                return True
        
        print(f"DEBUG: Move not allowed")
        return False

def test_piece_movement():
    print("🧪 Testing Piece Movement Logic")
    print("=" * 50)
    
    # Create game and add player
    game = LudoGame("test123")
    player_id = "test_player"
    game.add_player(player_id, "TestPlayer", "red")
    game.game_started = True
    
    # Roll dice (force 6)
    dice_value = game.roll_dice()
    print(f"🎲 Rolled: {dice_value}")
    print(f"📋 Initial board state: {game.board['red']}")
    
    # Test moving pieces from home
    pieces_to_test = [0, 1, 2, 3]
    
    for piece in pieces_to_test:
        print(f"\n🔄 Testing piece {piece}:")
        success = game.move_piece(player_id, "red", piece, "home")
        print(f"Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Board after attempt: {game.board['red']}")
    
    print("\n" + "=" * 50)
    print("🎯 Test completed!")

if __name__ == "__main__":
    test_piece_movement()