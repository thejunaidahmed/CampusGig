import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreateGig() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Offering',
    category: 'Programming',
    payment_type: 'Paid',
    budget: '',
    deadline: '',
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/gigs', {
        ...form,
        user_id: user._id,
        budget: form.payment_type === 'Paid' ? Number(form.budget) : null,
      });
      navigate('/my-gigs');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create gig');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
          Create a New Gig
        </h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Post an offer or request assistance from campus peers.
        </p>
      </div>

      <form onSubmit={submit} className="gh-box p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Title</label>
          <input
            className="gh-input text-xs"
            required
            placeholder="e.g., React fullstack integration or Calculus tutoring"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Description</label>
          <textarea
            className="gh-input min-h-28 text-xs leading-relaxed"
            required
            placeholder="Describe deliverables, requirements, and scope..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Intent</label>
            <select
              className="gh-input text-xs cursor-pointer"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            >
              <option value="Offering">Offering Skills</option>
              <option value="Requesting">Requesting Assistance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Category</label>
            <select
              className="gh-input text-xs cursor-pointer"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Tutoring">Tutoring</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Compensation</label>
            <select
              className="gh-input text-xs cursor-pointer"
              value={form.payment_type}
              onChange={(e) => update('payment_type', e.target.value)}
            >
              <option value="Paid">Paid</option>
              <option value="SkillSwap">SkillSwap</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">
              Budget in PKR (Rs.) {form.payment_type !== 'Paid' ? '(disabled)' : '· EasyPaisa / JazzCash'}
            </label>
            <input
              type="number"
              min="1"
              disabled={form.payment_type !== 'Paid'}
              placeholder="e.g., 2500"
              className="gh-input text-xs disabled:opacity-40"
              value={form.budget}
              onChange={(e) => update('budget', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">Deadline</label>
            <input
              type="date"
              className="gh-input text-xs"
              required
              value={form.deadline}
              onChange={(e) => update('deadline', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
            {error}
          </div>
        )}

        <div className="pt-3 border-t border-[#30363d] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="gh-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="gh-btn-primary"
          >
            {submitting ? 'Publishing...' : 'Publish Gig'}
          </button>
        </div>
      </form>
    </div>
  );
}
