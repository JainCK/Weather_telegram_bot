import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface AdminDocument extends Document {
  username: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema<AdminDocument> = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model<AdminDocument>("Admin", AdminSchema);
