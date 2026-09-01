from pydantic import BaseModel
from typing import Optional, List

class AIChatLocation(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None

class ConversationMessage(BaseModel):
    role: str
    content: str

class AIChatRequest(BaseModel):
    message: str
    location: Optional[AIChatLocation] = None
    conversation_history: Optional[List[ConversationMessage]] = []
    temperature_unit: Optional[str] = "celsius"
    wind_unit: Optional[str] = "kmh"
    persona: Optional[str] = "general"
    language: Optional[str] = "english"
