const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(protect);

router.post('/', authorize('Admin'), userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.put('/:id', authorize('Admin'), userController.updateUser);
router.put('/:id/role', authorize('Admin'), userController.updateUserRole);
router.put('/:id/manager', authorize('Admin'), userController.assignManager);
router.delete('/:id', authorize('Admin'), userController.deleteUser);

module.exports = router;
