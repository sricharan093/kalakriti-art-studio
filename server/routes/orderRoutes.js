import express from 'express';
import { createOrder, getMyOrders, cancelOrder } from '../controllers/orderController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireCustomer);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.patch('/:id/cancel', cancelOrder);

export default router;
