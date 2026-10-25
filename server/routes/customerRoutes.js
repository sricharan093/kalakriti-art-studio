import express from 'express';
import { getCustomerStats } from '../controllers/statsController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, requireCustomer, getCustomerStats);

export default router;
