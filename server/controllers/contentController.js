import Menu from '../models/Menu.js';
import { MetaobjectDefinition, MetaobjectEntry } from '../models/Metaobject.js';

/* ═══════════════════════════════════════════════════════════════════
   MENUS
   The default set mirrors what the Nuva storefront links to today, so
   the first time this screen is opened it shows the real navigation
   rather than an empty list somebody has to retype.
═══════════════════════════════════════════════════════════════════ */
const DEFAULT_MENUS = [
  {
    _id: 'menu-main',
    title: 'Main menu',
    handle: 'main-menu',
    items: [
      { title: 'Shop', url: '/shop', items: [] },
      { title: 'Collections', url: '/collections', items: [] },
      {
        title: 'About',
        url: '/our-story',
        items: [
          { title: 'Our Story', url: '/our-story' },
          { title: 'CSR Initiatives', url: '/csr-initiatives' },
          { title: 'Ozone Shield', url: '/ozone-shield' }
        ]
      },
      { title: 'B2B / Wholesale', url: '/b2b', items: [] },
      { title: 'Blog', url: '/blog', items: [] },
      { title: 'Contact', url: '/contact-us', items: [] }
    ]
  },
  {
    _id: 'menu-footer-pages',
    title: 'Footer pages',
    handle: 'footer-pages',
    items: [
      { title: 'Our Story', url: '/our-story', items: [] },
      { title: 'B2B & Commercial', url: '/b2b', items: [] },
      { title: 'CSR Initiatives', url: '/csr-initiatives', items: [] },
      { title: 'Ozone Shield', url: '/ozone-shield', items: [] },
      { title: 'Frequently Asked Questions (FAQs)', url: '/faqs', items: [] },
      { title: 'Blogs & Research', url: '/blogs', items: [] },
      { title: 'Contact Us', url: '/contact-us', items: [] },
      { title: 'Track Order', url: '/track-order', items: [] }
    ]
  }
];

let IN_MEMORY_MENUS = DEFAULT_MENUS.map((m) => ({ ...m }));

const normaliseItems = (items = []) =>
  items
    .filter((i) => String(i?.title || '').trim())
    .map((i) => ({
      title: String(i.title).trim(),
      url: String(i.url || '/').trim() || '/',
      items: (i.items || [])
        .filter((c) => String(c?.title || '').trim())
        .map((c) => ({ title: String(c.title).trim(), url: String(c.url || '/').trim() || '/' }))
    }));

export const getMenus = async (req, res) => {
  try {
    let menus = [];
    try {
      menus = await Menu.find().sort({ title: 1 }).lean();
    } catch (e) { /* database offline */ }

    /* The defaults are seeded on first read, not just returned, so editing
       one persists instead of silently reverting on the next load. */
    if (menus.length === 0) {
      try {
        menus = (await Menu.insertMany(DEFAULT_MENUS.map(({ _id, ...m }) => m))).map((m) => m.toObject());
      } catch (e) {
        menus = IN_MEMORY_MENUS;
      }
    }

    res.json({ success: true, menus });
  } catch (e) {
    res.json({ success: true, menus: IN_MEMORY_MENUS });
  }
};

