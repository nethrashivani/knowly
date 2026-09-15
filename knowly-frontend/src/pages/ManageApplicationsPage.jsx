import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../services/authService';
import Navbar from '../components/Navbar';

const BASE_URL = 'http://https://knowly-lphd.onrender.com/api/workshop-applications';

export default function ManageApplicationsPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${BASE_URL}/workshop/${workshopId}`,
        authHeaders
      );

      setApplications(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApplications();
  }, [workshopId]);

  const updateStatus = async (applicationId, status) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/${applicationId}/status?status=${status}`,
        {},
        authHeaders
      );

      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? response.data
            : application
        )
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update application status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500 text-lg">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-8">

          <button
            onClick={() => navigate('/workshops')}
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Back to Workshops
          </button>

          <button
            onClick={() => navigate('/my-workshops')}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            My Workshops
          </button>

        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Applications
          </h1>

          <p className="text-gray-500 mt-1">
            Review learners who have applied to your workshop.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Applications */}
        {applications.length === 0 ? (

          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-800">
              No applicants yet
            </h2>

            <p className="text-gray-500 mt-2">
              When learners apply to this workshop, their applications
              will appear here.
            </p>

            <div className="flex justify-center gap-3 mt-6">

              <button
                onClick={() => navigate('/workshops')}
                className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Back to Workshops
              </button>

              <button
                onClick={() => navigate('/my-workshops')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                My Workshops
              </button>

            </div>

          </div>

        ) : (

          <div className="space-y-4">

            {applications.map((application) => (

              <div
                key={application.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >

                <h2 className="text-xl font-bold text-gray-900">
                  {application.learnerName}
                </h2>

                <p className="text-gray-600 mt-1">
                  {application.learnerEmail}
                </p>

                <p className="text-sm text-gray-500 mt-3">
                  Applied on:{' '}
                  {new Date(application.appliedAt).toLocaleString('en-IN')}
                </p>

                <p className="mt-3 text-gray-700">
                  <strong>Status:</strong>{' '}
                  {application.status}
                </p>

                {application.status === 'PENDING' && (
                  <div className="flex gap-3 mt-5">

                    <button
                      onClick={() =>
                        updateStatus(application.id, 'ACCEPTED')
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(application.id, 'REJECTED')
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Reject
                    </button>

                  </div>
                )}

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}