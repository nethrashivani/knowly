import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getMyWorkshops,
    deleteWorkshop
} from '../services/workshopService';

export default function MyWorkshopsPage() {
    const navigate = useNavigate();

    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadWorkshops = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getMyWorkshops();
            setWorkshops(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load your workshops.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadWorkshops();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this workshop?')) {
            return;
        }

        try {
            await deleteWorkshop(id);

            setWorkshops((prev) =>
                prev.filter((workshop) => workshop.id !== id)
            );
        } catch (err) {
            console.error(err);
            setError('Failed to delete workshop.');
        }
    };

    if (loading) {
        return <div>Loading your workshops...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600"
                    >
                        ← Home
                    </button>

                    <button
                        onClick={() => navigate('/workshops/create')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        + Create Workshop
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    My Workshops
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                {workshops.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <p className="text-gray-500 mb-4">
                            You haven't created any workshops yet.
                        </p>

                        <button
                            onClick={() => navigate('/workshops/create')}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                        >
                            Create Your First Workshop
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {workshops.map((workshop) => (
                            <div
                                key={workshop.id}
                                className="bg-white rounded-xl shadow p-5"
                            >
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    {workshop.title}
                                </h2>

                                <p className="text-gray-600 mb-3">
                                    {workshop.description}
                                </p>

                                <p className="text-sm text-gray-600">
                                    <strong>Date & Time:</strong>{' '}
                                    {new Date(workshop.dateTime).toLocaleString()}
                                </p>

                                <p className="text-sm text-gray-600">
                                    <strong>Location:</strong> {workshop.location}
                                </p>

                                <p className="text-sm text-gray-600">
                                    <strong>Capacity:</strong> {workshop.capacity}
                                </p>

                                <div className="flex gap-3 mt-4">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/workshops/${workshop.id}/applications`
                                            )
                                        }
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Manage Applications
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(workshop.id)
                                        }
                                        className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100"
                                    >
                                        Delete Workshop
                                    </button>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}