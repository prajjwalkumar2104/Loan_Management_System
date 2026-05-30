import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import connectDB from './config/db';
import User, { UserRole } from './models/User';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Edge case: Wipe existing users to prevent 'E11000 duplicate key error' on email
    await User.deleteMany({});
    console.log('Wiped existing users collection.');

    const rawPassword = 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const usersToSeed = [
      { fullName: 'System Administrator', email: 'admin@lms.com', passwordHash, role: UserRole.ADMIN },
      { fullName: 'Sarah Sales', email: 'sales@lms.com', passwordHash, role: UserRole.SALES },
      { fullName: 'Sam Sanction', email: 'sanction@lms.com', passwordHash, role: UserRole.SANCTION },
      { fullName: 'Dave Disbursement', email: 'disbursement@lms.com', passwordHash, role: UserRole.DISBURSEMENT },
      { fullName: 'Chloe Collection', email: 'collection@lms.com', passwordHash, role: UserRole.COLLECTION },
      { fullName: 'Bob Borrower', email: 'borrower@lms.com', passwordHash, role: UserRole.BORROWER },
    ];

    const createdUsers = await User.insertMany(usersToSeed as any);
    console.log(`\nSuccessfully seeded ${createdUsers.length} users!`);
    
    console.log('\n--- 🧪 TEST CREDENTIALS ---');
    console.log(`Password for all accounts: ${rawPassword}\n`);
    
    createdUsers.forEach(user => {
      // Utilizing the structured id for clear logging
      console.log(`Role: ${user.role.padEnd(12)} | Email: ${user.email.padEnd(22)} | id: ${user.id}`);
    });

    console.log('\nSeed complete. Exiting gracefully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();