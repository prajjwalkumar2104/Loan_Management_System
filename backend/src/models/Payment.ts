import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  loan: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  date: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    utrNumber: { type: String, required: true, unique: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);