import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../services/authService';

const BASE_URL = 'http://localhost:8080/api/workshop-applications';

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
    return <div>Loading applications...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate('/my-workshops')}
          className="text-blue-600 mb-6"
        >
          ← My Workshops
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Manage Applications
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              No applications for this workshop yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-xl shadow p-5"
              >
                <h2 className="text-xl font-bold text-gray-800">
                  {application.learnerName}
                </h2>

                <p className="text-gray-600">
                  {application.learnerEmail}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Applied on:{' '}
                  {new Date(application.appliedAt).toLocaleString()}
                </p>

                <p className="mt-3">
                  <strong>Status:</strong>{' '}
                  {application.status}
                </p>

                {application.status === 'PENDING' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        updateStatus(application.id, 'ACCEPTED')
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(application.id, 'REJECTED')
                      }
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}