import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import {
  register,
  login,
  googleLogin,
  getCurrentUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUserById,
} from '../controllers/authController';
const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/profile', authMiddleware, getCurrentUser);
router.put('/update', authMiddleware, updateUser);
router.delete('/delete', authMiddleware, deleteUser);

// Admin routes
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.put('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.delete('/users/:id', authMiddleware,adminMiddleware, deleteUserById);

export default router;