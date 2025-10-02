import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookAPI, reviewAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchBookDetails();
    fetchReviews();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await bookAPI.getById(id);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getByBook(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleDeleteBook = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.delete(id);
        navigate('/');
      } catch (error) {
        alert('Error deleting book: ' + error.response?.data?.message);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await reviewAPI.update(editingReview._id, reviewForm);
      } else {
        await reviewAPI.create({ ...reviewForm, bookId: id });
      }
      setReviewForm({ rating: 5, reviewText: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      fetchReviews();
      fetchBookDetails();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      reviewText: review.reviewText
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewAPI.delete(reviewId);
        fetchReviews();
        fetchBookDetails();
      } catch (error) {
        alert('Error deleting review');
      }
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return <div className="text-center py-20">Book not found</div>;
  }

  const userReview = reviews.find((r) => r.userId._id === user?._id);
  const canEdit = user && book.addedBy._id === user._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-gray-800">{book.title}</h1>
          {canEdit && (
            <div className="flex space-x-2">
              <Link
                to={`/edit-book/${book._id}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                Edit
              </Link>
              <button
                onClick={handleDeleteBook}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 text-gray-700">
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Genre:</strong> {book.genre}</p>
          <p><strong>Published Year:</strong> {book.publishedYear}</p>
          <p><strong>Added by:</strong> {book.addedBy.name}</p>
          <p className="pt-4"><strong>Description:</strong></p>
          <p className="text-gray-600">{book.description}</p>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <span className="text-3xl text-yellow-500">
            {renderStars(Math.round(book.averageRating))}
          </span>
          <span className="text-xl text-gray-700">
            {book.averageRating.toFixed(1)} / 5.0
          </span>
          <span className="text-gray-600">({book.reviewCount} reviews)</span>
        </div>
      </div>

      {/* Add Review Section */}
      {isAuthenticated && !userReview && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 mb-8"
        >
          Write a Review
        </button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} {renderStars(num)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Review</label>
              <textarea
                value={reviewForm.reviewText}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, reviewText: e.target.value })
                }
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Share your thoughts about this book..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setReviewForm({ rating: 5, reviewText: '' });
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{review.userId.name}</p>
                    <p className="text-yellow-500 text-lg">{renderStars(review.rating)}</p>
                  </div>
                  {user && review.userId._id === user._id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700">{review.reviewText}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;