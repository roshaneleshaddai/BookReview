import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, reviewAPI } from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const allBooks = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const response = await bookAPI.getAll({ page, limit: 100 });
        const userBooks = response.data.books.filter(
          (book) => book.addedBy._id === user._id
        );
        allBooks.push(...userBooks);
        
        if (response.data.currentPage >= response.data.totalPages) {
          hasMore = false;
        } else {
          page++;
        }
      }
      
      setMyBooks(allBooks);

      const reviewsResponse = await reviewAPI.getByUser(user._id);
      setMyReviews(reviewsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-600">{myBooks.length}</p>
            <p className="text-gray-600">Books Added</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-600">{myReviews.length}</p>
            <p className="text-gray-600">Reviews Written</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 py-4 text-center font-semibold transition ${
              activeTab === 'books'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            My Books ({myBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-center font-semibold transition ${
              activeTab === 'reviews'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            My Reviews ({myReviews.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'books' ? (
          myBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't added any books yet.</p>
              <Link
                to="/add-book"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Your First Book
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myBooks.map((book) => (
                <div
                  key={book._id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-xl font-bold text-blue-600 hover:text-blue-800"
                      >
                        {book.title}
                      </Link>
                      <p className="text-gray-600">by {book.author}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-yellow-500">
                          {renderStars(Math.round(book.averageRating))}
                        </span>
                        <span className="text-gray-600">
                          {book.averageRating.toFixed(1)} ({book.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit-book/${book._id}`}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/books/${book._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : myReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <Link
                  to={`/books/${review.bookId._id}`}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800 block mb-2"
                >
                  {review.bookId.title}
                </Link>
                <p className="text-gray-600 mb-2">by {review.bookId.author}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-500 text-lg">
                    {renderStars(review.rating)}
                  </span>
                  <span className="text-gray-600">{review.rating}/5</span>
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

export default Profile;