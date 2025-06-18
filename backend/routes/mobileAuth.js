const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  forgotPasswordOTP,
  resetPasswordOTP,
  verifyPasswordResetOTP
} = require('../controllers/authController');
const { 
  validateEmail, 
  validateOTP, 
  validatePasswordResetOTP 
} = require('../middleware/validation');

// Send OTP for email verification (resend)
router.post('/send-otp', validateEmail, sendOTP);

// Verify OTP for email verification
router.post('/verify-otp', validateOTP, verifyOTP);

// Send OTP for password reset
router.post('/forgot-password-otp', validateEmail, forgotPasswordOTP);

// Verify password reset OTP (without changing password)
router.post('/verify-password-reset-otp', validateOTP, verifyPasswordResetOTP);

// Reset password with OTP
router.post('/reset-password-otp', validatePasswordResetOTP, resetPasswordOTP);

module.exports = router; 