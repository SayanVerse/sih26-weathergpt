from fastapi import APIRouter
from typing import List, Optional
from datetime import datetime, timezone

from services.ai_service import generate_chat_response, extract_intent_and_location
from services.weather_context_service import build_weather_context
from services.weather_intelligence import generate_weather_signals
from services.geocoding import search_locations
from routers.weather import _get_formatted_weather
from schemas.weather import AIInsightData, AIChatResponse
from schemas.ai import AIChatRequest

router = APIRouter(tags=["AI"])

@router.get("/api/weather/insights", response_model=AIInsightData)
async def get_weather_insights(lat: float, lon: float):
    """
    GET /api/weather/insights?lat=&lon=
    Returns AI insight summary for the current weather.
    Currently uses rule-based generation from live weather data.
    """
    try:
        data = await _get_formatted_weather(lat, lon)
        current = data["current"]
        temp = current.get("temperature", 20)
        condition = current.get("condition", "Clear")
        humidity = current.get("humidity", 50)
        wind_speed = current.get("wind_speed", 0)
        is_day = current.get("is_day", True)

        insights = []

        # Temperature insight
        if temp >= 35:
            insights.append({
                "category": "temperature",
                "title": "Extreme Heat",
                "description": f"It's dangerously hot at {temp}°C. Stay hydrated and avoid prolonged sun exposure.",
                "importance": "high",
                "iconName": "thermometer"
            })
        elif temp >= 28:
            insights.append({
                "category": "temperature",
                "title": "Hot Weather",
                "description": f"Temperature is {temp}°C. Light clothing and sunscreen recommended.",
                "importance": "medium",
                "iconName": "sun"
            })
        elif temp <= 0:
            insights.append({
                "category": "temperature",
                "title": "Freezing Conditions",
                "description": f"Temperature is {temp}°C. Dress in warm layers and watch for ice.",
                "importance": "high",
                "iconName": "snowflake"
            })
        elif temp <= 10:
            insights.append({
                "category": "temperature",
                "title": "Cold Weather",
                "description": f"It's {temp}°C. A warm jacket is recommended.",
                "importance": "medium",
                "iconName": "thermometer"
            })

        # Rain/precipitation insight
        cond_lower = condition.lower()
        if "rain" in cond_lower or "drizzle" in cond_lower or "shower" in cond_lower:
            insights.append({
                "category": "rain",
                "title": "Rain Expected",
                "description": f"{condition} — carry an umbrella and allow extra commute time.",
                "importance": "high",
                "iconName": "cloud-rain"
            })
        elif "snow" in cond_lower:
            insights.append({
                "category": "rain",
                "title": "Snow Conditions",
                "description": "Snowfall expected. Drive carefully and wear appropriate footwear.",
                "importance": "high",
                "iconName": "cloud-snow"
            })
        elif "thunder" in cond_lower:
            insights.append({
                "category": "rain",
                "title": "Thunderstorm Warning",
                "description": "Thunderstorms in the area. Stay indoors and avoid elevated areas.",
                "importance": "high",
                "iconName": "cloud-lightning"
            })

        # Wind insight
        if wind_speed >= 60:
            insights.append({
                "category": "wind",
                "title": "Strong Winds",
                "description": f"Wind speeds of {wind_speed} km/h. Secure loose objects and drive with caution.",
                "importance": "high",
                "iconName": "wind"
            })
        elif wind_speed >= 30:
            insights.append({
                "category": "wind",
                "title": "Breezy Conditions",
                "description": f"Winds at {wind_speed} km/h. May feel cooler than the temperature suggests.",
                "importance": "low",
                "iconName": "wind"
            })

        # Outdoor/humidity insight
        if humidity >= 85:
            insights.append({
                "category": "health",
                "title": "High Humidity",
                "description": f"Humidity at {humidity}%. Feels more uncomfortable than the temperature alone.",
                "importance": "medium",
                "iconName": "droplets"
            })

        # Outdoor suitability
        is_good_outdoor = (
            10 <= temp <= 28
            and "rain" not in cond_lower
            and "snow" not in cond_lower
            and "thunder" not in cond_lower
            and wind_speed < 40
        )
        if is_good_outdoor and is_day:
            insights.append({
                "category": "outdoor",
                "title": "Great for Outdoors",
                "description": f"Comfortable {temp}°C with {condition.lower()} skies — a good time to go outside.",
                "importance": "low",
                "iconName": "sun"
            })

        # Fallback if no insights generated
        if not insights:
            insights.append({
                "category": "outdoor",
                "title": "Mild Conditions",
                "description": f"Current weather shows {condition} at {temp}°C. No major concerns.",
                "importance": "low",
                "iconName": "cloud-sun"
            })

        return {
            "summary": f"Currently {condition} and {temp}°C with {humidity}% humidity.",
            "insights": insights,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as e:
        # Graceful fallback if weather fetch fails
        return {
            "summary": "Weather insights are currently unavailable.",
            "insights": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }


@router.post("/api/ai/chat", response_model=AIChatResponse)
async def ai_chat(request: AIChatRequest):
    """
    POST /api/ai/chat
    Phase 2: Full LLM Integration with Deterministic Weather Context.
    """
    weather_context_md = ""
    signals = []

    if request.location:
        try:
            target_lat = request.location.latitude
            target_lon = request.location.longitude
            target_name = request.location.name or "Unknown Location"
            
            # Step 1: Query Understanding - Extract Location Intent
            new_location = await extract_intent_and_location(request.message, target_name)
            
            if new_location:
                # User is asking about a different location, let's search for it
                print(f"Location intent extracted: {new_location}. Searching...")
                search_results = await search_locations(new_location)
                if search_results and len(search_results) > 0:
                    best_match = search_results[0]
                    target_lat = best_match["latitude"]
                    target_lon = best_match["longitude"]
                    target_name = best_match["name"]
                    print(f"Found location: {target_name} ({target_lat}, {target_lon})")
                else:
                    print(f"Could not find coordinates for: {new_location}")
            
            # Step 2: Fetch Relevant Weather Data
            data = await _get_formatted_weather(
                target_lat,
                target_lon
            )
            
            # Use requested location name if the geocoded name is missing
            if "location" not in data:
                data["location"] = {}
            if target_name and not data["location"].get("name"):
                data["location"]["name"] = target_name
                
            current = data.get("current", {})
            # daily and hourly inside the formatted blob are plain lists
            daily_list = data.get("daily", [])
            hourly_list = data.get("hourly", [])
            
            # Step 3: Generate Deterministic Intelligence Signals
            signals = generate_weather_signals(current, daily_list, hourly_list)
            
            # Step 4: Build Structured Markdown Weather Context
            weather_context_md = build_weather_context(current, daily_list, hourly_list, signals)

        except Exception as e:
            print(f"Failed to build weather context: {e}")
            weather_context_md = "Weather context is currently unavailable."

    # 3. Request LLM Response
    response = await generate_chat_response(
        user_message=request.message,
        weather_context=weather_context_md,
        conversation_history=[msg.dict() for msg in request.conversation_history] if request.conversation_history else [],
        persona=request.persona,
        language=request.language
    )
    
    # Map the list of insight dictionaries to a list of strings for the frontend
    llm_insights = response.get("insights", [])
    formatted_insights = []
    if isinstance(llm_insights, list):
        for insight in llm_insights:
            if isinstance(insight, dict) and "message" in insight:
                formatted_insights.append(insight["message"])
            elif isinstance(insight, str):
                formatted_insights.append(insight)

    return {
        "response": response.get("answer", "I encountered an error processing your request."),
        "insights": formatted_insights,
        "actionable_advice": {
            "attire": None,
            "outdoor_suitability": "good",
            "umbrella_needed": any(s["type"] == "rain" for s in signals),
            "best_time_outside": "Anytime",
            "signals": signals  # Passing signals down to the UI if they can use it
        }
    }
