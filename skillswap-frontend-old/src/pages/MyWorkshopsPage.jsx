import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyWorkshops,
  deleteWorkshop
} from '../services/workshopService';
import Navbar from '../components/Navbar';

export default function MyWorkshopsPage() {
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getMyWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your workshops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkshops();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) {
      return;
    }

    try {
      await deleteWorkshop(id);

      setWorkshops((prev) =>
        prev.filter((workshop) => workshop.id !== id)
      );
    } catch (err) {
      console.error(err);
      setError('Failed to delete workshop.');
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
            Loading your workshops...
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
            onClick={() => navigate('/workshops')}
            className="text-sm text-gray-500 hover:text-blue-600 transition"
          >
            ← Back to Workshops
          </button>

          <button
            onClick={() => navigate('/workshops/create')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Create Workshop
          </button>

        </div>

        {/* Heading */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Workshops
          </h1>

          <p className="text-gray-500 mt-1">
            Manage the workshops you are hosting.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {workshops.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">

            <h2 className="text-xl font-semibold text-gray-800">
              You haven't created any workshops yet.
            </h2>

            <p className="text-gray-500 mt-2">
              Create a workshop and share what you know with other learners.
            </p>

            <button
              onClick={() => navigate('/workshops/create')}
              className="mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create Your First Workshop
            </button>

          </div>

        ) : (

          /* Workshop Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {workshops.map((workshop) => (

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

                <div className="space-y-2 text-sm">

                  <p>
                    <span className="font-semibold text-gray-800">
                      Date:
                    </span>{' '}
                    <span className="text-gray-600">
                      {formatDate(workshop.dateTime)}
                    </span>
                  </p>

                  <p>
                    <span className="font-semibold text-gray-800">
                      Time:
                    </span>{' '}
                    <span className="text-gray-600">
                      {formatTime(workshop.dateTime)}
                    </span>
                  </p>

                  <p>
                    <span className="font-semibold text-gray-800">
                      Location:
                    </span>{' '}
                    <span className="text-gray-600">
                      {workshop.location}
                    </span>
                  </p>

                  <p>
                    <span className="font-semibold text-gray-800">
                      Capacity:
                    </span>{' '}
                    <span className="text-gray-600">
                      {workshop.capacity}
                    </span>
                  </p>

                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6">

                  <button
                    onClick={() =>
                      navigate(
                        `/workshops/${workshop.id}/applications`
                      )
                    }
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Manage Applications
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(workshop.id)
                    }
                    className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                  >
                    Delete Workshop
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}