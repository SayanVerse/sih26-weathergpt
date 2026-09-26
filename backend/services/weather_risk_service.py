from typing import Dict, Any, List
from schemas.weather import WeatherRiskItem, RiskAssessmentResponse

def evaluate_extreme_weather_risk(
    current: Dict[str, Any],
    daily: list,
    hourly: list,
    signals: List[Dict[str, str]]
) -> Dict[str, Any]:
    """
    Evaluates weather conditions and Phase 7 signals into structured extreme-weather risk levels.
    """
    risks = []
    max_severity_weight = 0

    severity_weight_map = {
        "CRITICAL": 4,
        "WARNING": 3,
        "WATCH": 2,
        "ADVISORY": 1
    }

    # Helper function to map Phase 7 signal severities to Risk Level and Severity
    def get_risk_mapping(signal_severity: str) -> tuple:
        if signal_severity == "high":
            return "Extreme", "CRITICAL"
        elif signal_severity == "medium":
            return "High", "WARNING"
        elif signal_severity == "low":
            return "Low", "ADVISORY"
        return "Moderate", "WATCH"

    # 1. Process Phase 7 Signals into Risks
    for sig in signals:
        sig_type = sig.get("type", "")
        if sig_type == "outdoor":
            continue # Not an extreme weather risk
            
        risk_level, severity = get_risk_mapping(sig.get("severity", "medium"))
        
        # Determine the affected metric and recommendations based on type
        affected_metric = ""
        action = ""
        hazard = sig.get("title", "Unknown Hazard")
        
        if sig_type == "heat":
            affected_metric = "Feels Like Temperature"
            action = "Stay indoors, hydrate constantly, avoid strenuous activity."
        elif sig_type == "cold":
            affected_metric = "Temperature"
            action = "Wear heavy layers, avoid prolonged exposure to prevent frostbite."
        elif sig_type == "uv":
            affected_metric = "UV Index"
            action = "Apply SPF 50+ sunscreen, wear protective clothing and sunglasses."
        elif sig_type == "wind":
            affected_metric = "Wind Speed"
            action = "Secure loose outdoor objects, be careful driving high-profile vehicles."
        elif sig_type == "thunderstorm":
            affected_metric = "Weather Condition"
            action = "Seek shelter immediately, avoid open areas and water."
        elif sig_type == "rain":
            affected_metric = "Precipitation"
            action = "Carry an umbrella, expect slippery roads and potential pooling water."
        elif sig_type == "snow":
            affected_metric = "Snowfall"
            action = "Dress warmly, drive slowly due to icy roads."
        elif sig_type == "visibility":
            affected_metric = "Visibility"
            action = "Use fog lights, drive very slowly, keep maximum following distance."
        elif sig_type == "air_quality":
            affected_metric = "AQI"
            action = "Wear N95 masks outdoors, keep windows closed, run air purifiers."

        time_period = "Current"
        if "Later" in hazard or "expected" in sig.get("description", "").lower() or "next 12 hours" in sig.get("description", "").lower():
            time_period = "Next 12 Hours"

        # Special fallback for Heavy Rain from hourly if not covered by signals
        
        risks.append(WeatherRiskItem(
            hazard=hazard,
            risk_level=risk_level,
            severity=severity,
            reason=sig.get("description", ""),
            affected_metric=affected_metric,
            recommended_action=action,
            time_period=time_period
        ))

        # Update composite score tracker
        weight = severity_weight_map.get(severity, 0)
        if weight > max_severity_weight:
            max_severity_weight = weight

    # Fallback to check if heavy rain is expected but missing from signals
    # (Though Phase 7 handles it, we can independently check for flood risk)
    max_precip_prob = 0
    for h in (hourly or [])[:12]:
        p = h.get("precipitation_probability", 0)
        if p > max_precip_prob:
            max_precip_prob = p
            
    if max_precip_prob >= 80 and not any(r.affected_metric == "Precipitation" for r in risks):
        risks.append(WeatherRiskItem(
            hazard="Heavy Rain / Flood Risk",
            risk_level="High",
            severity="WARNING",
            reason=f"There is an {max_precip_prob}% chance of heavy rain in the next 12 hours.",
            affected_metric="Precipitation Probability",
            recommended_action="Prepare for heavy rain, avoid flood-prone areas.",
            time_period="Next 12 Hours"
        ))
        if severity_weight_map["WARNING"] > max_severity_weight:
            max_severity_weight = severity_weight_map["WARNING"]

    # Determine composite risk score
    composite_risk_score = "LOW"
    if max_severity_weight == 4:
        composite_risk_score = "EXTREME"
    elif max_severity_weight == 3:
        composite_risk_score = "HIGH"
    elif max_severity_weight == 2:
        composite_risk_score = "MODERATE"
    elif max_severity_weight == 1:
        composite_risk_score = "LOW"
        
    if len(risks) > 1 and composite_risk_score in ["HIGH", "MODERATE"]:
        # If multiple hazards exist, bump the composite risk slightly if it's not already extreme
        if composite_risk_score == "HIGH":
            composite_risk_score = "EXTREME" # Multiple Highs = Extreme
        elif composite_risk_score == "MODERATE":
            composite_risk_score = "HIGH"    # Multiple Moderates = High

    return {
        "composite_risk_score": composite_risk_score,
        "risks": risks
    }
