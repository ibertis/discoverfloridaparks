'use client';

import { useState, useCallback } from 'react';
import type { PlaceReview } from '@/app/api/hotel-reviews/route';

interface Props {
  placeId: string;
  hotelName: string;
  reviewCount: number;
  rating: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', fontSize: '0.82rem', color: '#ddd8d0', lineHeight: 1, letterSpacing: '0.05em', userSelect: 'none' }}>
      {'★★★★★'}
      <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: `${(rating / 5) * 100}%`, whiteSpace: 'nowrap', color: '#e8a020' }}>
        {'★★★★★'}
      </span>
    </span>
  );
}

export default function HotelReviewsModal({ placeId, hotelName, reviewCount, rating }: Props) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<PlaceReview[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(async () => {
    setOpen(true);
    if (reviews) return; // already fetched
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotel-reviews?placeId=${encodeURIComponent(placeId)}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json() as { reviews: PlaceReview[] };
      setReviews(data.reviews);
    } catch {
      setError('Could not load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [placeId, reviews]);

  const closeModal = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* Trigger button — inline with review count */}
      <button
        onClick={openModal}
        style={{
          background: 'none', border: 'none', padding: 0, margin: 0,
          cursor: 'pointer', fontFamily: 'Archivo, sans-serif',
          fontSize: '0.75rem', color: '#a6967c', textDecoration: 'underline',
          textDecorationStyle: 'dotted', textUnderlineOffset: 3,
        }}
        aria-label={`Read ${reviewCount} reviews for ${hotelName}`}
      >
        ({reviewCount.toLocaleString()} reviews)
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Reviews for ${hotelName}`}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 20,
            width: '100%', maxWidth: 540,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #f0ece6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', marginBottom: 4 }}>
                  {hotelName}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <StarRating rating={rating} />
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#362f35' }}>{rating}</span>
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c' }}>({reviewCount.toLocaleString()} reviews on Google)</span>
                </div>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close reviews"
                style={{ background: '#f5f0ec', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#726d6b', fontSize: '1rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1 }}>
              {loading && (
                <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', color: '#a6967c' }}>
                  Loading reviews…
                </div>
              )}
              {error && (
                <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', color: '#c0392b' }}>
                  {error}
                </div>
              )}
              {reviews && reviews.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', color: '#a6967c' }}>
                  No recent reviews available.
                </div>
              )}
              {reviews && reviews.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.map((review, i) => (
                    <div key={i} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #f5f0ec' : 'none', paddingBottom: i < reviews.length - 1 ? 16 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {review.authorPhotoUrl
                          ? <img src={review.authorPhotoUrl} alt="" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: '#a6967c', fontWeight: 700 }}>{review.authorName[0]}</div>
                        }
                        <div>
                          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#1a1a1a' }}>{review.authorName}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <StarRating rating={review.rating} />
                            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#a6967c' }}>{review.relativeTime}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.84rem', color: '#50454c', lineHeight: 1.65, margin: 0 }}>
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', color: '#c4bab3' }}>
                Powered by Google
              </span>
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#ff7044', textDecoration: 'none' }}
              >
                See all reviews on Google Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
