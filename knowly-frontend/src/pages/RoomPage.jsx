import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRoom, getMyRooms, joinRoom, leaveRoom, switchRoom } from '../services/roomService';
import { getAllWorkshops } from '../services/workshopService';

export default function RoomPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomWorkshops, setRoomWorkshops] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getMyRooms();
      setRooms(data);
      setError('');
      const active = data.find((room) => room.active);
      if (active) {
        try {
          setRoomWorkshops(await getAllWorkshops());
        } catch {
          setRoomWorkshops([]);
        }
      } else {
        setRoomWorkshops([]);
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
      setSaving(true);
      setError('');
      const r = await createRoom(roomName.trim());
      setRoomName('');
      setMode(null);
      setMessage(`Created "${r.name}". You are now inside this room.`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setSaving(true);
      setError('');
      const r = await joinRoom(code.trim().toUpperCase());
      setCode('');
      setMode(null);
      setMessage(`Joined "${r.name}". It is now your active room.`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid room code.');
    } finally { setSaving(false); }
  };

  const handleSwitch = async (room) => {
    try {
      setSaving(true);
      setError('');
      await switchRoom(room.id);
      setMessage(`Switched to "${room.name}".`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to switch rooms.');
    } finally { setSaving(false); }
  };

  const handleLeave = async (room) => {
    if (!window.confirm(`Leave ${room.name}? You can rejoin later with its code.`)) return;
    try {
      setSaving(true);
      setError('');
      await leaveRoom(room.id);
      setMessage(`You left "${room.name}".`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room.');
    } finally { setSaving(false); }
  };

  const copyCode = async (room) => {
    try {
      await navigator.clipboard.writeText(room.code);
      setMessage('Room code copied to your clipboard.');
      setError('');
    } catch {
      setError('Could not copy automatically. Please copy the code manually.');
    }
  };

  const formatDate = (value) => new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading your rooms...</div></>;
  const activeRoom = rooms.find((room) => room.active);

  return <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium mb-6">← Back to Home</button>
        <div className="mb-7">
          <p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Your Rooms</h1>
          <p className="text-gray-600 mt-2">Each room is its own private learning space with its own workshops and members.</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
        {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => setMode('create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Create a Room</button>
          <button onClick={() => setMode('join')} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black">Join a Room</button>
          {activeRoom && <button onClick={() => navigate('/workshops/create')} className="border border-blue-200 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50">+ Create Workshop in {activeRoom.name}</button>}
        </div>

        {mode && <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between mb-4">
            <div><h2 className="text-xl font-bold text-gray-900">{mode === 'create' ? 'Create a Room' : 'Join a Room'}</h2><p className="text-sm text-gray-500 mt-1">{mode === 'create' ? 'Create a private learning space for your organization or team.' : 'Enter the invitation code shared by the room owner.'}</p></div>
            <button onClick={() => setMode(null)} className="text-gray-500 text-xl">×</button>
          </div>
          {mode === 'create' ? <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3"><input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Capgemini IT" required autoFocus className="flex-1 border border-gray-300 rounded-lg px-4 py-3"/><button disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50">{saving ? 'Creating...' : 'Create Room'}</button></form> : <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. KN-X7K29A" maxLength={9} required autoFocus className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono"/><button disabled={saving} className="bg-gray-900 text-white px-6 py-3 rounded-lg disabled:opacity-50">{saving ? 'Joining...' : 'Join Room'}</button></form>}
        </div>}

        {rooms.length === 0 ? <div className="bg-white rounded-2xl shadow p-10 text-center"><h2 className="text-xl font-bold">You are not in any rooms yet</h2><p className="text-gray-500 mt-2">Create your organization's room or join one using an invitation code.</p></div> : <div className="grid md:grid-cols-2 gap-6">{rooms.map((room) => <div key={room.id} className={`bg-white rounded-2xl shadow p-6 border-2 ${room.active ? 'border-blue-500' : 'border-transparent'}`}>
          <div className="flex justify-between gap-3"><div>{room.active && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">ACTIVE ROOM</span>}<h2 className="text-xl font-bold text-gray-900 mt-2">{room.name}</h2><p className="text-sm text-gray-500 mt-1">Created by {room.ownerName}</p></div>{room.active && <span className="text-green-600 text-sm font-semibold">● Active</span>}</div>
          {room.owner ? <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4"><p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p><div className="flex items-center justify-between gap-3 mt-1"><span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{room.code}</span><button onClick={() => copyCode(room)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">Copy</button></div><p className="text-xs text-blue-600 mt-2">Only you can see this code. Share it privately with your employees.</p></div> : <div className="mt-5 rounded-xl bg-gray-50 border p-4 text-sm text-gray-600">You are a member of this organization room. The invitation code is visible only to its owner.</div>}
          <div className="mt-5 flex gap-2">{!room.active ? <button disabled={saving} onClick={() => handleSwitch(room)} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm disabled:opacity-50">Enter Room</button> : <button onClick={() => document.getElementById('room-workshops')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm">View Workshops</button>}<button disabled={saving} onClick={() => handleLeave(room)} className="border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50">Leave</button></div>
        </div>)}</div>}

        {activeRoom && <section id="room-workshops" className="mt-10">
          <div className="flex items-end justify-between gap-4 mb-5"><div><p className="text-sm font-semibold text-blue-600">{activeRoom.name}</p><h2 className="text-2xl font-bold text-gray-900">Workshops inside this room</h2><p className="text-gray-500 mt-1">Only members of this room can access these workshops.</p></div><button onClick={() => navigate('/workshops/create')} className="hidden sm:block bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium">+ Create Workshop</button></div>
          {roomWorkshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h3 className="font-semibold text-gray-800">No workshops in this room yet.</h3><p className="text-gray-500 text-sm mt-1">Create the first workshop for {activeRoom.name}.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{roomWorkshops.map((workshop) => <button key={workshop.id} onClick={() => navigate(`/workshops/${workshop.id}?fromRoom=true`)} className="text-left bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-blue-600">ROOM WORKSHOP</p><h3 className="text-xl font-bold text-gray-900 mt-1">{workshop.title}</h3></div><span className="text-blue-600 text-sm">Open →</span></div><p className="text-gray-600 text-sm mt-3 line-clamp-2">{workshop.description}</p><div className="mt-4 text-sm text-gray-500"><p>{formatDate(workshop.dateTime)} · {new Date(workshop.dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p><p className="mt-1">Host: {workshop.teacherName}</p></div></button>)}</div>}
        </section>}
      </div>
    </div>
  </>;
}
