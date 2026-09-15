import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSkills, getMySkills, searchSkills, getSkillsByCategory, getOtherSkills, deleteSkill } from '../services/skillService';
import { getInterestCount } from '../services/skillInterestService';
import { isLoggedIn, getUser } from '../services/authService';
import Navbar from '../components/Navbar';

const CATEGORIES = ['All', 'Technology', 'Music', 'Art', 'Language', 'Sports', 'Cooking', 'Other'];

export default function SkillsExplorePage() {
  const navigate = useNavigate();
  const user = getUser();
  const [skills, setSkills] = useState([]);
  const [viewMode, setViewMode] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCounts = useCallback(async (items) => {
    const result = {};
    await Promise.all(items.map(async (skill) => {
      try { result[skill.id] = await getInterestCount(skill.id); } catch { result[skill.id] = 0; }
    }));
    setCounts(result);
  }, []);

  const load = useCallback(async () => {
    try { setLoading(true); setError(''); const data = viewMode === 'my' ? await getMySkills() : await getAllSkills(); setSkills(data); await loadCounts(data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load skills.'); }
    finally { setLoading(false); }
  }, [viewMode, loadCounts]);

  useEffect(() => { load(); }, [load]);

  const search = async () => {
    try {
      setLoading(true); setError('');
      let data = viewMode === 'my' ? await getMySkills() : await searchSkills(keyword);
      if (viewMode === 'my' && keyword.trim()) data = data.filter((skill) => `${skill.title} ${skill.description} ${skill.category}`.toLowerCase().includes(keyword.toLowerCase()));
      setSkills(data); await loadCounts(data);
    } catch { setError('Search failed.'); }
    finally { setLoading(false); }
  };

  const filterCategory = async (value) => {
    setCategory(value);
    try {
      setLoading(true); setError('');
      let data;
      if (viewMode === 'my') { const all = await getMySkills(); data = value === 'All' ? all : all.filter((skill) => skill.category === value); }
      else if (value === 'All') data = await getAllSkills();
      else if (value === 'Other') data = await getOtherSkills();
      else data = await getSkillsByCategory(value);
      setSkills(data); await loadCounts(data);
    } catch { setError('Filter failed.'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try { await deleteSkill(id); setSkills((prev) => prev.filter((skill) => skill.id !== id)); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed.'); }
  };

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="max-w-6xl mx-auto px-4 py-10">
    <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-blue-600 mb-6">← Back to Home</button>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"><div><h1 className="text-3xl font-bold text-gray-900">{viewMode === 'my' ? 'My Skills' : 'Explore Skills'}</h1><p className="text-gray-500 mt-1">{viewMode === 'my' ? 'Skills you have posted and learner demand for them.' : 'Discover people who can teach you something new.'}</p></div><button type="button" onClick={() => navigate('/add')} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">+ Add Skill</button></div>
    <div className="flex gap-2 mb-6"><button type="button" onClick={() => { setViewMode('all'); setKeyword(''); setCategory('All'); }} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>Explore Skills</button><button type="button" onClick={() => { setViewMode('my'); setKeyword(''); setCategory('All'); }} className={`px-5 py-2 rounded-lg text-sm font-medium ${viewMode === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>My Skills</button></div>
    <div className="flex flex-col sm:flex-row gap-2 mb-6"><input type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder={viewMode === 'my' ? 'Search my skills...' : 'Search skills...'} className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5" /><button type="button" onClick={search} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg">Search</button><button type="button" onClick={() => { setKeyword(''); setCategory('All'); load(); }} className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg">Clear</button></div>
    <div className="flex flex-wrap gap-2 mb-7">{CATEGORIES.map((item) => <button type="button" key={item} onClick={() => filterCategory(item)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${category === item ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600'}`}>{item}</button>)}</div>
    {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
    {loading ? <div className="text-center py-20 text-gray-400">Loading skills...</div> : skills.length === 0 ? <div className="bg-white border rounded-xl text-center py-20 text-gray-400">No skills found.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{skills.map((skill) => { const owner = isLoggedIn() && user?.email === skill.ownerEmail; return <div key={skill.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col"><div className="flex justify-between items-start"><span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">{skill.category}</span><span className="text-xs text-gray-400">{skill.experienceYears} yrs exp</span></div><h2 className="text-xl font-bold text-gray-900 mt-4">{skill.title}</h2><p className="text-gray-500 text-sm mt-2 line-clamp-3">{skill.description}</p><p className="text-sm text-gray-600 mt-4"><span className="font-medium">Offered by:</span> {skill.instructorName}</p><p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {skill.location}</p><div className="mt-4 bg-blue-50 text-blue-600 rounded-lg px-3 py-2 text-sm"><strong>{counts[skill.id] || 0}</strong> {(counts[skill.id] || 0) === 1 ? 'learner interested' : 'learners interested'}</div><div className="mt-5 space-y-2"><button type="button" onClick={() => navigate(`/users/${skill.ownerId}`)} className="w-full border border-blue-200 text-blue-600 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-50">View Instructor Profile</button>{owner && <div className="flex gap-2"><button type="button" onClick={() => navigate(`/edit/${skill.id}`)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Edit</button><button type="button" onClick={() => handleDelete(skill.id)} className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg text-sm">Delete</button></div>}</div></div>; })}</div>}
  </main></div>;
}
