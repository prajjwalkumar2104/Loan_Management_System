import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  SANCTION = 'SANCTION',
  DISBURSEMENT = 'DISBURSEMENT',
  COLLECTION = 'COLLECTION',
  BORROWER = 'BORROWER',
}

export interface IUser extends Document {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    fullName: { type: String, required: true, trim: true },
  },
  { 
    timestamps: true,
    toJSON: {
      // FIX: Cast 'ret' to 'any' so TypeScript allows the delete keyword
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
      },
    },
  }
);

// FIX: Remove 'next' and just use standard async/await. Mongoose handles the Promise automatically.
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);