import { Router } from 'express';
import { applyLoan, getDashboardLoans, updateLoanStatus, recordPayment } from '../controllers/loanController';
import { protect, authorize } from '../middlewares/authMiddleware';
import { UserRole } from '../models/User';

const router = Router();

// All loan routes require authentication
router.use(protect);

// Borrower application (Only Borrowers)
router.post('/apply', authorize(UserRole.BORROWER), applyLoan);

// Dashboard fetching (All Execs + Admin)
router.get('/dashboard', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.SANCTION, UserRole.DISBURSEMENT, UserRole.COLLECTION), getDashboardLoans);

// Status updates (Sanction, Disbursement, Admin)
router.patch('/:id/status', authorize(UserRole.ADMIN, UserRole.SANCTION, UserRole.DISBURSEMENT), updateLoanStatus);

// Collection Payments (Collection, Admin)
router.post('/:id/payment', authorize(UserRole.ADMIN, UserRole.COLLECTION), recordPayment);

export default router;