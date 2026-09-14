import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyInterests,
  removeInterest
} from '../services/skillInterestService';

import { getMyApplications } from '../services/workshopApplicationService';

import Navbar from '../components/Navbar';

/* eslint-disable react-hooks/set-state-in-effect */

export default function MyInterestsPage() {
  const [interests, setInterests] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchMyInterests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [skillInterests, workshopApplications] =
        await Promise.all([
          getMyInterests(),
          getMyApplications()
        ]);

      setInterests(skillInterests);
      setApplications(workshopApplications);
    } catch (err) {
      console.error(err);
      setError('Failed to load your interests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyInterests();
  }, [fetchMyInterests]);

  const handleRemoveInterest = async (skillId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove your interest in this skill?'
      )
    ) {
      return;
    }

    try {
      await removeInterest(skillId);

      setInterests((prev) =>
        prev.filter(
          (interest) => interest.skillId !== skillId
        )
      );
    } catch (err) {
      console.error(err);
      setError('Failed to remove your interest.');
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return 'N/A';
    }

    return new Date(dateTime).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return 'N/A';
    }

    return new Date(dateTime).toLocaleString('en-IN', {
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
            Loading your interests...
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
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Back to Home
          </button>
        </div>

        {/* Heading */}
        <div className="mb-10">

          <h1 className="text-3xl font-bold text-gray-900">
            My Interests
          </h1>

          <p className="text-gray-500 mt-1">
            Skills and workshops you're interested in on Knowly.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* ==================== SKILLS ==================== */}

        <section className="mb-12">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Skills I'm Interested In
              </h2>

              <p className="text-gray-500 mt-1">
                Skills you want to learn from other people.
              </p>
            </div>

            <button
              onClick={() => navigate('/skills')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Explore Skills
            </button>

          </div>

          {interests.length === 0 ? (

            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

              <h3 className="text-lg font-semibold text-gray-800">
                No skill interests yet.
              </h3>

              <p className="text-gray-500 mt-2">
                Explore skills and let people know what you want
                to learn.
              </p>

              <button
                onClick={() => navigate('/skills')}
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Explore Skills
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {interests.map((interest) => (

                <div
                  key={interest.interestId}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col"
                >

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {interest.skillTitle}
                  </h3>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      Offered by:
                    </span>{' '}
                    {interest.ownerName}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Interested since:{' '}
                    {formatDate(interest.createdAt)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-5">

                    <button
                      onClick={() =>
                        navigate(`/skills/${interest.skillId}`)
                      }
                      className="text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Skill
                    </button>

                    <button
                      onClick={() =>
                        handleRemoveInterest(interest.skillId)
                      }
                      className="text-sm bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition"
                    >
                      Remove Interest
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ==================== WORKSHOPS ==================== */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Workshops I've Applied To
              </h2>

              <p className="text-gray-500 mt-1">
                Workshops you've applied for and their current status.
              </p>
            </div>

            <button
              onClick={() => navigate('/workshops')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Explore Workshops
            </button>

          </div>

          {applications.length === 0 ? (

            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

              <h3 className="text-lg font-semibold text-gray-800">
                No workshop applications yet.
              </h3>

              <p className="text-gray-500 mt-2">
                Explore workshops and apply to the ones you want
                to attend.
              </p>

              <button
                onClick={() => navigate('/workshops')}
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Explore Workshops
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {applications.map((application) => (

                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col"
                >

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {application.workshopTitle}
                  </h3>

                  <p className="text-sm text-gray-600">
                    <span className="font-medium">
                      Host:
                    </span>{' '}
                    {application.teacherName}
                  </p>

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">
                      Date:
                    </span>{' '}
                    {formatDateTime(
                      application.workshopDateTime
                    )}
                  </p>

                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">
                      Location:
                    </span>{' '}
                    {application.location || 'N/A'}
                  </p>

                  <div className="mt-4">

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        application.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700'
                          : application.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {application.status}
                    </span>

                  </div>

                  {application.status === 'ACCEPTED' && (
                    <p className="text-sm text-green-700 mt-3">
                      Your application has been accepted. You can
                      attend this workshop.
                    </p>
                  )}

                  <button
                    onClick={() =>
                      navigate('/my-applications')
                    }
                    className="mt-5 w-full text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    View Application
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}