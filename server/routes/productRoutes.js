import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, requireAdmin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, requireAdmin, updateProduct)
  .delete(protect, requireAdmin, deleteProduct);

export default router;
