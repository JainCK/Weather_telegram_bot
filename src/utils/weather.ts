import axios from "axios";

interface Location {
  latitude: number;
  longitude: number;
}

interface Preferences {
  language: string;
  units: string;
}

const fetchWeather = async (location: Location, preferences: Preferences) => {
  const { latitude, longitude } = location;
  const { language, units } = preferences;

  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat: latitude,
        lon: longitude,
        appid: process.env.OPENWEATHER_API_KEY,
        lang: language,
        units,
      },
    });
    const { main, weather } = response.data;
    return {
      temp: main.temp,
      description: weather[0].description,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

export default fetchWeather;
