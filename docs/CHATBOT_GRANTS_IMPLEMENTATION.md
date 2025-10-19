# Chatbot SEAI Grants Feature - Implementation Guide

## Current Status

### ✅ **Completed Components**

1. **Chatbot Infrastructure** (Fully Functional)
   - Gemini AI integration via Google Generative AI
   - Session management and conversation history
   - Predefined questions including SEAI grants
   - Frontend chat widget with markdown formatting
   - API endpoints: `/api/chatbot`, `/api/chatbot/questions`, `/api/chatbot/health`

2. **Basic Grant Awareness**
   - System prompt includes SEAI grant expertise
   - Can answer general questions about SEAI based on training data
   - €2,400 SEAI grant hardcoded in results page calculations

### ❌ **Missing Components**

The chatbot can **discuss** grants but cannot:
- Fetch real-time grant information from official sources
- Access user's specific solar analysis results
- Provide personalized grant recommendations
- Calculate which grants apply to specific situations
- Update when grant amounts or eligibility changes

## Implementation Options

### Option 1: Enhanced System Prompt (Quick - 30 mins)

**Best for:** Quick MVP, manual updates acceptable

**Implementation:**
1. Update `backend/core/chatbot/config.py` to include detailed grant information in system prompt
2. Manually update grant amounts/eligibility when they change

**Pros:**
- No code changes needed
- Works immediately
- Simple to maintain for small changes

**Cons:**
- Manual updates required
- No personalization
- Can't query user's analysis
- Limited to what fits in system prompt

**Code Changes:**
```python
# backend/core/chatbot/config.py
SYSTEM_PROMPT = """You are a helpful assistant specializing in solar energy...

**Current SEAI Grants (2024):**

1. **Solar PV Grant - Residential: €2,400**
   - For: Owner-occupied homes built before 2021
   - Requirements: Valid BER certificate, SEAI registered installer
   - Application: Submitted by installer on your behalf
   - Payment: Paid directly to installer, reducing your upfront cost

2. **Battery Storage Grant: €600** 
   - Additional grant for battery systems ≥5.12 kWh
   - Can be combined with Solar PV grant
   - Must be installed by SEAI registered contractor

3. **Clean Export Guarantee (CEG): €0.185-0.24/kWh**
   - Get paid for excess electricity exported to grid
   - Register with participating electricity supplier
   - Requires smart meter or export meter

**Eligibility Requirements:**
- Property must have valid BER certificate
- Installation by SEAI registered contractor
- Connected to electricity grid
- Cannot combine with previous SEAI solar grants

**Application Process:**
1. Get BER certificate if you don't have one
2. Get quotes from SEAI registered installers
3. Installer submits grant application on your behalf
4. SEAI processes application (typically 6-8 weeks)
5. Grant paid directly to installer, reducing your cost

When discussing grants:
- Always mention the €2,400 residential grant
- Suggest battery storage for additional €600
- Explain CEG as ongoing income, not upfront grant
- Emphasize BER certificate requirement
- Recommend using SEAI registered installers
"""
```

---

### Option 2: Grants Service with Chatbot Integration (Medium - 3-4 hours)

**Best for:** Production system, automated updates, personalization

**Implementation:**
1. Create grants service (✅ ALREADY CREATED: `backend/core/grants_service.py`)
2. Integrate with chatbot for context enhancement
3. Add API endpoint for grant queries
4. Optionally: Connect to user's analysis results

**Pros:**
- Structured grant data
- Easy to update via database
- Can provide personalized recommendations
- Can integrate with analysis results
- Scalable for future features

**Cons:**
- More development time
- Needs database for production
- More complex maintenance

**Implementation Steps:**

#### Step 1: Add Grants Service to Main App

