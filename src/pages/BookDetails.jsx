import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookByIdApi, addBookReviewApi } from '../services/bookService';
import { requestBookApi } from '../services/transactionService';
import { summarizeBookApi } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  QrCode,
  FileText,
  Star,
  MessageSquare,
  Send,
  User,
  ExternalLink
} from 'lucide-react';

export const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({ type: '', msg: '' });

  const fetchBook = async () => {
    try {
      const res = await getBookByIdApi(id);
      if (res.status === 'success') setBook(res.data);
    } catch (err) {
      console.error('Error fetching book details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleRequestBorrow = async () => {
    if (!user) {
      setFeedback({ type: 'error', msg: 'Please sign in to request books.' });
      return;
    }

    setRequestLoading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const res = await requestBookApi(book._id);
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
      setRequestLoading(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!book) return;
    setAiLoading(true);

    try {
      const res = await summarizeBookApi({
        title: book.title,
        author: book.author,
        description: book.description
      });
      if (res.status === 'success') {
        setAiSummary(res.summary);
      }
    } catch (err) {
      console.error('Error generating AI summary', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewFeedback({ type: 'error', msg: 'Please sign in to post a review.' });
      return;
    }
    if (!comment.trim()) {
      setReviewFeedback({ type: 'error', msg: 'Please write a comment before submitting.' });
      return;
    }

    setReviewLoading(true);
    setReviewFeedback({ type: '', msg: '' });

    try {
      const res = await addBookReviewApi(book._id, { rating, comment });
      if (res.status === 'success') {
        setReviewFeedback({ type: 'success', msg: 'Review submitted successfully!' });
        setComment('');
        fetchBook();
      }
    } catch (err) {
      setReviewFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to submit review.'
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading book specifications...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Book Not Found</h2>
        <Link to="/catalog" className="text-indigo-600 hover:underline text-xs font-bold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const roundedAvgRating = (book.averageRating || 0).toFixed(1);

  return (
    <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Book Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Cover, PDF Button & QR Code */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden p-3 bg-white shadow-md">
            <img
              src={book.coverImage?.url}
              alt={book.title}
              className="w-full h-96 object-cover rounded-xl shadow-md"
            />
          </div>

          {/* Digital PDF E-Book Download & Reader Button */}
          {book.pdfUrl ? (
            <a
              href={book.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Read / Download Digital PDF
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="p-3 rounded-xl bg-slate-100 text-center text-xs font-medium text-slate-500 border border-slate-200">
              📄 Physical Hardcopy Book (Digital PDF copy not uploaded)
            </div>
          )}

          {/* Generated QR Code Card */}
          {book.qrCodeUrl && (
            <div className="glass-card p-5 text-center space-y-3 bg-white">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-emerald-600" />
                Book Scan Code (ISBN)
              </div>
              <div className="bg-slate-50 p-3 rounded-xl inline-block border border-slate-200">
                <img src={book.qrCodeUrl} alt="ISBN QR Code" className="w-32 h-32 mx-auto" />
              </div>
              <p className="text-[11px] font-mono text-slate-500">ISBN: {book.isbn}</p>
            </div>
          )}
        </div>

        {/* Right Column: Book Metadata & Reviews */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                {book.category?.name || 'General'}
              </span>
              {book.availableCopies > 0 ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  {book.availableCopies} Available
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  Out of Stock ({book.reservationQueue?.length || 0} in Queue)
                </span>
              )}

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold text-amber-700 ml-auto">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{roundedAvgRating} / 5.0</span>
                <span className="text-slate-400 font-normal">({book.numReviews || 0} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">{book.title}</h1>
            <p className="text-base text-slate-600 font-medium">by <span className="font-bold text-slate-900">{book.author}</span></p>
          </div>

          {/* Feedback Alerts */}
          {feedback.msg && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
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

          {/* Book Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Publisher</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{book.publisher || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Published Date</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{book.publishedDate || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page Count</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{book.pageCount || 'N/A'} Pages</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Shelf Location</div>
              <div className="text-xs font-bold text-indigo-600 mt-0.5">{book.shelfLocation || 'Shelf A1'}</div>
            </div>
          </div>

          {/* Book Overview */}
          <div className="glass-card p-6 space-y-3 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Synopsis / Description</h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {book.description || 'No detailed description available for this catalog entry.'}
            </p>
          </div>

          {/* Feature #5: AI Summarizer Box */}
          <div className="glass-card p-6 border-indigo-200 bg-indigo-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI 1-Minute Key Takeaways (Google Gemini)
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={aiLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-sm"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiSummary ? 'Regenerate Summary' : 'Generate AI Overview'}
              </button>
            </div>

            {aiSummary && (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-2 animate-in fade-in duration-300 shadow-sm">
                {Array.isArray(aiSummary) ? (
                  <ul className="space-y-2">
                    {aiSummary.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-slate-800 font-medium flex items-start gap-2">
                        <span className="text-indigo-600 font-bold mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{aiSummary}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex gap-4">
            <button
              onClick={handleRequestBorrow}
              disabled={requestLoading}
              className={`flex-grow py-3.5 px-6 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                book.availableCopies > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
              }`}
            >
              {requestLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : book.availableCopies > 0 ? (
                'Request Book to Borrow'
              ) : (
                'Join Reservation Waiting Queue'
              )}
            </button>
          </div>

          {/* Community Ratings & Reviews Section */}
          <div className="glass-card p-6 space-y-6 bg-white border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Community Ratings & Reviews ({book.numReviews || 0})
              </h3>
              
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{roundedAvgRating} out of 5.0</span>
              </div>
            </div>

            {/* Submit Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900">Leave Your Rating & Review</h4>
                
                {reviewFeedback.msg && (
                  <div className={`p-3 rounded-lg text-xs font-bold ${
                    reviewFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {reviewFeedback.msg}
                  </div>
                )}

                {/* Star Rating Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-500' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment Box */}
                <textarea
                  rows={2}
                  required
                  placeholder="Share your thoughts on this book with fellow students..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium border border-slate-200">
                Please <Link to="/login" className="text-indigo-600 font-bold hover:underline">sign in</Link> to write a community review.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4 pt-2">
              {(!book.reviews || book.reviews.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-4">No community reviews yet. Be the first to review this book!</p>
              ) : (
                book.reviews.map((rev) => (
                  <div key={rev._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.userName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{rev.comment}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
