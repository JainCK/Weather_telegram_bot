import schedule from "node-schedule";
import User from "../models/user";
import fetchWeather from "../utils/weather";
import bot from "./bot";

const scheduleWeatherUpdates = () => {
  schedule.scheduleJob("0 * * * *", async () => {
    const users = await User.find({ subscribed: true });
    for (const user of users) {
      const weather = await fetchWeather(user.location, user.preferences);
      if (weather) {
        const { description, temp } = weather;
        bot.telegram.sendMessage(
          user.telegramId,
          `Scheduled Weather Update:\n${description}, ${temp}°C`
        );
      }
    }
  });
};

export default scheduleWeatherUpdates;
