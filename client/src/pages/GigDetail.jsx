import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import PaymentModal from '../components/PaymentModal';

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const isOwner = user && gig && gig.user_id?._id === user._id;
  const isAcceptedApplicant = user && gig && gig.accepted_applicant_id === user._id;

  const load = async () => {
    try {
      setLoading(true);
      const includeApps = !!user;
      const g = await api.get(`/gigs/${id}`, { params: { includeApps: includeApps ? 'true' : 'false' } });
      setGig(g.data);
      setApplications(g.data.applications || []);
      const r = await api.get('/reviews', { params: { gig_id: id } });
      setReviews(r.data);
    } catch (err) {
      console.error(err);
      setError('Could not load gig details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, user?._id]);

  if (loading && !gig) {
    return (
      <div className="gh-box text-center py-16 text-[#8b949e] max-w-4xl mx-auto text-xs">
        Loading gig details...
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="gh-box text-center py-16 text-[#8b949e] max-w-4xl mx-auto space-y-2 text-xs">
        <div>Gig not found.</div>
        <Link to="/" className="text-[#58a6ff] hover:underline font-semibold block">
          Back to Gigs
        </Link>
      </div>
    );
  }

  const apply = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/applications', { gig_id: gig._id, applicant_id: user._id, message: applyMsg });
      setApplyOpen(false);
      setApplyMsg('');
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to apply');
    }
  };

  const accept = async (applicantId) => {
    setError('');
    try {
      await api.patch(`/gigs/${gig._id}`, { action: 'accept', applicant_id: applicantId });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to accept');
    }
  };

  const reject = async (applicantId) => {
    setError('');
    try {
      await api.patch(`/gigs/${gig._id}`, { action: 'reject', applicant_id: applicantId });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to reject application');
    }
  };

  const complete = async () => {
    setError('');
    try {
      await api.patch(`/gigs/${gig._id}`, { action: 'complete' });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to complete');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reviews', {
        gig_id: gig._id,
        rating,
        comment,
      });
      setReviewOpen(false);
      setComment('');
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to review');
    }
  };

  const hasReviewed = reviews.some((r) => r.reviewer_id?._id === user?._id);
  const canReview = gig.status === 'Completed' && (isOwner || isAcceptedApplicant) && !hasReviewed;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors"
        >
          <span>←</span> Back to Explore
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
          {error}
        </div>
      )}

      {/* Main Gig Details Card */}
      <div className="gh-box p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#30363d]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`gh-badge ${
                  gig.status === 'Open'
                    ? 'gh-badge-open'
                    : gig.status === 'In Progress'
                    ? 'gh-badge-progress'
                    : gig.status === 'Completed'
                    ? 'gh-badge-completed'
                    : 'gh-badge-neutral'
                }`}
              >
                ● {gig.status}
              </span>
              <span className="text-xs text-[#8b949e] font-mono">{gig.category}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
              {gig.title}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-xs text-[#8b949e]">
              <span>Opened by</span>
              <Link
                to={`/profile/${gig.user_id?._id}`}
                className="font-semibold text-[#58a6ff] hover:underline"
              >
                {gig.user_id?.name || 'Student'}
              </Link>
              <span>· {gig.user_id?.major} Department</span>
              <span>· {new Date(gig.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-line py-2">
          {gig.description}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-md bg-[#0d1117] border border-[#30363d] text-xs">
          <div>
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Payment</div>
            <div className="font-semibold text-[#f0f6fc] mt-0.5">{gig.payment_type}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Budget (PKR)</div>
            <div className="font-semibold text-[#3fb950] mt-0.5">
              {gig.payment_type === 'Paid' && gig.budget ? `Rs. ${gig.budget.toLocaleString()} PKR` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Type</div>
            <div className="font-semibold text-[#f0f6fc] mt-0.5">{gig.type}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Deadline</div>
            <div className="font-semibold text-[#f0f6fc] mt-0.5">
              {new Date(gig.deadline).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Pakistan EasyPaisa / JazzCash Payment Status Box */}
        {gig.payment_type === 'Paid' && (
          <div className="p-3.5 rounded-md bg-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f0f6fc]">🇵🇰 EasyPaisa / JazzCash Payment</span>
                {gig.payment_status === 'Paid' ? (
                  <span className="gh-badge gh-badge-open">✓ Verified Paid</span>
                ) : (
                  <span className="gh-badge gh-badge-neutral text-[#d29922] border-[#d29922]/40">
                    Unpaid / Pending
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#8b949e]">
                Official Account: <span className="font-mono font-semibold text-[#f0f6fc]">03123237006</span>
                {gig.payment_trx_id && (
                  <span className="ml-2 font-mono text-[#58a6ff]">TRX: {gig.payment_trx_id}</span>
                )}
              </div>
            </div>

            {gig.payment_status !== 'Paid' && (
              <button
                type="button"
                onClick={() => setPaymentOpen(true)}
                className="gh-btn-primary !bg-[#238636] hover:!bg-[#2ea043] text-xs font-semibold shrink-0"
              >
                💳 Pay via EasyPaisa / JazzCash
              </button>
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#30363d]">
          {!isOwner && gig.status === 'Open' && user && (
            <button className="gh-btn-primary" onClick={() => setApplyOpen(true)}>
              Apply to Gig
            </button>
          )}
          {!user && (
            <button className="gh-btn-primary" onClick={() => navigate('/login')}>
              Sign in to Apply
            </button>
          )}
          {isOwner && gig.status === 'In Progress' && (
            <button className="gh-btn-primary" onClick={complete}>
              Mark as Completed
            </button>
          )}
          {canReview && (
            <button className="gh-btn-secondary" onClick={() => setReviewOpen(true)}>
              Leave Peer Review
            </button>
          )}
        </div>
      </div>

      {/* Owner view: Proposals received */}
      {isOwner && gig.status !== 'Completed' && (
        <div className="gh-box p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
            <h2 className="font-bold text-xs text-[#f0f6fc]">
              Proposals Received ({applications.length})
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-6 text-[#8b949e] text-xs">
              No proposals submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {applications.map((a) => (
                <div
                  key={a._id}
                  className="p-3 rounded-md bg-[#0d1117] border border-[#30363d] flex flex-col sm:flex-row justify-between items-start gap-3"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/profile/${a.applicant_id?._id}`}
                      className="font-semibold text-xs text-[#58a6ff] hover:underline"
                    >
                      {a.applicant_id?.name}
                    </Link>
                    <div className="text-[11px] text-[#8b949e]">
                      {a.applicant_id?.major} Department
                    </div>
                    <p className="text-xs text-[#c9d1d9] mt-1 bg-[#161b22] p-2.5 rounded border border-[#30363d]">
                      "{a.message}"
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        a.status === 'Accepted'
                          ? 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                          : a.status === 'Rejected'
                          ? 'bg-[#b62324]/20 text-[#f85149] border border-[#f85149]/30'
                          : 'bg-[#d29922]/20 text-[#e3b341] border border-[#d29922]/30'
                      }`}
                    >
                      {a.status}
                    </span>
                    {gig.status === 'Open' && a.status === 'Pending' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          className="gh-btn-primary !py-1 !px-2.5 text-xs"
                          onClick={() => accept(a.applicant_id._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="gh-btn-secondary !py-1 !px-2.5 text-xs"
                          onClick={() => reject(a.applicant_id._id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Peer Reviews section */}
      <div className="gh-box p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <h2 className="font-bold text-xs text-[#f0f6fc]">
            Peer Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-6 text-[#8b949e] text-xs">
            No reviews left on this gig yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <div key={r._id} className="p-3 rounded-md bg-[#0d1117] border border-[#30363d] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#f0f6fc]">
                    {r.reviewer_id?.name || 'Verified Peer'}
                  </span>
                  <StarRating value={r.rating} size="text-xs" />
                </div>
                {r.comment && <p className="text-xs text-[#8b949e]">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title="Submit Proposal">
        <form onSubmit={apply} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">
              Proposal Message
            </label>
            <textarea
              required
              rows={4}
              className="gh-input text-xs"
              placeholder="Explain your approach and relevant experience..."
              value={applyMsg}
              onChange={(e) => setApplyMsg(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
            <button type="button" className="gh-btn-secondary" onClick={() => setApplyOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gh-btn-primary" disabled={!applyMsg.trim()}>
              Submit Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Peer Review">
        <form onSubmit={submitReview} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#c9d1d9] block mb-1">Rating</label>
            <StarRating value={rating} onChange={setRating} size="text-lg" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#c9d1d9] block mb-1">Feedback</label>
            <textarea
              required
              rows={3}
              className="gh-input text-xs"
              placeholder="How was the collaboration and code/work quality?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t border-[#30363d]">
            <button type="button" className="gh-btn-secondary" onClick={() => setReviewOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gh-btn-primary">
              Submit Review
            </button>
          </div>
        </form>
      </Modal>

      {/* Pakistan EasyPaisa / JazzCash Checkout Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        gig={gig}
        onPaymentSuccess={(updatedGig) => {
          setGig(updatedGig);
        }}
      />
    </div>
  );
}
