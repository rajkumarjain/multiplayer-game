#!/usr/bin/env python3
"""
Manual test to demonstrate join game functionality
"""
import socketio
import time

def test_manual():
    # Create two clients
    client1 = socketio.Client()
    client2 = socketio.Client()
    
    game_id = None
    
    @client1.event
    def game_created(data):
        global game_id
        game_id = data['game_id']
        print(f"✅ Game created with ID: {game_id}")
        print(f"📋 To join this game, use ID: {game_id}")
    
    @client2.event
    def game_joined(data):
        print(f"✅ Successfully joined game: {data['game_id']}")
    
    @client1.event
    def player_joined(data):
        print(f"👤 New player joined: {data['player_name']} ({data['color']})")
    
    @client2.event
    def error(data):
        print(f"❌ Join error: {data['message']}")
    
    try:
        # Connect clients
        print("🔌 Connecting to server...")
        client1.connect('http://localhost:5000')
        time.sleep(1)
        client2.connect('http://localhost:5000')
        time.sleep(1)
        
        # Create game
        print("\n🎮 Creating game...")
        client1.emit('create_game', {
            'player_name': 'Alice',
            'color': 'red'
        })
        
        time.sleep(3)
        
        if game_id:
            # Test successful join
            print(f"\n🚪 Attempting to join game {game_id}...")
            client2.emit('join_game', {
                'game_id': game_id,
                'player_name': 'Bob',
                'color': 'blue'
            })
            
            time.sleep(3)
            
            # Test duplicate color (should fail)
            print(f"\n🎨 Testing duplicate color (should fail)...")
            client2.emit('join_game', {
                'game_id': game_id,
                'player_name': 'Charlie',
                'color': 'red'  # Same as Alice
            })
            
            time.sleep(2)
            
            # Test invalid game ID (should fail)
            print(f"\n❌ Testing invalid game ID (should fail)...")
            client2.emit('join_game', {
                'game_id': 'invalid123',
                'player_name': 'Dave',
                'color': 'green'
            })
            
            time.sleep(2)
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        client1.disconnect()
        client2.disconnect()
        print("\n✅ Test completed!")

if __name__ == "__main__":
    test_manual()