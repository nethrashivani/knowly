import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorkshops, getMyWorkshops, applyForWorkshop } from '../services/workshopService';
import { isLoggedIn, getUser } from '../services/authService';
import Navbar from '../components/Navbar';

function WorkshopsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [workshops, setWorkshops] = useState([]);
  const [appliedWorkshopIds, setAppliedWorkshopIds] = useState(new Set());
  const [viewMode, setViewMode] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(null);

  const loadWorkshops = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = viewMode === 'all' ? await getAllWorkshops() : await getMyWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error(err);
      setError(viewMode === 'my' ? 'Failed to load your workshops.' : 'Failed to load workshops.');
    } finally { setLoading(false); }
  }, [viewMode]);

  useEffect(() => { loadWorkshops(); }, [loadWorkshops]);

  const loadApplications = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const { getMyApplications } = await import('../services/workshopApplicationService');
      const applications = await getMyApplications();
      setAppliedWorkshopIds(new Set(applications.map((application) => application.workshopId)));
    } catch (err) { console.error('Failed to load applications:', err); }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const filteredWorkshops = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workshops;
    return workshops.filter((workshop) =>
      workshop.title?.toLowerCase().includes(query) ||
      workshop.description?.toLowerCase().includes(query) ||
      workshop.roomName?.toLowerCase().includes(query) ||
      workshop.teacherName?.toLowerCase().includes(query) ||
      workshop.location?.toLowerCase().includes(query)
    );
  }, [workshops, search]);

  const handleViewChange = (mode) => { setViewMode(mode); setSearch(''); setError(''); };

  const handleApply = async (workshopId) => {
    if (applying === workshopId || appliedWorkshopIds.has(workshopId)) return;
    setApplying(workshopId); setError('');
    try {
      const application = await applyForWorkshop(workshopId);
      setAppliedWorkshopIds((prev) => new Set(prev).add(workshopId));
      alert(application.status === 'ACCEPTED' ? 'You are enrolled in this workshop!' : 'Application submitted successfully!');
    } catch (err) {
      const message = err.response?.data?.message || '';
      if (message.toLowerCase().includes('already applied')) {
        setAppliedWorkshopIds((prev) => new Set(prev).add(workshopId));
        setError('You have already joined/applied to this workshop.');
      } else setError(message || 'Failed to join workshop.');
    } finally { setApplying(null); }
  };

  const formatDate = (dateTime) => dateTime ? new Date(dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const formatTime = (dateTime) => dateTime ? new Date(dateTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'N/A';

  return <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-6xl mx-auto px-4 py-10">
      <button type="button" onClick={() => viewMode === 'my' ? setViewMode('all') : navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 mb-6 transition">{viewMode === 'my' ? '← Back to Workshops' : '← Back to Home'}</button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div><h1 className="text-3xl font-bold text-gray-900">{viewMode === 'my' ? 'My Workshops' : 'Explore Workshops'}</h1><p className="text-gray-500 mt-1">{viewMode === 'my' ? 'Workshops you have created and manage.' : 'Discover workshops inside your current Room.'}</p></div>{isLoggedIn() && <button type="button" onClick={() => navigate('/workshops/create')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Create Workshop</button>}</div>
      <div className="flex gap-2 mb-6"><button type="button" onClick={() => handleViewChange('all')} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>Explore Workshops</button><button type="button" onClick={() => handleViewChange('my')} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>My Workshops</button></div>

      <div className="mb-6"><label htmlFor="workshop-search" className="sr-only">Search workshops</label><div className="relative"><input id="workshop-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={viewMode === 'my' ? 'Search your workshops...' : 'Search workshops by title, host, room, or location...'} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 shadow-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">⌕</span></div>{search && <p className="text-sm text-gray-500 mt-2">Showing {filteredWorkshops.length} of {workshops.length} workshops.</p>}</div>

      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
      {loading ? <div className="text-center py-20 text-gray-400 text-lg">Loading workshops...</div> : workshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center"><h2 className="text-xl font-semibold text-gray-800">{viewMode === 'my' ? "You haven't created any workshops yet." : 'No workshops available yet.'}</h2></div> : filteredWorkshops.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center"><h2 className="text-xl font-semibold text-gray-800">No workshops match your search.</h2><p className="text-gray-500 mt-2">Try a different title, host, room, or location.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWorkshops.map((workshop) => { const isOwnWorkshop = isLoggedIn() && user?.email === workshop.teacherEmail; const alreadyApplied = appliedWorkshopIds.has(workshop.id); return <div key={workshop.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6">
          <div className="flex items-start justify-between gap-3 mb-2"><h2 className="text-xl font-bold text-gray-900">{workshop.title}</h2><span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{workshop.requiresAcceptance ? 'Manual approval' : 'Open to Room'}</span></div>
          <div className="mb-5 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3"><p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Inside Room</p><p className="text-sm font-semibold text-gray-800 mt-1">{workshop.roomName || 'Current Room'}</p></div>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{workshop.description}</p>
          <div className="space-y-3 text-sm"><div><span className="font-semibold text-gray-800">Date:</span> <span className="text-gray-600">{formatDate(workshop.dateTime)}</span></div><div><span className="font-semibold text-gray-800">Time:</span> <span className="text-gray-600">{formatTime(workshop.dateTime)}</span></div><div><span className="font-semibold text-gray-800">Location:</span> <span className="text-gray-600">{workshop.location}</span></div><div><span className="font-semibold text-gray-800">Host:</span> <button type="button" onClick={() => navigate(`/users/${workshop.teacherId}`)} className="text-blue-600 hover:underline">{workshop.teacherName}</button></div></div>
          <div className="mt-6">{viewMode === 'my' || isOwnWorkshop ? <div className="space-y-2"><div className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-center text-sm font-medium">Your Workshop</div><button type="button" onClick={() => navigate(`/workshops/${workshop.id}/applications`)} className="w-full bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium">{workshop.requiresAcceptance ? 'Manage Applications' : 'View Enrolled Learners'}</button><button type="button" onClick={() => navigate(`/workshops/${workshop.id}/resources`)} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Learning Resources</button></div> : alreadyApplied ? <div className="w-full bg-green-100 text-green-700 py-2.5 rounded-lg text-center text-sm font-medium">{workshop.requiresAcceptance ? 'Already Applied' : 'Enrolled in Workshop'}</div> : isLoggedIn() ? <button type="button" onClick={() => handleApply(workshop.id)} disabled={applying === workshop.id} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{applying === workshop.id ? 'Joining...' : workshop.requiresAcceptance ? 'Apply to Workshop' : 'Join Workshop'}</button> : <button type="button" onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium">Login to Join</button>}</div>
        </div>; })}
      </div>}
    </main>
  </div>;
}

export default WorkshopsPage;
