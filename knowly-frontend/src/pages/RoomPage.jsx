import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRoom, getMyRooms, joinRoom, leaveRoom, switchRoom } from '../services/roomService';
import { getAllWorkshops, applyForWorkshop } from '../services/workshopService';
import { getMyApplications, getWorkshopApplications, updateApplicationStatus } from '../services/workshopApplicationService';

export default function RoomPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomWorkshops, setRoomWorkshops] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workshopParticipants, setWorkshopParticipants] = useState({});
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(null);
  const [participantsLoadingId, setParticipantsLoadingId] = useState(null);
  const [updatingParticipantId, setUpdatingParticipantId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(null);
  const [showRoomList, setShowRoomList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}')?.email;

  const loadRoomWorkshops = async () => {
    try {
      const [workshops, myApplications] = await Promise.all([getAllWorkshops(), getMyApplications()]);
      setRoomWorkshops(workshops);
      setApplications(myApplications);
    } catch (err) {
      setRoomWorkshops([]);
      setApplications([]);
      setError(err.response?.data?.message || 'Failed to load room workshops.');
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getMyRooms();
      setRooms(data);
      setError('');
      const active = data.find((room) => room.active);
      if (active) {
        setShowRoomList(false);
        await loadRoomWorkshops();
      } else {
        setShowRoomList(true);
        setRoomWorkshops([]);
        setApplications([]);
        setSelectedWorkshopId(null);
        setWorkshopParticipants({});
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
    try {
      setSaving(true); setError('');
      const room = await createRoom(roomName.trim());
      setRoomName(''); setMode(null);
      setMessage(`Created "${room.name}". You are now inside this room.`);
      await loadRooms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create room.'); }
    finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setSaving(true); setError('');
      const room = await joinRoom(code.trim().toUpperCase());
      setCode(''); setMode(null);
      setMessage(`Joined "${room.name}". You are now inside this room.`);
      await loadRooms();
    } catch (err) { setError(err.response?.data?.message || 'Invalid room code.'); }
    finally { setSaving(false); }
  };

  const handleSwitch = async (room) => {
    try {
      setSaving(true); setError('');
      await switchRoom(room.id);
      setSelectedWorkshopId(null); setWorkshopParticipants({}); setShowRoomList(false);
      setMessage(`Entered "${room.name}".`);
      await loadRooms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to enter room.'); }
    finally { setSaving(false); }
  };

  const handleLeave = async (room) => {
    if (!window.confirm(`Leave ${room.name}? You can rejoin later with its code.`)) return;
    try {
      setSaving(true); setError('');
      await leaveRoom(room.id);
      setMessage(`You left "${room.name}".`);
      await loadRooms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to leave room.'); }
    finally { setSaving(false); }
  };

  const handleApply = async (workshopId) => {
    try {
      setApplyingId(workshopId); setError('');
      const application = await applyForWorkshop(workshopId);
      setApplications((prev) => [...prev.filter((item) => item.workshopId !== workshopId), application]);
      setMessage(application.status === 'ACCEPTED' ? 'You are enrolled in this workshop.' : 'Application submitted. The workshop host will review it.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to join workshop.'); }
    finally { setApplyingId(null); }
  };

  const loadParticipants = async (workshopId) => {
    if (participantsLoadingId === workshopId) return;
    try {
      setParticipantsLoadingId(workshopId); setError('');
      const data = await getWorkshopApplications(workshopId);
      setWorkshopParticipants((prev) => ({ ...prev, [workshopId]: data }));
    } catch (err) { setError(err.response?.data?.message || 'Failed to load enrolled learners.'); }
    finally { setParticipantsLoadingId(null); }
  };

  const handleParticipantStatus = async (applicationId, workshopId, status) => {
    try {
      setUpdatingParticipantId(applicationId); setError('');
      const updated = await updateApplicationStatus(applicationId, status);
      setWorkshopParticipants((prev) => ({
        ...prev,
        [workshopId]: (prev[workshopId] || []).map((item) => item.id === applicationId ? updated : item)
      }));
      setMessage(status === 'ACCEPTED' ? 'Learner accepted.' : 'Learner rejected.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to update application.'); }
    finally { setUpdatingParticipantId(null); }
  };

  const copyCode = async (room) => {
    try { await navigator.clipboard.writeText(room.code); setMessage('Room code copied to your clipboard.'); setError(''); }
    catch { setError('Could not copy automatically. Please copy the code manually.'); }
  };

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (value) => new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const getApplication = (workshopId) => applications.find((application) => String(application.workshopId) === String(workshopId));

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading your rooms...</div></>;

  const activeRoom = rooms.find((room) => room.active);

  return <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium mb-6">← Back to Home</button>

        <div className="mb-7">
          <p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{activeRoom && !showRoomList ? activeRoom.name : 'Your Rooms'}</h1>
          <p className="text-gray-600 mt-2">{activeRoom && !showRoomList ? 'This is your private learning space. Everything here belongs to this room.' : 'These are the private learning spaces you are a member of.'}</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

        {activeRoom && !showRoomList ? (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={() => setShowRoomList(true)} className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50">← My Rooms</button>
              <button onClick={() => navigate('/workshops/create', { state: { returnTo: '/room' } })} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Create Workshop in {activeRoom.name}</button>
              <button onClick={loadRoomWorkshops} className="border border-blue-200 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50">Refresh Workshops</button>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 border-2 border-blue-500 mb-8">
              <div className="flex flex-wrap justify-between gap-3">
                <div><span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">ACTIVE ROOM</span><h2 className="text-2xl font-bold text-gray-900 mt-3">{activeRoom.name}</h2><p className="text-sm text-gray-500 mt-1">Created by {activeRoom.ownerName}</p></div>
                <span className="text-green-600 text-sm font-semibold">● Active</span>
              </div>
              {activeRoom.owner ? <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p><div className="flex items-center justify-between gap-3 mt-1"><span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{activeRoom.code}</span><button onClick={() => copyCode(activeRoom)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Copy</button></div><p className="text-xs text-blue-600 mt-2">Only you can see this code. Share it privately with your employees.</p></div> : <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">You are a member of this organization room. The invitation code is visible only to its owner.</div>}
            </div>

            <section id="room-workshops">
              <div className="mb-5"><p className="text-sm font-semibold text-blue-600">{activeRoom.name}</p><h2 className="text-2xl font-bold text-gray-900">Workshops inside this room</h2><p className="text-gray-500 mt-1">Open, join, and manage everything without leaving this room.</p></div>

              {roomWorkshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h3 className="font-semibold text-gray-800">No workshops in this room yet.</h3><p className="text-gray-500 text-sm mt-1">Create the first workshop for {activeRoom.name}.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {roomWorkshops.map((workshop) => {
                  const application = getApplication(workshop.id);
                  const expanded = selectedWorkshopId === workshop.id;
                  const isTeacher = workshop.teacherEmail === currentUserEmail;
                  const participants = workshopParticipants[workshop.id];
                  const acceptedParticipants = participants?.filter((item) => item.status === 'ACCEPTED') || [];
                  const pendingParticipants = participants?.filter((item) => item.status === 'PENDING') || [];

                  return <div key={workshop.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${expanded ? 'border-blue-400 shadow-md' : 'border-gray-200'}`}>
                    <button onClick={() => setSelectedWorkshopId(expanded ? null : workshop.id)} className="w-full text-left p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-600">ROOM WORKSHOP · {workshop.roomName || activeRoom.name}</p><h3 className="text-xl font-bold text-gray-900 mt-1">{workshop.title}</h3></div><span className="text-blue-600 text-sm font-medium">{expanded ? 'Collapse ↑' : 'Open ↓'}</span></div>
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">{workshop.description}</p>
                      <div className="mt-4 text-sm text-gray-500"><p>{formatDate(workshop.dateTime)} · {formatTime(workshop.dateTime)}</p><p className="mt-1">Host: {workshop.teacherName}</p></div>
                    </button>

                    {expanded && <div className="border-t px-6 py-6">
                      <p className="text-gray-700 leading-relaxed">{workshop.description || 'No description provided.'}</p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm mt-5">
                        <div className="bg-gray-50 rounded-lg p-4"><b>Date</b><p className="text-gray-600 mt-1">{formatDate(workshop.dateTime)}</p></div>
                        <div className="bg-gray-50 rounded-lg p-4"><b>Time</b><p className="text-gray-600 mt-1">{formatTime(workshop.dateTime)}</p></div>
                        <div className="bg-gray-50 rounded-lg p-4"><b>Location</b><p className="text-gray-600 mt-1">{workshop.location}</p></div>
                        <div className="bg-gray-50 rounded-lg p-4"><b>{workshop.requiresAcceptance ? 'Capacity' : 'Enrollment'}</b><p className="text-gray-600 mt-1">{workshop.requiresAcceptance ? workshop.capacity : 'Unlimited Room members'}</p></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">{workshop.requiresAcceptance ? 'Manual acceptance' : 'Open to all Room members'}</span><span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">Inside: {workshop.roomName || activeRoom.name}</span></div>

                      {workshop.meetingUrl && workshop.location?.toLowerCase() === 'online' && <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-5"><p className="font-semibold text-blue-900">Online Workshop</p><p className="text-sm text-blue-700 mt-1">Use this link when the workshop starts.</p>{(application?.status === 'ACCEPTED' || isTeacher) && <a href={workshop.meetingUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">Join Workshop</a>}</div>}

                      <div className="mt-6 flex flex-wrap gap-2">
                        {application ? <span className={`px-4 py-2.5 rounded-lg text-sm font-medium ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : application.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{application.status === 'ACCEPTED' ? 'You are enrolled' : application.status === 'PENDING' ? 'Waiting for host approval' : 'Application rejected'}</span> : !isTeacher && <button onClick={() => handleApply(workshop.id)} disabled={applyingId === workshop.id} className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{applyingId === workshop.id ? 'Joining...' : workshop.requiresAcceptance ? 'Apply to Workshop' : 'Join Workshop'}</button>}
                        {isTeacher && <button onClick={() => loadParticipants(workshop.id)} className="bg-yellow-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">{participantsLoadingId === workshop.id ? 'Loading...' : workshop.requiresAcceptance ? 'Manage Participants' : 'View Enrolled Learners'}</button>}
                        <button onClick={() => navigate(`/workshops/${workshop.id}/resources`, { state: { returnTo: '/room' } })} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">Learning Resources</button>
                      </div>

                      {isTeacher && participants && <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <div className="flex flex-wrap justify-between items-center gap-2"><div><h4 className="font-bold text-gray-900">Participants</h4><p className="text-sm text-gray-500 mt-1">{acceptedParticipants.length} enrolled{workshop.requiresAcceptance && pendingParticipants.length ? ` · ${pendingParticipants.length} pending` : ''}</p></div><button onClick={() => loadParticipants(workshop.id)} className="text-sm text-blue-600">Refresh</button></div>
                        {participants.length === 0 ? <p className="text-sm text-gray-500 mt-4">No one has joined this workshop yet.</p> : <div className="mt-4 space-y-3">{participants.map((item) => <div key={item.id} className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold text-gray-900">{item.learnerName}</p><p className="text-sm text-gray-500">{item.learnerEmail}</p></div><div className="flex items-center gap-2"><span className={`text-sm font-semibold ${item.status === 'ACCEPTED' ? 'text-green-600' : item.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>{item.status}</span>{workshop.requiresAcceptance && item.status === 'PENDING' && <><button disabled={updatingParticipantId !== null} onClick={() => handleParticipantStatus(item.id, workshop.id, 'ACCEPTED')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">{updatingParticipantId === item.id ? '...' : 'Accept'}</button><button disabled={updatingParticipantId !== null} onClick={() => handleParticipantStatus(item.id, workshop.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Reject</button></>}</div></div>)}</div>}
                      </div>}
                    </div>}
                  </div>;
                })}
              </div>}
            </section>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6"><button onClick={() => setMode('create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Create a Room</button><button onClick={() => setMode('join')} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black">Join a Room</button></div>
            {mode && <div className="bg-white rounded-2xl shadow p-6 mb-6"><div className="flex justify-between mb-4"><div><h2 className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Create a Room' : 'Join a Room'}</h2><p className="text-sm text-gray-500 mt-1">{mode === 'create' ? 'Create a private learning space for your organization or team.' : 'Enter the invitation code shared by the room owner.'}</p></div><button onClick={() => setMode(null)} className="text-gray-500 text-xl">×</button></div>{mode === 'create' ? <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3"><input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Capgemini IT" required autoFocus className="flex-1 border border-gray-300 rounded-lg px-4 py-3"/><button disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50">{saving ? 'Creating...' : 'Create Room'}</button></form> : <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. KN-X7K29A" maxLength={9} required autoFocus className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono"/><button disabled={saving} className="bg-gray-900 text-white px-6 py-3 rounded-lg disabled:opacity-50">{saving ? 'Joining...' : 'Join Room'}</button></form>}</div>}
            {rooms.length === 0 ? <div className="bg-white rounded-2xl shadow p-10 text-center"><h2 className="text-xl font-bold">You are not in any rooms yet</h2><p className="text-gray-500 mt-2">Create your organization's room or join one using an invitation code.</p></div> : <><div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-bold text-gray-900">My Rooms</h2><span className="text-sm text-gray-500">{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</span></div><div className="grid md:grid-cols-2 gap-6">{rooms.map((room) => <div key={room.id} className="bg-white rounded-2xl shadow p-6 border-2 border-transparent"><h2 className="text-xl font-bold text-gray-900">{room.name}</h2><p className="text-sm text-gray-500 mt-1">Created by {room.ownerName}</p>{room.owner ? <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p><div className="flex items-center justify-between gap-3 mt-1"><span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{room.code}</span><button onClick={() => copyCode(room)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Copy</button></div><p className="text-xs text-blue-600 mt-2">Only you can see this code. Share it privately with your employees.</p></div> : <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">You are a member of this organization room. The invitation code is visible only to its owner.</div>}<div className="mt-5 flex gap-2"><button disabled={saving} onClick={() => handleSwitch(room)} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm disabled:opacity-50">Enter Room</button><button disabled={saving} onClick={() => handleLeave(room)} className="border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50">Leave</button></div></div>)}</div></>}
          </>
        )}
      </div>
    </div>
  </>;
}
