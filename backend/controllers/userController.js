const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role, managerId, isManagerApprover } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      name,
      role: role || 'Employee',
      company: req.user.company,
      manager: managerId || null,
      isManagerApprover: isManagerApprover || false
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        manager: user.manager,
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
    const users = await User.find({ company: req.user.company })
      .select('-password')
      .populate('manager', 'name email');

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, company: req.user.company })
      .select('-password')
      .populate('manager', 'name email');

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

    const user = await User.findOne({ _id: req.params.id, company: req.user.company });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findOne({ _id: req.params.id, company: req.user.company });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.assignManager = async (req, res) => {
  try {
    const { managerId, isManagerApprover } = req.body;

    const user = await User.findOne({ _id: req.params.id, company: req.user.company });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (managerId) {
      const manager = await User.findOne({ _id: managerId, company: req.user.company });
      if (!manager) {
        return res.status(404).json({ success: false, message: 'Manager not found' });
      }
      user.manager = managerId;
    }

    if (typeof isManagerApprover !== 'undefined') {
      user.isManagerApprover = isManagerApprover;
    }

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, company: req.user.company });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
