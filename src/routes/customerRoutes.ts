import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
  uptadeCustomerInformation,
  deleteCustomerById,
  getCustomerById,
} from '../controllers/customerController';
const router = Router();

// Public routes
router.post('/create', authMiddleware, createCustomer);
router.put('/update/:id', authMiddleware, updateCustomer);
router.delete('/delete', authMiddleware, deleteCustomer);

// Admin routes
router.get('/get', authMiddleware, adminMiddleware, getAllCustomers);
router.get('/get/:id', authMiddleware, adminMiddleware, getCustomerById);
router.put('/update/:id', authMiddleware, adminMiddleware, uptadeCustomerInformation);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deleteCustomerById);

export default router;