```python
# backend/main.py
from core.grants_service import grants_service

@app.get("/api/grants")
async def get_all_grants():
    """Get all available SEAI grants"""
    return grants_service.get_all_grants()

@app.get("/api/grants/applicable")
async def get_applicable_grants(
    system_capacity_kwp: Optional[float] = Query(None),
    has_battery: bool = Query(False),
    property_type: str = Query("residential")
):
    """Get grants applicable to specific situation"""
    return grants_service.get_applicable_grants(
        system_capacity_kwp=system_capacity_kwp,
        has_battery=has_battery,
        property_type=property_type
    )

@app.get("/api/grants/search")
async def search_grants(query: str = Query(..., min_length=2)):
    """Search grants by keyword"""
    return grants_service.search_grants(query)
```

#### Step 2: Enhance Chatbot with Grants Context

```python
# backend/core/chatbot/chatbot_service.py

from ..grants_service import grants_service

class ChatbotService:
    # ... existing code ...
    
    async def handle_chat(self, request: ChatRequest) -> ChatResponse:
        """Handle chat request with grant context enhancement"""
        try:
            # Get or create session
            session_id, history = self._get_or_create_session(request.session_id)
            
            # Check if message is about grants
            if self._is_grant_related(request.message):
                # Enhance context with grant information
                grants_context = self._build_grants_context()
                enhanced_message = f"{request.message}\n\nContext: {grants_context}"
            else:
                enhanced_message = request.message
            
            # Generate response from Gemini
            response_text = await self.gemini_client.generate_response(
                message=enhanced_message,
                conversation_history=conversation_history
            )
            
            # ... rest of existing code ...
            
        except Exception as e:
            logger.error(f"❌ Error handling chat request: {str(e)}")
            raise
    
    def _is_grant_related(self, message: str) -> bool:
        """Check if message is related to grants"""
        grant_keywords = ['grant', 'seai', 'subsidy', 'funding', 'cost', 'price', 'money']
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in grant_keywords)
    
    def _build_grants_context(self) -> str:
        """Build current grants context for chatbot"""
        grants = grants_service.get_all_grants()
        context_parts = ["Available SEAI Grants:"]
        
        for grant in grants:
            if grant['amount'] > 0:
                context_parts.append(
                    f"- {grant['name']}: €{grant['amount']:,.0f} - {grant['description']}"
                )
        
        return "\n".join(context_parts)
```

#### Step 3: Connect to User Analysis (Optional Advanced)

This would allow chatbot to provide personalized recommendations based on the user's actual solar analysis:

```python
# backend/main.py

@app.post("/api/chatbot/with-analysis")
async def chat_with_analysis_context(
    request: ChatRequest,
    analysis_data: Optional[Dict] = Body(None)
):
    """
    Chat endpoint that includes user's solar analysis context
    
    Example:
    {
        "message": "What grants am I eligible for?",
        "analysis_data": {
            "capacity_kwp": 4.5,
            "annual_energy_kwh": 4200,
            "installation_cost": 5850
        }
    }
    """
    if chatbot_service is None:
        raise HTTPException(status_code=503, detail="Chatbot not initialized")
    
    # Get applicable grants based on analysis
    if analysis_data:
        grants_info = grants_service.get_applicable_grants(
            system_capacity_kwp=analysis_data.get('capacity_kwp'),
            has_battery=analysis_data.get('has_battery', False)
        )
        
        # Format grants for chatbot
        grants_context = grants_service.format_grants_for_chatbot(grants_info)
        
        # Enhance message with personalized context
        enhanced_request = ChatRequest(
            message=f"{request.message}\n\nUser's System: {analysis_data.get('capacity_kwp')} kWp\n{grants_context}",
            session_id=request.session_id,
            conversation_history=request.conversation_history
        )
    else:
        enhanced_request = request
    
    return await chatbot_service.handle_chat(enhanced_request)
```

#### Step 4: Frontend Integration

Update results page to use grants API:

