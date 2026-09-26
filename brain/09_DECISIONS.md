# Important Architectural Decisions

## Decision: Decoupled AI and Deterministic Weather (Context Injection)
### Date: Project Inception
### Reason: 
To prevent the LLM from hallucinating weather data.
### Impact: 
The system always queries OpenWeatherMap directly for real deterministic data, formats it into Markdown, and injects it into the prompt. The LLM only acts as an intelligent interpreter.

## Decision: Gemini as the LLM Provider
### Date: Project Inception / Phase 5
### Reason: 
Supports structured output (JSON schema), has generous context windows, and offers fast flash models.
### Impact: 
Required specific adjustments to the `google-genai` SDK and model switching (`gemini-3.8-flash` vs `gemini-1.5-flash`) due to rate limiting on the free tier.

## Decision: Location Fallback Mechanism
### Date: Phase 2
### Reason: 
If the user's browser blocks geolocation, the system must still provide localized data.
### Impact: 
The system attempts IP-based geolocation as a fallback and provides manual search if IP geolocation fails or is inaccurate.

## Decision: Use Vite + React instead of Next.js App Router
### Date: Project Inception
### Reason: 
Simpler client-side architecture and easier PWA bundling.
### Impact: 
The `weathergpt-frontend` is built with Vite, ignoring the `readme.md` that incorrectly stated it was Next.js.
