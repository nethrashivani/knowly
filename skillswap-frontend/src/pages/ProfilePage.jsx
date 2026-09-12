import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getMyProfile, updateMyProfile } from '../services/profileService';
import { getMySkills } from '../services/skillService';
import { getRatingsForUser } from '../services/ratingService';
import { getMyWorkshops } from '../services/workshopService';
import { getMyApplications } from '../services/workshopApplicationService';

import Navbar from '../components/Navbar';

/* eslint-disable react-hooks/set-state-in-effect */

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [applications, setApplications] = useState([]);
  const [ratings, setRatings] = useState([]);

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    bio: '',
    skillsWanted: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          profileData,
          skillsData,
          workshopsData,
          applicationsData
        ] = await Promise.all([
          getMyProfile(),
          getMySkills(),
          getMyWorkshops(),
          getMyApplications()
        ]);

        const ratingsData =
          await getRatingsForUser(profileData.userId);

        setProfile(profileData);
        setSkills(skillsData);
        setWorkshops(workshopsData);
        setApplications(applicationsData);
        setRatings(ratingsData);

        setForm({
          bio: profileData.bio || '',
          skillsWanted: profileData.skillsWanted || ''
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const updatedProfile = await updateMyProfile(form);

      setProfile(updatedProfile);

      setForm({
        bio: updatedProfile.bio || '',
        skillsWanted: updatedProfile.skillsWanted || ''
      });

      setEditing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
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
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              {error}
            </p>

            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          ← Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            Your Knowly profile, skills, workshops and reputation.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-2 text-sm">

            <p>
              <span className="font-semibold text-gray-800">
                Name:
              </span>{' '}
              <span className="text-gray-600">
                {profile.name}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                Email:
              </span>{' '}
              <span className="text-gray-600">
                {profile.email}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-800">
                Role:
              </span>{' '}
              <span className="text-gray-600">
                {profile.role}
              </span>
            </p>

          </div>

        </div>

        {!editing ? (
          <>

            {/* About Me */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-900 mb-3">
                About Me
              </h2>

              <p className="text-gray-600 leading-relaxed">
                {profile.bio || 'No bio added yet.'}
              </p>

            </div>

            {/* Skills Wanted */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Skills I Want to Learn
              </h2>

              <p className="text-gray-600 leading-relaxed">
                {profile.skillsWanted ||
                  'No skills added yet.'}
              </p>

            </div>

            {/* Skills Offered */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold text-gray-900">
                  Skills I Offer
                </h2>

                <button
                  onClick={() => navigate('/skills')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Skills
                </button>

              </div>

              {skills.length === 0 ? (

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    You haven't added any skills yet.
                  </p>

                  <button
                    onClick={() => navigate('/add')}
                    className="mt-3 text-blue-600 font-medium hover:underline"
                  >
                    Add a Skill
                  </button>
                </div>

              ) : (

                <div className="space-y-3">

                  {skills.map((skill) => (

                    <button
                      key={skill.id}
                      onClick={() =>
                        navigate(`/skills/${skill.id}`)
                      }
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition"
                    >

                      <p className="font-semibold text-gray-900">
                        {skill.title}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {skill.category}
                      </p>

                    </button>

                  ))}

                </div>

              )}

            </div>

            {/* Workshops Hosted */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold text-gray-900">
                  Workshops I Host
                </h2>

                <button
                  onClick={() => navigate('/workshops')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Workshops
                </button>

              </div>

              {workshops.length === 0 ? (

                <div className="bg-gray-50 rounded-lg p-6 text-center">

                  <p className="text-gray-500">
                    You haven't created any workshops yet.
                  </p>

                  <button
                    onClick={() => navigate('/workshops/create')}
                    className="mt-3 text-blue-600 font-medium hover:underline"
                  >
                    Create a Workshop
                  </button>

                </div>

              ) : (

                <div className="space-y-3">

                  {workshops.map((workshop) => (

                    <div
                      key={workshop.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >

                      <h3 className="font-semibold text-gray-900">
                        {workshop.title}
                      </h3>

                      <div className="text-sm text-gray-500 mt-2 space-y-1">

                        <p>
                          Date: {formatDate(workshop.dateTime)}
                        </p>

                        <p>
                          Time: {formatTime(workshop.dateTime)}
                        </p>

                        <p>
                          Location: {workshop.location}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/workshops/${workshop.id}/applications`
                          )
                        }
                        className="mt-3 text-sm text-blue-600 hover:underline"
                      >
                        Manage Applications
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Workshops Applied To */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold text-gray-900">
                  Workshops I've Applied To
                </h2>

                <button
                  onClick={() => navigate('/my-applications')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Applications
                </button>

              </div>

              {applications.length === 0 ? (

                <div className="bg-gray-50 rounded-lg p-6 text-center">

                  <p className="text-gray-500">
                    You haven't applied to any workshops yet.
                  </p>

                  <button
                    onClick={() => navigate('/workshops')}
                    className="mt-3 text-blue-600 font-medium hover:underline"
                  >
                    Explore Workshops
                  </button>

                </div>

              ) : (

                <div className="space-y-3">

                  {applications.map((application) => (

                    <div
                      key={application.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >

                      <h3 className="font-semibold text-gray-900">
                        {application.workshopTitle}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        Applied on: {formatDate(application.appliedAt)}
                      </p>

                      <p className="text-sm mt-2">
                        <span className="font-semibold">
                          Status:
                        </span>{' '}
                        <span
                          className={
                            application.status === 'ACCEPTED'
                              ? 'text-green-600'
                              : application.status === 'REJECTED'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                          }
                        >
                          {application.status}
                        </span>
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Ratings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ratings & Reviews
              </h2>

              {ratings.length === 0 ? (

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    No ratings yet.
                  </p>
                </div>

              ) : (

                <>
                  <div className="bg-blue-50 rounded-lg p-4 mb-5">

                    <p className="text-sm text-blue-600 font-medium">
                      Average Rating
                    </p>

                    <p className="text-3xl font-bold text-blue-700 mt-1">
                      {(
                        ratings.reduce(
                          (sum, item) => sum + item.rating,
                          0
                        ) / ratings.length
                      ).toFixed(1)}{' '}
                      / 5
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Based on {ratings.length}{' '}
                      {ratings.length === 1
                        ? 'rating'
                        : 'ratings'}
                    </p>

                  </div>

                  <div className="space-y-4">

                    {ratings.map((item) => (

                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >

                        <div className="flex justify-between items-start gap-4">

                          <div>

                            <p className="font-semibold text-gray-900">
                              {item.reviewerName}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              {item.rating}/5
                            </p>

                          </div>

                        </div>

                        <p className="text-gray-600 mt-3">
                          {item.review}
                        </p>

                      </div>

                    ))}

                  </div>
                </>

              )}

            </div>

            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>

          </>
        ) : (

          /* Edit Profile */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Edit Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-5">

              <div>
                <label
                  htmlFor="bio"
                  className="block font-medium mb-2"
                >
                  About Me
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows="5"
                  maxLength="1000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label
                  htmlFor="skillsWanted"
                  className="block font-medium mb-2"
                >
                  Skills I Want to Learn
                </label>

                <textarea
                  id="skillsWanted"
                  name="skillsWanted"
                  value={form.skillsWanted}
                  onChange={handleChange}
                  rows="4"
                  maxLength="1000"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

      </main>

    </div>
  );
}

export default ProfilePage;