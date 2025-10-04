const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const approvalRuleController = require('../controllers/approvalRuleController');

router.use(protect);
router.use(authorize('Admin'));

router.post('/', approvalRuleController.createApprovalRule);
router.get('/', approvalRuleController.getApprovalRules);
router.get('/:id', approvalRuleController.getApprovalRule);
router.put('/:id', approvalRuleController.updateApprovalRule);
router.delete('/:id', approvalRuleController.deleteApprovalRule);

module.exports = router;
