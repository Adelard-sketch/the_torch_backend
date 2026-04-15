const Contact = require('../models/Contact');
const { sendContactReceptionEmail, sendContactNotificationToAdmin } = require('../services/emailService');

/**
 * Submit contact form
 * @route POST /api/contact
 */
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        status: 400,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Create contact entry
    const contact = await Contact.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      subject,
      message,
      status: 'new'
    });

    // Send reception email to user (don't wait)
    sendContactReceptionEmail(contact.email, contact.name, contact.subject)
      .catch(err => console.error('Failed to send reception email:', err.message));

    // Send notification to admin (don't wait)
    sendContactNotificationToAdmin(contact)
      .catch(err => console.error('Failed to send admin notification:', err.message));

    return res.status(201).json({
      status: 201,
      data: {
        contactId: contact._id,
        message: 'Thank you for contacting us! We will get back to you soon.'
      }
    });

  } catch (error) {
    console.error('Submit contact error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to submit contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all contacts (admin only)
 * @route GET /api/contact
 */
const getContacts = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const parsedLimit = Math.min(parseInt(limit) || 50, 100);
    const parsedOffset = parseInt(offset) || 0;

    const contacts = await Contact
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(parsedOffset)
      .limit(parsedLimit);

    return res.status(200).json({
      status: 200,
      data: {
        contacts,
        count: contacts.length,
        limit: parsedLimit,
        offset: parsedOffset
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitContact,
  getContacts
};
