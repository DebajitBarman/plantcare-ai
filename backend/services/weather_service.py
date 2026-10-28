"""
PlantCare AI - Weather & Environmental Disease Risk Service
Modular, future-ready risk calculation based on temperature, humidity, and leaf wetness.
"""

from typing import Dict, Any, Optional


class WeatherService:
    @staticmethod
    def calculate_disease_risk(
        crop: str,
        temperature_c: float = 24.0,
        humidity_percent: float = 75.0,
        leaf_wetness_hours: float = 6.0,
    ) -> Dict[str, Any]:
        """
        Calculates environmental disease vulnerability risk for the given crop.
        Based on standard agricultural infection indices (e.g., Mills Periods, Wallin Blight Units).
        """
        crop_clean = crop.lower()
        risk_level = "Low"
        risk_score = 25  # 0 to 100
        conducive_diseases = []
        advisory_notes = []

        # High humidity + moderate temperatures favor fungal sporulation
        if humidity_percent >= 85 and leaf_wetness_hours >= 6:
            if 15 <= temperature_c <= 22:
                risk_level = "High"
                risk_score = 85
                conducive_diseases.extend(["Late Blight (Phytophthora infestans)", "Apple Scab", "Downy Mildew"])
                advisory_notes.append("Prolonged cool moisture creates critical conditions for oomycete and water-mold outbreaks.")
            elif 23 <= temperature_c <= 32:
                risk_level = "High"
                risk_score = 80
                conducive_diseases.extend(["Early Blight (Alternaria solani)", "Bacterial Spot", "Leaf Mold", "Anthracnose"])
                advisory_notes.append("Warm humid air with wet foliage accelerates bacterial multiplication and fungal target spots.")
            else:
                risk_level = "Moderate"
                risk_score = 60
                advisory_notes.append("High humidity detected; inspect denser canopy areas for foliar mildew.")

        elif humidity_percent >= 70 and leaf_wetness_hours >= 4:
            risk_level = "Moderate"
            risk_score = 55
            if "tomato" in crop_clean or "potato" in crop_clean:
                conducive_diseases.append("Early Blight")
            if "corn" in crop_clean:
                conducive_diseases.append("Common Rust")
            advisory_notes.append("Moderate fungal risk. Ensure adequate air drainage and monitor lower canopy foliage.")
        else:
            risk_level = "Low"
            risk_score = 25
            advisory_notes.append("Current ambient moisture conditions do not favor rapid fungal pathogen sporulation.")

        return {
            "crop": crop,
            "inputs": {
                "temperature_c": temperature_c,
                "humidity_percent": humidity_percent,
                "leaf_wetness_hours": leaf_wetness_hours,
            },
            "risk_score": risk_score,
            "risk_level": risk_level,
            "conducive_diseases": conducive_diseases,
            "advisory_notes": advisory_notes,
            "disclaimer": "Environmental risk indices indicate climatic favorability for pathogen development, not guaranteed disease occurrence.",
        }

    @staticmethod
    def get_risk_for_location(location: str, crop: str = "Tomato") -> Dict[str, Any]:
        """
        Simulates location-based environmental lookup or interfaces with OpenWeather/Meteo API.
        Does not require paid API keys to function out-of-the-box.
        """
        # Baseline regional defaults
        simulated_temp = 25.5
        simulated_humidity = 78.0
        simulated_wetness = 5.5

        return WeatherService.calculate_disease_risk(
            crop=crop,
            temperature_c=simulated_temp,
            humidity_percent=simulated_humidity,
            leaf_wetness_hours=simulated_wetness,
        )


weather_service = WeatherService()
