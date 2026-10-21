import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import StarRating from '../components/StarRating';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`).then((r) => setProfile(r.data)),
      api.get('/reviews', { params: { reviewee_id: id } }).then((r) => setReviews(r.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="gh-box text-center py-16 text-[#8b949e] max-w-4xl mx-auto text-xs">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="gh-box text-center py-16 text-[#8b949e] max-w-4xl mx-auto space-y-2 text-xs">
        <div>User not found.</div>
        <Link to="/" className="text-[#58a6ff] hover:underline font-semibold block">
          Back to Gigs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Profile Header */}
      <div className="gh-box p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full bg-[#21262d] border border-[#30363d] text-[#f0f6fc] font-bold flex items-center justify-center text-2xl">
              {profile.name?.[0] || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc]">
                  {profile.name}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#21262d] text-[#3fb950] border border-[#238636]/40">
                  Verified Student
                </span>
              </div>
              <div className="text-xs text-[#8b949e] mt-0.5">
                {profile.major} Department · Semester {profile.semester}
              </div>
              <div className="text-xs text-[#8b949e]">{profile.email}</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-[#c9d1d9] leading-relaxed pt-2 border-t border-[#30363d]">
            {profile.bio}
          </p>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="pt-2 border-t border-[#30363d]">
            <div className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5">
              Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reputation Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#30363d]">
          <div className="p-3 rounded-md bg-[#0d1117] border border-[#30363d]">
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Gigs Posted</div>
            <div className="text-lg font-bold text-[#f0f6fc] mt-0.5">{profile.gigsPosted || 0}</div>
          </div>
          <div className="p-3 rounded-md bg-[#0d1117] border border-[#30363d]">
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Completed</div>
            <div className="text-lg font-bold text-[#f0f6fc] mt-0.5">{profile.gigsCompleted || 0}</div>
          </div>
          <div className="p-3 rounded-md bg-[#0d1117] border border-[#30363d]">
            <div className="text-[10px] text-[#8b949e] uppercase font-semibold">Rating</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-bold text-[#f0f6fc]">
                {profile.reviewCount ? profile.averageRating.toFixed(1) : '—'}
              </span>
              {profile.reviewCount > 0 && <StarRating value={profile.averageRating} size="text-xs" />}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews feed */}
      <div className="gh-box p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
          <h2 className="font-bold text-xs text-[#f0f6fc]">
            Peer Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[#8b949e] text-xs">
            No reviews left for this student yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="p-3 rounded-md bg-[#0d1117] border border-[#30363d] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#f0f6fc]">
                    {r.reviewer_id?.name || 'Verified Peer'}
                  </span>
                  <StarRating value={r.rating} size="text-xs" />
                </div>
                {r.comment && (
                  <p className="text-xs text-[#8b949e] leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
