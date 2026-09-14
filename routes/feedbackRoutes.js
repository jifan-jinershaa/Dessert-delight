const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { isDBConnected } = require('../config/db');

// Pre-seeded authentic reviews for showcase
const defaultFeedback = [
  {
    name: 'Ananya Sharma',
    email: 'ananya.s@example.com',
    rating: 5,
    feedback: 'The Belgian Chocolate Truffle Cake was heavenly! Perfectly balanced sweetness and incredibly moist sponge. Arrived in pristine packaging within 35 minutes.',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    name: 'Rohan Mehra',
    email: 'rohan.m@example.com',
    rating: 5,
    feedback: 'Hands down the best Lotus Biscoff Cheesecake in the city. The crust has the perfect crunch, and the cream cheese mousse is light and luxurious.',
    createdAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    name: 'Priya Kulkarni',
    email: 'priya.k@example.com',
    rating: 5,
    feedback: 'Ordered the sea salt chocolate chunk cookies and strawberry choux for an intimate tea party. Every guest was raving about them. Premium artisanal quality!',
    createdAt: new Date(Date.now() - 86400000 * 8),
  },
  {
    name: 'Devansh Verma',
    email: 'devansh.v@example.com',
    rating: 4,
    feedback: 'The Gooey Walnut Brownies are decadent and rich. Love the warm packaging. Delivery was super prompt. Will definitely order again next weekend.',
    createdAt: new Date(Date.now() - 86400000 * 12),
  },
];

let inMemoryFeedback = [...defaultFeedback];

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback / reviews
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    let reviews = [];
    if (isDBConnected()) {
      reviews = await Feedback.find().sort({ createdAt: -1 });
      if (reviews.length === 0) {
        // Return default testimonials if database is empty
        reviews = defaultFeedback;
      }
    } else {
      reviews = inMemoryFeedback;
    }

    return res.status(200).json({
      success: true,
      count: reviews.length,
      feedback: reviews,
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback.',
    });
  }
});

/**
 * @route   POST /api/feedback
 * @desc    Submit a new customer review
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, feedback } = req.body;

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

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a star rating between 1 and 5.',
      });
    }

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback comment cannot be empty.',
      });
    }

    const feedbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: numRating,
      feedback: feedback.trim(),
      createdAt: new Date(),
    };

    if (isDBConnected()) {
      const newFeedback = new Feedback(feedbackData);
      await newFeedback.save();
    } else {
      inMemoryFeedback.unshift(feedbackData);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback! It helps us keep perfecting our crafts.',
      feedback: feedbackData,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
    });
  }
});

module.exports = router;
