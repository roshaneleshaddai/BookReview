const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');

const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ bookId });
  
  if (reviews.length === 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      reviewCount: 0
    });
    return;
  }

  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length
  });
};

router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingReview = await Review.findOne({
      bookId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      bookId,
      userId: req.user._id,
      rating,
      reviewText
    });

    await updateBookRating(bookId);

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, reviewText } = req.body;

    review.rating = rating || review.rating;
    review.reviewText = reviewText || review.reviewText;

    const updatedReview = await review.save();

    await updateBookRating(review.bookId);

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const bookId = review.bookId;
    await review.deleteOne();

    await updateBookRating(bookId);

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;