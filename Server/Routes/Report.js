const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/Report');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.use(verifyToken, requireRole('admin'));

router.post('/generate', reportController.generateReport);
router.delete('/:id', reportController.deleteReport);
router.get('/:date', reportController.getReportByDate);
router.get('/', reportController.getReports);

module.exports = router;
