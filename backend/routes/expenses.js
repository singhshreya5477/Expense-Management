const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const expenseController = require('../controllers/expenseController');
const { validate, expenseValidation } = require('../middleware/validator');

router.use(protect);

router.post('/', validate(expenseValidation.create), expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/my-expenses', expenseController.getMyExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', validate(expenseValidation.update), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
