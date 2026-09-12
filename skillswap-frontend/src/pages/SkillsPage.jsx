import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getAllSkills,
  getMySkills,
  searchSkills,
  getSkillsByCategory,
  getOtherSkills,
  deleteSkill
} from '../services/skillService';

import {
  expressInterest,
  removeInterest,
  getInterestCount,
  isInterested
} from '../services/skillInterestService';

import { isLoggedIn, getUser } from '../services/authService';
import Navbar from '../components/Navbar';

/* eslint-disable react-hooks/set-state-in-effect */

const CATEGORIES = [
  'All',
  'Technology',
  'Music',
  'Art',
  'Language',
  'Sports',
  'Cooking',
  'Other'
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState('all');

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [interestCounts, setInterestCounts] = useState({});
  const [interestedSkills, setInterestedSkills] = useState({});
  const [interestLoading, setInterestLoading] = useState({});

  /*
   * Load interest information for the displayed skills.
   */
  const loadInterestData = useCallback(async (skillList) => {
    const counts = {};
    const statuses = {};

    await Promise.all(
      skillList.map(async (skill) => {
        try {
          counts[skill.id] = await getInterestCount(skill.id);
        } catch {
          counts[skill.id] = 0;
        }

        if (isLoggedIn()) {
          try {
            statuses[skill.id] = await isInterested(skill.id);
          } catch {
            statuses[skill.id] = false;
          }
        }
      })
    );

    setInterestCounts(counts);
    setInterestedSkills(statuses);
  }, []);

  /*
   * Load all skills.
   */
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAllSkills();

      setSkills(data);
      await loadInterestData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load skills.');
    } finally {
      setLoading(false);
    }
  }, [loadInterestData]);

  /*
   * Load only the current user's skills.
   */
  const fetchMySkills = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMySkills();

      setSkills(data);
      await loadInterestData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your skills.');
    } finally {
      setLoading(false);
    }
  }, [loadInterestData]);

  /*
   * Initial load.
   */
  useEffect(() => {
    if (viewMode === 'my') {
      fetchMySkills();
    } else {
      fetchSkills();
    }
  }, [viewMode, fetchSkills, fetchMySkills]);

  /*
   * Switch between Explore Skills and My Skills.
   */
  const handleViewChange = (mode) => {
    setViewMode(mode);
    setKeyword('');
    setSelectedCategory('All');
    setError('');
  };

  /*
   * Search skills.
   */
  const handleSearch = async () => {
    if (viewMode === 'my') {
      if (!keyword.trim()) {
        await fetchMySkills();
        return;
      }

      const lowerKeyword = keyword.toLowerCase();

      const filtered = skills.filter((skill) =>
        skill.title?.toLowerCase().includes(lowerKeyword) ||
        skill.description?.toLowerCase().includes(lowerKeyword) ||
        skill.category?.toLowerCase().includes(lowerKeyword)
      );

      setSkills(filtered);
      await loadInterestData(filtered);
      return;
    }

    if (!keyword.trim()) {
      await fetchSkills();
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await searchSkills(keyword);

      setSkills(data);
      await loadInterestData(data);
    } catch (err) {
      console.error(err);
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Filter skills by category.
   */
  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);

    if (viewMode === 'my') {
      try {
        setLoading(true);
        setError('');

        const data = await getMySkills();

        const filtered =
          category === 'All'
            ? data
            : data.filter(
                (skill) => skill.category === category
              );

        setSkills(filtered);
        await loadInterestData(filtered);
      } catch (err) {
        console.error(err);
        setError('Filter failed.');
      } finally {
        setLoading(false);
      }

      return;
    }

    try {
      setLoading(true);
      setError('');

      let data;

      if (category === 'All') {
        data = await getAllSkills();
      } else if (category === 'Other') {
        data = await getOtherSkills();
      } else {
        data = await getSkillsByCategory(category);
      }

      setSkills(data);
      await loadInterestData(data);
    } catch (err) {
      console.error(err);
      setError('Filter failed.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Express or remove interest.
   */
  const handleInterest = async (skillId) => {
    try {
      setInterestLoading((prev) => ({
        ...prev,
        [skillId]: true
      }));

      setError('');

      if (interestedSkills[skillId]) {
        await removeInterest(skillId);

        setInterestedSkills((prev) => ({
          ...prev,
          [skillId]: false
        }));

        setInterestCounts((prev) => ({
          ...prev,
          [skillId]: Math.max(
            (prev[skillId] || 1) - 1,
            0
          )
        }));
      } else {
        await expressInterest(skillId);

        setInterestedSkills((prev) => ({
          ...prev,
          [skillId]: true
        }));

        setInterestCounts((prev) => ({
          ...prev,
          [skillId]: (prev[skillId] || 0) + 1
        }));
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Could not update interest.'
      );
    } finally {
      setInterestLoading((prev) => ({
        ...prev,
        [skillId]: false
      }));
    }
  };

  /*
   * Delete skill.
   */
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this skill?'
      )
    ) {
      return;
    }

    try {
      setError('');

      await deleteSkill(id);

      setSkills((prev) =>
        prev.filter((skill) => skill.id !== id)
      );

      setInterestCounts((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setInterestedSkills((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'my'
                ? 'My Skills'
                : 'Explore Skills'}
            </h1>

            <p className="text-gray-500 mt-1">
              {viewMode === 'my'
                ? 'Skills you have posted and the learner demand for them.'
                : 'Discover people who can teach you something new.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/add')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Add Skill
          </button>

        </div>

        {/* Skills View Switcher */}
        <div className="flex gap-2 mb-6">

          <button
            onClick={() => handleViewChange('all')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
            }`}
          >
            Explore Skills
          </button>

          <button
            onClick={() => handleViewChange('my')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
            }`}
          >
            My Skills
          </button>

        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">

          <input
            type="text"
            placeholder={
              viewMode === 'my'
                ? 'Search my skills...'
                : 'Search skills...'
            }
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>

          <button
            onClick={() => {
              setKeyword('');
              setSelectedCategory('All');

              if (viewMode === 'my') {
                fetchMySkills();
              } else {
                fetchSkills();
              }
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>

        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-7">

          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() =>
                handleCategoryFilter(category)
              }
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
              }`}
            >
              {category}
            </button>
          ))}

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (

          <div className="text-center py-20 text-gray-400 text-lg">
            {viewMode === 'my'
              ? 'Loading your skills...'
              : 'Loading skills...'}
          </div>

        ) : skills.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-xl text-center py-20 px-6">

            <p className="text-gray-400 text-lg">
              {viewMode === 'my'
                ? "You haven't posted any skills yet."
                : 'No skills found.'}
            </p>

            <button
              onClick={() => navigate('/add')}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              {viewMode === 'my'
                ? 'Add your first skill'
                : 'Be the first to add a skill'}
            </button>

          </div>

        ) : (

          /* Skill Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {skills.map((skill) => {

              const isOwner =
                isLoggedIn() &&
                user?.email === skill.ownerEmail;

              const interestCount =
                interestCounts[skill.id] || 0;

              return (
                <div
                  key={skill.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col"
                >

                  {/* Category */}
                  <div className="flex justify-between items-start mb-3">

                    <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                      {skill.category}
                    </span>

                    <span className="text-xs text-gray-400">
                      {skill.experienceYears} yrs exp
                    </span>

                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {skill.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {skill.description}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">
                      Offered by:
                    </span>{' '}
                    {skill.instructorName}
                  </p>

                  {/* Location */}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      Location:
                    </span>{' '}
                    {skill.location}
                  </p>

                  {/* Interest Count */}
                  <div className="mt-4 bg-blue-50 text-blue-600 rounded-lg px-3 py-2 text-sm">
                    <strong>
                      {interestCount}
                    </strong>{' '}

                    {interestCount === 1
                      ? 'learner interested'
                      : 'learners interested'}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-5">

                    {/* Interest */}
                    {!isOwner && isLoggedIn() && (
                      <button
                        onClick={() =>
                          handleInterest(skill.id)
                        }
                        disabled={
                          interestLoading[skill.id]
                        }
                        className={`flex-1 min-w-[120px] text-sm py-2 rounded-lg transition ${
                          interestedSkills[skill.id]
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {interestLoading[skill.id]
                          ? 'Updating...'
                          : interestedSkills[skill.id]
                            ? 'Interested'
                            : "I'm Interested"}
                      </button>
                    )}

                    {/* View */}
                    <button
                      onClick={() =>
                        navigate(`/skills/${skill.id}`)
                      }
                      className="flex-1 min-w-[80px] text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      View
                    </button>

                    {/* Owner Actions */}
                    {isOwner && (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/edit/${skill.id}`)
                          }
                          className="flex-1 min-w-[70px] text-sm bg-yellow-50 text-yellow-600 py-2 rounded-lg hover:bg-yellow-100 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(skill.id)
                          }
                          className="flex-1 min-w-[70px] text-sm bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}