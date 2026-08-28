import React from 'react';
import { BookOpen, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16 py-10 text-slate-500">
      <div className="max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Library<span className="text-indigo-600">IQ</span></span>
            <span className="text-xs text-slate-400 font-medium">© 2026 Enterprise Edition</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">₹0 Cloud Architecture</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">API Documentation</span>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> using MERN + Tailwind + Gemini AI
          </div>
        </div>
      </div>
    </footer>
  );
};
