// models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
