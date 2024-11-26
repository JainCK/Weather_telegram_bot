import { Telegraf } from "telegraf";
import axios from "axios";
import User from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY!);

// Helper function: Fetch weather data
async function fetchWeather(lat: number, lon: number): Promise<string> {
  try {
    const response = await axios.get(
      "http://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric", // Change to "imperial" if needed
        },
      }
    );

    const { name, main, weather } = response.data;
    const description = weather[0].description;
    const temperature = main.temp;
    const feelsLike = main.feels_like;

    return `🌤️ Current Weather in ${name}:\n- ${description}\n- Temperature: ${temperature}°C\n- Feels like: ${feelsLike}°C`;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "Unable to fetch weather data at the moment. Please try again later.";
  }
}

// Command: /start
bot.start(async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      await User.create({
        telegramId,
        location: { latitude: 0, longitude: 0 },
        preferences: { language: "en", units: "metric" },
      });
      ctx.reply("Welcome! You have been registered. Use /setlocation to update your location.");
    } else {
      ctx.reply("Welcome back! Fetching your latest weather update...");
      
      // Fetch weather for the saved location
      const { latitude, longitude } = user.location;
      if (latitude !== 0 && longitude !== 0) {
        const weatherMessage = await fetchWeather(latitude, longitude);
        ctx.reply(weatherMessage);
      } else {
        ctx.reply("It seems you haven't set a location yet. Use /setlocation to update it.");
      }
    }
  } catch (error) {
    console.error("Error during /start:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

// Command: /setlocation
bot.command("setlocation", (ctx) => {
  ctx.reply(
    "Please share your location or type the name of your city (e.g., 'Kochi').",
    {
      reply_markup: {
        keyboard: [[{ text: "Send Location", request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
});

// Command: /weather
bot.command("weather", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  if (!telegramId) return;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      ctx.reply("You're not registered yet. Use /start to register.");
      return;
    }

    const { latitude, longitude } = user.location;
    if (latitude !== 0 && longitude !== 0) {
      const weatherMessage = await fetchWeather(latitude, longitude);
      ctx.reply(weatherMessage);
    } else {
      ctx.reply("It seems you haven't set a location yet. Use /setlocation to update it.");
    }
  } catch (error) {
    console.error("Error fetching weather for /weather command:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

// Handle text input (city name)
bot.on("text", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  const cityName = ctx.message.text;

  if (!telegramId || !cityName) return;

  try {
    const response = await axios.get(
      "http://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: cityName,
          limit: 1,
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    const data = response.data[0];
    if (!data) {
      ctx.reply("City not found. Please try again with a different name.");
      return;
    }

    const { lat, lon } = data;

    await User.findOneAndUpdate(
      { telegramId },
      { location: { latitude: lat, longitude: lon } },
      { upsert: true }
    );

    ctx.reply(`Your location has been updated to ${cityName}!`);

    // Fetch and send weather update
    const weatherMessage = await fetchWeather(lat, lon);
    ctx.reply(weatherMessage);
  } catch (error) {
    console.error("Error fetching city coordinates:", error);
    ctx.reply("An error occurred while processing your request. Please try again.");
  }
});

// Handle location input (GPS coordinates)
bot.on("location", async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  const location = ctx.message.location;

  if (!telegramId || !location) return;

  try {
    await User.findOneAndUpdate(
      { telegramId },
      { location: { latitude: location.latitude, longitude: location.longitude } },
      { upsert: true }
    );

    ctx.reply("Your location has been updated!");

    // Fetch and send weather update
    const weatherMessage = await fetchWeather(location.latitude, location.longitude);
    ctx.reply(weatherMessage);
  } catch (error) {
    console.error("Error updating location:", error);
    ctx.reply("An error occurred while saving your location.");
  }
});

export default bot;
