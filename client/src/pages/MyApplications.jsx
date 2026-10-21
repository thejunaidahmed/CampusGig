import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    api
      .get('/applications', { params: { applicant_id: user._id } })
      .then((r) => setApps(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?._id]);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
          My Proposals
        </h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Track submitted applications and their review statuses.
        </p>
      </div>

      {loading ? (
        <div className="gh-box text-center py-10 text-[#8b949e] text-xs">Loading applications...</div>
      ) : apps.length === 0 ? (
        <div className="gh-box text-center py-12 px-4 space-y-2">
          <div className="text-2xl">📬</div>
          <div className="text-sm font-semibold text-[#f0f6fc]">No proposals sent</div>
          <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
            You haven't applied to any gigs yet.
          </p>
          <Link to="/" className="gh-btn-primary inline-flex mt-2">
            Explore Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {apps.map((a) => (
            <Link
              to={`/gigs/${a.gig_id?._id}`}
              key={a._id}
              className="gh-box gh-box-hover p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 block"
            >
              <div className="space-y-1">
                <div className="font-semibold text-sm text-[#f0f6fc] hover:text-[#58a6ff]">
                  {a.gig_id?.title}
                </div>
                <div className="text-xs text-[#8b949e]">
                  Applied {new Date(a.createdAt).toLocaleDateString()} · {a.gig_id?.category}
                </div>
                <p className="text-xs text-[#c9d1d9] line-clamp-1 italic">
                  "{a.message}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
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
                <span className="gh-btn-secondary !py-1 !px-2.5 text-xs">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
