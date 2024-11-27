import express from "express";
import dotenv from "dotenv";
import bot from "./bot/bot";
import connectDB from "./config/db";
import scheduleWeatherUpdates from "./bot/scheduler";
import adminRoutes from "./routes/adminRoute";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for JSON parsing
app.use(express.json());

// Admin routes
app.use("/admin", adminRoutes);

// Connect to MongoDB
connectDB(process.env.MONGO_URI!);

// Launch the Telegram bot
try {
  bot.launch();
  console.log("Telegram bot launched successfully.");
} catch (error) {
  console.error("Error launching Telegram bot:", error);
}

// Schedule weather updates
scheduleWeatherUpdates();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await bot.stop("SIGINT");
  process.exit(0);
});
