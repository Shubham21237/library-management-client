import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, Barcode, CheckCircle } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [scannerMode, setScannerMode] = useState('qr'); // 'qr' or 'barcode'
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setScanResult(null);

    const boxDimensions = scannerMode === 'qr'
      ? { width: 250, height: 250 }
      : { width: 320, height: 160 };

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 12,
        qrbox: boxDimensions,
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
  }, [isOpen, scannerMode, navigate, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md w-screen h-screen min-h-screen">
      <div className="glass-card w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 shadow-2xl bg-white border-slate-200 text-slate-900 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            {scannerMode === 'qr' ? <QrCode className="w-5 h-5" /> : <Barcode className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {scannerMode === 'qr' ? 'Live QR Code Scanner' : 'Live 1D Barcode Scanner'}
            </h3>
            <p className="text-xs text-slate-500">Scan Student ID or Book Barcode</p>
          </div>
        </div>

        {/* Dual Mode Switcher Segment */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setScannerMode('qr')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              scannerMode === 'qr'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            2D QR Code
          </button>

          <button
            type="button"
            onClick={() => setScannerMode('barcode')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              scannerMode === 'barcode'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4" />
            1D ISBN Barcode
          </button>
        </div>

        {/* Scanner Feed Container */}
        <div className="bg-slate-100 rounded-xl p-2 border border-slate-200 overflow-hidden min-h-[300px] flex items-center justify-center">
          {scanResult ? (
            <div className="text-center p-6 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900">Code Scanned Successfully!</h4>
              <p className="text-xs font-mono bg-white px-3 py-2 rounded text-emerald-700 border border-emerald-200 break-all shadow-sm">
                {scanResult}
              </p>
              <p className="text-xs text-slate-500">Redirecting to book catalog...</p>
            </div>
          ) : (
            <div id="qr-reader" className="w-full text-slate-800"></div>
          )}
        </div>

        <p className="text-xs text-center text-slate-500 mt-4">
          💡 Mode switch automatically adjusts scanning dimensions for QR or Barcodes.
        </p>
      </div>
    </div>,
    document.body
  );
};
