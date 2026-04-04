const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  getPages,
  getPageBySlug,
  getSectionsByPageSlug,
  getItemsBySectionId,
  getAllSettings,
  upsertPage,
  upsertSection,
  upsertItem,
  toggleItem,
  moveItem,
  deleteItem,
  saveMedia,
  upsertSetting,
} = require('../../services/cms/cmsService');

const uploadBase = path.join(__dirname, '..', '..', 'uploads', 'cms');
fs.mkdirSync(uploadBase, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = String(req.body.folder || 'general').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'general';
    const fullDir = path.join(uploadBase, folder);
    fs.mkdirSync(fullDir, { recursive: true });
    req._cmsFolder = folder;
    cb(null, fullDir);
  },
  filename: (req, file, cb) => {
    const baseName = path.basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'asset';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imágenes.'));
    cb(null, true);
  },
}).single('image');

async function listPages(_, res) {
  try {
    const pages = await getPages();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener páginas', error: error.message });
  }
}

async function pageDetail(req, res) {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ message: 'Página no encontrada' });

    const sections = await getSectionsByPageSlug(req.params.slug, true);
    const settings = await getAllSettings();
    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => ({
        ...section,
        items: await getItemsBySectionId(section.id, true),
      }))
    );

    res.json({ page, sections: sectionsWithItems, settings });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle de página', error: error.message });
  }
}

async function savePage(req, res) {
  try {
    const page = await upsertPage(req.body);
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar página', error: error.message });
  }
}

async function saveSection(req, res) {
  try {
    const section = await upsertSection(req.body);
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar sección', error: error.message });
  }
}

async function saveItem(req, res) {
  try {
    const payload = { ...req.body };
    if (typeof payload.extra_json === 'string') {
      payload.extra_json = payload.extra_json ? JSON.parse(payload.extra_json) : {};
    }
    const item = await upsertItem(payload);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar ítem', error: error.message });
  }
}

async function removeItem(req, res) {
  try {
    await deleteItem(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar ítem', error: error.message });
  }
}

async function toggleCmsItem(req, res) {
  try {
    const item = await toggleItem(req.params.id);
    if (!item) return res.status(404).json({ message: 'Ítem no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado del ítem', error: error.message });
  }
}

async function moveCmsItem(req, res) {
  try {
    const direction = req.body.direction === 'down' ? 'down' : 'up';
    const item = await moveItem(req.params.id, direction);
    if (!item) return res.status(404).json({ message: 'Ítem no encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error al mover ítem', error: error.message });
  }
}

async function uploadCmsMedia(req, res) {
  upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || 'Error al subir imagen' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Debes seleccionar una imagen.' });
    }
    try {
      const folder = req._cmsFolder || 'general';
      const fileUrl = `/uploads/cms/${folder}/${req.file.filename}`;
      const media = await saveMedia({
        fileName: req.file.filename,
        fileUrl,
        fileType: req.file.mimetype,
        altText: req.body.alt_text || '',
        title: req.body.title || req.file.originalname,
        folder,
      });
      res.json({ ok: true, file_url: fileUrl, media });
    } catch (saveError) {
      res.status(500).json({ message: 'Error al registrar imagen', error: saveError.message });
    }
  });
}

async function listSettings(_, res) {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener settings', error: error.message });
  }
}

async function saveSetting(req, res) {
  try {
    const { setting_value, setting_group = 'general', is_public = true } = req.body;
    const setting = await upsertSetting(req.params.key, setting_value, setting_group, is_public);
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar setting', error: error.message });
  }
}

module.exports = {
  listPages,
  pageDetail,
  savePage,
  saveSection,
  saveItem,
  removeItem,
  toggleCmsItem,
  moveCmsItem,
  uploadCmsMedia,
  listSettings,
  saveSetting,
};
