import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorkshops } from '../services/workshopService';
import Navbar from '../components/Navbar';

export default function HomePage() {
  const navigate = useNavigate();

  const [workshops, setWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const data = await getAllWorkshops();
        setWorkshops(data);
      } catch {
        setWorkshops([]);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    loadWorkshops();
  }, []);

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Shared Navbar */}
      <Navbar />

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* Welcome Section */}
        <section className="bg-white rounded-xl border border-gray-200 px-6 py-10 text-center">

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Learn from people.
            <br />
            <span className="text-blue-600">
              Share what you know.
            </span>
          </h1>

          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Discover skills offered by people around you and find workshops
            where you can learn something new.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mt-7">
            <div className="flex gap-2">

              <input
                type="text"
                placeholder="What do you want to learn?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/skills');
                  }
                }}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={() => navigate('/skills')}
                className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>

            </div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7">

          <button
            onClick={() => navigate('/skills')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Explore Skills
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Find people who can teach you something you're interested in.
            </p>

            <span className="inline-block mt-4 text-sm font-medium text-blue-600">
              Browse skills →
            </span>
          </button>

          <button
            onClick={() => navigate('/workshops')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-sm transition"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Browse Workshops
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Find upcoming workshops and apply to learn from others.
            </p>

            <span className="inline-block mt-4 text-sm font-medium text-blue-600">
              View workshops →
            </span>
          </button>

        </section>

        {/* Upcoming Workshops */}
        <section className="mt-10">

          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Workshops
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Learn something new from people in the community.
              </p>
            </div>

            <button
              onClick={() => navigate('/workshops')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </button>

          </div>

          {loadingWorkshops ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
              Loading workshops...
            </div>
          ) : workshops.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

              <p className="text-gray-500">
                No upcoming workshops yet.
              </p>

              <button
                onClick={() => navigate('/workshops')}
                className="mt-3 text-sm text-blue-600 font-medium"
              >
                Browse workshops
              </button>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {workshops.slice(0, 3).map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
                >

                  <h3 className="text-lg font-semibold text-gray-900">
                    {workshop.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {workshop.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">

                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDate(workshop.dateTime)}
                    </p>

                    <p>
                      <span className="font-medium">Time:</span>{' '}
                      {formatTime(workshop.dateTime)}
                    </p>

                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {workshop.location}
                    </p>

                    <p>
                      <span className="font-medium">Seats:</span>{' '}
                      {workshop.capacity}
                    </p>

                  </div>

                  <button
                    onClick={() => navigate('/workshops')}
                    className="w-full mt-5 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    View Workshop
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Offer Skill */}
        <section className="mt-10 mb-8 bg-white border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Have a skill to share?
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Offer your skill and help someone learn.
            </p>
          </div>

          <button
            onClick={() => navigate('/add')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Offer a Skill
          </button>

        </section>

      </main>

    </div>
  );
}