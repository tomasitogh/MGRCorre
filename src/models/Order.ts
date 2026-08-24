import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  phone: string;
  paymentMethod: "transferencia" | "efectivo";
  paymentReceiptUrl?: string;
  totalAmount: number;
  status: "en revisión" | "aprobado" | "rechazado";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  phone: { type: String, required: true },
  paymentMethod: { type: String, required: true, enum: ["transferencia", "efectivo"] },
  paymentReceiptUrl: { type: String },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["en revisión", "aprobado", "rechazado"],
    default: "en revisión",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
