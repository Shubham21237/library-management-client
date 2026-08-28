import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { QRScannerModal } from './components/common/QRScannerModal';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BookCatalog } from './pages/BookCatalog';
import { BookDetails } from './pages/BookDetails';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export function App() {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
          <Navbar onOpenScanner={() => setScannerOpen(true)} />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/catalog" element={<BookCatalog />} />
              <Route path="/books/:id" element={<BookDetails />} />

              {/* Protected Member Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MemberDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />

          {/* Feature #2: Global Webcam QR Scanner Modal */}
          {scannerOpen && (
            <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
          )}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
