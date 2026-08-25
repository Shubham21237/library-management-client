import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookByIdApi } from '../services/bookService';
import { requestBookApi } from '../services/transactionService';
import { summarizeBookApi } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import {
  BookOpen,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  ArrowLeft,
  Loader2,
  CheckCircle,
  QrCode,
  FileText
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

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading book specifications...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Book Not Found</h2>
        <Link to="/catalog" className="text-indigo-400 hover:underline text-sm font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Book Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Cover & QR Code */}
        <div className="space-y-6">
          <div className="glass-card overflow-hidden p-3 bg-slate-950">
            <img
              src={book.coverImage?.url}
              alt={book.title}
              className="w-full h-96 object-cover rounded-xl shadow-2xl"
            />
          </div>

          {/* Generated QR Code Card */}
          {book.qrCodeUrl && (
            <div className="glass-card p-5 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Book Scan Code (ISBN)
              </div>
              <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                <img src={book.qrCodeUrl} alt="ISBN QR Code" className="w-32 h-32 mx-auto" />
              </div>
              <p className="text-[11px] font-mono text-slate-400">ISBN: {book.isbn}</p>
            </div>
          )}
        </div>

        {/* Right Column: Book Metadata & AI Summarizer */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {book.category?.name || 'General'}
              </span>
              {book.availableCopies > 0 ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  {book.availableCopies} Available
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Out of Stock ({book.reservationQueue?.length || 0} in Queue)
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-white">{book.title}</h1>
            <p className="text-base text-slate-300">by <span className="font-semibold text-white">{book.author}</span></p>
          </div>

          {/* Feedback Alerts */}
          {feedback.msg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : feedback.type === 'warning'
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Book Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Publisher</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{book.publisher || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Published Date</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{book.publishedDate || 'N/A'}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Page Count</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{book.pageCount || 'N/A'} Pages</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Shelf Location</div>
              <div className="text-xs font-semibold text-indigo-400 mt-0.5">{book.shelfLocation || 'Shelf A1'}</div>
            </div>
          </div>

          {/* Book Overview */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Synopsis / Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {book.description || 'No detailed description available for this catalog entry.'}
            </p>
          </div>

          {/* Feature #5: AI Summarizer Box */}
          <div className="glass-card p-6 border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                AI 1-Minute Key Takeaways (Google Gemini)
              </div>

              <button
                onClick={handleGenerateAiSummary}
                disabled={aiLoading}
                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiSummary ? 'Regenerate Summary' : 'Generate AI Overview'}
              </button>
            </div>

            {aiSummary && (
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2 animate-in fade-in duration-300">
                {Array.isArray(aiSummary) ? (
                  <ul className="space-y-2">
                    {aiSummary.map((bullet, idx) => (
                      <li key={idx} className="text-xs text-indigo-200 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-indigo-200 leading-relaxed">{aiSummary}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex gap-4">
            <button
              onClick={handleRequestBorrow}
              disabled={requestLoading}
              className={`flex-grow py-3.5 px-6 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                book.availableCopies > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
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

        </div>

      </div>

    </div>
  );
};
