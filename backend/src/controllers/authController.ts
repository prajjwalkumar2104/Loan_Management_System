import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User';
import { generateToken } from '../utils/generateToken';

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists with this email.' });
      return;
    }

    // Default new registrations to BORROWER role
    const user = await User.create({
      fullName,
      email,
      passwordHash: password, // The pre-save hook in User.ts will hash this
      role: UserRole.BORROWER,
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};