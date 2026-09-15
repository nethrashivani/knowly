import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorkshops, getMyWorkshops, applyForWorkshop } from '../services/workshopService';
import { isLoggedIn, getUser } from '../services/authService';
import Navbar from '../components/Navbar';

export default function WorkshopsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [workshops, setWorkshops] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(null);

  const loadWorkshops = useCallback(async () => {
    try { setLoading(true); setError(''); setWorkshops(viewMode === 'all' ? await getAllWorkshops() : await getMyWorkshops()); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load workshops.'); }
    finally { setLoading(false); }
  }, [viewMode]);
  useEffect(() => { loadWorkshops(); }, [loadWorkshops]);
  useEffect(() => { if (isLoggedIn()) import('../services/workshopApplicationService').then(({ getMyApplications }) => getMyApplications().then((items) => setAppliedIds(new Set(items.map((x) => x.workshopId)))).catch(() => {})); }, []);

  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); if (!q) return workshops; return workshops.filter((w) => [w.title, w.description, w.teacherName, w.location].some((v) => v?.toLowerCase().includes(q))); }, [workshops, search]);
  const handleApply = async (id) => { if (applying === id || appliedIds.has(id)) return; try { setApplying(id); setError(''); const app = await applyForWorkshop(id); setAppliedIds((prev) => new Set(prev).add(id)); } catch (err) { setError(err.response?.data?.message || 'Failed to join workshop.'); } finally { setApplying(null); } };
  const formatDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const formatTime = (v) => v ? new Date(v).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'N/A';

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-6xl mx-auto px-4 py-10">
    <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 mb-6">← Back to Home</button>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div><h1 className="text-3xl font-bold text-gray-900">{viewMode === 'my' ? 'My Workshops' : 'Explore Workshops'}</h1><p className="text-gray-500 mt-1">{viewMode === 'my' ? 'Workshops you have created and manage.' : 'Discover public workshops open to everyone.'}</p></div>{isLoggedIn() && <button type="button" onClick={() => navigate('/workshops/create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Create Workshop</button>}</div>
    <div className="flex gap-2 mb-6"><button type="button" onClick={() => { setViewMode('all'); setSearch(''); }} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>Explore Workshops</button><button type="button" onClick={() => { setViewMode('my'); setSearch(''); }} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>My Workshops</button></div>
    <div className="mb-6"><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={viewMode === 'my' ? 'Search your workshops...' : 'Search public workshops by title, host, or location...'} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-200" />{search && <p className="text-sm text-gray-500 mt-2">Showing {filtered.length} of {workshops.length} workshops.</p>}</div>
    {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
    {loading ? <div className="text-center py-20 text-gray-400">Loading workshops...</div> : filtered.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center"><h2 className="text-xl font-semibold text-gray-800">{workshops.length === 0 ? (viewMode === 'my' ? "You haven't created any workshops yet." : 'No public workshops available yet.') : 'No workshops match your search.'}</h2></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filtered.map((w) => { const own = isLoggedIn() && user?.email === w.teacherEmail; const applied = appliedIds.has(w.id); return <article key={w.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-green-600">PUBLIC WORKSHOP</p><h2 className="text-xl font-bold text-gray-900 mt-1">{w.title}</h2></div><span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{w.requiresAcceptance ? 'Manual approval' : 'Open to everyone'}</span></div><p className="text-gray-600 text-sm leading-relaxed mt-4">{w.description}</p><div className="space-y-3 text-sm mt-5"><div><b>Date:</b> <span className="text-gray-600">{formatDate(w.dateTime)}</span></div><div><b>Time:</b> <span className="text-gray-600">{formatTime(w.dateTime)}</span></div><div><b>Location:</b> <span className="text-gray-600">{w.location}</span></div><div><b>Host:</b> <button type="button" onClick={() => navigate(`/users/${w.teacherId}`)} className="text-blue-600 hover:underline">{w.teacherName}</button></div></div><div className="mt-6">{viewMode === 'my' || own ? <div className="space-y-2"><div className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-center text-sm font-medium">Your Workshop</div><button type="button" onClick={() => navigate(`/workshops/${w.id}/applications`)} className="w-full bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium">{w.requiresAcceptance ? 'Manage Applications' : 'View Enrolled Learners'}</button></div> : applied ? <div className="w-full bg-green-100 text-green-700 py-2.5 rounded-lg text-center text-sm font-medium">{w.requiresAcceptance ? 'Already Applied' : 'Enrolled in Workshop'}</div> : isLoggedIn() ? <button type="button" onClick={() => handleApply(w.id)} disabled={applying === w.id} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{applying === w.id ? 'Joining...' : w.requiresAcceptance ? 'Apply to Workshop' : 'Join Workshop'}</button> : <button type="button" onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Login to Join</button>}</div></article>; })}</div>}
  </main></div>;
}
