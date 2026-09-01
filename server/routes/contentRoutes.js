import express from 'express';
import {
  getMenus, getMenuByHandle, createMenu, updateMenu, deleteMenu,
  getDefinitions, getDefinitionByHandle, createDefinition, updateDefinition, deleteDefinition,
  getEntries, getEntryByHandle, saveEntry, deleteEntry
} from '../controllers/contentController.js';
import { protect, requireAdmin, attachUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

/* ── Menus ──
   Reads are public: the storefront renders its own navigation from them. */
router.get('/menus', getMenus);
router.get('/menus/:handle', getMenuByHandle);
router.post('/menus', protect, requireAdmin, createMenu);
router.put('/menus/:id', protect, requireAdmin, updateMenu);
router.delete('/menus/:id', protect, requireAdmin, deleteMenu);

/* ── Metaobjects ──
   Definitions and their entries. Reads are public so the storefront can
   render whatever content types the store defines. */
router.get('/metaobjects', getDefinitions);
router.post('/metaobjects', protect, requireAdmin, createDefinition);

/* Entry routes before "/:id", or "definitions" and "entries" would be read
   as definition ids. */
router.delete('/metaobjects/entries/:id', protect, requireAdmin, deleteEntry);
router.get('/metaobjects/definition/:handle', getDefinitionByHandle);

/* attachUser, not protect: the storefront reads these anonymously, while a
   signed-in admin also sees drafts and types held back from the shop. */
router.get('/metaobjects/:handle/entries', attachUser, getEntries);
router.post('/metaobjects/:handle/entries', protect, requireAdmin, saveEntry);
router.get('/metaobjects/:handle/entries/:entryHandle', attachUser, getEntryByHandle);

router.put('/metaobjects/:id', protect, requireAdmin, updateDefinition);
router.delete('/metaobjects/:id', protect, requireAdmin, deleteDefinition);

export default router;
