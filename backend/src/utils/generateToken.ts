import jwt from 'jsonwebtoken';

export const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '1d', // 24 hours is standard for enterprise apps
  });
};