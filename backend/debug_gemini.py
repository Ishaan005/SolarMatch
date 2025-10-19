"""
Debug script to check Gemini API connection
"""
import asyncio
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

async def test_gemini_connection():
    print("🔍 Diagnosing Gemini API Connection\n")
    print("=" * 60)
    
    # Check API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment!")
        return
    
    print(f"✅ API Key found: {api_key[:10]}...{api_key[-4:]}")
    
    # Check model name
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    print(f"📦 Model: {model_name}")
    
    # Try to configure and test
    try:
        genai.configure(api_key=api_key)
        print("✅ Gemini configured successfully")
        
        # List available models
        print("\n📋 Listing available models...")
        models = genai.list_models()
        print("\nAvailable models:")
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
        
        # Try to create the model
        print(f"\n🔧 Testing model: {model_name}")
        model = genai.GenerativeModel(model_name=model_name)
        print("✅ Model created successfully")
        
        # Try a simple generation (synchronous)
        print("\n💬 Testing generation...")
        response = model.generate_content("Say hello")
        print(f"✅ Generation successful!")
        print(f"   Response: {response.text[:100]}...")
        
        print("\n" + "=" * 60)
        print("✅ All diagnostics passed! Gemini is working correctly.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPossible solutions:")
        print("1. Check your GEMINI_API_KEY is valid")
        print("2. Make sure you're using a correct model name")
        print("3. Verify your API key has access to the Gemini API")
        print("4. Check if there are any billing or quota issues")

if __name__ == "__main__":
    asyncio.run(test_gemini_connection())