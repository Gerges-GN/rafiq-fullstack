const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/Report');

router.post('/generate', reportController.generateReport);
router.delete('/:id', reportController.deleteReport);
router.get('/:date', reportController.getReportByDate);
router.get('/', reportController.getReports);

module.exports = router;