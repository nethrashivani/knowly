import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSkills,
  searchSkills,
  getSkillsByCategory,
  getOtherSkills,
  deleteSkill
} from '../services/skillService';
import { isLoggedIn, getUser, logout } from '../services/authService';

const CATEGORIES = ['All', 'Technology', 'Music', 'Art', 'Language', 'Sports', 'Cooking', 'Other'];

export default function HomePage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllSkills();
      setSkills(data);
    } catch (_err) {
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleSearch = async () => {
    if (!keyword.trim()) return fetchSkills();
    try {
      setLoading(true);
      const data = await searchSkills(keyword);
      setSkills(data);
    } catch (_err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    try {
      setLoading(true);
      if (category === 'All') {
        const data = await getAllSkills();
        setSkills(data);
      } else if (category === 'Other') {
        const data = await getOtherSkills();
        setSkills(data);
      } else {
        const data = await getSkillsByCategory(category);
        setSkills(data);
      }
    } catch (_err) {
      setError('Filter failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await deleteSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (_err) {
      setError('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-blue-600 text-white py-8 px-4 text-center relative">
        <div className="absolute top-4 right-4 flex items-center gap-3">
          {isLoggedIn() ? (
            <>
              <span className="text-sm text-blue-100">👤 {getUser()?.name}</span>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-sm bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition"
              >
                Logout
              </button>
              <button
                onClick={() => navigate('/my-skills')}
                className="text-sm bg-blue-500 border border-white text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
              >
                My Skills
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm bg-white text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="text-sm border border-white text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
              >
                Register
              </button>
            </>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">SkillSwap</h1>
        <p className="text-blue-100">Discover and share skills with others</p>
        <button
          onClick={() => navigate('/add')}
          className="mt-4 bg-white text-blue-600 font-semibold px-6 py-2 rounded-full hover:bg-blue-50 transition"
        >
          + Add Your Skill
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search skills..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            onClick={() => { setKeyword(''); fetchSkills(); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
        )}

        {/* Skills Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">No skills found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map(skill => (
              <div key={skill.id} className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {skill.category}
                  </span>
                  <span className="text-xs text-gray-400">{skill.experienceYears} yrs exp</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">{skill.title}</h2>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{skill.description}</p>
                <p className="text-sm text-gray-600">👤 {skill.instructorName}</p>
                <p className="text-sm text-gray-600">📍 {skill.location}</p>
                <div className="flex gap-2 mt-auto pt-4">
                  <button
                    onClick={() => navigate(`/skills/${skill.id}`)}
                    className="flex-1 text-center text-sm bg-blue-50 text-blue-600 py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    View
                  </button>
                  {isLoggedIn() && getUser()?.email === skill.ownerEmail && (
                    <>
                      <button
                        onClick={() => navigate(`/edit/${skill.id}`)}
                        className="flex-1 text-center text-sm bg-yellow-50 text-yellow-600 py-1.5 rounded-lg hover:bg-yellow-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="flex-1 text-center text-sm bg-red-50 text-red-600 py-1.5 rounded-lg hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}