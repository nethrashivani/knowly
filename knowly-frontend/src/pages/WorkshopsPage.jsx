import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getAllWorkshops,
  getMyWorkshops,
  applyForWorkshop
} from '../services/workshopService';

import { isLoggedIn, getUser, getToken } from '../services/authService';
import Navbar from '../components/Navbar';

import axios from 'axios';

const APPLICATIONS_URL =
  'https://knowly-lphd.onrender.com/api/workshop-applications';

function WorkshopsPage() {
  const navigate = useNavigate();
  const user = getUser();

  const [workshops, setWorkshops] = useState([]);
  const [appliedWorkshopIds, setAppliedWorkshopIds] = useState(new Set());

  const [viewMode, setViewMode] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(null);

  const loadApplications = useCallback(async () => {
    if (!isLoggedIn()) {
      return;
    }

    try {
      const response = await axios.get(`${APPLICATIONS_URL}/my`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const appliedIds = new Set(
        response.data.map((application) => application.workshopId)
      );

      setAppliedWorkshopIds(appliedIds);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  }, []);

  const loadWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (viewMode === 'all') {
        const requests = [getAllWorkshops()];

        if (isLoggedIn()) {
          requests.push(loadApplications());
        }

        const results = await Promise.all(requests);
        setWorkshops(results[0]);
      } else {
        const data = await getMyWorkshops();
        setWorkshops(data);
      }
    } catch (err) {
      console.error(err);
      setError(
        viewMode === 'my'
          ? 'Failed to load your workshops.'
          : 'Failed to load workshops.'
      );
    } finally {
      setLoading(false);
    }
  }, [viewMode, loadApplications]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkshops();
  }, [loadWorkshops]);

  const handleViewChange = (mode) => {
    setViewMode(mode);
    setError('');
  };

  const handleApply = async (workshopId) => {
    if (applying === workshopId || appliedWorkshopIds.has(workshopId)) {
      return;
    }

    setApplying(workshopId);
    setError('');

    try {
      await applyForWorkshop(workshopId);

      setAppliedWorkshopIds((prev) => {
        const updated = new Set(prev);
        updated.add(workshopId);
        return updated;
      });

      alert('Application submitted successfully!');
    } catch (err) {
      console.error(err);

      const message = err.response?.data?.message || '';

      if (message.toLowerCase().includes('already applied')) {
        setAppliedWorkshopIds((prev) => {
          const updated = new Set(prev);
          updated.add(workshopId);
          return updated;
        });
        setError('You have already applied to this workshop.');
      } else {
        setError(message || 'Failed to apply for workshop.');
      }
    } finally {
      setApplying(null);
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'N/A';

    return new Date(dateTime).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return 'N/A';

    return new Date(dateTime).toLocaleTimeString('en-IN', {
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
            {viewMode === 'my'
              ? 'Loading your workshops...'
              : 'Loading workshops...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <button
          onClick={() => {
            if (viewMode === 'my') {
              setViewMode('all');
            } else {
              navigate('/');
            }
          }}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          {viewMode === 'my' ? '← Back to Workshops' : '← Back to Home'}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'my' ? 'My Workshops' : 'Explore Workshops'}
            </h1>

            <p className="text-gray-500 mt-1">
              {viewMode === 'my'
                ? 'Workshops you have created and manage.'
                : 'Discover workshops and learn from others.'}
            </p>
          </div>

          {isLoggedIn() && (
            <button
              onClick={() => navigate('/workshops/create')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Create Workshop
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleViewChange('all')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
            }`}
          >
            Explore Workshops
          </button>

          <button
            onClick={() => handleViewChange('my')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'
            }`}
          >
            My Workshops
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {workshops.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {viewMode === 'my'
                ? "You haven't created any workshops yet."
                : 'No workshops available yet.'}
            </h2>

            <p className="text-gray-500 mt-2">
              {viewMode === 'my'
                ? 'Create a workshop and share what you know with interested learners.'
                : 'Be the first person to host a workshop and share your knowledge.'}
            </p>

            {isLoggedIn() && (
              <button
                onClick={() => navigate('/workshops/create')}
                className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {viewMode === 'my'
                  ? 'Create Your First Workshop'
                  : 'Create the First Workshop'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((workshop) => {
              const isOwnWorkshop =
                isLoggedIn() && user?.email === workshop.teacherEmail;

              const alreadyApplied = appliedWorkshopIds.has(workshop.id);

              return (
                <div
                  key={workshop.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {workshop.title}
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {workshop.description}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">Date:</span>{' '}
                      <span className="text-gray-600">
                        {formatDate(workshop.dateTime)}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Time:</span>{' '}
                      <span className="text-gray-600">
                        {formatTime(workshop.dateTime)}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Location:</span>{' '}
                      <span className="text-gray-600">{workshop.location}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Capacity:</span>{' '}
                      <span className="text-gray-600">{workshop.capacity}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">Host:</span>{' '}
                      <span className="text-gray-600">{workshop.teacherName}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {viewMode === 'my' || isOwnWorkshop ? (
                      <div className="space-y-2">
                        <div className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg text-center text-sm font-medium">
                          Your Workshop
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/workshops/${workshop.id}/applications`)
                          }
                          className="w-full bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
                        >
                          Manage Applications
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/workshops/${workshop.id}/resources`)
                          }
                          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Learning Resources
                        </button>
                      </div>
                    ) : alreadyApplied ? (
                      <div className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-lg text-center text-sm font-medium">
                        Already Applied
                      </div>
                    ) : isLoggedIn() ? (
                      <button
                        onClick={() => handleApply(workshop.id)}
                        disabled={applying === workshop.id}
                        className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying === workshop.id ? 'Applying...' : 'Apply to Workshop'}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Login to Apply
                      </button>
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

export default WorkshopsPage;
