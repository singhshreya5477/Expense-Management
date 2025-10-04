const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const companyController = require('../controllers/companyController');

router.use(protect);

router.get('/currencies', companyController.getCurrencies);
router.get('/my-company', companyController.getMyCompany);
router.put('/my-company', authorize('Admin'), companyController.updateMyCompany);

module.exports = router;
