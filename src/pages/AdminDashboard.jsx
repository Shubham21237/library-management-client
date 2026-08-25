import React, { useState, useEffect } from 'react';
import {
  getAllTransactionsApi,
  approveIssueApi,
  rejectRequestApi,
  returnBookApi
} from '../services/transactionService';
import {
  getBooksApi,
  createBookApi,
  fetchGoogleBooksMetadataApi,
  getCategoriesApi,
  createCategoryApi
} from '../services/bookService';
import { getUsersApi } from '../services/authService';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ShieldAlert,
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  Users,
  Clock,
  Layers,
  Search,
  Loader2,
  X,
  Upload
} from 'lucide-react';

export const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'issued', 'inventory', 'analytics'

  // Add Book Modal State
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isbnSearch, setIsbnSearch] = useState('');
  const [autoFetchLoading, setAutoFetchLoading] = useState(false);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    publisher: '',
    publishedDate: '',
    pageCount: 0,
    totalCopies: 1,
    shelfLocation: 'Shelf A1',
    coverImageUrl: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({ type: '', msg: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, booksRes, catRes, usersRes] = await Promise.all([
        getAllTransactionsApi(),
        getBooksApi(),
        getCategoriesApi(),
        getUsersApi()
      ]);

      if (txRes.status === 'success') setTransactions(txRes.data);
      if (booksRes.status === 'success') setBooks(booksRes.data);
      if (catRes.status === 'success') setCategories(catRes.data);
      if (usersRes.status === 'success') setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Feature #1: Auto-Fetch Book Metadata from Google Books API
  const handleAutoFetchGoogleBooks = async () => {
    if (!isbnSearch.trim()) return;
    setAutoFetchLoading(true);
    setModalFeedback({ type: '', msg: '' });

    try {
      const res = await fetchGoogleBooksMetadataApi({ isbn: isbnSearch.trim() });
      if (res.status === 'success') {
        const data = res.data;
        setBookFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          author: data.author || prev.author,
          isbn: data.isbn || isbnSearch.trim(),
          description: data.description || prev.description,
          publisher: data.publisher || prev.publisher,
          publishedDate: data.publishedDate || prev.publishedDate,
          pageCount: data.pageCount || prev.pageCount,
          coverImageUrl: data.coverImageUrl || prev.coverImageUrl
        }));
        setModalFeedback({ type: 'success', msg: 'Book metadata successfully auto-fetched from Google Books API!' });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', msg: 'Could not find book metadata for this ISBN.' });
    } finally {
      setAutoFetchLoading(false);
    }
  };

  const handleCreateBookSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setModalFeedback({ type: '', msg: '' });

    try {
      const res = await createBookApi(bookFormData);
      if (res.status === 'success') {
        setIsAddBookModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setModalFeedback({ type: 'error', msg: err.response?.data?.message || 'Failed to add book.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveIssueApi(id);
      fetchData();
    } catch (err) {
      console.error('Error approving transaction', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRequestApi(id);
      fetchData();
    } catch (err) {
      console.error('Error rejecting transaction', err);
    }
  };

  const handleReturn = async (id) => {
    try {
      await returnBookApi(id);
      fetchData();
    } catch (err) {
      console.error('Error processing return', err);
    }
  };

  const pendingRequests = transactions.filter(t => t.status === 'PENDING');
  const activeIssued = transactions.filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE');

  // Chart Data Preparation
  const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
  const statusPieData = [
    { name: 'Pending', value: pendingRequests.length },
    { name: 'Issued', value: transactions.filter(t => t.status === 'ISSUED').length },
    { name: 'Overdue', value: transactions.filter(t => t.status === 'OVERDUE').length },
    { name: 'Returned', value: transactions.filter(t => t.status === 'RETURNED').length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
            Librarian Admin Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage catalog inventory, approve borrow requests & track overdue fines</p>
        </div>

        <button
          onClick={() => setIsAddBookModalOpen(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Book (Google Auto-Fill)
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-amber-500/30">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Requests</div>
          <div className="text-3xl font-extrabold text-white mt-1">{pendingRequests.length}</div>
        </div>

        <div className="glass-card p-5 border-emerald-500/30">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Issued Books</div>
          <div className="text-3xl font-extrabold text-white mt-1">{activeIssued.length}</div>
        </div>

        <div className="glass-card p-5 border-indigo-500/30">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Catalog Titles</div>
          <div className="text-3xl font-extrabold text-white mt-1">{books.length}</div>
        </div>

        <div className="glass-card p-5 border-purple-500/30">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Registered Members</div>
          <div className="text-3xl font-extrabold text-white mt-1">{users.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('issued')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'issued'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Issued Books & Returns ({activeIssued.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-indigo-400 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Analytics & Visual Charts
        </button>
      </div>

      {/* Tab 1: Pending Requests Table */}
      {activeTab === 'requests' && (
        <div className="glass-card overflow-hidden">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No pending borrow requests right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Book Requested</th>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Available Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {pendingRequests.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-semibold text-white">{tx.user?.name}</td>
                      <td className="p-4 text-indigo-300 font-medium">{tx.book?.title}</td>
                      <td className="p-4 font-mono text-xs text-slate-400">{tx.book?.isbn}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                          {tx.book?.shelfLocation || 'Shelf A1'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(tx._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Approve Issue
                        </button>
                        <button
                          onClick={() => handleReject(tx._id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Issued Books Table & Returns */}
      {activeTab === 'issued' && (
        <div className="glass-card overflow-hidden">
          {activeIssued.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No active issued books right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Book Title</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Process Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {activeIssued.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-semibold text-white">{tx.user?.name}</td>
                      <td className="p-4 text-indigo-300 font-medium">{tx.book?.title}</td>
                      <td className="p-4 text-slate-300">{tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === 'OVERDUE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleReturn(tx._id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          Mark Returned
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Analytics Charts */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction Status Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Feature #1 Modal: Add Book with Google Books Auto-Fill */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsAddBookModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Book to Inventory</h3>
                <p className="text-xs text-slate-400">Use ISBN Auto-Fill or enter specifications manually</p>
              </div>
            </div>

            {/* Feature #1 Auto-Fill Box */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 mb-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Sparkles className="w-4 h-4" /> Feature #1: Auto-Fetch Metadata from Google Books API
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ISBN (e.g. 9780132350884)..."
                  value={isbnSearch}
                  onChange={(e) => setIsbnSearch(e.target.value)}
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAutoFetchGoogleBooks}
                  disabled={autoFetchLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {autoFetchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Auto-Fetch
                </button>
              </div>
            </div>

            {modalFeedback.msg && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
                modalFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {modalFeedback.msg}
              </div>
            )}

            <form onSubmit={handleCreateBookSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">ISBN Number *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category / Genre *</label>
                  <select
                    required
                    value={bookFormData.category}
                    onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Total Copies *</label>
                  <input
                    type="number"
                    min={1}
                    value={bookFormData.totalCopies}
                    onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={bookFormData.shelfLocation}
                    onChange={(e) => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={bookFormData.coverImageUrl}
                    onChange={(e) => setBookFormData({ ...bookFormData, coverImageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description / Summary</label>
                <textarea
                  rows={3}
                  value={bookFormData.description}
                  onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Book to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
