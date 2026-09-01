import os
import json
from google import genai
from google.genai import types

def get_ai_client():
    api_key = os.environ.get("AI_API_KEY")
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Failed to initialize AI Client: {e}")
        return None

SYSTEM_INSTRUCTION = """You are WeatherGPT, an advanced AI weather intelligence assistant.
Your primary role is to interpret the provided weather context and deterministic signals, and answer user queries about the weather.

CRITICAL RULES:
1. NO HALLUCINATIONS: You must NEVER invent, guess, or fabricate weather data, temperatures, forecasts, or conditions. If the data is not in the provided context, state that you do not have that information.
2. GROUNDING: Base all your facts, figures, and reasoning strictly on the `WEATHER CONTEXT` provided in the prompt. 
3. DETERMINISTIC SIGNALS: The context includes deterministic alerts (e.g., High Rain Probability, Extreme Heat). Use these to provide practical advice (e.g., "Take an umbrella", "Avoid strenuous exercise").
4. CONCISE & PRACTICAL: Do not list out all the weather variables unnecessarily unless asked. Answer the user's question directly and offer actionable advice based on the weather.
5. LOCATION AWARENESS: Always frame your answer in the context of the location provided in the weather context.
6. NO UNCERTAINTY IN FACTS: If rain probability is 70%, say "There is a 70% chance of rain", do not say "It will definitely rain". Do not claim certainty where there is only probability.
7. TONE: Helpful, clear, professional, and practical.
"""

async def extract_intent_and_location(user_message: str, current_location_name: str) -> str | None:
    """
    Analyzes the user's message to determine if they are asking about a new location.
    Returns the new location name if they are, or None if they are asking about the current location.
    """
    client = get_ai_client()
    if not client:
        return None
        
    model_name = os.environ.get("AI_MODEL", "gemini-1.5-flash")
    prompt = f"""
    You are an intent extractor for a weather app. 
    The user is currently viewing the weather for: "{current_location_name}".
    
    User Message: "{user_message}"
    
    Analyze the user's message. Are they asking for the weather in a DIFFERENT location than the one they are currently viewing?
    If yes, return ONLY the name of the new location.
    If no, return the exact string "NONE".
    
    Do not return any other text, punctuation, or explanation.
    """
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
            config=types.GenerateContentConfig(
                temperature=0.0,
                automatic_function_calling={"disable": True}
            )
        )
        result = response.text.strip()
        if result.upper() == "NONE":
            return None
        return result
    except Exception as e:
        print(f"Location extraction failed: {e}")
        return None

async def generate_chat_response(
    user_message: str,
    weather_context: str,
    conversation_history: list = None,
    persona: str = "general",
    language: str = "english"
) -> dict:
    """
    Calls the Gemini API to generate a weather-aware response.
    Returns a dictionary matching the frontend AIChatResponse schema.
    """
    client = get_ai_client()
    if not client:
        return {
            "answer": "WeatherGPT is temporarily unavailable because the AI provider is not configured. Please add your AI_API_KEY to the backend environment variables.",
            "insights": []
        }

    model_name = os.environ.get("AI_MODEL", "gemini-1.5-flash")
    # Dynamically inject persona and language into system instruction
    dynamic_instruction = SYSTEM_INSTRUCTION + f"""
8. PERSONA: You are adopting the persona of a weather assistant for a '{persona}'. Tailor your advice appropriately. For example, if the persona is 'farmer', give agricultural/irrigation advice. If 'traveller', give commute/safety advice.
9. LANGUAGE: You MUST respond in {language}. All text in your response must be in {language} except for specific locations or technical units if absolutely necessary.
"""

    # Construct the final prompt
    prompt = f"""
{weather_context}

USER QUESTION:
{user_message}
"""

    contents = []
    
    # Add conversation history
    if conversation_history:
        # Take the last 6 messages to keep context window reasonable
        for msg in conversation_history[-6:]:
            role = "user" if msg.role == "user" else "model"
            
            content_text = msg.content
            # To prevent schema hallucination, past model responses must match the expected JSON schema
            if role == "model":
                content_text = json.dumps({"answer": msg.content, "insights": []})
                
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=content_text)]
                )
            )
            
    # Add the current prompt
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)]
        )
    )

    try:
        # Set structured JSON output schema matching AIChatResponse
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "answer": {
                    "type": "STRING",
                    "description": "The natural language answer to the user's question, grounded strictly in the provided weather context."
                },
                "insights": {
                    "type": "ARRAY",
                    "description": "A list of 0-3 key insights derived from the weather context or deterministic signals.",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "type": {
                                "type": "STRING",
                                "description": "The type of insight (e.g., 'rain', 'temperature', 'wind', 'uv', 'general')"
                            },
                            "severity": {
                                "type": "STRING",
                                "description": "The severity level ('low', 'medium', 'high')"
                            },
                            "message": {
                                "type": "STRING",
                                "description": "A short, 1-sentence actionable message."
                            }
                        },
                        "required": ["type", "severity", "message"]
                    }
                }
            },
            "required": ["answer", "insights"]
        }

        # Since google-genai structured output currently prefers pydantic or typeddicts, 
        # but raw JSON schema is supported via response_schema in generation_config.
        
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=dynamic_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.1, # Low temperature for factual consistency
                automatic_function_calling={"disable": True}
            )
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            return {
                "answer": response.text,
                "insights": []
            }
            
    except Exception as e:
        print(f"AI Service Error: {e}")
        return {
            "answer": "I'm having trouble connecting to my intelligence core right now. Please try again in a moment.",
            "insights": []
        }
