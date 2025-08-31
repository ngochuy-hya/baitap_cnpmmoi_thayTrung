// Test controller để bypass email verification
const User = require('../models/user');

const testRegister = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        EM: 'Email đã được đăng ký',
        EC: -1,
        DT: ''
      });
    }

    // Create user with email already verified (for testing)
    const user = await User.create({
      email,
      password,
      fullName,
      phone,
      status: 'active',
      isEmailVerified: true // Skip email verification
    });

    res.status(201).json({
      EM: 'Đăng ký thành công! (Test mode - skip email verification)',
      EC: 0,
      DT: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({
      EM: error.message,
      EC: -1,
      DT: ''
    });
  }
};

module.exports = {
  testRegister
};
