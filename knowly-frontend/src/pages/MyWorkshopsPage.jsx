import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyWorkshops, deleteWorkshop } from '../services/workshopService';
import Navbar from '../components/Navbar';

export default function MyWorkshopsPage() {
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError('');
      setWorkshops(await getMyWorkshops());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load your workshops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkshops(); }, []);

  const handleDelete = async (workshop) => {
    if (!window.confirm(`Delete "${workshop.title}" permanently? Everyone who applied or was accepted will be notified. This cannot be undone.`)) return;
    try {
      setError('');
      await deleteWorkshop(workshop.id);
      setWorkshops((prev) => prev.filter((item) => item.id !== workshop.id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete workshop.');
    }
  };

  const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'N/A';

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center py-24"><p className="text-gray-500 text-lg">Loading your workshops...</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button type="button" onClick={() => navigate('/workshops')} className="text-sm text-gray-500 hover:text-blue-600 transition">← Back to Workshops</button>
          <button type="button" onClick={() => navigate('/workshops/create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ Create Workshop</button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Workshops</h1>
          <p className="text-gray-500 mt-1">Manage the workshops you are hosting.</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {workshops.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800">You haven't created any workshops yet.</h2>
            <p className="text-gray-500 mt-2">Create a workshop and share what you know with other learners.</p>
            <button type="button" onClick={() => navigate('/workshops/create')} className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">Create Your First Workshop</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((workshop) => {
              const isRoomWorkshop = Boolean(workshop.roomId || workshop.roomName);
              return (
                <article key={workshop.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${isRoomWorkshop ? 'text-blue-600' : 'text-green-600'}`}>
                        {isRoomWorkshop ? 'ROOM WORKSHOP' : 'PUBLIC WORKSHOP'}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900 mt-1 break-words">{workshop.title}</h2>
                    </div>
                    <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                      {isRoomWorkshop ? 'Private' : 'Public'}
                    </span>
                  </div>

                  {isRoomWorkshop && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-xs font-semibold text-blue-600">BELONGS TO ROOM</p>
                      <p className="font-medium text-gray-900 mt-1 break-words">{workshop.roomName || 'Room'}</p>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm leading-relaxed mt-4 break-words whitespace-pre-wrap">{workshop.description}</p>

                  <div className="space-y-2 text-sm mt-5">
                    <p><span className="font-semibold text-gray-800">Date:</span> <span className="text-gray-600">{formatDate(workshop.dateTime)}</span></p>
                    <p><span className="font-semibold text-gray-800">Time:</span> <span className="text-gray-600">{formatTime(workshop.dateTime)}</span></p>
                    <p><span className="font-semibold text-gray-800">Location:</span> <span className="text-gray-600 break-words">{workshop.location}</span></p>
                    <p><span className="font-semibold text-gray-800">Capacity:</span> <span className="text-gray-600">{workshop.capacity}</span></p>
                  </div>

                  <div className="flex flex-col gap-2 mt-6">
                    <button type="button" onClick={() => navigate(`/workshops/${workshop.id}/applications`)} className="w-full bg-yellow-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition">
                      {workshop.requiresAcceptance ? 'Manage Applications' : 'View Enrolled Learners'}
                    </button>
                    <button type="button" onClick={() => handleDelete(workshop)} className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                      Delete Workshop
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
