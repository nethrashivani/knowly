import { useEffect, useState } from 'react';
import {
    getAllWorkshops,
    applyForWorkshop
} from '../services/workshopService';
import { isLoggedIn, getUser, getToken } from '../services/authService';
import axios from 'axios';

const APPLICATIONS_URL =
    'http://localhost:8080/api/workshop-applications';

function WorkshopsPage() {
    const [workshops, setWorkshops] = useState([]);
    const [appliedWorkshopIds, setAppliedWorkshopIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applying, setApplying] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');

                const workshopData = await getAllWorkshops();
                setWorkshops(workshopData);

                // Only logged-in users have personal applications
                if (isLoggedIn()) {
                    const response = await axios.get(
                        `${APPLICATIONS_URL}/my`,
                        {
                            headers: {
                                Authorization: `Bearer ${getToken()}`
                            }
                        }
                    );

                    const appliedIds = new Set(
                        response.data.map(
                            (application) => application.workshopId
                        )
                    );

                    setAppliedWorkshopIds(appliedIds);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load workshops.');
            } finally {
                setLoading(false);
            }
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const handleApply = async (workshopId) => {
        try {
            setApplying(workshopId);
            setError('');

            await applyForWorkshop(workshopId);

            // Immediately hide the Apply button
            setAppliedWorkshopIds((prev) => {
                const updated = new Set(prev);
                updated.add(workshopId);
                return updated;
            });

            alert('Application submitted successfully!');
        } catch (err) {
            console.error(err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to apply for workshop.');
            }
        } finally {
            setApplying(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                    Loading workshops...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Workshops
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {workshops.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <p className="text-gray-500">
                            No workshops available yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {workshops.map((workshop) => {

                            const user = getUser();

                            const isOwnWorkshop =
                                isLoggedIn() &&
                                user?.email === workshop.teacherEmail;

                            const alreadyApplied =
                                appliedWorkshopIds.has(workshop.id);

                            return (
                                <div
                                    key={workshop.id}
                                    className="bg-white rounded-xl shadow p-6"
                                >

                                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                                        {workshop.title}
                                    </h2>

                                    <p className="text-gray-600 mb-4">
                                        {workshop.description}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-600">

                                        <p>
                                            <strong>Date & Time:</strong>{' '}
                                            {new Date(
                                                workshop.dateTime
                                            ).toLocaleString()}
                                        </p>

                                        <p>
                                            <strong>Location:</strong>{' '}
                                            {workshop.location}
                                        </p>

                                        <p>
                                            <strong>Capacity:</strong>{' '}
                                            {workshop.capacity}
                                        </p>

                                        <p>
                                            <strong>Teacher:</strong>{' '}
                                            {workshop.teacherName}
                                        </p>

                                    </div>

                                    {/* Teacher cannot apply to own workshop */}
                                    {isOwnWorkshop ? null : (

                                        /* Already applied */
                                        alreadyApplied ? (

                                            <div className="mt-5 w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-center">
                                                Already Applied
                                            </div>

                                        ) : (

                                            /* Learner who has not applied */
                                            isLoggedIn() && (
                                                <button
                                                    onClick={() =>
                                                        handleApply(
                                                            workshop.id
                                                        )
                                                    }
                                                    disabled={
                                                        applying ===
                                                        workshop.id
                                                    }
                                                    className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                                >
                                                    {applying === workshop.id
                                                        ? 'Applying...'
                                                        : 'Apply to Workshop'}
                                                </button>
                                            )
                                        )
                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}

export default WorkshopsPage;