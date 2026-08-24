import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRunner extends Document {
  runnerNumber: number;
  name: string;
  dni: string;
  age: number;
  raceType: "500m" | "3k" | "7k";
  raceCategory?: "15-30" | "30-40" | "40-50+";
  shirtSize: string;
  orderId: mongoose.Types.ObjectId;
}

const RunnerSchema = new Schema<IRunner>({
  runnerNumber: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  dni: { type: String, required: true, index: true },
  age: { type: Number, required: true },
  raceType: { type: String, required: true, enum: ["500m", "3k", "7k"] },
  raceCategory: { type: String, enum: ["15-30", "30-40", "40-50+"], default: undefined },
  shirtSize: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
});

export const Runner: Model<IRunner> =
  mongoose.models.Runner || mongoose.model("Runner", RunnerSchema);
