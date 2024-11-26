import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  telegramId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  preferences: {
    language: string;
    units: string; 
  };
  subscribed: boolean;
}

const UserSchema: Schema = new Schema({
  telegramId: { type: String, required: true, unique: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  preferences: {
    language: { type: String, default: "en" },
    units: { type: String, default: "metric" },
  },
  subscribed: { type: Boolean, default: true },
});

export default mongoose.model<IUser>("User", UserSchema);
