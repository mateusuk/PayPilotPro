import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

console.log('API URL:', API_URL); // Debug log

export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const response = await axios.post(`${API_URL}/api/send-email`, {
      to: email,
      subject: 'Welcome to PayPilotPro!',
      html: `
        <h1>Welcome to PayPilotPro!</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for joining PayPilotPro. We're excited to have you on board!</p>
        <p>Best regards,<br>The PayPilotPro Team</p>
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const response = await axios.post(`${API_URL}/api/send-email`, {
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>The PayPilotPro Team</p>
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendDriverAccessCode = async (email, firstName, accessNumber) => {
  try {
    const response = await axios.post(`${API_URL}/api/send-email`, {
      to: email,
      subject: 'Your PayPilotPro Driver Access Code',
      html: `
        <h1>Welcome to PayPilotPro!</h1>
        <p>Hello ${firstName},</p>
        <p>Your access code is: <strong>${accessNumber}</strong></p>
        <p>Use this code to complete your registration.</p>
        <p>Best regards,<br>The PayPilotPro Team</p>
      `
    });
    return response.data;
  } catch (error) {
    console.error('Error sending driver access code email:', error);
    throw error;
  }
}; 