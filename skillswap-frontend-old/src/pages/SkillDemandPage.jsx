import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getSkillById } from '../services/skillService';
import {
  getInterestCount,
  getInterestedLearners
} from '../services/skillInterestService';

import Navbar from '../components/Navbar';

export default function SkillDemandPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [skill, setSkill] = useState(null);
  const [interestCount, setInterestCount] = useState(0);
  const [learners, setLearners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDemand = async () => {
      try {
        setLoading(true);
        setError('');

        const skillData = await getSkillById(id);
        setSkill(skillData);

        const count = await getInterestCount(id);
        setInterestCount(count);

        const learnerData = await getInterestedLearners(id);
        setLearners(learnerData);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 403) {
          setError(
            'You are not authorized to view the demand for this skill.'
          );
        } else {
          setError('Failed to load learner demand.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDemand();
  }, [id]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';

    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500 text-lg">
            Loading learner demand...
          </p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 py-10">

          <button
            onClick={() => navigate('/skills')}
            className="text-sm text-gray-500 hover:text-blue-600 mb-6"
          >
            ← Back to Skills
          </button>

          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-red-500">
              {error || 'Skill not found.'}
            </p>
          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">

          <button
            onClick={() => navigate('/skills')}
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            ← Back to Skills
          </button>

          <button
            onClick={() => navigate(`/skills/${id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View Skill
          </button>

        </div>

        {/* Header */}
        <div className="mb-8">

          <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
            {skill.category}
          </span>

          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Learner Demand
          </h1>

          <p className="text-gray-500 mt-1">
            Learners interested in your skill:
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-2">
            {skill.title}
          </h2>

        </div>

        {/* Demand Summary */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">

          <p className="text-sm text-blue-600 font-medium">
            Total Interest
          </p>

          <p className="text-3xl font-bold text-blue-700 mt-1">
            {interestCount}
          </p>

          <p className="text-sm text-gray-600 mt-1">
            {interestCount === 1
              ? 'learner is interested in this skill.'
              : 'learners are interested in this skill.'}
          </p>

        </div>

        {/* Learners */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Interested Learners
          </h2>

          {learners.length === 0 ? (

            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No learners have expressed interest yet.
              </p>
            </div>

          ) : (

            <div className="space-y-4">

              {learners.map((learner, index) => (

                <div
                  key={`${learner.learnerEmail}-${index}`}
                  className="border border-gray-200 rounded-lg p-5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        {learner.learnerName}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        {learner.learnerEmail}
                      </p>

                    </div>

                    <div className="text-sm text-gray-500">
                      Interested since:{' '}
                      {formatDateTime(learner.createdAt)}
                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Create Workshop */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Ready to teach?
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-4">
            Turn this learner demand into a scheduled workshop.
          </p>

          <button
            onClick={() => navigate('/workshops/create')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create Workshop for This Skill
          </button>

        </div>

      </main>

    </div>
  );
}