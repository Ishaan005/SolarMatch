"""
Test script for FastAPI chatbot integration
Run this after starting the FastAPI server
"""
import requests
import json

BASE_URL = "http://localhost:8000"


def test_chatbot_endpoints():
    print("🧪 Testing FastAPI Chatbot Integration\n")
    print("=" * 60)
    
    # Test 1: Get predefined questions
    print("\n📋 Test 1: Get Predefined Questions")
    print("-" * 60)
    response = requests.get(f"{BASE_URL}/api/chatbot/questions")
    if response.status_code == 200:
        questions = response.json()
        print(f"✅ Got {len(questions['questions'])} predefined questions:")
        for q in questions['questions']:
            print(f"   - {q['display_text']}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test 2: Check chatbot health
    print("\n🏥 Test 2: Chatbot Health Check")
    print("-" * 60)
    response = requests.get(f"{BASE_URL}/api/chatbot/health")
    if response.status_code == 200:
        health = response.json()
        print(f"✅ Status: {health['status']}")
        print(f"   - Gemini API Configured: {health['gemini_api_configured']}")
        print(f"   - Gemini API Accessible: {health['gemini_api_accessible']}")
        print(f"   - Model: {health['model']}")
        print(f"   - Active Sessions: {health['active_sessions']}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test 3: Send a chat message (new conversation)
    print("\n💬 Test 3: Send First Message")
    print("-" * 60)
    chat_request = {
        "message": "What is SEAI?",
        "session_id": None,
        "conversation_history": []
    }
    response = requests.post(
        f"{BASE_URL}/api/chatbot",
        json=chat_request,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        chat_response = response.json()
        session_id = chat_response['session_id']
        print(f"✅ Response received:")
        print(f"   Session ID: {session_id}")
        print(f"   Response: {chat_response['response'][:150]}...")
        print(f"   Model: {chat_response['gemini_model']}")
        print(f"   Tokens Used: {chat_response['tokens_used']}")
        print(f"   History Length: {len(chat_response['conversation_history'])} messages")
        
        # Test 4: Send follow-up message (same session)
        print("\n💬 Test 4: Send Follow-up Message")
        print("-" * 60)
        followup_request = {
            "message": "What grants do they offer for solar panels?",
            "session_id": session_id,
            "conversation_history": chat_response['conversation_history']
        }
        response2 = requests.post(
            f"{BASE_URL}/api/chatbot",
            json=followup_request,
            headers={"Content-Type": "application/json"}
        )
        
        if response2.status_code == 200:
            chat_response2 = response2.json()
            print(f"✅ Follow-up response received:")
            print(f"   Session ID: {chat_response2['session_id']}")
            print(f"   Response: {chat_response2['response'][:150]}...")
            print(f"   History Length: {len(chat_response2['conversation_history'])} messages")
            
            # Test 5: Clear session
            print("\n🗑️  Test 5: Clear Session")
            print("-" * 60)
            response3 = requests.delete(f"{BASE_URL}/api/chatbot/session/{session_id}")
            if response3.status_code == 200:
                print(f"✅ Session cleared: {response3.json()['message']}")
            else:
                print(f"❌ Failed to clear session: {response3.status_code}")
        else:
            print(f"❌ Follow-up failed: {response2.status_code}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!\n")


if __name__ == "__main__":
    print("\n⚠️  Make sure your FastAPI server is running:")
    print("   uvicorn main:app --reload\n")
    
    try:
        test_chatbot_endpoints()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to the server.")
        print("   Make sure FastAPI is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")