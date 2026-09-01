import express from 'express';
import {
  getCollections,
  getCollectionByHandle,
  createCollection,
  updateCollection,
  deleteCollection,
  updateCollectionProducts
} from '../controllers/collectionController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public reads — the storefront collection index and collection pages.
router.get('/', getCollections);
router.get('/:handle', getCollectionByHandle);

// Admin writes.
router.post('/', protect, requireAdmin, createCollection);
router.put('/:id', protect, requireAdmin, updateCollection);
router.delete('/:id', protect, requireAdmin, deleteCollection);
router.post('/:id/products', protect, requireAdmin, updateCollectionProducts);

export default router;
