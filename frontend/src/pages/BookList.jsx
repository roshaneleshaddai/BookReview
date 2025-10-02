import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookAPI } from '../utils/api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('');

  const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 
                  'Thriller', 'Romance', 'Horror', 'Biography', 'History', 'Self-Help', 
                  'Poetry', 'Other'];

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5
      };

      if (search) params.search = search;
      if (genre) params.genre = genre;
      if (sortBy) params.sortBy = sortBy;

      const response = await bookAPI.getAll(params);
      setBooks(response.data.books);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, genre, sortBy]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Book Collection
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by title or author..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Genre</label>
            <select
              value={genre}
              onChange={handleGenreChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Newest First</option>
              <option value="year">Published Year</option>
              <option value="rating">Average Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No books found.</p>
          <Link
            to="/add-book"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add First Book
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/books/${book._id}`}>
                      <h3 className="text-2xl font-bold text-blue-600 hover:text-blue-800 mb-2">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-2">
                      <strong>Author:</strong> {book.author}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <strong>Genre:</strong> {book.genre} | <strong>Year:</strong> {book.publishedYear}
                    </p>
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {book.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-yellow-500 text-lg">
                        {renderStars(book.averageRating)}
                      </span>
                      <span className="text-gray-600">
                        {book.averageRating.toFixed(1)} ({book.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/books/${book._id}`}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;