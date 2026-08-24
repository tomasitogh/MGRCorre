import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export async function getNextSequence(name: string): Promise<number> {
  const Counter = mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
