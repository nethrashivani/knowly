import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { createRoom, getMyRoom, joinRoom, leaveRoom } from '../services/roomService';

export default function RoomPage() {
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError('');
      setRoom(await getMyRoom());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoom(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try {
      setSaving(true); setError(''); setMessage('');
      setRoom(await createRoom(roomName.trim()));
      setRoomName('');
      setMessage('Room created successfully. Share the code with your employees.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      setSaving(true); setError(''); setMessage('');
      setRoom(await joinRoom(code.trim().toUpperCase()));
      setCode('');
      setMessage('You joined the room. Workshops will now be scoped to this room.');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid room code.');
    } finally { setSaving(false); }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Leave ${room?.name}?`)) return;
    try {
      setSaving(true); setError('');
      await leaveRoom();
      setRoom(null);
      setMessage('You left the room.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room.');
    } finally { setSaving(false); }
  };

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Loading room...</div></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Your Room</h1>
            <p className="text-gray-600 mt-2">Create or join an organization room. Workshops created inside a room are visible only to its members.</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
          {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

          {room ? (
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <p className="text-sm text-gray-500">Current room</p>
                  <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Created by {room.ownerName}</p>
                </div>
                <button onClick={handleLeave} disabled={saving} className="border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50">Leave Room</button>
              </div>

              <div className="mt-7 rounded-xl bg-blue-50 border border-blue-100 p-5 text-center">
                <p className="text-sm text-blue-700 font-medium">Share this room code</p>
                <div className="text-3xl font-mono font-bold tracking-widest text-blue-800 mt-2">{room.code}</div>
                <p className="text-xs text-blue-600 mt-2">Employees can enter this code from the Room page.</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900">Create a Room</h2>
                <p className="text-sm text-gray-500 mt-1 mb-5">For example: Capgemini IT</p>
                <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Organization / team name" required className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                <button disabled={saving} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create Room'}</button>
              </form>

              <form onSubmit={handleJoin} className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900">Join a Room</h2>
                <p className="text-sm text-gray-500 mt-1 mb-5">Enter the code shared by your organization.</p>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. KN-X7K29A" maxLength={9} required className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono tracking-wider" />
                <button disabled={saving} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg hover:bg-black disabled:opacity-50">{saving ? 'Joining...' : 'Join Room'}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
