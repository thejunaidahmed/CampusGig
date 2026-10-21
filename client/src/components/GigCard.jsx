import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GigCard({ gig, onQuickApply }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTags = () => {
    const defaultTags = [gig.category, gig.type];
    if (gig.category === 'Programming') defaultTags.push('React', 'Node.js');
    else if (gig.category === 'Design') defaultTags.push('UI/UX', 'Figma');
    else if (gig.category === 'Writing') defaultTags.push('Content', 'Editing');
    else if (gig.category === 'Tutoring') defaultTags.push('Course Help', 'Mentorship');
    return Array.from(new Set(defaultTags)).slice(0, 4);
  };

  const isOwner = user && gig.user_id && (gig.user_id._id === user._id || gig.user_id === user._id);
  const tags = getTags();

  return (
    <div className="gh-box gh-box-hover p-4 flex flex-col justify-between group">
      <div>
        {/* Top Header: GitHub issue state badge, category, timestamp */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
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
            <span className="text-[#8b949e] font-mono text-[11px]">
              {gig.category}
            </span>
          </div>

          <span className="text-[#8b949e] text-[11px]">
            {getRelativeTime(gig.createdAt)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/gigs/${gig._id}`}>
          <h3 className="font-semibold text-[#f0f6fc] text-base group-hover:text-[#58a6ff] transition-colors line-clamp-2 leading-snug">
            {gig.title}
          </h3>
        </Link>

        {/* Metadata info */}
        <div className="flex items-center gap-2 my-2 text-xs text-[#8b949e]">
          <span className="font-medium text-[#c9d1d9]">{gig.user_id?.name || 'Campus Student'}</span>
          <span>·</span>
          <span>{gig.user_id?.major ? `${gig.user_id.major} Dept` : 'Student'}</span>
          <span>·</span>
          <span>Due {new Date(gig.deadline).toLocaleDateString()}</span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
          {gig.description}
        </p>

        {/* GitHub style labels */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Price, Proposals, Action */}
      <div className="pt-3.5 mt-3.5 border-t border-[#30363d] flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#3fb950]">
            {gig.payment_type === 'Paid' && gig.budget
              ? `Rs. ${gig.budget.toLocaleString()} PKR`
              : gig.payment_type}
          </span>
          <span className="text-xs text-[#8b949e]">
            {gig.applications?.length ? `${gig.applications.length} proposals` : 'Active listing'}
          </span>
        </div>

        <div>
          {isOwner ? (
            <button
              onClick={() => navigate(`/gigs/${gig._id}`)}
              className="gh-btn-secondary !py-1 !px-3 text-xs"
            >
              Manage
            </button>
          ) : (
            <button
              onClick={() => {
                if (onQuickApply) {
                  onQuickApply(gig);
                } else {
                  navigate(`/gigs/${gig._id}`);
                }
              }}
              className="gh-btn-primary !py-1 !px-3 text-xs"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
