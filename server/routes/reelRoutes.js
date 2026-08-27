import express from 'express';
import { getReels, createReel, updateReel, deleteReel } from '../controllers/reelController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getReels)
  .post(protect, requireAdmin, createReel);

router.route('/:id')
  .put(protect, requireAdmin, updateReel)
  .delete(protect, requireAdmin, deleteReel);

export default router;
