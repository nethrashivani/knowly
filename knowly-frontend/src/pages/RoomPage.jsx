import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRoom, getMyRooms, joinRoom, leaveRoom, switchRoom } from '../services/roomService';

export default function RoomPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError('');
      setRooms(await getMyRooms());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try {
      setSaving(true); setError(''); setMessage('');
      const created = await createRoom(roomName.trim());
      setRoomName(''); setShowCreate(false);
      setMessage(`Room "${created.name}" created. You are now inside it.`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setSaving(true); setError(''); setMessage('');
      const joined = await joinRoom(code.trim().toUpperCase());
      setCode(''); setShowJoin(false);
      setMessage(`You joined "${joined.name}". It is now your active room.`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid room code.');
    } finally { setSaving(false); }
  };

  const handleSwitch = async (roomId, roomNameToSwitch) => {
    try {
      setSaving(true); setError(''); setMessage('');
      await switchRoom(roomId);
      setMessage(`Switched to "${roomNameToSwitch}". Workshops now show this room.`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to switch rooms.');
    } finally { setSaving(false); }
  };

  const handleLeave = async (room) => {
    if (!window.confirm(`Leave ${room.name}? You can rejoin later with its code.`)) return;
    try {
      setSaving(true); setError(''); setMessage('');
      await leaveRoom(room.id);
      setMessage(`You left "${room.name}".`);
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room.');
    } finally { setSaving(false); }
  };

  const handleCopy = async (room) => {
    if (!room.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setMessage('Room code copied to your clipboard.');
      setError('');
    } catch {
      setError('Could not copy automatically. Please copy the code manually.');
    }
  };

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading your rooms...</div></>;

  const activeRoom = rooms.find((room) => room.active);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium mb-6">← Back to Home</button>

          <div className="mb-8">
            <p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Your Rooms</h1>
            <p className="text-gray-600 mt-2">Join multiple organization rooms and switch between them. Each room has its own workshops and learning space.</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
          {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={() => { setShowCreate(true); setShowJoin(false); setError(''); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700">+ Create a Room</button>
            <button onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black">Join a Room</button>
            {activeRoom && <button onClick={() => navigate('/workshops/create')} className="border border-blue-200 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50">+ Create Workshop in {activeRoom.name}</button>}
          </div>

          {(showCreate || showJoin) && (
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{showCreate ? 'Create a Room' : 'Join a Room'}</h2>
                  <p className="text-sm text-gray-500 mt-1">{showCreate ? 'Create a private learning space for your organization or team.' : 'Enter the invitation code shared by the room owner.'}</p>
                </div>
                <button onClick={() => { setShowCreate(false); setShowJoin(false); }} className="text-gray-500 hover:text-gray-800 text-xl">×</button>
              </div>

              {showCreate ? (
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                  <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g. Capgemini IT" required className="flex-1 border border-gray-300 rounded-lg px-4 py-3" autoFocus />
                  <button disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create Room'}</button>
                </form>
              ) : (
                <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. KN-X7K29A" maxLength={9} required className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono tracking-wider" autoFocus />
                  <button disabled={saving} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black disabled:opacity-50">{saving ? 'Joining...' : 'Join Room'}</button>
                </form>
              )}
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <h2 className="text-xl font-bold text-gray-900">You are not in any rooms yet</h2>
              <p className="text-gray-500 mt-2">Create your organization's room or join one using an invitation code.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className={`bg-white rounded-2xl shadow p-6 border-2 ${room.active ? 'border-blue-500' : 'border-transparent'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {room.active && <span className="inline-block text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-2">ACTIVE ROOM</span>}
                      <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">Created by {room.ownerName}</p>
                    </div>
                    {room.active && <span className="text-green-600 text-sm font-semibold">● Active</span>}
                  </div>

                  {room.owner ? (
                    <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <p className="text-xs text-blue-700 font-semibold">OWNER INVITATION CODE</p>
                      <div className="flex items-center justify-between gap-3 mt-1">
                        <span className="text-2xl font-mono font-bold tracking-widest text-blue-800">{room.code}</span>
                        <button onClick={() => handleCopy(room)} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Copy</button>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">Only you can see this code. Share it privately with your employees.</p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
                      <p className="text-sm text-gray-600">You are a member of this organization room.</p>
                      <p className="text-xs text-gray-500 mt-1">The invitation code is only visible to the room owner.</p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {!room.active && <button disabled={saving} onClick={() => handleSwitch(room.id, room.name)} className="flex-1 min-w-[140px] bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Enter Room</button>}
                    {room.active && <button onClick={() => navigate('/workshops')} className="flex-1 min-w-[140px] bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">View Workshops</button>}
                    <button disabled={saving} onClick={() => handleLeave(room)} className="border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50">Leave</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
