import React, { useEffect, useState } from 'react';
import api from '../api/client';
import GigCard from '../components/GigCard';
import FilterBar from '../components/FilterBar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const emptyFilters = {
  q: '',
  category: '',
  type: '',
  payment_type: '',
  minBudget: '',
  maxBudget: '',
  status: '',
};

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gigs, setGigs] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Quick apply modal
  const [selectedGig, setSelectedGig] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchGigs = () => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    api
      .get('/gigs', { params })
      .then((r) => setGigs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGigs();
  }, [filters]);

  const handleTopSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      q: searchKeywords,
      category: searchCategory || prev.category,
    }));
  };

  const sortedGigs = [...gigs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'budgetHigh') return (b.budget || 0) - (a.budget || 0);
    if (sortBy === 'budgetLow') return (a.budget || 0) - (b.budget || 0);
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    return 0;
  });

  const handleQuickApply = (gig) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedGig(gig);
    setApplyMessage('');
    setApplyError('');
    setApplySuccess(false);
    setApplyModalOpen(true);
  };

  const submitQuickApply = async (e) => {
    e.preventDefault();
    if (!applyMessage.trim()) return;
    setSubmittingApply(true);
    setApplyError('');
    try {
      await api.post('/applications', {
        gig_id: selectedGig._id,
        applicant_id: user._id,
        message: applyMessage,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        fetchGigs();
      }, 1200);
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmittingApply(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Clean GitHub-style Header */}
      <div className="gh-box p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
            Explore Campus Gigs
          </h1>
          <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
            Open marketplace for student projects, skill swaps, and technical collaborations.
          </p>
        </div>

        {/* Search bar matching GitHub repository search */}
        <form
          onSubmit={handleTopSearch}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search gigs or keywords..."
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              className="gh-input !py-1.5 sm:w-64 text-xs pl-8"
            />
            <svg
              className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="gh-input !py-1.5 text-xs sm:w-40"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Writing">Writing</option>
            <option value="Tutoring">Tutoring</option>
          </select>

          <button type="submit" className="gh-btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column: Fixed / Sticky Filter Sidebar on Big Screens without inner scroll */}
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-5 self-start">
          <FilterBar filters={filters} setFilters={setFilters} gigsCount={gigs.length} />
        </div>

        {/* Right Column: Results Feed */}
        <div className="flex-1 w-full space-y-3">
          {/* Results Toolbar */}
          <div className="gh-box px-3.5 py-2.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#f0f6fc]">
              {sortedGigs.length} {sortedGigs.length === 1 ? 'gig' : 'gigs'} available
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#8b949e]">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] text-xs rounded px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="budgetHigh">Highest Budget</option>
                  <option value="budgetLow">Lowest Budget</option>
                  <option value="deadline">Deadline Soonest</option>
                </select>
              </div>

              {/* View switcher */}
              <div className="flex items-center border border-[#30363d] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'grid' ? 'bg-[#21262d] text-[#f0f6fc]' : 'bg-[#161b22] text-[#8b949e]'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 transition-colors border-l border-[#30363d] ${
                    viewMode === 'list' ? 'bg-[#21262d] text-[#f0f6fc]' : 'bg-[#161b22] text-[#8b949e]'
                  }`}
                  title="List view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cards Feed */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="gh-box p-4 animate-pulse h-48 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-[#21262d] rounded w-1/4"></div>
                    <div className="h-5 bg-[#21262d] rounded w-3/4"></div>
                    <div className="h-3 bg-[#21262d] rounded w-full"></div>
                  </div>
                  <div className="h-8 bg-[#21262d] rounded"></div>
                </div>
              ))}
            </div>
          ) : sortedGigs.length === 0 ? (
            <div className="gh-box text-center py-12 px-4 space-y-3">
              <div className="text-2xl">🔍</div>
              <div className="text-sm font-semibold text-[#f0f6fc]">No gigs found</div>
              <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                No active listings match your current filters. Try resetting the filters.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    q: '',
                    category: '',
                    type: '',
                    payment_type: '',
                    minBudget: '',
                    maxBudget: '',
                    status: '',
                  })
                }
                className="gh-btn-secondary text-xs"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
                  : 'flex flex-col space-y-3'
              }
            >
              {sortedGigs.map((g) => (
                <GigCard key={g._id} gig={g} onQuickApply={handleQuickApply} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Apply Modal */}
      {selectedGig && (
        <Modal
          open={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={`Apply to "${selectedGig.title}"`}
        >
          {applySuccess ? (
            <div className="text-center py-4 space-y-2">
              <div className="text-2xl text-[#3fb950]">✓</div>
              <div className="font-semibold text-sm text-[#f0f6fc]">Proposal Submitted</div>
              <p className="text-xs text-[#8b949e]">
                The gig creator has received your proposal.
              </p>
            </div>
          ) : (
            <form onSubmit={submitQuickApply} className="space-y-3">
              <div className="p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] text-xs text-[#8b949e] space-y-0.5">
                <div>
                  <span className="font-semibold text-[#f0f6fc]">Type:</span> {selectedGig.payment_type}
                  {selectedGig.budget ? ` · ৳${selectedGig.budget}` : ''}
                </div>
                <div>
                  <span className="font-semibold text-[#f0f6fc]">Category:</span> {selectedGig.category}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c9d1d9] mb-1">
                  Proposal Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Explain why you are a fit and when you can complete this task..."
                  className="gh-input text-xs"
                />
              </div>

              {applyError && (
                <div className="p-2.5 rounded-md bg-[#b62324]/20 border border-[#f85149]/40 text-[#f85149] text-xs">
                  {applyError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="gh-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApply || !applyMessage.trim()}
                  className="gh-btn-primary"
                >
                  {submittingApply ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
