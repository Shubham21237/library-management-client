import React, { useState, useEffect } from 'react';
import { getMyTransactionsApi, payFineApi } from '../services/transactionService';
import { recommendBooksApi } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  BookOpen,
  CheckCircle,
  Flame,
  Award,
  Sparkles,
  Download,
  CreditCard,
  Loader2
} from 'lucide-react';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [payingFineId, setPayingFineId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyTransactionsApi();
        if (res.status === 'success') setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching member transactions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFetchAiRecommendations = async () => {
    setAiLoading(true);
    try {
      const res = await recommendBooksApi();
      if (res.status === 'success') {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePayFine = async (transactionId) => {
    setPayingFineId(transactionId);
    try {
      const res = await payFineApi(transactionId);
      if (res.status === 'success') {
        setTransactions(prev =>
          prev.map(t => t._id === transactionId ? { ...t, finePaid: true } : t)
        );
      }
    } catch (err) {
      console.error('Error paying fine', err);
    } finally {
      setPayingFineId(null);
    }
  };

  const handleDownloadReceipt = (tx) => {
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('LibraryIQ - Official Receipt', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Receipt ID: TX-${tx._id.slice(-8).toUpperCase()}`, 20, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);

    doc.line(20, 42, 190, 42);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text('Member Information:', 20, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${user?.name}`, 20, 60);
    doc.text(`Email: ${user?.email}`, 20, 66);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details:', 20, 78);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Book Title: ${tx.book?.title}`, 20, 86);
    doc.text(`Author: ${tx.book?.author}`, 20, 92);
    doc.text(`Issue Date: ${tx.issueDate ? new Date(tx.issueDate).toLocaleDateString() : 'N/A'}`, 20, 98);
    doc.text(`Return Date: ${tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : 'N/A'}`, 20, 104);

    doc.line(20, 110, 190, 110);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Total Fine Paid: RS.${tx.fineAmount || 0}`, 20, 122);
    doc.text('Status: PAID & CLEARED', 20, 130);

    doc.save(`Receipt_${tx.book?.title.slice(0, 10)}_${tx._id.slice(-4)}.pdf`);
  };

  const activeBorrows = transactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE');

  return (
    <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Header & Reading Streak */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-slate-200 bg-white">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold uppercase">
                Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Reading Streak & Badges */}
        <div className="flex items-center gap-4">
          <div className="glass-card px-5 py-3 text-center border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> Reading Streak
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {user?.readingStreak?.currentStreak || 0} <span className="text-xs text-slate-500">Months</span>
            </div>
          </div>

          <div className="glass-card px-5 py-3 text-center border-indigo-200 bg-indigo-50/50">
            <div className="flex items-center justify-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-indigo-600" /> Badges Earned
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {user?.badges?.length || 1} <span className="text-xs text-slate-500">Badges</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Box */}
      <div className="glass-card p-6 border-indigo-200 bg-indigo-50/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              AI Recommended Books For You (Google Gemini)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tailored based on your borrowing history & reading habits</p>
          </div>

          <button
            onClick={handleFetchAiRecommendations}
            disabled={aiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Get AI Recommendations
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {recommendations.map(book => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="glass-card p-3 flex items-center gap-3 hover:border-indigo-300 transition-colors"
              >
                <img src={book.coverImage?.url} alt={book.title} className="w-12 h-16 object-cover rounded-lg shadow-sm" />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">by {book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Borrowed Books Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Currently Borrowed & Active Books ({activeBorrows.length})
        </h2>

        {activeBorrows.length === 0 ? (
          <div className="glass-card p-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">You currently have no active borrowed books.</p>
            <Link to="/catalog" className="text-xs font-bold text-indigo-600 hover:underline">
              Browse Catalog to Borrow
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBorrows.map(tx => (
              <div key={tx._id} className="glass-card p-5 space-y-4">
                <div className="flex gap-4">
                  <img
                    src={tx.book?.coverImage?.url}
                    alt={tx.book?.title}
                    className="w-16 h-24 object-cover rounded-xl shadow"
                  />
                  <div className="space-y-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {tx.status}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{tx.book?.title}</h3>
                    <p className="text-xs text-slate-500">by {tx.book?.author}</p>

                    <div className="text-xs text-slate-500 pt-1">
                      Due Date: <span className="font-bold text-slate-900">{tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Overdue Fine Box */}
                {tx.fineAmount > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-rose-700">Accumulated Overdue Fine</div>
                      <div className="text-base font-extrabold text-slate-900">RS.{tx.fineAmount}</div>
                    </div>

                    {!tx.finePaid ? (
                      <button
                        onClick={() => handlePayFine(tx._id)}
                        disabled={payingFineId === tx._id}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {payingFineId === tx._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        Pay Fine
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">Fine Paid</span>
                        <button
                          onClick={() => handleDownloadReceipt(tx)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-slate-300"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
