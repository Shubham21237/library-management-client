import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getBooksApi, getCategoriesApi } from '../services/bookService';
import { requestBookApi } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Layers
} from 'lucide-react';

export const BookCatalog = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesApi();
        if (res.status === 'success') setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        if (inStockOnly) params.inStock = 'true';

        const res = await getBooksApi(params);
        if (res.status === 'success') setBooks(res.data);
      } catch (err) {
        console.error('Error fetching books', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, selectedCategory, inStockOnly]);

  const handleRequestBorrow = async (bookId) => {
    if (!user) {
      setFeedback({ type: 'error', msg: 'Please sign in to request books.' });
      return;
    }

    setRequestLoading(bookId);
    setFeedback({ type: '', msg: '' });

    try {
      const res = await requestBookApi(bookId);
      if (res.isQueued) {
        setFeedback({ type: 'warning', msg: res.message });
      } else {
        setFeedback({ type: 'success', msg: 'Borrow request submitted! Librarian approval pending.' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to submit borrow request.'
      });
    } finally {
      setRequestLoading(null);
    }
  };

  return (
    <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Book Catalog
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Explore and borrow from our digital & physical collection</p>
        </div>

        {/* Feedback Alert */}
        {feedback.msg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : feedback.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, Author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchParams({ search: e.target.value, category: selectedCategory, inStock: inStockOnly })}
              className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-colors text-xs font-medium"
            />
          </div>

          {/* In-Stock Filter Toggle */}
          <button
            onClick={() => setSearchParams({ search: searchQuery, category: selectedCategory, inStock: !inStockOnly })}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              inStockOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Available In Stock Only
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSearchParams({ search: searchQuery, category: '', inStock: inStockOnly })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            All Genres
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSearchParams({ search: searchQuery, category: cat._id, inStock: inStockOnly })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat._id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog inventory...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Books Found</h3>
          <p className="text-xs text-slate-500 font-medium">Try adjusting your search terms or genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book._id}
              className="glass-card overflow-hidden group flex flex-col hover:border-slate-300 transition-all duration-300 bg-white"
            >
              {/* Book Cover Image */}
              <div className="relative h-64 bg-slate-100 overflow-hidden">
                <img
                  src={book.coverImage?.url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Stock Badge */}
                <div className="absolute top-3 right-3">
                  {book.availableCopies > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {book.availableCopies} Copies Available
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Clock className="w-3 h-3" /> Queue ({book.reservationQueue?.length || 0})
                    </span>
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {book.category?.name || 'General'}
                  </div>
                  <Link to={`/books/${book._id}`}>
                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 font-medium">by {book.author}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {book.shelfLocation || 'Shelf A1'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">ISBN: {book.isbn}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/books/${book._id}`}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg text-center transition-colors border border-slate-200"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleRequestBorrow(book._id)}
                      disabled={requestLoading === book._id}
                      className={`w-full py-2 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 ${
                        book.availableCopies > 0
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {requestLoading === book._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : book.availableCopies > 0 ? (
                        'Request'
                      ) : (
                        'Join Queue'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
