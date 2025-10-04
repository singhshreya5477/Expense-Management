const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const approvalController = require('../controllers/approvalController');

router.use(protect);
router.use(authorize('Manager', 'Admin'));

router.get('/pending', approvalController.getPendingApprovals);
router.post('/:requestId/approve', approvalController.approveExpense);
router.post('/:requestId/reject', approvalController.rejectExpense);

module.exports = router;
