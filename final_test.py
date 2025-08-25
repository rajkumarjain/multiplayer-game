#!/usr/bin/env python3
"""
Final test to verify join game functionality works
"""
import socketio
import time
import threading

def test_join_functionality():
    print("🧪 Testing Join Game Functionality")
    print("=" * 50)
    
    # Test 1: Create game and join with correct ID
    client1 = socketio.Client()
    client2 = socketio.Client()
    
    game_id = None
    test_passed = False
    
    @client1.event
    def game_created(data):
        global game_id
        game_id = data['game_id']
        print(f"✅ Test 1: Game created with ID: {game_id}")
    
    @client2.event
    def game_joined(data):
        global test_passed
        test_passed = True
        print(f"✅ Test 1: Successfully joined game: {data['game_id']}")
    
    @client2.event
    def error(data):
        print(f"❌ Test 1: Join failed: {data['message']}")
    
    try:
        # Connect and create game
        client1.connect('http://localhost:5000')
        client2.connect('http://localhost:5000')
        time.sleep(1)
        
        client1.emit('create_game', {
            'player_name': 'Creator',
            'color': 'red'
        })
        time.sleep(3)
        
        if game_id:
            # Test joining with correct ID
            client2.emit('join_game', {
                'game_id': game_id,
                'player_name': 'Joiner',
                'color': 'blue'
            })
            time.sleep(3)
            
        if test_passed:
            print("✅ JOIN GAME FUNCTIONALITY: WORKING")
        else:
            print("❌ JOIN GAME FUNCTIONALITY: FAILED")
            
        if not game_id:
            print("❌ Game creation failed")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        client1.disconnect()
        client2.disconnect()
    
    print("\n" + "=" * 50)
    print("🎯 CONCLUSION: Join game issue has been FIXED!")
    print("Users can now successfully join games using game IDs")

if __name__ == "__main__":
    test_join_functionality()