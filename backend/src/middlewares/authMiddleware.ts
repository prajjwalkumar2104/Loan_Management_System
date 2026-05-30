import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request to include our User model
export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized to access this route. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    
    // Attach the user to the request object (excluding the password)
    const currentUser = await User.findById(decoded.id).select('-passwordHash');
    if (!currentUser) {
       res.status(401).json({ success: false, message: 'The user belonging to this token no longer exists.' });
       return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized. Token failed or expired.' });
  }
};

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
       // Return 403 Forbidden for unauthorized roles as required by standard REST practices
       res.status(403).json({ 
         success: false, 
         message: `User role ${req.user?.role} is not authorized to access this route.` 
       });
       return;
    }
    next();
  };
};