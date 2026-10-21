import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function MyGigs() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGig, setEditingGig] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await api.get('/gigs', { params: { userId: user._id } });
      setGigs(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your gigs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?._id]);

  const openEdit = (gig) => {
    setEditingGig(gig);
    setForm({
      title: gig.title,
      description: gig.description,
      type: gig.type,
      category: gig.category,
      payment_type: gig.payment_type,
      budget: gig.budget ?? '',
      deadline: new Date(gig.deadline).toISOString().slice(0, 10),
    });
    setError('');
  };

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveGig = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await api.put(`/gigs/${editingGig._id}`, {
        ...form,
        budget: form.payment_type === 'Paid' ? Number(form.budget) : null,
      });
      setGigs((current) => current.map((gig) => gig._id === response.data._id ? response.data : gig));
      setEditingGig(null);
      setForm(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update this gig.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteGig = async (gig) => {
    if (!window.confirm(`Delete "${gig.title}"? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/gigs/${gig._id}`);
      setGigs((current) => current.filter((item) => item._id !== gig._id));
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete this gig.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
            My Gigs
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your listings and review proposals.
          </p>
        </div>
        <Link to="/create" className="gh-btn-primary">
          + New Gig
        </Link>
      </div>

      {error && !editingGig && (
        <div className="p-3 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="gh-box text-center py-10 text-[#8b949e] text-xs">Loading gigs...</div>
      ) : gigs.length === 0 ? (
        <div className="gh-box text-center py-12 px-4 space-y-2">
          <div className="text-2xl">📦</div>
          <div className="text-sm font-semibold text-[#f0f6fc]">No gigs posted yet</div>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
            You haven't created any gigs yet.
          </p>
          <Link to="/create" className="gh-btn-primary inline-flex mt-2">
            Create a Gig
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {gigs.map((g) => (
            <div
              key={g._id}
              className="gh-box gh-box-hover p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`gh-badge ${
                      g.status === 'Open'
                        ? 'gh-badge-open'
                        : g.status === 'In Progress'
                        ? 'gh-badge-progress'
                        : g.status === 'Completed'
                        ? 'gh-badge-completed'
                        : 'gh-badge-neutral'
                    }`}
                  >
                    ● {g.status}
                  </span>
                  <span className="text-[11px] text-[#8b949e] font-mono">{g.category}</span>
                  <span className="text-[11px] text-[#8b949e]">
                    · Due {new Date(g.deadline).toLocaleDateString()}
                  </span>
                </div>
                <Link to={`/gigs/${g._id}`} className="block font-semibold text-[#f0f6fc] text-sm hover:text-[#58a6ff]">
                  {g.title}
                </Link>
                <div className="text-xs text-[#8b949e]">
                  {g.type} · {g.payment_type}
                  {g.budget ? ` · ৳${g.budget}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link to={`/gigs/${g._id}`} className="gh-btn-secondary !py-1 !px-2.5 text-xs">
                  Manage
                </Link>
                {g.status === 'Open' && (
                  <button
                    type="button"
                    onClick={() => openEdit(g)}
                    className="gh-btn-secondary !py-1 !px-2.5 text-xs"
                  >
                    Edit
                  </button>
                )}
                {['Open', 'Expired', 'Cancelled'].includes(g.status) && (
                  <button
                    type="button"
                    onClick={() => deleteGig(g)}
                    className="gh-btn-secondary !py-1 !px-2.5 text-xs !text-[#f85149]"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editingGig)}
        onClose={() => {
          if (!submitting) {
            setEditingGig(null);
            setForm(null);
            setError('');
          }
        }}
        title="Edit Gig"
      >
        {form && (
          <form onSubmit={saveGig} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Title</label>
              <input
                className="gh-input text-xs"
                required
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Description</label>
              <textarea
                className="gh-input text-xs"
                rows={4}
                required
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Type</label>
                <select className="gh-input text-xs" value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                  <option value="Offering">Offering</option>
                  <option value="Requesting">Requesting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Category</label>
                <select className="gh-input text-xs" value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Writing">Writing</option>
                  <option value="Tutoring">Tutoring</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Payment</label>
                <select className="gh-input text-xs" value={form.payment_type} onChange={(event) => updateForm('payment_type', event.target.value)}>
                  <option value="Paid">Paid</option>
                  <option value="SkillSwap">SkillSwap</option>
                  <option value="Free">Free</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Budget (PKR)</label>
                <input
                  type="number"
                  min="1"
                  required={form.payment_type === 'Paid'}
                  disabled={form.payment_type !== 'Paid'}
                  className="gh-input text-xs disabled:opacity-40"
                  value={form.payment_type === 'Paid' ? form.budget : ''}
                  onChange={(event) => updateForm('budget', event.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Deadline</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  className="gh-input text-xs"
                  value={form.deadline}
                  onChange={(event) => updateForm('deadline', event.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="p-2.5 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#30363d]">
              <button
                type="button"
                className="gh-btn-secondary"
                disabled={submitting}
                onClick={() => {
                  setEditingGig(null);
                  setForm(null);
                  setError('');
                }}
              >
                Cancel
              </button>
              <button type="submit" className="gh-btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
