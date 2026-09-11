import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../services/profileService';
import { getMySkills } from '../services/skillService';
import { getRatingsForUser } from '../services/ratingService';

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
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

        const [profileData, skillsData] = await Promise.all([
          getMyProfile(),
          getMySkills()
        ]);

        const ratingsData = await getRatingsForUser(profileData.userId);

        setProfile(profileData);
        setSkills(skillsData);
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

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error && !profile) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>My Profile</h1>

      {error && <p>{error}</p>}

      <div>
        <h2>{profile.name}</h2>
        <p>{profile.email}</p>
        <p>Role: {profile.role}</p>
      </div>

      {!editing ? (
        <>
          <div>
            <h3>About Me</h3>
            <p>
              {profile.bio || 'No bio added yet.'}
            </p>
          </div>

          <div>
            <h3>Skills I Want to Learn</h3>
            <p>
              {profile.skillsWanted || 'No skills added yet.'}
            </p>
          </div>

          <div>
            <h3>Skills I Offer</h3>

            {skills.length === 0 ? (
              <p>You haven't added any skills yet.</p>
            ) : (
              <ul>
                {skills.map((skill) => (
                  <li key={skill.id}>
                    {skill.title} — {skill.category}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Ratings & Reviews</h3>

            {ratings.length === 0 ? (
              <p>No ratings yet.</p>
            ) : (
              <>
                <p>
                  Average Rating:{' '}
                  {(
                    ratings.reduce(
                      (sum, item) => sum + item.rating,
                      0
                    ) / ratings.length
                  ).toFixed(1)}{' '}
                  / 5
                </p>

                <ul>
                  {ratings.map((item) => (
                    <li key={item.id}>
                      <strong>{item.reviewerName}</strong>
                      {' — '}
                      {item.rating}/5
                      <br />
                      {item.review}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <button onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <div>
            <label htmlFor="bio">About Me</label>
            <br />

            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="5"
              maxLength="1000"
            />
          </div>

          <div>
            <label htmlFor="skillsWanted">
              Skills I Want to Learn
            </label>
            <br />

            <textarea
              id="skillsWanted"
              name="skillsWanted"
              value={form.skillsWanted}
              onChange={handleChange}
              rows="4"
              maxLength="1000"
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
