import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyRooms } from '../services/roomService';
import { getRoomWorkshops, applyForWorkshop, deleteWorkshop } from '../services/workshopService';
import { getMyApplications, getWorkshopApplications, updateApplicationStatus } from '../services/workshopApplicationService';

export default function RoomWorkshopsPage() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [applications, setApplications] = useState([]);
  const [participants, setParticipants] = useState({});
  const [open, setOpen] = useState(null);
  const [showParticipants, setShowParticipants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const rooms = await getMyRooms();
      const active = rooms.find((item) => item.active);
      if (!active) {
        navigate('/my-rooms', { replace: true });
        return;
      }
      setRoom(active);
      const [ws, apps] = await Promise.all([getRoomWorkshops(active.id), getMyApplications()]);
      setWorkshops(ws);
      setApplications(apps);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load this room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const currentEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const getApplication = (id) => applications.find((x) => String(x.workshopId) === String(id));
  const formatDate = (v) => new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (v) => new Date(v).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  const handleApply = async (id) => {
    try {
      setBusy(id);
      const app = await applyForWorkshop(id);
      setApplications((prev) => [...prev.filter((x) => x.workshopId !== id), app]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join workshop.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (workshop) => {
    if (!window.confirm(`Delete "${workshop.title}" permanently? Everyone who applied or was accepted will be notified. This cannot be undone.`)) return;
    try {
      setBusy(`d-${workshop.id}`);
      setError('');
      await deleteWorkshop(workshop.id);
      setWorkshops((prev) => prev.filter((item) => item.id !== workshop.id));
      setOpen(null);
      setShowParticipants(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workshop.');
    } finally {
      setBusy(null);
    }
  };

  const loadParticipants = async (id) => {
    try {
      setBusy(`p-${id}`);
      const data = await getWorkshopApplications(id);
      setParticipants((prev) => ({ ...prev, [id]: data }));
      setShowParticipants(id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load participants.');
    } finally {
      setBusy(null);
    }
  };

  const updateParticipant = async (applicationId, workshopId, status) => {
    try {
      setBusy(`s-${applicationId}`);
      const updated = await updateApplicationStatus(applicationId, status);
      setParticipants((prev) => ({ ...prev, [workshopId]: (prev[workshopId] || []).map((x) => x.id === applicationId ? updated : x) }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading room workshops...</div></>;
  if (!room) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <button type="button" onClick={() => navigate('/my-rooms')} className="text-blue-600 hover:text-blue-800 font-medium mb-6">← My Rooms</button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <p className="text-blue-600 font-semibold">PRIVATE ROOM</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{room.name}</h1>
              <p className="text-gray-600 mt-2">Workshops available only to members of this room.</p>
            </div>
            <button type="button" onClick={() => navigate('/workshops/create', { state: { returnTo: '/room', roomId: room.id, roomName: room.name } })} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Create Workshop in {room.name}</button>
          </div>
          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}

          <section>
            <div className="mb-5">
              <p className="text-sm font-semibold text-blue-600">ROOM: {room.name}</p>
              <h2 className="text-2xl font-bold text-gray-900">Workshops inside this room</h2>
              <p className="text-gray-500 mt-1">These workshops are private to members of {room.name}. They do not appear in Explore Workshops.</p>
            </div>

            {workshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">No workshops in this room yet.</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshops.map((w) => {
                  const app = getApplication(w.id);
                  const expanded = open === w.id;
                  const isTeacher = w.teacherEmail === currentEmail;
                  const list = participants[w.id] || [];
                  const accepted = list.filter((x) => x.status === 'ACCEPTED').length;
                  const pending = list.filter((x) => x.status === 'PENDING').length;
                  return (
                    <article key={w.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
                      <button type="button" onClick={() => setOpen(expanded ? null : w.id)} className="w-full text-left p-6 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-blue-600">ROOM WORKSHOP · {room.name}</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-1 break-words">{w.title}</h3>
                          </div>
                          <span className="shrink-0 text-sm text-blue-600">{expanded ? 'Collapse ↑' : 'Open ↓'}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-3 line-clamp-2 break-words">{w.description}</p>
                        <p className="text-gray-500 text-sm mt-4">{formatDate(w.dateTime)} · {formatTime(w.dateTime)} · Host: {w.teacherName}</p>
                      </button>

                      {expanded && <div className="border-t px-6 py-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
                          <p className="text-xs font-semibold text-blue-600">BELONGS TO ROOM</p>
                          <p className="font-medium text-gray-900 mt-1 break-words">{room.name}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 rounded-lg p-4"><b>Date</b><p className="text-gray-600 mt-1">{formatDate(w.dateTime)}</p></div>
                          <div className="bg-gray-50 rounded-lg p-4"><b>Time</b><p className="text-gray-600 mt-1">{formatTime(w.dateTime)}</p></div>
                          <div className="bg-gray-50 rounded-lg p-4"><b>Location</b><p className="text-gray-600 mt-1 break-words">{w.location}</p></div>
                          <div className="bg-gray-50 rounded-lg p-4"><b>Access</b><p className="text-gray-600 mt-1">Room members only</p></div>
                        </div>
                        <p className="text-gray-700 mt-5 break-words whitespace-pre-wrap">{w.description || 'No description provided.'}</p>
                        {w.meetingUrl && w.location?.toLowerCase() === 'online' && (app?.status === 'ACCEPTED' || isTeacher) && <a href={w.meetingUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">Join Workshop</a>}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {app ? <span className="px-4 py-2.5 rounded-lg text-sm font-medium bg-green-100 text-green-700">{app.status === 'ACCEPTED' ? 'You are enrolled' : app.status === 'PENDING' ? 'Waiting for approval' : 'Application rejected'}</span> : !isTeacher && <button type="button" onClick={() => handleApply(w.id)} disabled={busy === w.id} className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">{busy === w.id ? 'Joining...' : w.requiresAcceptance ? 'Apply to Workshop' : 'Join Workshop'}</button>}
                          {isTeacher && <><button type="button" onClick={() => loadParticipants(w.id)} className="bg-yellow-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">{busy === `p-${w.id}` ? 'Loading...' : `View Participants${participants[w.id] ? ` (${accepted})` : ''}`}</button><button type="button" onClick={() => handleDelete(w)} disabled={busy === `d-${w.id}`} className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">{busy === `d-${w.id}` ? 'Deleting...' : 'Delete Workshop'}</button></>}
                          <button type="button" onClick={() => showParticipants === w.id ? setShowParticipants(null) : loadParticipants(w.id)} className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium">{showParticipants === w.id ? 'Hide Participants' : 'Participants'}</button>
                        </div>
                        {showParticipants === w.id && <div className="mt-5 bg-gray-50 rounded-xl p-5"><p className="text-sm text-gray-500">{accepted} enrolled · {pending} pending</p>{list.map((item) => <div key={item.id} className="bg-white border rounded-lg p-4 mt-3 flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{item.learnerName}</p><p className="text-sm text-gray-500">{item.learnerEmail}</p></div>{isTeacher && item.status === 'PENDING' && <div className="flex gap-2"><button type="button" disabled={busy === `s-${item.id}`} onClick={() => updateParticipant(item.id, w.id, 'ACCEPTED')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm">Accept</button><button type="button" disabled={busy === `s-${item.id}`} onClick={() => updateParticipant(item.id, w.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm">Reject</button></div>}</div>)}</div>}
                      </div>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
