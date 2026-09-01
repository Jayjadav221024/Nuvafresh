import express from 'express';
import {
  getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog,
  getPublications, createPublication, updatePublication, deletePublication
} from '../controllers/blogController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/* Publications first — "/publications" would otherwise be read as a slug. */
router.route('/publications')
  .get(getPublications)
  .post(protect, requireAdmin, createPublication);

router.route('/publications/:id')
  .put(protect, requireAdmin, updatePublication)
  .delete(protect, requireAdmin, deletePublication);

router.route('/')
  .get(getBlogs)
  .post(protect, requireAdmin, createBlog);

router.route('/:id')
  .get(getBlogBySlug)
  .put(protect, requireAdmin, updateBlog)
  .delete(protect, requireAdmin, deleteBlog);

export default router;
