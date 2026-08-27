import express from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, requireAdmin, createBlog);

router.route('/:id')
  .get(getBlogBySlug)
  .put(protect, requireAdmin, updateBlog)
  .delete(protect, requireAdmin, deleteBlog);

export default router;
