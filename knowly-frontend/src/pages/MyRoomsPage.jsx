import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createRoom, getMyRooms, joinRoom, switchRoom, leaveRoom } from '../services/roomService';

export default function MyRoomsPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
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
      setError('');
      setRooms(await getMyRooms());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((room) =>
      room.name?.toLowerCase().includes(query) ||
      room.ownerName?.toLowerCase().includes(query) ||
      room.code?.toLowerCase().includes(query)
    );
  }, [rooms, search]);

  const enterRoom = async (room) => {
    try {
      setSaving(true);
      setError('');
      await switchRoom(room.id);
      navigate('/room');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enter room.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!roomName.trim()) return;
    try {
      setSaving(true);
      setError('');
      const room = await createRoom(roomName.trim());
      setRoomName('');
      setMode(null);
      setMessage(`Created "${room.name}". You are now inside this room.`);
      await enterRoom(room);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setSaving(false);
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    if (!code.trim()) return;
    try {
      setSaving(true);
      setError('');
      const room = await joinRoom(code.trim().toUpperCase());
      setCode('');
      setMode(null);
      setMessage(`Joined "${room.name}". You are now inside this room.`);
      await enterRoom(room);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid room code.');
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 font-medium mb-6" type="button">
            ← Back to Home
          </button>

          <div className="mb-7">
            <p className="text-blue-600 font-semibold">PRIVATE LEARNING SPACE</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">My Rooms</h1>
            <p className="text-gray-600 mt-2">Choose which private learning space you want to enter.</p>
          </div>

          {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-5">{error}</div>}
          {message && <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl mb-5">{message}</div>}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-7">
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setMode(mode === 'create' ? null : 'create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">
                + Create Room
              </button>
              <button type="button" onClick={() => setMode(mode === 'join' ? null : 'join')} className="bg-white border border-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium">
                Join with Code
              </button>
            </div>

            {mode === 'create' && (
              <form onSubmit={handleCreate} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Room name" className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-200" />
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
              </form>
            )}

            {mode === 'join' && (
              <form onSubmit={handleJoin} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter room code" className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 uppercase outline-none focus:ring-2 focus:ring-blue-200" />
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50">{saving ? 'Joining...' : 'Join'}</button>
              </form>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="room-search" className="sr-only">Search your rooms</label>
            <div className="relative">
              <input
                id="room-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your rooms..."
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 shadow-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">⌕</span>
            </div>
            {search && <p className="text-sm text-gray-500 mt-2">Showing {filteredRooms.length} of {rooms.length} rooms.</p>}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading your rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <h2 className="font-semibold text-gray-800">{rooms.length === 0 ? 'You are not in any rooms yet.' : 'No rooms found.'}</h2>
              <p className="text-gray-500 text-sm mt-2">{rooms.length === 0 ? 'Create a room or join one using an invitation code.' : 'Try a different room name or code.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRooms.map((room) => (
                <div key={room.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${room.active ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">PRIVATE ROOM</p>
                      <h2 className="text-xl font-bold text-gray-900 mt-1">{room.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">Created by {room.ownerName || 'Room owner'}</p>
                    </div>
                    {room.active && <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Current room</span>}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => enterRoom(room)} disabled={saving} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                      {room.active ? 'Open Room' : 'Enter Room'}
                    </button>
                    <button type="button" onClick={() => handleLeave(room)} disabled={saving} className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                      Leave
                    </button>
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
