import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
  getCategoriesApi
} from '../services/bookService';
import { getUsersApi } from '../services/authService';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  ShieldAlert,
  BookOpen,
  Plus,
  Sparkles,
  Loader2,
  FileText,
  X
} from 'lucide-react';

export const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

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
    coverImageUrl: '',
    pdfUrl: ''
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
        setModalFeedback({ type: 'success', msg: `Book metadata auto-fetched successfully from ${res.source || 'external catalog'}!` });
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

  // Chart Data
  const chartColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
  const statusPieData = [
    { name: 'Pending', value: pendingRequests.length },
    { name: 'Issued', value: transactions.filter(t => t.status === 'ISSUED').length },
    { name: 'Overdue', value: transactions.filter(t => t.status === 'OVERDUE').length },
    { name: 'Returned', value: transactions.filter(t => t.status === 'RETURNED').length }
  ];

  return (
    <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
            Librarian Admin Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage catalog inventory, approve borrow requests & track overdue fines</p>
        </div>

        <button
          onClick={() => setIsAddBookModalOpen(true)}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Book (Google Auto-Fill)
        </button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-amber-200 bg-amber-50/50">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Requests</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{pendingRequests.length}</div>
        </div>

        <div className="glass-card p-5 border-emerald-200 bg-emerald-50/50">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Issued Books</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{activeIssued.length}</div>
        </div>

        <div className="glass-card p-5 border-indigo-200 bg-indigo-50/50">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Catalog Titles</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{books.length}</div>
        </div>

        <div className="glass-card p-5 border-purple-200 bg-purple-50/50">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Registered Members</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{users.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pending Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('issued')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'issued'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Issued Books & Returns ({activeIssued.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Analytics & Visual Charts
        </button>
      </div>

      {/* Tab 1: Pending Requests Table */}
      {activeTab === 'requests' && (
        <div className="glass-card overflow-hidden">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-500">No pending borrow requests right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Book Requested</th>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Shelf Location</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{tx.user?.name}</td>
                      <td className="p-4 text-indigo-600 font-bold">{tx.book?.title}</td>
                      <td className="p-4 font-mono text-slate-500">{tx.book?.isbn}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {tx.book?.shelfLocation || 'Shelf A1'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(tx._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-sm"
                        >
                          Approve Issue
                        </button>
                        <button
                          onClick={() => handleReject(tx._id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-colors shadow-sm"
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
            <div className="p-8 text-center text-xs font-medium text-slate-500">No active issued books right now.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Book Title</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Process Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeIssued.map(tx => (
                    <tr key={tx._id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{tx.user?.name}</td>
                      <td className="p-4 text-indigo-600 font-bold">{tx.book?.title}</td>
                      <td className="p-4 font-medium text-slate-600">{tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          tx.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleReturn(tx._id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors shadow-sm"
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
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transaction Status Breakdown</h3>
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

      {/* Feature #1 Modal: Rendered via Portal directly to document.body */}
      {isAddBookModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md w-screen h-screen min-h-screen overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl bg-white border-slate-200 text-slate-900 my-auto">
            
            <button
              onClick={() => setIsAddBookModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Book to Inventory</h3>
                <p className="text-xs text-slate-500">Use ISBN Auto-Fill or enter specifications manually</p>
              </div>
            </div>

            {/* Feature #1 Auto-Fill Box */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 mb-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Feature #1: Auto-Fetch Metadata from Google Books API
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ISBN (e.g. 9780132350884 or 9780593135204)..."
                  value={isbnSearch}
                  onChange={(e) => setIsbnSearch(e.target.value)}
                  className="flex-grow bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={handleAutoFetchGoogleBooks}
                  disabled={autoFetchLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {autoFetchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Auto-Fetch
                </button>
              </div>
            </div>

            {modalFeedback.msg && (
              <div className={`p-3 rounded-xl text-xs font-bold mb-4 ${
                modalFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {modalFeedback.msg}
              </div>
            )}

            <form onSubmit={handleCreateBookSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.title}
                    onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.author}
                    onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1">ISBN Number *</label>
                  <input
                    type="text"
                    required
                    value={bookFormData.isbn}
                    onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Category / Genre *</label>
                  <select
                    required
                    value={bookFormData.category}
                    onChange={(e) => setBookFormData({ ...bookFormData, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
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
                  <label className="block text-slate-600 mb-1">Total Copies *</label>
                  <input
                    type="number"
                    min={1}
                    value={bookFormData.totalCopies}
                    onChange={(e) => setBookFormData({ ...bookFormData, totalCopies: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={bookFormData.shelfLocation}
                    onChange={(e) => setBookFormData({ ...bookFormData, shelfLocation: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={bookFormData.coverImageUrl}
                    onChange={(e) => setBookFormData({ ...bookFormData, coverImageUrl: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* PDF E-Book Download URL Field */}
              <div>
                <label className="block text-slate-600 mb-1 flex items-center gap-1.5 font-bold text-indigo-700">
                  <FileText className="w-3.5 h-3.5" /> PDF E-Book Document URL (Digital Reader Copy)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/books/sample-ebook.pdf"
                  value={bookFormData.pdfUrl}
                  onChange={(e) => setBookFormData({ ...bookFormData, pdfUrl: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Description / Summary</label>
                <textarea
                  rows={3}
                  value={bookFormData.description}
                  onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Book to Catalog'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
