import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyApplications } from '../services/workshopApplicationService';
import Navbar from '../components/Navbar';

export default function MyApplicationsPage() {
    const navigate = useNavigate();
    const { applicationId } = useParams();
    const [workshopApplications, setWorkshopApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadApplications = async () => {
            try { setWorkshopApplications(await getMyApplications()); }
            catch (err) { console.error(err); setError('Failed to load your applications.'); }
            finally { setLoading(false); }
        };
        loadApplications();
    }, []);

    const getStatusClass = (status) => status === 'ACCEPTED' ? 'text-green-600 bg-green-50' : status === 'REJECTED' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50';
    const formatDate = (dateTime) => new Date(dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

    if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading your applications...</p></div></>;

    const selectedApplication = applicationId ? workshopApplications.find((application) => application.id === Number(applicationId)) : null;
    if (applicationId && !selectedApplication) return <><Navbar /><div className="min-h-screen bg-gray-50 px-4 py-8"><div className="max-w-5xl mx-auto"><button onClick={() => navigate('/my-interests')} className="text-blue-600 hover:text-blue-800 mb-6">← Back to My Interests</button><div className="bg-white rounded-xl shadow p-8 text-center"><h1 className="text-2xl font-bold text-gray-800">Application Not Found</h1><p className="text-gray-500 mt-2">This workshop application could not be found.</p></div></div></div></>;

    const applicationsToDisplay = selectedApplication ? [selectedApplication] : workshopApplications;
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 px-4 py-8"><div className="max-w-5xl mx-auto">
                <button onClick={() => navigate(selectedApplication ? '/my-interests' : '/')} className="text-blue-600 hover:text-blue-800 mb-6">{selectedApplication ? '← Back to My Interests' : '← Back to Home'}</button>
                <h1 className="text-3xl font-bold text-gray-800">{selectedApplication ? 'Application Details' : 'My Applications'}</h1>
                <p className="text-gray-500 mt-2 mb-6">{selectedApplication ? 'Details of your workshop application.' : "Workshops you've applied to and the status of your applications."}</p>
                {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
                {applicationsToDisplay.length === 0 ? <div className="bg-white rounded-xl shadow p-8 text-center"><p className="text-gray-500">You haven't applied to any workshops yet.</p><button onClick={() => navigate('/workshops')} className="mt-4 text-blue-600 hover:text-blue-800 font-semibold">Explore Workshops</button></div> :
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {applicationsToDisplay.map((application) => {
                            const workshopDate = new Date(application.workshopDateTime);
                            const hasPassed = workshopDate < new Date();
                            const isOnline = application.location?.toLowerCase() === 'online';
                            return <div key={application.id} className="bg-white rounded-xl shadow p-5">
                                <h3 className="text-xl font-bold text-gray-800">{application.workshopTitle}</h3>
                                <p className="text-gray-600 mt-2">Hosted by: {application.teacherName}</p>
                                <p className="text-gray-600 mt-1">Date: {formatDate(application.workshopDateTime)}</p>
                                <p className="text-gray-600 mt-1">Time: {formatTime(application.workshopDateTime)}</p>
                                <p className="text-gray-600 mt-1">Location: {isOnline ? 'Online' : application.location}</p>
                                <div className="mt-4"><span className="font-semibold text-gray-700">Status: </span><span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusClass(application.status)}`}>{application.status}</span></div>
                                {application.status === 'ACCEPTED' && <>
                                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-700 font-medium">Your application has been accepted. You can attend this workshop.</p>{hasPassed && <p className="text-green-700 text-sm mt-2">This workshop has ended. You can rate your experience.</p>}</div>
                                    {isOnline && application.meetingUrl && !hasPassed && <a href={application.meetingUrl} target="_blank" rel="noopener noreferrer" className="block w-full mt-4 bg-blue-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Join Workshop</a>}
                                    <button onClick={() => navigate(`/workshops/${application.workshopId}/resources`)} className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Learning Resources</button>
                                    {hasPassed && <button onClick={() => navigate(`/workshops/${application.workshopId}/rate`)} className="w-full mt-2 bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition">Rate Workshop</button>}
                                </>}
                                {application.status === 'REJECTED' && <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-700">Your application was not accepted for this workshop.</p></div>}
                                {application.status === 'PENDING' && <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3"><p className="text-yellow-700">Your application is waiting for the host to review it.</p></div>}
                            </div>;
                        })}
                    </div>}
            </div></div>
        </>
    );
}
