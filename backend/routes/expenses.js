const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');
const { validate, expenseValidation } = require('../middleware/validator');
const AppError = require('../utils/AppError');

// Multer configuration for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new AppError('Only image files (JPEG, PNG) and PDF are allowed', 400));
  }
});

router.use(protect);

router.post('/', upload.single('receipt'), validate(expenseValidation.create), expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/my-expenses', expenseController.getMyExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', validate(expenseValidation.update), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
