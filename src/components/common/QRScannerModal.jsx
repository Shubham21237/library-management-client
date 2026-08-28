import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, CheckCircle } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();

        setTimeout(() => {
          navigate(`/catalog?search=${encodeURIComponent(decodedText)}`);
          onClose();
        }, 1500);
      },
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Error clearing scanner', err));
      }
    };
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md w-screen h-screen top-0 left-0">
      <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Live QR Code Scanner</h3>
            <p className="text-xs text-slate-500">Position camera over Book QR or Student ID</p>
          </div>
        </div>

        {/* Scanner Feed Container */}
        <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 overflow-hidden min-h-[300px] flex items-center justify-center">
          {scanResult ? (
            <div className="text-center p-6 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">QR Code Scanned!</h4>
              <p className="text-xs font-mono bg-white px-3 py-2 rounded text-emerald-700 border border-emerald-200 break-all shadow-sm">
                {scanResult}
              </p>
              <p className="text-xs text-slate-500">Redirecting to book catalog...</p>
            </div>
          ) : (
            <div id="qr-reader" className="w-full"></div>
          )}
        </div>

        <p className="text-xs text-center text-slate-500 mt-4">
          💡 Works with laptop webcams & mobile phone cameras.
        </p>
      </div>
    </div>
  );
};
