import express from "express";
import dotenv from "dotenv";
import bot from "./bot/bot";
import connectDB from "./config/db";
import scheduleWeatherUpdates from "./bot/scheduler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB(process.env.MONGO_URI!);
bot.launch();
scheduleWeatherUpdates();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
