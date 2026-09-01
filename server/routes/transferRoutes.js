import express from 'express';
import {
  getLocations,
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  receiveTransfer,
  deleteTransfer
} from '../controllers/transferController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Locations first — "/locations" would otherwise be read as a transfer id.
router.get('/locations', getLocations);

router.route('/')
  .get(getTransfers)
  .post(protect, requireAdmin, createTransfer);

router.route('/:id')
  .get(getTransferById)
  .put(protect, requireAdmin, updateTransfer)
  .delete(protect, requireAdmin, deleteTransfer);

router.post('/:id/receive', protect, requireAdmin, receiveTransfer);

export default router;
