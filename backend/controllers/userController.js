const { User } = require('../models');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, managerId, isManagerApprover } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'Employee',
      companyId: req.user.companyId,
      managerId: managerId || null,
      isManagerApprover: isManagerApprover || false
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        managerId: user.managerId,
        isManagerApprover: user.isManagerApprover
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ 
      where: { companyId: req.user.companyId },
      attributes: { exclude: ['password'] },
      include: [{ 
        model: User, 
        as: 'manager', 
        attributes: ['id', 'name', 'email'] 
      }]
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { 
        id: req.params.id, 
        companyId: req.user.companyId 
      },
      attributes: { exclude: ['password'] },
      include: [{ 
        model: User, 
        as: 'manager', 
        attributes: ['id', 'name', 'email'] 
      }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, isActive } = req.body;

    const user = await User.findOne({ 
      where: { 
        id: req.params.id, 
        companyId: req.user.companyId 
      } 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    await user.update(updateData);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findOne({ 
      where: { 
        id: req.params.id, 
        companyId: req.user.companyId 
      } 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ role });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.assignManager = async (req, res) => {
  try {
    const { managerId, isManagerApprover } = req.body;

    const user = await User.findOne({ 
      where: { 
        id: req.params.id, 
        companyId: req.user.companyId 
      } 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData = {};

    if (managerId) {
      const manager = await User.findOne({ 
        where: { 
          id: managerId, 
          companyId: req.user.companyId 
        } 
      });
      
      if (!manager) {
        return res.status(404).json({ success: false, message: 'Manager not found' });
      }
      updateData.managerId = managerId;
    }

    if (typeof isManagerApprover !== 'undefined') {
      updateData.isManagerApprover = isManagerApprover;
    }

    await user.update(updateData);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { 
        id: req.params.id, 
        companyId: req.user.companyId 
      } 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
