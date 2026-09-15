import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMySkills,
  deleteSkill
} from '../services/skillService';

import {
  getInterestCount
} from '../services/skillInterestService';

import Navbar from '../components/Navbar';

/* eslint-disable react-hooks/set-state-in-effect */

export default function MySkillsPage() {
  const [skills, setSkills] = useState([]);
  const [interestCounts, setInterestCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchMySkills = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMySkills();

      setSkills(data);

      const counts = {};

      await Promise.all(
        data.map(async (skill) => {
          try {
            counts[skill.id] = await getInterestCount(skill.id);
          } catch (err) {
            console.error(
              `Failed to load interest count for skill ${skill.id}`,
              err
            );

            counts[skill.id] = 0;
          }
        })
      );

      setInterestCounts(counts);
    } catch (err) {
      console.error(err);
      setError('Failed to load your skills.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMySkills();
  }, [fetchMySkills]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this skill?'
      )
    ) {
      return;
    }

    try {
      await deleteSkill(id);

      setSkills((prev) =>
        prev.filter((skill) => skill.id !== id)
      );

      setInterestCounts((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError('Delete failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500 text-lg">
            Loading your skills...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-8">

          <button
            onClick={() => navigate('/skills')}
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Back to Skills
          </button>

          <button
            onClick={() => navigate('/add')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Skill
          </button>

        </div>

        {/* Heading */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Skills
          </h1>

          <p className="text-gray-500 mt-1">
            Skills you have posted and the learner demand for them.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {skills.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">

            <h2 className="text-xl font-semibold text-gray-800">
              You haven't posted any skills yet.
            </h2>

            <p className="text-gray-500 mt-2">
              Add a skill so learners can discover what you can teach.
            </p>

            <button
              onClick={() => navigate('/add')}
              className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Add Your First Skill
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {skills.map((skill) => {

              const interestCount =
                interestCounts[skill.id] || 0;

              return (
                <div
                  key={skill.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col"
                >

                  {/* Category + Experience */}
                  <div className="flex justify-between items-start mb-3">

                    <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                      {skill.category}
                    </span>

                    <span className="text-xs text-gray-400">
                      {skill.experienceYears} yrs exp
                    </span>

                  </div>

                  {/* Skill */}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {skill.title}
                  </h2>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                    {skill.description}
                  </p>

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
                  <div className="grid grid-cols-2 gap-2 mt-5">

                    {/* View Skill */}
                    <button
                      onClick={() =>
                        navigate(`/skills/${skill.id}`)
                      }
                      className="text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      View
                    </button>

                    {/* View Demand */}
                    <button
                      onClick={() =>
                        navigate(
                          `/skills/${skill.id}/demand`
                        )
                      }
                      className="text-sm bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition"
                    >
                      View Demand
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() =>
                        navigate(`/edit/${skill.id}`)
                      }
                      className="text-sm bg-yellow-50 text-yellow-600 py-2 rounded-lg hover:bg-yellow-100 transition"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        handleDelete(skill.id)
                      }
                      className="text-sm bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete
                    </button>

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