import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRoom, getMyRooms, joinRoom, leaveRoom, switchRoom } from '../services/roomService';
import { getAllWorkshops, applyForWorkshop } from '../services/workshopService';
import { getMyApplications, getWorkshopApplications, updateApplicationStatus } from '../services/workshopApplicationService';
import WorkshopReviews from '../components/WorkshopReviews';

export default function RoomPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [participants, setParticipants] = useState({});
  const [openWorkshop, setOpenWorkshop] = useState(null);
  const [showParticipants, setShowParticipants] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(null);
  const [showRooms, setShowRooms] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(null);
  const [participantLoading, setParticipantLoading] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const currentEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;
  const activeRoom = rooms.find((room) => room.active);

  const loadRoomContent = async () => {
    try {
      const [workshopData, applicationData] = await Promise.all([getAllWorkshops(), getMyApplications()]);
      setWorkshops(workshopData);
      setMyApplications(applicationData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load room workshops.');
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getMyRooms();
      setRooms(data);
      const active = data.find((room) => room.active);
      if (active) {
        setShowRooms(false);
        await loadRoomContent();
      } else {
        setShowRooms(true);
        setWorkshops([]);
        setMyApplications([]);
        setParticipants({});
        setOpenWorkshop(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try { setSaving(true); setError(''); const room = await createRoom(roomName.trim()); setRoomName(''); setMode(null); setMessage(`Created "${room.name}". You are now inside this room.`); await loadRooms(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to create room.'); }
    finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try { setSaving(true); setError(''); const room = await joinRoom(code.trim().toUpperCase()); setCode(''); setMode(null); setMessage(`Joined "${room.name}". You are now inside this room.`); await loadRooms(); }
    catch (err) { setError(err.response?.data?.message || 'Invalid room code.'); }
    finally { setSaving(false); }
  };

  const enterRoom = async (room) => {
    try { setSaving(true); setError(''); await switchRoom(room.id); setOpenWorkshop(null); setParticipants({}); setShowRooms(false); setMessage(`Entered "${room.name}".`); await loadRooms(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to enter room.'); }
    finally { setSaving(false); }
  };

  const handleLeave = async (room) => {
    if (!window.confirm(`Leave ${room.name}? You can rejoin later with its code.`)) return;
    try { setSaving(true); setError(''); await leaveRoom(room.id); setMessage(`You left "${room.name}".`); await loadRooms(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to leave room.'); }
    finally { setSaving(false); }
  };

  const handleApply = async (workshopId) => {
    try {
      setApplying(workshopId); setError('');
      const application = await applyForWorkshop(workshopId);
      setMyApplications((prev) => [...prev.filter((item) => item.workshopId !== workshopId), application]);
      setMessage(application.status === 'ACCEPTED' ? 'You are enrolled in this workshop.' : 'Application submitted. The host will review it.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to join workshop.'); }
    finally { setApplying(null); }
  };

  const loadParticipants = async (workshopId) => {
    try { setParticipantLoading(workshopId); setError(''); const data = await getWorkshopApplications(workshopId); setParticipants((prev) => ({ ...prev, [workshopId]: data })); setShowParticipants(workshopId); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load participants.'); }
    finally { setParticipantLoading(null); }
  };

  const updateParticipant = async (applicationId, workshopId, status) => {
    try {
      setStatusUpdating(applicationId); setError('');
      const updated = await updateApplicationStatus(applicationId, status);
      setParticipants((prev) => ({ ...prev, [workshopId]: (prev[workshopId] || []).map((item) => item.id === applicationId ? updated : item) }));
      setMessage(status === 'ACCEPTED' ? 'Learner accepted.' : 'Learner rejected.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to update participant.'); }
    finally { setStatusUpdating(null); }
  };

  const copyCode = async (room) => {
    try { await navigator.clipboard.writeText(room.code); setMessage('Room code copied.'); }
    catch { setError('Could not copy the room code automatically.'); }
  };

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (value) => new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const getApplication = (id) => myApplications.find((item) => String(item.workshopId) === String(id));

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading your rooms...</div></>;

  return <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium mb-6">← Back to Home</button>
        <div className="mb-7"><p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p><h1 className="text-3xl font-bold text-gray-900 mt-1">{activeRoom && !showRooms ? activeRoom.name : 'Your Rooms'}</h1><p className="text-gray-600 mt-2">{activeRoom && !showRooms ? 'Your private learning space. Everything here belongs to this room.' : 'These are the private learning spaces you are a member of.'}</p></div>
        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

        {activeRoom && !showRooms ? <>
          <div className="flex flex-wrap gap-3 mb-6"><button onClick={() => setShowRooms(true)} className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium">← My Rooms</button><button onClick={() => navigate('/workshops/create', { state: { returnTo: '/room' } })} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Create Workshop in {activeRoom.name}</button><button onClick={loadRoomContent} className="border border-blue-200 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium">Refresh Workshops</button></div>
          <div className="bg-white rounded-2xl shadow p-6 border-2 border-blue-500 mb-8"><div className="flex flex-wrap justify-between gap-3"><div><span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">ACTIVE ROOM</span><h2 className="text-2xl font-bold text-gray-900 mt-3">{activeRoom.name}</h2><p className="text-sm text-gray-500 mt-1">Created by {activeRoom.ownerName}</p></div><span className="text-green-600 text-sm font-semibold">● Active</span></div>{activeRoom.owner ? <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p><div className="flex items-center justify-between gap-3 mt-1"><span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{activeRoom.code}</span><button onClick={() => copyCode(activeRoom)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Copy</button></div><p className="text-xs text-blue-600 mt-2">Only you can see this code. Share it privately with your employees.</p></div> : <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">You are a member of this organization room. The invitation code is visible only to its owner.</div>}</div>
          <section><div className="mb-5"><p className="text-sm font-semibold text-blue-600">{activeRoom.name}</p><h2 className="text-2xl font-bold text-gray-900">Workshops inside this room</h2><p className="text-gray-500 mt-1">Open, join, manage participants, and review workshops without leaving this room.</p></div>
            {workshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h3 className="font-semibold text-gray-800">No workshops in this room yet.</h3><p className="text-gray-500 text-sm mt-1">Create the first workshop for {activeRoom.name}.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{workshops.map((workshop) => { const application = getApplication(workshop.id); const expanded = openWorkshop === workshop.id; const isTeacher = workshop.teacherEmail === currentEmail; const list = participants[workshop.id] || []; const accepted = list.filter((item) => item.status === 'ACCEPTED').length; const pending = list.filter((item) => item.status === 'PENDING').length; return <div key={workshop.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${expanded ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}>
              <button onClick={() => setOpenWorkshop(expanded ? null : workshop.id)} className="w-full text-left p-6 hover:bg-gray-50"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-600">ROOM WORKSHOP · {workshop.roomName || activeRoom.name}</p><h3 className="text-xl font-bold text-gray-900 mt-1">{workshop.title}</h3></div><span className="text-blue-600 text-sm">{expanded ? 'Collapse ↑' : 'Open ↓'}</span></div><p className="text-gray-600 text-sm mt-3 line-clamp-2">{workshop.description}</p><p className="text-gray-500 text-sm mt-4">{formatDate(workshop.dateTime)} · {formatTime(workshop.dateTime)} · Host: {workshop.teacherName}</p></button>
              {expanded && <div className="border-t px-6 py-6"><p className="text-gray-700">{workshop.description || 'No description provided.'}</p><div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm"><div className="bg-gray-50 rounded-lg p-4"><b>Date</b><p className="text-gray-600 mt-1">{formatDate(workshop.dateTime)}</p></div><div className="bg-gray-50 rounded-lg p-4"><b>Time</b><p className="text-gray-600 mt-1">{formatTime(workshop.dateTime)}</p></div><div className="bg-gray-50 rounded-lg p-4"><b>Location</b><p className="text-gray-600 mt-1">{workshop.location}</p></div><div className="bg-gray-50 rounded-lg p-4"><b>{workshop.requiresAcceptance ? 'Capacity' : 'Enrollment'}</b><p className="text-gray-600 mt-1">{workshop.requiresAcceptance ? workshop.capacity : 'Unlimited Room members'}</p></div></div><div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">{workshop.requiresAcceptance ? 'Manual acceptance' : 'Open to all Room members'}</span><span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">Inside: {workshop.roomName || activeRoom.name}</span></div>
                {workshop.meetingUrl && workshop.location?.toLowerCase() === 'online' && (application?.status === 'ACCEPTED' || isTeacher) && <a href={workshop.meetingUrl} target="_blank" rel="noreferrer" className="inline-block mt-5 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">Join Workshop</a>}
                <div className="mt-5 flex flex-wrap gap-2">{application ? <span className={`px-4 py-2.5 rounded-lg text-sm font-medium ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : application.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{application.status === 'ACCEPTED' ? 'You are enrolled' : application.status === 'PENDING' ? 'Waiting for host approval' : 'Application rejected'}</span> : !isTeacher && <button onClick={() => handleApply(workshop.id)} disabled={applying === workshop.id} className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{applying === workshop.id ? 'Joining...' : workshop.requiresAcceptance ? 'Apply to Workshop' : 'Join Workshop'}</button>}{isTeacher && <button onClick={() => loadParticipants(workshop.id)} className="bg-yellow-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">{participantLoading === workshop.id ? 'Loading...' : `View Participants${participants[workshop.id] ? ` (${accepted})` : ''}`}</button>}<button onClick={() => { if (showParticipants === workshop.id) setShowParticipants(null); else loadParticipants(workshop.id); }} className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium">{showParticipants === workshop.id ? 'Hide Participants' : 'Participants'}</button></div>
                {showParticipants === workshop.id && <div className="mt-5 bg-gray-50 rounded-xl p-5"><div className="flex justify-between items-center"><div><h4 className="font-bold text-gray-900">Participants</h4><p className="text-sm text-gray-500 mt-1">{accepted} enrolled · {pending} pending</p></div><button onClick={() => loadParticipants(workshop.id)} className="text-sm text-blue-600">Refresh</button></div>{list.length === 0 ? <p className="text-sm text-gray-500 mt-4">No participants yet.</p> : <div className="space-y-3 mt-4">{list.map((item) => <div key={item.id} className="bg-white rounded-lg p-4 border"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold text-gray-900">{item.learnerName}</p><p className="text-sm text-gray-500">{item.learnerEmail}</p></div><span className={`text-sm font-semibold ${item.status === 'ACCEPTED' ? 'text-green-600' : item.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>{item.status}</span></div>{isTeacher && item.status === 'PENDING' && workshop.requiresAcceptance && <div className="flex gap-2 mt-3"><button disabled={statusUpdating === item.id} onClick={() => updateParticipant(item.id, workshop.id, 'ACCEPTED')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm">Accept</button><button disabled={statusUpdating === item.id} onClick={() => updateParticipant(item.id, workshop.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">Reject</button></div>}</div>)}</div>}</div>}
                <WorkshopReviews workshop={workshop} application={application} isTeacher={isTeacher} />
              </div>}
            </div>; })}</div>}
          </section>
        </> : <>
          <div className="flex flex-wrap gap-3 mb-6"><button onClick={() => setMode('create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Create a Room</button><button onClick={() => setMode('join')} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium">Join a Room</button></div>
          {mode && <div className="bg-white rounded-2xl shadow p-6 mb-6"><div className="flex justify-between mb-4"><div><h2 className="text-xl font-bold">{mode === 'create' ? 'Create a Room' : 'Join a Room'}</h2><p className="text-sm text-gray-500 mt-1">{mode === 'create' ? 'Create a private learning space.' : 'Enter the invitation code shared by the room owner.'}</p></div><button onClick={() => setMode(null)} className="text-gray-500 text-xl">×</button></div>{mode === 'create' ? <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3"><input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Capgemini IT" required className="flex-1 border border-gray-300 rounded-lg px-4 py-3"/><button disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg">{saving ? 'Creating...' : 'Create Room'}</button></form> : <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. KN-X7K29A" maxLength={9} required className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono"/><button disabled={saving} className="bg-gray-900 text-white px-6 py-3 rounded-lg">{saving ? 'Joining...' : 'Join Room'}</button></form>}</div>}
          {rooms.length === 0 ? <div className="bg-white rounded-2xl shadow p-10 text-center"><h2 className="text-xl font-bold">You are not in any rooms yet</h2><p className="text-gray-500 mt-2">Create or join a private room to get started.</p></div> : <><div className="flex justify-between mb-5"><h2 className="text-2xl font-bold">My Rooms</h2><span className="text-sm text-gray-500">{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</span></div><div className="grid md:grid-cols-2 gap-6">{rooms.map((room) => <div key={room.id} className="bg-white rounded-2xl shadow p-6"><h2 className="text-xl font-bold">{room.name}</h2><p className="text-sm text-gray-500 mt-1">Created by {room.ownerName}</p>{room.owner ? <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p><div className="flex justify-between items-center mt-1"><span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{room.code}</span><button onClick={() => copyCode(room)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Copy</button></div></div> : <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">You are a member of this room.</div>}<div className="mt-5 flex gap-2"><button disabled={saving} onClick={() => enterRoom(room)} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm">Enter Room</button><button disabled={saving} onClick={() => handleLeave(room)} className="border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">Leave</button></div></div>)}</div></>}
        </>}
      </div>
    </div>
  </>;
}