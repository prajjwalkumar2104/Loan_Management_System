import { Request, Response, NextFunction } from 'express';
import Loan, { LoanStatus, EmploymentMode } from '../models/Loan';
import Payment from '../models/Payment';
import { AuthRequest } from '../middlewares/authMiddleware';
import { runBRE, calculateLoanDetails } from '../utils/loanHelpers';
import { UserRole } from '../models/User';

// 1. BORROWER: Apply for a loan
export const applyLoan = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, tenureDays, pan, salary, employmentMode, dob, salarySlipUrl } = req.body;
    const borrowerId = req.user?.id;

    // Run Server-Side BRE
    const breResult = runBRE(dob, salary, pan, employmentMode);
    if (!breResult.passed) {
      res.status(400).json({ success: false, message: `BRE Failed: ${breResult.reason}` });
      return;
    }

    const { totalRepayment } = calculateLoanDetails(amount, tenureDays);

    const loan = await Loan.create({
      borrower: borrowerId,
      amount,
      tenureDays,
      totalRepayment,
      pan,
      salary,
      dob,
      employmentMode,
      salarySlipUrl,
      status: LoanStatus.APPLIED, // Skips LEAD, goes straight to APPLIED
    });

    res.status(201).json({ success: true, loan });
  } catch (error) {
    next(error);
  }
};

// 2. EXECUTIVES: Get Loans based on their role
export const getDashboardLoans = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user?.role;
    let query = {};

    // Filter data based on RBAC requirement
    if (role === UserRole.SALES) query = { status: LoanStatus.LEAD };
    else if (role === UserRole.SANCTION) query = { status: LoanStatus.APPLIED };
    else if (role === UserRole.DISBURSEMENT) query = { status: LoanStatus.SANCTIONED };
    else if (role === UserRole.COLLECTION) query = { status: LoanStatus.DISBURSED };
    // ADMIN sees everything (query remains empty)

    const loans = await Loan.find(query).populate('borrower', 'fullName email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: loans.length, loans });
  } catch (error) {
    next(error);
  }
};

// 3. SANCTION & DISBURSEMENT: Update Status
export const updateLoanStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    // In a real app, you'd add strict checks here to ensure SANCTION can only set SANCTIONED/REJECTED, etc.
    const loan = await Loan.findByIdAndUpdate(
      id,
      { status, rejectionReason },
      { new: true, runValidators: true }
    );

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found' });
      return;
    }

    res.status(200).json({ success: true, loan });
  } catch (error) {
    next(error);
  }
};

// 4. COLLECTION: Record Payment and Auto-Close
export const recordPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // Loan ID
    const { utrNumber, amount } = req.body;

    const loan = await Loan.findById(id);
    if (!loan || loan.status !== LoanStatus.DISBURSED) {
       res.status(400).json({ success: false, message: 'Loan not found or not disbursed yet.' });
       return;
    }

    // Attempt to create payment (Mongoose will throw error if UTR is duplicate)
    const payment = await Payment.create({ loan: id, utrNumber, amount });

    // Calculate total paid so far
    const allPayments = await Payment.find({ loan: id });
    const totalPaid = allPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Auto-Close logic
    if (loan.totalRepayment && totalPaid >= loan.totalRepayment) {
      loan.status = LoanStatus.CLOSED;
      await loan.save();
    }

    res.status(201).json({ 
      success: true, 
      payment, 
      totalPaid, 
      balance: loan.totalRepayment! - totalPaid,
      loanStatus: loan.status 
    });
  } catch (error: any) {
    // Gracefully catch duplicate UTR database error
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Duplicate UTR Number detected.' });
      return;
    }
    next(error);
  }
};