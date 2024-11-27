import mongoose from "mongoose";
import Admin from "./src/models/admin";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  const username = "admin"; // Replace with desired username
  const password = "password123"; // Replace with desired password


  try {
    const mongoUri = process.env.MONGO_URI!;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as mongoose.ConnectOptions);

    const adminExists = await Admin.findOne({ username });
    if (adminExists) {
      console.log("Admin already exists!");
      return;
    }

    const newAdmin = new Admin({ username, password });
    await newAdmin.save();

    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
