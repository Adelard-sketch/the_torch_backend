const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

/**
 * Send welcome email to new users
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Welcome to The Torch Initiative!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to The Torch Initiative!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining The Torch Initiative - empowering refugee and IDP communities through agricultural education and digital innovation.</p>
              
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Browse and purchase fresh agricultural products</li>
                <li>List your own products for sale</li>
                <li>Access farming resources and tutorials</li>
                <li>Connect with the agricultural community</li>
              </ul>
              
              <a href="http://localhost:5500/pages/dashboard.html" class="button">Go to Dashboard</a>
              
              <p>If you have any questions, feel free to reach out to our support team.</p>
              
              <p>Happy farming!</p>
              <p><strong>The Torch Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 The Torch Initiative. All rights reserved.</p>
              <p>Empowering communities through sustainable agriculture.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  try {
    const itemsList = order.items.map(item => 
      `<li>${item.productName} - ${item.quantity} ${item.unit} @ GH₵${item.price.toFixed(2)} = GH₵${(item.quantity * item.price).toFixed(2)}</li>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `Order Confirmation #${order._id.toString().slice(-8)} - The Torch`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .total { font-size: 20px; font-weight: bold; color: #2ecc71; margin-top: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for your order! We've received it and will process it shortly.</p>
              
              <div class="order-details">
                <h3>Order #${order._id.toString().slice(-8)}</h3>
                <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                
                <h4>Items:</h4>
                <ul>${itemsList}</ul>
                
                <p class="total">Total: GH₵${order.totalAmount.toFixed(2)}</p>
                
                <h4>Shipping Address:</h4>
                <p>
                  ${order.shippingAddress.fullName}<br>
                  ${order.shippingAddress.phone}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.region}
                </p>
                
                <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <p>We'll send you another email when your order ships.</p>
              
              <p>Thank you for supporting local farmers!</p>
              <p><strong>The Torch Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 The Torch Initiative. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    const resetLink = `http://localhost:5500/pages/reset-password.html?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Password Reset Request - The Torch',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #2ecc71; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>We received a request to reset your password for your The Torch account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetLink}</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              
              <p>If you have any concerns, please contact our support team.</p>
              
              <p><strong>The Torch Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 The Torch Initiative. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact form reception email to user
 */
const sendContactReceptionEmail = async (userEmail, userName, subject) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'We received your message - The Torch',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2ecc71; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Message Received!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for contacting The Torch Initiative. We've received your message and will get back to you as soon as possible.</p>
              
              <div class="info-box">
                <h3>Your Message Details:</h3>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>📧 Our team will review your message</li>
                <li>⏱️ We typically respond within 24-48 hours</li>
                <li>💬 You'll receive a reply at this email address</li>
              </ul>
              
              <p>In the meantime, feel free to explore our platform:</p>
              <ul>
                <li>Browse products from local farmers</li>
                <li>Check out our learning resources</li>
                <li>Connect with the agricultural community</li>
              </ul>
              
              <p>Thank you for being part of The Torch Initiative!</p>
              <p><strong>The Torch Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 The Torch Initiative. All rights reserved.</p>
              <p>Empowering communities through sustainable agriculture.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact reception email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending contact reception email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send contact notification to admin
 */
const sendContactNotificationToAdmin = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .contact-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .message-box { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="contact-info">
                <h3>Contact Details:</h3>
                <p><strong>Name:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="message-box">
                <h3>Message:</h3>
                <p>${contactData.message}</p>
              </div>
              
              <p><em>Please respond to this inquiry at your earliest convenience.</em></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact notification sent to admin');
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendContactReceptionEmail,
  sendContactNotificationToAdmin
};
