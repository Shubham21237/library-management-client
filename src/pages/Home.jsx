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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Enterprise MERN + Google Gemini AI Powered
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            The Smart Next-Gen <br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Library Management Platform
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Instant Google Books ISBN Auto-Fill, Webcam QR Scanner, Automated Return Reminders, AI Book Summaries, and Reading Streaks — all built at ₹0 cost.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="mt-10 max-w-3xl mx-auto">
            <div className="relative flex items-center glass-card p-2 shadow-xl bg-slate-900/90 border-slate-800">
              <Search className="w-6 h-6 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search by Book Title, Author name, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 focus:outline-none text-sm font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 whitespace-nowrap"
              >
                Search Catalog
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-left hover:border-indigo-500/40 transition-all bg-slate-900/90 border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">ISBN Auto-Fill</h3>
              <p className="text-xs text-slate-400 font-medium">Zero typing book entry using Google Books API metadata.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-emerald-500/40 transition-all bg-slate-900/90 border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Webcam QR Checkout</h3>
              <p className="text-xs text-slate-400 font-medium">Scan student card & book QR in under 2 seconds.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-purple-500/40 transition-all bg-slate-900/90 border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Daily Email Cron</h3>
              <p className="text-xs text-slate-400 font-medium">Automated 2-day return reminders and fine tracking.</p>
            </div>

            <div className="glass-card p-6 text-left hover:border-amber-500/40 transition-all bg-slate-900/90 border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Reading Streaks</h3>
              <p className="text-xs text-slate-400 font-medium">Student badges, achievements, and reading goals.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
