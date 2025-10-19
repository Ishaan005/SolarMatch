import asyncio
from core.chatbot import ChatbotService, ChatRequest

async def test():
    print("🧪 Testing Chatbot...\n")
    
    # Initialize service
    service = ChatbotService()
    await service.initialize()
    
    # Test 1: First message
    print("📝 Test 1: First message")
    request1 = ChatRequest(message="What is SEAI?")
    response1 = await service.handle_chat(request1)
    print(f"✅ Response: {response1.response[:100]}...")
    print(f"📊 Session ID: {response1.session_id}\n")
    
    # Test 2: Follow-up with same session
    print("📝 Test 2: Follow-up message")
    request2 = ChatRequest(
        message="What grants do they offer?",
        session_id=response1.session_id
    )
    response2 = await service.handle_chat(request2)
    print(f"✅ Response: {response2.response[:100]}...")
    print(f"📊 History length: {len(response2.conversation_history)} messages\n")
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    asyncio.run(test())