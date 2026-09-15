import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWorkshopById, applyForWorkshop } from '../services/workshopService';
import { getMyApplications } from '../services/workshopApplicationService';
import { getUser } from '../services/authService';

export default function WorkshopDetailsPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [workshop, setWorkshop] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [workshopData, applications] = await Promise.all([
          getWorkshopById(workshopId),
          getMyApplications()
        ]);
        setWorkshop(workshopData);
        setApplication(applications.find((a) => String(a.workshopId) === String(workshopId)) || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load this workshop.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workshopId]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setError('');
      const result = await applyForWorkshop(workshop.id);
      setApplication(result);
      setMessage('Application submitted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for workshop.');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const formatTime = (value) => new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit'
  });
  const isOwn = user?.email === workshop?.teacherEmail;

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading workshop...</div></>;
  if (!workshop) return <><Navbar /><main className="min-h-screen bg-gray-50 max-w-4xl mx-auto px-4 py-10"><button onClick={() => navigate('/workshops')} className="text-blue-600 mb-6">← Back to Workshops</button><div className="bg-white rounded-2xl p-8 text-center text-red-600">{error || 'Workshop not found.'}</div></main></>;

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-4xl mx-auto px-4 py-10">
    <button onClick={() => navigate('/workshops')} className="text-sm text-gray-500 hover:text-blue-600 mb-6">← Back to Room Workshops</button>
    {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
    {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-5">
        <p className="text-sm font-semibold text-blue-700">ROOM WORKSHOP</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">{workshop.title}</h1>
        {workshop.roomName && <p className="text-blue-700 mt-2">Inside {workshop.roomName}</p>}
      </div>
      <div className="p-6 md:p-8">
        <p className="text-gray-700 leading-relaxed mb-7">{workshop.description || 'No description provided.'}</p>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-4"><span className="font-semibold">Date</span><p className="text-gray-600 mt-1">{formatDate(workshop.dateTime)}</p></div>
          <div className="bg-gray-50 rounded-xl p-4"><span className="font-semibold">Time</span><p className="text-gray-600 mt-1">{formatTime(workshop.dateTime)}</p></div>
          <div className="bg-gray-50 rounded-xl p-4"><span className="font-semibold">Location</span><p className="text-gray-600 mt-1">{workshop.location}</p></div>
          <div className="bg-gray-50 rounded-xl p-4"><span className="font-semibold">Capacity</span><p className="text-gray-600 mt-1">{workshop.capacity}</p></div>
          <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2"><span className="font-semibold">Host</span><p className="text-gray-600 mt-1">{workshop.teacherName}</p></div>
        </div>

        {workshop.meetingUrl && workshop.location?.toLowerCase() === 'online' && <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5"><p className="font-semibold text-blue-900">Online Workshop</p><p className="text-sm text-blue-700 mt-1">The meeting link is available for this workshop.</p>{(isOwn || application?.status === 'ACCEPTED') && <a href={workshop.meetingUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">Join Workshop</a>}</div>}

        <div className="mt-7 flex flex-wrap gap-3">
          {isOwn ? <><button onClick={() => navigate(`/workshops/${workshop.id}/applications`)} className="bg-yellow-500 text-white px-5 py-2.5 rounded-lg font-medium">Manage Applications</button><button onClick={() => navigate(`/workshops/${workshop.id}/resources`)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Learning Resources</button></> : application ? <><div className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg font-medium">Application: {application.status}</div>{application.status === 'ACCEPTED' && <button onClick={() => navigate(`/my-applications/${application.id}`)} className="border border-blue-200 text-blue-600 px-5 py-2.5 rounded-lg font-medium">View Application</button>}</> : <button onClick={handleApply} disabled={applying} className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50">{applying ? 'Applying...' : 'Apply to Workshop'}</button>}
        </div>
      </div>
    </div>
  </main></div>;
}
