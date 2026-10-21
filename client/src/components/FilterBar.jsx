import React from 'react';

export default function FilterBar({ filters, setFilters, gigsCount = 0 }) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      q: '',
      category: '',
      type: '',
      payment_type: '',
      minBudget: '',
      maxBudget: '',
      status: '',
    });
  };

  const categories = ['Programming', 'Design', 'Writing', 'Tutoring'];
  const projectTypes = [
    { label: 'All', value: '' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Swap', value: 'SkillSwap' },
    { label: 'Free', value: 'Free' },
  ];

  const budgetRanges = [
    { label: 'Any Budget', min: '', max: '' },
    { label: '< Rs. 500 PKR', min: '0', max: '500' },
    { label: 'Rs. 500 - 1.5K PKR', min: '500', max: '1500' },
    { label: 'Rs. 1.5K - 3K PKR', min: '1500', max: '3000' },
    { label: 'Rs. 3K+ PKR', min: '3000', max: '' },
  ];

  const isBudgetSelected = (min, max) => {
    return filters.minBudget === min && filters.maxBudget === max;
  };

  return (
    <div className="gh-box p-4 space-y-4 lg:sticky lg:top-5 self-start">
      {/* Header: Title + Reset */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-semibold text-xs text-[#f0f6fc]">Filters</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-[#58a6ff] hover:underline font-medium"
        >
          Reset
        </button>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="gh-input cursor-pointer text-xs"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Project Payment Model: Segmented Buttons */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
          Payment Type
        </label>
        <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#0d1117] rounded-md border border-[#30363d]">
          {projectTypes.map((pt) => {
            const active = filters.payment_type === pt.value;
            return (
              <button
                key={pt.label}
                type="button"
                onClick={() => update('payment_type', pt.value)}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  active
                    ? 'bg-[#21262d] text-[#f0f6fc] font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offering vs Requesting */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
          Listing Intent
        </label>
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#0d1117] rounded-md border border-[#30363d]">
          {[
            { label: 'All', value: '' },
            { label: 'Offers', value: 'Offering' },
            { label: 'Requests', value: 'Requesting' },
          ].map((item) => {
            const active = filters.type === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => update('type', item.value)}
                className={`py-1 text-[11px] font-medium rounded transition-colors ${
                  active
                    ? 'bg-[#21262d] text-[#f0f6fc] font-semibold shadow-sm'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Brackets */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
          Budget Bracket
        </label>
        <select
          value={
            budgetRanges.find((r) => isBudgetSelected(r.min, r.max))?.label || 'Any Budget'
          }
          onChange={(e) => {
            const range = budgetRanges.find((r) => r.label === e.target.value);
            if (range) {
              update('minBudget', range.min);
              update('maxBudget', range.max);
            }
          }}
          className="gh-input cursor-pointer text-xs"
        >
          {budgetRanges.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
          Status
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Any', value: '' },
            { label: 'Open', value: 'Open' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
          ].map((st) => {
            const active = filters.status === st.value;
            return (
              <button
                key={st.label}
                type="button"
                onClick={() => update('status', st.value)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  active
                    ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/50 font-semibold'
                    : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#8b949e]'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
