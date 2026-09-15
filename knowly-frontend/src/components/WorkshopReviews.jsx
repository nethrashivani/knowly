import { useEffect, useState } from 'react';
import { createRating, getMyRatingForWorkshop, getRatingsForWorkshop } from '../services/ratingService';

export default function WorkshopReviews({ workshop, application, isTeacher }) {
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const completed = workshop?.dateTime && new Date(workshop.dateTime) < new Date();
  const canReview = !isTeacher && application?.status === 'ACCEPTED' && completed;

  const loadRatings = async () => {
    try {
      setLoading(true);
      const reviews = await getRatingsForWorkshop(workshop.id);
      setRatings(reviews);
      if (canReview) setMyRating(await getMyRatingForWorkshop(workshop.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workshop reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshop?.id) loadRatings();
  }, [workshop?.id, application?.status, completed]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please select a rating from 1 to 5.');
    try {
      setSubmitting(true);
      setError('');
      const saved = await createRating({
        ratedUserId: workshop.teacherId,
        workshopId: workshop.id,
        rating,
        review: review.trim()
      });
      setRatings((prev) => [saved, ...prev]);
      setMyRating(saved);
      setRating(0);
      setReview('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const average = ratings.length
    ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-gray-900">Workshop Reviews</h4>
          <p className="text-sm text-gray-500 mt-1">Feedback from people who enrolled in this workshop.</p>
        </div>
        {average && <div className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-semibold">★ {average} · {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</div>}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 mt-4">Loading reviews...</p>
      ) : (
        <>
          {ratings.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 mt-4 text-sm text-gray-500">No reviews yet.</div>
          ) : (
            <div className="space-y-3 mt-4">
              {ratings.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-800">{item.reviewerName}</p>
                    <span className="text-yellow-500 tracking-wide">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                  </div>
                  {item.review && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.review}</p>}
                </div>
              ))}
            </div>
          )}

          {canReview && !myRating && (
            <form onSubmit={submitReview} className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="font-semibold text-blue-900">How was the workshop?</p>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" onClick={() => setRating(value)} className={`text-3xl ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
              <textarea value={review} onChange={(e) => setReview(e.target.value)} maxLength={1000} rows={3} placeholder="Share your experience (optional)" className="w-full mt-3 border border-gray-300 rounded-lg px-3 py-2 bg-white" />
              <button disabled={submitting} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </form>
          )}

          {myRating && <div className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 font-medium">You already reviewed this workshop. Thanks for the feedback!</div>}
          {!isTeacher && application?.status === 'ACCEPTED' && !completed && <div className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">You can review this workshop after it has taken place.</div>}
          {!isTeacher && application?.status !== 'ACCEPTED' && <div className="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">Only enrolled learners can review this workshop.</div>}
        </>
      )}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  );
}