const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const {
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
} = require('../controllers/cms/adminController');

const router = express.Router();
router.use(authAdmin);

router.get('/pages', listPages);
router.get('/pages/:slug', pageDetail);
router.post('/pages', savePage);
router.put('/pages/:id', savePage);

router.post('/sections', saveSection);
router.put('/sections/:id', saveSection);

router.post('/items', saveItem);
router.put('/items/:id', saveItem);
router.delete('/items/:id', removeItem);
router.patch('/items/:id/toggle', toggleCmsItem);
router.patch('/items/:id/move', moveCmsItem);

router.post('/media/upload', uploadCmsMedia);

router.get('/settings', listSettings);
router.put('/settings/:key', saveSetting);

module.exports = router;
