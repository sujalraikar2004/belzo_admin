import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { mockStore } from '../mock/mockStore';
import { Review } from '../types';

export const ReviewsView: React.FC = () => {
  const { navigateTo, addToast } = useUIStore();
  const [reviews, setReviews] = useState<Review[]>(mockStore.getReviews());
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    return mockStore.subscribe(() => {
      setReviews([...mockStore.getReviews()]);
    });
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.customerName.toLowerCase().includes(q) ||
        r.restaurantName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (ratingFilter !== 'ALL' && r.rating !== parseInt(ratingFilter, 10)) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = (review: Review, newStatus: 'PUBLISHED' | 'FLAGGED' | 'HIDDEN') => {
    mockStore.updateReviewStatus(review.id, newStatus);
    addToast({
      type: 'INFO',
      title: 'Review Moderated',
      message: `Review #${review.id} marked as ${newStatus}.`,
    });
  };

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, reviews.length)
  ).toFixed(1);

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Header */}
      <div className="pt-space-md pb-space-lg flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-md">
        <div className="flex flex-col space-y-space-2xs">
          <nav className="flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
            <span onClick={() => navigateTo('dashboard')} className="hover:text-on-surface cursor-pointer">
              Overview
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Reviews & Ratings</span>
          </nav>
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Customer Ratings & Review Moderation
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">star</span> {avgRating} Platform Score
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Audit food quality feedback, merchant kitchen hygiene ratings, rider courtesy sentiment, and manage abusive content flags.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search reviews by customer, restaurant, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Rating:</span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars ★★★★★</option>
              <option value="4">4 Stars ★★★★</option>
              <option value="3">3 Stars ★★★</option>
              <option value="2">2 Stars ★★</option>
              <option value="1">1 Star ★</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Moderation:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-lg text-on-surface font-label-md text-label-md focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="FLAGGED">Flagged for Audit</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {filteredReviews.map((review) => {
          return (
            <div
              key={review.id}
              className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-on-surface block text-base">{review.customerName}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-primary font-bold text-xs">For: {review.restaurantName}</span>
                      <span className="text-on-surface-variant text-[11px] font-mono">({review.orderId})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-amber-700 font-bold text-sm">
                    <span>{review.rating}.0</span>
                    <span className="material-symbols-outlined text-[16px]">star</span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-on-surface leading-relaxed italic bg-surface-container-low/40 p-3 rounded-lg border border-surface-container-high/40">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-mono">{review.date}</span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      review.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : review.status === 'FLAGGED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {review.status}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        review,
                        review.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED'
                      )
                    }
                    className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    title={review.status === 'PUBLISHED' ? 'Hide Review' : 'Publish Review'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {review.status === 'PUBLISHED' ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
