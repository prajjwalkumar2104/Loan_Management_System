import mongoose, { Document, Schema } from 'mongoose';

export enum LoanStatus {
  LEAD = 'LEAD',
  APPLIED = 'APPLIED',
  SANCTIONED = 'SANCTIONED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED',
}

export enum EmploymentMode {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
}

export interface ILoan extends Document {
  id: string;
  borrower: mongoose.Types.ObjectId;
  amount?: number;
  tenureDays?: number;
  totalRepayment?: number;
  status: LoanStatus;
  pan?: string;
  dob: { type: Date };
  salary?: number;
  employmentMode?: EmploymentMode;
  rejectionReason?: string;
  salarySlipUrl?: string;
}

const loanSchema = new Schema<ILoan>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, min: 50000, max: 500000 },
    tenureDays: { type: Number, min: 30, max: 365 },
    totalRepayment: { type: Number },
    status: { type: String, enum: Object.values(LoanStatus), default: LoanStatus.LEAD },
    pan: { type: String, uppercase: true, trim: true },
    dob: { type: Date },
    salary: { type: Number },
    employmentMode: { type: String, enum: Object.values(EmploymentMode) },
    rejectionReason: { type: String },
    salarySlipUrl: { type: String },
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

export default mongoose.models.Loan || mongoose.model<ILoan>('Loan', loanSchema);