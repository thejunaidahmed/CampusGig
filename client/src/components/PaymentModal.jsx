import React, { useState } from 'react';
import Modal from './Modal';
import api from '../api/client';

export default function PaymentModal({ open, onClose, gig, onPaymentSuccess }) {
  const [method, setMethod] = useState('EasyPaisa'); // 'EasyPaisa' | 'JazzCash'
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!gig) return null;

  const officialNumber = '03123237006';
  const amount = gig.budget || 1000;

  const handleCopy = () => {
    navigator.clipboard.writeText(officialNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!senderNumber.trim() || !trxId.trim()) {
      setError('Please provide your sender number and Transaction ID (TRX ID).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/gigs/${gig._id}/payment`, {
        method,
        sender_number: senderNumber.trim(),
        trx_id: trxId.trim(),
      });

      if (onPaymentSuccess) {
        onPaymentSuccess(res.data.gig);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Pakistan Mobile Wallet Checkout (EasyPaisa / JazzCash)">
      <div className="space-y-4 text-xs">
        {/* Method selector pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMethod('EasyPaisa')}
            className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              method === 'EasyPaisa'
                ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A859]"></span>
            EasyPaisa
          </button>

          <button
            type="button"
            onClick={() => setMethod('JazzCash')}
            className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              method === 'JazzCash'
                ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E51B24]"></span>
            JazzCash
          </button>
        </div>

        {/* Account Details Box */}
        <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d] space-y-2">
          <div className="flex items-center justify-between text-[#8b949e]">
            <span>Country:</span>
            <span className="font-semibold text-[#f0f6fc]">🇵🇰 Pakistan Only</span>
          </div>

          <div className="flex items-center justify-between text-[#8b949e]">
            <span>Payable Amount:</span>
            <span className="font-bold text-sm text-[#3fb950]">Rs. {amount.toLocaleString()} PKR</span>
          </div>

          <div className="flex items-center justify-between text-[#8b949e]">
            <span>Account Title:</span>
            <span className="font-semibold text-[#f0f6fc]">CampusGig Official</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#30363d]">
            <div>
              <span className="block text-[10px] text-[#8b949e] uppercase font-mono">
                {method} Account Number
              </span>
              <span className="font-mono text-base font-bold text-[#f0f6fc] tracking-wider">
                {officialNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="gh-btn-secondary !py-1 !px-2.5 text-xs font-mono"
            >
              {copied ? '✓ Copied' : 'Copy Number'}
            </button>
          </div>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-1 text-[#8b949e] text-[11px] leading-relaxed">
          <div className="font-semibold text-[#c9d1d9]">How to Pay:</div>
          <div>1. Open your <strong className="text-[#f0f6fc]">{method}</strong> App.</div>
          <div>2. Select <strong>Send Money → Mobile Account</strong>.</div>
          <div>3. Send exactly <strong className="text-[#3fb950]">Rs. {amount.toLocaleString()} PKR</strong> to <strong className="text-[#f0f6fc]">{officialNumber}</strong>.</div>
          <div>4. Enter your Sender Number and Transaction ID (TRX ID) below to confirm:</div>
        </div>

        {error && (
          <div className="p-2 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
            {error}
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleConfirmPayment} className="space-y-2.5 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-[#c9d1d9] mb-1">
              Your Sender Mobile Number
            </label>
            <input
              type="tel"
              required
              placeholder="03XXXXXXXXX"
              className="gh-input text-xs font-mono"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#c9d1d9] mb-1">
              Transaction ID (TRX ID / TID)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 98432104921"
              className="gh-input text-xs font-mono"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="gh-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="gh-btn-primary"
            >
              {submitting ? 'Verifying...' : `Confirm ${method} Payment`}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
