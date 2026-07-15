const express = require('express');
const multer = require('multer');
const exportController = require('../controllers/export.controller');
const authenticate = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const router = express.Router();
router.use(authenticate);

router.get('/incomes', exportController.exportIncomes);
router.get('/expenses', exportController.exportExpenses);
router.post('/expenses/import', upload.single('file'), exportController.importExpenses);

module.exports = router;
