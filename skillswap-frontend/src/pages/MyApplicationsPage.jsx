import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../services/authService';

const BASE_URL = 'http://localhost:8080/api/workshop-applications';

export default function MyApplicationsPage() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/my`, {
                    headers: {
                        Authorization: `Bearer ${getToken()}`
                    }
                });

                setApplications(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load your applications.');
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, []);

    if (loading) {
        return <div>Loading your applications...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 mb-6"
                >
                    ← Home
                </button>

                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    My Applications
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                        {error}
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 text-center">
                        <p className="text-gray-500">
                            You haven't applied to any workshops yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white rounded-xl shadow p-5"
                            >
                                <h2 className="text-xl font-bold text-gray-800">
                                    {application.workshopTitle}
                                </h2>

                                <p className="text-gray-600 mt-2">
                                    Applied by: {application.learnerName}
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    Applied on:{' '}
                                    {new Date(
                                        application.appliedAt
                                    ).toLocaleString()}
                                </p>

                                <div className="mt-4">
                                    <span className="font-semibold">
                                        Status:{' '}
                                    </span>

                                    <span
                                        className={
                                            application.status === 'ACCEPTED'
                                                ? 'text-green-600 font-bold'
                                                : application.status === 'REJECTED'
                                                    ? 'text-red-600 font-bold'
                                                    : 'text-yellow-600 font-bold'
                                        }
                                    >
                                        {application.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}