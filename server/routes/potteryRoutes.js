import express from 'express';
import {
  getPotteryOptions,
  createPotteryRequest,
  getMyPotteryRequests,
  updatePotteryRequest,
  cancelPotteryRequest
} from '../controllers/potteryController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

// Options endpoint
router.get('/options', getPotteryOptions);

// Customer endpoints
router.post('/', authenticate, requireCustomer, createPotteryRequest);
router.get('/my', authenticate, requireCustomer, getMyPotteryRequests);
router.patch('/:id', authenticate, requireCustomer, updatePotteryRequest);
router.patch('/:id/cancel', authenticate, requireCustomer, cancelPotteryRequest);

export default router;
