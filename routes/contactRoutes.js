const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { isDBConnected } = require('../config/db');

const inMemoryContacts = [];

/**
 * @route   POST /api/contact
 * @desc    Submit a contact inquiry
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
      });
    }

    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date(),
    };

    if (isDBConnected()) {
      const newContact = new Contact(contactData);
      await newContact.save();
    } else {
      inMemoryContacts.push(contactData);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will get back to you shortly.',
      data: {
        name: contactData.name,
        subject: contactData.subject,
        createdAt: contactData.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in contact route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
});

module.exports = router;