export const getMenuByHandle = async (req, res) => {
  try {
    const { handle } = req.params;
    try {
      const menu = await Menu.findOne({ handle }).lean();
      if (menu) return res.json({ success: true, menu });
    } catch (e) { /* database offline */ }

    const fallback = IN_MEMORY_MENUS.find((m) => m.handle === handle)
      || DEFAULT_MENUS.find((m) => m.handle === handle);
    if (!fallback) return res.status(404).json({ success: false, message: 'Menu not found' });
    res.json({ success: true, menu: fallback });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createMenu = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ success: false, message: 'A menu needs a title.' });

    const record = { title, items: normaliseItems(req.body.items) };

    try {
      const created = await Menu.create(record);
      return res.status(201).json({ success: true, menu: created.toObject() });
    } catch (e) {
      if (e?.code === 11000) {
        return res.status(400).json({ success: false, message: 'A menu with that handle already exists.' });
      }
    }

    const fallback = {
      _id: `menu-${Date.now()}`,
      handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...record
    };
    IN_MEMORY_MENUS.unshift(fallback);
    res.status(201).json({ success: true, menu: fallback });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = String(req.body.title).trim();
    if (req.body.items !== undefined) updates.items = normaliseItems(req.body.items);

    try {
      const updated = await Menu.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (updated) return res.json({ success: true, menu: updated.toObject() });
    } catch (e) { /* not an ObjectId, or database offline */ }

    const index = IN_MEMORY_MENUS.findIndex((m) => m._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Menu not found' });
    IN_MEMORY_MENUS[index] = { ...IN_MEMORY_MENUS[index], ...updates };
    res.json({ success: true, menu: IN_MEMORY_MENUS[index] });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    try {
      await Menu.findByIdAndDelete(req.params.id);
    } catch (e) { /* not an ObjectId, or database offline */ }
    IN_MEMORY_MENUS = IN_MEMORY_MENUS.filter((m) => m._id !== req.params.id);
    res.json({ success: true, message: 'Menu removed' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   METAOBJECTS
═══════════════════════════════════════════════════════════════════ */
export const getDefinitions = async (req, res) => {
  try {
    let definitions = [];
    try {
      definitions = await MetaobjectDefinition.find().sort({ name: 1 }).lean();
    } catch (e) { /* database offline */ }

    // Entry counts, so the list says how much content each type holds.
    const counts = new Map();
    try {
      for (const e of await MetaobjectEntry.find().select('definitionHandle').lean()) {
        counts.set(e.definitionHandle, (counts.get(e.definitionHandle) || 0) + 1);
      }
    } catch (e) { /* database offline */ }

    res.json({
      success: true,
      definitions: definitions.map((d) => ({ ...d, entryCount: counts.get(d.handle) || 0 }))
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

const normaliseFields = (fields = []) =>
  fields
    .filter((f) => String(f?.label || '').trim())
    .map((f) => ({
      key: String(f.key || f.label).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      label: String(f.label).trim(),
      type: f.type || 'single_line_text',
      list: Boolean(f.list),
      required: Boolean(f.required),
      description: f.description || ''
    }));

const normaliseOptions = (options = {}) => ({
  activeDraftStatus: options.activeDraftStatus !== false,
  publishAsWebPage: Boolean(options.publishAsWebPage),
  storefrontApiAccess: options.storefrontApiAccess !== false
});

export const getDefinitionByHandle = async (req, res) => {
  try {
    const definition = await MetaobjectDefinition.findOne({ handle: req.params.handle }).lean();
    if (!definition) return res.status(404).json({ success: false, message: 'Type not found' });
    res.json({ success: true, definition });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createDefinition = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'Give the type a name.' });

    const fields = normaliseFields(req.body.fields);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Add at least one field.' });
    }

    const created = await MetaobjectDefinition.create({
      name,
      description: req.body.description || '',
      displayField: req.body.displayField || fields[0].key,
      fields,
      options: normaliseOptions(req.body.options)
    });
    res.status(201).json({ success: true, definition: created.toObject() });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(400).json({ success: false, message: 'A type with that handle already exists.' });
    }
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateDefinition = async (req, res) => {
  try {
    const updates = {};
    ['name', 'description', 'displayField'].forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });
    if (req.body.fields) updates.fields = normaliseFields(req.body.fields);
    if (req.body.options) updates.options = normaliseOptions(req.body.options);

    const updated = await MetaobjectDefinition.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Type not found' });
    res.json({ success: true, definition: updated.toObject() });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteDefinition = async (req, res) => {
  try {
    const definition = await MetaobjectDefinition.findById(req.params.id);
    if (!definition) return res.status(404).json({ success: false, message: 'Type not found' });

    // Deleting a type must not orphan the entries filed under it.
    const entryCount = await MetaobjectEntry.countDocuments({ definitionHandle: definition.handle });
    if (entryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Delete the ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} in "${definition.name}" first.`
      });
    }

    await definition.deleteOne();
    res.json({ success: true, message: 'Type removed' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getEntries = async (req, res) => {
  try {
    const { handle } = req.params;
    const definition = await MetaobjectDefinition.findOne({ handle }).lean();
    if (!definition) return res.status(404).json({ success: false, message: 'Type not found' });

    /* The two options that actually gate this response. An admin request
       always sees everything — the toggles describe what the *storefront*
       is allowed to read, not what the merchant can manage. */
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && definition.options?.storefrontApiAccess === false) {
      return res.status(403).json({ success: false, message: 'This type is not exposed to the storefront.' });
    }

    const query = { definitionHandle: handle };
    if (!isAdmin && definition.options?.activeDraftStatus !== false) query.status = 'Active';

    const entries = await MetaobjectEntry.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, definition, entries });
  } catch (e) {
    res.json({ success: true, entries: [] });
  }
};

/* One entry by handle — what a published entry's web page reads. */
export const getEntryByHandle = async (req, res) => {
  try {
    const { handle, entryHandle } = req.params;
    const definition = await MetaobjectDefinition.findOne({ handle }).lean();
    if (!definition) return res.status(404).json({ success: false, message: 'Type not found' });

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && definition.options?.storefrontApiAccess === false) {
      return res.status(403).json({ success: false, message: 'This type is not exposed to the storefront.' });
    }
    if (!isAdmin && definition.options?.publishAsWebPage !== true) {
      return res.status(404).json({ success: false, message: 'This type does not publish entries as pages.' });
    }

    const entry = await MetaobjectEntry.findOne({ definitionHandle: handle, handle: entryHandle }).lean();
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    if (!isAdmin && definition.options?.activeDraftStatus !== false && entry.status !== 'Active') {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    res.json({ success: true, definition, entry });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const saveEntry = async (req, res) => {
  try {
    const { handle } = req.params;
    const definition = await MetaobjectDefinition.findOne({ handle });
    if (!definition) return res.status(404).json({ success: false, message: 'Type not found' });

    const isBlank = (v) =>
      v === undefined || v === null || v === '' || (Array.isArray(v) && v.filter((x) => x !== '').length === 0);

    const fields = {};
    for (const field of definition.fields) {
      let value = req.body.fields?.[field.key];

      // A list field always stores an array, whatever arrived.
      if (field.list) {
        value = (Array.isArray(value) ? value : [value])
          .filter((v) => v !== undefined && v !== null && v !== '');
      }

      if (field.required && isBlank(value)) {
        return res.status(400).json({ success: false, message: `"${field.label}" is required.` });
      }
      fields[field.key] = value ?? (field.list ? [] : '');
    }

    const displayValue = fields[definition.displayField];
    const display = String(Array.isArray(displayValue) ? displayValue[0] || '' : displayValue || '').trim();
    const entryHandle = String(req.body.handle || display || `entry-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (req.body._id) {
      const updated = await MetaobjectEntry.findByIdAndUpdate(
        req.body._id,
        { fields, handle: entryHandle, status: req.body.status || 'Active' },
        { new: true }
      );
      if (updated) return res.json({ success: true, entry: updated.toObject() });
    }

    const created = await MetaobjectEntry.create({
      definitionHandle: handle,
      handle: entryHandle,
      status: req.body.status || 'Active',
      fields
    });
    res.status(201).json({ success: true, entry: created.toObject() });
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(400).json({ success: false, message: 'An entry with that handle already exists.' });
    }
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    await MetaobjectEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entry removed' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
