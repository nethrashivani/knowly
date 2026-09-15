import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getSkillById,
  deleteSkill
} from '../services/skillService';

import {
  getInterestCount,
  getInterestedLearners
} from '../services/skillInterestService';

import { isLoggedIn, getUser } from '../services/authService';
import Navbar from '../components/Navbar';

/* eslint-disable react-hooks/set-state-in-effect */

export default function SkillDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [skill, setSkill] = useState(null);
  const [interestCount, setInterestCount] = useState(0);
  const [interestedLearners, setInterestedLearners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [demandLoading, setDemandLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkillAndDemand = async () => {
      try {
        setLoading(true);
        setDemandLoading(true);
        setError('');

        const data = await getSkillById(id);

        setSkill(data);

        // Load the total number of interested learners
        try {
          const count = await getInterestCount(id);
          setInterestCount(count);
        } catch (err) {
          console.error('Failed to load interest count:', err);
          setInterestCount(0);
        }

        // Only the skill owner can see who is interested
        const owner =
          isLoggedIn() &&
          getUser()?.email === data.ownerEmail;

        if (owner) {
          try {
            const learners =
              await getInterestedLearners(id);

            setInterestedLearners(learners);
          } catch (err) {
            console.error(
              'Failed to load interested learners:',
              err
            );

            setInterestedLearners([]);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Skill not found.');
      } finally {
        setLoading(false);
        setDemandLoading(false);
      }
    };

    fetchSkillAndDemand();
  }, [id]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this skill?'
      )
    ) {
      return;
    }

    try {
      await deleteSkill(id);
      navigate('/skills');
    } catch (err) {
      console.error(err);
      setError('Failed to delete skill.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            Loading skill...
          </p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">
              {error || 'Skill not found.'}
            </p>

            <button
              onClick={() => navigate('/skills')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Skills
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner =
    isLoggedIn() &&
    getUser()?.email === skill.ownerEmail;

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Back */}
        <button
          onClick={() => navigate('/skills')}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          ← Back to Skills
        </button>

        {/* Skill Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">

          {/* Category */}
          <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
            {skill.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">
            {skill.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-5 text-sm text-gray-500 mb-7">

            <span>
              👤 {skill.instructorName}
            </span>

            <span>
              📍 {skill.location}
            </span>

            <span>
              ⭐ {skill.experienceYears} years experience
            </span>

            <span>
              📅 Posted on {formatDate(skill.createdAt)}
            </span>

          </div>

          <hr className="mb-7" />

          {/* Description */}
          <div className="mb-8">

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              About this Skill
            </h2>

            <p className="text-gray-600 leading-relaxed">
              {skill.description}
            </p>

          </div>

          {/* Demand */}
          <div className="border-t border-gray-200 pt-7 mb-8">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Learner Demand
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {interestCount === 0
                    ? 'No learners have expressed interest yet.'
                    : `${interestCount} ${
                        interestCount === 1
                          ? 'learner is'
                          : 'learners are'
                      } interested in learning this skill.`}
                </p>
              </div>

              <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm">
                {interestCount}{' '}
                {interestCount === 1
                  ? 'learner interested'
                  : 'learners interested'}
              </div>

            </div>

            {/* Owner sees interested learners */}
            {isOwner && (
              <div>

                {demandLoading ? (

                  <div className="bg-gray-50 rounded-lg p-5 text-center text-gray-500">
                    Loading interested learners...
                  </div>

                ) : interestedLearners.length === 0 ? (

                  <div className="bg-gray-50 rounded-lg p-5 text-center">
                    <p className="text-gray-500">
                      No learners have expressed interest yet.
                    </p>
                  </div>

                ) : (

                  <div className="space-y-3">

                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Interested Learners
                    </h3>

                    {interestedLearners.map((learner, index) => (

                      <div
                        key={`${learner.learnerEmail}-${index}`}
                        className="bg-blue-50 border border-blue-100 rounded-lg p-4"
                      >

                        <p className="font-semibold text-gray-900">
                          {learner.learnerName}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {learner.learnerEmail}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          Interested since:{' '}
                          {formatDateTime(
                            learner.createdAt
                          )}
                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </div>
            )}

          </div>

          {/* Owner Actions */}
          {isOwner ? (

            <div className="space-y-3">

              <button
                onClick={() =>
                  navigate('/workshops/create', {
                    state: {
                      returnTo: `/skills/${skill.id}`
                    }
                  })
                }
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Create Workshop for This Skill
              </button>

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    navigate(`/edit/${skill.id}`)
                  }
                  className="flex-1 bg-yellow-500 text-white font-semibold py-2.5 rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit Skill
                </button>

                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600 transition"
                >
                  Delete Skill
                </button>

              </div>

            </div>

          ) : (

            <div className="bg-blue-50 text-blue-600 text-sm px-4 py-3 rounded-lg text-center">
              This skill is posted by {skill.instructorName}
            </div>

          )}

        </div>

      </main>

    </div>
  );
}