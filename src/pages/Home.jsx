import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  QrCode,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-200/50 via-purple-200/30 to-indigo-100/40 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Enterprise MERN + Google Gemini AI Powered
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            The Smart Next-Gen <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Library Management Platform
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Instant Google Books ISBN Auto-Fill, Webcam QR Scanner, Automated Return Reminders, AI Book Summaries, and Reading Streaks — all built at ₹0 cost.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-3xl mx-auto">
            <div className="relative flex items-center glass-card p-2 shadow-lg bg-white">
              <Search className="w-6 h-6 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search by Book Title, Author name, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 whitespace-nowrap"
              >
                Search Catalog
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-left hover:border-indigo-300 transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">ISBN Auto-Fill</h3>
              <p className="text-xs text-slate-500 font-medium">Zero typing book entry using Google Books API metadata.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-emerald-300 transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Webcam QR Checkout</h3>
              <p className="text-xs text-slate-500 font-medium">Scan student card & book QR in under 2 seconds.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-purple-300 transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Daily Email Cron</h3>
              <p className="text-xs text-slate-500 font-medium">Automated 2-day return reminders and fine tracking.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-amber-300 transition-all bg-white">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Reading Streaks</h3>
              <p className="text-xs text-slate-500 font-medium">Student badges, achievements, and reading goals.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
