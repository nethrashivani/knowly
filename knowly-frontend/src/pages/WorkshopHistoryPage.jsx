import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import { getMyWorkshops } from '../services/workshopService';
import { getMyApplications } from '../services/workshopApplicationService';
import { getRatingsForUser } from '../services/ratingService';

function WorkshopHistoryPage() {
    const navigate = useNavigate();

    const [hostedWorkshops, setHostedWorkshops] = useState([]);
    const [attendedWorkshops, setAttendedWorkshops] = useState([]);

    const [workshopRatings, setWorkshopRatings] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHistory = async () => {
            try {
                setLoading(true);
                setError('');

                const [myWorkshops, myApplications] =
                    await Promise.all([
                        getMyWorkshops(),
                        getMyApplications()
                    ]);

                const now = new Date();

                const completedHosted = myWorkshops.filter(
                    (workshop) =>
                        workshop.dateTime &&
                        new Date(workshop.dateTime) < now
                );

                const completedAttended = myApplications.filter(
                    (application) =>
                        application.status === 'ACCEPTED' &&
                        application.workshopDateTime &&
                        new Date(application.workshopDateTime) < now
                );

                setHostedWorkshops(completedHosted);
                setAttendedWorkshops(completedAttended);

                /*
                 * Get ratings given to the current teacher.
                 *
                 * All workshops in "My Hosted Workshops" belong
                 * to the same teacher, so we only need one
                 * teacher ID to retrieve all of their ratings.
                 */
                if (
                    completedHosted.length > 0 &&
                    completedHosted[0].teacherId
                ) {
                    const ratings = await getRatingsForUser(
                        completedHosted[0].teacherId
                    );

                    const ratingsByWorkshop = {};

                    ratings.forEach((rating) => {
                        if (!ratingsByWorkshop[rating.workshopId]) {
                            ratingsByWorkshop[rating.workshopId] = [];
                        }

                        ratingsByWorkshop[rating.workshopId].push(
                            rating
                        );
                    });

                    setWorkshopRatings(ratingsByWorkshop);
                }
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    'Failed to load workshop history.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    const formatDate = (dateTime) => {
        return new Date(dateTime).toLocaleDateString(
            undefined,
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString(
            undefined,
            {
                hour: '2-digit',
                minute: '2-digit'
            }
        );
    };

    const renderEmptyState = (message) => (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
                No completed workshops
            </h3>

            <p className="text-gray-500 mt-2">
                {message}
            </p>
        </div>
    );

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="min-h-screen bg-gray-50 px-4 py-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                            <p className="text-gray-500">
                                Loading workshop history...
                            </p>
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
                <div className="max-w-6xl mx-auto">

                    {/* Back */}
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-800 font-medium mb-6 transition"
                    >
                        ← Back to Home
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Workshop History
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Look back at the workshops you hosted and attended.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-8">
                            {error}
                        </div>
                    )}

                    {/* Hosted */}
                    <section className="mb-10">

                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Workshops I Hosted
                                </h2>

                                <p className="text-gray-500 text-sm mt-1">
                                    Workshops you created that have already
                                    taken place.
                                </p>
                            </div>

                            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                {hostedWorkshops.length}
                            </span>
                        </div>

                        {hostedWorkshops.length === 0 ? (
                            renderEmptyState(
                                'Completed workshops you host will appear here.'
                            )
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {hostedWorkshops.map((workshop) => {
                                    const ratings =
                                        workshopRatings[workshop.id] || [];

                                    return (
                                        <div
                                            key={workshop.id}
                                            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                                        >

                                            {/* Workshop header */}
                                            <div>
                                                <span className="inline-block text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full mb-3">
                                                    Completed
                                                </span>

                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {workshop.title}
                                                </h3>
                                            </div>

                                            {/* Workshop details */}
                                            <div className="mt-4 space-y-2 text-sm text-gray-600">

                                                <p>
                                                    <span className="font-semibold">
                                                        Date:
                                                    </span>{' '}
                                                    {formatDate(
                                                        workshop.dateTime
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="font-semibold">
                                                        Time:
                                                    </span>{' '}
                                                    {formatTime(
                                                        workshop.dateTime
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="font-semibold">
                                                        Location:
                                                    </span>{' '}
                                                    {workshop.location}
                                                </p>

                                                {workshop.capacity && (
                                                    <p>
                                                        <span className="font-semibold">
                                                            Capacity:
                                                        </span>{' '}
                                                        {workshop.capacity}
                                                    </p>
                                                )}

                                            </div>

                                            {/* Ratings for THIS workshop */}
                                            <div className="mt-5 border-t border-gray-200 pt-5">

                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-800">
                                                        Feedback
                                                    </h4>

                                                    {ratings.length > 0 && (
                                                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                                                            {ratings.length}{' '}
                                                            {ratings.length === 1
                                                                ? 'rating'
                                                                : 'ratings'}
                                                        </span>
                                                    )}
                                                </div>

                                                {ratings.length === 0 ? (

                                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                                        <p className="text-sm text-gray-500">
                                                            No ratings yet.
                                                        </p>
                                                    </div>

                                                ) : (

                                                    <div className="space-y-3">

                                                        {ratings.map(
                                                            (rating) => (
                                                                <div
                                                                    key={
                                                                        rating.id
                                                                    }
                                                                    className="bg-gray-50 rounded-xl p-4"
                                                                >

                                                                    <div className="flex items-start justify-between gap-3">

                                                                        <div>
                                                                            <p className="font-semibold text-gray-800">
                                                                                {
                                                                                    rating.reviewerName
                                                                                }
                                                                            </p>

                                                                            <div className="flex items-center gap-1 mt-1">

                                                                                <span className="text-yellow-500">
                                                                                    {'★'.repeat(
                                                                                        rating.rating
                                                                                    )}
                                                                                </span>

                                                                                <span className="text-sm text-gray-500 ml-1">
                                                                                    {
                                                                                        rating.rating
                                                                                    }
                                                                                    /5
                                                                                </span>

                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                    {rating.review && (
                                                                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                                                            "
                                                                            {
                                                                                rating.review
                                                                            }
                                                                            "
                                                                        </p>
                                                                    )}

                                                                </div>
                                                            )
                                                        )}

                                                    </div>
                                                )}

                                            </div>

                                            {/* Applications */}
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/workshops/${workshop.id}/applications`
                                                    )
                                                }
                                                className="w-full mt-5 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                                            >
                                                View Applications
                                            </button>

                                        </div>
                                    );
                                })}

                            </div>
                        )}
                    </section>

                    {/* Attended */}
                    <section>

                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Workshops I Attended
                                </h2>

                                <p className="text-gray-500 text-sm mt-1">
                                    Workshops where your application was
                                    accepted and the workshop has ended.
                                </p>
                            </div>

                            <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                {attendedWorkshops.length}
                            </span>
                        </div>

                        {attendedWorkshops.length === 0 ? (
                            renderEmptyState(
                                'Completed workshops you attended will appear here.'
                            )
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {attendedWorkshops.map((application) => (
                                    <div
                                        key={application.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                                    >

                                        <span className="inline-block text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full mb-3">
                                            Attended
                                        </span>

                                        <h3 className="text-xl font-bold text-gray-800">
                                            {application.workshopTitle}
                                        </h3>

                                        <div className="mt-4 space-y-2 text-sm text-gray-600">

                                            <p>
                                                <span className="font-semibold">
                                                    Host:
                                                </span>{' '}
                                                {application.teacherName}
                                            </p>

                                            <p>
                                                <span className="font-semibold">
                                                    Date:
                                                </span>{' '}
                                                {formatDate(
                                                    application.workshopDateTime
                                                )}
                                            </p>

                                            <p>
                                                <span className="font-semibold">
                                                    Time:
                                                </span>{' '}
                                                {formatTime(
                                                    application.workshopDateTime
                                                )}
                                            </p>

                                            <p>
                                                <span className="font-semibold">
                                                    Location:
                                                </span>{' '}
                                                {application.location}
                                            </p>

                                        </div>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/workshops/${application.workshopId}/rate`
                                                )
                                            }
                                            className="w-full mt-5 bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-600 transition"
                                        >
                                            Rate Workshop
                                        </button>

                                    </div>
                                ))}

                            </div>
                        )}

                    </section>

                </div>
            </div>
        </>
    );
}

export default WorkshopHistoryPage;