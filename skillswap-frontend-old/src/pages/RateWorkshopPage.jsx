import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getWorkshopById } from '../services/workshopService';
import { createRating } from '../services/ratingService';

function RateWorkshopPage() {
    const { workshopId } = useParams();
    const navigate = useNavigate();

    const [workshop, setWorkshop] = useState(null);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadWorkshop = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getWorkshopById(workshopId);
                setWorkshop(data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    'Failed to load workshop.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadWorkshop();
    }, [workshopId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!rating) {
            setError('Please select a rating from 1 to 5.');
            return;
        }

        if (!workshop?.teacherId) {
            setError('Unable to identify the workshop host.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await createRating({
                ratedUserId: workshop.teacherId,
                workshopId: Number(workshopId),
                rating,
                review: review.trim()
            });

            setSuccess(true);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                'Failed to submit your rating.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="min-h-screen bg-gray-50 px-4 py-10">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                            <p className="text-gray-500">
                                Loading workshop...
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (success) {
        return (
            <>
                <Navbar />

                <div className="min-h-screen bg-gray-50 px-4 py-10">
                    <div className="max-w-2xl mx-auto">

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">

                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl font-bold">
                                ✓
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mt-5">
                                Thank You!
                            </h1>

                            <p className="text-gray-500 mt-2">
                                Your rating for{' '}
                                <strong>
                                    {workshop?.title}
                                </strong>{' '}
                                has been submitted.
                            </p>

                            <button
                                onClick={() =>
                                    navigate('/workshop-history')
                                }
                                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Back to Workshop History
                            </button>

                        </div>

                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="max-w-2xl mx-auto">

                    <button
                        onClick={() =>
                            navigate('/workshop-history')
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium mb-6 transition"
                    >
                        ← Back to Workshop History
                    </button>

                    {/* Header */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">

                        <p className="text-sm font-semibold text-blue-600">
                            Workshop Feedback
                        </p>

                        <h1 className="text-3xl font-bold text-gray-800 mt-1">
                            Rate Workshop
                        </h1>

                        {workshop && (
                            <>
                                <h2 className="text-xl font-semibold text-gray-800 mt-5">
                                    {workshop.title}
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    Hosted by {workshop.teacherName}
                                </p>

                                <p className="text-gray-500 text-sm mt-2">
                                    {new Date(
                                        workshop.dateTime
                                    ).toLocaleDateString()}
                                    {' · '}
                                    {new Date(
                                        workshop.dateTime
                                    ).toLocaleTimeString(
                                        undefined,
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }
                                    )}
                                </p>
                            </>
                        )}

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    {/* Rating form */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <form onSubmit={handleSubmit}>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    How would you rate this workshop?
                                </label>

                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setRating(value)
                                            }
                                            className={`text-4xl transition ${
                                                value <= rating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300 hover:text-yellow-300'
                                            }`}
                                            aria-label={`${value} star`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                    {rating === 0
                                        ? 'Select a rating'
                                        : `${rating} out of 5 stars`}
                                </p>
                            </div>

                            <div className="mt-7">
                                <label
                                    htmlFor="review"
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                >
                                    Review
                                </label>

                                <textarea
                                    id="review"
                                    value={review}
                                    onChange={(event) =>
                                        setReview(
                                            event.target.value
                                        )
                                    }
                                    maxLength={1000}
                                    rows={6}
                                    placeholder="Tell others what you thought about the workshop..."
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />

                                <p className="text-xs text-gray-400 text-right mt-1">
                                    {review.length}/1000
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                                {submitting
                                    ? 'Submitting Rating...'
                                    : 'Submit Rating'}
                            </button>

                        </form>

                    </div>

                </div>
            </div>
        </>
    );
}

export default RateWorkshopPage;