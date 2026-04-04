const cmsService = require('../../services/cms/cmsService');

async function getPage(req, res) {
  try {
    const payload = await cmsService.getPagePayload(req.params.slug);
    if (!payload) return res.status(404).json({ message: 'Página CMS no encontrada' });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener página CMS', error: error.message });
  }
}

async function getSettings(_, res) {
  try {
    const settings = await cmsService.getPublicSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener settings públicos', error: error.message });
  }
}

module.exports = { getPage, getSettings };
