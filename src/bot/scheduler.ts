import schedule from "node-schedule";
import User from "../models/user";
import fetchWeather from "../utils/weather";
import bot from "./bot";

const scheduleWeatherUpdates = () => {
  schedule.scheduleJob("0 * * * *", async () => {
    const users = await User.find({ subscribed: true });
    for (const user of users) {
      const weatherData = await fetchWeather(user.location, user.preferences);
      if (weatherData) {
        bot.telegram.sendMessage(
          user.telegramId,
          `Current weather:\nTemperature: ${weatherData.temp}°C\nDescription: ${weatherData.description}`
        );
      }
    }
  });
};

export default scheduleWeatherUpdates;
