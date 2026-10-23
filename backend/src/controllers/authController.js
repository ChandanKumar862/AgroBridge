const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendOTPEmail } = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET || 'krishi-samadhan-super-secret-key-2026';
const JWT_EXPIRES_IN = '30d';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, location, organization, phone, otp } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. name@domain.com)' });
    }

    const validRoles = ['farmer', 'buyer', 'animal_care', 'compost', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await db.findOne('users', { email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Verify OTP if provided
    if (otp) {
      const storedOtp = await db.findOne('otps', { email: normalizedEmail });
      if (!storedOtp) {
        return res.status(400).json({ success: false, message: 'Verification code not found or expired. Please request a new code.' });
      }

      if (new Date(storedOtp.expiresAt) < new Date()) {
        await db.deleteOne('otps', { email: normalizedEmail });
        return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
      }

      if (storedOtp.otp.toString().trim() !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
      }

      // Consumed valid OTP
      await db.deleteOne('otps', { email: normalizedEmail });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.insertOne('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone || '',
      location: location || { latitude: 20.5937, longitude: 78.9629, address: 'India' }, // Default India coordinates
      organization: organization || '',
      verified: true, // Defaulting to true for demo speed
      sustainabilityScore: 100, // Starts fresh
      balance: role === 'buyer' ? 10000 : 0 // Buyers get 10k dummy startup cash, others get wallet balances
    });

    // Remove password from response
    delete newUser.password;

    res.status(201).json({
      success: true,
      data: newUser,
      token: generateToken(newUser.id)
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userData = { ...user };
    delete userData.password;

    res.status(200).json({
      success: true,
      data: userData,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = { ...req.user };
    delete user.password;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, organization } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (location) updates.location = location;
    if (organization !== undefined) updates.organization = organization;

    const updated = await db.updateOne('users', { id: req.user.id }, updates);

    if (updated) {
      const updatedUser = await db.findOne('users', { id: req.user.id });
      delete updatedUser.password;
      res.status(200).json({ success: true, data: updatedUser });
    } else {
      res.status(400).json({ success: false, message: 'Failed to update profile' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Simulate Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await db.findOne('users', { email: email.toLowerCase() });
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with this email' });
  }

  // Generate simulated reset token
  const resetToken = Math.random().toString(36).substr(2, 6).toUpperCase();
  res.status(200).json({
    success: true,
    message: `Password reset instructions sent to your email. (Simulated Code: ${resetToken})`,
    resetCode: resetToken // Exposed for debugging speed
  });
};

// @desc    Simulate Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res.status(400).json({ success: false, message: 'Please provide all details' });
  }

  const user = await db.findOne('users', { email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  await db.updateOne('users', { email: email.toLowerCase() }, { password: hashedPassword });
  
  res.status(200).json({ success: true, message: 'Password has been reset successfully' });
};

// @desc    Send 6-digit verification code to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address (e.g. name@domain.com)' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await db.findOne('users', { email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clear previous pending OTP for this email
    await db.deleteOne('otps', { email: normalizedEmail });

    // Store in otps collection
    await db.insertOne('otps', {
      email: normalizedEmail,
      otp,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    });

    // Send email via nodemailer or simulation
    await sendOTPEmail(normalizedEmail, otp);

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and verification code' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedOtp = await db.findOne('otps', { email: normalizedEmail });

    if (!storedOtp) {
      return res.status(400).json({ success: false, message: 'Verification code not found or expired. Please request a new code.' });
    }

    if (new Date(storedOtp.expiresAt) < new Date()) {
      await db.deleteOne('otps', { email: normalizedEmail });
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (storedOtp.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify code' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP
};
