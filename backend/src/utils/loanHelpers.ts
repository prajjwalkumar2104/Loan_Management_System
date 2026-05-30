import { EmploymentMode } from '../models/Loan';

export const calculateAge = (dob: string | Date): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const runBRE = (
  dob: string | Date,
  salary: number,
  pan: string,
  employmentMode: EmploymentMode
): { passed: boolean; reason?: string } => {
  
  const age = calculateAge(dob);
  if (age < 23 || age > 50) return { passed: false, reason: 'Age must be between 23 and 50' };
  
  if (salary < 25000) return { passed: false, reason: 'Salary must be at least 25,000/month' };
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) return { passed: false, reason: 'Invalid PAN format' };
  
  if (employmentMode === EmploymentMode.UNEMPLOYED) return { passed: false, reason: 'Applicant is Unemployed' };

  return { passed: true };
};

export const calculateLoanDetails = (amount: number, tenureDays: number) => {
  const rate = 12; // 12% p.a. fixed
  // SI = (P x R x T) / (365 x 100)
  const simpleInterest = (amount * rate * tenureDays) / (365 * 100);
  const totalRepayment = amount + simpleInterest;
  
  // Return rounded to 2 decimal places for clean currency formatting
  return {
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};