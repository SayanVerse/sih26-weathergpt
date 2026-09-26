# WeatherGPT — Project Master

## Project Identity
- **Project Name:** WeatherGPT
- **SIH Problem Statement:** N/A (General Weather AI Assistant)
- **Project Type:** Full-stack Weather Intelligence Platform

## Problem
Fragmented weather information forces users to decipher complex meteorological data (charts, percentages) across multiple sources. There is no conversational access to real-time, context-aware weather intelligence that directly answers user intent (e.g., "Do I need an umbrella today?").

## Solution
An AI-driven Weather Intelligence platform (WeatherGPT) that provides real-time weather retrieval, location-based forecasting, and natural-language query understanding, returning clear, conversational advisory responses directly grounded in the current weather context.

## Main Objective
To simplify weather consumption by translating raw meteorological data into natural-language intelligence using LLMs, while providing traditional geospatial and charting tools (dashboards, maps) for deep insights.

## Target Users
- General Public (daily commutes, outfits, plans)
- Farmers (agricultural advisory)
- Aviation/Marine professionals
- Disaster Management / Urban Planners

## Core Features
- Real-time weather retrieval
- Conversational NL query understanding (Gemini)
- Location-based forecasting and geolocation
- Weather Dashboard (React/Vite)
- Severe Weather Alerts (Planned)
- NWP (Numerical Weather Prediction) integration (Planned)
- Multilingual Voice Interaction (Planned)

## Expected Outcome
A complete, reliable, real-time application where users can both see a traditional dashboard of their weather and ask conversational questions about it, receiving accurate AI advice.

## Current Implementation Summary
The project currently has a working FastAPI backend (handling geocoding, OpenWeather integration, Gemini AI queries, severe weather risk assessment, NWP feeds, and Historical Climate trends) and a Vite+React frontend. The foundation for location intelligence, deterministic weather fetching, basic AI conversation, risk engines, NWP integration, and climate statistics is fully verified and functional.

## Current Phase
**PHASE 12 — Multilingual, Voice, Mobile & Production Readiness** (Pending Initialization)

## Overall Development Status
Phases 1 through 11 are Verified. Phase 12 is Not Started. The project has a solid working foundation including advanced risk engines, NWP integration, and historical climate trends, but lacks multilingual voice features and production readiness.

## Important Constraints
- MapTiler API key detection has a known issue.
- IP detection has limitations on localhost/certain environments.
- Gemini 3.8-flash free tier imposes aggressive rate limits (429 Resource Exhausted errors).

## Development Principles
- Small incremental changes.
- Never claim implementation without verification.
- Test after implementation.

## Source of Truth Rules
1. SIH requirements define what the project SHOULD accomplish.
2. Repository code defines what is CURRENTLY implemented.
3. Test reports define what has been VERIFIED.
4. This brain folder records the current project state.
5. Never claim an untested feature is fully working.
6. Never implement future phases automatically.
