import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createWorkshop } from '../services/workshopService';
import { getMyRooms } from '../services/roomService';

export default function CreateWorkshopPage() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const returnTo = routeLocation.state?.returnTo || '/workshops';
  const lockedRoomId = routeLocation.state?.roomId || null;
  const lockedRoomName = routeLocation.state?.roomName || '';
  const isSkillFlow = returnTo.startsWith('/skills/');

  const [rooms, setRooms] = useState([]);
  const [scope, setScope] = useState(lockedRoomId ? 'room' : 'public');
  const [selectedRoomId, setSelectedRoomId] = useState(lockedRoomId ? String(lockedRoomId) : '');
  const [formData, setFormData] = useState({ title: '', description: '', date: '', hour: '', minute: '', period: 'AM', mode: 'Offline', offlineLocation: '', meetingUrl: '', capacity: 10, requiresAcceptance: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyRooms().then(setRooms).catch(() => setRooms([]));
  }, []);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const validateTime = () => {
    const hour = Number(formData.hour); const minute = Number(formData.minute);
    if (!/^\d{1,2}$/.test(formData.hour) || hour < 1 || hour > 12) return 'Please enter a valid hour between 1 and 12.';
    if (!/^\d{2}$/.test(formData.minute) || minute < 0 || minute > 59) return 'Please enter minutes as two digits, for example 05 or 30.';
    return null;
  };
  const convertTo24Hour = () => {
    let hour = Number(formData.hour);
    if (formData.period === 'AM') { if (hour === 12) hour = 0; } else if (hour !== 12) hour += 12;
    return `${String(hour).padStart(2, '0')}:${formData.minute}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError('Please enter a workshop title.');
    if (!formData.date) return setError('Please select a workshop date.');
    const timeError = validateTime(); if (timeError) return setError(timeError);
    if (scope === 'room' && !selectedRoomId) return setError('Please select a room.');
    if (formData.mode === 'Offline' && !formData.offlineLocation.trim()) return setError('Please enter the workshop location.');
    if (formData.mode === 'Online' && !formData.meetingUrl.trim()) return setError('Please enter a Google Meet or Zoom URL for an online workshop.');
    if (formData.meetingUrl.trim() && !/^https?:\/\//i.test(formData.meetingUrl.trim())) return setError('Meeting URL must start with http:// or https://');
    if (formData.requiresAcceptance && Number(formData.capacity) < 1) return setError('Please enter a capacity for a workshop with manual acceptance.');

    try {
      setSaving(true); setError('');
      await createWorkshop({
        title: formData.title.trim(),
        description: formData.description,
        dateTime: `${formData.date}T${convertTo24Hour()}`,
        location: formData.mode === 'Online' ? 'Online' : formData.offlineLocation.trim(),
        meetingUrl: formData.mode === 'Online' ? formData.meetingUrl.trim() : null,
        capacity: formData.requiresAcceptance ? Number(formData.capacity) : null,
        requiresAcceptance: formData.requiresAcceptance,
        roomId: scope === 'room' ? Number(selectedRoomId) : null
      });
      navigate(returnTo);
    } catch (err) {
      console.error(err); setError(err.response?.data?.message || 'Failed to create workshop.');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <button type="button" onClick={() => navigate(returnTo)} className="text-blue-600 mb-4">{isSkillFlow ? '← Back to Skill' : returnTo === '/room' ? '← Back to Room' : '← Back to Workshops'}</button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Workshop</h1>
        <p className="text-gray-500 mb-6">Choose whether this workshop is public or belongs to one of your private rooms.</p>

        {!lockedRoomId && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
            <p className="font-medium text-gray-900 mb-3">Workshop visibility</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setScope('public')} className={`text-left rounded-lg border p-4 ${scope === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                <span className="font-semibold text-gray-900">Public workshop</span>
                <span className="block text-sm text-gray-600 mt-1">Visible to everyone. Anyone can discover and apply.</span>
              </button>
              <button type="button" onClick={() => setScope('room')} className={`text-left rounded-lg border p-4 ${scope === 'room' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                <span className="font-semibold text-gray-900">Inside a room</span>
                <span className="block text-sm text-gray-600 mt-1">Visible only to members of the selected room.</span>
              </button>
            </div>
            {scope === 'room' && (
              <div className="mt-4">
                <label className="block font-medium mb-1">Room</label>
                <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                  <option value="">Select a room</option>
                  {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {lockedRoomId && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6"><p className="text-xs font-semibold text-blue-700 uppercase">Inside room</p><p className="font-semibold text-gray-900 mt-1">{lockedRoomName || 'Selected room'}</p><p className="text-sm text-gray-600 mt-1">This workshop will only be visible to members of this room.</p></div>}

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block font-medium mb-1">Workshop Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. Java Basics" /></div>
          <div><label className="block font-medium mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="Describe what participants will learn..." /></div>
          <div><label className="block font-medium mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>
          <div><label className="block font-medium mb-1">Time</label><div className="flex flex-wrap items-center gap-2"><input type="text" name="hour" value={formData.hour} onChange={(e) => setFormData((prev) => ({ ...prev, hour: e.target.value.replace(/\D/g, '').slice(0, 2) }))} placeholder="HH" inputMode="numeric" maxLength="2" required className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center" /><span className="text-xl font-semibold text-gray-500">:</span><input type="text" name="minute" value={formData.minute} onChange={(e) => setFormData((prev) => ({ ...prev, minute: e.target.value.replace(/\D/g, '').slice(0, 2) }))} placeholder="MM" inputMode="numeric" maxLength="2" required className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center" /><select name="period" value={formData.period} onChange={handleChange} className="border border-gray-300 rounded-lg px-3 py-2"><option value="AM">AM</option><option value="PM">PM</option></select></div><p className="text-xs text-gray-500 mt-1">Enter hour from 1–12 and minutes from 00–59.</p></div>
          <div><label className="block font-medium mb-1">Workshop Type</label><select name="mode" value={formData.mode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2"><option value="Offline">Offline</option><option value="Online">Online</option></select></div>
          {formData.mode === 'Offline' && <div><label className="block font-medium mb-1">Location</label><input type="text" name="offlineLocation" value={formData.offlineLocation} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="e.g. Chennai" /></div>}
          {formData.mode === 'Online' && <div><label className="block font-medium mb-1">Meeting URL</label><input type="url" name="meetingUrl" value={formData.meetingUrl} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="https://meet.google.com/... or https://zoom.us/..." /></div>}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="requiresAcceptance" checked={formData.requiresAcceptance} onChange={(e) => setFormData((prev) => ({ ...prev, requiresAcceptance: e.target.checked }))} className="mt-1 h-4 w-4" /><span><span className="block font-medium text-gray-900">Require manual acceptance</span><span className="block text-sm text-gray-600 mt-1">Turn this on when you want to approve participants.</span></span></label></div>
          {formData.requiresAcceptance && <div><label className="block font-medium mb-1">Capacity</label><input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required className="w-full border border-gray-300 rounded-lg px-4 py-2" /></div>}
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{saving ? 'Creating...' : 'Create Workshop'}</button>
        </form>
      </div>
    </div>
  );
}
