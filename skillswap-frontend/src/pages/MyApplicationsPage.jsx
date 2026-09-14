import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInterests } from '../services/skillInterestService';
import { getMyApplications } from '../services/workshopApplicationService';
import Navbar from '../components/Navbar';

export default function MyApplicationsPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('skills');
    const [skillApplications, setSkillApplications] = useState([]);
    const [workshopApplications, setWorkshopApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadApplications = async () => {
            try {
                const [skills, workshops] = await Promise.all([
                    getMyInterests(),
                    getMyApplications()
                ]);

                setSkillApplications(skills);
                setWorkshopApplications(workshops);
            } catch (err) {
                console.error(err);
                setError('Failed to load your applications.');
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, []);

    const getStatusClass = (status) => {
        if (status === 'ACCEPTED') {
            return 'text-green-600 bg-green-50';
        }

        if (status === 'REJECTED') {
            return 'text-red-600 bg-red-50';
        }

        return 'text-yellow-600 bg-yellow-50';
    };

    const formatDate = (dateTime) => {
        return new Date(dateTime).toLocaleDateString();
    };

    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500">
                        Loading your applications...
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 px-4 py-8">
                <div className="max-w-5xl mx-auto">

                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-800 mb-6"
                    >
                        ← Home
                    </button>

                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        My Applications
                    </h1>

                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow mb-6">
                        <div className="flex border-b">

                            <button
                                onClick={() => setActiveTab('skills')}
                                className={`flex-1 px-6 py-4 font-semibold ${
                                    activeTab === 'skills'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Skills
                                <span className="ml-2 text-sm">
                                    ({skillApplications.length})
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('workshops')}
                                className={`flex-1 px-6 py-4 font-semibold ${
                                    activeTab === 'workshops'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Workshops
                                <span className="ml-2 text-sm">
                                    ({workshopApplications.length})
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* Skills */}
                    {activeTab === 'skills' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Skills I'm Interested In
                            </h2>

                            {skillApplications.length === 0 ? (
                                <div className="bg-white rounded-xl shadow p-8 text-center">
                                    <p className="text-gray-500">
                                        You haven't expressed interest in any
                                        skills yet.
                                    </p>

                                    <button
                                        onClick={() => navigate('/skills')}
                                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        Explore Skills
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {skillApplications.map((skill) => (
                                        <div
                                            key={skill.interestId}
                                            className="bg-white rounded-xl shadow p-5"
                                        >
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {skill.skillTitle}
                                            </h3>

                                            <p className="text-gray-600 mt-2">
                                                Offered by: {skill.ownerName}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-2">
                                                Interested on:{' '}
                                                {new Date(
                                                    skill.createdAt
                                                ).toLocaleString()}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/skills/${skill.skillId}`
                                                    )
                                                }
                                                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
                                            >
                                                View Skill →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Workshops */}
                    {activeTab === 'workshops' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Workshops I've Applied To
                            </h2>

                            {workshopApplications.length === 0 ? (
                                <div className="bg-white rounded-xl shadow p-8 text-center">
                                    <p className="text-gray-500">
                                        You haven't applied to any workshops yet.
                                    </p>

                                    <button
                                        onClick={() => navigate('/workshops')}
                                        className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        Explore Workshops
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {workshopApplications.map((application) => {
                                        const workshopDate = new Date(
                                            application.workshopDateTime
                                        );

                                        const hasPassed =
                                            workshopDate < new Date();

                                        return (
                                            <div
                                                key={application.id}
                                                className="bg-white rounded-xl shadow p-5"
                                            >
                                                <h3 className="text-xl font-bold text-gray-800">
                                                    {application.workshopTitle}
                                                </h3>

                                                <p className="text-gray-600 mt-2">
                                                    Hosted by:{' '}
                                                    {application.teacherName}
                                                </p>

                                                <p className="text-gray-600 mt-1">
                                                    Date:{' '}
                                                    {formatDate(
                                                        application.workshopDateTime
                                                    )}
                                                </p>

                                                <p className="text-gray-600 mt-1">
                                                    Time:{' '}
                                                    {formatTime(
                                                        application.workshopDateTime
                                                    )}
                                                </p>

                                                <p className="text-gray-600 mt-1">
                                                    Location:{' '}
                                                    {application.location}
                                                </p>

                                                <div className="mt-4">
                                                    <span className="font-semibold text-gray-700">
                                                        Status:{' '}
                                                    </span>

                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusClass(
                                                            application.status
                                                        )}`}
                                                    >
                                                        {application.status}
                                                    </span>
                                                </div>

                                                {application.status === 'ACCEPTED' && (
                                                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <p className="text-green-700 font-medium">
                                                            Your application has
                                                            been accepted. You
                                                            can attend this
                                                            workshop.
                                                        </p>

                                                        {hasPassed && (
                                                            <p className="text-green-700 text-sm mt-2">
                                                                This workshop has
                                                                ended. You can
                                                                rate your
                                                                experience.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {application.status === 'REJECTED' && (
                                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                                        <p className="text-red-700">
                                                            Your application was
                                                            not accepted for this
                                                            workshop.
                                                        </p>
                                                    </div>
                                                )}

                                                {application.status === 'PENDING' && (
                                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                        <p className="text-yellow-700">
                                                            Your application is
                                                            waiting for the host
                                                            to review it.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}