```typescript
// app/results/page.tsx

// Add this function
const fetchApplicableGrants = async (capacity: number, hasBattery: boolean) => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(
      `${backendUrl}/api/grants/applicable?system_capacity_kwp=${capacity}&has_battery=${hasBattery}`
    )
    if (response.ok) {
      const grantsData = await response.json()
      return grantsData
    }
  } catch (error) {
    console.error('Failed to fetch grants:', error)
  }
  // Fallback to hardcoded value
  return { total_grant_amount: 2400, grants: [] }
}

// In the useEffect where analysis is fetched:
const grantsInfo = await fetchApplicableGrants(capacity, false)
setResults({
  ...results,
  seaiGrant: grantsInfo.total_grant_amount,
  availableGrants: grantsInfo.grants // Show breakdown in UI
})
```

---

### Option 3: External SEAI API Integration (Advanced - 6-8 hours)

**Best for:** Production with automatic updates from official source

**Implementation:**
1. Research if SEAI provides an API (they may not have a public API)
2. If available, integrate with their API
3. If not, use web scraping with caching (legal considerations apply)
4. Update grants service to fetch from external source

**Pros:**
- Always up-to-date with official information
- No manual updates needed
- Authoritative data source

**Cons:**
- SEAI may not have public API
- Web scraping is fragile and may violate terms
- Requires caching to avoid excessive requests
- More complex error handling

**Note:** Currently, SEAI does not appear to have a public API for grant information. Web scraping their site would require:
- Legal approval
- Robust error handling
- Caching layer
- Regular monitoring for structure changes

---

## Recommended Implementation Plan

### Phase 1: Immediate (Option 1 - 30 mins)
**Goal:** Make chatbot more helpful immediately

1. ✅ Update system prompt in `backend/core/chatbot/config.py` with detailed grant info
2. ✅ Test chatbot responses to grant questions
3. ✅ Deploy updated config

**Success Criteria:** Chatbot provides accurate, detailed grant information in responses

### Phase 2: Short-term (Option 2 - 3-4 hours)
**Goal:** Structured grant management and personalization

1. ✅ Grants service created (`backend/core/grants_service.py`)
2. ⏳ Add grants API endpoints to `main.py`
3. ⏳ Integrate grants context into chatbot responses
4. ⏳ Update frontend to fetch grants from API
5. ⏳ Test full flow with different scenarios

**Success Criteria:** 
- Chatbot uses structured grant data
- Grants can be updated without code changes
- Frontend shows dynamic grant amounts

### Phase 3: Future Enhancement (Optional)
**Goal:** Advanced personalization

1. Connect chatbot to user's analysis results
2. Provide personalized grant recommendations
3. Add grant eligibility checker
4. Create grant application guidance flow

---

## Testing Checklist

### Basic Functionality
- [ ] Chatbot responds to "What grants are available?"
- [ ] Mentions €2,400 residential grant
- [ ] Mentions €600 battery storage grant
- [ ] Explains Clean Export Guarantee
- [ ] Describes eligibility requirements

### Grant Information Accuracy
- [ ] Grant amounts are correct
- [ ] Eligibility criteria is accurate
- [ ] Application process is clear
- [ ] URLs to official sources work

### Integration Testing (if Phase 2 implemented)
- [ ] `/api/grants` endpoint returns all grants
- [ ] `/api/grants/applicable` filters correctly
- [ ] Grants service integrated with chatbot
- [ ] Frontend displays dynamic grant amounts

---

## Maintenance

### Regular Updates Needed
- **Quarterly:** Check SEAI website for grant amount changes
- **Annually:** Review eligibility criteria
- **As needed:** Update for new grant schemes

### Files to Update
- **Option 1:** `backend/core/chatbot/config.py` - SYSTEM_PROMPT
- **Option 2:** `backend/core/grants_service.py` - Grant data in `_initialize_grants()`
- **Database (future):** Update grants table

---

## Next Steps

**To complete this feature, choose your implementation:**

1. **Quick MVP** (30 mins): Update system prompt (Option 1)
2. **Production Ready** (3-4 hours): Implement grants service integration (Option 2)
3. **Full Featured** (1-2 days): Add personalized recommendations with analysis integration (Option 2 + 3)

**Recommendation:** Start with Option 1 for immediate improvement, then implement Option 2 Phase 2 for production quality.
