#!/usr/bin/env python3
"""
Test script to verify join game functionality
"""
import socketio
import time
import threading

# Create socket clients
sio1 = socketio.Client()
sio2 = socketio.Client()

game_id = None
test_results = []

def log_result(message, success=True):
    status = "✓" if success else "✗"
    print(f"{status} {message}")
    test_results.append((message, success))

# Event handlers for client 1 (game creator)
@sio1.event
def game_created(data):
    global game_id
    game_id = data['game_id']
    log_result(f"Game created with ID: {game_id}")

@sio1.event
def player_joined(data):
    log_result(f"Player joined notification received by creator")

@sio1.event
def error(data):
    log_result(f"Client 1 error: {data['message']}", False)

# Event handlers for client 2 (game joiner)
@sio2.event
def game_joined(data):
    log_result(f"Successfully joined game {data['game_id']}")

@sio2.event
def error(data):
    log_result(f"Client 2 error: {data['message']}", False)

def test_join_game():
    try:
        # Connect both clients
        print("🔌 Connecting clients...")
        sio1.connect('http://localhost:5000')
        sio2.connect('http://localhost:5000')
        
        time.sleep(1)
        
        # Client 1 creates a game
        print("\n🎮 Testing game creation...")
        sio1.emit('create_game', {
            'player_name': 'TestPlayer1',
            'color': 'red'
        })
        
        time.sleep(2)
        
        if game_id is None:
            log_result("Game creation failed - no game ID received", False)
            return
        
        # Client 2 tries to join the game
        print(f"\n🚪 Testing game join with ID: {game_id}")
        sio2.emit('join_game', {
            'game_id': game_id,
            'player_name': 'TestPlayer2',
            'color': 'blue'
        })
        
        time.sleep(2)
        
        # Test joining with invalid game ID
        print("\n❌ Testing invalid game ID...")
        sio2.emit('join_game', {
            'game_id': 'INVALID123',
            'player_name': 'TestPlayer3',
            'color': 'green'
        })
        
        time.sleep(2)
        
        # Test joining with same color
        print("\n🎨 Testing duplicate color...")
        sio2.emit('join_game', {
            'game_id': game_id,
            'player_name': 'TestPlayer3',
            'color': 'red'  # Same as player 1
        })
        
        time.sleep(2)
        
    except Exception as e:
        log_result(f"Test failed with exception: {e}", False)
    
    finally:
        # Disconnect clients
        print("\n🔌 Disconnecting clients...")
        sio1.disconnect()
        sio2.disconnect()
        
        # Print summary
        print("\n📊 Test Summary:")
        passed = sum(1 for _, success in test_results if success)
        total = len(test_results)
        print(f"Passed: {passed}/{total}")
        
        if passed < total:
            print("\n❌ Failed tests:")
            for message, success in test_results:
                if not success:
                    print(f"  - {message}")

if __name__ == "__main__":
    test_join_game()